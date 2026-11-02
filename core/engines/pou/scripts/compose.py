#!/usr/bin/env python3
"""Compose the stickman-explainer edit from a scene plan, narration word timings and assets.

Layers, bottom to top:
  1. base: a still (assets/stills/<scene>.png) or a hero clip (assets/clips/<scene>.mp4) for every
     scene that introduces an asset; continuation scenes reuse the previous asset. Every new still
     draws on with a jittered ink reveal; every group gets a slow push-in or pull-out, with a small
     extra push at each continuation boundary so each planned change is visible.
  2. overlays: handwriting-font labels, numbers, cards and chapter titles from overlays.json, timed
     to the narration words (anchor phrases), written on left to right.
Audio: narration, a music bed ducked under the voice, pencil / page / sting effects at reveals and
section turns, then loudness-normalised. Captions are written as an SRT sidecar; long-form never burns
them in. Shorts (--size 1080x1920 --burn-captions) burn short caption lines into the lower middle, and
any still whose aspect differs from the frame is cover-cropped from the centre, never stretched.

Everything is driven by the word timings, so a new narration only needs faster-whisper re-run and
scene_plan_from_script.py; overlays retime themselves.
"""
from __future__ import annotations

import argparse
import json
import math
import random
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import motion  # noqa: E402

PAPER = (0xF6, 0xF1, 0xE7)
INK = (0x2B, 0x2B, 0x2B)
COLORS = {"ink": INK, "rust": (0xB5, 0x53, 0x3C), "ochre": (0xD9, 0xA4, 0x41), "teal": (0x3A, 0x7D, 0x7B),
          "muted": (0x8A, 0x83, 0x78)}
FONT_CANDIDATES = [
    Path(__file__).resolve().parent.parent / "channel" / "fonts" / "PatrickHand-Regular.ttf",
    Path("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf"),
]
PRESCALE = 1.16          # sources are kept this much larger than the frame so push-ins never upsample
REVEAL_SECONDS = 0.9
BOUNDARY_PUSH = 0.022    # extra zoom at each continuation boundary
BOUNDARY_EASE = 0.45
CLIP_RATE = 0.75         # hero clips play slower than real time (subtle motion reads better)
                         # motion.json "clip_rate" overrides it per scene (puppet clips are timed to the words: 1.0)
PENCIL_CLASSES = {"illustration", "diagram", "character"}
VERTICAL_TEXT = 1.5      # 9:16 overlay text scale vs 16:9 (labels read too small on a phone at 1.0)


# ---------------------------------------------------------------- plan -> groups

@dataclass
class Group:
    scene_id: str
    start: float
    end: float
    klass: str
    boundaries: list[float] = field(default_factory=list)   # continuation scene starts inside the group
    still: Path | None = None
    clip: Path | None = None
    section: str = ""
    punches: list = field(default_factory=list)   # (time, focus [fx, fy] | None) camera punch-ins


def build_groups(plan: dict, stills: Path, clips: Path | None, until: float | None = None) -> list[Group]:
    """One group per scene that has an asset on disk; following scenes without one extend it."""
    classes = plan.get("metadata", {}).get("change_classes", {})
    groups: list[Group] = []
    for s in sorted(plan["scenes"], key=lambda x: x["start_seconds"]):
        if until is not None and s["start_seconds"] >= until:
            break
        end = min(s["end_seconds"], until) if until is not None else s["end_seconds"]
        still = stills / f"{s['id']}.png"
        clip = (clips / f"{s['id']}.mp4") if clips else None
        if still.exists():
            g = Group(s["id"], s["start_seconds"], end, classes.get(s["id"], "illustration"),
                      still=still, clip=clip if clip and clip.exists() else None,
                      section=s.get("script_section_id", ""))
            groups.append(g)
        elif groups:
            groups[-1].boundaries.append(s["start_seconds"])
            groups[-1].end = end
    return groups


# ---------------------------------------------------------------- words -> overlay timing

_norm_re = re.compile(r"[^a-z0-9$.]+")


def _norm(tok: str) -> str:
    return _norm_re.sub("", tok.lower()).strip(".")


_NUMBER_WORDS = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7",
                 "eight": "8", "nine": "9", "ten": "10", "eleven": "11", "twelve": "12", "thirteen": "13",
                 "fourteen": "14", "fifteen": "15", "sixteen": "16", "seventeen": "17", "eighteen": "18",
                 "nineteen": "19", "twenty": "20", "thirty": "30", "forty": "40", "fifty": "50", "sixty": "60",
                 "seventy": "70", "eighty": "80", "ninety": "90"}
_chunk_re = re.compile(r"[a-z0-9]+")


def _chunks(tok: str) -> list[str]:
    """Alphanumeric pieces of a token, number words as digits: '-30%.' -> ['30'], 'eight' -> ['8']."""
    return [_NUMBER_WORDS.get(c, c) for c in _chunk_re.findall(tok.lower().replace("\u2019", "'"))]


def find_phrase(words: list[dict], phrase: str, not_before: float = 0.0) -> tuple[float, float] | None:
    """(start, end) of the first occurrence of phrase (as spoken tokens) at or after not_before.

    Matching is on alphanumeric chunks with number words read as digits, and a digit chunk in the
    phrase may span several consecutive digit chunks in the transcript ("2000" == "2" ",000"), so
    the same anchor works whether the transcriber wrote "eight hours", "8 hours" or "2,000".
    """
    target = [c for t in phrase.split() for c in _chunks(t)]
    if not target:
        return None
    stream = [(c, i) for i, w in enumerate(words) for c in _chunks(w["word"])]
    for s0 in range(len(stream)):
        if words[stream[s0][1]]["start"] < not_before - 0.05:
            continue
        si, ti = s0, 0
        while ti < len(target) and si < len(stream):
            c = stream[si][0]
            if c == target[ti]:
                si += 1; ti += 1
            elif target[ti].isdigit() and c.isdigit() and target[ti].startswith(c):
                acc, sj = c, si + 1
                while sj < len(stream) and stream[sj][0].isdigit() and len(acc) < len(target[ti]):
                    acc += stream[sj][0]; sj += 1
                if acc != target[ti]:
                    break
                si, ti = sj, ti + 1
            else:
                break
        if ti == len(target):
            return words[stream[s0][1]]["start"], words[stream[si - 1][1]]["end"]
    return None


@dataclass
class Overlay:
    spec: dict
    start: float
    end: float
    image: Image.Image | None = None
    x: int = 0
    y: int = 0
    rot: float = 0.0


QUIZ_RING_SECONDS = 3.0
QUIZ_POP_GAP = 0.3
QUIZ_MIN_COUNTDOWN = 1.0   # least ring time a quiz needs, else it is skipped


def quiz_parts(spec: dict, ask_end: float, reveal: float, end: float) -> list[tuple[dict, float, float]]:
    """A quiz as plain overlay parts: cards pop in one by one on the board, a ring closes over 3 s with 3-2-1,
    and at the reveal the right card gets a drawn circle; wrong cards are struck, or fade if listed in `fade`."""
    x0, y0, x1, y1 = spec["board"]
    cards, ans, fade = spec["cards"], int(spec["answer"]), set(spec.get("fade", []))
    n = len(cards)
    base = {"quiz": spec["id"], "scene": spec["scene"]}
    cy, ry = y0 + 0.36 * (y1 - y0), y0 + 0.80 * (y1 - y0)
    ring_pos = list(spec.get("ring_pos") or [(x0 + x1) / 2, ry])   # override when the board's foot is busy
    xs = [x0 + (x1 - x0) * (i + 0.5) / n for i in range(n)]
    out: list[tuple[dict, float, float]] = []
    t_ring = ask_end + 0.1
    for i, (text, x) in enumerate(zip(cards, xs)):
        t = t_ring + i * QUIZ_POP_GAP
        stop = reveal + 0.6 if i in fade and i != ans else end
        out.append(({**base, "kind": "card", "text": text, "pos": [x, cy], "sfx": "pop"}, t, stop))
        if i != ans and i not in fade:
            out.append(({**base, "kind": "cross", "text": text, "pos": [x, cy]}, reveal + 0.15, end))
    d0 = t_ring + (n - 1) * QUIZ_POP_GAP + 0.15                   # ring and 3-2-1 start after the last card pop
    ring_end = min(d0 + QUIZ_RING_SECONDS, reveal - 0.3)
    d0 = min(d0, ring_end)
    out.append(({**base, "kind": "ring", "w": 170, "h": 170, "pos": ring_pos}, d0, ring_end))
    step = (ring_end - d0) / 3
    for k, d in enumerate("321"):
        out.append(({**base, "kind": "number", "size": 96, "text": d, "pos": ring_pos, "sfx": "tick"},
                    d0 + k * step, d0 + (k + 1) * step))
    out.append(({**base, "kind": "circle", "text": cards[ans], "pos": [xs[ans], cy], "sfx": "sting", "color": "ochre",
                 "focus": [xs[ans], cy]},
                reveal, end))
    if spec.get("note"):
        out.append(({**base, "kind": "label", "size": 50, "color": "rust", "text": spec["note"],
                     "pos": list(spec.get("note_pos") or [xs[ans], y0 + 0.88 * (y1 - y0)])}, reveal + 0.4, end))
    return out


def resolve_overlays(specs: list[dict], words: list[dict], groups: list[Group], until: float | None) -> list[Overlay]:
    by_scene = {g.scene_id: g for g in groups}
    out: list[Overlay] = []
    for spec in specs:
        g = by_scene.get(spec.get("scene", ""))
        if g is None:
            continue
        if spec.get("kind") == "quiz":
            ask_a, rev_a = spec.get("ask_anchor"), spec.get("reveal_anchor")
            a = find_phrase(words, ask_a, not_before=g.start - 1.0) if ask_a else None
            r = find_phrase(words, rev_a, not_before=(a[1] if a else g.start)) if rev_a and a else None
            if a is None or r is None:
                print(f"warn: quiz {spec.get('id')} anchors missing or not found; skipped", file=sys.stderr)
                continue
            if (r[0] - 0.1) < a[1] + 0.1 + QUIZ_MIN_COUNTDOWN:
                print(f"warn: quiz {spec.get('id')} too short for the countdown; skipped", file=sys.stderr)
                continue
            for part, s0, s1 in quiz_parts(spec, a[1], r[0] - 0.1, g.end):
                if until is None or s0 < until:
                    out.append(Overlay(part, s0, s1 if until is None else min(s1, until)))
            continue
        t0 = g.start
        if "anchor" in spec:
            hit = find_phrase(words, spec["anchor"], not_before=g.start - 1.0)
            if hit is None:
                print(f"warn: anchor {spec['anchor']!r} not found for {spec.get('id', spec.get('text'))}; using scene start",
                      file=sys.stderr)
            else:
                t0 = hit[0] - float(spec.get("lead", 0.15))
        t0 += float(spec.get("offset", 0.0))
        t0 = max(t0, g.start)
        hold = spec.get("hold")
        t1 = g.end if hold in (None, "scene") else t0 + float(hold)
        if until is not None:
            t1 = min(t1, until)
        if t1 > t0:
            out.append(Overlay(spec, t0, t1))
    return out


# ---------------------------------------------------------------- overlay drawing

def load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_CANDIDATES:
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def _wobbly_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color, width: int, rng: random.Random):
    x0, y0, x1, y1 = box
    pts = []
    for (ax, ay), (bx, by) in [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]:
        for k in range(8):
            f = k / 8
            pts.append((ax + (bx - ax) * f + rng.uniform(-2, 2), ay + (by - ay) * f + rng.uniform(-2, 2)))
    pts.append(pts[0])
    draw.line(pts, fill=color, width=width, joint="curve")


def render_overlay(spec: dict, W: int, H: int, rng: random.Random) -> Image.Image:
    kind = spec.get("kind", "label")
    if kind in ("ring", "circle", "cross"):
        return _render_mark(spec, W, H, rng)
    color = COLORS.get(spec.get("color", "ink"), INK)
    scale = min(W, H) / 1080 * (VERTICAL_TEXT if H > W else 1.0)   # Shorts are read on a phone
    size = int(spec.get("size", {"label": 68, "number": 150, "card": 60, "chapter": 48, "strike": 96,
                                 "caption": 72}.get(kind, 68)) * scale)
    font = load_font(size)
    pad = int(18 * scale)
    text = spec.get("text", "")
    caption = spec.get("caption", "")
    cap_font = load_font(int(size * 0.42)) if caption else None

    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    tw, th = tmp.textbbox((0, 0), text, font=font, stroke_width=max(3, int(6 * scale)))[2:]   # multi-line cards too
    cw, ch = (tmp.textbbox((0, 0), caption, font=cap_font)[2:] if caption else (0, 0))
    w = max(tw, cw) + 2 * pad + (int(40 * scale) if kind == "chapter" else 0)
    h = th + (ch + int(6 * scale) if caption else 0) + 2 * pad
    img = Image.new("RGBA", (w + 8, h + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    halo = (*PAPER, 235)
    if kind == "caption":   # translucent paper pill: legible over busy drawings, the drawing still shows through
        d.rounded_rectangle((2, 2, w + 4, h + 4), radius=int(28 * scale), fill=(*PAPER, 205))
    if kind == "card":
        d.rectangle((4, 4, w + 2, h + 2), fill=(*PAPER, 245))
        _wobbly_rect(d, (6, 6, w, h), (*color, 255), max(3, int(4 * scale)), rng)
    tx = pad + 4 + (int(40 * scale) if kind == "chapter" else 0)
    if kind == "chapter":
        d.line((pad + 2, pad + th // 2 + 4, pad + int(28 * scale), pad + th // 2 + 4), fill=(*COLORS["ochre"], 255),
               width=max(3, int(5 * scale)))
    d.text((tx, pad + 4), text, font=font, fill=(*color, 255), stroke_width=max(3, int(6 * scale)), stroke_fill=halo)
    if caption:
        d.text((tx, pad + 4 + th + int(6 * scale)), caption, font=cap_font, fill=(*COLORS["muted"], 255),
               stroke_width=max(2, int(4 * scale)), stroke_fill=halo)
    if kind == "strike":
        y = pad + 4 + th * 0.55
        pts = [(tx - 6 + k * (tw + 12) / 6, y + rng.uniform(-4, 4) * scale - (k - 3) * 2 * scale) for k in range(7)]
        d.line(pts, fill=(*COLORS["rust"], 255), width=max(4, int(7 * scale)), joint="curve")
    return img


def _render_mark(spec: dict, W: int, H: int, rng: random.Random) -> Image.Image:
    """Hollow pencil marks: the countdown ring, the reveal circle round the right card, a cross over a wrong one.
    circle/cross take their size from the card text they mark."""
    kind = spec["kind"]
    scale = min(W, H) / 1080
    if kind == "ring":
        w = h = int(spec.get("w", 170) * scale)
    else:
        card = render_overlay({"kind": "card", "text": spec["text"]}, W, H, random.Random(0))
        w, h = card.width + int(40 * scale), card.height + int(30 * scale)
    img = Image.new("RGBA", (w + 8, h + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lw = max(4, int(7 * scale))
    col = (*COLORS.get(spec.get("color", "rust" if kind == "cross" else "ink"), INK), 255)
    if kind == "cross":
        d.line([(8, h * 0.8), (w * 0.5, h * 0.45 + rng.uniform(-4, 4)), (w - 8, h * 0.2)], fill=col, width=lw + 2, joint="curve")
    else:
        pts = []
        for k in range(73):
            a = -math.pi / 2 + 2 * math.pi * k / 72 * (1.04 if kind == "circle" else 1.0)
            rr = 1 + (rng.uniform(-0.015, 0.015) if kind == "circle" else 0)
            pts.append((4 + w / 2 + (w / 2 - lw) * rr * math.cos(a), 4 + h / 2 + (h / 2 - lw) * rr * math.sin(a)))
        d.line(pts, fill=col, width=lw, joint="curve")
    return img


def place_overlays(ovs: list[Overlay], W: int, H: int, seed: int = 7) -> None:
    rng = random.Random(seed)
    for ov in ovs:
        ov.image = render_overlay(ov.spec, W, H, rng)
        fx, fy = ov.spec.get("pos", [0.5, 0.12])
        ov.x = int(fx * W - ov.image.width / 2)
        ov.y = int(fy * H - ov.image.height / 2)
        r = rng.uniform(-1.6, 1.6)   # always drawn, so the rng sequence stays stable
        ov.rot = 0.0 if ov.spec.get("kind") in ("ring", "circle") else r
        if ov.rot:
            ov.image = ov.image.rotate(ov.rot, resample=Image.BICUBIC, expand=True)


def overlay_alpha(ov: Overlay, t: float) -> tuple[float, float]:
    """(global alpha, write-on fraction) at time t."""
    kind = ov.spec.get("kind", "label")
    if kind == "caption":            # burnt-in captions cut on and off with the words
        on = 1.0 if ov.start <= t < ov.end else 0.0
        return on, 1.0
    write = {"strike": 0.25, "ring": max(0.1, ov.end - ov.start), "circle": 0.45, "cross": 0.25}.get(kind, 0.35)
    a_in = min(1.0, (t - ov.start) / 0.12) if t >= ov.start else 0.0
    a_out = min(1.0, (ov.end - t) / 0.25)
    frac = min(1.0, max(0.0, (t - ov.start) / write))
    return max(0.0, min(a_in, a_out)), (frac if kind == "ring" else _ease(frac))


PUNCH = 0.08            # extra zoom at the peak of a punch-in


def punch_env(dt: float) -> float:
    """0 before the punch, eases to 1 by 0.15 s, decays back to 0 by 1.0 s."""
    if dt < 0 or dt >= 1.0:
        return 0.0
    if dt < 0.15:
        return _ease(dt / 0.15)
    return 1.0 - _ease((dt - 0.15) / 0.85)


def attach_punches(groups: list[Group], overlays: list[Overlay]) -> list[Overlay]:
    """Register a punch-in at every quiz reveal circle and `punch` item; return overlays without the punch items."""
    kept = []
    for ov in overlays:
        kind = ov.spec.get("kind")
        if kind in ("circle", "punch"):
            g = next((g for g in groups if g.start <= ov.start < g.end), None)
            if g is not None:
                g.punches.append((ov.start, ov.spec.get("focus")))
        if kind != "punch":
            kept.append(ov)
    return kept


def _ease(x: float) -> float:
    return x * x * (3 - 2 * x)


def composite(frame: np.ndarray, ov: Overlay, alpha: float, frac: float) -> None:
    im = ov.image
    H, W = frame.shape[:2]
    x0, y0 = ov.x, ov.y
    x1, y1 = min(W, x0 + im.width), min(H, y0 + im.height)
    sx, sy = max(0, -x0), max(0, -y0)
    x0, y0 = max(0, x0), max(0, y0)
    if x1 <= x0 or y1 <= y0:
        return
    arr = np.asarray(im, dtype=np.float32)[sy:sy + (y1 - y0), sx:sx + (x1 - x0)]
    a = arr[..., 3:4] / 255.0 * alpha
    if frac < 1.0:
        if ov.spec.get("kind") in ("ring", "circle"):   # draw on clockwise from 12 o'clock
            hh, ww = im.height, im.width
            yy, xx = np.mgrid[0:hh, 0:ww]
            ang = (np.arctan2(xx - ww / 2, -(yy - hh / 2)) % (2 * np.pi)) / (2 * np.pi)
            edge = (ang < frac).astype(np.float32)[sy:sy + (y1 - y0), sx:sx + (x1 - x0), None]
        else:            # write-on: reveal left to right with a soft edge
            cols = np.arange(arr.shape[1], dtype=np.float32) / max(1, arr.shape[1] - 1)
            edge = np.clip((frac * 1.15 - cols) / 0.15, 0, 1)[None, :, None]
        a = a * edge
    region = frame[y0:y1, x0:x1].astype(np.float32)
    frame[y0:y1, x0:x1] = (region * (1 - a) + arr[..., :3] * a).astype(np.uint8)


# ---------------------------------------------------------------- base sources

def cover(img: Image.Image, w: int, h: int) -> tuple[Image.Image, float, int, int]:
    """Resize to cover w x h and crop the centre: (image, scale, crop x offset, crop y offset) in scaled pixels."""
    k = max(w / img.width, h / img.height)
    sw, sh = max(w, round(img.width * k)), max(h, round(img.height * k))
    ox, oy = (sw - w) // 2, (sh - h) // 2
    return img.resize((sw, sh), Image.LANCZOS).crop((ox, oy, ox + w, oy + h)), k, ox, oy


def _shift_motion(spec: dict, ox: int, oy: int) -> dict:
    out = dict(spec)
    if "box" in spec:
        x0, y0, x1, y1 = spec["box"]
        out["box"] = (x0 - ox, y0 - oy, x1 - ox, y1 - oy)
    if "path" in spec:
        out["path"] = [(x - ox, y - oy) for x, y in spec["path"]]
    return out


def paper_color(img: np.ndarray) -> tuple[int, int, int]:
    border = np.concatenate([img[:8].reshape(-1, 3), img[-8:].reshape(-1, 3), img[:, :8].reshape(-1, 3), img[:, -8:].reshape(-1, 3)])
    return tuple(int(v) for v in np.median(border, axis=0))


def reveal_order(h: int, w: int, seed: int) -> np.ndarray:
    """Per-pixel reveal order in [0,1]: a diagonal sweep with blurred jitter, so ink appears like strokes."""
    rng = np.random.default_rng(seed)
    noise = rng.random((h // 24 + 2, w // 24 + 2)).astype(np.float32)
    noise = np.asarray(Image.fromarray((noise * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR), dtype=np.float32) / 255
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    order = 0.78 * xs / w + 0.22 * ys / h + 0.14 * noise
    order -= order.min()
    return order / order.max()


class Source:
    """Frames of a still or a hero clip, pre-scaled, with push-in and reveal applied on request."""

    def __init__(self, g: Group, W: int, H: int, scratch: Path, idx: int, motion_spec: dict | None = None):
        self.g, self.W, self.H = g, W, H
        self.pw, self.ph = int(W * PRESCALE), int(H * PRESCALE)
        self.idx = idx
        self.frames: list[Path] = []
        self.mcache: dict = {}
        self.reveal_seconds = REVEAL_SECONDS
        self.clip_rate = float(motion_spec.get("clip_rate", CLIP_RATE)) if motion_spec else CLIP_RATE
        if g.clip:
            st = g.clip.stat()   # a re-rendered clip gets fresh frames, never the cached ones of an older file
            d = scratch / f"clip_{g.scene_id}_{st.st_size}_{int(st.st_mtime)}"
            d.mkdir(parents=True, exist_ok=True)
            if not any(d.glob("*.jpg")):
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(g.clip),
                                "-vf", f"scale={self.pw}:{self.ph}:force_original_aspect_ratio=increase,crop={self.pw}:{self.ph}",
                                "-q:v", "2", str(d / "%04d.jpg")], check=True)
            self.frames = sorted(d.glob("*.jpg"))
            self.clip_fps = _probe_fps(g.clip)
        src = Image.open(g.still).convert("RGB")
        self.still, k, ox, oy = cover(src, self.pw, self.ph)
        self.still_np = np.asarray(self.still)
        self.paper = paper_color(self.still_np)
        self.order = reveal_order(self.ph, self.pw, idx) if not g.clip else None
        self._cache: tuple[int, np.ndarray] | None = None
        self.motion = _shift_motion(motion.scaled(motion_spec, k, k), ox, oy) if motion_spec and not g.clip else None
        if self.motion and self.motion.get("effect") == "trace":
            ink, acc = motion.masks(self.still_np, self.paper)
            self.order = motion.trace_order(ink | acc)   # the accent trace draws in the same stroke order
            self.reveal_seconds = float(self.motion.get("seconds", 2.5))
        if motion_spec and "reveal" in motion_spec and not g.clip:
            self.reveal_seconds = float(motion_spec["reveal"])   # 0 = cut straight to the drawing (reaction shots)

    def base(self, t: float) -> np.ndarray:
        if self.frames:
            k = int((t - self.g.start) * self.clip_fps * self.clip_rate)
            k = min(k, len(self.frames) - 1)
            if self._cache and self._cache[0] == k:
                return self._cache[1]
            arr = np.asarray(Image.open(self.frames[k]).convert("RGB"))
            self._cache = (k, arr)
            return arr
        p = (t - self.g.start) / self.reveal_seconds if self.reveal_seconds > 0 else 1.0
        if p >= 1.0:
            if self.motion:
                return motion.apply(self.motion, self.still_np, t - self.g.start - self.reveal_seconds, self.paper, self.mcache)
            return self.still_np
        p = 0.06 + 0.94 * _ease(max(0.0, p))
        mask = (self.order < p)[..., None]
        return np.where(mask, self.still_np, np.array(self.paper, dtype=np.uint8))

    def zoom(self, t: float) -> tuple[float, float, float]:
        """(scale, pan_x, pan_y) in [1, PRESCALE] and fractions of the spare margin."""
        g = self.g
        dur = max(0.5, g.end - g.start)
        u = min(1.0, max(0.0, (t - g.start) / dur))
        base_in = self.idx % 2 == 0
        slow = 0.045 * u if base_in else 0.045 * (1 - u)
        push = 0.0
        for b in g.boundaries:
            if t >= b:
                push += BOUNDARY_PUSH * _ease(min(1.0, (t - b) / BOUNDARY_EASE))
        env, focus = 0.0, None
        for p, f in g.punches:
            e = punch_env(t - p)
            if e > env:
                env, focus = e, f
        base = 1.0 + slow + push
        scale = min(PRESCALE - 0.005, base + min(PUNCH, max(0.0, PRESCALE - 0.005 - base)) * env)
        pan = 0.5 + (0.12 if self.idx % 3 == 0 else -0.12) * (u - 0.5)
        py = 0.5
        if focus:
            pan += (focus[0] - pan) * env
            py += (focus[1] - py) * env
        return scale, min(1.0, max(0.0, pan)), min(1.0, max(0.0, py))

    def frame(self, t: float) -> np.ndarray:
        arr = self.base(t)
        scale, px, py = self.zoom(t)
        cw, ch = int(self.pw / scale), int(self.ph / scale)
        x0 = int((self.pw - cw) * px)
        y0 = int((self.ph - ch) * py)
        crop = Image.fromarray(arr[y0:y0 + ch, x0:x0 + cw])
        return np.array(crop.resize((self.W, self.H), Image.BILINEAR))


def _probe_fps(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True).stdout.strip()
    n, d = out.split("/")
    return float(n) / float(d)


# ---------------------------------------------------------------- audio

@dataclass
class Sfx:
    path: Path
    at: float
    gain_db: float = 0.0


SHORT_SFX_GAP = 5.0      # Shorts: at most one pencil per 5 s, no page turns (owner, Shorts draft v2: "a lot of noise")


LONG_PENCIL_GAP = 4.0    # long form: at most one pencil per 4 s (energy pass: cuts come every 2-4 s)
WHOOSH_GAP = 8.0
OVERLAY_SFX = {"pop", "tick", "sting"}
SFX_GAIN = {"pop": -18, "tick": -20, "sting": -8, "whoosh": -16}   # pop/tick -6 dB: owner heard "very little pops" (2026-11-02)


def plan_sfx(groups: list[Group], overlays: list[Overlay], sfx_dir: Path, until: float | None,
             short: bool = False) -> list[Sfx]:
    out: list[Sfx] = []
    pencil, page, whoosh = sfx_dir / "pencil.wav", sfx_dir / "page.wav", sfx_dir / "whoosh.wav"
    gap = SHORT_SFX_GAP if short else LONG_PENCIL_GAP
    last_section, last_pencil, last_whoosh = None, -1e9, -1e9
    for g in groups:
        if not short and g.section != last_section and last_section is not None and page.exists():
            out.append(Sfx(page, g.start, -6))
        last_section = g.section
        if g.klass == "quiz" and whoosh.exists() and g.start - last_whoosh >= WHOOSH_GAP:
            out.append(Sfx(whoosh, g.start, SFX_GAIN["whoosh"]))
            last_whoosh = g.start
        if g.klass in PENCIL_CLASSES and not g.clip and pencil.exists() and g.start - last_pencil >= gap:
            out.append(Sfx(pencil, g.start, -26 if short else -14))
            last_pencil = g.start
    for ov in overlays:
        name = ov.spec.get("sfx")
        if name not in OVERLAY_SFX:
            continue
        f = sfx_dir / f"{name}.wav" if name else None
        if f and f.exists():
            gain = (-16 if short else -8) if name == "sting" else SFX_GAIN.get(name, -12)
            out.append(Sfx(f, ov.start, gain))
    return [s for s in out if until is None or s.at < until]


DUCK_RAMP = 0.06   # seconds: gain changes at duck-window edges are linear ramps this long (a step clicks)


def _duck_level(duck, t: float) -> float:
    for t0, t1, db in duck:
        if t0 <= t < t1:
            return 10 ** (db / 20)
    return 1.0


def _duck_points(duck) -> list[tuple[float, float]]:
    """Breakpoints (t, gain) of the piecewise-linear envelope: each edge ramps over DUCK_RAMP, centred on it."""
    pts: list[tuple[float, float]] = []
    h = DUCK_RAMP / 2
    for e in sorted({x for w in duck for x in w[:2]}):
        before, after = _duck_level(duck, e - 1e-9), _duck_level(duck, e + 1e-9)
        if abs(before - after) < 1e-9:
            continue
        x0 = max(e - h, pts[-1][0] + 1e-6) if pts else e - h
        pts += [(x0, before), (max(e + h, x0 + 1e-6), after)]
    return pts


def duck_gain(duck, t: float) -> float:
    """Linear gain of the music bed at time t: unity outside the (t0, t1, gain_db) windows, ramped at their edges."""
    pts = _duck_points(duck)
    if not pts or t <= pts[0][0]:
        return 1.0 if not pts else pts[0][1]
    for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
        if t < xb:
            return ya + (yb - ya) * (t - xa) / (xb - xa)
    return pts[-1][1]


def volume_expr(duck: list[tuple[float, float, float]]) -> str:
    """ffmpeg `volume` expression equal to duck_gain(duck, t): nested if(lt(t,x),lerp,...) over the envelope."""
    pts = _duck_points(duck)
    if not pts:
        return "1"
    expr = f"{pts[-1][1]:.5f}"
    for (xa, ya), (xb, yb) in reversed(list(zip(pts, pts[1:]))):
        seg = f"{ya:.5f}" if abs(ya - yb) < 1e-9 else f"{ya:.5f}+({yb - ya:.6f})*(t-{xa:.4f})/{xb - xa:.4f}"
        expr = f"if(lt(t,{xb:.4f}),{seg},{expr})"
    return f"if(lt(t,{pts[0][0]:.4f}),{pts[0][1]:.5f},{expr})"


def quiz_audio(overlays: list[Overlay]) -> tuple[list[tuple[float, float, float]], list[tuple[float, float]]]:
    """Duck windows for the music bed and quiz-cue windows, from the ring/circle parts of each quiz."""
    rings = {o.spec["quiz"]: o for o in overlays if o.spec.get("kind") == "ring" and o.spec.get("quiz")}
    duck, cues = [], []
    for o in overlays:
        if o.spec.get("kind") == "circle" and o.spec.get("quiz") in rings:
            r0, rev = rings[o.spec["quiz"]].start, o.start
            if rev - 0.3 <= r0:
                continue
            duck += [(r0, rev - 0.3, -10.0), (rev - 0.3, rev, -60.0)]
            cues.append((r0, rev - 0.3))
    return duck, cues


def mix_audio(narration: Path, music: list[Path], sfx: list[Sfx], total: float, out: Path, music_gain_db: float,
              duck=(), cues=()) -> None:
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(narration)]
    parts: list[str] = []
    mix_in = ["[nar]"]
    n = 1
    if music:
        for m in music:
            cmd += ["-stream_loop", "-1", "-i", str(m)]
        labels = []
        for k in range(len(music)):
            parts.append(f"[{n + k}:a]aformat=sample_rates=48000:channel_layouts=stereo[mu{k}]")
            labels.append(f"[mu{k}]")
        n += len(music)
        chain = "".join(labels) + (f"concat=n={len(labels)}:v=0:a=1" if len(labels) > 1 else "anull")
        parts.append(f"{chain},atrim=0:{total:.3f},volume={music_gain_db}dB,asetnsamples=n=48:p=0,volume='{volume_expr(list(duck))}':eval=frame,"
                     f"afade=t=in:d=1.5,afade=t=out:st={max(0, total - 3):.3f}:d=3[music]")
        parts.append(f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={total:.3f},asplit=2[nar][side]")
        parts.append("[music][side]sidechaincompress=threshold=0.015:ratio=5:attack=40:release=700:makeup=1[ducked]")
        mix_in.append("[ducked]")
    else:
        parts.append(f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={total:.3f}[nar]")
    for i, s in enumerate(sfx):
        cmd += ["-i", str(s.path)]
        ms = int(s.at * 1000)
        parts.append(f"[{n + i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={s.gain_db}dB,adelay={ms}|{ms}[sfx{i}]")
        mix_in.append(f"[sfx{i}]")
    k0 = n + len(sfx)
    for j, (path, at, dur, gain) in enumerate(cues):
        cmd += ["-stream_loop", "-1", "-i", str(path)]
        ms = int(at * 1000)
        parts.append(f"[{k0 + j}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{dur:.3f},"
                     f"afade=t=in:d=0.03,afade=t=out:st={max(0, dur - 0.12):.3f}:d=0.12,volume={gain}dB,adelay={ms}|{ms}[cue{j}]")
        mix_in.append(f"[cue{j}]")
    parts.append("".join(mix_in) + f"amix=inputs={len(mix_in)}:duration=first:normalize=0,atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[out]")
    cmd += ["-filter_complex", ";".join(parts), "-map", "[out]", "-c:a", "pcm_s16le", str(out)]
    subprocess.run(cmd, check=True)


# ---------------------------------------------------------------- captions

def srt_cues(words: list[dict], until: float | None = None, max_chars: int = 38, max_dur: float = 3.5,
             breaks: tuple[str, ...] = (".", "?", "!"), max_gap: float = 0.8) -> list[tuple[float, float, str]]:
    cues: list[tuple[float, float, str]] = []
    cur: list[dict] = []

    def flush():
        if cur:
            cues.append((cur[0]["start"], cur[-1]["end"], " ".join(w["word"] for w in cur)))

    for w in words:
        if until is not None and w["start"] >= until:
            break
        if cur:
            text_len = len(" ".join(x["word"] for x in cur)) + 1 + len(w["word"])
            gap = w["start"] - cur[-1]["end"]
            if text_len > max_chars or w["start"] - cur[0]["start"] > max_dur or gap > max_gap or cur[-1]["word"].endswith(breaks):
                flush()
                cur = []
        cur.append(w)
    flush()
    return cues


def caption_overlays(words: list[dict], until: float | None, pos_y: float = 0.70, layout: dict | None = None,
                     groups: list[Group] | None = None) -> list[Overlay]:
    """Burnt-in caption lines for Shorts, sentence-split, held until the next line. `layout` (caption_layout.json,
    written by overlay_check.py --fix) sets max_chars, x, and a height per scene so lines avoid the drawing."""
    layout = layout or {}
    max_chars, x = int(layout.get("max_chars", 24)), float(layout.get("x", 0.5))
    words = _rejoin(words)
    ys = layout.get("y", {})
    cues = srt_cues(words, until, max_chars=max_chars, max_dur=2.0, breaks=(".", "?", "!", ",", "...", ";"), max_gap=0.35)
    out = []
    for i, (a, b, text) in enumerate(cues):
        end = cues[i + 1][0] if i + 1 < len(cues) and cues[i + 1][0] - b < 0.6 else b + 0.15
        y = pos_y
        if groups and ys:
            g = [g for g in groups if g.start <= a + 1e-6]
            y = float(ys.get(g[-1].scene_id, pos_y)) if g else pos_y
        out.append(Overlay({"kind": "caption", "text": text, "pos": [x, y]}, a, end))
    return out


def _rejoin(words: list[dict]) -> list[dict]:
    """Undo transcriber splits that read badly on screen: 'twenty' '-five' -> 'twenty-five', 'T' 'B' 'X' 'T.' -> 'TBXT.'"""
    out: list[dict] = []
    for w in words:
        tok = w["word"].strip()
        prev = out[-1]["word"] if out else ""
        letter = len(tok.rstrip(".,?!")) == 1 and tok[:1].isupper() and tok[:1] not in "AI"
        spelling = prev.isalpha() and prev.isupper() and len(prev) <= 4   # 'T', 'TB', 'TBX': a word being spelt out
        if out and (tok.startswith("-") or (letter and spelling)):
            out[-1] = dict(out[-1], word=prev + tok, end=w["end"])
        else:
            out.append(dict(w, word=tok))
    return out


def load_caption_layout(video_dir: Path) -> dict:
    p = video_dir / "caption_layout.json"
    return json.loads(p.read_text()) if p.exists() else {}


def write_srt(cues: list[tuple[float, float, str]], path: Path) -> None:
    def ts(t: float) -> str:
        ms = int(round(t * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    lines = []
    for i, (a, b, text) in enumerate(cues, 1):
        lines += [str(i), f"{ts(a)} --> {ts(max(b, a + 0.3))}", text, ""]
    path.write_text("\n".join(lines))


# ---------------------------------------------------------------- render

def render(video_dir: Path, *, narration: Path, words_path: Path, out: Path, until: float | None, width: int, height: int,
           fps: int, music: list[Path], music_gain_db: float, use_clips: bool, scratch: Path,
           motion_specs: dict | None = None, burn_captions: bool = False,
           quiz_music: Path | None = None, quiz_music_gain_db: float = -20.0) -> dict:
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    words = json.loads(words_path.read_text())
    stills = video_dir / "assets" / "stills"
    clips = video_dir / "assets" / "clips" if use_clips else None
    groups = build_groups(plan, stills, clips, until)
    if not groups:
        raise SystemExit("no scenes with stills")
    total = groups[-1].end if until is None else min(until, groups[-1].end)
    specs = json.loads((video_dir / "overlays.json").read_text()) if (video_dir / "overlays.json").exists() else []
    overlays = resolve_overlays(specs, words, groups, until)
    overlays = attach_punches(groups, overlays)
    sfx = plan_sfx(groups, overlays, video_dir / "assets" / "sfx", until, short=height > width)
    if burn_captions:
        overlays += caption_overlays(words, until, layout=load_caption_layout(video_dir), groups=groups)
    place_overlays(overlays, width, height)
    duck, cue_windows = quiz_audio(overlays)
    cues = [(quiz_music, a, b - a, quiz_music_gain_db) for a, b in cue_windows] if quiz_music else []

    scratch.mkdir(parents=True, exist_ok=True)
    specs_m = motion_specs or {}
    sources = [Source(g, width, height, scratch, i, motion_spec=specs_m.get(g.scene_id)) for i, g in enumerate(groups)]
    video_only = scratch / "video_only.mp4"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
           "-r", str(fps), "-i", "-", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "19", "-pix_fmt", "yuv420p",
           str(video_only)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    nframes = int(math.ceil(total * fps))
    gi = 0
    for f in range(nframes):
        t = f / fps
        while gi + 1 < len(groups) and t >= groups[gi + 1].start:
            gi += 1
        frame = sources[gi].frame(t).copy()
        for ov in overlays:
            if ov.start <= t < ov.end:
                a, frac = overlay_alpha(ov, t)
                if a > 0:
                    composite(frame, ov, a, frac)
        proc.stdin.write(frame.tobytes())
        if f % (fps * 10) == 0:
            print(f"  {t:6.1f}s / {total:.1f}s", file=sys.stderr)
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit("video encode failed")

    audio = scratch / "mix.wav"
    mix_audio(narration, music, sfx, total, audio, music_gain_db, duck=duck, cues=cues)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video_only), "-i", str(audio), "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", str(out)], check=True)
    srt = video_dir / "captions" / (out.stem + ".srt")
    srt.parent.mkdir(parents=True, exist_ok=True)
    write_srt(srt_cues(words, until), srt)
    return {"out": str(out), "srt": str(srt), "seconds": total, "groups": len(groups),
            "clips": sum(1 for g in groups if g.clip), "overlays": len(overlays), "sfx": len(sfx)}


def remix(video_dir: Path, *, narration: Path, words_path: Path, video_in: Path, out: Path, music: list[Path],
          music_gain_db: float, use_clips: bool, scratch: Path, mix_out: Path | None = None) -> dict:
    """Dub track: the same music bed, ducking and SFX plan as render(), mixed under another narration and
    muxed onto an already rendered video (no frames re-rendered, no captions: the words are the English ones)."""
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    words = json.loads(words_path.read_text())
    stills = video_dir / "assets" / "stills"
    clips = video_dir / "assets" / "clips" if use_clips else None
    groups = build_groups(plan, stills, clips, None)
    total = groups[-1].end
    specs = json.loads((video_dir / "overlays.json").read_text()) if (video_dir / "overlays.json").exists() else []
    overlays = [o for o in resolve_overlays(specs, words, groups, None) if o.spec.get("kind") != "punch"]
    sfx = plan_sfx(groups, overlays, video_dir / "assets" / "sfx", None)
    scratch.mkdir(parents=True, exist_ok=True)
    audio = scratch / "mix.wav"
    mix_audio(narration, music, sfx, total, audio, music_gain_db)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video_in), "-i", str(audio), "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(out)], check=True)
    if mix_out:
        mix_out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(audio), "-c:a", "aac", "-b:a", "192k", str(mix_out)], check=True)
    return {"out": str(out), "mix": str(mix_out) if mix_out else None, "seconds": total, "sfx": len(sfx)}


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video_dir", type=Path)
    p.add_argument("--narration", type=Path, required=True)
    p.add_argument("--words", type=Path, required=True)
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument("--until", type=float, default=None)
    p.add_argument("--size", default="1920x1080")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--music", type=Path, action="append", default=[], help="music cue(s), played in order and looped")
    p.add_argument("--music-gain-db", type=float, default=-24.0)
    p.add_argument("--quiz-music", type=Path, default=None, help="loop played (timed) under each quiz countdown")
    p.add_argument("--quiz-music-gain-db", type=float, default=-20.0)
    p.add_argument("--no-clips", action="store_true", help="ignore assets/clips (stills only)")
    p.add_argument("--scratch", type=Path, default=Path(tempfile.gettempdir()) / "fc-compose")
    p.add_argument("--video-in", type=Path, default=None, help="dub mode: reuse this render's picture, mix the new narration under it")
    p.add_argument("--mix-out", type=Path, default=None, help="dub mode: also write the mixed audio alone (m4a) for a YouTube audio track")
    p.add_argument("--motion", nargs="?", const="__default__", default=None,
                   help="apply procedural motion from motion.json (optionally a path): boil, flicker, sprite, trace")
    p.add_argument("--burn-captions", action="store_true", help="Shorts: burn caption lines into the lower middle")
    a = p.parse_args()
    w, h = (int(v) for v in a.size.split("x"))
    if a.video_in:
        info = remix(a.video_dir, narration=a.narration, words_path=a.words, video_in=a.video_in, out=a.out, music=a.music,
                     music_gain_db=a.music_gain_db, use_clips=not a.no_clips, scratch=a.scratch, mix_out=a.mix_out)
        print(json.dumps(info, indent=1))
        return
    specs_m = None
    if a.motion is not None:
        mpath = a.video_dir / "motion.json" if a.motion == "__default__" else Path(a.motion)
        specs_m = motion.load_specs(mpath)
    info = render(a.video_dir, narration=a.narration, words_path=a.words, out=a.out, until=a.until, width=w, height=h,
                  fps=a.fps, music=a.music, music_gain_db=a.music_gain_db, use_clips=not a.no_clips, scratch=a.scratch,
                  motion_specs=specs_m, burn_captions=a.burn_captions,
                  quiz_music=a.quiz_music, quiz_music_gain_db=a.quiz_music_gain_db)
    print(json.dumps(info, indent=1))


if __name__ == "__main__":
    main()
