"""The protected spine and the author's cut (pipeline v2, section 4): what the room changed in the writer's draft.

The spine's mechanical part is the header lines (the five lines, `> UNDER:` and the writer's `> DARLING:` lines) and
the seats' keep lines. The rest of what review costs (fragments, jokes, images) is the writer's three-line report.
"""

from __future__ import annotations

import difflib
import re

NO_COST = {"lines_changed": 0, "header_changed": [], "keep_lost": []}
HEADER = re.compile(r"^>\s*(SITUATION|DESIRE|CONFLICT|CHANGE|RESULT|UNDER|DARLING)\s*:\s*(.*)$")


def header_lines(text: str) -> list[tuple[str, str]]:
    """(name, body) for every spine header line, in order."""
    return [(m.group(1), m.group(2).strip()) for m in map(HEADER.match, (ln.strip() for ln in text.splitlines())) if m]


def _norm(text: str) -> str:
    return " ".join(text.split()).casefold()


def voice_cost(first: str, shipped: str, keeps: list[str]) -> dict:
    """Lines changed from the writer's first draft, spine lines changed or cut, and keep lines no longer in it."""
    kept_headers = set(header_lines(shipped))
    body = _norm(shipped)
    ops = difflib.SequenceMatcher(None, first.splitlines(), shipped.splitlines(), autojunk=False).get_opcodes()
    return {
        "lines_changed": sum((i2 - i1) + (j2 - j1) for tag, i1, i2, j1, j2 in ops if tag != "equal"),
        "header_changed": list(dict.fromkeys(n for n, b in header_lines(first) if (n, b) not in kept_headers)),
        "keep_lost": list(dict.fromkeys(q for q in keeps if q.strip() and _norm(q) not in body)),
    }
