"""A seat call: a prompt with the inputs inline, the CLI run under sandbox-exec, one retry, a verdict file."""

from __future__ import annotations

import json
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


def test_the_sandbox_denies_secrets_and_the_repo():
    profile = C.sandbox_profile(C.deny_paths())
    assert '(deny file-read* (subpath "' + str((Path.home() / ".config" / "omni-studio").resolve()) + '"))' in profile
    assert str(C.ROOT) in profile


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


def test_a_bad_answer_is_retried_once_then_the_seat_fails(tmp_path):
    db = Ledger(tmp_path / "l.sqlite")
    out = tmp_path / "v.json"
    ok = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                    runner=fake_runner(["not json", json.dumps({"result": json.dumps(VERDICT)})]), registry=REG)
    assert ok.status == "ok" and db.count() == 2
    bad = C.run_seat(_seat(tmp_path), inputs={"draft": "Hi"}, ledger=db, ctx=_ctx(), out=out,
                     runner=fake_runner(["nope", "still nope"]), registry=REG)
    assert bad.status == "failed" and json.loads(out.read_text())["status"] == "failed"


@pytest.mark.skipif(not shutil.which("sandbox-exec"), reason="macOS only")
def test_sandbox_exec_really_denies_a_read(tmp_path):
    secret = tmp_path / "denied"
    secret.mkdir()
    (secret / "canary.txt").write_text("CANARY")
    proc = subprocess.run(["sandbox-exec", "-p", C.sandbox_profile([secret]), "cat", str(secret / "canary.txt")],
                          capture_output=True, text=True)
    assert proc.returncode != 0 and "CANARY" not in proc.stdout
