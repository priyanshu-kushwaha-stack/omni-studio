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

# name -> (where in the film, seconds, bpm, key, theme, brief). Script v1.1 (exciting, not sad): one cue per section,
# lengths from props.json plus a few seconds. Who Eats? and The App play on theme-light (the channel signal); Stool Four
# and the end card return to it.
CUES = {
    "rule": ("0:31-1:10, The Rule: the whistle, the overalls crossing, the app's three lines and the dial", 45, 100,
             "C major", "light", "bright small-town morning, pizzicato strings and a glockenspiel motif, a sense of a "
             "new toy with rules, curious and quick"),
    "fired": ("1:10-1:51, Fired: the robot against Marco, three fired before the rush, the first napkin", 45, 120,
              "F major", "light", "comic caper, bouncy plucked strings and woodblock, a cheeky bassoon, slapstick "
              "timing, brisk and mischievous"),
    "plant": ("1:51-2:38, The Plant: fifty painters, then five hundred machines, three shifts, the pings", 50, 108,
              "D minor", "dark", "industrial momentum, a steady low string ostinato with a metallic tick like a "
              "machine line, growing, exciting not menacing"),
    "town": ("2:38-3:40, The Whole Town: the bank, the mayor, the rival, the plumber, every owner's napkin", 65, 116,
             "G major", "light", "a bustling montage, marimba and pizzicato, a jaunty walking bass on cello, the "
             "whole town signing up, playful and quick"),
    "rich": ("3:40-4:25, Rich: the split-flap counter, the news van, the key to the town, the convoy", 48, 104,
             "D major", "light", "triumphant and grand but light, brass-like strings swelling, a small fanfare, the "
             "peak of success, glittering"),
    "turn": ("4:25-5:57, The Missing Line: forty empty stools at the whistle, the napkin's missing line, the paper", 95,
             84, "A minor", "dark", "the twist, a felt piano question over a low pulse, suspense and realisation, "
             "curious not sad, building quietly"),
    "buy": ("5:57-6:28, Make Them Buy: the steel customer pays with your card, SALE in every window", 34, 112,
            "E minor", "light", "comic tension, staccato strings and a sly clarinet, a plan that backfires, wry"),
    "cheque": ("6:28-7:25, The Cheque: a cheque for everyone, the stools fill for a week, then the tills", 60, 96,
               "Bb major", "light", "hopeful and warm, piano and soft strings, a brief lift that keeps moving, then "
               "a wry turn"),
    "hammers": ("7:25-8:13, Hammers: the town comes for the machines, four smiling screens, the dilemma", 50, 92,
                "C minor", "dark", "a standoff, low drums replaced by taiko-like strings plucked hard, tension with "
                "a comic hesitation, building"),
    "dial": ("8:13-9:38, The Dial: the overshoot, the napkin's line, the town writes the number, the whistle", 88, 100,
             "D major", "light", "the climax, a rising ostinato that builds to a full warm triumphant swell, "
             "clever and joyful, the town winning together"),
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
