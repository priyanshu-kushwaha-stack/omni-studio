# Say Suppose: video format

Draft for the owner's review, 2026-11-06. It covers the long-form format, the channel files that record it, the
pipeline it runs through, and the first video up to the script gate. The engine that renders it is a separate job.

## Goal

Say Suppose has one repeatable format, written down well enough that any session can make the next video, and
its first video sits at the script gate (G2) with a complete claims ledger.

## Decisions (owner, 2026-11-06)

| Question | Decision | How it was decided |
|---|---|---|
| Look | The pause-time sample, unchanged | Three painted looks were shown and rejected ("none of these"). The owner pointed at `~/Exploration/sandbox/what-if-pause` (`out/pause.mp4`). Of three treatments of that sample (as it is, re-coloured to the page's indigo, on a painted backdrop) the owner said "1. only looks right." |
| Length | 6 to 8 minutes | Picked over "about 5 minutes" and "2 to 3 minutes first" |
| Voice | Arthur, the sample's narrator | Picked over an audition and the owner's cloned voice |
| Cadence | One video every day, and Shorts cut from those videos | The owner's own answer |
| Pipeline | A new seven-gate what-if pipeline in `core/openmontage` | Picked over the upstream explainer pipeline and reusing `studio-dialogue` |

Reference channel: Awaken (`@Afterimath`). On 2026-11-06 it had six videos of 5:32 to 8:14, all second-person
what-ifs, 19.8K subscribers, one video at 5M views. Say Suppose takes the shape, not the topics or the artwork.

## The format: a what-if you live through

One what-if per video. The narrator speaks to "you", and "you" are the figure on screen. The story is invented;
everything it says about how the world works is real and sourced. This is the promise on the channel page: no
hand-waving, sources in the description.

### Beats (target 7:00, range 6:00 to 8:00)

| Time | Beat | Rule |
|---|---|---|
| 0:00-0:20 | The change | Open inside an ordinary moment; the one change happens to you. The title question is spoken. No intro, no channel name |
| 0:20-0:50 | The rule | State the change exactly, once, and what you stand to gain or lose |
| 0:50-2:30 | The first hours | Small, personal, funny. You use it for dumb things. Each gag rests on a sourced fact |
| 2:30-4:30 | The first year | It spreads: your street, your job, your city. Around 3:30 one thing you assumed turns out wrong |
| 4:30-6:15 | The long run | The scale the title deserves: a lifetime, a century, the planet. The honest answer lands here |
| 6:15-7:00 | Back to you | One image, one line on what this says about the real world, an invitation to leave a what-if in the comments, stop |

The clock labels change with the topic (hours, year, century; or day, decade, forever). There are always three
jumps and each is bigger than the last.

### Script rules

- 900 to 1,100 words. The sample speaks about 110 words a minute because action holds the screen between lines;
  a full video averages about 140.
- Second person, present tense, short sentences. The narrator is dry, warm and exact, and never hypes.
- About once a minute the narrator puts a choice to you and the figure answers at once by acting. No held pause,
  no quiz board, no countdown that waits for the viewer.
- Other characters speak only in speech bubbles of four words or fewer (`> BUBBLE:`).
- Scene directions are `> SCENE:` lines. They are not spoken.
- **Digits mean facts.** Every spoken number, date, name or finding about the real world cites a ledger row,
  for example `(c07)`. Story numbers are written as words ("day twelve", "ten seconds") so that the claims check,
  which flags any uncited digit, tells the two apart.
- What you do in the story is never stated as fact. Where the science is uncertain or disputed, the narrator
  says so, and the ledger row is marked `contested`.
- Body and health topics explain; they never advise.

### Claims ledger

`claims.md` in the video folder, in the format `core/studio/claims.py` checks: id, claim as spoken, source URL,
verbatim quote, status (`sourced`, `contested`, `spot-checked` or `dropped`), note. The sources go into the video
description at G7.

## Look

The sample's look, recorded so it can be rebuilt.

| Role | Value |
|---|---|
| Ink | `#23252B` |
| Paper | `#F3E9D7` |
| Mustard (your head) | `#F2B632` |
| Teal (your scarf) | `#1D9A8F` |
| Crimson (the stranger, alarms) | `#D8344F` |
| Lettering | Rubik 800 |
| Frame | 1920x1080, 30 fps |

- Everything is drawn in code as flat paper-cut shapes. No AI images or AI video clips appear in a video.
- Sets are layers at different depths that drift against each other as the camera moves. Near layers carry a soft
  cut-paper shadow. A paper grain and a vignette sit over the whole frame.
- Figures are rigged: round head, two large eyes, a mouth with five shapes, limbs with hands. They walk, run,
  tiptoe, reach and blink. No lip-sync and no line boil; neither exists in this rig.
- On-screen text is a stamped paper tag, a split-flap counter or a speech bubble. Nothing else is written on
  screen. Text stays off faces and inside the safe area, and the last 15 seconds keep the right third quiet for
  end screens.
- Each video has one **rule device**: a single visual that shows the changed rule whenever it applies. In the
  sample it is the grey wave that drains the world while you stay in colour.
- Something changes every 2 to 4 seconds: a camera move, a pose, a prop or a cut. No hold is longer than 6 seconds.
- Motion is timed to spoken words through named cues, never to hard-coded times, so a new voice take re-times
  the scene.

### How it differs from Professor of Us

| | Professor of Us | Say Suppose |
|---|---|---|
| Line | Thin black marker outlines, hand-drawn stills | Filled vector shapes and thick rounded limbs |
| Ground | Cream paper in every frame | Full-colour sets; cream only on tags |
| Type | Patrick Hand (handwriting) | Rubik 800 |
| Telling | Dialogue between a recurring cast | One narrator speaking to you |
| Heads | No colour, dots for eyes | Coloured heads, large eyes |

Both channels use stick figures. `omni similar` compares frames, thumbnails, titles and scripts, and runs at the
edit, final-watch and publish gates.

## Cast

| Who | Look | Voice |
|---|---|---|
| **You** | Mustard head with a tuft, teal scarf, ink body | None. You react; at most a bubble |
| **The narrator** | Never seen | Arthur |
| **The stranger** | Crimson head, long dark coat | None |
| **Everyone else** | Pastel heads, ink bodies. Stock roles: the boss (tie), the kid (cap) | Bubbles only |

The stranger is hidden once in every video as a detail to spot on a second watch, as in the sample's crowd. They
never affect the plot unless a script says so.

## Voice and sound

- Narrator: Higgsfield `text2speech_v2`, ElevenLabs variant, preset voice Arthur
  (`30fc8796-ceb6-4a66-b3a7-4a145ef7f346`). One take per line, cached by a hash of voice and text, so an
  unchanged line costs nothing on a rebuild. Silences capped at 0.3 s, then `atempo 1.1`.
- Every narration call is paid. Tool, provider, model and cost are announced and approved first.
- Sound effects and the quiet bed are synthesised with ffmpeg. No licensed music, so `music.default` stays null.
- Mix target: -14 LUFS integrated, within 1 LU; true peak at most -1 dBTP. The sample measures -14.9 LUFS.

## Shorts

A Short is one beat of a finished long video, re-staged for 9:16: the opening change or the 3:30 reversal,
30 to 50 seconds, ending on a line that points to the long video. It gets its own seven gates, like every video
in this repo. Its pipeline (`studio-whatif-short`) is written when the first long video passes its rough cut,
because it needs the engine and a finished scene to cut from. Until then `formats` lists only `story`.

## Cadence: what daily needs

`cadence: daily` is recorded as the target. Three things stand between the first video and that pace:

1. **A scene kit.** Every set, prop and action is code. The 34-second sample has 4 scenes; a 7-minute video has
   about 50. The first videos build the kit (rooms, streets, vehicles, crowds, weather) and later videos reuse it.
2. **Gate load.** Seven owner approvals per video. A daily video with a daily Short is fourteen a day. Gates are
   not skipped; they can be taken several videos at a sitting.
3. **Narration cost.** See Costs.

The first three videos will each take longer than a day.

## Channel files

| File | Gets |
|---|---|
| `channel.yaml` | `formats: {story: studio-whatif}`, `cadence: daily`, `loudness.story`, comments on `risk_class` and budget. `status` stays `draft`, `budget_usd_per_video` stays 0 until the owner sets it |
| `style.md` | The format, script rules, look, Shorts and cadence sections above, and where the sample lives |
| `playbook.yaml` | The palette, Rubik, motion and audio rules as an OpenMontage playbook |
| `cast.md` | The cast table and the script line format |
| `voices.yaml` | The narrator entry |
| `page/` | Unchanged |

`risk_class` stays `B`: original code-drawn art, a preset voice, science claims cited. The letters are still not
defined anywhere in the repo. `upload.contains_synthetic_media` stays null, so each video answers it at G7.

## Pipeline: `studio-whatif`

New files only, all with `studio` in the name, recorded in `core/PATCHES.md`. No existing upstream file changes.

- `core/openmontage/pipeline_defs/studio-whatif.yaml`
- `core/openmontage/skills/studio/studio-whatif-{proposal,script,narration,rough-cut,edit,final-watch,publish}.md`
- a test in `core/studio/tests/` that loads the manifest and checks its gates, checks and skills

| Gate | Stage | Automated checks |
|---|---|---|
| G1 | `proposal` | none |
| G2 | `story_script` | claims |
| G3 | `narration` | claims, clicks |
| G4 | `rough_cut` | none |
| G5 | `final_edit` | loudness, clicks, similarity |
| G6 | `final_watch` | loudness, clicks, similarity |
| G7 | `publish_prep` | claims, loudness, clicks, similarity, upload_request |

Every stage is a human gate. Renders come from the engine, so `render_runtime` is `external`, as in
`studio-dialogue`. Stages from G3 on name no tools until the engine exists; their skills say so.

## Engine (separate job, not in this pass)

The rig lives in a sandbox with no commits. Before the first video can reach G3 it has to come into omni-studio
as an engine beside `core/engines/pou`: the Remotion source, the build pipeline, its tests, the pinned packages
in `core/lock.yaml`, and studio tool wrappers. It gets its own spec and plan.

## Costs

- This pass: no paid call.
- Narration, per video: not yet known. The sample's 13 lines (62 words) were quoted 1.95 Higgsfield credits and
  billed 3.60; the cause of the gap was never found. Scaled by line count, a 7-minute script would be somewhere
  between 20 and 60 credits. The first narration call for the video is quoted and approved at G3.
- Pictures: none. The look is code.

## Open items for the owner

1. The channel page (painted indigo Earth) no longer matches the videos. Redo the picture and banner in the
   video look, or keep them? Not needed before the first upload.
2. The stranger as a hidden detail in every video: keep, or leave it to the pause story?
3. A budget per video, before G3.

## Out of scope

The engine import, the Shorts pipeline, thumbnails beyond the G1 packaging, narration, any upload, and any
change to the other three channels.

## Done when

- The owner has approved this design.
- `omni check say-suppose` passes and `make test` is green with the new pipeline test.
- A first video made with `omni new-video say-suppose "<title>" --format story` has passed G1 by the owner's
  approval and sits at G2 `awaiting_human`, with `script.md`, a `claims.md` in which every row has a source, and
  `omni qc say-suppose <video> story_script` passing.
- No asset has been generated and no paid call made.

## Amendment, 2026-11-06 (owner: "Adopt all")

After the reference study (`docs/research/2026-11-06-say-suppose-reference-study.md`) the owner adopted all eleven
proposals. They replace the matching rules above; `channels/say-suppose/style.md` is the current statement.

- Pace: about 115 words a minute, 750 to 900 words, 15 to 20% wordless (`> HOLD:`); no speed-up on narration.
- Light: a mood per scene (`> MOOD:` morning, day, dusk, night, lamp, frozen) with grade, rim light, depth of field,
  glows and vignette. The pause adds letterbox bars only while time is stopped.
- Faces: brows and eyelids; a reaction within 2 seconds of every reveal. Shot variety, motion blur, drawn facts.
- Source tags on screen for cited numbers, from `claims.md`.
- Story: a person to lose, the cost near 60%, a choice at 75 to 80%, a planted line paid off at the end.
- Sound: a score per video (ElevenLabs Music v2.5 through Higgsfield, or Pixabay); narration on Eleven v4 with Arthur
  and per-line direction (quoted 2026-11-06: 0.23 credits for a test line; 8.72 credits per minute of music).

