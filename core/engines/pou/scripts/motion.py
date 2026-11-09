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
    ink = dark & ~acc  # grey marker line; the colour belongs to the accent mask
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


def sprite(
    frame: np.ndarray,
    box: tuple[int, int, int, int],
    path: list[tuple[float, float]],
    t: float,
    duration: float,
    paper: tuple[int, int, int],
) -> np.ndarray:
    """Cut the box out, fill its place with paper, paste it along the path (offsets in px) with a walk bob."""
    x0, y0, x1, y1 = box
    cut = frame[y0:y1, x0:x1].copy()
    out = frame.copy()
    out[y0:y1, x0:x1] = np.array(paper, dtype=np.uint8)
    u = min(1.0, max(0.0, t / max(duration, 1e-6)))
    seg = u * (len(path) - 1)
    i = min(int(seg), len(path) - 2)
    f = seg - i
    dx = path[i][0] + (path[i + 1][0] - path[i][0]) * f
    dy = path[i][1] + (path[i + 1][1] - path[i][1]) * f + 2 * np.sin(2 * np.pi * 4 * t)
    px, py = int(round(x0 + dx)), int(round(y0 + dy))
    h, w = cut.shape[:2]
    H, W = out.shape[:2]
    sx0, sy0 = max(0, -px), max(0, -py)
    dx0, dy0 = max(0, px), max(0, py)
    cw, ch = min(w - sx0, W - dx0), min(h - sy0, H - dy0)
    if cw > 0 and ch > 0:
        patch = cut[sy0 : sy0 + ch, sx0 : sx0 + cw]
        keep = (np.array(paper, dtype=np.int16) - patch.astype(np.int16)).max(axis=2) > 30
        region = out[dy0 : dy0 + ch, dx0 : dx0 + cw]
        region[keep] = patch[keep]
    return out


def trace_order(ink: np.ndarray, seed: int = 0) -> np.ndarray:
    """Per-pixel reveal order in [0,1] along the stroke: BFS distance over the skeleton from its far end,
    spread back to the full stroke width. Non-ink pixels are 1.0 (revealed last / never)."""
    from collections import deque
    from scipy import ndimage
    from skimage.morphology import skeletonize

    order = np.ones(ink.shape, dtype=np.float32)
    skel = skeletonize(ink)
    if not skel.any():
        return order
    ys, xs = np.nonzero(skel)
    start = int(np.argmin(xs * 4 + ys))  # begin at the left end, so a trace draws left to right like a pen
    dist = np.full(ink.shape, -1, dtype=np.int32)
    q = deque([(int(ys[start]), int(xs[start]))])
    dist[ys[start], xs[start]] = 0
    H, W = ink.shape
    while q:
        y, x = q.popleft()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                ny, nx = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx < W and skel[ny, nx] and dist[ny, nx] < 0:
                    dist[ny, nx] = dist[y, x] + 1
                    q.append((ny, nx))
    # disconnected skeleton pieces: order them after the main stroke, by their own BFS from any pixel
    while (skel & (dist < 0)).any():
        base = dist.max() + 1
        sy, sx = np.argwhere(skel & (dist < 0))[0]
        q = deque([(int(sy), int(sx))])
        dist[sy, sx] = base
        while q:
            y, x = q.popleft()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and skel[ny, nx] and dist[ny, nx] < 0:
                        dist[ny, nx] = dist[y, x] + 1
                        q.append((ny, nx))
    dist_f = dist.astype(np.float32)
    idx = ndimage.distance_transform_edt(~skel, return_distances=False, return_indices=True)
    spread = dist_f[idx[0], idx[1]]
    order[ink] = spread[ink] / max(float(dist.max()), 1.0)
    return order


def load_specs(path: Path) -> dict[str, dict]:
    """motion.json as a list of {"scene": id, "effect": ...} or a dict keyed by scene id."""
    data = json.loads(Path(path).read_text())
    if isinstance(data, list):
        return {d["scene"]: d for d in data}
    return {k: (dict(v, scene=k) if isinstance(v, dict) else v) for k, v in data.items()}


def scaled(spec: dict, sx: float, sy: float) -> dict:
    """A copy of the spec with box and path (authored in the still's own pixels) scaled to the working size."""
    out = dict(spec)
    if "box" in spec:
        x0, y0, x1, y1 = spec["box"]
        out["box"] = (int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy))
    if "path" in spec:
        out["path"] = [(p[0] * sx, p[1] * sy) for p in spec["path"]]
    return out


def boil_effective(spec: dict) -> bool:
    """Whether apply() would boil this scene's ink: effect "boil", or "flicker" that opts in with "boil"."""
    if not isinstance(spec, dict):
        return False
    eff = spec.get("effect")
    return eff == "boil" or (eff == "flicker" and bool(spec.get("boil", False)))


def apply(spec: dict, still: np.ndarray, t_rel: float, paper: tuple[int, int, int], cache: dict) -> np.ndarray:
    """One motion frame for a still, t_rel seconds after the reveal finished. cache keeps the masks and the
    last frame per 0.1 s step, so three consecutive video frames share one computation."""
    eff = spec.get("effect")
    if eff not in ("boil", "flicker", "sprite"):
        return still
    if "masks" not in cache:
        cache["masks"] = masks(still, paper)
    ink, acc = cache["masks"]
    key = (eff, int(t_rel * STEP_HZ)) if eff != "sprite" else (eff, round(t_rel, 3))
    hit = cache.get("frame")
    if hit and hit[0] == key:
        return hit[1]
    seed = int(spec.get("seed", 0))
    if eff == "boil":  # opt-in only; the owner banned boil and the studio tool refuses it
        out = boil(still, ink, t_rel, amp=float(spec.get("amp", 1.5)), seed=seed)
    elif eff == "flicker":
        out = flicker(still, acc, t_rel, seed=seed)
        if spec.get("boil", False):  # opt-in only: the owner banned boil
            out = boil(out, ink, t_rel, amp=float(spec.get("amp", 1.0)), seed=seed + 1)
    else:
        out = sprite(
            still, tuple(spec["box"]), [tuple(p) for p in spec["path"]], t_rel, float(spec.get("duration", 3.0)), paper
        )
    cache["frame"] = (key, out)
    return out
