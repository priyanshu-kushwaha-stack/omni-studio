import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from narration_text import clean, sections, split_parts  # noqa: E402

SCRIPT = """# Script
template: mystery

## [00:00] One
> VISUAL: a thing draws in
Ancient humans did not sleep *eight* hours (c01).
Second line.

## [00:45] Two
> VISUAL: another
The Tsimane in Bolivia.

## Chapters
00:00 One
"""


def test_clean_strips_emphasis_and_claim_refs():
    assert clean("did not sleep *eight* hours (c01).") == "did not sleep eight hours."


def test_sections_skip_beats_headings_and_chapters():
    secs = sections(SCRIPT)
    assert [h for h, _ in secs] == ["[00:00] One", "[00:45] Two"]
    assert secs[0][1] == "Ancient humans did not sleep eight hours. Second line."
    assert secs[1][1] == "The Chimane in Bolivia."


def test_split_parts_groups_sections():
    parts = split_parts(sections(SCRIPT), "1-2")
    assert len(parts) == 1 and parts[0]["sections"] == ["[00:00] One", "[00:45] Two"]
    assert parts[0]["text"].endswith("Second line. The Chimane in Bolivia.")
