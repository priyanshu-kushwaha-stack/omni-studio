"""Lay a dub language's takes on the English narration timeline, as one track the length of the video.

    python dub_narration.py <video folder> <dub takes dir> <lang> [--keep 30,31,32]

<dub takes dir> holds the dub's props.json (written by build.ts from the dub script, one take per English line except
the --keep lines). Lines in --keep reuse the English take (the countdown). Writes <video>/dub/<lang>/narration.wav
(48 kHz mono, the video's length), words.json, placed.json (each line's start and end, for subtitles), and fit.txt,
a line-by-line report. Media under dub/<lang>/ is git-ignored.

Fitting, line by line: a take starts at its English line's start. It may start up to EARLY s sooner when the line
before has finished, so a long line borrows from the gap before it, and it starts later when the line before still
runs. If it would still run more than LATE_OK s into the next line's start, it is sped up, at most MAX_SPEEDUP. Every
take gets the English track's edges and cut (mix_narration.py: TAIL, FADE_OUT, cut_at): 10 ms fade in, cut TAIL s
after the voice stops, FADE_OUT out. The voice's end is read from the audio (silencedetect); words.json is only the
floor: Whisper's Hindi word times stop early on most takes (46 of 62 Arthur takes, 2026-11-08), and cutting there
chops real words. It imports mix_narration from its own folder.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from mix_narration import FADE_OUT, FPS, cut_at, seconds

EARLY = 0.6
GAP = 0.15
LATE_OK = 0.3
MAX_SPEEDUP = 1.15


def plan(en_starts: list[float], durations: list[float], total: float) -> list[tuple[float, float]]:
    """(start, speed-up) per line. en_starts and durations are per English line, in seconds."""
    out, prev_end = [], -GAP  # the first line may start at 0
    for i, (s, d) in enumerate(zip(en_starts, durations)):
        nxt = en_starts[i + 1] if i + 1 < len(en_starts) else total
        start = max(s, prev_end + GAP)
        if start + d > nxt + LATE_OK:
            start = max(s - EARLY, prev_end + GAP)
        speed = 1.0
        if start + d > nxt + LATE_OK:
            speed = min(MAX_SPEEDUP, d / max(0.1, nxt + LATE_OK - start))
        out.append((round(start, 3), round(speed, 3)))
        prev_end = start + d / speed
    return out


def take(f: Path) -> tuple[float, list[dict]]:
    """A take's length once cut where the voice stops (mix_narration.cut_at), and its Whisper words."""
    words = json.loads(Path(f"{f}.words.json").read_text(encoding="utf-8"))
    dur = seconds(f)
    return cut_at(f, words[-1]["end"] if words else dur, dur), words


def main(video: Path, dub: Path, lang: str, keep: set[int]) -> Path:
    en_props = json.loads((video / "assets" / "narration" / "props.json").read_text(encoding="utf-8"))
    timeline = en_props["timeline"]
    en_clips, total = timeline["clips"], timeline["totalFrames"] / FPS
    dub_clips = iter(json.loads((dub / "props.json").read_text(encoding="utf-8"))["timeline"]["clips"])
    files = []
    for i, clip in enumerate(en_clips):
        if i in keep:
            files.append(video / "assets" / clip["file"])
        else:
            files.append(dub / Path(next(dub_clips)["file"]).name)
    takes = [take(f) for f in files]
    placed = plan([c["from"] / FPS for c in en_clips], [d for d, _ in takes], total)

    out = video / "dub" / lang
    out.mkdir(parents=True, exist_ok=True)
    inputs, chains, words_out, report, placed_out = [], [], [], [], []
    for i, (f, (d, words), (start, speed)) in enumerate(zip(files, takes, placed)):
        inputs += ["-i", str(f)]
        tempo = f",atempo={speed}" if speed > 1 else ""
        length = d / speed
        chains.append(
            f"[{i}]aresample=48000,atrim=0:{d:.3f}{tempo},afade=t=in:d=0.01,"
            f"afade=t=out:st={max(0.0, length - FADE_OUT):.3f}:d={FADE_OUT},adelay={round(start * 1000)}:all=1[a{i}]"
        )
        words_out += [
            {
                "word": w["word"],
                "start": round(start + w["start"] / speed, 3),
                "end": round(start + w["end"] / speed, 3),
            }
            for w in words
        ]
        placed_out.append({"line": i, "start": round(start, 3), "end": round(start + length, 3)})
        en_start = en_clips[i]["from"] / FPS
        report.append(
            f"{i:2d}  starts {start - en_start:+.2f} s from the English  {length:4.1f} s"
            f"{f'  sped up {speed:.2f}x' if speed > 1 else ''}{'  (English take)' if i in keep else ''}"
        )
    graph = (
        ";".join(chains)
        + ";"
        + "".join(f"[a{i}]" for i in range(len(chains)))
        + f"amix=inputs={len(chains)}:normalize=0:dropout_transition=0,apad=whole_dur={total:.3f}[out]"
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
    (out / "words.json").write_text(json.dumps(words_out, indent=1), encoding="utf-8")
    (out / "placed.json").write_text(json.dumps(placed_out, indent=1), encoding="utf-8")
    (out / "fit.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
    return wav


if __name__ == "__main__":
    args = sys.argv[1:]
    keep = {int(x) for x in args[args.index("--keep") + 1].split(",")} if "--keep" in args else set()
    print(main(Path(args[0]), Path(args[1]), args[2], keep))
