"""Channel-page artwork: what a reviewer would otherwise check by eye."""

from __future__ import annotations

import dataclasses

import pytest
from PIL import Image

from studio import page

CODE_DRAWN = ("power-and-citizen", "see-underneath")
ALL = CODE_DRAWN + ("say-suppose",)


def _rgb(hex_colour: str) -> tuple[int, int, int]:
    return tuple(int(hex_colour[i : i + 2], 16) for i in (1, 3, 5))


def _scene(tmp_path):
    """A stand-in for the illustrated Say Suppose scene: any image, any size."""
    path = tmp_path / "scene.png"
    Image.new("RGB", (1024, 576), "#3A2F8F").save(path)
    return path


def _banner(slug, tmp_path):
    scene = _scene(tmp_path) if slug == "say-suppose" else None
    out = tmp_path / f"{slug}-banner.png"
    return out, page.banner(slug, out, scene=scene)


def _inside(box, outer):
    return box[0] >= outer[0] and box[1] >= outer[1] and box[2] <= outer[2] and box[3] <= outer[3]


def test_safe_box_is_centred_in_the_banner():
    assert page.BANNER == (2560, 1440)
    x0, y0, x1, y1 = page.safe_box()
    assert (x1 - x0, y1 - y0) == (1546, 423)
    assert x0 == 2560 - x1 and abs(y0 - (1440 - y1)) <= 1


@pytest.mark.parametrize("slug", CODE_DRAWN)
def test_mark_is_a_square_picture(slug):
    assert page.mark(slug).size == (800, 800)
    assert page.mark(slug, 150).size == (150, 150)


@pytest.mark.parametrize("slug", CODE_DRAWN)
def test_mark_ink_stays_inside_the_circle_youtube_crops_to(slug):
    size = 400
    img = page.mark(slug, size)
    ground = img.getpixel((2, 2))
    pixels = img.load()
    limit = (0.85 * size / 2) ** 2
    centre = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            if pixels[x, y] != ground:
                assert (x - centre) ** 2 + (y - centre) ** 2 <= limit, f"ink at {(x, y)}"


@pytest.mark.parametrize("slug", CODE_DRAWN)
def test_mark_uses_only_the_channels_colours(slug):
    brand = page.BRANDS[slug]
    palette = {_rgb(brand.ground), _rgb(brand.ink), _rgb(brand.accent)}
    img = page.mark(slug, 400)
    counts = {colour: n for n, colour in img.getcolors(maxcolors=400 * 400)}
    # Edge pixels blend two colours. Anything covering more than 0.5 % of the picture is a real fill.
    fills = {colour for colour, n in counts.items() if n > 0.005 * 400 * 400}
    assert fills == palette


def test_colours_are_the_ones_the_owner_approved():
    got = {slug: (b.ground, b.ink, b.accent) for slug, b in page.BRANDS.items()}
    assert got == {
        "say-suppose": ("#1F1B4D", "#FFC857", "#FF7A59"),
        "power-and-citizen": ("#14213D", "#F3EBDD", "#C8963E"),
        "see-underneath": ("#0B2E2B", "#EAF6F2", "#F2B441"),
    }


def test_say_suppose_has_no_code_drawn_picture():
    with pytest.raises(page.PageError, match="illustrated"):
        page.mark("say-suppose")


def test_unknown_channel_is_refused(tmp_path):
    with pytest.raises(page.PageError, match="no-such-channel"):
        page.mark("no-such-channel")
    with pytest.raises(page.PageError, match="no-such-channel"):
        page.banner("no-such-channel", tmp_path / "b.png")


@pytest.mark.parametrize("slug", ALL)
def test_banner_size_and_everything_inside_the_safe_area(slug, tmp_path):
    out, boxes = _banner(slug, tmp_path)
    assert Image.open(out).size == page.BANNER
    assert {"name", "line"} <= set(boxes)
    for what, box in boxes.items():
        assert _inside(box, page.safe_box()), f"{slug}: {what} {box} leaves the safe area"


@pytest.mark.parametrize("slug", CODE_DRAWN)
def test_code_drawn_banner_carries_the_mark_beside_the_name(slug, tmp_path):
    _, boxes = _banner(slug, tmp_path)
    assert boxes["mark"][2] < boxes["name"][0]


@pytest.mark.parametrize("slug", ALL)
def test_banner_name_and_line_do_not_overlap(slug, tmp_path):
    _, boxes = _banner(slug, tmp_path)
    assert boxes["name"][3] <= boxes["line"][1]


@pytest.mark.parametrize("slug", ALL)
def test_a_long_name_shrinks_instead_of_leaving_the_safe_area(slug, tmp_path, monkeypatch):
    long = dataclasses.replace(
        page.BRANDS[slug],
        name="A Much Longer Channel Name Than Any Real One",
        line="A banner line that also runs on for far longer than the real one does today",
    )
    monkeypatch.setitem(page.BRANDS, slug, long)
    _, boxes = _banner(slug, tmp_path)
    for what, box in boxes.items():
        assert _inside(box, page.safe_box()), f"{slug}: {what} {box} leaves the safe area"


def test_say_suppose_banner_needs_its_scene(tmp_path):
    with pytest.raises(page.PageError, match="scene"):
        page.banner("say-suppose", tmp_path / "b.png")


def test_say_suppose_lettering_keeps_to_the_left_and_leaves_the_scene_alone(tmp_path):
    out, boxes = _banner("say-suppose", tmp_path)
    x0, _, _, _ = page.safe_box()
    assert max(boxes["name"][2], boxes["line"][2]) <= x0 + 0.62 * page.SAFE[0]
    img = Image.open(out).convert("RGB")
    for spot in ((40, 40), (40, 1400), (1900, 720), (2500, 720)):
        assert img.getpixel(spot) == _rgb("#3A2F8F"), spot


def test_crops_are_the_three_views_youtube_shows(tmp_path):
    out, _ = _banner("see-underneath", tmp_path)
    paths = page.crops(out, tmp_path / "crops")
    assert {k: Image.open(p).size for k, p in paths.items()} == {
        "tv": (2560, 1440),
        "desktop": (2560, 423),
        "phone": (1546, 423),
    }


def test_picture_from_an_illustration_is_cropped_square_and_sized(tmp_path):
    source = tmp_path / "wide.png"
    Image.new("RGB", (1200, 1000), "#FF7A59").save(source)
    out = page.picture("say-suppose", tmp_path / "avatar.png", source=source)
    assert Image.open(out).size == (800, 800)


def test_picture_for_a_code_drawn_channel_is_its_mark(tmp_path):
    out = page.picture("power-and-citizen", tmp_path / "avatar.png")
    assert Image.open(out).convert("RGB").tobytes() == page.mark("power-and-citizen").tobytes()


def test_watermark_is_150_square_with_transparent_corners(tmp_path):
    avatar = page.picture("see-underneath", tmp_path / "avatar.png")
    img = Image.open(page.watermark(avatar, tmp_path / "watermark.png"))
    assert img.size == (150, 150) and img.mode == "RGBA"
    assert img.getpixel((0, 0))[3] == 0 and img.getpixel((75, 75))[3] == 255


def test_a_missing_font_fails_loudly():
    with pytest.raises(page.PageError, match="No Such Family"):
        page.load_font("No Such Family", "Bold", 40)


def test_command_line_builds_a_page_folder(tmp_path):
    assert page.main(["build", "see-underneath", "-o", str(tmp_path / "page")]) == 0
    made = {p.relative_to(tmp_path / "page").as_posix() for p in (tmp_path / "page").rglob("*.png")}
    assert made == {"avatar.png", "banner.png", "watermark.png", "crops/tv.png", "crops/desktop.png", "crops/phone.png"}
