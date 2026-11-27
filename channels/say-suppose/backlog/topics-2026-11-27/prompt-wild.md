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
  "thumbnail": {"image": "you, the power in use, someone stunned, the stake, in one picture", "tag": "3 words or fewer"},
  "rule": "The power exactly: what it can do, its limits, and its catch",
  "hook": "The first 10 seconds in one breath: setup, stakes, tension; no warm-up",
  "beats": ["8 to 12 pointers, each a scene: what happens, what we learn or feel; three jumps of consequence, each bigger"],
  "feeling_map": ["4 to 6 feelings in order: thrill, triumph, laughter, dread, awe ... (one tender beat at most)"],
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
- **Character over spectacle:** *you* stand to win or lose something real (caught, exposed, outsmarted, the edge
  gone); spectacle alone does not hold 15 minutes.
- **Exciting, not sad** (owner, 2026-11-13): the best moment is a triumph, a reveal or a mind-boggling image, never a
  loss or a goodbye. People tap to feel powerful and clever (`docs/research/2026-11-13-say-suppose-audience-mood.md`).
- **No thumbnail, no idea.** If no single image makes a stranger wonder "what happened?", replace the topic.
- **Not a copy.** Never the same twist as a trending video; the same daydream with a new rule, a new belief and a
  new thumbnail promise is fine. Never a title on the "already made" list you are given.
- Avoid limited-ads territory (death dates, disaster as spectacle) and anything that gives health, money or legal advice.

## The scorecard (the scorer only)

Score each topic 1-10, with a one-line reason each, content first:

| Key | Weight | Asks |
|---|---|---|
| `excitement` | x3 | Would you click and tell a friend? One clear sentence, original, extreme, fun; a personal power with a social stake scores higher than spectacle; it leaves people thinking; a world picked by default rather than for the idea scores lower; a topic whose best moment is a loss or a goodbye scores lower (owner, 2026-11-13) |
| `content` | x3 | Real material for an exciting 15 min, so 6-8 min is easy? Count the facts that move a beat; flag a thin mine |
| `views` | x2 | Is it in a proven breakout cluster (intelligence, secret feelings, speed and time, money, game mechanics) with a fresh twist; does the thumbnail work at a glance (you owning the power, someone reacting, 1-3 words)? |
| `engine` | x1 | Does the rule keep making new, bigger situations, wins, catches and narrow escapes; can it return as Part 2? |
| `buildable` | x1 | Can code-drawn paper-cut scenes show it this week? |

Also give `copies_trending` (true when the twist is a trending video's; it costs 10) and `best_moment` (the one scene
the film hangs on). Never add up the total: `python -m studio.topics` computes it.

# Say Suppose: who watches

No persona (owner, 2026-11-11, `taste.md`): "Remove the concept of viewer ... this is making the story biased. i want
you to create imaginary stories, mind boggling and that type." The one named viewer this file used to describe, and
her week, are gone. Every seat reads the draft as a stranger who has never seen the channel: anyone,
anywhere, on a phone, free to leave at any second.

## "You" is anyone

- **The figure on screen is you, whoever is watching.** The channel gives "you" no country, age, job or family of its
  own. The premise gives you only what the story needs: a stall to run, a train to catch, a rival to beat.
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

## Who taps, and in what mood (owner, 2026-11-13)

From the comparables' outliers and their top comments (`docs/research/2026-11-13-say-suppose-audience-mood.md`):
mostly teens and young adults on a phone, arriving **bored and playful, wanting to feel powerful and clever**. They
joke about themselves ("if I had 500 IQ I would still procrastinate"), scheme with the power ("I'd befriend the
future rich"), check the logic ("so many flaws with the logic"), talk in gamer and anime references, and don't mind
that a film is made with AI. In order of size:

1. **"What would I do?"** Self-insertion and scheming; the power used smartly and bigger each time.
2. **Status.** Who is richer, smarter, taller, more wanted (ConChaser's wealth and IQ, 11-12x its median).
3. **The nosy one.** Hidden social truths: crushes, who wants you to fail, who texts with AI.
4. **Spectacle and curiosity.** Doom, scale, "how does that even work".
5. **The feel-something viewer.** Real but small; they come back for characters they already know, so a tender beat
   works best in a sequel.

They tap for excitement and stay for the ride. Emotion-led titles sit at the bottom of every comparable's hit list.

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

- The power used cleverly, bigger each time, with the world reacting and a laugh in every scene (owner, 2026-11-13).
- A person they care about, planted early, with warm beats before anything happens to them (the mother in the
  pause-time video).
- One line they would send a friend ("You're not a saint. You're a person with ten seconds").
- A plant they want to rewind for (the stranger hidden in the crowd).
- A choice put to them that the figure answers at once ("Promise her, or keep watching?").
- Something to think about after it ends: a consequence they did not see coming, true and sourced (the doubled-money
  film's day 267, more dollars than atoms in the observable universe), or a question they keep turning over.

# Already made, never repeat
AI Tells Them Your Choice First
Every Price Knows Your Salary
Every Second of Attention Pays You
Every Secret Weighs One Kilo
Every Touch Deletes Friction
Everything Costs the Same Everywhere
One Memory Infects Everyone
What Happens After AI Can Fake Any Proof?
What Happens After AI Does Every Job for Free?
What Happens After AI Replaces Every Judge?
What Happens When AI Thinks 1,000 Years a Day?
What If AI Predicted Every Choice You Make?
What If AI Rented Your Brain While You Slept?
What If Every 1% Chance Worked for You?
What If Every Bill You Paid Split Across Earth?
What If Every Hour You Slept Rewound the World?
What If Every Lie Told to You Paid You $100?
What If Every Purchase Paid You Back Double?
What If Life Answered 20 Yes-or-No Questions?
What If Nobody Could Say No to You?
What If Real Life Gave You 3 Dialogue Options?
What If Robots Started Building Robots Alone?
What If Touching Anything Showed Its Past?
What If You Could Adjust Your Own Stats at Will?
What If You Could Be in Two Places at Once?
What If You Could Borrow Any Skill for an Hour?
What If You Could Borrow Time From Tomorrow?
What If You Could Buy Save Points?
What If You Could Copy Yourself for 24 Hours?
What If You Could Find Anything Ever Lost?
What If You Could Learn Any Skill in 1 Second?
What If You Could Learn Any Skill in 10 Seconds?
What If You Could Lend Your Intelligence?
What If You Could Lock Anything in Mid-Air?
What If You Could Refund Anything You Bought?
What If You Could Swap Lives for a Day?
What If You Could Teleport Anywhere You See?
What If You Could Teleport Anywhere You've Been?
What If You Could Text Yourself Yesterday?
What If You Could Think in Parallel?
What If You Could Turn Invisible at Will?
What If You Could Turn Off Pain and Fear?
What If You Doubled Your Money Every Day?
What If You Felt What You Make Others Feel?
What If You Got 1% Smarter Every Day?
What If You Had One Save Point in Real Life?
What If You Had One Undo a Day?
What If You Had a 10-Slot Video Game Inventory?
What If You Had a Video Game Inventory?
What If You Had the Last Job on Earth?
What If You Lived Every Single Day Twice?
What If You Lived a Year Every Night?
What If You Never Had to Wait for Anything?
What If You Paid Only What Things Cost to Make?
What If You Rented Your Sleeping Brain to AI?
What If You Saw 60 Seconds Into the Future?
What If You Saw Every Deleted Text Meant for You?
What If You Saw Everyone's Exact World Rank?
What If You Saw Everyone's Price?
What If You Saw Everyone's Skill Tree?
What If You Saw Who Actually Cares About You?
What If You Saw Who Checks Your Profile?
What If You Saw Who Uses AI to Text You?
What If You Saw Who Wants You to Fail?
What If You Saw Who'd Defend You?
What If You Saw the Lie They'd Trust?
What If You Were 10x Faster When No One Looked?
What If You Were as Smart as the Whole Room?
What If Your Robot Built a Copy Every Week?
What If Your Shadow Reacted First?
What If an AI Clone Lived Your Boring Hours?
What If an AI Did Exactly What You Said?
What If an AI Knew Your Next Move?
What If an AI Settled Every Argument You Had?
When Everyone Sounds Brilliant
You Can Queue Your Next Three Actions
You Can Steal Someone's Embarrassment
You Can Swap Memories With Anyone
You Choose Humanity's Last Job
You Fail the Human Test Forever
You Get Paid Every Time You Wait
You Learn Only What's Forbidden
You Remember Tomorrow, Not Yesterday
You See Truth Only When Nobody Believes You
You See What Everyone Expects
You Wake One Hour Later Every Day
Your AI Clone Gets Verified as You
Your Reputation Becomes Money
Your Robot Builds Its Replacement
Your Robot Refuses You
Your Robot Teaches Every Robot
pause time for 10 seconds a day
universal basic income for everyone
what if ai rented your brain while you slept
what if you could never forget anything
what if you could sell one year of your life
what if you got paid every time someone thought of you
what if you knew the last time you d see someone
what if you saw everyone s real odds of success
what if you saw who wants you to fail

## Restart overrides (owner, 2026-11-26/27) — these win over anything above

Say Suppose restarted from scratch on 2026-11-26. The owner agreed nine learnings from 10 breakout channels
(`docs/research/2026-11-27-say-suppose-learnings.md`, included below). Where the brief above disagrees, these win:

- **This room picks ONE premise for a 60 s pilot**, which must later carry a full film. Pitch for the best possible
  first film of a restarted channel.
- **L1, hard constraints:** a one-line "What if you…" premise you can picture as one frame; it carries a hard number
  or a status/social payoff; the title is **37–49 characters**; AI is NOT the channel's lane (an AI premise must win
  on the same test as any other); it must sit among the top films of Awaken, YOUniverse, Ifverse, Jeremy Bearimy,
  Minute Zero, ConChaser, Ifinite, The Hidden Why, Hypothetically and AI In Context without looking weaker, and must
  not copy their premises (see the list below).
- **L4:** a story with a protagonist arc: the power escalates, a dilemma is promised early, the climax is a choice
  that costs something, the ending calls back to the cold open and twists into a possible Part 2. The ending's tone is
  whatever this story's audience wants (the old "exciting, not sad" rule is replaced). There is no fixed length and no
  locked template: the story sets the runtime. Facts stay real and sourced but are used only where they don't
  distract from the story.
- **L5:** ideally one natural number that can live on screen and change at story beats.
- **The look is open:** ignore "paper-cut"; the film will be flat-lit 2D, soft simple 3D, or an AI-painted world.

Premises the 10 channels already own (never copy): reaction time 10x, 500 IQ, seeing everyone's IQ / future wealth /
height / attractiveness, seeing who has a crush on you, seeing how long everyone has left, infinite money, sped up and
couldn't stop, time sped up / ran backwards, grew 10x every hour, last guy / last girl on Earth, 2 people restart
humanity, 8 billion in one city, woke up 20,000 years ago / in Ancient Rome / the 1500s with an iPhone, famous person
comes back in 2026, pet T-rex, cat smarter than you, read minds, hear everything, black market surgeon, every rank of
the mafia, POV trillionaire.

# Say Suppose restart: learnings from 10 breakout channels

Source: the teardown of 10 channels (Awaken, YOUniverse, Ifverse, Jeremy Bearimy, Minute Zero, ConChaser, Ifinite,
The Hidden Why, Hypothetically, AI In Context), 14 films and 61 thumbnails, 2026-11-26.
Page: https://claude.ai/code/artifact/a152c9a7-08cd-4a53-b89b-b87d24fb62f7

Each learning was agreed with the owner one at a time before any POC was made.

## L1. The premise and title decide the views (agreed 2026-11-27)

1. The premise is chosen first, before the look or script. It's one line, "What if you…", that can be pictured as
   one frame, carries a number or a status or social payoff, and the title is 37–49 characters.
2. AI is no longer the channel's lane. Any "what if you" the audience wants qualifies; an AI premise has to win on
   the same test as any other.
3. Before any production, each premise faces the click test against the 10-channel set: would it sit among their top
   films without looking weaker?

## L2. The thumbnail formula (agreed 2026-11-27)

1. The art is AI-made and the type is ours. Local FLUX makes the art first; a paid model is used only with the
   owner's OK on each call. The caption and any number are set in code in one fixed channel typeface.
2. The composition is one face readable at phone feed size (about 170 px wide), one premise prop, a lit ground with
   depth, and at most 3 words or one number. A premise number appears as a glowing label in the world, not as a
   caption.
3. The caption adds the stake or the emotion and never repeats the title.
4. Three variants per film, each checked at feed size beside the 10-channel set before the owner sees it. The owner
   runs YouTube's Test & Compare after upload.

## L3. Voice and narration (agreed 2026-11-27)

1. One narrator talks to "you" in the present tense, with short sentences and dry jokes, performed like a storyteller
   and never read like a documentary. This replaces the v1 rule of characters talking with no narration.
2. Characters, "you" included, get short lines in their own voices at reaction moments: under about 6 words, roughly
   one every 15–20 s. They punctuate the narration, never replace it.
3. The narrator's voice is chosen by ear in the POC against 15 s benchmark narration clips: voice B (free, local) and
   Luc (paid, only with the owner's OK).
4. Second person is the default. First person (ConChaser style) is tested as one POC variant.

## L4. Script structure (agreed 2026-11-27, with owner changes)

Seen in 12 films, openings and endings: a cold open inside the premise with one absurd detail, the title question at
20–55 s, the rules, a real baseline set against "you", the power used bigger each time, a choice that costs something,
then a callback to the cold open, a twist and one question to the viewer.

1. Scripts follow that shape: the cold open has its absurd detail, the "So what if…" title lands by about 0:50, the
   rules come in 3 or fewer, and each real number is set against "you".
2. It's a story with a protagonist arc: the power escalates, a dilemma is promised early, and the climax is a choice
   that costs something.
3. The ending calls back to the cold open and twists into a possible Part 2, then asks the viewer one question. This
   replaces v1's "question every 20–30 s".
4. The ending's tone is whatever this story's audience would want. It isn't fixed (owner).
5. No padding for length. A film runs as long as its story needs; the story matters more than the runtime (owner).
6. Facts stay real and sourced through the claims ledger, but only where they don't break the story's flow. A fact
   that would distract is cut (owner).

## L5. One number on screen that changes (agreed 2026-11-27)

1. When the premise has a natural quantity, it lives on screen as one in-world readout with one design held all film
   (over heads, on a phone, a HUD).
2. It changes only at story beats; each change means a cost, a gain or a warning. The climax or the twist moves it.
3. The same readout goes in the thumbnail whenever the premise has one (L2).
4. It's never forced. A premise with no natural number doesn't get one.

## L6. The look (agreed 2026-11-27)

1. The look is chosen from rendered POCs, never from descriptions. Three POCs: (a) flat 2D with cinematic light,
   (b) soft simple 3D, (c) an AI-painted world with code-animated characters acting in it. Each is the same 60 s
   scene, shown at feed size and full screen beside the reference frames.
2. The winning look must meet five qualities, which go into every film's checklist: light with a visible source;
   depth; one clear subject per frame; one world and one grade per film; characters that act.
3. One house look for the channel. Thumbnails can be richer (L2), but films don't switch looks.
4. Speed is part of the choice: each POC shows its measured render time per minute on the Mac.

## L7. The "you" character (agreed 2026-11-27)

1. Keep the genre's grammar: round head, readable eyes, simple body.
2. Differ visibly at feed size in at least two of: head colour or shape, eye design, signature colour or item. Avoid
   yellow, red and blue hoodies, which the leaders own.
3. One signature attitude for "you", carried through every film and thumbnail.
4. One cast kit: "you" is the same in every film; other characters are the same body with costumes.
5. "You" stays anyone (audience.md): no fixed country, age or gender.
6. The design is chosen from 3 rendered candidates in the POC, at feed size beside the 10 channels' mascots.

## L8. Pacing and motion (agreed 2026-11-27)

1. No fixed cut rate. The story beat sets the pace: quick cuts for action, a held set for a joke or an explanation.
2. Something meaningful changes about every 4–5 s: a cut, an action, a label or number, a character entering.
   Measured on each POC render as the longest static stretch.
3. Characters act in every shot. A camera move over a still image is a slide and fails.
4. Eyes, brows and hands carry the emotion: no mouths, no lip-sync, no line boil or wobble.

## L9. Series, sources and the sign-off (agreed 2026-11-27)

Length is settled by L4: no fixed length, no padding.

1. Every ending can open a Part 2 (the L4 twist). When a film clearly beats the channel's other films, its Part 2 comes
   before a new premise.
2. Sources: a small source line under a fact label, only where it doesn't distract. Full sources go in the description,
   from the claims ledger.
3. One closing line ties the like and subscribe to the climax choice. No generic call to action.
4. Parked until a pilot clears the owner's bar: cadence, the sequel threshold, auto-dubbing (English first) and Shorts.

## Your lens
**The wild premise.** No web search: pure daydream and craft. The rule and its catch first; the strangest consequences and what they make you think; facts you are sure of, marked "verify" where you cannot give a source.
