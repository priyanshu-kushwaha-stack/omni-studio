"""An owner note registered at a gate adds two rounds of required seats to its cap
(docs/superpowers/specs/2026-11-12-room-owner-note-budget-design.md)."""

from __future__ import annotations

import json
import subprocess

from studio.room import __main__ as cli
from studio.room import call
from studio.room import config as C
from studio.room import owner_notes as O
from studio.room.ledger import Ledger

ROOM = """\
writer: claude-fable-5-1
rounds: 1
daily_cap: 80
viewer_required: false
adopted: null
pitch_clip: after_g2
seats:
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: claims check, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
linters: []
sources: []
"""
TASTE = """\
# Taste

## 2026-11-11

- **"Not necessarily it needs to revolve around India."** The setting follows the content.
- **"Remove the concept of viewer."** "You" is anyone.
"""
INDIA = "Not necessarily it needs to revolve around India."
VIEWER = "Remove the concept of viewer."
CLEAN = {"scores": {}, "blockers": [], "suggestions": [], "keep": []}


def _setup(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "say-suppose"
    channel.mkdir()
    (channel / "room.yaml").write_text(ROOM)
    (channel / "taste.md").write_text(TASTE)
    video = channel / "videos" / "2026-11-11_x"
    video.mkdir(parents=True)
    draft = video / "packaging.md"
    draft.write_text("# Packaging\n\nEvery midnight, your money doubles.\n")
    return video, draft, str(channel / "room.yaml")


def _lint(video, draft, cfg, rnd, gate="g1", *extra):
    return cli.main(["lint", str(video), gate, "--round", str(rnd), "--draft", str(draft), "--config", cfg, *extra])


def _meta(video, rnd, gate="g1"):
    return json.loads((video / "room" / gate / f"round-{rnd}" / "meta.json").read_text())


def _fill(video, n, gate="g1"):
    """n calls already spent at the gate (rounds before this one)."""
    for i in range(n):
        Ledger().reserve(
            channel="say-suppose",
            video=video.name,
            gate=gate,
            round=0,
            seat=f"old {i}",
            model="gpt-5.6-sol-high",
            family="openai",
            prompt_sha256="0" * 64,
            daily_cap=80,
            script_cap=10_000,
        )


def _fake(monkeypatch):
    def run(cmd, **kw):
        if cmd[0] == "git":
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": json.dumps(CLEAN)}), stderr="")

    monkeypatch.setattr(call.subprocess, "run", run)


def test_taste_quotes_are_the_bold_quoted_words(tmp_path):
    (tmp_path / "taste.md").write_text(TASTE)
    assert O.taste_quotes(tmp_path) == [INDIA, VIEWER]
    assert O.taste_quotes(tmp_path / "missing") == []


def test_gate_cap_adds_two_rounds_of_required_seats_per_note(tmp_path, monkeypatch):
    video, draft, cfg = _setup(tmp_path, monkeypatch)
    room = C.load_room(video.parent.parent / "room.yaml")
    assert C.derived_cap(room) == 16
    assert O.gate_cap(room, video, "g1") == 16
    assert _lint(video, draft, cfg, 2, "g1", "--owner-notes", "--owner-note", INDIA) == 0
    assert O.gate_cap(room, video, "g1") == 16 + 2 * 2
    assert _lint(video, draft, cfg, 3, "g1", "--owner-notes", "--owner-note", VIEWER) == 0
    assert O.gate_cap(room, video, "g1") == 16 + 2 * 2 * 2
    assert O.gate_cap(room, video, "g2") == 16  # a note buys rounds only at the gate it was registered at


def test_lint_records_the_notes_in_the_round_meta(tmp_path, monkeypatch):
    video, draft, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, draft, cfg, 1) == 0
    assert _meta(video, 1)["owner_note"] == []
    args = ["--owner-notes", "--owner-note", INDIA, "--owner-note", "  Remove the concept\n of viewer. "]
    assert _lint(video, draft, cfg, 2, "g1", *args) == 0
    assert _meta(video, 2)["owner_note"] == [INDIA, VIEWER]
    assert O.registered(video, "g1") == [INDIA, VIEWER]


def test_lint_refuses_a_note_without_owner_notes_unknown_words_or_twice(tmp_path, monkeypatch, capsys):
    video, draft, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, draft, cfg, 1, "g1", "--owner-note", INDIA) == 2
    assert "only with --owner-notes" in capsys.readouterr().err
    assert _lint(video, draft, cfg, 2, "g1", "--owner-notes", "--owner-note", "Make it louder.") == 2
    assert "no bold quote in taste.md" in capsys.readouterr().err
    assert _lint(video, draft, cfg, 2, "g1", "--owner-notes", "--owner-note", INDIA) == 0
    assert _lint(video, draft, cfg, 3, "g1", "--owner-notes", "--owner-note", INDIA) == 2
    assert "already registered at g1" in capsys.readouterr().err
    assert _lint(video, draft, cfg, 2, "g2", "--owner-notes", "--owner-note", INDIA) == 0  # another gate


def test_relinting_a_round_keeps_its_own_note(tmp_path, monkeypatch):
    video, draft, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, draft, cfg, 2, "g1", "--owner-notes", "--owner-note", INDIA) == 0
    draft.write_text("# Packaging\n\nEvery midnight, your money doubles. Fixed.\n")
    assert _lint(video, draft, cfg, 2, "g1", "--owner-notes", "--owner-note", INDIA) == 0  # same round, not reviewed


def test_seat_calls_use_the_raised_cap(tmp_path, monkeypatch, capsys):
    video, draft, cfg = _setup(tmp_path, monkeypatch)
    _fake(monkeypatch)
    _fill(video, 16)
    seat = ["seat", str(video), "g1", "--round", "9", "--seat", "story editor", "--config", cfg]
    assert _lint(video, draft, cfg, 9, "g1", "--owner-notes") == 0
    assert cli.main(seat) == 1
    assert "16 of 16 calls used" in capsys.readouterr().err
    assert _lint(video, draft, cfg, 9, "g1", "--owner-notes", "--owner-note", INDIA) == 0
    assert cli.main(seat) == 0


def test_the_report_cap_is_the_gate_cap(tmp_path, monkeypatch):
    video, draft, cfg = _setup(tmp_path, monkeypatch)
    assert _lint(video, draft, cfg, 2, "g1", "--owner-notes", "--owner-note", INDIA, "--owner-note", VIEWER) == 0
    assert cli.main(["report", str(video), "g1", "--stage", "proposal", "--config", cfg]) == 0
    assert json.loads((video / "room" / "g1.json").read_text())["cap"] == 24
