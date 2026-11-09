"""Measure batch thumbnail candidates against rules/thumbnails.md, and file the renders in each video folder.

    python check.py <manifest.json> <frames dir>

The manifest comes from manifest.ts; the frames from `remotion render ... Thumbs <dir> --sequence` (frame i is
candidate i). For every candidate this writes, in channels/say-suppose/videos/<video>/renders/packaging/ (git-ignored):
thumb-<id>.png (1920x1080), thumb-<id>-feed.png (168x94, the K1 flash size), thumb-<id>-white.png and
thumb-<id>-dark.png (the 168x94 render on both feed themes, K10). It writes the numbers to
videos/<video>/thumb-checks.json (tracked).

Measured here: K3, K4, K5 (count, cap height, contrast), K8, K9, K10 (edge contrast on both themes), K11.
Judged by people or seats: K1, K2, K6, K7, K12, K13, K14, K15.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

W, H = 1920, 1080
FEED = (168, 94)
ROOT = Path(__file__).resolve().parents[2]          # channels/say-suppose
INK, MUSTARD = (0x23, 0x25, 0x2B), (0xF2, 0xB6, 0x32)
CAP = 0.70                                          # Rubik's cap height, in em


def lin(c):
    c = np.asarray(c, dtype=np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def luminance(rgb):
    l = lin(rgb)
    return 0.2126 * l[..., 0] + 0.7152 * l[..., 1] + 0.0722 * l[..., 2]


def ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def colourfulness(px):
    r, g, b = (px[..., i].astype(np.float64) for i in range(3))
    rg, yb = r - g, 0.5 * (r + g) - b
    return math.hypot(rg.std(), yb.std()) + 0.3 * math.hypot(rg.mean(), yb.mean())


def boxes_hit(a, b):
    return not (a["x"] + a["w"] <= b["x"] or b["x"] + b["w"] <= a["x"] or a["y"] + a["h"] <= b["y"] or b["y"] + b["h"] <= a["y"])


def on_theme(small, bg):
    pad = 12
    canvas = Image.new("RGB", (FEED[0] + 2 * pad, FEED[1] + 2 * pad), bg)
    mask = Image.new("L", FEED, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, FEED[0] - 1, FEED[1] - 1), radius=8, fill=255)
    canvas.paste(small, (pad, pad), mask)
    return canvas


def measure(c, img):
    px = np.asarray(img.convert("RGB"))
    lum = luminance(px)
    yy, xx = np.mgrid[0:H, 0:W]
    hx, hy, r = c["head"]["x"], c["head"]["y"], c["head"]["r"]
    d = np.hypot(xx - hx, yy - hy)
    head_l = float(lum[d <= r * 0.85].mean())
    ring_l = float(lum[(d > r + 4) & (d <= r + 29)].mean())
    words = len(c["tag"]["text"].split()) + (len(c["stake"].split()) if c["stake"] else 0)
    cap = CAP * c["tag"]["size"] / H
    tag_contrast = ratio(float(luminance(np.array(MUSTARD))), float(luminance(np.array(INK))))
    m = colourfulness(px)
    mean_l = float(lum.mean())
    edge = np.concatenate([lum[:8].ravel(), lum[-8:].ravel(), lum[:, :8].ravel(), lum[:, -8:].ravel()])
    edge_l = float(edge.mean())
    badge = {"x": W * 0.85, "y": H * 0.88, "w": W * 0.15, "h": H * 0.12}
    in_badge = [k for k, b in c["keys"].items() if boxes_hit(b, badge)]
    k4 = ratio(head_l, ring_l)
    return {
        "K3": {"head_height_pct": round(200 * r / H, 1), "pass": 2 * r / H >= 0.25},
        "K4": {"head_lum": round(head_l, 3), "ring_lum": round(ring_l, 3), "ratio": round(k4, 2), "pass": k4 >= 3},
        "K5": {"words": words, "cap_height_pct": round(100 * cap, 1), "tag_contrast": round(tag_contrast, 1),
               "pass": words <= 3 and cap >= 0.12 and tag_contrast >= 4.5},
        "K8": {"pointers": c["pointers"], "pass": c["pointers"] <= 1},
        "K9": {"colourfulness": round(m, 1), "mean_lum": round(mean_l, 3),
               "pass": m >= 40 or (mean_l <= 0.20 and k4 >= 3)},
        "K10": {"edge_lum": round(edge_l, 3), "edge_vs_white": round(ratio(edge_l, 1.0), 2),
                "edge_vs_dark": round(ratio(edge_l, float(luminance(np.array((15, 15, 15))))), 2),
                "note": "edge contrast only; 'found first' is the K1/K2 cold read"},
        "K11": {"keys_in_badge_zone": in_badge, "pass": not in_badge},
    }


def main(manifest, frames):
    cands = json.loads(Path(manifest).read_text())
    by_video = {}
    for i, c in enumerate(cands):
        img = Image.open(Path(frames) / f"element-{i:02d}.png").convert("RGB")
        out = ROOT / "videos" / c["video"] / "renders" / "packaging"
        out.mkdir(parents=True, exist_ok=True)
        img.save(out / f"thumb-{c['id']}.png")
        small = img.resize(FEED, Image.LANCZOS)
        small.save(out / f"thumb-{c['id']}-feed.png")
        on_theme(small, (255, 255, 255)).save(out / f"thumb-{c['id']}-white.png")
        on_theme(small, (15, 15, 15)).save(out / f"thumb-{c['id']}-dark.png")
        res = {"id": c["id"], "variable": c["variable"], "value": c["value"], "tag": c["tag"]["text"],
               "stake": c["stake"], **measure(c, img)}
        by_video.setdefault(c["video"], []).append(res)
        flags = " ".join(f"{k}:{'ok' if v.get('pass', True) else 'FAIL'}" for k, v in res.items() if k.startswith("K"))
        print(f"{c['video'][11:45]:34} {c['id']} {c['value']:>12}  {flags}  K4={res['K4']['ratio']} K9={res['K9']['colourfulness']}/{res['K9']['mean_lum']}")
    for v, rows in by_video.items():
        (ROOT / "videos" / v / "thumb-checks.json").write_text(json.dumps(
            {"rules": "channels/say-suppose/rules/thumbnails.md", "measured_by": "channels/say-suppose/brand/thumbs/check.py",
             "candidates": rows}, indent=1) + "\n")


if __name__ == "__main__":
    main(*sys.argv[1:3])
