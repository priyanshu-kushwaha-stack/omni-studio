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
    rows = []
    for line in target.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except ValueError:  # a torn line from a writer killed mid-append; the file is shared
            continue
        if isinstance(row, dict):
            rows.append(row)
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
