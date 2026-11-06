"""Phase 4: the studio-short pipeline, its skills, and an end-to-end run on a dummy channel up to (not past) G6."""

from __future__ import annotations

import re
from datetime import date
from pathlib import Path

import pytest

from lib.checkpoint import CheckpointValidationError, read_checkpoint, write_checkpoint
from lib.pipeline_loader import load_pipeline_readonly
from studio import channels, checks, cli
from studio.channels import ChannelError
from tests.contracts.test_phase0_contracts import sample_artifact

REAL_ROOT = Path(__file__).resolve().parents[3]
OM = REAL_ROOT / "core" / "openmontage"
STAGES = ["proposal", "short_script", "narration", "rough_cut", "final_edit", "final_watch", "publish_prep"]
VIDEO = "2026-11-06_why-we-yawn"


def test_studio_short_has_seven_owner_gates_and_its_skills():
    manifest = load_pipeline_readonly("studio-short")
    assert [s["name"] for s in manifest["stages"]] == STAGES
    assert all(s["human_approval_default"] is True for s in manifest["stages"])
    for skill in manifest["required_skills"]:
        assert (OM / "skills" / f"{skill}.md").is_file(), skill
    assert manifest["metadata"]["size"] == "1080x1920"
    assert set(manifest["metadata"]["studio_checks"]["final_edit"]) == {"loudness", "clicks", "similarity"}
    assert "claims" in manifest["metadata"]["studio_checks"]["short_script"]
    assert "upload_request" in manifest["metadata"]["studio_checks"]["publish_prep"]


def test_studio_short_says_the_shorts_rule_and_bans_boil_and_ai_motion():
    text = (OM / "pipeline_defs" / "studio-short.yaml").read_text()
    for phrase in ("one quiet pencil per 5 s", "no page turns", "2.4 s fade-out tail", "code puppets"):
        assert phrase in text, phrase
    body = "\n".join(l for l in text.splitlines() if not l.lstrip().startswith("#"))
    assert "lip_sync" not in body and "character_rig_renderer" not in body
    skills = "\n".join(p.read_text() for p in (OM / "skills" / "studio").glob("studio-short-*.md"))
    assert "never boil" in skills and "No AI motion clips" in skills and "no `> QUIZ:` boards" in skills


def test_both_studio_pipelines_name_only_known_checks():
    for pipeline in ("studio-short", "studio-dialogue"):
        for stage in STAGES + ["dialogue_script"]:
            try:
                names = checks.stage_checks(pipeline, stage)
            except ChannelError:
                pytest.fail(f"{pipeline} {stage}")
            assert set(names) <= set(checks.KNOWN)
    assert checks.stage_checks("studio-dialogue", "dialogue_script") == ["claims", "no_quiz_boards"]


def test_professor_of_us_shorts_use_studio_short():
    config = channels.load_channel("professor-of-us").config
    assert config.formats == {"dialogue": "studio-dialogue", "short": "studio-short"}
    assert config.loudness["short"].integrated_lufs == -14 and config.upload.contains_synthetic_media is False


# --- end to end on a dummy channel ---

SCRIPT = """# Short script: Why do we yawn?

format: short (9:16)

## [00:00] Hook
PROF: Why do you yawn when someone else does?
YOU: Because I'm bored.
OOG: Oog yawn at fire.
PROF: Close. Yawns spread between people who know each other best (c01).
"""
CLAIMS = """# Claims ledger

| id | claim as it will be spoken | source URL | quote | status | note |
|----|----|----|----|----|----|
| c01 | Yawns spread most between people who know each other. | https://example.org/yawn | "kin" | sourced | dummy |
"""


def _awaiting(channel, stage, artifacts=None):
    write_checkpoint(channel.videos_dir, VIDEO, stage, "awaiting_human", artifacts or {},
                     pipeline_type="studio-short", checkpoint_policy="manual_all", human_approval_required=True)


def _status(channel, stage):
    return read_checkpoint(channel.videos_dir, VIDEO, stage)["status"]


def test_studio_short_end_to_end_up_to_g6(studio_root, media, capsys):
    log = []
    channel = studio_root("dummy")
    folder = channels.new_video(channel, "Why We Yawn", "short", on=date(2026, 11, 6))
    log.append(f"new video {channel.slug}/{folder.name} (format short -> studio-short)")

    # G1 proposal (no automated checks)
    _awaiting(channel, "proposal", {"proposal_packet": sample_artifact("proposal_packet")})
    channels.approve_stage(channel, VIDEO, "proposal", "dummy owner, test only")
    log.append("G1 proposal: awaiting_human -> approved")

    # G2 short_script: refused until qc runs, refused while a claim has no source, then passes
    (folder / "script.md").write_text(SCRIPT)
    (folder / "claims.md").write_text(CLAIMS.replace("https://example.org/yawn", ""))
    _awaiting(channel, "short_script")
    with pytest.raises(ChannelError, match="run `omni qc dummy"):
        channels.approve_stage(channel, VIDEO, "short_script")
    assert cli.main(["qc", "dummy", VIDEO, "short_script"]) == 1
    with pytest.raises(ChannelError, match="c01: claim has no source"):
        channels.approve_stage(channel, VIDEO, "short_script")
    log.append("G2 short_script: refused (no qc report), refused (claim c01 has no source)")
    (folder / "claims.md").write_text(CLAIMS)
    (folder / "script.md").write_text(SCRIPT + "> ASK: Guess?\n> QUIZ: a | *b | c\n")
    assert cli.main(["qc", "dummy", VIDEO, "short_script"]) == 1
    (folder / "script.md").write_text(SCRIPT)
    assert cli.main(["qc", "dummy", VIDEO, "short_script"]) == 0
    channels.approve_stage(channel, VIDEO, "short_script")
    log.append("G2 short_script: refused (quiz board), qc pass -> approved")

    # G3 narration: claims + clicks on narration.wav
    wav, words = media("good", folder=folder / "narration")
    wav.rename(folder / "narration" / "narration.wav")
    words.rename(folder / "narration" / "words.json")
    _awaiting(channel, "narration")
    assert cli.main(["qc", "dummy", VIDEO, "narration"]) == 0
    channels.approve_stage(channel, VIDEO, "narration")
    log.append("G3 narration: qc pass (claims, clicks) -> approved")

    # G4 rough cut (no automated checks)
    _awaiting(channel, "rough_cut")
    channels.approve_stage(channel, VIDEO, "rough_cut")
    log.append("G4 rough_cut: approved")

    # G5 final edit: a too-loud render with no fade-out tail is refused, the fixed one passes
    renders = folder / "renders"
    loud, _ = media("loud", container="mp4", folder=renders / "loud")
    _awaiting(channel, "final_edit")
    assert cli.main(["qc", "dummy", VIDEO, "final_edit", "--media", str(loud)]) == 1
    with pytest.raises(ChannelError, match="loudness: too loud"):
        channels.approve_stage(channel, VIDEO, "final_edit")
    good, _ = media("good", container="mp4", folder=renders)
    assert cli.main(["qc", "dummy", VIDEO, "final_edit", "--media", str(good)]) == 0
    channels.approve_stage(channel, VIDEO, "final_edit")
    log.append("G5 final_edit: too-loud render refused; fixed render qc pass -> approved")

    # G6 final watch: checks pass, checkpoint awaits the owner, and nothing goes past it
    assert cli.main(["qc", "dummy", VIDEO, "final_watch", "--media", str(good)]) == 0
    _awaiting(channel, "final_watch")
    assert _status(channel, "final_watch") == "awaiting_human"
    with pytest.raises(CheckpointValidationError):
        _awaiting(channel, "publish_prep")
    assert read_checkpoint(channel.videos_dir, VIDEO, "publish_prep") is None
    log.append("G6 final_watch: qc pass, awaiting_human; publish_prep refused (G6 not approved). STOP")

    out = capsys.readouterr().out
    assert re.search(r"\[FAIL\] loudness .*\n\s+- too loud", out)
    print("\n" + "\n".join(log))
    summary = channels.video_summaries(channel)[0]
    assert summary["awaiting"] == ["final_watch"]
