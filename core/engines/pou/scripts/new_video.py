#!/usr/bin/env python3
"""Scaffold a per-video folder: videos/<YYYY-MM-DD_slug>/ with one file per gate."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

PACKAGING = """# Packaging (G1)

status: draft  # draft | approved
topic_id:
chosen_title:
chosen_thumbnail:  # A | B | C
premise: |
  One sentence: what the viewer will believe by the end that they do not believe now.

## Title candidates (unlimited rounds; keep every round)
| # | title | claims that back the promise (ids from claims.md) | round |
|---|-------|-----------------------------------------------------|-------|
| 1 | | | 1 |

## Thumbnail concepts (files in thumbs/)
| # | file | visual idea | text (<=3 words) | why it pairs with the title |
|---|------|-------------|------------------|-----------------------------|
| A | thumbs/A.png | | | |
| B | thumbs/B.png | | | |
| C | thumbs/C.png | | | |

## In-context check (thumbs/context/phone.png and tv.png next to competitor thumbnails)
-

## Cold click test (you and at least one other person pick one of A/B/C, no explanation first)
| person | pick | one-line why |
|--------|------|--------------|

## Hand-tuning notes on the chosen thumbnail
-
"""

RESEARCH = """# Research brief

## Thesis
(one sentence)

## Facts (15-25; each ends with a claim id from claims.md)
- (c01)

## Top 5 surprises (these drive the hook, the re-engagements and the payoff)
1.

## Three angles considered
1.
2.
3.

## Sources
1. https://
"""

CLAIMS = """# Claims ledger

Every number, date, name or quoted finding spoken in the script has one row here.
The script doctor may flag a missing claim; it never writes one.

| id | claim as it will be spoken | source URL | verbatim quote from the source | status |
|----|----------------------------|------------|--------------------------------|--------|
| c01 | | | | sourced |

status: sourced | contested | spot-checked (you opened the URL and found the quote)

## Contested claims (each becomes a spoken caveat)
-
"""

SCRIPT = """# Script (G2)

template: mystery  # mystery | essay | list | documentary
target_minutes: 5
status: draft  # draft | approved
hook: hooks/hook-1.md  # the bake-off winner

## [00:00] Prove the title
> VISUAL: (custom-made frames; change every 2-4 s here)
A concrete image or number in the first 10 s. No preamble. *One* emphasised word per sentence.

## [00:10] Why it matters to you
> VISUAL:
Second hook: name the viewer's personal stake.

## [00:30] Agenda
> VISUAL:
One line: "three things...".

## [00:40] Beat 1
> VISUAL:
Evidence, then twist, then "so for you...".

## [01:50] Beat 2
> VISUAL:
Evidence, then twist, then "so for you...".

## [02:30] Beat 3
> RE-ENGAGE: (~2:30 midpoint: reversal or open loop)
> VISUAL:
Evidence, then twist, then "so for you...".

## [03:30] Beat 4 (optional)
> VISUAL:
Evidence, then twist, then "so for you...".

## [04:20] Take-home
> VISUAL:
1-3 practical takeaways, each backed by a row in claims.md.

## [04:50] Stop
> VISUAL: (the last 10-15 s leave room for end screens)
Subscribe line. Stop.

## Chapters
00:00 Prove the title

## Sources
- https://
"""

QC = """# QC (G6 final watch)

## Technical (filled by the QC agent)
- duration / resolution / fps:
- loudness (LUFS):
- black or frozen frames:
- unintended silences > 2 s:
- scene_detect: shots, median hold, longest hold, changes per minute (min / max):
- actual words per minute:

## Predictor notes (virality_predictor; notes only, never a gate)
-

## Your watch at 1x (first 90 s, then the whole video)
One line per place you would skip: `mm:ss  reason`
-

## Cold viewers (1-3 people, same instructions)
| viewer | skip timestamps | first 3 min clean? |
|--------|-----------------|--------------------|

## Verdict
G6: approved | sent back to <stage>: <reason>
"""

COSTS = """# Ledger for this video (track, do not cap)

| item | provider | quantity | credits | usd |
|------|----------|----------|---------|-----|

| stage | human minutes |
|-------|---------------|
| topic selection | |
| research + spot-checks | |
| packaging (all rounds, mockups, click test) | |
| hooks + script + doctor + table read | |
| narration + lock | |
| visual plan + rough cut | |
| assets + edit review + render | |
| QC + final watch + cold viewers | |
| publish | |
| learn (72 h, 7 d) | |
"""


def create_video_dir(root: Path, slug: str, date: dt.date) -> Path:
    if not SLUG_RE.match(slug):
        raise ValueError(f"slug must be kebab-case ascii, got {slug!r}")
    d = Path(root) / f"{date:%Y-%m-%d}_{slug}"
    if d.exists():
        raise FileExistsError(d)
    for sub in ("assets", "thumbs/context", "hooks", "narration", "renders", "captions", "metrics"):
        (d / sub).mkdir(parents=True)
    (d / "packaging.md").write_text(PACKAGING)
    (d / "research.md").write_text(RESEARCH)
    (d / "claims.md").write_text(CLAIMS)
    (d / "script.md").write_text(SCRIPT)
    (d / "qc.md").write_text(QC)
    (d / "costs.md").write_text(COSTS)
    (d / "assets" / "provenance.csv").write_text("file,kind,source,model,license,credits,usd,note\n")
    return d


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("slug")
    p.add_argument("--date", type=dt.date.fromisoformat, default=dt.date.today())
    p.add_argument("--root", type=Path, default=Path("videos"))
    a = p.parse_args()
    print(create_video_dir(a.root, a.slug, a.date))


if __name__ == "__main__":
    main()
