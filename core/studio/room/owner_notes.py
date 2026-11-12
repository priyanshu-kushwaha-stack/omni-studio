"""Owner notes registered at a gate, and the gate's call cap they raise.

`room lint --owner-notes --owner-note "<words>"` registers one dated note from the channel's `taste.md`: the words must
equal the text of one `**"..."**` quote there (whitespace collapsed), and a note registers once per video and gate.
Each registered note adds config.OWNER_NOTE_ROUNDS rounds of the required seats to that gate's cap, on top of `derived_cap`.
Rounds an agent starts to apply the room's own notes register nothing. Only the owner's words go into taste.md, so this
is a convention, not a boundary (docs/superpowers/specs/2026-11-12-room-owner-note-budget-design.md).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

from studio.room import report as R
from studio.room.config import RoomConfig, derived_cap

QUOTE = re.compile(r'\*\*"(.+?)"\*\*', re.S)


def _norm(words: str) -> str:
    return " ".join(words.split())


def normalise(words: Optional[list[str]]) -> list[str]:
    """Whitespace collapsed, duplicates dropped, order kept."""
    return list(dict.fromkeys(_norm(w) for w in words or []))


def taste_quotes(channel_dir: Path) -> list[str]:
    """The bold-quoted owner words in the channel's taste.md, in file order."""
    try:
        text = (Path(channel_dir) / "taste.md").read_text(encoding="utf-8")
    except OSError:
        return []
    return [_norm(m) for m in QUOTE.findall(text)]


def registered(video_dir: Path, gate: str, skip_round: int = 0) -> list[str]:
    """Notes registered at the gate; skip_round leaves out the round being linted again."""
    notes: list[str] = []
    for meta_file in sorted(R.gate_dir(video_dir, gate).glob("round-*/meta.json")):
        meta = R._json(meta_file) or {}
        if meta.get("round") == skip_round:
            continue
        for note in meta.get("owner_note") or []:
            if isinstance(note, str) and note not in notes:
                notes.append(note)
    return notes


def problems(notes: list[str], channel_dir: Path, video_dir: Path, gate: str, rnd: int) -> list[str]:
    """Why these normalised notes can't be registered at this round, or nothing."""
    quotes = taste_quotes(channel_dir)
    earlier = registered(video_dir, gate, skip_round=rnd)
    out = []
    for note in notes:
        if note not in quotes:
            out.append(f"--owner-note {note!r}: no bold quote in taste.md matches; add the owner's words there first")
        elif note in earlier:
            out.append(f"--owner-note {note!r} is already registered at {gate}; a note buys rounds once")
    return out


def gate_cap(cfg: RoomConfig, video_dir: Path, gate: str) -> int:
    return derived_cap(cfg, notes=len(registered(video_dir, gate)))
