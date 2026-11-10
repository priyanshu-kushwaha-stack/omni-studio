#!/usr/bin/env python3
"""Copy externally generated assets (Higgsfield MCP, archival) into an OpenMontage project and log provenance."""

from __future__ import annotations

import argparse
import csv
import shutil
from pathlib import Path

KIND_DIR = {"image": "images", "video": "video", "audio": "audio"}


def import_asset(
    src: Path,
    video_dir: Path,
    om_project: Path,
    *,
    kind: str,
    source: str,
    model: str,
    license: str,
    credits: float,
    usd: float,
    note: str = "",
) -> Path:
    if kind not in KIND_DIR:
        raise ValueError(f"kind must be one of {sorted(KIND_DIR)}, got {kind!r}")
    dest_dir = Path(om_project) / "assets" / KIND_DIR[kind]
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / Path(src).name
    if dest.exists():
        raise FileExistsError(dest)
    shutil.copy2(src, dest)
    prov = Path(video_dir) / "assets" / "provenance.csv"
    with prov.open("a", newline="") as fh:
        csv.writer(fh, lineterminator="\n").writerow(
            [f"assets/{KIND_DIR[kind]}/{dest.name}", kind, source, model, license, credits, usd, note]
        )
    return dest


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("files", nargs="+", type=Path)
    p.add_argument("--video-dir", required=True, type=Path)
    p.add_argument("--om-project", required=True, type=Path)
    p.add_argument("--kind", required=True, choices=sorted(KIND_DIR))
    p.add_argument("--source", required=True)
    p.add_argument("--model", required=True)
    p.add_argument("--license", required=True)
    p.add_argument("--credits", type=float, default=0.0, help="credits per file")
    p.add_argument("--usd", type=float, default=0.0, help="usd per file")
    p.add_argument("--note", default="")
    a = p.parse_args()
    for f in a.files:
        print(
            import_asset(
                f,
                a.video_dir,
                a.om_project,
                kind=a.kind,
                source=a.source,
                model=a.model,
                license=a.license,
                credits=a.credits,
                usd=a.usd,
                note=a.note,
            )
        )


if __name__ == "__main__":
    main()
