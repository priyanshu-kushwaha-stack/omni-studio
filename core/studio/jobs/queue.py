"""Named queues for heavy steps: one holder at a time on this machine, shared by every session and worktree.

The first video's renders failed under load, so renders run one at a time (next-phase spec, section 3):

    python -m studio.jobs run --queue render --step <step> --channel <slug> --video <id> -- <command>

A queue is a `flock` on `~/.local/state/omni-studio/jobs/queues/<name>.lock` (`OMNI_JOBS_QUEUES` moves the folder).
The kernel drops the lock when its last open descriptor closes, so a crashed or killed holder never leaves a stale
lock. `run` hands the descriptor to the command, so a render keeps the queue even if its wrapper (or the session that
started it) is killed. The lock file also holds a JSON line naming the holder, for the message a waiter prints.
Waiters poll, so the order between two waiters is not guaranteed.
"""

from __future__ import annotations

import errno
import fcntl
import json
import os
import platform
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

DEFAULT = Path.home() / ".local" / "state" / "omni-studio" / "jobs" / "queues"
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")
BUSY_EXIT = 75  # EX_TEMPFAIL: try again later


class QueueBusy(RuntimeError):
    def __init__(self, name: str, holder: dict[str, Any]):
        self.name, self.holder = name, holder
        super().__init__(describe(name, holder))


def queues_dir() -> Path:
    env = os.environ.get("OMNI_JOBS_QUEUES")
    return Path(env) if env else DEFAULT


def lock_path(name: str) -> Path:
    if not NAME_RE.match(name or ""):
        raise ValueError(f"queue name {name!r} must be lower-case letters, digits, '-' or '_' (at most 64)")
    return queues_dir() / f"{name}.lock"


def _try_lock(fd: int) -> bool:
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return True
    except OSError as exc:
        if exc.errno in (errno.EWOULDBLOCK, errno.EAGAIN):
            return False
        raise


def _read(fd: int) -> dict[str, Any]:
    try:
        raw = os.pread(fd, 65536, 0).decode("utf-8", "replace").strip()
        info = json.loads(raw) if raw else {}
        return info if isinstance(info, dict) else {}
    except (OSError, ValueError):
        return {}


def holder(name: str) -> Optional[dict[str, Any]]:
    """The holder's record while the queue is held (an empty dict if it has not written one yet), else None."""
    path = lock_path(name)
    if not path.is_file():
        return None
    fd = os.open(path, os.O_RDONLY)
    try:
        if _try_lock(fd):  # a shared check would also do; an exclusive try is the same question on both kernels
            fcntl.flock(fd, fcntl.LOCK_UN)
            return None
        return _read(fd)
    finally:
        os.close(fd)


def describe(name: str, info: Optional[dict[str, Any]]) -> str:
    if info is None:
        return f"{name} queue is free"
    what = "/".join(x for x in (info.get("channel"), info.get("video")) if x)
    pid = info.get("pid")
    alive = ""
    if isinstance(pid, int):
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            alive = " (that process has exited; its command still holds the lock: `lsof` the lock file)"
        except PermissionError:
            pass
    return (
        f"{name} queue is held by pid {pid} (step {info.get('step') or '?'}"
        f"{', ' + what if what else ''}) since {info.get('since') or '?'}{alive}"
    )


class hold:
    """Context manager: take queue `name`, waiting (polling every `poll` s, at most `timeout` s) unless wait=False.

    Raises QueueBusy when it gives up. `fd` is the locked descriptor (pass it to a child to share the lock) and
    `waited_s` how long it waited.
    """

    def __init__(
        self,
        name: str,
        *,
        step: str = "",
        channel: str = "",
        video: str = "",
        wait: bool = True,
        timeout: Optional[float] = None,
        poll: float = 2.0,
        on_wait=None,
    ):
        self.path = lock_path(name)
        self.name, self.wait, self.timeout, self.poll, self.on_wait = name, wait, timeout, poll, on_wait
        self.info = {"pid": os.getpid(), "step": step, "channel": channel, "video": video, "machine": platform.node()}
        self.fd: Optional[int] = None
        self.waited_s = 0.0

    def __enter__(self) -> "hold":
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd = os.open(self.path, os.O_RDWR | os.O_CREAT, 0o644)
        t0, told = time.monotonic(), False
        try:
            while not _try_lock(fd):
                waited = time.monotonic() - t0
                if not self.wait or (self.timeout is not None and waited >= self.timeout):
                    raise QueueBusy(self.name, _read(fd))
                if self.on_wait and not told:
                    self.on_wait(describe(self.name, _read(fd)))
                    told = True
                time.sleep(self.poll if self.timeout is None else min(self.poll, max(self.timeout - waited, 0.01)))
        except BaseException:
            os.close(fd)
            raise
        self.waited_s = time.monotonic() - t0
        self.info["since"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        os.ftruncate(fd, 0)
        os.pwrite(fd, (json.dumps(self.info) + "\n").encode("utf-8"), 0)
        self.fd = fd
        return self

    def __exit__(self, *exc) -> None:
        if self.fd is None:
            return
        try:
            os.ftruncate(self.fd, 0)
            fcntl.flock(self.fd, fcntl.LOCK_UN)
        finally:
            os.close(self.fd)
            self.fd = None
