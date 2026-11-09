"""The stop rule's outcome: the best lint- and fact-clean candidate, bound to its round."""

from __future__ import annotations

import json

from studio.room import report as R
from studio.room.ledger import Ledger


def _verdict(d, name, role, family, blockers=(), status="ok"):
    data = {
        "call_id": f"{name}-{d.name}",
        "seat": name,
        "role": role,
        "model": "m",
        "family": family,
        "status": status,
        "scores": {},
        "blockers": list(blockers),
        "suggestions": [],
        "keep": [],
        "error": "",
        "output_sha256": "o",
    }
    (d / f"{name}.json").write_text(json.dumps(data))


def _round(video, n, sha, lint_ok=True, fact_blockers=(), judge=None, owner_notes=False, story_blockers=()):
    R.write_meta(video, "g2", n, sha, {"ok": lint_ok, "problems": [], "warnings": []}, owner_notes=owner_notes)
    d = R.round_dir(video, "g2", n)
    _verdict(d, "viewer", "viewer", "xai")
    _verdict(d, "story", "story", "openai", blockers=story_blockers)
    _verdict(d, "fact", "fact", "google", blockers=fact_blockers)
    if judge:
        (d / "judge.json").write_text(
            json.dumps(
                {"model": "m", "family": "openai", "call_ids": ["j1", "j2"], "picks": ["A", "B"], "winner": judge}
            )
        )


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
    report = R.build_report(
        video,
        gate="g2",
        stage="dialogue_script",
        channel="professor-of-us",
        writer_family="anthropic",
        ledger=Ledger(tmp_path / "l.sqlite"),
        cap=29,
    )
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
    report = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    assert sorted(report["skipped_rounds"]) == ["round-1.bak", "round-2", "round-3"]
    assert report["shipped"]["round"] == 1


def test_no_skipped_rounds_is_an_empty_list(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    report = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
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
    report = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    _, md = R.write_report(video, report)
    assert "Round 2 was a clean candidate but was not judged; the earlier round ships." in md.read_text()


def test_an_owner_notes_candidate_ships_without_a_judge(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, owner_notes=True)
    assert R.shipped(R.load_rounds(tmp_path, "g2")) == {"round": 2, "artifact_sha256": "b" * 64}
    rep = R.build_report(
        tmp_path,
        gate="g2",
        stage="script",
        channel="c",
        writer_family="anthropic",
        ledger=Ledger(tmp_path / "l.jsonl"),
        cap=10,
    )
    assert [r["owner_notes"] for r in rep["rounds"]] == [False, True]


def test_an_owner_notes_round_with_a_fact_blocker_does_not_ship(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, owner_notes=True, fact_blockers=BLOCK)
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 1


def test_a_later_ordinary_round_after_owner_notes_still_needs_the_judge(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, owner_notes=True)
    _round(tmp_path, 3, "c" * 64)
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 2
    _round(tmp_path, 4, "d" * 64, judge="new")
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 4


def test_write_report_tolerates_non_dict_items(tmp_path):
    from studio.room import verdict as V

    video = tmp_path / "v"
    v = V.parse_verdict(
        json.dumps({"keep": ["a line", "another"]}), call_id="c", seat="s", role="story", model="m", family="f"
    )
    d = R.round_dir(video, "g2", 1)
    R.write_meta(video, "g2", 1, "sha", {"ok": True})
    (d / "s.json").write_text(json.dumps({**v.to_dict(), "output_sha256": "o"}))
    # a hand-written verdict file with raw strings must not crash the md writer either
    raw = {**v.to_dict(), "keep": ["bare", {"quote": "q"}], "blockers": [], "output_sha256": "o"}
    (d / "s.json").write_text(json.dumps(raw))
    rep = R.build_report(
        video, gate="g2", stage="x", channel="c", writer_family="w", ledger=Ledger(tmp_path / "l"), cap=9
    )
    R.write_report(video, rep)
    assert (video / "room-g2.md").is_file()


def test_the_md_says_when_an_owner_notes_round_shipped_without_a_judge(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    _round(video, 2, "b" * 64, owner_notes=True)
    rep = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    _, md = R.write_report(video, rep)
    assert "Shipped: round 2 (" in md.read_text() and "shipped by the owner-notes rule (no judge)" in md.read_text()
    rep = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    rep["rounds"][1]["owner_notes"] = False
    _, md = R.write_report(video, rep)
    assert "owner-notes rule" not in md.read_text()


def test_the_md_names_the_candidate_rule_when_nothing_ships(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64, fact_blockers=BLOCK)
    rep = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    _, md = R.write_report(video, rep)
    text = md.read_text()
    assert "Shipped: none. No round is a candidate" in text and "no fact blocker" in text
    assert "Missing mandatory roles" not in text


STORY = [{"quote": f"line {i}", "why": "flat", "fix": "cut", "domain": "story", "line": i} for i in range(3)]


def test_a_failed_mandatory_verdict_is_not_masked_by_a_success_in_the_same_role(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    d = R.round_dir(tmp_path, "g2", 1)
    _verdict(d, "second story", "story", "google", status="failed")
    assert not R.is_candidate(R.load_rounds(tmp_path, "g2")[0])
    _verdict(d, "second fact", "fact", "xai", status="failed")
    _verdict(d, "second story", "story", "google")
    assert not R.is_candidate(R.load_rounds(tmp_path, "g2")[0])


def test_a_failed_non_mandatory_seat_does_not_block_a_round(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _verdict(R.round_dir(tmp_path, "g2", 1), "craft", "craft", "google", status="failed")
    assert R.is_candidate(R.load_rounds(tmp_path, "g2")[0])


def test_a_round_with_fewer_open_blockers_ships_even_when_the_judge_ties(tmp_path):
    _round(tmp_path, 1, "a" * 64, story_blockers=STORY)
    _round(tmp_path, 2, "b" * 64, judge="best")
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 2


def test_a_round_with_more_open_blockers_does_not_ship_even_when_the_judge_says_new(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, story_blockers=STORY, judge="new")
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 1


def test_a_tie_on_blockers_goes_to_the_judge(tmp_path):
    _round(tmp_path, 1, "a" * 64, story_blockers=STORY[:1])
    _round(tmp_path, 2, "b" * 64, story_blockers=STORY[:1], judge="best")
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 1
    _round(tmp_path, 3, "c" * 64, story_blockers=STORY[:1], judge="new")
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 3


def test_a_null_judge_winner_is_no_judge_result(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64)
    R.round_dir(tmp_path, "g2", 2).joinpath("judge.json").write_text(
        json.dumps({"model": "m", "family": "f", "call_ids": ["x"], "picks": ["tie", "tie"], "winner": None})
    )
    assert R.load_rounds(tmp_path, "g2")[1]["judge"] is None
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 1


def test_a_verdict_file_missing_required_keys_is_listed_and_not_counted(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    d = R.round_dir(video, "g2", 1)
    data = json.loads((d / "story.json").read_text())
    del data["role"]
    (d / "story.json").write_text(json.dumps(data))
    (d / "stray.json").write_text(json.dumps({"seat": "x"}))
    assert not R.is_candidate(R.load_rounds(video, "g2")[0])
    rep = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    assert rep["malformed_verdicts"] == ["room/g2/round-1/story.json", "room/g2/round-1/stray.json"]
    assert [v["seat"] for v in rep["rounds"][0]["verdicts"]] == ["fact", "viewer"]
    R.write_report(video, rep)


def test_a_verdict_whose_blockers_is_not_a_list_is_malformed(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    d = R.round_dir(video, "g2", 1)
    data = json.loads((d / "fact.json").read_text())
    data["blockers"] = "none"
    (d / "fact.json").write_text(json.dumps(data))
    rep = R.build_report(
        video, gate="g2", stage="s", channel="c", writer_family="anthropic", ledger=Ledger(tmp_path / "l.sqlite"), cap=5
    )
    assert rep["malformed_verdicts"] == ["room/g2/round-1/fact.json"] and rep["shipped"] is None
    R.write_report(video, rep)


def test_the_report_carries_the_channel(tmp_path):
    video = tmp_path / "v"
    _round(video, 1, "a" * 64)
    rep = R.build_report(
        video,
        gate="g2",
        stage="s",
        channel="pou",
        writer_family="anthropic",
        ledger=Ledger(tmp_path / "l.sqlite"),
        cap=5,
    )
    assert rep["channel"] == "pou" and rep["malformed_verdicts"] == []


def test_an_owner_notes_candidate_beats_an_earlier_round_with_fewer_blockers(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, owner_notes=True, story_blockers=STORY[:2])
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 2


def test_a_later_ordinary_round_with_fewer_blockers_beats_an_owner_notes_round(tmp_path):
    _round(tmp_path, 1, "a" * 64)
    _round(tmp_path, 2, "b" * 64, owner_notes=True, story_blockers=STORY[:2])
    _round(tmp_path, 3, "c" * 64, story_blockers=STORY[:1])
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 3
    _round(tmp_path, 4, "d" * 64, story_blockers=STORY[:1])  # same blockers, no judge: round 3 stays
    assert R.shipped(R.load_rounds(tmp_path, "g2"))["round"] == 3
