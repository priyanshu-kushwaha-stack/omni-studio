"""viewer_required: false (pipeline v2, section 2): a round ships on story and fact; a late viewer never holds it."""

from __future__ import annotations

import json

import pytest

from studio.room import config as C
from studio.room import evidence as E
from studio.room import report as R
from studio.room import snapshot as S
from studio.room.ledger import Ledger
from studio.room.verdict import verdict_digest

ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
"""
MODEL = {"xai": "grok-4.7-high", "openai": "gpt-5.6-sol-high", "google": "gemini-3.7-flash-high"}
STORY_FACT = (("story", "story", "openai"), ("fact", "fact", "google"))


def _cfg(tmp_path, extra=""):
    (tmp_path / "room.yaml").write_text(ROOM + extra)
    return C.load_room(tmp_path / "room.yaml")


def test_required_roles_default_and_optional_viewer(tmp_path):
    assert C.required_roles(_cfg(tmp_path)) == ("viewer", "story", "fact")
    assert C.required_roles(_cfg(tmp_path, "viewer_required: false\n")) == ("story", "fact")


def test_viewer_required_must_be_a_boolean(tmp_path):
    with pytest.raises(C.RoomConfigError):
        _cfg(tmp_path, "viewer_required: maybe\n")


def test_an_optional_viewer_seat_may_be_left_out(tmp_path):
    # Owner, 2026-11-11 (three films a week): one reviewer plus the claims check; was "the seat must still exist".
    cfg = _cfg(tmp_path, "viewer_required: false\n")
    cfg.seats = [s for s in cfg.seats if s.role != "viewer"]
    assert not any("missing mandatory role" in p for p in C.validate(cfg))


def test_the_cap_leaves_room_for_owner_notes_rounds(tmp_path):
    cfg = _cfg(tmp_path, "viewer_required: false\n")
    assert C.derived_cap(cfg) == 1 * (3 + 2) + 1 * 3 + 2 + 2 + 3 * 2  # 18


def _setup(tmp_path, seats, required):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    script = video / "script.md"
    script.write_text("You stop.\n")
    sha = S.save_draft(video, script)
    db = Ledger(tmp_path / "l.sqlite")
    R.write_meta(video, "g2", 1, sha, {"ok": True, "problems": [], "warnings": []})
    for seat, role, fam in seats:
        cid = db.reserve(
            channel="ss",
            video=video.name,
            gate="g2",
            round=1,
            seat=seat,
            model=MODEL[fam],
            family=fam,
            prompt_sha256="p",
            daily_cap=99,
            script_cap=99,
        )
        rec = {
            "draft_sha256": sha,
            "call_id": cid,
            "seat": seat,
            "role": role,
            "model": MODEL[fam],
            "family": fam,
            "status": "ok",
            "scores": {},
            "blockers": [],
            "suggestions": [],
            "keep": [],
            "error": "",
            "output_sha256": "o-" + seat,
        }
        db.finish(cid, status="ok", output_sha256="o-" + seat, duration_s=1, verdict_sha256=verdict_digest(rec))
        (R.round_dir(video, "g2", 1) / f"{seat}.json").write_text(json.dumps(rec))
    rep = R.build_report(
        video,
        gate="g2",
        stage="story_script",
        channel="ss",
        writer_family="anthropic",
        ledger=db,
        cap=18,
        required=required,
    )
    return video, script, rep, db


def test_a_round_without_the_viewer_ships_when_the_viewer_is_optional(tmp_path):
    video, script, rep, db = _setup(tmp_path, STORY_FACT, ("story", "fact"))
    assert rep["shipped"]["round"] == 1 and rep["required_roles"] == ["story", "fact"]
    assert E.verify(video, rep, script, db) == []


def test_without_the_option_a_missing_viewer_still_ships_nothing(tmp_path):
    _, _, rep, _ = _setup(tmp_path, STORY_FACT, C.MANDATORY)
    assert rep["shipped"] is None


@pytest.mark.parametrize("roles", [["story"], ["fact", "viewer"], ["story", "fact", "craft"], "story"])
def test_a_report_that_drops_story_or_fact_fails_verify(tmp_path, roles):
    video, script, rep, db = _setup(tmp_path, STORY_FACT, ("story", "fact"))
    rep["required_roles"] = roles
    assert any("required roles" in p for p in E.verify(video, rep, script, db))
