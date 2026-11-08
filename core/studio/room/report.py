"""Round files and the room report.

videos/<id>/room/<gate>/round-<N>/meta.json   draft sha256 and lint result
videos/<id>/room/<gate>/round-<N>/<seat>.json verdicts (written by call.py only)
videos/<id>/room/<gate>/round-<N>/judge.json  the judge's result, when two candidates existed
videos/<id>/room/<gate>.json                   the report the gate check reads
videos/<id>/room-<gate>.md                     what the owner reads

Stop-rule outcome: a round is a candidate when its lint passed, every mandatory role returned ok, and no fact blocker. The
first candidate is the best; a later candidate replaces it only when its judge result is "new". A candidate round whose
meta has owner_notes: true replaces it regardless of the judge (owner notes outrank the room).
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


def write_meta(video_dir: Path, gate: str, n: int, draft_sha256: str, lint: dict[str, Any],
               owner_notes: bool = False, kind: str = "") -> Path:
    d = round_dir(video_dir, gate, n)
    d.mkdir(parents=True, exist_ok=True)
    path = d / "meta.json"
    path.write_text(json.dumps({"round": n, "draft_sha256": draft_sha256, "lint": lint, "owner_notes": bool(owner_notes),
                                "kind": kind}, indent=2) + "\n", encoding="utf-8")
    return path


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
        verdicts = []
        for p in sorted(d.glob("*.json")):
            if p.name in NOT_VERDICTS:
                continue
            v = _json(p)
            if v is not None:
                verdicts.append({**v, "file": str(p.relative_to(video_dir))})
        judge = _json(d / "judge.json")
        if judge is not None and "winner" not in judge:
            judge = None
        found.append((n, {"round": meta.get("round", n), "draft_sha256": meta["draft_sha256"],
                          "lint": meta["lint"], "verdicts": verdicts, "judge": judge,
                          "owner_notes": meta.get("owner_notes") is True}))
    found.sort(key=lambda t: t[0])
    return [r for _, r in found], sorted(skipped)


def load_rounds(video_dir: Path, gate: str) -> list[dict[str, Any]]:
    return scan_rounds(video_dir, gate)[0]


def is_candidate(rnd: dict[str, Any]) -> bool:
    """Lint ok, an ok verdict from every mandatory role, and no failed fact verdict or fact blocker."""
    if not rnd["lint"].get("ok"):
        return False
    verdicts = rnd["verdicts"]
    for role in MANDATORY:
        if not any(v.get("role") == role and v.get("status") == "ok" for v in verdicts):
            return False
    return all(v.get("status") == "ok" and not v.get("blockers") for v in verdicts if v.get("role") == "fact")


def _best(rounds: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    best = None
    for rnd in rounds:
        if is_candidate(rnd) and (best is None or rnd.get("owner_notes")
                                  or (rnd["judge"] and rnd["judge"].get("winner") == "new")):
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
    rounds, skipped = scan_rounds(video_dir, gate)
    summary = []
    for rnd in rounds:
        summary.append({
            "round": rnd["round"], "draft_sha256": rnd["draft_sha256"], "lint": rnd["lint"],
            "verdicts": [{"seat": v["seat"], "role": v["role"], "model": v["model"], "family": v["family"],
                          "status": v["status"], "call_id": v["call_id"], "file": v["file"],
                          "output_sha256": v.get("output_sha256", ""), "blockers": len(v["blockers"])}
                         for v in rnd["verdicts"]],
            "judge": rnd["judge"], "owner_notes": bool(rnd.get("owner_notes")), "candidate": is_candidate(rnd)})
    return {"gate": gate, "stage": stage, "writer_family": writer_family, "rounds": summary,
            "skipped_rounds": skipped,
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
    shipped_round = next((r for r in report["rounds"] if ship and r["round"] == ship["round"]), None)
    if ship:
        by_notes = " (shipped by the owner-notes rule (no judge))" if shipped_round and shipped_round.get(
            "owner_notes") else ""
        lines.append(f"Shipped: round {ship['round']} ({ship['artifact_sha256'][:12]}){by_notes}")
    else:
        lines.append("Shipped: none. No round is a candidate (lint ok, an ok viewer, story and fact verdict, "
                     "no fact blocker), so the gate check will fail.")
    lines += [f"Calls: {report['calls']} of {report['cap']}", "", f"## Open notes in round {focus}", ""]
    for rnd in load_rounds(video_dir, gate):
        if rnd["round"] != focus:
            continue
        for v in rnd["verdicts"]:
            if v["status"] != "ok":
                lines.append(f"- {v['seat']} ({v['role']}): FAILED, {v.get('error', '')}")
            for b in (x for x in v["blockers"] if isinstance(x, dict)):
                lines.append(f"- {v['seat']} ({v['role']}) blocker, line {b.get('line')}: \"{b.get('quote')}\". "
                             f"{b.get('why')} Fix: {b.get('fix')}")
            for k in (x if isinstance(x, dict) else {"quote": x} for x in v["keep"]):
                lines.append(f"- {v['seat']} keep, line {k.get('line')}: \"{k.get('quote', '')}\"")
    lines += ["", "## Rounds", "", "| round | lint | seats ok | blockers | judge |", "|---|---|---|---|---|"]
    for rnd in report["rounds"]:
        ok = sum(1 for v in rnd["verdicts"] if v["status"] == "ok")
        blockers = sum(v["blockers"] for v in rnd["verdicts"])
        judge = rnd["judge"]["winner"] if rnd["judge"] else "-"
        lines.append(f"| {rnd['round']} | {'ok' if rnd['lint'].get('ok') else 'fail'} | {ok}/{len(rnd['verdicts'])} "
                     f"| {blockers} | {judge} |")
    if ship:
        lines += [""] + [f"Round {r['round']} was a clean candidate but was not judged; the earlier round ships."
                         for r in report["rounds"]
                         if r["round"] > ship["round"] and r.get("candidate") and not r["judge"]
                         and not r.get("owner_notes")]
    md = video_dir / f"room-{gate}.md"
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return js, md
