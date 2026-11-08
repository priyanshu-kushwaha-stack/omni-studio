# Quality spine: one review process for every video, many models

Owner direction, 2026-11-08: the room "becomes the core spine of this video generation repo", and "all videos
follow the same quality process with just different reviewers and different way of doing it but the same process
of iterating over using different models family and fixing the issues on its own." The research, script-writer
and reviewer skills get their own detailed specs later, each from dedicated research per niche. This spec fixes
the process and the contracts those skills plug into. Research behind it, and its review by GPT-5.6 and Grok 4.7
through Cursor: https://claude.ai/code/artifact/3b7a13c5-f209-4c77-a0be-096b2969c6e5 (v5).

Two tracks. Track A is the spine. Track B makes the repo portable, with heavy jobs in the cloud and the Mac as
fallback. They touch different files.

## Goal

Every video on every channel passes through the same loop before the owner sees it at G1 and G2: independent
reviewers from at least two model families other than the writer's, deterministic lint first, the writer fixing
the notes, a blind judge, a fixed stop rule, and a report. Channels differ only in who sits in the seats, what
their format checks measure, and where their research comes from. `omni approve` refuses G1 or G2 when the loop
did not run on the exact file being approved.

## Invariants (every channel, every video)

1. **The writer never judges.** The judge and the fact seat are never the writer's model family.
2. **Two other families at least.** Each round needs valid verdicts from seats on two or more model families
   other than the writer's.
3. **Blind and independent.** A seat sees the draft, its brief and the channel bible, never another seat's notes
   or which model wrote what.
4. **Specific or dropped.** A note must quote the line and give a concrete fix. Notes without both are discarded.
5. **Lint before opinion.** Deterministic checks run before any model reads the draft.
6. **The room fixes its own issues.** The writer applies the merged notes each round without asking the owner.
7. **Fixed stop rule.** Stop when no seat has a blocker and the new draft does not beat the best draft, or at the
   round cap. Ship the best draft, not the latest.
8. **Facts beat everything.** An unresolved fact blocker stops the pitch. Precedence otherwise: newest dated owner
   note, then the channel's rules, then the shared rules.
9. **Gates unchanged.** The room ends at `awaiting_human`. It never approves, never reads the approval key, never
   uploads. Seven gates stay seven.
10. **Same process, recorded.** Every round leaves a summary in git and a machine report the gate check reads.

## The process

```
idea pick (owner, topics.yaml status: selected)
  -> packaging room  -> G1 pitch (owner)     [stop]
  -> research pack   -> script room -> G2 pitch (owner)  [stop]
  -> G3..G7 as today
```

| Step | Input | Output | Who |
|---|---|---|---|
| Idea pick | `backlog/topics.yaml` (later: scout briefs) | `status: selected` | Owner |
| Packaging room | topic, `audience.md`, `taste.md` | `packaging.md`: premise, the wrong belief it breaks, three title + thumbnail pairs, beat outline; `room-g1.md`, `room/g1.json` | Room |
| G1 pitch | the above | owner approval | Owner |
| Research pack | approved packaging | `research.md`, `claims.md` with verbatim quotes, scope and contested rows | Research skill |
| Script room | research pack, packaging, bible | `script.md`, `review-g2-round<N>.md`, `room-g2.md`, `room/g2.json` | Room |
| G2 pitch | script, room report, ledger, beat map, pitch clip where allowed | owner approval | Owner |

After the owner's notes at a gate, the writer applies them and a **confirmation round** (lint, the fact seat and
the viewer seat, then the judge) re-stamps the report on the new file, so it still meets the two-family rule. Owner notes go into `taste.md` the same day.

Out of scope for this spec: the room at G4-G6 (rough cut, edit, colour). Say Suppose already runs G4 and colour
reviews by hand; the same machinery can extend there later.

## Shared vs per channel

| Shared, in the core | Per channel |
|---|---|
| Sandboxed model call, verdict schema, call log | `room.yaml`: seats, model per seat, veto domains, caps, format checks, research sources, pitch clip mode |
| Slop lint (word lists pinned in `core/lock.yaml`), "and then" joins, open vs closed loops | Format checks as parameters: interjection cadence, wordless share, word budget and wpm, speaker labels; plus the channel's own linters |
| Judge, stop rule, round files, reports | `room/seats/*.md` channel seat briefs |
| Shared seat briefs: first-time viewer, retention editor, fact reviewer | `audience.md` (one named viewer, their job, 3-5 comparable channels, what makes them leave) and `taste.md` (owner accept/reject notes, newest first) |
| The `studio-room` skill (the process) | The pipeline's own stage names and gates |

Starting panels come from what each channel runs today:

| Channel | Seats | Default models (writer: Claude Opus 5.5) |
|---|---|---|
| professor-of-us | story editor, cold viewer, fact reviewer | GPT-5.6, Grok 4.7, Gemini; judge GPT-5.6 |
| say-suppose | first-time viewer, fact-checker, retention editor, voice director, animator | Grok, Gemini, GPT-5.6, Claude Sonnet, Claude Sonnet; judge GPT-5.6 |
| power-and-citizen | casual viewer, retention editor, professor, dialogue editor, neutrality reader, picture editor | Grok, GPT-5.6, Gemini, Claude Sonnet, GPT-5.6 and Gemini both, Claude Sonnet; judge GPT-5.6 |
| see-underneath | the three shared seats | set when the channel starts |

Craft seats that judge buildability or voice may sit on the writer's family; story, fact, neutrality and judge
seats may not. Non-Claude models run through `cursor-agent`; Codex joins through `codex exec` once subscribed.

## How it is the spine (enforcement)

1. **A `room` gate check.** `core/studio/checks.py` gains `room` in `KNOWN`. Every studio pipeline lists it in
   `metadata.studio_checks` for its packaging stage (`proposal`) and its script stage (`dialogue_script` in
   studio-dialogue and studio-documentary, `story_script` in studio-whatif, and the script stage of any future
   pipeline). `omni approve` re-runs it before signing, like the claims check. It passes only when
   `room/<gate>.json` exists and:
   - its `artifact_sha256` matches the file being approved (`packaging.md` at G1, `script.md` at G2);
   - the last round has valid verdicts from two or more non-writer families;
   - the judge and fact seat families differ from the writer's;
   - no fact blocker is unresolved;
   - rounds and calls are within the channel's caps.
   A check never passes a gate by itself.
2. **`omni check` validates `room.yaml`**: required seats present (a viewer seat, a story or retention seat, a fact
   seat), family rules above, caps set, briefs exist. A channel without a valid `room.yaml` fails `omni check`.
3. **New channels start with it.** `channels/_template` gets `room.yaml`, `audience.md`, `taste.md` and
   `room/seats/`; `omni new-channel` copies them.
4. **A repo test** fails if any `studio-*.yaml` pipeline has a packaging or script stage without the `room` check,
   so a new format cannot skip the spine.
5. **CLAUDE.md** gets a short "Quality spine" section next to "Gates".

## Room mechanics

**Model call (tool, Python).** `core/studio/room/call.py`: copies only the files a seat needs into a temp folder,
runs `claude -p` with tools off or `cursor-agent -p --mode ask --output-format json --model <id>`, stripped
environment, timeout, no access to `~/.config/omni-studio/`. Output must parse as the verdict schema: one retry,
then the seat counts as failed for that round. Every call appends to one git-ignored log in the main checkout
(`.room/calls.jsonl`: time, channel, video, seat, model, CLI version, prompt hash, duration, ok), shared by all
worktrees so caps count across parallel sessions.

**Verdict schema.** `{seat, scores: {<rubric item>: 1-10}, blockers: [{line, quote, why, fix, domain}],
suggestions: [...], keep: [{line, quote}]}`. Blockers are valid only inside the seat's veto domain.

**Lint (tool).** `core/studio/room/lint.py`: shared slop checks plus the format checks parameterised by
`room.yaml`, plus the channel's existing linters (`script_lint.py` for Professor of Us). Hard failures go back to
the writer before any seat runs.

**Merge.** The agent running the skill merges notes into one edit list, drops notes that break invariant 4, and
applies precedence (invariant 8). A keep line is protected unless a fact blocker rests on it.

**Judge (tool + model).** New draft vs best draft, both orders, labels hidden. A win counts only if it holds both
ways; a tie keeps the best draft.

**Orchestration (skill).** `core/openmontage/skills/studio/studio-room.md` drives rounds: lint, seats in parallel,
merge, writer revises, judge, stop rule, report. Python only provides tools and persistence (`AGENT_GUIDE.md`), so
Claude Code or Cursor can drive the same skill.

**Caps (defaults, owner may change).** 3 rounds and 20 subscription calls per script, 60 calls a day across all
channels. Per-call paid providers still need the owner's approval each time.

**Files per video.** `review-g1-round<N>.md`, `review-g2-round<N>.md` (Say Suppose's naming), `room-g1.md` and
`room-g2.md` (the report the owner reads: what was flagged, what changed, what the room still disagrees on),
`room/g1.json` and `room/g2.json` (what the check reads). Raw model output under `room/raw/`, git-ignored.

**Pitch clip.** `room.yaml` `pitch_clip: after_g2 | pre_g2_local`. `pre_g2_local` is allowed only when every voice
in `voices.yaml` is a free local engine (Power and Citizen today) and needs the G2 wording in CLAUDE.md, the
pipeline and the skill changed for that channel. Default `after_g2`: the first thing made after G2 is a 30-45 s
hook clip in the real voices.

## The three skills to detail later

Each gets its own spec, built from dedicated research per niche. This spec fixes only their contracts.

| Skill | Reads | Writes | Must |
|---|---|---|---|
| `studio-research` | topic, `audience.md`, channel sources | scout briefs; `research.md`, `claims.md` | sources opened and saved, verbatim quotes, scope, contested rows; topics checked against every channel's backlog with `omni similar` |
| `studio-writer` | packaging, research pack, `style.md`, `cast.md`, `taste.md`, merged notes | `packaging.md`, `script.md` revisions | never score its own work; cite every claim; follow the channel format |
| Seat briefs (shared + per channel) | draft, brief, bible | verdict JSON | stay in the veto domain; quote and fix |

## Parallel sessions and adoption

- The channel branches are changing `checks.py`, `claims.py` and `cli.py`. Phase 1 adds new files only. The `room`
  check, the `omni room` commands and the pipeline edits land after those branches merge into main.
- A channel adopts the spine on its next script, never mid-video. Its current seats are copied into `room.yaml`.
  Power and Citizen video 1 and both Say Suppose videos finish as they started.
- Order: whichever channel starts its next script first after phase 1, then the others one at a time.

## Track B: portable, cloud first, Mac fallback

**Split.** The Mac keeps review, gates, `omni approve`, the approval key, YouTube tokens, `omni upload` and the
room's model calls. Voice takes, stills, LoRA training, music, transcription and renders can run in the cloud.

**Jobs.** `core/studio/jobs/`: every heavy step is a job with declared inputs and outputs, keyed by the sha256 of
script version, model revision, inputs and settings, with a manifest in `videos/<id>/jobs/<key>.json` (status,
backend, wall time, cost). A key with outputs never runs again. `backend: auto | local | modal | runpod`; `auto`
checks the cloud (10 s), checks the budget, shows the estimate, and falls back to the Mac when the cloud is down,
slow or over budget. Every output records its backend.

**Parity.** CUDA paths for Qwen3-TTS and FLUX (diffusers) next to the MLX ones. Each channel LoRA must load on
both. The owner approves a channel's cloud voice by ear once before it switches; one video's narration never mixes
backends.

**Artifacts.** Cloudflare R2, keyed by hash, manifest in git; media stays out of git. Cloud images built from the
lock files, pinned in `core/lock.yaml`, with a CUDA media lock next to `requirements-media.lock.txt`.

**Secrets.** Cloud jobs get only their inputs and a short-lived storage token. Keys live under
`~/.config/omni-studio/`; agents never read them.

**Budget.** $30 a month by default (Modal's monthly credit); past it, jobs run on the Mac unless the owner approves
more. Modal first, RunPod as backup.

**Measure first.** No step records its time today. B1 adds timing to every heavy step on all channels and reads a
week of runs before anything moves.

**Kubernetes: later.** A `k8s` backend can reuse the same images when load is steady; not built now.

## Phases

| Track A | Done when |
|---|---|
| A1 Core tools | call, verdict schema, lint, judge, call log exist with tests; calibrated on Power and Citizen's 8 panel reports, Say Suppose's 5 rounds and the dreams drafts, comparing what the cross-model room catches with the Claude-only panels and the owner's notes |
| A2 Spine wiring | `room` check, `room.yaml` validation, template, repo test, CLAUDE.md section, `studio-room` skill; first channel adopted |
| A3 Role skills | `studio-research`, `studio-writer`, seat briefs, each from its own niche research spec |
| A4 Learning | per-video hypotheses against analytics exports; lessons that hold on two channels proposed for `core/studio/rules/` with owner sign-off |

| Track B | Done when |
|---|---|
| B1 Measure | a week of timed runs and a ranked list of where time goes, plus cheap local fixes |
| B2 Job runner | one job (Chatterbox voice) runs on Modal or the Mac with the same key; the second run is a cache hit |
| B3 CUDA paths | Qwen3 and FLUX on CUDA, LoRAs load on both, cloud voices approved by ear |
| B4 Renders | the slowest of renders, music and transcription moved, per B1 |

## Decisions and defaults

| Decision | Default until the owner says otherwise |
|---|---|
| Pitch clip | `after_g2` everywhere; `pre_g2_local` offered for channels with free local voices |
| Usage caps | 3 rounds, 20 calls per script, 60 a day across channels |
| Idea pick | a backlog status, not a gate |
| Cloud | Modal + RunPod backup, R2, $30 a month; owner creates the accounts and stores the keys |
| First channel | whichever starts its next script first after A1 |

## Risks

- **Judges disagree in both orders and the loop stalls.** Tie keeps the best draft; the cap ends it.
- **Reviewers converge into blandness.** Blind seats, narrow veto domains, keep lines, specific-or-dropped notes.
- **Cursor usage pool.** Named frontier models share a smaller pool; the call log and caps show when it runs low.
- **Unattended subscription use.** Room calls stay on the Mac; cloud sessions are optional.
- **YouTube "derived metrics" policy.** Outlier scores are internal only and refreshed within 30 days.
- **Merge order.** A2 waits for the channel branches; A1 and B1 do not.
