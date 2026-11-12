"""omni-studio: the what-if engine (core/engines/whatif) as OpenMontage tools.

whatif_story      script.md -> story.json (Python, no cost)
whatif_narration  story.json -> voice takes, word timings, props.json. New takes are paid Higgsfield calls: without
                  owner_approved_paid_call and a max_credits cap the tool passes no cap, so the build reuses cached
                  takes and refuses any new one.
whatif_render     Remotion render of a scene entry, then the loudness limiter (no cost): a 1280x720 preview for
                  G4/G5, or quality=final, the one 1920x1080 render G6 watches. mode=picture|audio gives a muted
                  picture pass or an audio-only .wav, each with a .render.json sidecar
whatif_mux        a picture pass and an audio pass in one watch file, refused when their timing differs (no cost)
whatif_stills     chosen frames as PNGs and one contact sheet (no cost)

Video inputs are {"channel": "<slug>", "video": "<YYYY-MM-DD_slug>"}. Paths are relative to the omni-studio root and
must stay inside it. Nothing here uploads.
"""

from __future__ import annotations

import contextlib
import json
import os
import re
import shutil
import signal
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
from tools.studio import studio_whatif_cache as C

try:  # B1 timing and the render queue (core/studio/jobs); outside the studio layer the tools run untimed, unqueued
    from studio.jobs import queue as _queue
    from studio.jobs.timing import record_tool as _record_tool

    _QueueBusy = _queue.QueueBusy
except ImportError:
    _queue = None
    _QueueBusy = ()  # catches nothing

    def _record_tool(fn):
        return fn


STUDIO_ROOT = Path(__file__).resolve().parents[4]
ENGINE = STUDIO_ROOT / "core" / "engines" / "whatif"
SLUG_RE = re.compile(r"^[a-z]+(-[a-z]+)*$")
VIDEO_RE = re.compile(r"^\d{4}-\d{2}-\d{2}_[a-z0-9]+(-[a-z0-9]+)*$")
LIMITER = "alimiter=limit=0.84:level=false"
# The audio of every watch file: the full render's limiter pass and whatif_mux must sound the same.
LIMITED_AAC = ["-af", LIMITER, "-c:a", "aac", "-b:a", "256k"]
# G4/G5 watch 1280x720 previews; G6 watches one 1920x1080 render (pipeline v2, optimisation 5). Exactly 1280x720 in
# doubles: --scale=0.6667 gives 720.036 and Remotion refuses it. An x264 preset saved nothing (drawing is the cost).
PREVIEW_SCALE = 0.6666666666666666
QUALITIES = ("preview", "final")
MODES = ("full", "picture", "audio")


def media_python() -> Path:
    """faster-whisper's interpreter: WHATIF_MEDIA_PYTHON, else this checkout's .venv-media."""
    return Path(os.environ.get("WHATIF_MEDIA_PYTHON", STUDIO_ROOT / ".venv-media" / "bin" / "python"))


def inside(path: str | Path) -> Path:
    p = Path(path).expanduser()
    p = (p if p.is_absolute() else STUDIO_ROOT / p).resolve()
    if not p.is_relative_to(STUDIO_ROOT.resolve()):
        raise ValueError(f"{path} must be inside the omni-studio folder {STUDIO_ROOT}")
    return p


def video_dir(inputs: dict[str, Any]) -> Path:
    slug, video = inputs.get("channel"), inputs.get("video")
    if not isinstance(slug, str) or not SLUG_RE.fullmatch(slug):
        raise ValueError(f"bad channel slug {slug!r}")
    if not isinstance(video, str) or not VIDEO_RE.fullmatch(video):
        raise ValueError(f"bad video id {video!r}: expected <YYYY-MM-DD>_<slug>")
    folder = (STUDIO_ROOT / "channels" / slug / "videos" / video).resolve()
    if not folder.is_relative_to((STUDIO_ROOT / "channels").resolve()) or not folder.is_dir():
        raise ValueError(f"no video {slug}/{video}")
    return folder


class _WhatifTool(BaseTool):
    version = "0.1.0"
    tier = ToolTier.CORE
    provider = "omni-studio"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.SYNC
    runtime = ToolRuntime.LOCAL
    dependencies = ["binary:ffmpeg", "binary:npx"]
    agent_skills: list[str] = []
    side_effects = ["writes files in the video's assets/ or renders/ folder, or the engine's out/"]
    resource_profile = ResourceProfile(cpu_cores=6, ram_mb=6000, disk_mb=2000)
    queue: str | None = None  # "render" on tools that render: one render at a time on the Mac (CLAUDE.md)

    def get_status(self) -> ToolStatus:
        if not (ENGINE / "node_modules").is_dir() or shutil.which("npx") is None:
            return ToolStatus.UNAVAILABLE
        return ToolStatus.AVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    @abstractmethod
    def command(self, inputs: dict[str, Any]) -> tuple[list[list[str]], dict[str, str]]:
        """The commands to run in the engine folder, and their environment. Raise ValueError or PermissionError."""

    def _queued(self, inputs: dict[str, Any]):
        """The render queue (re-entrant for a command `studio.jobs run --queue render` started), else nothing."""
        if self.queue is None or _queue is None:
            return contextlib.nullcontext()
        return _queue.hold(self.queue, step=self.name, channel=str(inputs.get("channel", "")),
                           video=str(inputs.get("video", "")), timeout=float(inputs.get("queue_wait_seconds", 7200)))

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        try:
            with self._queued(inputs):
                return self._timed(inputs)
        except _QueueBusy as exc:
            return ToolResult(success=False, error=f"the {self.queue} queue is held ({exc}); not run")

    @_record_tool
    def _timed(self, inputs: dict[str, Any]) -> ToolResult:
        """Timed inside the queue, so a timing row is the work, never the wait for another session's render."""
        return self.after(inputs, self._run(inputs))

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        """Runs inside the queue after the commands; passes that leave a sidecar write it here."""
        return result

    def _run(self, inputs: dict[str, Any]) -> ToolResult:
        start = time.time()
        try:
            cmds, env = self.command(inputs)
        except (ValueError, PermissionError) as exc:
            return ToolResult(success=False, error=str(exc))
        if cmds and isinstance(cmds[0], str):
            cmds = [cmds]
        logs = []
        timeout = float(inputs.get("timeout_seconds", 3600))
        for cmd in cmds:
            # Own process group: on a timeout the whole tree goes, not just npx. Remotion's renderer outlives a killed
            # npx and keeps rendering, competing with whatever runs next (2026-11-07).
            proc = subprocess.Popen(cmd, cwd=ENGINE, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                                    start_new_session=True)
            try:
                stdout, stderr = proc.communicate(timeout=timeout)
            except subprocess.TimeoutExpired:
                _kill_group(proc)
                stdout, stderr = proc.communicate()
                logs.append({"command": cmd, "returncode": None, "stdout": stdout[-20000:], "stderr": stderr[-20000:]})
                return ToolResult(success=False, data={"runs": logs}, duration_seconds=time.time() - start,
                                  error=f"{cmd[0]} timed out after {timeout:.0f} s; raise timeout_seconds")
            logs.append({"command": cmd, "returncode": proc.returncode, "stdout": stdout[-20000:],
                         "stderr": stderr[-20000:]})
            if proc.returncode != 0:
                return ToolResult(success=False, data={"runs": logs}, duration_seconds=time.time() - start,
                                  error=f"{cmd[0]} exited {proc.returncode}")
        return ToolResult(success=True, data={"runs": logs}, duration_seconds=time.time() - start)


def _kill_group(proc: subprocess.Popen) -> None:
    """Stop a command and every process it started: TERM, then KILL after 5 s."""
    for sig, wait in ((signal.SIGTERM, 5), (signal.SIGKILL, 5)):
        try:
            os.killpg(proc.pid, sig)
        except ProcessLookupError:
            return
        try:
            proc.wait(timeout=wait)
            return
        except subprocess.TimeoutExpired:
            continue


class WhatifStory(_WhatifTool):
    name = "whatif_story"
    capability = "studio_story"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["script_to_story"]
    best_for = ["turn an approved script.md into story.json: spoken lines, holds, moods, cited sources"]
    input_schema = {"type": "object", "required": ["channel", "video"],
                    "properties": {"channel": {"type": "string"}, "video": {"type": "string"}}}

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if (ENGINE / "pipeline" / "story.py").is_file() else ToolStatus.UNAVAILABLE

    def command(self, inputs: dict[str, Any]):
        folder = video_dir(inputs)
        return [[sys.executable, str(ENGINE / "pipeline" / "story.py"), str(folder)]], dict(os.environ)


class WhatifNarration(_WhatifTool):
    name = "whatif_narration"
    capability = "studio_tts"
    determinism = Determinism.STOCHASTIC
    capabilities = ["narration_from_story", "word_timings", "take_cache"]
    best_for = ["Say Suppose narration: one cached take per line, the narrator (free local Arthur clone, or Eleven v4 "
                "for the paid A/B) and each character in a free local voice of their own"]
    not_good_for = ["any new take without the owner's approval and a credit cap"]
    input_schema = {"type": "object", "required": ["channel", "video"], "properties": {
        "channel": {"type": "string"}, "video": {"type": "string"},
        "owner_approved_paid_call": {"type": "boolean", "default": False,
                                     "description": "the owner approved this narration call, its tool, model and quote"},
        "max_credits": {"type": "number", "description": "the approved Higgsfield credit cap; required with approval"}}}

    def command(self, inputs: dict[str, Any]):
        folder = video_dir(inputs)
        approved = inputs.get("owner_approved_paid_call") is True
        cap = inputs.get("max_credits")
        if cap is not None and not approved:
            raise PermissionError("max_credits is only passed with owner_approved_paid_call=true: announce tool, "
                                  "provider, model and quote, and get the owner's approval first")
        if approved and (not isinstance(cap, (int, float)) or cap <= 0):
            raise PermissionError("an approved narration call needs max_credits, the cap the owner approved")
        cmd = ["npx", "tsx", "pipeline/build.ts", "--story", str(folder / "story.json"),
               "--out", str(folder / "assets" / "narration")]
        if approved:
            cmd += ["--max-credits", f"{cap:g}"]
        return [cmd], {**os.environ, "WHISPER_PY": str(media_python())}


class WhatifRender(_WhatifTool):
    name = "whatif_render"
    queue = "render"
    capability = "video_composition"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["paper_cut_render", "loudness_limiter"]
    best_for = ["a G4/G5 preview of a what-if scene entry at 1280x720, or the one 1920x1080 film G6 watches "
                "(quality=final)"]
    input_schema = {"type": "object", "required": ["entry", "composition", "props", "public_dir", "output"], "properties": {
        "entry": {"type": "string"}, "composition": {"type": "string"}, "props": {"type": "string"},
        "public_dir": {"type": "string"}, "output": {"type": "string", "description": "final mp4; the raw render sits beside it"},
        "frames": {"type": "string", "description": "optional Remotion frame range, e.g. 0-299"},
        "quality": {"enum": list(QUALITIES), "default": "preview",
                    "description": "preview: 1280x720 for G4 and G5 watches; final: the one 1920x1080 render G6 watches"},
        "mode": {"enum": list(MODES), "default": "full",
                 "description": "picture: muted, for whatif_mux; audio: a .wav of the same mix, no frames drawn (render "
                                "the video's RoughCutSound composition); full: both, then the limiter"},
        "queue_wait_seconds": {"type": "number", "default": 7200,
                               "description": "how long to wait for the render queue before giving up"}}}

    def timing_step(self, inputs: dict[str, Any]) -> str:
        mode = inputs.get("mode", "full")
        if mode == "audio":
            return "whatif_render.audio"
        return f"whatif_render.{mode}-" + ("1080p" if inputs.get("quality") == "final" else "720p")

    @staticmethod
    def _check(inputs: dict[str, Any]) -> tuple[str, str]:
        mode, quality = inputs.get("mode", "full"), inputs.get("quality", "preview")
        if mode not in MODES:
            raise ValueError(f"mode must be one of {MODES}")
        if quality not in QUALITIES:
            raise ValueError(f"quality must be one of {QUALITIES}")
        if quality == "final" and mode != "full":
            raise ValueError("a final render is one full render with its own audio (the file G6 watches); "
                             "picture and audio passes are for previews")
        if quality == "final" and inputs.get("frames"):
            raise ValueError("a final render is the whole film: G6 watches one 1920x1080 render, never a slice")
        return mode, quality

    def command(self, inputs: dict[str, Any]):
        mode, quality = self._check(inputs)
        entry, props, public = (inside(inputs[k]) for k in ("entry", "props", "public_dir"))
        output = inside(inputs["output"])
        render = ["npx", "remotion", "render", str(entry), str(inputs["composition"])]
        opts = [f"--props={props}", f"--public-dir={public}", "--log=error"]
        if inputs.get("frames"):
            opts.append(f"--frames={inputs['frames']}")
        if quality == "preview" and mode != "audio":
            opts.append(f"--scale={PREVIEW_SCALE}")
        if mode == "audio":
            if output.suffix != ".wav":
                raise ValueError("an audio pass writes a .wav")
            return [[*render, str(output), "--codec=wav", *opts]], dict(os.environ)
        if mode == "picture":
            return [[*render, str(output), "--muted", *opts]], dict(os.environ)
        raw = output.with_name(output.stem + "-raw" + output.suffix)
        limit = ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-c:v", "copy", *LIMITED_AAC, str(output)]
        return [[*render, str(raw), *opts], limit], dict(os.environ)

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        if result.success and inputs.get("mode", "full") != "full":
            C.write_sidecar(inside(inputs["output"]), mode=inputs["mode"], props=inside(inputs["props"]),
                            entry=inside(inputs["entry"]), engine=ENGINE, frames=str(inputs.get("frames") or "all"))
        return result


class WhatifMux(_WhatifTool):
    name = "whatif_mux"
    capability = "video_composition"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["mux_picture_and_audio", "loudness_limiter"]
    best_for = ["a sound-only note at G4/G5: the new audio pass on the last picture pass, in seconds"]
    not_good_for = ["the G6 file: that is one whatif_render quality=final"]
    input_schema = {"type": "object", "required": ["picture", "audio", "output"], "properties": {
        "picture": {"type": "string", "description": "a picture pass (whatif_render mode=picture)"},
        "audio": {"type": "string", "description": "an audio pass (whatif_render mode=audio)"},
        "output": {"type": "string"},
        "sound_only_change": {"type": "boolean", "default": False,
                              "description": "every scene file changed since the picture pass changes only sound"}}}

    @staticmethod
    def _changed(picture: Path, audio: Path, sound_only: bool) -> list[str]:
        """The scene files that differ between the two passes; raises when they must not be joined."""
        pic, aud = C.read_sidecar(picture), C.read_sidecar(audio)
        if pic is None or aud is None:
            raise ValueError("mux only joins passes whatif_render wrote (no .render.json beside them)")
        if pic["mode"] != "picture" or aud["mode"] != "audio":
            raise ValueError("picture must be a picture pass and audio an audio pass")
        if pic["props_sha256"] != aud["props_sha256"] or pic["frames"] != aud["frames"]:
            raise ValueError("the picture and the audio come from different timing (props.json or frames): "
                             "render the picture again")
        changed = C.changed_files(pic, aud)
        if changed and not sound_only:
            raise ValueError(f"scene files changed since the picture pass: {changed}; pass "
                             "sound_only_change=true only if every one of them changes sound alone")
        return changed

    def command(self, inputs: dict[str, Any]):
        picture, audio, output = (inside(inputs[k]) for k in ("picture", "audio", "output"))
        self._changed(picture, audio, inputs.get("sound_only_change") is True)
        mux = ["ffmpeg", "-v", "error", "-y", "-i", str(picture), "-i", str(audio), "-map", "0:v", "-map", "1:a",
               "-c:v", "copy", *LIMITED_AAC, "-shortest", str(output)]
        return [mux], dict(os.environ)

    def after(self, inputs: dict[str, Any], result: ToolResult) -> ToolResult:
        if result.success:
            picture, audio = (inside(inputs[k]) for k in ("picture", "audio"))
            result.data["scene_files_changed"] = self._changed(picture, audio, True)
        return result


class WhatifStills(_WhatifTool):
    name = "whatif_stills"
    capability = "analysis"
    determinism = Determinism.DETERMINISTIC
    capabilities = ["frame_stills", "contact_sheet"]
    best_for = ["check a scene at chosen frames before a full render"]
    input_schema = {"type": "object", "required": ["entry", "composition", "props", "public_dir", "frames", "output_dir"],
                    "properties": {"entry": {"type": "string"}, "composition": {"type": "string"},
                                   "props": {"type": "string"}, "public_dir": {"type": "string"},
                                   "frames": {"type": "array", "items": {"type": "integer"}},
                                   "output_dir": {"type": "string"}, "scale": {"type": "number", "default": 0.5}}}

    def command(self, inputs: dict[str, Any]):
        entry, props, public, out = (inside(inputs[k]) for k in ("entry", "props", "public_dir", "output_dir"))
        frames = [int(f) for f in inputs["frames"]]
        if not frames:
            raise ValueError("frames must list at least one frame")
        out.mkdir(parents=True, exist_ok=True)
        cmds = [["npx", "remotion", "still", str(entry), str(inputs["composition"]), str(out / f"f{f:05d}.png"),
                 f"--frame={f}", f"--props={props}", f"--public-dir={public}", f"--scale={inputs.get('scale', 0.5)}",
                 "--log=error"] for f in frames]
        cols = min(4, len(frames))
        layout = "|".join(("0" if i % cols == 0 else "+".join(["w0"] * (i % cols))) + "_" +
                          ("0" if i // cols == 0 else "+".join(["h0"] * (i // cols))) for i in range(len(frames)))
        inputs_ = [a for f in frames for a in ("-i", str(out / f"f{f:05d}.png"))]
        sheet = ["ffmpeg", "-v", "error", "-y", *inputs_, "-filter_complex",
                 f"xstack=inputs={len(frames)}:layout={layout}:fill=black" if len(frames) > 1 else "null",
                 str(out / "sheet.jpg")]
        return cmds + [sheet], dict(os.environ)
