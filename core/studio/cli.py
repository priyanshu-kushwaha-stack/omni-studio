"""omni: the studio command line."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

import yaml

from studio import channels
from studio.channels import ChannelError

# Port 4750 is the owner's Backlot, and make's old default was 4760.
BOARD_PORTS = range(4761, 4800)

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
    return (1 if leaked else 0) | _print_channels()


def _print_channels() -> int:
    slugs = channels.list_slugs()
    print(f"channels     {len(slugs)}")
    failed = 0
    for slug in slugs:
        try:
            channel = channels.load_channel(slug)
        except ChannelError as exc:
            failed = 1
            print(f"  {slug}  INVALID (run omni check {slug}): {str(exc).splitlines()[-1].strip()}")
            continue
        config = channel.config
        videos = channels.video_summaries(channel)
        print(f"  {slug}  {config.status}  risk {config.risk_class}  "
              f"${config.budget_usd_per_video}/video  {len(videos)} video(s)  "
              f"board {_running_board_url(channel) or 'stopped'}")
        for video in videos:
            gates = ", ".join(video["awaiting"]) or "none"
            budget = video["budget_usd"]
            of_budget = f"of ${budget:.2f}" if budget is not None else "with no cost log"
            print(f"    {video['id']}  spent ${video['spent_usd']:.2f} {of_budget}  "
                  f"awaiting approval: {gates}")
    return failed


def _board_state_path(channel: channels.Channel) -> Path:
    return channel.dir / ".board.json"


def _board_is_up(port: int) -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=1.5) as resp:
            return resp.status == 200
    except (OSError, urllib.error.URLError):
        return False


def _running_board(channel: channels.Channel) -> dict | None:
    """The channel's board, if the process we started is still alive and answering."""
    path = _board_state_path(channel)
    if not path.is_file():
        return None
    state = json.loads(path.read_text(encoding="utf-8"))
    try:
        os.kill(state["pid"], 0)
    except OSError:
        return None
    return state if _board_is_up(state["port"]) else None


def _running_board_url(channel: channels.Channel) -> str | None:
    state = _running_board(channel)
    return f"http://127.0.0.1:{state['port']}/" if state else None


def _free_board_port() -> int:
    for port in BOARD_PORTS:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            if probe.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise ChannelError(f"No free board port in {BOARD_PORTS.start}-{BOARD_PORTS.stop - 1}")


def board(slug: str, *, stop: bool, open_browser: bool) -> int:
    """One Backlot server per channel, watching only that channel's videos."""
    channel = channels.load_channel(slug)
    state = _running_board(channel)
    if stop:
        if state:
            os.kill(state["pid"], signal.SIGTERM)
            print(f"board for {slug} stopped (pid {state['pid']})")
        else:
            print(f"board for {slug} is not running")
        _board_state_path(channel).unlink(missing_ok=True)
        return 0

    if state is None:
        channel.videos_dir.mkdir(exist_ok=True)
        port = _free_board_port()
        process = subprocess.Popen(
            [sys.executable, "-m", "backlot", "serve", "--port", str(port)],
            cwd=OPENMONTAGE,
            env={**os.environ, **channel.env, "PYTHONPATH": str(OPENMONTAGE)},
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        deadline = time.time() + 15
        while not _board_is_up(port):
            if process.poll() is not None or time.time() > deadline:
                process.terminate()
                raise ChannelError(f"The board for {slug} did not start on port {port}")
            time.sleep(0.2)
        state = {"pid": process.pid, "port": port}
        _board_state_path(channel).write_text(json.dumps(state), encoding="utf-8")

    url = f"http://127.0.0.1:{state['port']}/"
    print(f"board for {slug}: {url} (pid {state['pid']})")
    if open_browser:
        webbrowser.open(url)
    return 0


def new_channel(slug: str) -> int:
    channel = channels.create_channel(slug)
    print(f"created {channel.dir}")
    print(f"playbook {channels.custom_styles_dir() / (slug + '.yaml')} -> "
          f"../../../../channels/{slug}/playbook.yaml")
    print(f"next: edit {channel.dir / 'channel.yaml'}, then run omni check {slug}")
    return 0


def new_video(slug: str, title: str, format_name: str) -> int:
    channel = channels.load_channel(slug)
    project = channels.new_video(channel, title, format_name)
    print(f"created {project}")
    print(f"pipeline {channel.config.formats[format_name]}, "
          f"budget ${channel.config.budget_usd_per_video} (cap)")
    for name, value in channel.env.items():
        print(f"export {name}={value}")
    return 0


def approve(slug: str, video: str, stage: str, note: str | None) -> int:
    channel = channels.load_channel(slug)
    print(f"approved {slug}/{video} stage {stage}: {channels.approve_stage(channel, video, stage, note)}")
    return 0


def check(slug: str | None) -> int:
    slugs = [slug] if slug else channels.list_slugs()
    if not slugs:
        print("no channels to check")
        return 0
    failed = 0
    for name in slugs:
        try:
            channels.load_channel(name)
            print(f"{name}: ok")
        except ChannelError as exc:
            failed = 1
            print(f"{name}: FAILED\n{exc}")
    return failed


def fix(slug: str, format_name: str, stage: str, severity: str, example: str, note: str | None) -> int:
    channel = channels.load_channel(slug)
    print(f"recorded {channels.record_issue(channel, format_name, stage, severity, example, note)}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="omni", description="omni-studio command line")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("status", help="show pins, runtimes, disabled tools and every channel")

    sub = commands.add_parser("new-channel", help="scaffold channels/<slug>/ from the template")
    sub.add_argument("slug")

    sub = commands.add_parser("new-video", help="create channels/<slug>/videos/<date_slug>/")
    sub.add_argument("channel")
    sub.add_argument("title")
    sub.add_argument("--format", required=True, dest="format_name")

    sub = commands.add_parser("board", help="start or open one channel's Backlot board")
    sub.add_argument("channel")
    sub.add_argument("--no-open", action="store_true", help="do not open a browser")
    sub.add_argument("--stop", action="store_true", help="stop this channel's board")

    sub = commands.add_parser("approve", help="pass a gate. Only the owner does this")
    sub.add_argument("channel")
    sub.add_argument("video")
    sub.add_argument("stage")
    sub.add_argument("--note")

    sub = commands.add_parser("check", help="validate one channel, or all of them")
    sub.add_argument("channel", nargs="?")

    sub = commands.add_parser("fix", help="record a note in core/studio/issues/")
    sub.add_argument("channel")
    sub.add_argument("--format", required=True, dest="format_name")
    sub.add_argument("--stage", required=True)
    sub.add_argument("--severity", required=True, choices=channels.SEVERITIES)
    sub.add_argument("--example", required=True)
    sub.add_argument("--note")

    args = parser.parse_args(argv)
    try:
        if args.command == "status":
            return status()
        if args.command == "new-channel":
            return new_channel(args.slug)
        if args.command == "new-video":
            return new_video(args.channel, args.title, args.format_name)
        if args.command == "board":
            return board(args.channel, stop=args.stop, open_browser=not args.no_open)
        if args.command == "approve":
            return approve(args.channel, args.video, args.stage, args.note)
        if args.command == "check":
            return check(args.channel)
        return fix(args.channel, args.format_name, args.stage, args.severity, args.example, args.note)
    except ChannelError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
