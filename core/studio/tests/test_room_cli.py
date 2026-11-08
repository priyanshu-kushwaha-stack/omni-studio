"""python -m studio.room: lint, seat, judge, report and verify, end to end with a fake CLI."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from studio.room import __main__ as cli
from studio.room import call

ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 3
daily_cap: 80
adopted: null
pitch_clip: after_g2
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
linters: []
sources: []
"""
CLEAN = {"scores": {}, "blockers": [], "suggestions": [], "keep": []}


def _fake(monkeypatch, answers):
    def run(cmd, **kw):
        if cmd[0] == "git":  # deny_paths() asks git for the main checkout
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": json.dumps(answers.pop(0))}), stderr="")

    monkeypatch.setattr(call.subprocess, "run", run)


def test_a_full_round_then_report_and_verify(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "professor-of-us"
    channel.mkdir()
    (channel / "room.yaml").write_text(ROOM)
    video = channel / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    script = video / "script.md"
    script.write_text("## [00:00] Hook\nPROF: Two sleeps.\nOOG: Ha.\n")
    cfg = str(channel / "room.yaml")
    assert cli.main(["lint", str(video), "g2", "--round", "1", "--draft", str(script), "--config", cfg]) == 0
    _fake(monkeypatch, [CLEAN, CLEAN, CLEAN])
    for seat in ("cold viewer", "story editor", "fact reviewer"):
        assert cli.main(["seat", str(video), "g2", "--round", "1", "--seat", seat, "--config", cfg]) == 0
    assert cli.main(["judge", str(video), "g2", "--round", "1", "--config", cfg]) == 0  # nothing to judge yet
    assert cli.main(["report", str(video), "g2", "--stage", "dialogue_script", "--config", cfg]) == 0
    report = json.loads((video / "room" / "g2.json").read_text())
    assert report["shipped"]["round"] == 1 and report["calls"] == 3
    assert cli.main(["verify", str(video), "g2", "--artifact", str(script)]) == 0
    script.write_text("## [00:00] Hook\nPROF: Eight hours.\n")
    assert cli.main(["verify", str(video), "g2", "--artifact", str(script)]) == 1


def test_seat_refuses_before_lint(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "pou"
    channel.mkdir()
    (channel / "room.yaml").write_text(ROOM)
    video = tmp_path / "v"
    video.mkdir()
    assert cli.main(["seat", str(video), "g2", "--round", "1", "--seat", "cold viewer",
                     "--config", str(channel / "room.yaml")]) == 2
    assert "run lint for round 1 first" in capsys.readouterr().err
