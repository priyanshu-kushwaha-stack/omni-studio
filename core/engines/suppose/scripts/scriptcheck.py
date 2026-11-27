"""Measure a Say Suppose script against the master script prompt's targets (spec: Prompts and skills).

python scriptcheck.py <script.md> [--json]   -> exit 1 on any FAIL

Word count (800-1,100 hard, 900-1,050 target) and format (one paragraph, no speaker labels, quotes, headings, stage
directions or markdown; numbers in words; the hero unnamed) fail. The voice targets only warn.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# An ellipsis ends a sentence only before a capital or the end; "run... fast." is one sentence.
SENT = re.compile(r"(?:[^.!?]|\.\.\.(?!\s+[A-Z]|\s*$))+(?:\.\.\.|[.!?])+")
YEAR = re.compile(r"^(1[5-9]|20)\d\d$")
FORMAT = [
    (re.compile(r"(^|\s)[A-Z][A-Z .']{1,20}:\s"), "speaker label"),
    (re.compile(r"[\"“”]"), "double quotes around dialogue"),
    (
        re.compile(r"\[[^\]]*\]|\(\s*(?:(?:camera|cut to|music|sfx|pause|beat)\b|scene:)[^)]*\)", re.I),
        "stage direction",
    ),
    (re.compile(r"(^|\s)#{1,6}\s|\*\*?[^*]+\*|\n\s*[-*] "), "markdown"),
]


def extract(text: str) -> str:
    i = text.find("SCRIPT:")
    return (text[i + 7 :] if i >= 0 else text).strip()


def sentences(script: str) -> list[str]:
    return [s.strip() for s in SENT.findall(script) if s.strip()]


def metrics(script: str) -> dict:
    sents = sentences(script)
    words = script.split()
    lens = [len(s.split()) for s in sents] or [0]
    you = sum(1 for w in words if re.sub(r"\W", "", w.lower()) in {"you", "your", "youre", "yours"})
    digits = [d for d in re.findall(r"\d+(?:[,.]\d+)*", script) if not YEAR.match(d)]
    return {
        "words": len(words),
        "sentences": len(sents),
        "avg_words": round(sum(lens) / len(lens), 2),
        "short_share": round(sum(1 for n in lens if n <= 4) / len(lens), 2),
        "long": sum(1 for n in lens if n > 15),
        "ellipses": script.count("..."),
        "questions": script.count("?"),
        "you_per_100": round(100 * you / max(1, len(words)), 1),
        "digits": digits,
    }


def _format_fails(script: str, hero_names: tuple[str, ...]) -> list[str]:
    fails = [f"format: {name}" for pattern, name in FORMAT if pattern.search(script)]
    if "\n\n" in script.strip():
        fails.append("format: more than one paragraph")
    for name in hero_names:
        n = re.escape(name)
        said = rf"\b(your name is|you're|call you)\s+{n}\b"
        addressed = rf"(?:^|[.!?]\s+){n}\s*[!,]"
        if re.search(said, script, re.I) or re.search(addressed, script):
            fails.append(f"hero named: {name}")
    return fails


def _warns(m: dict) -> list[str]:
    targets = [
        ("ellipses", 18, 25),
        ("questions", 15, 20),
        ("you_per_100", 5.5, 8.5),
        ("avg_words", 3.5, 5.5),
        ("short_share", 0.4, 1.0),
    ]
    warns = [f"{k} {m[k]} outside {lo}-{hi}" for k, lo, hi in targets if not lo <= m[k] <= hi]
    if m["long"] > 2:
        warns.append(f"{m['long']} sentences over 15 words")
    if not 900 <= m["words"] <= 1050:
        warns.append(f"words {m['words']} outside the 900-1,050 target")
    return warns


def check(script: str, hero_names: tuple[str, ...] = ()) -> tuple[list[str], list[str]]:
    m = metrics(script)
    fails = _format_fails(script, hero_names)
    if not 800 <= m["words"] <= 1100:
        fails.append(f"words {m['words']} outside 800-1,100")
    if m["digits"]:
        fails.append(f"numbers written as digits: {m['digits'][:5]}")
    return fails, _warns(m)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("script")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--hero", action="append", default=[], metavar="NAME", help="hero name that must not appear")
    args = ap.parse_args(argv)
    script = extract(Path(args.script).read_text(encoding="utf-8"))
    fails, warns = check(script, hero_names=tuple(args.hero))
    if args.json:
        print(json.dumps({"metrics": metrics(script), "fails": fails, "warns": warns}, indent=1))
    else:
        for line in [*(f"FAIL {f}" for f in fails), *(f"WARN {w}" for w in warns)]:
            print(line)
        print("ok" if not fails else f"{len(fails)} fail(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
