"""The tool denylist must fail closed: a bad file stops the registry from loading."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

from tools.tool_registry import DISABLED_TOOLS, ToolRegistry, _load_disabled_tools

ROOT = Path(__file__).resolve().parents[3]
TOOLS = ROOT / "core" / "openmontage" / "tools"

BAD_FILES = {
    "string_value": ("disabled: lip_sync\n", "must be a list"),
    "null_value": ("disabled:\n", "must be a list"),
    "mapping_value": ("disabled:\n  lip_sync: true\n", "must be a list"),
    "number_value": ("disabled: 7\n", "must be a list"),
    "non_string_entry": ("disabled:\n  - lip_sync\n  - 7\n", "non-empty string"),
    "null_entry": ("disabled:\n  - lip_sync\n  -\n", "non-empty string"),
    "empty_entry": ('disabled:\n  - lip_sync\n  - ""\n', "non-empty string"),
    "blank_entry": ('disabled:\n  - lip_sync\n  - "  "\n', "non-empty string"),
    "missing_key": ("enabled:\n  - lip_sync\n", "missing the 'disabled' key"),
    "empty_file": ("", "missing the 'disabled' key"),
    "top_level_list": ("- lip_sync\n", "missing the 'disabled' key"),
    "malformed_yaml": ("disabled: [lip_sync\n", "not valid YAML"),
}


@pytest.mark.parametrize("name", sorted(BAD_FILES))
def test_bad_denylist_raises_naming_the_file_and_problem(tmp_path, name):
    content, problem = BAD_FILES[name]
    path = tmp_path / "disabled_tools.yaml"
    path.write_text(content, encoding="utf-8")
    with pytest.raises(RuntimeError) as exc:
        _load_disabled_tools(path)
    assert str(path) in str(exc.value)
    assert problem in str(exc.value)


def test_missing_denylist_raises_naming_the_file(tmp_path):
    path = tmp_path / "absent.yaml"
    with pytest.raises(RuntimeError) as exc:
        _load_disabled_tools(path)
    assert str(path) in str(exc.value)
    assert "cannot be read" in str(exc.value)


def test_unreadable_denylist_raises_naming_the_file(tmp_path):
    with pytest.raises(RuntimeError) as exc:
        _load_disabled_tools(tmp_path)  # a directory cannot be read as a file
    assert str(tmp_path) in str(exc.value)
    assert "cannot be read" in str(exc.value)


def test_valid_denylist_disables_the_owner_tools():
    assert {"lip_sync", "h3_max_video"} <= DISABLED_TOOLS
    fresh = ToolRegistry()
    discovered = fresh.discover()
    for name in ("lip_sync", "h3_max_video"):
        assert name not in discovered
        assert fresh.get(name) is None


def test_valid_denylist_file_parses_to_exact_names(tmp_path):
    path = tmp_path / "disabled_tools.yaml"
    path.write_text("disabled:\n  - lip_sync\n  - h3_max_video\n", encoding="utf-8")
    assert _load_disabled_tools(path) == frozenset({"lip_sync", "h3_max_video"})


def _import_registry_with_denylist(tmp_path: Path, content: str | None) -> subprocess.CompletedProcess:
    """Import a copy of the real registry beside the given denylist, in a new process."""
    tools = tmp_path / "openmontage" / "tools"
    tools.mkdir(parents=True)
    for name in ("__init__.py", "base_tool.py", "tool_registry.py"):
        shutil.copy(TOOLS / name, tools / name)
    config = tmp_path / "studio" / "config"
    config.mkdir(parents=True)
    if content is not None:
        (config / "disabled_tools.yaml").write_text(content, encoding="utf-8")
    env = {**os.environ, "PYTHONPATH": str(tmp_path / "openmontage"), "PYTHONDONTWRITEBYTECODE": "1"}
    return subprocess.run(
        [sys.executable, "-c", "import tools.tool_registry; print('LOADED')"],
        capture_output=True, text=True, env=env, cwd=tmp_path, timeout=60,
    )


@pytest.mark.parametrize(
    "content, problem",
    [
        ("disabled: lip_sync\n", "must be a list"),
        ("enabled: []\n", "missing the 'disabled' key"),
        ("disabled: [lip_sync\n", "not valid YAML"),
        (None, "cannot be read"),
    ],
    ids=["string", "missing_key", "malformed", "missing_file"],
)
def test_registry_refuses_to_import_with_a_bad_denylist(tmp_path, content, problem):
    proc = _import_registry_with_denylist(tmp_path, content)
    assert proc.returncode != 0
    assert "LOADED" not in proc.stdout
    assert "disabled_tools.yaml" in proc.stderr
    assert problem in proc.stderr


def test_registry_imports_with_a_valid_denylist(tmp_path):
    proc = _import_registry_with_denylist(tmp_path, "disabled:\n  - lip_sync\n")
    assert proc.returncode == 0, proc.stderr
    assert "LOADED" in proc.stdout
