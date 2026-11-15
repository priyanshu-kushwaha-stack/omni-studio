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
