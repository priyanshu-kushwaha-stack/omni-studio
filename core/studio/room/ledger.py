"""The room's call ledger: every model call, reserved against the caps before it runs.

One SQLite file outside the repo and outside ~/.config/omni-studio/ (secrets), shared by every worktree so
parallel channel sessions count against the same daily cap. Reservation is one IMMEDIATE transaction.
"""

from __future__ import annotations

import os
import sqlite3
import uuid
import yaml
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DEFAULT = Path.home() / ".local" / "state" / "omni-studio" / "room" / "ledger.sqlite"
LIMITS = Path(__file__).resolve().parent / "limits.yaml"
SCHEMA = """CREATE TABLE IF NOT EXISTS calls (
    call_id TEXT PRIMARY KEY, at TEXT NOT NULL, channel TEXT, video TEXT, gate TEXT, round INTEGER,
    seat TEXT, model TEXT, family TEXT, cli_version TEXT, prompt_sha256 TEXT, output_sha256 TEXT,
    duration_s REAL, status TEXT NOT NULL, verdict_sha256 TEXT)"""


def studio_daily_cap() -> int:
    """The one studio-wide ceiling on room calls per day (limits.yaml); a channel's own cap can only be lower."""
    return int((yaml.safe_load(Path(LIMITS).read_text(encoding="utf-8")) or {})["daily_cap"])


class CapReached(RuntimeError):
    pass


@dataclass
class CallRow:
    call_id: str
    at: str
    channel: str
    video: str
    gate: str
    round: int
    seat: str
    model: str
    family: str
    cli_version: Optional[str]
    prompt_sha256: Optional[str]
    output_sha256: Optional[str]
    duration_s: Optional[float]
    status: str
    verdict_sha256: Optional[str] = None


def ledger_path() -> Path:
    env = os.environ.get("OMNI_ROOM_LEDGER")
    return Path(env) if env else DEFAULT


class Ledger:
    def __init__(self, path: Optional[Path] = None):
        self.path = Path(path) if path else ledger_path()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self._connect()) as db:
            db.execute(SCHEMA)
            if "verdict_sha256" not in [r["name"] for r in db.execute("PRAGMA table_info(calls)")]:
                try:
                    db.execute("ALTER TABLE calls ADD COLUMN verdict_sha256 TEXT")
                except sqlite3.OperationalError:  # another process migrated first
                    pass

    def _connect(self) -> sqlite3.Connection:
        db = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        db.row_factory = sqlite3.Row
        return db

    def reserve(self, *, channel: str, video: str, gate: str, round: int, seat: str, model: str, family: str,
                prompt_sha256: str, daily_cap: int, script_cap: int, now: Optional[datetime] = None) -> str:
        at = (now or datetime.now(timezone.utc)).isoformat()
        call_id = uuid.uuid4().hex
        daily_cap = min(daily_cap, studio_daily_cap())
        with closing(self._connect()) as db:
            try:
                db.execute("BEGIN IMMEDIATE")
                today = db.execute("SELECT COUNT(*) FROM calls WHERE substr(at, 1, 10) = ?", (at[:10],)).fetchone()[0]
                if today >= daily_cap:
                    raise CapReached(f"daily cap reached: {today} of {daily_cap} calls on {at[:10]}")
                used = db.execute("SELECT COUNT(*) FROM calls WHERE channel = ? AND video = ? AND gate = ?",
                                  (channel, video, gate)).fetchone()[0]
                if used >= script_cap:
                    raise CapReached(f"{channel}/{video} {gate}: {used} of {script_cap} calls used")
                db.execute("INSERT INTO calls (call_id, at, channel, video, gate, round, seat, model, family, "
                           "prompt_sha256, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved')",
                           (call_id, at, channel, video, gate, round, seat, model, family, prompt_sha256))
                db.execute("COMMIT")
            except BaseException:
                if db.in_transaction:
                    db.execute("ROLLBACK")
                raise
        return call_id

    def finish(self, call_id: str, *, status: str, output_sha256: str, duration_s: float,
               cli_version: str = "", verdict_sha256: str = "") -> None:
        with closing(self._connect()) as db:
            cur = db.execute("UPDATE calls SET status = ?, output_sha256 = ?, duration_s = ?, cli_version = ?, "
                             "verdict_sha256 = ? WHERE call_id = ? AND status = 'reserved'",
                             (status, output_sha256, duration_s, cli_version, verdict_sha256, call_id))
            if cur.rowcount != 1:
                if db.execute("SELECT 1 FROM calls WHERE call_id = ?", (call_id,)).fetchone():
                    raise ValueError(f"call {call_id[:12]} is already finished; a row is only finished once "
                                     "(status must be reserved)")
                raise KeyError(call_id)

    def get(self, call_id: str) -> Optional[CallRow]:
        with closing(self._connect()) as db:
            row = db.execute("SELECT * FROM calls WHERE call_id = ?", (call_id,)).fetchone()
        return CallRow(**dict(row)) if row else None

    def count(self, *, channel: Optional[str] = None, video: Optional[str] = None,
              gate: Optional[str] = None, round: Optional[int] = None, status: Optional[str] = None,
              seat: Optional[str] = None) -> int:
        where, args = [], []
        for col, val in (("channel", channel), ("video", video), ("gate", gate), ("round", round),
                         ("status", status), ("seat", seat)):
            if val is not None:
                where.append(f"{col} = ?")
                args.append(val)
        sql = "SELECT COUNT(*) FROM calls" + (" WHERE " + " AND ".join(where) if where else "")
        with closing(self._connect()) as db:
            return db.execute(sql, args).fetchone()[0]
