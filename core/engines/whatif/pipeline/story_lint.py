"""The mechanical part of a what-if channel's story rules, run by the room's lint before any seat reads a script.

    python story_lint.py <script.md>     exit 0 clean, 1 problems (printed), 2 usage

Today one check: the five lines first (Say Suppose `rules/story.md`, check 1, from Tim Runia). Before the first
`## [mm:ss]` beat the script carries, once each and in this order:

    > SITUATION: ...
    > DESIRE: ...
    > CONFLICT: ...
    > CHANGE: ...
    > RESULT: ...

They are direction lines, so the narrator never speaks them and the claims check never reads them. Whether every
scene serves one of them is the story seat's call; everything else in rules/story.md needs a reader.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

FIVE = ("SITUATION", "DESIRE", "CONFLICT", "CHANGE", "RESULT")
BEAT = re.compile(r"^## \[\d{2}:\d{2}\]")
FIVE_LINE = re.compile(r"^>\s*(" + "|".join(FIVE) + r")\s*:(.*)$")


def problems(text: str) -> list[str]:
    found: list[tuple[str, str, bool]] = []  # (name, body, before the first beat)
    before = True
    for raw in text.splitlines():
        line = raw.strip()
        if BEAT.match(line):
            before = False
        m = FIVE_LINE.match(line)
        if m:
            found.append((m.group(1), m.group(2).strip(), before))
    out: list[str] = []
    missing = [n for n in FIVE if n not in {f[0] for f in found}]
    if missing:
        out.append("five lines first (rules/story.md #1): missing "
                   + ", ".join(f"> {n}:" for n in missing) + " before the first beat")
    late = [n for n, _, b in found if not b]
    if late:
        out.append("five lines first: " + ", ".join(late) + " must come before the first beat, not inside the script")
    for name in FIVE:
        count = sum(1 for n, _, _ in found if n == name)
        if count > 1:
            out.append(f"five lines first: {name} is given {count} times; give it once")
    for name, body, _ in found:
        if not body:
            out.append(f"five lines first: {name} is empty; one line each")
    order = [n for n, _, b in found if b]
    if not missing and len(order) == len(FIVE) and order != list(FIVE):
        out.append("five lines first: give them in the order " + ", ".join(FIVE) + f", not {', '.join(order)}")
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print("usage: story_lint.py <script.md>", file=sys.stderr)
        return 2
    path = Path(argv[0])
    if not path.is_file():
        print(f"{path}: no such file", file=sys.stderr)
        return 2
    found = problems(path.read_text(encoding="utf-8"))
    for p in found:
        print(p)
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
