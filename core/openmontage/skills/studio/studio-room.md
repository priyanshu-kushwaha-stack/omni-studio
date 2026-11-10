# studio-room: the quality room (G1 packaging, G2 script)

omni-studio skill. Every new video on every channel goes through this loop before the owner sees packaging (G1) or
the script (G2). Spec: `docs/superpowers/specs/2026-11-08-quality-spine-design.md`. Channel settings:
`channels/<slug>/room.yaml`. Paths below are from the omni-studio root.

**The writer.** `writer` in `room.yaml` writes the draft (Say Suppose: Claude Fable 5.1). Run the video's G1/G2
session on that model. A session on another model drafts through it, with tools off and the script skill's rules and
inputs in the prompt: `claude -p --tools "" --model <writer> "<rules and inputs>"`; the session still does the
research, the claims ledger, the lint and every revision round. Say in `review-g2-round1.md` which model wrote the draft.

Set up once per shell:

    export PYTHONPATH="$PWD/core/openmontage:$PWD/core" PYTHONDONTWRITEBYTECODE=1
    PY=.venv/bin/python          # in a worktree: ~/Exploration/projects/omni-studio/.venv/bin/python
    V=channels/<slug>/videos/<id>; CFG=channels/<slug>/room.yaml; G=g2   # g1 for packaging

In every command below, `python` means `$PY` (the interpreter above), run from the omni-studio root.

Exit codes of every `python -m studio.room` command: 0 ok, 1 checks failed, 2 usage or config error (read stderr).
`seat`, `judge` and `report` validate `room.yaml` first and exit 2 if it is invalid. `seat` also exits 1 for a failed seat (a failed verdict) or when the call cap is
reached (`CapReached`).

## Before round 1 (owner, 2026-11-10: "I was waiting to provide my feedback for so long")

1. **Check the set-up once, at the start, not when a step fails.** In a worktree: link the venv
   (`ln -s ~/Exploration/projects/omni-studio/.venv .venv`; the pre-push hook runs `make test` with it), run
   `python -m studio.cli link`, and run `pnpm install --frozen-lockfile` in `core/engines/whatif`.
2. **Check today's call budget** before writing anything:
   `sqlite3 ~/.local/state/omni-studio/room/ledger.sqlite "select count(*) from calls where substr(at,1,10)=date('now')"`
   (UTC day). If what's left is less than one script's cap, ask the owner then, not hours later.
3. **The owner sees the draft first.** See the next section: show the draft once it passes lint (and `omni qc`
   at G2), record it with `present`, and run the room beside the owner's read.
4. **Don't wait on a timed-out seat.** A seat that exits 124 has used its whole timeout (`timeout_s` in
   `models.yaml`). Note it and go on with the other seats' notes; spend its one re-run only when the round could
   otherwise ship. The viewer is not required for a round to ship (`viewer_required: false`).
5. **Run `make test` once,** after the last edit and before the push, not after every step. A push must not be cut
   short: run it in the background and check `git ls-remote origin <branch>` before opening the PR.

## Order: the owner reads first (pipeline v2)

Spec: `docs/superpowers/specs/2026-11-10-say-suppose-pipeline-v2-design.md`, section 4. One author, few voices, one
pass. Where `room.yaml` sets `owner_first: true`:

1. The writer's draft passes `lint` for round 1 (and `omni qc` at G2).
2. **The owner gets it at once.** Show the owner the draft (at G1 the rendered thumbnails, never descriptions), then
   record it: `python -m studio.room present $V $G --config $CFG`. Round-1 seats refuse (exit 2, "owner first") until
   the presented draft is the round's draft; a re-linted draft is presented again.
3. The room runs round 1 beside the owner's read. It never sits between the draft and the owner.
4. One merged edit list, owner notes first, then the room's notes, goes into the owner-notes round. That is the only
   second pass: one room round (`rounds: 1`), never a third. A disagreement the writer will not take goes to the owner
   as one line, not to another round.

Where `owner_first` is not set, run the rounds below as written and present at Finish.

## Each round N (start at 1; stop at `rounds` in room.yaml)

1. **Lint.** `python -m studio.room lint $V $G --round N --draft $V/script.md --config $CFG`
   (G1: `--draft $V/packaging.md`; `--kind` defaults to packaging for g1 and script for g2). If it exits 1, fix every
   problem in the draft and run lint again for the same round before any seat runs. Once the round has any seat or
   judge file, or any call row in the ledger (any status), lint refuses every re-lint of it, the same draft and
   `--owner-notes` included (exit 2, "round N has been reviewed; start round N+1"). An ordinary round number above
   `rounds` in room.yaml exits 2; only `--owner-notes` rounds may go past it. `--draft` and `--ledger-file` must be
   files inside `channels/<slug>/` and not under any `videos/*/room/` folder, or lint exits 2. `--kind` must fit the
   gate (g1 packaging, g2 script), or it exits 2.
2. **Seats.** For every seat in room.yaml, in parallel:
   `python -m studio.room seat $V $G --round N --seat "<name>" --config $CFG --input <file>=<path> ...`
   Inputs by gate (channel files are in `channels/<slug>/`, video files in `$V`):
   - G1 seats: `audience.md`, `style.md`, `taste.md` and `cast.md` (channel folder). `packaging.md` is the draft at G1
     (it comes from the round's snapshot), so it is not an input.
   - G2 seats: the same, plus `claims.md` and `packaging.md` (the approved packaging) from the video folder.
   By seat role: viewer needs `audience.md`; story needs `style.md`, `cast.md` and `packaging.md`; fact needs
   `claims.md`. Pass a file only if it exists. The command exits 2 on a missing file, so ask the owner for the missing
   channel file (`audience.md`, `taste.md`) or leave an empty stub, or drop the input; never invent its contents.
   Inputs come only from the channel folder `channels/<slug>/` (symlinks resolved): a file anywhere else, a file under
   a secrets folder (`~/.config/omni-studio`, `~/.ssh`, `~/.aws` and the like), or any file under a `videos/*/room/`
   folder (other verdicts) exits 2, and so does the name `draft`. A seat is refused (exit 2) when its verdict in this
   round is already `ok` or the ledger holds an `ok` call for that seat in the round (deleting the verdict file does
   not buy a second opinion), and when the round's lint failed; `--allow-failed-lint` overrides the second and is for calibration only, never for a real video (the
   verdict records `lint_overridden`). The draft comes from the round's
   snapshot; do not pass `--input draft=...` (refused). Never pass one seat's output to another.
   A seat that exits 1 with a failed verdict may be re-run in the same round (once is the budget). `CapReached` means stop.
   **Caps.** With `limits` in room.yaml each seat returns at most that many blockers, suggestions and keep lines,
   worst first; the tool keeps the first ones and records how many it cut (`trimmed`). Fact blockers are never cut. A
   blocker's diagnosis binds; its fix is a proposal, and the writer may solve the problem another way.
   **The viewer off the critical path.** With `viewer_required: false` a round ships on the story and fact seats.
   Start the viewer with the others in the background; once the other seats are done, wait at most 5 more minutes,
   then merge without it. A late viewer verdict joins the next owner-notes round as suggestions, never as blockers.
   Before `report`, let every seat still running in the round you will ship finish (its verdict file must be in the
   report).
3. **Judge.** `python -m studio.room judge $V $G --round N --config $CFG --input <file>=<path> ...` with the same
   channel files as the seats (the judge brief reads `audience.md` and the claims). Inputs follow the same
   channel-folder rule, and the name `draft` is reserved. It only runs when this round's draft and an earlier one are
   both candidates. A candidate is a round whose lint passed, with an ok viewer, story and fact verdict (no failed
   verdict from any mandatory seat, even beside an ok one in the same role) and no fact blocker. The judge runs once
   per round: a second `judge` for the same round exits 2, whether or not `judge.json` was deleted. If either of its
   two calls fails, the round is unjudged (`winner` is null), `judge` exits 1 with the error and the earlier draft stays
   best: run the judge again only in a new round, or stop. Among candidates the one with fewer open blockers wins; the
   judge only breaks a tie on blockers.
4. **Stop?** Stop when every seat returned ok with no blockers, or N equals `rounds`. A round with no new blockers
   ends the room.
5. **Merge and revise.** Read the verdict files in `$V/room/$G/round-N/`. Build one edit list: drop any note that
   does not quote a line and give a fix, except fact blockers, which always stay. Precedence: CLAUDE.md and the gates,
   then fact blockers, then the newest dated owner note in `taste.md`, then the channel's rules, then the shared
   rules. **The protected spine** changes only by an owner note or a fact blocker: the five lines and `> UNDER:`, the
   dilemma line, the planted line and its return, the stranger's moment, every keep line, the writer's `> DARLING:`
   lines (at most three) and the spoken style (fragments, half-sentences, a question answered at once). A note that
   touches the spine goes to the owner as one line. The writer applies the rest to the draft file. Never invent a source or number; a missing source goes back to research. Write
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
3. Present to the owner: the draft, `room-$G.md` (flagged, changed, still disputed), the claims ledger, and the
   **author's cut**: round 1's draft (`room-$G.md` names its snapshot) beside the shipped one, with the report's
   "What review cost the voice". Add the writer's blandness check in three lines: lost keep lines, lost fragments, any
   joke or image cut. Zero is the target; the owner restores anything in one note.
4. After the owner marks the room's blockers (agreed, unsure, disagreed), write them to `$V/review-$G-marks.yaml`, a
   list of `{seat: <name>, line: <n>, mark: agreed|unsure|disagreed}` (never under `$V/room/`). Then
   `python -m studio.room times $V --config $CFG` (minutes from draft to owner, rounds, calls) for the gate summary,
   and `python -m studio.room scorecard --config $CFG`: a seat under one in three agreed over three films is flagged
   to leave, and the owner decides.
5. Write the checkpoint with `status: awaiting_human` and stop.

The gate summary reports, never asks: which seats ran, rounds, re-runs, the call cap, timeouts, lint fixes and room
notes that touched no protected line.

## Owner notes

Owner notes outrank the room. At a gate, the owner gives notes:

1. The writer applies the notes to the draft and adds them to `channels/<slug>/taste.md` (dated, newest first).
2. Run the NEXT round number with `python -m studio.room lint $V $G --round N --draft <draft> --config $CFG --owner-notes`.
3. Run the required seats only, not the optional seats, to stay within the cap: viewer, story and fact, or story and
   fact when `viewer_required: false`. A late round-1 viewer verdict joins here as suggestions.
4. Then `report` and `verify`. No judge: an owner-notes round that is a candidate ships.
5. If that round is not a candidate (lint failure, failed mandatory seat, fact blocker), fix the draft and run another
   owner-notes round. If the fix would contradict an owner note, stop and present the conflict to the owner.
   Never restore an earlier draft over the owner's notes.

## Never

- Never write, edit or delete anything under `$V/room/` by hand. Only the room tools write there.
- Never speak, as a room, on taste the owner decides from renders or by ear: the thumbnail pick, colour, music level,
  the look-test pick.
- Never skip a required seat, pass a gate, run `omni approve`, read `~/.config/omni-studio/`, or call a paid
  provider.
