"""Phase 1 fork behaviour: HyperFrames pin, tool denylist, external runtime, CLI."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator

from tools.tool_registry import ToolRegistry, registry
from tools.video.hyperframes_compose import HyperFramesCompose
from tools.video.video_compose import VideoCompose

ROOT = Path(__file__).resolve().parents[3]
OPENMONTAGE = ROOT / "core" / "openmontage"
LOCK = yaml.safe_load((ROOT / "core" / "lock.yaml").read_text(encoding="utf-8"))
DENYLIST = yaml.safe_load(
    (ROOT / "core" / "studio" / "config" / "disabled_tools.yaml").read_text(encoding="utf-8")
)

# `omni status` here reads every real channel; test_channels' real-tree test adds and removes one. Under xdist
# (--dist loadgroup) one group runs on one worker, one test at a time.
pytestmark = pytest.mark.xdist_group("real_channels")


def test_lock_pins_hyperframes_0_9_16():
    assert LOCK["hyperframes"]["version"] == "0.9.16"


def test_every_hyperframes_cli_call_uses_the_locked_version(monkeypatch):
    calls = []

    def fake_run(cmd, **kwargs):
        calls.append(cmd)
        return subprocess.CompletedProcess(cmd, 0, stdout="0.9.16\n", stderr="")

    monkeypatch.setattr(subprocess, "run", fake_run)
    monkeypatch.setattr(HyperFramesCompose, "_npm_resolve_cache", None)
    monkeypatch.setattr(HyperFramesCompose, "_cli_probe_cache", None)

    tool = HyperFramesCompose()
    tool._run_hf(["--version"], cwd=None, timeout=5, check=False)
    tool._resolve_npm_package()
    tool._probe_cli()

    assert len(calls) == 3
    for cmd in calls:
        assert "hyperframes@0.9.16" in cmd, cmd
        assert "hyperframes" not in cmd, cmd


def test_hyperframes_telemetry_is_off_for_child_processes():
    assert os.environ["HYPERFRAMES_NO_TELEMETRY"] == "1"
    assert os.environ["DISABLE_TELEMETRY"] == "1"


def test_denylist_names_the_owner_tools():
    assert {
        "lip_sync", "h3_max_video", "kling_lip_sync", "minimax_video", "minimax_fal_video",
    } <= set(DENYLIST["disabled"])


def test_disabled_tools_are_not_discovered():
    fresh = ToolRegistry()
    discovered = fresh.discover()
    for name in DENYLIST["disabled"]:
        assert name not in discovered
        assert name not in fresh.list_all()
        assert fresh.get(name) is None
    assert "video_compose" in fresh.list_all()


def test_disabled_tools_cannot_be_registered_directly():
    from tools.avatar.lip_sync import LipSync

    fresh = ToolRegistry()
    fresh.register(LipSync())
    assert fresh.get("lip_sync") is None


def test_disabled_tools_are_absent_from_capability_routing():
    registry.ensure_discovered()
    names = {t.name for t in registry.get_by_capability("video_generation")}
    assert not names & {"h3_max_video", "minimax_video", "minimax_fal_video"}
    assert "kling_lip_sync" not in {t.name for t in registry.get_by_capability("avatar")}
    listed = {
        entry["name"] for entries in registry.capability_catalog().values() for entry in entries
    }
    assert listed
    assert not listed & set(DENYLIST["disabled"])


@pytest.mark.parametrize(
    "schema_file, path",
    [
        ("edit_decisions.schema.json", ["properties", "render_runtime"]),
        ("proposal_packet.schema.json", ["properties", "production_plan", "properties", "render_runtime"]),
    ],
)
def test_external_is_a_valid_render_runtime(schema_file, path):
    node = json.loads((OPENMONTAGE / "schemas" / "artifacts" / schema_file).read_text("utf-8"))
    for key in path:
        node = node[key]
    assert node["enum"] == ["remotion", "hyperframes", "ffmpeg", "external"]
    Draft202012Validator(node).validate("external")


def test_external_is_a_valid_final_review_runtime():
    text = (OPENMONTAGE / "schemas" / "artifacts" / "final_review.schema.json").read_text("utf-8")
    schema = json.loads(text)

    def find(node):
        if isinstance(node, dict):
            if "render_runtime_used" in node:
                return node["render_runtime_used"]
            for value in node.values():
                found = find(value)
                if found:
                    return found
        return None

    assert find(schema)["enum"] == ["remotion", "hyperframes", "ffmpeg", "external"]


def _external_inputs(output_path: Path) -> dict:
    return {
        "operation": "render",
        "output_path": str(output_path),
        "edit_decisions": {"version": "1.0", "cuts": [], "render_runtime": "external"},
    }


def test_external_runtime_blocks_when_the_render_is_missing(tmp_path):
    result = VideoCompose().execute(_external_inputs(tmp_path / "missing.mp4"))
    assert result.success is False
    assert "external" in result.error
    assert "missing.mp4" in result.error


def test_external_runtime_accepts_a_finished_render_without_rendering(tmp_path):
    out = tmp_path / "final.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "lavfi", "-i", "testsrc=size=1280x720:rate=30:duration=1",
            "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(out),
        ],
        check=True,
    )
    before = out.stat().st_mtime_ns
    result = VideoCompose().execute(_external_inputs(out))
    assert result.data["render_runtime"] == "external"
    assert result.data["output"] == str(out)
    assert result.success is True, result.error
    assert result.data["final_review_status"] != "fail"
    assert out.stat().st_mtime_ns == before


def test_external_runtime_rejects_a_zero_byte_render(tmp_path):
    out = tmp_path / "empty.mp4"
    out.touch()
    result = VideoCompose().execute(_external_inputs(out))
    assert result.success is False
    assert "empty" in result.error and "empty.mp4" in result.error


def test_unknown_runtime_still_rejected(tmp_path):
    inputs = _external_inputs(tmp_path / "x.mp4")
    inputs["edit_decisions"]["render_runtime"] = "blender"
    result = VideoCompose().execute(inputs)
    assert result.success is False
    assert "external" in result.error


def _assert_clean_status(proc: subprocess.CompletedProcess) -> None:
    assert proc.returncode == 0, proc.stderr
    assert "hyperframes" in proc.stdout and "0.9.16" in proc.stdout
    assert "d21f5d4" in proc.stdout
    for name in DENYLIST["disabled"]:
        assert name in proc.stdout
    assert "LEAKED" not in proc.stdout
    assert ": absent" in proc.stdout


def _shell_env(**extra: str) -> dict[str, str]:
    """A plain shell: nothing Make or Claude would have exported."""
    drop = {"PYTHONPATH", "HYPERFRAMES_NO_TELEMETRY", "DISABLE_TELEMETRY"}
    return {**{k: v for k, v in os.environ.items() if k not in drop}, **extra}


def test_omni_status_runs_from_outside_the_repo():
    proc = subprocess.run(
        [sys.executable, "-m", "studio.cli", "status"],
        capture_output=True, text=True, env=_shell_env(PYTHONPATH=str(ROOT / "core")),
        cwd="/", timeout=180,
    )
    _assert_clean_status(proc)


def test_omni_status_console_script_runs_without_pythonpath():
    proc = subprocess.run(
        [str(Path(sys.executable).parent / "omni"), "status"],
        capture_output=True, text=True, env=_shell_env(), cwd="/", timeout=180,
    )
    _assert_clean_status(proc)


@pytest.mark.parametrize("shell_value", [None, "0"], ids=["unset", "shell_says_0"])
def test_omni_status_reports_what_a_child_receives_outside_make(shell_value):
    extra = {} if shell_value is None else {
        "HYPERFRAMES_NO_TELEMETRY": shell_value, "DISABLE_TELEMETRY": shell_value,
    }
    proc = subprocess.run(
        [str(Path(sys.executable).parent / "omni"), "status"],
        capture_output=True, text=True, env=_shell_env(**extra), cwd="/", timeout=180,
    )
    assert proc.returncode == 0, proc.stderr
    assert "HYPERFRAMES_NO_TELEMETRY=1 DISABLE_TELEMETRY=1" in proc.stdout


def test_omni_status_fails_and_says_leaked_when_a_tool_leaks(monkeypatch, capsys):
    from studio import cli

    monkeypatch.setattr(cli, "_discover_tools", lambda: {"video_compose", "lip_sync"})
    assert cli.main(["status"]) == 1
    assert "LEAKED lip_sync" in capsys.readouterr().out
