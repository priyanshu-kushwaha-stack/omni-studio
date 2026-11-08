"""The room's deterministic lint: runs before any model reads a draft.

Shared checks (slop words, 'and then' joins, the ledger's verbatim quotes) plus the channel's format parameters
from room.yaml (word budget, question or interjection cadence) and the channel's own linters, which run as
commands so the core never imports a channel engine.
"""

from __future__ import annotations

import re
import shlex
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import yaml

from studio.claims import CITE_RE, _cells, _column, spoken_lines

ROOT = Path(__file__).resolve().parents[3]
SLOP = Path(__file__).resolve().parent / "slop.yaml"
SPEAKER = re.compile(r"^([A-Z][A-Z ]{1,15}):\s*")
AND_THEN = re.compile(r"\band then\b", re.IGNORECASE)
WORD = re.compile(r"\w[\w'’-]*")


def _words(line: str) -> int:
    return len(WORD.findall(CITE_RE.sub("", line)))


@dataclass
class LintReport:
    ok: bool
    problems: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {"ok": self.ok, "problems": self.problems, "warnings": self.warnings}


def load_slop(path: Path = SLOP) -> dict[str, Any]:
    return yaml.safe_load(Path(path).read_text(encoding="utf-8"))


def _spoken(text: str) -> list[tuple[int, str]]:
    lines = spoken_lines(text)
    return lines if lines else [(n, l.strip()) for n, l in enumerate(text.splitlines(), 1) if l.strip()]


_QUOTES = str.maketrans({"\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"'})
NO_QUOTE = {"", "-", "\u2014", "\u2013", "n/a", "na", "tbd", "todo", "none"}


def slop_hits(text: str, slop: dict[str, Any]) -> list[str]:
    hits = []
    for n, line in _spoken(text):
        low = line.translate(_QUOTES).lower()
        spans = []
        for p in slop.get("phrases") or []:
            start = low.find(p.lower())
            if start >= 0:
                spans.append((start, start + len(p)))
                hits.append(f"line {n}: slop phrase {p!r}")
        for w in slop.get("words") or []:
            if any(not any(a <= m.start() and m.end() <= b for a, b in spans)
                   for m in re.finditer(rf"\b{re.escape(w.lower())}\b", low)):
                hits.append(f"line {n}: slop word {w!r}")
        for pat in slop.get("patterns") or []:
            if re.search(pat, low):
                hits.append(f"line {n}: slop pattern {pat!r}")
    return hits


def and_then(text: str) -> list[str]:
    return [f"line {n}: 'and then' joins two beats; use but or therefore" for n, line in _spoken(text)
            if AND_THEN.search(line)]


def word_count(text: str) -> int:
    return sum(_words(line) for _, line in spoken_lines(text))


def _mmss(seconds: float) -> str:
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"


def cadence(text: str, *, wpm: float, max_gap_s: float, speakers: Optional[list[str]] = None,
            marker: Optional[str] = None) -> list[str]:
    spoken = dict(spoken_lines(text))
    t, hits = 0.0, []
    for n, raw in enumerate(text.splitlines(), 1):
        s = raw.strip()
        if n in spoken:
            m = SPEAKER.match(s)
            if speakers and m and m.group(1).strip() in speakers:
                hits.append(t)
            t += _words(spoken[n]) / wpm * 60
        elif marker and s.upper().startswith(marker.upper()):
            hits.append(t)
    label = marker or "/".join(speakers or [])
    problems, last = [], 0.0
    for at in hits + [t]:
        if at - last > max_gap_s:
            problems.append(f"{_mmss(last)}-{_mmss(at)}: {at - last:.0f} s with no {label} (want at most {max_gap_s:g} s)")
        last = at
    return problems


def _quotes(ledger_text: str) -> Optional[dict[str, str]]:
    lines = ledger_text.splitlines()
    for i, line in enumerate(lines):
        if not line.lstrip().startswith("|"):
            continue
        header = [c.lower() for c in _cells(line)]
        id_col, quote_col = _column(header, "id"), _column(header, "verbatim", "quote")
        if id_col is None or quote_col is None:
            continue
        quotes: dict[str, str] = {}
        for row in lines[i + 2:]:
            if not row.lstrip().startswith("|"):
                break
            cells = _cells(row) + [""] * len(header)
            q = cells[quote_col].strip()
            quotes[cells[id_col]] = "" if q.lower() in NO_QUOTE else q
        return quotes
    return None


def ledger_quotes(script_text: str, ledger_text: str) -> list[str]:
    quotes = _quotes(ledger_text)
    if quotes is None:
        return ["claims.md has no verbatim quote column"]
    cited = {c.strip() for _, line in spoken_lines(script_text) for g in CITE_RE.findall(line) for c in g.split(",")}
    return [f"{cid}: cited in the script but its ledger row has no verbatim quote"
            for cid in sorted(cited) if cid in quotes and not quotes[cid]]


def _label(cmd: list[str]) -> str:
    for arg in cmd[1:]:
        if not arg.startswith("-"):
            return Path(arg).name
    return " ".join(cmd[:2])


def run_linters(commands: list[str], *, script: Path, video_dir: Path, runner=None) -> list[str]:
    runner = runner or subprocess.run
    values = {k: shlex.quote(str(v)) for k, v in
              {"python": sys.executable, "script": script, "video": video_dir, "root": ROOT}.items()}
    problems = []
    for template in commands:
        try:
            cmd = shlex.split(template.format(**values))
            if not cmd:
                raise ValueError("empty command")
        except (KeyError, ValueError, IndexError) as e:
            problems.append(f"linter {template!r} is not a valid command template: {e!r}")
            continue
        try:
            proc = runner(cmd, cwd=ROOT, capture_output=True, text=True, timeout=300)
        except subprocess.TimeoutExpired:
            problems.append(f"linter {template!r} timed out")
            continue
        except OSError as e:
            problems.append(f"linter {template!r} could not run: {e}")
            continue
        if proc.returncode != 0:
            tail = " | ".join((proc.stdout + proc.stderr).strip().splitlines()[-5:])
            problems.append(f"{_label(cmd)} exited {proc.returncode}: {tail}")
    return problems


def lint_draft(path: Path, *, kind: str, fmt: dict[str, Any], linters: list[str], ledger: Optional[Path] = None,
               slop: Optional[dict[str, Any]] = None, runner=None) -> LintReport:
    text = Path(path).read_text(encoding="utf-8")
    slop = load_slop() if slop is None else slop
    problems: list[str] = []
    warnings = slop_hits(text, slop)
    if len(warnings) > int(slop.get("max_hits", 3)):
        problems.append(f"{len(warnings)} slop hits (more than {slop.get('max_hits', 3)})")
    if kind == "script":
        warnings += and_then(text)
        wpm = float(fmt.get("wpm", 155))
        if "word_budget" in fmt:
            lo, hi = fmt["word_budget"]
            n = word_count(text)
            if not lo <= n <= hi:
                problems.append(f"word budget: {n} spoken words, want {lo}-{hi}")
        if "cadence" in fmt:
            c = fmt["cadence"]
            problems += cadence(text, wpm=wpm, max_gap_s=float(c["max_gap_s"]), speakers=c.get("speakers"),
                                marker=c.get("marker"))
        if ledger is not None and not Path(ledger).is_file():
            problems.append("claims.md is missing, so cited claims cannot be checked")
        elif ledger is not None:
            problems += ledger_quotes(text, Path(ledger).read_text(encoding="utf-8"))
        problems += run_linters(linters, script=Path(path), video_dir=Path(path).parent, runner=runner)
    return LintReport(not problems, problems, warnings)
