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
    # adapted: a fact seat's blockers are never demoted (final fix 1), so the demotion is pinned on a story seat
    data = {**GOOD, "blockers": [{"quote": "x", "why": "pacing", "fix": "cut", "domain": "fact"}]}
    out = v.parse_verdict(json.dumps(data), **{**META, "role": "story", "seat": "story editor"})
    assert out.blockers == []
    assert out.suggestions[-1]["moved"] == "blocker outside the story role"


@pytest.mark.parametrize("text", ["no json here", "[1, 2]", '{"blockers": [{"why": "no quote"}]}',
                                  '{"scores": [1]}', '{"blockers": 5}', '{}', '{"error": "refused"}'])
def test_malformed_output_is_refused(text):
    with pytest.raises(v.BadVerdict):
        v.parse_verdict(text, **META)


def test_round_trip_with_a_blocker():
    out = v.parse_verdict(json.dumps(GOOD), **META)
    assert v.Verdict.from_dict(out.to_dict()) == out


def test_failed_verdict_and_round_trip():
    out = v.failed_verdict(error="exit 1", **META)
    assert out.status == "failed" and out.blockers == []
    assert v.Verdict.from_dict(out.to_dict()) == out


@pytest.mark.parametrize("domain", ["Fact", "fact-check", "accuracy", " FACT ", None, ""])
def test_a_fact_blocker_is_never_demoted(domain):
    b = {"quote": "x", "why": "wrong year", "fix": "fix"}
    if domain is not None:
        b["domain"] = domain
    out = v.parse_verdict(json.dumps({"blockers": [b]}), **META)
    assert len(out.blockers) == 1 and out.suggestions == []


def test_a_story_blocker_on_a_viewer_seat_still_moves_to_suggestions():
    data = {"blockers": [{"quote": "x", "why": "w", "fix": "f", "domain": "story"}]}
    out = v.parse_verdict(json.dumps(data), **{**META, "role": "viewer", "seat": "cold viewer"})
    assert out.blockers == [] and out.suggestions[-1]["moved"] == "blocker outside the viewer role"


def test_a_blocker_without_a_domain_stays_a_blocker_on_any_seat():
    data = {"blockers": [{"quote": "x", "why": "w", "fix": "f"}]}
    out = v.parse_verdict(json.dumps(data), **{**META, "role": "story"})
    assert len(out.blockers) == 1 and out.blockers[0].domain == "story"


def test_suggestions_and_keep_are_shape_checked():
    data = {"suggestions": ["cut this", {"quote": "q"}, 5, None, ["x"]], "keep": ["the fire", 3, {"quote": "k"}]}
    out = v.parse_verdict(json.dumps(data), **META)
    assert out.suggestions == [{"quote": "cut this"}, {"quote": "q"}]
    assert out.keep == [{"quote": "the fire"}, {"quote": "k"}]


@pytest.mark.parametrize("field", ["quote", "why", "fix"])
def test_a_non_fact_blocker_with_an_empty_part_is_a_suggestion(field):
    b = {"quote": "q", "why": "w", "fix": "f", "domain": "story", "line": 3}
    b[field] = "  "
    out = v.parse_verdict(json.dumps({"blockers": [b]}), **{**META, "role": "story", "seat": "story editor"})
    assert out.blockers == [] and len(out.suggestions) == 1
    assert out.suggestions[0]["moved"] and out.suggestions[0]["line"] == 3


def test_a_missing_fix_on_a_non_fact_blocker_is_demoted_too():
    b = {"quote": "q", "why": "w", "domain": "story"}
    out = v.parse_verdict(json.dumps({"blockers": [b]}), **{**META, "role": "story", "seat": "story editor"})
    assert out.blockers == [] and len(out.suggestions) == 1


def test_a_fact_blocker_with_empty_parts_stays_a_blocker():
    b = {"quote": "", "why": "", "fix": "", "domain": "fact"}
    out = v.parse_verdict(json.dumps({"blockers": [b]}), **META)
    assert len(out.blockers) == 1 and out.suggestions == []


def test_a_complete_non_fact_blocker_stays_a_blocker():
    b = {"quote": "q", "why": "w", "fix": "f", "domain": "story"}
    out = v.parse_verdict(json.dumps({"blockers": [b]}), **{**META, "role": "story", "seat": "story editor"})
    assert len(out.blockers) == 1


def test_a_first_fence_that_is_not_json_falls_back_to_the_last_fence():
    text = "Example:\n```\n{not: json}\n```\nAnswer:\n```json\n" + json.dumps(GOOD) + "\n```"
    assert v.parse_verdict(text, **META).status == "ok"


def test_a_bad_fence_inside_a_good_object_falls_back_to_the_outer_braces():
    text = 'Here: {"scores": {"x": 1}, "note": "see ```{oops}``` above"} thanks'
    assert v.extract_json(text)["scores"] == {"x": 1}


def test_text_with_no_parseable_object_is_still_refused():
    with pytest.raises(v.BadVerdict):
        v.extract_json("```\n{nope}\n```\nand {also nope}")
