"""A seat call: a prompt with the inputs inline, the CLI run under sandbox-exec, one retry, a verdict file."""

from __future__ import annotations

import json
import os
import pwd
import shutil
import subprocess
from pathlib import Path

import pytest

from studio.room import call as C
from studio.room.config import SeatConfig
from studio.room.ledger import Ledger

REG = {"gpt-5.6-sol-high": {"family": "openai", "cli": "cursor"},
       "claude-sonnet-5-5": {"family": "anthropic", "cli": "claude"}}
VERDICT = {"scores": {"x": 6}, "blockers": [], "suggestions": [], "keep": [{"line": 1, "quote": "Hi"}]}


def _seat(tmp_path):
    brief = tmp_path / "brief.md"
    brief.write_text("Check only pacing.")
    return SeatConfig("story editor", "story", "gpt-5.6-sol-high", brief)


def _ctx():
    return C.CallContext("professor-of-us", "2026-11-10_x", "g2", 1, daily_cap=50, script_cap=50)


def ROOT_NOT_PARENT(cwd):
    root = C.ROOT.resolve()
    return cwd != root and root not in cwd.parents and cwd not in root.parents


def fake_runner(outputs):
    calls = []

    def run(cmd, **kw):
        calls.append((cmd, kw))
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="9.9.9\n", stderr="")
        return subprocess.CompletedProcess(cmd, 0, stdout=outputs.pop(0), stderr="")

    run.calls = calls
    return run


def test_build_command_picks_the_cli():
    claude = C.build_command("claude-sonnet-5-5", "P", REG)
    assert claude[:2] == ["claude", "-p"] and "--tools" in claude and claude[claude.index("--tools") + 1] == ""
    cursor = C.build_command("gpt-5.6-sol-high", "P", REG)
    assert cursor[:2] == ["cursor-agent", "-p"] and cursor[cursor.index("--mode") + 1] == "ask"
    assert "--force" not in cursor and "--yolo" not in cursor


def test_the_prompt_numbers_the_draft_and_inlines_the_inputs():
    p = C.seat_prompt("Check pacing.", "story", {"draft": "A\nB", "audience.md": "Teens"})
    assert "   1  A\n   2  B" in p and "=== audience.md ===\nTeens" in p and "Check pacing." in p


def test_cli_text_reads_both_json_shapes():
    assert C.cli_text(json.dumps({"type": "result", "result": "hello"})) == "hello"
    assert C.cli_text("plain") == "plain"


def _real_home():
    return Path(pwd.getpwuid(os.getuid()).pw_dir)


def test_the_sandbox_denies_secrets_and_the_repo():
    profile = C.sandbox_profile(C.deny_paths())
    secret = (_real_home() / ".config" / "omni-studio").resolve()
    assert f'(deny file-read* file-write* (subpath "{secret}"))' in profile
    assert str(C.ROOT) in profile


def test_deny_paths_cover_secrets_projects_transcripts_and_the_ledger():
    home = _real_home()
    denied = set(C.deny_paths())
    for rel in (".config/omni-studio", ".ssh", ".aws", ".gnupg", ".config/gh", ".netrc", ".local/state/omni-studio",
                ".claude/projects", "Exploration", "Sprinklr"):
        assert (home / rel).resolve() in denied, rel
    assert C.ROOT.resolve() in denied


def test_the_profile_escapes_quotes_and_backslashes(tmp_path):
    weird = tmp_path / 'a"b\\c'
    profile = C.sandbox_profile([weird])
    resolved = str(weird.resolve())
    assert resolved.replace("\\", "\\\\").replace('"', '\\"') in profile
    assert f'(subpath "{resolved}")' not in profile


def test_clean_env_drops_everything_but_the_basics(monkeypatch):
    monkeypatch.setenv("OMNI_STUDIO_APPROVAL_KEY", "/secret")
    env = C.clean_env()
    assert "OMNI_STUDIO_APPROVAL_KEY" not in env and "PATH" in env and "HOME" in env


def test_run_seat_writes_a_verdict_and_logs_the_call(tmp_path):
    runner = fake_runner([json.dumps({"result": json.dumps(VERDICT)})])
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "room" / "g2" / "round-1" / "story-editor.json"
    v = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                   raw_dir=tmp_path / "room" / "raw", runner=runner, registry=REG)
    assert v.status == "ok" and v.family == "openai"
    record = json.loads(out.read_text())
    row = db.get(record["call_id"])
    assert row.status == "ok" and row.output_sha256 == record["output_sha256"] and row.cli_version == "9.9.9"
    cmd = [c for c, _ in runner.calls if c[-1] != "--version"][0]
    assert cmd[:2] == ["sandbox-exec", "-p"]
    assert (tmp_path / "room" / "raw").is_dir()
    kw = [k for c, k in runner.calls if c[-1] != "--version"][0]
    assert kw["env"] == C.clean_env() and kw["timeout"] > 0
    cwd = Path(kw["cwd"]).resolve()
    assert ROOT_NOT_PARENT(cwd)
    version_kw = [k for c, k in runner.calls if c[-1] == "--version"][0]
    assert version_kw["env"] == C.clean_env()


def test_a_bad_answer_is_retried_once_then_the_seat_fails(tmp_path):
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "v.json"
    ok = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                    runner=fake_runner(["not json", json.dumps({"result": json.dumps(VERDICT)})]), registry=REG)
    assert ok.status == "ok" and db.count() == 2
    bad = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                     runner=fake_runner(["nope", "still nope"]), registry=REG)
    assert bad.status == "failed" and json.loads(out.read_text())["status"] == "failed"


def _raising_runner(exc):
    def run(cmd, **kw):
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="9.9.9\n", stderr="")
        raise exc
    return run


def test_a_timeout_is_not_retried_and_fails_the_seat(tmp_path):
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "v.json"
    v = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                   runner=_raising_runner(subprocess.TimeoutExpired("x", 1)), registry=REG)
    assert v.status == "failed" and db.count() == 1
    assert json.loads(out.read_text())["status"] == "failed"


def test_an_unexpected_exception_finishes_the_row_as_failed(tmp_path):
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "v.json"
    v = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                   runner=_raising_runner(FileNotFoundError("sandbox-exec")), registry=REG)
    assert v.status == "failed" and json.loads(out.read_text())["status"] == "failed"
    assert db.get(v.call_id).status == "failed"
    assert db.count() == 1


def test_cap_reached_propagates(tmp_path):
    from studio.room.ledger import CapReached
    db = Ledger(tmp_path / "l.sqlite")
    ctx = C.CallContext("professor-of-us", "v", "g2", 1, daily_cap=50, script_cap=0)
    with pytest.raises(CapReached):
        C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=ctx, out=tmp_path / "v.json",
                   runner=fake_runner([]), registry=REG)


@pytest.mark.skipif(not shutil.which("sandbox-exec"), reason="macOS only")
def test_sandbox_exec_really_denies_a_read(tmp_path):
    secret = tmp_path / "denied"
    secret.mkdir()
    (secret / "canary.txt").write_text("CANARY")
    allowed = tmp_path / "sibling"
    allowed.mkdir()
    (allowed / "ok.txt").write_text("FINE")
    profile = C.sandbox_profile([secret])
    ok = subprocess.run(["sandbox-exec", "-p", profile, "cat", str(allowed / "ok.txt")],
                        capture_output=True, text=True)
    assert ok.returncode == 0 and "FINE" in ok.stdout
    proc = subprocess.run(["sandbox-exec", "-p", profile, "cat", str(secret / "canary.txt")],
                          capture_output=True, text=True)
    assert proc.returncode != 0 and "CANARY" not in proc.stdout and "Operation not permitted" in proc.stderr


@pytest.mark.skipif(not shutil.which("sandbox-exec"), reason="macOS only")
def test_sandbox_exec_really_denies_a_write(tmp_path):
    secret = tmp_path / "denied"
    secret.mkdir()
    target = secret / "w.txt"
    proc = subprocess.run(["sandbox-exec", "-p", C.sandbox_profile([secret]), "sh", "-c", f"echo x > {target}"],
                          capture_output=True, text=True)
    assert proc.returncode != 0 and not target.exists()
