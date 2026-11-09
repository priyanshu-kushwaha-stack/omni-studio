# Say Suppose: rules from the owner's five references

2026-11-09. Research note for the next videos after "What If You Could Pause Time for 10 Seconds a Day?". No repo file
was changed and no paid call was made. Each rule has a one-line test, a source with timestamps, and the seat that
checks it: viewer, story, fact, voice, craft, and a new **packaging** seat at G1 for titles and thumbnails.

Read alongside `research-story-craft.md` (IDs H, S, C, Q, T, N, V, W) and `research-music-sound.md` (IDs A to H), which
sit in this folder. Rules that only repeat those notes or `style.md` are left out. Where a reference adds a number or a
mechanism to an existing rule, the row says **sharpens**. Where it backs the rule with no change, it says
**supports**. Where it goes against the rule, it says **contradicts**.

## How each reference was read

| # | Reference | What was read |
|---|---|---|
| 1 | Tim Runia, "The ONLY 5 Lines You Need To Tell Any Story" (NeTJRCycYXQ) | Full YouTube transcript (0:00-9:29), in Chrome |
| 2 | Reinis Kaspars, "Why Sound Design Matters To Me" (XBMEACTDsnY), 215.8K views | Full YouTube transcript (0:26-30:55), with chapters, in Chrome |
| 3 | Dr. Plants (@DrPlants) | The local mp4 "World's Biggest vs Smallest Egg" (14:18): frames every 4 s on 6 contact sheets, ffmpeg loudness, silence and scene-cut detection, a local faster-whisper (small.en) transcript. In Chrome: the channel's videos page (Latest and Popular) and the YouTube transcript of "Simulating the Desert for 100 Days" (118M views) |
| 4 | HimanshuG, "Science Behind Thumbnails That Actually Work." (9_7q6vUaRsM), 164.7K views | Full YouTube transcript (0:00-14:42). It appears to be machine-translated from Hindi, so some wording is garbled; only the clear claims are used |
| 5 | Veritasium (@veritasium/videos) | Latest and Popular grids (about 36 thumbnails each), titles and view counts, screenshots at reduced page zoom |

Scratch media (frames, sheets, feed-size renders, transcript) are in
`/Users/priyanshu.kushwaha/.claude/tmp/claude-502/-Users-priyanshu-kushwaha-Exploration-projects-omni-studio--claude-worktrees-say-suppose-next-1cb85a/497f223e-5bb0-4b05-8cc3-9a1256c28ae2/scratchpad/refs/`.

---

## 1. Story continuation (Tim Runia; Dr. Plants)

### What the references show

**Tim Runia.** He says a story loses its core in the mass of filmmaking decisions (1:21-1:43). The fix is to write five
lines before anything else: **Situation, Desire, Conflict, Change, Result** (2:00-2:41). He shows the five lines on
The Lion King (3:18-3:55) and on his own eight-minute video (6:20-7:02). He then expands the same story to ten lines
without changing the core (7:05-8:21). The five lines are "a launchpad", and you return to them whenever the project
overwhelms you (5:56-6:17). Two details matter for us. Desire is where viewers "lean in" (4:42-5:00), and Change can be
"a different way of seeing", not only an event (2:26-2:33). His own opening (0:00-0:31) is a five-line story in 30
seconds.

**Dr. Plants, "Biggest vs Smallest Egg"** (local file; times from the whisper transcript; 124M views, the channel's top
video):
- **The cold open is the five lines in 28 s.** Situation (biggest and smallest egg, 0:00), Desire (which makes the
  best pet, 0:05), Conflict as a rising triad (lost "my space, my sleep, and my sanity", 0:13), and a flash-forward of
  the low point: "I can't do this anymore" (0:26). That exact line comes back at 12:51, at 90% of the runtime.
- **Three braided threads** (quail, duck, ostrich). Each thread is left on an open danger and resumed later. At 4:11
  the black duckling may be killed by the others, but "I didn't have time to find out", and the story cuts to the
  ostrich hatching. It is resolved at 5:18-6:15. The quail's splayed leg (3:34) gets a band-aid and "only time will
  tell" (3:49). The thread returns at 6:17 with a recall question ("did the quail finally learn how to walk?") and the
  verdict at 6:28.
- **A comparison ladder.** "A single duck is bigger than all the quail combined… not even 20 ducks are equal to a
  single ostrich egg" (2:25-2:36). Every step up in scale is measured against the step before.
- **Every fix opens the next problem.** The home isn't fit for ostriches, so the office becomes a nursery. Ducklings
  can't sleep without him. The duckling is attacked, so he uses a laser. They overheat, so he builds a water park. They
  outgrow the bath, so he gets a pool. Then "they don't belong here", and they go to a sanctuary. The desert video is
  built entirely this way: beetles run rampant, so he adds a predator (2:06). The scorpion can't keep up, so he adds
  competition (3:31-3:41).
- **Time markers open the beats**: day two, three days later, by day 10, within two weeks, two in the morning. The
  desert video uses day 3, 50, 60, 63, 72, 81.
- **"But" is the engine.** 33 of 215 transcript lines start with "But" (one every 26 s on average), and "and then"
  never appears.
- **A named loss.** Peanut is named at 6:54 and gets three comic beats: a little dumber, two hours pecking at a wall,
  the blow-dryer that trips the breaker (6:49-9:04). He dies at 10:09-10:53, **71%** of the runtime. A lighter beat
  follows within 15 s ("Nature may be cruel, but…" 11:06; the birds calling his name 11:20).
- **Pace.** 117 words a minute. Speech covers 70% of the runtime, with 35 wordless stretches of 2.5 s or more (17% of
  the runtime). The longest are 9.6 s (the laser team-up, 5:47) and 8.9 s (the candling reveal, 2:38). About 758 scene
  changes in 858 s, an average shot of about 1.1 s (ffmpeg scene detection at 0.3, an estimate). These figures
  **support** our 115 wpm, the 15-20% wordless share and the 8-10 s wordless peaks.

### Rules

| ID | Rule | Test (one line) | Seat | Source | vs existing |
|---|---|---|---|---|---|
| RC1 | **Five lines before the outline.** The script header opens with Situation, Desire, Conflict, Change, Result, one sentence each. "You" is the subject of Desire, and the want exists before the power arrives | Header has five one-sentence lines; Desire names something you want that the change then helps or threatens | story | Runia 2:00-2:41, 4:42-5:00 | Sharpens the story-spine process note and C1: the spine gains an explicit Desire line |
| RC2 | **Every scene traces to a line.** Tag each `> SCENE:` with S, D, Cf, Ch or R. Tags run in order (no R before Ch). A scene that can't be tagged is cut | Tag map; an untagged scene, or tags out of order, fails | story | Runia 5:56-6:17 (return to the five lines), 7:05-8:35 (5 to 10 to 20 lines keep the core) | New. A mechanical form of the cut test |
| RC3 | **Zoom test.** The outline exists at 5, 10 and 20 lines, and a reviewer given only the 20-line version writes back the same five | Reviewer's five lines match the header's in meaning | story | Runia 7:05-8:35 | New |
| RC4 | **Change may be a new way of seeing**, and it is what makes Result differ from Situation. The Situation and Result lines describe the same thing (you, your day) and differ on it | Situation and Result lines name the same object; they differ; the Change line says why | story | Runia 2:26-2:33, 5:39-5:45 | Sharpens N2 (opposite on one axis) and Q5 (the question changes at the turn) |
| RC5 | **The cold open flashes forward to the low point, word for word.** Within 30 s, one line from the lowest moment is heard (or seen) and returns verbatim at 85-95% of the runtime | Find the line in 0:00-0:30 and its verbatim return; return outside 85-95% fails | story, viewer | Dr. Plants egg 0:26 and 12:51 | Sharpens H1 and "plant and pay off" (first minute to last minute) by naming what to plant: the low point, not a random line |
| RC6 | **Leave a thread on an open danger; come back with a recall question.** When the story switches thread (you, your person, the world or stranger), the outgoing line holds an unresolved risk. The return, within 3 min, opens with a question or a "remember" line before the answer | For each thread switch: risk in the outgoing line? Recall line on return within 180 s? | story, viewer | Egg 4:11-4:18 and 5:18; 3:49 and 6:17-6:28 | New mechanism for Q2 (never zero open questions). Our format runs one thread; this asks for two or three, braided |
| RC7 | **A delayed verdict.** At least once per video, an attempt is set up with its outcome openly uncertain ("we'll see"), and the verdict lands 60-180 s later, after another thread | Find the set-up and the verdict; the gap is 60-180 s | story | Egg 3:42-3:49, then 6:28 | New. Pairs with S3 (open a gap at every use of the power) |
| RC8 | **Your fix causes the next problem.** In at least two of the three jumps, the problem that drives the next beat was created by what you did with the power in the last one | For each jump, name the previous use that caused this problem; fewer than two fails | story | Egg (nursery, laser, water park, pool chain); Desert 2:06-3:41 | Sharpens S1 and S3: not just "therefore/but", but causation by your own act |
| RC9 | **Measure each jump against the last one, in one line.** Every step up in scale opens with a comparison to the previous step | Each of the three jumps has a comparison line in its first 15 s | fact, story | Egg 2:25-2:36 | Sharpens S6 and "three jumps, each bigger than the last" |
| RC10 | **A time marker opens every beat**, as words in narration (per the digits rule) or on the split-flap | First line or first shot of each beat carries a story-time marker | story, craft | Egg (day two … within two weeks); Desert 0:55-8:06 | Sharpens "the clock labels change with the topic": markers inside the jumps too |
| RC11 | **A pivot every 30 s.** Narration turns on "but", "so" or "except" at least once in every 30 s window | Windowed count; any 30 s without a pivot fails | voice | Egg: 33 "But" line starts in 858 s; no "and then" | Sharpens W4 with a number |
| RC12 | **Name the person to lose, give them three warm or funny beats, then lose them; recover within 20 s.** The name lands at least 2 min before the cost | Name timestamp ≥ 120 s before the cost; three or more affection beats; a lighter line within 20 s after the loss | story | Egg 6:54 name, 6:49-9:04 beats, 10:09 loss, 11:06-11:20 recovery | Sharpens "A person to lose" and H4. The loss sits at 71%, not our 60% (see Conflicts) |

### Creativity across videos (the Dr. Plants channel)

The channel has **12 videos and 5.98M subscribers**. Views run from 17M to 124M, with a median of about 80M. Titles
fall into a few families: "Simulating ___ for N Days" (desert 118M, ant colony 99M, forest 85M, ocean 82M, Africa 79M,
jungle 43M, the planet 34M, apocalypse 17M), "Raising ___" (bees 88M, frogs that play video games 29M), a survival
question (hamster 53M) and a comparison (biggest vs smallest egg, 124M). The shell never changes: a living world grows
in his home, a day counter runs, he intervenes, and something is lost. What changes is one axis at a time: the
creature, the span (100, 365, 1,000 days), the scale (a tank, Africa, the planet), or a new frame on the same shell
(a vs b, an absurd goal, can it survive?). The top video is the first to break the "Simulating" pattern with a
comparison.

| ID | Rule | Test (one line) | Seat | Source | vs existing |
|---|---|---|---|---|---|
| X1 | **Keep the shell, change one axis.** The shell stays: you live through one change, the title pattern, the thumbnail grammar. Each video changes one or two axes: the power, the scale, the time span, the stake type (gain, loss, survival, comparison), the setting | List the new video's axes next to the last three videos'; same stake type and same scale as the previous video fails | viewer, story | Dr. Plants channel grid (Latest and Popular) | New (backlog check) |
| X2 | **One video in five breaks frame inside the shell**: a "vs" (you with it vs without it, 10x vs 0.1x), an absurd goal, or a survival question | Over any five consecutive videos, at least one uses a new frame | viewer | "Biggest vs Smallest Egg" 124M (top); "Raising Frogs to Play Videogames" | New |
| X3 | **The experiment is the story.** The power is used as a test with a stated, unknown outcome, never a demonstration. Each use states what you are trying to find out | Each use of the power has a "will it…?" line before it | story | Egg 3:42-3:49 ("only time will tell"); Desert 3:31-3:39 | Sharpens S3 |
| X4 | **Grammar repeats so the feed recognises us.** Seven of twelve Dr. Plants thumbnails use the same DAY 1 / DAY N split | A new thumbnail uses the channel grammar (TH1-TH4) unless the owner chooses a deliberate break | packaging | Dr. Plants grid | New |

Cadence note, not a rule: Dr. Plants made 12 videos in about four years. This is set against the owner's daily target
only as a fact. It does not argue for changing it.

---

## 2. Sound and music (Reinis Kaspars)

### What the reference shows

He plays one clip three times (1:04-1:55): music alone (it feels like a recap or an ad), music with effects (you are
there), and effects alone (raw and real). In his rally documentary music takes only 30-40% of the runtime (2:03). He
cuts, grades and does sound at the same time, because sound "drives" the film (2:41-3:05). His rule of thumb: mute
all the music and the film should still feel finished, with no gaps and seamless sound across cuts (3:05-3:22). He
sorts sounds into three kinds (5:58-9:58): what the shot shows; what could plausibly be there but isn't shown (a
distant train, a plane), which also lets him tease the next shot by playing its sound early, panned and quiet (7:04-8:43);
and stylistic or "fake" sounds (whooshes, risers, bass, the creaking wood of a ship that had none, 8:57-9:58). His
technique: three to ten ambiences per location in two passes, a general bed and then location-specific sounds
(10:46-12:56); a crossfade at every cut, and sounds extended past the cut and faded (13:03-13:39); one big sound built
from layers (the attack of one, the body of another, an echo tail, bass, debris; 14:35-16:31); search by sound
character, not object name (a rope knot became "deep wood impact", 22:28-23:47); the same sound at different levels
on each shot of one action (0, -8, -5 dB) so the cut feels like a camera move (23:48-24:31); panning off-screen and
moving sources, with keyframes as a car crosses (24:40-26:49); pitch-shifting by semitones to make a reused sound new,
and lower for a slow-motion feel (26:58-27:49); reverb for space; a low-pass on music and effects for underwater or
muffled moments (28:06-30:11); and short musical hits or drums used as effects for transitions (19:00-21:08).

Dr. Plants' egg video, measured: -15.9 LUFS integrated, LRA 5.4 LU. Nowhere in 858 s does the mix fall below
-45 dBFS for 0.4 s. A continuous bed, which **supports** the owner's "light music through the whole film" and B7.

### Rules

| ID | Rule | Test (one line) | Seat | Source | vs existing |
|---|---|---|---|---|---|
| SD1 | **The mute-music test.** Render a stem of voice plus effects; it must play as a finished film with no holes | Effects-and-voice stem: no stretch of 1 s or more below -50 dBFS outside planned silences (qc candidate), and the reviewer hears no dead spot | craft | Kaspars 3:05-3:22 | New. Sharpens C6 (room floor in silences) to the whole film. Our ffmpeg effects are spot sounds with no beds; this rule needs ambience beds |
| SD2 | **Every set has an ambience bed of at least two layers**: a general bed (room, street, wind) and one set-specific layer | Cue sheet: each set lists two or more ambience layers with sources | craft | Kaspars 10:46-12:56 | New. Pairs with D3 (recorded, not synth) |
| SD3 | **One off-screen sound per scene** that belongs to the world but isn't drawn (a distant bus, a dog two streets away), panned to where it would be | Each scene's cue row names an off-screen sound with a pan value other than 0 | craft | Kaspars 6:24-7:04, 24:40-25:39 | New. Cheap world-building for a drawn set: the sound draws what we didn't |
| SD4 | **Pre-lap the next scene.** At scene changes, the next set's ambience or key sound starts 0.5 to 1.5 s before the cut, quiet and panned, and the old bed fades after it | At each scene change, the incoming sound starts 15 to 45 frames before the cut; no bed starts or stops hard on a cut | craft | Kaspars 7:35-7:44 (tease what's coming), 13:03-13:39 (crossfades) | New. The sound side of RC6 (continuation): the ear crosses the cut first |
| SD5 | **The rule device is heard, not only seen.** When the change applies (the freeze), the world bed and the score are low-passed (muffled) and pitched down, and they open again on release | Freeze beats show a low-pass (cut-off at 1 kHz or lower) and a pitch drop of 2 to 5 semitones on bed and score; the spectrum shows the high end returning at release | craft | Kaspars 26:58-27:22 (lower pitch = slow-motion feel), 29:28-30:11 (low-pass for going under) | Sharpens C4 (a sound idea for frozen moods) and D4 (a signature sound) into a concrete treatment |
| SD6 | **Build the big sounds from layers.** The ident sting, the freeze and the biggest hit each have three to five layers: transient, body, tail or echo, sub, debris | The brand sound's project file lists three or more layers | craft | Kaspars 14:35-16:31 | Sharpens D4. Contradicts nothing: "one big hit per act" (D10) still limits how often |
| SD7 | **Perspective by level.** When one sound runs across several shots of the same action, each shot gets its own level (and pan) for its camera distance | For repeated sounds across a cut, the level changes by 3 dB or more between wide and close shots | craft | Kaspars 23:48-24:31 | New |
| SD8 | **Reuse brand sounds with variants.** Each repeat of a recurring effect (a step, a stamp, a flap) is pitch-shifted ±1 to 2 semitones or level-varied, so it never sounds like a loop | No identical effect file plays three times within 10 s (hash plus pitch check) | craft | Kaspars 27:41-27:49 | Refines D4 (signature sounds unchanged): the signature stays, its small repeats vary |
| SD9 | **Search by character, not name.** Briefs for effects say how a sound should feel (dry, woody, hollow, papery), not what object it is | Effect briefs in the cue sheet use a texture word | craft | Kaspars 22:28-23:47 | New. Helps a paper-cut world, where real objects don't exist |
| SD10 | **Sound is built at the rough cut, not after.** The G4 rough cut already has ambience beds and on-screen effects; the score comes on top | At G4 the render has an effects stem; a rough cut with music only fails | craft | Kaspars 2:41-3:05 | New (process). Today the score is built after picture lock (`build_score.py`) |
| SD11 | **Musical hits as transition glue.** Between sets, a short tonal hit or drum in the cue's key can stand in for a whoosh | Transition rows may name a tonal hit; when they do, its key matches the cue (D8) | craft | Kaspars 19:00-21:08 | Supports D8 |

---

## 3. Thumbnails (HimanshuG; Veritasium; Dr. Plants)

### What the references show

**HimanshuG** (the transcript reads as a machine translation from Hindi):
- **Glanceability.** He cites Mary Potter's MIT work: the gist of an image registers in about 13 ms, an aesthetic or
  complexity judgement follows at 17-50 ms, and an emotional reaction at 100-150 ms. The scroll-or-stop decision falls
  at 300-500 ms, and the title is read in the same window (1:17-2:49). A cluttered thumbnail gets skipped.
- **Focal points.** The eye goes to focal points, not the whole image. More than three raises the cognitive load and
  CTR falls (2:58-3:54). Use the rule of thirds (4:05).
- **Information asymmetry, "1+1=3".** The thumbnail should never repeat the title. The thumbnail carries the feeling or
  the question; the title gives the context, the reason or the stakes. He calls it an honest gap, not clickbait, if the
  video pays it off early (4:26-6:14).
- **Five formats** (6:38-9:08): action versus consequence; a shocked or confused face; before and after (the title then
  carries the time frame or method); "pause and play" (the frame frozen at the peak moment, so pressing play seems to
  continue it); and the cinematic shocker. He singles out Veritasium for minimal visual storytelling.
- **Eye path.** Saccades jump between focal points, scanning left to right and in a zigzag. Put the first focal point
  large and sharp, with a second one behind it for context (9:20-11:28).
- **Light and dark mode.** Most creators design in dark-mode editors, but viewers use both themes. Check the thumbnail
  in both. He claims this moves clicks by about 20% (11:28-12:46; the figure is unverified).
- **Colour.** Most thumbnails use complementary, split-complementary or triadic schemes (12:55-13:42).
- **Always make three variants** for YouTube's A/B test, each a small change: colour, expression (13:49-14:32).

**Veritasium** (21.4M subscribers). The recent grid (18 thumbnails seen) is one style: a dark, low-key frame, one lit
object or face, white **serif** text of 1 to 5 words, often with a **red underline under one word** (5 of 18) and a
**red arrow** pointing at a small subject (7 of 18). The text is a verdict or reaction ("We tested it", "We found it.",
"This feels illegal.", "Black Magic"), a question ("How?", "Does it end?", "How is this allowed?"), or a single number
("1 Billion"). Measured on the screenshot crops: median colourfulness 46, mean luminance 0.08 (very dark), 6% saturated
pixels. The Popular grid (33 seen, 112M to 22M views) is older and louder. **About 14 of 33 have no text at all**: the
impossible image does the work (Derek among 96 million black balls, 112M; aerogel, 63M; the roundest object; the
shade-ball swim). Text, where present, is a reaction or a punchline: "SORRY, WE'RE FULL" for the infinite hotel,
"WHOOPS!" on an illustrated Midgley holding the globe, "IT'S IMPOSSIBLE", "NO COMPUTER IS SAFE", "DO NOT PLANT" stamped on
a seed. Measured: median colourfulness 64, 18% saturated pixels. Illustrated thumbnails (Midgley, Einstein, the
skyscraper engineer) work when the drawn face is large, roughly a third to half of the frame height, with a clear
expression.

How title and thumbnail pair (what each adds):
- **Black balls** (112M). The thumbnail is an impossible picture with no words; the title gives the exact number and
  asks why.
- **Infinite hotel** (38M). The thumbnail is the world's own line ("sorry, we're full") over an endless corridor; the
  title names the paradox. The thumbnail is a joke the title explains.
- **Collatz** (46M). The thumbnail shows the problem itself (3x+1); the title supplies the stakes (simple, yet nobody
  can solve it).
- **Midgley** (43M). A comic "whoops" on the thumbnail against a title about the most deaths in history. The tonal
  clash is the gap.
- **Spider silk** (9.9M). The title asks the question; the thumbnail promises a hands-on answer ("we tested it").
- **Blue LED** (57M). The thumbnail does repeat "almost impossible", but as a ladder (easy, easy, almost impossible)
  that the picture escalates. Repetition can work when the thumbnail turns the phrase into a sequence.

**Dr. Plants.** Seven of 12 thumbnails are a DAY 1 / DAY N split with a white arrow from barren to thriving, and
sometimes a red circle on a hidden animal. The text is only the time markers, and the title repeats the span ("for 100
Days"). The others: one huge creature (the ant colony, 99M), a hamster in a tube (53M), "ONE YEAR" over a crab, a red
circle on a sprout with "life?". Measured: median colourfulness 74, 23% saturated pixels: vivid.

### Our thumbnails, measured

The first video's candidates, from the first-video worktree's `renders/packaging/`. Film-7 is the one set at upload;
the DAY 12, face and DAY 1 versions are in a YouTube A/B test. Script `head.py` / `thumbmetrics.py` in the scratch
folder; the figures are at 1280x720.

| | film-7 (live) | film-7 + DAY 12 | fun-cat + DAY 1 | Veritasium recent | Veritasium popular | Dr. Plants |
|---|---|---|---|---|---|---|
| Your head height, % of frame | **15.8%** (15 px in a 94 px-tall feed tile) | 15.8% | 24.9% | faces about 35-50% | — | hero creature about 30-50% |
| Head vs surrounding luminance contrast | **1.33:1** | 1.33:1 | 1.32:1 | high (lit subject on near-black) | — | — |
| Colourfulness (Hasler-Süsstrunk) | **26** | 38 | 44 | 46 | 64 | 74 |
| Saturated pixels | **1%** | 4% | 5% | 6% | 18% | 23% |
| Mean luminance | 0.35 (mid-grey) | 0.33 | 0.44 | 0.08 | 0.19 | 0.32 |
| Words | the counter "7" | DAY 12 | DAY 1 | 1-5 | 0-4 | 2-4 time markers |

What the feed-size and greyscale renders show (`ours/feed_test.png`):
- In greyscale, **you vanish into the crowd**. Mustard (luminance about 0.52) on a mid-grey street (about 0.40) is
  separated by hue alone. WCAG asks 3:1 for non-text graphics; film-7 gives 1.33:1.
- At 168x94 the largest object is the bus, not you. The kid on the crossing, the stake that makes the frame
  meaningful, can't be read. That leaves three or more competing focal points (crowd, you, bus, counter).
- The "7" is a label, not a question. A cold viewer can't tell that it is a countdown, or that the grey means frozen
  time rather than a dull style. `title.py` scores it 100 because it checks words only. It flags "DAY 12" as a
  duplicate of the title's "a Day", although the time marker is exactly what Dr. Plants and HimanshuG's before/after
  format use.
- `style.md` asks for a "flat set colour behind". Film-7 has a full, busy, grey street, so the current rule wasn't
  followed. The fun-cat frame is closer (one figure, one prop, a quiet room).

### Thumbnail rule set (packaging seat, G1)

| ID | Rule | Test (one line) | Source | vs existing |
|---|---|---|---|---|
| TH1 | **You are the first focal point: big, in colour, left of centre.** Your head is at least 25% of the frame's height, and the whole figure at least 55% | Head height measured on the render ≥ 25% (≥ 24 px in a 94 px tile) | HimanshuG 9:20-11:28 (first focal point large and sharp, left to right); Veritasium illustrated faces | Sharpens "You, large". Film-7 fails (15.8%) |
| TH2 | **You separate in greyscale.** Head and figure against their immediate surround are 3:1 or more in luminance: darken the set behind you (luminance 0.14 or lower), or give you an ink outline at least 1.5% of the frame's height thick | Greyscale render; ring contrast ≥ 3.0:1 | Veritasium recent (lit subject on near-black); WCAG 1.4.11 (3:1 for graphics) | New. Film-7 1.33:1, fun-cat 1.32:1 |
| TH3 | **At most two focal points plus one text tag**: you, and the prop or the stake. Everything else is blurred, darkened or cropped | Reviewer names the objects seen in a 0.5 s flash at 168x94; more than three fails | HimanshuG 2:58-3:54 | Sharpens "one prop that carries the what-if" |
| TH4 | **One crimson pointer** (arrow, circle or underline) when the stake is small: to the kid, the bus, the prop, or under the key word on the tag | Count crimson pointers: 0 or 1 | Veritasium (red arrow in 7 of 18, red underline in 5 of 18); Dr. Plants red circles | New. Crimson already means alarms and the stranger, so it is on-brand |
| TH5 | **The tag is a reaction or a question, never a label.** Your inner line ("Only me?", "Not again.", "Worth it?") or a verdict. Labels ("7", "DAY 1") are allowed only in the before/after format (TH6) | Tag text: is it something a person would say or ask? A bare number or label outside TH6 fails | Veritasium (verdicts and questions); HimanshuG 5:29-5:38 (the thumbnail sells a feeling, the title the reason) | Sharpens "at most three words on a stamped tag" |
| TH6 | **Before/after split for change-over-time what-ifs**: DAY 1 (playful) beside DAY N (the cost), with an arrow between. The title then carries the time frame, and repeating it is allowed | Two panels, one arrow; the tag tokens are time markers only | Dr. Plants (7 of 12); HimanshuG 7:21-7:54 (before/after; the title carries the time frame) | Contradicts the strict "never repeat the title" for time markers only |
| TH7 | **Pause at the peak.** A frame thumbnail is the instant before the outcome (mid-leap, the hand an inch from the mug), never after it | Reviewer: is the outcome still undecided in the frame? | HimanshuG 7:54-8:36 (pause-and-play) | Supports "mid-reaction"; film-7 qualifies |
| TH8 | **Thumbnail and title split the job.** The thumbnail carries the feeling, the impossible picture or the question; the title gives the subject, the number and the stakes. Write one line: "thumbnail gives ___, title adds ___" | Both blanks filled with different content; shared content words fail (except TH6 time markers) | HimanshuG 4:26-5:38 ("1+1=3"); Veritasium pairings | Supports "never repeats the title"; sharpens it with a role split |
| TH9 | **Honest gap, paid early.** The thumbnail's moment or situation is on screen within the first 30 s | Timestamp of the thumbnail situation ≤ 0:30 | HimanshuG 5:48-6:14; story note H1 (7 s) | Supports H1; gives the packaging seat the same check |
| TH10 | **Saturated enough for the feed.** Colourfulness 40 or more, or, for a deliberately grey frozen world, a dark set (mean luminance 0.20 or lower) so the coloured you carries it | Metric from the render | Measured references (Dr. Plants 74, Veritasium 46-64; ours 26-44) | New |
| TH11 | **Three variants, one variable each** (expression, tag, framing), so the A/B result teaches something | Three files; a diff note says the one thing that changed | HimanshuG 13:49-14:32 | Sharpens the A/B test the owner ran (DAY 12, face, DAY 1 differed on several things at once) |
| TH12 | **The tag stays clear of the duration badge** (bottom-right, about 15% wide by 12% high), and its cap height is at least 12% of the frame's height | Tag bounding box outside the badge zone; cap height ≥ 11 px at 94 px | Feed observation (the badge covers that corner on every grid) | New |

### G1 thumbnail review checklist (packaging seat, run on every candidate)

Each item is measured on the rendered PNG, or judged by a reviewer from a fixed render. The image items could become
an `omni qc` packaging check. Not built.

| # | Check | How | Pass |
|---|---|---|---|
| K1 | **0.5 s flash read** | Show the 168x94 render for 0.5 s to a cold reviewer model. Ask who, what emotion, what object | Names you, the emotion and the prop (or stake) |
| K2 | **Focal-point count** | Same flash: list the things noticed | 3 or fewer, and you are first |
| K3 | **Hero size** | Largest mustard round component, height divided by frame height | ≥ 25% |
| K4 | **Greyscale separation** | Greyscale; luminance of the head against a 25 px ring around it | ≥ 3.0:1 |
| K5 | **Words** | OCR or the tag spec | ≤ 3 words; cap height ≥ 12% of height; tag contrast ≥ 4.5:1 |
| K6 | **Tag type** | Reviewer | A reaction or question (TH5), or time markers in a before/after split (TH6) |
| K7 | **Pairing** | `title.py --title … --thumb …` plus the "gives / adds" line (TH8) | No shared content word except TH6 time markers; both blanks filled |
| K8 | **Pointer** | Count crimson (#D8344F ±40) arrow, circle or underline shapes | 0 or 1 |
| K9 | **Colour** | Colourfulness metric and mean luminance | Colourfulness ≥ 40, or mean luminance ≤ 0.20 with K4 passing |
| K10 | **Both feed themes** | Composite the 246x138 render on #FFFFFF and on #0F0F0F; view both | The edge doesn't melt into either; the reviewer finds you first on both |
| K11 | **Badge zone** | Tag and key objects against the bottom-right 15% x 12% | Nothing key inside |
| K12 | **Mobile title cut** | `title.py` mobile line | The truncated title plus the thumbnail still say what the video is |
| K13 | **Payoff time** | Timestamp of the thumbnail's moment in the edit | ≤ 0:30 |
| K14 | **Family likeness** | The thumbnail beside the channel's previous ones at 246x138 | Same grammar (TH1, TH2, TH4, TH5 or TH6), unless the owner chose a break |
| K15 | **Variant set** | Three candidates, each differing in one variable | 3 files and the diff note |

How the first video's thumbnails score. **Film-7**: K3 fails (15.8%), K4 fails (1.33:1), K2 likely fails (bus,
crowd, you, counter), K6 fails (a label), K9 fails (26). It passes K5, K7, K11 and K13. **Fun-cat DAY 1** is the
closest: K3 is at the 25% line, but K4 fails (1.32:1). Its "DAY 1" passes only if it's read as half of a before/after
split.

### What I would change (proposals for the owner; nothing edited)

1. **`style.md`, Thumbnails.** Proposed text: "You, large (head at least a quarter of the frame's height), left of
   centre, mid-reaction at the instant before the outcome. One prop or stake, and at most one crimson pointer to it.
   The set behind is dark or flat, so you stand at 3:1 in greyscale. A tag of at most three words that is your
   reaction or a question; or, for change-over-time stories, a DAY 1 / DAY N split whose time markers may repeat the
   title's span. Checked at G1 with the K1-K15 list."
2. **The freeze look on a thumbnail.** The grey frozen world is the video's rule device, but at feed size mid-grey
   reads as a dull style, not stopped time. Darken and blur it (the `frozen` mood with a stronger vignette), or use
   the letterbox bars, which are the pause's other signature, so "time has stopped" reads in the thumbnail.
3. **`yt-package`'s `title.py`.** Exempt time-marker tokens (day, week, year and digits) from the duplicate check when
   the thumbnail is a before/after split. Flag thumbnail text that is a bare number or single label as "label, not a
   question". A companion image check (hero size, greyscale contrast, colourfulness, badge zone, light and dark
   composites) would automate K3, K4, K8, K9, K10 and K11.
4. **A/B testing.** Make the next test change one variable (TH11). Of the current three, DAY 12 against DAY 1 changes
   the scene, the expression and the text at once.
5. **Candidate directions for the pause-time video if it is re-packaged.** You large on the left, in colour, against a
   darkened, blurred frozen street, the kid small and circled in crimson, tag "Only me?". Or a DAY 1 / DAY 12 split
   (the cat gag, then the bus), using the frames we already have. Both need the owner's eye; neither has been
   rendered.

---

## Conflicts

**Between the references and our rules**
1. **Where the loss lands.** Dr. Plants loses Peanut at 71%. Our format puts the cost near 60% (story-note conflict 6
   asked the same question). Two references now argue for later. Owner's call; RC12's checks (name early, three
   beats, recovery) hold either way.
2. **Never repeat the title.** HimanshuG says never. Dr. Plants repeats the day span on every split, and Veritasium's
   blue-LED thumbnail repeats a phrase as a ladder. TH6 allows time markers only; everything else stays non-repeating.
3. **Three words maximum** (`yt-package`, `style.md`). Veritasium uses four or five words on recent questions ("How is
   this on earth?"). Keep three for a drawn channel read at 168 px, where every word costs size; revisit if a test
   says otherwise.
4. **Music share.** Kaspars plays music for 30-40% of a film and lets effects carry the rest. The owner chose light
   music throughout, and Dr. Plants also runs a continuous bed. Keep the owner's rule; SD1's mute-music test is a
   diagnostic, not a call to cut music.
5. **Sound after picture.** Our score is built after picture lock (`build_score.py`); Kaspars builds sound with the
   cut (SD10). This is a process change for the owner to decide.
6. **"Flat set colour behind"** against the frozen-world frame the owner picked (film-7). TH2 and TH10 offer a middle
   way: keep the frozen world, but dark and soft.
7. **Shot pace.** Dr. Plants averages about 1.1 s a shot; our rule is a change every 2 to 4 s. Live footage with a
   free camera isn't a guide for a drawn rig. No change proposed.

**Between the references**
- HimanshuG puts the first focal point left (a left-to-right scan); many Veritasium thumbnails put the face or object
  on the right and the text on the left. Both have the text and the hero on opposite sides. Treat "opposite sides" as
  the rule and "hero left" as the default.
- Veritasium's best older thumbnails have no text; HimanshuG's formats mostly use text. For us, a no-text thumbnail
  is allowed when K1 passes without it.

## Limits and what could not be accessed

- Every reference was reached. HimanshuG's transcript is YouTube's English version of what appears to be a Hindi
  talk, and some sentences are garbled; claims that were unclear are left out. His "about 20%" from light or dark mode
  and the Mary Potter timings are his figures, not checked here; the fact seat should source them before they reach
  any script.
- Veritasium and Dr. Plants thumbnails were judged from grid screenshots at reduced page zoom, not the full-size
  images. The colourfulness and luminance figures come from those crops, so treat them as rough benchmarks.
- The Dr. Plants scene-cut count comes from ffmpeg's scene detector at threshold 0.3; it over- or under-counts on
  fast motion.
- Chrome's renderer froze once on the desert video and recovered after a reload. No sign-in, setting, like or
  subscription was touched; the working tab was closed.
