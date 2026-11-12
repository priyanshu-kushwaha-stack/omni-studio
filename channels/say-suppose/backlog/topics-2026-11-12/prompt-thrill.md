# The topic pitch: what every idea agent brings

Owner, 2026-11-10. Read by the three pitchers of `/say-suppose-topics` (`.claude/skills/say-suppose-topics/SKILL.md`);
the scorer reads the scorecard at the end. Spec: `docs/superpowers/specs/2026-11-10-say-suppose-topics-skill-design.md`.

## What we want

Exciting what-ifs, told to **you** in second person, with enough real material for an exciting 15-minute video, so
that after the owner's cuts a tight 6-8 minute script is easy. The owner's favourites, for the level of excitement
(never to copy): an infinite money glitch; processing everything 10x faster, or 10x slower; redoing any 10 seconds of
your life; time travel. A strong rule with a catch, lots of real science, money or society behind it, and consequences
that keep getting bigger.

Imaginary stories that hook and make people think (owner, 2026-11-11 and 2026-11-12, `taste.md`). There is no target
viewer: "you" is anyone, and no persona's week supplies the gags. The premise and its imagination set the world, the
scale and the gags; the setting, the currency and the cast go wherever the idea's best real content and pictures are,
and India is one option, never the default. Mind-boggling is one kind of idea, not the only one: a mirror on how
people are, a dilemma or a catch that changes how you see something ordinary work as well. The packaging stays
readable worldwide.

## What breaks out (competitor decode, 2026-11-11)

Five what-if channels reached 0.9-12.7M views in about a month (Jeremy Bearimy, Ifverse, IF Nation, IF Opposite,
Manifesting). Their hits share four things; pitch to them:

- **A personal power with a social stake beats spectacle.** Winners: infinite IQ at school, seeing who has a crush on
  you, hearing everyone's thoughts, seeing who secretly misses you, 10x reaction time, infinite money. Losers: lasers,
  aliens, a door on the moon, generic superpowers, world-scale premises with no person at the centre.
- **The proven clusters:** intelligence (IQ, 10x brain), secret feelings of the people around you (crush, envy, who
  misses you, what they say behind your back), speed and time (reaction, rewind, pause), money, and game mechanics in
  real life (stats, level up, respawn). A fresh twist inside a proven cluster beats a new cluster.
- **Our open lane: their stories all live in one default world, American school and gamer life.** Ours go wherever the
  idea is strongest: the place, the era, the currency and the cast that make the rule strangest and its facts richest
  (a port city in dollars, a night train in Tokyo, a Roman mint, a coaching class in Kota). Name the world and why the
  idea belongs there; never pick a place for a viewer.
- **Make them think.** Keep you at the centre, then let the rule lead somewhere the viewer has not pictured: a
  staggering scale, a truth about people, or a choice they keep arguing in the comments. A topic that hooks but
  leaves nothing to think about is replaced.
- **Sequel potential.** The breakouts got Parts 2 and 3 within days. Pitch a rule that can return with a new twist,
  and a small recurring cast (you, a cousin, a best friend, family).

The film is 9-10 minutes on the locked template (`rules/story.md` #15-#19): there must be enough real material and
enough escalation for that, so a sequel is possible too.

## Bring 8 topics, as one JSON object

Answer with a single JSON object, nothing else, in a ```json fence:

```json
{"topics": [{
  "id": "short-slug",
  "title": "Under 50 characters, sized to a long video, one extreme claim the film delivers",
  "premise": "One sentence a stranger gets at once",
  "world": "Where and when it happens, in one line, and why the idea's best content is there",
  "thumbnail": {"image": "who, the emotion, the stake, in one picture", "tag": "3 words or fewer"},
  "rule": "The power exactly: what it can do, its limits, and its catch",
  "hook": "The first 10 seconds in one breath: setup, stakes, tension; no warm-up",
  "beats": ["8 to 12 pointers, each a scene: what happens, what we learn or feel; three jumps of consequence, each bigger"],
  "feeling_map": ["4 to 6 feelings in order: wonder, greed, fear, guilt, awe ..."],
  "restarts": ["a new complication about every 3 minutes, so a long video never runs on one storyline"],
  "content_mine": [{"fact": "a real fact, number or piece of science", "source": "https://...", "beat": "the beat it moves"}],
  "twist": "The late turn or mind-boggle, after the story has earned it",
  "ending": "The worldview flip: you'll never see X the same way",
  "closest_video": {"title": "the nearest existing video", "url": "https://...", "difference": "why this is not a copy"},
  "runtime": {"strong_minutes": 15, "cut_to": "what goes to reach a tight 6-8 minutes"},
  "views_case": "Similar videos that pull views now, with links, and why this one can",
  "under_question": "The one line it is really about, in the viewer's words"
}]}
```

Rules for the brief:
- **At least 12 facts in `content_mine`**, each with a source URL and the beat it moves. A fact with no beat is cut,
  never padded in. If you cannot find 12, the topic is too thin: replace it.
- **Character over spectacle:** *you* stand to lose something real; spectacle alone does not hold 15 minutes.
- **No thumbnail, no idea.** If no single image makes a stranger wonder "what happened?", replace the topic.
- **Not a copy.** Never the same twist as a trending video; the same daydream with a new rule, a new belief and a
  new thumbnail promise is fine. Never a title on the "already made" list you are given.
- Avoid limited-ads territory (death dates, disaster as spectacle) and anything that gives health, money or legal advice.

## The scorecard (the scorer only)

Score each topic 1-10, with a one-line reason each, content first:

| Key | Weight | Asks |
|---|---|---|
| `excitement` | x3 | Would you click and tell a friend? One clear sentence, original, extreme, fun; a personal power with a social stake scores higher than spectacle; it leaves people thinking; a world picked by default rather than for the idea scores lower |
| `content` | x3 | Real material for an exciting 15 min, so 6-8 min is easy? Count the facts that move a beat; flag a thin mine |
| `views` | x2 | Is it in a proven breakout cluster (intelligence, secret feelings, speed and time, money, game mechanics) with a fresh twist; does the thumbnail work at a glance (you owning the power, someone reacting, 1-3 words)? |
| `engine` | x1 | Does the rule keep making new, bigger situations; does *you* lose something; can it return as Part 2? |
| `buildable` | x1 | Can code-drawn paper-cut scenes show it this week? |

Also give `copies_trending` (true when the twist is a trending video's; it costs 10) and `best_moment` (the one scene
the film hangs on). Never add up the total: `python -m studio.topics` computes it.

---

# Say Suppose: who watches

No persona (owner, 2026-11-11, `taste.md`): "Remove the concept of viewer ... this is making the story biased. i want
you to create imaginary stories, mind boggling and that type." The one named viewer this file used to describe, and
her week, are gone. Every seat reads the draft as a stranger who has never seen the channel: anyone,
anywhere, on a phone, free to leave at any second.

## "You" is anyone

- **The figure on screen is you, whoever is watching.** The channel gives "you" no country, age, job or family of its
  own. The premise gives you only what the story needs: a stall to run, a train to catch, a person to lose.
- **The world follows the idea** (owner, 2026-11-11: "Story should be making more sense whereever it has good
  content."). The setting, the currency and the cast go wherever the idea's best real content and pictures are: a port
  city in dollars, a night train in Tokyo, a Roman mint, a coaching class in Kota. India is one option, never the
  default; so is an American high school. Inside the story the place is specific; it is chosen for the idea, not for
  a viewer.
- **Hooked, then made to think** (owner, 2026-11-12). People come for an imaginary what-if that grips them and
  leaves them thinking: the daydream pushed further than they would push it alone, with real numbers under it.
  Mind-boggling scale is one way to get there; a mirror on how people are, a dilemma with two right answers or a catch
  that changes how you see something ordinary are others. The idea chooses.
- **Packaging stays readable worldwide.** English titles and thumbnails a stranger anywhere gets at a glance: no
  local slang, no symbol or reference only one country reads.

## What they also watch (comparables)

| Channel | Why it is in their feed |
|---|---|
| Ifverse | The closest neighbour: second-person what-ifs ("Reaction Time 10x", "One Second Felt Like Ten") |
| Kurzgesagt | Big ideas, made beautiful; they trust it on science |
| Veritasium | The wrong belief broken first; one of the owner's references |
| Dr. Plants | Story-led science with a person to care about; one of the owner's references |
| What If (@whatifscienceshow), Zack D. Films | The plain what-if and the 60-second Short they scroll past |

## What makes them leave

From the first video's reviewers (five seats, rounds 1-5 and G4) and the owner's notes:

- **A lecture.** Two or three facts in a row while the story stands still ("It keeps stopping to teach me things";
  they would have left at 2:03 of the pause-time rough cut, on chronostasis).
- **Numbers right after a payoff.** Statistics straight after the rescue read as a road-safety ad.
- **A promise not kept.** The thumbnail's moment not shown in the first seconds.
- **An empty opening.** Seconds with nothing to hear or see before the first word (owner, 2026-11-08).
- **A stretch where nothing happens to you:** a mood, a montage that does not turn, a hold over a still picture.
- **Being told how to feel,** or a line that sounds like a teacher ("Anyone can look up from their phone at a
  crossing").
- **A story that stops at the personal** when the idea could go somewhere no one has pictured (owner, 2026-11-11).

## What keeps them

- A person they care about, planted early, with warm beats before anything happens to them (the mother in the
  pause-time video).
- One line they would send a friend ("You're not a saint. You're a person with ten seconds").
- A plant they want to rewind for (the stranger hidden in the crowd).
- A choice put to them that the figure answers at once ("Promise her, or keep watching?").
- Something to think about after it ends: a consequence they did not see coming, true and sourced (the doubled-money
  film's day 267, more dollars than atoms in the observable universe), or a question they keep turning over.

---

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
agreed scored list; the owner picks. A topic must pass the nine-point pick card in that file: a daydream people
anywhere already had; you can live it from an ordinary moment, set where the idea's best content is; a wrong belief it
breaks; one belief-breaking fact and one late
mind-boggle; three jumps of consequence; earned stakes; buildable this week; not a neighbour's twist or title from the
last 90 days.

**"You" is anyone** (owner, 2026-11-11, `taste.md`; replaces the one named viewer). Stories are imaginary, hook hard
and make people think (2026-11-12; mind-boggling is one way, not a rule); they are not written to one viewer's week.
The setting, the currency and the cast follow wherever the idea's best real content and pictures are; India is one
option, never the default. Titles and thumbnails stay readable worldwide (no slang, symbol or reference only one
country reads in the English packaging).

### Writing it (owner, 2026-11-08 and 2026-11-09)

- **The fourteen must-pass checks** in `rules/story.md`: five lines first (Situation, Desire, Conflict, Change,
  Result); confirm the click in 7 s; the hook in 10 s and a second hook by 0:30; a habit, then the change; "but" or
  "therefore" between beats, never "and then"; every use has a gap; misconception first; a picture only this premise
  can show, before the midpoint; earned stakes; the turn breaks a line already said; never say the feeling; leave fast;
  every fact moves the story; a restart every ~3 minutes.
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

- **The template (owner, 2026-11-11, three films a week):** 9-10 minutes at about 155 words a minute (1,300-1,500
  spoken words), holds about 5% of the runtime, where a picture lands. Was 115 words a minute and 15-20% wordless,
  which read slow and lost viewers in the first video's setup. The spine is `rules/story.md` #15-#19; 6-8 named
  chapters; a sequel outline with every script (`sequel.md`).
- Second person, present tense, short sentences. The narrator is dry, warm and exact, and never hypes.
- **Written to be spoken, not read** (owner, 2026-11-08, for every language): fragments, half-sentences, thoughts
  that trail off, a question answered at once, key words repeated. Not every sentence is complete, because that is not
  how people talk. The pause-time script (approved before this rule) stays as it is. Every line still moves the story
  (2026-11-11): no run of mood-only fragments ("The bus. The result. Her dots.").
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

---

## The owner's newest taste notes (taste.md, 2026-11-11 and 2026-11-12)

## 2026-11-12

- **"mind boggling is one type not just this."** On the docs that carried the 2026-11-11 notes, which had made a
  mind-boggling end a must-pass check: "Video should be hooked and should make people to think because that is what
  this type of niche is and therefore donr restrict but understand my intent." The aim of every film is a hook that
  holds and an idea that makes people think. Mind-boggling scale is one way to get there, beside others (a mirror on
  how people are, a dilemma with two right answers, a rule whose catch rewires how you see something ordinary). No
  check requires a mind-boggling end; the writer chooses what fits the idea. (say-suppose docs, PR after #46)

## 2026-11-11

- **"Not necessarily it needs to revolve around India."** Same film, after round 2 (still a lane, a chai stall,
  rupees): "Story should be making more sense whereever it has good content." The setting, the currency and the cast
  follow wherever the idea's best real content and images are; India is one option, never the default.
  (doubled-money film, G1)
- **"Remove the concept of viewer."** G1 notes on the doubled-money film, after reading its "The viewer" paragraph
  (Riya, 22, Pune; the broke student with a chai tab): "this is making the story biased. i want you to create imaginary
  stories, mind boggling and that type." Stories are no longer written to one named viewer's week. "You" is anyone; the
  premise and its imagination set the world, the scale and the gags, and every film reaches for the mind-boggling end
  of its idea. The `audience.md` persona and the "every example comes from the viewer's week" rules (`rules/story.md`,
  `style.md`) give way to this note; packaging stays readable worldwide. (doubled-money film, G1)


---

## Already made, never repeat

# Video folders
2026-11-06_pause-time-for-10-seconds-a-day
2026-11-06_universal-basic-income-for-everyone
2026-11-09_what-if-you-could-never-forget-anything
2026-11-09_what-if-you-could-sell-one-year-of-your-life
2026-11-09_what-if-you-got-paid-every-time-someone-thought-of-you
2026-11-09_what-if-you-knew-the-last-time-you-d-see-someone
2026-11-09_what-if-you-saw-everyone-s-real-odds-of-success
2026-11-11_what-if-you-doubled-your-money-every-day

# Backlog what-ifs
What if you could pause time for only 10 seconds in a day?
What would happen if everyone is given Universal Basic Income?
What if AI took your job, and everyone else's?
What if you knew the last time you'd see someone?
What if you saw everyone's real odds of success?
What if you got paid every time someone thought of you?
What if you could sell one year of your life?
What if you could never forget anything?
What if you could fast-forward the boring parts of life?
What if you could hear everything said about you?
What if you could step into any photo for five minutes?
What if everyone forgot you for a day?
What if everyone could see your search history?
What if you never had to sleep again?
What if you stopped aging at 25?
What if all money vanished overnight?
What if the Moon vanished tonight?
What if you could never lie again?

# Earlier slates (2026-11-10, 2026-11-11)
What If You Could Find Anything Ever Lost?
What If You Could Borrow Time From Tomorrow?
What If You Could Lock Anything in Mid-Air?
What If Nobody Could Say No to You?
What If You Saw 60 Seconds Into the Future?
What If Every 1% Chance Worked for You?
What If You Could Copy Yourself for 24 Hours?
What If You Could Learn Any Skill in 1 Second?
What If You Could Turn Off Pain and Fear?
What If You Could Borrow Any Skill for an Hour?
What If You Could Turn Invisible at Will?
What If You Could Teleport Anywhere You've Been?
What If You Could Teleport Anywhere You See?
What If Touching Anything Showed Its Past?
Every Secret Weighs One Kilo
One Memory Infects Everyone
Every Price Knows Your Salary
Every Touch Deletes Friction
You Can Swap Memories With Anyone
You Remember Tomorrow, Not Yesterday
Everything Costs the Same Everywhere
You Wake One Hour Later Every Day
What If You Doubled Your Money Every Day?
What If You Saw Every Deleted Text Meant for You?
What If Every Lie Told to You Paid You $100?
What If You Got 1% Smarter Every Day?
What If Real Life Gave You 3 Dialogue Options?
What If You Could Learn Any Skill in 10 Seconds?
What If You Saw Who Actually Cares About You?
What If You Lived Every Single Day Twice?
What If You Saw Who Checks Your Profile?
What If You Could Adjust Your Own Stats at Will?
What If Every Purchase Paid You Back Double?
What If You Had One Save Point in Real Life?
What If You Could Be in Two Places at Once?
What If You Could Swap Lives for a Day?
What If You Saw Who'd Defend You?
What If You Could Think in Parallel?
What If You Could Buy Save Points?
What If You Could Lend Your Intelligence?
What If You Had One Undo a Day?
What If You Saw Everyone's Skill Tree?
What If Your Shadow Reacted First?
What If You Saw the Lie They'd Trust?

---

## Your lens

**The viewer's thrill.** Hooks, clicks and the thumbnail first: what a stranger anywhere taps tonight, with the views case.
