"""The what-if engine as OpenMontage tools (tools/studio/studio_whatif_tools.py) and the pipeline that names them."""

from __future__ import annotations

import json
import os
import time
from pathlib import Path

import pytest

from lib.pipeline_loader import load_pipeline_readonly
from studio.jobs import queue as Q
from studio.jobs import timing as T
from tools.studio import studio_whatif_tools as wt
from tools.tool_registry import registry

VIDEO = "2026-11-06_pause-time-for-10-seconds-a-day"
NAMES = {"whatif_story", "whatif_narration", "whatif_render", "whatif_stills", "whatif_mux"}


def test_the_tools_are_discovered():
    registry.discover()
    assert NAMES <= set(registry._tools)


def test_the_pipeline_names_the_tools_on_its_production_stages():
    stages = {s["name"]: s for s in load_pipeline_readonly("studio-whatif")["stages"]}
    # Story lock makes the local narration and the first cut; picture lock builds the film out.
    assert {"whatif_story", "whatif_narration", "whatif_render", "whatif_mux"} <= set(
        stages["story_script"]["tools_available"]
    )
    assert {"whatif_render", "whatif_stills"} <= set(stages["final_edit"]["tools_available"])


def test_narration_without_approval_can_only_reuse_cached_takes():
    (cmd,), env = wt.WhatifNarration().command({"channel": "say-suppose", "video": VIDEO})
    assert "--max-credits" not in cmd
    assert cmd[-2:] != ["--max-credits", "0"]
    assert env["WHISPER_PY"].endswith("bin/python")


def test_narration_with_approval_needs_a_credit_cap():
    tool = wt.WhatifNarration()
    with pytest.raises(PermissionError, match="max_credits"):
        tool.command({"channel": "say-suppose", "video": VIDEO, "owner_approved_paid_call": True})
    (cmd,), _ = tool.command(
        {"channel": "say-suppose", "video": VIDEO, "owner_approved_paid_call": True, "max_credits": 30}
    )
    assert cmd[cmd.index("--max-credits") + 1] == "30"


def test_a_cap_without_approval_is_refused():
    with pytest.raises(PermissionError, match="owner_approved_paid_call"):
        wt.WhatifNarration().command({"channel": "say-suppose", "video": VIDEO, "max_credits": 30})


@pytest.mark.parametrize("video", ["../professor-of-us", "2026-11-06_x/../../y", "notadate"])
def test_bad_video_ids_are_refused(video):
    with pytest.raises(ValueError):
        wt.WhatifStory().command({"channel": "say-suppose", "video": video})


def test_render_writes_only_inside_the_studio(tmp_path):
    tool = wt.WhatifRender()
    with pytest.raises(ValueError, match="inside"):
        tool.command(
            {
                "entry": "core/engines/whatif/examples/pause-sample/index.ts",
                "composition": "Video",
                "props": "core/engines/whatif/public/pause/props.json",
                "public_dir": "core/engines/whatif/public",
                "output": str(tmp_path / "x.mp4"),
            }
        )
    cmds, _ = tool.command(
        {
            "entry": "core/engines/whatif/examples/pause-sample/index.ts",
            "composition": "Video",
            "props": "core/engines/whatif/public/pause/props.json",
            "public_dir": "core/engines/whatif/public",
            "output": "core/engines/whatif/out/pause.mp4",
        }
    )
    render, limit = cmds
    assert render[:3] == ["npx", "remotion", "render"]
    assert "alimiter=limit=0.84:level=false" in " ".join(limit)


class _Sleeper(wt._WhatifTool):
    """A command whose child outlives the shell that started it, as remotion's renderer outlives npx."""

    name = "whatif_test_sleeper"

    def __init__(self, pidfile: Path):
        super().__init__()
        self.pidfile = pidfile

    def command(self, inputs):
        return [["sh", "-c", f"sleep 60 & echo $! > {self.pidfile}; wait"]], dict(os.environ)


@pytest.mark.slow  # waits out a 2 s timeout by design
def test_a_timeout_kills_the_whole_command_and_is_reported(tmp_path):
    pidfile = tmp_path / "pid"
    result = _Sleeper(pidfile).execute({"timeout_seconds": 2})
    assert not result.success
    assert "timed out" in result.error
    child = int(pidfile.read_text())
    for _ in range(20):
        try:
            os.kill(child, 0)
        except ProcessLookupError:
            return
        time.sleep(0.1)
    os.kill(child, 9)
    pytest.fail("the command's child process survived the timeout")


class _Quick(wt._WhatifTool):
    name = "whatif_test_quick"
    queue = "render"

    def command(self, inputs):
        return [["true"]], dict(os.environ)


def test_a_queued_tool_refuses_when_the_render_queue_stays_held(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.delenv(Q.HELD_ENV, raising=False)
    with Q.hold("render", step="other session"):
        result = _Quick().execute({"queue_wait_seconds": 0})
    assert not result.success and "render queue" in result.error and "other session" in result.error
    assert _Quick().execute({"queue_wait_seconds": 0}).success


def test_a_tool_run_inside_studio_jobs_run_does_not_take_the_queue_twice(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.setenv(Q.HELD_ENV, "render")
    with Q.hold("render", step="studio.jobs run"):
        assert _Quick().execute({"queue_wait_seconds": 0}).success


def test_whatif_tools_record_a_timing(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.delenv(Q.HELD_ENV, raising=False)
    _Quick().execute({"channel": "say-suppose", "video": VIDEO})
    row = T.read_timings()[-1]
    assert (row["step"], row["video"]) == ("whatif_test_quick", VIDEO)


def _render(**kw):
    return {
        "entry": "core/engines/whatif/examples/pause-sample/index.ts",
        "composition": "Video",
        "props": "core/engines/whatif/public/pause/props.json",
        "public_dir": "core/engines/whatif/public",
        "output": "core/engines/whatif/out/pause.mp4",
        **kw,
    }


def test_a_render_is_a_720p_preview_unless_final_is_asked():
    tool = wt.WhatifRender()
    (render, _limit), _ = tool.command(_render())
    assert f"--scale={wt.PREVIEW_SCALE}" in render
    assert tool.timing_step(_render()) == "whatif_render.full-720p"
    (render, _limit), _ = tool.command(_render(quality="final"))
    assert not any(a.startswith("--scale") for a in render)
    assert tool.timing_step(_render(quality="final")) == "whatif_render.full-1080p"


def test_the_preview_scale_gives_whole_1280x720():
    # Remotion refuses a fractional size ("height ... must be an integer, but is 720.036" at --scale=0.6667,
    # the plan's benchmark); 0.6666666666666666 times 1920 and 1080 is exactly 1280 and 720 in doubles.
    assert (1920 * wt.PREVIEW_SCALE, 1080 * wt.PREVIEW_SCALE) == (1280.0, 720.0)


def test_a_final_render_is_the_whole_film():
    with pytest.raises(ValueError, match="whole film"):
        wt.WhatifRender().command(_render(quality="final", frames="0-299"))
    with pytest.raises(ValueError, match="quality"):
        wt.WhatifRender().command(_render(quality="4k"))


def test_g6_has_the_render_tool():
    stages = {s["name"]: s for s in load_pipeline_readonly("studio-whatif")["stages"]}
    assert "whatif_render" in stages["final_watch"]["tools_available"]


def test_picture_and_audio_passes():
    tool = wt.WhatifRender()
    (picture,), _ = tool.command(_render(mode="picture"))
    assert "--muted" in picture and picture[5].endswith("pause.mp4")
    assert tool.timing_step(_render(mode="picture")) == "whatif_render.picture-720p"
    (audio,), _ = tool.command(_render(mode="audio", output="core/engines/whatif/out/pause.wav"))
    assert "--codec=wav" in audio and not any(a.startswith("--scale") for a in audio)
    assert tool.timing_step(_render(mode="audio")) == "whatif_render.audio"
    with pytest.raises(ValueError, match=".wav"):
        tool.command(_render(mode="audio"))
    with pytest.raises(ValueError, match="one full"):
        tool.command(_render(mode="picture", quality="final"))
    with pytest.raises(ValueError, match="mode"):
        tool.command(_render(mode="stems"))


def _passes(tmp_path, monkeypatch, *, props_b="p1", scenes_b="s1", mode_a="picture"):
    pic, aud = tmp_path / "pic.mp4", tmp_path / "aud.wav"
    pic.write_bytes(b"v")
    aud.write_bytes(b"a")
    for media, mode, props, scenes in ((pic, mode_a, "p1", "s1"), (aud, "audio", props_b, scenes_b)):
        sidecar = {
            "schema": 1,
            "mode": mode,
            "props_sha256": props,
            "frames": "all",
            "files": {"scenes/beats/B.tsx": scenes},
        }
        wt.C.sidecar_path(media).write_text(json.dumps(sidecar))
    monkeypatch.setattr(wt, "inside", lambda p: Path(p))
    return {"picture": str(pic), "audio": str(aud), "output": str(tmp_path / "out.mp4")}


def test_mux_joins_a_matching_picture_and_audio(tmp_path, monkeypatch):
    (cmd,), _ = wt.WhatifMux().command(_passes(tmp_path, monkeypatch))
    assert cmd[0] == "ffmpeg" and "copy" in cmd and wt.LIMITER in cmd
    (_render_cmd, limit), _ = wt.WhatifRender().command(_render())
    assert cmd[-len(wt.LIMITED_AAC) - 2 : -2] == wt.LIMITED_AAC == limit[-len(wt.LIMITED_AAC) - 1 : -1]


def test_mux_refuses_when_the_timing_moved(tmp_path, monkeypatch):
    with pytest.raises(ValueError, match="timing"):
        wt.WhatifMux().command(_passes(tmp_path, monkeypatch, props_b="p2"))


def test_mux_refuses_two_audio_passes_or_files_with_no_sidecar(tmp_path, monkeypatch):
    with pytest.raises(ValueError, match="picture pass"):
        wt.WhatifMux().command(_passes(tmp_path, monkeypatch, mode_a="audio"))
    inputs = _passes(tmp_path, monkeypatch)
    wt.C.sidecar_path(Path(inputs["audio"])).unlink()
    with pytest.raises(ValueError, match="render.json"):
        wt.WhatifMux().command(inputs)


def test_mux_needs_a_sound_only_declaration_when_scene_code_changed(tmp_path, monkeypatch):
    inputs = _passes(tmp_path, monkeypatch, scenes_b="s2")
    with pytest.raises(ValueError, match="sound_only_change"):
        wt.WhatifMux().command(inputs)
    (cmd,), _ = wt.WhatifMux().command({**inputs, "sound_only_change": True})
    assert cmd[0] == "ffmpeg"
    assert wt.WhatifMux._changed(Path(inputs["picture"]), Path(inputs["audio"]), True) == ["scenes/beats/B.tsx"]
