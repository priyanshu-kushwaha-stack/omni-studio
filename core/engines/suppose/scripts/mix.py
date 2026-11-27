"""Mix a Say Suppose film: narration, a ducked score, set ambience, sheet sound effects and label blips, faded edges,
then ffmpeg loudnorm to -16 LUFS / -1.5 dBTP (spec; the pilot's pilot_mix.py, generalised).

python mix.py <video_dir> [score.wav] [--luc]
    reads film.json and audio/narration.wav and writes audio/mix.wav; with --luc it reads the warped film-luc.json
    (timewarp.py) and audio/narration_luc.wav instead, so the film's times are already on the final narration.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

from sfx import SR, SYNTHS, blip, env, murmur, place
from timewarp import warp
from wav import to_float


def _load(path: Path, n: int) -> np.ndarray:
    sr, x = wavfile.read(path)
    x = to_float(x)
    x = x.mean(axis=1) if x.ndim > 1 else x
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    out = np.zeros(n)
    out[: min(n, len(x))] = x[:n]
    return out


def _ducked_score(path: Path, voice: np.ndarray) -> np.ndarray:
    m = _load(path, len(voice))
    m /= np.abs(m).max() + 1e-9
    rms = np.sqrt(signal.lfilter(*signal.butter(1, 3, fs=SR), voice**2).clip(0))
    gain = 1 - 0.6 * signal.lfilter(*signal.butter(1, 2, fs=SR), np.clip(rms / 0.02, 0, 1))
    return m * gain


def _events(film: dict, k):
    t = (lambda x: warp(x, k)) if k else (lambda x: x)
    for s in film["shots"]:
        for e in s.get("sfx", []):
            yield SYNTHS[e["name"]](), t(e["at"]), e.get("gain", 0.1)
        for lb in s.get("labels", []):
            yield blip(), t(lb["at"]), 0.05


def raw_bus(narr: Path, score: Path | None, film: dict, warp_k=None) -> np.ndarray:
    n = int(film["duration"] * SR)
    voice = _load(narr, n)
    bus = voice.copy()
    rng = np.random.default_rng(7)
    sets = film.get("sets") or {}
    on = [(s["from"], s["to"]) for s in film["shots"] if (sets.get(s.get("set")) or {}).get("ambience") == "murmur"]
    if on:
        quiet = [(s["from"], s["to"]) for s in film["shots"] if s.get("type") in {"insert", "data"}]
        amb = murmur(rng, film["duration"], quiet)
        mask = np.zeros(n)
        for a, b in on:
            mask[int(a * SR) : int(b * SR)] = 1
        bus += amb * signal.lfilter(*signal.butter(1, 4, fs=SR), mask) * 0.045
    if score:
        bus += _ducked_score(score, voice) * 0.16
    for sound, at, gain in _events(film, warp_k):
        place(bus, sound, at, gain)
    bus *= env(n)
    peak = np.abs(bus).max()
    return bus / peak * 0.89 if peak > 0.89 else bus


def _loudnorm(raw: Path, out: Path) -> None:
    """Two-pass loudnorm: measure, then apply linearly with the measured values (48 kHz stereo out)."""
    base = "loudnorm=I=-16:TP=-1.5:LRA=11"
    first = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(raw), "-af", f"{base}:print_format=json", "-f", "null", "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    m = json.JSONDecoder().raw_decode(first.stderr[first.stderr.rindex("{") :])[0]
    measured = (
        f"{base}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
        f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    )
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", measured, "-ar", str(SR), "-ac", "2", str(out)]
    subprocess.run(cmd, check=True)


def mix(narr: Path, score: Path | None, film: dict, out: Path, warp_k=None) -> Path:
    bus = raw_bus(narr, score, film, warp_k)
    raw = out.with_suffix(".raw.wav")
    try:
        wavfile.write(raw, SR, (np.stack([bus, bus], axis=1) * 32767).astype(np.int16))
        _loudnorm(raw, out)
    finally:
        raw.unlink(missing_ok=True)
    return out


def main(argv: list[str]) -> None:
    luc = "--luc" in argv
    args = [a for a in argv if a != "--luc"]
    video = Path(args[0]).resolve()
    film = json.loads((video / ("film-luc.json" if luc else "film.json")).read_text())
    score = Path(args[1]) if len(args) > 1 else None
    narration = video / "audio" / ("narration_luc.wav" if luc else "narration.wav")
    print(mix(narration, score, film, video / "audio" / "mix.wav"))


if __name__ == "__main__":
    main(sys.argv[1:])
