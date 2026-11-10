"""A room may have no judge (Say Suppose, 2026-11-10: one or two reviewers, the writer merges their notes), and a
narrator's local engine satisfies pre_g2_local (docs/superpowers/specs/2026-11-10-say-suppose-first-cut-review-design.md)."""

from __future__ import annotations

import json

from studio.room import __main__ as cli
from studio.room import call
from studio.room import config as C

ROOM = """\
writer: claude-fable-5-1
rounds: 1
daily_cap: 80
adopted: null
pitch_clip: after_g2
viewer_required: false
seats:
  - {name: first-time viewer, role: viewer, model: claude-opus-5-5, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: claims check, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 115}
linters: []
sources: []
"""


def _cfg(tmp_path, text=ROOM):
    (tmp_path / "room.yaml").write_text(text)
    return C.load_room(tmp_path / "room.yaml")


def test_a_room_with_no_judge_loads_and_validates(tmp_path):
    cfg = _cfg(tmp_path)
    assert cfg.judge is None
    assert C.validate(cfg) == []


def test_the_judge_command_does_nothing_without_a_judge(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("OMNI_ROOM_LEDGER", str(tmp_path / "ledger.sqlite"))
    channel = tmp_path / "say-suppose"
    channel.mkdir()
    (channel / "room.yaml").write_text(ROOM)
    video = channel / "videos" / "2026-11-10_x"
    (video / "room" / "g2" / "round-1").mkdir(parents=True)

    def boom(*a, **k):
        raise AssertionError("model call made")

    monkeypatch.setattr(call.subprocess, "run", boom)
    code = cli.main(["judge", str(video), "g2", "--round", "1", "--config", str(channel / "room.yaml")])
    assert code == 0
    assert json.loads(capsys.readouterr().out) == {"judged": False, "why": "no judge in room.yaml"}


def test_pre_g2_local_accepts_a_paid_narrator_with_a_local_engine(tmp_path):
    cfg = _cfg(tmp_path, ROOM.replace("pitch_clip: after_g2", "pitch_clip: pre_g2_local"))
    (tmp_path / "voices.yaml").write_text(
        "voices:\n  narrator: {tool: higgsfield elevenlabs_v4, use: local, local: {engine: qwen3, ref: r.wav}}\n"
    )
    assert C.validate(cfg) == []
    (tmp_path / "voices.yaml").write_text("voices:\n  narrator: {tool: higgsfield elevenlabs_v4}\n")
    assert any("not a free local engine" in p for p in C.validate(cfg))
