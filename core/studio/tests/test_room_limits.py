"""Per-seat caps (pipeline v2, section 4): at most N blockers, suggestions and keep lines; fact blockers are never cut."""

from __future__ import annotations

import json

import pytest

from studio.room import call
from studio.room import config as C
from studio.room.verdict import parse_verdict

LIMITS = {"blockers": 3, "suggestions": 3, "keep": 3}


def _b(i, domain="story"):
    return {"line": i, "quote": f"line {i}", "why": "flat", "fix": f"fix {i}", "domain": domain}


def _parse(role, data, limits=LIMITS):
    return parse_verdict(json.dumps(data), call_id="c", seat="s", role=role, model="m", family="f", limits=limits)


def test_a_seat_keeps_its_first_three_blockers_and_records_the_rest():
    v = _parse("story", {"blockers": [_b(i) for i in range(5)], "suggestions": [], "keep": []})
    assert [b.line for b in v.blockers] == [0, 1, 2]
    assert v.trimmed == {"blockers": 2}


def test_fact_blockers_are_never_trimmed():
    v = _parse("fact", {"blockers": [_b(i, "fact") for i in range(5)]})
    assert len(v.blockers) == 5 and v.trimmed == {}


def test_suggestions_and_keep_lines_are_capped():
    items = [{"quote": f"q{i}", "fix": "x"} for i in range(6)]
    v = _parse("craft", {"blockers": [], "suggestions": items, "keep": [f"k{i}" for i in range(4)]})
    assert len(v.suggestions) == 3 and len(v.keep) == 3
    assert v.trimmed == {"suggestions": 3, "keep": 1}


def test_no_limits_means_no_cap():
    v = _parse("story", {"blockers": [_b(i) for i in range(5)]}, limits=None)
    assert len(v.blockers) == 5 and v.trimmed == {}


def test_the_prompt_states_the_caps():
    text = call.seat_prompt("brief", "story", {"draft": "a"}, LIMITS)
    assert "at most 3 blockers" in text and "worst first" in text
    assert "at most 3 blockers" not in call.seat_prompt("brief", "story", {"draft": "a"})


BASE = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
"""


def test_room_yaml_limits_reach_every_seat(tmp_path):
    (tmp_path / "room.yaml").write_text(BASE + "limits: {blockers: 3, suggestions: 3, keep: 3}\n")
    cfg = C.load_room(tmp_path / "room.yaml")
    assert cfg.limits == LIMITS and all(s.limits == LIMITS for s in cfg.seats)


@pytest.mark.parametrize("bad", ["limits: 3", "limits: {blockers: 0}", "limits: {vetoes: 2}", "limits: {keep: x}"])
def test_bad_limits_are_config_errors(tmp_path, bad):
    (tmp_path / "room.yaml").write_text(BASE + bad + "\n")
    with pytest.raises(C.RoomConfigError):
        C.load_room(tmp_path / "room.yaml")
