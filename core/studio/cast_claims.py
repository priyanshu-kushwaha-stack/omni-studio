"""Say Suppose check: every real-world claim the cast pass found stays cited in the claims ledger.

`cast-pass.yaml` lists `claims: [{n: <sentence number>, claim: "<fact in plain words>"}]`. The ledger (`claims.md`,
studio/claims.py) has no sentence-number column, so a claim is matched by its text: both sides lower-cased with only
letters and digits kept, and the ledger row's claim must contain the cast-pass claim or the other way round. A
`dropped` row covers nothing (the fact was cut from the film, so the cast pass must be redone). The skill tells the
agent to copy each cast-pass claim into its ledger row verbatim, so the match is exact in practice.
Sourcing, status and the script's own citations stay with the `claims` check.
"""

from __future__ import annotations

import re
from pathlib import Path

import yaml

from studio import claims

NAME = "cast_claims"


def _norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(text).lower()).strip()


def covers(claim: str, row: str) -> bool:
    """A ledger row covers a cast-pass claim when it holds at least 80% of the claim's words (whole words, not
    substrings). Claims under three words must equal the row, so "speed" is never covered by any row about speed."""
    c, r = claim.split(), row.split()
    if not c or not r:
        return False
    if len(c) < 3:
        return c == r
    return len(set(c) & set(r)) >= 0.8 * len(set(c))


def _fail(*problems: str) -> dict:
    return {"check": NAME, "ok": False, "problems": list(problems)}


def check(folder: Path) -> dict:
    folder = Path(folder)
    cast_pass, ledger = folder / "cast-pass.yaml", folder / "claims.md"
    if not cast_pass.is_file():
        return _fail(f"no cast pass: {cast_pass.name} is missing (run the cast pass before the story lock)")
    if not ledger.is_file():
        return _fail(f"no claims ledger: {ledger.name} is missing")
    data = yaml.safe_load(cast_pass.read_text(encoding="utf-8")) or {}
    wanted = data.get("claims") if isinstance(data, dict) else None
    if not wanted:
        return _fail(f"{cast_pass.name} has no claims (the cast pass lists at least five real-world claims)")
    rows, _ = claims.parse_ledger(ledger.read_text(encoding="utf-8"))
    have = [_norm(r.claim) for r in rows if r.status != claims.DROPPED]
    problems = []
    for entry in wanted:
        text = _norm(entry.get("claim", "") if isinstance(entry, dict) else entry)
        if not text or not any(covers(text, h) for h in have):
            n = entry.get("n", "?") if isinstance(entry, dict) else "?"
            problems.append(f"{cast_pass.name}: sentence {n} claim has no row in {ledger.name}: {str(entry)[:90]}")
    return {"check": NAME, "ok": not problems, "problems": problems}
