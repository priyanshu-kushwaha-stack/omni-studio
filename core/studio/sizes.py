"""Size budgets for core/studio and core/engines: they block growth, not existing code.

    python -m studio.sizes check       fail when a module or function is over budget and not recorded, grew past its
                                       record, or shrank without its record being lowered (`make lint` runs this)
    python -m studio.sizes baseline    lower the records to today's sizes and drop the ones now within budget

A module may have MODULE_LIMIT lines and a function FUNCTION_LIMIT (def line to last line, decorators not counted).
Offenders on 2026-11-10 are recorded in BASELINE as `path` (module) or `path::Class.function`. A record may only
shrink: `check` also compares BASELINE with its copy at the merge base with origin/main, and fails on a new record or
a raised one. The only way to grow a recorded file is to split it.
"""

from __future__ import annotations

import argparse
import ast
import subprocess
import sys
from pathlib import Path
from typing import Optional

import yaml

MODULE_LIMIT = 500
FUNCTION_LIMIT = 60
ROOTS = ("core/studio", "core/engines")
SKIP_PARTS = {"node_modules", "__pycache__", ".venv"}
BASELINE = "core/studio/config/size_baseline.yaml"
MAIN = "origin/main"
FIX = "python -m studio.sizes baseline"


def _functions(tree: ast.AST) -> dict[str, int]:
    found: dict[str, int] = {}

    def walk(node: ast.AST, prefix: str) -> None:
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                name = prefix + child.name
                found[name] = max(found.get(name, 0), child.end_lineno - child.lineno + 1)
                walk(child, "")  # a nested function is named on its own, as `inner`
            elif isinstance(child, ast.ClassDef):
                walk(child, prefix + child.name + ".")
            else:
                walk(child, prefix)

    walk(tree, "")
    return found


def measure(root: Path) -> dict[str, int]:
    """Every module and function over budget under ROOTS, keyed `path` or `path::name`, with its line count."""
    out: dict[str, int] = {}
    for top in ROOTS:
        for f in sorted((root / top).rglob("*.py")):
            rel = f.relative_to(root).as_posix()
            if SKIP_PARTS & set(f.relative_to(root).parts):
                continue
            text = f.read_text(encoding="utf-8")
            if len(text.splitlines()) > MODULE_LIMIT:
                out[rel] = len(text.splitlines())
            for name, n in _functions(ast.parse(text, filename=rel)).items():
                if n > FUNCTION_LIMIT:
                    out[f"{rel}::{name}"] = n
    return out


def _limit(key: str) -> int:
    return FUNCTION_LIMIT if "::" in key else MODULE_LIMIT


def review(
    current: dict[str, int], baseline: dict[str, int], main: Optional[dict[str, int]]
) -> tuple[list[str], list[str]]:
    """(errors, stale). An error is growth; a stale record is one the code has shrunk below."""
    errors, stale = [], []
    for key, n in current.items():
        if key not in baseline:
            errors.append(f"{key}: {n} lines, over the {_limit(key)}-line budget (new). Split it.")
        elif n > baseline[key]:
            errors.append(f"{key}: {n} lines, grew past its recorded {baseline[key]}. Split it.")
    for key, n in baseline.items():
        if key not in current:
            stale.append(f"{key}: {n} -> within budget")
        elif current[key] < n:
            stale.append(f"{key}: {n} -> {current[key]}")
    for key, n in baseline.items() if main is not None else ():
        if key not in main:
            errors.append(f"{BASELINE}: {key} is not in {MAIN}'s baseline; records may not be added")
        elif n > main[key]:
            errors.append(f"{BASELINE}: {key} raised from {main[key]} to {n}; records may only shrink")
    return errors, stale


def tighten(current: dict[str, int], old: dict[str, int]) -> dict[str, int]:
    """Records that still hold, each lowered to today's size. Never adds a key or raises a value."""
    return {k: min(current[k], n) for k, n in old.items() if k in current}


def load(path: Path) -> dict[str, int]:
    return _flatten(yaml.safe_load(path.read_text())) if path.is_file() else {}


def _flatten(doc: Optional[dict]) -> dict[str, int]:
    doc = doc or {}
    return {**(doc.get("modules") or {}), **(doc.get("functions") or {})}


def save(path: Path, records: dict[str, int]) -> None:
    doc = {
        "modules": {k: v for k, v in sorted(records.items()) if "::" not in k},
        "functions": {k: v for k, v in sorted(records.items()) if "::" in k},
    }
    head = (
        f"# Size budget records (studio.sizes): modules over {MODULE_LIMIT} lines and functions over "
        f"{FUNCTION_LIMIT}\n# on 2026-11-10. A record may only shrink. Lower them with `{FIX}`.\n"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(head + yaml.safe_dump(doc, sort_keys=False))


def main_baseline(root: Path) -> Optional[dict[str, int]]:
    """BASELINE as of the merge base with origin/main, or None when there is no such commit or file."""
    mb = subprocess.run(["git", "merge-base", MAIN, "HEAD"], cwd=root, capture_output=True, text=True)
    if mb.returncode != 0:
        return None
    show = subprocess.run(["git", "show", f"{mb.stdout.strip()}:{BASELINE}"], cwd=root, capture_output=True, text=True)
    return _flatten(yaml.safe_load(show.stdout)) if show.returncode == 0 else None


def main(argv: Optional[list[str]] = None, *, root: Optional[Path] = None, main_baseline=main_baseline) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.sizes")
    p.add_argument("mode", choices=["check", "baseline"])
    args = p.parse_args(argv)
    root = root or Path(__file__).resolve().parents[2]
    path = root / BASELINE
    current, recorded = measure(root), load(path)
    if args.mode == "baseline":
        save(path, tighten(current, recorded))
        print(f"sizes: {path.relative_to(root)} lowered to today's sizes")
        return 0
    main_records = main_baseline(root) if callable(main_baseline) else main_baseline
    errors, stale = review(current, recorded, main_records)
    for line in errors:
        print(f"sizes: {line}")
    if stale:
        print(f"sizes: these records are higher than the code now; run `{FIX}` and commit {BASELINE}:")
        print("\n".join(f"  {line}" for line in stale))
    if not errors and not stale:
        print(f"sizes: ok ({len(recorded)} recorded offenders)")
    return 1 if errors or stale else 0


if __name__ == "__main__":
    sys.exit(main())
