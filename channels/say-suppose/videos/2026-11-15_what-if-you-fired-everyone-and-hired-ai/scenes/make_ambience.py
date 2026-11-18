"""The fired-everyone film's ambience beds, one per set, two layers each (rules/sound.md #6: the muted-music test), synthesised so they
are licence-free (style.md: effects are made, not downloaded). Every bed is a perfect 60 s loop: the noise is shaped
in the frequency domain over the whole loop and every tone and swell has a whole number of cycles in it, so the loop
seam is inaudible and never a click. Each bed is levelled to BED_RMS; Film.tsx sets it under the voice and in holds.

    ~/Exploration/projects/omni-studio/.venv-media/bin/python scenes/make_ambience.py      # into assets/sfx/bed-*.wav
"""
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
LOOP = 60
N = SR * LOOP
BED_RMS = -36.0
OUT = Path(__file__).resolve().parents[1] / "assets" / "sfx"
T = np.arange(N) / SR
rng = np.random.default_rng(7)


def noise(lo: float, hi: float, tilt: float = 1.0) -> np.ndarray:
    """Periodic noise between lo and hi Hz with a 1/f**tilt slope (0 white, 1 pink, 2 brown), unit RMS."""
    f = np.fft.rfftfreq(N, 1 / SR)
    mag = np.where((f >= lo) & (f <= hi), 1 / np.maximum(f, 1) ** (tilt / 2), 0)
    # soft band edges, so the bed has no ringing
    mag *= np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    x = np.fft.irfft(mag * np.exp(2j * np.pi * rng.random(len(f))), n=N)
    return x / np.sqrt(np.mean(x**2))


def swell(cycles: int, depth: float, phase: float = 0.0) -> np.ndarray:
    """A slow loudness swell with a whole number of cycles in the loop."""
    return 1 - depth / 2 + depth / 2 * np.sin(2 * np.pi * cycles * T / LOOP + phase)


def passes(times: list[float], width: float) -> np.ndarray:
    """Things going by (cars, a train): soft bumps centred on times, wrapped around the loop."""
    env = np.zeros(N)
    for c in times:
        d = (T - c + LOOP / 2) % LOOP - LOOP / 2
        env += np.exp(-0.5 * (d / width) ** 2)
    return env


def hum(freqs: list[tuple[int, float]]) -> np.ndarray:
    """Mains-like hum from whole-number partials (whole cycles in a 60 s loop)."""
    x = sum(a * np.sin(2 * np.pi * f * T) for f, a in freqs)
    return x / np.sqrt(np.mean(x**2))


def ticks(every: float, freq: float = 2600, decay: float = 260) -> np.ndarray:
    """A soft clock tick: a short decaying tone with a 5 ms rise, never a hard edge (no-audio-clicks.md)."""
    x = np.zeros(N)
    k = np.arange(int(0.06 * SR)) / SR
    tick = np.sin(2 * np.pi * freq * k) * np.exp(-k * decay) * np.clip(k / 0.005, 0, 1)
    for start in np.arange(0, LOOP, every):
        i = int(start * SR)
        x[i:i + len(tick)] += tick[: N - i]
    return x / np.sqrt(np.mean(x**2))


def level(x: np.ndarray, db: float) -> np.ndarray:
    return x / np.sqrt(np.mean(x**2)) * 10 ** (db / 20)


def mix(*layers: tuple[np.ndarray, float]) -> np.ndarray:
    """Layers at their dB against each other, then the bed at BED_RMS."""
    return level(sum(level(x, db) for x, db in layers), BED_RMS)


BEDS = {
    # the diner by day: the grill's sizzle, the room's murmur, a fridge, a cup now and then
    "diner": lambda: mix((noise(1800, 9000, 0.8) * swell(5, 0.25), -6), (noise(150, 2200, 1.1) * swell(6, 0.4) * swell(11, 0.2, 2.0), 0),
                         (hum([(60, 1), (120, 0.4)]), -16), (ticks(3.1, 4200, 600), -22)),
    # the diner at night or by one lamp: the fridge and the clock, the plant far off through the glass
    "diner-night": lambda: mix((hum([(60, 1), (120, 0.5)]) * swell(3, 0.3) + noise(30, 250, 2) * 0.8, 0),
                               (ticks(1.0, 1900, 320), -16), (hum([(41, 1), (82, 0.5)]) * swell(4, 0.2), -10)),
    # the paint shop: the line's drone, compressors and the spray guns' hiss
    "plant": lambda: mix((hum([(47, 1), (94, 0.7), (141, 0.4)]) * swell(4, 0.2) + noise(30, 300, 2), 0),
                         (noise(2500, 9000, 1) * (0.4 + passes([3, 9, 15, 21, 27, 33, 39, 45, 51, 57], 1.2)), -6),
                         (ticks(0.5, 1200, 180), -20)),
    # the town by day: traffic going by, a far voice murmur, birds' hiss
    "town": lambda: mix((noise(60, 900, 1.6) * (0.5 + passes([5, 14, 22, 31, 40, 50], 1.8)), 0),
                        (noise(200, 2500, 1.1) * swell(7, 0.4), -8), (noise(1200, 8000, 1) * swell(4, 0.3), -14)),
    # a crowd in the diner: the town meeting, many voices, shuffling
    "crowd": lambda: mix((noise(180, 2800, 1.0) * swell(9, 0.5) * swell(13, 0.3, 1.5), 0),
                         (noise(40, 400, 2) * swell(5, 0.3), -8)),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make in BEDS.items():
        x = make().astype(np.float32)
        peak = np.max(np.abs(x))
        sf.write(OUT / f"bed-{name}.wav", x, SR, subtype="PCM_24")
        print(f"bed-{name}.wav  rms {BED_RMS} dBFS, peak {20 * np.log10(peak):.1f} dBFS")


if __name__ == "__main__":
    main()
