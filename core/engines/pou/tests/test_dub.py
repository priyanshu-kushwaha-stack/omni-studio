import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from dub import beats, pair, plan_fit, units, windows  # noqa: E402

EN = """# Script
status: approved

## [00:00] One
> VISUAL: a thing draws in
Ancient humans did not sleep *eight* hours (c01).
Second line.
> VISUAL: a counter ticks
Twenty nights (c12).

## [00:45] Two
> RE-ENGAGE: turn
> VISUAL: a timeline
The formula (c34).

## Chapters
00:00 x
"""

HI = """# Script, dub
status: draft

## [00:00] One
> VISUAL: a thing draws in
पुराने इंसान *आठ* घंटे नहीं सोते थे (c01)। दूसरी लाइन।
> VISUAL: a counter ticks
बीस रातें (c12)।

## [00:45] Two
> VISUAL: a timeline
फ़ॉर्मूला (c34)।
"""

PLAN = {
    "scenes": [
        {"id": "s001", "start_seconds": 0.0, "end_seconds": 3.0},
        {"id": "s001c1", "start_seconds": 3.0, "end_seconds": 6.0},
        {"id": "s002", "start_seconds": 6.0, "end_seconds": 8.0},
        {"id": "s003", "start_seconds": 8.0, "end_seconds": 20.0},
        {"id": "e01", "start_seconds": 20.0, "end_seconds": 30.0},
    ]
}


def test_beats_collect_spoken_lines_per_visual_and_strip_marks():
    b = beats(HI)
    assert [x.section for x in b] == ["[00:00] One", "[00:00] One", "[00:45] Two"]
    assert b[0].text == "पुराने इंसान आठ घंटे नहीं सोते थे। दूसरी लाइन।"
    assert beats(EN)[0].text == "Ancient humans did not sleep eight hours. Second line."


def test_pair_accepts_a_mirror_and_reports_drift():
    assert pair(beats(EN), beats(HI)) == []
    bad = HI.replace("(c12)", "(c13)").replace("> VISUAL: a timeline", "> VISUAL: a ruler")
    problems = pair(beats(EN), beats(bad))
    assert any("beat 2: claim refs differ" in p for p in problems)
    assert any("beat 3: VISUAL line differs" in p for p in problems)
    assert len(pair(beats(EN), beats(HI)[:2])) == 1


def test_windows_come_from_beat_scene_starts_and_run_to_plan_end():
    assert windows(PLAN, 3) == [(0.0, 6.0), (6.0, 8.0), (8.0, 30.0)]


def test_short_windows_merge_into_the_next_beat():
    us = units(beats(HI), windows(PLAN, 3), min_window=3.5)
    assert [u["id"] for u in us] == ["u001", "u002"]
    assert us[1]["beats"] == [2, 3] and us[1]["start"] == 6.0 and us[1]["end"] == 30.0
    assert us[1]["text"].startswith("बीस रातें। फ़ॉर्मूला")


def test_plan_fit_speeds_up_within_limit_and_flags_overruns():
    us = [
        {"id": "u001", "start": 0.0, "end": 6.0},
        {"id": "u002", "start": 6.0, "end": 8.0},
        {"id": "u003", "start": 8.0, "end": 20.0},
    ]
    rows = plan_fit(us, [4.0, 3.0, 5.0], gap=0.35, max_speed=1.12)
    assert rows[0]["status"] == "ok" and rows[0]["speed"] == 1.0
    assert rows[1]["status"] == "OVER" and rows[1]["speed"] == 1.12
    # the overrun pushes the next unit back instead of overlapping it
    assert rows[2]["placed"][0] > 8.0 and rows[2]["status"] == "ok"
    fast = plan_fit(us[:1], [6.0], gap=0.35, max_speed=1.12)[0]
    assert fast["status"] == "fast" and 1.0 < fast["speed"] <= 1.12
