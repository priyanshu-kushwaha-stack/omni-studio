#!/usr/bin/env python3
"""Render a proof-of-concept rough cut: stills held for their scene windows over the narration.

Inputs: scene_plan.json (from scene_plan_from_script.py), a stills directory with <scene_id>.png
for every scene that has required_assets (continuation scenes reuse the last still), the narration
file. Output: a small mp4 (default 640x360) with no music, no subtitles, no motion. Optional
--until trims to the first N seconds (for a partial proof).
"""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path


def plan_segments(plan: dict, stills: Path, until: float | None) -> list[tuple[Path, float]]:
    """(still path, hold seconds) per scene; continuation scenes reuse the previous still."""
    out: list[tuple[Path, float]] = []
    current: Path | None = None
    for s in sorted(plan["scenes"], key=lambda x: x["start_seconds"]):
        if until is not None and s["start_seconds"] >= until:
            break
        cand = stills / f"{s['id']}.png"
        if cand.exists():
            current = cand
        if current is None:
            continue
        end = min(s["end_seconds"], until) if until is not None else s["end_seconds"]
        hold = end - s["start_seconds"]
        if hold > 0:
            out.append((current, hold))
    return out


def render(
    plan: dict,
    stills: Path,
    narration: Path,
    out: Path,
    *,
    width: int = 640,
    height: int = 360,
    fps: int = 24,
    until: float | None = None,
) -> Path:
    segs = plan_segments(plan, stills, until)
    if not segs:
        raise SystemExit("no scenes with stills")
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        for p, hold in segs:
            f.write(f"file '{p.resolve()}'\nduration {hold:.3f}\n")
        f.write(f"file '{segs[-1][0].resolve()}'\n")  # concat demuxer needs the last file repeated
        listing = f.name
    total = sum(h for _, h in segs)
    cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listing,
        "-i",
        str(narration),
        "-t",
        f"{total:.3f}",
        "-vf",
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=#F6F1E7,fps={fps},format=yuv420p",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-shortest",
        str(out),
    ]
    subprocess.run(cmd, check=True)
    return out


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("scene_plan", type=Path)
    p.add_argument("stills", type=Path)
    p.add_argument("narration", type=Path)
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument("--until", type=float, default=None, help="render only the first N seconds")
    a = p.parse_args()
    out = render(json.loads(a.scene_plan.read_text()), a.stills, a.narration, a.out, until=a.until)
    print(out)


if __name__ == "__main__":
    main()
