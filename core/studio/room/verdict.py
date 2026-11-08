"""A seat's verdict: scores (informational), blockers inside the seat's role, suggestions, keep lines."""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import asdict, dataclass, field
from typing import Any, Optional

ROLES = ("viewer", "story", "fact", "neutrality", "voice", "craft")
MANDATORY = ("viewer", "story", "fact")
LOCKED_ROLES = ("viewer", "story", "fact", "neutrality")  # never the writer's family
FENCE_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.S)


class BadVerdict(ValueError):
    pass


@dataclass
class Blocker:
    quote: str
    why: str
    fix: str
    domain: str
    line: Optional[int] = None


@dataclass
class Verdict:
    call_id: str
    seat: str
    role: str
    model: str
    family: str
    status: str  # ok | failed
    scores: dict[str, Any] = field(default_factory=dict)
    blockers: list[Blocker] = field(default_factory=list)
    suggestions: list[dict[str, Any]] = field(default_factory=list)
    keep: list[dict[str, Any]] = field(default_factory=list)
    error: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Verdict":
        fields = {k: data[k] for k in cls.__dataclass_fields__ if k in data}
        fields["blockers"] = [Blocker(**b) for b in data.get("blockers", [])]
        return cls(**fields)


def extract_json(text: str) -> dict[str, Any]:
    m = FENCE_RE.search(text)
    if m:
        candidate = m.group(1)
    elif "{" in text and "}" in text:
        candidate = text[text.find("{"): text.rfind("}") + 1]
    else:
        raise BadVerdict("no JSON object in the output")
    try:
        data = json.loads(candidate)
    except json.JSONDecodeError as exc:
        raise BadVerdict(f"not JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise BadVerdict("a verdict must be a JSON object")
    return data


def parse_verdict(text: str, *, call_id: str, seat: str, role: str, model: str, family: str) -> Verdict:
    if role not in ROLES:
        raise ValueError(f"unknown role {role!r}")
    data = extract_json(text)
    if not any(k in data for k in ("scores", "blockers", "suggestions", "keep")):
        raise BadVerdict("the verdict has none of scores, blockers, suggestions, keep")
    scores = data.get("scores") or {}
    suggestions = data.get("suggestions") or []
    keep = data.get("keep") or []
    if not isinstance(scores, dict):
        raise BadVerdict("scores must be an object")
    if not isinstance(suggestions, list) or not isinstance(keep, list):
        raise BadVerdict("suggestions and keep must be lists")
    if "blockers" in data and not isinstance(data["blockers"], list):
        raise BadVerdict("blockers must be a list")
    blockers: list[Blocker] = []
    for b in data.get("blockers") or []:
        if not isinstance(b, dict) or not isinstance(b.get("quote"), str) or not isinstance(b.get("why"), str):
            raise BadVerdict(f"a blocker needs a quote and a why: {b!r}")
        line = b.get("line") if isinstance(b.get("line"), int) else None
        blocker = Blocker(quote=b["quote"], why=b["why"], fix=str(b.get("fix") or ""),
                          domain=str(b.get("domain") or role), line=line)
        if blocker.domain != role:
            suggestions.append({**asdict(blocker), "moved": f"blocker outside the {role} role"})
        else:
            blockers.append(blocker)
    return Verdict(call_id, seat, role, model, family, "ok", scores, blockers, suggestions, keep)


def failed_verdict(*, call_id: str, seat: str, role: str, model: str, family: str, error: str) -> Verdict:
    return Verdict(call_id, seat, role, model, family, "failed", error=error)


def verdict_digest(record: dict[str, Any]) -> str:
    """sha256 of a verdict record without its own hashes: what the ledger stores to bind the file to the call."""
    body = {k: v for k, v in record.items() if k not in ("output_sha256", "verdict_sha256")}
    return hashlib.sha256(json.dumps(body, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()
