"""The film's score, made locally with ACE-Step 1.5 (MIT, outputs usable commercially), so the music changes with the
story instead of one theme looping under the whole film (owner, 2026-11-13, on v3: "better sound in the video
just to break the continuous background music flowing throughout the video which might be monotonous").
Free: no paid call. The installed copy is the pinned commit ca1e85f (the `ace_step` entry in core/lock.yaml on the
power-and-citizen branch, 660ae38; it reaches main when that merges). Each cue takes one channel theme as its style
reference at low strength (owner, 2026-11-09, music-rights.md U2: "Yes, keep it").

    cd <omni-studio root>
    .tools/ace-step-1.5/.venv/bin/python channels/say-suppose/videos/<this video>/make_music.py           # every cue
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py wonder hunt                                      # some
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py crowd:29 crowd:47                                # other seeds

A cue with a seed is written as <name>-<seed>.wav, to compare by ear; the one the film uses is <name>.wav.

One cue per section (cues.yaml), lengths from assets/narration/props.json with a few seconds spare. An underscore under
voices, never a song: no vocals, no drum kit, no big drops, room left for speech. Output: WAV into
assets/music/cues/ (git-ignored), peak -1 dBFS; the level is set in Film.tsx, under the voice.
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def _tools_dir() -> Path:
    """.tools in this checkout, or in the main checkout when this is a git worktree."""
    if (ROOT / ".tools").is_dir():
        return ROOT / ".tools"
    common = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--git-common-dir"], capture_output=True,
                            text=True, check=True).stdout.strip()
    return (ROOT / common).resolve().parent / ".tools"


ACE = _tools_dir() / "ace-step-1.5"
OUT = HERE / "assets" / "music" / "cues"
THEMES = HERE.parents[1] / "brand" / "music"
REFERENCE_STRENGTH = 0.2

STYLE = ("cinematic underscore for an animated paper-cut story with spoken dialogue, small chamber ensemble, "
         "instrumental, no vocals, no drum kit, sparse, leaves room for voices")

# name -> (beats it covers (by first story line), bpm, key, theme, brief). Lengths come from the narration timeline
# (assets/narration/props.json): from the section's first line to the next section's, plus SPARE seconds.
SPARE = 6
CUES = {
    "wonder": ((3, 12), 96, "C major", "light", "curious and wide-eyed, pizzicato strings and celesta, a soft clock-like "
               "ticking motif, light woodwinds, a secret being discovered"),
    "piano": ((12, 23), 84, "F major", "light", "warm and tender, felt piano carrying a simple tune, soft strings under "
              "it, a small kitchen in the morning, quietly proud"),
    "montage": ((23, 35), 116, "D major", "light", "playful and quick, plucked strings and marimba, a bouncing clock "
                "rhythm, each bar a new trick, slightly too fast to keep up"),
    "city": ((35, 50), 108, "A minor", "light", "gleeful then uneasy, busy pizzicato and muted brass stabs, a city "
             "speeding up, thinning out at the end to a hushed train rhythm"),
    "cold": ((50, 57), 66, "E minor", "dark", "quiet and cold, sparse felt piano and a soft rain-like string tremolo, "
             "an apology that lands wrong"),
    "vertigo": ((57, 65), 92, "B minor", "light", "vast and dizzy, high shimmering strings and music box, rising and "
                "rising, a town of thousands, wonder turning to vertigo"),
    "guilt": ((65, 70), 60, "G minor", "dark", "small and guilty, a single cello line and a few piano notes, long "
              "silences inside the music, a candle burnt down"),
    "deep": ((70, 76), 70, "D minor", "dark", "cold awe, low strings and a slow ticking pulse, deep time, a timeline "
             "running back into the dark"),
    "tender": ((76, 83), 72, "A major", "dark", "tender and torn, felt piano and cello, a hand held out, bittersweet, "
               "restrained"),
    "resolve": ((92, None), 84, "C major", "light", "warm and bittersweet, morning light, piano and soft strings, "
                "resolving gently, a story finally told"),
}
SEEDS = (11,)


def _seconds(first: int, nxt: int | None) -> int:
    """The section's length on the narration timeline, plus SPARE."""
    import json

    props = json.loads((HERE / "assets" / "narration" / "props.json").read_text())
    clips, total = props["timeline"]["clips"], props["timeline"]["totalFrames"]
    start = clips[first]["from"]
    end = clips[nxt]["from"] if nxt is not None else total
    return int(round((end - start) / 30)) + SPARE


def main(names: list[str]) -> None:
    sys.path.insert(0, str(ACE))
    from acestep.handler import AceStepHandler
    from acestep.inference import GenerationConfig, GenerationParams, generate_music
    from acestep.llm_inference import LLMHandler

    OUT.mkdir(parents=True, exist_ok=True)
    dit = AceStepHandler()
    dit.initialize_service(project_root=str(ACE), config_path="acestep-v15-turbo", device="auto")
    llm = LLMHandler()
    llm.initialize(checkpoint_dir=str(ACE / "checkpoints"), lm_model_path="acestep-5Hz-lm-1.7B", backend="mlx",
                   device="auto")
    for spec in names:
        name, _, seed_text = spec.partition(":")
        (first, nxt), bpm, key, theme_name, brief = CUES[name]
        where = f"lines {first}-{nxt}"
        seconds = _seconds(first, nxt)
        theme = THEMES / f"theme-{theme_name}.mp3"
        if not theme.is_file():
            raise SystemExit(f"missing channel theme {theme}")
        for seed in [int(seed_text)] if seed_text else SEEDS:
            params = GenerationParams(
                caption=f"{STYLE}; {brief}", lyrics="[Instrumental]", instrumental=True, duration=seconds,
                bpm=bpm, keyscale=key, timesignature="4", inference_steps=8, shift=3.0, seed=seed, thinking=False,
                reference_audio=str(theme), audio_cover_strength=REFERENCE_STRENGTH,
                enable_normalization=True, normalization_db=-1.0)
            config = GenerationConfig(batch_size=1, use_random_seed=False, audio_format="wav")
            result = generate_music(dit, llm, params, config, save_dir=str(OUT / f"{name}-{seed}"))
            if not result.success:
                raise SystemExit(f"{name} seed {seed}: {result.error}")
            src = Path(result.audios[0]["path"])
            dst = OUT / (f"{name}-{seed}.wav" if seed_text else f"{name}.wav")
            src.replace(dst)
            print(f"{dst}  ({where})", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] or list(CUES))
