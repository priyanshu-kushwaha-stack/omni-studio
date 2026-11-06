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


def _walk_to_g6(studio_root, media, log):
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

    return channel, folder, good


def test_studio_short_end_to_end_up_to_g6(studio_root, media, capsys):
    log = []
    channel, _, _ = _walk_to_g6(studio_root, media, log)
    out = capsys.readouterr().out
    assert re.search(r"\[FAIL\] loudness .*\n\s+- too loud", out)
    print("\n" + "\n".join(log))
    summary = channels.video_summaries(channel)[0]
    assert summary["awaiting"] == ["final_watch"]


# --- G7: the checks, the approval and the upload are bound to one file ---

import json  # noqa: E402
import shutil  # noqa: E402

import yaml  # noqa: E402

from studio.publish import youtube  # noqa: E402


def _upload_yaml(folder, render):
    (folder / "upload.yaml").write_text(yaml.safe_dump({
        "file": str(render.relative_to(folder)), "title": "Why We Yawn", "description": "https://example.org/yawn",
        "tags": ["science"]}))


def test_publish_binds_qc_approval_and_upload_to_one_file(studio_root, media, capsys):
    log = []
    channel, folder, good = _walk_to_g6(studio_root, media, log)
    channels.approve_stage(channel, VIDEO, "final_watch", "dummy owner, test only")
    other, _ = media("good", container="mp4", pattern="mandelbrot", folder=folder / "renders" / "other")
    _awaiting(channel, "publish_prep")

    # qc on a clean file that is not the one upload.yaml uploads: refused at qc and at approval
    _upload_yaml(folder, good)
    assert cli.main(["qc", "dummy", VIDEO, "publish_prep", "--media", str(other)]) == 1
    with pytest.raises(ChannelError, match="but upload.yaml uploads"):
        channels.approve_stage(channel, VIDEO, "publish_prep")
    log.append("G7: qc on another file than upload.yaml's: refused")

    # upload.yaml pointing at a render the owner did not watch at G6: refused
    _upload_yaml(folder, other)
    assert cli.main(["qc", "dummy", VIDEO, "publish_prep"]) == 1
    with pytest.raises(ChannelError, match="not the render the owner approved at final_watch"):
        channels.approve_stage(channel, VIDEO, "publish_prep")
    log.append("G7: upload.yaml names a render not approved at G6: refused")

    # the right file, but its content changes between qc and approval: refused
    _upload_yaml(folder, good)
    backup = good.with_suffix(".bak")
    shutil.copy(good, backup)
    assert cli.main(["qc", "dummy", VIDEO, "publish_prep"]) == 0
    shutil.copy(other, good)
    with pytest.raises(ChannelError, match="changed .*since omni qc"):
        channels.approve_stage(channel, VIDEO, "publish_prep")
    shutil.copy(backup, good)
    log.append("G7: content changed between qc and approval: refused")

    assert cli.main(["qc", "dummy", VIDEO, "publish_prep"]) == 0
    channels.approve_stage(channel, VIDEO, "publish_prep", "dummy owner, test only")
    approval = read_checkpoint(channel.videos_dir, VIDEO, "publish_prep")["metadata"]["approval"]
    assert approval["media"]["sha256"] == checks._sha256(good) and approval["media"]["proof"]
    req = youtube.build_request("dummy", VIDEO)
    assert youtube.approved_media_problems(req) == []
    log.append("G7: qc pass on upload.yaml's file -> approved, sha256 signed into the approval")

    # after approval: cross-file swap in upload.yaml, then same path with new content
    _upload_yaml(folder, other)
    swapped = youtube.approved_media_problems(youtube.build_request("dummy", VIDEO))
    assert any("but the approval covers" in p for p in swapped)
    _upload_yaml(folder, good)
    shutil.copy(other, good)
    changed = youtube.approved_media_problems(youtube.build_request("dummy", VIDEO))
    assert any("the file changed after approval" in p for p in changed)
    log.append("upload: cross-file swap after approval refused; same path, new content refused")

    # and the real run refuses before the binary runs
    calls = []
    youtube.client_secret_path().parent.mkdir(parents=True, exist_ok=True)
    youtube.client_secret_path().write_text("{}")
    req = youtube.build_request("dummy", VIDEO)
    req.token.write_text("{}")
    import studio.publish.youtube as yt

    yt_verify = yt.verify_binary
    yt.verify_binary = lambda: []
    try:
        with pytest.raises(youtube.UploadRefused, match="changed after approval"):
            youtube.run(req, f"dummy/{VIDEO}", api=object(), runner=lambda *a, **k: calls.append(a))
    finally:
        yt.verify_binary = yt_verify
    assert calls == []
    shutil.copy(backup, good)
    assert youtube.approved_media_problems(youtube.build_request("dummy", VIDEO)) == []
    log.append("upload --run: refused before the uploader ran; restored file matches again")
    print("\n" + "\n".join(log))


def test_approve_upload_for_a_video_with_no_pipeline(studio_root, media):
    channel = studio_root("dummy")
    folder = channel.videos_dir / "2026-10-31_old-short"
    (folder / "narration").mkdir(parents=True)
    (folder / "script.md").write_text(SCRIPT)
    (folder / "claims.md").write_text(CLAIMS)
    render, words = media("good", container="mp4", folder=folder / "renders")
    words.rename(folder / "narration" / "words.json")
    _upload_yaml(folder, render)
    with pytest.raises(ChannelError, match="no upload_approval.json"):
        checks.approved_upload_media(channel, folder.name)
    path = checks.approve_upload("dummy", folder.name, "short", "owner, test only")
    record = checks.approved_upload_media(channel, folder.name)
    assert record["sha256"] == checks._sha256(render)
    assert youtube.approved_media_problems(youtube.build_request("dummy", folder.name)) == []

    forged = json.loads(path.read_text())
    forged["media"]["sha256"] = "0" * 64
    path.write_text(json.dumps(forged))
    with pytest.raises(ChannelError, match="was not made by `omni approve`"):
        checks.approved_upload_media(channel, folder.name)

    loud, _ = media("loud", container="mp4", folder=folder / "renders" / "loud")
    _upload_yaml(folder, loud)
    with pytest.raises(ChannelError, match="loudness: too loud"):
        checks.approve_upload("dummy", folder.name, "short")


def test_approve_upload_refuses_a_pipeline_project(studio_root):
    channel = studio_root("dummy")
    channels.new_video(channel, "Why We Yawn", "short", on=date(2026, 11, 6))
    with pytest.raises(ChannelError, match="approve publish_prep with omni approve"):
        checks.approve_upload("dummy", VIDEO, "short")
