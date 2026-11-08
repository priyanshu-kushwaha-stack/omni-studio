"""Word timestamps for narration clips: python transcribe.py a.wav b.wav ... -> a.wav.words.json, ...

Audio is decoded with ffmpeg because faster-whisper's PyAV loader is incompatible with the
installed PyAV version (open() rejects metadata_errors).
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel


def load(path: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.float32)


def main(paths: list[str]) -> None:
    model = WhisperModel("small", device="cpu", compute_type="int8")
    for path in paths:
        segments, _ = model.transcribe(load(path), language="en", word_timestamps=True)
        words = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for s in segments for w in (s.words or [])
        ]
        with open(f"{path}.words.json", "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False)
        print(f"{path}: {len(words)} words", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
