from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from scene_plan_check import changes_per_minute, check_scene_plan  # noqa: E402


def make_plan(seconds=120, hook_hold=3, body_hold=5, body_type="generated", body_movement="static",
              classify=True, exceptions=None):
    """Hook (first 60 s) in hook_hold steps, then body in body_hold steps. Classes cycle."""
    scenes, t, i = [], 0.0, 0
    cycle = ["illustration", "motion", "card", "character", "hero"]
    while t < seconds:
        hold = hook_hold if t < 60 else body_hold
        end = min(t + hold, seconds)
        scenes.append({"id": f"s{i:03d}", "type": "generated" if t < 60 else body_type,
                       "description": "x", "start_seconds": t, "end_seconds": end,
                       "movement": "static" if t < 60 else body_movement})
        t, i = end, i + 1
    meta = {"change_classes": {s["id"]: cycle[k % 5] for k, s in enumerate(scenes)} if classify else {}}
    if exceptions:
        meta["minute_exceptions"] = exceptions
    return {"version": "1.0", "style_playbook": "stickman-explainer", "scenes": scenes, "metadata": meta}


def by_rule(findings):
    return {f.rule: f for f in findings}


def test_clean_plan_passes():
    f = by_rule(check_scene_plan(make_plan()))
    assert all(x.ok for x in f.values()), [x for x in f.values() if not x.ok]


def test_changes_per_minute_counts_scene_starts():
    assert changes_per_minute(make_plan()["scenes"]) == [20, 12]


def test_sparse_minute_fails_density_only():
    # evolving diagrams held 10 s: holds are allowed (<= 12 s) but only 6 changes in minute 2
    plan = make_plan(body_hold=10, body_type="diagram", body_movement="draw-on")
    f = by_rule(check_scene_plan(plan))
    assert not f["density"].ok and "minute 2" in f["density"].detail
    assert f["holds"].ok


def test_minute_exception_with_reason_allows_sparse_minute():
    plan = make_plan(body_hold=10, body_type="diagram", body_movement="draw-on",
                     exceptions=[{"minute": 2, "reason": "map route evolving for the whole minute"}])
    assert by_rule(check_scene_plan(plan))["density"].ok


def test_static_hold_over_6s_fails():
    f = by_rule(check_scene_plan(make_plan(body_hold=7)))
    assert not f["holds"].ok and "7.0 s > 6 s" in f["holds"].detail


def test_hook_hold_over_4s_fails():
    f = by_rule(check_scene_plan(make_plan(hook_hold=5)))
    assert not f["holds"].ok and "> 4 s" in f["holds"].detail


def test_unclassified_scene_fails():
    f = by_rule(check_scene_plan(make_plan(classify=False)))
    assert not f["classified"].ok


def test_gap_between_scenes_fails():
    plan = make_plan()
    plan["scenes"][30]["start_seconds"] += 1.0  # opens a 1 s hole after scene 29
    f = by_rule(check_scene_plan(plan))
    assert not f["coverage"].ok
