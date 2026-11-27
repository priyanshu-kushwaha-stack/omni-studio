"""Mix the pilot's sound: narration, an ElevenLabs score (owner, 2026-11-27) ducked under the voice, station murmur,
the shout's echo, UI ticks, card thumps, the board powering down and the readout whoosh. Event times are written on
the voice B timeline and warped onto the narration in use through the two cue sheets. Every sound has faded edges (no
clicks), the murmur ducks under the phone shots, and ffmpeg loudnorm sets the final level afterwards.

Usage: python pilot_mix.py <narr.wav> <score.wav|-> <cues_old.json> <cues_new.json> <out.wav>
"""

import json
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OLD_END = 59.5
WARP: tuple[list[float], list[float]] = ([0.0, OLD_END], [0.0, OLD_END])


def load_warp(old_path: str, new_path: str) -> None:
    old = json.load(open(old_path))["cues"]
    new = json.load(open(new_path))["cues"]
    o, n = [0.0], [0.0]
    for a, b in zip(old, new):
        o += [a["start"], a["end"]]
        n += [b["start"], b["end"]]
    o.append(OLD_END)
    n.append(new[-1]["end"] + (OLD_END - old[-1]["end"]))
    WARP[0][:] = o
    WARP[1][:] = n


def w(t: float) -> float:
    """Voice B film time -> current film time."""
    return float(np.interp(t, WARP[0], WARP[1]))


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


def murmur(rng: np.random.Generator, length: float, black: float) -> np.ndarray:
    n = int(length * SR)
    phone = [(w(a), w(b)) for a, b in [(24.1, 32.05), (50.9, 53.8), (56.95, OLD_END)]]
    pink = signal.lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400], rng.standard_normal(n))
    b, a = signal.butter(2, [180, 2600], btype="band", fs=SR)
    m = signal.lfilter(b, a, pink)
    slow = signal.lfilter(*signal.butter(1, 0.6, fs=SR), rng.standard_normal(n))
    m *= 1 + 3 * slow / (np.abs(slow).max() + 1e-9)
    t = np.arange(n) / SR
    duck = np.ones(n)
    for a0, a1 in phone:
        duck -= 0.75 * np.clip(np.minimum((t - a0 + 0.3) / 0.3, (a1 - t) / 0.3 + 1), 0, 1) * ((t > a0 - 0.3) & (t < a1 + 0.3))
    duck[t > black] = 0
    return m / np.abs(m).max() * np.clip(duck, 0.15, 1) * (t <= black)


def score(path: str, n: int, voice: np.ndarray, black: float) -> np.ndarray:
    """The score, ducked about 8 dB while the narrator speaks, cut at the black frame."""
    sr, m = wavfile.read(path)
    m = m.astype(np.float64)
    m = m.mean(axis=1) if m.ndim > 1 else m
    m /= np.abs(m).max() + 1e-9
    if sr != SR:
        m = signal.resample_poly(m, SR, sr)
    out = np.zeros(n)
    out[: min(n, len(m))] = m[:n]
    rms = np.sqrt(signal.lfilter(*signal.butter(1, 3, fs=SR), voice**2).clip(0))
    talk = np.clip(rms / 0.02, 0, 1)
    gain = 1 - 0.6 * signal.lfilter(*signal.butter(1, 2, fs=SR), talk)
    t = np.arange(n) / SR
    return out * gain * np.clip((black - t) / 0.06, 0, 1)


def main(narr_path: str, score_path: str, cues_old: str, cues_new: str, out_path: str) -> None:
    load_warp(cues_old, cues_new)
    length = WARP[1][-1]
    black = w(59.08)
    rng = np.random.default_rng(7)
    sr, narr = wavfile.read(narr_path)
    narr = narr.astype(np.float64)
    if narr.ndim > 1:
        narr = narr.mean(axis=1)
    narr /= 32768.0 if np.abs(narr).max() > 2 else 1.0
    if sr != SR:
        narr = signal.resample_poly(narr, SR, sr)
    n = int(length * SR)
    voice = np.zeros(n)
    voice[: min(n, len(narr))] = narr[:n]
    bus = voice.copy()
    h0, h1 = json.load(open(cues_new))["cues"][1]["start"], json.load(open(cues_new))["cues"][1]["end"]
    hello = voice[int(h0 * SR) : int(h1 * SR)]
    b, a = signal.butter(2, 1800, fs=SR)
    for k, g in [(1, 0.32), (2, 0.18), (3, 0.09)]:
        place(bus, signal.lfilter(b, a, hello), h0 + 0.28 * k, g)
    bus += murmur(rng, length, black) * 0.045
    if score_path != "-":
        bus += score(score_path, n, voice, black) * 0.16
    for at in [25.58, 27.94, 28.98, 30.9]:
        place(bus, tick(), w(at), 0.12)
    place(bus, tick(1600, 0.08), w(52.0), 0.12)
    place(bus, tick(700, 0.08), w(54.9), 0.12)
    for at in [45.1, 51.15, 53.9, 40.46]:
        place(bus, thump(), w(at), 0.35)
    place(bus, glide(620, 140, 1.3), w(36.6), 0.08)
    place(bus, whoosh(0.6, rng), w(19.8), 0.06)
    place(bus, whoosh(0.4, rng), w(55.3), 0.05)
    peak = np.abs(bus).max()
    bus = bus / peak * 0.89 if peak > 0.89 else bus
    wavfile.write(out_path, SR, (np.stack([bus, bus], axis=1) * 32767).astype(np.int16))


if __name__ == "__main__":
    main(*sys.argv[1:6])
