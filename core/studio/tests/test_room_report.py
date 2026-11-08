"""The stop rule's outcome: the best lint- and fact-clean candidate, bound to its round."""

from __future__ import annotations

import json

from studio.room import report as R
from studio.room.ledger import Ledger


def _verdict(d, name, role, family, blockers=(), status="ok"):
    data = {"call_id": f"{name}-{d.name}", "seat": name, "role": role, "model": "m", "family": family,
            "status": status, "scores": {}, "blockers": list(blockers), "suggestions": [], "keep": [],
            "error": "", "output_sha256": "o"}
    (d / f"{name}.json").write_text(json.dumps(data))


def _round(video, n, sha, lint_ok=True, fact_blockers=(), judge=None):
    R.write_meta(video, "g2", n, sha, {"ok": lint_ok, "problems": [], "warnings": []})
    d = R.round_dir(video, "g2", n)
    _verdict(d, "viewer", "viewer", "xai")
    _verdict(d, "story", "story", "openai")
    _verdict(d, "fact", "fact", "google", blockers=fact_blockers)
    if judge:
        (d / "judge.json").write_text(json.dumps({"model": "m", "family": "openai", "call_ids": ["j1", "j2"],
                                                  "picks": ["A", "B"], "winner": judge}))


BLOCK = [{"quote": "eight hours", "why": "scope", "fix": "re-scope", "domain": "fact", "line": 2}]


def test_the_first_clean_round_ships_when_nothing_beats_it(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, judge="best")
    assert R.shipped(R.load_rounds(tmp_path, "g2")) == {"round": 1, "artifact_sha256": "a" * 64}


def test_a_later_round_ships_only_when_it_wins_the_judge(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, judge="new")
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 2


def test_a_fact_blocker_or_a_lint_failure_is_never_shipped(tmp_path):
    _round(tmp_path, 1, "a" * 64, fact_blockers=BLOCK)
    _round(tmp_path, 2, "b" * 64, lint_ok=False)
    assert R.shipped(R.load_rounds(tmp_path, "g2")) is None


def test_a_round_whose_fact_seat_failed_is_not_a_candidate(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _verdict(R.round_dir(tmp_path, "g2", 1), "fact", "fact", "google", status="failed")
    assert not R.is_candidate(R.load_rounds(tmp_path, "g2")[0])


def test_best_before(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64)
    assert R.best_before(R.load_rounds(tmp_path, "g2"), 2)["round"] == 1


def test_build_and_write_the_report(tmp_path):
    video = tmp_path / "2026-11-10_x"
    _round(video, 1, "a" * 64, fact_blockers=BLOCK)
    _round(video, 2, "b" * 64)
    report = R.build_report(video, gate="g2", stage="dialogue_script", channel="professor-of-us",
                            writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=29)
    assert report["shipped"] == {"round": 2, "artifact_sha256": "b" * 64}
    assert report["rounds"][0]["verdicts"][0]["file"].startswith("room/g2/round-1/")
    js, md = R.write_report(video, report)
    assert json.loads(js.read_text())["cap"] == 29
    text = md.read_text()
    assert "Shipped: round 2" in text and "| 1 |" in text


def test_a_failed_mandatory_viewer_seat_is_not_a_candidate(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _verdict(R.round_dir(tmp_path, "g2", 1), "viewer", "viewer", "xai", status="failed")
    assert not R.is_candidate(R.load_rounds(tmp_path, "g2")[0])


def test_a_round_with_no_story_verdict_is_not_a_candidate(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    (R.round_dir(tmp_path, "g2", 1) / "story.json").unlink()
    assert not R.is_candidate(R.load_rounds(tmp_path, "g2")[0])
    assert R.shipped(R.load_rounds(tmp_path, "g2")) is None


def test_malformed_round_directories_are_skipped_and_listed(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    (R.gate_dir(video, "g2") / "round-1.bak").mkdir()
    (R.gate_dir(video, "g2") / "round-2").mkdir()
    (R.gate_dir(video, "g2") / "round-3").mkdir()
    (R.gate_dir(video, "g2") / "round-3" / "meta.json").write_text("{not json")
    assert [r["round"] for r in R.load_rounds(video, "g2")] == [1]
    report = R.build_report(video, gate="g2", stage="s", channel="c", writer_family="anthropic",
                            ledger=Ledger(tmp_path / "l.sqlite"), cap=5)
    assert sorted(report["skipped_rounds"]) == ["round-1.bak", "round-2", "round-3"]
    assert report["shipped"]["round"] == 1


def test_no_skipped_rounds_is_an_empty_list(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    report = R.build_report(video, gate="g2", stage="s", channel="c", writer_family="anthropic",
                            ledger=Ledger(tmp_path / "l.sqlite"), cap=5)
    assert report["skipped_rounds"] == []


def test_a_malformed_judge_counts_as_no_judge_result(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64)
    _round(tmp_path, 3, "c" * 64)
    R.round_dir(tmp_path, "g2", 2).joinpath("judge.json").write_text("{broken")
    R.round_dir(tmp_path, "g2", 3).joinpath("judge.json").write_text(json.dumps({"model": "m"}))
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 1


def test_the_report_notes_a_clean_candidate_that_was_not_judged(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    _round(video, 2, "b" * 64)
    report = R.build_report(video, gate="g2", stage="s", channel="c", writer_family="anthropic",
                            ledger=Ledger(tmp_path / "l.sqlite"), cap=5)
    _, md = R.write_report(video, report)
    assert "Round 2 was a clean candidate but was not judged; the earlier round ships." in md.read_text()
