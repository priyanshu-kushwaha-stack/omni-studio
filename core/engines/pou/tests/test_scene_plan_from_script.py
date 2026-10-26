import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from scene_plan_from_script import build_plan, classify, parse_script  # noqa: E402
from scene_plan_check import check_scene_plan  # noqa: E402

SCRIPT = """# Script
template: mystery
target_minutes: 1
status: draft
hook: hooks/hook-1.md

## [00:00] Open
> VISUAL: a ring of twenty figures around a fire
one two three four five six.
> VISUAL: a bar card draws 5.7 to 7.1
seven eight nine *ten* (c01).

## [00:10] Body
> VISUAL: a map of Africa draws in
eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty.

## Chapters
00:00 Open
## Sources
- https://example.org
"""


def words(n, step=0.8):
    return [{"word": f"w{i}", "start": round(i * step, 2), "end": round(i * step + 0.5, 2)} for i in range(n)]


def test_parse_beats_and_words():
    beats = parse_script(SCRIPT)
    assert [b["section"] for b in beats] == ["Open", "Open", "Body"]
    assert len(beats[0]["words"]) == 6 and len(beats[1]["words"]) == 4 and len(beats[2]["words"]) == 10


def test_classify():
    assert classify("a bar card draws")[0] == "card"
    assert classify("a map of Africa")[0] == "illustration"
    assert classify('the "you" figure yawns')[0] == "character"
    assert classify("a candle burns")[0] == "illustration"


def test_plan_is_contiguous_classified_and_split():
    plan = build_plan(SCRIPT, words(20), hook_seconds=60, hook_hold=4.0, tail_seconds=0)
    scenes = plan["scenes"]
    assert scenes[0]["start_seconds"] == 0.0
    for a, b in zip(scenes, scenes[1:]):
        assert b["start_seconds"] == a["end_seconds"]
    # the 10-word body beat spans ~8 s and must be split into sub-scenes of <= 4 s (hook limit applies)
    assert all(s["end_seconds"] - s["start_seconds"] <= 4.0 + 1e-6 for s in scenes)
    classes = plan["metadata"]["change_classes"]
    assert set(classes.values()) <= {"motion", "card", "illustration", "character", "hero"}
    first_of = {sc["description"]: classes[sc["id"]] for sc in scenes if sc["required_assets"]}
    assert first_of["a ring of twenty figures around a fire"] == "character"
    assert first_of["a bar card draws 5.7 to 7.1"] == "card"
    assert any(v == "motion" for v in classes.values())
    findings = {f.rule: f.ok for f in check_scene_plan(plan)}
    assert findings["classified"] and findings["holds"] and findings["coverage"]


def test_tail_is_split_into_short_motion_scenes():
    plan = build_plan(SCRIPT, words(20), tail_seconds=12, body_hold=6.0)
    tail = [s for s in plan["scenes"] if s["description"].startswith("end-screen hold")]
    assert len(tail) == 2 and all(s["end_seconds"] - s["start_seconds"] <= 6.0 for s in tail)
    assert all(plan["metadata"]["change_classes"][s["id"]] == "motion" for s in tail)


def test_schema_fields_only(tmp_path: Path):
    plan = build_plan(SCRIPT, words(20))
    allowed = {"id", "type", "description", "start_seconds", "end_seconds", "script_section_id", "framing",
               "movement", "transition_in", "transition_out", "overlay_notes", "shot_language", "shot_intent",
               "narrative_role", "information_role", "hero_moment", "character_actions", "texture_keywords",
               "required_assets"}
    for s in plan["scenes"]:
        assert set(s) <= allowed
    json.dumps(plan)


def test_scene_ids_are_stable_across_narration_pace():
    """A faster or slower read changes how many continuation segments a beat needs, never the
    ids that stills, clips and overlays are keyed by."""
    slow = build_plan(SCRIPT, words(20, step=1.6), tail_seconds=12, body_hold=6.0)
    fast = build_plan(SCRIPT, words(20, step=0.4), tail_seconds=12, body_hold=6.0)
    firsts = lambda p: [s["id"] for s in p["scenes"] if s["required_assets"]]  # noqa: E731
    assert firsts(slow) == firsts(fast) == ["s001", "s002", "s003"]
    conts = [s["id"] for s in slow["scenes"] if s["id"].startswith("s003") and not s["required_assets"]]
    assert conts and conts[0] == "s003c1"
    assert all(s["id"].startswith("e") for s in fast["scenes"] if "end-screen" in s["description"])
