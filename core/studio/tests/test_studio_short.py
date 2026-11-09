"""Phase 4: the studio-short pipeline, its skills, and an end-to-end run on a dummy channel up to (not past) G6."""

from __future__ import annotations

import re
import shutil
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
    write_checkpoint(
        channel.videos_dir,
        VIDEO,
        stage,
        "awaiting_human",
        artifacts or {},
        pipeline_type="studio-short",
        checkpoint_policy="manual_all",
        human_approval_required=True,
    )


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


_SNAPSHOT_PARTS = ("root", "config", "approval-key")


def _point_snapshot_env(base, mp):
    """Everything the walk writes stays under `base`: never the owner's key, config, timings or ledger."""
    mp.setenv("OMNI_STUDIO_APPROVAL_KEY", str(base / "approval-key" / "approval.key"))
    mp.setenv("OMNI_JOBS_TIMINGS", str(base / "timings.jsonl"))
    mp.setenv("OMNI_ROOM_LEDGER", str(base / "ledger.sqlite"))


@pytest.fixture(scope="module")
def _g6_snapshot(tmp_path_factory, _media_cache, studio_helpers):
    """One walk to G6 per worker, saved. The walk's own refusals are asserted by
    test_studio_short_end_to_end_up_to_g6, which walks for itself; tests that only need the state after the walk
    get a fresh copy of it (`walked_to_g6`)."""
    base = tmp_path_factory.mktemp("g6-walk")
    mp = pytest.MonkeyPatch()
    try:
        _point_snapshot_env(base, mp)
        make = studio_helpers.studio_root_at(base, mp)
        _, folder, good = _walk_to_g6(make, studio_helpers.copying_media(_media_cache, base), [])
    finally:
        mp.undo()
    (base / "snapshot").mkdir()
    for part in _SNAPSHOT_PARTS:
        if (base / part).exists():  # the walk makes no config folder; a part it never made is absent again
            shutil.copytree(base / part, base / "snapshot" / part, symlinks=True)
    return base, folder.relative_to(base / "root"), good.relative_to(base / "root")


@pytest.fixture()
def walked_to_g6(_g6_snapshot, monkeypatch, studio_helpers):
    """(channel, folder, good) exactly as _walk_to_g6 leaves them, restored into the same folder the walk ran in.

    Same folder because approvals sign a media file's absolute path when it is outside the repo; the key is the
    walk's own (the autouse per-test key would not verify its proofs)."""
    base, folder, good = _g6_snapshot
    for part in _SNAPSHOT_PARTS:
        shutil.rmtree(base / part, ignore_errors=True)
        if (base / "snapshot" / part).exists():
            shutil.copytree(base / "snapshot" / part, base / part, symlinks=True)
    _point_snapshot_env(base, monkeypatch)
    studio_helpers.point_at_root(base, monkeypatch)
    return channels.load_channel("dummy"), base / "root" / folder, base / "root" / good


# One snapshot per run: these share a worker under xdist (--dist loadgroup) instead of each walking to G6.
g6_group = pytest.mark.xdist_group("g6_walk")


@pytest.mark.slow  # walks a Short through every stage, running the ffmpeg checks on real media
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

import yaml  # noqa: E402

from studio.publish import youtube  # noqa: E402


def _upload_yaml(folder, render, **extra):
    (folder / "upload.yaml").write_text(
        yaml.safe_dump(
            {
                "file": str(render.relative_to(folder)),
                "title": "Why We Yawn",
                "description": "https://example.org/yawn",
                "tags": ["science"],
                **extra,
            }
        )
    )


@g6_group
@pytest.mark.slow  # re-runs the publish checks (ffmpeg) on two media files
def test_publish_binds_qc_approval_and_upload_to_one_file(walked_to_g6, media, capsys):
    log = []
    channel, folder, good = walked_to_g6
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


def _legacy_video(channel, media, **extra):
    folder = channel.videos_dir / "2026-10-31_old-short"
    (folder / "narration").mkdir(parents=True)
    (folder / "script.md").write_text(SCRIPT)
    (folder / "claims.md").write_text(CLAIMS)
    render, words = media("good", container="mp4", folder=folder / "renders")
    words.rename(folder / "narration" / "words.json")
    _upload_yaml(folder, render, **extra)
    return folder, render


@pytest.mark.slow  # runs the publish_prep checks (ffmpeg) on a real media file
def test_approve_upload_for_a_video_with_no_pipeline(studio_root, media):
    channel = studio_root("dummy")
    folder, render = _legacy_video(channel, media, legacy_upload=True)
    with pytest.raises(ChannelError, match="no upload_approval.json"):
        checks.approved_upload_media(channel, folder.name)
    path = checks.approve_upload("dummy", folder.name, "short", "owner, test only")
    record = checks.approved_upload_media(channel, folder.name)
    assert record["sha256"] == checks._sha256(render) and record["metadata_sha256"]
    assert youtube.approved_media_problems(youtube.build_request("dummy", folder.name)) == []

    forged = json.loads(path.read_text())
    forged["media"]["sha256"] = "0" * 64
    path.write_text(json.dumps(forged))
    with pytest.raises(ChannelError, match="was not made by `omni approve`"):
        checks.approved_upload_media(channel, folder.name)

    loud, _ = media("loud", container="mp4", folder=folder / "renders" / "loud")
    _upload_yaml(folder, loud, legacy_upload=True)
    with pytest.raises(ChannelError, match="loudness: too loud"):
        checks.approve_upload("dummy", folder.name, "short")


def test_approve_upload_refuses_a_pipeline_project(studio_root):
    channel = studio_root("dummy")
    channels.new_video(channel, "Why We Yawn", "short", on=date(2026, 11, 6))
    with pytest.raises(ChannelError, match="approve publish_prep with omni approve"):
        checks.approve_upload("dummy", VIDEO, "short")


# --- review fixes (cross-vendor review of PR #5): planted faults ---


def test_planted_no_legacy_marker_refuses_approve_upload(studio_root, media):
    """approve-upload is never inferred from a missing project.json: the video must say legacy_upload: true."""
    channel = studio_root("dummy")
    folder, _ = _legacy_video(channel, media)
    with pytest.raises(ChannelError, match="legacy_upload: true"):
        checks.approve_upload("dummy", folder.name, "short")
    with pytest.raises(ChannelError, match=r"publish_prep \(G7\).*is not approved"):
        checks.approved_upload_media(channel, folder.name)
    assert not (folder / checks.UPLOAD_APPROVAL).exists()


@g6_group
def test_planted_deleted_project_json_does_not_open_approve_upload(walked_to_g6):
    """Deleting project.json while checkpoints exist must not let approve-upload skip G1-G7, marker or not."""
    channel, folder, good = walked_to_g6
    (folder / "project.json").unlink()
    _upload_yaml(folder, good, legacy_upload=True)
    with pytest.raises(ChannelError, match=r"has pipeline state \(checkpoint_"):
        checks.approve_upload("dummy", VIDEO, "short")
    with pytest.raises(ChannelError, match=r"publish_prep \(G7\)"):
        checks.approved_upload_media(channel, VIDEO)
    # history copies alone still count as pipeline state
    for cp in folder.glob("checkpoint_*.json"):
        cp.unlink()
    assert any("checkpoint_" in p for p in checks.pipeline_state(folder))
    with pytest.raises(ChannelError, match="has pipeline state"):
        checks.approve_upload("dummy", VIDEO, "short")


def _approve_g6_then_qc(walked):
    channel, folder, good = walked
    channels.approve_stage(channel, VIDEO, "final_watch", "dummy owner, test only")
    _upload_yaml(folder, good)
    return channel, folder, good


def _deliverable(channel, folder, good):
    return checks._deliverable_check(channel, VIDEO, good.resolve())


@g6_group
def test_planted_g6_media_proof_stripped_fails_the_deliverable_check(walked_to_g6):
    channel, folder, good = _approve_g6_then_qc(walked_to_g6)
    assert _deliverable(channel, folder, good)["ok"]
    path = folder / "checkpoint_final_watch.json"
    data = json.loads(path.read_text())
    del data["metadata"]["approval"]["media"]
    path.write_text(json.dumps(data))
    result = _deliverable(channel, folder, good)
    assert not result["ok"] and "final_watch approval is invalid" in result["problems"][0]
    # the stage proof itself no longer verifies, so OpenMontage also treats G6 as unapproved
    from lib import studio_approval

    with pytest.raises(studio_approval.ApprovalRefused, match="approval.media"):
        studio_approval.verify(VIDEO, "final_watch", data["pipeline_type"], data["artifacts"], data["metadata"])
    assert cli.main(["qc", "dummy", VIDEO, "publish_prep"]) == 1


@g6_group
def test_planted_g6_media_proof_edited_fails_the_deliverable_check(walked_to_g6):
    channel, folder, good = _approve_g6_then_qc(walked_to_g6)
    path = folder / "checkpoint_final_watch.json"
    data = json.loads(path.read_text())
    data["metadata"]["approval"]["media"]["sha256"] = checks._sha256(good).replace(
        checks._sha256(good)[0], "f" if checks._sha256(good)[0] != "f" else "e", 1
    )
    path.write_text(json.dumps(data))
    result = _deliverable(channel, folder, good)
    assert not result["ok"] and "final_watch approval is invalid" in result["problems"][0]


def _resign_final_watch(folder, media_record):
    """Re-sign the stage proof (the test holds the key) around a chosen media record."""
    from lib import studio_approval

    path = folder / "checkpoint_final_watch.json"
    data = json.loads(path.read_text())
    approval = data["metadata"]["approval"]
    if media_record is None:
        approval.pop("media", None)
    else:
        approval["media"] = media_record
    approval["proof"] = studio_approval.sign(
        VIDEO, "final_watch", data["pipeline_type"], data["artifacts"], approval["at"], media_record
    )
    path.write_text(json.dumps(data))
    return approval


@g6_group
def test_planted_g6_without_media_proof_fails_as_missing(walked_to_g6):
    """An approval with a valid stage proof but no media record (e.g. approved before media binding) fails."""
    channel, folder, good = _approve_g6_then_qc(walked_to_g6)
    _resign_final_watch(folder, None)
    result = _deliverable(channel, folder, good)
    assert not result["ok"] and "no media proof (missing)" in result["problems"][0]


@g6_group
def test_planted_g6_forged_media_proof_fails_as_forged(walked_to_g6):
    channel, folder, good = _approve_g6_then_qc(walked_to_g6)
    record = json.loads((folder / "checkpoint_final_watch.json").read_text())["metadata"]["approval"]["media"]
    _resign_final_watch(folder, {**record, "proof": "0" * 64})
    result = _deliverable(channel, folder, good)
    assert not result["ok"] and "media proof is forged or edited" in result["problems"][0]


@g6_group
def test_planted_g6_not_approved_fails_the_deliverable_check(walked_to_g6):
    channel, folder, good = walked_to_g6
    _upload_yaml(folder, good)
    result = _deliverable(channel, folder, good)
    assert not result["ok"] and "G6: final_watch is not approved" in result["problems"][0]


def test_planted_metadata_changed_after_approval_is_refused(studio_root, media):
    channel = studio_root("dummy")
    # the owner's test-upload flow: set the [TEST] title BEFORE approve-upload, and it uploads as approved
    folder, render = _legacy_video(channel, media, legacy_upload=True, title="[TEST] Why We Yawn")
    checks.approve_upload("dummy", folder.name, "short", "owner, test only")
    req = youtube.build_request("dummy", folder.name)
    assert req.metadata["title"] == "[TEST] Why We Yawn" and youtube.approved_media_problems(req) == []
    for change in (
        {"title": "Why We Yawn"},
        {"tags": ["science", "extra"]},
        {"description": "new"},
        {"contains_synthetic_media": True},
        {"language": "hi"},
        {"category_id": "22"},
    ):
        data = {"title": "[TEST] Why We Yawn", **change}
        _upload_yaml(folder, render, legacy_upload=True, **data)
        problems = youtube.approved_media_problems(youtube.build_request("dummy", folder.name))
        assert any("metadata" in p and "changed after approval" in p for p in problems), change
    _upload_yaml(folder, render, legacy_upload=True, title="[TEST] Why We Yawn")
    assert youtube.approved_media_problems(youtube.build_request("dummy", folder.name)) == []


def test_planted_approval_without_metadata_digest_is_refused(studio_root, media):
    from lib import studio_approval

    channel = studio_root("dummy")
    folder, render = _legacy_video(channel, media, legacy_upload=True)
    path = checks.approve_upload("dummy", folder.name, "short", "owner, test only")
    data = json.loads(path.read_text())
    m = data["media"]
    del m["metadata_sha256"]
    m["proof"] = studio_approval.sign_media(folder.name, checks.LEGACY_UPLOAD_STAGE, m["media"], m["sha256"], m["at"])
    path.write_text(json.dumps(data))
    problems = youtube.approved_media_problems(youtube.build_request("dummy", folder.name))
    assert any("signs no upload metadata digest" in p for p in problems)


def test_tails_short_is_marked_legacy_upload():
    tails = REAL_ROOT / "channels" / "professor-of-us" / "videos" / "2026-10-31_tails"
    assert checks.legacy_upload(tails) and checks.pipeline_state(tails) == []
