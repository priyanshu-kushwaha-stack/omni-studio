"""Soften the drum hits in the ACE-Step cues so none reads as a click in a narration gap (qc clicks, v2 cut 2026-11-16).

    .venv/bin/python channels/say-suppose/videos/<id>/scenes/soften_cues.py

The cues (assets/music/cues/, git-ignored) come from make_music.py. On the v2 cut the wonder cue's hit at its own 57.1 s
landed in a gap at 67.2 s of the film and failed the clicks check. Each cue is kept as <name>.orig.wav. A fast compressor
pass is applied to every cue. Wonder and mischief get a harder pass, and then each burst the clicks detector still finds
is eased down by 18 dB with 15 ms ramps.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(ROOT / "core" / "engines" / "pou" / "scripts"))
import audio_check  # noqa: E402

CUES = Path(__file__).resolve().parents[1] / "assets" / "music" / "cues"
SOFT = "acompressor=threshold=0.08:ratio=8:attack=0.5:release=120:makeup=1.6"
HARD = (
    "acompressor=threshold=0.03:ratio=20:attack=0.1:release=150:makeup=2,"
    "acompressor=threshold=0.05:ratio=20:attack=0.05:release=60:makeup=1.2,alimiter=limit=0.5:attack=1:release=60"
)
HARD_CUES = {"wonder", "mischief"}
SR = 48000


def ffmpeg(src: Path, dst: Path, af: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", af, str(dst)], check=True)


def duck_bursts(path: Path) -> None:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    low, ramp = 10 ** (-18 / 20), int(0.015 * SR)
    for _ in range(3):
        found = audio_check.bursts(x.mean(axis=1))
        if not found:
            break
        for b in found:
            start, length = int((b["t"] - 0.03) * SR), int((b["dur"] + 0.08) * SR)
            gain = np.full(length, low)
            gain[:ramp], gain[-ramp:] = np.linspace(1, low, ramp), np.linspace(low, 1, ramp)
            x[start : start + length] *= gain[: len(x[start : start + length]), None]
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", str(path)],
        input=x.astype(np.float32).tobytes(),
        check=True,
    )


def main() -> None:
    for cue in sorted(CUES.glob("*.wav")):
        if cue.name.endswith(".orig.wav"):
            continue
        orig = cue.with_name(cue.stem + ".orig.wav")
        if not orig.exists():
            orig.write_bytes(cue.read_bytes())
        ffmpeg(orig, cue, HARD if cue.stem in HARD_CUES else SOFT)
        if cue.stem in HARD_CUES:
            duck_bursts(cue)
        print(cue.name, len(audio_check.bursts(audio_check.load(cue))), "bursts left")


if __name__ == "__main__":
    main()
