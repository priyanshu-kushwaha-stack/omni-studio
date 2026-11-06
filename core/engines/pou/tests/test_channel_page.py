import sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import channel_page as cp  # noqa: E402


def _png(path: Path, size=(400, 400), color=(246, 241, 231)):
    Image.new("RGB", size, color).save(path)
    return path


def test_banner_size_and_text_inside_safe_area(tmp_path):
    mascot = _png(tmp_path / "m.png", (300, 300), (43, 43, 43))
    out = cp.banner(mascot, "Professor of Us", "How humans actually work", "New video every week", [], tmp_path / "b.png")
    img = Image.open(out)
    assert img.size == cp.BANNER
    for xy in [(10, 10), (2550, 10), (10, 1430), (2550, 1430)]:
        assert img.getpixel(xy) == cp.PAPER
    x0 = (cp.BANNER[0] - cp.SAFE[0]) // 2
    y0 = (cp.BANNER[1] - cp.SAFE[1]) // 2
    inside = img.crop((x0, y0, x0 + cp.SAFE[0], y0 + cp.SAFE[1])).convert("L")
    assert min(inside.getdata()) < 100


def test_crops_sizes(tmp_path):
    b = _png(tmp_path / "b.png", cp.BANNER)
    out = cp.crops(b, tmp_path / "crops")
    assert Image.open(out["tv"]).size == (2560, 1440)
    assert Image.open(out["desktop"]).size == (2560, 423)
    assert Image.open(out["phone"]).size == (1546, 423)


def test_contact_sheet_has_three_sizes_per_candidate(tmp_path):
    cands = [_png(tmp_path / f"{k}.png", (800, 800), (43, 43, 43)) for k in "ABC"]
    out = cp.contact_sheet(cands, tmp_path / "sheet.png")
    img = Image.open(out)
    assert img.size[0] >= 3 * 800 and img.size[1] >= 800 + 88 + 48


def test_watermark_is_square_with_transparent_corners(tmp_path):
    a = _png(tmp_path / "a.png", (800, 800), (43, 43, 43))
    out = cp.watermark(a, tmp_path / "w.png")
    img = Image.open(out)
    assert img.size == (150, 150) and img.mode == "RGBA"
    assert img.getpixel((0, 0))[3] == 0 and img.getpixel((75, 75))[3] == 255


def test_banner_text_stays_inside_safe_area_right_edge(tmp_path):
    mascot = _png(tmp_path / "m.png", (300, 300), (43, 43, 43))
    long_tag = "How humans actually work, actually lived, and what happens next, and more words"
    out = cp.banner(mascot, "Professor of Us", long_tag, "New video every week", [], tmp_path / "b.png")
    img = Image.open(out).convert("L")
    x0 = (cp.BANNER[0] - cp.SAFE[0]) // 2
    y0 = (cp.BANNER[1] - cp.SAFE[1]) // 2
    # the last 20 px column inside the safe area must be paper only (no glyph touches the edge)
    edge = img.crop((x0 + cp.SAFE[0] - 20, y0, x0 + cp.SAFE[0], y0 + cp.SAFE[1]))
    assert min(edge.getdata()) > 200
