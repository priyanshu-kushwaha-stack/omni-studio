# A1: Quality Room Core Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the tools the quality room runs on (model registry, verdict schema, call ledger, draft snapshots, room config, lint, sandboxed seat and judge calls, round report, evidence check, a `python -m studio.room` command and the `studio-room` skill) and calibrate them on one historical script per channel.

**Architecture:** A new package `core/studio/room/` holds tools and persistence only; the round-by-round loop lives in the `studio-room` skill, as `core/openmontage/AGENT_GUIDE.md` requires. Seats run through `claude -p` or `cursor-agent -p` inside `sandbox-exec`, every call is reserved in a shared SQLite ledger before it runs, and verdict files are written only by the tools. A1 adds new files only; wiring into `omni approve`, `omni check`, pipelines and `cli.py` is A2.

**Tech Stack:** Python 3.12, PyYAML, sqlite3 (stdlib), pytest. CLIs: `claude` (Claude Code), `cursor-agent` 2026.11.05, macOS `/usr/bin/sandbox-exec`.

**Spec:** `docs/superpowers/specs/2026-11-08-quality-spine-design.md`

## Global Constraints

- New files only, plus one line in `.gitignore` and `channels/professor-of-us/room.yaml`. Do not edit `core/studio/checks.py`, `claims.py`, `cli.py`, `channels.py`, `core/openmontage/lib/studio_approval.py`, `core/lock.yaml`, or anything under `channels/say-suppose/` or `channels/power-and-citizen/` (other sessions own them until their branches merge).
- Mandatory roles: `viewer`, `story`, `fact`. Optional roles: `neutrality`, `voice`, `craft`. Roles that may not share the writer's family: `viewer`, `story`, `fact`, `neutrality`; the judge may not either.
- One model per seat. Every model id must be in `core/studio/room/models.yaml`.
- Derived per-script cap: `rounds × (seats + 2) + rounds × seats + mandatory_seats + 2`.
- Ledger: `~/.local/state/omni-studio/room/ledger.sqlite`, overridable with `OMNI_ROOM_LEDGER`. Never under `~/.config/omni-studio/`.
- The room never reads `~/.config/omni-studio/`, never approves a gate, never writes `room/*.json` by hand.
- Paid per-call providers are not used. `claude` and `cursor-agent` run on the owner's subscriptions.
- Run tests from the worktree root with the main checkout's interpreter:
  `export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1` and
  `PY=~/Exploration/projects/omni-studio/.venv/bin/python`, then
  `$PY -m pytest core/studio/tests/<file> -q -p no:cacheprovider --import-mode=importlib`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

| File | Responsibility |
|---|---|
| `core/studio/room/__init__.py` | Package docstring |
| `core/studio/room/models.yaml`, `models.py` | Model id → family and CLI |
| `core/studio/room/verdict.py` | Roles, verdict dataclasses, parsing model output |
| `core/studio/room/ledger.py` | SQLite call ledger with cap reservation |
| `core/studio/room/snapshot.py` | Content-addressed draft snapshots, sha256 helpers |
| `core/studio/room/config.py` | `room.yaml` loading, derived cap, validation |
| `core/studio/room/seats/{viewer,story,fact,judge}.md` | Shared seat briefs (provisional until A3) |
| `core/studio/room/slop.yaml`, `lint.py` | Deterministic lint |
| `core/studio/room/call.py` | Sandboxed CLI call, seat prompt, `run_seat` |
| `core/studio/room/judge.py` | Pairwise rule, judge prompt, `run_judge` |
| `core/studio/room/report.py` | Round files, stop rule, `room/<gate>.json`, `room-<gate>.md` |
| `core/studio/room/evidence.py` | What the A2 gate check will verify |
| `core/studio/room/__main__.py` | `python -m studio.room lint|seat|judge|report|verify` |
| `core/openmontage/skills/studio/studio-room.md` | The process the agent follows |
| `channels/professor-of-us/room.yaml` | First channel config (`adopted: null` until A2) |
| `core/studio/tests/test_room_*.py` | Tests, one file per module |

---

### Task 1: Package and model registry

**Files:**
- Create: `core/studio/room/__init__.py`, `core/studio/room/models.yaml`, `core/studio/room/models.py`
- Test: `core/studio/tests/test_room_models.py`

**Interfaces:**
- Produces: `models.REGISTRY: Path`, `models.UnknownModel(ValueError)`, `models.load_registry(path=REGISTRY) -> dict[str, dict[str, str]]`, `models.family_of(model: str, registry: dict | None = None) -> str`, `models.cli_of(model: str, registry: dict | None = None) -> str` (returns `"claude"` or `"cursor"`).

- [ ] **Step 1: Write the failing test**

```python
"""The model registry: every seat's model maps to a family and a CLI."""

from __future__ import annotations

import pytest

from studio.room import models


def test_the_real_registry_loads_and_knows_the_default_panel():
    reg = models.load_registry()
    assert models.family_of("claude-opus-5-5", reg) == "anthropic"
    assert models.family_of("gpt-5.6-sol-high", reg) == "openai"
    assert models.family_of("grok-4.7-high", reg) == "xai"
    assert models.family_of("gemini-3.7-flash-high", reg) == "google"
    assert models.cli_of("claude-opus-5-5", reg) == "claude"
    assert models.cli_of("grok-4.7-high", reg) == "cursor"


def test_an_unknown_model_is_refused():
    with pytest.raises(models.UnknownModel):
        models.family_of("some-model-9", {"a": {"family": "x", "cli": "claude"}})


def test_an_entry_without_family_or_with_a_bad_cli_is_refused(tmp_path):
    bad = tmp_path / "models.yaml"
    bad.write_text("models:\n  m1: {family: openai, cli: bash}\n")
    with pytest.raises(ValueError, match="m1"):
        models.load_registry(bad)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_models.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ModuleNotFoundError: No module named 'studio.room'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/__init__.py`:

```python
"""The quality room: tools and persistence for the multi-model review loop every video goes through.

The loop itself (rounds, merging notes, the writer's revisions) is the studio-room skill
(core/openmontage/skills/studio/studio-room.md). Spec: docs/superpowers/specs/2026-11-08-quality-spine-design.md.
"""
```

`core/studio/room/models.yaml`:

```yaml
# Model id -> family and the CLI that runs it. A seat whose model is missing here fails validation.
# Ids are what the CLI accepts: `claude --model <id>` or `cursor-agent --model <id>` (cursor-agent --list-models).
models:
  claude-opus-5-5: {family: anthropic, cli: claude}
  claude-sonnet-5-5: {family: anthropic, cli: claude}
  gpt-5.6-sol-high: {family: openai, cli: cursor}
  grok-4.7-high: {family: xai, cli: cursor}
  gemini-3.7-flash-high: {family: google, cli: cursor}
  composer-2.5: {family: cursor, cli: cursor}
```

`core/studio/room/models.py`:

```python
"""Model registry: which family each model id belongs to, and which CLI runs it (models.yaml)."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml

REGISTRY = Path(__file__).resolve().parent / "models.yaml"
CLIS = ("claude", "cursor")


class UnknownModel(ValueError):
    pass


def load_registry(path: Path = REGISTRY) -> dict[str, dict[str, str]]:
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    models = data.get("models") or {}
    for model, entry in models.items():
        if not isinstance(entry, dict) or not entry.get("family") or entry.get("cli") not in CLIS:
            raise ValueError(f"{path}: {model} needs a family and a cli in {CLIS}")
    return models


def _entry(model: str, registry: Optional[dict] = None) -> dict[str, str]:
    reg = load_registry() if registry is None else registry
    if model not in reg:
        raise UnknownModel(f"{model!r} is not in {REGISTRY.name}")
    return reg[model]


def family_of(model: str, registry: Optional[dict] = None) -> str:
    return _entry(model, registry)["family"]


def cli_of(model: str, registry: Optional[dict] = None) -> str:
    return _entry(model, registry)["cli"]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_models.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/__init__.py core/studio/room/models.yaml core/studio/room/models.py core/studio/tests/test_room_models.py
git commit -m "feat(room): model registry, every seat model maps to a family and a CLI

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Verdict schema

**Files:**
- Create: `core/studio/room/verdict.py`
- Test: `core/studio/tests/test_room_verdict.py`

**Interfaces:**
- Produces: `ROLES`, `MANDATORY = ("viewer", "story", "fact")`, `LOCKED_ROLES = ("viewer", "story", "fact", "neutrality")`, `BadVerdict(ValueError)`, dataclasses `Blocker(quote, why, fix, domain, line=None)` and `Verdict(call_id, seat, role, model, family, status, scores, blockers, suggestions, keep, error="")` with `to_dict()`, `extract_json(text) -> dict`, `parse_verdict(text, *, call_id, seat, role, model, family) -> Verdict`, `failed_verdict(*, call_id, seat, role, model, family, error) -> Verdict`.

- [ ] **Step 1: Write the failing test**

```python
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
    data = {**GOOD, "blockers": [{"quote": "x", "why": "pacing", "fix": "cut", "domain": "story"}]}
    out = v.parse_verdict(json.dumps(data), **META)
    assert out.blockers == []
    assert out.suggestions[-1]["moved"] == "blocker outside the fact role"


@pytest.mark.parametrize("text", ["no json here", "[1, 2]", '{"blockers": [{"why": "no quote"}]}',
                                  '{"scores": [1]}'])
def test_malformed_output_is_refused(text):
    with pytest.raises(v.BadVerdict):
        v.parse_verdict(text, **META)


def test_failed_verdict_and_round_trip():
    out = v.failed_verdict(error="exit 1", **META)
    assert out.status == "failed" and out.blockers == []
    assert v.Verdict.from_dict(out.to_dict()) == out
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_verdict.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'verdict'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/verdict.py`:

```python
"""A seat's verdict: scores (informational), blockers inside the seat's role, suggestions, keep lines."""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from typing import Any, Optional

ROLES = ("viewer", "story", "fact", "neutrality", "voice", "craft")
MANDATORY = ("viewer", "story", "fact")
LOCKED_ROLES = ("viewer", "story", "fact", "neutrality")  # never the writer's family
FENCE_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.S)


class BadVerdict(ValueError):
    pass


@dataclass
class Blocker:
    quote: str
    why: str
    fix: str
    domain: str
    line: Optional[int] = None


@dataclass
class Verdict:
    call_id: str
    seat: str
    role: str
    model: str
    family: str
    status: str  # ok | failed
    scores: dict[str, Any] = field(default_factory=dict)
    blockers: list[Blocker] = field(default_factory=list)
    suggestions: list[dict[str, Any]] = field(default_factory=list)
    keep: list[dict[str, Any]] = field(default_factory=list)
    error: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Verdict":
        fields = {k: data[k] for k in cls.__dataclass_fields__ if k in data}
        fields["blockers"] = [Blocker(**b) for b in data.get("blockers", [])]
        return cls(**fields)


def extract_json(text: str) -> dict[str, Any]:
    m = FENCE_RE.search(text)
    if m:
        candidate = m.group(1)
    elif "{" in text and "}" in text:
        candidate = text[text.find("{"): text.rfind("}") + 1]
    else:
        raise BadVerdict("no JSON object in the output")
    try:
        data = json.loads(candidate)
    except json.JSONDecodeError as exc:
        raise BadVerdict(f"not JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise BadVerdict("a verdict must be a JSON object")
    return data


def parse_verdict(text: str, *, call_id: str, seat: str, role: str, model: str, family: str) -> Verdict:
    if role not in ROLES:
        raise ValueError(f"unknown role {role!r}")
    data = extract_json(text)
    scores = data.get("scores") or {}
    suggestions = data.get("suggestions") or []
    keep = data.get("keep") or []
    if not isinstance(scores, dict):
        raise BadVerdict("scores must be an object")
    if not isinstance(suggestions, list) or not isinstance(keep, list):
        raise BadVerdict("suggestions and keep must be lists")
    blockers: list[Blocker] = []
    for b in data.get("blockers") or []:
        if not isinstance(b, dict) or not isinstance(b.get("quote"), str) or not isinstance(b.get("why"), str):
            raise BadVerdict(f"a blocker needs a quote and a why: {b!r}")
        line = b.get("line") if isinstance(b.get("line"), int) else None
        blocker = Blocker(quote=b["quote"], why=b["why"], fix=str(b.get("fix") or ""),
                          domain=str(b.get("domain") or role), line=line)
        if blocker.domain != role:
            suggestions.append({**asdict(blocker), "moved": f"blocker outside the {role} role"})
        else:
            blockers.append(blocker)
    return Verdict(call_id, seat, role, model, family, "ok", scores, blockers, suggestions, keep)


def failed_verdict(*, call_id: str, seat: str, role: str, model: str, family: str, error: str) -> Verdict:
    return Verdict(call_id, seat, role, model, family, "failed", error=error)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_verdict.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/verdict.py core/studio/tests/test_room_verdict.py
git commit -m "feat(room): verdict schema, blockers only inside the seat's role

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Call ledger

**Files:**
- Create: `core/studio/room/ledger.py`
- Test: `core/studio/tests/test_room_ledger.py`

**Interfaces:**
- Produces: `DEFAULT: Path`, `ledger_path() -> Path`, `CapReached(RuntimeError)`, dataclass `CallRow` (fields `call_id, at, channel, video, gate, round, seat, model, family, cli_version, prompt_sha256, output_sha256, duration_s, status`), class `Ledger(path: Path | None = None)` with `reserve(*, channel, video, gate, round, seat, model, family, prompt_sha256, daily_cap, script_cap, now=None) -> str`, `finish(call_id, *, status, output_sha256, duration_s, cli_version="") -> None`, `get(call_id) -> CallRow | None`, `count(*, channel=None, video=None, gate=None) -> int`.

- [ ] **Step 1: Write the failing test**

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_ledger.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'ledger'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/ledger.py`:

```python
"""The room's call ledger: every model call, reserved against the caps before it runs.

One SQLite file outside the repo and outside ~/.config/omni-studio/ (secrets), shared by every worktree so
parallel channel sessions count against the same daily cap. Reservation is one IMMEDIATE transaction.
"""

from __future__ import annotations

import os
import sqlite3
import uuid
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DEFAULT = Path.home() / ".local" / "state" / "omni-studio" / "room" / "ledger.sqlite"
SCHEMA = """CREATE TABLE IF NOT EXISTS calls (
    call_id TEXT PRIMARY KEY, at TEXT NOT NULL, channel TEXT, video TEXT, gate TEXT, round INTEGER,
    seat TEXT, model TEXT, family TEXT, cli_version TEXT, prompt_sha256 TEXT, output_sha256 TEXT,
    duration_s REAL, status TEXT NOT NULL)"""


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


def ledger_path() -> Path:
    env = os.environ.get("OMNI_ROOM_LEDGER")
    return Path(env) if env else DEFAULT


class Ledger:
    def __init__(self, path: Optional[Path] = None):
        self.path = Path(path) if path else ledger_path()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self._connect()) as db:
            db.execute(SCHEMA)

    def _connect(self) -> sqlite3.Connection:
        db = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        db.row_factory = sqlite3.Row
        return db

    def reserve(self, *, channel: str, video: str, gate: str, round: int, seat: str, model: str, family: str,
                prompt_sha256: str, daily_cap: int, script_cap: int, now: Optional[datetime] = None) -> str:
        at = (now or datetime.now(timezone.utc)).isoformat()
        call_id = uuid.uuid4().hex
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
               cli_version: str = "") -> None:
        with closing(self._connect()) as db:
            cur = db.execute("UPDATE calls SET status = ?, output_sha256 = ?, duration_s = ?, cli_version = ? "
                             "WHERE call_id = ?", (status, output_sha256, duration_s, cli_version, call_id))
            if cur.rowcount != 1:
                raise KeyError(call_id)

    def get(self, call_id: str) -> Optional[CallRow]:
        with closing(self._connect()) as db:
            row = db.execute("SELECT * FROM calls WHERE call_id = ?", (call_id,)).fetchone()
        return CallRow(**dict(row)) if row else None

    def count(self, *, channel: Optional[str] = None, video: Optional[str] = None,
              gate: Optional[str] = None) -> int:
        where, args = [], []
        for col, val in (("channel", channel), ("video", video), ("gate", gate)):
            if val is not None:
                where.append(f"{col} = ?")
                args.append(val)
        sql = "SELECT COUNT(*) FROM calls" + (" WHERE " + " AND ".join(where) if where else "")
        with closing(self._connect()) as db:
            return db.execute(sql, args).fetchone()[0]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_ledger.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/ledger.py core/studio/tests/test_room_ledger.py
git commit -m "feat(room): shared call ledger that reserves against the caps before a call

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Draft snapshots

**Files:**
- Create: `core/studio/room/snapshot.py`
- Test: `core/studio/tests/test_room_snapshot.py`

**Interfaces:**
- Produces: `sha256_bytes(data: bytes) -> str`, `sha256_text(text: str) -> str`, `sha256_file(path: Path) -> str`, `drafts_dir(video_dir: Path) -> Path`, `save_draft(video_dir: Path, source: Path) -> str` (returns the sha256 of the file's bytes), `load_draft(video_dir: Path, sha: str) -> str`.

- [ ] **Step 1: Write the failing test**

```python
"""Every reviewed draft is kept, named by the sha256 of its bytes."""

from __future__ import annotations

import pytest

from studio.room import snapshot as s


def test_save_and_load_a_draft(tmp_path):
    src = tmp_path / "script.md"
    src.write_text("PROF: Hello.\n", encoding="utf-8")
    sha = s.save_draft(tmp_path / "video", src)
    assert sha == s.sha256_file(src)
    assert (tmp_path / "video" / "room" / "drafts" / f"{sha}.md").is_file()
    assert s.load_draft(tmp_path / "video", sha) == "PROF: Hello.\n"
    assert s.save_draft(tmp_path / "video", src) == sha  # idempotent


def test_an_edited_snapshot_is_refused(tmp_path):
    src = tmp_path / "script.md"
    src.write_text("a\n")
    sha = s.save_draft(tmp_path, src)
    (s.drafts_dir(tmp_path) / f"{sha}.md").write_text("b\n")
    with pytest.raises(ValueError, match="edited"):
        s.load_draft(tmp_path, sha)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_snapshot.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'snapshot'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/snapshot.py`:

```python
"""Content-addressed draft snapshots: videos/<id>/room/drafts/<sha256>.md, one per reviewed draft."""

from __future__ import annotations

import hashlib
from pathlib import Path


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8"))


def sha256_file(path: Path) -> str:
    return sha256_bytes(Path(path).read_bytes())


def drafts_dir(video_dir: Path) -> Path:
    return Path(video_dir) / "room" / "drafts"


def save_draft(video_dir: Path, source: Path) -> str:
    data = Path(source).read_bytes()
    sha = sha256_bytes(data)
    dest = drafts_dir(video_dir) / f"{sha}.md"
    if not dest.is_file():
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    return sha


def load_draft(video_dir: Path, sha: str) -> str:
    data = (drafts_dir(video_dir) / f"{sha}.md").read_bytes()
    if sha256_bytes(data) != sha:
        raise ValueError(f"draft snapshot {sha[:12]} was edited after it was saved")
    return data.decode("utf-8")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_snapshot.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/snapshot.py core/studio/tests/test_room_snapshot.py
git commit -m "feat(room): content-addressed draft snapshots

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Room config, shared seat briefs, Professor of Us room.yaml

**Files:**
- Create: `core/studio/room/config.py`, `core/studio/room/seats/viewer.md`, `core/studio/room/seats/story.md`, `core/studio/room/seats/fact.md`, `core/studio/room/seats/judge.md`, `channels/professor-of-us/room.yaml`
- Test: `core/studio/tests/test_room_config.py`

**Interfaces:**
- Consumes: `models.load_registry`, `models.family_of`, `models.UnknownModel` (Task 1); `verdict.ROLES`, `verdict.MANDATORY`, `verdict.LOCKED_ROLES` (Task 2).
- Produces: `SEATS_DIR: Path`, `PITCH_CLIPS`, `LOCAL_TTS`, `RoomConfigError(ValueError)`, dataclasses `SeatConfig(name, role, model, brief: Path)` and `RoomConfig(writer, judge, rounds, daily_cap, seats, format, linters, adopted, pitch_clip, sources, path, channel_dir)`, `load_room(path: Path, channel_dir: Path | None = None) -> RoomConfig`, `derived_cap(cfg: RoomConfig) -> int`, `validate(cfg: RoomConfig, registry: dict | None = None) -> list[str]`.

- [ ] **Step 1: Write the failing test**

```python
"""room.yaml: seats by role, one model each, family rules, a cap derived from the panel."""

from __future__ import annotations

from pathlib import Path

import pytest

from studio.room import config as C

REAL_ROOT = Path(__file__).resolve().parents[3]
POU = REAL_ROOT / "channels" / "professor-of-us"

BASE = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 3
daily_cap: 80
adopted: null
pitch_clip: after_g2
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
linters: []
sources: []
"""


def _cfg(tmp_path, text=BASE):
    (tmp_path / "room.yaml").write_text(text)
    return C.load_room(tmp_path / "room.yaml")


def test_the_professor_of_us_room_is_valid():
    cfg = C.load_room(POU / "room.yaml")
    assert C.validate(cfg) == []
    assert {s.role for s in cfg.seats} >= {"viewer", "story", "fact"}


def test_derived_cap(tmp_path):
    cfg = _cfg(tmp_path)
    assert C.derived_cap(cfg) == 3 * (3 + 2) + 3 * 3 + 3 + 2  # 29


def test_a_missing_mandatory_role_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("role: fact", "role: craft"))
    assert any("missing mandatory role" in p for p in C.validate(cfg))


def test_a_story_seat_on_the_writer_family_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("role: story, model: gpt-5.6-sol-high", "role: story, model: claude-sonnet-5-5"))
    assert any("story editor" in p and "writer's family" in p for p in C.validate(cfg))


def test_a_judge_on_the_writer_family_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("judge: gpt-5.6-sol-high", "judge: claude-sonnet-5-5"))
    assert any("judge" in p for p in C.validate(cfg))


def test_mandatory_seats_need_two_other_families(tmp_path):
    text = BASE.replace("grok-4.7-high", "gpt-5.6-sol-high").replace("gemini-3.7-flash-high", "gpt-5.6-sol-high")
    assert any("two or more families" in p for p in C.validate(_cfg(tmp_path, text)))


def test_an_unknown_model_and_a_missing_brief_fail(tmp_path):
    text = BASE.replace("grok-4.7-high", "mystery-1").replace('"shared:fact"', "room/seats/nope.md")
    problems = C.validate(_cfg(tmp_path, text))
    assert any("mystery-1" in p for p in problems) and any("nope.md" in p for p in problems)


def test_a_daily_cap_below_one_script_fails(tmp_path):
    assert any("daily cap" in p for p in C.validate(_cfg(tmp_path, BASE.replace("daily_cap: 80", "daily_cap: 10"))))


def test_pre_g2_local_needs_only_local_voices(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("pitch_clip: after_g2", "pitch_clip: pre_g2_local"))
    assert any("voices.yaml" in p for p in C.validate(cfg))
    (tmp_path / "voices.yaml").write_text("voices:\n  narrator: {tool: qwen3}\n  citizen: {tool: chatterbox}\n")
    assert C.validate(cfg) == []
    (tmp_path / "voices.yaml").write_text("voices:\n  narrator: {tool: higgsfield elevenlabs_v4}\n")
    assert any("not a free local engine" in p for p in C.validate(cfg))


def test_a_missing_key_is_a_config_error(tmp_path):
    with pytest.raises(C.RoomConfigError, match="seats"):
        _cfg(tmp_path, "writer: claude-opus-5-5\njudge: gpt-5.6-sol-high\nrounds: 3\n")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_config.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'config'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/config.py`:

```python
"""A channel's room.yaml: its seats (role, model, brief), caps, format parameters, linters and sources.

Validation enforces the spine's invariants: the three mandatory roles, one model per seat from the registry,
viewer/story/fact/neutrality seats and the judge never on the writer's family, mandatory seats spread over two or
more other families, a daily cap that fits one script, and pre_g2_local only for channels whose voices are all
free local engines.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Optional

import yaml

from studio.room.models import UnknownModel, family_of, load_registry
from studio.room.verdict import LOCKED_ROLES, MANDATORY, ROLES

SEATS_DIR = Path(__file__).resolve().parent / "seats"
PITCH_CLIPS = ("after_g2", "pre_g2_local")
LOCAL_TTS = ("qwen3", "chatterbox", "kokoro")
REQUIRED = ("writer", "judge", "rounds", "seats")


class RoomConfigError(ValueError):
    pass


@dataclass
class SeatConfig:
    name: str
    role: str
    model: str
    brief: Path


@dataclass
class RoomConfig:
    writer: str
    judge: str
    rounds: int
    daily_cap: int
    seats: list[SeatConfig]
    format: dict[str, Any] = field(default_factory=dict)
    linters: list[str] = field(default_factory=list)
    adopted: Optional[date] = None
    pitch_clip: str = "after_g2"
    sources: list[str] = field(default_factory=list)
    path: Optional[Path] = None
    channel_dir: Optional[Path] = None


def _brief(value: str, channel_dir: Path) -> Path:
    if value.startswith("shared:"):
        return SEATS_DIR / f"{value[len('shared:'):]}.md"
    return channel_dir / value


def load_room(path: Path, channel_dir: Optional[Path] = None) -> RoomConfig:
    path = Path(path)
    channel_dir = Path(channel_dir) if channel_dir else path.parent
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    missing = [k for k in REQUIRED if k not in data]
    if missing:
        raise RoomConfigError(f"{path}: missing {missing}")
    try:
        seats = [SeatConfig(str(s["name"]), str(s["role"]), str(s["model"]), _brief(str(s["brief"]), channel_dir))
                 for s in data["seats"]]
    except (KeyError, TypeError) as exc:
        raise RoomConfigError(f"{path}: every seat needs name, role, model and brief ({exc})") from exc
    return RoomConfig(writer=str(data["writer"]), judge=str(data["judge"]), rounds=int(data["rounds"]),
                      daily_cap=int(data.get("daily_cap", 80)), seats=seats, format=data.get("format") or {},
                      linters=list(data.get("linters") or []), adopted=data.get("adopted"),
                      pitch_clip=str(data.get("pitch_clip", "after_g2")), sources=list(data.get("sources") or []),
                      path=path, channel_dir=channel_dir)


def derived_cap(cfg: RoomConfig) -> int:
    seats = len(cfg.seats)
    mandatory = sum(1 for s in cfg.seats if s.role in MANDATORY)
    return cfg.rounds * (seats + 2) + cfg.rounds * seats + mandatory + 2


def _voices_problems(channel_dir: Path) -> list[str]:
    voices_file = channel_dir / "voices.yaml"
    if not voices_file.is_file():
        return ["pitch_clip pre_g2_local needs a voices.yaml"]
    voices = (yaml.safe_load(voices_file.read_text(encoding="utf-8")) or {}).get("voices") or {}
    if not voices:
        return ["pitch_clip pre_g2_local needs a non-empty voices.yaml"]
    return [f"pitch_clip pre_g2_local: voice {name!r} uses {v.get('tool')!r}, not a free local engine {LOCAL_TTS}"
            for name, v in voices.items() if not isinstance(v, dict) or v.get("tool") not in LOCAL_TTS]


def validate(cfg: RoomConfig, registry: Optional[dict] = None) -> list[str]:
    reg = load_registry() if registry is None else registry
    problems: list[str] = []

    def fam(model: str, what: str) -> Optional[str]:
        try:
            return family_of(model, reg)
        except UnknownModel as exc:
            problems.append(f"{what}: {exc}")
            return None

    writer = fam(cfg.writer, "writer")
    judge = fam(cfg.judge, "judge")
    if writer and judge == writer:
        problems.append(f"judge {cfg.judge} is the writer's family ({writer})")
    if not 1 <= cfg.rounds <= 5:
        problems.append(f"rounds must be 1 to 5, not {cfg.rounds}")
    seen: set[str] = set()
    mandatory_families: set[str] = set()
    for s in cfg.seats:
        if s.name in seen:
            problems.append(f"seat {s.name!r} appears twice")
        seen.add(s.name)
        if s.role not in ROLES:
            problems.append(f"seat {s.name!r}: unknown role {s.role!r} (want one of {ROLES})")
        f = fam(s.model, f"seat {s.name!r}")
        if f and writer and s.role in LOCKED_ROLES and f == writer:
            problems.append(f"seat {s.name!r} ({s.role}) is on the writer's family ({writer})")
        if f and s.role in MANDATORY and f != writer:
            mandatory_families.add(f)
        if not s.brief.is_file():
            problems.append(f"seat {s.name!r}: brief {s.brief} does not exist")
    roles = {s.role for s in cfg.seats}
    for role in MANDATORY:
        if role not in roles:
            problems.append(f"missing mandatory role {role!r}")
    if len(mandatory_families) < 2:
        problems.append("the viewer, story and fact seats need two or more families other than the writer's")
    if cfg.pitch_clip not in PITCH_CLIPS:
        problems.append(f"pitch_clip must be one of {PITCH_CLIPS}")
    elif cfg.pitch_clip == "pre_g2_local" and cfg.channel_dir:
        problems += _voices_problems(cfg.channel_dir)
    cap = derived_cap(cfg)
    if cfg.daily_cap < cap:
        problems.append(f"daily cap {cfg.daily_cap} is below one script's derived cap {cap}")
    return problems
```

`core/studio/room/seats/viewer.md`:

```markdown
# Seat: viewer

Provisional brief, replaced by the reviewer-seat spec (A3).

You are the channel's viewer as described in `audience.md`: watching on a phone, free to leave at any second.
Read the draft as if it were playing at normal speed.

Check only:
- The exact line where you would stop watching, and why. Quote it.
- The first 30 seconds: does the opening deliver what the title and thumbnail promised, and give a reason to stay?
- Mid-video sag: any stretch where nothing new happens for you.
- Words or ideas you would not understand without pausing.

A blocker is a line where you would leave. Everything else is a suggestion. List up to three lines worth keeping.
```

`core/studio/room/seats/story.md`:

```markdown
# Seat: story

Provisional brief, replaced by the reviewer-seat spec (A3).

You are the story and retention editor. Check only:
- Every beat joins the next with "but" or "therefore", never "and then".
- Every question or open loop the draft raises is answered later; the opening's loop closes near the end.
- The common wrong belief is stated fairly before it is broken.
- Stakes rise; the strongest payoff comes last or at about two-thirds.
- The channel's format rules in `style.md` (question or interjection cadence, wordless holds, word budget).
- Characters (if any) sound distinct: could two speakers' lines be swapped without anyone noticing?

A blocker is a structural fault the owner would reject. Quote the line and give the replacement.
```

`core/studio/room/seats/fact.md`:

```markdown
# Seat: fact

Provisional brief, replaced by the reviewer-seat spec (A3).

You are the fact reviewer. You have the draft and `claims.md`. Check only:
- Every spoken number, date, name or finding cites a claim id, and the spoken line says no more than the row's
  verbatim quote supports. Watch scope: a source about one place, period or species stated as general.
- Contested rows are spoken with a caveat.
- The wrong belief is described accurately, not as a straw man.

Every unsupported or overstated line is a blocker. Quote the line, name the claim id, and give a corrected line
that the quote supports. Never supply a new source or number yourself; write "needs a source" instead.
```

`core/studio/room/seats/judge.md`:

```markdown
# Judge

You compare two drafts of the same video, A and B. You do not know who wrote either. Pick the one a viewer from
`audience.md` would more likely watch to the end, provided it is not less accurate. Length is not a merit. If they
are equally good, answer "tie".
```

`channels/professor-of-us/room.yaml`:

```yaml
# The quality room for Professor of Us (docs/superpowers/specs/2026-11-08-quality-spine-design.md).
# adopted stays null until A2 wires the room check; then it is the first video's date.
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 3
daily_cap: 80
adopted: null
pitch_clip: after_g2
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format:
  wpm: 155
  word_budget: [700, 900]          # style.md: 780-850 words for the 5-minute format, with slack
  cadence: {marker: "> ASK:", max_gap_s: 30}   # core/studio/rules/viewer-questions.md
linters:
  - "{python} core/engines/pou/scripts/script_lint.py {script} --target-minutes 5"
sources: [youtube_outliers, wikipedia_pageviews]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_config.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `10 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/config.py core/studio/room/seats channels/professor-of-us/room.yaml core/studio/tests/test_room_config.py
git commit -m "feat(room): room.yaml with role-based seats, family rules and a derived cap

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Deterministic lint

**Files:**
- Create: `core/studio/room/slop.yaml`, `core/studio/room/lint.py`
- Test: `core/studio/tests/test_room_lint.py`

**Interfaces:**
- Consumes: `studio.claims.spoken_lines`, `studio.claims.CITE_RE`, `studio.claims._cells`, `studio.claims._column` (existing).
- Produces: `ROOT: Path`, dataclass `LintReport(ok: bool, problems: list[str], warnings: list[str])` with `as_dict()`, `load_slop(path=SLOP) -> dict`, `slop_hits(text, slop) -> list[str]`, `and_then(text) -> list[str]`, `word_count(text) -> int`, `cadence(text, *, wpm, max_gap_s, speakers=None, marker=None) -> list[str]`, `ledger_quotes(script_text, ledger_text) -> list[str]`, `run_linters(commands, *, script, video_dir, runner=None) -> list[str]`, `lint_draft(path, *, kind, fmt, linters, ledger=None, slop=None, runner=None) -> LintReport`.

- [ ] **Step 1: Write the failing test**

```python
"""Lint before opinion: slop words, 'and then', word budget, cadence, ledger quotes, channel linters."""

from __future__ import annotations

import subprocess
from pathlib import Path

from studio.room import lint

SCRIPT = """\
## [00:00] Hook
PROF: Most people think cave people slept eight hours straight (c01).
OOG: Eight? I slept whenever the fire got low.
> ASK: How long did they really sleep?
YOU: Four hours?
PROF: Two sleeps, in fact (c02). And then the fire went out.
"""
LEDGER = """\
| id | claim as it will be spoken | source URL | verbatim quote | status |
|---|---|---|---|---|
| c01 | eight hours | https://a.example | "eight hours" | sourced |
| c02 | two sleeps | https://b.example |  | sourced |
"""


def test_slop_words_are_found():
    slop = {"words": ["delve", "tapestry"], "phrases": ["a testament to"], "patterns": [r"\bnot just [^.]+, but\b"]}
    hits = lint.slop_hits("PROF: Let's delve in. It is a testament to grit.\nOOG: Not just fire, but light.\n", slop)
    assert len(hits) == 3


def test_and_then_is_flagged():
    assert len(lint.and_then(SCRIPT)) == 1


def test_word_count_counts_spoken_words_only():
    assert lint.word_count(SCRIPT) == 29  # claim ids, speaker labels, cues and bare punctuation not counted


def test_cadence_by_marker_and_by_speaker():
    long = "## [00:00] A\n" + "PROF: " + "word " * 200 + "\n> ASK: Why?\nYOU: Because.\n"
    assert lint.cadence(long, wpm=155, max_gap_s=30, marker="> ASK:")  # ~77 s before the first ask
    assert lint.cadence(SCRIPT, wpm=155, max_gap_s=30, marker="> ASK:") == []
    assert lint.cadence(long, wpm=155, max_gap_s=12, speakers=["YOU"])


def test_ledger_quotes_flags_a_cited_row_with_no_quote():
    problems = lint.ledger_quotes(SCRIPT, LEDGER)
    assert problems == ["c02: cited in the script but its ledger row has no verbatim quote"]
    assert lint.ledger_quotes(SCRIPT, "| id | claim | source | status |\n|--|--|--|--|\n") == [
        "claims.md has no verbatim quote column"]


def test_a_failing_channel_linter_is_a_problem(tmp_path):
    def runner(cmd, **kw):
        return subprocess.CompletedProcess(cmd, 1, stdout="[FAIL] item 5: greeting\n", stderr="")

    problems = lint.run_linters(["{python} x.py {script}"], script=tmp_path / "s.md", video_dir=tmp_path, runner=runner)
    assert len(problems) == 1 and "greeting" in problems[0]


def test_lint_draft_puts_it_together(tmp_path):
    (tmp_path / "script.md").write_text(SCRIPT)
    (tmp_path / "claims.md").write_text(LEDGER)
    report = lint.lint_draft(tmp_path / "script.md", kind="script",
                             fmt={"wpm": 155, "word_budget": [10, 20], "cadence": {"marker": "> ASK:", "max_gap_s": 30}},
                             linters=[], ledger=tmp_path / "claims.md", slop={"words": [], "phrases": [], "patterns": []})
    assert not report.ok
    assert any("word budget" in p for p in report.problems)
    assert any("c02" in p for p in report.problems)
    assert any("and then" in w for w in report.warnings)


def test_the_real_slop_list_loads():
    slop = lint.load_slop()
    assert "delve" in slop["words"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_lint.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'lint'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/slop.yaml`:

```yaml
# Words, phrases and patterns that mark machine-written prose. Hits are warnings; more than `max_hits` in one draft
# is a lint failure. Sources: Wikipedia "Signs of AI writing"
# (https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), EQ-Bench slop-score
# (https://github.com/sam-paech/slop-score), vale-deslop (https://github.com/dnunez24/vale-deslop).
# Recorded in core/lock.yaml in A2.
max_hits: 3
words: [delve, delves, delving, tapestry, testament, intricate, showcasing, showcase, underscore, underscores,
        pivotal, realm, embark, multifaceted, meticulous, meticulously, bustling, vibrant, seamless, seamlessly,
        boasts, nestled, ever-evolving, game-changer, unlock, unleash, navigate, landscape, crucial]
phrases: ["a testament to", "rich tapestry", "plays a crucial role", "in today's world", "have you ever wondered",
          "at the end of the day", "it's important to note", "it is worth noting", "in conclusion", "to sum up",
          "serves as a", "stands as a", "the power of", "more than just"]
patterns:
  - "\\bnot (?:just|only|merely) [^.?!]{1,60}, but\\b"
  - "\\bit'?s not [^.?!]{1,40}[,;:] it'?s\\b"
  - "\\bisn'?t (?:just )?about [^.?!]{1,40}[,;:] it'?s about\\b"
```

`core/studio/room/lint.py`:

```python
"""The room's deterministic lint: runs before any model reads a draft.

Shared checks (slop words, 'and then' joins, the ledger's verbatim quotes) plus the channel's format parameters
from room.yaml (word budget, question or interjection cadence) and the channel's own linters, which run as
commands so the core never imports a channel engine.
"""

from __future__ import annotations

import re
import shlex
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import yaml

from studio.claims import CITE_RE, _cells, _column, spoken_lines

ROOT = Path(__file__).resolve().parents[3]
SLOP = Path(__file__).resolve().parent / "slop.yaml"
SPEAKER = re.compile(r"^([A-Z][A-Z ]{1,15}):\s*")
AND_THEN = re.compile(r"\band then\b", re.IGNORECASE)
WORD = re.compile(r"\w[\w'’-]*")


def _words(line: str) -> int:
    return len(WORD.findall(CITE_RE.sub("", line)))


@dataclass
class LintReport:
    ok: bool
    problems: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {"ok": self.ok, "problems": self.problems, "warnings": self.warnings}


def load_slop(path: Path = SLOP) -> dict[str, Any]:
    return yaml.safe_load(Path(path).read_text(encoding="utf-8"))


def _spoken(text: str) -> list[tuple[int, str]]:
    lines = spoken_lines(text)
    return lines if lines else [(n, l.strip()) for n, l in enumerate(text.splitlines(), 1) if l.strip()]


def slop_hits(text: str, slop: dict[str, Any]) -> list[str]:
    hits = []
    for n, line in _spoken(text):
        low = line.lower()
        for w in slop.get("words") or []:
            if re.search(rf"\b{re.escape(w.lower())}\b", low):
                hits.append(f"line {n}: slop word {w!r}")
        for p in slop.get("phrases") or []:
            if p.lower() in low:
                hits.append(f"line {n}: slop phrase {p!r}")
        for pat in slop.get("patterns") or []:
            if re.search(pat, low):
                hits.append(f"line {n}: slop pattern {pat!r}")
    return hits


def and_then(text: str) -> list[str]:
    return [f"line {n}: 'and then' joins two beats; use but or therefore" for n, line in _spoken(text)
            if AND_THEN.search(line)]


def word_count(text: str) -> int:
    return sum(_words(line) for _, line in spoken_lines(text))


def _mmss(seconds: float) -> str:
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"


def cadence(text: str, *, wpm: float, max_gap_s: float, speakers: Optional[list[str]] = None,
            marker: Optional[str] = None) -> list[str]:
    spoken = dict(spoken_lines(text))
    t, hits = 0.0, []
    for n, raw in enumerate(text.splitlines(), 1):
        s = raw.strip()
        if n in spoken:
            m = SPEAKER.match(s)
            if speakers and m and m.group(1).strip() in speakers:
                hits.append(t)
            t += _words(spoken[n]) / wpm * 60
        elif marker and s.upper().startswith(marker.upper()):
            hits.append(t)
    label = marker or "/".join(speakers or [])
    problems, last = [], 0.0
    for at in hits + [t]:
        if at - last > max_gap_s:
            problems.append(f"{_mmss(last)}-{_mmss(at)}: {at - last:.0f} s with no {label} (want at most {max_gap_s:g} s)")
        last = at
    return problems


def _quotes(ledger_text: str) -> Optional[dict[str, str]]:
    lines = ledger_text.splitlines()
    for i, line in enumerate(lines):
        if not line.lstrip().startswith("|"):
            continue
        header = [c.lower() for c in _cells(line)]
        id_col, quote_col = _column(header, "id"), _column(header, "verbatim", "quote")
        if id_col is None or quote_col is None:
            continue
        quotes: dict[str, str] = {}
        for row in lines[i + 2:]:
            if not row.lstrip().startswith("|"):
                break
            cells = _cells(row) + [""] * len(header)
            quotes[cells[id_col]] = cells[quote_col].strip()
        return quotes
    return None


def ledger_quotes(script_text: str, ledger_text: str) -> list[str]:
    quotes = _quotes(ledger_text)
    if quotes is None:
        return ["claims.md has no verbatim quote column"]
    cited = {c.strip() for _, line in spoken_lines(script_text) for g in CITE_RE.findall(line) for c in g.split(",")}
    return [f"{cid}: cited in the script but its ledger row has no verbatim quote"
            for cid in sorted(cited) if cid in quotes and not quotes[cid]]


def run_linters(commands: list[str], *, script: Path, video_dir: Path, runner=None) -> list[str]:
    runner = runner or subprocess.run
    problems = []
    for template in commands:
        cmd = shlex.split(template.format(python=sys.executable, script=script, video=video_dir, root=ROOT))
        proc = runner(cmd, cwd=ROOT, capture_output=True, text=True, timeout=300)
        if proc.returncode != 0:
            tail = " | ".join((proc.stdout + proc.stderr).strip().splitlines()[-5:])
            problems.append(f"{Path(cmd[1] if len(cmd) > 1 else cmd[0]).name} exited {proc.returncode}: {tail}")
    return problems


def lint_draft(path: Path, *, kind: str, fmt: dict[str, Any], linters: list[str], ledger: Optional[Path] = None,
               slop: Optional[dict[str, Any]] = None, runner=None) -> LintReport:
    text = Path(path).read_text(encoding="utf-8")
    slop = load_slop() if slop is None else slop
    problems: list[str] = []
    warnings = slop_hits(text, slop)
    if len(warnings) > int(slop.get("max_hits", 3)):
        problems.append(f"{len(warnings)} slop hits (more than {slop.get('max_hits', 3)})")
    if kind == "script":
        warnings += and_then(text)
        wpm = float(fmt.get("wpm", 155))
        if "word_budget" in fmt:
            lo, hi = fmt["word_budget"]
            n = word_count(text)
            if not lo <= n <= hi:
                problems.append(f"word budget: {n} spoken words, want {lo}-{hi}")
        if "cadence" in fmt:
            c = fmt["cadence"]
            problems += cadence(text, wpm=wpm, max_gap_s=float(c["max_gap_s"]), speakers=c.get("speakers"),
                                marker=c.get("marker"))
        if ledger and Path(ledger).is_file():
            problems += ledger_quotes(text, Path(ledger).read_text(encoding="utf-8"))
        problems += run_linters(linters, script=Path(path), video_dir=Path(path).parent, runner=runner)
    return LintReport(not problems, problems, warnings)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_lint.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `8 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/slop.yaml core/studio/room/lint.py core/studio/tests/test_room_lint.py
git commit -m "feat(room): deterministic lint, slop, cadence, ledger quotes and channel linters

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Sandboxed seat call

**Files:**
- Create: `core/studio/room/call.py`
- Modify: `.gitignore` (append one line)
- Test: `core/studio/tests/test_room_call.py`

**Interfaces:**
- Consumes: `models.cli_of`, `models.family_of`; `verdict.parse_verdict`, `verdict.failed_verdict`, `verdict.BadVerdict`, `verdict.Verdict`; `ledger.Ledger`; `snapshot.sha256_text`; `config.SeatConfig`.
- Produces: dataclass `CallContext(channel, video, gate, round, daily_cap, script_cap)`, `deny_paths() -> list[Path]`, `sandbox_profile(deny: list[Path]) -> str`, `clean_env() -> dict[str, str]`, `seat_prompt(brief: str, role: str, inputs: dict[str, str]) -> str`, `build_command(model, prompt, registry=None) -> list[str]`, `cli_text(stdout: str) -> str`, `cli_version(cli: str, runner=None) -> str`, `invoke(cmd, *, runner=None, timeout=600) -> tuple[int, str, float]`, `run_seat(seat, *, inputs, ledger, ctx, out, raw_dir=None, runner=None, timeout=600, registry=None) -> Verdict`.

- [ ] **Step 1: Write the failing test**

```python
"""A seat call: a prompt with the inputs inline, the CLI run under sandbox-exec, one retry, a verdict file."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from studio.room import call as C
from studio.room.config import SeatConfig
from studio.room.ledger import Ledger

REG = {"gpt-5.6-sol-high": {"family": "openai", "cli": "cursor"},
       "claude-sonnet-5-5": {"family": "anthropic", "cli": "claude"}}
VERDICT = {"scores": {"x": 6}, "blockers": [], "suggestions": [], "keep": [{"line": 1, "quote": "Hi"}]}


def _seat(tmp_path):
    brief = tmp_path / "brief.md"
    brief.write_text("Check only pacing.")
    return SeatConfig("story editor", "story", "gpt-5.6-sol-high", brief)


def _ctx():
    return C.CallContext("professor-of-us", "2026-11-10_x", "g2", 1, daily_cap=50, script_cap=50)


def fake_runner(outputs):
    calls = []

    def run(cmd, **kw):
        calls.append((cmd, kw))
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="9.9.9\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout=outputs.pop(0), stderr="")

    run.calls = calls
    return run


def test_build_command_picks_the_cli():
    claude = C.build_command("claude-sonnet-5-5", "P", REG)
    assert claude[:2] == ["claude", "-p"] and "--tools" in claude and claude[claude.index("--tools") + 1] == ""
    cursor = C.build_command("gpt-5.6-sol-high", "P", REG)
    assert cursor[:2] == ["cursor-agent", "-p"] and cursor[cursor.index("--mode") + 1] == "ask"
    assert "--force" not in cursor and "--yolo" not in cursor


def test_the_prompt_numbers_the_draft_and_inlines_the_inputs():
    p = C.seat_prompt("Check pacing.", "story", {"draft": "A\nB", "audience.md": "Teens"})
    assert "   1  A\n   2  B" in p and "=== audience.md ===\nTeens" in p and "Check pacing." in p


def test_cli_text_reads_both_json_shapes():
    assert C.cli_text(json.dumps({"type": "result", "result": "hello"})) == "hello"
    assert C.cli_text("plain") == "plain"


def test_the_sandbox_denies_secrets_and_the_repo():
    profile = C.sandbox_profile(C.deny_paths())
    assert '(deny file-read* (subpath "' + str((Path.home() / ".config" / "omni-studio").resolve()) + '"))' in profile
    assert str(C.ROOT) in profile


def test_clean_env_drops_everything_but_the_basics(monkeypatch):
    monkeypatch.setenv("OMNI_STUDIO_APPROVAL_KEY", "/secret")
    env = C.clean_env()
    assert "OMNI_STUDIO_APPROVAL_KEY" not in env and "PATH" in env and "HOME" in env


def test_run_seat_writes_a_verdict_and_logs_the_call(tmp_path):
    runner = fake_runner([json.dumps({"result": json.dumps(VERDICT)})])
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "room" / "g2" / "round-1" / "story-editor.json"
    v = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                   raw_dir=tmp_path / "room" / "raw", runner=runner, registry=REG)
    assert v.status == "ok" and v.family == "openai"
    record = json.loads(out.read_text())
    row = db.get(record["call_id"])
    assert row.status == "ok" and row.output_sha256 == record["output_sha256"] and row.cli_version == "9.9.9"
    cmd = [c for c, _ in runner.calls if c[-1] != "--version"][0]
    assert cmd[:2] == ["sandbox-exec", "-p"]
    assert (tmp_path / "room" / "raw").is_dir()


def test_a_bad_answer_is_retried_once_then_the_seat_fails(tmp_path):
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "v.json"
    ok = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                    runner=fake_runner(["not json", json.dumps({"result": json.dumps(VERDICT)})]), registry=REG)
    assert ok.status == "ok" and db.count() == 2
    bad = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                     runner=fake_runner(["nope", "still nope"]), registry=REG)
    assert bad.status == "failed" and json.loads(out.read_text())["status"] == "failed"


@pytest.mark.skipif(not shutil.which("sandbox-exec"), reason="macOS only")
def test_sandbox_exec_really_denies_a_read(tmp_path):
    secret = tmp_path / "denied"
    secret.mkdir()
    (secret / "canary.txt").write_text("CANARY")
    proc = subprocess.run(["sandbox-exec", "-p", C.sandbox_profile([secret]), "cat", str(secret / "canary.txt")],
                          capture_output=True, text=True)
    assert proc.returncode != 0 and "CANARY" not in proc.stdout
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_call.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'call'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/call.py`:

```python
"""One seat's model call, sandboxed.

The seat's inputs (the numbered draft, its brief, the channel bible files) go inline in the prompt; the CLI runs in
an empty temp folder under sandbox-exec with reads of ~/.config/omni-studio/ and the repo denied, a stripped
environment, and a timeout. claude runs with every tool off; cursor-agent runs in ask mode (read-only), never with
--force. Every attempt is reserved in the ledger first. A malformed answer is retried once; then the seat fails.
"""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from studio.room.config import SeatConfig
from studio.room.ledger import Ledger
from studio.room.models import cli_of, family_of
from studio.room.snapshot import sha256_text
from studio.room.verdict import BadVerdict, Verdict, failed_verdict, parse_verdict

ROOT = Path(__file__).resolve().parents[3]
ENV_KEEP = ("PATH", "HOME", "TMPDIR", "LANG", "USER", "LOGNAME", "SHELL")
VERDICT_SPEC = """\
Return only one JSON object and nothing else:
{"scores": {"<what you judged>": <1-10>},
 "blockers": [{"line": <line number or null>, "quote": "<exact words from the draft>", "why": "<the problem>",
               "fix": "<the replacement line or the concrete change>", "domain": "<your role>"}],
 "suggestions": [{"line": <n>, "quote": "<exact words>", "fix": "<concrete change>"}],
 "keep": [{"line": <n>, "quote": "<a line that must survive revision>"}]}
A blocker is something that must change before the owner sees this draft, and only within your role.
Every blocker and suggestion quotes the draft and gives a concrete fix; notes without both are discarded."""


@dataclass
class CallContext:
    channel: str
    video: str
    gate: str
    round: int
    daily_cap: int
    script_cap: int


def deny_paths() -> list[Path]:
    paths = [Path.home() / ".config" / "omni-studio", ROOT]
    try:
        common = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--path-format=absolute", "--git-common-dir"],
                                capture_output=True, text=True, timeout=10).stdout.strip()
        if common:
            paths.append(Path(common).parent)  # the main checkout when ROOT is a worktree
    except (OSError, subprocess.SubprocessError):
        pass
    return list(dict.fromkeys(paths))


def sandbox_profile(deny: list[Path]) -> str:
    # sandbox-exec matches real paths: /var/folders/... is /private/var/folders/... on macOS.
    rules = "\n".join(f'(deny file-read* (subpath "{Path(p).resolve()}"))' for p in deny)
    return f"(version 1)\n(allow default)\n{rules}\n"


def clean_env() -> dict[str, str]:
    return {k: os.environ[k] for k in ENV_KEEP if k in os.environ}


def _numbered(text: str) -> str:
    return "\n".join(f"{i:>4}  {line}" for i, line in enumerate(text.splitlines(), 1))


def seat_prompt(brief: str, role: str, inputs: dict[str, str]) -> str:
    parts = [f"You are the {role} seat in a review room for a YouTube video. You work alone and never see the "
             "other reviewers' notes or who wrote the draft.", brief.strip(), VERDICT_SPEC]
    for name, text in inputs.items():
        parts.append(f"=== {name} ===\n{_numbered(text) if name == 'draft' else text}")
    return "\n\n".join(parts)


def build_command(model: str, prompt: str, registry: Optional[dict] = None) -> list[str]:
    if cli_of(model, registry) == "claude":
        return ["claude", "-p", "--tools", "", "--strict-mcp-config", "--output-format", "json", "--model", model,
                prompt]
    return ["cursor-agent", "-p", "--mode", "ask", "--trust", "--output-format", "json", "--model", model, prompt]


def cli_text(stdout: str) -> str:
    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return stdout
    if isinstance(data, dict) and isinstance(data.get("result"), str):
        return data["result"]
    return stdout


def cli_version(cli: str, runner=None) -> str:
    runner = runner or subprocess.run
    binary = "claude" if cli == "claude" else "cursor-agent"
    try:
        return runner([binary, "--version"], capture_output=True, text=True, timeout=30).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def invoke(cmd: list[str], *, runner=None, timeout: float = 600) -> tuple[int, str, float]:
    runner = runner or subprocess.run
    with tempfile.TemporaryDirectory(prefix="room-seat-") as bundle:
        t0 = time.monotonic()
        try:
            proc = runner(["sandbox-exec", "-p", sandbox_profile(deny_paths()), *cmd], cwd=bundle, env=clean_env(),
                          capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            return 124, "", time.monotonic() - t0
        return proc.returncode, proc.stdout, time.monotonic() - t0


def run_seat(seat: SeatConfig, *, inputs: dict[str, str], ledger: Ledger, ctx: CallContext, out: Path,
             raw_dir: Optional[Path] = None, runner=None, timeout: float = 600,
             registry: Optional[dict] = None) -> Verdict:
    family = family_of(seat.model, registry)
    prompt = seat_prompt(seat.brief.read_text(encoding="utf-8"), seat.role, inputs)
    cmd = build_command(seat.model, prompt, registry)
    version = cli_version(cli_of(seat.model, registry), runner)
    verdict: Optional[Verdict] = None
    error, text, call_id = "", "", ""
    for _ in range(2):
        call_id = ledger.reserve(channel=ctx.channel, video=ctx.video, gate=ctx.gate, round=ctx.round,
                                 seat=seat.name, model=seat.model, family=family,
                                 prompt_sha256=sha256_text(prompt), daily_cap=ctx.daily_cap,
                                 script_cap=ctx.script_cap)
        code, stdout, duration = invoke(cmd, runner=runner, timeout=timeout)
        text = cli_text(stdout)
        if code == 0:
            try:
                verdict = parse_verdict(text, call_id=call_id, seat=seat.name, role=seat.role, model=seat.model,
                                        family=family)
            except BadVerdict as exc:
                error = str(exc)
        else:
            error = f"{cmd[0]} exited {code}"
        ledger.finish(call_id, status="ok" if verdict else "failed", output_sha256=sha256_text(text),
                      duration_s=duration, cli_version=version)
        if raw_dir:
            raw_dir.mkdir(parents=True, exist_ok=True)
            (raw_dir / f"{call_id}.txt").write_text(text, encoding="utf-8")
        if verdict:
            break
    if verdict is None:
        verdict = failed_verdict(call_id=call_id, seat=seat.name, role=seat.role, model=seat.model, family=family,
                                 error=error)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({**verdict.to_dict(), "output_sha256": sha256_text(text)}, indent=2) + "\n",
                   encoding="utf-8")
    return verdict
```

Append to `.gitignore`:

```
# Quality room: raw CLI output per call (verdicts and summaries are tracked)
channels/*/videos/*/room/raw/
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_call.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `8 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/call.py core/studio/tests/test_room_call.py .gitignore
git commit -m "feat(room): sandboxed seat call with a ledger reservation per attempt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Judge

**Files:**
- Create: `core/studio/room/judge.py`
- Test: `core/studio/tests/test_room_judge.py`

**Interfaces:**
- Consumes: `call.build_command`, `call.invoke`, `call.cli_text`, `call.cli_version`, `call.CallContext`; `ledger.Ledger`; `models.family_of`, `models.cli_of`; `verdict.extract_json`, `verdict.BadVerdict`; `snapshot.sha256_text`.
- Produces: `JUDGE_SPEC: str`, `pairwise(new_as_a: str, new_as_b: str) -> str` (`"new"` or `"best"`), `judge_prompt(brief, a, b) -> str`, `parse_judge(text) -> str` (`"A"`, `"B"` or `"tie"`), `run_judge(new_text, best_text, *, model, brief, ledger, ctx, out, runner=None, timeout=600, registry=None) -> dict` with keys `model, family, call_ids, picks, winner`.

- [ ] **Step 1: Write the failing test**

```python
"""The judge: new draft against the best, both orders, labels hidden; a win must hold both ways."""

from __future__ import annotations

import json
import subprocess

import pytest

from studio.room import judge as J
from studio.room.call import CallContext
from studio.room.ledger import Ledger

REG = {"gpt-5.6-sol-high": {"family": "openai", "cli": "cursor"}}


@pytest.mark.parametrize("a,b,winner", [("A", "B", "new"), ("A", "A", "best"), ("B", "B", "best"),
                                         ("tie", "B", "best"), ("B", "A", "best")])
def test_pairwise(a, b, winner):
    assert J.pairwise(a, b) == winner


def test_parse_judge():
    assert J.parse_judge('{"winner": "B", "why": "x"}') == "B"
    with pytest.raises(J.BadVerdict):
        J.parse_judge('{"winner": "C"}')


def test_run_judge_asks_twice_with_the_order_swapped(tmp_path):
    seen = []

    def runner(cmd, **kw):
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        prompt = cmd[-1]
        seen.append(prompt.index("NEW DRAFT") < prompt.index("OLD DRAFT"))
        pick = "A" if len(seen) == 1 else "B"
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": json.dumps({"winner": pick})}), stderr="")

    db = Ledger(tmp_path / "l.sqlite")
    ctx = CallContext("pou", "v", "g2", 2, 50, 50)
    res = J.run_judge("NEW DRAFT", "OLD DRAFT", model="gpt-5.6-sol-high", brief="Pick.", ledger=db, ctx=ctx,
                      out=tmp_path / "judge.json", runner=runner, registry=REG)
    assert seen == [True, False]
    assert res["winner"] == "new" and res["family"] == "openai" and len(res["call_ids"]) == 2
    assert json.loads((tmp_path / "judge.json").read_text())["winner"] == "new"


def test_a_failed_judge_call_is_a_tie(tmp_path):
    def runner(cmd, **kw):
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        return subprocess.CompletedProcess(cmd, 1, stdout="", stderr="boom")

    res = J.run_judge("N", "O", model="gpt-5.6-sol-high", brief="Pick.", ledger=Ledger(tmp_path / "l.sqlite"),
                      ctx=CallContext("pou", "v", "g2", 2, 50, 50), out=tmp_path / "j.json", runner=runner, registry=REG)
    assert res["picks"] == ["tie", "tie"] and res["winner"] == "best"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_judge.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'judge'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/judge.py`:

```python
"""The room's judge: the new candidate against the best candidate so far, asked twice with the order swapped.

The new draft wins only if it is picked as A in the first call and as B in the second. Anything else, a tie or a
failed call included, keeps the best draft.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from studio.room.call import CallContext, build_command, cli_text, cli_version, invoke
from studio.room.ledger import Ledger
from studio.room.models import cli_of, family_of
from studio.room.snapshot import sha256_text
from studio.room.verdict import BadVerdict, extract_json

JUDGE_SPEC = 'Return only one JSON object: {"winner": "A" | "B" | "tie", "why": "<one sentence quoting both drafts>"}'


def pairwise(new_as_a: str, new_as_b: str) -> str:
    return "new" if new_as_a == "A" and new_as_b == "B" else "best"


def judge_prompt(brief: str, a: str, b: str) -> str:
    return f"{brief.strip()}\n\n{JUDGE_SPEC}\n\n=== Draft A ===\n{a}\n\n=== Draft B ===\n{b}"


def parse_judge(text: str) -> str:
    winner = extract_json(text).get("winner")
    if winner not in ("A", "B", "tie"):
        raise BadVerdict(f"winner must be A, B or tie, not {winner!r}")
    return winner


def run_judge(new_text: str, best_text: str, *, model: str, brief: str, ledger: Ledger, ctx: CallContext,
              out: Path, runner=None, timeout: float = 600, registry: Optional[dict] = None) -> dict[str, Any]:
    family = family_of(model, registry)
    version = cli_version(cli_of(model, registry), runner)
    picks, call_ids = [], []
    for a, b in ((new_text, best_text), (best_text, new_text)):
        prompt = judge_prompt(brief, a, b)
        call_id = ledger.reserve(channel=ctx.channel, video=ctx.video, gate=ctx.gate, round=ctx.round, seat="judge",
                                 model=model, family=family, prompt_sha256=sha256_text(prompt),
                                 daily_cap=ctx.daily_cap, script_cap=ctx.script_cap)
        code, stdout, duration = invoke(build_command(model, prompt, registry), runner=runner, timeout=timeout)
        text = cli_text(stdout)
        pick, status = "tie", "failed"
        if code == 0:
            try:
                pick, status = parse_judge(text), "ok"
            except BadVerdict:
                pass
        ledger.finish(call_id, status=status, output_sha256=sha256_text(text), duration_s=duration,
                      cli_version=version)
        picks.append(pick)
        call_ids.append(call_id)
    result = {"model": model, "family": family, "call_ids": call_ids, "picks": picks, "winner": pairwise(*picks)}
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_judge.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `8 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/judge.py core/studio/tests/test_room_judge.py
git commit -m "feat(room): blind pairwise judge, a win must hold in both orders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Round files, stop rule and report

**Files:**
- Create: `core/studio/room/report.py`
- Test: `core/studio/tests/test_room_report.py`

**Interfaces:**
- Consumes: `ledger.Ledger.count`; `verdict.MANDATORY`.
- Produces: `gate_dir(video_dir, gate) -> Path`, `round_dir(video_dir, gate, n) -> Path`, `write_meta(video_dir, gate, n, draft_sha256, lint: dict) -> Path`, `read_meta(video_dir, gate, n) -> dict`, `load_rounds(video_dir, gate) -> list[dict]` (each: `round, draft_sha256, lint, verdicts, judge`; each verdict is the verdict file's dict plus `file`), `is_candidate(round: dict) -> bool`, `shipped(rounds) -> dict | None` (`{"round", "artifact_sha256"}`), `best_before(rounds, n) -> dict | None`, `build_report(video_dir, *, gate, stage, channel, writer_family, ledger, cap) -> dict`, `write_report(video_dir, report) -> tuple[Path, Path]`.

- [ ] **Step 1: Write the failing test**

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_report.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'report'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/report.py`:

```python
"""Round files and the room report.

videos/<id>/room/<gate>/round-<N>/meta.json   draft sha256 and lint result
videos/<id>/room/<gate>/round-<N>/<seat>.json verdicts (written by call.py only)
videos/<id>/room/<gate>/round-<N>/judge.json  the judge's result, when two candidates existed
videos/<id>/room/<gate>.json                   the report the gate check reads
videos/<id>/room-<gate>.md                     what the owner reads

Stop-rule outcome: a round is a candidate when its lint passed and its fact seat returned ok with no blocker. The
first candidate is the best; a later candidate replaces it only when its judge result is "new".
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from studio.room.ledger import Ledger
from studio.room.verdict import MANDATORY

NOT_VERDICTS = ("meta.json", "judge.json")


def gate_dir(video_dir: Path, gate: str) -> Path:
    return Path(video_dir) / "room" / gate


def round_dir(video_dir: Path, gate: str, n: int) -> Path:
    return gate_dir(video_dir, gate) / f"round-{n}"


def write_meta(video_dir: Path, gate: str, n: int, draft_sha256: str, lint: dict[str, Any]) -> Path:
    d = round_dir(video_dir, gate, n)
    d.mkdir(parents=True, exist_ok=True)
    path = d / "meta.json"
    path.write_text(json.dumps({"round": n, "draft_sha256": draft_sha256, "lint": lint}, indent=2) + "\n")
    return path


def read_meta(video_dir: Path, gate: str, n: int) -> dict[str, Any]:
    return json.loads((round_dir(video_dir, gate, n) / "meta.json").read_text())


def load_rounds(video_dir: Path, gate: str) -> list[dict[str, Any]]:
    video_dir = Path(video_dir)
    rounds = []
    dirs = sorted(gate_dir(video_dir, gate).glob("round-*"), key=lambda p: int(p.name.split("-")[1]))
    for d in dirs:
        meta = json.loads((d / "meta.json").read_text())
        verdicts = [{**json.loads(p.read_text()), "file": str(p.relative_to(video_dir))}
                    for p in sorted(d.glob("*.json")) if p.name not in NOT_VERDICTS]
        judge = json.loads((d / "judge.json").read_text()) if (d / "judge.json").is_file() else None
        rounds.append({"round": meta["round"], "draft_sha256": meta["draft_sha256"], "lint": meta["lint"],
                       "verdicts": verdicts, "judge": judge})
    return rounds


def is_candidate(rnd: dict[str, Any]) -> bool:
    if not rnd["lint"].get("ok"):
        return False
    facts = [v for v in rnd["verdicts"] if v["role"] == "fact"]
    return bool(facts) and all(v["status"] == "ok" and not v["blockers"] for v in facts)


def _best(rounds: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    best = None
    for rnd in rounds:
        if is_candidate(rnd) and (best is None or (rnd["judge"] and rnd["judge"]["winner"] == "new")):
            best = rnd
    return best


def best_before(rounds: list[dict[str, Any]], n: int) -> Optional[dict[str, Any]]:
    return _best([r for r in rounds if r["round"] < n])


def shipped(rounds: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    best = _best(rounds)
    return {"round": best["round"], "artifact_sha256": best["draft_sha256"]} if best else None


def build_report(video_dir: Path, *, gate: str, stage: str, channel: str, writer_family: str, ledger: Ledger,
                 cap: int) -> dict[str, Any]:
    video_dir = Path(video_dir)
    rounds = load_rounds(video_dir, gate)
    summary = []
    for rnd in rounds:
        summary.append({
            "round": rnd["round"], "draft_sha256": rnd["draft_sha256"], "lint": rnd["lint"],
            "verdicts": [{"seat": v["seat"], "role": v["role"], "model": v["model"], "family": v["family"],
                          "status": v["status"], "call_id": v["call_id"], "file": v["file"],
                          "output_sha256": v.get("output_sha256", ""), "blockers": len(v["blockers"])}
                         for v in rnd["verdicts"]],
            "judge": rnd["judge"]})
    return {"gate": gate, "stage": stage, "writer_family": writer_family, "rounds": summary,
            "shipped": shipped(rounds), "calls": ledger.count(channel=channel, video=video_dir.name, gate=gate),
            "cap": cap}


def write_report(video_dir: Path, report: dict[str, Any]) -> tuple[Path, Path]:
    video_dir = Path(video_dir)
    gate = report["gate"]
    js = video_dir / "room" / f"{gate}.json"
    js.parent.mkdir(parents=True, exist_ok=True)
    js.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    ship = report["shipped"]
    focus = ship["round"] if ship else (report["rounds"][-1]["round"] if report["rounds"] else None)
    lines = [f"# Room report, {gate.upper()} ({report['stage']})", ""]
    lines.append(f"Shipped: round {ship['round']} ({ship['artifact_sha256'][:12]})" if ship
                 else "Shipped: none. No round passed lint with a clean fact seat, so the gate check will fail.")
    lines += [f"Calls: {report['calls']} of {report['cap']}", "", f"## Open notes in round {focus}", ""]
    for rnd in load_rounds(video_dir, gate):
        if rnd["round"] != focus:
            continue
        for v in rnd["verdicts"]:
            if v["status"] != "ok":
                lines.append(f"- {v['seat']} ({v['role']}): FAILED, {v.get('error', '')}")
            for b in v["blockers"]:
                lines.append(f"- {v['seat']} ({v['role']}) blocker, line {b.get('line')}: \"{b['quote']}\". "
                             f"{b['why']} Fix: {b['fix']}")
            for k in v["keep"]:
                lines.append(f"- {v['seat']} keep, line {k.get('line')}: \"{k.get('quote', '')}\"")
    lines += ["", "## Rounds", "", "| round | lint | seats ok | blockers | judge |", "|---|---|---|---|---|"]
    for rnd in report["rounds"]:
        ok = sum(1 for v in rnd["verdicts"] if v["status"] == "ok")
        blockers = sum(v["blockers"] for v in rnd["verdicts"])
        judge = rnd["judge"]["winner"] if rnd["judge"] else "-"
        lines.append(f"| {rnd['round']} | {'ok' if rnd['lint'].get('ok') else 'fail'} | {ok}/{len(rnd['verdicts'])} "
                     f"| {blockers} | {judge} |")
    missing = [r for r in MANDATORY if ship and not any(
        v["role"] == r and v["status"] == "ok" for rnd in report["rounds"] if rnd["round"] == ship["round"]
        for v in rnd["verdicts"])]
    if missing:
        lines += ["", f"Missing mandatory roles in the shipped round: {', '.join(missing)}"]
    md = video_dir / f"room-{gate}.md"
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return js, md
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_report.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/report.py core/studio/tests/test_room_report.py
git commit -m "feat(room): round files, stop-rule outcome and the room report

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Evidence check

**Files:**
- Create: `core/studio/room/evidence.py`
- Test: `core/studio/tests/test_room_evidence.py`

**Interfaces:**
- Consumes: `snapshot.sha256_file`, `snapshot.drafts_dir`; `ledger.Ledger.get`; `verdict.MANDATORY`, `verdict.LOCKED_ROLES`.
- Produces: `verify(video_dir: Path, report: dict, artifact: Path, ledger: Ledger) -> list[str]` (empty list means pass). A2's `room` gate check calls this.

- [ ] **Step 1: Write the failing test**

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_evidence.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name 'evidence'`

- [ ] **Step 3: Write the implementation**

`core/studio/room/evidence.py`:

```python
"""Room evidence for a gate: what the A2 `room` check verifies before `omni approve` signs G1 or G2.

It catches skipped rounds, missing roles, a failed or blocking fact seat, a seat on the writer's family, edits to the
file after the room, edited verdict files and verdicts the ledger never saw. Like the approval key, it is not a
boundary against an agent that forges both the ledger and the report on purpose.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from studio.room.ledger import Ledger
from studio.room.snapshot import drafts_dir, sha256_file
from studio.room.verdict import LOCKED_ROLES, MANDATORY


def verify(video_dir: Path, report: dict[str, Any], artifact: Path, ledger: Ledger) -> list[str]:
    video_dir = Path(video_dir)
    ship = report.get("shipped")
    if not ship:
        return ["the room shipped no draft (no lint- and fact-clean round)"]
    problems: list[str] = []
    if sha256_file(artifact) != ship["artifact_sha256"]:
        problems.append(f"{Path(artifact).name} changed since the room reviewed it "
                        f"(room: {ship['artifact_sha256'][:12]}, now: {sha256_file(artifact)[:12]})")
    if not (drafts_dir(video_dir) / f"{ship['artifact_sha256']}.md").is_file():
        problems.append("the shipped draft's snapshot is missing")
    rnd = next((r for r in report["rounds"] if r["round"] == ship["round"]), None)
    if rnd is None:
        return problems + [f"shipped round {ship['round']} is not in the report"]
    if rnd["draft_sha256"] != ship["artifact_sha256"]:
        problems.append(f"round {rnd['round']} reviewed a different draft than the one shipped")
    if not rnd["lint"].get("ok"):
        problems.append(f"round {rnd['round']}: lint failed")
    writer = report["writer_family"]
    ok = [v for v in rnd["verdicts"] if v["status"] == "ok"]
    for role in MANDATORY:
        if not any(v["role"] == role for v in ok):
            problems.append(f"round {rnd['round']}: no ok {role} verdict")
    if len({v["family"] for v in ok if v["role"] in MANDATORY} - {writer}) < 2:
        problems.append(f"round {rnd['round']}: mandatory seats need two or more families other than the writer's")
    for v in ok:
        if v["role"] in LOCKED_ROLES and v["family"] == writer:
            problems.append(f"seat {v['seat']} ({v['role']}) is on the writer's family ({writer})")
    judge = rnd.get("judge")
    if judge and judge["family"] == writer:
        problems.append(f"the judge is on the writer's family ({writer})")
    for v in rnd["verdicts"]:
        path = video_dir / v["file"]
        raw = json.loads(path.read_text()) if path.is_file() else {}
        if raw.get("call_id") != v["call_id"] or raw.get("output_sha256") != v["output_sha256"]:
            problems.append(f"verdict {v['seat']}: file missing or edited after the report")
            continue
        row = ledger.get(v["call_id"])
        if row is None:
            problems.append(f"verdict {v['seat']}: call {v['call_id'][:12]} is not in the call ledger")
        elif row.output_sha256 != raw["output_sha256"] or (v["status"] == "ok" and row.status != "ok"):
            problems.append(f"verdict {v['seat']}: does not match the call ledger")
        if v["role"] == "fact" and v["status"] == "ok" and raw.get("blockers"):
            problems.append(f"open fact blocker: \"{raw['blockers'][0]['quote']}\"")
    for cid in (judge or {}).get("call_ids", []):
        if ledger.get(cid) is None:
            problems.append(f"judge call {cid[:12]} is not in the call ledger")
    if report["calls"] > report["cap"]:
        problems.append(f"{report['calls']} calls, over the cap of {report['cap']}")
    return problems
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_evidence.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/room/evidence.py core/studio/tests/test_room_evidence.py
git commit -m "feat(room): evidence check the gate will run, cross-checked against the ledger

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: `python -m studio.room` command

**Files:**
- Create: `core/studio/room/__main__.py`
- Test: `core/studio/tests/test_room_cli.py`

**Interfaces:**
- Consumes: everything above.
- Produces: `main(argv: list[str] | None = None) -> int` with subcommands
  `lint <video_dir> <gate> --round N --draft FILE --config ROOM_YAML [--kind script|packaging] [--ledger-file claims.md]`,
  `seat <video_dir> <gate> --round N --seat NAME --config ROOM_YAML [--input NAME=PATH ...]`,
  `judge <video_dir> <gate> --round N --config ROOM_YAML`,
  `report <video_dir> <gate> --stage STAGE --config ROOM_YAML`,
  `verify <video_dir> <gate> --artifact FILE`.
  `--channel` (all subcommands) defaults to the config folder's name. A2 adds `omni room` on top of this.

- [ ] **Step 1: Write the failing test**

```python
"""python -m studio.room: lint, seat, judge, report and verify, end to end with a fake CLI."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from studio.room import __main__ as cli
from studio.room import call

ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 3
daily_cap: 80
adopted: null
pitch_clip: after_g2
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
linters: []
sources: []
"""
CLEAN = {"scores": {}, "blockers": [], "suggestions": [], "keep": []}


def _fake(monkeypatch, answers):
    def run(cmd, **kw):
        if cmd[0] == "git":  # deny_paths() asks git for the main checkout
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": json.dumps(answers.pop(0))}), stderr="")

    monkeypatch.setattr(call.subprocess, "run", run)


def test_a_full_round_then_report_and_verify(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "professor-of-us"
    channel.mkdir()
    (channel / "room.yaml").write_text(ROOM)
    video = channel / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    script = video / "script.md"
    script.write_text("## [00:00] Hook\nPROF: Two sleeps.\nOOG: Ha.\n")
    cfg = str(channel / "room.yaml")
    assert cli.main(["lint", str(video), "g2", "--round", "1", "--draft", str(script), "--config", cfg]) == 0
    _fake(monkeypatch, [CLEAN, CLEAN, CLEAN])
    for seat in ("cold viewer", "story editor", "fact reviewer"):
        assert cli.main(["seat", str(video), "g2", "--round", "1", "--seat", seat, "--config", cfg]) == 0
    assert cli.main(["judge", str(video), "g2", "--round", "1", "--config", cfg]) == 0  # nothing to judge yet
    assert cli.main(["report", str(video), "g2", "--stage", "dialogue_script", "--config", cfg]) == 0
    report = json.loads((video / "room" / "g2.json").read_text())
    assert report["shipped"]["round"] == 1 and report["calls"] == 3
    assert cli.main(["verify", str(video), "g2", "--artifact", str(script)]) == 0
    script.write_text("## [00:00] Hook\nPROF: Eight hours.\n")
    assert cli.main(["verify", str(video), "g2", "--artifact", str(script)]) == 1


def test_seat_refuses_before_lint(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "pou"
    channel.mkdir()
    (channel / "room.yaml").write_text(ROOM)
    video = tmp_path / "v"
    video.mkdir()
    assert cli.main(["seat", str(video), "g2", "--round", "1", "--seat", "cold viewer",
                     "--config", str(channel / "room.yaml")]) == 2
    assert "run lint for round 1 first" in capsys.readouterr().err
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_cli.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError: cannot import name '__main__'` or `ModuleNotFoundError`

- [ ] **Step 3: Write the implementation**

`core/studio/room/__main__.py`:

```python
"""python -m studio.room: the room's tools for the studio-room skill. A2 puts `omni room` on top of this.

Every subcommand takes a video folder and a gate (g1 or g2). Exit codes: 0 ok, 1 checks failed, 2 usage error.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

from studio.room import report as R
from studio.room.call import CallContext, run_seat
from studio.room.config import SEATS_DIR, derived_cap, load_room, validate
from studio.room.evidence import verify
from studio.room.judge import run_judge
from studio.room.ledger import CapReached, Ledger
from studio.room.lint import lint_draft
from studio.room.models import family_of
from studio.room.snapshot import load_draft, save_draft


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _ctx(args, cfg, rnd: int) -> CallContext:
    channel = args.channel or Path(args.config).resolve().parent.name
    return CallContext(channel, Path(args.video_dir).name, args.gate, rnd, cfg.daily_cap, derived_cap(cfg))


def _meta(video: Path, gate: str, n: int) -> Optional[dict]:
    try:
        return R.read_meta(video, gate, n)
    except FileNotFoundError:
        return None


def cmd_lint(args) -> int:
    cfg = load_room(Path(args.config))
    video = Path(args.video_dir)
    sha = save_draft(video, Path(args.draft))
    ledger_file = Path(args.ledger_file) if args.ledger_file else Path(args.draft).parent / "claims.md"
    rep = lint_draft(Path(args.draft), kind=args.kind, fmt=cfg.format, linters=cfg.linters, ledger=ledger_file)
    R.write_meta(video, args.gate, args.round, sha, rep.as_dict())
    print(json.dumps({"round": args.round, "draft_sha256": sha, **rep.as_dict()}, indent=2))
    return 0 if rep.ok else 1


def cmd_seat(args) -> int:
    cfg = load_room(Path(args.config))
    video = Path(args.video_dir)
    meta = _meta(video, args.gate, args.round)
    if meta is None:
        print(f"run lint for round {args.round} first", file=sys.stderr)
        return 2
    seat = next((s for s in cfg.seats if s.name == args.seat), None)
    if seat is None:
        print(f"no seat {args.seat!r} in {args.config}", file=sys.stderr)
        return 2
    inputs = {"draft": load_draft(video, meta["draft_sha256"])}
    for item in args.input or []:
        name, _, path = item.partition("=")
        inputs[name] = Path(path).read_text(encoding="utf-8")
    out = R.round_dir(video, args.gate, args.round) / f"{_slug(seat.name)}.json"
    try:
        v = run_seat(seat, inputs=inputs, ledger=Ledger(), ctx=_ctx(args, cfg, args.round), out=out,
                     raw_dir=video / "room" / "raw")
    except CapReached as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps({"seat": v.seat, "status": v.status, "blockers": len(v.blockers), "error": v.error}))
    return 0 if v.status == "ok" else 1


def cmd_judge(args) -> int:
    cfg = load_room(Path(args.config))
    video = Path(args.video_dir)
    rounds = R.load_rounds(video, args.gate)
    current = next((r for r in rounds if r["round"] == args.round), None)
    if current is None:
        print(f"round {args.round} has no files", file=sys.stderr)
        return 2
    best = R.best_before(rounds, args.round)
    if best is None or not R.is_candidate(current):
        print(json.dumps({"judged": False, "why": "fewer than two candidates"}))
        return 0
    try:
        res = run_judge(load_draft(video, current["draft_sha256"]), load_draft(video, best["draft_sha256"]),
                        model=cfg.judge, brief=(SEATS_DIR / "judge.md").read_text(encoding="utf-8"),
                        ledger=Ledger(), ctx=_ctx(args, cfg, args.round),
                        out=R.round_dir(video, args.gate, args.round) / "judge.json")
    except CapReached as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps({"judged": True, "winner": res["winner"], "picks": res["picks"]}))
    return 0


def cmd_report(args) -> int:
    cfg = load_room(Path(args.config))
    problems = validate(cfg)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 2
    video = Path(args.video_dir)
    channel = args.channel or Path(args.config).resolve().parent.name
    rep = R.build_report(video, gate=args.gate, stage=args.stage, channel=channel,
                         writer_family=family_of(cfg.writer), ledger=Ledger(), cap=derived_cap(cfg))
    js, md = R.write_report(video, rep)
    print(f"{js}\n{md}")
    return 0


def cmd_verify(args) -> int:
    video = Path(args.video_dir)
    rep = json.loads((video / "room" / f"{args.gate}.json").read_text())
    problems = verify(video, rep, Path(args.artifact), Ledger())
    print("\n".join(problems) if problems else "room evidence ok")
    return 1 if problems else 0


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.room")
    sub = p.add_subparsers(dest="cmd", required=True)

    def common(sp, config=True):
        sp.add_argument("video_dir")
        sp.add_argument("gate", choices=["g1", "g2"])
        sp.add_argument("--channel")
        if config:
            sp.add_argument("--config", required=True)

    s = sub.add_parser("lint")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.add_argument("--draft", required=True)
    s.add_argument("--kind", choices=["script", "packaging"], default="script")
    s.add_argument("--ledger-file")
    s.set_defaults(fn=cmd_lint)
    s = sub.add_parser("seat")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.add_argument("--seat", required=True)
    s.add_argument("--input", action="append")
    s.set_defaults(fn=cmd_seat)
    s = sub.add_parser("judge")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.set_defaults(fn=cmd_judge)
    s = sub.add_parser("report")
    common(s)
    s.add_argument("--stage", required=True)
    s.set_defaults(fn=cmd_report)
    s = sub.add_parser("verify")
    common(s, config=False)
    s.add_argument("--artifact", required=True)
    s.set_defaults(fn=cmd_verify)
    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_cli.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `2 passed`

- [ ] **Step 5: Run the whole room suite and the studio suite**

Run: `$PY -m pytest core/studio/tests -q -p no:cacheprovider --import-mode=importlib`
Expected: all pass (the existing studio tests are unchanged).

- [ ] **Step 6: Commit**

```bash
git add core/studio/room/__main__.py core/studio/tests/test_room_cli.py
git commit -m "feat(room): python -m studio.room lint, seat, judge, report and verify

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: The `studio-room` skill

**Files:**
- Create: `core/openmontage/skills/studio/studio-room.md`
- Test: `core/studio/tests/test_room_skill.py`

**Interfaces:**
- Consumes: the `python -m studio.room` subcommands (Task 11).
- Produces: the procedure A2 points every pipeline's packaging and script stage at.

- [ ] **Step 1: Write the failing test**

```python
"""The studio-room skill names every room command and the invariants it must not break."""

from __future__ import annotations

from pathlib import Path

SKILL = Path(__file__).resolve().parents[3] / "core" / "openmontage" / "skills" / "studio" / "studio-room.md"


def test_the_skill_exists_and_names_every_step():
    text = SKILL.read_text()
    for needle in ("python -m studio.room lint", "python -m studio.room seat", "python -m studio.room judge",
                   "python -m studio.room report", "python -m studio.room verify", "awaiting_human",
                   "Never write", "best candidate", "taste.md"):
        assert needle in text, needle
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_room_skill.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `FileNotFoundError`

- [ ] **Step 3: Write the skill**

`core/openmontage/skills/studio/studio-room.md`:

````markdown
# studio-room: the quality room (G1 packaging, G2 script)

omni-studio skill. Every new video on every channel goes through this loop before the owner sees packaging (G1) or
the script (G2). Spec: `docs/superpowers/specs/2026-11-08-quality-spine-design.md`. Channel settings:
`channels/<slug>/room.yaml`. Paths below are from the omni-studio root.

Set up once per shell:

    export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1
    PY=.venv/bin/python          # in a worktree: ~/Exploration/projects/omni-studio/.venv/bin/python
    V=channels/<slug>/videos/<id>; CFG=channels/<slug>/room.yaml; G=g2   # g1 for packaging

## Each round N (start at 1; stop at `rounds` in room.yaml)

1. **Lint.** `$PY -m studio.room lint $V $G --round N --draft $V/script.md --config $CFG`
   (G1: `--draft $V/packaging.md --kind packaging`). If it exits 1, fix every problem in the draft and run lint
   again for the same round before any seat runs.
2. **Seats.** For every seat in room.yaml, in parallel:
   `$PY -m studio.room seat $V $G --round N --seat "<name>" --config $CFG --input audience.md=channels/<slug>/audience.md --input style.md=channels/<slug>/style.md --input claims.md=$V/claims.md`
   (add `cast.md`, `taste.md`, `packaging.md` where the seat needs them). Never pass one seat's output to another.
3. **Judge.** `$PY -m studio.room judge $V $G --round N --config $CFG`. It only runs when this round's draft and an
   earlier one are both candidates (lint passed, fact seat clean).
4. **Stop?** Stop when every seat returned ok with no blockers, or N equals `rounds`.
5. **Merge and revise.** Read the verdict files in `$V/room/$G/round-N/`. Build one edit list: drop any note that
   does not quote a line and give a fix, except fact blockers, which always stay. Precedence: CLAUDE.md and the gates,
   then fact blockers, then the newest dated owner note in `taste.md`, then the channel's rules, then the shared
   rules. Keep lines are protected unless a fact blocker rests on them. The writer applies the list to the draft
   file. Never invent a source or number; a missing source goes back to research. Write
   `$V/review-$G-round<N>.md`: each note, its seat, applied or not and why. Then round N+1.

## Finish

1. `$PY -m studio.room report $V $G --stage <stage> --config $CFG` writes `$V/room/$G.json` and `$V/room-$G.md`.
   The shipped draft is the best candidate, which is not always the latest. If it is an earlier round, restore the
   draft file from `$V/room/drafts/<sha>.md`.
2. `$PY -m studio.room verify $V $G --artifact <the draft file>` must print `room evidence ok`.
3. Present to the owner: the draft, `room-$G.md` (flagged, changed, still disputed), the claims ledger.
   Write the checkpoint with `status: awaiting_human` and stop.

## Owner notes

The owner's notes at the gate are applied to the draft, added to `channels/<slug>/taste.md` (dated, newest first),
and one more round runs on the edited file (lint and every seat). Then report and verify again before re-presenting.

## Never

- Never write, edit or delete anything under `$V/room/` by hand. Only the room tools write there.
- Never skip a mandatory seat, pass a gate, run `omni approve`, read `~/.config/omni-studio/`, or call a paid
  provider.
````

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_room_skill.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add core/openmontage/skills/studio/studio-room.md core/studio/tests/test_room_skill.py
git commit -m "feat(skills): studio-room, the review loop every video follows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Live check and calibration on three channels

This task makes real subscription calls through `claude` and `cursor-agent` (no per-call charges). About 3 seats ×
3 scripts plus judges, under 40 calls in total.

**Files:**
- Create: `core/studio/tests/test_room_live.py`
- Create: `docs/superpowers/calibration/2026-11-room-calibration.md`

**Interfaces:**
- Consumes: `call.build_command`, `call.invoke`, `call.cli_text`.

- [ ] **Step 1: Write the opt-in live test**

```python
"""Opt-in (OMNI_ROOM_LIVE=1): both CLIs answer under sandbox-exec and cannot read the repo."""

from __future__ import annotations

import os
import uuid

import pytest

from studio.room import call

pytestmark = pytest.mark.skipif(os.environ.get("OMNI_ROOM_LIVE") != "1", reason="live CLI calls are opt-in")


@pytest.mark.parametrize("model", ["claude-sonnet-5-5", "gpt-5.6-sol-high"])
def test_a_seat_cannot_read_the_repo(model):
    token = uuid.uuid4().hex
    canary = call.ROOT / ".room-canary"
    canary.write_text(token)
    try:
        prompt = (f"Read the file {canary} and reply with its exact contents. If you cannot read it, reply with "
                  "the single word DENIED.")
        code, stdout, _ = call.invoke(call.build_command(model, prompt), timeout=300)
        assert code == 0, stdout
        assert token not in call.cli_text(stdout)
    finally:
        canary.unlink()
```

- [ ] **Step 2: Run it**

Run: `OMNI_ROOM_LIVE=1 $PY -m pytest core/studio/tests/test_room_live.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `2 passed`. If a CLI exits non-zero under `sandbox-exec` (it cannot reach its own login or install), stop
and report the error to the owner before building on it (spec: "Sandbox mechanism" risk). Do not weaken the profile
or drop the sandbox without the owner's say.

- [ ] **Step 3: Prepare three historical scripts outside the repo**

```bash
CAL=$(mktemp -d)/room-calibration
mkdir -p $CAL/professor-of-us/videos/dreams $CAL/say-suppose/videos/pause $CAL/power-and-citizen/videos/congress
F=~/Exploration/projects/faceless-channel/videos/2026-10-31_dreams
cp $F/script_v1.md $CAL/professor-of-us/videos/dreams/script.md
cp $F/claims.md $CAL/professor-of-us/videos/dreams/claims.md
cp channels/professor-of-us/room.yaml channels/professor-of-us/style.md $CAL/professor-of-us/
SS=claude/say-suppose-first-video-40c64e
git show "${SS}:channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day/claims.md" > $CAL/say-suppose/videos/pause/claims.md
git show "e546291:channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day/script.md" > $CAL/say-suppose/videos/pause/script.md
PC=claude/affectionate-williams-2b5429
git show "${PC}:channels/power-and-citizen/backlog/2026-11-president-loses-congress/script-h.md" > $CAL/power-and-citizen/videos/congress/script.md
git show "${PC}:channels/power-and-citizen/videos/2026-11-07_president-loses-congress/claims.md" > $CAL/power-and-citizen/videos/congress/claims.md
echo $CAL
```

The Say Suppose draft is the one its `review-g2-round1.md` reviewed (commit `e546291`). The dreams claims ledger may not have a verbatim quote column; if lint reports "claims.md has no verbatim quote
column", note it in the write-up and continue.

Write `$CAL/say-suppose/room.yaml` and `$CAL/power-and-citizen/room.yaml` from the spec's starting panels (same
shape as the Professor of Us file; seats use `brief: "shared:viewer"` etc. for the mandatory roles and leave out the
craft, voice and neutrality seats for this run), with `format: {wpm: 115}` and `{wpm: 155}` and `linters: []`.

- [ ] **Step 4: Run one round per channel**

For each channel folder `$CAL/<slug>` with video `<v>`:

```bash
export OMNI_ROOM_LEDGER=$CAL/ledger.sqlite
V=$CAL/<slug>/videos/<v>; CFG=$CAL/<slug>/room.yaml
$PY -m studio.room lint $V g2 --round 1 --draft $V/script.md --config $CFG
$PY -m studio.room seat $V g2 --round 1 --seat "cold viewer" --config $CFG --input claims.md=$V/claims.md
$PY -m studio.room seat $V g2 --round 1 --seat "story editor" --config $CFG --input claims.md=$V/claims.md
$PY -m studio.room seat $V g2 --round 1 --seat "fact reviewer" --config $CFG --input claims.md=$V/claims.md
$PY -m studio.room report $V g2 --stage dialogue_script --config $CFG
```

Use each config's real seat names (Say Suppose: "first-time viewer", "retention editor", "fact-checker"; Power and
Citizen: "casual viewer", "retention editor", "professor"). Lint failures do not stop the calibration run: seats
still run so their notes can be compared.

- [ ] **Step 5: Compare and write up**

Write `docs/superpowers/calibration/2026-11-room-calibration.md` with, per channel: the draft used, the hand-run
panel's notes for that draft (dreams: `script_review_round1.md` in faceless-channel; Say Suppose:
`review-g2-round1.md`; Power and Citizen: `panel-review-h.md` or `panel-review-script-h.md`), the owner's notes where
recorded, and a table: note | hand panel caught it | room caught it | owner raised it. End with counts per channel
(caught by both, room only, panel only, owner only) and the false blockers (room blockers the owner or panel
rejected). Quote at most a short phrase per note.

- [ ] **Step 6: Commit**

```bash
git add core/studio/tests/test_room_live.py docs/superpowers/calibration/2026-11-room-calibration.md
git commit -m "test(room): opt-in live sandbox check; calibration on three channels' historical scripts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Report to the owner**

Show the calibration table's counts per channel and the three most useful catches the room made that the Claude-only
panels missed, if any. A1 is done; A2 waits for the Power and Citizen branch to merge.
