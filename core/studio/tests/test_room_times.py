"""Measure every gate (pipeline v2, optimisation 6) and let seats earn their place (section 4 limit 10)."""

from __future__ import annotations

import json

from studio.room import __main__ as cli
from studio.room import report as R
from studio.room import times as T
from studio.room.ledger import Ledger


def _video(tmp_path):
    video = tmp_path / "say-suppose" / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    return video


def test_gate_times_reads_meta_presented_ledger_and_checkpoint(tmp_path):
    video = _video(tmp_path)
    R.write_meta(video, "g2", 1, "a" * 64, {"ok": True})
    R.write_meta(video, "g2", 2, "b" * 64, {"ok": True}, owner_notes=True)
    meta = R.round_dir(video, "g2", 1) / "meta.json"
    meta.write_text(json.dumps({**json.loads(meta.read_text()), "linted_at": "2026-11-10T10:00:00+00:00"}))
    R.presented_path(video, "g2").write_text(json.dumps({"draft_sha256": "a" * 64, "at": "2026-11-10T10:12:00+00:00"}))
    (video / "checkpoint_story_script.json").write_text(
        json.dumps({"status": "awaiting_human", "timestamp": "2026-11-10T11:00:00+00:00"})
    )
    db = Ledger(tmp_path / "l.sqlite")
    cid = db.reserve(
        channel="say-suppose",
        video=video.name,
        gate="g2",
        round=1,
        seat="story editor",
        model="m",
        family="openai",
        prompt_sha256="p",
        daily_cap=99,
        script_cap=99,
    )
    db.finish(cid, status="ok", output_sha256="o", duration_s=60)
    rows = {r["gate"]: r for r in T.gate_times(video, db, "say-suppose")}
    g2 = rows["g2"]
    assert g2["minutes_to_owner"] == 12 and g2["room_rounds"] == 1 and g2["owner_rounds"] == 1
    assert g2["calls"] == 1 and g2["checkpoint"] == "awaiting_human 2026-11-10T11:00:00+00:00"
    assert rows["g1"]["room_rounds"] == 0 and rows["g1"]["minutes_to_owner"] is None
    assert "| g2 |" in T.render_times(list(rows.values()))


def test_the_scorecard_flags_a_seat_under_one_in_three_over_three_films(tmp_path):
    channel = tmp_path / "say-suppose"
    for i in range(3):
        v = channel / "videos" / f"2026-11-1{i}_v"
        v.mkdir(parents=True)
        (v / "review-g2-marks.yaml").write_text(
            "- {seat: director, line: 3, mark: agreed}\n"
            "- {seat: first-time viewer, line: 4, mark: disagreed}\n"
            "- {seat: first-time viewer, line: 9, mark: unsure}\n"
        )
    rows = {r["seat"]: r for r in T.scorecard(channel)}
    assert rows["director"]["share"] == 1.0 and rows["director"]["flag"] == ""
    assert rows["first-time viewer"]["films"] == 3
    assert rows["first-time viewer"]["flag"].startswith("under one in three")
    assert "first-time viewer" in T.render_scorecard(list(rows.values()))


def test_a_malformed_marks_file_is_skipped_not_a_crash(tmp_path):
    v = tmp_path / "say-suppose" / "videos" / "2026-11-10_v"
    v.mkdir(parents=True)
    (v / "review-g2-marks.yaml").write_text("not: [a list\n")
    assert T.scorecard(tmp_path / "say-suppose") == []


ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
"""


def test_the_cli_prints_both_tables(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    video = _video(tmp_path)
    cfg = video.parents[1] / "room.yaml"
    cfg.write_text(ROOM)
    assert cli.main(["times", str(video), "--config", str(cfg)]) == 0
    assert cli.main(["scorecard", "--config", str(cfg)]) == 0
    out = capsys.readouterr().out
    assert "| gate |" in out and "| seat |" in out
