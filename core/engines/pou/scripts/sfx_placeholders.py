#!/usr/bin/env python3
"""Synthesise placeholder sound effects (pencil scratch, page turn, soft sting) as 48 kHz wav files.

These stand in until licensed library effects land in the OpenMontage music_library/sfx folder;
they are deliberately quiet and short so a swap never changes the mix.
"""

from __future__ import annotations

import argparse
import wave
from pathlib import Path

import numpy as np

SR = 48000


def _write(path: Path, x: np.ndarray) -> None:
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def _bandpass_noise(n: int, lo: float, hi: float, rng: np.random.Generator) -> np.ndarray:
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(spec, n)
    return y / (np.abs(y).max() + 1e-9)


def pencil(seconds: float = 0.9, seed: int = 1) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    y = _bandpass_noise(n, 1800, 7000, rng)
    strokes = (0.55 + 0.45 * np.sin(2 * np.pi * 7.5 * t + 0.6)) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.1 * t))
    env = np.minimum(1, t / 0.05) * np.minimum(1, (seconds - t) / 0.25)
    return 0.35 * y * strokes * env


def page(seconds: float = 0.5, seed: int = 2) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    y = _bandpass_noise(n, 300, 5000, rng)
    env = np.exp(-((t - 0.18) ** 2) / (2 * 0.07**2)) + 0.4 * np.exp(-((t - 0.34) ** 2) / (2 * 0.04**2))
    return 0.4 * y * env


def sting(seconds: float = 1.6) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    y = 0.5 * np.sin(2 * np.pi * 196.0 * t) + 0.35 * np.sin(2 * np.pi * 293.7 * t) + 0.2 * np.sin(2 * np.pi * 392.0 * t)
    env = np.minimum(1, t / 0.02) * np.exp(-t / 0.5)
    return 0.3 * y * env


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("out_dir", type=Path)
    a = p.parse_args()
    a.out_dir.mkdir(parents=True, exist_ok=True)
    _write(a.out_dir / "pencil.wav", pencil())
    _write(a.out_dir / "page.wav", page())
    _write(a.out_dir / "sting.wav", sting())
    print(a.out_dir)


if __name__ == "__main__":
    main()
