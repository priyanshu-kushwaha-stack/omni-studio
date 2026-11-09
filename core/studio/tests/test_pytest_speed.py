"""studio.pytest_speed: a test over the time limit fails unless it is marked slow."""

import os
import subprocess
import sys
from pathlib import Path

from studio import pytest_speed

CORE = Path(__file__).resolve().parents[2]

SAMPLE = """
import time
import pytest

def test_fast():
    pass

def test_slow_unmarked():
    time.sleep(0.25)

@pytest.mark.slow
def test_slow_marked():
    time.sleep(0.25)
"""


def run(tmp_path, limit):
    (tmp_path / "test_sample.py").write_text(SAMPLE)
    env = {**os.environ, "OMNI_TEST_TIME_LIMIT": limit, "PYTHONPATH": str(CORE)}
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "-q",
        "-p",
        "no:cacheprovider",
        "-p",
        "no:asyncio",
        "-p",
        "studio.pytest_speed",
        "-rf",
    ]
    return subprocess.run(cmd + [str(tmp_path)], cwd=tmp_path, env=env, capture_output=True, text=True).stdout


def test_over_the_limit_fails_unless_marked_slow(tmp_path):
    out = run(tmp_path, "0.1")
    assert "1 failed, 2 passed" in out
    assert "test_slow_unmarked took" in out and "@pytest.mark.slow" in out


def test_the_limit_comes_from_the_environment(monkeypatch):
    monkeypatch.delenv("OMNI_TEST_TIME_LIMIT", raising=False)
    assert pytest_speed.time_limit() == 2.0
    monkeypatch.setenv("OMNI_TEST_TIME_LIMIT", "0")  # 0 turns the check off
    assert pytest_speed.time_limit() == 0.0
    monkeypatch.setenv("OMNI_TEST_TIME_LIMIT", "soon")
    assert pytest_speed.time_limit() == 2.0
