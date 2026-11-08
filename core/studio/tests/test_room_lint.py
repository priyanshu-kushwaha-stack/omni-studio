"""Lint before opinion: slop words, 'and then', word budget, cadence, ledger quotes, channel linters."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from studio.room import lint

OK_LINTER = "core/studio/room/lint.py"  # a real file under ROOT/core

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

    problems = lint.run_linters([f"{{python}} {OK_LINTER} {{script}}"], script=tmp_path / "s.md", video_dir=tmp_path,
                                runner=runner)
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


def test_a_word_inside_a_hit_phrase_is_not_a_second_hit():
    assert len(lint.slop_hits("PROF: It is a testament to grit.\n", lint.load_slop())) == 1


def test_curly_quotes_are_read_like_straight_ones():
    slop = lint.load_slop()
    assert len(lint.slop_hits("PROF: It’s not fire, it’s light.\n", slop)) >= 1
    assert len(lint.slop_hits("PROF: It’s important to note this.\n", slop)) >= 1


def test_generic_explainer_words_are_not_slop():
    slop = lint.load_slop()
    for w in ("landscape", "navigate", "crucial", "unlock"):
        assert w not in slop["words"]
    assert "plays a crucial role" in slop["phrases"]


def test_a_missing_ledger_is_a_problem(tmp_path):
    (tmp_path / "script.md").write_text(SCRIPT)
    empty = {"words": [], "phrases": [], "patterns": []}
    report = lint.lint_draft(tmp_path / "script.md", kind="script", fmt={}, linters=[],
                             ledger=tmp_path / "claims.md", slop=empty)
    assert "claims.md is missing, so cited claims cannot be checked" in report.problems
    assert lint.lint_draft(tmp_path / "script.md", kind="script", fmt={}, linters=[], ledger=None, slop=empty).ok


def test_placeholder_quotes_count_as_no_quote():
    ledger = LEDGER.replace("|  | sourced |\n", "| TBD | sourced |\n")
    assert lint.ledger_quotes(SCRIPT, ledger) == ["c02: cited in the script but its ledger row has no verbatim quote"]


def test_a_script_path_with_a_space_stays_one_argument(tmp_path):
    seen = []

    def runner(cmd, **kw):
        seen.append(cmd)
        return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

    script = tmp_path / "my dir" / "s.md"
    lint.run_linters([f"{{python}} {OK_LINTER} {{script}}"], script=script, video_dir=tmp_path, runner=runner)
    assert seen[0][-1] == str(script)


def test_a_linter_that_cannot_run_is_a_problem_not_a_crash(tmp_path):
    def runner(cmd, **kw):
        raise FileNotFoundError("nope")

    tpl = f"{{python}} {OK_LINTER} {{script}}"
    problems = lint.run_linters([tpl], script=tmp_path / "s.md", video_dir=tmp_path, runner=runner)
    assert len(problems) == 1 and tpl in problems[0]


def test_a_timed_out_linter_is_a_problem(tmp_path):
    def runner(cmd, **kw):
        raise subprocess.TimeoutExpired(cmd, 300)

    tpl = f"{{python}} {OK_LINTER}"
    problems = lint.run_linters([tpl], script=tmp_path / "s.md", video_dir=tmp_path, runner=runner)
    assert len(problems) == 1 and tpl in problems[0]


def test_a_bad_template_is_a_problem(tmp_path):
    problems = lint.run_linters([f"{{python}} {OK_LINTER} {{x}}"], script=tmp_path / "s.md", video_dir=tmp_path,
                                runner=lambda cmd, **kw: None)
    assert len(problems) == 1 and "{x}" in problems[0]


def test_a_linter_is_labelled_by_its_file(tmp_path):
    def runner(cmd, **kw):
        return subprocess.CompletedProcess(cmd, 1, stdout="bad\n", stderr="")

    problems = lint.run_linters([f"{{python}} {OK_LINTER} {{script}}"], script=tmp_path / "s.md", video_dir=tmp_path,
                                runner=runner)
    assert problems[0].startswith("lint.py exited 1")


def _never(cmd, **kw):
    raise AssertionError("a refused linter must not run")


@pytest.mark.parametrize("template", [
    "rm -rf /tmp/x", "{script}", "/bin/sh -c id", "{python} -m foo.bar {script}", "{python} -c 'print(1)'",
    "{python} x.py {script}", "{python} /etc/passwd", "{python} ../../outside.py {script}",
    "{python} {root}/channels/other/evil.py", "{python}", "{python}  "])
def test_a_linter_that_is_not_python_on_a_file_under_core_or_the_channel_is_refused(tmp_path, template):
    problems = lint.run_linters([template], script=tmp_path / "s.md", video_dir=tmp_path, runner=_never)
    assert len(problems) == 1 and template in problems[0]


def test_a_linter_file_in_the_channel_folder_is_allowed(tmp_path):
    chan = tmp_path / "chan"
    chan.mkdir()
    (chan / "check.py").write_text("")
    seen = []
    problems = lint.run_linters([f"{{python}} {chan / 'check.py'} {{script}}"], script=tmp_path / "s.md",
                                video_dir=tmp_path, channel_dir=chan,
                                runner=lambda cmd, **kw: seen.append(cmd) or subprocess.CompletedProcess(cmd, 0, "", ""))
    assert problems == [] and len(seen) == 1
    assert lint.run_linters([f"{{python}} {chan / 'check.py'}"], script=tmp_path / "s.md", video_dir=tmp_path,
                            runner=_never)  # the same file is refused without the channel folder


def test_a_symlink_out_of_core_is_refused(tmp_path):
    outside = tmp_path / "evil.py"
    outside.write_text("")
    link = tmp_path / "chan" / "ok.py"
    link.parent.mkdir()
    link.symlink_to(outside)
    problems = lint.run_linters([f"{{python}} {link}"], script=tmp_path / "s.md", video_dir=tmp_path,
                                channel_dir=link.parent, runner=_never)
    assert len(problems) == 1


def test_the_professor_of_us_linter_is_allowed():
    tpl = "{python} core/engines/pou/scripts/script_lint.py {script} --target-minutes 5"
    seen = []
    assert lint.run_linters([tpl], script=lint.ROOT / "s.md", video_dir=lint.ROOT,
                            runner=lambda cmd, **kw: seen.append(cmd) or subprocess.CompletedProcess(cmd, 0, "", "")) == []
    assert len(seen) == 1


def test_a_cited_id_with_no_row_is_a_problem():
    script = SCRIPT + "PROF: And more (c99).\n"
    assert "c99: cited but not in claims.md" in lint.ledger_quotes(script, LEDGER)


def test_a_dropped_row_that_is_cited_is_a_problem():
    ledger = LEDGER.replace("| sourced |\n| c02", "| sourced |\n| c02").replace("|  | sourced |", '| "two sleeps" | dropped |')
    assert "c02: cited in the script but its ledger row is marked dropped" in lint.ledger_quotes(SCRIPT, ledger)


def test_quotes_are_read_from_every_table():
    ledger = LEDGER + "\n## Second batch\n\n| id | claim | source URL | verbatim quote | status |\n|---|---|---|---|---|\n" \
                      "| c07 | x | https://c.example |  | sourced |\n"
    script = SCRIPT + "PROF: Later (c07).\n"
    problems = lint.ledger_quotes(script, ledger)
    assert "c07: cited in the script but its ledger row has no verbatim quote" in problems
    assert not any("c07: cited but not" in p for p in problems)
