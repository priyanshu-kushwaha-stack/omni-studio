"""Phase 4: the claims ledger gate, on the real tails ledger and on planted faults."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

from studio import claims

REAL_ROOT = Path(__file__).resolve().parents[3]
TAILS = REAL_ROOT / "channels" / "professor-of-us" / "videos" / "2026-10-31_tails"

HEADER = "| id | claim as it will be spoken | source URL | quote | status | note |\n|----|----|----|----|----|----|\n"
SCRIPT = "# Short\n\n## [00:00] Hook\nPROF: About a sixth of your body (c01).\nOOG: Tails!\n> VISUAL: a tail\n"


def _video(tmp_path, rows, script=SCRIPT):
    folder = tmp_path / "v"
    folder.mkdir()
    (folder / "claims.md").write_text("# Claims ledger\n\n" + HEADER + "\n".join(rows) + "\n")
    (folder / "script.md").write_text(script)
    return folder


GOOD = "| c01 | A sixth of the body. | https://pmc.ncbi.nlm.nih.gov/articles/PMC6417348/ | \"one-sixth\" | sourced | |"


def test_the_real_tails_ledger_passes():
    report = claims.check(TAILS)
    assert report.ok, report.problems
    assert len(report.rows) == 24


def test_a_complete_ledger_passes(tmp_path):
    assert claims.check(_video(tmp_path, [GOOD])).ok


def test_planted_claim_with_no_source_fails(tmp_path):
    report = claims.check(_video(tmp_path, ["| c01 | A sixth of the body. |  | | sourced | |"]))
    assert not report.ok
    assert any("c01: claim has no source" in p for p in report.problems), report.problems


@pytest.mark.parametrize("status", ["", "todo", "unsourced", "needs source"])
def test_unsourced_statuses_fail(tmp_path, status):
    row = f"| c01 | A sixth. | https://example.org/x | q | {status} | |"
    report = claims.check(_video(tmp_path, [row]))
    assert any("is not one of" in p for p in report.problems)


def test_script_citing_a_missing_or_dropped_claim_fails(tmp_path):
    script = SCRIPT + "PROF: And 25 million years ago (c02).\nPROF: Gone (c03).\n"
    dropped = "| c03 | Gone. | | | dropped | not said |"
    report = claims.check(_video(tmp_path, [GOOD, dropped], script))
    assert any("cites c02, which has no row" in p for p in report.problems)
    assert any("cites c03, which the ledger marks dropped" in p for p in report.problems)


def test_spoken_number_with_no_claim_id_fails(tmp_path):
    report = claims.check(_video(tmp_path, [GOOD], SCRIPT + "YOU: In 2024 they found it.\n"))
    assert any("spoken number with no claim id" in p for p in report.problems)


def test_missing_or_empty_ledger_fails(tmp_path):
    folder = tmp_path / "v"
    folder.mkdir()
    assert "no claims ledger" in claims.check(folder).problems[0]
    (folder / "claims.md").write_text("# nothing yet\n")
    (folder / "script.md").write_text(SCRIPT)
    assert any("no ledger rows" in p for p in claims.check(folder).problems)


def test_duplicate_and_malformed_ids_fail(tmp_path):
    report = claims.check(_video(tmp_path, [GOOD, GOOD, GOOD.replace("c01", "x1")]))
    assert any("duplicate id" in p for p in report.problems)
    assert any("id must look like c01" in p for p in report.problems)


def test_tails_ledger_with_one_source_removed_fails(tmp_path):
    copy = tmp_path / "tails"
    copy.mkdir()
    for name in ("claims.md", "script.md"):
        shutil.copy(TAILS / name, copy / name)
    text = (copy / "claims.md").read_text()
    (copy / "claims.md").write_text(text.replace("https://pubmed.ncbi.nlm.nih.gov/677043/", "", 1))
    report = claims.check(copy)
    assert not report.ok and any("c04: claim has no source" in p for p in report.problems)
