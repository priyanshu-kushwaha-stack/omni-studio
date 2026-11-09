"""studio.jobs queues: a lock so two sessions never run a heavy render on the Mac at once (next-phase spec, section 3)."""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

import pytest

from studio.jobs import __main__ as cli
from studio.jobs import queue as Q
from studio.jobs import timing as T

CORE = Path(__file__).resolve().parents[2]


@pytest.fixture
def qdir(tmp_path, monkeypatch):
    monkeypatch.setenv("OMNI_JOBS_QUEUES", str(tmp_path / "queues"))
    monkeypatch.setenv("OMNI_JOBS_TIMINGS", str(tmp_path / "t.jsonl"))
    return tmp_path / "queues"


def _env(tmp_path) -> dict:
    env = dict(os.environ)
    env["PYTHONPATH"] = f"{CORE}:{CORE / 'openmontage'}"
    env["OMNI_JOBS_QUEUES"] = str(tmp_path / "queues")
    env["OMNI_JOBS_TIMINGS"] = str(tmp_path / "t.jsonl")
    return env


def _wait_until(pred, timeout=10.0):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        if pred():
            return True
        time.sleep(0.05)
    return False


def test_a_free_queue_is_taken_and_given_back(qdir):
    assert Q.holder("render") is None
    with Q.hold("render", step="render", channel="say-suppose", video="v1") as lock:
        info = Q.holder("render")
        assert info["pid"] == os.getpid() and info["step"] == "render" and info["video"] == "v1"
        assert lock.waited_s >= 0
    assert Q.holder("render") is None


def test_a_held_queue_refuses_without_waiting_and_names_the_holder(qdir):
    with Q.hold("render", step="render", channel="say-suppose", video="v1"):
        with pytest.raises(Q.QueueBusy) as err:
            with Q.hold("render", step="render", wait=False):
                pass
        assert err.value.holder["video"] == "v1"
        assert "say-suppose" in str(err.value) and "v1" in str(err.value)


def test_a_wait_with_a_timeout_gives_up(qdir):
    with Q.hold("render"):
        t0 = time.monotonic()
        with pytest.raises(Q.QueueBusy):
            with Q.hold("render", timeout=0.3, poll=0.05):
                pass
        assert time.monotonic() - t0 >= 0.3


def test_a_waiter_gets_the_queue_when_the_holder_lets_go(qdir):
    first = Q.hold("render", step="first")
    first.__enter__()
    threading.Timer(0.3, first.__exit__, (None, None, None)).start()
    with Q.hold("render", step="second", poll=0.05) as lock:
        assert Q.holder("render")["step"] == "second"
        assert lock.waited_s >= 0.25


def test_queues_are_independent(qdir):
    with Q.hold("render"):
        with Q.hold("tts", wait=False):
            assert Q.holder("tts") is not None


@pytest.mark.parametrize("name", ["", "../etc", "a/b", "Render", ".hidden", "x" * 65])
def test_a_queue_name_cannot_leave_the_queue_folder(qdir, name):
    with pytest.raises(ValueError):
        Q.lock_path(name)


def test_a_killed_holder_frees_the_queue(qdir, tmp_path):
    code = ("from studio.jobs import queue as Q; import time\n"
            "with Q.hold('render', step='victim'):\n    print('held', flush=True); time.sleep(30)\n")
    proc = subprocess.Popen([sys.executable, "-c", code], env=_env(tmp_path), stdout=subprocess.PIPE, text=True)
    try:
        assert proc.stdout.readline().strip() == "held"
        assert Q.holder("render")["step"] == "victim"
        proc.send_signal(signal.SIGKILL)
        proc.wait(5)
        assert Q.holder("render") is None  # the kernel drops a flock with its last open descriptor
    finally:
        proc.kill()


def test_run_with_a_queue_runs_the_command_and_records_the_wait(qdir):
    assert cli.main(["run", "--queue", "render", "--step", "whatif-render", "--channel", "say-suppose",
                     "--video", "v2", "--", sys.executable, "-c", "pass"]) == 0
    row = T.read_timings()[-1]
    assert (row["step"], row["ok"], row["queue"]) == ("whatif-render", True, "render")
    assert row["waited_s"] >= 0
    assert Q.holder("render") is None


def test_the_command_sees_itself_as_the_holder(qdir, tmp_path):
    out = tmp_path / "seen.json"
    code = f"from studio.jobs import queue as Q; import json; open({str(out)!r}, 'w').write(json.dumps(Q.holder('render')))"
    assert cli.main(["run", "--queue", "render", "--step", "r", "--", sys.executable, "-c", code]) == 0
    assert json.loads(out.read_text())["step"] == "r"


def test_run_no_wait_on_a_busy_queue_exits_75_without_running(qdir, tmp_path, capsys):
    marker = tmp_path / "ran"
    with Q.hold("render", step="other", channel="say-suppose", video="v1"):
        code = cli.main(["run", "--queue", "render", "--no-wait", "--step", "r", "--",
                         sys.executable, "-c", f"open({str(marker)!r}, 'w')"])
    assert code == 75 and not marker.exists()
    assert "v1" in capsys.readouterr().err
    assert T.read_timings() == []


def test_run_wait_timeout_on_a_busy_queue_exits_75(qdir, tmp_path):
    with Q.hold("render"):
        assert cli.main(["run", "--queue", "render", "--wait-timeout", "0.2", "--step", "r", "--",
                         sys.executable, "-c", "pass"]) == 75


def test_run_with_a_bad_queue_name_is_a_usage_error(qdir):
    assert cli.main(["run", "--queue", "../x", "--step", "r", "--", sys.executable, "-c", "pass"]) == 2


def test_the_render_keeps_the_queue_if_its_wrapper_is_killed(qdir, tmp_path):
    """A killed session must not let a second render start while the first one's process still runs."""
    child = "import time; time.sleep(1.5)"
    wrapper = subprocess.Popen([sys.executable, "-m", "studio.jobs", "run", "--queue", "render", "--step", "r",
                                "--", sys.executable, "-c", child], env=_env(tmp_path))
    try:
        assert _wait_until(lambda: Q.holder("render") is not None)
        wrapper.send_signal(signal.SIGKILL)
        wrapper.wait(5)
        with pytest.raises(Q.QueueBusy):
            with Q.hold("render", wait=False):
                pass
        assert _wait_until(lambda: Q.holder("render") is None)  # free once the orphaned render ends
    finally:
        wrapper.kill()


def test_queue_status_prints_free_or_the_holder(qdir, capsys):
    assert cli.main(["queue", "render"]) == 0
    assert "free" in capsys.readouterr().out
    with Q.hold("render", step="whatif-render", channel="say-suppose", video="v1"):
        assert cli.main(["queue", "render"]) == 1
    out = capsys.readouterr().out
    assert "whatif-render" in out and "say-suppose" in out and "v1" in out
