"""Room evidence for a gate: what the A2 `room` check verifies before `omni approve` signs G1 or G2.

It catches skipped rounds, missing roles, a failed or blocking fact seat, a seat on the writer's family, edits to the
file after the room, edited verdict files and verdicts the ledger never saw. Each verdict file is bound to the ledger
(its digest, seat, model, family, video, gate and round), families are recomputed from the model registry, the shipped
round is recomputed from the round files, and no malformed input raises: it becomes a problem. Like the
approval key, it is not a boundary against an agent that forges both the ledger and the report on purpose.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from studio.room.ledger import Ledger
from studio.room import report as R
from studio.room.models import UnknownModel, family_of
from studio.room.report import read_meta
from studio.room.snapshot import drafts_dir, load_draft, sha256_file
from studio.room.verdict import ALWAYS_REQUIRED, LOCKED_ROLES, MANDATORY, SELF_LOCKED, verdict_digest

MISMATCH = "belongs to a different seat, model, family, video, gate or round"


def _read_verdict(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def _writer_rule(record: dict[str, Any], writer: Any, writer_model: Any) -> str:
    """Story, fact and neutrality seats never share the writer's family; the viewer is never the writer's own model.

    A viewer on the writer's family fails too when the report names no writer model, so an old report can't pass it.
    """
    seat, role, family = record.get("seat"), record.get("role"), record.get("family")
    if role in LOCKED_ROLES and family == writer:
        return f"seat {seat} ({role}) is on the writer's family ({writer})"
    if role in SELF_LOCKED and family == writer and record.get("model") == (writer_model or record.get("model")):
        return f"seat {seat} ({role}) is the writer's own model, or the report names no writer"
    return ""


def _family_problem(what: str, record: dict[str, Any]) -> str:
    """The family stored in a verdict or judge record must be the one the registry gives its model."""
    model = record.get("model")
    try:
        real = family_of(str(model))
    except UnknownModel:
        return f"{what}: model {model!r} is not in the model registry"
    if record.get("family") != real:
        return f"{what}: stored family {record.get('family')!r} is not {real!r}, the family of {model}"
    return ""


def verify(video_dir: Path, report: dict[str, Any], artifact: Path, ledger: Ledger) -> list[str]:
    try:
        return _verify(Path(video_dir), report, Path(artifact), ledger)
    except (
        KeyError,
        TypeError,
        AttributeError,
        ValueError,
        OSError,
        sqlite3.Error,
        RecursionError,
    ) as exc:  # fail closed on anything malformed
        return [f"the room evidence is malformed ({type(exc).__name__}: {exc})"]


def _verify(video_dir: Path, report: dict[str, Any], artifact: Path, ledger: Ledger) -> list[str]:
    ship = report.get("shipped")
    if not ship:
        return ["the room shipped no draft (no lint- and fact-clean round)"]
    problems: list[str] = []
    required = _required(report, problems)
    want = ship["artifact_sha256"]
    try:
        have = sha256_file(artifact)
    except OSError:
        problems.append(f"{artifact.name} is missing or unreadable")
    else:
        if have != want:
            problems.append(f"{artifact.name} changed since the room reviewed it (room: {want[:12]}, now: {have[:12]})")
    try:
        load_draft(video_dir, want)
    except (OSError, ValueError) as exc:
        problems.append(f"the shipped draft's snapshot is missing or edited ({type(exc).__name__}: {exc})")
    recomputed = R.shipped(R.load_rounds(video_dir, str(report.get("gate"))), required)
    if recomputed != ship:
        problems.append(f"the report's shipped round does not match the round files (recomputed: {recomputed})")
    rnd = next((r for r in report.get("rounds", []) if r.get("round") == ship.get("round")), None)
    if rnd is None:
        return problems + [f"shipped round {ship.get('round')} is not in the report"]
    n = rnd["round"]
    if rnd.get("draft_sha256") != want:
        problems.append(f"round {n} reviewed a different draft than the one shipped")
    try:
        meta = read_meta(video_dir, str(report.get("gate")), n)
    except (OSError, ValueError):
        meta = None
    if (
        not isinstance(meta, dict)
        or meta.get("draft_sha256") != rnd.get("draft_sha256")
        or meta.get("lint") != rnd.get("lint")
    ):
        problems.append(f"round {n}: the report does not match meta.json")
    if isinstance(meta, dict) and "round" in meta and meta["round"] != n:
        problems.append(f"round {n}: meta.json says round {meta['round']}")
    if not (rnd.get("lint") or {}).get("ok"):
        problems.append(f"round {n}: lint failed")
    writer = report.get("writer_family")
    if not writer:
        problems.append("the report names no writer family")
    verdicts = rnd.get("verdicts") or []
    video, gate = video_dir.name, report.get("gate")
    round_dir = R.round_dir(video_dir, str(gate), n)
    on_disk = {str(p.relative_to(video_dir)) for p in round_dir.glob("*.json") if p.name not in R.NOT_VERDICTS}
    reported = {str(v.get("file")) for v in verdicts}
    if on_disk != reported:
        problems.append(f"round {n}: verdict files and report entries differ: {', '.join(sorted(on_disk ^ reported))}")
    loaded: list[tuple[dict[str, Any], dict[str, Any] | None]] = []  # (report entry, verdict file or None)
    for v in verdicts:
        seat = v.get("seat")
        raw = _read_verdict(video_dir / str(v.get("file")))
        if not isinstance(raw, dict):
            problems.append(f"verdict {seat}: file missing, unreadable or not an object")
            loaded.append((v, None))
            continue
        if raw.get("call_id") != v.get("call_id") or raw.get("output_sha256") != v.get("output_sha256"):
            problems.append(f"verdict {seat}: file missing or edited after the report")
            loaded.append((v, None))
            continue
        blockers = raw.get("blockers")
        if any(v.get(k) != raw.get(k) for k in ("seat", "role", "model", "family", "status")) or v.get("blockers") != (
            len(blockers) if isinstance(blockers, list) else None
        ):
            problems.append(f"verdict {seat}: the report does not match its verdict file")
        loaded.append((v, raw))
    for _, raw in loaded:
        if raw is not None:
            problem = _family_problem(f"verdict {raw.get('seat')}", raw)
            if problem:
                problems.append(problem)
    ok = [raw for _, raw in loaded if raw is not None and raw.get("status") == "ok"]
    for raw in ok:
        if raw.get("draft_sha256") != want:
            problems.append(f"verdict {raw.get('seat')}: reviewed a different draft")
    for role in required:
        if not any(r.get("role") == role for r in ok):
            problems.append(f"round {n}: no ok {role} verdict")
    if len({r.get("family") for r in ok if r.get("role") in required} - {writer}) < 2:
        problems.append(f"round {n}: mandatory seats need two or more families other than the writer's")
    for r in ok:
        if r.get("lint_overridden"):
            problems.append(f"verdict {r.get('seat')}: ran on a draft that failed lint (lint_overridden)")
        if problem := _writer_rule(r, writer, report.get("writer")):
            problems.append(problem)
    judge = rnd.get("judge")
    if judge and judge.get("family") == writer:
        problems.append(f"the judge is on the writer's family ({writer})")
    if judge:
        problem = _family_problem("judge", judge)
        if problem:
            problems.append(problem)
        if not judge.get("call_ids"):
            problems.append("judge call ids are missing: the judge result cites no ledger call")
    seen: set[str] = set()
    report_channel = report.get("channel") if isinstance(report.get("channel"), str) else ""
    for v, raw in loaded:
        if raw is None:
            continue
        seat, cid = v.get("seat"), str(v.get("call_id"))
        if cid in seen:
            problems.append(f"verdict {seat}: call {cid[:12]} is cited by more than one verdict")
        seen.add(cid)
        row = ledger.get(cid)
        if row is None:
            problems.append(f"verdict {seat}: call {cid[:12]} is not in the call ledger")
        else:
            if row.output_sha256 != raw.get("output_sha256") or (raw.get("status") == "ok" and row.status != "ok"):
                problems.append(f"verdict {seat}: does not match the call ledger")
            if (row.seat, row.model, row.family, row.video, row.gate, row.round) != (
                raw.get("seat"),
                raw.get("model"),
                raw.get("family"),
                video,
                gate,
                n,
            ):
                problems.append(f"verdict {seat}: call {cid[:12]} {MISMATCH}")
            if report_channel and row.channel != report_channel:
                problems.append(
                    f"verdict {seat}: call {cid[:12]} was reserved under channel {row.channel!r}, "
                    f"not {report_channel!r}"
                )
            if not row.verdict_sha256 or row.verdict_sha256 != verdict_digest(raw):
                problems.append(f"verdict {seat}: file edited after the call")
        if raw.get("role") == "fact" and raw.get("status") == "ok" and raw.get("blockers"):
            first = raw["blockers"][0]
            quote = first.get("quote") if isinstance(first, dict) else None
            problems.append(f'open fact blocker: "{quote if isinstance(quote, str) else first!r}"')
    for cid in (judge or {}).get("call_ids") or []:
        row = ledger.get(str(cid))
        if row is None:
            problems.append(f"judge call {str(cid)[:12]} is not in the call ledger")
        elif (row.seat, row.video, row.gate, row.round, row.family) != (
            "judge",
            video,
            gate,
            n,
            (judge or {}).get("family"),
        ):
            problems.append(f"judge call {str(cid)[:12]} {MISMATCH}")
        elif row.status != "ok":
            problems.append(f"judge call {str(cid)[:12]} did not finish ok (status {row.status})")
        if row is not None and report_channel and row.channel != report_channel:
            problems.append(
                f"judge call {str(cid)[:12]} was reserved under channel {row.channel!r}, not {report_channel!r}"
            )
    return problems + _cap_problems(report, ledger, video, gate)


def _cap_problems(report: dict[str, Any], ledger: Ledger, video: str, gate: Any) -> list[str]:
    cap = report["cap"]
    channel = report.get("channel")
    for calls in (
        report["calls"],
        ledger.count(channel=channel if isinstance(channel, str) and channel else None, video=video, gate=gate),
    ):
        if calls > cap:
            return [f"{calls} calls, over the cap of {cap}"]
    return []


def _required(report: dict[str, Any], problems: list[str]) -> tuple[str, ...]:
    """The report's required roles: story and fact always, nothing outside MANDATORY. Old reports mean MANDATORY."""
    raw = report.get("required_roles", list(MANDATORY))
    roles = tuple(r for r in raw if isinstance(r, str)) if isinstance(raw, list) else ()
    if not set(ALWAYS_REQUIRED) <= set(roles) or not set(roles) <= set(MANDATORY):
        problems.append(f"the report's required roles {raw!r} must include story and fact and stay within {MANDATORY}")
        return MANDATORY
    return roles
