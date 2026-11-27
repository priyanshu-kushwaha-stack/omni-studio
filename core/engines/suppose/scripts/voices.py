"""Free local voices for a film: voice B narration (a Qwen3 clone) and each character's own designed voice
(Qwen3 VoiceDesign, one seed per character from the cast library), through the what-if engine's local_tts.py.

python voices.py <video_dir>   (reads cast-pass.yaml; writes audio/takes/, audio/narration.wav, cues and words)
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[4]
WHATIF = REPO / "core" / "engines" / "whatif" / "pipeline"
VOICE_DIR = Path("channels") / "say-suppose" / "brand" / "voice"


def main_checkout() -> Path:
    """The main checkout (it holds .venv-media and the git-ignored voice files): OMNI_MAIN, else the first worktree."""
    env = os.environ.get("OMNI_MAIN")
    if env:
        return Path(env)
    out = subprocess.run(
        ["git", "-C", str(REPO), "worktree", "list", "--porcelain"], capture_output=True, text=True, check=True
    ).stdout
    return Path(out.split("\n")[0].removeprefix("worktree "))


def jobs(lines: list[dict], cast: dict, narrator_ref: Path, narrator_text: str, out_dir: Path) -> dict:
    """The local_tts.py spec: qwen3 clone for narrator lines, qwen3-design (instruct + seed) for characters."""
    out = []
    for ln in lines:
        path = str(Path(out_dir) / f"{ln['n']:03d}_{ln['speaker']}.wav")
        if ln["speaker"] == "narrator":
            out.append(
                {
                    "engine": "qwen3",
                    "text": ln["text"],
                    "out": path,
                    "ref": str(narrator_ref),
                    "ref_text": narrator_text,
                }
            )
            continue
        voice = cast.get(ln["speaker"], {}).get("voice")
        if not voice:
            raise SystemExit(
                f"{ln['speaker']} has no voice in the cast library; design one with prompts/character-voice.md"
            )
        out.append(
            {
                "engine": "qwen3-design",
                "text": ln["text"],
                "out": path,
                "instruct": voice["desc"],
                "seed": voice["seed"],
            }
        )
    return {"jobs": out}


def _media_py() -> str:
    return str(main_checkout() / ".venv-media" / "bin" / "python")


def run(spec_path: Path) -> None:
    subprocess.run([_media_py(), str(WHATIF / "local_tts.py"), str(spec_path)], check=True)


def words(paths: list[Path]) -> None:
    """transcribe.py writes <path>.words.json next to each wav."""
    subprocess.run([_media_py(), str(WHATIF / "transcribe.py"), *map(str, paths)], check=True)


def convert_words(raw: object) -> list[dict]:
    """transcribe.py's word list as sheetcheck reads it: [{"word", "start", "end"}]."""
    return [{"word": str(w["word"]), "start": float(w["start"]), "end": float(w["end"])} for w in raw]  # type: ignore[attr-defined]


def write_words(wav: Path, out: Path) -> None:
    raw = json.loads(Path(f"{wav}.words.json").read_text(encoding="utf-8"))
    out.write_text(json.dumps(convert_words(raw), ensure_ascii=False), encoding="utf-8")


def main(video_dir: str) -> None:
    from library import Library
    from stitch import gap_after, stitch

    video = Path(video_dir).resolve()
    voice = main_checkout() / VOICE_DIR
    ref_txt = voice / "narrator-b-cool.txt"
    if not ref_txt.exists():
        raise SystemExit(
            f"missing {ref_txt}: write voice B's reference read text there (narrator.py COOL_TEXT, tag say-suppose-v1)"
        )
    lines = yaml.safe_load((video / "cast-pass.yaml").read_text())["lines"]
    takes_dir = video / "audio" / "takes"
    takes_dir.mkdir(parents=True, exist_ok=True)
    cast = Library.for_channel("say-suppose").cast
    spec = jobs(lines, cast, voice / "narrator-b-cool.wav", ref_txt.read_text().strip(), takes_dir)
    (takes_dir / "spec.json").write_text(json.dumps(spec, indent=1))
    run(takes_dir / "spec.json")
    takes = [
        (
            f"{ln['n']:03d}_{ln['speaker']}",
            Path(j["out"]),
            gap_after(ln["text"], ln["speaker"], i == len(lines) - 1),
        )
        for i, (ln, j) in enumerate(zip(lines, spec["jobs"], strict=True))
    ]
    wav = video / "audio" / "narration.wav"
    stitch(takes, wav, video / "audio" / "cues_b.json")
    words([wav])
    write_words(wav, video / "audio" / "narration.words.json")
    print(wav)


if __name__ == "__main__":
    main(sys.argv[1])
