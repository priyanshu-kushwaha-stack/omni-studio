"""python -m studio.jobs: `run` wraps a heavy command with a timing record; `report` ranks steps by total time."""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from typing import Optional

from studio.jobs.timing import read_timings, record, summarize


def cmd_run(args) -> int:
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        print("give the command after --", file=sys.stderr)
        return 2
    t0 = time.monotonic()
    try:
        code = subprocess.run(command).returncode
    except OSError as exc:  # never started: the shell's own codes, 126 not executable and 127 not found
        code = 126 if isinstance(exc, PermissionError) else 127
        print(f"could not run {command[0]}: {exc}", file=sys.stderr)
    try:
        record(args.step, seconds=time.monotonic() - t0, ok=code == 0, channel=args.channel or "",
               video=args.video or "", extra={"via": "run"})
    except Exception as exc:
        print(f"timing not recorded: {exc}", file=sys.stderr)
    return code


def cmd_report(args) -> int:
    rows = summarize(read_timings(since=args.since))
    print(f"{'step':<28} {'runs':>5} {'fail':>5} {'total s':>10} {'median s':>10} {'max s':>10}")
    print("-" * 72)
    for r in rows:
        print(f"{r['step']:<28} {r['runs']:>5} {r['failures']:>5} {r['total_s']:>10.1f} {r['median_s']:>10.1f} "
              f"{r['max_s']:>10.1f}")
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.jobs")
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("--step", required=True)
    r.add_argument("--channel")
    r.add_argument("--video")
    r.add_argument("command", nargs=argparse.REMAINDER)
    r.set_defaults(fn=cmd_run)
    s = sub.add_parser("report")
    s.add_argument("--since")
    s.set_defaults(fn=cmd_report)
    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
