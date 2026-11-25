"""The studio-whatif pipeline (Say Suppose): five owner gates, its skills, its checks, and the script gate on a dummy channel."""

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
STAGES = ["proposal", "story_script", "final_edit", "final_watch", "publish_prep"]  # G1-G5 (spec 2026-11-10)
LOUDNESS = {"story": {"integrated_lufs": -14, "tolerance_lu": 1, "true_peak_dbtp_max": -1, "lra_lu_max": 11}}


def test_studio_whatif_has_five_owner_gates_and_its_skills():
    manifest = load_pipeline_readonly("studio-whatif")
    assert [s["name"] for s in manifest["stages"]] == STAGES
    assert all(s["human_approval_default"] is True for s in manifest["stages"])
    assert len(manifest["required_skills"]) == 6
    for skill in manifest["required_skills"]:
        assert (OM / "skills" / f"{skill}.md").is_file(), skill


def test_studio_whatif_checks_per_gate():
    assert checks.stage_checks("studio-whatif", "proposal") == []
    assert checks.stage_checks("studio-whatif", "story_script") == [
        "claims",
        "clicks",
    ]  # story lock: script + narration
    for stage in ("final_edit", "final_watch"):
        assert checks.stage_checks("studio-whatif", stage) == ["loudness", "clicks", "similarity"]
    assert checks.stage_checks("studio-whatif", "publish_prep") == [
        "claims",
        "loudness",
        "clicks",
        "similarity",
        "upload_request",
    ]
    # The opening's timing is judged film by film (owner, 2026-11-15): reported, never blocking.
    for stage in ("final_edit", "final_watch", "publish_prep"):
        assert checks.stage_warnings("studio-whatif", stage) == ["opening"]
    assert checks.stage_warnings("studio-whatif", "story_script") == []


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
    # The paid narrator is Luc (owner, 2026-11-25: "go ahead with Luc."); Arthur was rejected the day before.
    assert voices["narrator"]["voice_id"] == "04e867c7-9e41-5cff-80d3-5284e74d7bd1"


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
    write_checkpoint(
        channel.videos_dir,
        video,
        stage,
        "awaiting_human",
        artifacts or {},
        pipeline_type="studio-whatif",
        checkpoint_policy="manual_all",
        human_approval_required=True,
    )


def _quiet_narration(folder):
    import wave

    (folder / "narration").mkdir(exist_ok=True)
    with wave.open(str(folder / "narration" / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(48000)
        w.writeframes(b"\x00\x00" * 48000)


def test_story_script_gate_wants_cited_digits_and_lets_story_numbers_in_words_pass(studio_root):
    channel = studio_root("dummy", formats={"story": "studio-whatif"}, loudness=LOUDNESS)
    folder = channels.new_video(channel, "Pause Time", "story", on=date(2026, 11, 6))
    video = folder.name
    _awaiting(channel, video, "proposal", {"proposal_packet": sample_artifact("proposal_packet")})
    channels.approve_stage(channel, video, "proposal", "dummy owner, test only")

    (folder / "script.md").write_text(SCRIPT.format(cite=""))
    (folder / "claims.md").write_text(CLAIMS)
    _quiet_narration(folder)  # story lock carries the local narration, which the clicks check reads
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


def test_story_lock_checks_the_local_narration_for_clicks(tmp_path, monkeypatch):
    """At story_script the clicks check reads narration/narration.wav, as the narration stage did."""
    seen = {}
    folder = tmp_path / "v"
    (folder / "narration").mkdir(parents=True)
    monkeypatch.setattr(checks.channels, "load_channel", lambda slug: object())
    monkeypatch.setattr(checks.channels, "video_dir", lambda ch, vid: folder)
    monkeypatch.setattr(checks, "project_identity", lambda ch, vid, fmt: ("story", "studio-whatif"))
    monkeypatch.setattr(
        checks, "run_check", lambda n, ch, vid, fmt, pipe, media, words: seen.setdefault(n, media) and {"ok": True}
    )
    checks.run_stage("say-suppose", "v", "story_script", write=False)
    assert seen["clicks"] == (folder / "narration" / "narration.wav").resolve()


# --- the opening is a warning, not a gate (owner, 2026-11-15) ---

LATE_OPENING = {"check": "opening", "ok": False, "problems": ["first word comes at 4.4 s (want within 1 s)"]}


def _all_pass_but_opening(name, *args):
    return dict(LATE_OPENING) if name == "opening" else {"check": name, "ok": True, "problems": []}


def _at_final_edit(studio_root, monkeypatch, run_check):
    """A dummy what-if video with G1 and G2 passed and final_edit awaiting the owner; returns (channel, video,
    render)."""
    channel = studio_root("dummy", formats={"story": "studio-whatif"}, loudness=LOUDNESS)
    folder = channels.new_video(channel, "Cold Open", "story", on=date(2026, 11, 15))
    video = folder.name
    monkeypatch.setattr(checks, "run_check", run_check)
    _awaiting(channel, video, "proposal", {"proposal_packet": sample_artifact("proposal_packet")})
    channels.approve_stage(channel, video, "proposal", "dummy owner, test only")
    _quiet_narration(folder)
    _awaiting(channel, video, "story_script")
    assert cli.main(["qc", "dummy", video, "story_script"]) == 0
    channels.approve_stage(channel, video, "story_script", "dummy owner, test only")
    render = folder / "render.mp4"
    render.write_bytes(b"dummy render, test only")
    _awaiting(channel, video, "final_edit")
    return channel, video, render


def test_failing_opening_warns_in_qc_and_approve_still_signs(studio_root, monkeypatch, capsys):
    channel, video, render = _at_final_edit(studio_root, monkeypatch, _all_pass_but_opening)
    folder = channels.video_dir(channel, video)
    capsys.readouterr()

    assert cli.main(["qc", "dummy", video, "final_edit", "--media", str(render)]) == 0
    out = capsys.readouterr().out
    assert "[WARN] opening" in out and "first word comes at 4.4 s" in out and "  ok" in out
    report = yaml.safe_load((folder / "qc" / "final_edit.json").read_text())
    assert report["ok"] is True
    assert next(r for r in report["checks"] if r["check"] == "opening")["warning"] is True

    channels.approve_stage(channel, video, "final_edit", "dummy owner, test only")
    assert read_checkpoint(channel.videos_dir, video, "final_edit")["status"] == "completed"
    assert "warning (does not block the gate): opening: first word comes at 4.4 s" in capsys.readouterr().err


def test_a_failing_blocking_check_still_refuses_beside_a_warning(studio_root, monkeypatch):
    def loud(name, *args):
        if name == "loudness":
            return {"check": name, "ok": False, "problems": ["too loud"]}
        return _all_pass_but_opening(name, *args)

    channel, video, render = _at_final_edit(studio_root, monkeypatch, loud)
    assert cli.main(["qc", "dummy", video, "final_edit", "--media", str(render)]) == 1
    with pytest.raises(ChannelError, match="loudness: too loud") as err:
        channels.approve_stage(channel, video, "final_edit")
    assert "opening" not in str(err.value)


def test_a_check_cannot_be_both_blocking_and_a_warning(monkeypatch):
    monkeypatch.setattr(checks, "_named_checks", lambda pipeline, stage, key: ["opening"])
    with pytest.raises(ChannelError, match="both a check and a warning"):
        checks.stage_warnings("studio-whatif", "final_edit")
