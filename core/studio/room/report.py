"""Round files and the room report.

videos/<id>/room/<gate>/round-<N>/meta.json   draft sha256 and lint result
videos/<id>/room/<gate>/round-<N>/<seat>.json verdicts (written by call.py only)
videos/<id>/room/<gate>/round-<N>/judge.json  the judge's result, when two candidates existed
videos/<id>/room/<gate>/presented.json         when round 1's draft went to the owner (owner_first)
videos/<id>/room/<gate>.json                   the report the gate check reads
videos/<id>/room-<gate>.md                     what the owner reads

Stop-rule outcome: a round is a candidate when its lint passed, every required role returned ok (no failed verdict
from a required role, even beside a success in the same role), and no fact blocker. The required roles are MANDATORY,
or story and fact when the channel sets `viewer_required: false` (config.required_roles). Among candidates the one with
fewer open blockers (all seats) is the best; on equal blockers the first stays unless a later one's judge result is
"new". A failed judge is no result. A candidate round whose meta has owner_notes: true replaces the best regardless
of the judge (owner notes outrank the room).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from studio.room import spine
from studio.room.ledger import Ledger
from studio.room.snapshot import load_draft
from studio.room.verdict import MANDATORY

NOT_VERDICTS = ("meta.json", "judge.json")
VERDICT_KEYS = ("call_id", "seat", "role", "model", "family", "status", "blockers")


def gate_dir(video_dir: Path, gate: str) -> Path:
    return Path(video_dir) / "room" / gate


def round_dir(video_dir: Path, gate: str, n: int) -> Path:
    return gate_dir(video_dir, gate) / f"round-{n}"


def write_meta(
    video_dir: Path,
    gate: str,
    n: int,
    draft_sha256: str,
    lint: dict[str, Any],
    owner_notes: bool = False,
    kind: str = "",
) -> Path:
    d = round_dir(video_dir, gate, n)
    d.mkdir(parents=True, exist_ok=True)
    path = d / "meta.json"
    path.write_text(
        json.dumps(
            {
                "round": n,
                "draft_sha256": draft_sha256,
                "lint": lint,
                "owner_notes": bool(owner_notes),
                "kind": kind,
                "linted_at": now_iso(),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return path


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def presented_path(video_dir: Path, gate: str) -> Path:
    return gate_dir(video_dir, gate) / "presented.json"


def read_presented(video_dir: Path, gate: str) -> Optional[dict[str, Any]]:
    return _json(presented_path(video_dir, gate))


def read_meta(video_dir: Path, gate: str, n: int) -> dict[str, Any]:
    return json.loads((round_dir(video_dir, gate, n) / "meta.json").read_text())


def _json(path: Path) -> Optional[dict[str, Any]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    return data if isinstance(data, dict) else None


def scan_rounds(video_dir: Path, gate: str) -> tuple[list[dict[str, Any]], list[str]]:
    """Every readable round in order, and the names of round-* directories that could not be read."""
    video_dir = Path(video_dir)
    found: list[tuple[int, dict[str, Any]]] = []
    skipped: list[str] = []
    for d in sorted(gate_dir(video_dir, gate).glob("round-*")):
        try:
            n = int(d.name.split("-", 1)[1])
        except ValueError:
            skipped.append(d.name)
            continue
        meta = _json(d / "meta.json")
        if meta is None or "draft_sha256" not in meta or not isinstance(meta.get("lint"), dict):
            skipped.append(d.name)
            continue
        verdicts, malformed = [], []
        for p in sorted(d.glob("*.json")):
            if p.name in NOT_VERDICTS:
                continue
            v = _json(p)
            rel = str(p.relative_to(video_dir))
            if v is None or any(k not in v for k in VERDICT_KEYS) or not isinstance(v["blockers"], list):
                malformed.append(rel)
                continue
            verdicts.append({**v, "file": rel})
        judge = _json(d / "judge.json")
        if judge is not None and judge.get("winner") not in ("new", "best"):
            judge = None  # no winner key, or null: the judge failed, so there is no result
        found.append(
            (
                n,
                {
                    "round": meta.get("round", n),
                    "draft_sha256": meta["draft_sha256"],
                    "lint": meta["lint"],
                    "verdicts": verdicts,
                    "judge": judge,
                    "malformed": malformed,
                    "owner_notes": meta.get("owner_notes") is True,
                },
            )
        )
    found.sort(key=lambda t: t[0])
    return [r for _, r in found], sorted(skipped)


def load_rounds(video_dir: Path, gate: str) -> list[dict[str, Any]]:
    return scan_rounds(video_dir, gate)[0]


def is_candidate(rnd: dict[str, Any], required: tuple[str, ...] = MANDATORY) -> bool:
    """Lint ok, an ok verdict from every required role, and no failed fact verdict or fact blocker."""
    if not rnd["lint"].get("ok"):
        return False
    verdicts = rnd["verdicts"]
    for role in required:
        if not any(v.get("role") == role and v.get("status") == "ok" for v in verdicts):
            return False
    if any(v.get("role") in required and v.get("status") != "ok" for v in verdicts):
        return False
    return all(v.get("status") == "ok" and not v.get("blockers") for v in verdicts if v.get("role") == "fact")


def open_blockers(rnd: dict[str, Any]) -> int:
    return sum(len(v["blockers"]) for v in rnd["verdicts"] if v.get("status") == "ok")


def _best(rounds: list[dict[str, Any]], required: tuple[str, ...] = MANDATORY) -> Optional[dict[str, Any]]:
    best = None
    for rnd in rounds:
        if not is_candidate(rnd, required):
            continue
        if best is None or rnd.get("owner_notes"):
            best = rnd
            continue
        fewer, same = open_blockers(rnd) < open_blockers(best), open_blockers(rnd) == open_blockers(best)
        if fewer or (same and rnd["judge"] and rnd["judge"].get("winner") == "new"):
            best = rnd
    return best


def best_before(
    rounds: list[dict[str, Any]], n: int, required: tuple[str, ...] = MANDATORY
) -> Optional[dict[str, Any]]:
    return _best([r for r in rounds if r["round"] < n], required)


def shipped(rounds: list[dict[str, Any]], required: tuple[str, ...] = MANDATORY) -> Optional[dict[str, Any]]:
    best = _best(rounds, required)
    return {"round": best["round"], "artifact_sha256": best["draft_sha256"]} if best else None


def build_report(
    video_dir: Path,
    *,
    gate: str,
    stage: str,
    channel: str,
    writer_family: str,
    ledger: Ledger,
    cap: int,
    required: tuple[str, ...] = MANDATORY,
) -> dict[str, Any]:
    video_dir = Path(video_dir)
    rounds, skipped = scan_rounds(video_dir, gate)
    summary = []
    for rnd in rounds:
        summary.append(
            {
                "round": rnd["round"],
                "draft_sha256": rnd["draft_sha256"],
                "lint": rnd["lint"],
                "verdicts": [
                    {
                        "seat": v["seat"],
                        "role": v["role"],
                        "model": v["model"],
                        "family": v["family"],
                        "status": v["status"],
                        "call_id": v["call_id"],
                        "file": v["file"],
                        "output_sha256": v.get("output_sha256", ""),
                        "blockers": len(v["blockers"]),
                    }
                    for v in rnd["verdicts"]
                ],
                "judge": rnd["judge"],
                "owner_notes": bool(rnd.get("owner_notes")),
                "candidate": is_candidate(rnd, required),
            }
        )
    return {
        "gate": gate,
        "stage": stage,
        "channel": channel,
        "writer_family": writer_family,
        "required_roles": list(required),
        "rounds": summary,
        "skipped_rounds": skipped,
        "malformed_verdicts": sorted(m for r in rounds for m in r["malformed"]),
        "shipped": shipped(rounds, required),
        "calls": ledger.count(channel=channel, video=video_dir.name, gate=gate),
        "cap": cap,
        "author_cut": _author_cut(video_dir, rounds, shipped(rounds, required)),
        "presented": read_presented(video_dir, gate),
    }


def _author_cut(video_dir: Path, rounds: list[dict[str, Any]], ship: Optional[dict[str, Any]]) -> Optional[dict]:
    """Round 1's draft (the writer's own) and what the rounds after it cost the voice, once a round ships."""
    if not rounds or not ship:
        return None
    first = rounds[0]
    keeps = [
        k.get("quote", "") if isinstance(k, dict) else str(k)
        for r in rounds
        for v in r["verdicts"]
        if v.get("status") == "ok"
        for k in v.get("keep") or []
    ]
    try:
        cost = spine.voice_cost(
            load_draft(video_dir, first["draft_sha256"]), load_draft(video_dir, ship["artifact_sha256"]), keeps
        )
    except (OSError, ValueError):
        cost = None
    return {"round": first["round"], "draft_sha256": first["draft_sha256"], "cost": cost}


def _author_cut_lines(report: dict[str, Any]) -> list[str]:
    lines: list[str] = []
    cut = report.get("author_cut")
    if cut:
        cost = cut.get("cost") or {}
        lines += [
            "",
            "## Author's cut",
            "",
            f"Round {cut['round']}'s draft, the writer's own: room/drafts/{cut['draft_sha256']}.md",
            f"What review cost the voice: {cost.get('lines_changed', '?')} lines changed; spine lines changed: "
            f"{', '.join(cost.get('header_changed') or []) or 'none'}; "
            f"keep lines lost: {len(cost.get('keep_lost') or [])}",
        ]
        lines += [f'- lost keep line: "{q}"' for q in cost.get("keep_lost") or []]
    presented = report.get("presented")
    if presented:
        lines += ["", f"Owner first: round 1's draft went to the owner at {presented.get('at')}"]
    return lines


def write_report(video_dir: Path, report: dict[str, Any]) -> tuple[Path, Path]:
    video_dir = Path(video_dir)
    gate = report["gate"]
    js = video_dir / "room" / f"{gate}.json"
    js.parent.mkdir(parents=True, exist_ok=True)
    js.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    ship = report["shipped"]
    focus = ship["round"] if ship else (report["rounds"][-1]["round"] if report["rounds"] else None)
    lines = [f"# Room report, {gate.upper()} ({report['stage']})", ""]
    shipped_round = next((r for r in report["rounds"] if ship and r["round"] == ship["round"]), None)
    if ship:
        by_notes = (
            " (shipped by the owner-notes rule (no judge))"
            if shipped_round and shipped_round.get("owner_notes")
            else ""
        )
        lines.append(f"Shipped: round {ship['round']} ({ship['artifact_sha256'][:12]}){by_notes}")
    else:
        lines.append(
            "Shipped: none. No round is a candidate (lint ok, an ok verdict from "
            f"{', '.join(report.get('required_roles') or MANDATORY)}, no fact blocker), so the gate check will fail."
        )
    lines += [f"Calls: {report['calls']} of {report['cap']}", *_author_cut_lines(report)]
    lines += ["", f"## Open notes in round {focus}", ""]
    for rnd in load_rounds(video_dir, gate):
        if rnd["round"] != focus:
            continue
        for v in rnd["verdicts"]:
            if v["status"] != "ok":
                lines.append(f"- {v['seat']} ({v['role']}): FAILED, {v.get('error', '')}")
            for b in (x for x in v["blockers"] if isinstance(x, dict)):
                lines.append(
                    f'- {v["seat"]} ({v["role"]}) blocker, line {b.get("line")}: "{b.get("quote")}". '
                    f"{b.get('why')} Fix: {b.get('fix')}"
                )
            for k in (x if isinstance(x, dict) else {"quote": x} for x in v.get("keep") or []):
                lines.append(f'- {v["seat"]} keep, line {k.get("line")}: "{k.get("quote", "")}"')
    for m in report.get("malformed_verdicts") or []:
        lines.append(f"- MALFORMED verdict file, not counted: {m}")
    lines += ["", "## Rounds", "", "| round | lint | seats ok | blockers | judge |", "|---|---|---|---|---|"]
    for rnd in report["rounds"]:
        ok = sum(1 for v in rnd["verdicts"] if v["status"] == "ok")
        blockers = sum(v["blockers"] for v in rnd["verdicts"])
        judge = rnd["judge"]["winner"] if rnd["judge"] else "-"
        lines.append(
            f"| {rnd['round']} | {'ok' if rnd['lint'].get('ok') else 'fail'} | {ok}/{len(rnd['verdicts'])} "
            f"| {blockers} | {judge} |"
        )
    if ship:
        lines += [""] + [
            f"Round {r['round']} was a clean candidate but was not judged; the earlier round ships."
            for r in report["rounds"]
            if r["round"] > ship["round"] and r.get("candidate") and not r["judge"] and not r.get("owner_notes")
        ]
    md = video_dir / f"room-{gate}.md"
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return js, md
