"""Gate times and the seat scorecard (pipeline v2, optimisation 6 and section 4 limit 10). Read-only.

Gate times come from the round files (`linted_at` in meta.json, presented.json), the call ledger and the stage
checkpoint. The scorecard reads the owner's marks on room blockers, which the session writes from the owner's words to
`videos/<id>/review-<gate>-marks.yaml` as a list of `{seat: <name>, line: <n>, mark: agreed|unsure|disagreed}`.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

import yaml

from studio.room import report as R
from studio.room.ledger import Ledger

CHECKPOINTS = {"g1": "checkpoint_proposal.json", "g2": "checkpoint_story_script.json"}
MARKS = ("agreed", "unsure", "disagreed")
COLUMNS = (
    "gate",
    "linted_at",
    "presented_at",
    "minutes_to_owner",
    "first_call",
    "last_call_done",
    "room_rounds",
    "owner_rounds",
    "calls",
    "checkpoint",
)


def _when(text: Any) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(str(text))
    except ValueError:
        return None


def _checkpoint(video: Path, gate: str) -> str:
    try:
        data = json.loads((video / CHECKPOINTS[gate]).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return "-"
    return f"{data.get('status', '?')} {data.get('timestamp', '?')}" if isinstance(data, dict) else "-"


def _linted_at(video: Path, gate: str) -> Optional[str]:
    try:
        return R.read_meta(video, gate, 1).get("linted_at")
    except (OSError, ValueError):
        return None


def _gate(video: Path, gate: str, ledger: Ledger, channel: str) -> dict[str, Any]:
    rounds = R.load_rounds(video, gate)
    linted = _linted_at(video, gate)
    presented = (R.read_presented(video, gate) or {}).get("at")
    a, b = _when(linted), _when(presented)
    calls = ledger.rows(channel=channel, video=video.name, gate=gate)
    done = [t + timedelta(seconds=c.duration_s or 0) for c in calls if (t := _when(c.at))]
    return {
        "gate": gate,
        "linted_at": linted or "-",
        "presented_at": presented or "-",
        "minutes_to_owner": round((b - a).total_seconds() / 60) if a and b else None,
        "first_call": calls[0].at if calls else "-",
        "last_call_done": max(done).isoformat(timespec="seconds") if done else "-",
        "room_rounds": sum(1 for r in rounds if not r.get("owner_notes")),
        "owner_rounds": sum(1 for r in rounds if r.get("owner_notes")),
        "calls": len(calls),
        "checkpoint": _checkpoint(video, gate),
    }


def gate_times(video_dir: Path, ledger: Ledger, channel: str) -> list[dict[str, Any]]:
    return [_gate(Path(video_dir), gate, ledger, channel) for gate in CHECKPOINTS]


def render_times(rows: list[dict[str, Any]]) -> str:
    head = ["| " + " | ".join(COLUMNS) + " |", "|" + "---|" * len(COLUMNS)]
    body = ["| " + " | ".join("-" if r[c] is None else str(r[c]) for c in COLUMNS) + " |" for r in rows]
    return "\n".join(head + body) + "\n"


def _marks(path: Path) -> list[dict[str, Any]]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError, UnicodeDecodeError):
        return []
    if not isinstance(data, list):
        return []
    return [m for m in data if isinstance(m, dict) and isinstance(m.get("seat"), str) and m.get("mark") in MARKS]


def scorecard(channel_dir: Path) -> list[dict[str, Any]]:
    """Per seat: films marked, marks by kind, the agreed share, and a flag when it is under one in three over 3 films."""
    seats: dict[str, dict[str, Any]] = {}
    for path in sorted(Path(channel_dir).glob("videos/*/review-g*-marks.yaml")):
        for m in _marks(path):
            row = seats.setdefault(m["seat"], {"seat": m["seat"], "films": set(), **{k: 0 for k in MARKS}})
            row["films"].add(path.parent.name)
            row[m["mark"]] += 1
    out = []
    for row in seats.values():
        total = sum(row[k] for k in MARKS)
        share = row["agreed"] / total if total else 0.0
        films = len(row["films"])
        flag = "under one in three agreed over three films: the seat leaves" if films >= 3 and share < 1 / 3 else ""
        out.append({**row, "films": films, "share": round(share, 2), "flag": flag})
    return sorted(out, key=lambda r: r["seat"])


def render_scorecard(rows: list[dict[str, Any]]) -> str:
    lines = ["| seat | films | agreed | unsure | disagreed | agreed share | flag |", "|---|---|---|---|---|---|---|"]
    lines += [
        f"| {r['seat']} | {r['films']} | {r['agreed']} | {r['unsure']} | {r['disagreed']} | {r['share']} "
        f"| {r['flag'] or '-'} |"
        for r in rows
    ]
    return "\n".join(lines) + "\n"
