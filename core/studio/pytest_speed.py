"""A test whose call phase runs longer than the limit fails unless it is marked `slow`.

Loaded by the conftest of core/studio/tests and core/engines/pou/tests, so the suites `make test` runs stay fast.
The limit is 2 s; OMNI_TEST_TIME_LIMIT sets another (in seconds) and 0 turns the check off. A test that has to be
slow gets `@pytest.mark.slow` with a comment saying why. Fixture setup is not timed.
"""

import os

import pytest

DEFAULT_LIMIT = 2.0


def time_limit() -> float:
    try:
        return float(os.environ.get("OMNI_TEST_TIME_LIMIT", DEFAULT_LIMIT))
    except ValueError:
        return DEFAULT_LIMIT


def pytest_configure(config):
    config.addinivalue_line("markers", f"slow: may run longer than the {DEFAULT_LIMIT:g} s test time limit")


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    report = (yield).get_result()
    limit = time_limit()
    if report.when != "call" or not report.passed or limit <= 0 or report.duration <= limit:
        return
    if item.get_closest_marker("slow") is None:
        report.outcome = "failed"
        report.longrepr = (
            f"{item.nodeid} took {report.duration:.1f} s, over the {limit:g} s limit. "
            "Make it faster, or mark it @pytest.mark.slow and say why."
        )
