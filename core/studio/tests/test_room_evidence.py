"""What the A2 gate check verifies: the shipped draft is the file, the roles and families held, the ledger agrees."""

from __future__ import annotations

import json

from studio.room import evidence as E
from studio.room import report as R
from studio.room import snapshot as S
from studio.room.ledger import Ledger


def _setup(tmp_path, fact_family="google", fact_blockers=()):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    script = video / "script.md"
    script.write_text("PROF: Two sleeps (c01).\n")
    sha = S.save_draft(video, script)
    db = Ledger(tmp_path / "l.sqlite")
    R.write_meta(video, "g2", 1, sha, {"ok": True, "problems": [], "warnings": []})
    for seat, role, fam in (("viewer", "viewer", "xai"), ("story", "story", "openai"), ("fact", "fact", fact_family)):
        cid = db.reserve(channel="pou", video=video.name, gate="g2", round=1, seat=seat, model="m", family=fam,
                         prompt_sha256="p", daily_cap=99, script_cap=99)
        db.finish(cid, status="ok", output_sha256="out-" + seat, duration_s=1)
        blockers = list(fact_blockers) if role == "fact" else []
        (R.round_dir(video, "g2", 1) / f"{seat}.json").write_text(json.dumps(
            {"call_id": cid, "seat": seat, "role": role, "model": "m", "family": fam, "status": "ok", "scores": {},
             "blockers": blockers, "suggestions": [], "keep": [], "error": "", "output_sha256": "out-" + seat}))
    report = R.build_report(video, gate="g2", stage="dialogue_script", channel="pou", writer_family="anthropic",
                            ledger=db, cap=29)
    return video, script, report, db


def test_a_clean_room_passes(tmp_path):
    video, script, report, db = _setup(tmp_path)
    assert E.verify(video, report, script, db) == []


def test_an_edit_after_the_room_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    script.write_text("PROF: Eight hours (c01).\n")
    assert any("changed since the room reviewed it" in p for p in E.verify(video, report, script, db))


def test_a_mandatory_seat_on_the_writer_family_fails(tmp_path):
    video, script, report, db = _setup(tmp_path, fact_family="anthropic")
    problems = E.verify(video, report, script, db)
    assert any("writer's family" in p for p in problems)


def test_an_edited_verdict_file_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    f = R.round_dir(video, "g2", 1) / "viewer.json"
    data = json.loads(f.read_text())
    data["output_sha256"] = "forged"
    f.write_text(json.dumps(data))
    assert any("viewer" in p and "edited" in p for p in E.verify(video, report, script, db))


def test_a_verdict_missing_from_the_ledger_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    assert any("not in the call ledger" in p for p in E.verify(video, report, script, Ledger(tmp_path / "other.sqlite")))


def test_no_shipped_draft_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    report["shipped"] = None
    assert E.verify(video, report, script, db) == ["the room shipped no draft (no lint- and fact-clean round)"]


def test_over_the_cap_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    report["calls"], report["cap"] = 30, 29
    assert any("cap" in p for p in E.verify(video, report, script, db))
