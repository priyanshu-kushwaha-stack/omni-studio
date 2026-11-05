"""omni: the studio command line."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
CORE = ROOT / "core"
OPENMONTAGE = CORE / "openmontage"


def _command_output(*cmd: str) -> str:
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=10).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def _installed_remotion() -> str:
    package = OPENMONTAGE / "remotion-composer" / "node_modules" / "remotion" / "package.json"
    if not package.is_file():
        return "none (run npm ci in core/openmontage/remotion-composer)"
    return json.loads(package.read_text(encoding="utf-8"))["version"]


def _discover_tools() -> set[str]:
    sys.path.insert(0, str(OPENMONTAGE))
    from tools.tool_registry import registry

    registry.ensure_discovered()
    return set(registry.list_all())


def _denylist() -> list[str]:
    sys.path.insert(0, str(OPENMONTAGE))
    from tools.tool_registry import DISABLED_TOOLS

    return sorted(DISABLED_TOOLS)


def _child_telemetry_env() -> dict[str, str | None]:
    """What a HyperFrames child receives. Importing the tool sets these, whatever the shell had."""
    sys.path.insert(0, str(OPENMONTAGE))
    import tools.video.hyperframes_compose  # noqa: F401

    return {name: os.environ.get(name) for name in ("HYPERFRAMES_NO_TELEMETRY", "DISABLE_TELEMETRY")}


def status() -> int:
    lock = yaml.safe_load((CORE / "lock.yaml").read_text(encoding="utf-8"))
    denylist = _denylist()
    tools = _discover_tools()
    telemetry = _child_telemetry_env()
    leaked = sorted(set(denylist) & tools)
    secrets_dir = Path.home() / ".config" / "omni-studio"

    print(f"repo         {_command_output('git', '-C', str(ROOT), 'rev-parse', '--short', 'HEAD')} "
          f"on {_command_output('git', '-C', str(ROOT), 'branch', '--show-current')}")
    print(f"upstream     {lock['upstream']['commit'][:7]} ({lock['upstream']['repo']})")
    print(f"python       {sys.version.split()[0]}")
    print(f"node         {_command_output('node', '--version') or 'missing'}")
    print(f"ffmpeg       {shutil.which('ffmpeg') or 'missing'}")
    print(f"hyperframes  {lock['hyperframes']['version']} (locked)")
    print(f"remotion     {lock['remotion']['version']} (locked), installed: {_installed_remotion()}")
    print("telemetry    " + " ".join(f"{name}={value}" for name, value in telemetry.items()))
    print(f"tools        {len(tools)} discovered")
    print(f"disabled     {', '.join(denylist)}: {'LEAKED ' + ', '.join(leaked) if leaked else 'absent'}")
    print(f"secrets dir  {'present' if secrets_dir.is_dir() else 'missing'} ({secrets_dir})")
    return 1 if leaked else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="omni", description="omni-studio command line")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("status", help="show pins, runtimes and disabled tools")
    parser.parse_args(argv)
    return status()


if __name__ == "__main__":
    sys.exit(main())
