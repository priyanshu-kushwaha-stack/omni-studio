"""Code-health gates: size budgets (studio.sizes), where new growth fails and records may only shrink, and the
ruff pin."""

import re
import tomllib
from pathlib import Path

import yaml

from studio import sizes


def write(root: Path, rel: str, text: str) -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text)


def func(name: str, body_lines: int, indent: str = "") -> str:
    return f"{indent}def {name}():\n" + "".join(f"{indent}    x = {i}\n" for i in range(body_lines - 1))


def test_measure_reports_only_offenders(tmp_path):
    write(tmp_path, "core/studio/small.py", func("ok", 5))
    write(tmp_path, "core/studio/big.py", "\n" * 600)
    write(tmp_path, "core/engines/pou/long.py", func("long", 70))
    write(tmp_path, "core/engines/whatif/node_modules/x.py", "\n" * 900)
    assert sizes.measure(tmp_path) == {"core/studio/big.py": 600, "core/engines/pou/long.py::long": 70}


def test_function_names_are_qualified(tmp_path):
    src = "class A:\n" + func("method", 61, "    ") + func("outer", 3) + func("inner", 62, "    ")
    write(tmp_path, "core/studio/m.py", src)
    # outer holds inner, so both are over budget; inner is named on its own
    assert sizes.measure(tmp_path) == {
        "core/studio/m.py::A.method": 61,
        "core/studio/m.py::outer": 65,
        "core/studio/m.py::inner": 62,
    }


def test_new_offender_and_growth_fail():
    errors, stale = sizes.review({"a.py": 510, "b.py": 700}, {"b.py": 690}, None)
    assert len(errors) == 2 and not stale
    assert "a.py" in errors[0] and "new" in errors[0]
    assert "b.py" in errors[1] and "690" in errors[1]


def test_shrunk_or_fixed_entries_are_stale():
    errors, stale = sizes.review({"b.py": 650}, {"b.py": 700, "gone.py::f": 80}, None)
    assert not errors
    assert stale == ["b.py: 700 -> 650", "gone.py::f: 80 -> within budget"]


def test_baseline_may_not_grow_against_main():
    errors, _ = sizes.review({"b.py": 720, "c.py": 600}, {"b.py": 720, "c.py": 600}, {"b.py": 700})
    assert any("b.py" in e and "700" in e for e in errors)
    assert any("c.py" in e and "not in" in e for e in errors)


def test_tighten_keeps_only_held_or_shrunk_entries():
    old = {"b.py": 700, "gone.py::f": 80, "c.py": 600}
    assert sizes.tighten({"b.py": 650, "c.py": 610, "new.py": 900}, old) == {"b.py": 650, "c.py": 600}


def test_baseline_file_round_trip(tmp_path):
    path = tmp_path / "size_baseline.yaml"
    data = {"core/x.py": 600, "core/x.py::f": 70}
    sizes.save(path, data)
    doc = yaml.safe_load(path.read_text())
    assert doc["modules"] == {"core/x.py": 600} and doc["functions"] == {"core/x.py::f": 70}
    assert sizes.load(path) == data


def test_check_cli_on_a_tree(tmp_path, capsys):
    write(tmp_path, "core/studio/big.py", "\n" * 600)
    base = tmp_path / sizes.BASELINE
    assert sizes.main(["check"], root=tmp_path, main_baseline=None) == 1
    sizes.save(base, {"core/studio/big.py": 600})
    assert sizes.main(["check"], root=tmp_path, main_baseline=None) == 0
    write(tmp_path, "core/studio/big.py", "\n" * 550)
    assert sizes.main(["check"], root=tmp_path, main_baseline=None) == 1
    assert "python -m studio.sizes baseline" in capsys.readouterr().out
    assert sizes.main(["baseline"], root=tmp_path, main_baseline=None) == 0
    assert sizes.load(base) == {"core/studio/big.py": 550}


def test_repo_meets_its_baseline():
    root = Path(__file__).resolve().parents[3]
    errors, stale = sizes.review(sizes.measure(root), sizes.load(root / sizes.BASELINE), None)
    assert not errors and not stale, errors + stale


def test_ruff_is_pinned_to_one_version():
    root = Path(__file__).resolve().parents[3]
    lock = yaml.safe_load((root / "core/lock.yaml").read_text())["ruff"]["version"]
    dev = tomllib.loads((root / "pyproject.toml").read_text())["dependency-groups"]["dev"]
    uv_lock = re.search(r'name = "ruff"\nversion = "([^"]+)"', (root / "uv.lock").read_text()).group(1)
    make = re.search(r"uvx ruff@(\S+?)\)", (root / "Makefile").read_text()).group(1)
    assert f"ruff=={lock}" in dev and uv_lock == lock and make == lock
