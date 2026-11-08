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
