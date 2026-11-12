"""Local voice takes for the what-if build: python local_tts.py <spec.json>  (run in .venv-media).

spec.json: {"jobs": [{"engine", "text", "out", ...}]}, written by voice.ts (localJob). Two engines, both Qwen3-TTS
through mlx-audio, each loaded once for all its jobs:

- qwen3: the narrator, cloned from a reference clip ("ref", "ref_text"); the call core/engines/pou/scripts/tts.py
  makes for the owner's clone. It takes no instruction, so a line's direction is not heard.
- qwen3-design: a character, made from a written voice description and the line's direction ("instruct"); nobody is
  cloned. "seed" is the voice's, so every take of one character comes from the same draw.

Free and offline once the models are cached (revisions pinned in core/lock.yaml); voice.ts converts each output to
mono 44.1 kHz.
"""

from __future__ import annotations

import gc
import json
import shutil
import sys
from pathlib import Path

import yaml

LOCK = Path(__file__).resolve().parents[3] / "lock.yaml"
# engine -> (Hugging Face repo, revision), pinned in core/lock.yaml local_voices.
MODELS = {
    e: (m["repo"], m["revision"]) for e, m in yaml.safe_load(LOCK.read_text(encoding="utf-8"))["local_voices"].items()
}


def by_engine(jobs: list[dict]) -> dict[str, list[dict]]:
    """Jobs grouped by engine in first-seen order, so each model loads once; an unknown engine is refused first."""
    groups: dict[str, list[dict]] = {}
    for job in jobs:
        if job["engine"] not in MODELS:
            raise SystemExit(f"unknown local engine {job['engine']!r}; known: {sorted(MODELS)}")
        groups.setdefault(job["engine"], []).append(job)
    return groups


def voice_args(job: dict) -> dict:
    """generate_audio's voice arguments for one job: a reference clip, or an instruction."""
    if job.get("instruct"):
        return {"instruct": job["instruct"], "lang_code": "english"}
    return {"ref_audio": job["ref"], "ref_text": job.get("ref_text") or None}


def model_path(engine: str) -> str:
    """The pinned revision's folder: from the local cache when it is there, so a build runs offline."""
    from huggingface_hub import snapshot_download
    from huggingface_hub.errors import LocalEntryNotFoundError

    repo, revision = MODELS[engine]
    try:
        return snapshot_download(repo, revision=revision, local_files_only=True)
    except LocalEntryNotFoundError:  # not cached yet: fetch the pinned revision once
        return snapshot_download(repo, revision=revision)


def main(spec_path: str) -> None:
    jobs = json.loads(Path(spec_path).read_text(encoding="utf-8"))["jobs"]
    groups = by_engine(jobs)
    import mlx.core as mx
    from mlx_audio.tts.generate import generate_audio
    from mlx_audio.tts.utils import load_model

    for engine, group in groups.items():
        model = None  # free the last engine's model (~4.5 GB) before the next one loads
        gc.collect()
        mx.clear_cache()
        model = load_model(model_path(engine))
        for job in group:
            out = Path(job["out"])
            prefix = out.with_suffix("")
            if job.get("seed") is not None:
                mx.random.seed(int(job["seed"]))
            generate_audio(
                text=job["text"],
                model=model,
                file_prefix=str(prefix),
                audio_format="wav",
                join_audio=True,
                verbose=False,
                **voice_args(job),
            )
            made = out.with_name(prefix.name + "_000.wav")
            if made.exists():
                shutil.move(made, out)
            if not out.exists():
                raise SystemExit(f"{engine} wrote no audio for: {job['text'][:60]}")
            print(out, flush=True)


if __name__ == "__main__":
    main(sys.argv[1])
