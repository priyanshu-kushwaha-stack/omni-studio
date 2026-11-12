"""python -m studio.room: the room's tools for the studio-room skill. A2 puts `omni room` on top of this.

Every subcommand but `times` (a video folder) and `scorecard` (the channel) takes a video folder and a gate (g1 or g2). Exit codes: 0 ok, 1 checks failed, 2 usage error.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

from studio.room import owner_notes
from studio.room import report as R
from studio.room import times as T
from studio.room.call import CallContext, is_secret_path, run_seat
from studio.room.config import (
    SEATS_DIR,
    RoomConfigError,
    load_room,
    required_roles,
    seat_slug,
    validate,
)
from studio.room.evidence import verify
from studio.room.judge import run_judge
from studio.room.ledger import CapReached, Ledger
from studio.room.lint import lint_draft
from studio.room.models import family_of
from studio.room.snapshot import load_draft, save_draft


_slug = seat_slug


def _default_kind(gate: str, kind: Optional[str]) -> str:
    return kind or ("packaging" if gate == "g1" else "script")


def _video(args) -> Path:
    return Path(args.video_dir).resolve()


def _video_in(args, cfg) -> Optional[Path]:
    """The video folder, resolved (symlinks followed), only when it is inside the channel's videos folder."""
    video, root = _video(args), (Path(cfg.channel_dir) / "videos").resolve()
    if video == root or not video.is_relative_to(root):
        print(
            f"video folder {args.video_dir} is not inside {root}; room files live under channels/<slug>/videos/",
            file=sys.stderr,
        )
        return None
    return video


def _problems(cfg) -> int:
    problems = validate(cfg)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 2
    return 0


def _ctx(args, cfg, rnd: int) -> CallContext:
    channel = args.channel or Path(args.config).resolve().parent.name
    video = _video(args)
    return CallContext(channel, video.name, args.gate, rnd, cfg.daily_cap, owner_notes.gate_cap(cfg, video, args.gate))


def _meta(video: Path, gate: str, n: int) -> Optional[dict]:
    try:
        return R.read_meta(video, gate, n)
    except FileNotFoundError:
        return None


def _channel(args) -> str:
    return args.channel or Path(args.config).resolve().parent.name


def _reviewed(args, video: Path) -> bool:
    """A round is reviewed once it has a verdict or judge file, or any call row at all (deleting files re-opens nothing)."""
    files = any(f.name != "meta.json" for f in R.round_dir(video, args.gate, args.round).glob("*.json"))
    return files or Ledger().count(channel=_channel(args), video=video.name, gate=args.gate, round=args.round) > 0


def _confined(path: str, cfg, label: str) -> bool:
    """Only files inside the channel folder (symlinks resolved) go into a prompt or become a draft: never a secret,
    never another video's room verdicts. Prints the reason and returns False otherwise."""
    p = Path(path)
    if is_secret_path(p):
        print(f"{label}: {path} is in a secrets folder and is never read into a prompt", file=sys.stderr)
        return False
    real, root = p.expanduser().resolve(), Path(cfg.channel_dir).resolve()
    if not real.is_relative_to(root):
        print(f"{label}: {path} is outside the channel folder {root}; only channel files are read", file=sys.stderr)
        return False
    parts = [part.casefold() for part in real.relative_to(root).parts]  # macOS volumes ignore case
    if len(parts) >= 3 and parts[0] == "videos" and parts[2] == "room":
        print(f"{label}: {path} is inside a videos/*/room folder (other verdicts) and is never read", file=sys.stderr)
        return False
    return True


def _read_inputs(items: Optional[list[str]], cfg, reserved: tuple[str, ...] = ("draft",)) -> Optional[dict[str, str]]:
    """NAME=PATH inputs for a prompt. None after printing the reason (exit 2). Only channel files; never secrets."""
    inputs: dict[str, str] = {}
    for item in items or []:
        name, eq, path = item.partition("=")
        if not eq or not name or not path:
            print(f"--input wants NAME=PATH, not {item!r}", file=sys.stderr)
            return None
        if name in reserved:
            print(
                "draft comes from the round's snapshot" if name == "draft" else f"--input name {name!r} is reserved",
                file=sys.stderr,
            )
            return None
        if not _confined(path, cfg, f"--input {name}"):
            return None
        if not Path(path).is_file():
            print(f"--input {name}: no such file {path}", file=sys.stderr)
            return None
        inputs[name] = Path(path).read_text(encoding="utf-8")
    return inputs


def _owner_note_problems(args, cfg, video: Path) -> bool:
    """True (and printed) when --owner-note can't register: it needs --owner-notes and a new taste.md quote."""
    if not args.owner_note:
        return False
    if not args.owner_notes:
        print("--owner-note goes only with --owner-notes", file=sys.stderr)
        return True
    problems = owner_notes.problems(args.owner_note, cfg.channel_dir, video, args.gate, args.round)
    if problems:
        print("\n".join(problems), file=sys.stderr)
    return bool(problems)


def cmd_lint(args) -> int:
    cfg = load_room(Path(args.config))
    video = _video_in(args, cfg)
    if video is None:
        return 2
    if args.kind and args.kind != _default_kind(args.gate, None):
        print(
            f"--kind {args.kind} does not fit {args.gate}: {args.gate} reviews a {_default_kind(args.gate, None)}",
            file=sys.stderr,
        )
        return 2
    if not args.owner_notes and args.round > cfg.rounds:
        print(
            f"round {args.round} is above the room's limit of {cfg.rounds} rounds; ship the best candidate or "
            "take owner notes (--owner-notes)",
            file=sys.stderr,
        )
        return 2
    if _reviewed(args, video):
        print(f"round {args.round} has been reviewed; start round {args.round + 1}", file=sys.stderr)
        return 2
    if _owner_note_problems(args, cfg, video):
        return 2
    if not _confined(args.draft, cfg, "--draft") or (
        args.ledger_file and not _confined(args.ledger_file, cfg, "--ledger-file")
    ):
        return 2
    sha = save_draft(video, Path(args.draft))
    if args.ledger_file:
        ledger_file: Optional[Path] = Path(args.ledger_file)  # asked for explicitly: missing fails the lint
    else:
        default = Path(args.draft).parent / "claims.md"
        ledger_file = default if default.is_file() else None
    kind = _default_kind(args.gate, args.kind)
    rep = lint_draft(
        Path(args.draft),
        kind=kind,
        fmt=cfg.format,
        linters=cfg.linters,
        ledger=ledger_file,
        channel_dir=cfg.channel_dir,
    )
    R.write_meta(
        video,
        args.gate,
        args.round,
        sha,
        rep.as_dict(),
        owner_notes=args.owner_notes,
        kind=kind,
        owner_note=owner_notes.normalise(args.owner_note or []),
    )
    print(json.dumps({"round": args.round, "draft_sha256": sha, **rep.as_dict()}, indent=2))
    return 0 if rep.ok else 1


def _round_ready(args, cfg, video: Path) -> Optional[dict]:
    """The round's meta when a seat may run: linted, and under owner_first round 1's draft already shown to the owner."""
    meta = _meta(video, args.gate, args.round)
    if meta is None:
        print(f"run lint for round {args.round} first", file=sys.stderr)
        return None
    presented = R.read_presented(video, args.gate) or {}
    if cfg.owner_first and args.round == 1 and presented.get("draft_sha256") != meta["draft_sha256"]:
        print(
            "owner first: show round 1's draft to the owner, then run `python -m studio.room present "
            f"{args.video_dir} {args.gate} --config {args.config}` before any seat",
            file=sys.stderr,
        )
        return None
    return meta


def cmd_present(args) -> int:
    """Record that round 1's linted draft went to the owner; under owner_first the round-1 seats wait for this."""
    cfg = load_room(Path(args.config))
    video = _video_in(args, cfg)
    if video is None:
        return 2
    meta = _meta(video, args.gate, 1)
    if meta is None or not (meta.get("lint") or {}).get("ok"):
        print("lint round 1 clean first: the owner reads a draft that passed lint (and omni qc at G2)", file=sys.stderr)
        return 2
    record = {"draft_sha256": meta["draft_sha256"], "at": R.now_iso()}
    R.presented_path(video, args.gate).write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"presented": record["draft_sha256"], "at": record["at"]}))
    return 0


def cmd_seat(args) -> int:
    cfg = load_room(Path(args.config))
    if _problems(cfg):
        return 2
    video = _video_in(args, cfg)
    if video is None:
        return 2
    meta = _round_ready(args, cfg, video)
    if meta is None:
        return 2
    seat = next((s for s in cfg.seats if s.name == args.seat), None)
    if seat is None:
        print(f"no seat {args.seat!r} in {args.config}", file=sys.stderr)
        return 2
    lint_ok = bool((meta.get("lint") or {}).get("ok"))
    if not lint_ok and not args.allow_failed_lint:
        print(
            f"round {args.round}: lint failed; fix the draft and lint again (--allow-failed-lint is for "
            "calibration only)",
            file=sys.stderr,
        )
        return 2
    out = R.round_dir(video, args.gate, args.round) / f"{_slug(seat.name)}.json"
    try:
        prior = json.loads(out.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        prior = None
    if isinstance(prior, dict) and prior.get("status") == "ok":
        print(
            f"seat {seat.name!r} already has an ok verdict in round {args.round}; a re-run is allowed only "
            "after a failed one",
            file=sys.stderr,
        )
        return 2
    if (
        Ledger().count(
            channel=_channel(args), video=video.name, gate=args.gate, round=args.round, seat=seat.name, status="ok"
        )
        > 0
    ):
        print(
            f"seat {seat.name!r} already has an ok call in round {args.round}; deleting its verdict file does "
            "not buy a second opinion",
            file=sys.stderr,
        )
        return 2
    extra = _read_inputs(args.input, cfg)
    if extra is None:
        return 2
    inputs = {"draft": load_draft(video, meta["draft_sha256"]), **extra}
    try:
        v = run_seat(
            seat,
            inputs=inputs,
            ledger=Ledger(),
            ctx=_ctx(args, cfg, args.round),
            out=out,
            raw_dir=video / "room" / "raw",
            draft_sha256=meta["draft_sha256"],
            lint_overridden=not lint_ok,
        )
    except CapReached as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps({"seat": v.seat, "status": v.status, "blockers": len(v.blockers), "error": v.error}))
    return 0 if v.status == "ok" else 1


def cmd_judge(args) -> int:
    cfg = load_room(Path(args.config))
    if _problems(cfg):
        return 2
    if cfg.judge is None:
        print(json.dumps({"judged": False, "why": "no judge in room.yaml"}))
        return 0
    video = _video_in(args, cfg)
    if video is None:
        return 2
    rounds = R.load_rounds(video, args.gate)
    current = next((r for r in rounds if r["round"] == args.round), None)
    if current is None:
        print(f"round {args.round} has no files", file=sys.stderr)
        return 2
    inputs = _read_inputs(args.input, cfg, reserved=("draft",))
    if inputs is None:
        return 2
    required = required_roles(cfg)
    best = R.best_before(rounds, args.round, required)
    if best is None or not R.is_candidate(current, required):
        print(json.dumps({"judged": False, "why": "fewer than two candidates"}))
        return 0
    if (R.round_dir(video, args.gate, args.round) / "judge.json").exists() or Ledger().count(
        channel=_channel(args), video=video.name, gate=args.gate, round=args.round, seat="judge", status="ok"
    ) > 0:
        print(
            f"round {args.round} has already been judged; a judge runs once per round (start the next round)",
            file=sys.stderr,
        )
        return 2
    try:
        res = run_judge(
            load_draft(video, current["draft_sha256"]),
            load_draft(video, best["draft_sha256"]),
            model=cfg.judge,
            brief=(SEATS_DIR / "judge.md").read_text(encoding="utf-8"),
            ledger=Ledger(),
            ctx=_ctx(args, cfg, args.round),
            out=R.round_dir(video, args.gate, args.round) / "judge.json",
            inputs=inputs,
        )
    except CapReached as exc:
        print(str(exc), file=sys.stderr)
        return 1
    if res["winner"] is None:
        print(
            f"the judge failed ({res['statuses']}); round {args.round} is unjudged and the earlier draft stays "
            "best. Run the judge again in a new round or stop.",
            file=sys.stderr,
        )
        return 1
    print(json.dumps({"judged": True, "winner": res["winner"], "picks": res["picks"]}))
    return 0


def cmd_report(args) -> int:
    cfg = load_room(Path(args.config))
    if _problems(cfg):
        return 2
    video = _video_in(args, cfg)
    if video is None:
        return 2
    channel = args.channel or Path(args.config).resolve().parent.name
    rep = R.build_report(
        video,
        gate=args.gate,
        stage=args.stage,
        channel=channel,
        writer_family=family_of(cfg.writer),
        writer=cfg.writer,
        ledger=Ledger(),
        cap=owner_notes.gate_cap(cfg, video, args.gate),
        required=required_roles(cfg),
    )
    js, md = R.write_report(video, rep)
    print(f"{js}\n{md}")
    return 0


def cmd_verify(args) -> int:
    video = _video(args)
    if video.parent.name != "videos" or not (video / "room").is_dir():
        print(f"{video} is not a videos/<id> folder with a room/ folder")
        return 1
    try:
        rep = json.loads((video / "room" / f"{args.gate}.json").read_text(encoding="utf-8"))
        problems = verify(video, rep, Path(args.artifact), Ledger())
    except (OSError, ValueError) as exc:
        problems = [f"room/{args.gate}.json cannot be read: {exc}"]
    print("\n".join(problems) if problems else "room evidence ok")
    return 1 if problems else 0


def cmd_times(args) -> int:
    cfg = load_room(Path(args.config))
    video = _video_in(args, cfg)
    if video is None:
        return 2
    print(T.render_times(T.gate_times(video, Ledger(), _channel(args))), end="")
    return 0


def cmd_scorecard(args) -> int:
    cfg = load_room(Path(args.config))
    print(T.render_scorecard(T.scorecard(Path(cfg.channel_dir))), end="")
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="python -m studio.room")
    sub = p.add_subparsers(dest="cmd", required=True)

    def common(sp, config=True):
        sp.add_argument("video_dir")
        sp.add_argument("gate", choices=["g1", "g2"])
        sp.add_argument("--channel")
        if config:
            sp.add_argument("--config", required=True)

    s = sub.add_parser("lint")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.add_argument("--draft", required=True)
    s.add_argument("--kind", choices=["script", "packaging"])
    s.add_argument("--ledger-file")
    s.add_argument("--owner-notes", action="store_true")
    s.add_argument("--owner-note", action="append", help="the owner's words from taste.md; adds rounds to the gate cap")
    s.set_defaults(fn=cmd_lint)
    s = sub.add_parser("present")
    common(s)
    s.set_defaults(fn=cmd_present)
    s = sub.add_parser("seat")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.add_argument("--seat", required=True)
    s.add_argument("--input", action="append")
    s.add_argument("--allow-failed-lint", action="store_true", help="calibration only")
    s.set_defaults(fn=cmd_seat)
    s = sub.add_parser("judge")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.add_argument("--input", action="append")
    s.set_defaults(fn=cmd_judge)
    s = sub.add_parser("report")
    common(s)
    s.add_argument("--stage", required=True)
    s.set_defaults(fn=cmd_report)
    s = sub.add_parser("times")
    s.add_argument("video_dir")
    s.add_argument("--channel")
    s.add_argument("--config", required=True)
    s.set_defaults(fn=cmd_times)
    s = sub.add_parser("scorecard")
    s.add_argument("--config", required=True)
    s.set_defaults(fn=cmd_scorecard)
    s = sub.add_parser("verify")
    common(s, config=False)
    s.add_argument("--artifact", required=True)
    s.set_defaults(fn=cmd_verify)
    args = p.parse_args(argv)
    try:
        return args.fn(args)
    except (RoomConfigError, FileNotFoundError, json.JSONDecodeError, ValueError) as exc:
        print(f"{args.cmd}: {exc}", file=sys.stderr)
        return 1 if args.cmd == "verify" else 2


if __name__ == "__main__":
    sys.exit(main())
