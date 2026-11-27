import sys
from pathlib import Path

import yaml
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import rig  # noqa: E402
import slice as slicer  # noqa: E402

SIZES = [(120, 140), (140, 220), (50, 140), (45, 150), (50, 140), (45, 150), (50, 130), (55, 160), (50, 130), (55, 160)]


def sheet(path: Path) -> Path:
    img = Image.new("RGB", (1400, 600), "white")
    d = ImageDraw.Draw(img)
    x = 20
    for i, (w, h) in enumerate(SIZES):
        y = 20 if i < 5 else 320
        if i == 5:
            x = 20
        d.rectangle([x, y, x + w, y + h], fill=(200, 160, 130) if i == 0 else (60, 120, 90))
        x += w + 60
    img.save(path)
    return path


def test_slice_finds_ten_pieces_in_reading_order(tmp_path):
    pieces = slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "out", "t")
    assert [p["name"] for p in pieces] == [f"t_{k}.png" for k in range(10)]
    assert pieces[0]["box"][1] < pieces[5]["box"][1]


def test_rig_character_builds_a_cast_entry(tmp_path):
    slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "pieces", "t")
    m = tmp_path / "t.yaml"
    m.write_text(
        yaml.safe_dump(
            {
                "id": "tester",
                "sheet": "t",
                "pieces": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                "hip": 0.6,
                "roles": ["friend"],
                "signature": "green cap",
            }
        )
    )
    entry = rig.rig_character(m, tmp_path / "pieces")
    assert entry["head"]["src"] == "cast/pieces/t_0.png"
    assert entry["hip"] == 0.6 and entry["roles"] == ["friend"]
    p = entry
    expect = p["thighL"]["h"] * 0.86 + p["shinL"]["h"] * 0.95 + p["torso"]["h"] * 0.6 + p["head"]["h"] * 0.95
    assert abs(entry["height"] - expect) < 1e-6
    assert len(entry["sh"]) == 2 and len(entry["face"]) == 3


def test_top_and_flip_refs_make_derived_pieces(tmp_path):
    slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "pieces", "t")
    m = tmp_path / "t.yaml"
    m.write_text(
        yaml.safe_dump(
            {
                "id": "x",
                "sheet": "t",
                "pieces": [0, 1, 2, 3, 4, 5, "7top", 7, "9top", "9flip"],
                "hip": 0.6,
                "roles": [],
                "signature": "",
            }
        )
    )
    e = rig.rig_character(m, tmp_path / "pieces")
    full = Image.open(tmp_path / "pieces" / "t_7.png")
    assert e["thighL"]["h"] == int(full.height * 0.52)
    assert e["shinR"]["src"].endswith("x_shinR.png")


def _rigged_dir(tmp_path):
    import json

    slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "cast" / "pieces", "t")
    m = tmp_path / "t.yaml"
    m.write_text(yaml.safe_dump({"id": "tester", "sheet": "t", "pieces": list(range(10)), "hip": 0.6}))
    entry = rig.rig_character(m, tmp_path / "cast" / "pieces")
    (tmp_path / "cast" / "cast.json").write_text(json.dumps({"tester": entry}))
    return tmp_path


def test_check_sheet_lays_out_ten_pieces_and_a_rest_pose(tmp_path):
    root = _rigged_dir(tmp_path)
    out = rig.check_sheet(root, "tester", tmp_path / "check.png")
    im = Image.open(out)
    assert im.size == (rig.CHECK_W, rig.CHECK_H) and im.size == (1320, 860)
    # the assembled pose is drawn in its half, the pieces row in the top band
    assert im.crop((0, rig.CELL_H, rig.CHECK_W, rig.CHECK_H)).convert("L").getextrema()[0] < 250
    assert im.crop((0, 0, rig.CHECK_W, rig.CELL_H)).convert("L").getextrema()[0] < 250


def test_check_sheet_names_a_missing_character(tmp_path):
    import pytest

    root = _rigged_dir(tmp_path)
    with pytest.raises(SystemExit, match="nobody"):
        rig.check_sheet(root, "nobody", tmp_path / "c.png")
