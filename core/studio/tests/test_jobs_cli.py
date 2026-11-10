"""python -m studio.jobs: wrap any command with a timing record; rank steps by total time."""

from __future__ import annotations

import sys

from studio.jobs import __main__ as cli
from studio.jobs import queue as Q
from studio.jobs import timing as T


def test_run_records_and_returns_the_exit_code(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    assert cli.main(["run", "--step", "ok-step", "--channel", "say-suppose", "--", sys.executable, "-c", "pass"]) == 0
    assert cli.main(["run", "--step", "bad-step", "--", sys.executable, "-c", "raise SystemExit(3)"]) == 3
    rows = T.read_timings()
    assert [(r["step"], r["ok"]) for r in rows] == [("ok-step", True), ("bad-step", False)]
    assert rows[0]["channel"] == "say-suppose" and rows[0]["via"] == "run"


def test_report_prints_a_ranked_table(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    T.record("render", seconds=300, ok=True)
    T.record("tts", seconds=60, ok=True)
    assert cli.main(["report"]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out[0].startswith("step") and out[2].startswith("render") and out[3].startswith("tts")


def test_run_without_a_command_is_a_usage_error(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    assert cli.main(["run", "--step", "x"]) == 2


def test_a_command_that_cannot_launch_is_recorded_as_failed_127(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    assert cli.main(["run", "--step", "ghost", "--", str(tmp_path / "no-such-binary")]) == 127
    row = T.read_timings()[-1]
    assert (row["step"], row["ok"]) == ("ghost", False)
    assert "no-such-binary" in capsys.readouterr().err


def test_a_command_that_is_not_executable_is_recorded_as_failed_126(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    plain = tmp_path / "plain.txt"
    plain.write_text("x")
    assert cli.main(["run", "--step", "noexec", "--", str(plain)]) == 126
    assert T.read_timings()[-1]["ok"] is False


def test_run_records_the_size_of_file_arguments_under_the_repo(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    inside = T.ROOT / "core" / "studio" / "jobs" / "timing.py"
    outside = tmp_path / "big.bin"
    outside.write_bytes(b"x" * 500)
    assert cli.main(["run", "--step", "s", "--", sys.executable, "-c", "pass", str(inside), str(outside)]) == 0
    assert T.read_timings()[0]["inputs_bytes"] == inside.stat().st_size


def test_report_filters_by_video_channel_and_step_prefix(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    T.record("whatif_render.full-1080p", seconds=3600, ok=True, channel="say-suppose", video="v1")
    T.record("whatif_render.audio", seconds=120, ok=True, channel="say-suppose", video="v2")
    T.record("pou_tts", seconds=60, ok=True, channel="professor-of-us", video="v2")
    assert cli.main(["report", "--video", "v2", "--step", "whatif_"]) == 0
    out = capsys.readouterr().out.splitlines()
    assert [line.split()[0] for line in out[2:]] == ["whatif_render.audio", "total"]
    assert out[-1].split()[1] == "1" and out[-1].rstrip().endswith("0.03 h")
    assert cli.main(["report", "--channel", "professor-of-us"]) == 0
    assert [line.split()[0] for line in capsys.readouterr().out.splitlines()[2:]] == ["pou_tts", "total"]


def test_run_with_a_queue_tells_the_command_it_holds_it(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.delenv(Q.HELD_ENV, raising=False)
    probe = "import sys; from studio.jobs import queue as Q; sys.exit(0 if Q.held_by_parent('render') else 4)"
    assert cli.main(["run", "--step", "x", "--queue", "render", "--", sys.executable, "-c", probe]) == 0
    assert cli.main(["run", "--step", "x", "--", sys.executable, "-c", probe]) == 4
