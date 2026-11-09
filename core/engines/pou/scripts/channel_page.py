#!/usr/bin/env python3
"""Build the channel-page assets: banner (+ TV/desktop/phone crops), avatar contact sheet, watermark.
Lettering is Patrick Hand drawn locally (never text inside an AI image). Colours from compose.py."""

from __future__ import annotations
import argparse
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compose import COLORS, INK, PAPER, load_font  # noqa: E402

BANNER = (2560, 1440)
SAFE = (1546, 423)


def _safe_box() -> tuple[int, int, int, int]:
    x0 = (BANNER[0] - SAFE[0]) // 2
    y0 = (BANNER[1] - SAFE[1]) // 2
    return x0, y0, x0 + SAFE[0], y0 + SAFE[1]


def _fit(img: Image.Image, h: int) -> Image.Image:
    w = int(img.width * h / img.height)
    return img.convert("RGBA").resize((w, h), Image.LANCZOS)


def _key_paper(img: Image.Image, tol: int = 34) -> Image.Image:
    """Make the drawing's own paper transparent so it sits on the banner paper without a box.
    The paper colour is sampled at the four corners; pixels within `tol` of it fade to transparent."""
    import numpy as np

    a = np.asarray(img.convert("RGBA")).astype(np.int16)
    corners = np.array([a[0, 0, :3], a[0, -1, :3], a[-1, 0, :3], a[-1, -1, :3]]).mean(axis=0)
    dist = np.abs(a[:, :, :3] - corners).max(axis=2)
    alpha = np.clip((dist - tol // 2) * (255 / tol), 0, 255).astype(np.uint8)
    a[:, :, 3] = np.minimum(a[:, :, 3], alpha)
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def banner(
    mascot: Path,
    title: str,
    tagline: str,
    cadence: str,
    strip: list[Path],
    out: Path,
    seed: int = 7,
    title_size: int = 170,
) -> Path:
    rng = random.Random(seed)
    img = Image.new("RGB", BANNER, PAPER)
    x0, y0, x1, y1 = _safe_box()
    if strip:  # faint drawings spread across the top band, outside the safe area
        ds = [_key_paper(_fit(Image.open(p), 260)) for p in strip]
        for d in ds:
            d.putalpha(d.getchannel("A").point(lambda v: int(v * 0.35)))
        gap = (BANNER[0] - sum(d.width for d in ds)) // (len(ds) + 1)
        sx = gap
        for d in ds:
            img.paste(d, (sx, 70), d)
            sx += d.width + gap
    m = _key_paper(_fit(Image.open(mascot), SAFE[1] - 60))
    img.paste(m, (x0 + 30, y0 + 30), m)
    draw = ImageDraw.Draw(img)
    tx = x0 + 30 + m.width + 50
    avail = x1 - 30 - tx  # text must end inside the safe area

    def fitting(text: str, size: int):
        f = load_font(size)
        while size > 24 and draw.textbbox((0, 0), text, font=f)[2] > avail:
            size -= 4
            f = load_font(size)
        return f, size

    f_title, title_size = fitting(title, title_size)
    f_tag, _ = fitting(tagline, 64)
    f_cad = load_font(48)
    draw.text((tx, y0 + 40), title, font=f_title, fill=INK)
    draw.text((tx + 6, y0 + 40 + int(title_size * 1.12)), tagline, font=f_tag, fill=INK)
    cw = draw.textbbox((0, 0), cadence, font=f_cad)[2]
    draw.text((x1 - cw - 30, y1 - 80), cadence, font=f_cad, fill=COLORS["rust"])
    tw = draw.textbbox((0, 0), title, font=f_title)[2]
    y = y0 + 40 + int(title_size * 1.03)
    pts = [(tx + k * tw / 8, y + rng.uniform(-3, 3)) for k in range(9)]
    draw.line(pts, fill=COLORS["ochre"], width=7, joint="curve")
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    return out


def crops(banner_path: Path, out_dir: Path) -> dict[str, Path]:
    img = Image.open(banner_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    x0, y0, x1, y1 = _safe_box()
    res = {"tv": img, "desktop": img.crop((0, y0, BANNER[0], y1)), "phone": img.crop((x0, y0, x1, y1))}
    paths = {}
    for k, im in res.items():
        p = out_dir / f"{k}.png"
        im.save(p)
        paths[k] = p
    return paths


def contact_sheet(candidates: list[Path], out: Path) -> Path:
    sizes = (800, 88, 48)
    pad = 40
    w = len(candidates) * (800 + pad) + pad
    h = pad + 40 + sum(s + pad for s in sizes) + 20
    sheet = Image.new("RGB", (w, h), PAPER)
    d = ImageDraw.Draw(sheet)
    f = load_font(48)
    for i, p in enumerate(candidates):
        x = pad + i * (800 + pad)
        d.text((x, 5), "ABCDEFG"[i], font=f, fill=INK)
        y = pad + 40
        for s in sizes:
            im = Image.open(p).convert("RGBA").resize((s, s), Image.LANCZOS)
            mask = Image.new("L", (s, s), 0)
            ImageDraw.Draw(mask).ellipse((0, 0, s - 1, s - 1), fill=255)
            sheet.paste(im, (x, y), mask)
            y += s + pad
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)
    return out


def watermark(avatar: Path, out: Path, size: int = 150) -> Path:
    im = Image.open(avatar).convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    im.putalpha(mask)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out)
    return out


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("banner")
    b.add_argument("--mascot", type=Path, required=True)
    b.add_argument("--title", default="Professor of Us")
    b.add_argument("--tagline", default="How humans actually work, actually lived, and what happens next")
    b.add_argument("--cadence", default="New video every week")
    b.add_argument("--strip", type=Path, action="append", default=[])
    b.add_argument("--title-size", type=int, default=170)
    b.add_argument("-o", "--out", type=Path, required=True)
    c = sub.add_parser("crops")
    c.add_argument("banner", type=Path)
    c.add_argument("-o", "--out-dir", type=Path, required=True)
    s = sub.add_parser("sheet")
    s.add_argument("candidates", type=Path, nargs="+")
    s.add_argument("-o", "--out", type=Path, required=True)
    w = sub.add_parser("watermark")
    w.add_argument("avatar", type=Path)
    w.add_argument("-o", "--out", type=Path, required=True)
    a = p.parse_args()
    if a.cmd == "banner":
        print(banner(a.mascot, a.title, a.tagline, a.cadence, a.strip, a.out, title_size=a.title_size))
    elif a.cmd == "crops":
        print(crops(a.banner, a.out_dir))
    elif a.cmd == "sheet":
        print(contact_sheet(a.candidates, a.out))
    else:
        print(watermark(a.avatar, a.out))


if __name__ == "__main__":
    main()
