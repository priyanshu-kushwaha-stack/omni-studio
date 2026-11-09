import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import overlay_check as oc  # noqa: E402


def test_shorts_forbid_youtube_ui_areas():
    zones = oc.forbidden_zones(1080, 1920, t=5.0, total=50.0)
    # bottom title/channel strip and the right-hand button column are covered by the Shorts player
    assert oc.overlap((100, 1700, 300, 1800), zones) > 0
    assert oc.overlap((950, 1200, 1050, 1300), zones) > 0
    assert oc.overlap((300, 300, 700, 400), zones) == 0


def test_long_form_forbids_end_screen_third_only_at_the_end():
    early = oc.forbidden_zones(1920, 1080, t=10.0, total=300.0)
    late = oc.forbidden_zones(1920, 1080, t=292.0, total=300.0)
    box = (1500, 400, 1700, 500)
    assert oc.overlap(box, early) == 0
    assert oc.overlap(box, late) > 0


def test_ink_fraction_counts_drawing_under_the_box():
    mask = np.zeros((100, 200), bool)
    mask[:, 100:] = True  # right half is drawing
    assert oc.ink_fraction((0, 0, 50, 50), mask) == 0.0
    assert oc.ink_fraction((75, 0, 125, 50), mask) == 0.5


def test_judge_flags_ink_ui_and_clash():
    mask = np.zeros((1920, 1080), bool)
    mask[800:1200, 300:800] = True  # a figure in the middle
    zones = oc.forbidden_zones(1080, 1920, 5.0, 50.0)
    ok = oc.judge((340, 200, 740, 300), mask, zones, [], (1080, 1920))
    assert ok["verdict"] == "ok"
    on_figure = oc.judge((340, 900, 740, 1000), mask, zones, [], (1080, 1920))
    assert on_figure["verdict"] == "fail" and "drawing" in on_figure["why"]
    clash = oc.judge((340, 200, 740, 300), mask, zones, [(500, 250, 900, 350)], (1080, 1920))
    assert clash["verdict"] == "fail" and "overlaps" in clash["why"]
    off = oc.judge((900, 200, 1200, 300), mask, zones, [], (1080, 1920))
    assert off["verdict"] == "fail" and "frame" in off["why"]


def test_find_spot_moves_a_label_off_the_drawing_and_stays_close():
    mask = np.zeros((1920, 1080), bool)
    mask[300:1500, 200:880] = True  # big drawing, empty paper above and below
    zones = oc.forbidden_zones(1080, 1920, 5.0, 50.0)
    pos = oc.find_spot((400, 100), mask, zones, [], (1080, 1920), prefer=(0.5, 0.3))
    assert pos is not None
    cx, cy = pos[0] * 1080, pos[1] * 1920
    box = (cx - 200, cy - 50, cx + 200, cy + 50)
    assert oc.judge(box, mask, zones, [], (1080, 1920))["verdict"] == "ok"
    assert cy < 300  # the nearest clear paper is above the drawing, not below


def test_text_on_a_face_fails_even_on_light_ink():
    mask = np.zeros((1920, 1080), bool)
    zones = oc.forbidden_zones(1080, 1920, 5.0, 50.0)
    j = oc.judge((300, 1000, 700, 1100), mask, zones, [], (1080, 1920), faces=[(400, 950, 600, 1150)])
    assert j["verdict"] == "fail" and "face" in j["why"]


def test_face_boxes_cover_every_character_of_a_dialogue_shot(tmp_path):
    import json

    anim = {
        "characters": {
            "s001": [
                {"name": "you", "eyes": [[400, 300, 30]], "mouth": [390, 380, 40]},
                {"name": "oog", "eyes": [[1400, 500, 28]]},
            ]
        },
        "copies": {"s001x05": "s001"},
    }
    (tmp_path / "anim.json").write_text(json.dumps(anim))
    boxes = oc.face_boxes(tmp_path, 1920, 1080)
    assert len(boxes["s001"]) == 2 and boxes["s001x05"] == boxes["s001"]
    you, oog = sorted(boxes["s001"])
    assert you[0] < 400 < you[2] and you[1] < 380 < you[3]  # eye and mouth inside
    assert oog[0] < 1400 < oog[2]


def test_parts_of_one_quiz_do_not_clash_but_two_quizzes_do():
    assert oc.same_quiz({"quiz": "q2"}, {"quiz": "q2"})
    assert not oc.same_quiz({"quiz": "q2"}, {"quiz": "q3"})
    assert not oc.same_quiz({}, {})
