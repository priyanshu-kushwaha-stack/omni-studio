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


# name -> (from line, to line (None: the film's end), bpm, key, reference, brief). Lines by their opening words. The
# reference is a channel theme ("light", "dark") at REFERENCE_STRENGTH, or "lotte", Lotte's own theme, at LOTTE_STRENGTH.
#
# v5 (owner, 2026-11-13: "most of the videos we made so far are emotional sort of ... I want exciting stuff"; the
# Gemini outside review: electronic, building, 120-150 bpm, each midnight a step up, Lotte's piano once): a futuristic
# synth score that climbs with the money; Lotte's theme (LOTTE, the reference) only for her savings book.
STYLE = (
    "modern cinematic electronic underscore for an animated story with spoken dialogue, pulsing analog synth "
    "arpeggios, punchy light percussion, instrumental, no vocals, energetic but leaves room for voices"
)
CUES = {
    "hook": ("Day thirty-one. Ten million", "Lotte: Declined.", 128, "A minor", "light",
             "a huge cinematic synth swell and a fast arpeggio, a jackpot of glittering digits, then a sudden stop"),
    "wonder": ("Two cents. Last night", "Day eleven.", 120, "C major", "light",
               "curious ticking synth pulse, plucky arpeggio, a secret rule, rising sub-bass under a chessboard, "
               "a riser and a drop"),
    "climb": ("Day eleven.", "But here's the problem", 124, "F major", "light",
              "upbeat electro-pop groove that keeps adding layers, bright synth stabs, a party getting out of hand, "
              "a playful brass riff, cheeky and fun"),
    "uneasy": ("But here's the problem", "Day twenty-eight.", 110, "D minor", "dark",
               "tense pulsing synth bass and a ticking clock, a sleek bank, something being signed, curious and "
               "suspicious"),
    "jackpot": ("Day twenty-eight.", "Day thirty-five. A hundred", 130, "A major", "light",
                "euphoric synthwave drive, shimmering arpeggios, a fortune pouring out, a shopping spree, a stadium "
                "cheering, triumphant and fast"),
    "future": ("Day thirty-five. A hundred", "Karl: Same flour.", 136, "G major", "light",
               "futuristic high-energy synthwave, a swarm of drones taking off, whooshing sweeps, mischievous and "
               "huge"),
    "price": ("Karl: Same flour.", "She counts what her savings", 112, "E minor", "dark",
              "tense climbing synth ostinato that rises one step at a time, prices going up and up, worry growing"),
    "ache": ("She counts what her savings", "So you try the obvious", 66, "D minor", "lotte",
             "the waltz tune slow and in a minor key on solo felt piano, an old baker alone with her savings book, "
             "sparse, lots of air"),
    "chaos": ("So you try the obvious", "Day fifty-two. You're", 140, "B minor", "dark",
              "relentless driving electronic thriller pulse, a whole city glitching, alarms and risers, playful chaos"),
    "planet": ("Day fifty-two. You're", "Herr Brandt: So it was", 100, "C minor", "light",
               "massive cinematic synth and brass swell, breaking news, the whole Earth wrapped in gold, then out "
               "into the universe, vast awe and wonder"),
    "countdown": ("Herr Brandt: So it was", "Zero, doubled", 150, "C minor", "dark",
                  "a racing ticking countdown at midnight, fast percussion and a pulsing bass, running down stairs, "
                  "a heist, urgent and exciting"),
    "triumph": ("Zero, doubled", None, 120, "C major", "light",
                "a triumphant electronic anthem hit, warm synths and a big beat, a victory with two seconds to spare, "
                "then a bright playful groove and a cheeky cliffhanger sting"),
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
