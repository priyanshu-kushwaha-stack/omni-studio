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


def _setup(tmp_path, monkeypatch, room=ROOM):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "professor-of-us"
    channel.mkdir()
    (channel / "room.yaml").write_text(room)
    video = channel / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    script = video / "script.md"
    script.write_text("## [00:00] Hook\nPROF: Two sleeps.\nOOG: Ha.\n")
    return video, script, str(channel / "room.yaml")


def _lint(video, script, cfg, rnd=1, gate="g2", *extra):
    return cli.main(["lint", str(video), gate, "--round", str(rnd), "--draft", str(script), "--config", cfg, *extra])


def test_relint_of_a_different_draft_does_not_repoint_the_round(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    meta = (video / "room" / "g2" / "round-1" / "meta.json").read_text()
    sha = json.loads(meta)["draft_sha256"]
    assert _lint(video, script, cfg) == 0  # same draft: allowed
    script.write_text("## [00:00] Hook\nPROF: Different.\nOOG: Ha.\n")
    (video / "room" / "g2" / "round-1" / "story-editor.json").write_text("{}")  # a seat has reviewed round 1
    capsys.readouterr()
    assert _lint(video, script, cfg) == 2
    assert f"round 1 already reviewed draft {sha[:12]}; start round 2" in capsys.readouterr().err
    assert json.loads((video / "room" / "g2" / "round-1" / "meta.json").read_text())["draft_sha256"] == sha


def test_relint_with_a_fixed_draft_is_allowed_until_a_seat_has_reviewed(tmp_path, monkeypatch):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    script.write_text("## [00:00] Hook\nPROF: Fixed.\nOOG: Ha.\n")
    assert _lint(video, script, cfg) == 0
    meta = json.loads((video / "room" / "g2" / "round-1" / "meta.json").read_text())
    from studio.room.snapshot import save_draft
    assert meta["draft_sha256"] == save_draft(video, script)


def test_seat_input_rejects_draft_missing_equals_and_missing_file(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    base = ["seat", str(video), "g2", "--round", "1", "--seat", "cold viewer", "--config", cfg]
    other = tmp_path / "other.md"
    other.write_text("x")
    capsys.readouterr()
    assert cli.main(base + ["--input", f"draft={other}"]) == 2
    assert "draft comes from the round's snapshot" in capsys.readouterr().err
    assert cli.main(base + ["--input", str(other)]) == 2
    assert "NAME=PATH" in capsys.readouterr().err
    assert cli.main(base + ["--input", f"notes={tmp_path / 'nope.md'}"]) == 2
    assert "nope.md" in capsys.readouterr().err


def test_errors_exit_cleanly(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    bad = tmp_path / "bad.yaml"
    bad.write_text("writer: [unclosed\n")
    assert _lint(video, script, str(bad)) == 2
    err = capsys.readouterr().err
    assert "Traceback" not in err and err.strip()
    assert _lint(video, tmp_path / "missing.md", cfg) == 2
    assert capsys.readouterr().err.strip()
    assert cli.main(["verify", str(video), "g2", "--artifact", str(script)]) == 1
    assert "g2.json" in capsys.readouterr().out


def test_seat_and_judge_validate_first(tmp_path, monkeypatch, capsys):
    room = ROOM.replace("story editor, role: story, model: gpt-5.6-sol-high", "story editor, role: story, model: claude-opus-5-5")
    video, script, cfg = _setup(tmp_path, monkeypatch, room)
    assert _lint(video, script, cfg) == 0

    def boom(*a, **k):
        raise AssertionError("model call made")

    monkeypatch.setattr(call.subprocess, "run", boom)
    capsys.readouterr()
    assert cli.main(["seat", str(video), "g2", "--round", "1", "--seat", "story editor", "--config", cfg]) == 2
    assert "writer's family" in capsys.readouterr().err
    assert cli.main(["judge", str(video), "g2", "--round", "1", "--config", cfg]) == 2
    assert "writer's family" in capsys.readouterr().err
    from studio.room.ledger import Ledger
    assert Ledger().count() == 0
    assert not list((video / "room" / "g2" / "round-1").glob("story-editor.json"))


def test_kind_defaults_by_gate_and_video_name_is_resolved(tmp_path):
    assert cli._default_kind("g1", None) == "packaging"
    assert cli._default_kind("g2", None) == "script"
    assert cli._default_kind("g2", "packaging") == "packaging"


def test_two_seats_with_one_file_name_are_refused(tmp_path, monkeypatch, capsys):
    room = ROOM.replace("name: story editor", "name: Cold-Viewer!")
    video, script, cfg = _setup(tmp_path, monkeypatch, room)
    assert _lint(video, script, cfg) == 2
    assert "same file name" in capsys.readouterr().err


def test_judge_runs_when_rounds_one_and_two_are_candidates(tmp_path, monkeypatch):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    seats = ("cold viewer", "story editor", "fact reviewer")
    for rnd in (1, 2):
        if rnd == 2:
            script.write_text("## [00:00] Hook\nPROF: Better.\nOOG: Ha.\n")
        assert _lint(video, script, cfg, rnd) == 0
        _fake(monkeypatch, [CLEAN] * 3)
        for s in seats:
            assert cli.main(["seat", str(video), "g2", "--round", str(rnd), "--seat", s, "--config", cfg]) == 0
    _fake(monkeypatch, [{"winner": "A"}, {"winner": "B"}])
    assert cli.main(["judge", str(video), "g2", "--round", "2", "--config", cfg]) == 0
    assert "winner" in json.loads((video / "room" / "g2" / "round-2" / "judge.json").read_text())


def test_lint_owner_notes_writes_the_flag(tmp_path, monkeypatch):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg, 1) == 0
    assert json.loads((video / "room" / "g2" / "round-1" / "meta.json").read_text())["owner_notes"] is False
    assert _lint(video, script, cfg, 2, "g2", "--owner-notes") == 0
    assert json.loads((video / "room" / "g2" / "round-2" / "meta.json").read_text())["owner_notes"] is True
