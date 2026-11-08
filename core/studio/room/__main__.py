"""python -m studio.room: the room's tools for the studio-room skill. A2 puts `omni room` on top of this.

Every subcommand takes a video folder and a gate (g1 or g2). Exit codes: 0 ok, 1 checks failed, 2 usage error.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

from studio.room import report as R
from studio.room.call import CallContext, run_seat
from studio.room.config import SEATS_DIR, derived_cap, load_room, validate
from studio.room.evidence import verify
from studio.room.judge import run_judge
from studio.room.ledger import CapReached, Ledger
from studio.room.lint import lint_draft
from studio.room.models import family_of
from studio.room.snapshot import load_draft, save_draft


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _ctx(args, cfg, rnd: int) -> CallContext:
    channel = args.channel or Path(args.config).resolve().parent.name
    return CallContext(channel, Path(args.video_dir).name, args.gate, rnd, cfg.daily_cap, derived_cap(cfg))


def _meta(video: Path, gate: str, n: int) -> Optional[dict]:
    try:
        return R.read_meta(video, gate, n)
    except FileNotFoundError:
        return None


def cmd_lint(args) -> int:
    cfg = load_room(Path(args.config))
    video = Path(args.video_dir)
    sha = save_draft(video, Path(args.draft))
    if args.ledger_file:
        ledger_file: Optional[Path] = Path(args.ledger_file)  # asked for explicitly: missing fails the lint
    else:
        default = Path(args.draft).parent / "claims.md"
        ledger_file = default if default.is_file() else None
    rep = lint_draft(Path(args.draft), kind=args.kind, fmt=cfg.format, linters=cfg.linters, ledger=ledger_file)
    R.write_meta(video, args.gate, args.round, sha, rep.as_dict())
    print(json.dumps({"round": args.round, "draft_sha256": sha, **rep.as_dict()}, indent=2))
    return 0 if rep.ok else 1


def cmd_seat(args) -> int:
    cfg = load_room(Path(args.config))
    video = Path(args.video_dir)
    meta = _meta(video, args.gate, args.round)
    if meta is None:
        print(f"run lint for round {args.round} first", file=sys.stderr)
        return 2
    seat = next((s for s in cfg.seats if s.name == args.seat), None)
    if seat is None:
        print(f"no seat {args.seat!r} in {args.config}", file=sys.stderr)
        return 2
    inputs = {"draft": load_draft(video, meta["draft_sha256"])}
    for item in args.input or []:
        name, _, path = item.partition("=")
        inputs[name] = Path(path).read_text(encoding="utf-8")
    out = R.round_dir(video, args.gate, args.round) / f"{_slug(seat.name)}.json"
    try:
        v = run_seat(seat, inputs=inputs, ledger=Ledger(), ctx=_ctx(args, cfg, args.round), out=out,
                     raw_dir=video / "room" / "raw")
    except CapReached as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps({"seat": v.seat, "status": v.status, "blockers": len(v.blockers), "error": v.error}))
    return 0 if v.status == "ok" else 1


def cmd_judge(args) -> int:
    cfg = load_room(Path(args.config))
    video = Path(args.video_dir)
    rounds = R.load_rounds(video, args.gate)
    current = next((r for r in rounds if r["round"] == args.round), None)
    if current is None:
        print(f"round {args.round} has no files", file=sys.stderr)
        return 2
    best = R.best_before(rounds, args.round)
    if best is None or not R.is_candidate(current):
        print(json.dumps({"judged": False, "why": "fewer than two candidates"}))
        return 0
    try:
        res = run_judge(load_draft(video, current["draft_sha256"]), load_draft(video, best["draft_sha256"]),
                        model=cfg.judge, brief=(SEATS_DIR / "judge.md").read_text(encoding="utf-8"),
                        ledger=Ledger(), ctx=_ctx(args, cfg, args.round),
                        out=R.round_dir(video, args.gate, args.round) / "judge.json")
    except CapReached as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps({"judged": True, "winner": res["winner"], "picks": res["picks"]}))
    return 0


def cmd_report(args) -> int:
    cfg = load_room(Path(args.config))
    problems = validate(cfg)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 2
    video = Path(args.video_dir)
    channel = args.channel or Path(args.config).resolve().parent.name
    rep = R.build_report(video, gate=args.gate, stage=args.stage, channel=channel,
                         writer_family=family_of(cfg.writer), ledger=Ledger(), cap=derived_cap(cfg))
    js, md = R.write_report(video, rep)
    print(f"{js}\n{md}")
    return 0


def cmd_verify(args) -> int:
    video = Path(args.video_dir)
    rep = json.loads((video / "room" / f"{args.gate}.json").read_text())
    problems = verify(video, rep, Path(args.artifact), Ledger())
    print("\n".join(problems) if problems else "room evidence ok")
    return 1 if problems else 0


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
    s.add_argument("--kind", choices=["script", "packaging"], default="script")
    s.add_argument("--ledger-file")
    s.set_defaults(fn=cmd_lint)
    s = sub.add_parser("seat")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.add_argument("--seat", required=True)
    s.add_argument("--input", action="append")
    s.set_defaults(fn=cmd_seat)
    s = sub.add_parser("judge")
    common(s)
    s.add_argument("--round", type=int, required=True)
    s.set_defaults(fn=cmd_judge)
    s = sub.add_parser("report")
    common(s)
    s.add_argument("--stage", required=True)
    s.set_defaults(fn=cmd_report)
    s = sub.add_parser("verify")
    common(s, config=False)
    s.add_argument("--artifact", required=True)
    s.set_defaults(fn=cmd_verify)
    args = p.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
