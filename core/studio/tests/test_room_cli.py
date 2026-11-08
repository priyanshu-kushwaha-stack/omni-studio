"""python -m studio.room: lint, seat, judge, report and verify, end to end with a fake CLI."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

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
    # adapted: the lock is now for any re-lint of a reviewed round, with one message (final fix 4)
    assert "round 1 has been reviewed; start round 2" in capsys.readouterr().err
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


def _run_seats(video, cfg, monkeypatch, rnd=1, seats=("cold viewer", "story editor", "fact reviewer")):
    _fake(monkeypatch, [CLEAN] * len(seats))
    for seat in seats:
        assert cli.main(["seat", str(video), "g2", "--round", str(rnd), "--seat", seat, "--config", cfg]) == 0


def test_any_relint_of_a_reviewed_round_is_refused_even_the_same_draft(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    _run_seats(video, cfg, monkeypatch, seats=("cold viewer",))
    capsys.readouterr()
    assert _lint(video, script, cfg) == 2
    assert "round 1 has been reviewed; start round 2" in capsys.readouterr().err
    assert _lint(video, script, cfg, 1, "g2", "--owner-notes") == 2  # owner-notes cannot be added after review
    assert json.loads((video / "room" / "g2" / "round-1" / "meta.json").read_text())["owner_notes"] is False


def test_a_reserved_ledger_row_also_locks_the_round(tmp_path, monkeypatch, capsys):
    from studio.room.ledger import Ledger
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    Ledger().reserve(channel="professor-of-us", video=video.name, gate="g2", round=1, seat="x", model="m",
                     family="f", prompt_sha256="p", daily_cap=99, script_cap=99)  # a crashed call, no file
    capsys.readouterr()
    assert _lint(video, script, cfg) == 2 and "has been reviewed" in capsys.readouterr().err
    assert _lint(video, script, cfg, 2) == 0  # another round is untouched


def test_a_judge_file_locks_the_round(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    (video / "room" / "g2" / "round-1" / "judge.json").write_text("{}")
    assert _lint(video, script, cfg) == 2


@pytest.mark.parametrize("gate,kind", [("g1", "script"), ("g2", "packaging")])
def test_a_kind_that_does_not_fit_the_gate_is_refused(tmp_path, monkeypatch, capsys, gate, kind):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    capsys.readouterr()
    assert _lint(video, script, cfg, 1, gate, "--kind", kind) == 2
    assert "kind" in capsys.readouterr().err
    assert not (video / "room" / gate / "round-1" / "meta.json").exists()


def test_meta_records_the_kind(tmp_path, monkeypatch):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg, 1, "g2", "--kind", "script") == 0
    assert json.loads((video / "room" / "g2" / "round-1" / "meta.json").read_text())["kind"] == "script"
    assert _lint(video, script, cfg, 2) == 0
    assert json.loads((video / "room" / "g2" / "round-2" / "meta.json").read_text())["kind"] == "script"


def test_an_ok_seat_cannot_be_rerun_but_a_failed_one_can(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    base = ["seat", str(video), "g2", "--round", "1", "--seat", "cold viewer", "--config", cfg]
    # a failed answer (two bad tries) leaves a failed verdict
    monkeypatch.setattr(call.subprocess, "run", lambda cmd, **kw: subprocess.CompletedProcess(
        cmd, 0, stdout="1\n" if cmd[-1] == "--version" else "junk", stderr=""))
    assert cli.main(base) == 1
    _fake(monkeypatch, [CLEAN])
    assert cli.main(base) == 0  # re-run after failed: allowed
    from studio.room.ledger import Ledger
    n = Ledger().count()
    capsys.readouterr()
    boom = lambda *a, **k: (_ for _ in ()).throw(AssertionError("model call made"))
    monkeypatch.setattr(call.subprocess, "run", boom)
    assert cli.main(base) == 2
    assert "already has an ok verdict" in capsys.readouterr().err
    assert Ledger().count() == n


def test_seats_on_a_failed_lint_need_the_calibration_flag(tmp_path, monkeypatch, capsys):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg, 1, "g2", "--ledger-file", str(tmp_path / "missing-claims.md")) == 1
    base = ["seat", str(video), "g2", "--round", "1", "--seat", "cold viewer", "--config", cfg]
    boom = lambda *a, **k: (_ for _ in ()).throw(AssertionError("model call made"))
    monkeypatch.setattr(call.subprocess, "run", boom)
    capsys.readouterr()
    assert cli.main(base) == 2
    assert "lint failed" in capsys.readouterr().err
    _fake(monkeypatch, [CLEAN])
    assert cli.main(base + ["--allow-failed-lint"]) == 0
    record = json.loads((video / "room" / "g2" / "round-1" / "cold-viewer.json").read_text())
    assert record["lint_overridden"] is True


def test_the_seat_verdict_is_bound_to_the_rounds_draft(tmp_path, monkeypatch):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    _run_seats(video, cfg, monkeypatch, seats=("cold viewer",))
    sha = json.loads((video / "room" / "g2" / "round-1" / "meta.json").read_text())["draft_sha256"]
    record = json.loads((video / "room" / "g2" / "round-1" / "cold-viewer.json").read_text())
    assert record["draft_sha256"] == sha and "lint_overridden" not in record


@pytest.mark.parametrize("sub", ["seat", "judge"])
def test_input_paths_into_secret_folders_are_refused(tmp_path, monkeypatch, capsys, sub):
    import os
    import pwd
    video, script, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, script, cfg) == 0
    home = Path(pwd.getpwuid(os.getuid()).pw_dir)
    boom = lambda *a, **k: (_ for _ in ()).throw(AssertionError("model call made"))
    monkeypatch.setattr(call.subprocess, "run", boom)
    extra = ["--seat", "cold viewer"] if sub == "seat" else []
    link = tmp_path / "innocent.md"
    link.symlink_to(home / ".ssh" / "id_rsa")
    for path in (home / ".config" / "omni-studio" / "key", home / ".aws" / "credentials", link):
        capsys.readouterr()
        assert cli.main([sub, str(video), "g2", "--round", "1", "--config", cfg, *extra,
                         "--input", f"x={path}"]) == 2
        assert "secret" in capsys.readouterr().err
    repo_file = Path(cli.__file__).resolve().parents[3] / "CLAUDE.md"
    assert repo_file.is_file()


def test_judge_takes_inputs_into_its_prompt(tmp_path, monkeypatch):
    video, script, cfg = _setup(tmp_path, monkeypatch)
    for rnd in (1, 2):
        if rnd == 2:
            script.write_text("## [00:00] Hook\nPROF: Better.\nOOG: Ha.\n")
        assert _lint(video, script, cfg, rnd) == 0
        _run_seats(video, cfg, monkeypatch, rnd)
    aud = tmp_path / "audience.md"
    aud.write_text("Teens who like maps")
    prompts = []

    def run(cmd, **kw):
        if cmd[0] == "git" or cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        prompts.append(cmd[-1])
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": '{"winner": "A"}'}), stderr="")

    monkeypatch.setattr(call.subprocess, "run", run)
    assert cli.main(["judge", str(video), "g2", "--round", "2", "--config", cfg, "--input", f"audience.md={aud}"]) == 0
    assert len(prompts) == 2 and all("=== audience.md ===\nTeens who like maps" in p for p in prompts)
    assert cli.main(["judge", str(video), "g2", "--round", "2", "--config", cfg, "--input", "nonsense"]) == 2
