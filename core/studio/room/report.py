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
