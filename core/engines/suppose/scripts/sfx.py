"""Sound synths for Say Suppose films, ported from the pilot's pilot_mix.py: faded placement, tick, thump, glide,
whoosh, the label blip, the station murmur and the shout's echo. Every sound has faded edges (no clicks)."""

from __future__ import annotations

import numpy as np
from scipy import signal

SR = 48000


def env(n: int, fade: float = 0.012) -> np.ndarray:
    k = max(1, int(fade * SR))
    e = np.ones(n)
    k = min(k, n // 2)
    e[:k] = np.linspace(0, 1, k)
    e[n - k :] = np.linspace(1, 0, k)
    return e


def place(bus: np.ndarray, sound: np.ndarray, at: float, gain: float) -> None:
    """Add a faded sound at `at` seconds. A negative start is clipped to 0; a tail past the bus end gets a fade."""
    i = int(at * SR)
    sound = sound * env(len(sound))
    if i < 0:
        sound, i = sound[-i:], 0
    if i >= len(bus) or len(sound) == 0:
        return
    seg = sound[: len(bus) - i].copy()
    if len(seg) < len(sound):
        k = min(len(seg), int(0.012 * SR))
        seg[len(seg) - k :] *= np.linspace(1, 0, k)
    bus[i : i + len(seg)] += seg * gain


def tick(freq: float = 1300, dur: float = 0.05) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 60)


def thump() -> np.ndarray:
    t = np.arange(int(0.22 * SR)) / SR
    return np.sin(2 * np.pi * (140 - 60 * t / 0.22) * t) * np.exp(-t * 18)


def glide(f0: float, f1: float, dur: float) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    f = f0 + (f1 - f0) * t / dur
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5)


def whoosh(dur: float, rng: np.random.Generator) -> np.ndarray:
    n = int(dur * SR)
    out = np.zeros(n)
    noise = rng.standard_normal(n)
    for k in range(8):
        seg = slice(k * n // 8, (k + 1) * n // 8)
        lo = 300 + 3000 * k / 8
        b, a = signal.butter(2, [lo, lo * 1.8], btype="band", fs=SR)
        out[seg] = signal.lfilter(b, a, noise)[seg]
    return out * np.hanning(n)


def blip() -> np.ndarray:
    return tick(1800, 0.04)


def murmur(rng: np.random.Generator, length: float, ducks: list[tuple[float, float]]) -> np.ndarray:
    """Station murmur (the pilot's), ducked 75% inside each (start, end) window with 0.3 s ramps."""
    n = int(length * SR)
    pink = signal.lfilter(
        [0.049922035, -0.095993537, 0.050612699, -0.004408786],
        [1, -2.494956002, 2.017265875, -0.522189400],
        rng.standard_normal(n),
    )
    m = signal.lfilter(*signal.butter(2, [180, 2600], btype="band", fs=SR), pink)
    slow = signal.lfilter(*signal.butter(1, 0.6, fs=SR), rng.standard_normal(n))
    m *= 1 + 3 * slow / (np.abs(slow).max() + 1e-9)
    t = np.arange(n) / SR
    duck = np.ones(n)
    for a0, a1 in ducks:
        ramp = np.clip(np.minimum((t - a0 + 0.3) / 0.3, (a1 - t) / 0.3 + 1), 0, 1)
        duck -= 0.75 * ramp * ((t > a0 - 0.3) & (t < a1 + 0.3))
    return m / (np.abs(m).max() + 1e-9) * np.clip(duck, 0.15, 1)


def echo(voice: np.ndarray, at: float, end: float, bus: np.ndarray) -> None:
    """The shout's three-tap echo from the pilot."""
    clip = voice[int(at * SR) : int(end * SR)]
    b, a = signal.butter(2, 1800, fs=SR)
    for k, g in [(1, 0.32), (2, 0.18), (3, 0.09)]:
        place(bus, signal.lfilter(b, a, clip), at + 0.28 * k, g)


SYNTHS = {
    "tick": tick,
    "thump": thump,
    "blip": blip,
    "glide": lambda: glide(620, 140, 1.3),
    "whoosh": lambda: whoosh(0.5, np.random.default_rng(7)),
}
