"""Stitch voice takes into one narration track plus a cue sheet (ported from the pilot's audio/stitch.py).

Line edges get 12 ms fades (owner's audio rule); gaps are per beat. The track is mono, 44.1 kHz, peak-normalised
to -1 dBFS (loudness is set by ffmpeg loudnorm afterwards). Cues give each line's start and end in seconds.
"""

from __future__ import annotations

import json
from math import gcd
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

SR = 44100
FADE = int(0.012 * SR)
LEAD = 0.4


def load(path: Path) -> np.ndarray:
    sr, data = wavfile.read(path)
    if data.dtype.kind in "iu":
        info = np.iinfo(data.dtype)
        mid = 0 if data.dtype.kind == "i" else (info.max + 1) / 2
        data = (data.astype("float64") - mid) / (info.max + 1 - mid)
    data = np.asarray(data, dtype="float64")
    mono = (data.mean(axis=1) if data.ndim > 1 else data).astype("float32")
    if sr != SR:
        g = gcd(SR, int(sr))
        mono = resample_poly(mono, SR // g, int(sr) // g).astype("float32")
    mono[:FADE] *= np.linspace(0, 1, FADE)
    mono[-FADE:] *= np.linspace(1, 0, FADE)
    return mono


def stitch(takes: list[tuple[str, Path, float]], out_wav: Path, out_cues: Path) -> dict:
    """takes: (line id, wav, gap after in seconds). Writes the track and the cue sheet; returns the cue sheet."""
    parts, cues, t = [np.zeros(int(LEAD * SR), "float32")], [], LEAD
    for name, path, gap in takes:
        clip = load(Path(path))
        cues.append({"line": name, "start": round(t, 3), "end": round(t + len(clip) / SR, 3)})
        parts += [clip, np.zeros(int(gap * SR), "float32")]
        t += len(clip) / SR + gap
    track = np.concatenate(parts)
    track *= 10 ** (-1 / 20) / max(1e-6, float(np.abs(track).max()))
    wavfile.write(out_wav, SR, track.astype("float32"))
    data = {"duration": round(t, 3), "cues": cues}
    Path(out_cues).write_text(json.dumps(data, indent=1))
    return data


def gap_after(text: str, speaker: str, last: bool) -> float:
    if last:
        return 1.2
    if text.rstrip().endswith("..."):
        return 0.6
    return 0.25 if speaker == "narrator" else 0.30
