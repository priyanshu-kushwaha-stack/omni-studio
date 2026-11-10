#!/usr/bin/env python3
"""Check an OpenMontage scene_plan.json against the channel's visual-density rules (gate G4 input).

Rules (spec section 2.3):
  classified  every scene id has a change class in metadata.change_classes:
              motion | card | illustration | character | hero
  density     every full minute has >= 8 scene starts, unless metadata.minute_exceptions
              lists that minute (1-based) with a reason
  holds       no scene longer than 6 s; an evolving diagram/text_card/animation scene
              (movement other than "static") may hold up to 12 s; scenes that start in
              the first 60 s may hold at most 4 s
  coverage    no gap longer than 0.5 s between consecutive scenes
Exit 1 if any rule fails. Prints a summary (changes per minute, median and longest hold).
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
import sys
from collections import namedtuple
from pathlib import Path

Finding = namedtuple("Finding", "rule ok detail")

CHANGE_CLASSES = {"motion", "card", "illustration", "character", "hero"}
MIN_CHANGES_PER_MINUTE = 8
MAX_HOLD = 6.0
MAX_EVOLVING_HOLD = 12.0
HOOK_SECONDS = 60.0
HOOK_MAX_HOLD = 4.0
EVOLVING_TYPES = {"diagram", "text_card", "animation"}
MAX_GAP = 0.5


def _hold_limit(scene: dict) -> float:
    evolving = scene.get("type") in EVOLVING_TYPES and str(scene.get("movement") or "static").lower() != "static"
    limit = MAX_EVOLVING_HOLD if evolving else MAX_HOLD
    if scene["start_seconds"] < HOOK_SECONDS:
        limit = min(limit, HOOK_MAX_HOLD)
    return limit


def changes_per_minute(scenes: list[dict]) -> list[int]:
    total = max(s["end_seconds"] for s in scenes)
    counts = []
    for m in range(int(math.ceil(total / 60))):
        lo, hi = m * 60, min((m + 1) * 60, total)
        if hi - lo < 30:  # ignore a trailing partial minute shorter than 30 s
            break
        counts.append(sum(1 for s in scenes if lo <= s["start_seconds"] < hi))
    return counts


def check_scene_plan(plan: dict) -> list[Finding]:
    scenes = sorted(plan.get("scenes", []), key=lambda s: s["start_seconds"])
    if not scenes:
        return [Finding("scenes", False, "no scenes in plan")]
    meta = plan.get("metadata") or {}
    classes = meta.get("change_classes") or {}
    exceptions = {int(e["minute"]): e["reason"] for e in meta.get("minute_exceptions", []) if e.get("reason")}
    findings: list[Finding] = []

    unclassified = [s["id"] for s in scenes if classes.get(s["id"]) not in CHANGE_CLASSES]
    findings.append(
        Finding(
            "classified",
            not unclassified,
            f"unclassified scenes: {unclassified}" if unclassified else f"all {len(scenes)} scenes classified",
        )
    )

    weak = [
        f"minute {i + 1}: {n} changes"
        for i, n in enumerate(changes_per_minute(scenes))
        if n < MIN_CHANGES_PER_MINUTE and (i + 1) not in exceptions
    ]
    findings.append(
        Finding("density", not weak, "; ".join(weak) or f">= {MIN_CHANGES_PER_MINUTE} changes in every minute")
    )

    long_holds = []
    for s in scenes:
        hold = s["end_seconds"] - s["start_seconds"]
        limit = _hold_limit(s)
        if hold > limit + 1e-9:
            long_holds.append(f"{s['id']}: {hold:.1f} s > {limit:.0f} s")
    findings.append(Finding("holds", not long_holds, "; ".join(long_holds) or "all holds within limits"))

    gaps = [
        f"{a['id']}->{b['id']}: {b['start_seconds'] - a['end_seconds']:.1f} s"
        for a, b in zip(scenes, scenes[1:])
        if b["start_seconds"] - a["end_seconds"] > MAX_GAP
    ]
    findings.append(Finding("coverage", not gaps, "; ".join(gaps) or "no gaps"))
    return findings


def summary(plan: dict) -> str:
    scenes = sorted(plan.get("scenes", []), key=lambda s: s["start_seconds"])
    if not scenes:
        return "no scenes"
    holds = [s["end_seconds"] - s["start_seconds"] for s in scenes]
    cpm = changes_per_minute(scenes)
    return (
        f"{len(scenes)} scenes over {max(s['end_seconds'] for s in scenes):.0f} s; "
        f"median hold {statistics.median(holds):.1f} s; longest {max(holds):.1f} s; "
        f"changes per minute {cpm} (min {min(cpm) if cpm else 0})"
    )


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("scene_plan", type=Path)
    a = p.parse_args()
    plan = json.loads(a.scene_plan.read_text())
    findings = check_scene_plan(plan)
    for f in findings:
        print(f"[{'PASS' if f.ok else 'FAIL'}] {f.rule:<10} {f.detail}")
    print("\n" + summary(plan))
    sys.exit(1 if any(not f.ok for f in findings) else 0)


if __name__ == "__main__":
    main()
