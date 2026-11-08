"""One seat's model call, sandboxed.

The seat's inputs (the numbered draft, its brief, the channel bible files) go inline in the prompt; the CLI runs in
an empty temp folder under sandbox-exec with reads and writes denied for secrets, all projects (this repo and its
main checkout), session transcripts and the call ledger, a stripped environment, and a timeout. claude runs with
every tool off; cursor-agent runs in ask mode, never with --force. Every attempt is reserved in the ledger first.
An attempt that exits 0 with a malformed answer, or exits non-zero, is retried once; a timeout (exit 124) is not
retried. Any other failure, including an unexpected exception from invoke, finishes the reserved row as "failed" and
writes a failed verdict. CapReached from ledger.reserve propagates; callers catch it.
"""

from __future__ import annotations

import hashlib
import json
import os
import pwd
import subprocess
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from studio.room.config import SeatConfig
from studio.room.ledger import Ledger
from studio.room.models import cli_of, family_of
from studio.room.snapshot import sha256_text
from studio.room.verdict import BadVerdict, Verdict, failed_verdict, parse_verdict, verdict_digest

ROOT = Path(__file__).resolve().parents[3]
ENV_KEEP = ("PATH", "HOME", "TMPDIR", "LANG", "USER", "LOGNAME", "SHELL")
VERDICT_SPEC = """\
Return only one JSON object and nothing else:
{"scores": {"<what you judged>": <1-10>},
 "blockers": [{"line": <line number or null>, "quote": "<exact words from the draft>", "why": "<the problem>",
               "fix": "<the replacement line or the concrete change>", "domain": "<your role>"}],
 "suggestions": [{"line": <n>, "quote": "<exact words>", "fix": "<concrete change>"}],
 "keep": [{"line": <n>, "quote": "<a line that must survive revision>"}]}
A blocker is something that must change before the owner sees this draft, and only within your role.
Every blocker and suggestion quotes the draft and gives a concrete fix; notes without both are discarded."""


@dataclass
class CallContext:
    channel: str
    video: str
    gate: str
    round: int
    daily_cap: int
    script_cap: int


DENY_HOME = (".config/omni-studio", ".ssh", ".aws", ".gnupg", ".config/gh", ".netrc", ".local/state/omni-studio",
             ".claude/projects", "Exploration", "Sprinklr")


# Other conversations and agent state of the two CLIs. Auth files (~/.cursor/cli-config.json,
# ~/.claude/settings.json) and the installs stay readable so the CLIs can sign in.
AGENT_STATE_DIRS = (".cursor/chats", ".cursor/agents", ".cursor/ai-tracking", ".claude/file-history",
                    ".claude/sessions", ".claude/session-env", ".claude/plans", ".claude/paste-cache",
                    ".claude/shell-snapshots", ".claude/jobs", ".claude/backups")
AGENT_STATE_FILES = (".claude/history.jsonl",)


SECRET_HOME = (".config/omni-studio", ".ssh", ".aws", ".gnupg", ".config/gh", ".netrc", ".local/state/omni-studio",
               ".claude/projects")


def _real_home() -> Path:
    return Path(pwd.getpwuid(os.getuid()).pw_dir)


def is_secret_path(path: Path) -> bool:
    """True when `path` (symlinks resolved) is under a secrets folder of the real home. Inputs are read into prompts."""
    real = Path(path).expanduser().resolve()
    home = _real_home()
    return any(real.is_relative_to((home / rel).resolve()) for rel in SECRET_HOME)


def deny_paths() -> list[Path]:
    home = _real_home()
    paths = [(home / rel).resolve() for rel in (*DENY_HOME, *AGENT_STATE_DIRS, *AGENT_STATE_FILES)]
    paths.append(ROOT.resolve())
    try:
        common = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--path-format=absolute", "--git-common-dir"],
                                capture_output=True, text=True, timeout=10).stdout.strip()
        if common:
            paths.append(Path(common).parent.resolve())  # the main checkout when ROOT is a worktree
    except (OSError, subprocess.SubprocessError):
        pass
    return list(dict.fromkeys(paths))


def _sb_quote(path: Path) -> str:
    return str(Path(path).resolve()).replace("\\", "\\\\").replace('"', '\\"')


def sandbox_profile(deny: list[Path], allow: tuple[Path, ...] | list[Path] = ()) -> str:
    # sandbox-exec matches real paths: /var/folders/... is /private/var/folders/... on macOS. Later rules win, so an
    # allowed folder inside a denied one (the seat's own Cursor chat) stays usable.
    def rule(action: str, p: Path) -> str:
        kind = "literal" if Path(p).is_file() else "subpath"  # a single file, or a folder (or a path not there yet)
        return f'({action} file-read* file-write* ({kind} "{_sb_quote(p)}"))'

    rules = "\n".join([rule("deny", p) for p in deny] + [rule("allow", p) for p in allow])
    return f"(version 1)\n(allow default)\n{rules}\n"


def own_chat_dir(bundle: Path) -> Path:
    """The folder cursor-agent writes this run's chat to: ~/.cursor/chats/<md5 of the workspace's real path>."""
    real = str(Path(bundle).resolve())
    return (_real_home() / ".cursor" / "chats").resolve() / hashlib.md5(real.encode()).hexdigest()


def clean_env() -> dict[str, str]:
    return {k: os.environ[k] for k in ENV_KEEP if k in os.environ}


def _numbered(text: str) -> str:
    return "\n".join(f"{i:>4}  {line}" for i, line in enumerate(text.splitlines(), 1))


def seat_prompt(brief: str, role: str, inputs: dict[str, str]) -> str:
    parts = [f"You are the {role} seat in a review room for a YouTube video. You work alone and never see the "
             "other reviewers' notes or who wrote the draft.", brief.strip(), VERDICT_SPEC]
    for name, text in inputs.items():
        parts.append(f"=== {name} ===\n{_numbered(text) if name == 'draft' else text}")
    return "\n\n".join(parts)


def build_command(model: str, prompt: str, registry: Optional[dict] = None) -> list[str]:
    if cli_of(model, registry) == "claude":
        return ["claude", "-p", "--tools", "", "--strict-mcp-config", "--setting-sources",
                "project", "--output-format", "json", "--model", model,
                prompt]
    return ["cursor-agent", "-p", "--mode", "ask", "--trust", "--output-format", "json", "--model", model, prompt]


def cli_text(stdout: str) -> str:
    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        return stdout
    if isinstance(data, dict) and isinstance(data.get("result"), str):
        return data["result"]
    return stdout


def cli_version(cli: str, runner=None) -> str:
    runner = runner or subprocess.run
    binary = "claude" if cli == "claude" else "cursor-agent"
    try:
        return runner([binary, "--version"], capture_output=True, text=True, timeout=30,
                      env=clean_env()).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def invoke(cmd: list[str], *, runner=None, timeout: float = 600) -> tuple[int, str, float]:
    runner = runner or subprocess.run
    with tempfile.TemporaryDirectory(prefix="room-seat-") as bundle:
        t0 = time.monotonic()
        try:
            profile = sandbox_profile(deny_paths(), allow=[own_chat_dir(Path(bundle))])
            proc = runner(["sandbox-exec", "-p", profile, *cmd], cwd=bundle, env=clean_env(),
                          capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            return 124, "", time.monotonic() - t0
        return proc.returncode, proc.stdout, time.monotonic() - t0


def run_seat(seat: SeatConfig, *, inputs: dict[str, str], ledger: Ledger, ctx: CallContext, out: Path,
             raw_dir: Optional[Path] = None, runner=None, timeout: float = 600,
             registry: Optional[dict] = None, draft_sha256: str = "", lint_overridden: bool = False) -> Verdict:
    family = family_of(seat.model, registry)
    own_sha = sha256_text(inputs["draft"])
    if draft_sha256 and draft_sha256 != own_sha:
        raise ValueError("draft_sha256 does not match the draft in inputs")
    draft_sha256 = own_sha
    prompt = seat_prompt(seat.brief.read_text(encoding="utf-8"), seat.role, inputs)
    cmd = build_command(seat.model, prompt, registry)
    version = cli_version(cli_of(seat.model, registry), runner)
    verdict: Optional[Verdict] = None
    error, text, call_id = "", "", ""
    record: dict = {}
    for attempt in range(2):
        call_id = ledger.reserve(channel=ctx.channel, video=ctx.video, gate=ctx.gate, round=ctx.round,
                                 seat=seat.name, model=seat.model, family=family,
                                 prompt_sha256=sha256_text(prompt), daily_cap=ctx.daily_cap,
                                 script_cap=ctx.script_cap)
        code, duration = -1, 0.0
        try:
            code, stdout, duration = invoke(cmd, runner=runner, timeout=timeout)
            text = cli_text(stdout)
            if code == 0:
                try:
                    verdict = parse_verdict(text, call_id=call_id, seat=seat.name, role=seat.role,
                                            model=seat.model, family=family)
                except BadVerdict as exc:
                    error = str(exc)
            else:
                error = f"{cmd[0]} exited {code}"
        except Exception as exc:  # fail closed: never leave the reserved row open
            text, error = "", f"{type(exc).__name__}: {exc}"
            code = -1
        final = bool(verdict) or code == 124 or code == -1 or attempt == 1
        digest = ""
        if final:
            if verdict is None:
                verdict = failed_verdict(call_id=call_id, seat=seat.name, role=seat.role, model=seat.model,
                                         family=family, error=error)
            record = {**verdict.to_dict(), "output_sha256": sha256_text(text), "draft_sha256": draft_sha256}
            if lint_overridden:
                record["lint_overridden"] = True
            digest = verdict_digest(record)
        ledger.finish(call_id, status=verdict.status if verdict else "failed", output_sha256=sha256_text(text),
                      duration_s=duration, cli_version=version, verdict_sha256=digest)
        if raw_dir:
            raw_dir.mkdir(parents=True, exist_ok=True)
            (raw_dir / f"{call_id}.txt").write_text(text, encoding="utf-8")
        if final:
            break
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    return verdict
