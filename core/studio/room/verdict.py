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
    """The first fenced block that is a JSON object, else the last fenced block, else the outer braces."""
    fences = FENCE_RE.findall(text)
    candidates = [fences[0], fences[-1]] if fences else []
    if "{" in text and "}" in text:
        candidates.append(text[text.find("{"): text.rfind("}") + 1])
    if not candidates:
        raise BadVerdict("no JSON object in the output")
    error = "no JSON object in the output"
    for candidate in candidates:
        try:
            data = json.loads(candidate)
        except json.JSONDecodeError as exc:
            error = f"not JSON: {exc}"
            continue
        if isinstance(data, dict):
            return data
        error = "a verdict must be a JSON object"
    raise BadVerdict(error)


def _items(raw: list[Any]) -> list[dict[str, Any]]:
    """Suggestions and keep lines are dicts: a bare string becomes {"quote": s}, anything else is dropped."""
    return [{"quote": i} if isinstance(i, str) else i for i in raw if isinstance(i, (str, dict))]


def parse_verdict(text: str, *, call_id: str, seat: str, role: str, model: str, family: str) -> Verdict:
    if role not in ROLES:
        raise ValueError(f"unknown role {role!r}")
    data = extract_json(text)
    if not any(k in data for k in ("scores", "blockers", "suggestions", "keep")):
        raise BadVerdict("the verdict has none of scores, blockers, suggestions, keep")
    scores = data.get("scores") or {}
    if not isinstance(scores, dict):
        raise BadVerdict("scores must be an object")
    if not isinstance(data.get("suggestions") or [], list) or not isinstance(data.get("keep") or [], list):
        raise BadVerdict("suggestions and keep must be lists")
    if "blockers" in data and not isinstance(data["blockers"], list):
        raise BadVerdict("blockers must be a list")
    suggestions = _items(data.get("suggestions") or [])
    keep = _items(data.get("keep") or [])
    blockers: list[Blocker] = []
    for b in data.get("blockers") or []:
        if not isinstance(b, dict) or not isinstance(b.get("quote"), str) or not isinstance(b.get("why"), str):
            raise BadVerdict(f"a blocker needs a quote and a why: {b!r}")
        line = b.get("line") if isinstance(b.get("line"), int) else None
        domain = str(b.get("domain") or "").strip().lower() or role
        blocker = Blocker(quote=b["quote"], why=b["why"], fix=str(b.get("fix") or ""), domain=domain, line=line)
        if role != "fact" and domain != role:  # a fact blocker is never demoted, whatever domain the model names
            suggestions.append({**asdict(blocker), "moved": f"blocker outside the {role} role"})
        elif role != "fact" and not (blocker.quote.strip() and blocker.why.strip() and blocker.fix.strip()):
            # invariant 4: a blocker quotes the draft and gives a concrete fix, or it is only a suggestion
            suggestions.append({**asdict(blocker), "moved": "blocker without a quote, a why and a fix"})
        else:
            blockers.append(blocker)
    return Verdict(call_id, seat, role, model, family, "ok", scores, blockers, suggestions, keep)


def failed_verdict(*, call_id: str, seat: str, role: str, model: str, family: str, error: str) -> Verdict:
    return Verdict(call_id, seat, role, model, family, "failed", error=error)


def verdict_digest(record: dict[str, Any]) -> str:
    """sha256 of a verdict record without its own hashes: what the ledger stores to bind the file to the call."""
    body = {k: v for k, v in record.items() if k not in ("output_sha256", "verdict_sha256")}
    return hashlib.sha256(json.dumps(body, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()
