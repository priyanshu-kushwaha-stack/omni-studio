"""Master the G3 sound pass to the channel's loudness target (G3 picture lock, 2026-11-25).

    .venv/bin/python channels/say-suppose/videos/<id>/scenes/master.py

The first cut's mix (renders/firstcut/sound.wav) measured -20.2 LUFS; channel.yaml asks -14 ±1 LUFS, true peak under
-1 dBTP. This lifts it 6.4 dB into a limiter (ceiling -2.5 dBFS). The lift pushed one consonant over the clicks
check's step limit: the "t" of the Pickpocket's "I didn't touch it." at 211.86 s, a sharp burst inside the local take,
not an edit. It is dipped 8 dB for 30 ms with 4 ms ramps instead of muted, so the word stays whole.
Writes renders/final-edit/sound-master.wav (git-ignored); mux it onto renders/firstcut/picture-720p.mp4.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np

VIDEO = Path(__file__).resolve().parents[1]
SRC = VIDEO / "renders" / "firstcut" / "sound.wav"
DST = VIDEO / "renders" / "final-edit" / "sound-master.wav"
CHAIN = "volume=6.4dB,alimiter=limit=0.75:attack=3:release=80:level=false:asc=1"
SR = 48000
DIPS = [(211.850, 0.030, -8.0)]  # (start s, length s, dB): consonant bursts the lift pushed over the step limit


def dip(x: np.ndarray, start: float, length: float, db: float, ramp: float = 0.004) -> None:
    a, n, r = int(start * SR), int(length * SR), int(ramp * SR)
    low = 10 ** (db / 20)
    gain = np.full(n + 2 * r, low)
    gain[:r], gain[-r:] = np.linspace(1, low, r), np.linspace(low, 1, r)
    x[a - r : a + n + r] *= gain[:, None]


def main() -> None:
    DST.parent.mkdir(parents=True, exist_ok=True)
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(SRC), "-af", CHAIN, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    for start, length, db in DIPS:
        dip(x, start, length, db)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", str(DST)],
        input=x.tobytes(),
        check=True,
    )
    print(DST)


if __name__ == "__main__":
    main()
