"""Local narration takes for the what-if build: python local_tts.py <spec.json>  (run in .venv-media).

spec.json: {"engine": "qwen3", "ref": <reference wav>, "ref_text": <its transcript>, "jobs": [[text, out_wav], ...]}.
The model loads once for every job. Free and offline once the model is cached; voice.ts converts each output to
mono 44.1 kHz. Qwen3-TTS through mlx-audio, the call core/engines/pou/scripts/tts.py makes for the owner's clone.
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

MODELS = {"qwen3": "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"}


def main(spec_path: str) -> None:
    spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
    engine = spec["engine"]
    if engine not in MODELS:
        raise SystemExit(f"unknown local engine {engine!r}; known: {sorted(MODELS)}")
    from mlx_audio.tts.generate import generate_audio
    from mlx_audio.tts.utils import load_model

    model = load_model(MODELS[engine])
    for text, out in spec["jobs"]:
        out = Path(out)
        prefix = out.with_suffix("")
        generate_audio(
            text=text,
            model=model,
            ref_audio=spec["ref"],
            ref_text=spec.get("ref_text") or None,
            file_prefix=str(prefix),
            audio_format="wav",
            join_audio=True,
            verbose=False,
        )
        made = out.with_name(prefix.name + "_000.wav")
        if made.exists():
            shutil.move(made, out)
        if not out.exists():
            raise SystemExit(f"{engine} wrote no audio for: {text[:60]}")
        print(out, flush=True)


if __name__ == "__main__":
    main(sys.argv[1])
