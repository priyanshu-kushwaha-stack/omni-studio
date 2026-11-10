"""owner_first (pipeline v2, section 4 limit 2): the owner reads round 1's draft before any seat runs."""

from __future__ import annotations

from studio.room import __main__ as cli
from studio.room import report as R

ROOM = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 1
owner_first: true
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
"""
CLEAN = {"scores": {}, "blockers": [], "suggestions": [], "keep": []}


def _video(tmp_path):
    channel = tmp_path / "say-suppose"
    video = channel / "videos" / "2026-11-10_x"
    video.mkdir(parents=True)
    (channel / "room.yaml").write_text(ROOM)
    script = video / "script.md"
    script.write_text("## [00:00] Hook\nYou stop.\n")
    return video, script, str(channel / "room.yaml")


def _lint(video, script, cfg, rnd="1", *extra):
    return cli.main(["lint", str(video), "g2", "--round", rnd, "--draft", str(script), "--config", cfg, *extra])


def _seat(video, cfg, seat="story editor", rnd="1"):
    return cli.main(["seat", str(video), "g2", "--round", rnd, "--seat", seat, "--config", cfg])


def test_lint_records_when_it_ran(tmp_path):
    video, script, cfg = _video(tmp_path)
    assert _lint(video, script, cfg) == 0
    assert R.read_meta(video, "g2", 1)["linted_at"].endswith("+00:00")


def test_a_round_one_seat_waits_for_the_owner(tmp_path, capsys, fake_cli):
    video, script, cfg = _video(tmp_path)
    _lint(video, script, cfg)
    assert _seat(video, cfg) == 2
    assert "owner first" in capsys.readouterr().err
    assert cli.main(["present", str(video), "g2", "--config", cfg]) == 0
    assert R.read_presented(video, "g2")["draft_sha256"] == R.read_meta(video, "g2", 1)["draft_sha256"]
    fake_cli([CLEAN])
    assert _seat(video, cfg) == 0


def test_present_needs_a_clean_round_one(tmp_path, capsys):
    video, script, cfg = _video(tmp_path)
    assert cli.main(["present", str(video), "g2", "--config", cfg]) == 2
    assert "lint round 1" in capsys.readouterr().err


def test_a_relinted_draft_must_be_presented_again(tmp_path, capsys):
    video, script, cfg = _video(tmp_path)
    _lint(video, script, cfg)
    cli.main(["present", str(video), "g2", "--config", cfg])
    script.write_text("## [00:00] Hook\nYou stop, then go.\n")
    _lint(video, script, cfg)
    assert _seat(video, cfg) == 2
    assert "owner first" in capsys.readouterr().err


def test_owner_notes_rounds_need_no_presentation(tmp_path, fake_cli):
    video, script, cfg = _video(tmp_path)
    _lint(video, script, cfg, "2", "--owner-notes")
    fake_cli([CLEAN])
    assert _seat(video, cfg, rnd="2") == 0


def test_without_owner_first_seats_run_at_once(tmp_path, fake_cli):
    video, script, cfg = _video(tmp_path)
    (video.parents[1] / "room.yaml").write_text(ROOM.replace("owner_first: true\n", ""))
    _lint(video, script, cfg)
    fake_cli([CLEAN])
    assert _seat(video, cfg) == 0
