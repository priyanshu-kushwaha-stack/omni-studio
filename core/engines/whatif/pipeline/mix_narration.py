"""Stitch a video's narration takes into one track, placed where the timeline puts them.

    python mix_narration.py <video folder> [--mute TAKE@OFFSET:SECONDS,...]

Reads <video>/assets/narration/props.json (written by build.ts) and its tightened takes. Writes
<video>/narration/narration.wav (48 kHz mono; a copy goes to assets/narration/ for the film to play) and
<video>/narration/words.json (every word with its time in the whole track), which `omni qc <slug> <video> narration`
reads by default. The narration/ folder is git-ignored.

Clicks (core/studio/rules/no-audio-clicks.md): every take is faded 10 ms in and cut TAIL seconds after its voice
stops, with a FADE_OUT fade, which removes end-of-take pops. The voice's end is read from the take (silencedetect), not
from Whisper: Whisper ends a soft sentence-final syllable early ("plasma." ended at 2.46 s while its "a" ran to 2.76 s,
2026-11-18), and cutting there chopped the word. Whisper's last word end is the floor and the fallback.

A burst between words inside a take (a breath click) is muted with --mute as take number @ seconds into that take :
length, so a mute stays on its click when timing moves the take; without --mute, the list in <video>/mutes.txt is used.
Mutes are measured on the takes at normal speed; a line spoken at a tempo (props "tempo", or the line's own) has its
mutes scaled to match.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

FPS = 30
TAIL = 0.15
FADE_OUT = 0.06
# Margin around a mute: take starts snap to whole frames (1/30 s), so a click can move by up to 33 ms.
MUTE_PAD = 0.04


def seconds(path: Path) -> float:
    return float(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True,
            text=True,
            check=True,
        ).stdout
    )


def voice_end(path: Path, duration: float) -> float:
    """Seconds to where the take's sound stops: the start of the silence that runs to its end (ffmpeg 8 closes that
    silence at the end of the file; older ffmpeg leaves it open). duration when sound runs to the end, 0 when ffmpeg
    cannot read the take."""
    run = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-af",
            "silencedetect=n=-40dB:d=0.12",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
    )
    if run.returncode:
        return 0.0
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", run.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", run.stderr)]
    if starts and (len(starts) > len(ends) or ends[-1] >= duration - 0.01):
        return starts[-1]
    return duration


def cut_at(path: Path, last_word_end: float, duration: float) -> float:
    """Where to cut a take: TAIL after its voice stops, never before Whisper's last word ends, capped at the take."""
    return min(duration, max(last_word_end, voice_end(path, duration)) + TAIL)


def at_tempo(mute: list[tuple[int, float, float]], lines: list[dict], tempo: float) -> list[tuple[int, float, float]]:
    """Mutes are measured on the takes at normal speed; a take sped up by its tempo moves and shortens them."""
    out = []
    for i, offset, length in mute:
        t = lines[i].get("tempo", tempo)
        out.append((i, offset / t, length / t))
    return out


def mix(video: Path, mute: list[tuple[int, float, float]] = ()) -> tuple[Path, Path]:
    video = Path(video)
    takes = video / "assets" / "narration"
    props = json.loads((takes / "props.json").read_text(encoding="utf-8"))
    timeline = props["timeline"]
    mute = at_tempo(list(mute), props["lines"], props.get("tempo", 1))
    out = video / "narration"
    out.mkdir(exist_ok=True)

    inputs, chains, words = [], [], []
    for i, clip in enumerate(timeline["clips"]):
        path = takes.parent / clip["file"]
        start = clip["from"] / FPS
        dur = seconds(path)
        take_words = json.loads(Path(f"{path}.words.json").read_text(encoding="utf-8"))
        end = cut_at(path, take_words[-1]["end"] if take_words else dur, dur)
        inputs += ["-i", str(path)]
        ms = round(start * 1000)
        chains.append(
            f"[{i}]aresample=48000,atrim=0:{end:.3f},afade=t=in:d=0.01,"
            f"afade=t=out:st={max(0.0, end - FADE_OUT):.3f}:d={FADE_OUT},adelay={ms}:all=1[a{i}]"
        )
        for w in take_words:
            words.append({"word": w["word"], "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)})

    total = timeline["totalFrames"] / FPS
    graph = (
        ";".join(chains)
        + ";"
        + "".join(f"[a{i}]" for i in range(len(chains)))
        + f"amix=inputs={len(chains)}:normalize=0:dropout_transition=0,apad=whole_dur={total:.3f}"
        + "".join(
            f",volume=0:enable='between(t,{timeline['clips'][i]['from'] / FPS + o - MUTE_PAD:.3f},"
            f"{timeline['clips'][i]['from'] / FPS + o + d + MUTE_PAD:.3f})'"
            for i, o, d in mute
        )
        + "[out]"
    )
    wav = out / "narration.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            *inputs,
            "-filter_complex",
            graph,
            "-map",
            "[out]",
            "-ac",
            "1",
            "-ar",
            "48000",
            "-t",
            f"{total:.3f}",
            str(wav),
        ],
        check=True,
    )
    # The film plays this cleaned track, not the raw takes, so its trims, fades and mutes reach the render
    # (G5, 2026-11-08: raw end-of-take pops reappeared in the edit's click check).
    shutil.copyfile(wav, takes / "narration.wav")
    words_path = out / "words.json"
    words_path.write_text(json.dumps(words, indent=1), encoding="utf-8")
    return wav, words_path


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    saved = folder / "mutes.txt"  # tracked in the video folder, so a re-stitch reproduces the approved track
    spec = (
        sys.argv[sys.argv.index("--mute") + 1]
        if "--mute" in sys.argv
        else (saved.read_text().strip() if saved.is_file() else "")
    )
    mutes = (
        [
            (int(item.split("@")[0]), float(item.split("@")[1].split(":")[0]), float(item.split(":")[1]))
            for item in spec.split(",")
        ]
        if spec
        else []
    )
    wav, words = mix(Path(sys.argv[1]), mutes)
    print(f"{wav}\n{words}")
