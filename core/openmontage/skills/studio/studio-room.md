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
`seat`, `judge` and `report` validate `room.yaml` first and exit 2 if it is invalid. `seat` also exits 1 for a failed seat (a failed verdict) or when the call cap is
reached (`CapReached`).

## Each round N (start at 1; stop at `rounds` in room.yaml)

1. **Lint.** `python -m studio.room lint $V $G --round N --draft $V/script.md --config $CFG`
   (G1: `--draft $V/packaging.md`; `--kind` defaults to packaging for g1 and script for g2). If it exits 1, fix every
   problem in the draft and run lint again for the same round before any seat runs. Once the round has any seat or
   judge file, or any call reserved in the ledger, lint refuses every re-lint of it, the same draft and
   `--owner-notes` included (exit 2, "round N has been reviewed; start round N+1"). `--kind` must fit the gate (g1
   packaging, g2 script), or it exits 2.
2. **Seats.** For every seat in room.yaml, in parallel:
   `python -m studio.room seat $V $G --round N --seat "<name>" --config $CFG --input <file>=<path> ...`
   Inputs by gate (channel files are in `channels/<slug>/`, video files in `$V`):
   - G1 seats: `audience.md`, `style.md`, `taste.md` and `cast.md` (channel folder). `packaging.md` is the draft at G1
     (it comes from the round's snapshot), so it is not an input.
   - G2 seats: the same, plus `claims.md` and `packaging.md` (the approved packaging) from the video folder.
   By seat role: viewer needs `audience.md`; story needs `style.md`, `cast.md` and `packaging.md`; fact needs
   `claims.md`. Pass a file only if it exists. The command exits 2 on a missing file, so ask the owner for the missing
   channel file (`audience.md`, `taste.md`) or leave an empty stub, or drop the input; never invent its contents. It
   also exits 2 for a file under a secrets folder (`~/.config/omni-studio`, `~/.ssh`, `~/.aws` and the like; repo
   files are fine). A seat is refused (exit 2) when its verdict in this round is already `ok`, and when the round's
   lint failed; `--allow-failed-lint` overrides the second and is for calibration only, never for a real video (the
   verdict records `lint_overridden`). The draft comes from the round's
   snapshot; do not pass `--input draft=...` (refused). Never pass one seat's output to another.
   A seat that exits 1 with a failed verdict may be re-run in the same round (once is the budget). `CapReached` means stop.
3. **Judge.** `python -m studio.room judge $V $G --round N --config $CFG --input <file>=<path> ...` with the same
   channel files as the seats (the judge brief reads `audience.md` and the claims). It only runs when this round's
   draft and an earlier one are both candidates. A candidate is a round whose lint passed, with an ok viewer, story and
   fact verdict and no fact blocker.
4. **Stop?** Stop when every seat returned ok with no blockers, or N equals `rounds`.
5. **Merge and revise.** Read the verdict files in `$V/room/$G/round-N/`. Build one edit list: drop any note that
   does not quote a line and give a fix, except fact blockers, which always stay. Precedence: CLAUDE.md and the gates,
   then fact blockers, then the newest dated owner note in `taste.md`, then the channel's rules, then the shared
   rules. Keep lines are protected unless a fact blocker rests on them. The writer applies the list to the draft
   file. Never invent a source or number; a missing source goes back to research. Write
   `$V/review-$G-round<N>.md`: each note, its seat, applied or not and why. Then round N+1.

## Stop without shipping

If the call cap is reached, or no round is a candidate at the round cap, stop. Report to the owner with
`$V/room-$G.md` (run `report` first) and do NOT write `awaiting_human`.

## Finish

1. `python -m studio.room report $V $G --stage <stage> --config $CFG` writes `$V/room/$G.json` and `$V/room-$G.md`.
   The shipped draft is the best candidate, which is not always the latest. Read `shipped.round` and
   `shipped.artifact_sha256` from `$V/room/$G.json`; if the draft differs from the working file, restore it from
   `$V/room/drafts/<sha>.md` (ordinary rounds only; never after an owner-notes round).
2. `python -m studio.room verify $V $G --artifact <the draft file>` must print `room evidence ok` and exit 0; it exits
   1 and lists problems otherwise. Fix the cause (never the room files) before presenting.
3. Present to the owner: the draft, `room-$G.md` (flagged, changed, still disputed), the claims ledger.
   Write the checkpoint with `status: awaiting_human` and stop.

## Owner notes

Owner notes outrank the room. At a gate, the owner gives notes:

1. The writer applies the notes to the draft and adds them to `channels/<slug>/taste.md` (dated, newest first).
2. Run the NEXT round number with `python -m studio.room lint $V $G --round N --draft <draft> --config $CFG --owner-notes`.
3. Run the mandatory seats only (viewer, story, fact), not the optional seats, to stay within the cap.
4. Then `report` and `verify`. No judge: an owner-notes round that is a candidate ships.
5. If that round is not a candidate (lint failure, failed mandatory seat, fact blocker), fix the draft and run another
   owner-notes round. If the fix would contradict an owner note, stop and present the conflict to the owner.
   Never restore an earlier draft over the owner's notes.

## Never

- Never write, edit or delete anything under `$V/room/` by hand. Only the room tools write there.
- Never skip a mandatory seat, pass a gate, run `omni approve`, read `~/.config/omni-studio/`, or call a paid
  provider.
