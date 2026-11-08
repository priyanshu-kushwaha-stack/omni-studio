"""Lint before opinion: slop words, 'and then', word budget, cadence, ledger quotes, channel linters."""

from __future__ import annotations

import subprocess
from pathlib import Path

from studio.room import lint

SCRIPT = """\
## [00:00] Hook
PROF: Most people think cave people slept eight hours straight (c01).
OOG: Eight? I slept whenever the fire got low.
> ASK: How long did they really sleep?
YOU: Four hours?
PROF: Two sleeps, in fact (c02). And then the fire went out.
"""
LEDGER = """\
| id | claim as it will be spoken | source URL | verbatim quote | status |
|---|---|---|---|---|
| c01 | eight hours | https://a.example | "eight hours" | sourced |
| c02 | two sleeps | https://b.example |  | sourced |
"""


def test_slop_words_are_found():
    slop = {"words": ["delve", "tapestry"], "phrases": ["a testament to"], "patterns": [r"\bnot just [^.]+, but\b"]}
    hits = lint.slop_hits("PROF: Let's delve in. It is a testament to grit.\nOOG: Not just fire, but light.\n", slop)
    assert len(hits) == 3


def test_and_then_is_flagged():
    assert len(lint.and_then(SCRIPT)) == 1


def test_word_count_counts_spoken_words_only():
    assert lint.word_count(SCRIPT) == 29  # claim ids, speaker labels, cues and bare punctuation not counted


def test_cadence_by_marker_and_by_speaker():
    long = "## [00:00] A\n" + "PROF: " + "word " * 200 + "\n> ASK: Why?\nYOU: Because.\n"
    assert lint.cadence(long, wpm=155, max_gap_s=30, marker="> ASK:")  # ~77 s before the first ask
    assert lint.cadence(SCRIPT, wpm=155, max_gap_s=30, marker="> ASK:") == []
    assert lint.cadence(long, wpm=155, max_gap_s=12, speakers=["YOU"])


def test_ledger_quotes_flags_a_cited_row_with_no_quote():
    problems = lint.ledger_quotes(SCRIPT, LEDGER)
    assert problems == ["c02: cited in the script but its ledger row has no verbatim quote"]
    assert lint.ledger_quotes(SCRIPT, "| id | claim | source | status |\n|--|--|--|--|\n") == [
        "claims.md has no verbatim quote column"]


def test_a_failing_channel_linter_is_a_problem(tmp_path):
    def runner(cmd, **kw):
        return subprocess.CompletedProcess(cmd, 1, stdout="[FAIL] item 5: greeting\n", stderr="")

    problems = lint.run_linters(["{python} x.py {script}"], script=tmp_path / "s.md", video_dir=tmp_path, runner=runner)
    assert len(problems) == 1 and "greeting" in problems[0]


def test_lint_draft_puts_it_together(tmp_path):
    (tmp_path / "script.md").write_text(SCRIPT)
    (tmp_path / "claims.md").write_text(LEDGER)
    report = lint.lint_draft(tmp_path / "script.md", kind="script",
                             fmt={"wpm": 155, "word_budget": [10, 20], "cadence": {"marker": "> ASK:", "max_gap_s": 30}},
                             linters=[], ledger=tmp_path / "claims.md", slop={"words": [], "phrases": [], "patterns": []})
    assert not report.ok
    assert any("word budget" in p for p in report.problems)
    assert any("c02" in p for p in report.problems)
    assert any("and then" in w for w in report.warnings)


def test_the_real_slop_list_loads():
    slop = lint.load_slop()
    assert "delve" in slop["words"]
