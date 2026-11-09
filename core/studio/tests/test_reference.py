"""Owner-approved reference clips: metadata is tracked, media is re-verified by sha256."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest
import yaml

from studio import reference

REAL_ROOT = Path(__file__).resolve().parents[3]
TAILS_REF = REAL_ROOT / "core" / "reference" / "short" / "tails-rerender-noboil.yaml"


def test_tails_rerender_is_the_approved_short_reference():
    data = reference.load(TAILS_REF)
    assert data["format"] == "short" and data["approved_by"] == "owner" and str(data["approved_on"]) == "2026-11-06"
    assert data["path"].endswith("2026-10-31_tails/renders/rerender_noboil.mp4")
    assert len(data["sha256"]) == 64
    assert TAILS_REF in reference.for_format("short")
    note = REAL_ROOT / data["approval_note"]
    assert note.is_file() and data["sha256"] in note.read_text()


def test_reference_metadata_is_tracked_and_media_is_ignored():
    ignored = subprocess.run(["git", "-C", str(REAL_ROOT), "check-ignore", "-q", reference.load(TAILS_REF)["path"]])
    assert ignored.returncode == 0
    tracked = subprocess.run(["git", "-C", str(REAL_ROOT), "check-ignore", "-q", str(TAILS_REF)])
    assert tracked.returncode == 1


@pytest.mark.skipif(
    not (REAL_ROOT / reference.load(TAILS_REF)["path"]).is_file(),
    reason="the approved media is git-ignored and not on this machine",
)
def test_tails_reference_media_matches_its_hash():
    assert reference.verify(TAILS_REF)["sha256"] == reference.load(TAILS_REF)["sha256"]


def test_changed_or_missing_media_fails(tmp_path):
    media = tmp_path / "clip.mp4"
    media.write_bytes(b"approved bytes")
    meta = tmp_path / "clip.yaml"
    base = {
        "format": "short",
        "channel": "c",
        "video": "v",
        "path": "clip.mp4",
        "bytes": media.stat().st_size,
        "sha256": reference.sha256_file(media),
        "approved_by": "owner",
        "approved_on": "2026-11-06",
    }
    meta.write_text(yaml.safe_dump(base))
    assert reference.verify(meta, root=tmp_path)
    media.write_bytes(b"changed bytes!")
    with pytest.raises(reference.ReferenceError, match="sha256"):
        reference.verify(meta, root=tmp_path)
    media.unlink()
    with pytest.raises(reference.ReferenceError, match="missing"):
        reference.verify(meta, root=tmp_path)
    meta.write_text(yaml.safe_dump({k: v for k, v in base.items() if k != "sha256"}))
    with pytest.raises(reference.ReferenceError, match="sha256"):
        reference.load(meta)
