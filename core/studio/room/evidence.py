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
