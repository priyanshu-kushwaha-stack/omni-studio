"""Mix the 60 s pilot's sound locally (no paid music; owner, 2026-11-27): narration A, station murmur, the shout's
echo, UI ticks, card thumps, the board powering down, the readout whoosh and a soft pad. Every sound has faded edges
(no clicks), the murmur ducks under the phone shots, and the mix is loudness-normalised afterwards with ffmpeg.

Usage: python pilot_mix.py <narr_a.wav> <out.wav>
"""

import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
LENGTH = 59.5
PHONE = [(24.1, 32.05), (50.9, 53.8), (56.95, 59.5)]  # murmur ducks here
BLACK = 59.1


def env(n: int, fade: float = 0.012) -> np.ndarray:
    k = max(1, int(fade * SR))
    e = np.ones(n)
    k = min(k, n // 2)
    e[:k] = np.linspace(0, 1, k)
    e[n - k :] = np.linspace(1, 0, k)
    return e


def place(bus: np.ndarray, sound: np.ndarray, at: float, gain: float) -> None:
    i = int(at * SR)
    j = min(len(bus), i + len(sound))
    if i < len(bus):
        bus[i:j] += sound[: j - i] * env(len(sound))[: j - i] * gain


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


def murmur(rng: np.random.Generator) -> np.ndarray:
    n = int(LENGTH * SR)
    pink = signal.lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400], rng.standard_normal(n))
    b, a = signal.butter(2, [180, 2600], btype="band", fs=SR)
    m = signal.lfilter(b, a, pink)
    slow = signal.lfilter(*signal.butter(1, 0.6, fs=SR), rng.standard_normal(n))
    m *= 1 + 3 * slow / (np.abs(slow).max() + 1e-9)
    t = np.arange(n) / SR
    duck = np.ones(n)
    for a0, a1 in PHONE:
        duck -= 0.75 * np.clip(np.minimum((t - a0 + 0.3) / 0.3, (a1 - t) / 0.3 + 1), 0, 1) * ((t > a0 - 0.3) & (t < a1 + 0.3))
    duck[t > BLACK] = 0
    return m / np.abs(m).max() * np.clip(duck, 0.15, 1) * (t <= BLACK)


def pad() -> np.ndarray:
    n = int(LENGTH * SR)
    t = np.arange(n) / SR
    chords = [(220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (130.8, 164.8, 196.0), (196.0, 246.9, 293.7)]
    out = np.zeros(n)
    for k in range(int(LENGTH // 4) + 1):
        c = chords[k % 4]
        i0, i1 = int(k * 4 * SR), min(n, int((k * 4 + 4.6) * SR))
        tt = t[i0:i1] - k * 4
        e = np.clip(tt / 1.2, 0, 1) * np.clip((4.6 - tt) / 1.0, 0, 1)
        for f in c:
            out[i0:i1] += e * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 1.003 * tt))
    b, a = signal.butter(2, 900, fs=SR)
    out = signal.lfilter(b, a, out)
    out[t > BLACK] = 0
    out *= np.clip((BLACK - t) / 0.08, 0, 1)
    return out / np.abs(out).max()


def main(narr_path: str, out_path: str) -> None:
    rng = np.random.default_rng(7)
    sr, narr = wavfile.read(narr_path)
    narr = narr.astype(np.float64)
    if narr.ndim > 1:
        narr = narr.mean(axis=1)
    narr /= 32768.0 if np.abs(narr).max() > 2 else 1.0
    if sr != SR:
        narr = signal.resample_poly(narr, SR, sr)
    n = int(LENGTH * SR)
    bus = np.zeros(n)
    bus[: min(n, len(narr))] += narr[:n]
    hello = narr[int(3.77 * SR) : int(4.7 * SR)]
    b, a = signal.butter(2, 1800, fs=SR)
    for k, g in [(1, 0.32), (2, 0.18), (3, 0.09)]:
        place(bus, signal.lfilter(b, a, hello), 3.77 + 0.28 * k, g)
    bus += murmur(rng) * 0.05
    bus += pad() * 0.035
    for at in [25.58, 27.94, 28.98, 30.9]:
        place(bus, tick(), at, 0.12)
    place(bus, tick(1600, 0.08), 52.0, 0.12)
    place(bus, tick(700, 0.08), 54.9, 0.12)
    for at in [45.1, 51.15, 53.9, 40.46]:
        place(bus, thump(), at, 0.35)
    place(bus, glide(620, 140, 1.3), 36.6, 0.08)
    place(bus, whoosh(0.6, rng), 19.8, 0.06)
    place(bus, whoosh(0.4, rng), 55.3, 0.05)
    peak = np.abs(bus).max()
    bus = bus / peak * 0.89 if peak > 0.89 else bus
    wavfile.write(out_path, SR, (np.stack([bus, bus], axis=1) * 32767).astype(np.int16))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
