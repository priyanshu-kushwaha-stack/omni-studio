"""Stitch the pilot's local voice takes into one track plus a cue sheet (run in .venv-media).

python stitch.py <takes_dir> <a|b> <out_dir>

Line edges get 12 ms fades (owner's audio rule); gaps are fixed per beat. Writes <out_dir>/track_<v>.wav (mono,
44.1 kHz, peak-normalised to -1 dBFS; loudness is set by ffmpeg loudnorm afterwards) and cues_<v>.json with each
line's start and end in seconds, which the three looks time their beats to.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44100
FADE = int(0.012 * SR)

# (take name pattern, gap after in seconds). "{v}" is the version, a or b.
ORDER = [
    ("{v}_n01", 0.25),
    ("you_hello", 0.30),
    ("{v}_n02", 0.35),
    ("{v}_n03", 0.40),
    ("{v}_n04", 0.25),
    ("{v}_n05", 0.40),
    ("{v}_n06", 0.25),
    ("kenji_late", 0.30),
    ("{v}_n07", 0.70),
    ("{v}_n08", 0.55),
    ("{v}_n09", 0.30),
    ("{v}_n10", 0.30),
    ("{v}_n11", 1.20),
]


def load(path: Path) -> np.ndarray:
    data, sr = sf.read(path, dtype="float32", always_2d=True)
    mono = data.mean(axis=1)
    if sr != SR:
        idx = np.arange(0, len(mono), sr / SR)
        mono = np.interp(idx, np.arange(len(mono)), mono).astype("float32")
    mono[:FADE] *= np.linspace(0, 1, FADE)
    mono[-FADE:] *= np.linspace(1, 0, FADE)
    return mono


def main(takes: str, version: str, out: str) -> None:
    takes_dir, out_dir = Path(takes), Path(out)
    out_dir.mkdir(parents=True, exist_ok=True)
    parts, cues, t = [np.zeros(int(0.4 * SR), "float32")], [], 0.4
    for pattern, gap in ORDER:
        name = pattern.format(v=version)
        clip = load(takes_dir / f"{name}.wav")
        cues.append({"line": name, "start": round(t, 3), "end": round(t + len(clip) / SR, 3)})
        parts += [clip, np.zeros(int(gap * SR), "float32")]
        t += len(clip) / SR + gap
    track = np.concatenate(parts)
    track *= 10 ** (-1 / 20) / max(1e-6, float(np.abs(track).max()))
    sf.write(out_dir / f"track_{version}.wav", track, SR)
    (out_dir / f"cues_{version}.json").write_text(json.dumps({"duration": round(t, 3), "cues": cues}, indent=1))
    print(f"track_{version}: {t:.2f} s, {len(cues)} lines")


if __name__ == "__main__":
    main(*sys.argv[1:4])
