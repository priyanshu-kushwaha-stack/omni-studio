"""The viewer may share the writer's family but is never the writer's own model (viewer trial round 2, 2026-11-10)."""

from __future__ import annotations

import importlib.util
from pathlib import Path

from studio.room import evidence as E
from studio.room import report as R

_spec = importlib.util.spec_from_file_location("room_evidence_tests", Path(__file__).with_name("test_room_evidence.py"))
_ev = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ev)
MODEL, _setup = _ev.MODEL, _ev._setup

ANTHROPIC_VIEWER = (("viewer", "viewer", "anthropic"), ("story", "story", "openai"), ("fact", "fact", "google"))


def _report(video, db, writer):
    return R.build_report(
        video, gate="g2", stage="s", channel="pou", writer_family="anthropic", writer=writer, ledger=db, cap=29
    )


def test_a_viewer_on_the_writer_family_but_another_model_passes(tmp_path):
    video, script, _, db = _setup(tmp_path, seats=ANTHROPIC_VIEWER)
    assert E.verify(video, _report(video, db, "claude-opus-5-5"), script, db) == []


def test_a_viewer_on_the_writer_model_fails(tmp_path):
    video, script, _, db = _setup(tmp_path, seats=ANTHROPIC_VIEWER)
    problems = E.verify(video, _report(video, db, MODEL["anthropic"]), script, db)
    assert any("viewer" in p and "writer's own model" in p for p in problems)


def test_a_viewer_on_the_writer_family_with_no_writer_named_fails(tmp_path):
    video, script, report, db = _setup(tmp_path, seats=ANTHROPIC_VIEWER)
    assert any("writer's own model" in p for p in E.verify(video, report, script, db))
