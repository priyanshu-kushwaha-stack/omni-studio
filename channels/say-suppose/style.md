# Say Suppose style

How this channel looks and sounds, beyond what `playbook.yaml` can hold. Design and the owner's decisions:
`docs/superpowers/specs/2026-11-06-say-suppose-format-design.md` (2026-11-06).

## The format: a what-if you live through

One what-if per video. The narrator speaks to "you", and "you" are the figure on screen. The story is invented;
everything it says about how the world works is real and sourced. English, 16:9, 6 to 8 minutes (target 7:00).

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

## Script rules

- 900 to 1,100 words. Action holds the screen between lines, so a video averages about 140 words a minute.
- Second person, present tense, short sentences. The narrator is dry, warm and exact, and never hypes.
- About once a minute the narrator puts a choice to you and the figure answers at once by acting. No held pause,
  no quiz board, no countdown that waits for the viewer.
- Other characters speak only in speech bubbles of four words or fewer.
- **Digits mean facts.** Every spoken number, date, name or finding about the real world cites a `claims.md`
  row, e.g. `(c07)`. Story numbers are written as words ("day twelve", "ten seconds"), so the claims check, which
  flags any uncited digit, tells the two apart.
- What you do in the story is never stated as fact. Where the science is uncertain or disputed the narrator says
  so, and the ledger row is `contested`.
- Body and health topics explain; they never advise.
- Line format: `cast.md`.

## Claims

`claims.md` in every video folder: id, claim as spoken, source URL, verbatim quote, status, note
(`core/studio/claims.py`). Sources are fetched and read, never recalled. They go into the description at G7.

## Look

The owner's pause-time sample, unchanged (`~/Exploration/sandbox/what-if-pause`, `out/pause.mp4`). The owner saw
three painted looks, then that sample re-coloured and on a painted backdrop, and said of the sample as it is:
"1. only looks right."

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
  tiptoe, reach and blink. No lip-sync and no line boil.
- On-screen text is a stamped paper tag, a split-flap counter or a speech bubble. Nothing else is written on
  screen. Text stays off faces and inside the safe area; the last 15 seconds keep the right third quiet for end
  screens.
- Each video has one **rule device**: a single visual that shows the changed rule whenever it applies. In the
  sample it is the grey wave that drains the world while you stay in colour.
- Something changes every 2 to 4 seconds: a camera move, a pose, a prop or a cut. No hold is longer than 6 seconds.
- Motion is timed to spoken words through named cues, never to hard-coded times, so a new voice take re-times
  the scene.

## Thumbnails

You, large, mid-reaction, with one prop that carries the what-if. At most three words, on a stamped tag in
Rubik 800. A flat set colour behind, chosen to hold contrast with mustard at feed size. The thumbnail never
repeats the title.

## Not Professor of Us

| | Professor of Us | Say Suppose |
|---|---|---|
| Line | Thin black marker outlines, hand-drawn stills | Filled vector shapes and thick rounded limbs |
| Ground | Cream paper in every frame | Full-colour sets; cream only on tags |
| Type | Patrick Hand (handwriting) | Rubik 800 |
| Telling | Dialogue between a recurring cast | One narrator speaking to you |
| Heads | No colour, dots for eyes | Coloured heads, large eyes |

## Voice and sound

- Narrator: Arthur (`voices.yaml`). One take per line, cached by a hash of voice and text. Silences capped at
  0.3 s, then `atempo 1.1`.
- Every narration call is paid: tool, provider, model and cost are announced and approved first.
- Sound effects and the quiet bed are synthesised with ffmpeg. No licensed music.
- Mix: -14 LUFS integrated within 1 LU, true peak at most -1 dBTP (`channel.yaml` `loudness.story`).

## Shorts

A Short is one beat of a finished long video, re-staged for 9:16: the opening change or the 3:30 reversal,
30 to 50 seconds, ending on a line that points to the long video. It gets its own seven gates. Its pipeline
(`studio-whatif-short`) is written when the first long video passes its rough cut; until then `channel.yaml`
lists only `story`.

## Cadence

`cadence: daily` is the owner's target (2026-11-06). Three things stand between the first video and that pace:

1. **A scene kit.** Every set, prop and action is code. The 34-second sample has 4 scenes; a 7-minute video has
   about 50. The first videos build the kit and later videos reuse it.
2. **Gate load.** Seven owner approvals per video; a daily video with a daily Short is fourteen a day. Gates are
   never skipped; they can be taken several videos at a sitting.
3. **Narration cost.** Unknown until the first quote at G3. The sample's 13 lines were quoted 1.95 Higgsfield
   credits and billed 3.60.

## Engine

The rig is not in this repo yet. Before a video can reach G3 it has to be brought in as an engine beside
`core/engines/pou`, with its own spec and plan. Pipeline: `core/openmontage/pipeline_defs/studio-whatif.yaml`.

## Channel

handle: @SaySuppose
channel_id: UC_Ve59ry_JYiX8sUaSOV8sQ
page: `page/` (painted indigo Earth, approved 2026-11-06). It does not match the video look; whether to redo it
is an open item for the owner.
reference: Awaken (`@Afterimath`). On 2026-11-06: six videos of 5:32 to 8:14, all second-person what-ifs. Say
Suppose takes the shape, not the topics or the artwork.
