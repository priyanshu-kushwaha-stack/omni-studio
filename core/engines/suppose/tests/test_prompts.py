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


def _text(name: str) -> str:
    return (PROMPTS / f"{name}.md").read_text(encoding="utf-8")


def test_topic_prompt_keeps_the_owner_rules_and_the_overrides():
    t = _text("topic")
    for must in [
        "Generate 35 new video titles",
        "What If You Had [extreme amount of a trait]?",
        "What If [a unit of everyday experience] Felt Like [extreme]?",
        "What If Your [body or brain ability] Was [N]x [Faster / Stronger / Sharper / Slower]?",
        "no more than one in every five titles",
        "It must carry a whole video",
        "Length: 6–8 words",
        "Benchmark titles",
        "up to five titles outside",
        "{{made_titles}}",
    ]:
        assert must in t, must
    assert "The channel's real titles" not in t


def test_topic_skill_uses_the_prompt_and_retires_the_room():
    skill = (ROOT / ".claude" / "skills" / "say-suppose-topics" / "SKILL.md").read_text(encoding="utf-8")
    assert "channels/say-suppose/prompts/topic.md" in skill
    assert "35" in skill
    for gone in ["Gemini", "GPT-5.6", "scores them blind"]:
        assert gone not in skill


def test_script_prompt_keeps_the_owner_rules_and_the_overrides():
    t = _text("script")
    for must in [
        "900–1,050 words",
        "Never under 800, never over 1,100",
        "ONE continuous paragraph",
        "eighteen to twenty-five",
        "Fifteen to twenty questions",
        "about seven times per hundred words",
        "The hero is never named",
        "Dude! Your door hates me!",
        "{{outline}}",
        "You're standing in the middle of the busiest train station on Earth.",
    ]:
        assert must in t, must
    for gone in ['"Your name is Max."', "Leo! Your door hates me!", "A fly buzzes past your face."]:
        assert gone not in t, gone


def test_outline_cast_pass_and_narration_prompts():
    outline = _text("outline")
    assert all(k in outline for k in ["ALT TITLES:", "SYNOPSIS:", "CHARACTERS:", "RULE:", "PLANTED:", "CHOICE:"])
    cp = _text("cast-pass")
    assert "speaker" in cp and "claims" in cp and "unchanged" in cp
    n = _text("narration")
    assert "Luc" in n and "ellipses" in n and "never robotic" in n
