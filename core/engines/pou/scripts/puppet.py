#!/usr/bin/env python3
"""Cut-out puppets on paper plates: raster parts cut from the channel's own stills, procedural face features
(pupils, lids, brows, mouths) drawn in the measured charcoal weight, pose-to-pose motion on twos with closed-form
spring eases, and the same line boil as compose/motion so puppet and plate wobble identically.

The pieces, bottom to top:
  plate    the still with every moving part painted out with paper (paper_fill)
  parts    RGBA cut-outs (cut_part), each with a pivot and an optional parent; transformed per frame
  features eyes / mouths / brows drawn into a part's image before it is transformed, so they ride the head
  boil     motion.boil over the finished frame (puppet and plate share one noise field)

Timing is driven by narration words: an action's "at" is a word (first match at or after the scene start)
plus an optional offset. Every action is stepped on twos *from its own start*, so its first changed frame is the
first video frame at or after the word."""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

import motion

FPS = 30
POSE_HZ = 15  # poses held on twos
INK = (0x18, 0x17, 0x14)  # core colour of the marker line measured in the v2 stills (median edge ~#373530)


# ---------------------------------------------------------------- timing


def spring(t: float, stiffness: float = 170.0, damping: float = 12.0, mass: float = 1.0) -> float:
    """Step response of a damped spring at t seconds (0 -> 1, overshoots when underdamped). Same maths as
    Ink Theater's springEase, but in real seconds so stiffness/damping mean the same thing at any duration."""
    if t <= 0:
        return 0.0
    w = math.sqrt(stiffness / mass)
    z = damping / (2 * math.sqrt(stiffness * mass))
    if z < 1:
        wd = w * math.sqrt(1 - z * z)
        return 1 - math.exp(-z * w * t) * (math.cos(wd * t) + (z * w / wd) * math.sin(wd * t))
    if z == 1:
        return 1 - math.exp(-w * t) * (1 + w * t)
    a = -w * (z - math.sqrt(z * z - 1))
    b = -w * (z + math.sqrt(z * z - 1))
    return 1 - (b / (b - a) * math.exp(a * t) - a / (b - a) * math.exp(b * t))


def ease(name: str, u: float, t: float) -> float:
    """u = normalised progress over the action's dur, t = seconds since the action started."""
    if name.startswith("spring"):
        parts = name.split(":")
        k = float(parts[1]) if len(parts) > 1 else 170.0
        c = float(parts[2]) if len(parts) > 2 else 12.0
        return spring(t, k, c)
    if name == "snap":
        return 1.0
    u = min(1.0, max(0.0, u))
    if name == "out":
        return 1 - (1 - u) ** 3
    if name == "in":
        return u**3
    return u * u * (3 - 2 * u)  # "inout"


def stepped(t: float, start: float, hz: float = POSE_HZ) -> float:
    """Seconds since start, held on twos counted from start itself (so the first changed frame is on the word)."""
    if t < start:
        return -1.0
    return math.floor((t - start) * hz + 1e-6) / hz


def _norm(w: str) -> str:
    return re.sub(r"[^a-z0-9%]", "", w.lower())


def word_time(words: list[dict], word: str, after: float = 0.0) -> float:
    """Start time of the first word matching `word` (case/punctuation-insensitive) at or after `after`."""
    target = _norm(word)
    for w in words:
        if w["start"] >= after - 0.05 and _norm(w["word"]) == target:
            return float(w["start"])
    raise KeyError(f"word {word!r} not found after {after}")


def resolve_at(at, words: list[dict], scene_start: float) -> float:
    """at: seconds (absolute), {"word": w, "offset": s} or {"scene": s} (seconds after scene start)."""
    if isinstance(at, (int, float)):
        return float(at)
    if "word" in at:
        return word_time(words, at["word"], at.get("after", scene_start)) + float(at.get("offset", 0.0))
    return scene_start + float(at.get("scene", 0.0))


# ---------------------------------------------------------------- cutting


def ink_mask(img: np.ndarray, paper: tuple[int, int, int], level: int = 60) -> np.ndarray:
    ink, acc = motion.masks(img, paper)
    return ink | acc


def region_mask(shape: tuple[int, int], region: dict) -> np.ndarray:
    """Union of rects [x0,y0,x1,y1], polys [[x,y],...] and ellipses [cx,cy,rx,ry]; minus the same under "minus"."""
    h, w = shape
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    for r in region.get("rects", []):
        d.rectangle(r, fill=255)
    for p in region.get("polys", []):
        d.polygon([tuple(v) for v in p], fill=255)
    for cx, cy, rx, ry in region.get("ellipses", []):
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    out = np.asarray(m) > 0
    if "minus" in region:
        out &= ~region_mask(shape, region["minus"])
    return out


def silhouette(img: np.ndarray, paper, region: np.ndarray, grow: int = 3) -> np.ndarray:
    """The drawing inside region: ink + accent, closed, holes filled (head discs, shirts, lenses), grown a little."""
    ink = ink_mask(img, paper) & region
    m = ndimage.binary_closing(ink, iterations=4)
    m = ndimage.binary_fill_holes(m)
    if grow:
        m = ndimage.binary_dilation(m, iterations=grow)
    return m & region


def paper_swatch(img: np.ndarray, paper, size: int = 256) -> np.ndarray:
    """The ink-free square of the still with the flattest paper, for texture fills."""
    ink = ndimage.binary_dilation(ink_mask(img, paper), iterations=6)
    h, w = ink.shape
    best, best_score = None, None
    for y in range(0, h - size, size // 2):
        for x in range(0, w - size, size // 2):
            if ink[y : y + size, x : x + size].any():
                continue
            score = float(img[y : y + size, x : x + size].std())
            if best_score is None or score < best_score:
                best, best_score = (x, y), score
    if best is None:
        return np.broadcast_to(np.array(paper, np.uint8), (size, size, 3)).copy()
    x, y = best
    return img[y : y + size, x : x + size].copy()


def tile(swatch: np.ndarray, h: int, w: int, ox: int = 0, oy: int = 0) -> np.ndarray:
    """Mirror-tile the swatch to h x w (mirroring hides the seams on random paper grain)."""
    sw = np.concatenate([swatch, swatch[:, ::-1]], axis=1)
    sw = np.concatenate([sw, sw[::-1]], axis=0)
    reps = (h // sw.shape[0] + 2, w // sw.shape[1] + 2, 1)
    big = np.tile(sw, reps)
    return big[oy % sw.shape[0] : oy % sw.shape[0] + h, ox % sw.shape[1] : ox % sw.shape[1] + w]


def paper_fill(img: np.ndarray, hole: np.ndarray, swatch: np.ndarray, feather: float = 1.5) -> np.ndarray:
    """Paint the hole with tiled paper grain, colour-matched to the paper around it, with a soft edge."""
    out = img.astype(np.float32)
    if not hole.any():
        return img.copy()
    tex = tile(swatch, *hole.shape).astype(np.float32)
    ring = ndimage.binary_dilation(hole, iterations=12) & ~ndimage.binary_dilation(hole, iterations=3)
    ring &= ~ndimage.binary_dilation(
        ink_mask(img, tuple(int(v) for v in np.median(swatch.reshape(-1, 3), 0))), iterations=2
    )
    if ring.sum() > 50:
        tex += np.median(img[ring], axis=0) - np.median(swatch.reshape(-1, 3), axis=0)
    a = ndimage.gaussian_filter(ndimage.binary_dilation(hole, iterations=1).astype(np.float32), feather)
    a = np.maximum(a, hole.astype(np.float32))
    paper = tuple(int(v) for v in np.median(swatch.reshape(-1, 3), 0))
    a[ink_mask(img, paper) & ~hole] = 0.0  # the soft edge never lightens a line the hole was cut across
    a = a[..., None]
    out = out * (1 - a) + tex * a
    return np.clip(out, 0, 255).astype(np.uint8)


def line_weight(img: np.ndarray, paper, region: np.ndarray | None = None) -> float:
    """Median stroke width (px): twice the distance-to-paper on the stroke skeleton, after closing the marker's
    speckle (without the closing the grain splits every stroke and the width reads about half)."""
    from skimage.morphology import skeletonize

    ink = (np.array(paper, dtype=np.int16) - img.astype(np.int16)).max(axis=2) > 60
    if region is not None:
        ink &= region
    ink = ndimage.binary_closing(ink, iterations=2)
    lab, n = ndimage.label(ink)
    if n:
        sizes = ndimage.sum(ink, lab, range(1, n + 1))
        ink = np.isin(lab, 1 + np.nonzero(sizes > 40)[0])
    dist = ndimage.distance_transform_edt(ink)
    vals = 2 * dist[skeletonize(ink)]
    return float(np.median(vals)) if vals.size else 0.0


# ---------------------------------------------------------------- strokes


def charcoal(
    draw_layer: Image.Image,
    pts: list[tuple[float, float]],
    width: float,
    ss: int,
    seed: int = 0,
    taper: float = 0.35,
    color=INK,
) -> None:
    """A marker stroke: round-capped, slightly tapered at the ends, width jittered a little. Points are in
    layer pixels already multiplied by ss."""
    if len(pts) < 2:
        x, y = pts[0]
        r = width * ss / 2
        ImageDraw.Draw(draw_layer).ellipse([x - r, y - r, x + r, y + r], fill=color + (255,))
        return
    rng = np.random.default_rng(seed)
    d = ImageDraw.Draw(draw_layer)
    seg = []
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        n = max(2, int(math.hypot(x1 - x0, y1 - y0) / (ss * 0.8)))
        for i in range(n):
            u = i / n
            seg.append((x0 + (x1 - x0) * u, y0 + (y1 - y0) * u))
    seg.append(pts[-1])
    m = len(seg)
    jit = ndimage.gaussian_filter1d(rng.normal(0, 0.12, m), 6)
    for i, (x, y) in enumerate(seg):
        u = i / max(1, m - 1)
        prof = 1.0 - taper * (abs(2 * u - 1) ** 3)
        r = max(0.6, width * ss / 2 * prof * (1 + jit[i]))
        d.ellipse([x - r, y - r, x + r, y + r], fill=color + (255,))


def grain(alpha: np.ndarray, seed: int) -> np.ndarray:
    """Marker texture: knock a few percent out of the stroke alpha with fine noise (fixed per stroke, no flicker)."""
    rng = np.random.default_rng(seed)
    n = ndimage.gaussian_filter(rng.random(alpha.shape).astype(np.float32), 0.7)
    n = (n - n.min()) / max(1e-6, n.max() - n.min())
    return alpha * (0.9 + 0.1 * n)


# ---------------------------------------------------------------- parts and features


@dataclass
class Part:
    name: str
    image: np.ndarray  # H x W x 4 uint8, the clean cut (features painted out)
    origin: tuple[int, int]  # top-left of image in still coordinates
    pivot: tuple[float, float]  # in still coordinates
    parent: str | None = None
    z: int = 0
    clip: str | None = None  # name of an occluder mask: the part is hidden where it is set
    features: list[dict] = field(default_factory=list)


def affine(px, py, x=0.0, y=0.0, rot=0.0, sx=1.0, sy=1.0, kx=0.0) -> np.ndarray:
    """3x3: shear, scale and rotate about the pivot (still coords), then translate. rot in degrees, clockwise on
    screen. kx shears horizontally about the pivot's row (x += kx * (pivot_y - y)): a figure leans with its feet
    on the pivot row staying put (0.03 = the top moves right 3 px per 100 px of height)."""
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    T1 = np.array([[1, 0, -px], [0, 1, -py], [0, 0, 1]], float)
    S = np.array([[sx, -kx, 0], [0, sy, 0], [0, 0, 1]], float)
    R = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], float)
    T2 = np.array([[1, 0, px + x], [0, 1, py + y], [0, 0, 1]], float)
    return T2 @ R @ S @ T1


def draw_features(part: Part, state: dict, weight: float, ss: int = 3) -> np.ndarray:
    """The part's image with its eyes / mouth / brows drawn for this frame's state."""
    img = part.image.copy()
    if not part.features:
        return img
    ox, oy = part.origin
    h, w = img.shape[:2]
    for f in part.features:
        st = state.get(f["name"], {})
        kind = f["kind"]
        fw = float(f.get("weight", weight))
        if kind == "eye":
            cx, cy = f["pupil"][0] - ox, f["pupil"][1] - oy
            prx, pry = f["pupil"][2], f["pupil"][3]
            lcx, lcy, lrx, lry = f["lens"][0] - ox, f["lens"][1] - oy, f["lens"][2], f["lens"][3]
            lid = float(st.get("lid", 0.0))
            px, py = cx + st.get("px", 0.0), cy + st.get("py", 0.0)
            # keep the pupil inside the lens
            dx, dy = (px - lcx) / max(1, lrx - prx), (py - lcy) / max(1, lry - pry)
            r = math.hypot(dx, dy)
            if r > 1:
                px, py = lcx + (px - lcx) / r, lcy + (py - lcy) / r
            bx0, by0 = int(lcx - lrx - fw * 2), int(lcy - lry - fw * 2)
            bx1, by1 = int(lcx + lrx + fw * 2) + 1, int(lcy + lry + fw * 2) + 1
            layer = Image.new("RGBA", ((bx1 - bx0) * ss, (by1 - by0) * ss), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            lid_y = (lcy - lry) + min(1.0, lid) * lry  # lid line, in part coords
            if lid < 0.999:
                d.ellipse(
                    [(px - prx - bx0) * ss, (py - pry - by0) * ss, (px + prx - bx0) * ss, (py + pry - by0) * ss],
                    fill=INK + (255,),
                )
                if lid > 0.02:  # paint the covered top of the pupil back to the lens (clean part image)
                    lay = np.asarray(layer).copy()
                    cut = int(max(0, (lid_y - by0) * ss))
                    lay[:cut, :, 3] = 0
                    layer = Image.fromarray(lay)
            if lid > 0.02:
                xs = math.sqrt(max(0.0, 1 - ((lid_y - lcy) / lry) ** 2)) * lrx * 0.92
                lw = fw * (0.8 if f.get("dot") else 0.7)
                if f.get("dot"):
                    xs = max(xs, prx * 1.6)
                pts = [
                    ((lcx - xs - bx0) * ss, (lid_y - by0 + 0.6) * ss),
                    ((lcx - bx0) * ss, (lid_y - by0 + (1.6 if lid >= 0.999 else 0)) * ss),
                    ((lcx + xs - bx0) * ss, (lid_y - by0 + 0.6) * ss),
                ]
                charcoal(layer, pts, lw, ss, seed=hash(f["name"]) % 1000)
            _paste(img, layer, bx0, by0, ss, seed=hash(f["name"]) % 997)
        elif kind in ("mouth", "brows"):
            shape = st.get("shape", f.get("default"))
            if not shape:
                continue
            strokes = f["shapes"][shape]
            ax, ay = f["at"][0] - ox, f["at"][1] - oy
            allp = [p for s in strokes for p in s]
            pad = fw * 2 + 2
            bx0 = int(ax + min(p[0] for p in allp) - pad)
            by0 = int(ay + min(p[1] for p in allp) - pad)
            bx1 = int(ax + max(p[0] for p in allp) + pad) + 1
            by1 = int(ay + max(p[1] for p in allp) + pad) + 1
            layer = Image.new("RGBA", ((bx1 - bx0) * ss, (by1 - by0) * ss), (0, 0, 0, 0))
            if f.get("fill") and (len(strokes) >= 2 or shape == "o"):  # an open mouth reads as a dark hole
                ring = [((ax + p[0] - bx0) * ss, (ay + p[1] - by0) * ss) for p in strokes[0]]
                if len(strokes) >= 2:
                    ring = (
                        _smooth(ring)
                        + _smooth([((ax + p[0] - bx0) * ss, (ay + p[1] - by0) * ss) for p in strokes[1]])[::-1]
                    )
                else:
                    ring = _smooth(ring)
                ImageDraw.Draw(layer).polygon(ring, fill=INK + (235,))
            for i, s in enumerate(strokes):
                pts = [((ax + p[0] - bx0) * ss, (ay + p[1] - by0) * ss) for p in s]
                charcoal(layer, _smooth(pts), fw, ss, seed=i + 7)
            _paste(img, layer, bx0, by0, ss, seed=hash(f["name"] + shape) % 997)
    return img


def _smooth(pts: list[tuple[float, float]], n: int = 6) -> list[tuple[float, float]]:
    """Catmull-Rom through the control points so 3-4 numbers make a hand-drawn curve."""
    if len(pts) < 3:
        return pts
    P = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            out.append(
                tuple(
                    0.5
                    * (
                        (2 * p1[j])
                        + (-p0[j] + p2[j]) * t
                        + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                        + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t**3
                    )
                    for j in range(2)
                )
            )
    out.append(pts[-1])
    return out


def _paste(img: np.ndarray, layer: Image.Image, bx0: int, by0: int, ss: int, seed: int) -> None:
    """Downsample a supersampled stroke layer and lay it over the part image (in place)."""
    w, h = layer.size[0] // ss, layer.size[1] // ss
    small = np.asarray(layer.resize((w, h), Image.LANCZOS)).astype(np.float32)
    a = grain(small[..., 3] / 255.0, seed)
    H, W = img.shape[:2]
    x0, y0 = max(0, bx0), max(0, by0)
    x1, y1 = min(W, bx0 + w), min(H, by0 + h)
    if x1 <= x0 or y1 <= y0:
        return
    a = a[y0 - by0 : y1 - by0, x0 - bx0 : x1 - bx0][..., None]
    rgb = small[y0 - by0 : y1 - by0, x0 - bx0 : x1 - bx0, :3]
    dst = img[y0:y1, x0:x1].astype(np.float32)
    dst[..., :3] = dst[..., :3] * (1 - a) + rgb * a
    dst[..., 3] = np.maximum(dst[..., 3], a[..., 0] * 255)
    img[y0:y1, x0:x1] = dst.astype(np.uint8)


def place(frame: np.ndarray, rgba: np.ndarray, M: np.ndarray, origin: tuple[int, int], hide: np.ndarray | None) -> None:
    """Composite a part (image whose top-left is `origin` in still coords) through the 3x3 matrix M, in place."""
    h, w = rgba.shape[:2]
    ox, oy = origin
    corners = np.array([[ox, oy, 1], [ox + w, oy, 1], [ox, oy + h, 1], [ox + w, oy + h, 1]], float).T
    tc = M @ corners
    H, W = frame.shape[:2]
    bx0, by0 = max(0, int(math.floor(tc[0].min())) - 1), max(0, int(math.floor(tc[1].min())) - 1)
    bx1, by1 = min(W, int(math.ceil(tc[0].max())) + 1), min(H, int(math.ceil(tc[1].max())) + 1)
    if bx1 <= bx0 or by1 <= by0:
        return
    # output pixel (u,v) in bbox -> still coords (u+bx0, v+by0) -> M^-1 -> image coords minus origin
    Minv = np.linalg.inv(M)
    A = (
        np.array([[1, 0, -ox], [0, 1, -oy], [0, 0, 1]], float)
        @ Minv
        @ np.array([[1, 0, bx0], [0, 1, by0], [0, 0, 1]], float)
    )
    im = Image.fromarray(rgba, "RGBA")
    if np.allclose(A[:2, :2], np.eye(2)) and np.allclose(A[:2, 2], np.round(A[:2, 2])):
        out = im.transform((bx1 - bx0, by1 - by0), Image.AFFINE, tuple(A[:2].ravel()), resample=Image.NEAREST)
    else:
        out = im.transform((bx1 - bx0, by1 - by0), Image.AFFINE, tuple(A[:2].ravel()), resample=Image.BICUBIC)
    o = np.asarray(out).astype(np.float32)
    a = o[..., 3:4] / 255.0
    if hide is not None:
        a = a * (~hide[by0:by1, bx0:bx1])[..., None]
    dst = frame[by0:by1, bx0:bx1].astype(np.float32)
    frame[by0:by1, bx0:bx1] = (dst * (1 - a) + o[..., :3] * a).astype(np.uint8)


# ---------------------------------------------------------------- channels

DEFAULTS = {"x": 0.0, "y": 0.0, "rot": 0.0, "sx": 1.0, "sy": 1.0, "px": 0.0, "py": 0.0, "lid": 0.0, "kx": 0.0}


@dataclass
class Key:
    target: str
    start: float
    dur: float
    to: dict
    ease: str = "inout"


def channel_state(keys: list[Key], t: float, base: dict[str, dict]) -> dict[str, dict]:
    """Every target's channels at time t: keys applied in start order, each easing from the value the previous
    keys left, with time stepped on twos from the key's own start. Non-numeric channels (shapes) switch at start."""
    state = {k: dict(v) for k, v in base.items()}
    for k in sorted(keys, key=lambda k: k.start):
        tl = stepped(t, k.start)
        if tl < 0:
            continue
        st = state.setdefault(k.target, {})
        te = tl + 1.0 / POSE_HZ  # a held step shows where the move is at the end of the step, so the
        u = te / k.dur if k.dur > 0 else 1.0  # frame on the word already moves (no dead first step)
        e = ease(k.ease, u, te)
        for ch, v in k.to.items():
            if isinstance(v, str):
                st[ch] = v
                continue
            v0 = st.get(ch, DEFAULTS.get(ch, 0.0))
            st[ch] = v0 + (v - v0) * e
    return state


MOUTH_QUIET, MOUTH_WIDE = 0.15, 0.55  # envelope / line peak: below QUIET closed, above WIDE open


def load_audio_mono(path: str | Path, sr: int = 48000) -> np.ndarray:
    """A wav/mp3 as float32 mono samples (ffmpeg decodes anything)."""
    import subprocess

    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def mouth_envelope(samples: np.ndarray, sr: int, hz: float = POSE_HZ) -> np.ndarray:
    """RMS loudness per pose step (1/hz s): one value per held mouth pose."""
    n = int(round(sr / hz))
    steps = max(1, int(math.ceil(len(samples) / n)))
    pad = np.zeros(steps * n, np.float32)
    pad[: len(samples)] = samples
    return np.sqrt((pad.reshape(steps, n) ** 2).mean(axis=1))


def talk_keys(target: str, env: np.ndarray, t0: float, hz: float = POSE_HZ) -> list[Key]:
    """Mouth flaps for one spoken line: each step's loudness against the line's own peak picks closed / small /
    open; only changes become keys (snaps), and the mouth closes when the line ends. Driven by the speaker's own
    audio, so a listener's mouth never moves."""
    peak = float(np.percentile(env, 95)) if len(env) else 0.0
    keys: list[Key] = []
    last = None
    for i, v in enumerate(env):
        r = v / peak if peak > 1e-9 else 0.0
        shape = "closed" if r < MOUTH_QUIET else ("small" if r < MOUTH_WIDE else "open")
        if shape != last:
            keys.append(Key(target, t0 + i / hz, 0.0, {"shape": shape}, "snap"))
            last = shape
    keys.append(Key(target, t0 + len(env) / hz, 0.0, {"shape": "closed"}, "snap"))
    return keys


def mouth_shapes(w: float) -> dict[str, list[list[list[float]]]]:
    """Generic hand-drawn mouths, `w` px wide, centred on (0, 0): a closed smile line, a small and an open lens
    (two strokes), and a round "o". Stroke lists for a "mouth" feature."""
    h = w / 2

    def lens(half_w: float, depth: float) -> list[list[list[float]]]:
        return [[[-half_w, 0], [0, -depth * 0.35], [half_w, 0]], [[-half_w, 0], [0, depth], [half_w, 0]]]

    o = [[round(w * 0.22 * math.cos(a), 2), round(w * 0.28 * math.sin(a), 2)] for a in np.linspace(0, 2 * math.pi, 9)]
    return {
        "closed": [[[-h, 0], [0, w * 0.06], [h, 0]]],
        "small": lens(h * 0.85, w * 0.2),
        "open": lens(h * 0.8, w * 0.42),
        "o": [o],
    }


def expand(actions: list[dict], words: list[dict], scene_start: float) -> list[Key]:
    """Scene actions -> keys. Kinds: {"pose": target, "to": {...}} | {"blink": [targets]} (3-frame close,
    2-frame open) | {"bob": target, "to": {...}, "hold": s} (there and back)."""
    keys: list[Key] = []
    for a in actions:
        t0 = resolve_at(a["at"], words, scene_start)
        if "blink" in a:
            for tg in a["blink"]:
                keys.append(Key(tg, t0, 0.0, {"lid": 1.0}, "snap"))
                keys.append(Key(tg, t0 + 0.1, 0.0, {"lid": float(a.get("rest", 0.0))}, "snap"))
        elif "talk" in a:
            sr = 48000
            keys.extend(talk_keys(a["talk"], mouth_envelope(load_audio_mono(a["audio"], sr), sr), t0))
        elif "bob" in a:
            hold = float(a.get("hold", 0.13))
            back = {ch: float(a.get("rest", {}).get(ch, DEFAULTS.get(ch, 0.0))) for ch in a["to"]}
            keys.append(Key(a["bob"], t0, float(a.get("dur", 0.1)), a["to"], a.get("ease", "out")))
            keys.append(
                Key(a["bob"], t0 + hold, float(a.get("back_dur", 0.25)), back, a.get("back_ease", "spring:260:14"))
            )
        else:
            keys.append(Key(a["pose"], t0, float(a.get("dur", 0.3)), a["to"], a.get("ease", "inout")))
    return keys


def idle(targets: dict[str, dict], t: float) -> dict[str, dict]:
    """Breathing: a 1-2 px bob per part, held on twos (keeps holds alive without sliding). "ch" picks the channel
    (default "y"; "sy" breathes a grounded figure from its feet, amp then a fraction: 0.004 = 0.4 %)."""
    out = {}
    tq = math.floor(t * POSE_HZ) / POSE_HZ
    for name, spec in targets.items():
        amp, period, phase = spec.get("amp", 1.5), spec.get("period", 3.2), spec.get("phase", 0.0)
        out[name] = {spec.get("ch", "y"): amp * math.sin(2 * math.pi * (tq / period + phase))}
    return out


def boil_like_compose(frame: np.ndarray, paper, t: float, amp: float, seed: int, prescale: float = 1.16) -> np.ndarray:
    """compose.py boils a still kept 1.16x larger and then downsamples it; doing the same here gives the puppet
    frame the identical line texture (boiling at 1x leaves single-pixel paper specks along every line)."""
    h, w = frame.shape[:2]
    big = np.asarray(Image.fromarray(frame).resize((int(w * prescale), int(h * prescale)), Image.BICUBIC))
    _, acc = motion.masks(big, paper)
    dark = (np.array(paper, dtype=np.int16) - big.astype(np.int16)).max(axis=2) > 40
    ink = ndimage.binary_closing(dark & ~acc, iterations=1)  # whole strokes, not their grain, get lifted
    out = motion.boil(big, ink, t, amp=amp, seed=seed)
    return np.array(Image.fromarray(out).resize((w, h), Image.BILINEAR))  # writable: overlays draw in place


def load_json(p: Path) -> dict:
    return json.loads(Path(p).read_text())


# ---------------------------------------------------------------- jitter and wipes (video 3)


def jitter(spec: dict, t: float, t_from: float, t_to: float, seed: int = 0) -> dict:
    """Shiver / shake / flame lick: random offsets re-rolled every 1/hz s, counted from t_from (so the first
    changed frame is on the word), zero outside [t_from, t_to). Amplitudes per channel: x, y, rot in px/deg,
    sx, sy as fractions (0.05 = +-5 %). "grow": true keeps sx/sy >= 1 (a flame that never uncovers its hole).
    "ramp" seconds fades the amplitude in and out at the window's ends; "alt": true swings side to side."""
    if t < t_from or t >= t_to:
        return {}
    hz = float(spec.get("hz", POSE_HZ))
    step = int(math.floor((t - t_from) * hz + 1e-6))
    rng = np.random.default_rng(seed * 7919 + step)
    ramp = float(spec.get("ramp", 0.0))
    env = 1.0
    if ramp > 0:
        tq = step / hz + 1.0 / hz
        env = min(1.0, tq / ramp, max(0.0, (t_to - t_from - step / hz) / ramp))
    out = {}
    for ch in ("x", "y", "rot", "sx", "sy"):
        a = float(spec.get(ch, 0.0))
        if not a:
            continue
        if spec.get("alt"):  # rhythmic: alternate sides every step (a scratch, a rocking), size varies a little
            u = (1 if step % 2 == 0 else -1) * rng.uniform(0.6, 1.0)
        elif spec.get("grow") and ch in ("sx", "sy"):
            u = rng.uniform(0, 1)
        else:
            u = rng.uniform(-1, 1)
        out[ch] = u * a * env
    return out


def wipe_alpha(order: np.ndarray, kind: str, prog: float, soft: float = 0.08) -> np.ndarray:
    """Per-pixel visibility of the still for a wipe at progress prog in [0,1]. order in [0,1] (radial / linear /
    trace): "in" draws on from order 0 to 1 with a soft front; "out" erases in the same order."""
    a = np.clip((prog * (1 + soft) - order) / soft, 0.0, 1.0)
    return a if kind == "in" else 1.0 - a


def wave_alpha(waves: np.ndarray, kind: str, t: float, starts: list[float], dur: float) -> np.ndarray:
    """waves: per-pixel wave index (-1 = not in the wipe). Each wave fades over dur from its own start, stepped
    on twos from that start (the frame on the word already moves)."""
    a = np.ones(waves.shape, np.float32) if kind == "out" else np.zeros(waves.shape, np.float32)
    for i, t0 in enumerate(starts):
        tl = stepped(t, t0)
        if tl < 0:
            continue
        u = min(1.0, (tl + 1.0 / POSE_HZ) / max(dur, 1e-6))
        a[waves == i] = (1.0 - u) if kind == "out" else u
    return a


def component_waves(mask: np.ndarray, centre: tuple[float, float], n: int, link: int = 6) -> np.ndarray:
    """Group the mask into figures (connected after dilating by `link` px) and give each a wave index 0..n-1,
    farthest from centre first (a crowd thinning from the edges in). -1 outside the mask."""
    lab, k = ndimage.label(ndimage.binary_dilation(mask, iterations=link))
    out = np.full(mask.shape, -1, np.int16)
    if not k:
        return out
    cents = ndimage.center_of_mass(mask, lab, range(1, k + 1))
    d = np.array([math.hypot(cx - centre[0], cy - centre[1]) if not math.isnan(cy) else 0.0 for cy, cx in cents])
    rank = np.argsort(np.argsort(-d))  # 0 = farthest
    wave = (rank * n // max(1, k)).astype(np.int16)
    lut = np.concatenate([[-1], wave])
    out = lut[lab]
    out[~mask] = -1
    return out


def smooth_fill(img: np.ndarray, hole: np.ndarray, swatch: np.ndarray, sigma: float = 6.0) -> np.ndarray:
    """Fill a hole from its surroundings (normalised convolution at growing scales), then lay the paper's own grain
    back on. Unlike paper_fill it follows shading (a grey ground shadow), so faint figures can vanish from it."""
    known = ~ndimage.binary_dilation(hole, iterations=2)
    out = img.astype(np.float32).copy()
    todo = ~known
    s = sigma
    while todo.any() and s < 200:
        w = ndimage.gaussian_filter(known.astype(np.float32), s)
        for c in range(3):
            v = ndimage.gaussian_filter(np.where(known, img[..., c], 0).astype(np.float32), s)
            fill = v / np.maximum(w, 1e-6)
            out[..., c] = np.where(todo & (w > 0.05), fill, out[..., c])
        todo &= ~(w > 0.05)
        s *= 2
    tex = tile(swatch, *hole.shape).astype(np.float32)
    tex -= ndimage.gaussian_filter(tex, (4, 4, 0))  # grain only, no tint
    a = ndimage.gaussian_filter(hole.astype(np.float32), 1.0)[..., None]
    res = img.astype(np.float32) * (1 - a) + (out + tex) * a
    return np.clip(res, 0, 255).astype(np.uint8)
