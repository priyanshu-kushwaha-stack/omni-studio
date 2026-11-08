"""Verdicts: what a seat returns, parsed strictly."""

from __future__ import annotations

import json

import pytest

from studio.room import verdict as v

META = dict(call_id="c1", seat="fact reviewer", role="fact", model="gemini-3.7-flash-high", family="google")
GOOD = {"scores": {"accuracy": 7},
        "blockers": [{"line": 4, "quote": "eight hours", "why": "c04 is about Europe", "fix": "re-scope", "domain": "fact"}],
        "suggestions": [{"line": 2, "quote": "and then", "fix": "But"}],
        "keep": [{"line": 5, "quote": "the fire got low"}]}


def test_a_fenced_verdict_parses():
    text = "Here you go:\n```json\n" + json.dumps(GOOD) + "\n```"
    out = v.parse_verdict(text, **META)
    assert out.status == "ok"
    assert out.blockers[0].quote == "eight hours" and out.blockers[0].line == 4
    assert out.keep == GOOD["keep"]


def test_a_blocker_outside_the_seat_role_becomes_a_suggestion():
    data = {**GOOD, "blockers": [{"quote": "x", "why": "pacing", "fix": "cut", "domain": "story"}]}
    out = v.parse_verdict(json.dumps(data), **META)
    assert out.blockers == []
    assert out.suggestions[-1]["moved"] == "blocker outside the fact role"


@pytest.mark.parametrize("text", ["no json here", "[1, 2]", '{"blockers": [{"why": "no quote"}]}',
                                  '{"scores": [1]}'])
def test_malformed_output_is_refused(text):
    with pytest.raises(v.BadVerdict):
        v.parse_verdict(text, **META)


def test_failed_verdict_and_round_trip():
    out = v.failed_verdict(error="exit 1", **META)
    assert out.status == "failed" and out.blockers == []
    assert v.Verdict.from_dict(out.to_dict()) == out
