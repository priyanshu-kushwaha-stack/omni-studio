"""B1: every heavy step leaves one timing line; a timing failure never fails the step."""

from __future__ import annotations

import json
import os
from pathlib import Path
from types import SimpleNamespace

import pytest

from studio.jobs import timing as T


def test_every_test_writes_timings_and_ledger_inside_tmp(tmp_path):
    # conftest.py sets both paths for every test; nothing may fall back to ~/.local/state/omni-studio/.
    assert Path(os.environ["OMNI_JOBS_TIMINGS"]).is_relative_to(tmp_path)
    assert Path(os.environ["OMNI_ROOM_LEDGER"]).is_relative_to(tmp_path)


def test_record_appends_a_line(tmp_path):
    T.record("pou_tts", seconds=12.3456, ok=True, channel="professor-of-us", video="2026-11-10_x", inputs_bytes=10)
    rows = T.read_timings()
    assert rows[0]["step"] == "pou_tts" and rows[0]["seconds"] == 12.346 and rows[0]["machine"]
    assert json.loads((tmp_path / "timings.jsonl").read_text().splitlines()[0])["video"] == "2026-11-10_x"


def test_timed_records_failures_too():
    with pytest.raises(RuntimeError):
        with T.timed("render", channel="say-suppose"):
            raise RuntimeError("boom")
    assert T.read_timings()[0]["ok"] is False


def test_video_from_inputs():
    assert T.video_from({"video": "v1"}) == "v1"
    assert T.video_from({"args": ["channels/professor-of-us/videos/2026-10-31_tails/scene_plan.json"]}) == "2026-10-31_tails"
    assert T.video_from({"args": ["--x"]}) == ""


def test_record_tool_wraps_execute_and_never_breaks_it(monkeypatch):
    class Tool:
        name = "pou_stills"

        @T.record_tool
        def execute(self, inputs):
            return SimpleNamespace(success=True)

    assert Tool().execute({"channel": "professor-of-us", "args": []}).success
    assert T.read_timings()[0]["step"] == "pou_stills"
    monkeypatch.setattr(T, "record", lambda *a, **k: (_ for _ in ()).throw(OSError("disk full")))
    assert Tool().execute({"channel": "professor-of-us"}).success


def test_summarize_ranks_by_total_time():
    rows = [{"step": "a", "seconds": 1, "ok": True}, {"step": "b", "seconds": 10, "ok": True},
            {"step": "a", "seconds": 3, "ok": False}, {"step": "b", "seconds": 20, "ok": True}]
    out = T.summarize(rows)
    assert [r["step"] for r in out] == ["b", "a"]
    assert out[0] == {"step": "b", "runs": 2, "failures": 0, "total_s": 30, "median_s": 15, "max_s": 20}
    assert out[1]["failures"] == 1


def test_read_timings_since():
    T.record("x", seconds=1, ok=True)
    assert T.read_timings(since="2999-01-01") == []
    assert len(T.read_timings(since="2000-01-01")) == 1


def test_the_default_path_is_outside_the_secrets_folder(monkeypatch):
    monkeypatch.delenv("OMNI_JOBS_TIMINGS")
    assert T.timings_path() == T.DEFAULT and ".config" not in T.DEFAULT.parts


def test_read_timings_skips_a_torn_line(tmp_path):
    # The file is shared by several worktrees; a writer killed mid-line leaves a fragment behind.
    target = tmp_path / "timings.jsonl"
    target.write_text('{"step": "a", "seconds": 1}\n{"step": "x", "sec\n{"step": "b", "seconds": 2}\n', encoding="utf-8")
    rows = T.read_timings(path=target)
    assert [r["step"] for r in rows] == ["a", "b"]


def test_pou_engine_tools_record_a_timing(monkeypatch):
    import subprocess

    from tools.studio import studio_pou_tools as pou

    def fake_run(cmd, **kw):
        return subprocess.CompletedProcess(cmd, 0, stdout="ok", stderr="")

    monkeypatch.setattr(pou.subprocess, "run", fake_run)
    result = pou.StudioOverlayCheck().execute(
        {"channel": "professor-of-us", "args": ["channels/professor-of-us/videos/2026-10-31_tails"]})
    assert result.success
    row = T.read_timings()[-1]
    assert (row["step"], row["channel"], row["video"], row["via"]) == (
        "overlay_check", "professor-of-us", "2026-10-31_tails", "tool")
