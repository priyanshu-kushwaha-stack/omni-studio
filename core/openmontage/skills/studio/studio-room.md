# studio-room: the quality room (G1 packaging, G2 script)

omni-studio skill. Every new video on every channel goes through this loop before the owner sees packaging (G1) or
the script (G2). Spec: `docs/superpowers/specs/2026-11-08-quality-spine-design.md`. Channel settings:
`channels/<slug>/room.yaml`. Paths below are from the omni-studio root.

Set up once per shell:

    export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1
    PY=.venv/bin/python          # in a worktree: ~/Exploration/projects/omni-studio/.venv/bin/python
    V=channels/<slug>/videos/<id>; CFG=channels/<slug>/room.yaml; G=g2   # g1 for packaging

In every command below, `python` means `$PY` (the interpreter above), run from the omni-studio root.

Exit codes of every `python -m studio.room` command: 0 ok, 1 checks failed, 2 usage or config error (read stderr).
`seat` and `judge` validate `room.yaml` first and exit 2 if it is invalid.

## Each round N (start at 1; stop at `rounds` in room.yaml)

1. **Lint.** `python -m studio.room lint $V $G --round N --draft $V/script.md --config $CFG`
   (G1: `--draft $V/packaging.md`; `--kind` defaults to packaging for g1 and script for g2). If it exits 1, fix every
   problem in the draft and run lint again for the same round before any seat runs. Once any seat or judge file
   exists in the round, lint refuses a changed draft (exit 2): start round N+1 instead.
2. **Seats.** For every seat in room.yaml, in parallel:
   `python -m studio.room seat $V $G --round N --seat "<name>" --config $CFG --input audience.md=channels/<slug>/audience.md --input style.md=channels/<slug>/style.md --input claims.md=$V/claims.md`
   (add `cast.md`, `taste.md`, `packaging.md` where the seat needs them). The draft comes from the round's
   snapshot; do not pass `--input draft=...` (refused). Never pass one seat's output to another.
3. **Judge.** `python -m studio.room judge $V $G --round N --config $CFG`. It only runs when this round's draft and an
   earlier one are both candidates (lint passed, fact seat clean).
4. **Stop?** Stop when every seat returned ok with no blockers, or N equals `rounds`.
5. **Merge and revise.** Read the verdict files in `$V/room/$G/round-N/`. Build one edit list: drop any note that
   does not quote a line and give a fix, except fact blockers, which always stay. Precedence: CLAUDE.md and the gates,
   then fact blockers, then the newest dated owner note in `taste.md`, then the channel's rules, then the shared
   rules. Keep lines are protected unless a fact blocker rests on them. The writer applies the list to the draft
   file. Never invent a source or number; a missing source goes back to research. Write
   `$V/review-$G-round<N>.md`: each note, its seat, applied or not and why. Then round N+1.

## Finish

1. `python -m studio.room report $V $G --stage <stage> --config $CFG` writes `$V/room/$G.json` and `$V/room-$G.md`.
   The shipped draft is the best candidate, which is not always the latest. If it is an earlier round, restore the
   draft file from `$V/room/drafts/<sha>.md`.
2. `python -m studio.room verify $V $G --artifact <the draft file>` must print `room evidence ok` and exit 0; it exits
   1 and lists problems otherwise. Fix the cause (never the room files) before presenting.
3. Present to the owner: the draft, `room-$G.md` (flagged, changed, still disputed), the claims ledger.
   Write the checkpoint with `status: awaiting_human` and stop.

## Owner notes

The owner's notes at the gate are applied to the draft, added to `channels/<slug>/taste.md` (dated, newest first),
and one more round runs on the edited file (lint and every seat). Then report and verify again before re-presenting.

## Never

- Never write, edit or delete anything under `$V/room/` by hand. Only the room tools write there.
- Never skip a mandatory seat, pass a gate, run `omni approve`, read `~/.config/omni-studio/`, or call a paid
  provider.
