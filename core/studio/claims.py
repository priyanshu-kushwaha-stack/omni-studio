"""Claims ledger gate: every factual claim spoken in a video has a ledger row with a source and a status.

The ledger is the video's `claims.md`, the table the Researcher already writes (Professor of Us format):

    | id | claim as it will be spoken | source URL | verbatim quote ... | status | note |

Columns are found by header name, so extra columns are fine. The check fails when:
- there is no ledger, or it has no rows;
- a row has no claim text, no http(s) source, or a status outside SOURCED_STATUSES (blank, "todo",
  "unsourced", "needs source" ... all fail);
- the script cites an id (`(c03)`, `(c08, c10)`) that has no row, or whose row is `dropped`;
- a spoken script line has a number (digits, or words such as 'twenty twenty-four', 'three million')
  but cites no claim id. With number_words=False (what-if stories, whose premise numbers are invented:
  "ten seconds a day", "day twelve") only digits need an id; real figures are written as digits and cited.

`omni approve` runs this before the script and narration gates (metadata.studio_checks in the pipelines).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

SOURCED_STATUSES = {"sourced", "contested", "spot-checked"}
DROPPED = "dropped"
ID_RE = re.compile(r"^c\d{2,3}$")
CITE_RE = re.compile(r"\(((?:c\d{2,3})(?:\s*,\s*c\d{2,3})*)\)")
URL_RE = re.compile(r"https?://\S+")
SPEAKER_RE = re.compile(r"^[A-Z][A-Z ]{1,15}:\s*")
# Numbers written as words count as spoken numbers too. "one" is left out on purpose: "no one", "one of",
# "the one" are not claims.
NUMBER_WORDS = re.compile(
    r"\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|"
    r"seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|hundreds|"
    r"thousand|thousands|million|millions|billion|billions|trillion|dozen|dozens|half|third|quarter|"
    r"percent|per cent)\b", re.IGNORECASE)


@dataclass
class Row:
    line: int
    id: str
    claim: str
    source: str
    status: str


@dataclass
class LedgerReport:
    ok: bool
    rows: list[Row] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {"check": "claims", "ok": self.ok, "rows": len(self.rows), "problems": self.problems}


def _cells(line: str) -> list[str]:
    return [c.strip() for c in line.strip().strip("|").split("|")]


def _column(header: list[str], *names: str) -> int | None:
    for i, cell in enumerate(header):
        low = cell.lower()
        if any(low == n or low.startswith(n) for n in names):
            return i
    return None


def parse_ledger(text: str) -> tuple[list[Row], list[str]]:
    """Rows from every table whose header has id, claim, source and status columns."""
    rows: list[Row] = []
    problems: list[str] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.lstrip().startswith("|"):
            i += 1
            continue
        header = [c.lower() for c in _cells(line)]
        cols = {"id": _column(header, "id"), "claim": _column(header, "claim"),
                "source": _column(header, "source"), "status": _column(header, "status")}
        i += 1
        if None in cols.values():
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                i += 1
            continue
        if i < len(lines) and set(lines[i].replace("|", "").strip()) <= set("-: "):
            i += 1  # the |---|---| separator
        while i < len(lines) and lines[i].lstrip().startswith("|"):
            cells = _cells(lines[i])
            cells += [""] * (len(header) - len(cells))
            rows.append(Row(i + 1, cells[cols["id"]], cells[cols["claim"]], cells[cols["source"]],
                            cells[cols["status"]].lower()))
            i += 1
    return rows, problems


def spoken_lines(script: str) -> list[tuple[int, str]]:
    """(line number, text) for lines that are read aloud: not headings, cues (`> ...`), or trailing sections."""
    out = []
    for n, line in enumerate(script.splitlines(), 1):
        stripped = line.strip()
        if stripped.startswith("## ") and not re.match(r"^## \[\d{2}:\d{2}\]", stripped):
            break  # Word count, Not said, Chapters, Sources: not spoken
        if not stripped or stripped.startswith(("#", ">", "|", "-", "format:", "status:", "claims:", "loop:",
                                                "template:", "target_minutes:")):
            continue
        out.append((n, SPEAKER_RE.sub("", stripped)))
    return out


def check(video_dir: Path, number_words: bool = True) -> LedgerReport:
    video_dir = Path(video_dir)
    ledger = video_dir / "claims.md"
    if not ledger.is_file():
        return LedgerReport(False, problems=[f"no claims ledger: {ledger} is missing"])
    rows, problems = parse_ledger(ledger.read_text(encoding="utf-8"))
    if not rows:
        problems.append(f"{ledger.name} has no ledger rows (a table with id, claim, source and status columns)")
    by_id: dict[str, Row] = {}
    for row in rows:
        where = f"{ledger.name}:{row.line} {row.id or '(no id)'}"
        if not ID_RE.match(row.id):
            problems.append(f"{where}: id must look like c01")
        elif row.id in by_id:
            problems.append(f"{where}: duplicate id (also on line {by_id[row.id].line})")
        by_id.setdefault(row.id, row)
        if not row.claim:
            problems.append(f"{where}: no claim text")
        if row.status == DROPPED:
            continue
        if not URL_RE.search(row.source):
            problems.append(f"{where}: claim has no source (want an http(s) URL in the source column)")
        if row.status not in SOURCED_STATUSES:
            problems.append(f"{where}: status {row.status or '(blank)'!r} is not one of "
                            f"{sorted(SOURCED_STATUSES)} (or 'dropped' when it is not said)")

    script = video_dir / "script.md"
    if script.is_file():
        for n, text in spoken_lines(script.read_text(encoding="utf-8")):
            cited = [c.strip() for group in CITE_RE.findall(text) for c in group.split(",")]
            for cid in cited:
                if cid not in by_id:
                    problems.append(f"script.md:{n}: cites {cid}, which has no row in {ledger.name}")
                elif by_id[cid].status == DROPPED:
                    problems.append(f"script.md:{n}: cites {cid}, which the ledger marks dropped")
            spoken = CITE_RE.sub("", text)
            if (re.search(r"\d", spoken) or (number_words and NUMBER_WORDS.search(spoken))) and not cited:
                problems.append(f"script.md:{n}: spoken number with no claim id: {text[:70]!r}")
    else:
        problems.append(f"no script: {script} is missing, so the ledger cannot be checked against it")
    return LedgerReport(not problems, rows, problems)
