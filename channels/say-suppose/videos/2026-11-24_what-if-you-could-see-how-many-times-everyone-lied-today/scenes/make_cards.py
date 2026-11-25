"""script.md's `> CARD:` lines -> scenes/cardData.ts, so the film's cards follow the script with no hand copying.

    python scenes/make_cards.py        (from the video folder or anywhere)

A card line reads `> CARD: TOP: sub (on "cue words")` or `> CARD: TOP (on "cue words")`. It is placed on the first
spoken line at or after it whose text contains the cue words (else the next spoken line), at the cue's position in
that line. Spoken lines are bare lines and `Name: text` lines under timed `## [mm:ss]` headings (story.py's rules).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "script.md"
CARD = re.compile(r'^> CARD:\s*(.+?)\s*(?:\(on\s+["“](.+?)["”]\))?\s*$')
TIMED = re.compile(r"^## \[\d{2}:\d{2}\]")
CITE = re.compile(r"\s*\((?:c\d{2,3})(?:\s*,\s*c\d{2,3})*\)")


def spoken(lines: list[str]) -> list[tuple[int, str]]:
    out, on = [], False
    for n, raw in enumerate(lines):
        s = raw.strip()
        if s.startswith("## "):
            on = bool(TIMED.match(s))
            continue
        if not on or not s or s.startswith((">", "#", "|", "-")):
            continue
        out.append((n, CITE.sub("", s)))
    return out


def main() -> None:
    lines = SCRIPT.read_text(encoding="utf-8").splitlines()
    talk = spoken(lines)
    cards = []
    for n, raw in enumerate(lines):
        m = CARD.match(raw.strip())
        if not m:
            continue
        body, cue = CITE.sub("", m.group(1)).strip(), m.group(2) or ""
        top, _, sub = body.partition(":")
        after = [t for t in talk if t[0] > n]
        before = [t for t in talk if t[0] < n][-3:]
        pick = next((t for t in before + after if cue and cue.lower() in t[1].lower()), after[0] if after else None)
        if pick is None:
            continue
        secs = max(3.0, min(6.5, 1.6 + 0.08 * len(body)))
        cards.append({"line": pick[1][:60], "cue": cue, "top": top.strip(), "sub": sub.strip(), "secs": round(secs, 1)})
    body = json.dumps(cards, indent=2, ensure_ascii=False)
    (HERE / "cardData.ts").write_text(
        "// Made by make_cards.py from script.md's > CARD: lines. Do not edit by hand.\n"
        "export type CardItem = { line: string; cue: string; top: string; sub: string; secs: number };\n"
        f"export const CARDS: CardItem[] = {body};\n",
        encoding="utf-8",
    )
    print(f"{len(cards)} cards -> {HERE / "cardData.ts"}")


if __name__ == "__main__":
    main()
