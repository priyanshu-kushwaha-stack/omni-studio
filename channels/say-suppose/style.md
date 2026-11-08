# Say Suppose style

How this channel looks and sounds, beyond what `playbook.yaml` can hold. Design and the owner's decisions:
`docs/superpowers/specs/2026-11-06-say-suppose-format-design.md` (2026-11-06). Quality rules from the reference study,
all adopted by the owner on 2026-11-06 ("Adopt all"): `docs/research/2026-11-06-say-suppose-reference-study.md`.

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

### Story craft (reference study, adopted 2026-11-06)

- **A person to lose.** The viewer cares about a person, not the power. The cost lands near 60% of the runtime; at
  75 to 80% comes a choice between the power and that person.
- **Plant and pay off.** One line in the first minute comes back, in the same or mirrored words, in the last minute.
- **Wordless peaks.** The biggest beat gets 8 to 10 seconds with no narration: the music swells or drops, the colour
  drains, motion slows. Peaks are cut at half the usual rate.
- **Humour breaks tension**, about once a minute in the first half.
- **End on a twist and one question** to the viewer.

## Script rules

- 750 to 900 words, spoken at about 115 words a minute. 15 to 20% of the runtime is wordless: `> HOLD:` lines
  where action and music carry the story. (Was 900 to 1,100 at about 140; changed by the reference study.)
- Second person, present tense, short sentences. The narrator is dry, warm and exact, and never hypes.
- **Written to be spoken, not read** (owner, 2026-11-08, for every language): fragments, half-sentences, thoughts
  that trail off, a question answered at once, key words repeated. Not every sentence is complete, because that is not
  how people talk. The pause-time script (approved before this rule) stays as it is.
- **But the landing line finishes** (owner, 2026-11-08): fragments give colour; the line that lands an idea is a
  complete thought. Example, Hinglish: "अब सोचो — आप रोज़ ten seconds, बस ten seconds के लिए time को pause कर सकते
  हो। ये ten seconds… अब आपके हाथ में हैं।", not a fragment.
- **Every line carries an emotion** (curious, hushed, surprised, amused, warm…), given to the voice as a direction.
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

### Light, faces and shots (reference study, adopted 2026-11-06)

- **A mood light for every scene,** named in the script with `> MOOD:`: `morning`, `day`, `dusk`, `night`, `lamp`
  (one practical source, for grief or fear) and `frozen` (inside a pause). Each sets a colour grade, a rim light on the
  figures, depth of field on near and far layers, glows on light sources and a vignette. The sample's flat daylight
  is `day`, used sparingly.
- **The pause has its own signature:** the world drains to grey, and letterbox bars slide in only while time is
  stopped, then slide out as colour returns. No permanent letterbox.
- **Faces act with brows and eyelids:** sceptical, worried, sad, shocked, determined, relieved, afraid. A face
  reaction follows every reveal within 2 seconds.
- **Shot variety:** wides to set a place, close-ups for feeling, an insert or top-down shot every 20 to 30 s,
  over-the-shoulder with a blurred foreground head. Motion blur on fast moves; a slow-motion ghost at the peak.
- **Facts are drawn:** a number against a normal number, on the scene; paper diagrams that draw themselves (a tape
  from a bumper, a fall arc).
- **Sources go in the description, not on screen** (owner, 2026-11-07: the tags made little sense in a story
  channel). Every cited `claims.md` row is listed in the video's description at publish time.

## Opening, brand and calls to action

- **No empty opening** (owner, 2026-11-08: "First 2 seconds are empty ... the attention span is so low these
  days"): a sound a phone can play within 0.5 s and the first word within 1 s. `omni qc` checks it (`opening`) at the
  edit, the final watch and publish.

Owner, 2026-11-07:
- **Opening.** Hook first, then a 3 to 4 s ident in our own visual language, never "welcome to the channel".
- **Mid-video subscribe.** One subtle nudge with no voice, at a quiet moment or inside the world.
- **End card.** Like, subscribe and comment tags in the left two-thirds; the right third stays empty for end screens.

The parts and which video used which ident are in `brand/README.md`. The pause-time video uses the title card (C);
the ringed Earth (A) and the split-flap board (B, quieter sound needed) are kept for later videos.

**Colour (two-expert review, same day).** The world takes the mood; the characters keep their brand colours.
Vignettes stay at 0.45 or lighter, and the freeze is a neutral grey (`core/engines/whatif/src/kit/stage/moods.ts`).

## Signatures not to copy

From the reference study: Ifverse's black round-headed figures with white eyes, permanent letterbox with magenta
dusk, head-filling close-ups with a glowing brain trace, "What if your ___ was 10x ___?" cards and its coffee-cup
cold open; ConChaser's neon counters over heads and dark pill captions; Primal Space's colour-coded ghost figures.

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

- Narrator: Arthur (`voices.yaml`), on ElevenLabs Eleven v4 through Higgsfield, with per-line delivery direction
  (hushed, breathless, dry) from the script's narration notes. One take per line, cached by a hash of voice and text.
  Silences capped at 0.3 s. Takes play at 1.1x, countdowns at real speed (owner, 2026-11-07, after the G4 voice A/B;
  `timing.yaml` `tempo` and `tempo_lines`).
- **A score per video,** with cues that change at the beats: a theme for "you", a cold cue for the catch, silence
  before the twist. Music rises to near voice level in `> HOLD:` beats and ducks under the voice elsewhere. Source:
  ElevenLabs Music v2.5 through Higgsfield, or tracks from the Pixabay music library; never a track with unclear rights.
- Sound effects are synthesised with ffmpeg.
- Every narration and music call is paid: tool, provider, model and cost are announced and approved first.
- Mix: -14 LUFS integrated within 1 LU, true peak at most -1 dBTP (`channel.yaml` `loudness.story`).

## Other languages (multi-language audio)

Owner, 2026-11-08: every video gets dub tracks on the same YouTube video (Studio, Languages, Dub). Hindi first, then the
largest audiences. The music, effects and picture stay the same; only the narration changes, fitted to the English
timing.

- **Hindi is Hinglish:** everyday spoken Hindi with the English words people actually use ("time pause", "freeze",
  "ten seconds"), to reach the most viewers. Hindi words are written in Devanagari and English words in Latin script.
- **Spoken storytelling, not written prose:** incomplete sentences, fragments, thoughts that trail off, a question
  answered at once, key words repeated. Not every sentence is finished, because that is not how people talk.
- **Voice:** a designed Hinglish narrator, a warm Indian man in his late twenties, chosen by the owner from previews
  (`page/candidates/hindi-voice/`).

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
