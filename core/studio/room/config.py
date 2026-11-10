"""A channel's room.yaml: its seats (role, model, brief), caps, format parameters, linters and sources.

Validation enforces the spine's invariants: the three mandatory roles, one model per seat from the registry,
story/fact/neutrality seats and the judge never on the writer's family, the viewer never the writer's own model, the required seats (the mandatory roles,
or story and fact with `viewer_required: false`) spread over two or more other families, a daily cap that fits one script, and pre_g2_local only for channels whose voices are all
free local engines.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Optional

import yaml

from studio.room import ledger
from studio.room.models import UnknownModel, family_of, load_registry
from studio.room.verdict import ALWAYS_REQUIRED, LOCKED_ROLES, MANDATORY, ROLES, SELF_LOCKED

SEATS_DIR = Path(__file__).resolve().parent / "seats"
PITCH_CLIPS = ("after_g2", "pre_g2_local")
LOCAL_TTS = ("qwen3", "chatterbox", "kokoro")
REQUIRED = ("writer", "rounds", "seats")  # judge is optional: with none, the writer merges the notes
LIMIT_KEYS = ("blockers", "suggestions", "keep")
OWNER_ROUNDS = 3  # owner-notes rounds the derived cap keeps calls for, past `rounds` (required seats only)


class RoomConfigError(ValueError):
    pass


def seat_slug(name: str) -> str:
    """The file name a seat's verdict is stored under."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


@dataclass
class SeatConfig:
    name: str
    role: str
    model: str
    brief: Path
    limits: dict[str, int] = field(default_factory=dict)


@dataclass
class RoomConfig:
    writer: str
    judge: Optional[str]
    rounds: int
    daily_cap: int
    seats: list[SeatConfig]
    format: dict[str, Any] = field(default_factory=dict)
    linters: list[str] = field(default_factory=list)
    adopted: Optional[date] = None
    pitch_clip: str = "after_g2"
    sources: list[str] = field(default_factory=list)
    viewer_required: bool = True
    owner_first: bool = False
    path: Optional[Path] = None
    channel_dir: Optional[Path] = None


def _brief(value: str, channel_dir: Path, path: Path) -> Path:
    """A seat's brief goes into a prompt, so it must live under the channel folder or the shared seats folder."""
    brief = SEATS_DIR / f"{value[len('shared:') :]}.md" if value.startswith("shared:") else channel_dir / value
    real = brief.resolve()
    if not any(real.is_relative_to(root.resolve()) for root in (channel_dir, SEATS_DIR)):
        raise RoomConfigError(
            f"{path}: brief {value!r} is outside the channel folder and the shared seats; "
            "a brief is read into a model prompt"
        )
    return brief


def _int(data: dict, key: str, default: Optional[int], path: Path) -> int:
    raw = data.get(key, default)
    if isinstance(raw, bool) or not isinstance(raw, (int, str)):
        raise RoomConfigError(f"{path}: {key} must be an integer, not {raw!r}")
    try:
        return int(raw)
    except ValueError as exc:
        raise RoomConfigError(f"{path}: {key} must be an integer, not {raw!r}") from exc


def _limits(raw: Any, path: Path) -> dict[str, int]:
    """Per-seat caps (pipeline v2): at most N blockers, suggestions and keep lines a seat may return."""
    if raw is None:
        return {}
    if not isinstance(raw, dict) or not set(raw) <= set(LIMIT_KEYS):
        raise RoomConfigError(f"{path}: limits must be a mapping with keys from {LIMIT_KEYS}, not {raw!r}")
    for key, value in raw.items():
        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            raise RoomConfigError(f"{path}: limits.{key} must be a whole number of 1 or more, not {value!r}")
    return dict(raw)


def _flag(data: dict, key: str, default: bool, path: Path) -> bool:
    raw = data.get(key, default)
    if not isinstance(raw, bool):
        raise RoomConfigError(f"{path}: {key} must be true or false, not {raw!r}")
    return raw


def load_room(path: Path, channel_dir: Optional[Path] = None) -> RoomConfig:
    path = Path(path)
    channel_dir = Path(channel_dir) if channel_dir else path.parent
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (yaml.YAMLError, UnicodeDecodeError) as exc:
        raise RoomConfigError(f"{path}: invalid YAML ({exc})") from exc
    if data is None:
        data = {}
    if not isinstance(data, dict):
        raise RoomConfigError(f"{path}: top level must be a mapping, not {type(data).__name__}")
    missing = [k for k in REQUIRED if k not in data]
    if missing:
        raise RoomConfigError(f"{path}: missing {missing}")
    limits = _limits(data.get("limits"), path)
    try:
        seats = [
            SeatConfig(
                str(s["name"]), str(s["role"]), str(s["model"]), _brief(str(s["brief"]), channel_dir, path), limits
            )
            for s in data["seats"]
        ]
    except (KeyError, TypeError) as exc:
        raise RoomConfigError(f"{path}: every seat needs name, role, model and brief ({exc})") from exc
    slugs: dict[str, str] = {}
    for seat in seats:
        if seat_slug(seat.name) in ("", "meta", "judge"):
            raise RoomConfigError(
                f"{path}: seat {seat.name!r} has the file name {seat_slug(seat.name)!r}, "
                "which is empty or reserved (meta, judge)"
            )
        other = slugs.setdefault(seat_slug(seat.name), seat.name)
        if other != seat.name:
            raise RoomConfigError(
                f"{path}: seats {other!r} and {seat.name!r} have the same file name {seat_slug(seat.name)!r}"
            )
    fmt = data.get("format")
    if fmt is not None and not isinstance(fmt, dict):
        raise RoomConfigError(f"{path}: format must be a mapping, not {type(fmt).__name__}")
    for key in ("linters", "sources"):
        if data.get(key) is not None and not isinstance(data[key], list):
            raise RoomConfigError(f"{path}: {key} must be a list, not {type(data[key]).__name__}")
    return RoomConfig(
        writer=str(data["writer"]),
        judge=str(data["judge"]) if data.get("judge") else None,
        rounds=_int(data, "rounds", None, path),
        daily_cap=_int(data, "daily_cap", 80, path),
        seats=seats,
        format=fmt or {},
        linters=list(data.get("linters") or []),
        adopted=data.get("adopted"),
        pitch_clip=str(data.get("pitch_clip", "after_g2")),
        sources=list(data.get("sources") or []),
        viewer_required=_flag(data, "viewer_required", True, path),
        owner_first=_flag(data, "owner_first", False, path),
        path=path,
        channel_dir=channel_dir,
    )


def required_roles(cfg: RoomConfig) -> tuple[str, ...]:
    """The roles a round needs an ok verdict from to ship: MANDATORY, or story and fact when the viewer is optional."""
    return MANDATORY if cfg.viewer_required else ALWAYS_REQUIRED


def derived_cap(cfg: RoomConfig) -> int:
    seats = len(cfg.seats)
    required = required_roles(cfg)
    needed = sum(1 for s in cfg.seats if s.role in required)
    return cfg.rounds * (seats + 2) + cfg.rounds * seats + needed + 2 + OWNER_ROUNDS * needed


def _voices_problems(channel_dir: Path) -> list[str]:
    voices_file = channel_dir / "voices.yaml"
    if not voices_file.is_file():
        return ["pitch_clip pre_g2_local needs a voices.yaml"]
    try:
        loaded = yaml.safe_load(voices_file.read_text(encoding="utf-8")) or {}
    except (yaml.YAMLError, UnicodeDecodeError) as exc:
        return [f"pitch_clip pre_g2_local: voices.yaml is not valid YAML ({exc})"]
    voices = (loaded.get("voices") if isinstance(loaded, dict) else None) or {}
    if not isinstance(voices, dict):
        return ["pitch_clip pre_g2_local: voices in voices.yaml must be a mapping of name to engine"]
    if not voices:
        return ["pitch_clip pre_g2_local needs a non-empty voices.yaml"]
    return [
        f"pitch_clip pre_g2_local: voice {name!r} uses {v.get('tool')!r}, not a free local engine {LOCAL_TTS}"
        for name, v in voices.items()
        if not _is_local(v)
    ]


def _is_local(voice: Any) -> bool:
    """A voice that is free and local: its tool is a local engine, or it has a local engine beside a paid one."""
    if not isinstance(voice, dict):
        return False
    local = voice.get("local")
    return voice.get("tool") in LOCAL_TTS or (isinstance(local, dict) and local.get("engine") in LOCAL_TTS)


def validate(cfg: RoomConfig, registry: Optional[dict] = None) -> list[str]:
    reg = load_registry() if registry is None else registry
    problems: list[str] = []

    def fam(model: str, what: str) -> Optional[str]:
        try:
            return family_of(model, reg)
        except UnknownModel as exc:
            problems.append(f"{what}: {exc}")
            return None

    writer = fam(cfg.writer, "writer")
    judge = fam(cfg.judge, "judge") if cfg.judge else None
    if writer and judge and judge == writer:
        problems.append(f"judge {cfg.judge} is the writer's family ({writer})")
    if not 1 <= cfg.rounds <= 5:
        problems.append(f"rounds must be 1 to 5, not {cfg.rounds}")
    seen: set[str] = set()
    required = required_roles(cfg)
    mandatory_families: set[str] = set()
    for s in cfg.seats:
        if s.name in seen:
            problems.append(f"seat {s.name!r} appears twice")
        seen.add(s.name)
        if s.role not in ROLES:
            problems.append(f"seat {s.name!r}: unknown role {s.role!r} (want one of {ROLES})")
        f = fam(s.model, f"seat {s.name!r}")
        if f and writer and s.role in LOCKED_ROLES and f == writer:
            problems.append(f"seat {s.name!r} ({s.role}) is on the writer's family ({writer})")
        if s.role in SELF_LOCKED and s.model == cfg.writer:
            problems.append(f"seat {s.name!r} ({s.role}) is the writer's own model ({cfg.writer})")
        if f and s.role in required and f != writer:
            mandatory_families.add(f)
        if not s.brief.is_file():
            problems.append(f"seat {s.name!r}: brief {s.brief} does not exist")
    roles = {s.role for s in cfg.seats}
    for role in MANDATORY:
        if role not in roles:
            problems.append(f"missing mandatory role {role!r}")
    if len(mandatory_families) < 2:
        problems.append(f"the {', '.join(required)} seats need two or more families other than the writer's")
    if cfg.pitch_clip not in PITCH_CLIPS:
        problems.append(f"pitch_clip must be one of {PITCH_CLIPS}")
    elif cfg.pitch_clip == "pre_g2_local" and cfg.channel_dir:
        problems += _voices_problems(cfg.channel_dir)
    cap = derived_cap(cfg)
    ceiling = ledger.studio_daily_cap()
    if min(cfg.daily_cap, ceiling) < cap:
        problems.append(f"daily cap {cfg.daily_cap} (studio ceiling {ceiling}) is below one script's derived cap {cap}")
    return problems
