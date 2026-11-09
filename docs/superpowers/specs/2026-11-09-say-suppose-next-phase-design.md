# Say Suppose: the next phase (time, cadence, story, slate)

For the owner's review, 2026-11-09. Planned with the owner on 2026-11-08 and 09, one decision at a time; every
section below was approved as it was presented. It covers how to make each video faster, how to reach one video a
day, the rules for picking and writing a what-if, how topics are chosen, and the next ten videos.

Inputs: the first video's folder (`channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day`), its
commit times, the handover note of 2026-11-08, `channels/say-suppose/style.md`, the quality spine
(`2026-11-08-quality-spine-design.md`, `core/studio/room/`), portable compute (`2026-11-08-portable-compute-design.md`)
and the B1 plan (`docs/superpowers/plans/2026-11-08-b1-measure-heavy-steps.md`, `core/studio/jobs/`).

Research behind it, all in `docs/research/`:

| Note | What |
|---|---|
| `2026-11-09-say-suppose-story-craft.md` | 50 story rules from Pixar, Hitchcock, Parker and Stone, McKee, Sanderson, Muller and others |
| `2026-11-09-say-suppose-music-sound.md` | 45 music and sound rules from film composers, sound designers and editors |
| `2026-11-09-say-suppose-owner-references.md` | The owner's five references: Tim Runia, Reinis Kaspars, Dr. Plants, HimanshuG, Veritasium |
| `2026-11-09-say-suppose-topic-scoring.md` | How creators pick topics; the first scoring of 28 topics |
| `2026-11-09-say-suppose-cursor-review/` | GPT-5.6, Gemini 3.7 and Grok 4.7 reviewing this strategy, each blind |
| `2026-11-09-say-suppose-idea-room/` | The first idea-room run: every prompt, raw output, merge, evidence and score |

## Owner decisions

| Question | Decision (owner) |
|---|---|
| Owner review time | 2+ hours a weekday, full weekends and holidays (9 and 10 Nov 2026 off for Diwali) |
| Time levers | Preview ladder and beat caching, plus the room before every owner look; cloud renders after a week of B1 timings |
| Production shape | A staggered conveyor, one stage apart |
| Story rules | The pick card and writing rules (section 4), adopted 2026-11-08, revised by the review on 2026-11-09 |
| Craft rules | Short must-pass lists from the research and the owner's references; the rest is a shelf (section 4) |
| Strategy review | "Get the strategy reviewed by other Model Agents in Cursor"; the reviewers' consensus adopted ("Adopt all") |
| Topics | An idea room: several creative models research independently, a neutral moderator merges, every model rates, they converge; "final decision should definitely be mine" |
| The slate | The idea room's list, the owner's pick in a tone-varied order (section 6) |

## 1. Where the first video's time went

The first video ran from 6 Nov 12:10 to 8 Nov 22:25, about 58 hours of clock, from commit times (nothing was timed:
B1 had recorded no runs).

About 40% was work done once: the channel, format and look, the reference study, the engine import, the brand kit
and idents, the channel music themes, the Hindi voice design, the opening check, and the upload, thumbnail and
subtitle tooling.

What repeats every video:

| Stage | What happened | Clock |
|---|---|---|
| Script, G1 to G2 | 5 review rounds; v6 under the reference-study rules; v7 after G4. G2 reopened twice | ~3 h agent, plus owner waits |
| Narration, G3 | 71 takes in 5-10 min batches; reopened once for the 1.1x tempo | ~2 h, plus a night |
| Scene build | 27 beat files and 2 sets, all new | ~6 h |
| Rough cut, G4 | 3 cuts (v1, v7, v8), the colour review, the brand kit | ~12 h |
| Edit, G5 | 6 edits and about 5 music rounds, each note a full render | ~10 h active |
| Hindi dub | 3 script drafts, 2 model-review rounds, 62 takes; beside G5 | ~3.5 h |
| G6 | One watch | 16 min |
| Publish | Studio-only steps by hand through Chrome, tooling built on the way | ~4 h |

Findings:

1. **The loop was the clock:** owner note, then a full 1080p Remotion render (60-70 min), then a watch. At least 9
   full renders. Most notes (music level, colour, opening gap) could be seen on an audio-only render, a still sheet
   or a 720p slice.
2. **Rules found mid-video reopened gates:** the reference study, the 1.1x tempo, colour, sources off screen, the
   empty opening, lighter music. They are in `style.md` now; video 2 does not pay for them.
3. **Scenes are written per video.** A daily pace depends on reusing sets, props and actions.
4. **Renders failed under load** (a frame timeout, fixed at 2 min a frame) and with a killed session.

## 2. Time: the levers

### 2a. Preview ladder (local, free)

Each note is checked on the cheapest output that shows it. The full 1080p render happens once, for G6 and the upload.

| A note about | Shown on | Takes |
|---|---|---|
| Colour, staging, text placement | A still sheet (`scenes/stills.sh`, half scale) | ~2 min |
| Music, mix, voice, clicks | An audio-only render and the qc checks (loudness, clicks, opening) | ~20 min today; a few minutes once the mix is built outside Remotion |
| Timing, pace, one beat's acting | A 720p render of that beat only | a few minutes |
| The whole cut at G4 and G5 | A 720p full render (`--scale` about 0.67) | estimated 25-30 min; B1 measures it |
| G6 and the upload | One 1080p render, with time for a second attempt | ~65 min |

**Beat caching.** Each beat renders to its own file, keyed by a hash of its code, its props, the kit version and its
timing. The film is the beats stitched by ffmpeg, with the audio mixed separately and muxed in. A note on one beat
re-renders that beat only. An engine change in `core/engines/whatif` with its own plan.

**Audio outside the picture.** The mix (narration, score, effects) is built by the engine's Python steps and checked
on its own; the picture render carries no audio. A music note then costs a mix rebuild, not a render. The dub stem
already works this way (`dub/README.md`, `"narration": false`).

**Video 2 uses only what exists** (review consensus): still sheets, 720p beat renders with `--scale` and
`--frames`, the audio-only render, one 1080p. Beat caching, audio outside the picture and the frame-pack room are
built in parallel and adopted when ready; none of them gates video 2.

### 2b. The room before every owner look

- **G1 and G2.** Say Suppose adopts the quality spine at video 2: `channels/say-suppose/room.yaml` (first-time viewer
  on Grok, retention editor on GPT-5.6, fact-checker on Gemini, voice director and animator on Claude Sonnet; judge
  GPT-5.6), `audience.md` (the one named viewer, `rules/story.md`), `taste.md` (seeded with the owner's notes from
  the first video, newest first) and `room/seats/`. Seats fail a draft only on the must-pass checks in `rules/`.
  Until A2 enforces it, the `studio-room` skill runs the rounds and the report goes to the owner with the gate.
- **G1 adds a packaging seat** that runs the thumbnail checklist (`rules/thumbnails.md`, K1-K15) on three rendered
  candidates.
- **G4 and G5: a frame-pack room.** Seats read a frame every 2 s, the timed transcript, and the loudness, clicks and
  opening reports, as the first video's G4 and colour reviews did by hand. It extends the spine past its stated scope
  and gets its own short spec. It is QA before the owner's watch, never an approval.
- **Target:** one or two owner rounds per gate, against three to five on the first video. Every owner note goes into
  `taste.md` the same day.

### 2c. Measure

From video 2, every heavy step runs through `python -m studio.jobs run --step <step> --channel say-suppose --video <id>
-- <command>`. After a week, `python -m studio.jobs report` ranks the steps by total time. That list decides what
moves to the cloud.

### 2d. Later: cloud renders

Portable compute B2-B4 (Modal first, the Mac as fallback, about $0.15-0.30 a render) waits for a week of B1 timings
and an owner budget.

### 2e. Publish in one pass

The flow the owner liked on 2026-11-08: `omni publish` prepares the package; one review page in the session
(metadata, thumbnails, dub preview, checks); the private upload with thumbnail and subtitles through the API; the
Studio-only steps (dub track, end screen, A/B test) through Chrome; the owner reviews on the channel and schedules.
Runbook: `core/openmontage/skills/studio/studio-whatif-publish.md`. Not on video 2's critical path.

## 3. Cadence: the staggered conveyor

### Per-video budget (estimates until B1 measures them)

| Step | Agent time | Owner time |
|---|---|---|
| Packaging room, G1 | ~45 min | ~5 min |
| Research and claims, script room, G2 | ~2.5 h | ~15 min |
| Narration, G3 | ~45 min | ~8 min |
| Scene build, 720p rough cut, frame-pack room, G4 | ~4 h, falling as the kit grows | ~10 min |
| Score, mix, G5 | ~2 h | ~10 min |
| 1080p render, G6; publish prep, G7; private upload; Studio steps | ~2.5 h | ~20 min |

About 12 hours of agent wall time and 70 minutes of owner time a video. The reviewers called this a wish until it is
measured; B1 replaces it after the first week. One video cannot go from idea to upload in a day with the owner in the
loop, so a daily pace needs several videos in flight.

### Shape

- **Videos in flight one stage apart,** one parallel session and one worktree each. **Two in flight** until two
  videos have closed on the preview ladder, **then three.**
- **Seven gates, three sittings per video.** Gates are never skipped (CLAUDE.md). Each video's gates are taken in
  three sittings: G1 and G2; G3 and G4; G5, G6 and G7. A day's sittings mix different videos.
- **One render queue on the Mac.** Heavy renders take a lock, so two sessions never render at once. A small addition
  to `studio.jobs`.
- **Each video session writes only its video folder.** Reusable sets, props and actions reach the engine kit
  (`core/engines/whatif/src/kit`) only through a separate kit session and PR. Each video pins the kit version it
  started on.
- **Dubs follow the English lock:** the Hindi script after G4, the takes after G5. Dub takes are capped; a dub never
  sets the release date.

### The owner's day

| When | What | About |
|---|---|---|
| Weekday sitting 1 | G1 and G2 for one video, or G3 and G4 for another | 25-35 min |
| Weekday sitting 2 | G5, G6 and G7 for the video ahead; review it on the channel and schedule it | 40-50 min |
| Weekend | The idea room and the pick of the next five; catch-up | 1-2 h |

### Release ramp and the quality slip

- Every other day until **three finished videos sit private and scheduled**; then daily. Back to every other day if
  the buffer falls to one.
- **An empty slot beats a weak video.** A failed gate slips that video; the bar never drops to fill a slot. The owner
  never takes two broken gates in one day.
- The owner schedules every release by hand in Studio. The first video went out at 18:30 IST; the slot is revisited
  once the first videos have retention curves.

### Analytics loop

Each release gets a 24-hour and a 7-day read: impressions, CTR, retention in the first 30 seconds, the biggest dips,
average percentage viewed, comments. The first video's 72-hour read confirms or reorders batch 2. Comments add to the
"but what about" list and to the idea room's candidates.

### Order of work

| Before video 2's G2 | Beside videos 2 and 3 | Later |
|---|---|---|
| `room.yaml`, `audience.md`, `taste.md`; B1 wrapping on every heavy step; the render queue; the music rights check | Beat caching and audio outside the picture (engine plan); the frame-pack room spec; an ambience bed per set; the thumbnail image checks (K3, K4, K8-K11) | `omni publish`; cloud renders after B1; the idea room as a pipeline stage on the room tools |

## 4. Story, craft and thumbnail rules

Adopted by the owner on 2026-11-08 and 2026-11-09. The checks live in `channels/say-suppose/rules/`; `style.md`
carries the format.

**Must-pass, not a rulebook.** All three reviewers warned that 50 story and 45 music rules would either rubber-stamp
or stop G2 from closing. Each area has a short must-pass list; a seat fails a draft only on those. The research notes
are a shelf a seat may cite when it sees a lecture, a list, a scroll-away point or a muddy mix.

| File | Must-pass |
|---|---|
| `rules/story.md` | 12 checks: five lines first (Situation, Desire, Conflict, Change, Result; Tim Runia); confirm the click in 7 s; a second hook by 0:30; a habit, then the change; "but" or "therefore" between beats; every use has a gap; misconception first (Muller); a picture only this premise can show; earned stakes; the turn breaks a line already said; never say the feeling (2 + 2); leave fast. Plus no new power rule after the halfway point and no new person after 60% |
| `rules/sound.md` | 11 checks: a slim cue sheet (intent at G2, spotting at G4); one channel signal, thinner at the cost; music follows the story; the level changes only by an A/B the owner hears; at most two planned silences; the muted-music test (Kaspars); sound leads the cut; the rule is heard; a sound budget, no braams; a phone pass; rights recorded for every source |
| `rules/thumbnails.md` | K1-K15 on rendered candidates: a 0.5 s flash read, 3 or fewer focal points, head at least 25% of the frame, 3:1 greyscale separation, 3 words or fewer as a reaction or question, title pairing, one pointer at most, colour, both feed themes, the badge zone, the mobile title cut, payoff by 0:30, family likeness, three one-variable variants |
| `rules/ideas.md` | The idea room and the revised pick card (section 5) |

**Format changes in `style.md`:** no length cap (past about 8 minutes the story seat names why a viewer stays); beats
as shares of the runtime; the one named viewer (a young Indian, English-comfortable, on a phone in the evening) with
global packaging; a person to lose only when the premise earns one; the one wordless peak may run up to 10 s while
something still moves; the thumbnail rules; the cadence. The pipeline and the script skill no longer name a word
count.

**Open, before the next public video uses them:** the rights for the channel themes bought through Higgsfield
(Higgsfield and Eleven Music terms, and their use as ACE-Step reference audio). Two reviewers called this a stop-ship
item. If they are not cleared, the score is rebuilt without them.

**Settled by ear, not by rule:** the music level under the voice (26 dB today, or 20-22 dB with a 2 kHz notch). An
A/B render on the pause-time mix, free and local, before video 2's G5.

## 5. Topic research and scoring: the idea room

`rules/ideas.md` is the procedure. In short:

| Round | Who | What |
|---|---|---|
| Ideas | Five researchers, independent: Claude Fable 5.1, GPT-5.6 Sol, Gemini 4 Argon, Grok 4.7, Kimi K3 | 10 what-ifs each, from the channel brief and the list of neighbours' titles not to copy, nothing else |
| Merge | A neutral moderator that proposes nothing: GLM 5.2 | Merges duplicates (same daydream and same twist), marks the pick card, rates |
| Evidence | A data gatherer, no rating | Closest comparables on public YouTube search, signed out, in Chrome; whether the plain phrasing is flooded |
| Rate | All five, blind, each in its own shuffled order | Click, story, felt, perspective, buildable, overall |
| Converge | All five | Re-score with the anonymised spread and the evidence (Delphi); at most two rounds |
| Pick | The owner | From the final list ordered by median, with proposers, every model's score and the dissent |

**The revised pick card** (review consensus): a daydream the named viewer already had; you can live it from an
ordinary moment of their week; a wrong belief it breaks; one belief-breaking fact and one late mind-boggle; three
jumps of consequence; stakes the premise earns; buildable this week; not a neighbour's twist or title from the last
90 days (the same daydream with a new belief and a new thumbnail promise is eligible).

**Demand evidence** counts recent, small-channel, same-format videos most; a twist title is barely penalised by a
flood of plain-title copies; momentum decides the month's slot, not the rank; health, politics and tragedy are review
flags, not deductions; production cost is a scheduling constraint.

**How the session runs it.** `cursor-agent -p --mode ask --trust` from an empty folder for the Cursor models;
Claude Fable 5.1 through `claude -p` with tools off (Cursor blocks Fable on this account, so Fable has no web search).
The session only passes files, shuffles lists and takes medians (`room.py`); it gives no rating. Later, the room
becomes a pipeline stage on the room tools (ledger, sandbox, report).

**Lessons from the first run (2026-11-09):**
- Entries must be written to the same depth before anyone rates them. The ten carried-over entries were brief, came
  last in round 1 for that reason, and were rewritten by the moderator and re-scored from scratch.
- Ask for compact JSON with `--output-format json`: two moderator outputs broke on Cursor reconnects and typos, and were
  recovered or repaired mechanically (logged).
- The models agree closely (spread 1.65 then 1.23 points); their scores measure story strength more than demand. The
  evidence column keeps demand visible.

## 6. The slate

From the idea room's agreed list (`channels/say-suppose/backlog/idea-room-2026-11-09.md`, 52 topics), picked by the
owner on 2026-11-09 in a tone-varied order. Recorded in `backlog/topics.yaml` as `selected`.

| # | What-if | Idea room | Proposed by | Why here |
|---|---|---|---|---|
| 1 | What If You Knew the Last Time You'd See Someone? | M34, median 9 (9-10) | Kimi K3 | The strongest agreement; the exact premise has a recent 181K comparable |
| 2 | What If You Saw Everyone's Real Odds of Success? | M24, 9 | Gemini 4 Argon | The exam generation; a neighbour's wealth version did 1.6M in two weeks |
| 3 | What If You Got Paid Every Time Someone Thought of You? | M09, 9 | Claude Fable 5.1 | Funny first, then warm; a lighter film between two heavy ones |
| 4 | What If You Could Sell One Year of Your Life? | M35, 9 | Kimi K3 | The father's surgery bill; its tag needs a global version at G1 |
| 5 | What If You Could Never Forget Anything? | M03, 8 | Fable, Gemini, Grok | Three models proposed it on their own; the board-exam opening |

**Batch 2, provisional** (reconfirmed after the first video's 72-hour read and the next idea room): fast-forward the
boring parts of life (M25), hear everything said about you (M01), step into any photo for five minutes (M26),
everyone forgot you for a day (M28), everyone could see your search history (M38).

**Held:** UBI (G1 passed 2026-11-06; median 5, "a policy explainer in costume") and AI took your job (the owner's
idea; median 5, "the most crowded anxiety on YouTube"). The UBI folder stays; its research and claims are reusable.
Either can come back through a later idea room with a personal engine.

**Continuing.** Every weekend: run the idea room on new candidates (the models' fresh ideas, comments, the backlog,
the analytics of released videos), the owner picks the next five, G1 follows. No sequels in the first batches; a batch
never runs two films of the same kind back to back; about one in five videos breaks the frame (Dr. Plants).

## 7. Review log

**Strategy review, 2026-11-09** (GPT-5.6 Sol, Gemini 3.7 Flash, Grok 4.7 via Cursor, each blind, on the draft plan,
the craft notes and the topic scoring). Applied: must-pass lists with a shelf; point 9 bans the same twist, not the
daydream; the scorer favours recent same-format outliers and barely penalises a twist title; a slim cue sheet; music
rights before the next public video; one named viewer; seven gates in three sittings; a quality slip; no length cap
with a reason past 8 minutes; video 2 on the preview ladder only; two in flight before three; an analytics loop; the
first video's 72-hour read before batch 2. Not applied: cutting gates to three or four (CLAUDE.md keeps seven; they
are taken in three sittings instead); a hard 900-word or 5-7 minute cap (the owner wants no length limit); cloud
renders from day one (B1 first); daily only after a 7-10 video buffer (the owner chose the three-video buffer with a
quality slip).

**Idea room, 2026-11-09.** Run as designed, with the owner's change that the moderator is a model with no stake (GLM
5.2) rather than the session.
