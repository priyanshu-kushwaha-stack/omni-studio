# B1: Measure Every Heavy Step Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record the wall time of every heavy step (voice, stills, puppets, compose, renders, music) on every channel, and rank where the time goes, before anything moves to the cloud.

**Architecture:** A new package `core/studio/jobs/` appends one JSON line per run to a shared, git-ignored file outside the repo. Studio tools get it through one decorator on `execute`; engine scripts run by hand get it through `python -m studio.jobs run -- <command>`. Engine scripts themselves are not edited while the channel branches are open. No cloud, no cost.

**Tech Stack:** Python 3.12 stdlib (`fcntl`, `json`, `statistics`, `subprocess`), pytest.

**Spec:** `docs/superpowers/specs/2026-11-08-portable-compute-design.md` (B1)

## Global Constraints

- Timings file: `~/.local/state/omni-studio/jobs/timings.jsonl`, overridable with `OMNI_JOBS_TIMINGS`. Never in the repo, never under `~/.config/omni-studio/`.
- A timing failure must never fail the step it measures.
- Do not edit `core/engines/pou/scripts/*`, `core/studio/checks.py`, `claims.py`, `cli.py`, `channels.py` or `core/openmontage/tools/studio/studio_whatif_tools.py` (other sessions own them). The only edit to an existing file is the decorator in `core/openmontage/tools/studio/studio_pou_tools.py` (neither channel branch touches it) and one line in `CLAUDE.md`.
- Run tests from the worktree root: `export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1`, `PY=~/Exploration/projects/omni-studio/.venv/bin/python`, `$PY -m pytest core/studio/tests/<file> -q -p no:cacheprovider --import-mode=importlib`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

| File | Responsibility |
|---|---|
| `core/studio/jobs/__init__.py` | Package docstring |
| `core/studio/jobs/timing.py` | Record, the `timed` context manager, the `record_tool` decorator, read and summarize |
| `core/studio/jobs/__main__.py` | `python -m studio.jobs run|report` |
| `core/openmontage/tools/studio/studio_pou_tools.py` | `@_record_tool` on `_PouEngineTool.execute` |
| `core/studio/tests/test_jobs_timing.py`, `test_jobs_cli.py` | Tests |

---

### Task 1: Timing records

**Files:**
- Create: `core/studio/jobs/__init__.py`, `core/studio/jobs/timing.py`
- Test: `core/studio/tests/test_jobs_timing.py`

**Interfaces:**
- Produces: `DEFAULT: Path`, `timings_path() -> Path`, `machine() -> str`, `record(step: str, *, seconds: float, ok: bool, channel: str = "", video: str = "", inputs_bytes: int = 0, extra: dict | None = None, path: Path | None = None) -> dict`, `timed(step, **kw)` (context manager), `video_from(inputs: dict) -> str`, `record_tool(execute)` (decorator for a tool's `execute(self, inputs) -> ToolResult`), `read_timings(path=None, since: str | None = None) -> list[dict]`, `summarize(rows) -> list[dict]` (keys `step, runs, failures, total_s, median_s, max_s`, sorted by `total_s` descending).

- [ ] **Step 1: Write the failing test**

```python
"""B1: every heavy step leaves one timing line; a timing failure never fails the step."""

from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

from studio.jobs import timing as T


@pytest.fixture(autouse=True)
def _timings_in_tmp(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "timings.jsonl"))


def test_record_appends_a_line(tmp_path):
    T.record("pou_tts", seconds=12.3456, ok=True, channel="professor-of-us", video="2026-11-10_x", inputs_bytes=10)
    rows = T.read_timings()
    assert rows[0]["step"] == "pou_tts" and rows[0]["seconds"] == 12.346 and rows[0]["machine"]
    assert json.loads((tmp_path / "timings.jsonl").read_text().splitlines()[0])["video"] == "2026-11-10_x"


def test_timed_records_failures_too():
    with pytest.raises(RuntimeError):
        with T.timed("render", channel="say-suppose"):
            raise RuntimeError("boom")
    assert T.read_timings()[0]["ok"] is False


def test_video_from_inputs():
    assert T.video_from({"video": "v1"}) == "v1"
    assert T.video_from({"args": ["channels/professor-of-us/videos/2026-10-31_tails/scene_plan.json"]}) == "2026-10-31_tails"
    assert T.video_from({"args": ["--x"]}) == ""


def test_record_tool_wraps_execute_and_never_breaks_it(monkeypatch):
    class Tool:
        name = "pou_stills"

        @T.record_tool
        def execute(self, inputs):
            return SimpleNamespace(success=True)

    assert Tool().execute({"channel": "professor-of-us", "args": []}).success
    assert T.read_timings()[0]["step"] == "pou_stills"
    monkeypatch.setattr(T, "record", lambda *a, **k: (_ for _ in ()).throw(OSError("disk full")))
    assert Tool().execute({"channel": "professor-of-us"}).success


def test_summarize_ranks_by_total_time():
    rows = [{"step": "a", "seconds": 1, "ok": True}, {"step": "b", "seconds": 10, "ok": True},
            {"step": "a", "seconds": 3, "ok": False}, {"step": "b", "seconds": 20, "ok": True}]
    out = T.summarize(rows)
    assert [r["step"] for r in out] == ["b", "a"]
    assert out[0] == {"step": "b", "runs": 2, "failures": 0, "total_s": 30, "median_s": 15, "max_s": 20}
    assert out[1]["failures"] == 1


def test_read_timings_since():
    T.record("x", seconds=1, ok=True)
    assert T.read_timings(since="2999-01-01") == []
    assert len(T.read_timings(since="2000-01-01")) == 1


def test_the_default_path_is_outside_the_secrets_folder(monkeypatch):
    monkeypatch.delenv("OMNI_JOBS_TIMINGS")
    assert T.timings_path() == T.DEFAULT and ".config" not in T.DEFAULT.parts
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_jobs_timing.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ModuleNotFoundError: No module named 'studio.jobs'`

- [ ] **Step 3: Write the implementation**

`core/studio/jobs/__init__.py`:

```python
"""Heavy-step jobs. B1: timing records for every heavy step, before anything moves to the cloud.

Spec: docs/superpowers/specs/2026-11-08-portable-compute-design.md.
"""
```

`core/studio/jobs/timing.py`:

```python
"""Wall-time records for heavy steps: one JSON line per run in a shared file outside the repo.

Studio tools record through @record_tool on execute; engine scripts run by hand record through
`python -m studio.jobs run --step <name> -- <command>`. A timing failure never fails the step.
"""

from __future__ import annotations

import fcntl
import functools
import json
import os
import platform
import re
import statistics
import time
from collections import defaultdict
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

DEFAULT = Path.home() / ".local" / "state" / "omni-studio" / "jobs" / "timings.jsonl"
VIDEO_RE = re.compile(r"videos/([^/\s]+)")


def timings_path() -> Path:
    env = os.environ.get("OMNI_JOBS_TIMINGS")
    return Path(env) if env else DEFAULT


def machine() -> str:
    return f"{platform.node()} {platform.machine()}"


def record(step: str, *, seconds: float, ok: bool, channel: str = "", video: str = "", inputs_bytes: int = 0,
           extra: Optional[dict[str, Any]] = None, path: Optional[Path] = None) -> dict[str, Any]:
    row = {"at": datetime.now(timezone.utc).isoformat(), "step": step, "channel": channel, "video": video,
           "machine": machine(), "seconds": round(seconds, 3), "ok": ok, "inputs_bytes": inputs_bytes,
           **(extra or {})}
    target = Path(path) if path else timings_path()
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "a", encoding="utf-8") as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        f.write(json.dumps(row) + "\n")
        fcntl.flock(f, fcntl.LOCK_UN)
    return row


@contextmanager
def timed(step: str, **kw: Any):
    t0, ok = time.monotonic(), False
    try:
        yield
        ok = True
    finally:
        try:
            record(step, seconds=time.monotonic() - t0, ok=ok, **kw)
        except Exception:
            pass


def video_from(inputs: dict[str, Any]) -> str:
    for key in ("video", "video_id"):
        if inputs.get(key):
            return str(inputs[key])
    for arg in inputs.get("args") or []:
        m = VIDEO_RE.search(str(arg))
        if m:
            return m.group(1)
    return ""


def record_tool(execute):
    @functools.wraps(execute)
    def wrapper(self, inputs):
        t0, result = time.monotonic(), None
        try:
            result = execute(self, inputs)
            return result
        finally:
            try:
                record(getattr(self, "name", type(self).__name__), seconds=time.monotonic() - t0,
                       ok=bool(result is not None and getattr(result, "success", False)),
                       channel=str(inputs.get("channel", "")), video=video_from(inputs),
                       extra={"via": "tool"})
            except Exception:
                pass

    return wrapper


def read_timings(path: Optional[Path] = None, since: Optional[str] = None) -> list[dict[str, Any]]:
    target = Path(path) if path else timings_path()
    if not target.is_file():
        return []
    rows = [json.loads(line) for line in target.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [r for r in rows if not since or r.get("at", "") >= since]


def summarize(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_step: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in rows:
        by_step[r["step"]].append(r)
    out = []
    for step, runs in by_step.items():
        secs = [float(r["seconds"]) for r in runs]
        out.append({"step": step, "runs": len(runs), "failures": sum(1 for r in runs if not r.get("ok")),
                    "total_s": round(sum(secs), 3), "median_s": round(statistics.median(secs), 3),
                    "max_s": round(max(secs), 3)})
    return sorted(out, key=lambda r: r["total_s"], reverse=True)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_jobs_timing.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/jobs/__init__.py core/studio/jobs/timing.py core/studio/tests/test_jobs_timing.py
git commit -m "feat(jobs): timing records for heavy steps, shared across worktrees

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `python -m studio.jobs run|report`

**Files:**
- Create: `core/studio/jobs/__main__.py`
- Test: `core/studio/tests/test_jobs_cli.py`

**Interfaces:**
- Consumes: `timing.record`, `timing.read_timings`, `timing.summarize` (Task 1).
- Produces: `main(argv: list[str] | None = None) -> int` with `run --step NAME [--channel C] [--video V] -- COMMAND...` (returns the command's exit code) and `report [--since YYYY-MM-DD]`.

- [ ] **Step 1: Write the failing test**

```python
"""python -m studio.jobs: wrap any command with a timing record; rank steps by total time."""

from __future__ import annotations

import sys

from studio.jobs import __main__ as cli
from studio.jobs import timing as T


def test_run_records_and_returns_the_exit_code(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    assert cli.main(["run", "--step", "ok-step", "--channel", "say-suppose", "--", sys.executable, "-c", "pass"]) == 0
    assert cli.main(["run", "--step", "bad-step", "--", sys.executable, "-c", "raise SystemExit(3)"]) == 3
    rows = T.read_timings()
    assert [(r["step"], r["ok"]) for r in rows] == [("ok-step", True), ("bad-step", False)]
    assert rows[0]["channel"] == "say-suppose" and rows[0]["via"] == "run"


def test_report_prints_a_ranked_table(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    T.record("render", seconds=300, ok=True)
    T.record("tts", seconds=60, ok=True)
    assert cli.main(["report"]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out[0].startswith("step") and out[2].startswith("render") and out[3].startswith("tts")


def test_run_without_a_command_is_a_usage_error(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    assert cli.main(["run", "--step", "x"]) == 2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_jobs_cli.py -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `ImportError`

- [ ] **Step 3: Write the implementation**

`core/studio/jobs/__main__.py`:

```python
"""python -m studio.jobs: `run` wraps a heavy command with a timing record; `report` ranks steps by total time."""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from typing import Optional

from studio.jobs.timing import read_timings, record, summarize


def cmd_run(args) -> int:
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        print("give the command after --", file=sys.stderr)
        return 2
    t0 = time.monotonic()
    code = subprocess.run(command).returncode
    try:
        record(args.step, seconds=time.monotonic() - t0, ok=code == 0, channel=args.channel or "",
               video=args.video or "", extra={"via": "run"})
    except Exception as exc:
        print(f"timing not recorded: {exc}", file=sys.stderr)
    return code


def cmd_report(args) -> int:
    rows = summarize(read_timings(since=args.since))
    print(f"{'step':<28} {'runs':>5} {'fail':>5} {'total s':>10} {'median s':>10} {'max s':>10}")
    print("-" * 72)
    for r in rows:
        print(f"{r['step']:<28} {r['runs']:>5} {r['failures']:>5} {r['total_s']:>10.1f} {r['median_s']:>10.1f} "
              f"{r['max_s']:>10.1f}")
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.jobs")
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("--step", required=True)
    r.add_argument("--channel")
    r.add_argument("--video")
    r.add_argument("command", nargs=argparse.REMAINDER)
    r.set_defaults(fn=cmd_run)
    s = sub.add_parser("report")
    s.add_argument("--since")
    s.set_defaults(fn=cmd_report)
    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$PY -m pytest core/studio/tests/test_jobs_cli.py -q -p no:cacheprovider --import-mode=importlib`
Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add core/studio/jobs/__main__.py core/studio/tests/test_jobs_cli.py
git commit -m "feat(jobs): python -m studio.jobs run and report

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Time the Professor of Us engine tools, and tell agents to wrap direct runs

**Files:**
- Modify: `core/openmontage/tools/studio/studio_pou_tools.py` (imports block after `from tools.base_tool import (...)`; the `execute` method of `_PouEngineTool`)
- Modify: `CLAUDE.md` (the "Professor of Us engine" section)
- Test: `core/studio/tests/test_jobs_timing.py` (append)

**Interfaces:**
- Consumes: `timing.record_tool`, `timing.read_timings` (Task 1).

- [ ] **Step 1: Write the failing test** (append to `core/studio/tests/test_jobs_timing.py`)

```python
def test_pou_engine_tools_record_a_timing(monkeypatch):
    import subprocess

    from tools.studio import studio_pou_tools as pou

    def fake_run(cmd, **kw):
        return subprocess.CompletedProcess(cmd, 0, stdout="ok", stderr="")

    monkeypatch.setattr(pou.subprocess, "run", fake_run)
    result = pou.StudioOverlayCheck().execute(
        {"channel": "professor-of-us", "args": ["channels/professor-of-us/videos/2026-10-31_tails"]})
    assert result.success
    row = T.read_timings()[-1]
    assert (row["step"], row["channel"], row["video"], row["via"]) == (
        "overlay_check", "professor-of-us", "2026-10-31_tails", "tool")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_jobs_timing.py::test_pou_engine_tools_record_a_timing -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `IndexError: list index out of range` (no timing recorded)

- [ ] **Step 3: Add the decorator**

In `core/openmontage/tools/studio/studio_pou_tools.py`, after the `from tools.base_tool import (...)` block:

```python
try:  # B1 timing (core/studio/jobs); discovery outside the studio layer simply runs untimed
    from studio.jobs.timing import record_tool as _record_tool
except ImportError:
    def _record_tool(fn):
        return fn
```

and decorate `_PouEngineTool.execute`:

```python
    @_record_tool
    def execute(self, inputs: dict[str, Any]) -> ToolResult:
```

(the method body is unchanged).

In `CLAUDE.md`, at the end of the "Professor of Us engine" section's second paragraph (after "...and, on the result, `audio_check.py`. The owner's craft rules and their checks are in `core/studio/rules/`."), add:

```markdown
When you run a heavy engine or channel script by hand (TTS, stills, renders, music), wrap it so its run time is
recorded: `.venv/bin/python -m studio.jobs run --step <script> --channel <slug> --video <id> -- <command>`.
`python -m studio.jobs report` ranks steps by total time (portable-compute spec, B1).
```

- [ ] **Step 4: Run the timing tests and the existing tool tests**

Run: `$PY -m pytest core/studio/tests/test_jobs_timing.py core/studio/tests/test_studio_tools.py -q -p no:cacheprovider --import-mode=importlib`
Expected: all pass (`8 passed` in test_jobs_timing.py; test_studio_tools.py unchanged).

Run: `make test PYTHON=$HOME/Exploration/projects/omni-studio/.venv/bin/python`
Expected: all three suites pass (upstream discovery still finds the five studio tools).

- [ ] **Step 5: Commit**

```bash
git add core/openmontage/tools/studio/studio_pou_tools.py CLAUDE.md core/studio/tests/test_jobs_timing.py
git commit -m "feat(jobs): time the Professor of Us engine tools; wrap direct runs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: After the channel branches merge, time their tools too

Run this task only once `claude/say-suppose-first-video-40c64e` has merged into main and this branch is synced with
main. It adds the same decorator to `_WhatifTool.execute` in
`core/openmontage/tools/studio/studio_whatif_tools.py`.

**Files:**
- Modify: `core/openmontage/tools/studio/studio_whatif_tools.py`
- Test: `core/studio/tests/test_jobs_timing.py` (append)

- [ ] **Step 1: Write the failing test** (append)

```python
def test_whatif_tools_are_timed():
    from tools.studio import studio_whatif_tools as whatif

    assert hasattr(whatif._WhatifTool.execute, "__wrapped__")
```

- [ ] **Step 2: Run it to verify it fails**

Run: `$PY -m pytest core/studio/tests/test_jobs_timing.py::test_whatif_tools_are_timed -q -p no:cacheprovider --import-mode=importlib`
Expected: FAIL with `AssertionError`

- [ ] **Step 3: Add the decorator**

After that file's `from tools.base_tool import ...` block, add the same `try/except ImportError` block as in Task 3,
and put `@_record_tool` on the line above `def execute(self, inputs: dict[str, Any]) -> ToolResult:` in
`class _WhatifTool`.

- [ ] **Step 4: Run tests**

Run: `make test PYTHON=$HOME/Exploration/projects/omni-studio/.venv/bin/python`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add core/openmontage/tools/studio/studio_whatif_tools.py core/studio/tests/test_jobs_timing.py
git commit -m "feat(jobs): time the what-if engine tools

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: One week of runs, then the ranked list

- [ ] **Step 1:** After about a week of normal production on all channels, run
  `$PY -m studio.jobs report --since <date B1 merged>`.
- [ ] **Step 2:** Write `docs/superpowers/calibration/2026-11-timings.md`: the ranked table, the three steps that cost the most wall time, and for each a cheap local fix (lower-resolution previews for G4, re-render only changed scenes, cached voice takes, running independent steps side by side) or the cloud move it argues for (B2-B4 in the spec).
- [ ] **Step 3:** Commit it and show the owner the top three.

```bash
git add docs/superpowers/calibration/2026-11-timings.md
git commit -m "docs: a week of heavy-step timings and where the time goes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
