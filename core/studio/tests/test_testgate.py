"""The pre-push test gate: a pass cache keyed by the git tree, a fast path for video-folder-only changes, and
the full suite run in parallel under the machine-wide `tests` queue."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from studio import testgate as G


# --- classify: which changes can skip the code suites --------------------------------------------------------------


def test_video_folder_only_changes_take_the_fast_path():
    plan = G.classify(
        [
            "channels/say-suppose/videos/2026-11-09_odds/script.md",
            "channels/say-suppose/videos/2026-11-09_odds/room/g2.json",
            "channels/see-underneath/videos/2026-11-10_x/claims.md",
        ],
        referenced=set(),
    )
    assert plan.kind == "fast"
    assert plan.channels == {"say-suppose", "see-underneath"}


@pytest.mark.parametrize(
    "path",
    [
        "core/studio/room/call.py",
        "core/openmontage/skills/studio/studio-room.md",  # skills are tested (test_room_skill)
        "channels/say-suppose/channel.yaml",  # channel config is read by tests and tools
        "channels/say-suppose/room.yaml",
        "channels/say-suppose/rules/story.md",
        "channels/_template/videos/x/script.md",  # the template is copied by tests
        "Makefile",
        ".claude/standard.json",
    ],
)
def test_anything_outside_a_video_folder_needs_the_full_suite(path):
    plan = G.classify(["channels/say-suppose/videos/2026-11-09_odds/script.md", path], referenced=set())
    assert plan.kind == "full"
    assert path in plan.reason


def test_a_video_the_tests_read_needs_the_full_suite():
    vid = "2026-11-06_pause-time-for-10-seconds-a-day"
    plan = G.classify([f"channels/say-suppose/videos/{vid}/upload.yaml"], referenced={vid})
    assert plan.kind == "full"
    assert vid in plan.reason


def test_no_changes_is_fast_with_nothing_to_check():
    plan = G.classify([], referenced=set())
    assert plan.kind == "fast" and plan.channels == set()


def test_unknown_base_means_full():
    plan = G.classify(None, referenced=set())
    assert plan.kind == "full"


def test_referenced_videos_finds_names_used_by_tests(tmp_path):
    (tmp_path / "channels/a/videos/2026-01-01_used").mkdir(parents=True)
    (tmp_path / "channels/a/videos/2026-01-02_free").mkdir(parents=True)
    tests = tmp_path / "core/studio/tests"
    tests.mkdir(parents=True)
    (tests / "test_x.py").write_text('VIDEO = REAL_ROOT / "channels/a/videos/2026-01-01_used"\n')
    assert G.referenced_videos(tmp_path) == {"2026-01-01_used"}


def test_the_real_repo_marks_the_videos_its_tests_read():
    refs = G.referenced_videos(G.repo_root())
    assert "2026-11-06_pause-time-for-10-seconds-a-day" in refs
    assert "2026-10-31_tails" in refs


# --- the pass cache ------------------------------------------------------------------------------------------------


def _git(cwd: Path, *args: str) -> str:
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


@pytest.fixture()
def repo(tmp_path):
    root = tmp_path / "repo"
    root.mkdir()
    _git(root, "init", "-q", "-b", "main")
    _git(root, "config", "user.email", "t@example.com")
    _git(root, "config", "user.name", "t")
    (root / "a.txt").write_text("one\n")
    _git(root, "add", ".")
    _git(root, "commit", "-q", "-m", "one")
    return root


def test_a_recorded_pass_is_found_for_the_same_tree_only(repo):
    tree = G.head_tree(repo)
    assert not G.has_passed(repo, tree)
    G.mark_passed(repo, tree)
    assert G.has_passed(repo, tree)
    (repo / "a.txt").write_text("two\n")
    _git(repo, "commit", "-qam", "two")
    assert not G.has_passed(repo, G.head_tree(repo))


def test_the_cache_is_shared_by_worktrees(repo, tmp_path):
    G.mark_passed(repo, G.head_tree(repo))
    wt = tmp_path / "wt"
    _git(repo, "worktree", "add", "-q", "-b", "side", str(wt))
    assert G.has_passed(wt, G.head_tree(wt))


def test_tracked_clean_ignores_untracked_files(repo):
    assert G.tracked_clean(repo)
    (repo / "new.txt").write_text("x")
    assert G.tracked_clean(repo)
    (repo / "a.txt").write_text("edited\n")
    assert not G.tracked_clean(repo)


# --- full: parallel suites, cache only on a clean pass ------------------------------------------------------------


def _suites(tmp_path, *codes):
    return [G.Suite(f"s{i}", str(tmp_path), f"echo out-{i}; exit {c}") for i, c in enumerate(codes)]


def test_full_records_a_pass_on_a_clean_tree(repo, tmp_path):
    code = G.run_full(repo, suites=_suites(tmp_path, 0, 0), queue=None)
    assert code == 0
    assert G.has_passed(repo, G.head_tree(repo))


def test_full_failure_records_nothing(repo, tmp_path, capsys):
    code = G.run_full(repo, suites=_suites(tmp_path, 0, 3), queue=None)
    assert code != 0
    assert not G.has_passed(repo, G.head_tree(repo))
    out = capsys.readouterr().out
    assert "out-0" in out and "out-1" in out and "s1" in out


def test_full_on_a_dirty_tree_passes_but_records_nothing(repo, tmp_path):
    (repo / "a.txt").write_text("edited\n")
    assert G.run_full(repo, suites=_suites(tmp_path, 0), queue=None) == 0
    assert not G.has_passed(repo, G.head_tree(repo))


def test_full_runs_suites_at_the_same_time(repo, tmp_path):
    import time

    suites = [G.Suite(f"s{i}", str(tmp_path), "sleep 1") for i in range(3)]
    t0 = time.monotonic()
    assert G.run_full(repo, suites=suites, queue=None) == 0
    assert time.monotonic() - t0 < 2.5


# --- prepush: cache hit, fast path, full path ---------------------------------------------------------------------


class Calls:
    def __init__(self, full_code=0, fast_code=0):
        self.full, self.fast = [], []
        self.full_code, self.fast_code = full_code, fast_code

    def run_full(self, root, **kw):
        self.full.append(root)
        return self.full_code

    def run_fast(self, root, channels):
        self.fast.append(sorted(channels))
        return self.fast_code


def test_prepush_skips_a_tree_that_already_passed(repo, monkeypatch):
    G.mark_passed(repo, G.head_tree(repo))
    calls = Calls()
    monkeypatch.setattr(G, "changed_files", lambda root, base: pytest.fail("should not diff on a cache hit"))
    assert G.prepush(repo, run_full=calls.run_full, run_fast=calls.run_fast) == 0
    assert calls.full == [] and calls.fast == []


def test_prepush_runs_only_the_fast_checks_for_video_changes(repo, monkeypatch):
    monkeypatch.setattr(G, "changed_files", lambda root, base: ["channels/say-suppose/videos/v1/script.md"])
    monkeypatch.setattr(G, "referenced_videos", lambda root: set())
    calls = Calls()
    assert G.prepush(repo, run_full=calls.run_full, run_fast=calls.run_fast) == 0
    assert calls.fast == [["say-suppose"]] and calls.full == []


def test_prepush_fast_failure_blocks(repo, monkeypatch):
    monkeypatch.setattr(G, "changed_files", lambda root, base: ["channels/say-suppose/videos/v1/script.md"])
    monkeypatch.setattr(G, "referenced_videos", lambda root: set())
    calls = Calls(fast_code=1)
    assert G.prepush(repo, run_full=calls.run_full, run_fast=calls.run_fast) == 1


def test_prepush_runs_the_full_suite_for_code_changes(repo, monkeypatch):
    monkeypatch.setattr(G, "changed_files", lambda root, base: ["core/studio/room/call.py"])
    monkeypatch.setattr(G, "referenced_videos", lambda root: set())
    calls = Calls(full_code=4)
    assert G.prepush(repo, run_full=calls.run_full, run_fast=calls.run_fast) == 4
    assert calls.full == [repo] and calls.fast == []


def test_force_full_overrides_the_fast_path(repo, monkeypatch):
    monkeypatch.setenv("OMNI_TESTGATE_FULL", "1")
    monkeypatch.setattr(G, "changed_files", lambda root, base: ["channels/say-suppose/videos/v1/script.md"])
    monkeypatch.setattr(G, "referenced_videos", lambda root: set())
    calls = Calls()
    G.prepush(repo, run_full=calls.run_full, run_fast=calls.run_fast)
    assert calls.full == [repo] and calls.fast == []


def test_changed_files_against_the_merge_base(repo):
    _git(repo, "checkout", "-q", "-b", "feature")
    (repo / "channels/c/videos/v").mkdir(parents=True)
    (repo / "channels/c/videos/v/script.md").write_text("x")
    _git(repo, "add", ".")
    _git(repo, "commit", "-qm", "video")
    _git(repo, "checkout", "-q", "main")
    (repo / "b.txt").write_text("main moved on")
    _git(repo, "add", ".")
    _git(repo, "commit", "-qm", "main")
    _git(repo, "checkout", "-q", "feature")
    assert G.changed_files(repo, "main") == ["channels/c/videos/v/script.md"]
    assert G.changed_files(repo, "no-such-ref") is None


def test_the_repo_suites_match_the_old_make_test():
    names = [s.name for s in G.default_suites(G.repo_root())]
    assert names == ["openmontage", "openmontage-qa", "openmontage-rest", "studio", "pou", "whatif"]
    # the upstream split runs every folder the old single run did, each exactly once, and the deselect everywhere
    split = [p for paths in G.OPENMONTAGE_SPLIT.values() for p in paths]
    assert sorted(split) == sorted(G.OPENMONTAGE_TESTS) and len(split) == len(set(split))
    for s in G.default_suites(G.repo_root())[:3]:
        assert "-p studio.pytest_upstream" in s.command and G.DESELECT in s.command


def test_the_studio_suite_runs_on_xdist_workers_that_keep_groups_together():
    from importlib.metadata import version

    studio = next(s for s in G.default_suites(G.repo_root()) if s.name == "studio")
    assert f"-n {G.STUDIO_WORKERS} --dist loadgroup" in studio.command  # without loadgroup, xdist_group is ignored
    lock = (G.repo_root() / "uv.lock").read_text(encoding="utf-8")
    assert f'name = "pytest-xdist"\nversion = "{version("pytest-xdist")}"' in lock


def test_without_xdist_the_studio_suite_still_runs_in_one_process(capsys):
    assert G.studio_workers(have_xdist=False) == ""
    assert "pytest-xdist is not installed" in capsys.readouterr().err
    assert G.studio_workers(have_xdist=True) == f" -n {G.STUDIO_WORKERS} --dist loadgroup"
