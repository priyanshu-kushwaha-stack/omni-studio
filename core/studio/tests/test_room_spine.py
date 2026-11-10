"""The author's cut (pipeline v2, section 4 limits 5-7): round 1's draft beside the shipped one, and what review cost."""

from __future__ import annotations

import json

from studio.room import report as R
from studio.room import snapshot as S
from studio.room import spine
from studio.room.ledger import Ledger

FIRST = """> SITUATION: You see the counter.
> UNDER: Would you still forgive if you couldn't forget?
> DARLING: Mumma calls. You let it ring. Once.
## [00:00] Hook
Mumma calls. You let it ring. Once.
The chai goes cold.
"""
SHIPPED = """> SITUATION: You see the counter.
> UNDER: What would you forgive?
## [00:00] Hook
Mumma calls and you let it ring once.
The chai goes cold.
"""
KEEPS = ["The chai goes cold.", "Mumma calls. You let it ring. Once."]


def test_header_lines_reads_the_spine():
    assert ("UNDER", "Would you still forgive if you couldn't forget?") in spine.header_lines(FIRST)


def test_voice_cost_names_changed_spine_and_lost_keep_lines():
    cost = spine.voice_cost(FIRST, SHIPPED, KEEPS)
    assert cost["header_changed"] == ["UNDER", "DARLING"]
    assert cost["keep_lost"] == ["Mumma calls. You let it ring. Once."]
    assert cost["lines_changed"] == 5  # three lines out, two in


def test_an_untouched_draft_costs_nothing():
    assert spine.voice_cost(FIRST, FIRST, KEEPS) == {"lines_changed": 0, "header_changed": [], "keep_lost": []}


def _round(video, draft, n, text, owner_notes=False):
    draft.write_text(text)
    sha = S.save_draft(video, draft)
    R.write_meta(video, "g2", n, sha, {"ok": True}, owner_notes=owner_notes)
    for seat, role, fam in (("viewer", "viewer", "xai"), ("story", "story", "openai"), ("fact", "fact", "google")):
        rec = {
            "call_id": f"{seat}{n}",
            "seat": seat,
            "role": role,
            "model": "m",
            "family": fam,
            "status": "ok",
            "blockers": [],
            "keep": [{"quote": KEEPS[1]}] if role == "story" else [],
        }
        (R.round_dir(video, "g2", n) / f"{seat}.json").write_text(json.dumps(rec))


def test_the_report_shows_the_author_cut(tmp_path):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    draft = video / "script.md"
    _round(video, draft, 1, FIRST)
    _round(video, draft, 2, SHIPPED, owner_notes=True)
    rep = R.build_report(
        video,
        gate="g2",
        stage="story_script",
        channel="ss",
        writer_family="anthropic",
        ledger=Ledger(tmp_path / "l.sqlite"),
        cap=20,
    )
    assert rep["shipped"]["round"] == 2 and rep["author_cut"]["round"] == 1
    assert rep["author_cut"]["cost"]["keep_lost"] == [KEEPS[1]]
    _, md = R.write_report(video, rep)
    text = md.read_text()
    assert "## Author's cut" in text and "room/drafts/" in text and "keep lines lost: 1" in text


def test_no_shipped_round_means_no_author_cut(tmp_path):
    video = tmp_path / "2026-11-10_x"
    video.mkdir()
    R.write_meta(video, "g2", 1, "a" * 64, {"ok": False})
    rep = R.build_report(
        video,
        gate="g2",
        stage="story_script",
        channel="ss",
        writer_family="anthropic",
        ledger=Ledger(tmp_path / "l.sqlite"),
        cap=20,
    )
    assert rep["author_cut"] is None
