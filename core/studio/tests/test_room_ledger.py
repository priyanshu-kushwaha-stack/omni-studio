"""The call ledger: one SQLite file every worktree shares; caps are reserved before a call runs."""

from __future__ import annotations

import threading
from datetime import datetime, timezone

import pytest

from studio.room import ledger as L

KW = dict(channel="professor-of-us", video="2026-11-10_x", gate="g2", round=1, seat="fact reviewer",
          model="gemini-3.7-flash-high", family="google", prompt_sha256="p" * 64)


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
