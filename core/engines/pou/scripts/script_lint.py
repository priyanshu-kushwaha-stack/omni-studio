#!/usr/bin/env python3
"""Mechanical half of the 30-point script-doctor checklist.

Hard checks exit 1. Advisory checks (items 7 and 20) print WARN and never block:
a formula is a prompt for the writer, not a rule the viewer cares about.
Visual density at 3-6 s is NOT checked here; `> VISUAL:` cues are beats (one per
~10 s). The 3-6 s rule is enforced on scene_plan.json by scripts/scene_plan_check.py.
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import namedtuple
from pathlib import Path

Finding = namedtuple("Finding", "item ok detail level", defaults=("fail",))

SECTION_RE = re.compile(r"^## \[(\d{2}):(\d{2})\] (.+)$")
GREETINGS = ["welcome back", "welcome", "hey guys", "my name is", "in today's video", "this channel"]
ENDING_LANGUAGE = ["to sum up", "in conclusion", "at the end of the day", "to wrap up", "finally,"]
RE_ENGAGE_EVERY = 180  # seconds
RE_ENGAGE_TOLERANCE = 45  # seconds either side


def _sections(text: str):
    """Yield (title, narration_lines, cue_lines) for each `## [mm:ss]` section; stops at Chapters/Sources."""
    cur = None
    for line in text.splitlines():
        if line.startswith("## "):
            if cur:
                yield cur
                cur = None
            m = SECTION_RE.match(line)
            if m:
                cur = (m.group(3), [], [])
            continue
        if cur is None:
            continue
        if line.startswith("> "):
            cur[2].append(line)
        elif line.strip() and not line.startswith("#"):
            cur[1].append(line)
    if cur:
        yield cur


def _words(lines) -> list[str]:
    return " ".join(lines).split()


def narration_words(text: str) -> int:
    return sum(len(_words(n)) for _, n, _ in _sections(text))


def _sources(text: str) -> int:
    tail = text.split("## Sources", 1)[1] if "## Sources" in text else ""
    return sum(1 for l in tail.splitlines() if l.strip().startswith("- http"))


def re_engage_windows(total_seconds: float) -> list[int]:
    """Planned re-engagement points: every ~3 minutes up to 60 s before the end."""
    return [RE_ENGAGE_EVERY * k for k in range(1, int((total_seconds - 60) // RE_ENGAGE_EVERY) + 1)]


def lint_script(text: str, target_minutes: int, wpm: int = 155) -> list[Finding]:
    secs = list(_sections(text))
    findings: list[Finding] = []
    total = narration_words(text)
    budget = 150 * target_minutes
    lo, hi = int(budget * 0.9), int(budget * 1.1)
    findings.append(Finding(18, lo <= total <= hi, f"{total} words; budget {lo}-{hi}"))

    first_words = _words(secs[0][1]) if secs else []
    head60 = " ".join(first_words[:60]).lower()
    hit = next((g for g in GREETINGS if g in head60), None)
    findings.append(Finding(5, hit is None, f"greeting found: {hit!r}" if hit else "no greeting"))
    head80 = " ".join(first_words[:80])
    has_digit = bool(re.search(r"\d", head80))
    findings.append(Finding(7, has_digit, "digit in first ~30 s" if has_digit else "no number in first ~30 s (advisory)", "advisory"))

    # estimated time of each RE-ENGAGE cue = words before it / wpm
    elapsed = 0
    re_times = []
    for _, narr, cues in secs:
        if any(c.startswith("> RE-ENGAGE:") for c in cues):
            re_times.append(elapsed / wpm * 60)
        elapsed += len(_words(narr))
    total_seconds = total / wpm * 60
    wanted = re_engage_windows(total_seconds)
    missing = [w for w in wanted if not any(abs(t - w) <= RE_ENGAGE_TOLERANCE for t in re_times)]
    ok10 = bool(wanted) and not missing
    findings.append(Finding(10, ok10, f"re-engagements at {[round(t) for t in re_times]} s; wanted near {wanted} s; missing {missing}"))

    body_text = " ".join(" ".join(n) for _, n, _ in secs[:-1]).lower() if len(secs) > 1 else ""
    hit = next((e for e in ENDING_LANGUAGE if e in body_text), None)
    findings.append(Finding(21, hit is None, f"ending language before last section: {hit!r}" if hit else "no early ending language"))

    n_src = _sources(text)
    findings.append(Finding(22, n_src >= 5, f"{n_src} source URLs (want >=5)"))

    weak_vis, weak_emp = [], []
    for title, narr, cues in secs:
        n_words = len(_words(narr))
        seconds = n_words / wpm * 60
        n_vis = sum(1 for c in cues if c.startswith("> VISUAL:"))
        if n_words and n_vis < max(1, int(seconds // 10)):
            weak_vis.append(f"{title}: {n_vis} beats for {round(seconds)} s")
        if n_words and not re.search(r"\*\w[^*]*\*", " ".join(narr)):
            weak_emp.append(title)
    findings.append(Finding(26, not weak_vis, "; ".join(weak_vis) or "visual beats ok (1 per 10 s; 3-6 s density is checked on scene_plan.json)"))
    findings.append(Finding(20, not weak_emp, f"no emphasis in: {weak_emp} (advisory)" if weak_emp else "emphasis marked in every section", "advisory"))
    return sorted(findings)


def hard_failures(findings: list[Finding]) -> list[Finding]:
    return [f for f in findings if not f.ok and f.level == "fail"]


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("script", type=Path)
    p.add_argument("--target-minutes", type=int, required=True)
    p.add_argument("--wpm", type=int, default=155)
    a = p.parse_args()
    findings = lint_script(a.script.read_text(), a.target_minutes, a.wpm)
    for f in findings:
        tag = "PASS" if f.ok else ("WARN" if f.level == "advisory" else "FAIL")
        print(f"[{tag}] item {f.item:>2}: {f.detail}")
    failed = hard_failures(findings)
    print(f"\n{len(findings) - len(failed)}/{len(findings)} checks passed or advisory; {len(failed)} hard failures")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
