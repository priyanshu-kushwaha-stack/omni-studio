"""Every Say Suppose prompt file follows the layout in channels/say-suppose/prompts/README.md."""

import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[4]
PROMPTS = ROOT / "channels" / "say-suppose" / "prompts"
EXPECTED = [
    "topic",
    "outline",
    "script",
    "cast-pass",
    "shots",
    "narration",
    "character-voice",
    "set-plate",
    "parts-sheet",
    "cast-lineup",
    "thumbnail",
    "score",
]
HEADINGS = ["# ", "Model:", "Used by:", "Source:", "## Inputs", "## Prompt", "## Checklist"]
BLANK = re.compile(r"\{\{([a-z_]+)\}\}")


def prompt_files() -> list[Path]:
    return sorted(p for p in PROMPTS.glob("*.md") if p.name != "README.md")


def test_readme_names_the_layout():
    text = (PROMPTS / "README.md").read_text(encoding="utf-8")
    for h in HEADINGS:
        assert h.strip() in text


@pytest.mark.parametrize("path", prompt_files(), ids=lambda p: p.stem)
def test_prompt_file_layout(path: Path):
    text = path.read_text(encoding="utf-8")
    at = [text.find(h) for h in HEADINGS]
    assert all(i >= 0 for i in at), f"{path.name}: missing one of {HEADINGS}"
    assert at == sorted(at), f"{path.name}: headings out of order"
    assert not re.search(r"\b(TODO|TBD|FIXME)\b", text), f"{path.name}: placeholder left in"
    inputs = text[text.index("## Inputs") : text.index("## Prompt")]
    body = text[text.index("## Prompt") : text.index("## Checklist")]
    for name in set(BLANK.findall(body)):
        assert f"{{{{{name}}}}}" in inputs, f"{path.name}: blank {{{{{name}}}}} not listed under Inputs"


def test_every_expected_prompt_exists():
    have = {p.stem for p in prompt_files()}
    missing = [n for n in EXPECTED if n not in have]
    assert not missing, f"prompt files still to write: {missing}"
