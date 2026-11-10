"""Model registry: which family each model id belongs to, which CLI runs it, and its call timeout (models.yaml)."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml

REGISTRY = Path(__file__).resolve().parent / "models.yaml"
CLIS = ("claude", "cursor")
DEFAULT_TIMEOUT_S = 600
MAX_TIMEOUT_S = 1800


class UnknownModel(ValueError):
    pass


def load_registry(path: Path = REGISTRY) -> dict[str, dict[str, str]]:
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    models = data.get("models") or {}
    for model, entry in models.items():
        if not isinstance(entry, dict) or not entry.get("family") or entry.get("cli") not in CLIS:
            raise ValueError(f"{path}: {model} needs a family and a cli in {CLIS}")
        timeout = entry.get("timeout_s", DEFAULT_TIMEOUT_S)
        if isinstance(timeout, bool) or not isinstance(timeout, int) or not 0 < timeout <= MAX_TIMEOUT_S:
            raise ValueError(
                f"{path}: {model} timeout_s must be whole seconds from 1 to {MAX_TIMEOUT_S}, not {timeout!r}"
            )
    return models


def _entry(model: str, registry: Optional[dict] = None) -> dict[str, str]:
    reg = load_registry() if registry is None else registry
    if model not in reg:
        raise UnknownModel(f"{model!r} is not in {REGISTRY.name}")
    return reg[model]


def family_of(model: str, registry: Optional[dict] = None) -> str:
    return _entry(model, registry)["family"]


def cli_of(model: str, registry: Optional[dict] = None) -> str:
    return _entry(model, registry)["cli"]


def timeout_of(model: str, registry: Optional[dict] = None) -> int:
    """Seconds one call to `model` may run before it is killed and recorded as a timeout (exit 124)."""
    return int(_entry(model, registry).get("timeout_s", DEFAULT_TIMEOUT_S))
