# Quality spine: one review process for every video, many models

Status 2026-11-08: A1 tools built (PR #8); not yet enforced — omni approve does not run the room until A2.

Owner direction, 2026-11-08: the room "becomes the core spine of this video generation repo", and "all videos
follow the same quality process with just different reviewers and different way of doing it but the same process
of iterating over using different models family and fixing the issues on its own." The research, script-writer
and reviewer skills get their own detailed specs later, each from dedicated research per niche. This spec fixes
the process and the contracts those skills plug into.

Research and the design page: https://claude.ai/code/artifact/3b7a13c5-f209-4c77-a0be-096b2969c6e5. The design was
reviewed by GPT-5.6 and Grok 4.7 through Cursor twice: once as a design, once as this spec. The second review is
applied here (see "Review log" at the end). Cloud and portability moved to their own spec:
`2026-11-08-portable-compute-design.md`.

## Goal

Every new video on every channel passes through the same loop before the owner sees it at G1 and G2: independent
reviewers in fixed roles from at least two model families other than the writer's, deterministic lint first, the
writer fixing the notes, a blind judge when there are drafts to choose between, a fixed stop rule, and a report.
Channels differ only in which seats they add, which model sits in each, what their format checks and linters
measure, and where their research comes from. `omni approve` refuses G1 or G2 when the loop did not run on the
exact file being approved, and later stages refuse to run on a file that changed after its gate.

## Invariants (every channel, every new video)

1. **The writer never judges.** The judge, the fact seat and the story seat are never the writer's model family.
2. **Mandatory roles.** Every review round has an ok verdict from a `viewer`, a `story` and a `fact` seat, from at
   least two families other than the writer's. A failed or missing mandatory seat fails the round.
3. **Blind and independent.** A seat sees the draft, its brief and the channel bible, never another seat's notes
   or which model wrote what.
4. **Specific or dropped.** A note must quote the line and give a concrete fix. Notes without both are discarded,
   except fact blockers, which are never dropped by the merge.
5. **Lint before opinion.** Deterministic checks run before any model reads the draft.
6. **The room fixes its own issues.** The writer applies the merged notes each round without asking the owner.
7. **Fixed stop rule** (below). The shipped draft is the best *candidate*, never a draft with lint failures or a
   fact blocker.
8. **Precedence.** `CLAUDE.md` and the gates first, then fact blockers, then the newest dated owner note, then the
   channel's rules, then the shared rules. A taste note never overrides a gate, a banned tool or the paid-call rule.
9. **Gates unchanged.** The room never approves, never reads the approval key or anything under
   `~/.config/omni-studio/`, never uploads. Seven gates stay seven.
10. **Recorded.** Every round leaves its draft snapshot, verdicts and a summary in git, and a machine report the gate
    check reads.

## The process

```
idea pick (owner, topics.yaml status: selected)
  -> packaging room  -> G1 pitch (owner)     [stop]
  -> research pack   -> script room -> G2 pitch (owner)  [stop]
  -> G3..G7 as today, each verifying the gated file is unchanged
```

| Step | Input | Output | Who |
|---|---|---|---|
| Idea pick | `backlog/topics.yaml` (later: scout briefs) | `status: selected` | Owner |
| Packaging room | topic, `audience.md`, `taste.md` | `packaging.md`: premise, the wrong belief it breaks, three title + thumbnail pairs, beat outline | Room |
| G1 pitch | packaging, `room-g1.md` | owner notes or approval | Owner |
| Research pack | approved packaging | `research.md`, `claims.md` with verbatim quotes, scope, contested rows | Research skill |
| Script room | research pack, packaging, bible | `script.md` and the round files | Room |
| G2 pitch | script, `room-g2.md`, ledger, beat map | owner notes or approval | Owner |

**Owner notes before approval.** At a gate the owner reads and may give notes. The writer applies them and the room
runs one more review round on the edited file (all mandatory seats, lint first). That round's report is what
`omni approve` checks. Notes go into `taste.md` the same day. A signed gate is never reopened by the room.

**Shorts are videos too.** studio-short's `proposal` and `short_script` stages are covered like any other.

Out of scope here: the room at G4-G6 (rough cut, edit, colour). Say Suppose already runs those reviews by hand; the
same machinery can extend there later.

## The stop rule

```
round N:  lint draft N -> mandatory + channel seats review draft N (snapshot stored)
          draft N is a candidate if lint passed, the viewer, story and fact seats each returned an ok verdict,
             no mandatory seat failed (a success from another seat in the same role does not mask a failed one),
             and the fact verdict has no blocker
          best candidate = the one with the fewest open blockers (all seats); on equal blockers the judge
             breaks the tie: the judge compares draft N with the best candidate (both orders, labels hidden;
             a win must hold both ways; a tie keeps the best); a failed judge call leaves the round unjudged
             (winner null, no result), so the earlier draft stays best
          stop if draft N has no blockers at all, or N == round cap (an ordinary round above the cap is refused)
          otherwise the writer writes draft N+1 from the merged notes
ship:     the best candidate, bound to the round that reviewed it
          no candidate at the cap -> the room fails; the report says why; the gate check fails
```

Blocker count comes first and the judge only breaks ties: a later round with fewer open blockers ships even when the
judge ties, and a later round with more never ships on a judge win. A failed judge is unjudged, never a win for either
draft; `judge` exits 1, a round is judged once, and the judge may run again only in a new round. A failed mandatory seat
fails the round. An owner-notes round (`lint --owner-notes`, mandatory seats only, no judge, allowed beyond the round
cap) ships if it is a candidate, because owner notes outrank the room: going through the rounds in order, an owner-notes candidate always becomes the best, so an earlier round never beats it on blocker count, while a later ordinary round replaces it only with fewer open blockers (or the same number and a judge "new"); otherwise the earlier best stays and the conflict goes back to the owner.

A fact blocker is never demoted: a blocker from a fact seat stays a blocker whatever `domain` the model names, and for
other seats a blocker with no domain, or with the seat's own role as its domain, stays one (the domain is compared
after trimming and lower-casing).

Non-fact blockers still open at the cap do not block the gate. They lead the room report so the owner decides.
Seat scores are informational only; the stop rule uses blockers and the judge, nothing else.

## Shared vs per channel

| Shared, in `core/studio/room/` | Per channel |
|---|---|
| Model call, verdict schema, call ledger, model-family registry | `room.yaml`: seats (role, brief, one model), caps, linter list, format parameters, research sources, `adopted` date, pitch clip mode |
| Slop lint (word lists in `core/studio/room/slop.yaml`, their sources recorded in `core/lock.yaml` in A2), "and then" joins, a ledger lint (every cited claim id has a non-empty verbatim quote). Open vs closed loops are judged by the story seat; no reliable deterministic check exists | Format parameters (interjection cadence, wordless share, word budget, wpm, speaker labels) and channel linters named in `room.yaml` (e.g. `script_lint.py` for Professor of Us) |
| Judge, stop rule, round snapshots, reports, the `room` gate check | `room/seats/*.md` channel seat briefs |
| Shared briefs for the three mandatory roles | `audience.md` (one named viewer, their job, 3-5 comparable channels, what makes them leave) and `taste.md` (owner notes, newest first) |
| The `studio-room` skill (the process) | The pipeline's own stage names |

**Seat roles:** `viewer`, `story`, `fact` (mandatory); `neutrality`, `voice`, `craft` (optional). The role, not the
seat's title, is what `omni check` and the gate check read. One model per seat.

Starting panels, from what each channel runs today (writer: Claude Opus 5.5):

| Channel | Seats (role: model) |
|---|---|
| professor-of-us | cold viewer (viewer: Grok 4.7), story editor (story: GPT-5.6), fact reviewer (fact: Gemini) |
| say-suppose | first-time viewer (viewer: Grok), retention editor (story: GPT-5.6), fact-checker (fact: Gemini), voice director (voice: Claude Sonnet), animator (craft: Claude Sonnet) |
| power-and-citizen | casual viewer (viewer: Grok), retention editor (story: GPT-5.6), professor (fact: Gemini), dialogue editor (craft: Claude Sonnet), neutrality A (neutrality: GPT-5.6), neutrality B (neutrality: Gemini), picture editor (craft: Claude Sonnet) |
| see-underneath | the three mandatory seats, set when the channel starts |

Judge: GPT-5.6 on every channel, a separate call. Craft and voice seats may sit on the writer's family; viewer,
story, fact, neutrality and judge may not. Non-Claude models run through `cursor-agent`; Codex joins through
`codex exec` once subscribed. `core/studio/room/models.yaml` maps every model id to its family; a seat whose model
is not in the registry fails `omni check`.

**Caps are derived, not guessed.** Per script: `rounds x (seats + 2 judge calls) + 1 retry per seat per round`, plus
one owner-notes round. `omni check` computes it from `room.yaml` and refuses a cap below it. Defaults: 3 rounds;
the derived per-script cap; 80 calls a day across all channels (owner may change). Per-call paid providers still
need the owner's approval each time.

## How it is the spine (enforcement)

1. **Pipelines declare their gated room stages.** Each studio pipeline gets `metadata.studio_room: {proposal: g1,
   <script stage>: g2}` (`dialogue_script`, `story_script`, `short_script`, ...) and lists `room` in
   `metadata.studio_checks` for those stages. `checks.run_check` gains the stage argument so the check knows its gate
   and artifact (`packaging.md` at G1, `script.md` at G2).
2. **The `room` check** passes only when `room/<gate>.json` (shape below) exists for a new video and:
   - its `shipped.artifact_sha256` equals the file being approved, and `shipped.round` is a round in the report;
   - that round has ok verdicts from every mandatory role on two or more non-writer families, and its judge (if any)
     is not the writer's family;
   - the raw fact verdict of that round has no blocker (the check reads the verdict file, not the merged list);
   - every counted verdict's `call_id` exists in the call ledger with `ok` and the same output sha256;
   - calls are within the derived cap.
   A check never passes a gate by itself.
3. **The approval binds the file.** `omni approve` adds the room evidence (artifact sha256, report sha256) to what
   `studio_approval` signs, the way G6 binds media today. The next stage's checks verify `script.md` (or
   `packaging.md`) still matches the G2 (or G1) proof, so a post-approval edit stops the pipeline. This edits
   `lib/studio_approval.py` and `core/studio/channels.py` and is listed in `core/PATCHES.md`.
4. **Grandfathering by date, not by flag.** The check applies to videos whose id date is on or after the channel's
   `room.yaml` `adopted` date. Videos already in flight finish as they started. No per-video flag an agent could
   delete.
5. **`omni check` validates `room.yaml`**: mandatory roles present, family rules, registry, derived cap, briefs and
   linters exist, `adopted` set. Every format in every `channel.yaml` must map to a pipeline that declares
   `studio_room`; a channel or format without it fails `omni check`.
6. **New channels start with it.** `channels/_template` gets `room.yaml`, `audience.md`, `taste.md`, `room/seats/`;
   `omni new-channel` copies them.
7. **A repo test** fails if any `studio-*.yaml` pipeline has a `proposal` stage or a stage producing `script.md`
   without a `studio_room` entry and the `room` check.
8. **CLAUDE.md** gets a short "Quality spine" section next to "Gates".

**What this does and doesn't stop.** It catches skipped rounds, missing roles, a failed fact seat, edits after a gate
and sloppy hand-written reports. Like the approval key (CLAUDE.md), it is not a boundary against an agent running as
the owner that forges both the ledger and the report on purpose. Agents never write room files by hand; only the
room tools do.

## Room mechanics

**Model call (tool).** `core/studio/room/call.py`: puts the seat's inputs (numbered draft, brief, bible files) inline in
the prompt and runs `claude -p` with tools off or `cursor-agent -p --mode ask --output-format json --model <id>` from an
empty temp folder under `sandbox-exec`, with reads and writes denied for secrets, every project (this repo and its main
checkout), session transcripts and the call ledger (a test shows a denied read really fails). No bundle is written.
Stripped environment, timeout. Retry rule: a malformed answer or a non-zero exit is retried once; a timeout is not
retried. After that the seat is `failed`. A brief must live under the channel folder or the shared seats folder, and
`--input` files in the real home's secrets folders (`~/.config/omni-studio`, `~/.ssh`, `~/.aws`, `~/.gnupg`,
`~/.config/gh`, `~/.netrc`, `~/.local/state/omni-studio`, `~/.claude/projects`) are refused: nothing secret is read
into a prompt.

**Round discipline.** Once a round has any verdict or judge file, or a `reserved` ledger row, `lint` refuses any
re-lint of it (the same draft included; this also locks `--owner-notes`): start the next round. `lint --kind` must fit
the gate (g1 packaging, g2 script). A seat whose verdict in the round is `ok` is not re-run; a failed one may be. Seats
do not run on a round whose lint failed, except with `--allow-failed-lint` for calibration (the verdict records
`lint_overridden: true`). Each verdict records `draft_sha256`, the draft it reviewed, and the room check requires it to
equal the round's draft. `judge` takes the same `--input NAME=PATH` files as `seat`, after the brief.

**Call ledger.** One SQLite file at `~/.local/state/omni-studio/room/ledger.sqlite` (not under `~/.config`, which
holds secrets), shared by every worktree. A call reserves its slot in a transaction before running, so parallel
sessions cannot overrun the daily cap. Each row: call id, time, channel, video, gate, round, seat, model, family, CLI
version, prompt sha256, output sha256, duration, status, and `verdict_sha256` (the digest of the verdict file the call
produced, which binds the file to the row).

**Verdict schema.** `{call_id, seat, role, model, family, status, scores: {...}, blockers: [{line, quote, why, fix,
domain}], suggestions: [...], keep: [{line, quote}], output_sha256, draft_sha256}` (plus `lint_overridden` when set).
Blockers are valid only inside the seat's role. `suggestions` and `keep` hold objects: a bare string becomes
`{"quote": s}` and anything else is dropped.

**Lint (tool).** `core/studio/room/lint.py` runs the shared checks, then the format parameters, then each linter
`room.yaml` names. The core imports no channel engine. Hard failures go back to the writer before any seat runs.

**Merge (skill).** The agent driving the skill merges notes into one edit list, drops notes that break invariant 4,
applies precedence, and protects keep lines unless a fact blocker rests on them.

**Orchestration (skill).** `core/openmontage/skills/studio/studio-room.md` drives the rounds. Python provides tools
and persistence only (`AGENT_GUIDE.md`), so Claude Code or Cursor can drive the same skill.

**Files per video** (all in git except raw output):

```
videos/<id>/
  room/drafts/<sha256>.md          every reviewed draft, content-addressed
  room/g2/round-<N>/meta.json      draft sha256, lint result, `kind`, `owner_notes`
  room/g2/round-<N>/<seat>.json    raw verdicts, written only by call.py
  room/g2/round-<N>/judge.json     the judge's result, when two candidates existed
  room/g2.json                     the report the check reads
  review-g2-round<N>.md            the round summary (Say Suppose's naming)
  room-g2.md                       what the owner reads: flagged, changed, still disputed
  room/raw/                        CLI stdout, git-ignored
```

`room/<gate>.json`:

```json
{"gate": "g2", "stage": "dialogue_script", "writer_family": "anthropic",
 "rounds": [{"round": 1, "draft_sha256": "...", "lint": {"ok": true, "problems": []},
             "verdicts": [{"seat": "fact reviewer", "role": "fact", "family": "google", "status": "ok",
                           "call_id": "...", "file": "room/g2/round-1/fact-reviewer.json", "output_sha256": "...",
                           "blockers": 0}],
             "judge": {"call_ids": ["...", "..."], "family": "openai", "winner": "new or best"},
             "owner_notes": false, "candidate": true}],
 "skipped_rounds": [],
 "shipped": {"round": 2, "artifact_sha256": "..."},
 "calls": 17, "cap": 26}
```

`owner_notes` is true for a round linted with `--owner-notes`; `candidate` is the stop rule's test; `skipped_rounds`
lists `round-*` folders that could not be read (a bad name or a missing or malformed `meta.json`); `malformed_verdicts`
lists verdict files missing any of `call_id`, `seat`, `role`, `model`, `family`, `status` or `blockers`, which are not
counted; `channel` scopes the ledger call count. `room-<gate>.md`
says "shipped by the owner-notes rule (no judge)" when the shipped round is an owner-notes round.

**Pitch clip.** `room.yaml` `pitch_clip: after_g2` (default) or `pre_g2_local`. `pre_g2_local` needs the owner's
decision, the G2 wording changed in CLAUDE.md, the pipeline and the skill for that channel, and a non-empty
`voices.yaml` whose every voice is a free local engine. Otherwise the first thing made after G2 is a 30-45 s hook
clip in the real voices.

## A2 prerequisites

Before the room check is wired into `omni approve`, A2 must close these gaps found by the whole-branch review of A1:

1. Done (fix wave, PR #8): evidence recomputes `shipped` from the round files (`R.scan_rounds` and `R.shipped`) and
   requires it to equal the report's, so an edited report cannot ship another round. It also recomputes every counted
   verdict's and the judge's family from the model registry.
2. Partly done: empty judge `call_ids` are refused and every judge ledger row must be `ok`. Still open: `judge.json`
   bound like a verdict (each call's output sha256 in the file, a digest of the file in the ledger row).
3. Evidence re-runs `lint_draft` on the shipped snapshot instead of trusting `meta.lint`.
4. Evidence flags any `ok` ledger row for the same channel, video, gate, round and seat that no verdict cites (a
   discarded second opinion).
5. `verify` takes the cap and the writer family from `room.yaml` (`derived_cap`, `cfg.writer`), checks the report's
   gate, stage and channel, and scopes its ledger checks by channel.
6. `adopted` is coerced to a date before it is compared with a video's id date.
7. The approval binds the artifact sha256 and the shipped round, not the report file's sha256: the call count changes
   after approval (later calls, owner-notes rounds), so the report file is not stable.
8. Crashed `reserved` ledger rows get a sweep or a documented rule; until then they lock their round against re-lint
   and count against the caps.
9. The Claude CLI runs under the sandbox profile and cannot read the repo (live test passed 2026-11-08, with
   transcript writes to `~/.claude/projects` denied). The fix wave passes `--setting-sources project` so user
   settings, user memory and hooks do not load (the seat runs in an empty temp folder), and the profile also denies
   other conversations and agent state (`~/.cursor/chats`, `~/.claude/history.jsonl` and the like). Still to check
   live before a channel adopts a Claude seat: that nothing of the user's reaches the seat with that flag.
10. `--owner-notes` is proven, not declared: an owner-notes round must cite a dated owner note in `taste.md` (or the
    owner's own approval of the flag), and evidence checks it. Today an agent can pass the flag at a round's first
    lint and ship it without the judge.
11. Each verdict records the names and sha256 of the inputs its seat saw, and evidence requires each role's
    mandatory inputs (viewer `audience.md`; story `style.md`, `cast.md`, `packaging.md`; fact `claims.md`), so a fact
    seat run without the ledger cannot count as a review.
12. Done (fix wave): the re-lint lock counts any ledger row for the round, not only `reserved` ones, so deleting a
    round's verdict files cannot unlock it; `seat` is refused when an `ok` ledger row exists for the seat in the round
    (the seat re-run lock); `judge` is refused once `judge.json` or an `ok` judge row exists.
13. Done (fix wave): `--input`, `--draft` and `--ledger-file` are an allowlist, not a blocklist: each must resolve
    inside the channel folder and outside `videos/*/room/` and secrets folders, so another project's or work files
    cannot reach a third-party model prompt.

## Commands

| Command | What it does |
|---|---|
| `omni room status <slug> <video>` | Rounds, seats, blockers, calls used vs cap |
| `omni room call <slug> <video> <gate> <seat>` | One seat on the current draft (used by the skill) |
| `omni room judge <slug> <video> <gate>` | Judge the newest candidate against the best |
| `omni room report <slug> <video> <gate>` | Write `room/<gate>.json` and `room-<gate>.md` from the ledger and verdict files |
| `omni qc <slug> <video> <stage>` | Runs `room` with the other checks, as today |

## The three skills to detail later

| Skill | Reads | Writes | Must |
|---|---|---|---|
| `studio-research` | topic, `audience.md`, channel sources | scout briefs; `research.md`, `claims.md` | sources opened and saved, verbatim quotes, scope, contested rows; topics checked against every channel's backlog with `omni similar` |
| `studio-writer` | packaging, research pack, `style.md`, `cast.md`, `taste.md`, merged notes | `packaging.md`, `script.md` revisions | never score its own work; cite every claim; follow the channel format |
| Seat briefs (shared + per channel) | draft, brief, bible | verdict JSON | stay in the role; quote and fix |

## Parallel sessions, merge order, adoption

- `claude/affectionate-williams-2b5429` (Power and Citizen, studio-documentary) changes `checks.py`, `claims.py`,
  `cli.py`, `channels.py` and `lib/studio_approval.py`. `claude/say-suppose-first-video-40c64e` (studio-whatif)
  adds its own pipeline, engine and tests and does not touch those files.
- A1 adds new files only and can start now. A2 (check, approval binding, `run_check` stage argument, pipeline
  metadata, `omni room` commands) starts after documentary merges, then rebases after what-if merges, and tests
  `proposal`, `dialogue_script`, `story_script` and `short_script`.
- A channel adopts the spine at its next video, before G1: its current seats go into `room.yaml` and `adopted` is
  set to that video's date.

## Phases

| Phase | Done when |
|---|---|
| A1 Core tools | call (with the read-denial test), verdict schema, ledger, family registry, lint, judge, snapshots and report writer exist with tests; one historical script per channel (a Power and Citizen draft, a Say Suppose draft, the dreams draft) run through the room, its notes compared with the hand-run panel and the owner's notes |
| A2 Spine wiring | `room` check, approval binding, predecessor verification, `room.yaml` validation in `omni check`, template, repo test, CLAUDE.md section, `omni room` commands, pipelines pointing at the `studio-room` skill (written in A1); first channel adopted |
| A3 Role skills | `studio-research`, `studio-writer` and seat briefs, each from its own niche research spec. A3 also runs idea briefs through the room (an idea review with its own seats), and the A3 scout reads `sources` in `room.yaml` |
| A4 Learning | per-video hypotheses against analytics exports; lessons that hold on two channels proposed for `core/studio/rules/` with owner sign-off |

## Decisions and defaults

| Decision | Default until the owner says otherwise |
|---|---|
| Pitch clip | `after_g2` everywhere |
| Caps | 3 rounds, the derived per-script cap, 80 calls a day across channels |
| Idea pick | a backlog status, not a gate |
| First channel | whichever starts its next video first after A2 |

## Risks

- **Reviewers converge into blandness.** Blind seats, narrow roles, keep lines, specific-or-dropped notes.
- **Cursor usage pool.** Named frontier models share a smaller pool; the ledger shows when it runs low.
- **Unattended subscription use.** Room calls run on the Mac only.
- **Sandbox mechanism.** If no reliable read denial works for both CLIs, A1 stops and reports before building on it.
- **Merge order.** A2 waits for documentary; A1 does not.

## Review log (2026-11-08, GPT-5.6 Sol and Grok 4.7 via Cursor, on the first version of this spec)

Applied: stage passed into `run_check` and declared in pipeline metadata; report shape defined; verdicts only from
`call.py`, cross-checked against a ledger; mandatory roles must be ok, so a failed fact seat fails; the raw fact
verdict is read, not the merged list; best draft limited to lint- and fact-clean candidates and bound to its round;
approval signs the artifact and later stages verify it; caps derived from panel size; one model per seat (two
neutrality seats); seat roles as an enum; linters listed per channel, no engine import in the core; ledger is a
locked SQLite file outside the secrets folder; grandfathering by video date; adoption before G1; Shorts and every
channel format covered; `CLAUDE.md` above taste notes; `pre_g2_local` needs non-empty local voices; merge claim
corrected (what-if does not touch the shared files); Track B moved to its own spec; judge runs only when there are
candidates to choose between; scores informational.

Not applied: cutting the channel panels to the three mandatory seats (the owner asked for different reviewers per
channel; craft seats stay optional and cheap); cutting the owner-notes round (owner notes come before approval, so
the gate check needs a report on the edited file); skipping A1 calibration (one script per channel is cheap and
shows whether cross-model review adds anything).
