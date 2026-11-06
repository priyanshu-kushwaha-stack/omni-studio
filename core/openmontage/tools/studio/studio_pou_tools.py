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

import contextlib
import importlib.util
import io
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


def _engine_module(name: str):
    """Load an engine module by file under a private name (no sys.path change, so no name clashes)."""
    spec = importlib.util.spec_from_file_location(f"studio_pou_{name}", ENGINE / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_cli_args = _engine_module("cli_args")   # argparse only
_motion = _engine_module("motion")       # numpy and PIL only


def _resolve(arg: str | Path) -> Path:
    path = Path(arg).expanduser()
    return path if path.is_absolute() else STUDIO_ROOT / path


def parse_args(parser, args: list[str]):
    """Parse argv exactly as the engine script will, or raise ValueError with argparse's message."""
    err = io.StringIO()
    try:
        with contextlib.redirect_stderr(err):
            return parser.parse_args(args)
    except SystemExit as exc:
        raise ValueError(f"bad arguments for the engine: {err.getvalue().strip() or exc}") from None


def boil_in_motion(motion_json: Path) -> list[str]:
    """Scenes whose motion would boil, read with the engine's own loader (list or dict form)."""
    if not motion_json.is_file():
        return []
    specs = _motion.load_specs(motion_json)
    return [str(k) for k, spec in specs.items() if _motion.boil_effective(spec)]


def boil_in_stage(stage_json: Path) -> list[str]:
    """Scenes of a puppet stage.json that opt into boil (puppet_render.boil_settings: any truthy "boil")."""
    if not stage_json.is_file():
        return []
    stage = json.loads(stage_json.read_text(encoding="utf-8"))
    return [str(sc.get("id")) for sc in stage.get("scenes", []) if isinstance(sc, dict) and sc.get("boil")]

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
    # Not "tts": upstream's catalog contract pins the exact set of tts providers.
    capability = "studio_tts"
    script = "tts.py"
    media = True
    determinism = Determinism.STOCHASTIC
    capabilities = ["narration_from_text", "voice_clone_local"]
    best_for = ["Professor of Us narration with the owner's cloned voice on local engines (qwen3, chatterbox)"]
    not_good_for = ["paid ElevenLabs calls without the owner's approval"]
    resource_profile = ResourceProfile(cpu_cores=4, ram_mb=16000, vram_mb=8000, disk_mb=500)
    input_schema = {**_INPUT_SCHEMA, "required": ["channel", "engine", "args"], "properties": {
        **_INPUT_SCHEMA["properties"],
        "engine": {"type": "string", "enum": list(_cli_args.TTS_ENGINES),
                   "description": "TTS engine; the tool passes --engine itself, so args must not"},
        "args": {"type": "array", "items": {"type": "string"},
                 "description": "tts.py arguments other than --engine; paths relative to the omni-studio root"},
        "owner_approved_paid_call": {"type": "boolean", "default": False,
                                     "description": "required for engine eleven (ElevenLabs, paid)"}}}

    def _refuse(self, args: list[str]) -> str | None:
        return None

    def command(self, inputs: dict[str, Any]) -> tuple[list[str], dict[str, str]]:
        engine = inputs.get("engine")
        if engine not in _cli_args.TTS_ENGINES:
            raise ValueError(f"engine must be one of {list(_cli_args.TTS_ENGINES)}, got {engine!r}")
        args = [str(a) for a in inputs.get("args", [])]
        # tts.py refuses abbreviations and a repeated --engine, so this parse is the engine it will run.
        effective = parse_args(_cli_args.tts_parser(), [*args, "--engine", engine]).engine
        if effective in PAID_TTS_ENGINES and inputs.get("owner_approved_paid_call") is not True:
            raise PermissionError(
                f"engine {effective} is a paid provider call (ElevenLabs). Announce tool, provider, model and cost, "
                f"get the owner's approval, then pass owner_approved_paid_call=true"
            )
        return super().command({**inputs, "args": [*args, "--engine", engine]})


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
        parsed = parse_args(_cli_args.puppet_render_parser(), args)
        if parsed.cmd in {"render", "clips", "frames"}:
            boiled = boil_in_stage(_resolve(parsed.stage))
            if boiled:
                return f"{BOIL_REFUSAL}: stage scenes {boiled} opt into boil"
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
        motion_json = _cli_args.compose_motion_path(parse_args(_cli_args.compose_parser(), args))
        if motion_json is None:
            return None
        boiled = boil_in_motion(_resolve(motion_json))
        return f"{BOIL_REFUSAL}: motion scenes {boiled} would boil (effect boil, or flicker with boil)" if boiled else None


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
