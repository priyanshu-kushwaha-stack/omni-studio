"""Phase 3, patch 9: on a channel project only `omni approve` can mark a gated stage approved."""

from __future__ import annotations

import json
import shutil
from datetime import date
from pathlib import Path

import pytest
import yaml

import styles.playbook_loader as playbook_loader
from lib import studio_approval
from lib.checkpoint import CheckpointValidationError, read_checkpoint, write_checkpoint
from studio import channels, cli
from tests.contracts.test_phase0_contracts import sample_artifact

REAL_ROOT = Path(__file__).resolve().parents[3]
VIDEO = "2026-11-05_same"


@pytest.fixture()
def video(tmp_path, monkeypatch):
    root = tmp_path / "root"
    shutil.copytree(REAL_ROOT / "channels" / "_template", root / "channels" / "_template")
    styles = root / "core" / "openmontage" / "styles"
    styles.mkdir(parents=True)
    monkeypatch.setattr(channels, "ROOT", root)
    monkeypatch.setattr(playbook_loader, "STYLES_DIR", styles)
    channel = channels.create_channel("sample")
    path = channel.dir / "channel.yaml"
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    data.update(formats={"smoke": "framework-smoke"}, budget_usd_per_video=1)
    path.write_text(yaml.safe_dump(data), encoding="utf-8")
    channel = channels.load_channel("sample")
    channels.new_video(channel, "Same", "smoke", on=date(2026, 11, 5))
    return channel


def _artifacts(stage):
    name = {"research": "research_brief", "script": "script"}[stage]
    return {name: sample_artifact(name)}


def _write(channel, stage, status, **kwargs):
    return write_checkpoint(channel.videos_dir, VIDEO, stage, status, _artifacts(stage), **kwargs)


def test_direct_write_with_human_approved_is_refused(video):
    _write(video, "research", "awaiting_human")
    with pytest.raises(CheckpointValidationError, match="only `omni approve`"):
        _write(video, "research", "completed", human_approved=True)
    assert read_checkpoint(video.videos_dir, VIDEO, "research")["status"] == "awaiting_human"


def test_forged_approval_metadata_is_refused(video):
    _write(video, "research", "awaiting_human")
    fake = {"approval": {"via": "omni approve", "at": "2026-11-05T00:00:00+00:00", "proof": "0" * 64}}
    studio_approval._key(create=True)
    with pytest.raises(CheckpointValidationError, match="does not match"):
        _write(video, "research", "completed", human_approved=True, metadata=fake)


def test_hand_edited_checkpoint_does_not_unlock_the_next_stage(video):
    _write(video, "research", "awaiting_human")
    path = video.videos_dir / VIDEO / "checkpoint_research.json"
    forged = json.loads(path.read_text("utf-8"))
    forged.update(status="completed", human_approved=True)
    path.write_text(json.dumps(forged), encoding="utf-8")
    with pytest.raises(CheckpointValidationError, match="completed without required approval"):
        _write(video, "script", "awaiting_human")


def test_hand_edit_that_also_clears_the_required_flag_is_still_refused(video):
    _write(video, "research", "awaiting_human")
    path = video.videos_dir / VIDEO / "checkpoint_research.json"
    forged = json.loads(path.read_text("utf-8"))
    forged.update(status="completed", human_approved=True, human_approval_required=False,
                  metadata={"approval": {"via": "omni approve", "at": "x", "proof": "f" * 64}})
    path.write_text(json.dumps(forged), encoding="utf-8")
    with pytest.raises(CheckpointValidationError, match="completed without required approval"):
        _write(video, "script", "awaiting_human")


def test_artifacts_changed_after_approval_lose_the_approval(video):
    _write(video, "research", "awaiting_human")
    assert cli.main(["approve", "sample", VIDEO, "research"]) == 0
    _write(video, "script", "awaiting_human")   # approved predecessor: allowed
    path = video.videos_dir / VIDEO / "checkpoint_research.json"
    approved = json.loads(path.read_text("utf-8"))
    approved["artifacts"]["research_brief"]["topic"] = "Edited after approval"
    path.write_text(json.dumps(approved), encoding="utf-8")
    with pytest.raises(CheckpointValidationError, match="completed without required approval"):
        _write(video, "script", "awaiting_human")


def test_omni_approve_still_passes_gates_and_records_a_proof(video):
    _write(video, "research", "awaiting_human")
    assert cli.main(["approve", "sample", VIDEO, "research", "--note", "ok"]) == 0
    checkpoint = read_checkpoint(video.videos_dir, VIDEO, "research")
    assert checkpoint["human_approved"] is True
    approval = checkpoint["metadata"]["approval"]
    assert approval["via"] == "omni approve" and len(approval["proof"]) == 64
    _write(video, "script", "awaiting_human")
    assert cli.main(["approve", "sample", VIDEO, "script"]) == 0
    assert read_checkpoint(video.videos_dir, VIDEO, "script")["human_approved"] is True


def test_approval_key_is_created_private_outside_the_repo(video):
    _write(video, "research", "awaiting_human")
    assert cli.main(["approve", "sample", VIDEO, "research"]) == 0
    key = studio_approval.key_path()
    assert key.is_file() and (key.stat().st_mode & 0o777) == 0o600
    assert not key.resolve().is_relative_to(REAL_ROOT)


def test_projects_outside_a_channel_keep_upstream_behaviour(tmp_path):
    from lib.checkpoint import init_project

    init_project("plain", title="Plain", pipeline_type="framework-smoke", pipeline_dir=tmp_path)
    write_checkpoint(tmp_path, "plain", "research", "completed", _artifacts("research"), human_approved=True)
    assert read_checkpoint(tmp_path, "plain", "research")["human_approved"] is True


def test_default_key_lives_in_the_secrets_folder(monkeypatch):
    monkeypatch.delenv(studio_approval.KEY_ENV)
    assert studio_approval.key_path() == Path.home() / ".config" / "omni-studio" / "approval.key"
