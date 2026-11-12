"""The film's score, made locally with ACE-Step 1.5 (MIT, outputs usable commercially), so the music changes with the
story instead of one theme looping under all eleven minutes (owner, 2026-11-13, on v3: "better sound in the video
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

# name -> (where in the film, seconds, bpm, key, theme, brief)
CUES = {
    "wonder": ("0:41-1:34, The Rule: the dots, the map, the grey sentence", 60, 96, "C major", "light",
               "curious and wide-eyed, pizzicato strings and celesta, a soft ticking motif, light woodwinds, a small "
               "secret being discovered on a phone screen"),
    "hunt": ("1:34-2:49, The Detective: the landlord, the boss, the aunts' machines, the dating app", 80, 112,
             "D minor", "light", "mischievous detective pulse, plucked strings and muted marimba, brisk and nosy, "
             "a comic wink in every bar, playful tension"),
    "test": ("2:49-4:01, The Test and Your Own Dots: the goat, ok, the sent folder", 70, 84, "A minor", "light",
             "uneasy and intimate, felt piano with a soft pulse of muted strings, a question that won't settle, "
             "turning colder near the end"),
    "cold": ("4:01-4:35, The Cold Week: short replies, blocking, not calling", 40, 92, "E minor", "dark",
             "cold and clipped, staccato low strings, a sparse metallic tick, emotionally shut down"),
    "home": ("4:35-5:11, The Shoebox: your mother's cards, three words in pen", 40, 72, "F major", "light",
             "small and warm, solo felt piano, close and tender with a faint ache, a lamp-lit kitchen at night"),
    "night": ("5:11-6:28, The Bench and The Cost: the night bus, the break room, her drafts", 80, 66, "G minor",
              "dark", "night city, soft pulsing synth pad under a lonely piano line, tired and tender, then aching"),
    "crowd": ("6:28-7:35, Fields of Red: reviews, comments, bots, the offer", 70, 104, "B minor", "dark",
              "vast and uneasy, high strings shimmering over a low ostinato, a crowd of machines, rising tension"),
    "resolve": ("8:12-9:50, The Cafe and Three Words: two machines booked a cafe; you leave the typo", 90, 84,
                "C major", "light", "warm and bittersweet, hopeful morning light, piano and soft strings, a small "
                "laugh in the melody, resolving gently"),
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
