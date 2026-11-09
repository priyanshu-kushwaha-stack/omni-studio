# Say Suppose style

How this channel looks and sounds, beyond what `playbook.yaml` can hold. Design and the owner's decisions:
`docs/superpowers/specs/2026-11-06-say-suppose-format-design.md` (2026-11-06). Quality rules from the reference study,
all adopted by the owner on 2026-11-06 ("Adopt all"): `docs/research/2026-11-06-say-suppose-reference-study.md`.
The next phase (2026-11-09: no length cap, story and sound must-pass checks, thumbnails, the idea room, cadence):
`docs/superpowers/specs/2026-11-09-say-suppose-next-phase-design.md`, with the checks in `rules/`.

## The format: a what-if you live through

One what-if per video. The narrator speaks to "you", and "you" are the figure on screen. The story is invented;
everything it says about how the world works is real and sourced. English, 16:9.

**No length cap** (owner, 2026-11-08). The story decides the length. Every beat passes the **cut test**: remove it, and
something felt or learned is lost. A script past about 8 minutes needs the story seat to name the felt reason a viewer
stays (`rules/story.md`). The 6 to 8 minute target (7:00) and its clock times are gone; beats are shares of the runtime.

| Share | Beat | Rule |
|---|---|---|
| within 20 s | The change | Open inside an ordinary moment that shows one habit of yours; the one change happens to you and hits that habit. The title question is spoken. No intro, no channel name |
| within 30 s | The rule | State the change exactly, once, and what you stand to gain or lose (the second hook) |
| to about 35% | The first jump | Small, personal, funny. You use it for dumb things; each use has a gap between what you expect and what you get |
| to about 65% | The second jump | Bigger consequences, for you and your person. Around the midpoint one thing you assumed turns out wrong; the cost lands near 60% |
| to about 90% | The third jump | The scale the title deserves, felt through you: a lifetime, a century, the planet as one image. The choice comes at 75 to 80%; the honest answer lands here |
| the last tenth | Back to you | You end as the opposite of the opening. One line on a real thing the viewer will see differently tomorrow, inside the last image; the comment invitation; stop |

The jump labels change with the topic (hours, year, century; or day, decade, forever). There are always three
jumps of consequence and each is bigger than the last.

### Picking a what-if (owner, 2026-11-08; revised 2026-11-09)

Topics come from the idea room (`rules/ideas.md`): five researcher models, a neutral moderator, ratings by all, one
agreed scored list; the owner picks. A topic must pass the nine-point pick card in that file: a daydream the viewer
already had; you can live it from an ordinary moment; a wrong belief it breaks; one belief-breaking fact and one late
mind-boggle; three jumps of consequence; earned stakes; buildable this week; not a neighbour's twist or title from the
last 90 days.

**The viewer** is one named person: a young Indian, comfortable in English, on a phone in the evening, whose week is
chai, the bus or metro, exams, the office and family. Every example and gag comes from that week; titles and
thumbnails stay readable worldwide (no `₹` or local slang in the English packaging).

### Writing it (owner, 2026-11-08 and 2026-11-09)

- **The twelve must-pass checks** in `rules/story.md`: five lines first (Situation, Desire, Conflict, Change,
  Result); confirm the click in 7 s; a second hook by 0:30; a habit, then the change; "but" or "therefore" between
  beats, never "and then"; every use has a gap; misconception first; a picture only this premise can show, before the
  midpoint; earned stakes; the turn breaks a line already said; never say the feeling; leave fast.
- **Felt, not taught.** Every fact lands on you or your person within two lines. Never two fact lines in a row while
  the story stands still.
- **Answer the viewer's "but what about".** Before writing, list the five questions a curious viewer would ask, in
  order; the script answers each where it arises. Comments add to the list.

### Story craft (reference study, adopted 2026-11-06)

- **A person to lose, when the premise earns one** (2026-11-09). The viewer cares about a person, not the power. The
  cost lands near 60% of the runtime; at 75 to 80% comes a choice between the power and that person.
- **Plant and pay off.** One line in the first minute comes back, in the same or mirrored words, in the last minute.
- **Wordless peaks.** The biggest beat gets 8 to 10 seconds with no narration: the music swells or drops, the colour
  drains, motion slows. Peaks are cut at half the usual rate.
- **Humour breaks tension**, about once a minute in the first half.
- **End on a twist and one question** to the viewer.

## Script rules

- No word count (2026-11-08; was 750 to 900). Spoken at about 115 words a minute; 15 to 20% of the runtime is
  wordless: `> HOLD:` lines where action and music carry the story.
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
- Something changes every 2 to 4 seconds: a camera move, a pose, a prop or a cut. No hold is longer than 6 seconds,
  except the one wordless peak, which may run up to 10 seconds while something still moves every 2 to 4 seconds (a
  camera drift, slow motion) (owner, 2026-11-09).
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

Revised 2026-11-09 (owner, from HimanshuG's thumbnail study and the Veritasium and Dr. Plants grids). You, large
(head at least a quarter of the frame height), left of centre, mid-reaction at the instant before the outcome. One
prop or stake, at most one crimson pointer to it. A dark or flat set behind, so you stand at 3:1 in greyscale. At most
three words on a stamped tag in Rubik 800: your reaction or a question, never a bare label. The thumbnail never repeats
the title, except the time markers of a DAY 1 / DAY N split for change-over-time stories. Three variants, each
differing in one thing, checked at G1 with `rules/thumbnails.md` (K1-K15).

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
  before the twist. Music rises in `> HOLD:` beats (today about 8 dB under the voice level; changed only by an A/B the
owner hears) and ducks under the voice elsewhere. Source:
  ElevenLabs Music v2.5 through Higgsfield, or tracks from the Pixabay music library; never a track with unclear rights.
- Sound effects are synthesised with ffmpeg; paper, card, pencil, tick and breath are recorded once and reused.
- **The eleven sound checks** in `rules/sound.md` (2026-11-09): a slim cue sheet (`cues.yaml`, intent at G2, spotting
  at G4); one channel signal, thinner at the cost; music changes at or after a reveal; the level under the voice is
  changed only by an A/B the owner judges by ear; at most two planned silences; the muted-music test with an ambience
  bed per set; the next scene's sound under the cut; the rule device is heard; a sound budget, no braams; a phone pass;
  rights recorded for every source (the Higgsfield themes cleared before the next public video uses them).
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
- **Voice:** Arthur, the channel's English narrator, reads the Hindi too (owner, 2026-11-08, after hearing 15 designed
  Hinglish voices and a local clone). Build and mix steps: the pause-time video's `dub/README.md`.
- **English comes first** (owner, 2026-11-08: the video "sounds much better in English"). Dubs widen the reach; they
  never set the release time.
- **Review the script twice** before any voice is paid for: two rounds of other models (GPT, Gemini, Grok through
  `cursor-agent`), asked whether it sounds like a person telling the story over chai. Round one finds the translated
  English; round two finds calques, wrong idioms ("नज़र हटती ही नहीं" means mesmerised, not keeping watch), gender
  slips and "हम" for "आप". The owner then rewrites lines in their own words: take those as they are.
- **Fit the English slot:** Arthur reads Hinglish about a third slower than English. Write to the slot, read it at
  tempo 1.2 (English is 1.1), and let `dub_narration.py` borrow up to 0.6 s of gap or speed a line up to 1.15x. Hear
  the opening 10 lines before paying for the rest.
- **Numbers stay as people say them:** the countdown reuses the English takes; "zero point four five" becomes "आधे
  second से भी कम" when that is how it is said.
- **Subtitles for every track,** from the script, not speech recognition: Whisper's Hindi word times stop early.
- **More languages** wait for watch-time data (Analytics, by audio track): about 24 credits and a review cycle each.
  YouTube's free auto-dubbing needs an eligible channel.

## Shorts

A Short is one beat of a finished long video, re-staged for 9:16: the opening change or the midpoint reversal,
30 to 50 seconds, ending on a line that points to the long video. It gets its own seven gates. Its pipeline
(`studio-whatif-short`) is written when the first long video passes its rough cut; until then `channel.yaml`
lists only `story`.

## Cadence

`cadence: daily` is the owner's target (2026-11-06); every other day is the fallback. How it is reached (owner,
2026-11-09; details in the next-phase spec):

1. **A staggered conveyor.** Videos in flight one stage apart, one session and one worktree each, writing only their
   video folder. Two in flight until two videos have closed on the preview ladder, then three. Reusable sets, props
   and actions reach the kit only through a separate kit session.
2. **Seven gates, three sittings.** Gates are never skipped. Each video's gates are taken in three sittings:
   G1 and G2; G3 and G4; G5, G6 and G7. A day's sittings mix different videos.
3. **Cheap previews.** Still sheets, 720p beat renders and audio-only mixes for notes; one 1080p render for G6 and
   the upload. One render at a time on the Mac.
4. **Release ramp and the quality slip.** Every other day until three finished videos sit private and scheduled,
   then daily; back to every other day if the buffer falls to one. An empty slot beats a weak video: a failed gate
   slips that video, never the bar.
5. **A scene kit.** Every set, prop and action is code; the first videos build the kit and later videos reuse it.

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
