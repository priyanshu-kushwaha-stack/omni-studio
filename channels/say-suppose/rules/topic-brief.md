# The topic pitch: what every idea agent brings

Owner, 2026-11-10. Read by the three pitchers of `/say-suppose-topics` (`.claude/skills/say-suppose-topics/SKILL.md`);
the scorer reads the scorecard at the end. Spec: `docs/superpowers/specs/2026-11-10-say-suppose-topics-skill-design.md`.

## What we want

Exciting what-ifs, told to **you** in second person, with enough real material for an exciting 15-minute video, so
that after the owner's cuts a tight 6-8 minute script is easy. The owner's favourites, for the level of excitement
(never to copy): an infinite money glitch; processing everything 10x faster, or 10x slower; redoing any 10 seconds of
your life; time travel. A strong rule with a catch, lots of real science, money or society behind it, and consequences
that keep getting bigger.

The viewer: a young Indian, comfortable in English, on a phone in the evening, whose week is chai, the bus or metro,
exams, the office and family (`channels/say-suppose/rules/story.md`). The packaging stays readable worldwide.

## Bring 8 topics, as one JSON object

Answer with a single JSON object, nothing else, in a ```json fence:

```json
{"topics": [{
  "id": "short-slug",
  "title": "Under 50 characters, sized to a long video, one extreme claim the film delivers",
  "premise": "One sentence a stranger gets at once",
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
| `excitement` | x3 | Would you click and tell a friend? One clear sentence, original, extreme, fun |
| `content` | x3 | Real material for an exciting 15 min, so 6-8 min is easy? Count the facts that move a beat; flag a thin mine |
| `views` | x2 | Do similar what-ifs pull views now; does the thumbnail work at a glance? |
| `engine` | x1 | Does the rule keep making new, bigger situations; does *you* lose something? |
| `buildable` | x1 | Can code-drawn paper-cut scenes show it this week? |

Also give `copies_trending` (true when the twist is a trending video's; it costs 10) and `best_moment` (the one scene
the film hangs on). Never add up the total: `python -m studio.topics` computes it.
