"""Content-addressed draft snapshots: videos/<id>/room/drafts/<sha256>.md, one per reviewed draft."""

from __future__ import annotations

import hashlib
from pathlib import Path


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8"))


def sha256_file(path: Path) -> str:
    return sha256_bytes(Path(path).read_bytes())


def drafts_dir(video_dir: Path) -> Path:
    return Path(video_dir) / "room" / "drafts"


def save_draft(video_dir: Path, source: Path) -> str:
    data = Path(source).read_bytes()
    sha = sha256_bytes(data)
    dest = drafts_dir(video_dir) / f"{sha}.md"
    if not dest.is_file():
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    return sha


def load_draft(video_dir: Path, sha: str) -> str:
    data = (drafts_dir(video_dir) / f"{sha}.md").read_bytes()
    if sha256_bytes(data) != sha:
        raise ValueError(f"draft snapshot {sha[:12]} was edited after it was saved")
    return data.decode("utf-8")
