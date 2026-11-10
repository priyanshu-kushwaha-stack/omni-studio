"""Viewer seat trial: Grok 4.7 High against three faster models, on three Say Suppose scripts.

    PYTHONPATH=<root>/core/openmontage:<root>/core <root>/.venv/bin/python run_viewer_trial.py

Every call is the first-time viewer seat exactly as the room runs it (studio.room.call's prompt, CLI and sandbox),
with the inputs the room passes a G2 viewer. Nothing is written to a video folder, the call ledger or the daily cap;
output goes to out/. Cursor subscription only, no paid provider.
"""

from __future__ import annotations

import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from studio.room.call import build_command, cli_text, invoke, seat_prompt
from studio.room.models import load_registry
from studio.room.verdict import BadVerdict, parse_verdict

HERE = Path(__file__).resolve().parent
IN, OUT = HERE / "inputs", HERE / "out"
REG = load_registry()
CANDIDATES = {
    "grok-4.7-high": {"family": "xai", "cli": "cursor", "timeout_s": 1800},  # today's viewer, the baseline
    "grok-4.7-high-fast": {"family": "xai", "cli": "cursor", "timeout_s": 1800},
    "gpt-5.6-luna-high": {"family": "openai", "cli": "cursor", "timeout_s": 900},
    "kimi-k3-high": {"family": "moonshot", "cli": "cursor", "timeout_s": 900},
    # Round 2 (owner, 2026-11-10): can an Anthropic model be the viewer? The writer is Fable, so the room's family rule
    # bars both today; this measures what that rule costs. Claude subscription through `claude -p --tools ""`.
    "claude-opus-5-5": {"family": "anthropic", "cli": "claude", "timeout_s": 900},
    "claude-fable-5-1": {"family": "anthropic", "cli": "claude", "timeout_s": 900},
}
REG.update(CANDIDATES)
SCRIPTS = ["last-time", "real-odds", "real-odds-fable"]
BRIEF = (IN / "channel" / "first-time-viewer.md").read_text(encoding="utf-8")
CHANNEL = {n: (IN / "channel" / n).read_text(encoding="utf-8")
           for n in ("audience.md", "style.md", "taste.md", "cast.md", "story.md")}


def one(script: str, model: str) -> dict:
    d = IN / script
    inputs = {**CHANNEL, "claims.md": (d / "claims.md").read_text(), "packaging.md": (d / "packaging.md").read_text(),
              "draft": (d / "script.md").read_text()}
    prompt = seat_prompt(BRIEF, "viewer", inputs)
    cmd = build_command(model, prompt, REG)
    total, attempts, code, text = 0.0, 0, -1, ""
    for attempts in (1, 2):  # one retry on a non-timeout failure, as the room does
        code, stdout, secs = invoke(cmd, timeout=CANDIDATES[model]["timeout_s"])
        total += secs
        text = cli_text(stdout)
        if (code == 0 and text.strip()) or code == 124:
            break
    rec = {"script": script, "model": model, "exit": code, "seconds": round(total), "attempts": attempts}
    try:
        v = parse_verdict(text, call_id="trial", seat="first-time viewer", role="viewer", model=model,
                          family=CANDIDATES[model]["family"])
        rec.update(status="ok", verdict=v.to_dict())
    except BadVerdict as exc:
        rec.update(status="failed", error=str(exc) if code == 0 else f"exit {code}")
    OUT.mkdir(exist_ok=True)
    stem = f"{script}--{model}"
    (OUT / f"{stem}.json").write_text(json.dumps(rec, indent=2) + "\n")
    (OUT / f"{stem}.raw.txt").write_text(text)
    nb = len(rec.get("verdict", {}).get("blockers") or [])
    print(f"{script:16} {model:20} {rec['status']:6} {rec['seconds']:5}s blockers={nb}", flush=True)
    return rec


def main() -> int:
    t0 = time.monotonic()
    models = sys.argv[1:] or list(CANDIDATES)  # run_viewer_trial.py [model ...]: only those models
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(lambda sm: one(*sm), [(s, m) for s in SCRIPTS for m in models]))
    name = "summary-" + "-".join(models) + ".json" if sys.argv[1:] else "summary.json"
    (OUT / name).write_text(json.dumps({"wall_s": round(time.monotonic() - t0), "calls": results}, indent=2))
    print(f"done in {time.monotonic() - t0:.0f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
