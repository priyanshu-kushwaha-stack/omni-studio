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
PICKS_TWIST = 47
CUES = HERE / "assets" / "music" / "themed"
OUT = HERE / "assets" / "music" / "score.wav"
DARK = "theme-dark"
LIGHT = "theme-light"
# Scene by scene (owner's G5 notes, 2026-11-08: the first mix was too loud, did not fit, and felt monotonous; a
# quieter scene-by-scene pass was "still too much"). Music only where it carries feeling or marks a turn; the rest is
# dry. Each row: source (a channel theme or a
# local take), seconds into it, from line, to line (exclusive). Rows that touch crossfade; a gap is silence.
SCENES = [
    (LIGHT, 4.0, 1, 6),            # day one: the bedroom, the rule (the real theme)
    (None, 0.0, 6, 22),            # the rule's fine print and the first days: dry, voice and sound effects
    ("tension-29", 0.0, 22, 28),   # day twelve: the walk, the bus, the stakes
    ("tension-11", 18.0, 28, 33),  # the pause, the run, the countdown
    (None, 0.0, 33, 34),           # the bus screams through: silence
    (DARK, 0.0, 34, 39),           # the mother, then the night: it is not free
    (None, 0.0, 39, 41),           # just this once: dry
    ("catch-11", 0.0, 41, 43),     # the stairs
    (None, 0.0, 43, 45),           # awake, the montage: dry
    (DARK, 30.0, 45, 49),          # midnight, the curtain
    (None, 0.0, 49, 52),           # the six, small disasters: dry
    ("longrun-11", 0.0, 52, 55),   # the mother on the stairs
    (None, 0.0, 55, 60),           # forty years, two days older, the strangers: dry
]
FPS = 30
XFADE = 1.2
LEVEL = -16.0  # LUFS of every piece before the film's duck


def source(name: str) -> Path:
    return THEMES / f"{name}.mp3" if name.startswith("theme-") else CUES / f"{name}.wav"


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
    pieces = [(light, 0.0, s(cue["flash"]), s(c[1]["from"] - cue["flash"]) + XFADE, 0.3, XFADE)]  # title card
    for i, (name, at, a, b) in enumerate(SCENES):
        if name is None:
            continue
        start, end = s(c[a]["from"]), s(c[b]["from"]) if b < len(c) else s(t["totalFrames"])
        if b == 60:
            end -= 1.0                                   # near-silence before "And then you notice something"
        nxt = SCENES[i + 1][0] if i + 1 < len(SCENES) else None
        prev = SCENES[i - 1][0] if i > 0 else LIGHT
        fade_in = XFADE if prev else 2.0
        fade_out = XFADE if nxt else 2.5
        pieces.append((source(name), at, start, end - start + (XFADE if nxt else 0.0), fade_in, fade_out))
    pieces += [
        (CUES / f"twist-{PICKS_TWIST}.wav", 0.0, s(cue["notice"]), s(cue["endcard"] - cue["notice"]) + 1.0, 2.0, 1.0),
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
