"""The mechanical part of a what-if channel's story rules, run by the room's lint before any seat reads a script.

    python story_lint.py <script.md> [--under-from YYYY-MM-DD]     exit 0 clean, 1 problems (printed), 2 usage

Three checks. First, the five lines first (Say Suppose `rules/story.md`, check 1, from Tim Runia). Before the first
`## [mm:ss]` beat the script carries, once each and in this order:

    > SITUATION: ...
    > DESIRE: ...
    > CONFLICT: ...
    > CHANGE: ...
    > RESULT: ...

They are direction lines, so the narrator never speaks them and the claims check never reads them. Whether every
scene serves one of them is the story seat's call; everything else in rules/story.md needs a reader.

Second, the meaning layer (pipeline v2, `docs/superpowers/specs/2026-11-10-say-suppose-pipeline-v2-design.md`): one
`> UNDER:` line, the question under the question, before the first beat and ending in "?". It is required when
`--under-from` is given and the script's video folder is dated on or after it, so videos begun earlier finish as
they started. Third, the darlings: at most three `> DARLING:` lines, each a spoken line of the script.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

FIVE = ("SITUATION", "DESIRE", "CONFLICT", "CHANGE", "RESULT")
BEAT = re.compile(r"^## \[\d{2}:\d{2}\]")
HEADER_LINE = re.compile(r"^>\s*(" + "|".join((*FIVE, "UNDER", "DARLING")) + r")\s*:(.*)$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}")
MAX_DARLINGS = 3


def _flat(text: str) -> str:
    return " ".join(text.split()).casefold()


def _headers(text: str) -> list[tuple[str, str, bool]]:
    """(name, body, before the first beat) for every five-line, UNDER and DARLING direction line."""
    found: list[tuple[str, str, bool]] = []
    before = True
    for raw in text.splitlines():
        line = raw.strip()
        if BEAT.match(line):
            before = False
        if m := HEADER_LINE.match(line):
            found.append((m.group(1), m.group(2).strip(), before))
    return found


def meaning_problems(headers: list[tuple[str, str, bool]], text: str, require_under: bool) -> list[str]:
    unders = [(body, early) for name, body, early in headers if name == "UNDER"]
    darlings = [body.strip("\"'") for name, body, _ in headers if name == "DARLING"]
    out: list[str] = []
    if require_under and not unders:
        out.append("the meaning layer: missing > UNDER: (the question under the question) before the first beat")
    if len(unders) > 1:
        out.append(f"the meaning layer: > UNDER: is given {len(unders)} times; give it once")
    for body, early in unders:
        if not early:
            out.append("the meaning layer: > UNDER: must come before the first beat, with the five lines")
        if not body.endswith("?"):
            out.append("the meaning layer: > UNDER: is a question the film never answers aloud; end it with ?")
    if len(darlings) > MAX_DARLINGS:
        out.append(f"darlings: {len(darlings)} > DARLING: lines; name at most three")
    spoken = {_flat(ln) for ln in text.splitlines() if ln.strip() and ln.strip()[0] not in ">#"}
    out += [f'darlings: "{d}" is not a spoken line of the script' for d in darlings if _flat(d) not in spoken]
    return out


def problems(text: str, require_under: bool = False) -> list[str]:
    headers = _headers(text)
    found = [h for h in headers if h[0] in FIVE]  # (name, body, before the first beat)
    out: list[str] = []
    missing = [n for n in FIVE if n not in {f[0] for f in found}]
    if missing:
        out.append(
            "five lines first (rules/story.md #1): missing "
            + ", ".join(f"> {n}:" for n in missing)
            + " before the first beat"
        )
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
    return out + meaning_problems(headers, text, require_under)


def main(argv: list[str]) -> int:
    since = ""
    if len(argv) == 3 and argv[1] == "--under-from":
        argv, since = argv[:1], argv[2]
    if len(argv) != 1 or (since and not DATE.fullmatch(since)):
        print("usage: story_lint.py <script.md> [--under-from YYYY-MM-DD]", file=sys.stderr)
        return 2
    path = Path(argv[0])
    if not path.is_file():
        print(f"{path}: no such file", file=sys.stderr)
        return 2
    dated = DATE.match(path.resolve().parent.name)
    require_under = bool(since and dated and dated.group(0) >= since)
    found = problems(path.read_text(encoding="utf-8"), require_under)
    for p in found:
        print(p)
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
