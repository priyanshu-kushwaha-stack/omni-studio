"""The call ledger: one SQLite file every worktree shares; caps are reserved before a call runs."""

from __future__ import annotations

import threading
from datetime import datetime, timezone

import pytest

from studio.room import ledger as L

KW = dict(
    channel="professor-of-us",
    video="2026-11-10_x",
    gate="g2",
    round=1,
    seat="fact reviewer",
    model="gemini-3.7-flash-high",
    family="google",
    prompt_sha256="p" * 64,
)


def test_reserve_finish_get(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    cid = db.reserve(daily_cap=10, script_cap=10, **KW)
    assert db.get(cid).status == "reserved"
    db.finish(cid, status="ok", output_sha256="o" * 64, duration_s=1.5, cli_version="1.0")
    row = db.get(cid)
    assert (row.status, row.output_sha256, row.cli_version) == ("ok", "o" * 64, "1.0")
    assert db.count(channel="professor-of-us", video="2026-11-10_x", gate="g2") == 1


def test_the_script_cap_and_the_daily_cap_refuse(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    db.reserve(daily_cap=10, script_cap=1, **KW)
    with pytest.raises(L.CapReached, match="1 of 1"):
        db.reserve(daily_cap=10, script_cap=1, **KW)
    with pytest.raises(L.CapReached, match="daily cap"):
        db.reserve(daily_cap=1, script_cap=10, **{**KW, "video": "other"})


def test_yesterday_does_not_count_against_today(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    db.reserve(daily_cap=1, script_cap=10, now=datetime(2026, 11, 7, tzinfo=timezone.utc), **KW)
    db.reserve(daily_cap=1, script_cap=10, now=datetime(2026, 11, 8, tzinfo=timezone.utc), **KW)


def test_parallel_sessions_cannot_overrun_the_cap(tmp_path):
    path = tmp_path / "l.sqlite"
    L.Ledger(path)
    won, lost = [], []

    def go():
        try:
            won.append(L.Ledger(path).reserve(daily_cap=1, script_cap=10, **KW))
        except L.CapReached:
            lost.append(1)

    threads = [threading.Thread(target=go) for _ in range(8)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert len(won) == 1 and len(lost) == 7


def test_finishing_an_unknown_call_fails(tmp_path):
    with pytest.raises(KeyError):
        L.Ledger(tmp_path / "l.sqlite").finish("nope", status="ok", output_sha256="", duration_s=0)


def test_the_path_comes_from_the_environment(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "x.sqlite"))
    assert L.ledger_path() == tmp_path / "x.sqlite"
    monkeypatch.delenv("OMNI_ROOM_LEDGER")
    assert L.ledger_path() == L.DEFAULT
    assert ".config" not in L.DEFAULT.parts


def test_finish_stores_the_verdict_digest(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    cid = db.reserve(daily_cap=10, script_cap=10, **KW)
    db.finish(cid, status="ok", output_sha256="o", duration_s=1, verdict_sha256="v" * 64)
    assert db.get(cid).verdict_sha256 == "v" * 64
    cid2 = db.reserve(daily_cap=10, script_cap=10, **KW)
    db.finish(cid2, status="failed", output_sha256="o", duration_s=1)
    assert db.get(cid2).verdict_sha256 == ""


def test_an_old_schema_file_is_migrated(tmp_path):
    import sqlite3

    path = tmp_path / "old.sqlite"
    con = sqlite3.connect(path)
    con.execute("""CREATE TABLE calls (
        call_id TEXT PRIMARY KEY, at TEXT NOT NULL, channel TEXT, video TEXT, gate TEXT, round INTEGER,
        seat TEXT, model TEXT, family TEXT, cli_version TEXT, prompt_sha256 TEXT, output_sha256 TEXT,
        duration_s REAL, status TEXT NOT NULL)""")
    con.execute("INSERT INTO calls (call_id, at, status) VALUES ('old', '2026-01-01T00:00:00', 'ok')")
    con.commit()
    con.close()
    db = L.Ledger(path)
    assert db.get("old").verdict_sha256 is None
    cid = db.reserve(daily_cap=10, script_cap=10, **KW)
    db.finish(cid, status="ok", output_sha256="o", duration_s=1, verdict_sha256="d")
    assert db.get(cid).verdict_sha256 == "d"
    L.Ledger(path)  # opening again is harmless


def test_count_filters_by_round_and_status(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    a = db.reserve(daily_cap=10, script_cap=10, **KW)
    db.reserve(daily_cap=10, script_cap=10, **{**KW, "round": 2})
    db.finish(a, status="ok", output_sha256="o", duration_s=1)
    assert db.count(round=1) == 1 and db.count(round=2) == 1
    assert db.count(status="reserved") == 1 and db.count(round=1, status="reserved") == 0
    assert db.count(channel="professor-of-us", video="2026-11-10_x", gate="g2", round=2, status="reserved") == 1


def test_a_finished_row_cannot_be_finished_again(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    cid = db.reserve(daily_cap=10, script_cap=10, **KW)
    db.finish(cid, status="failed", output_sha256="o", duration_s=1)
    with pytest.raises(ValueError, match="reserved"):
        db.finish(cid, status="ok", output_sha256="x", duration_s=1, verdict_sha256="v")
    assert db.get(cid).status == "failed" and db.get(cid).output_sha256 == "o"


def test_count_filters_by_seat(tmp_path):
    db = L.Ledger(tmp_path / "l.sqlite")
    db.reserve(daily_cap=10, script_cap=10, **KW)
    db.reserve(daily_cap=10, script_cap=10, **{**KW, "seat": "judge"})
    assert db.count(seat="judge") == 1 and db.count(seat="fact reviewer") == 1 and db.count(seat="nope") == 0


def test_the_studio_ceiling_caps_a_larger_channel_daily_cap(tmp_path, monkeypatch):
    limits = tmp_path / "limits.yaml"
    limits.write_text("daily_cap: 2\n")
    monkeypatch.setattr(L, "LIMITS", limits)
    db = L.Ledger(tmp_path / "l.sqlite")
    db.reserve(daily_cap=500, script_cap=10, **KW)
    db.reserve(daily_cap=500, script_cap=10, **KW)
    with pytest.raises(L.CapReached, match="daily cap"):
        db.reserve(daily_cap=500, script_cap=10, **KW)


def test_the_shipped_studio_ceiling_is_80():
    assert L.studio_daily_cap() == 80
