"""The film's ambience beds, one per set, two layers each (rules/sound.md #6: the muted-music test), synthesised so they
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
    # the plasma clinic at dawn: the machines' hum, the air of a small room, and the wall clock
    "clinic": lambda: mix((hum([(60, 1), (120, 0.5), (180, 0.2)]) * swell(3, 0.2) + noise(60, 600, 1.5) * 0.5, 0),
                          (ticks(1.0, 2300, 300), -14), (noise(1500, 6000, 1) * swell(2, 0.3), -14)),
    # the bunk room at night: near silence, a far city through the window, a fridge somewhere in the flat
    "bunk-night": lambda: mix((noise(60, 900, 1.8) * swell(2, 0.3), 0), (hum([(60, 1), (120, 0.4)]), -12),
                              (noise(1200, 5000, 1) * swell(5, 0.4), -18)),
    # the bunk room in the morning: birds-like air through the window and a brighter room tone
    "bunk-morning": lambda: mix((noise(150, 2500, 1.2) * swell(3, 0.3), 0), (noise(2500, 8000, 0.8) * swell(7, 0.6), -12)),
    # the kitchen: the fridge, the clock, the street outside
    "kitchen": lambda: mix((hum([(60, 1), (120, 0.5)]) * swell(3, 0.3) + noise(30, 250, 2) * 0.8, 0),
                           (ticks(1.0, 1900, 320), -16), (noise(150, 1500, 1.5), -10)),
    # the bridge: wind over the river, traffic going by, the water
    "bridge": lambda: mix((noise(250, 1600, 1) * swell(4, 0.6) * swell(7, 0.3, 1.0), 0),
                          (noise(60, 700, 2) * (0.35 + passes([8, 21, 36, 49], 2.4)), -4), (noise(800, 4000, 1.2), -12)),
    # the bus: its engine turning over, and the road under it
    "bus": lambda: mix((hum([(31, 1), (62, 0.7), (93, 0.4)]) * swell(6, 0.25) + noise(30, 200, 2), 0),
                       (noise(200, 1200, 1.2) * swell(9, 0.3), -6)),
    # the office: air conditioning and a far printer
    "office": lambda: mix((noise(80, 1400, 1) * swell(2, 0.2), 0), (hum([(100, 1), (200, 0.3)]), -12)),
    # the street at dusk: traffic hum with cars going by, and the city hiss
    "street": lambda: mix((noise(60, 700, 2) * (0.35 + passes([6, 19, 31, 44, 52], 2.2)), 0),
                          (noise(1500, 7000, 1), -14)),
    # the school hall: a big room's air and a crowd murmur
    "hall": lambda: mix((noise(150, 3000, 1) * swell(5, 0.5), 0), (noise(40, 300, 2), -8)),
    # the warehouse: a big hum, fans and the far patter of many keyboards (made of noise, not the typing loop)
    "warehouse": lambda: mix((hum([(50, 1), (100, 0.7), (150, 0.3)]) * swell(4, 0.15) + noise(40, 300, 2) * 0.6, 0),
                             (noise(2500, 8000, 0) * swell(11, 0.5), -14)),
    # the kitchen at night under one lamp: the lamp's hum and the slow clock
    "kitchen-lamp": lambda: mix((noise(100, 3000, 1), 0), (hum([(100, 1), (200, 0.3)]), -10), (ticks(1.0, 1900, 320), -12)),
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
