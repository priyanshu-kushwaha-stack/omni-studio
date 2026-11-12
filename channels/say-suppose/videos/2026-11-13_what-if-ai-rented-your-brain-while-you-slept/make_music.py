"""The film's score, made locally with ACE-Step 1.5 (MIT, outputs usable commercially), so the music changes with the
story instead of one theme looping under all eleven minutes (owner, 2026-11-13, on v3: "better sound in the video
just to break the continuous background music flowing throughout the video which might be monotonous").
Free: no paid call. The installed copy is the pinned commit ca1e85f (the `ace_step` entry in core/lock.yaml on the
power-and-citizen branch, 660ae38; it reaches main when that merges). Each cue takes one channel theme as its style
reference at low strength (owner, 2026-11-09, music-rights.md U2: "Yes, keep it").

    cd <omni-studio root>
    .tools/ace-step-1.5/.venv/bin/python channels/say-suppose/videos/<this video>/make_music.py           # every cue
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py hush crumbs                                      # some
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py boom:29 boom:47                                # other seeds

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

# name -> (where in the film, seconds, bpm, key, theme, brief)
CUES = {
    "hush": ("0:13-0:49, Night One: the first rented night, the ghost sits up, coins into the jar", 40, 76, "D major",
             "light", "hushed night wonder, music box and soft celesta over a warm low pad, a secret magic, small and "
             "glowing"),
    "leaflet": ("0:49-1:44, The Rule: the kitchen, the leaflet drawing itself, the brother's 'still a scam'", 58, 104,
                "G major", "light", "bright and curious morning, pizzicato strings and light woodwinds, a tidy ticking "
                "motif, playful explanation"),
    "crumbs": ("1:44-3:34, Crumbs: the shoe, the tune through the wall, the fitted sheet, the bridge word, breakfast "
               "lottery", 114, 116, "C major", "light", "comic and mischievous, plucked strings, muted marimba and "
               "whistle-like flute, quirky little surprises, light and bouncy"),
    "boom": ("3:34-4:55, More Hours: the bus nap, the nap room with a till, the street in bed by seven, the keys, the "
             "door", 84, 120, "A minor", "light", "a greedy gold rush turning uneasy, busy plucked ostinato that "
             "speeds up, coins-like glockenspiel, then thinning out and losing its footing"),
    "unease": ("4:55-6:10, The Night Shift: the facts land, the filing cabinet, the stamps", 78, 72, "E minor",
               "dark", "uneasy and thoughtful, low clarinet and soft pulsing strings, a clock-like tick, a quiet "
               "realisation"),
    "photo": ("6:10-6:54, The Photo: the graduation, the photo you can't remember", 47, 80, "F major", "dark",
              "tender then hollow, solo felt piano with a soft cello, warm memory draining to loss"),
    "market": ("6:54-8:08, The Warehouses: the price falls, the bridge, the cots, the clerk", 77, 92, "D minor",
               "dark", "cold and mechanical, repetitive low strings and muted piano ostinato, a falling figure, "
               "industrial hum, restrained"),
    "dread": ("8:08-8:56, The Contract: the table, the pen, the brother's hand, midnight offer", 51, 66, "B minor",
              "dark", "quiet dread, slow ticking pulse, low sustained strings, held breath, tightening"),
    "awe": ("8:56-10:04, One Mind: the matching crumbs, the globe, the machine", 71, 70, "E major", "light",
            "vast awe slowly building, high shimmering strings, soft choir-like pad without words, a single neuron "
            "pulse, enormous and quiet"),
    "release": ("10:04-10:28, Midnight: the drawer, the knock, nobody typing", 27, 64, "A major", "dark",
                "very still, sparse piano, release after tension, a breath let out"),
    "dawn": ("10:28-11:09, Morning: you remember your street, the empty hand, the tags, the sequel hook", 44, 84,
             "C major", "light", "warm hopeful morning, piano and soft strings, gently resolving, light"),
}
SEEDS = (11,)


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
        where, seconds, bpm, key, theme_name, brief = CUES[name]
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
