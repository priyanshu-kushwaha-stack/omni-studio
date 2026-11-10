#!/usr/bin/env python3
"""Extract the spoken text of a script.md for TTS, split into parts at section turns.

Drops `> VISUAL:` beats, headings, front matter and everything from `## Chapters` on; strips the
*emphasis* marks and (cNN) claim references. Parts are groups of consecutive sections, given as
1-based section indexes, e.g. --parts 1-3,4-5,6-8. Prints JSON: [{"sections": [...], "text": ...}].
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

SPEECH_RESPELL = {"Tsimane": "Chimane"}  # same people, spelling the TTS reads correctly


def clean(line: str) -> str:
    line = re.sub(r"\s*\(c\d+(?:,\s*c\d+)*\)", "", line)
    line = re.sub(r"\*(.+?)\*", r"\1", line)
    for a, b in SPEECH_RESPELL.items():
        line = line.replace(a, b)
    return line.strip()


def sections(text: str) -> list[tuple[str, str]]:
    """Return [(section heading, spoken text)] in script order."""
    out: list[tuple[str, list[str]]] = []
    for line in text.splitlines():
        if line.startswith("## Chapters") or line.startswith("## Sources"):
            break
        if line.startswith("## "):
            out.append((line[3:].strip(), []))
        elif line.startswith(">") or line.startswith("#") or not line.strip() or not out:
            continue
        else:
            out[-1][1].append(clean(line))
    return [(h, " ".join(ls)) for h, ls in out if ls]


def split_parts(secs: list[tuple[str, str]], spec: str) -> list[dict]:
    parts = []
    for rng in spec.split(","):
        a, _, b = rng.partition("-")
        lo, hi = int(a), int(b or a)
        chosen = secs[lo - 1 : hi]
        parts.append({"sections": [h for h, _ in chosen], "text": " ".join(t for _, t in chosen)})
    return parts


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("script", type=Path)
    p.add_argument("--parts", default=None, help="e.g. 1-3,4-5,6-8 (default: one part per section)")
    a = p.parse_args()
    secs = sections(a.script.read_text())
    spec = a.parts or ",".join(str(i) for i in range(1, len(secs) + 1))
    print(json.dumps(split_parts(secs, spec), ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
