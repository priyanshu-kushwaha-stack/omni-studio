"""Phase 3: the Professor of Us engine as OpenMontage tools, the channel, its links and its rules."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

import styles.playbook_loader as playbook_loader
from studio import channels, cli
from tools.studio import studio_pou_tools as pou
from tools.tool_registry import DISABLED_TOOLS, registry

REAL_ROOT = Path(__file__).resolve().parents[3]
STUDIO_TOOLS = {"pou_tts", "pou_stills", "pou_puppet", "pou_compose", "overlay_check"}
TAILS = "channels/professor-of-us/videos/2026-10-31_tails"


# --- discovery ---


def test_studio_tools_are_discovered_and_the_denylist_still_holds():
    registry.ensure_discovered()
    names = set(registry.list_all())
    assert STUDIO_TOOLS <= names
    assert len(DISABLED_TOOLS) == 5 and not (DISABLED_TOOLS & names)


def test_media_tools_use_the_media_venv_and_the_rest_the_core_one():
    assert pou.PouTts().python() == REAL_ROOT / ".venv-media" / "bin" / "python"
    assert pou.PouStills().python() == REAL_ROOT / ".venv-media" / "bin" / "python"
    for tool in (pou.PouPuppet(), pou.PouCompose(), pou.StudioOverlayCheck()):
        assert tool.python() == Path(sys.executable)


def test_command_points_the_engine_at_the_channel():
    cmd, env = pou.StudioOverlayCheck().command({"channel": "professor-of-us", "args": [TAILS]})
    assert cmd[1] == str(REAL_ROOT / "core" / "engines" / "pou" / "scripts" / "overlay_check.py")
    assert env["POU_CHANNEL_DIR"] == str(REAL_ROOT / "channels" / "professor-of-us")


@pytest.mark.parametrize("slug", ["../x", "Professor", "no-such-channel", "_template"])
def test_command_refuses_unknown_or_unsafe_channels(slug):
    with pytest.raises(ValueError):
        pou.PouCompose().command({"channel": slug, "args": []})


def test_paid_tts_needs_the_owners_approval():
    args = ["t.txt", "--engine", "eleven", "-o", "x.wav"]
    result = pou.PouTts().execute({"channel": "professor-of-us", "args": args})
    assert not result.success and "paid provider call" in result.error
    with pytest.raises(PermissionError):
        pou.PouTts().command({"channel": "professor-of-us", "args": ["t.txt", "--engine=eleven", "-o", "x"]})
    cmd, _ = pou.PouTts().command({"channel": "professor-of-us", "args": args, "owner_approved_paid_call": True})
    assert "eleven" in cmd
    cmd, _ = pou.PouTts().command({"channel": "professor-of-us", "args": ["t.txt", "--engine", "qwen3", "-o", "x"]})
    assert "qwen3" in cmd


def test_boil_is_refused(tmp_path):
    video = tmp_path / "v"
    video.mkdir()
    (video / "motion.json").write_text(json.dumps([{"scene": "s001", "effect": "boil"}]))
    with pytest.raises(PermissionError, match="line boil"):
        pou.PouCompose().command({"channel": "professor-of-us", "args": [str(video), "--motion"]})
    other = tmp_path / "m.json"
    other.write_text(json.dumps([{"scene": "s002", "effect": "boil"}]))
    with pytest.raises(PermissionError, match="s002"):
        pou.PouCompose().command({"channel": "professor-of-us", "args": [str(video), "--motion", str(other)]})
    stage = tmp_path / "stage.json"
    stage.write_text(json.dumps({"scenes": [{"id": "s001", "boil": True}]}))
    with pytest.raises(PermissionError, match="boil"):
        pou.PouPuppet().command({"channel": "professor-of-us", "args": ["clips", str(stage)]})


def test_the_tails_short_has_no_boil():
    assert pou.boil_in_motion(REAL_ROOT / TAILS / "motion.json") == []
    assert pou.boil_in_stage(REAL_ROOT / TAILS / "stage.json") == []
    pou.PouCompose().command({"channel": "professor-of-us", "args": [TAILS, "--motion"]})


def test_overlay_check_tool_runs_the_engine():
    result = pou.StudioOverlayCheck().execute(
        {"channel": "professor-of-us", "args": [TAILS, "--size", "1080x1920"]})
    if not (REAL_ROOT / TAILS / "assets" / "stills").is_dir():
        pytest.skip("tails stills are git-ignored and not copied into this checkout")
    assert result.success, result.data["stdout"] + result.data["stderr"]
    assert "0 fail" in result.data["stdout"]


# --- the channel ---


def test_professor_of_us_validates():
    channel = channels.load_channel("professor-of-us")
    config = channel.config
    assert config.status == "live" and config.made_for_kids is False and config.review_level == "full"
    assert config.upload_token_path == "~/.config/omni-studio/youtube/professor-of-us.token"
    assert set(config.formats.values()) == {"studio-dialogue"}


def test_engine_yaml_names_only_channel_or_secrets_paths():
    engine = yaml.safe_load((REAL_ROOT / "channels" / "professor-of-us" / "engine.yaml").read_text())
    assert engine["secrets_env"].startswith("~/.config/omni-studio/")
    for key, value in engine.items():
        assert "faceless-channel" not in value and "sandbox" not in value, key


def test_studio_dialogue_has_the_seven_gates_in_order():
    from lib.pipeline_loader import load_pipeline_readonly

    manifest = load_pipeline_readonly("studio-dialogue")
    stages = [s["name"] for s in manifest["stages"]]
    assert stages == ["proposal", "dialogue_script", "narration", "rough_cut", "final_edit", "final_watch",
                      "publish_prep"]
    assert all(s["human_approval_default"] is True for s in manifest["stages"])
    for skill in manifest["required_skills"]:
        assert (REAL_ROOT / "core" / "openmontage" / "skills" / f"{skill}.md").is_file(), skill
    text = (REAL_ROOT / "core" / "openmontage" / "pipeline_defs" / "studio-dialogue.yaml").read_text()
    body = "\n".join(line for line in text.splitlines() if not line.lstrip().startswith("#"))
    assert "character_rig_renderer" not in body and "lip_sync" not in body


# --- links ---


def test_link_recreates_missing_playbook_links(tmp_path, monkeypatch):
    root = tmp_path / "root"
    shutil.copytree(REAL_ROOT / "channels" / "_template", root / "channels" / "_template")
    styles = root / "core" / "openmontage" / "styles"
    styles.mkdir(parents=True)
    monkeypatch.setattr(channels, "ROOT", root)
    monkeypatch.setattr(playbook_loader, "STYLES_DIR", styles)
    channels.create_channel("alpha")
    channels.create_channel("beta")
    link = styles / "custom" / "alpha.yaml"
    link.unlink()
    (styles / "custom" / "beta.yaml").unlink()
    (styles / "custom" / "beta.yaml").symlink_to("../../../../channels/alpha/playbook.yaml")

    assert dict(channels.link_playbooks()) == {"alpha": "created", "beta": "replaced"}
    assert os.readlink(link) == "../../../../channels/alpha/playbook.yaml"
    assert link.resolve() == (root / "channels" / "alpha" / "playbook.yaml").resolve()
    assert dict(channels.link_playbooks()) == {"alpha": "ok", "beta": "ok"}
    assert cli.main(["link"]) == 0
    channels.load_channel("alpha")


def test_link_refuses_to_replace_a_real_file(tmp_path, monkeypatch):
    root = tmp_path / "root"
    shutil.copytree(REAL_ROOT / "channels" / "_template", root / "channels" / "_template")
    styles = root / "core" / "openmontage" / "styles"
    styles.mkdir(parents=True)
    monkeypatch.setattr(channels, "ROOT", root)
    monkeypatch.setattr(playbook_loader, "STYLES_DIR", styles)
    channels.create_channel("alpha")
    link = styles / "custom" / "alpha.yaml"
    link.unlink()
    link.write_text("identity: {}\n")
    with pytest.raises(channels.ChannelError, match="regular file"):
        channels.link_playbooks()


def test_real_links_resolve():
    for slug in channels.list_slugs():
        link = channels.custom_styles_dir() / f"{slug}.yaml"
        assert link.is_symlink() and link.resolve().is_file(), f"run omni link: {link}"


# --- rules ---

RULES = REAL_ROOT / "core" / "studio" / "rules"
RULE_NAMES = ["viewer-questions", "no-line-boil", "shorts-sound-ending", "text-placement", "dialogue-characters",
              "no-audio-clicks"]


def test_six_rules_each_name_a_check_or_a_g6_watch_item():
    assert sorted(p.stem for p in RULES.glob("*.md") if p.stem != "README") == sorted(RULE_NAMES)
    index = (RULES / "README.md").read_text()
    for name in RULE_NAMES:
        text = (RULES / f"{name}.md").read_text()
        first = re.search(r"^check: (.+)$", text, re.M)
        assert first, name
        assert f"]({name}.md)" in index, name
        if first.group(1).startswith("none"):
            assert "G6 watch:" in text, name
        else:
            assert first.group(1).startswith("automated"), name


def test_automated_rule_checks_point_at_real_code():
    engine = REAL_ROOT / "core" / "engines" / "pou"
    assert (engine / "scripts" / "audio_check.py").is_file()
    assert (engine / "scripts" / "overlay_check.py").is_file()
    assert "def test_short_sfx_are_sparse_and_quiet" in (engine / "tests" / "test_compose.py").read_text()
    assert "def test_dialogue_speaker_talks_and_the_listener_looks_at_them" in (
        engine / "tests" / "test_short_rigs.py").read_text()
    assert callable(pou.boil_in_motion) and callable(pou.boil_in_stage)
