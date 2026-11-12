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

One cue per section (cues.yaml; this film: "What If AI Predicted Every Choice You Make?"), lengths from assets/narration/props.json with a few seconds spare. An underscore under
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
    "wonder": ("0:12-1:38, Half Price and The Rule: the first tags, the discount, the walk home", 100, 96, "C major",
               "light", "curious and wide-eyed, pizzicato strings and celesta, a soft ticking motif like a clock shop, "
               "light woodwinds, a small marvel being discovered"),
    "mischief": ("1:38-2:28, Random: the mirror, the four reds, the coin", 60, 112, "D minor", "light",
                 "playful and cheeky, plucked strings and muted marimba, a game you keep losing, comic timing"),
    "carnival": ("2:28-3:53, The City Plays: the platform, the magician, the date, the pickpocket, the train", 95, 116,
                 "G major", "light", "busy and bouncy city montage, staccato strings, glockenspiel and light "
                 "woodwinds, quick turns, ending hushed and glassy for a crowded silent train"),
    "routine": ("3:53-4:53, The Cheapest Man: the same lunch, the rat tails, the joke not told", 70, 90, "A minor",
                "dark", "mechanical and repetitive, a metronomic pulse, music box and low clarinet, the same figure "
                "over and over, faintly sad underneath"),
    "warm": ("4:53-5:42, Sixty Per Cent: the brain scan, the napkin tie, his quiet week", 58, 80, "F major", "light",
             "warm and tender with a worry inside, felt piano and cello, friendship, a small laugh, then a held "
             "question"),
    "dread": ("5:42-7:12, Red and A Man in Trouble: the crimson tag, the doors that shut, the phone call", 100, 66,
              "E minor", "dark", "quiet dread, a slow ticking pulse, low sustained strings, held breath, restrained, "
              "tightening without ever exploding"),
    "clock": ("7:12-7:57, The Dilemma: the box, the filming phone, the key in your pocket", 55, 72, "B minor", "dark",
              "a ticking clock, sparse piano ostinato over a low pedal note, suspense rising slowly, a decision"),
    "reveal": ("8:37-9:55, The Board: the board running backwards, the comet, the city of teal lights", 90, 76,
               "D major", "light", "vast and luminous, high shimmering strings and a slow piano melody, wonder and "
               "a little sorrow, a city seen from above at night"),
    "resolve": ("9:55-10:50, The Train: full rent, the key dropped in his hand, the kid's blank card", 65, 84,
                "C major", "light", "warm and bittersweet, hopeful morning light, piano and soft strings, resolving "
                "gently, a wink at the end"),
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
