"""The room's judge: the new candidate against the best candidate so far, asked twice with the order swapped.

The new draft wins only if it is picked as A in the first call and as B in the second. Anything else, a tie or a
failed call included, keeps the best draft.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from studio.room.call import CallContext, build_command, cli_text, cli_version, invoke
from studio.room.ledger import Ledger
from studio.room.models import cli_of, family_of
from studio.room.snapshot import sha256_text
from studio.room.verdict import BadVerdict, extract_json

JUDGE_SPEC = 'Return only one JSON object: {"winner": "A" | "B" | "tie", "why": "<one sentence quoting both drafts>"}'


def pairwise(new_as_a: str, new_as_b: str) -> str:
    return "new" if new_as_a == "A" and new_as_b == "B" else "best"


def judge_prompt(brief: str, a: str, b: str) -> str:
    return f"{brief.strip()}\n\n{JUDGE_SPEC}\n\n=== Draft A ===\n{a}\n\n=== Draft B ===\n{b}"


def parse_judge(text: str) -> str:
    winner = extract_json(text).get("winner")
    if winner not in ("A", "B", "tie"):
        raise BadVerdict(f"winner must be A, B or tie, not {winner!r}")
    return winner


def run_judge(new_text: str, best_text: str, *, model: str, brief: str, ledger: Ledger, ctx: CallContext,
              out: Path, runner=None, timeout: float = 600, registry: Optional[dict] = None) -> dict[str, Any]:
    family = family_of(model, registry)
    version = cli_version(cli_of(model, registry), runner)
    picks, call_ids = [], []
    for a, b in ((new_text, best_text), (best_text, new_text)):
        prompt = judge_prompt(brief, a, b)
        call_id = ledger.reserve(channel=ctx.channel, video=ctx.video, gate=ctx.gate, round=ctx.round, seat="judge",
                                 model=model, family=family, prompt_sha256=sha256_text(prompt),
                                 daily_cap=ctx.daily_cap, script_cap=ctx.script_cap)
        pick, status, duration = "tie", "failed", 0.0
        try:
            code, stdout, duration = invoke(build_command(model, prompt, registry), runner=runner, timeout=timeout)
            text = cli_text(stdout)
        except Exception:  # fail closed: a crash is a failed tie, and the reserved row is still finished
            code, text = -1, ""
        if code == 0:
            try:
                pick, status = parse_judge(text), "ok"
            except BadVerdict:
                pass
        ledger.finish(call_id, status=status, output_sha256=sha256_text(text), duration_s=duration,
                      cli_version=version)
        picks.append(pick)
        call_ids.append(call_id)
    result = {"model": model, "family": family, "call_ids": call_ids, "picks": picks, "winner": pairwise(*picks)}
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result
