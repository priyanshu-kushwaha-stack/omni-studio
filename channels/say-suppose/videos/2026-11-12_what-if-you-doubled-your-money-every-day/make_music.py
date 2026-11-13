"""The film's score, made locally with ACE-Step 1.5 (MIT, outputs usable commercially), so the music changes with the
story instead of one theme looping under all nine minutes (owner, 2026-11-13, on the v2 cut: "Monotonous music").
Free: no paid call. Each cue takes one channel theme as its style reference at low strength (owner, 2026-11-09,
music-rights.md U2: "Yes, keep it"). The same setup as the wants-you-to-fail film's make_music.py.

    cd <omni-studio root>
    .tools/ace-step-1.5/.venv/bin/python channels/say-suppose/videos/<this video>/make_music.py           # every cue
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py giddy spree                                    # some
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py giddy:29                                       # another seed

One cue per section (scenes/sound.ts places them by the same line anchors); each cue's length is its section's length
in assets/narration/props.json plus a few seconds. An underscore under voices, never a song: no vocals, no drum kit,
no big drops. Output: WAV into assets/music/cues/ (git-ignored), peak -1 dBFS; the level is set in Film.tsx.
"""

import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
FPS = 30
SPARE = 4


def _tools_dir() -> Path:
    """.tools in this checkout, or in the main checkout when this is a git worktree."""
    if (ROOT / ".tools").is_dir():
        return ROOT / ".tools"
    common = subprocess.run(
        ["git", "-C", str(ROOT), "rev-parse", "--git-common-dir"], capture_output=True, text=True, check=True
    ).stdout.strip()
    return (ROOT / common).resolve().parent / ".tools"


ACE = _tools_dir() / "ace-step-1.5"
OUT = HERE / "assets" / "music" / "cues"
THEMES = HERE.parents[1] / "brand" / "music"
REFERENCE_STRENGTH = 0.2

STYLE = (
    "cinematic underscore for an animated paper-cut story with spoken dialogue, small chamber ensemble, "
    "instrumental, no vocals, no drum kit, sparse, leaves room for voices"
)

# name -> (from line, to line (None: the film's end), bpm, key, theme, brief). Lines by their opening words.
CUES = {
    "wonder": ("Two cents. Last night", "Day eleven.", 92, "C major", "light",
               "curious and wide-eyed, pizzicato strings and celesta, a soft ticking clock motif, a secret rule "
               "being explained, a cold low cello note for the king's wheat"),
    "giddy": ("Day eleven.", "But here's the problem", 116, "F major", "light",
              "giddy and celebratory, a small street brass band played softly, tuba and clarinet, bouncy, a party "
              "getting out of hand, cheeky, then a happy tram rattle"),
    "uneasy": ("But here's the problem", "Day twenty-eight.", 84, "D minor", "dark",
               "uneasy and suspicious, plucked low strings and a muted clock tick, a polite bank office, something "
               "being signed that should not be"),
    "awe": ("Day twenty-eight.", "So you spend.", 76, "A major", "light",
            "rising awe, shimmering high strings and a music box, a fortune pouring out, wonder with a hint of "
            "vertigo"),
    "spree": ("So you spend.", "Karl: Same flour.", 124, "G major", "light",
              "brisk comic spending spree, marimba and pizzicato, a football crowd's joy, a balloon floating off, "
              "mischievous and quick"),
    "cost": ("Karl: Same flour.", "So you try the obvious", 66, "E minor", "dark",
             "sad and close, solo felt piano and cello, an old baker counting her savings, heavy-hearted but gentle"),
    "dread": ("So you try the obvious", "Herr Brandt: So it was", 72, "B minor", "dark",
              "growing dread, a slow pulse, low sustained strings swelling, wheat rising over a city, vast and cold"),
    "countdown": ("Herr Brandt: So it was", "Day fifty-six.", 96, "C minor", "dark",
                  "a ticking countdown at night, tense pizzicato and a held high string, minutes to midnight, then "
                  "a tender, quiet resolve"),
    "resolve": ("Day fifty-six.", None, 84, "C major", "light",
                "warm and bittersweet morning, piano and soft strings, a bakery opening, hopeful, resolving gently"),
}
SEEDS = (11,)


def seconds(name: str) -> int:
    props = json.loads((HERE / "assets" / "narration" / "props.json").read_text(encoding="utf-8"))
    clips, lines = props["timeline"]["clips"], props["lines"]

    def start(words: str) -> float:
        hits = [i for i, line in enumerate(lines) if line["text"].startswith(words)]
        if len(hits) != 1:
            raise SystemExit(f"{name}: {len(hits)} lines start with {words!r}")
        return clips[hits[0]]["from"] / FPS

    a, b = CUES[name][0], CUES[name][1]
    end = start(b) if b else props["timeline"]["totalFrames"] / FPS
    return round(end - start(a)) + SPARE


def main(names: list[str]) -> None:
    sys.path.insert(0, str(ACE))
    from acestep.handler import AceStepHandler
    from acestep.inference import GenerationConfig, GenerationParams, generate_music
    from acestep.llm_inference import LLMHandler

    OUT.mkdir(parents=True, exist_ok=True)
    dit = AceStepHandler()
    dit.initialize_service(project_root=str(ACE), config_path="acestep-v15-turbo", device="auto")
    llm = LLMHandler()
    llm.initialize(
        checkpoint_dir=str(ACE / "checkpoints"), lm_model_path="acestep-5Hz-lm-1.7B", backend="mlx", device="auto"
    )
    for spec in names:
        name, _, seed_text = spec.partition(":")
        _, _, bpm, key, theme_name, brief = CUES[name]
        theme = THEMES / f"theme-{theme_name}.mp3"
        if not theme.is_file():
            raise SystemExit(f"missing channel theme {theme}")
        for seed in [int(seed_text)] if seed_text else SEEDS:
            params = GenerationParams(
                caption=f"{STYLE}; {brief}", lyrics="[Instrumental]", instrumental=True, duration=seconds(name),
                bpm=bpm, keyscale=key, timesignature="4", inference_steps=8, shift=3.0, seed=seed, thinking=False,
                reference_audio=str(theme), audio_cover_strength=REFERENCE_STRENGTH,
                enable_normalization=True, normalization_db=-1.0,
            )
            config = GenerationConfig(batch_size=1, use_random_seed=False, audio_format="wav")
            result = generate_music(dit, llm, params, config, save_dir=str(OUT / f"{name}-{seed}"))
            if not result.success:
                raise SystemExit(f"{name} seed {seed}: {result.error}")
            src = Path(result.audios[0]["path"])
            dst = OUT / (f"{name}-{seed}.wav" if seed_text else f"{name}.wav")
            src.replace(dst)
            print(f"{dst}  ({seconds(name)} s)", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] or list(CUES))
