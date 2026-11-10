"""Channels: channel.yaml validation, scaffolding, videos, budgets and approvals.

Every channel keeps its OpenMontage projects in channels/<slug>/videos/, which is the
channel's OPENMONTAGE_PROJECTS_DIR. Checkpoints, gates and budgets are OpenMontage's own
(lib/checkpoint.py, tools/cost_tracker.py); this module only points them at the channel.
"""

from __future__ import annotations

import getpass
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Literal, Optional, Union

import yaml
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StrictFloat,
    StrictInt,
    ValidationError,
    field_validator,
)

ROOT = Path(__file__).resolve().parents[2]
OPENMONTAGE = ROOT / "core" / "openmontage"

SLUG_RE = re.compile(r"^[a-z]+(-[a-z]+)*$")
# What new_video names a folder: <date>_<title slug>.
VIDEO_ID_RE = re.compile(r"^\d{4}-\d{2}-\d{2}_[a-z0-9]+(-[a-z0-9]+)*$")
YOUTUBE_ID_RE = re.compile(r"^UC[\w-]{22}$")
TOKEN_DIR = "~/.config/omni-studio/"
SEVERITIES = ("low", "medium", "high")


class ChannelError(Exception):
    """A channel, or a request about one, is invalid. The message says what to fix."""


def _upstream() -> None:
    """Make OpenMontage's packages importable. They are not installed."""
    if str(OPENMONTAGE) not in sys.path:
        sys.path.insert(0, str(OPENMONTAGE))


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Music(_Strict):
    default: Optional[str] = Field(...)
    allowed: list[str] = Field(...)


class LoudnessTarget(_Strict):
    """Mix targets for one format, checked by core/studio/qc/loudness.py (ffmpeg ebur128, EBU R128)."""

    integrated_lufs: Union[StrictInt, StrictFloat] = Field(ge=-30, le=-5)
    tolerance_lu: Union[StrictInt, StrictFloat] = Field(gt=0, le=3)
    true_peak_dbtp_max: Union[StrictInt, StrictFloat] = Field(ge=-9, le=0)
    lra_lu_max: Union[StrictInt, StrictFloat] = Field(gt=0, le=30)


class UploadDefaults(_Strict):
    """Channel defaults for `omni upload`. A video's upload.yaml may override them, never the privacy."""

    # YouTube status.containsSyntheticMedia ("altered or synthetic content"). Required key; null means every
    # video must answer it in its own upload.yaml, and the upload is refused until it does.
    contains_synthetic_media: Optional[StrictBool] = Field(...)
    category_id: str = Field(default="27", pattern=r"^\d{1,3}$")
    language: str = Field(default="en", min_length=2, max_length=8)


class ChannelConfig(_Strict):
    id: str
    youtube_channel_id: Optional[str] = Field(...)
    status: Literal["draft", "testing", "live", "paused"]
    niche: str = Field(min_length=1)
    risk_class: Literal["A", "B", "C"]
    made_for_kids: StrictBool
    formats: dict[str, str] = Field(min_length=1)
    playbook: str = Field(min_length=1)
    voices: str = Field(min_length=1)
    music: Music
    cadence: Literal["daily", "weekly", "biweekly", "monthly"]
    budget_usd_per_video: Union[StrictInt, StrictFloat] = Field(ge=0, allow_inf_nan=False)
    review_level: Literal["full", "standard", "light"]
    upload_token_path: Optional[str] = Field(...)
    # Format name -> mix targets. A format with no entry fails its loudness check (checks.py), not the load.
    loudness: dict[str, LoudnessTarget] = Field(...)
    upload: UploadDefaults = Field(...)

    @field_validator("id")
    @classmethod
    def _id_is_a_slug(cls, value: str) -> str:
        if not SLUG_RE.fullmatch(value):
            raise ValueError("must be a plain slug: lowercase words and hyphens, no numbers")
        return value

    @field_validator("youtube_channel_id")
    @classmethod
    def _youtube_id(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not YOUTUBE_ID_RE.fullmatch(value):
            raise ValueError("must be UC followed by 22 characters")
        return value

    @field_validator("upload_token_path")
    @classmethod
    def _token_outside_repo(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        home_form = str(Path(TOKEN_DIR).expanduser())
        if not (value.startswith(TOKEN_DIR) or value.startswith(home_form + os.sep)):
            raise ValueError(f"must be under {TOKEN_DIR}")
        if ".." in Path(value).parts:
            raise ValueError("must not contain '..'")
        return value


@dataclass(frozen=True)
class Channel:
    slug: str
    dir: Path
    config: ChannelConfig

    @property
    def videos_dir(self) -> Path:
        return self.dir / "videos"

    @property
    def env(self) -> dict[str, str]:
        """Set this for any OpenMontage process that works for the channel."""
        return {"OPENMONTAGE_PROJECTS_DIR": str(self.videos_dir)}


def channels_dir() -> Path:
    return ROOT / "channels"


def custom_styles_dir() -> Path:
    return ROOT / "core" / "openmontage" / "styles" / "custom"


def issues_dir() -> Path:
    return ROOT / "core" / "studio" / "issues"


def list_slugs() -> list[str]:
    root = channels_dir()
    if not root.is_dir():
        return []
    return sorted(p.name for p in root.iterdir() if p.is_dir() and not p.name.startswith((".", "_")))


def _format_validation_error(path: Path, exc: ValidationError) -> str:
    lines = [f"{path} is invalid:"]
    for err in exc.errors():
        field = ".".join(str(part) for part in err["loc"]) or "(top level)"
        message = "unknown field" if err["type"] == "extra_forbidden" else err["msg"]
        lines.append(f"  {field}: {message}")
    return "\n".join(lines)


def _check_cross_fields(slug: str, channel_dir: Path, config: ChannelConfig) -> list[str]:
    _upstream()
    from styles.playbook_loader import load_playbook

    problems = []
    if config.id != slug:
        problems.append(f"id: {config.id!r} does not match the folder name {slug!r}")
    if config.status in {"testing", "live"} and not config.youtube_channel_id:
        problems.append(f"youtube_channel_id: required when status is {config.status}")
    if config.status == "live" and not config.upload_token_path:
        problems.append("upload_token_path: required when status is live")
    if config.music.default is not None and config.music.default not in config.music.allowed:
        problems.append(f"music.default: {config.music.default!r} is not in music.allowed")

    if config.upload_token_path and not config.upload_token_path.endswith(f"/youtube/{slug}.token"):
        problems.append(f"upload_token_path: must be ~/.config/omni-studio/youtube/{slug}.token, one token per channel")

    for name, pipeline in config.formats.items():
        if not (OPENMONTAGE / "pipeline_defs" / f"{pipeline}.yaml").is_file():
            problems.append(f"formats.{name}: no pipeline named {pipeline!r} in pipeline_defs/")

    voices = (channel_dir / config.voices).resolve()
    if not voices.is_relative_to(channel_dir.resolve()):
        problems.append(f"voices: {config.voices!r} is outside the channel folder")
    elif not voices.is_file():
        problems.append(f"voices: {config.voices!r} does not exist")
    else:
        try:
            parsed = yaml.safe_load(voices.read_text(encoding="utf-8"))
        except yaml.YAMLError as exc:
            problems.append(f"voices: {config.voices!r} is not valid YAML: {exc}")
        else:
            if not isinstance(parsed, dict) or not isinstance(parsed.get("voices"), dict):
                problems.append(f"voices: {config.voices!r} must hold a 'voices' mapping")

    try:
        load_playbook(config.playbook, styles_dir=ROOT / "core" / "openmontage" / "styles")
    except Exception as exc:  # the loader raises several unrelated types
        problems.append(f"playbook: {config.playbook!r} does not load by name: {exc}")
    return problems


def _channel_dir(slug: str) -> Path:
    """channels/<slug>, refused unless the slug is plain and the folder stays in channels/."""
    if not isinstance(slug, str) or not SLUG_RE.fullmatch(slug):
        raise ChannelError(f"Bad channel slug {slug!r}: use lowercase words and hyphens, no numbers")
    channel_dir = channels_dir() / slug
    if not channel_dir.resolve().is_relative_to(channels_dir().resolve()):
        raise ChannelError(f"Channel {slug!r} resolves outside {channels_dir()}")
    return channel_dir


def video_dir(channel: Channel, video_id: str) -> Path:
    """videos/<video_id>, refused unless the id is a date_slug and the folder stays in videos/.

    Paths are resolved, so neither ``..`` nor a symlink can reach another channel.
    """
    if not isinstance(video_id, str) or not VIDEO_ID_RE.fullmatch(video_id):
        raise ChannelError(f"Bad video id {video_id!r}: expected <YYYY-MM-DD>_<slug>, as omni new-video makes")
    videos = channel.videos_dir.resolve()
    if not videos.is_relative_to(channel.dir.resolve()):
        raise ChannelError(f"{channel.videos_dir} resolves outside channel {channel.slug!r}")
    path = channel.videos_dir / video_id
    if not path.resolve().is_relative_to(videos):
        raise ChannelError(f"Video {video_id!r} resolves outside {channel.videos_dir}")
    return path


def load_channel(slug: str) -> Channel:
    """Load and fully validate one channel, or raise ChannelError naming every problem."""
    channel_dir = _channel_dir(slug)
    path = channel_dir / "channel.yaml"
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ChannelError(f"No channel {slug!r}: cannot read {path}: {exc}") from exc
    except yaml.YAMLError as exc:
        raise ChannelError(f"{path} is not valid YAML: {exc}") from exc
    if not isinstance(data, dict):
        raise ChannelError(f"{path} must be a mapping of channel fields")
    try:
        config = ChannelConfig.model_validate(data)
    except ValidationError as exc:
        raise ChannelError(_format_validation_error(path, exc)) from exc
    problems = _check_cross_fields(slug, channel_dir, config)
    if problems:
        raise ChannelError("\n".join([f"{path} is invalid:", *(f"  {p}" for p in problems)]))
    return Channel(slug=slug, dir=channel_dir, config=config)


def create_channel(slug: str) -> Channel:
    """Scaffold channels/<slug>/ from the template and link its playbook by name."""
    _upstream()
    from styles.playbook_loader import list_playbooks

    if not SLUG_RE.fullmatch(slug):
        raise ChannelError(f"Bad channel slug {slug!r}: use lowercase words and hyphens, no numbers")
    target = channels_dir() / slug
    if target.exists():
        raise ChannelError(f"Channel {slug!r} already exists at {target}")
    styles_dir = ROOT / "core" / "openmontage" / "styles"
    if slug in list_playbooks(styles_dir=styles_dir):
        raise ChannelError(
            f"A playbook named {slug!r} already exists. It would shadow or replace this "
            f"channel's playbook, so pick another slug."
        )
    link = custom_styles_dir() / f"{slug}.yaml"

    shutil.copytree(channels_dir() / "_template", target)
    try:
        for path in target.rglob("*"):
            if path.suffix in {".yaml", ".md"}:
                path.write_text(path.read_text(encoding="utf-8").replace("__SLUG__", slug), encoding="utf-8")
        link.parent.mkdir(parents=True, exist_ok=True)
        link.symlink_to(playbook_link_target(slug))
        return load_channel(slug)
    except Exception:
        link.unlink(missing_ok=True)
        shutil.rmtree(target, ignore_errors=True)
        raise


def playbook_link_target(slug: str) -> str:
    return f"../../../../channels/{slug}/playbook.yaml"


def link_playbooks() -> list[tuple[str, str]]:
    """Re-create styles/custom/<slug>.yaml -> ../../../../channels/<slug>/playbook.yaml for every channel.

    The links are git-ignored, so a fresh clone has none. Returns (slug, what happened) per channel. A link
    that already points at the right file is left alone; a wrong link is replaced; a regular file there is
    refused, because it is someone's playbook rather than a link this command made.
    """
    folder = custom_styles_dir()
    folder.mkdir(parents=True, exist_ok=True)
    results = []
    for slug in list_slugs():
        _channel_dir(slug)
        link = folder / f"{slug}.yaml"
        target = playbook_link_target(slug)
        if link.is_symlink():
            if os.readlink(link) == target:
                results.append((slug, "ok"))
                continue
            link.unlink()
            link.symlink_to(target)
            results.append((slug, "replaced"))
        elif link.exists():
            raise ChannelError(f"{link} is a regular file, not a link; move it before linking {slug!r}")
        else:
            link.symlink_to(target)
            results.append((slug, "created"))
        if not link.resolve().is_file():
            raise ChannelError(f"{link} -> {target} does not resolve: channels/{slug}/playbook.yaml is missing")
    return results


def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    if not slug:
        raise ChannelError(f"Title {title!r} has no letters or digits to name a folder with")
    return slug


def tracker_for(channel: Channel, video_id: str):
    """The video's OpenMontage CostTracker, capped at the channel's per-video budget.

    The budget is written to cost_log.json when the video is created, and reloads from
    there, so changing channel.yaml later does not move an existing video's budget.
    """
    _upstream()
    from lib.config_model import BudgetMode
    from tools.cost_tracker import CostTracker

    return CostTracker(
        budget_total_usd=float(channel.config.budget_usd_per_video),
        mode=BudgetMode.CAP,
        cost_log_path=video_dir(channel, video_id) / "cost_log.json",
    )


def new_video(channel: Channel, title: str, format_name: str, on: Optional[date] = None) -> Path:
    """Create videos/<date_slug>/ with OpenMontage's project layout and the channel's budget."""
    _upstream()
    from lib.checkpoint import PROJECT_MARKER_FILENAME, init_project

    if channel.config.status == "paused":
        raise ChannelError(f"Channel {channel.slug!r} is paused")
    pipeline = channel.config.formats.get(format_name)
    if pipeline is None:
        raise ChannelError(
            f"Channel {channel.slug!r} has no format {format_name!r}. Its formats: {sorted(channel.config.formats)}"
        )
    video_id = f"{(on or date.today()).isoformat()}_{_slugify(title)}"
    if video_dir(channel, video_id).exists():
        raise ChannelError(f"Video {video_id!r} already exists in channel {channel.slug!r}")

    project = init_project(
        video_id,
        title=title,
        pipeline_type=pipeline,
        pipeline_dir=channel.videos_dir,
        style_playbook=channel.config.playbook,
    )
    marker_path = project / PROJECT_MARKER_FILENAME
    marker = json.loads(marker_path.read_text(encoding="utf-8"))
    marker.update(channel=channel.slug, format=format_name)
    marker_path.write_text(json.dumps(marker, indent=2), encoding="utf-8")
    # Log an empty save so the budget is on disk before any cost is estimated.
    tracker_for(channel, video_id)._save()
    return project


def approve_stage(channel: Channel, video_id: str, stage: str, note: Optional[str] = None) -> Path:
    """Pass a gate: rewrite an awaiting_human checkpoint as completed and approved.

    Goes through OpenMontage's write_checkpoint, so its schema, artifact and
    earlier-stage checks all still apply. The approval carries an HMAC proof
    (lib/studio_approval.py); without it OpenMontage refuses the approval.
    """
    _upstream()
    from lib.checkpoint import CheckpointValidationError, read_checkpoint, write_checkpoint

    if not video_dir(channel, video_id).is_dir():
        raise ChannelError(f"No video {video_id!r} in channel {channel.slug!r}")
    checkpoint = read_checkpoint(channel.videos_dir, video_id, stage)
    if checkpoint is None:
        raise ChannelError(f"Video {video_id!r} has no checkpoint for stage {stage!r}")
    if checkpoint["status"] != "awaiting_human":
        raise ChannelError(
            f"Stage {stage!r} of {video_id!r} is {checkpoint['status']!r}, not "
            f"'awaiting_human', so there is nothing to approve"
        )
    from lib import studio_approval
    from studio import checks

    # Automated checks for this stage (pipeline metadata.studio_checks) must pass before the owner's
    # approval is signed. They never pass a gate on their own.
    report = checks.require_passing(channel, video_id, stage, checkpoint["pipeline_type"])

    at = datetime.now(timezone.utc).isoformat()
    try:
        # Binds this approval to the exact file the checks ran on (and, at publish_prep, the upload metadata);
        # omni upload re-hashes against it. The stage proof below covers this record too.
        media = checks.media_proof(channel, video_id, stage, report, at)
        # The only proof lib/checkpoint.py accepts for a gated stage of a channel project.
        proof = studio_approval.sign(video_id, stage, checkpoint["pipeline_type"], checkpoint["artifacts"], at, media)
    except studio_approval.ApprovalRefused as exc:
        raise ChannelError(str(exc)) from exc
    approval: dict[str, Any] = {
        "by": getpass.getuser(),
        "at": at,
        "via": studio_approval.VIA,
        "proof": proof,
    }
    if media:
        approval["media"] = media
    if note:
        approval["note"] = note
    try:
        return write_checkpoint(
            channel.videos_dir,
            video_id,
            stage,
            "completed",
            checkpoint["artifacts"],
            pipeline_type=checkpoint["pipeline_type"],
            style_playbook=checkpoint.get("style_playbook"),
            checkpoint_policy=checkpoint["checkpoint_policy"],
            human_approval_required=True,
            human_approved=True,
            review=checkpoint.get("review"),
            cost_snapshot=checkpoint.get("cost_snapshot"),
            metadata={**checkpoint.get("metadata", {}), "approval": approval},
        )
    except CheckpointValidationError as exc:
        raise ChannelError(f"OpenMontage refused the approval: {exc}") from exc


def record_issue(
    channel: Channel,
    format_name: str,
    stage: str,
    severity: str,
    example: str,
    note: Optional[str] = None,
) -> Path:
    """Write a fix note to core/studio/issues/."""
    _upstream()
    from lib.pipeline_loader import get_stage_order, load_pipeline_readonly

    pipeline = channel.config.formats.get(format_name)
    if pipeline is None:
        raise ChannelError(
            f"Channel {channel.slug!r} has no format {format_name!r}. Its formats: {sorted(channel.config.formats)}"
        )
    stages = get_stage_order(load_pipeline_readonly(pipeline))
    if stage not in stages:
        raise ChannelError(f"Pipeline {pipeline!r} has no stage {stage!r}. Its stages: {stages}")
    if severity not in SEVERITIES:
        raise ChannelError(f"Severity {severity!r} is not one of {list(SEVERITIES)}")
    if not example.strip():
        raise ChannelError("The example must say what went wrong")

    issue = {
        "channel": channel.slug,
        "format": format_name,
        "stage": stage,
        "severity": severity,
        "example": example,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    }
    if note:
        issue["note"] = note
    folder = issues_dir()
    folder.mkdir(parents=True, exist_ok=True)
    stem = f"{date.today().isoformat()}-{channel.slug}-{stage}"
    number = 1
    while (path := folder / f"{stem}-{number}.yaml").exists():
        number += 1
    path.write_text(yaml.safe_dump(issue, sort_keys=False), encoding="utf-8")
    return path


def video_summaries(channel: Channel) -> list[dict[str, Any]]:
    """Read each video's gates and spend from disk, for omni status."""
    summaries = []
    if not channel.videos_dir.is_dir():
        return summaries
    for project in sorted(p for p in channel.videos_dir.iterdir() if p.is_dir()):
        try:
            video_dir(channel, project.name)
        except ChannelError as exc:
            summaries.append({"id": project.name, "error": str(exc)})
            continue
        awaiting = []
        for path in sorted(project.glob("checkpoint_*.json")):
            checkpoint = json.loads(path.read_text(encoding="utf-8"))
            if checkpoint.get("status") == "awaiting_human":
                awaiting.append(checkpoint.get("stage"))
        cost_path = project / "cost_log.json"
        cost = json.loads(cost_path.read_text(encoding="utf-8")) if cost_path.is_file() else {}
        summaries.append(
            {
                "id": project.name,
                "awaiting": awaiting,
                "budget_usd": cost.get("budget_total_usd"),
                "spent_usd": cost.get("budget_spent_usd", 0.0),
                "reserved_usd": cost.get("budget_reserved_usd", 0.0),
            }
        )
    return summaries
