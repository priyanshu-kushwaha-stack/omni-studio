#!/usr/bin/env python3
"""Scene plan for a Short from an anchor list: every still starts on the first word of its anchor phrase.

Shorts change picture every 2-4 s, so the beat-split plan from scene_plan_from_script.py is too coarse;
here each still names the phrase it lands on. Input `<short>/shots.json`: [{"id", "anchor", "class"}] in
order; output `<short>/scene_plan.json` in the same shape compose.py reads.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compose import find_phrase  # noqa: E402


def build(shots: list[dict], words: list[dict], tail: float = 2.4) -> dict:
    scenes, t = [], 0.0
    for i, s in enumerate(shots):
        hit = find_phrase(words, s["anchor"], not_before=t)
        if hit is None:
            raise SystemExit(f"anchor not found after {t:.2f}s: {s['anchor']!r} ({s['id']})")
        start = 0.0 if i == 0 else max(t, hit[0] - 0.1)
        scenes.append({"id": s["id"], "start_seconds": round(start, 3), "description": s.get("note", s["anchor"])})
        t = start
    end = words[-1]["end"] + tail
    for a, b in zip(scenes, scenes[1:] + [None]):
        a["end_seconds"] = b["start_seconds"] if b else round(end, 3)
    return {
        "scenes": scenes,
        "metadata": {"change_classes": {s["id"]: s.get("class", "illustration") for s in shots}, "format": "short"},
    }


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("short_dir", type=Path)
    a = p.parse_args()
    shots = json.loads((a.short_dir / "shots.json").read_text())
    words = json.loads((a.short_dir / "narration" / "words.json").read_text())
    plan = build(shots, words)
    (a.short_dir / "scene_plan.json").write_text(json.dumps(plan, indent=1))
    for s in plan["scenes"]:
        print(f"{s['id']:7s} {s['start_seconds']:6.2f} {s['end_seconds'] - s['start_seconds']:5.2f}s")


if __name__ == "__main__":
    main()
