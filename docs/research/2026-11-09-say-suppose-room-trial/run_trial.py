"""Room trial on film 2 (odds of success): a writer bake-off and two review rooms on the same script.

    PYTHONPATH=<root>/core/openmontage:<root>/core <root>/.venv/bin/python run_trial.py [writers|rooms|all]

Uses the quality room's own prompt builder, command line and macOS sandbox (studio.room.call), so each seat sees
exactly what a real seat sees. It does not touch the video folder, the room ledger or the daily cap: everything is
written under this folder's out/. No paid provider: Claude through the claude CLI, the rest through cursor-agent.
"""

from __future__ import annotations

import json
import random
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from studio.room.call import build_command, cli_text, invoke, seat_prompt
from studio.room.models import load_registry
from studio.room.verdict import BadVerdict, parse_verdict

HERE = Path(__file__).resolve().parent
IN, BRIEFS, OUT = HERE / "inputs", HERE / "briefs", HERE / "out"
ROOT = HERE.parents[2]
REG = load_registry()
REG["claude-fable-5-1"] = {"family": "anthropic", "cli": "claude"}


def read(name: str) -> str:
    return (IN / name).read_text(encoding="utf-8")


CHANNEL = {n: read(n) for n in ("audience.md", "style.md", "taste.md", "cast.md")}
VIDEO = {"claims.md": read("claims.md"), "packaging.md": read("packaging.md")}

# (room, seat, role, model, brief, extra inputs). The fact seat is the same in both rooms, so it runs once.
SEATS = [
    ("current", "first-time viewer", "viewer", "grok-4.7-high", "first-time-viewer.md", ["story.md"]),
    ("current", "retention editor", "story", "gpt-5.6-sol-high", "retention-editor.md", ["story.md"]),
    ("both", "fact-checker", "fact", "gemini-3.7-flash-high", "fact-checker.md", ["story.md"]),
    ("current", "voice director", "voice", "claude-sonnet-5-5", "voice-director.md", ["story.md"]),
    ("current", "animator", "craft", "claude-sonnet-5-5", "animator.md", ["sound.md", "cues.yaml"]),
    ("persona", "first-time viewer", "viewer", "gemini-3.7-flash-high", "first-time-viewer.md", ["story.md"]),
    ("persona", "story editor", "story", "gpt-5.6-sol-high", "story-editor.md", ["story.md"]),
    ("persona", "director", "craft", "claude-fable-5-1", "director.md", ["story.md"]),
    ("persona", "voice actor", "voice", "claude-sonnet-5-5", "voice-actor.md", ["story.md"]),
]

WRITERS = {"opus": "claude-opus-5-5", "fable": "claude-fable-5-1"}

WRITER_TASK = """You are the writer for Say Suppose, a YouTube channel: one what-if per video, lived through in the
second person by one narrator. Write the G2 script for the video below, from its approved packaging, research and
claims ledger. You work alone; a review room and the owner will read it after you.

Follow the script stage rules exactly:
1. Use only the research and claims given here. Never write a number, result or source from memory.
2. Write to the beats and script rules in style.md: second person, one narrator, three jumps of consequence, about
   115 words a minute, 15 to 20% wordless (`> HOLD:` lines), a mood light per scene (`> MOOD:`), stakes the premise
   earns, and a line planted in minute one that returns in the last.
3. Open with the five lines (`> SITUATION:`, `> DESIRE:`, `> CONFLICT:`, `> CHANGE:`, `> RESULT:`) before the first
   `## [mm:ss]` beat, and pass the must-pass checks in story.md.
4. Bare lines are spoken by the narrator. `> SCENE:`, `> BUBBLE:`, `> TAG:`, `> MOOD:` and `> HOLD:` lines are
   directions (cast.md).
5. Digits mean facts: every spoken real-world number, date, name or finding cites its claims row inline, e.g. (c01).
   Story numbers are written as words. Never state as fact what the viewer does in the story.
6. The owner's notes in taste.md outrank everything except the facts.

Output only the finished script.md, starting with its title line, and nothing else."""


def call(model: str, prompt: str, timeout: float) -> tuple[int, str, float, int]:
    """Run once; retry once on a non-timeout failure, as the room does. Returns code, text, seconds, attempts."""
    total = 0.0
    for attempt in (1, 2):
        code, stdout, secs = invoke(build_command(model, prompt, REG), timeout=timeout)
        total += secs
        text = cli_text(stdout)
        if code == 0 and text.strip() or code == 124 or attempt == 2:
            return code, text, total, attempt
    return code, text, total, 2


def run_writer(key: str) -> dict:
    model = WRITERS[key]
    inputs = {**CHANNEL, "story.md (must-pass checks)": read("story.md"), **VIDEO, "research.md": read("research.md")}
    prompt = WRITER_TASK + "\n\n" + "\n\n".join(f"=== {n} ===\n{t}" for n, t in inputs.items())
    code, text, secs, attempts = call(model, prompt, 1500)
    (OUT / "writers").mkdir(parents=True, exist_ok=True)
    (OUT / "writers" / f"{key}.md").write_text(text, encoding="utf-8")
    return {"writer": key, "model": model, "exit": code, "seconds": round(secs), "attempts": attempts,
            "words": len(text.split())}


def run_seat(spec) -> dict:
    room, seat, role, model, brief, extra = spec
    inputs = {**CHANNEL, **VIDEO, **{n: read(n) for n in extra if (IN / n).exists()}, "draft": read("script.md")}
    prompt = seat_prompt((BRIEFS / brief).read_text(encoding="utf-8"), role, inputs)
    timeout = float(REG.get(model, {}).get("timeout_s", 600))
    code, text, secs, attempts = call(model, prompt, timeout)
    rec = {"room": room, "seat": seat, "role": role, "model": model, "exit": code, "seconds": round(secs),
           "attempts": attempts}
    try:
        v = parse_verdict(text, call_id="trial", seat=seat, role=role, model=model,
                          family=REG.get(model, {}).get("family", "?"))
        rec.update(status="ok", verdict=v.to_dict())
    except BadVerdict as exc:
        rec.update(status="failed", error=str(exc) if code == 0 else f"exit {code}")
    d = OUT / "rooms"
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{room}--{seat.replace(' ', '-')}.json").write_text(json.dumps(rec, indent=2) + "\n", encoding="utf-8")
    (d / f"{room}--{seat.replace(' ', '-')}.raw.txt").write_text(text, encoding="utf-8")
    print(f"{room:8} {seat:18} {model:22} {rec['status']:6} {rec['seconds']:5}s", flush=True)
    return rec


def blind_pair() -> None:
    """Label the two scripts A and B at random; the key goes to a separate file the owner opens after reading."""
    keys = list(WRITERS)
    random.SystemRandom().shuffle(keys)
    for label, key in zip("AB", keys):
        (OUT / "writers" / f"script-{label}.md").write_text((OUT / "writers" / f"{key}.md").read_text(), encoding="utf-8")
    (OUT / "writers" / "KEY-open-after-reading.json").write_text(json.dumps(dict(zip("AB", keys))) + "\n")


def main(argv: list[str]) -> int:
    mode = argv[0] if argv else "all"
    t0 = time.monotonic()
    jobs = []
    with ThreadPoolExecutor(max_workers=12) as pool:
        if mode in ("writers", "all"):
            jobs += [pool.submit(run_writer, k) for k in WRITERS]
        if mode in ("rooms", "all"):
            jobs += [pool.submit(run_seat, s) for s in SEATS]
        results = [j.result() for j in jobs]
    if mode in ("writers", "all") and all((OUT / "writers" / f"{k}.md").exists() for k in WRITERS):
        blind_pair()
    (OUT / f"summary-{mode}.json").write_text(json.dumps({"wall_s": round(time.monotonic() - t0),
                                                          "calls": results}, indent=2) + "\n")
    print(f"done in {time.monotonic() - t0:.0f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
