"""The pause-time score, made locally with ACE-Step 1.5 (MIT, outputs usable commercially). Its pin, `ace_step` in
core/lock.yaml, comes from the Power & Citizen branch, where it was installed; it reaches this branch when that merges.
This script uses the fast turbo model; the larger acestep-v15-xl-sft (50 steps) is the higher-quality option once its
checkpoint has finished downloading.
Free: no paid call. The owner asked for our own sound rather than library tracks (2026-11-07, G5).

    cd <omni-studio root>
    .tools/ace-step-1.5/.venv/bin/python channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day/make_music.py
    .tools/ace-step-1.5/.venv/bin/python .../make_music.py catch        # one cue

Five cues follow the film's beats (lengths from assets/narration/props.json, with a few seconds spare). Briefs follow
channels/say-suppose/style.md: a theme for "you", a cold cue for the catch, near-silence before the twist; an
underscore under one narrator, never a song: no vocals, no drum kit, no big drops, room left for speech. Three seeds
per cue, so the owner picks by ear, each styled on one of the channel's two themes. Output: WAV into assets/music/themed/ (git-ignored), peak -1 dBFS; the level is set in
the mix, under the voice.
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
OUT = HERE / "assets" / "music" / "themed"
# The channel's themes (owner's picks, 2026-11-07; channels/say-suppose/brand/README.md): every cue takes one as its
# style reference at low strength, so the score sounds like the channel without copying the tune.
THEMES = HERE.parents[1] / "brand" / "music"
THEME_OF = {"you": "light", "tension": "light", "catch": "dark", "longrun": "dark", "twist": "dark"}
REFERENCE_STRENGTH = 0.2

STYLE = ("whimsical cinematic underscore for an animated paper-cut story narrated by one voice, light orchestra, "
         "pizzicato strings, celesta, felt piano, soft woodwinds, instrumental, no vocals, no drum kit, sparse, "
         "leaves room for a voice")

# name -> (where in the film, seconds, bpm, key, brief)
CUES = {
    "you": ("0:11-1:55, day one and the first days: the alarm, the phone, the boss, the samosa, the chappal", 110, 100,
            "C major", "curious and mischievous, a ticking pizzicato clock motif, playful clarinet, light and bouncy, "
            "a small grin in every bar, never silly"),
    "tension": ("1:55-2:45, day twelve: the bus, the kid, the pause, the countdown, the rescue", 54, 120, "D minor",
                "a steady ticking pulse and low strings rising, urgent but restrained, tightening, then one held "
                "note that hangs"),
    "catch": ("2:45-3:56, the catch: the cost, the mother's fall, the sleepless nights, the curtain at midnight", 76,
              70, "A minor", "cold and sad, solo felt piano with soft high strings, slow, spacious, a lonely music-box "
              "glint, heavy-hearted but gentle"),
    "longrun": ("3:56-4:55, the long run: the cricket catch, the mother on the stairs, forty years, two days older",
                62, 80, "F major", "warm and bittersweet, piano and cello, nostalgic, gently hopeful, resolving softly"),
    "twist": ("4:55-5:16, the twist: someone else is moving; the end card", 26, 60, "E minor",
              "eerie and sparse, a low soft drone, a few music-box notes, unresolved, mysterious, quiet"),
}
SEEDS = (11, 29, 47)


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
    for name in names:
        where, seconds, bpm, key, brief = CUES[name]
        theme = THEMES / f"theme-{THEME_OF[name]}.mp3"
        if not theme.is_file():
            raise SystemExit(f"missing channel theme {theme}: fetch it with `higgsfield generate get <id>` (brand/README.md)")
        for seed in SEEDS:
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
            dst = OUT / f"{name}-{seed}.wav"
            src.replace(dst)
            print(f"{dst}  ({where})", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] or list(CUES))
