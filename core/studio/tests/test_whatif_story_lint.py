"""The what-if story linter (core/engines/whatif/pipeline/story_lint.py): the mechanical part of Say Suppose's
rules/story.md, run by the room's lint before any seat reads a script."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path

import pytest

REAL_ROOT = Path(__file__).resolve().parents[3]
LINTER = REAL_ROOT / "core/engines/whatif/pipeline/story_lint.py"
spec = importlib.util.spec_from_file_location("whatif_story_lint", LINTER)
lint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lint)

FIVE = """> SITUATION: You lose track of who you see for the last time.
> DESIRE: You want one more ordinary evening with your grandfather.
> CONFLICT: The counter says this visit is the last, and you have an exam.
> CHANGE: You stop treating goodbyes as small.
> RESULT: You leave the exam hall early, and you are late anyway, but you went.
"""

BODY = """
## [00:00] The change
> MOOD: day
> SCENE: A bus stop.
On a Tuesday, a number appears over your friend's head.
"""


def script(five: str = FIVE, body: str = BODY) -> str:
    return "# Script: Test\n\nformat: story\nstatus: draft\nclaims: claims.md\n\n" + five + body


def test_a_script_with_the_five_lines_first_passes():
    assert lint.problems(script()) == []


def test_a_script_without_the_five_lines_fails_naming_each_missing_one():
    found = lint.problems(script(five=""))
    assert len(found) == 1 and all(n in found[0] for n in ("SITUATION", "DESIRE", "CONFLICT", "CHANGE", "RESULT"))


def test_the_five_lines_must_come_before_the_first_beat():
    found = lint.problems(script(five="", body=BODY + "\n" + FIVE))
    assert found and "before the first beat" in found[0]


def test_the_five_lines_must_be_in_order():
    lines = FIVE.splitlines()
    swapped = "\n".join([lines[1], lines[0], *lines[2:]]) + "\n"
    assert any("order" in p for p in lint.problems(script(five=swapped)))


def test_an_empty_five_line_fails():
    assert any("DESIRE" in p and "empty" in p for p in lint.problems(script(five=FIVE.replace(
        "You want one more ordinary evening with your grandfather.", ""))))


def test_a_five_line_given_twice_fails():
    twice = FIVE + "> RESULT: Again.\n"
    assert any("RESULT" in p and "once" in p for p in lint.problems(script(five=twice)))


def test_the_five_lines_are_not_spoken_by_the_engine_or_the_claims_check():
    """They are `>` direction lines: the claims check and story.py never read them aloud."""
    from studio.claims import spoken_lines
    assert [t for _, t in spoken_lines(script())] == ["On a Tuesday, a number appears over your friend's head."]


def test_the_cli_exits_1_with_the_problems_and_0_when_clean(tmp_path):
    good, bad = tmp_path / "good.md", tmp_path / "bad.md"
    good.write_text(script())
    bad.write_text(script(five=""))
    ok = subprocess.run([sys.executable, str(LINTER), str(good)], capture_output=True, text=True)
    fail = subprocess.run([sys.executable, str(LINTER), str(bad)], capture_output=True, text=True)
    assert ok.returncode == 0
    assert fail.returncode == 1 and "SITUATION" in fail.stdout


def test_the_cli_refuses_a_missing_file(tmp_path):
    proc = subprocess.run([sys.executable, str(LINTER), str(tmp_path / "nope.md")], capture_output=True, text=True)
    assert proc.returncode == 2
