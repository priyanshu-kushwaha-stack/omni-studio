"""Assemble the film's score into assets/music/score.wav, placed on the narration timeline.

    python3 build_score.py            (from this video folder)

Sources, all git-ignored media:
- the channel themes in channels/say-suppose/brand/music: theme-light is the one-time ElevenLabs theme, the owner's
  pick, 2026-11-07;
- the five local cues in assets/music/themed (make_music.py).

Picks: the owner approved the themed takes ("looks fine to me"); the steadiest take of each cue (lowest loudness range)
was chosen, since it sits best under a voice.

Layout (style.md: a theme for you, a cold cue for the catch, silence before the twist):
- the hook is left to its sound effects;
- the theme's opening motif plays under the title card;
- the five cues follow the beats, with crossfades;
- a near-silence before "And then you notice something";
- the twist cue plays under the stranger's walk;
- the theme's resolved ending lands under the end card.

Each piece is levelled to the same loudness. Film.tsx ducks the whole score under the voice, frame by frame.
"""
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
THEMES = HERE.parents[1] / "brand" / "music"
CUES = HERE / "assets" / "music" / "themed"
OUT = HERE / "assets" / "music" / "score.wav"
PICKS = {"you": 47, "tension": 11, "catch": 11, "longrun": 11, "twist": 47}
FPS = 30
XFADE = 1.5
LEVEL = -16.0  # LUFS of every piece before the film's duck


def seconds(path: Path) -> float:
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                                capture_output=True, text=True, check=True).stdout)


def main() -> None:
    t = json.loads((HERE / "assets" / "narration" / "props.json").read_text())["timeline"]
    c, cue = t["clips"], t["cues"]
    s = lambda f: f / FPS
    light = THEMES / "theme-light.mp3"
    end_len = s(t["totalFrames"] - cue["endcard"])
    # (source, start in source, start in film, length, fade in, fade out)
    pieces = [
        (light, 0.0, s(cue["flash"]), s(c[1]["from"] - cue["flash"]) + XFADE, 0.3, XFADE),
        (CUES / f"you-{PICKS['you']}.wav", 0.0, s(c[1]["from"]), s(c[22]["from"] - c[1]["from"]) + XFADE, XFADE, XFADE),
        (CUES / f"tension-{PICKS['tension']}.wav", 0.0, s(c[22]["from"]), s(c[35]["from"] - c[22]["from"]) + XFADE, XFADE, XFADE),
        (CUES / f"catch-{PICKS['catch']}.wav", 0.0, s(c[35]["from"]), s(c[49]["from"] - c[35]["from"]) + XFADE, XFADE, XFADE),
        # Ends a second before line 60, so the line lands in near-silence.
        (CUES / f"longrun-{PICKS['longrun']}.wav", 0.0, s(c[49]["from"]), s(c[60]["from"] - c[49]["from"]) - 1.0, XFADE, 2.5),
        (CUES / f"twist-{PICKS['twist']}.wav", 0.0, s(cue["notice"]), s(cue["endcard"] - cue["notice"]) + 1.0, 2.0, 1.0),
        (light, seconds(light) - end_len, s(cue["endcard"]), end_len, 1.0, 0.05),
    ]
    inputs, chains = [], []
    for i, (src, at, start, length, fin, fout) in enumerate(pieces):
        inputs += ["-i", str(src)]
        chains.append(
            f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={at:.3f}:{at + length:.3f},asetpts=PTS-STARTPTS,"
            f"loudnorm=I={LEVEL}:TP=-2:LRA=11,aresample=48000,"
            f"afade=t=in:d={fin},afade=t=out:st={max(0.0, length - fout):.3f}:d={fout},adelay={round(start * 1000)}:all=1[p{i}]")
    total = s(t["totalFrames"])
    graph = ";".join(chains) + ";" + "".join(f"[p{i}]" for i in range(len(pieces))) + \
        f"amix=inputs={len(pieces)}:normalize=0:dropout_transition=0,apad=whole_dur={total:.3f}[out]"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[out]", "-ar", "48000",
                    "-t", f"{total:.3f}", str(OUT)], check=True)
    print(OUT, f"{total:.1f}s")


if __name__ == "__main__":
    main()
