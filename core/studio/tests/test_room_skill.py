"""The studio-room skill names every room command and the invariants it must not break."""

from __future__ import annotations

from pathlib import Path

SKILL = Path(__file__).resolve().parents[3] / "core" / "openmontage" / "skills" / "studio" / "studio-room.md"


def test_the_skill_exists_and_names_every_step():
    text = SKILL.read_text()
    for needle in ("python -m studio.room lint", "python -m studio.room seat", "python -m studio.room judge",
                   "python -m studio.room report", "python -m studio.room verify", "awaiting_human",
                   "Never write", "best candidate", "taste.md", "--owner-notes"):
        assert needle in text, needle
