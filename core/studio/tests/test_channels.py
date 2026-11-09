"""Phase 2 channel layer: validation, scaffolding, budgets, gates, boards, isolation."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import urllib.request
from datetime import date
from pathlib import Path

import pytest
import yaml
from PIL import Image

import styles.playbook_loader as playbook_loader
from lib.checkpoint import CheckpointValidationError, read_checkpoint, write_checkpoint
from studio import channels, cli
from studio.channels import ChannelError
from tests.contracts.test_phase0_contracts import sample_artifact
from tools.cost_tracker import BudgetExceededError
from tools.video.video_compose import VideoCompose

REAL_ROOT = Path(__file__).resolve().parents[3]
SMOKE = {"smoke": "framework-smoke"}


@pytest.fixture()
def studio_root(tmp_path, monkeypatch):
    """A throwaway root holding the real template. No channel touches the real repo."""
    root = tmp_path / "root"
    shutil.copytree(REAL_ROOT / "channels" / "_template", root / "channels" / "_template")
    styles = root / "core" / "openmontage" / "styles"
    styles.mkdir(parents=True)
    monkeypatch.setattr(channels, "ROOT", root)
    monkeypatch.setattr(playbook_loader, "STYLES_DIR", styles)
    return root


def edit_channel(channel_dir: Path, **fields) -> None:
    path = channel_dir / "channel.yaml"
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    data.update(fields)
    path.write_text(yaml.safe_dump(data), encoding="utf-8")


def smoke_channel(slug: str, budget: float) -> channels.Channel:
    channel = channels.create_channel(slug)
    edit_channel(channel.dir, formats=SMOKE, budget_usd_per_video=budget)
    return channels.load_channel(slug)


# --- channel.yaml validation ---


BAD_VALUES = {
    "bad_status": ({"status": "archived"}, "status"),
    "bad_risk": ({"risk_class": "D"}, "risk_class"),
    "kids_is_a_string": ({"made_for_kids": "no"}, "made_for_kids"),
    "empty_formats": ({"formats": {}}, "formats"),
    "unknown_pipeline": ({"formats": {"x": "no-such-pipeline"}}, "formats.x"),
    "negative_budget": ({"budget_usd_per_video": -1}, "budget_usd_per_video"),
    "budget_is_a_string": ({"budget_usd_per_video": "5"}, "budget_usd_per_video"),
    "budget_is_a_bool": ({"budget_usd_per_video": True}, "budget_usd_per_video"),
    "bad_cadence": ({"cadence": "sometimes"}, "cadence"),
    "bad_review_level": ({"review_level": "none"}, "review_level"),
    "bad_youtube_id": ({"youtube_channel_id": "abc"}, "youtube_channel_id"),
    "token_in_repo": ({"upload_token_path": "channels/x/token.json"}, "upload_token_path"),
    "token_escapes": ({"upload_token_path": "~/.config/omni-studio/../x"}, "upload_token_path"),
    "music_not_allowed": ({"music": {"default": "a.mp3", "allowed": []}}, "music.default"),
    "music_unknown_key": ({"music": {"default": None, "allowed": [], "x": 1}}, "music.x"),
    "missing_voices_file": ({"voices": "absent.yaml"}, "voices"),
    "voices_outside": ({"voices": "../../x.yaml"}, "voices"),
    "unknown_playbook": ({"playbook": "no-such-playbook"}, "playbook"),
    "wrong_id": ({"id": "other"}, "id"),
    "id_with_number": ({"id": "chan1"}, "id"),
    "unknown_field": ({"surprise": 1}, "surprise"),
    "testing_needs_youtube": ({"status": "testing"}, "youtube_channel_id"),
    "live_needs_token": (
        {"status": "live", "youtube_channel_id": "UC" + "a" * 22},
        "upload_token_path",
    ),
}


@pytest.mark.parametrize("name", sorted(BAD_VALUES))
def test_bad_channel_yaml_fails_naming_the_file_and_field(studio_root, name):
    fields, field = BAD_VALUES[name]
    channel = channels.create_channel("sample")
    edit_channel(channel.dir, **fields)
    with pytest.raises(ChannelError) as exc:
        channels.load_channel("sample")
    assert "channel.yaml" in str(exc.value)
    assert field in str(exc.value)


@pytest.mark.parametrize("field", sorted(channels.ChannelConfig.model_fields))
def test_every_channel_field_is_required(studio_root, field):
    channel = channels.create_channel("sample")
    path = channel.dir / "channel.yaml"
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    del data[field]
    path.write_text(yaml.safe_dump(data), encoding="utf-8")
    with pytest.raises(ChannelError) as exc:
        channels.load_channel("sample")
    assert field in str(exc.value)


def test_every_problem_is_listed_at_once(studio_root):
    channel = channels.create_channel("sample")
    edit_channel(channel.dir, status="nope", risk_class="Z", surprise=1)
    with pytest.raises(ChannelError) as exc:
        channels.load_channel("sample")
    for field in ("status", "risk_class", "surprise: unknown field"):
        assert field in str(exc.value)


@pytest.mark.parametrize(
    "content, problem",
    [("id: [\n", "not valid YAML"), ("- a\n", "must be a mapping")],
)
def test_unparseable_channel_yaml_fails_clearly(studio_root, content, problem):
    channel = channels.create_channel("sample")
    (channel.dir / "channel.yaml").write_text(content, encoding="utf-8")
    with pytest.raises(ChannelError, match=problem):
        channels.load_channel("sample")


def test_missing_channel_fails_clearly(studio_root):
    with pytest.raises(ChannelError, match="No channel 'absent'"):
        channels.load_channel("absent")


def test_live_channel_with_everything_loads(studio_root):
    channel = channels.create_channel("sample")
    edit_channel(
        channel.dir,
        status="live",
        youtube_channel_id="UC" + "a" * 22,
        upload_token_path="~/.config/omni-studio/youtube/sample.token",
        music={"default": "a.mp3", "allowed": ["a.mp3"]},
    )
    assert channels.load_channel("sample").config.status == "live"


# --- new-channel ---


@pytest.mark.parametrize("slug", ["Upper", "chan1", "with_underscore", "-x", "x-", "a--b", "", "../x"])
def test_new_channel_rejects_slugs_that_are_not_plain(studio_root, slug):
    with pytest.raises(ChannelError, match="Bad channel slug"):
        channels.create_channel(slug)
    assert channels.list_slugs() == []


def test_new_channel_scaffolds_the_planned_files(studio_root):
    channel = channels.create_channel("sample")
    for name in ("channel.yaml", "playbook.yaml", "style.md", "cast.md", "voices.yaml"):
        assert (channel.dir / name).is_file(), name
    for name in ("rules", "rigs", "lora", "backlog", "analytics", "videos"):
        assert (channel.dir / name).is_dir(), name
    for path in channel.dir.rglob("*"):
        if path.is_file():
            assert "__SLUG__" not in path.read_text(encoding="utf-8"), path
    assert channel.config.id == "sample" and channel.config.playbook == "sample"
    assert channels.list_slugs() == ["sample"]  # _template is not a channel


def test_new_channel_refuses_an_existing_channel(studio_root):
    channels.create_channel("sample")
    with pytest.raises(ChannelError, match="already exists"):
        channels.create_channel("sample")


def test_new_channel_refuses_a_slug_a_preset_playbook_would_shadow(studio_root):
    preset = playbook_loader.STYLES_DIR / "taken.yaml"
    preset.write_text("identity: {}\n", encoding="utf-8")
    with pytest.raises(ChannelError, match="playbook named 'taken'"):
        channels.create_channel("taken")
    assert not (channels.channels_dir() / "taken").exists()


def test_new_channel_rolls_back_when_the_template_is_invalid(studio_root):
    template = channels.channels_dir() / "_template" / "playbook.yaml"
    template.write_text("identity: {}\n", encoding="utf-8")
    with pytest.raises(ChannelError, match="playbook"):
        channels.create_channel("sample")
    assert not (channels.channels_dir() / "sample").exists()
    assert not (channels.custom_styles_dir() / "sample.yaml").is_symlink()


def test_playbook_symlink_has_the_exact_relative_target_and_resolves(studio_root):
    channel = channels.create_channel("sample")
    link = channels.custom_styles_dir() / "sample.yaml"
    assert link.is_symlink()
    assert os.readlink(link) == "../../../../channels/sample/playbook.yaml"
    assert link.resolve() == (channel.dir / "playbook.yaml").resolve()
    assert playbook_loader.load_playbook("sample")["identity"]["name"] == "sample"
    assert "sample" in playbook_loader.list_playbooks()


def test_dangling_playbook_link_fails_channel_validation(studio_root):
    channel = channels.create_channel("sample")
    (channel.dir / "playbook.yaml").unlink()
    with pytest.raises(ChannelError, match="does not load by name"):
        channels.load_channel("sample")


@pytest.mark.xdist_group("real_channels")  # adds a real channel for a moment; see test_phase1's pytestmark
def test_playbook_symlink_works_in_the_real_tree_through_the_cli(monkeypatch):
    """No fixture: the real repo layout, the default styles dir and the real CLI."""
    slug = "throwaway-link-test"
    target = REAL_ROOT / "channels" / slug
    link = REAL_ROOT / "core" / "openmontage" / "styles" / "custom" / f"{slug}.yaml"
    assert not target.exists() and not link.is_symlink()
    custom_existed = link.parent.exists()
    try:
        assert cli.main(["new-channel", slug]) == 0
        assert os.readlink(link) == f"../../../../channels/{slug}/playbook.yaml"
        assert link.resolve() == (target / "playbook.yaml").resolve()
        assert playbook_loader.load_playbook(slug)["identity"]["name"] == slug
    finally:
        link.unlink(missing_ok=True)
        shutil.rmtree(target, ignore_errors=True)
        if not custom_existed and link.parent.exists():
            link.parent.rmdir()


def test_make_new_channel_needs_a_slug_and_is_not_a_stub():
    env = {k: v for k, v in os.environ.items() if k not in {"MAKEFLAGS", "MFLAGS"}}
    proc = subprocess.run(
        ["make", "new-channel"], cwd=REAL_ROOT, capture_output=True, text=True, env=env, timeout=30
    )
    assert proc.returncode != 0
    assert "usage: make new-channel SLUG=<slug>" in proc.stderr
    assert "Phase 2" not in proc.stderr


# --- new-video and project folders ---


def test_new_video_uses_the_channels_folder_and_openmontage_layout(studio_root):
    channel = smoke_channel("sample", 3)
    project = channels.new_video(channel, "Why We Dream!", "smoke", on=date(2026, 11, 5))
    assert project == channel.videos_dir / "2026-11-05_why-we-dream"
    assert channel.env == {"OPENMONTAGE_PROJECTS_DIR": str(channel.videos_dir)}
    for sub in ("artifacts", "assets/images", "renders"):
        assert (project / sub).is_dir()
    marker = json.loads((project / "project.json").read_text(encoding="utf-8"))
    assert marker["title"] == "Why We Dream!"
    assert marker["pipeline_type"] == "framework-smoke"
    assert marker["style_playbook"] == "sample"
    assert marker["channel"] == "sample" and marker["format"] == "smoke"


def test_openmontage_follows_the_channels_projects_dir():
    env = {
        **os.environ,
        "OPENMONTAGE_PROJECTS_DIR": "/tmp/some-channel/videos",
        "PYTHONPATH": str(REAL_ROOT / "core" / "openmontage"),
    }
    proc = subprocess.run(
        [sys.executable, "-c",
         "from lib.checkpoint import PROJECTS_DIR as a; from lib.events import PROJECTS_DIR as b;"
         "from backlot.state import PROJECTS_DIR as c; print(a, b, c)"],
        capture_output=True, text=True, env=env, timeout=60,
    )
    assert proc.returncode == 0, proc.stderr
    assert proc.stdout.split() == ["/tmp/some-channel/videos"] * 3


@pytest.mark.parametrize(
    "title, format_name, status, problem",
    [
        ("A title", "nope", "draft", "no format 'nope'"),
        ("!!!", "smoke", "draft", "no letters or digits"),
        ("A title", "smoke", "paused", "is paused"),
    ],
)
def test_new_video_refusals(studio_root, title, format_name, status, problem):
    channel = smoke_channel("sample", 3)
    edit_channel(channel.dir, status=status)
    with pytest.raises(ChannelError, match=problem):
        channels.new_video(channels.load_channel("sample"), title, format_name)
    assert not any(channel.videos_dir.glob("*_*"))


def test_new_video_refuses_a_duplicate(studio_root):
    channel = smoke_channel("sample", 3)
    channels.new_video(channel, "Same", "smoke")
    with pytest.raises(ChannelError, match="already exists"):
        channels.new_video(channel, "Same", "smoke")


@pytest.mark.parametrize(
    "path, ignored",
    [
        ("channels/x/videos/d_s/assets/images/hero.png", True),
        ("channels/x/videos/d_s/renders/final.mp4", True),
        ("channels/x/videos/d_s/events.jsonl", True),
        ("channels/x/lora/weights.bin", True),
        ("channels/x/.board.json", True),
        ("channels/x/lora/.gitkeep", False),
        ("channels/x/videos/d_s/artifacts/script.json", False),
        ("channels/x/videos/d_s/checkpoint_script.json", False),
        ("channels/x/videos/d_s/project.json", False),
        ("channels/x/videos/d_s/cost_log.json", False),
        ("channels/x/channel.yaml", False),
    ],
)
def test_video_text_is_tracked_and_assets_are_ignored(path, ignored):
    proc = subprocess.run(
        ["git", "check-ignore", "--no-index", "-q", path], cwd=REAL_ROOT, timeout=30
    )
    assert (proc.returncode == 0) is ignored


# --- budgets ---


def test_channels_enforce_their_own_budgets(studio_root):
    small = smoke_channel("small", 0.40)
    large = smoke_channel("large", 5)
    for channel in (small, large):
        channels.new_video(channel, "Same", "smoke", on=date(2026, 11, 5))
    video = "2026-11-05_same"

    logged = json.loads((small.videos_dir / video / "cost_log.json").read_text(encoding="utf-8"))
    assert logged["budget_total_usd"] == 0.40

    small_tracker = channels.tracker_for(small, video)
    small_tracker.approve_tool("simulated")
    entry = small_tracker.estimate("simulated", "render", 0.45)
    with pytest.raises(BudgetExceededError):
        small_tracker.reserve(entry)

    large_tracker = channels.tracker_for(large, video)
    large_tracker.approve_tool("simulated")
    entry = large_tracker.estimate("simulated", "render", 0.45)
    large_tracker.reserve(entry)
    large_tracker.reconcile(entry, 0.45)
    assert large_tracker.cost_snapshot()["budget_remaining_usd"] == 4.55


def test_a_videos_budget_does_not_move_when_the_channel_changes(studio_root):
    channel = smoke_channel("sample", 2)
    channels.new_video(channel, "Same", "smoke", on=date(2026, 11, 5))
    edit_channel(channel.dir, budget_usd_per_video=9)
    tracker = channels.tracker_for(channels.load_channel("sample"), "2026-11-05_same")
    assert tracker.budget_total_usd == 2


# --- gates ---


@pytest.fixture()
def gated_video(studio_root):
    channel = smoke_channel("sample", 3)
    channels.new_video(channel, "Same", "smoke", on=date(2026, 11, 5))
    return channel, "2026-11-05_same"


def write_stage(channel, video, stage, status, **kwargs):
    artifact = {"research": "research_brief", "script": "script"}[stage]
    return write_checkpoint(
        channel.videos_dir, video, stage, status, {artifact: sample_artifact(artifact)}, **kwargs
    )


def test_gated_stage_cannot_finish_until_omni_approve(gated_video):
    channel, video = gated_video
    with pytest.raises(CheckpointValidationError, match="GATE VIOLATION"):
        write_stage(channel, video, "research", "completed")

    write_stage(channel, video, "research", "awaiting_human")
    with pytest.raises(CheckpointValidationError, match="PREREQUISITE VIOLATION"):
        write_stage(channel, video, "script", "awaiting_human")

    assert cli.main(["approve", "sample", video, "research", "--note", "reads well"]) == 0
    checkpoint = read_checkpoint(channel.videos_dir, video, "research")
    assert checkpoint["status"] == "completed" and checkpoint["human_approved"] is True
    assert checkpoint["metadata"]["approval"]["via"] == "omni approve"
    assert checkpoint["metadata"]["approval"]["note"] == "reads well"

    write_stage(channel, video, "script", "awaiting_human")
    assert cli.main(["approve", "sample", video, "script"]) == 0
    assert read_checkpoint(channel.videos_dir, video, "script")["human_approved"] is True


def test_approve_refuses_when_nothing_awaits(gated_video, capsys):
    channel, video = gated_video
    assert cli.main(["approve", "sample", video, "research"]) == 2
    assert "no checkpoint" in capsys.readouterr().err

    write_stage(channel, video, "research", "in_progress")
    assert cli.main(["approve", "sample", video, "research"]) == 2
    assert "nothing to approve" in capsys.readouterr().err

    assert cli.main(["approve", "sample", "2026-01-01_no-such-video", "research"]) == 2
    assert "No video" in capsys.readouterr().err


def test_approve_cannot_skip_an_earlier_stage(gated_video, capsys):
    channel, video = gated_video
    write_stage(channel, video, "research", "awaiting_human")
    # Hand-written, so write_checkpoint's own refusal cannot stop it here.
    path = channel.videos_dir / video / "checkpoint_script.json"
    forged = json.loads((channel.videos_dir / video / "checkpoint_research.json").read_text("utf-8"))
    forged.update(stage="script", artifacts={"script": sample_artifact("script")})
    path.write_text(json.dumps(forged), encoding="utf-8")

    assert cli.main(["approve", "sample", video, "script"]) == 2
    assert "PREREQUISITE VIOLATION" in capsys.readouterr().err
    assert read_checkpoint(channel.videos_dir, video, "script")["status"] == "awaiting_human"


def test_a_second_approve_after_a_passed_gate_is_refused(gated_video, capsys):
    channel, video = gated_video
    write_stage(channel, video, "research", "awaiting_human")
    assert cli.main(["approve", "sample", video, "research"]) == 0
    before = (channel.videos_dir / video / "checkpoint_research.json").read_text("utf-8")
    capsys.readouterr()
    assert cli.main(["approve", "sample", video, "research"]) == 2
    assert "'completed', not 'awaiting_human'" in capsys.readouterr().err
    assert (channel.videos_dir / video / "checkpoint_research.json").read_text("utf-8") == before


# --- slugs and video ids cannot leave their folders ---

VIDEO = "2026-11-05_same"


@pytest.fixture()
def victim(studio_root):
    """A channel with a gate awaiting approval, and a second channel to attack it from."""
    target = smoke_channel("victim", 3)
    channels.new_video(target, "Same", "smoke", on=date(2026, 11, 5))
    write_stage(target, VIDEO, "research", "awaiting_human")
    attacker = smoke_channel("attacker", 3)
    return target, attacker


def bad_video_ids(target: channels.Channel, attacker: channels.Channel) -> dict[str, str]:
    link = attacker.videos_dir / "2026-11-05_link"
    link.symlink_to(target.videos_dir / VIDEO, target_is_directory=True)
    return {
        "dotdot": f"../../victim/videos/{VIDEO}",
        "dotdot_after_id": f"{VIDEO}/../../../victim/videos/{VIDEO}",
        "absolute": str(target.videos_dir / VIDEO),
        "symlink_out": link.name,
    }


def assert_victim_untouched(target: channels.Channel) -> None:
    checkpoint = read_checkpoint(target.videos_dir, VIDEO, "research")
    assert checkpoint["status"] == "awaiting_human" and checkpoint["human_approved"] is False


@pytest.mark.parametrize("kind", ["dotdot", "dotdot_after_id", "absolute", "symlink_out"])
def test_approve_refuses_a_video_id_that_leaves_the_channel(victim, kind, capsys):
    target, attacker = victim
    video_id = bad_video_ids(target, attacker)[kind]
    assert cli.main(["approve", "attacker", video_id, "research"]) == 2
    err = capsys.readouterr().err
    assert "Bad video id" in err or "resolves outside" in err
    with pytest.raises(ChannelError):
        channels.approve_stage(attacker, video_id, "research")
    assert_victim_untouched(target)


@pytest.mark.parametrize("kind", ["dotdot", "dotdot_after_id", "absolute", "symlink_out"])
def test_budget_tracker_refuses_a_video_id_that_leaves_the_channel(victim, kind):
    target, attacker = victim
    video_id = bad_video_ids(target, attacker)[kind]
    before = (target.videos_dir / VIDEO / "cost_log.json").read_text("utf-8")
    with pytest.raises(ChannelError, match="Bad video id|resolves outside"):
        channels.tracker_for(attacker, video_id)
    assert (target.videos_dir / VIDEO / "cost_log.json").read_text("utf-8") == before


def test_symlink_to_a_folder_inside_the_channel_is_still_accepted(victim):
    _, attacker = victim
    channels.new_video(attacker, "Real", "smoke", on=date(2026, 11, 5))
    (attacker.videos_dir / "2026-11-05_alias").symlink_to(
        attacker.videos_dir / "2026-11-05_real", target_is_directory=True
    )
    assert channels.tracker_for(attacker, "2026-11-05_alias").budget_total_usd == 3


def test_a_videos_folder_symlinked_out_of_the_channel_is_refused(victim, capsys):
    target, attacker = victim
    shutil.rmtree(attacker.videos_dir)
    attacker.videos_dir.symlink_to(target.videos_dir, target_is_directory=True)
    assert cli.main(["approve", "attacker", VIDEO, "research"]) == 2
    assert "resolves outside channel 'attacker'" in capsys.readouterr().err
    with pytest.raises(ChannelError, match="resolves outside"):
        channels.tracker_for(attacker, VIDEO)
    assert_victim_untouched(target)


def test_status_flags_a_video_symlinked_out_of_the_channel(victim, monkeypatch, capsys):
    target, attacker = victim
    bad_video_ids(target, attacker)
    monkeypatch.setattr(cli, "_discover_tools", lambda: {"video_compose"})
    assert cli.main(["status"]) == 1
    assert "2026-11-05_link  REFUSED" in capsys.readouterr().out


def bad_slugs(studio_root: Path, target: channels.Channel) -> dict[str, str]:
    outside = studio_root.parent / "elsewhere"
    shutil.copytree(target.dir, outside)
    (channels.channels_dir() / "linked").symlink_to(outside, target_is_directory=True)
    return {
        "dotdot": "../channels/victim",
        "absolute": str(target.dir),
        "number": "victim1",
        "underscore": "_template",
        "upper": "Victim",
        "symlink_out": "linked",
    }


SLUG_COMMANDS = {
    "approve": lambda slug: ["approve", slug, VIDEO, "research"],
    "board": lambda slug: ["board", slug, "--no-open"],
    "check": lambda slug: ["check", slug],
    "fix": lambda slug: ["fix", slug, "--format", "smoke", "--stage", "script",
                         "--severity", "low", "--example", "x"],
    "new-video": lambda slug: ["new-video", slug, "Another", "--format", "smoke"],
}


@pytest.mark.parametrize("kind", ["dotdot", "absolute", "number", "underscore", "upper", "symlink_out"])
def test_load_channel_refuses_bad_slugs(victim, studio_root, kind):
    target, _ = victim
    slug = bad_slugs(studio_root, target)[kind]
    with pytest.raises(ChannelError, match="Bad channel slug|resolves outside"):
        channels.load_channel(slug)


@pytest.mark.parametrize("command", sorted(SLUG_COMMANDS))
@pytest.mark.parametrize("kind", ["dotdot", "absolute", "number", "symlink_out"])
def test_every_command_refuses_bad_slugs(victim, studio_root, command, kind, capsys):
    target, _ = victim
    slug = bad_slugs(studio_root, target)[kind]
    # check reports a failed channel (exit 1); every other command refuses (exit 2).
    assert cli.main(SLUG_COMMANDS[command](slug)) == (1 if command == "check" else 2)
    captured = capsys.readouterr()
    said = captured.out + captured.err
    assert "Bad channel slug" in said or "resolves outside" in said
    assert_victim_untouched(target)
    assert not list(channels.issues_dir().glob("*.yaml"))
    assert not (target.dir / ".board.json").exists()
    assert sorted(p.name for p in target.videos_dir.iterdir() if p.is_dir()) == [VIDEO]


# --- fix, check, status ---


def test_fix_records_a_note_with_every_field(studio_root):
    smoke_channel("sample", 3)
    args = ["fix", "sample", "--format", "smoke", "--stage", "script", "--severity", "high",
            "--example", "line 4 repeats line 2"]
    assert cli.main(args) == 0
    assert cli.main(args + ["--note", "second"]) == 0
    first, second = sorted(channels.issues_dir().glob("*.yaml"))
    issue = yaml.safe_load(first.read_text(encoding="utf-8"))
    assert {k: issue[k] for k in ("channel", "format", "stage", "severity", "example")} == {
        "channel": "sample", "format": "smoke", "stage": "script", "severity": "high",
        "example": "line 4 repeats line 2",
    }
    assert yaml.safe_load(second.read_text(encoding="utf-8"))["note"] == "second"


@pytest.mark.parametrize(
    "overrides, problem",
    [
        ({"--format": "nope"}, "no format"),
        ({"--stage": "nope"}, "no stage"),
        ({"--example": "  "}, "must say what went wrong"),
    ],
)
def test_fix_refuses_bad_input(studio_root, overrides, problem, capsys):
    smoke_channel("sample", 3)
    fields = {"--format": "smoke", "--stage": "script", "--severity": "low", "--example": "x"}
    fields.update(overrides)
    args = ["fix", "sample"] + [part for pair in fields.items() for part in pair]
    assert cli.main(args) == 2
    assert problem in capsys.readouterr().err
    assert not list(channels.issues_dir().glob("*.yaml"))


def test_check_passes_and_fails_with_the_right_exit_codes(studio_root, capsys):
    good = smoke_channel("good", 3)
    assert cli.main(["check", "good"]) == 0
    assert "good: ok" in capsys.readouterr().out
    edit_channel(good.dir, cadence="sometimes")
    assert cli.main(["check"]) == 1
    assert "cadence" in capsys.readouterr().out


def test_status_lists_channels_budgets_and_pending_gates(gated_video, monkeypatch, capsys):
    channel, video = gated_video
    write_stage(channel, video, "research", "awaiting_human")
    monkeypatch.setattr(cli, "_discover_tools", lambda: {"video_compose"})
    assert cli.main(["status"]) == 0
    out = capsys.readouterr().out
    assert "channels     1" in out
    assert "sample  draft  risk B  $3/video  1 video(s)  board stopped" in out
    assert f"{video}  spent $0.00 of $3.00  awaiting approval: research" in out


def test_status_fails_on_an_invalid_channel(studio_root, monkeypatch, capsys):
    channel = channels.create_channel("sample")
    edit_channel(channel.dir, cadence="sometimes")
    monkeypatch.setattr(cli, "_discover_tools", lambda: {"video_compose"})
    assert cli.main(["status"]) == 1
    assert "sample  INVALID" in capsys.readouterr().out


# --- boards ---


def _api_projects(port: int) -> list[str]:
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/projects", timeout=5) as resp:
        return [p["project_id"] for p in json.load(resp)]


def test_each_channel_gets_its_own_board_and_none_on_the_owners_port(studio_root, capsys):
    assert 4750 not in cli.BOARD_PORTS and 4760 not in cli.BOARD_PORTS
    first, second = smoke_channel("first", 1), smoke_channel("second", 2)
    channels.new_video(first, "Only In First", "smoke", on=date(2026, 11, 5))
    channels.new_video(second, "Only In Second", "smoke", on=date(2026, 11, 5))
    try:
        assert cli.main(["board", "first", "--no-open"]) == 0
        assert cli.main(["board", "second", "--no-open"]) == 0
        first_port = json.loads((first.dir / ".board.json").read_text("utf-8"))["port"]
        second_port = json.loads((second.dir / ".board.json").read_text("utf-8"))["port"]
        assert first_port != second_port
        assert _api_projects(first_port) == ["2026-11-05_only-in-first"]
        assert _api_projects(second_port) == ["2026-11-05_only-in-second"]

        # Running it again reuses the board.
        assert cli.main(["board", "first", "--no-open"]) == 0
        assert json.loads((first.dir / ".board.json").read_text("utf-8"))["port"] == first_port
    finally:
        cli.main(["board", "first", "--stop"])
        cli.main(["board", "second", "--stop"])
    assert not (first.dir / ".board.json").exists()


# --- same-named assets ---


@pytest.mark.skipif(
    not (REAL_ROOT / "core/openmontage/remotion-composer/node_modules/remotion").is_dir(),
    reason="Remotion is not installed",
)
def test_same_named_assets_render_each_channels_own_image(tmp_path):
    public = REAL_ROOT / "core" / "openmontage" / "remotion-composer" / "public"
    public_before = sorted(str(p.relative_to(public)) for p in public.rglob("*"))
    colours = {"red": (220, 30, 30), "blue": (30, 60, 220)}
    for name, colour in colours.items():
        image = tmp_path / name / "assets" / "images" / "hero.png"
        image.parent.mkdir(parents=True)
        Image.new("RGB", (1280, 720), colour).save(image)
        output = tmp_path / name / "renders" / "final.mp4"
        result = VideoCompose().execute(
            {
                "operation": "render",
                "output_path": str(output),
                "edit_decisions": {
                    "version": "1.0",
                    "render_runtime": "remotion",
                    "renderer_family": "explainer-data",
                    "cuts": [{"id": "c1", "source": "hero", "in_seconds": 0, "out_seconds": 1}],
                },
                "asset_manifest": {
                    "version": "1.0",
                    "assets": [{"id": "hero", "type": "image", "path": str(image)}],
                },
            }
        )
        assert result.success, result.error
        frame = tmp_path / name / "frame.png"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-ss", "0.5", "-i", str(output),
             "-frames:v", "1", str(frame)],
            check=True,
        )
        with Image.open(frame) as opened:
            pixel = opened.convert("RGB").getpixel((opened.width // 2, opened.height // 2))
        assert all(abs(got - want) < 25 for got, want in zip(pixel, colour)), (name, pixel)
    assert sorted(str(p.relative_to(public)) for p in public.rglob("*")) == public_before


def test_upload_token_must_be_the_channels_own_youtube_token(studio_root):
    channel = channels.create_channel("sample")
    edit_channel(channel.dir, upload_token_path="~/.config/omni-studio/youtube/other.token")
    with pytest.raises(ChannelError, match="youtube/sample.token, one token per channel"):
        channels.load_channel("sample")
