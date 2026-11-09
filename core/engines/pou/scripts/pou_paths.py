#!/usr/bin/env python3
"""Where the engine finds channel files, read from the channel's engine.yaml instead of a fixed repo layout.

The channel folder is $POU_CHANNEL_DIR, or channels/professor-of-us/ in this repo. Paths a video stores
(stage.json "video_dir", rig "source" stills, ...) are relative to that folder, so channel_dir() is the
ROOT the puppet scripts join them to. engine.yaml names the font, LoRA, media interpreters and secrets file;
relative entries are relative to the channel folder, and "~" is expanded.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

import yaml

STUDIO_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CHANNEL = STUDIO_ROOT / "channels" / "professor-of-us"
CONFIG_NAME = "engine.yaml"
DEFAULTS = {
    "font": "fonts/PatrickHand-Regular.ttf",
    "rigs": "rigs",
    "lora": "lora/pous_ink.safetensors",
    "media_python": str(STUDIO_ROOT / ".venv-media" / "bin" / "python"),
    "mflux": str(STUDIO_ROOT / ".venv-media" / "bin" / "mflux-generate-flux2"),
    "whisper_python": str(STUDIO_ROOT / ".venv-media" / "bin" / "python"),
    "secrets_env": "~/.config/omni-studio/professor-of-us.env",
}


def channel_dir() -> Path:
    return Path(os.environ.get("POU_CHANNEL_DIR") or DEFAULT_CHANNEL).expanduser().resolve()


@lru_cache(maxsize=None)
def _config(folder: Path) -> dict:
    path = folder / CONFIG_NAME
    data = yaml.safe_load(path.read_text(encoding="utf-8")) if path.is_file() else {}
    if not isinstance(data, dict):
        raise SystemExit(f"{path} must be a mapping of names to paths")
    unknown = sorted(set(data) - set(DEFAULTS))
    if unknown:
        raise SystemExit(f"{path}: unknown keys {unknown}; known: {sorted(DEFAULTS)}")
    return {**DEFAULTS, **data}


def path(name: str) -> Path:
    """One engine.yaml entry as an absolute path."""
    folder = channel_dir()
    value = Path(str(_config(folder)[name])).expanduser()
    return value if value.is_absolute() else (folder / value).resolve()
