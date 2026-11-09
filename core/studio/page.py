"""Channel-page artwork: the picture, banner, banner crops and watermark for a channel.

Lettering is drawn here, never inside a generated image. Two channels have a code-drawn picture; Say
Suppose's is an illustration the owner picked, and its banner is lettered on the calm left of a scene.
The Professor of Us page keeps its own script (core/engines/pou/scripts/channel_page.py).

    python -m studio.page build <slug> -o channels/<slug>/page [--picture img] [--scene img]
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BANNER = (2560, 1440)
SAFE = (1546, 423)  # What every device shows; a phone shows nothing else.
PICTURE = 800
WATERMARK = 150
_SS = 4  # Marks are drawn this many times larger, then averaged down.

# macOS system fonts. A face is found by its family and style name, not by its position in the file.
FONT_FILES = (
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
    "/System/Library/Fonts/Avenir Next.ttc",
    "/System/Library/Fonts/Supplemental/Futura.ttc",
)

Box = tuple[int, int, int, int]


class PageError(Exception):
    """The page artwork cannot be built as asked. The message says what to fix."""


@dataclass(frozen=True)
class Brand:
    name: str
    line: str
    ground: str
    ink: str
    accent: str
    soft: str  # The quiet fourth colour: the banner's background pattern, or the line.
    name_font: tuple[str, str]
    line_font: tuple[str, str]


BRANDS: dict[str, Brand] = {
    "say-suppose": Brand(
        "Say Suppose",
        "Change one thing. See what follows.",
        "#1F1B4D",
        "#FFC857",
        "#FF7A59",
        "#F4EDE0",
        ("Futura", "Bold"),
        ("Futura", "Medium"),
    ),
    # Navy, parchment and brass: no colour a party owns.
    "power-and-citizen": Brand(
        "Power & Citizen",
        "How the world is run, and where you fit in.",
        "#14213D",
        "#F3EBDD",
        "#C8963E",
        "#1B2B4D",
        ("Georgia", "Bold"),
        ("Georgia", "Italic"),
    ),
    "see-underneath": Brand(
        "See Underneath",
        "The science under ordinary things.",
        "#0B2E2B",
        "#EAF6F2",
        "#F2B441",
        "#12403B",
        ("Avenir Next", "Bold"),
        ("Avenir Next", "Medium"),
    ),
}


def _brand(slug: str) -> Brand:
    if slug not in BRANDS:
        raise PageError(f"No page artwork for channel {slug!r}: known channels are {', '.join(BRANDS)}")
    return BRANDS[slug]


def safe_box() -> Box:
    x0 = (BANNER[0] - SAFE[0]) // 2
    y0 = (BANNER[1] - SAFE[1]) // 2
    return x0, y0, x0 + SAFE[0], y0 + SAFE[1]


@lru_cache(maxsize=None)
def _face(family: str, style: str) -> tuple[str, int]:
    for path in FONT_FILES:
        index = 0
        while True:
            try:
                found = ImageFont.truetype(path, 20, index=index).getname()
            except OSError:
                break
            if found == (family, style):
                return path, index
            index += 1
    raise PageError(f"Font {family} {style} was not found in {', '.join(FONT_FILES)}")


def load_font(family: str, style: str, size: int) -> ImageFont.FreeTypeFont:
    path, index = _face(family, style)
    return ImageFont.truetype(path, size, index=index)


class _Pen:
    """Draws in the mark's own units: a 120-unit square with the origin at its centre."""

    def __init__(self, draw: ImageDraw.ImageDraw, box: Box, scale: float, shift: tuple[float, float]):
        self.draw = draw
        self.k = (box[2] - box[0]) / 120 * scale
        self.cx = (box[0] + box[2]) / 2 + shift[0] * self.k
        self.cy = (box[1] + box[3]) / 2 + shift[1] * self.k

    def _p(self, x: float, y: float) -> tuple[float, float]:
        return self.cx + x * self.k, self.cy + y * self.k

    def rect(self, x: float, y: float, w: float, h: float, fill: str) -> None:
        self.draw.rectangle((*self._p(x, y), *self._p(x + w, y + h)), fill=fill)

    def disc(self, x: float, y: float, r: float, fill: str) -> None:
        self.draw.ellipse((*self._p(x - r, y - r), *self._p(x + r, y + r)), fill=fill)

    def dome(self, x: float, y: float, r: float, fill: str) -> None:
        self.draw.pieslice((*self._p(x - r, y - r), *self._p(x + r, y + r)), 180, 360, fill=fill)

    def line(self, x0: float, y0: float, x1: float, y1: float, width: float, fill: str, round_ends=False) -> None:
        self.draw.line((*self._p(x0, y0), *self._p(x1, y1)), fill=fill, width=max(1, round(width * self.k)))
        if round_ends:
            self.disc(x0, y0, width / 2, fill)
            self.disc(x1, y1, width / 2, fill)


def _pillar_and_person(draw: ImageDraw.ImageDraw, box: Box, brand: Brand) -> None:
    """An institution and a citizen, drawn to the same height."""
    pen = _Pen(draw, box, 1.0, (0.5, 0))
    pen.rect(-39, -30, 32, 8, brand.ink)
    pen.rect(-34, -22, 22, 44, brand.ink)
    pen.rect(-39, 22, 32, 8, brand.ink)
    pen.disc(22, -18, 10, brand.accent)
    pen.dome(22, 14, 16, brand.accent)
    pen.rect(6, 14, 32, 16, brand.accent)


def _lens(draw: ImageDraw.ImageDraw, box: Box, brand: Brand) -> None:
    """A solid block, and a lens over one corner showing the structure inside it."""
    pen = _Pen(draw, box, 0.95, (-5.5, -6.5))
    pen.rect(-36, -26, 46, 46, brand.accent)
    pen.line(32, 24, 44, 36, 6, brand.ink, round_ends=True)
    pen.disc(14, 6, 26, brand.ink)
    pen.disc(14, 6, 22, brand.ground)
    for y, half in ((6, 21), (-6, 17), (18, 17)):
        pen.line(14 - half, y, 14 + half, y, 2, brand.accent)
    for x, half in ((14, 21), (2, 17), (26, 17)):
        pen.line(x, 6 - half, x, 6 + half, 2, brand.accent)


_MARKS = {"power-and-citizen": _pillar_and_person, "see-underneath": _lens}


def mark(slug: str, size: int = PICTURE) -> Image.Image:
    """The code-drawn picture: the mark on the channel's ground colour, square."""
    brand = _brand(slug)
    if slug not in _MARKS:
        raise PageError(f"{slug} has an illustrated picture, not a code-drawn one: pass the illustration")
    big = Image.new("RGB", (size * _SS, size * _SS), brand.ground)
    _MARKS[slug](ImageDraw.Draw(big), (0, 0, size * _SS, size * _SS), brand)
    return big.reduce(_SS)


def picture(slug: str, out: Path, source: Path | None = None) -> Path:
    """Write the 800x800 channel picture: the mark, or the owner's illustration cropped square."""
    _brand(slug)
    if source is None:
        img = mark(slug)
    else:
        src = Image.open(source).convert("RGB")
        side = min(src.size)
        left, top = (src.width - side) // 2, (src.height - side) // 2
        img = src.crop((left, top, left + side, top + side)).resize((PICTURE, PICTURE), Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    return out


def _cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    k = max(size[0] / img.width, size[1] / img.height)
    img = img.resize((max(size[0], round(img.width * k)), max(size[1], round(img.height * k))), Image.LANCZOS)
    left, top = (img.width - size[0]) // 2, (img.height - size[1]) // 2
    return img.crop((left, top, left + size[0], top + size[1]))


def _pattern(img: Image.Image, slug: str, brand: Brand) -> None:
    """The quiet background outside the plate: columns for Power & Citizen, a blueprint grid for See Underneath."""
    draw = ImageDraw.Draw(img)
    if slug == "power-and-citizen":
        for x in range(60, BANNER[0], 200):
            draw.rectangle((x, 0, x + 80, BANNER[1]), fill=brand.soft)
    else:
        for x in range(0, BANNER[0], 80):
            draw.line((x, 0, x, BANNER[1]), fill=brand.soft, width=3 if x % 400 == 0 else 1)
        for y in range(0, BANNER[1], 80):
            draw.line((0, y, BANNER[0], y), fill=brand.soft, width=3 if y % 400 == 0 else 1)


def _fit(draw: ImageDraw.ImageDraw, text: str, face: tuple[str, str], size: int, width: int):
    """The largest font at or under `size` whose text is no wider than `width`."""
    while True:
        font = load_font(*face, size)
        left, _, right, _ = draw.textbbox((0, 0), text, font=font)
        if right - left <= width or size <= 16:
            return font
        size -= 2


def _text(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, font, fill: str) -> Box:
    """Draw text with the top-left of its ink at (x, y). Returns the ink's box."""
    left, top, _, _ = draw.textbbox((0, 0), text, font=font)
    draw.text((x - left, y - top), text, font=font, fill=fill)
    return draw.textbbox((x - left, y - top), text, font=font)


def _ink_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def banner(slug: str, out: Path, scene: Path | None = None) -> dict[str, Box]:
    """Write the 2560x1440 banner. Returns the box of everything that must stay inside the safe area."""
    brand = _brand(slug)
    x0, y0, x1, y1 = safe_box()
    pad, gap = 40, 34
    boxes: dict[str, Box] = {}

    if slug in _MARKS:
        img = Image.new("RGB", BANNER, brand.ground)
        _pattern(img, slug, brand)
        draw = ImageDraw.Draw(img)
        # A clear plate for the lettering, ruled above and below. The rules sit outside the safe area, so the
        # desktop and phone crops show the plate without them.
        draw.rectangle((x0 - 90, y0 - 70, x1 + 90, y1 + 70), fill=brand.ground)
        for y in (y0 - 70, y1 + 70):
            draw.line((x0 - 90, y, x1 + 90, y), fill=brand.accent, width=5)
        side = SAFE[1] - 2 * pad
        boxes["mark"] = (x0 + pad, y0 + pad, x0 + pad + side, y0 + pad + side)
        big = Image.new("RGB", (side * _SS, side * _SS), brand.ground)
        _MARKS[slug](ImageDraw.Draw(big), (0, 0, side * _SS, side * _SS), brand)
        img.paste(big.reduce(_SS), boxes["mark"][:2])
        left = boxes["mark"][2] + 50
        line_fill = brand.accent
    else:
        if scene is None:
            raise PageError(f"{slug} needs its illustrated scene: pass the scene image")
        # The scene keeps its subject on the right and calm space on the left, where the lettering goes.
        img = _cover(Image.open(scene).convert("RGB"), BANNER)
        draw = ImageDraw.Draw(img)
        left = x0 + pad
        line_fill = brand.soft

    width = (x1 - pad if slug in _MARKS else x0 + round(0.62 * SAFE[0])) - left
    name_font = _fit(draw, brand.name, brand.name_font, 168, width)
    line_font = _fit(draw, brand.line, brand.line_font, 58, width - 4)  # The line is indented 4 px.
    name_h, line_h = _ink_size(draw, brand.name, name_font)[1], _ink_size(draw, brand.line, line_font)[1]
    top = y0 + (SAFE[1] - (name_h + gap + line_h)) // 2
    boxes["name"] = _text(draw, left, top, brand.name, name_font, brand.ink)
    boxes["line"] = _text(draw, left + 4, top + name_h + gap, brand.line, line_font, line_fill)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    return boxes


def crops(banner_path: Path, out_dir: Path) -> dict[str, Path]:
    """The three views YouTube cuts from one banner: TV (all of it), desktop and phone."""
    img = Image.open(banner_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    x0, y0, x1, y1 = safe_box()
    views = {"tv": img, "desktop": img.crop((0, y0, BANNER[0], y1)), "phone": img.crop((x0, y0, x1, y1))}
    paths = {}
    for name, view in views.items():
        paths[name] = out_dir / f"{name}.png"
        view.save(paths[name])
    return paths


def watermark(picture_path: Path, out: Path) -> Path:
    """The 150x150 video watermark: the picture cut to a circle."""
    img = Image.open(picture_path).convert("RGBA").resize((WATERMARK, WATERMARK), Image.LANCZOS)
    mask = Image.new("L", (WATERMARK, WATERMARK), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, WATERMARK - 1, WATERMARK - 1), fill=255)
    img.putalpha(mask)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    build = parser.add_subparsers(dest="command", required=True).add_parser(
        "build", help="write avatar.png, banner.png, watermark.png and crops/ for a channel"
    )
    build.add_argument("slug")
    build.add_argument("-o", "--out", type=Path, required=True)
    build.add_argument("--picture", type=Path, help="the illustration to use as the picture")
    build.add_argument("--scene", type=Path, help="the illustrated scene behind the banner lettering")
    args = parser.parse_args(argv)
    try:
        avatar = picture(args.slug, args.out / "avatar.png", source=args.picture)
        banner(args.slug, args.out / "banner.png", scene=args.scene)
        crops(args.out / "banner.png", args.out / "crops")
        watermark(avatar, args.out / "watermark.png")
    except PageError as err:
        print(f"error: {err}", file=sys.stderr)
        return 1
    print(f"built {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
