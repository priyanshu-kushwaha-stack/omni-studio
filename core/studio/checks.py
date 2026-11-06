"""Automated checks per pipeline stage (`metadata.studio_checks` in studio-dialogue.yaml and studio-short.yaml).

`omni qc <slug> <video> <stage>` runs a stage's checks and writes `videos/<id>/qc/<stage>.json`.
`omni approve` (channels.approve_stage) re-runs the same checks on the inputs that report names, and refuses to
sign while any check fails. No gate is skipped or added: a check can only hold a gate shut.

Checks:
  claims          claims ledger complete, a source per factual claim (studio/claims.py)
  no_quiz_boards  script_lint.py item 27 (owner rule 2026-11-06)
  loudness        integrated LUFS, true peak and LRA against channel.yaml loudness.<format> (qc/loudness.py)
  clicks          audio_check.py bursts and steps; on Shorts also the 2.4 s fade-out tail (qc/clicks.py)
  similarity      near-duplicates across channels and the channel's recent videos (studio/similarity.py)
  upload_request  upload.yaml makes a valid private upload with kids and AI answered (publish/youtube.py)
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from studio import channels
from studio.channels import ChannelError

ROOT = Path(__file__).resolve().parents[2]
ENGINE = ROOT / "core" / "engines" / "pou" / "scripts"
KNOWN = ("claims", "no_quiz_boards", "loudness", "clicks", "similarity", "upload_request")
MEDIA_CHECKS = {"loudness", "clicks", "similarity"}


@lru_cache(maxsize=1)
def _script_lint():
    spec = importlib.util.spec_from_file_location("studio_checks_script_lint", ENGINE / "script_lint.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def stage_checks(pipeline: str, stage: str) -> list[str]:
    channels._upstream()
    from lib.pipeline_loader import load_pipeline_readonly

    names = ((load_pipeline_readonly(pipeline).get("metadata") or {}).get("studio_checks") or {}).get(stage, [])
    unknown = [n for n in names if n not in KNOWN]
    if unknown:
        raise ChannelError(f"pipeline {pipeline!r} stage {stage!r} names unknown checks {unknown}")
    return list(names)


def project_identity(channel: channels.Channel, video_id: str, format_name: Optional[str] = None,
                     pipeline_hint: Optional[str] = None) -> tuple[str, str]:
    """(format, pipeline) from the project marker omni new-video writes, or from --format for older videos."""
    marker = channels.video_dir(channel, video_id) / "project.json"
    data = json.loads(marker.read_text(encoding="utf-8")) if marker.is_file() else {}
    fmt = format_name or data.get("format")
    if not fmt and (pipeline_hint or data.get("pipeline_type")):
        matches = [f for f, p in channel.config.formats.items() if p == (pipeline_hint or data["pipeline_type"])]
        fmt = matches[0] if len(matches) == 1 else None
    if not fmt:
        raise ChannelError(f"{channel.slug}/{video_id} has no project.json format; pass --format")
    pipeline = channel.config.formats.get(fmt)
    if pipeline is None:
        raise ChannelError(f"channel {channel.slug!r} has no format {fmt!r}")
    if data.get("pipeline_type") and data["pipeline_type"] != pipeline and not format_name:
        raise ChannelError(f"project.json pipeline {data['pipeline_type']!r} != format {fmt!r} -> {pipeline!r}")
    return fmt, data.get("pipeline_type") or pipeline


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while block := handle.read(1 << 20):
            digest.update(block)
    return digest.hexdigest()


def _rel(path: Path) -> str:
    return str(path.relative_to(ROOT)) if path.resolve().is_relative_to(ROOT) else str(path)


def run_check(name: str, channel: channels.Channel, video_id: str, fmt: str, pipeline: str,
              media: Optional[Path], words: Optional[Path]) -> dict[str, Any]:
    folder = channels.video_dir(channel, video_id)
    if name in MEDIA_CHECKS and name != "similarity" and (media is None or not media.is_file()):
        return {"check": name, "ok": False, "problems": [f"{name} needs a render or audio file: pass --media"]}
    if name == "claims":
        from studio import claims

        return claims.check(folder).as_dict()
    if name == "no_quiz_boards":
        script = folder / "script.md"
        if not script.is_file():
            return {"check": name, "ok": False, "problems": [f"no script: {script} is missing"]}
        item = next(f for f in _script_lint().lint_script(script.read_text(encoding="utf-8"), 1) if f.item == 27)
        return {"check": name, "ok": item.ok, "problems": [] if item.ok else [item.detail]}
    if name == "loudness":
        from studio.qc import loudness

        target = channel.config.loudness.get(fmt)
        if target is None:
            return {"check": name, "ok": False,
                    "problems": [f"channel.yaml has no loudness target for format {fmt!r}"]}
        try:
            return loudness.check(media, target.model_dump())
        except loudness.LoudnessError as exc:
            return {"check": name, "ok": False, "problems": [str(exc)]}
    if name == "clicks":
        from studio.qc import clicks

        short = pipeline == "studio-short" and media.suffix.lower() in {".mp4", ".mov", ".m4v"}
        return clicks.check(media, words, short=short)
    if name == "similarity":
        from studio import similarity

        return similarity.check(channel.slug, video_id, media if media and media.is_file() else None)
    if name == "upload_request":
        from studio.publish import youtube

        try:
            youtube.build_request(channel.slug, video_id)
            return {"check": name, "ok": True, "problems": []}
        except (youtube.UploadRefused, ChannelError) as exc:
            return {"check": name, "ok": False, "problems": str(exc).splitlines()[1:] or [str(exc)]}
    raise ChannelError(f"unknown check {name!r}")


def run_stage(slug: str, video_id: str, stage: str, media: Optional[Path] = None, words: Optional[Path] = None,
              format_name: Optional[str] = None, write: bool = True) -> dict[str, Any]:
    channel = channels.load_channel(slug)
    folder = channels.video_dir(channel, video_id)
    if not folder.is_dir():
        raise ChannelError(f"No video {video_id!r} in channel {slug!r}")
    fmt, pipeline = project_identity(channel, video_id, format_name)
    names = stage_checks(pipeline, stage)
    if media is None and stage == "narration":
        media = folder / "narration" / "narration.wav"
    if words is None and (folder / "narration" / "words.json").is_file():
        words = folder / "narration" / "words.json"
    media = Path(media).resolve() if media else None
    results = [run_check(n, channel, video_id, fmt, pipeline, media, words) for n in names]
    report = {
        "channel": slug, "video": video_id, "stage": stage, "format": fmt, "pipeline": pipeline,
        "at": datetime.now(timezone.utc).isoformat(),
        "inputs": {"media": _rel(media) if media else None,
                   "media_sha256": _sha256(media) if media and media.is_file() else None,
                   "words": _rel(Path(words).resolve()) if words else None},
        "checks": results,
        "ok": all(r["ok"] for r in results),
    }
    if write and names:
        out = folder / "qc" / f"{stage}.json"
        out.parent.mkdir(exist_ok=True)
        out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def require_passing(channel: channels.Channel, video_id: str, stage: str,
                    pipeline: str) -> Optional[dict[str, Any]]:
    """Refuse a gate while its checks fail. Re-runs them on the inputs the stage's qc report names."""
    if not stage_checks(pipeline, stage):
        return None
    path = channels.video_dir(channel, video_id) / "qc" / f"{stage}.json"
    if not path.is_file():
        raise ChannelError(f"stage {stage!r} has automated checks; run `omni qc {channel.slug} {video_id} "
                           f"{stage}` first (no {path.relative_to(channel.dir)})")
    previous = json.loads(path.read_text(encoding="utf-8"))
    inputs = previous.get("inputs", {})
    media = ROOT / inputs["media"] if inputs.get("media") else None
    words = ROOT / inputs["words"] if inputs.get("words") else None
    report = run_stage(channel.slug, video_id, stage, media, words, format_name=previous.get("format"))
    if not report["ok"]:
        failed = [f"{r['check']}: {p}" for r in report["checks"] if not r["ok"] for p in r["problems"]]
        raise ChannelError(f"stage {stage!r} cannot pass while its checks fail:\n  " + "\n  ".join(failed))
    return report


def format_report(report: dict[str, Any]) -> str:
    lines = [f"qc {report['channel']}/{report['video']} {report['stage']} ({report['pipeline']}, "
             f"format {report['format']})"]
    if report["inputs"]["media"]:
        lines.append(f"  media {report['inputs']['media']}")
    if not report["checks"]:
        lines.append("  no automated checks for this stage")
    for r in report["checks"]:
        extra = ""
        if r["check"] == "loudness" and "measured" in r:
            m = r["measured"]
            extra = (f" ({m['integrated_lufs']:.1f} LUFS, {m['true_peak_dbtp']:.2f} dBTP, "
                     f"LRA {m['lra_lu']:.1f} LU)")
        lines.append(f"  [{'PASS' if r['ok'] else 'FAIL'}] {r['check']}{extra}")
        lines += [f"         - {p}" for p in r["problems"]]
    lines.append(f"  {'ok' if report['ok'] else 'FAILED'}")
    return "\n".join(lines)
