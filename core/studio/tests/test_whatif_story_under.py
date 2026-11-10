"""The meaning layer (pipeline v2, section 1): one > UNDER: question, never spoken; up to three > DARLING: lines."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path

REAL_ROOT = Path(__file__).resolve().parents[3]
LINTER = REAL_ROOT / "core/engines/whatif/pipeline/story_lint.py"
spec = importlib.util.spec_from_file_location("whatif_story_lint_under", LINTER)
lint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lint)

FIVE = "".join(f"> {n}: x.\n" for n in lint.FIVE)
BODY = "## [00:00] Hook\nMumma calls. You let it ring.\nThe chai goes cold.\n"


def test_under_is_optional_unless_required():
    assert lint.problems(FIVE + BODY) == []
    assert any("UNDER" in p for p in lint.problems(FIVE + BODY, require_under=True))


def test_a_good_under_line_passes():
    assert lint.problems(FIVE + "> UNDER: Would you still forgive if you couldn't forget?\n" + BODY, True) == []


def test_under_must_be_a_question_given_once_before_the_first_beat():
    assert any("question" in p for p in lint.problems(FIVE + "> UNDER: Forgiveness matters.\n" + BODY, True))
    assert any("once" in p for p in lint.problems(FIVE + "> UNDER: A?\n> UNDER: B?\n" + BODY, True))
    assert any("before the first beat" in p for p in lint.problems(FIVE + BODY + "> UNDER: A?\n", True))


def test_darlings_are_spoken_lines_and_at_most_three():
    assert lint.problems(FIVE + '> DARLING: "Mumma calls. You let it ring."\n' + BODY) == []
    assert any("DARLING" in p or "darling" in p for p in lint.problems(FIVE + "> DARLING: Not here.\n" + BODY))
    four = FIVE + "> DARLING: The chai goes cold.\n" * 4 + BODY
    assert any("at most three" in p for p in lint.problems(four))


def test_under_from_requires_it_only_for_new_videos(tmp_path):
    for name, code in (("2026-11-09_old", 0), ("2026-11-10_new", 1), ("no-date", 0)):
        video = tmp_path / name
        video.mkdir()
        (video / "script.md").write_text(FIVE + BODY)
        run = subprocess.run(
            [sys.executable, str(LINTER), str(video / "script.md"), "--under-from", "2026-11-10"],
            capture_output=True,
            text=True,
        )
        assert run.returncode == code, (name, run.stdout, run.stderr)


def test_a_bad_under_from_date_is_a_usage_error(tmp_path):
    (tmp_path / "script.md").write_text(FIVE + BODY)
    run = subprocess.run([sys.executable, str(LINTER), str(tmp_path / "script.md"), "--under-from", "soon"])
    assert run.returncode == 2
