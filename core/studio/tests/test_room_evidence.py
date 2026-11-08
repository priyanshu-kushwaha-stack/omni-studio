"""What the A2 gate check verifies: the shipped draft is the file, the roles and families held, the ledger agrees."""

from __future__ import annotations

import json

from studio.room import evidence as E
from studio.room import report as R
from studio.room import snapshot as S
from studio.room.ledger import Ledger
from studio.room.verdict import verdict_digest


def _record(cid, seat, role, fam, blockers):
    return {"call_id": cid, "seat": seat, "role": role, "model": "m", "family": fam, "status": "ok", "scores": {},
            "blockers": blockers, "suggestions": [], "keep": [], "error": "", "output_sha256": "out-" + seat}


def _setup(tmp_path, fact_family="google", fact_blockers=(), seats=None):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    script = video / "script.md"
    script.write_text("PROF: Two sleeps (c01).\n")
    sha = S.save_draft(video, script)
    db = Ledger(tmp_path / "l.sqlite")
    R.write_meta(video, "g2", 1, sha, {"ok": True, "problems": [], "warnings": []})
    seats = seats or (("viewer", "viewer", "xai"), ("story", "story", "openai"), ("fact", "fact", fact_family))
    for seat, role, fam in seats:
        cid = db.reserve(channel="pou", video=video.name, gate="g2", round=1, seat=seat, model="m", family=fam,
                         prompt_sha256="p", daily_cap=99, script_cap=99)
        blockers = list(fact_blockers) if role == "fact" else []
        record = _record(cid, seat, role, fam, blockers)
        db.finish(cid, status="ok", output_sha256="out-" + seat, duration_s=1, verdict_sha256=verdict_digest(record))
        (R.round_dir(video, "g2", 1) / f"{seat}.json").write_text(json.dumps(record))
    report = R.build_report(video, gate="g2", stage="dialogue_script", channel="pou", writer_family="anthropic",
                            ledger=db, cap=29)
    return video, script, report, db


def _vfile(video, seat):
    return R.round_dir(video, "g2", 1) / f"{seat}.json"


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


def _has(problems, *words):
    return any(all(w in p for w in words) for p in problems)


def test_blockers_emptied_in_a_verdict_file_fail(tmp_path):
    blocker = {"quote": "Two sleeps", "why": "w", "fix": "f", "domain": "fact"}
    video, script, report, db = _setup(tmp_path, fact_blockers=[blocker])
    # the report was built with a blocker, so the room would not ship; rebuild with it removed from the file only
    f = _vfile(video, "fact")
    data = json.loads(f.read_text())
    data["blockers"] = []
    f.write_text(json.dumps(data))
    report = R.build_report(video, gate="g2", stage="s", channel="pou", writer_family="anthropic", ledger=db, cap=29)
    assert _has(E.verify(video, report, script, db), "verdict fact", "file edited after the call")


def test_a_verdict_citing_another_seats_call_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    other = json.loads(_vfile(video, "story").read_text())["call_id"]
    f = _vfile(video, "viewer")
    data = json.loads(f.read_text())
    data["call_id"] = other
    f.write_text(json.dumps(data))
    report = R.build_report(video, gate="g2", stage="s", channel="pou", writer_family="anthropic", ledger=db, cap=29)
    assert _has(E.verify(video, report, script, db), "different seat, model, family, video, gate or round")


def test_the_same_call_id_on_two_verdicts_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    story = json.loads(_vfile(video, "story").read_text())
    f = _vfile(video, "viewer")
    data = json.loads(f.read_text())
    data["call_id"], data["output_sha256"] = story["call_id"], story["output_sha256"]
    f.write_text(json.dumps(data))
    report = R.build_report(video, gate="g2", stage="s", channel="pou", writer_family="anthropic", ledger=db, cap=29)
    assert _has(E.verify(video, report, script, db), "cited by more than one verdict")


def _judge(video, db, family="openai", other_video=None, gate="g2"):
    ids = [db.reserve(channel="pou", video=other_video or video.name, gate=gate, round=1, seat="judge", model="m",
                      family=family, prompt_sha256="p", daily_cap=99, script_cap=99) for _ in range(2)]
    for cid in ids:
        db.finish(cid, status="ok", output_sha256="j", duration_s=1)
    (R.round_dir(video, "g2", 1) / "judge.json").write_text(json.dumps(
        {"model": "m", "family": family, "call_ids": ids, "picks": ["new", "new"], "winner": "new"}))


def test_a_judge_on_the_writer_family_fails(tmp_path):
    video, script, _, db = _setup(tmp_path)
    _judge(video, db, family="anthropic")
    report = R.build_report(video, gate="g2", stage="s", channel="pou", writer_family="anthropic", ledger=db, cap=29)
    assert _has(E.verify(video, report, script, db), "judge is on the writer's family")


def test_a_judge_call_from_another_video_fails(tmp_path):
    video, script, _, db = _setup(tmp_path)
    _judge(video, db, other_video="other_video")
    report = R.build_report(video, gate="g2", stage="s", channel="pou", writer_family="anthropic", ledger=db, cap=29)
    assert _has(E.verify(video, report, script, db), "judge call")


def test_a_judge_without_a_family_is_a_problem_not_a_crash(tmp_path):
    video, script, _, db = _setup(tmp_path)
    _judge(video, db)
    f = R.round_dir(video, "g2", 1) / "judge.json"
    data = json.loads(f.read_text())
    del data["family"]
    f.write_text(json.dumps(data))
    report = R.build_report(video, gate="g2", stage="s", channel="pou", writer_family="anthropic", ledger=db, cap=29)
    assert _has(E.verify(video, report, script, db), "judge call")


def test_lint_failed_in_the_shipped_round_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    report["rounds"][0]["lint"] = {"ok": False}
    assert _has(E.verify(video, report, script, db), "lint failed")


def test_a_missing_mandatory_role_fails(tmp_path):
    video, script, report, db = _setup(tmp_path, seats=(("viewer", "viewer", "xai"), ("story", "story", "openai")))
    report["shipped"] = {"round": 1, "artifact_sha256": report["rounds"][0]["draft_sha256"]}
    assert _has(E.verify(video, report, script, db), "no ok fact verdict")


def test_fewer_than_two_non_writer_families_fails(tmp_path):
    video, script, report, db = _setup(tmp_path, seats=(("viewer", "viewer", "xai"), ("story", "story", "xai"),
                                                         ("fact", "fact", "xai")))
    report["shipped"] = {"round": 1, "artifact_sha256": report["rounds"][0]["draft_sha256"]}
    assert _has(E.verify(video, report, script, db), "two or more families")


def test_an_open_fact_blocker_fails(tmp_path):
    blocker = {"quote": "Two sleeps", "why": "w", "fix": "f", "domain": "fact"}
    video, script, report, db = _setup(tmp_path, fact_blockers=[blocker])
    report["shipped"] = {"round": 1, "artifact_sha256": report["rounds"][0]["draft_sha256"]}
    assert _has(E.verify(video, report, script, db), "open fact blocker")


def test_a_malformed_verdict_file_is_a_problem(tmp_path):
    video, script, report, db = _setup(tmp_path)
    _vfile(video, "story").write_text("{not json")
    assert _has(E.verify(video, report, script, db), "verdict story")
    _vfile(video, "story").write_text("[1]")
    assert _has(E.verify(video, report, script, db), "verdict story")


def test_a_malformed_blocker_is_a_problem(tmp_path):
    video, script, report, db = _setup(tmp_path, fact_blockers=["oops"])
    report["shipped"] = {"round": 1, "artifact_sha256": report["rounds"][0]["draft_sha256"]}
    assert E.verify(video, report, script, db)


def test_a_missing_artifact_is_a_problem(tmp_path):
    video, script, report, db = _setup(tmp_path)
    script.unlink()
    assert _has(E.verify(video, report, script, db), "script.md")


def test_missing_report_keys_are_problems(tmp_path):
    video, script, report, db = _setup(tmp_path)
    for key in ("rounds", "lint", "writer_family", "calls", "cap"):
        broken = {k: v for k, v in report.items() if k != key}
        if key == "lint":
            broken["rounds"] = [{k: v for k, v in r.items() if k != "lint"} for r in report["rounds"]]
        assert E.verify(video, broken, script, db), key


def test_an_edited_snapshot_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    snap = S.drafts_dir(video) / f"{report['shipped']['artifact_sha256']}.md"
    snap.write_text("tampered\n")
    assert _has(E.verify(video, report, script, db), "snapshot")


def test_the_call_count_is_recomputed_from_the_ledger(tmp_path):
    video, script, report, db = _setup(tmp_path)
    for _ in range(3):
        db.reserve(channel="pou", video=video.name, gate="g2", round=2, seat="x", model="m", family="f",
                   prompt_sha256="p", daily_cap=99, script_cap=99)
    report["cap"], report["calls"] = 4, 1  # the report understates the calls
    assert _has(E.verify(video, report, script, db), "calls", "cap")


def _entry(report, seat):
    return next(v for v in report["rounds"][0]["verdicts"] if v["seat"] == seat)


def test_a_report_role_relabelled_fails(tmp_path):
    video, script, report, db = _setup(tmp_path, seats=(("viewer", "viewer", "xai"), ("story", "story", "openai"),
                                                         ("fact", "fact", "google")))
    _entry(report, "story")["role"] = "fact"
    assert _has(E.verify(video, report, script, db), "verdict story", "report does not match its verdict file")


def test_a_report_family_edited_fails(tmp_path):
    video, script, report, db = _setup(tmp_path, fact_family="anthropic")
    _entry(report, "fact")["family"] = "google"
    problems = E.verify(video, report, script, db)
    assert _has(problems, "verdict fact", "report does not match its verdict file")
    assert _has(problems, "writer's family")  # the file's family still decides the writer-family check


def test_a_report_blocker_count_edited_fails(tmp_path):
    blocker = {"quote": "Two sleeps", "why": "w", "fix": "f", "domain": "fact"}
    video, script, report, db = _setup(tmp_path, fact_blockers=[blocker])
    report["shipped"] = {"round": 1, "artifact_sha256": report["rounds"][0]["draft_sha256"]}
    _entry(report, "fact")["blockers"] = 0
    assert _has(E.verify(video, report, script, db), "verdict fact", "report does not match its verdict file")


def test_a_report_round_lint_edited_fails(tmp_path):
    video, script, report, db = _setup(tmp_path)
    R.write_meta(video, "g2", 1, report["rounds"][0]["draft_sha256"], {"ok": False, "problems": ["x"], "warnings": []})
    report["rounds"][0]["lint"] = {"ok": True, "problems": [], "warnings": []}
    assert _has(E.verify(video, report, script, db), "round 1", "report does not match meta.json")


def test_a_ledger_sqlite_error_is_a_problem_not_a_crash(tmp_path, monkeypatch):
    import sqlite3
    video, script, report, db = _setup(tmp_path)

    def boom(*a, **k):
        raise sqlite3.OperationalError("database is locked")
    monkeypatch.setattr(db, "get", boom)
    problems = E.verify(video, report, script, db)
    assert problems and _has(problems, "malformed")
