"""python -m studio.jobs: `run` wraps a heavy command with a timing record (and, with --queue, a machine-wide lock);
`report` ranks steps by total time; `queue` says who holds a queue."""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from typing import Optional

from studio.jobs import queue as Q
from studio.jobs.timing import args_bytes, read_timings, record, summarize


def _say(msg: str) -> None:
    print(f"{msg}; waiting", file=sys.stderr, flush=True)


def _run(command: list[str], pass_fds: tuple[int, ...] = ()) -> int:
    try:
        return subprocess.run(command, pass_fds=pass_fds).returncode
    except OSError as exc:  # never started: the shell's own codes, 126 not executable and 127 not found
        print(f"could not run {command[0]}: {exc}", file=sys.stderr)
        return 126 if isinstance(exc, PermissionError) else 127


def cmd_run(args) -> int:
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        print("give the command after --", file=sys.stderr)
        return 2
    extra: dict = {"via": "run"}
    lock = None
    if args.queue:
        try:
            lock = Q.hold(
                args.queue,
                step=args.step,
                channel=args.channel or "",
                video=args.video or "",
                wait=not args.no_wait,
                timeout=args.wait_timeout,
                on_wait=_say,
            )
            lock.__enter__()
        except ValueError as exc:
            print(exc, file=sys.stderr)
            return 2
        except Q.QueueBusy as exc:
            print(f"{exc}; not run", file=sys.stderr)
            return Q.BUSY_EXIT
        extra.update(queue=args.queue, waited_s=round(lock.waited_s, 3))
    t0 = time.monotonic()
    try:
        # The command shares the lock's descriptor, so the queue stays held while it runs even if this wrapper dies.
        code = _run(command, (lock.fd,) if lock else ())
    finally:
        if lock:
            lock.__exit__(None, None, None)
    try:
        record(
            args.step,
            seconds=time.monotonic() - t0,
            ok=code == 0,
            channel=args.channel or "",
            video=args.video or "",
            inputs_bytes=args_bytes({"args": command}),
            extra=extra,
        )
    except Exception as exc:
        print(f"timing not recorded: {exc}", file=sys.stderr)
    return code


def cmd_report(args) -> int:
    rows = summarize(read_timings(since=args.since))
    print(f"{'step':<28} {'runs':>5} {'fail':>5} {'total s':>10} {'median s':>10} {'max s':>10}")
    print("-" * 72)
    for r in rows:
        print(
            f"{r['step']:<28} {r['runs']:>5} {r['failures']:>5} {r['total_s']:>10.1f} {r['median_s']:>10.1f} "
            f"{r['max_s']:>10.1f}"
        )
    return 0


def cmd_queue(args) -> int:
    try:
        info = Q.holder(args.name)
    except ValueError as exc:
        print(exc, file=sys.stderr)
        return 2
    print(Q.describe(args.name, info))
    return 0 if info is None else 1


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.jobs")
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("--step", required=True)
    r.add_argument("--channel")
    r.add_argument("--video")
    r.add_argument("--queue", help="take this machine-wide queue first (e.g. render); waits for the holder")
    r.add_argument("--no-wait", action="store_true", help="with --queue: exit 75 at once if the queue is held")
    r.add_argument("--wait-timeout", type=float, help="with --queue: give up (exit 75) after this many seconds")
    r.add_argument("command", nargs=argparse.REMAINDER)
    r.set_defaults(fn=cmd_run)
    s = sub.add_parser("report")
    s.add_argument("--since")
    s.set_defaults(fn=cmd_report)
    q = sub.add_parser("queue", help="who holds a queue; exit 0 free, 1 held")
    q.add_argument("name", nargs="?", default="render")
    q.set_defaults(fn=cmd_queue)
    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
