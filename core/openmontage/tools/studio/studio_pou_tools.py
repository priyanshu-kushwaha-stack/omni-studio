"""omni-studio: the Professor of Us engine (core/engines/pou) as OpenMontage tools.

Each tool runs one engine script in a subprocess, with the channel folder in POU_CHANNEL_DIR so the engine
reads that channel's engine.yaml (font, rigs, LoRA, interpreters, secrets file). Media tools (pou_tts,
pou_stills) run under the root .venv-media interpreter (NumPy 1.26, torch, mlx); the rest run under the
interpreter that discovered them.

Inputs: {"channel": "<slug>", "args": [<the script's own CLI arguments>]}. Relative paths in args are
relative to the omni-studio root. Nothing here uploads, and pou_tts refuses its paid engine (ElevenLabs)
unless the owner approved that call.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from abc import abstractmethod
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)

STUDIO_ROOT = Path(__file__).resolve().parents[4]
ENGINE = STUDIO_ROOT / "core" / "engines" / "pou" / "scripts"
MEDIA_PYTHON = STUDIO_ROOT / ".venv-media" / "bin" / "python"
SLUG_RE = re.compile(r"^[a-z]+(-[a-z]+)*$")
PAID_TTS_ENGINES = {"eleven"}
BOIL_REFUSAL = "line boil / wobble is banned by the owner (core/studio/rules/no-line-boil.md)"


def _resolve(arg: str) -> Path:
    path = Path(arg).expanduser()
    return path if path.is_absolute() else STUDIO_ROOT / path


def boil_in_motion(motion_json: Path) -> list[str]:
    """Scenes of a motion.json that ask for the boil effect."""
    if not motion_json.is_file():
        return []
    specs = json.loads(motion_json.read_text(encoding="utf-8"))
    return [str(m.get("scene")) for m in specs if isinstance(m, dict) and m.get("effect") == "boil"]


def boil_in_stage(stage_json: Path) -> list[str]:
    """Scenes of a puppet stage.json with boil switched on."""
    if not stage_json.is_file():
        return []
    stage = json.loads(stage_json.read_text(encoding="utf-8"))
    return [str(sc.get("id")) for sc in stage.get("scenes", []) if sc.get("boil")]

_INPUT_SCHEMA = {
    "type": "object",
    "required": ["channel", "args"],
    "properties": {
        "channel": {"type": "string", "description": "channel slug, e.g. professor-of-us"},
        "args": {"type": "array", "items": {"type": "string"},
                 "description": "the engine script's CLI arguments; paths relative to the omni-studio root"},
        "timeout_seconds": {"type": "number", "default": 3600},
    },
}


class _PouEngineTool(BaseTool):
    """One engine script behind the tool contract. Abstract: only the subclasses register."""

    version = "0.1.0"
    tier = ToolTier.CORE
    provider = "omni-studio"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.SYNC
    runtime = ToolRuntime.LOCAL
    dependencies = ["binary:ffmpeg"]
    input_schema = _INPUT_SCHEMA
    agent_skills: list[str] = []
    side_effects = ["writes files in the channel's videos/ folder"]
    script: str = ""
    media: bool = False

    @abstractmethod
    def _refuse(self, args: list[str]) -> str | None:
        """A reason this call must not run, or None."""

    def python(self) -> Path:
        return MEDIA_PYTHON if self.media else Path(sys.executable)

    def get_status(self) -> ToolStatus:
        if not (ENGINE / self.script).is_file() or not self.python().is_file():
            return ToolStatus.UNAVAILABLE
        return ToolStatus.AVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def command(self, inputs: dict[str, Any]) -> tuple[list[str], dict[str, str]]:
        slug = inputs.get("channel")
        if not isinstance(slug, str) or not SLUG_RE.fullmatch(slug):
            raise ValueError(f"bad channel slug {slug!r}")
        channel = (STUDIO_ROOT / "channels" / slug).resolve()
        if not channel.is_relative_to((STUDIO_ROOT / "channels").resolve()) or not (channel / "channel.yaml").is_file():
            raise ValueError(f"no channel {slug!r} in {STUDIO_ROOT / 'channels'}")
        args = [str(a) for a in inputs.get("args", [])]
        reason = self._refuse(args)
        if reason:
            raise PermissionError(reason)
        env = {**os.environ, "POU_CHANNEL_DIR": str(channel), "PYTHONDONTWRITEBYTECODE": "1"}
        return [str(self.python()), str(ENGINE / self.script), *args], env

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        start = time.time()
        try:
            cmd, env = self.command(inputs)
        except (ValueError, PermissionError) as exc:
            return ToolResult(success=False, error=str(exc))
        proc = subprocess.run(cmd, cwd=STUDIO_ROOT, env=env, capture_output=True, text=True,
                              timeout=float(inputs.get("timeout_seconds", 3600)))
        data = {"command": cmd, "returncode": proc.returncode, "stdout": proc.stdout[-20000:],
                "stderr": proc.stderr[-20000:]}
        return ToolResult(success=proc.returncode == 0, data=data, duration_seconds=time.time() - start,
                          error=None if proc.returncode == 0 else f"{self.script} exited {proc.returncode}")


class PouTts(_PouEngineTool):
    name = "pou_tts"
    capability = "tts"
    script = "tts.py"
    media = True
    determinism = Determinism.STOCHASTIC
    capabilities = ["narration_from_text", "voice_clone_local"]
    best_for = ["Professor of Us narration with the owner's cloned voice on local engines (qwen3, chatterbox)"]
    not_good_for = ["paid ElevenLabs calls without the owner's approval"]
    resource_profile = ResourceProfile(cpu_cores=4, ram_mb=16000, vram_mb=8000, disk_mb=500)
    input_schema = {**_INPUT_SCHEMA, "properties": {
        **_INPUT_SCHEMA["properties"],
        "owner_approved_paid_call": {"type": "boolean", "default": False,
                                     "description": "required for --engine eleven (ElevenLabs, paid)"}}}

    def _refuse(self, args: list[str]) -> str | None:
        return None

    def command(self, inputs: dict[str, Any]) -> tuple[list[str], dict[str, str]]:
        args = [str(a) for a in inputs.get("args", [])]
        engine = next((args[i + 1] for i, a in enumerate(args[:-1]) if a == "--engine"), None)
        engine = engine or next((a.split("=", 1)[1] for a in args if a.startswith("--engine=")), None)
        if engine in PAID_TTS_ENGINES and inputs.get("owner_approved_paid_call") is not True:
            raise PermissionError(
                f"--engine {engine} is a paid provider call (ElevenLabs). Announce tool, provider, model and cost, "
                f"get the owner's approval, then pass owner_approved_paid_call=true"
            )
        return super().command(inputs)


class PouStills(_PouEngineTool):
    name = "pou_stills"
    capability = "image_generation"
    script = "stills.py"
    media = True
    determinism = Determinism.SEEDED
    capabilities = ["text_to_image_local", "style_lora"]
    best_for = ["Professor of Us stills: FLUX.2 klein 4B + the pous_ink LoRA through mflux, local"]
    resource_profile = ResourceProfile(cpu_cores=4, ram_mb=20000, vram_mb=12000, disk_mb=2000)

    def _refuse(self, args: list[str]) -> str | None:
        return None


class PouPuppet(_PouEngineTool):
    name = "pou_puppet"
    capability = "character_animation"
    script = "puppet_render.py"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["rig_build", "puppet_render", "puppet_clips", "talk_keys", "dialogue_actions"]
    best_for = ["code puppets cut from the channel's stills: blinks, eye darts, mouths on each speaker's words"]
    not_good_for = ["line boil or wobble (banned)", "lip_sync models (banned)"]
    resource_profile = ResourceProfile(cpu_cores=6, ram_mb=4000)

    def _refuse(self, args: list[str]) -> str | None:
        if args and args[0] in {"render", "clips", "frames"} and len(args) > 1:
            boiled = boil_in_stage(_resolve(args[1]))
            if boiled:
                return f"{BOIL_REFUSAL}: stage scenes {boiled} have boil: true"
        return None


class PouCompose(_PouEngineTool):
    name = "pou_compose"
    capability = "video_composition"
    script = "compose.py"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["compose_edit", "music_bed", "sfx", "captions_srt", "shorts_9x16"]
    best_for = ["the Professor of Us edit: stills, puppet clips, push-ins, overlays, ducked music, SFX"]
    resource_profile = ResourceProfile(cpu_cores=6, ram_mb=6000, disk_mb=2000)

    def _refuse(self, args: list[str]) -> str | None:
        if "--motion" not in args or not args:
            return None
        i = args.index("--motion")
        given = args[i + 1] if i + 1 < len(args) and not args[i + 1].startswith("-") else None
        motion_json = _resolve(given) if given else _resolve(args[0]) / "motion.json"
        boiled = boil_in_motion(motion_json)
        return f"{BOIL_REFUSAL}: motion.json scenes {boiled} use effect boil" if boiled else None


class StudioOverlayCheck(_PouEngineTool):
    name = "overlay_check"
    capability = "analysis"
    script = "overlay_check.py"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["text_placement_check", "text_placement_fix"]
    best_for = ["run with --fix before every render: on-screen text UI-safe, off the drawing and faces, no overlaps"]
    resource_profile = ResourceProfile(cpu_cores=2, ram_mb=2000)

    def _refuse(self, args: list[str]) -> str | None:
        return None
