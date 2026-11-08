"""The studio-whatif pipeline (Say Suppose): seven owner gates, its skills, its checks, and the script gate on a dummy channel."""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pytest
import yaml

from lib.checkpoint import read_checkpoint, write_checkpoint
from lib.pipeline_loader import load_pipeline_readonly
from studio import channels, checks, cli
from studio.channels import ChannelError
from tests.contracts.test_phase0_contracts import sample_artifact

REAL_ROOT = Path(__file__).resolve().parents[3]
OM = REAL_ROOT / "core" / "openmontage"
STAGES = ["proposal", "story_script", "narration", "rough_cut", "final_edit", "final_watch", "publish_prep"]
LOUDNESS = {"story": {"integrated_lufs": -14, "tolerance_lu": 1, "true_peak_dbtp_max": -1, "lra_lu_max": 11}}


def test_studio_whatif_has_seven_owner_gates_and_its_skills():
    manifest = load_pipeline_readonly("studio-whatif")
    assert [s["name"] for s in manifest["stages"]] == STAGES
    assert all(s["human_approval_default"] is True for s in manifest["stages"])
    assert len(manifest["required_skills"]) == 8
    for skill in manifest["required_skills"]:
        assert (OM / "skills" / f"{skill}.md").is_file(), skill


def test_studio_whatif_checks_per_gate():
    assert checks.stage_checks("studio-whatif", "proposal") == []
    assert checks.stage_checks("studio-whatif", "story_script") == ["claims"]
    assert checks.stage_checks("studio-whatif", "narration") == ["claims", "clicks"]
    assert checks.stage_checks("studio-whatif", "rough_cut") == []
    for stage in ("final_edit", "final_watch"):
        assert checks.stage_checks("studio-whatif", stage) == ["loudness", "clicks", "opening", "similarity"]
    assert checks.stage_checks("studio-whatif", "publish_prep") == [
        "claims", "loudness", "clicks", "opening", "similarity", "upload_request"]


def test_studio_whatif_is_code_drawn_with_no_lip_sync_or_boil():
    text = (OM / "pipeline_defs" / "studio-whatif.yaml").read_text()
    body = "\n".join(l for l in text.splitlines() if not l.lstrip().startswith("#"))
    assert "lip_sync" not in body and "character_rig_renderer" not in body
    skills = "\n".join(p.read_text() for p in sorted((OM / "skills" / "studio").glob("studio-whatif-*.md")))
    for phrase in ("Digits mean facts", "No AI images", "awaiting_human", "Never"):
        assert phrase in skills, phrase


def test_say_suppose_uses_studio_whatif():
    channel = channels.load_channel("say-suppose")
    config = channel.config
    assert config.formats == {"story": "studio-whatif"}
    assert config.cadence == "daily" and config.status == "draft"
    # Owner, 2026-11-07: "Set the channel budget so it allows narration".
    assert config.budget_usd_per_video == 5
    assert config.loudness["story"].integrated_lufs == -14
    voices = yaml.safe_load((channel.dir / config.voices).read_text())["voices"]
    assert voices["narrator"]["voice_id"] == "30fc8796-ceb6-4a66-b3a7-4a145ef7f346"


# --- the script gate on a dummy channel ---

SCRIPT = """# Script: Pause Time

format: story
status: draft

## [00:00] The change
> SCENE: bedroom, morning. The alarm clock hangs mid-ring.
You wake up and discover you can pause time.
Ten seconds. Once a day.
> TAG: DAY 12
Then, on day twelve, a bus runs a red light.
A city bus needs about 20 metres to stop from 40 kilometres an hour{cite}.

## Not said
- 20 metres is a dummy figure.
"""
CLAIMS = """# Claims ledger

| id | claim as it will be spoken | source URL | quote | status | note |
|----|----|----|----|----|----|
| c01 | A city bus needs about 20 metres to stop from 40 km/h. | https://example.org/bus | "20 m" | sourced | dummy |
"""


def _awaiting(channel, video, stage, artifacts=None):
    write_checkpoint(channel.videos_dir, video, stage, "awaiting_human", artifacts or {},
                     pipeline_type="studio-whatif", checkpoint_policy="manual_all", human_approval_required=True)


def test_story_script_gate_wants_cited_digits_and_lets_story_numbers_in_words_pass(studio_root):
    channel = studio_root("dummy", formats={"story": "studio-whatif"}, loudness=LOUDNESS)
    folder = channels.new_video(channel, "Pause Time", "story", on=date(2026, 11, 6))
    video = folder.name
    _awaiting(channel, video, "proposal", {"proposal_packet": sample_artifact("proposal_packet")})
    channels.approve_stage(channel, video, "proposal", "dummy owner, test only")

    (folder / "script.md").write_text(SCRIPT.format(cite=""))
    (folder / "claims.md").write_text(CLAIMS)
    _awaiting(channel, video, "story_script")
    with pytest.raises(ChannelError, match="run `omni qc dummy"):
        channels.approve_stage(channel, video, "story_script")
    assert cli.main(["qc", "dummy", video, "story_script"]) == 1
    with pytest.raises(ChannelError, match="spoken number with no claim id"):
        channels.approve_stage(channel, video, "story_script")

    # The digit now cites its row. "Ten seconds" and "day twelve" are story numbers in words and need none;
    # the tag "DAY 12" is a cue line, not spoken.
    (folder / "script.md").write_text(SCRIPT.format(cite=" (c01)"))
    assert cli.main(["qc", "dummy", video, "story_script"]) == 0
    channels.approve_stage(channel, video, "story_script", "dummy owner, test only")
    assert read_checkpoint(channel.videos_dir, video, "story_script")["status"] == "completed"
