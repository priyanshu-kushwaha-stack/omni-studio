"""Owner-approved reference clips (core/reference/<format>/*.yaml): load and re-verify by sha256."""

from __future__ import annotations

import hashlib
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
REFERENCE_DIR = ROOT / "core" / "reference"
REQUIRED = ("format", "channel", "video", "path", "sha256", "bytes", "approved_by", "approved_on")


class ReferenceError(Exception):
    """A reference clip's metadata is incomplete, or its media is missing or changed."""


def sha256_file(path: Path, chunk: int = 1 << 20) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while block := handle.read(chunk):
            digest.update(block)
    return digest.hexdigest()


def load(meta_path: Path) -> dict:
    data = yaml.safe_load(Path(meta_path).read_text(encoding="utf-8"))
    missing = [key for key in REQUIRED if not isinstance(data, dict) or data.get(key) in (None, "")]
    if missing:
        raise ReferenceError(f"{meta_path}: missing {missing}")
    return data


def for_format(format_name: str) -> list[Path]:
    return sorted((REFERENCE_DIR / format_name).glob("*.yaml"))


def verify(meta_path: Path, root: Path = ROOT) -> dict:
    """Return the metadata when the media exists with the recorded size and sha256, else raise."""
    data = load(meta_path)
    media = root / data["path"]
    if not media.is_file():
        raise ReferenceError(f"{meta_path}: media {data['path']} is missing (media is git-ignored; copy it in)")
    if media.stat().st_size != int(data["bytes"]):
        raise ReferenceError(f"{meta_path}: {data['path']} is {media.stat().st_size} bytes, recorded {data['bytes']}")
    actual = sha256_file(media)
    if actual != data["sha256"]:
        raise ReferenceError(f"{meta_path}: {data['path']} sha256 {actual} != recorded {data['sha256']}")
    return data
