"""Owner notes registered at a gate, and the gate's call cap they raise.

`room lint --owner-notes --owner-note "<words>"` registers one dated note from the channel's `taste.md`: the words must
equal the text of one `**"..."**` quote there (whitespace collapsed), and a note registers once per video and gate.
Each registered note adds OWNER_NOTE_ROUNDS rounds of the required seats to that gate's cap, on top of `derived_cap`.
Rounds an agent starts to apply the room's own notes register nothing. Only the owner's words go into taste.md, so this
is a convention, not a boundary (docs/superpowers/specs/2026-11-12-room-owner-note-budget-design.md).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from studio.room import report as R
from studio.room.config import RoomConfig, derived_cap, required_roles

OWNER_NOTE_ROUNDS = 2
QUOTE = re.compile(r'\*\*"(.+?)"\*\*', re.S)


def _norm(words: str) -> str:
    return " ".join(words.split())


def taste_quotes(channel_dir: Path) -> list[str]:
    """The bold-quoted owner words in the channel's taste.md, in file order."""
    try:
        text = (Path(channel_dir) / "taste.md").read_text(encoding="utf-8")
    except OSError:
        return []
    return [_norm(m) for m in QUOTE.findall(text)]


def registered(video_dir: Path, gate: str, skip_round: int = 0) -> list[str]:
    """Notes registered at the gate, in round order; skip_round leaves out the round being linted again."""
    notes: list[str] = []
    for meta_file in sorted(R.gate_dir(video_dir, gate).glob("round-*/meta.json"), key=_round_no):
        if _round_no(meta_file) == skip_round:
            continue
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        raw = meta.get("owner_note") if isinstance(meta, dict) else None
        notes += [n for n in raw if isinstance(n, str) and n not in notes] if isinstance(raw, list) else []
    return notes


def _round_no(meta_file: Path) -> int:
    try:
        return int(meta_file.parent.name.removeprefix("round-"))
    except ValueError:
        return -1


def normalise(words: list[str]) -> list[str]:
    out: list[str] = []
    for w in words:
        n = _norm(w)
        if n not in out:
            out.append(n)
    return out


def problems(words: list[str], channel_dir: Path, video_dir: Path, gate: str, rnd: int) -> list[str]:
    """Why these notes can't be registered at this round, or nothing."""
    quotes = taste_quotes(channel_dir)
    earlier = registered(video_dir, gate, skip_round=rnd)
    out = []
    for note in normalise(words):
        if note not in quotes:
            out.append(f"--owner-note {note!r}: no bold quote in taste.md matches; add the owner's words there first")
        elif note in earlier:
            out.append(f"--owner-note {note!r} is already registered at {gate}; a note buys rounds once")
    return out


def gate_cap(cfg: RoomConfig, video_dir: Path, gate: str) -> int:
    needed = sum(1 for s in cfg.seats if s.role in required_roles(cfg))
    return derived_cap(cfg) + OWNER_NOTE_ROUNDS * needed * len(registered(video_dir, gate))
