"""The film's ambience beds, one per set, two layers each (rules/sound.md #6, the muted-music test; #5, the planned
silence keeps a faint room-tone floor). v4 (owner, 2026-11-13): until v3 this film had voice and music only; the
wants-you-to-fail film's v3 notes asked for a bed per set, and the same holds here. Synthesised, so licence-free: the
same method as that film's scenes/make_ambience.py. Every bed is a perfect 60 s loop (noise shaped over the whole
loop, every tone and swell a whole number of cycles in it), so the seam never clicks. Each bed sits at BED_RMS;
Film.tsx sets it under the voice and in the holds.

    ~/Exploration/projects/omni-studio/.venv-media/bin/python <this video>/make_ambience.py   # into assets/sfx/bed-*.wav
"""

from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
LOOP = 60
N = SR * LOOP
BED_RMS = -36.0
OUT = Path(__file__).resolve().parent / "assets" / "sfx"
T = np.arange(N) / SR
rng = np.random.default_rng(7)


def noise(lo: float, hi: float, tilt: float = 1.0) -> np.ndarray:
    """Periodic noise between lo and hi Hz with a 1/f**tilt slope (0 white, 1 pink, 2 brown), unit RMS."""
    f = np.fft.rfftfreq(N, 1 / SR)
    mag = np.where((f >= lo) & (f <= hi), 1 / np.maximum(f, 1) ** (tilt / 2), 0)
    mag *= np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    x = np.fft.irfft(mag * np.exp(2j * np.pi * rng.random(len(f))), n=N)
    return x / np.sqrt(np.mean(x**2))


def swell(cycles: int, depth: float, phase: float = 0.0) -> np.ndarray:
    """A slow loudness swell with a whole number of cycles in the loop."""
    return 1 - depth / 2 + depth / 2 * np.sin(2 * np.pi * cycles * T / LOOP + phase)


def passes(times: list[float], width: float) -> np.ndarray:
    """Things going by (cars, a crowd's cheer): soft bumps centred on times, wrapped around the loop."""
    env = np.zeros(N)
    for c in times:
        d = (T - c + LOOP / 2) % LOOP - LOOP / 2
        env += np.exp(-0.5 * (d / width) ** 2)
    return env


def hum(freqs: list[tuple[int, float]]) -> np.ndarray:
    """Mains-like hum from whole-number partials (whole cycles in a 60 s loop)."""
    x = sum(a * np.sin(2 * np.pi * f * T) for f, a in freqs)
    return x / np.sqrt(np.mean(x**2))


def ticks(times: np.ndarray, freq: float = 2600, decay: float = 260) -> np.ndarray:
    """Soft ticks at the given times: a short decaying tone with a 5 ms rise, never a hard edge."""
    x = np.zeros(N)
    k = np.arange(int(0.06 * SR)) / SR
    tick = np.sin(2 * np.pi * freq * k) * np.exp(-k * decay) * np.clip(k / 0.005, 0, 1)
    for start in times:
        i = int(start * SR)
        x[i:i + len(tick)] += tick[: N - i]
    return x / np.sqrt(np.mean(x**2))


def clock(every: float, freq: float = 2600, decay: float = 260) -> np.ndarray:
    return ticks(np.arange(0, LOOP, every), freq, decay)


def babble(voices: int) -> np.ndarray:
    """A crowd's murmur: band-limited noise, each voice gated at a syllable rate with its own whole-cycle swell."""
    x = np.zeros(N)
    for v in range(voices):
        rate = 3 + v % 4
        gate = np.clip(np.sin(2 * np.pi * (rate * LOOP + v) * T / LOOP + v) * 1.4, 0, 1) ** 2
        x += noise(250 + 40 * v, 2400, 1) * gate * swell(2 + v % 3, 0.6, v)
    return x / np.sqrt(np.mean(x**2))


def level(x: np.ndarray, db: float) -> np.ndarray:
    return x / np.sqrt(np.mean(x**2)) * 10 ** (db / 20)


def mix(*layers: tuple[np.ndarray, float]) -> np.ndarray:
    """Layers at their dB against each other, then the bed at BED_RMS."""
    return level(sum(level(x, db) for x, db in layers), BED_RMS)


BEDS = {
    # Lotte's bakery by day: the oven's low hum, the street muffled through the glass, a slow wall clock
    "bakery": lambda: mix((hum([(50, 1), (100, 0.5)]) * swell(3, 0.2) + noise(40, 300, 2) * 0.7, 0),
                          (noise(80, 900, 1.6) * (0.4 + passes([9, 23, 38, 51], 2.5)), -8), (clock(1.0, 2200, 300), -20)),
    # the bakery after closing: near silence, the lamp's hum and the oven ticking as it cools
    "bakery-lamp": lambda: mix((noise(100, 2500, 1) * swell(2, 0.2), 0), (hum([(100, 1), (200, 0.3)]), -10),
                               (ticks(np.array([3.1, 11.7, 19.2, 26.5, 33.8, 41.3, 48.0, 55.6]), 1500, 180), -16)),
    # the flat at midnight: the fridge, a soft slow clock, the city outside
    "flat-night": lambda: mix((hum([(60, 1), (120, 0.5)]) * swell(3, 0.3) + noise(30, 250, 2) * 0.8, 0),
                              (clock(1.0, 1900, 320), -17), (noise(150, 1500, 1.5), -10)),
    # the flat at eleven, waiting: the same room, and the clock nearer
    "flat-clock": lambda: mix((hum([(60, 1), (120, 0.5)]) * swell(3, 0.3) + noise(30, 250, 2) * 0.8, 0),
                              (clock(1.0, 2100, 260), -8), (noise(150, 1500, 1.5), -12)),
    # the street by day: traffic going by and a brighter hiss
    "street": lambda: mix((noise(60, 900, 1.6) * (0.5 + passes([4, 11, 17, 26, 33, 39, 47, 55], 1.6)), 0),
                          (noise(1200, 8000, 1) * swell(5, 0.3), -10)),
    # the street party: a crowd's murmur over the street
    "party": lambda: mix((babble(10) * swell(4, 0.3), 0), (noise(60, 700, 1.6), -9)),
    # the tram: its motor, and the rails knocking under it
    "tram": lambda: mix((hum([(31, 1), (62, 0.7), (93, 0.4)]) * swell(6, 0.25) + noise(30, 220, 2), 0),
                        (ticks(np.sort(np.concatenate([np.arange(0, LOOP, 1.5), np.arange(0.18, LOOP, 1.5)])), 180, 60), -6)),
    # the morning after the party: a quiet street, a little wind
    "street-quiet": lambda: mix((noise(250, 1600, 1) * swell(4, 0.5), 0), (noise(60, 600, 2) * (0.4 + passes([14, 40], 4)), -6)),
    # the bank: air conditioning and a quiet office
    "bank": lambda: mix((noise(60, 1800, 1.2) * swell(2, 0.1) + hum([(50, 0.4)]), 0), (noise(1500, 6000, 1), -14)),
    # the bank at night: the air conditioning alone
    "bank-night": lambda: mix((noise(60, 1500, 1.4) * swell(2, 0.15), 0), (hum([(50, 1), (150, 0.3)]), -12)),
    # the football ground: wind over the stand and the crowd swelling
    "ground": lambda: mix((babble(8) * (0.4 + 1.2 * passes([7, 25, 44], 2.5)), 0), (noise(200, 1400, 1) * swell(5, 0.5), -6)),
    # the back door at dusk: the van idling, and the wind in the yard
    "backdoor": lambda: mix((hum([(29, 1), (58, 0.6), (87, 0.3)]) * swell(10, 0.3) + noise(30, 180, 2) * 0.6, 0),
                            (noise(250, 1600, 1) * swell(4, 0.6), -5)),
    # an archive picture: almost nothing, the air of a room
    "hush": lambda: mix((noise(300, 2500, 1) * swell(2, 0.5), 0), (noise(40, 400, 2), -8)),
    # the wheat over the city at night: wind and a low rumble
    "night": lambda: mix((noise(250, 1800, 1) * swell(4, 0.6) * swell(7, 0.3, 1.0), 0), (noise(30, 200, 2), -4)),
    # the glass door at midnight: a sleeping street, Lotte's lamp humming (the silence's room-tone floor)
    "door": lambda: mix((noise(120, 1500, 1.4) * swell(3, 0.3), 0), (hum([(100, 1), (200, 0.25)]), -12)),
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
