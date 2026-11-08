"""python -m studio.jobs: wrap any command with a timing record; rank steps by total time."""

from __future__ import annotations

import sys

from studio.jobs import __main__ as cli
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
