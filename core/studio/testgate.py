"""The test gate behind `make test` and the pre-push hook (`.claude/standard.json` runs `make prepush`).

    python -m studio.testgate full       every suite, in parallel, under the machine-wide `tests` queue
    python -m studio.testgate prepush    skip, fast checks, or full, from what the pushed branch changed
    python -m studio.testgate plan       say which of the three a push would get, and why

Three things keep a push from paying 5-11 minutes for a script edit:

1. Pass cache. A full run that passes on a tree with no tracked edits records that tree's hash in the repo's shared git
   folder (`<git-common-dir>/omni-test-pass/`), so every worktree sees it. A push whose HEAD tree already passed skips
   the tests: your own `make test` and the push's run become one run, and a retried push costs nothing.
2. Scope. Compared with the merge base of `origin/main`, a branch that changes only files inside
   `channels/<slug>/videos/<id>/` cannot break the code suites, so it gets `omni check` for each touched channel
   (about a second). Anything else gets the full suite: code, skills, channel config (`channel.yaml`, `room.yaml`,
   `rules/`), the `_template` channel, or a video folder a test reads (found by name in the test folders).
3. Parallel and queued. The four suites run at the same time, and a full run takes the `tests` queue
   (`studio.jobs.queue`), so two sessions take turns instead of slowing each other three-fold.

`OMNI_TESTGATE_FULL=1` forces the full suite. Run times go to `python -m studio.jobs report` as `tests-full` and
`tests-fast`. The cache trusts the tree hash: untracked files and installed packages are not part of it.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable, Optional

VIDEO_RE = re.compile(r"^channels/([^/]+)/videos/([^/]+)/")
TEST_DIRS = ("core/studio/tests", "core/engines/pou/tests", "core/engines/whatif/tests", "core/openmontage/tests")
TEST_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".json", ".yaml", ".yml"}
CACHE_NAME = "omni-test-pass"
BASE = "origin/main"
QUEUE = "tests"

# Upstream tests that assert a tool the owner banned is still discovered (see the Makefile's old DESELECT note).
DESELECT = "--deselect core/openmontage/tests/contracts/test_kling_official_avatar.py::" \
           "test_registry_discovers_kling_lip_sync"


@dataclass
class Plan:
    kind: str  # "fast" or "full"
    reason: str
    channels: set[str] = field(default_factory=set)


@dataclass
class Suite:
    name: str
    cwd: str
    command: str


def repo_root(start: Optional[Path] = None) -> Path:
    out = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=start or Path(__file__).parent,
                         capture_output=True, text=True, check=True)
    return Path(out.stdout.strip())


def _git(root: Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True)


# --- scope -------------------------------------------------------------------------------------------------------

def classify(paths: Optional[list[str]], referenced: set[str]) -> Plan:
    if paths is None:
        return Plan("full", f"could not diff against {BASE}")
    channels: set[str] = set()
    for p in paths:
        m = VIDEO_RE.match(p)
        if not m:
            return Plan("full", f"{p} is outside a video folder")
        slug, video = m.groups()
        if slug.startswith("_"):
            return Plan("full", f"{p} is in the {slug} channel, which tests copy")
        if video in referenced:
            return Plan("full", f"{p}: tests read the video {video}")
        channels.add(slug)
    if not channels:
        return Plan("fast", "no changes against the base")
    return Plan("fast", f"only video folders changed ({len(paths)} files)", channels)


def referenced_videos(root: Path) -> set[str]:
    videos = {p.name for p in root.glob("channels/*/videos/*") if p.is_dir()}
    if not videos:
        return set()
    found: set[str] = set()
    for rel in TEST_DIRS:
        base = root / rel
        if not base.is_dir():
            continue
        for f in base.rglob("*"):
            if f.suffix not in TEST_SUFFIXES or not f.is_file() or "node_modules" in f.parts:
                continue
            try:
                text = f.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            found.update(v for v in videos - found if v in text)
    return found


def changed_files(root: Path, base: str) -> Optional[list[str]]:
    mb = _git(root, "merge-base", base, "HEAD")
    if mb.returncode != 0:
        return None
    diff = _git(root, "diff", "--name-only", "--no-renames", mb.stdout.strip(), "HEAD")
    if diff.returncode != 0:
        return None
    return [line for line in diff.stdout.splitlines() if line]


# --- pass cache --------------------------------------------------------------------------------------------------

def head_tree(root: Path) -> str:
    return _git(root, "rev-parse", "HEAD^{tree}").stdout.strip()


def _cache_dir(root: Path) -> Path:
    common = _git(root, "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.strip()
    return Path(common) / CACHE_NAME


def has_passed(root: Path, tree: str) -> bool:
    return bool(tree) and (_cache_dir(root) / tree).is_file()


def mark_passed(root: Path, tree: str) -> None:
    d = _cache_dir(root)
    d.mkdir(parents=True, exist_ok=True)
    (d / tree).write_text(time.strftime("%Y-%m-%dT%H:%M:%S%z") + "\n")


def tracked_clean(root: Path) -> bool:
    out = _git(root, "status", "--porcelain", "--untracked-files=no")
    return out.returncode == 0 and not out.stdout.strip()


# --- running -----------------------------------------------------------------------------------------------------

def default_suites(root: Path) -> list[Suite]:
    om, py = root / "core/openmontage", root / ".venv/bin/python"
    return [
        Suite("openmontage", str(om),
              f"{py} -m pytest tests/backlot tests/contracts tests/lib tests/pipelines tests/qa tests/styles "
              f"tests/test_network_guard.py -q -p no:cacheprovider -p studio.pytest_upstream {DESELECT}"),
        Suite("studio", str(root), f"{py} -m pytest core/studio/tests -q -p no:cacheprovider --import-mode=importlib"),
        Suite("pou", str(root), f"{py} -m pytest core/engines/pou/tests -q -p no:cacheprovider"),
        Suite("whatif", str(root / "core/engines/whatif"),
              "test -d node_modules || { echo \"core/engines/whatif: run 'pnpm install --frozen-lockfile' "
              "there first\" >&2; exit 1; }; npx vitest run && npx tsc --noEmit"),
    ]


def _env(root: Path) -> dict:
    env = dict(os.environ)
    env["PYTHONPATH"] = f"{root / 'core/openmontage'}:{root / 'core'}"
    env.setdefault("PYTHONDONTWRITEBYTECODE", "1")
    env.setdefault("HYPERFRAMES_NO_TELEMETRY", "1")
    env.setdefault("DISABLE_TELEMETRY", "1")
    return env


def _record(step: str, seconds: float, ok: bool) -> None:
    try:
        from studio.jobs.timing import record
        record(step, seconds=seconds, ok=ok, extra={"via": "testgate"})
    except Exception as exc:  # timing is a report, never a gate
        print(f"timing not recorded: {exc}", file=sys.stderr)


def _say(msg: str) -> None:
    print(f"{msg}; waiting", file=sys.stderr, flush=True)


def run_full(root: Path, *, suites: Optional[list[Suite]] = None, queue: Optional[str] = QUEUE) -> int:
    """Run every suite at once; record a pass for HEAD's tree when all pass and no tracked file changed."""
    suites = suites if suites is not None else default_suites(root)
    tree, clean = head_tree(root), tracked_clean(root)
    lock = None
    if queue:
        from studio.jobs import queue as Q
        lock = Q.hold(queue, step="tests-full", on_wait=_say)
        lock.__enter__()
    t0 = time.monotonic()
    try:
        with tempfile.TemporaryDirectory(prefix="omni-testgate-") as tmp:
            procs = []
            for s in suites:
                log = open(Path(tmp) / f"{s.name}.log", "w+")
                cmd = s.command
                if " -m pytest " in cmd:  # each pytest gets its own temp root, so parallel runs never share one
                    cmd += f" --basetemp={Path(tmp) / ('pt-' + s.name)}"
                procs.append((s, log, time.monotonic(),
                              subprocess.Popen(cmd, cwd=s.cwd, shell=True, stdout=log, stderr=subprocess.STDOUT,
                                               env=_env(root))))
            codes = []
            for s, log, started, p in procs:
                code = p.wait()
                codes.append(code)
                log.seek(0)
                tail = log.read().rstrip().splitlines()
                log.close()
                status = "passed" if code == 0 else f"FAILED (exit {code})"
                print(f"--- {s.name}: {status} in {time.monotonic() - started:.0f} s")
                lines = tail if code else tail[-3:]
                print("\n".join(lines))
    finally:
        if lock:
            lock.__exit__(None, None, None)
    ok = all(c == 0 for c in codes)
    _record("tests-full", time.monotonic() - t0, ok)
    if not ok:
        return next(c for c in codes if c)
    if clean and tracked_clean(root) and head_tree(root) == tree:
        mark_passed(root, tree)
        print(f"all suites passed; recorded tree {tree[:12]} as passed")
    else:
        print("all suites passed; tracked files have edits, so this pass is not cached")
    return 0


def run_fast(root: Path, channels: Iterable[str]) -> int:
    t0, code = time.monotonic(), 0
    for slug in sorted(channels):
        r = subprocess.run([str(root / ".venv/bin/python"), "-m", "studio.cli", "check", slug], cwd=root,
                           env=_env(root))
        code = code or r.returncode
    _record("tests-fast", time.monotonic() - t0, code == 0)
    return code


def prepush(root: Path, *, run_full: Callable = run_full, run_fast: Callable = run_fast,
            base: str = BASE) -> int:
    force = os.environ.get("OMNI_TESTGATE_FULL") == "1"
    tree = head_tree(root)
    if not force and has_passed(root, tree):
        print(f"tests: tree {tree[:12]} already passed the full suite; skipping")
        return 0
    plan = Plan("full", "OMNI_TESTGATE_FULL=1") if force else classify(changed_files(root, base),
                                                                          referenced_videos(root))
    print(f"tests: {plan.kind} ({plan.reason})")
    if plan.kind == "fast":
        return run_fast(root, plan.channels)
    return run_full(root)


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.testgate")
    p.add_argument("mode", choices=["full", "prepush", "plan"])
    p.add_argument("--base", default=BASE)
    args = p.parse_args(argv)
    root = repo_root(Path.cwd())
    if args.mode == "full":
        return run_full(root)
    if args.mode == "prepush":
        return prepush(root, base=args.base)
    tree = head_tree(root)
    if has_passed(root, tree):
        print(f"skip: tree {tree[:12]} already passed")
        return 0
    plan = classify(changed_files(root, args.base), referenced_videos(root))
    print(f"{plan.kind}: {plan.reason}" + (f" -> omni check {' '.join(sorted(plan.channels))}"
                                           if plan.channels else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
