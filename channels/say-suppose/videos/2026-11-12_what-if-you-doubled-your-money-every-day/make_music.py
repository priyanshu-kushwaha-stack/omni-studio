"""The film's score, made locally with ACE-Step 1.5 (MIT, outputs usable commercially), so the music changes with the
story instead of one theme looping under all nine minutes (owner, 2026-11-13, on the v2 cut: "Monotonous music").
Free: no paid call. Each cue takes one channel theme as its style reference at low strength (owner, 2026-11-09,
music-rights.md U2: "Yes, keep it"). The same setup as the wants-you-to-fail film's make_music.py.

    cd <omni-studio root>
    .tools/ace-step-1.5/.venv/bin/python channels/say-suppose/videos/<this video>/make_music.py           # every cue
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py giddy spree                                    # some
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py giddy:29                                       # another seed

One cue per section (scenes/sound.ts places them by the same line anchors; "lotte" is made first, as the reference); each cue's length is its section's length
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

# name -> (from line, to line (None: the film's end), bpm, key, reference, brief). Lines by their opening words. The
# reference is a channel theme ("light", "dark") at REFERENCE_STRENGTH, or "lotte", Lotte's own theme, at LOTTE_STRENGTH.
#
# v4 (owner, 2026-11-13: "This is a little EMOTIONAL angle story ... Maybe with music we can make it better"): Lotte
# gets a theme of her own, a short waltz on felt piano with a cello answering (LOTTE, made first, played nowhere on its
# own), and every cue where the film's heart is (her savings book, Jonas's "Not me", the glass door, the morning after)
# is made with it as the reference, so the same tune comes back each time, sadder, then tender, then whole.
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
    "price": ("Karl: Same flour.", "Same rolls. Four twenty", 88, "E minor", "dark",
              "tense and close, a low plucked ostinato that keeps climbing one step at a time, muted strings, a "
              "price going up and up, worry growing under a plain conversation"),
    "ache": ("Same rolls. Four twenty", "So you try the obvious", 66, "D minor", "lotte",
             "heartbroken and quiet, the same waltz tune slow and in a minor key on solo felt piano, a cello "
             "under it, an old baker alone with her savings book after closing, a lamp, very sparse, lots of air"),
    "giving": ("So you try the obvious", "Jonas: Six thirty?", 96, "G major", "light",
               "hopeful and generous at first, warm strings and soft glockenspiel, envelopes handed door to door, "
               "then a doubt creeping in, the tune stalls and turns uncertain"),
    "notme": ("Jonas: Six thirty?", "Day fifty-five.", 70, "B minor", "lotte",
              "hurt and tender, the waltz tune on a lone cello, piano chords under it, a friend refusing a gift, "
              "pride and sadness, close and quiet"),
    "dread": ("Day fifty-five.", "Herr Brandt: So it was", 72, "B minor", "dark",
              "growing dread, a slow pulse, low sustained strings swelling, wheat rising over a city, vast and cold"),
    "countdown": ("Herr Brandt: So it was", "Lotte: All counted?", 96, "C minor", "dark",
                  "a ticking countdown at night, tense pizzicato and a held high string, minutes to midnight, "
                  "running down a staircase"),
    "door": ("Lotte: All counted?", "Zero, doubled", 60, "D major", "lotte",
             "tender and fragile, the waltz tune on solo felt piano, very slow and soft, one cent pressed into an "
             "old woman's palm at a glass door at midnight, a held breath, fading to nothing"),
    "resolve": ("Zero, doubled", None, 72, "D major", "lotte",
                "the waltz tune whole at last, felt piano and warm strings and cello together, bittersweet and "
                "hopeful, a bakery opening in the morning, gentle, resolving"),
}
# Lotte's theme, the reference above: made first, at its own length.
LOTTE = ("lotte", 60, 72, "D major",
         "a simple, singable waltz tune in three-four, solo felt piano with a warm cello answering each phrase, a "
         "small bakery at dawn, nostalgic, bittersweet and kind, intimate, one clear melody repeated twice")
LOTTE_STRENGTH = 0.45
SEEDS = (11,)


def seconds(name: str) -> int:
    if name == LOTTE[0]:
        return LOTTE[1]
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
        if name == LOTTE[0]:
            bpm, key, ref, brief = LOTTE[2], LOTTE[3], None, LOTTE[4]
        else:
            _, _, bpm, key, ref, brief = CUES[name]
        theme = OUT / "lotte.wav" if ref == "lotte" else THEMES / f"theme-{ref}.mp3"
        if ref and not theme.is_file():
            raise SystemExit(f"missing reference {theme} (make lotte first)")
        strength = LOTTE_STRENGTH if ref == "lotte" else REFERENCE_STRENGTH
        for seed in [int(seed_text)] if seed_text else SEEDS:
            params = GenerationParams(
                caption=f"{STYLE}; {brief}", lyrics="[Instrumental]", instrumental=True, duration=seconds(name),
                bpm=bpm, keyscale=key, timesignature="4", inference_steps=8, shift=3.0, seed=seed, thinking=False,
                **({"reference_audio": str(theme), "audio_cover_strength": strength} if ref else {}),
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
    main(sys.argv[1:] or [LOTTE[0], *CUES])
