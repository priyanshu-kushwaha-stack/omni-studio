"""The model registry: every seat's model maps to a family and a CLI."""

from __future__ import annotations

import pytest

from studio.room import models


def test_the_real_registry_loads_and_knows_the_default_panel():
    reg = models.load_registry()
    assert models.family_of("claude-opus-5-5", reg) == "anthropic"
    assert models.family_of("gpt-5.6-sol-high", reg) == "openai"
    assert models.family_of("grok-4.7-high", reg) == "xai"
    assert models.family_of("gemini-3.7-flash-high", reg) == "google"
    assert models.cli_of("claude-opus-5-5", reg) == "claude"
    assert models.cli_of("grok-4.7-high", reg) == "cursor"


def test_an_unknown_model_is_refused():
    with pytest.raises(models.UnknownModel):
        models.family_of("some-model-9", {"a": {"family": "x", "cli": "claude"}})


def test_an_entry_without_family_or_with_a_bad_cli_is_refused(tmp_path):
    bad = tmp_path / "models.yaml"
    bad.write_text("models:\n  m1: {family: openai, cli: bash}\n")
    with pytest.raises(ValueError, match="m1"):
        models.load_registry(bad)


def test_timeout_defaults_to_600_and_reads_timeout_s():
    reg = {"a": {"family": "x", "cli": "claude"}, "b": {"family": "y", "cli": "cursor", "timeout_s": 900}}
    assert models.timeout_of("a", reg) == models.DEFAULT_TIMEOUT_S == 600
    assert models.timeout_of("b", reg) == 900


def test_the_real_registry_gives_grok_more_time_than_the_default():
    reg = models.load_registry()
    assert models.timeout_of("grok-4.7-high", reg) > 600
    assert models.timeout_of("claude-opus-5-5", reg) == 600


@pytest.mark.parametrize("value", ["0", "-5", "abc", "true", "1801", "[900]"])
def test_a_bad_timeout_is_refused(tmp_path, value):
    bad = tmp_path / "models.yaml"
    bad.write_text(f"models:\n  m1: {{family: openai, cli: cursor, timeout_s: {value}}}\n")
    with pytest.raises(ValueError, match="m1.*timeout_s"):
        models.load_registry(bad)
