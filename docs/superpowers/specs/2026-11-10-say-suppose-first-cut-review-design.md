# Say Suppose: review on a first cut, five gates, small rooms

Owner, 2026-11-10: "When the script is coming to me for review it should come with narration also ... done using
locally available tools. When things are finalised then we will use ElevenLabs audio finally in the video ... and that
too if it actually improves quality." Then: "lets generate first cut of video as well ... first cut is shown with first
review for better understanding of what we are making and how we are making it", "redo the GATES if needed", and
"lets keep 1 or 2 reviewer in the room". Design agreed in the session ("Looks good now").

Applies to Say Suppose's pipeline (`studio-whatif`) only. Professor of Us (`studio-dialogue`, `studio-short`) is
unchanged.

## 1. Why

The owner reviews a film, not a text. Reading a script without hearing it or seeing its pictures hides most of what
the owner judges: pace, tone, whether a line is needed over a shot. Paid narration before the script is final buys
takes that get thrown away. So the first review gets everything that can be made for free, and the paid voice comes
last, only if it is better.

## 2. The order

| Step | What happens | Cost | Gate |
|---|---|---|---|
| 1. Packaging | Unchanged: rendered title-thumbnail pairs, the five lines, `> UNDER:` | free | **G1** |
| 2. Drop 1 (minutes) | Fable's draft passes lint and `omni qc` (claims). A local narration of the whole script is made in the channel's local voice. The owner gets script and audio together; the story room runs one round beside the owner's listen. | free | |
| 3. Drop 2 (same day) | The first cut: the real kit scenes from each `> SCENE:`, at 720p (`whatif_render quality=preview`), the local narration, the channel's music bed (`brand/music/`). The owner's full first review is on this cut. | free | |
| 4. Story loop | Owner notes, tagged by part (script, narration, picture, music), go to the writer. Only changed lines are re-voiced; only scenes whose words changed are re-rendered (#34's change detection). The cut is updated each pass. Repeats until the owner locks. | free | **G2 Story lock** |
| 5. Picture loop | On the locked narration: key shot (2-3 renders, the owner picks), pacing, text, music and mix, at 720p. | free | |
| 6. Final voice A/B | The opening ten lines and the dilemma line are taken in paid Arthur (ElevenLabs v4 via Higgsfield, quoted first, owner's yes). The owner compares by ear against the local voice. If paid is clearly better: one quote for the full script, the owner's yes, the full paid batch, and the cut re-times itself (motion keys on cue words, never on hard-coded times). If not, the local voice ships. | paid only on the owner's yes | **G3 Picture lock** after it |
| 7. Final | One 1080p render, the owner's 1x watch with cold viewers | | **G4 Final watch** |
| 8. Publish | Signed file and metadata, private upload, public flip by hand | | **G5 Publish** |

No paid call happens before G2. Every paid call is announced first (tool, provider, model, cost), as today.

## 3. The gates: seven become five

| Gate | Pipeline stage | The owner approves | Replaces | Checks (`studio_checks`) |
|---|---|---|---|---|
| G1 Packaging | `proposal` | title, rendered thumbnail, five lines, `> UNDER:` | G1 | unchanged |
| G2 Story lock | `story_script` | the script and its local narration together, read and heard in the cut | old G2 (`story_script`) + G3 (`narration`) | claims, clicks |
| G3 Picture lock | `final_edit` | the cut, key shot, text, music and mix, and the voice the A/B chose | old G4 (`rough_cut`) + G5 (`final_edit`) | loudness, clicks, opening, similarity |
| G4 Final watch | `final_watch` | the 1080p final at 1x with cold viewers; the media proof | G6 | unchanged |
| G5 Publish | `publish_prep` | file and metadata digest, private upload | G7 | unchanged |

- Stage names `story_script` and `final_edit` are kept so the room (`times.CHECKPOINTS`), checks and approval code keep
  working; the `narration` and `rough_cut` stages leave `studio-whatif.yaml`. Their skills fold into the story and
  picture skills (`studio-whatif-script.md` gains the local narration and first cut; `studio-whatif-edit.md` gains the
  rough-cut steps and the voice A/B).
- `final_watch` and `publish_prep` keep their names, their media proof and the upload chain exactly as today.
- Only the owner passes a gate, through `omni approve`, which re-runs the checks first. Unchanged.
- The clicks check at `story_script` reads `narration/narration.wav` and `words.json` (today only the `narration`
  stage looks there; `checks.run_stage` line 253).

## 4. Local narration

- Engine: chosen by ear from the audition of 2026-11-10 (film 2's opening; Qwen3 and Chatterbox, both cloned from 13 s
  of Arthur's paid takes from the pause sample). Qwen3 read 27 s of narration in 42 s, Chatterbox 34 s in 125 s; both
  21 % WER, mostly digits against spelled-out numbers. **Open: the owner's pick.** Until then, Qwen3 (faster).
- `voices.yaml` narrator gains `local: {engine: <pick>, voice_ref: brand/voice/arthur-ref.wav, voice_text: ...}`
  beside the paid entry. The reference clip and its transcript go into the channel's brand folder (git-ignored media,
  like other audio).
- Takes per script line, cached by a hash of engine, voice reference and spoken text, so a changed line is the only
  line re-voiced. The same stitch rules as the paid voice (silence capped at 0.3 s, no speed-up).
- Delivery: the writer's per-line emotion and directions in `say.yaml` still apply; local engines that cannot take
  direction ignore it, and the paid A/B is where direction pays off.
- Runs through `studio.jobs run --step local-narration --channel say-suppose --video <id>` so its time is recorded.
- `room.yaml` `pitch_clip` becomes `pre_g2_local`; its validator (`config._voices_problems`) learns to accept a voice
  whose `local` entry is a free local engine.

## 5. The rooms: one or two reviewers

| Room | Reviewers | Notes |
|---|---|---|
| Story room (G1 and the story loop) | Story editor (GPT-5.6 Sol) and viewer (Claude Opus 5.5) | The story editor takes the director's checks too (#2 opening, #3 0:30 hook, #8 key shot, #10). The director seat and the judge leave. |
| Claims check | Gemini 3.8 Flash | Pass or fail against `claims.md` only, no story notes. Its blockers are never cut. Counts as a check, not a voice. |
| Picture room (picture loop) | One of director or editor, reading a frame every 2 s with the timed transcript | Not built; until it is, the owner is the picture's only reviewer. |
| G4, G5 | none | Owner and cold viewers. |

Room code changes:
- The judge becomes optional (`judge:` may be omitted). With no judge, a round ships when the required seats are ok,
  and the writer merges the notes, sending any it will not take to the owner as one line.
- `fact` stays a required role so its blockers can never be cut, but the room report lists it under checks.
- Family rule unchanged: the required seats span two or more families other than the writer's (openai, google; the
  viewer is anthropic but not the writer's own model).
- Limits unchanged: three blockers, three suggestions, three keep lines per seat; one room round, then the owner's notes.

## 6. Rule text that changes

- `CLAUDE.md`: "Seven human gates" becomes five for Say Suppose (Professor of Us keeps seven); the gate table gains a
  Say Suppose column; G2's "read in full before any asset is generated" becomes "before any paid asset is generated".
- `channels/say-suppose/channel.yaml`: "seven owner gates" becomes five.
- `core/openmontage/pipeline_defs/studio-whatif.yaml`: five stages, header text, `studio_checks`.
- Skills: `studio-whatif-script.md`, `studio-whatif-edit.md`, `studio-whatif-final-watch.md`,
  `studio-whatif-publish.md`, `studio-room.md`; `studio-whatif-narration.md` and `studio-whatif-rough-cut.md` are retired.
- `channels/say-suppose/room.yaml` and `room/README.md`: two seats, no judge, fact as a check, `pitch_clip: pre_g2_local`.

## 7. Films in progress

- Film 1 ("the last time you'd see someone"): old G2 passed, no narration yet. It enters the story loop with the script
  approved: drop 1 and drop 2 are made, the owner reviews the cut, and G2 Story lock is the next gate. The old G2
  approval stays in its history.
- Film 2 ("real odds"): old G2 awaiting. It gets drop 1 and drop 2 next.
- The pause and UBI folders (2026-11-06) finish as they started.

## 8. Fixes found on the way

- `core/engines/pou/scripts/pou_paths.path` calls `.resolve()`, which follows the `.venv-media/bin/python` symlink to
  the bare interpreter, so the local TTS engines start without their packages. Use `os.path.abspath` (no symlink
  resolution). It is engine code, so the fix lands in its own commit with a test.

## 9. Testing

- `studio-whatif.yaml` loads with five stages; `stage_checks` gives the table in section 3.
- `omni approve` of `story_script` refuses while the clicks check fails on the local narration.
- `room.yaml` with no judge validates; a round with story, viewer and fact ok ships with no judge file; evidence passes.
- `_voices_problems` accepts a narrator with a `local` free engine and refuses a paid-only narrator under `pre_g2_local`.
- The local narration cache re-voices only changed lines (unit test on the hash).
- `pou_paths.path` keeps a symlinked interpreter path.
- Professor of Us room and pipelines unchanged (existing tests).

## 10. Not in this change

- The picture room (frame packs, slide detector).
- Per-gate seats beyond the story room.
- The reading room after release.
