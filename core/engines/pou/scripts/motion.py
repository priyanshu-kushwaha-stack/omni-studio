#!/usr/bin/env python3
"""Procedural motion for hand-drawn stills: line boil, accent flicker, sprite on a path, stroke-order trace.
Everything works on two masks taken by threshold from the cream paper: ink (dark lines) and accent (the
video's one colour). Driven per scene by motion.json: [{"scene": "s002", "effect": "flicker", ...}]."""
from __future__ import annotations
import json
from pathlib import Path

import numpy as np
from PIL import Image

ACCENT_HUES = {"ochre": 38 / 360, "rust": 11 / 360, "teal": 178 / 360}
STEP_HZ = 10  # a new displacement every 0.1 s: "on threes" at 30 fps


def masks(frame: np.ndarray, paper: tuple[int, int, int]) -> tuple[np.ndarray, np.ndarray]:
    """ink: pixels more than 60 levels below the paper in any channel; accent: hue near the channel colours."""
    f = frame.astype(np.int16)
    dark = (np.array(paper, dtype=np.int16) - f).max(axis=2) > 60
    r, g, b = [frame[..., i].astype(np.float32) / 255 for i in range(3)]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    d = np.maximum(mx - mn, 1e-6)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    acc = np.zeros(dark.shape, dtype=bool)
    for h0 in ACCENT_HUES.values():
        dh = np.minimum(np.abs(hue - h0), 1 - np.abs(hue - h0))
        acc |= dark & (dh < 25 / 360) & (sat > 0.3)
    ink = dark & ~acc   # grey marker line; the colour belongs to the accent mask
    return ink, acc


def _noise_field(h: int, w: int, seed: int, cell: int = 48) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    small = rng.standard_normal((2, h // cell + 2, w // cell + 2)).astype(np.float32)
    up = [np.asarray(Image.fromarray(s).resize((w, h), Image.BILINEAR), dtype=np.float32) for s in small]
    return up[0], up[1]


def _paper(frame: np.ndarray, ink: np.ndarray) -> np.ndarray:
    return np.median(frame[~ink], axis=0).astype(np.uint8) if (~ink).any() else np.array([246, 241, 231], np.uint8)


def boil(frame: np.ndarray, ink: np.ndarray, t: float, amp: float = 1.5, seed: int = 0) -> np.ndarray:
    """Lift the ink and lay it back down displaced by a smooth noise field that changes every 0.1 s."""
    step = int(t * STEP_HZ)
    h, w = ink.shape
    dx, dy = _noise_field(h, w, seed * 1000 + step)
    ys, xs = np.mgrid[0:h, 0:w]
    sx = np.clip((xs + np.rint(dx * amp)).astype(int), 0, w - 1)
    sy = np.clip((ys + np.rint(dy * amp)).astype(int), 0, h - 1)
    out = frame.copy()
    out[ink] = _paper(frame, ink)
    moved = ink[sy, sx]
    out[moved] = frame[sy, sx][moved]
    return out


def flicker(frame: np.ndarray, accent: np.ndarray, t: float, seed: int = 0) -> np.ndarray:
    """Accent brightness ±12 % and a 1 px breathing shift, re-rolled every 0.1 s (fire, candle, sun)."""
    step = int(t * STEP_HZ)
    rng = np.random.default_rng(seed * 1000 + step)
    gain = 1.0 + rng.uniform(-0.12, 0.12)
    out = frame.astype(np.float32)
    out[accent] = np.clip(out[accent] * gain, 0, 255)
    dx, dy = rng.integers(-1, 2, size=2)
    shifted = np.roll(np.roll(accent, dy, axis=0), dx, axis=1)
    new = shifted & ~accent
    if accent.any():
        out[new] = frame[accent].mean(axis=0)
    return out.astype(np.uint8)
