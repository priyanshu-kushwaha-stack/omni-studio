"""The studio-room skill names every room command and the invariants it must not break."""

from __future__ import annotations

from pathlib import Path

SKILL = Path(__file__).resolve().parents[3] / "core" / "openmontage" / "skills" / "studio" / "studio-room.md"


def test_the_skill_exists_and_names_every_step():
    text = SKILL.read_text()
    for needle in (
        "python -m studio.room lint",
        "python -m studio.room seat",
        "python -m studio.room judge",
        "python -m studio.room report",
        "python -m studio.room verify",
        "awaiting_human",
        "Never write",
        "best candidate",
        "taste.md",
        "--owner-notes",
    ):
        assert needle in text, needle


def test_the_skill_names_the_pipeline_v2_steps():
    text = SKILL.read_text()
    for needle in (
        "python -m studio.room present",
        "python -m studio.room times",
        "python -m studio.room scorecard",
        "author's cut",
        "review-$G-marks.yaml",
        "viewer_required",
        "never a third",
    ):
        assert needle in text, needle


def test_the_whatif_skills_carry_the_audition_and_the_look_test():
    skills = SKILL.parent
    assert "audition" in (skills / "studio-whatif-narration.md").read_text()
    assert "look test" in (skills / "studio-whatif-rough-cut.md").read_text()
    assert "> UNDER:" in (skills / "studio-whatif-proposal.md").read_text()
