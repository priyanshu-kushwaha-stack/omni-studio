# Say Suppose: a topic skill, and craft lessons for every stage

> **Superseded (2026-11-26):** Say Suppose is restarting from scratch; this is the archived v1 design. See `channels/say-suppose/RESTART.md`.

Owner, 2026-11-10: "create a skill for that in the repo which can be invoked anytime and that skill should spawn ...
Agents those who would be generating Ideas", "give the complete brief about the video ... Can it be made an exciting
15 minute long video ... so that ... we are able to atleast create a 6-8 min video from it", "rated based on the content
first", "we will select 3 topics", and "take anything from these videos ... learnings ... in other stages". Design agreed
in the session ("looks fine. go ahead").

## 1. The skill: `/say-suppose-topics`

A Claude Code skill in the repo (`.claude/skills/say-suppose-topics/SKILL.md`), run any time, optionally with a theme.
It replaces the six-round weekend idea room (`channels/say-suppose/rules/ideas.md` is rewritten to point at it).

| Seat | Model | How it runs | Lens |
|---|---|---|---|
| Pitcher | Claude Fable 5.1 | Claude Code subagent, no web | The wild premise: pure daydream, the rule and its catch |
| Pitcher | Gemini 4 Argon (`gemini-4-argon-high`) | `cursor-agent -p --mode ask`, empty folder | The content mine: research-heavy, every fact sourced |
| Pitcher | GPT-5.6 Sol (`gpt-5.6-sol-high`) | `cursor-agent -p --mode ask`, empty folder | The viewer's thrill: hooks, clicks, the thumbnail |
| Scorer | Claude Opus 5.5 | Claude Code subagent | Merges duplicates and scores every topic blind; proposes nothing |

Each pitcher brings 8 topics, in parallel, alone, given: the channel brief (`audience.md`, `style.md`, `story.md`), the
owner's taste examples (infinite money glitch, 10x faster or slower, redo 10 seconds of your life, time travel), and
every title already made or in the backlog (no repeats). The scorer sees the briefs with no proposer names.

## 2. The brief (one per topic; JSON, `studio.topics` validates it)

| Field | Holds |
|---|---|
| `title` | Under 50 characters, sized to a long video, one extreme claim the film delivers |
| `premise` | One sentence a stranger gets at once |
| `thumbnail` | The one image (who, the emotion, the stake) and at most 3 words of tag |
| `rule` | The power exactly, with its limits and catch: the engine of the video |
| `hook` | The first 10 s in one breath: setup, stakes, tension, no warm-up |
| `beats` | 8-12 pointers, each a scene: what happens, what we learn or feel; three jumps of consequence, each bigger |
| `feeling_map` | 4-6 feelings in order (wonder, greed, fear, guilt, awe ...) |
| `restarts` | A new complication about every 3 minutes, so a long video never runs on one storyline |
| `content_mine` | 12+ real facts, numbers or science, each `{fact, source, beat}`: the source URL and the beat it moves (a fact with no beat is dropped) |
| `twist` | The late turn or mind-boggle, after the story has earned it |
| `ending` | The worldview flip: "you'll never see X the same way" |
| `closest_video` | `{title, url, difference}`: the nearest existing video and why this one is not a copy |
| `runtime` | `{strong_minutes, cut_to}`: minutes of strong material (aim 15) and what goes to reach a tight 6-8 min script |
| `views_case` | Similar videos that pull views now, with links, and why this one can |
| `under_question` | The one line it is really about, in the viewer's words |

## 3. The scorecard (content first; total out of 100, computed by `studio.topics`, never by the model)

| Criterion | Weight | Asks |
|---|---|---|
| `excitement` | x3 | Would you click and tell a friend? One clear sentence, original, extreme, fun |
| `content` | x3 | Is there real material for an exciting 15 min, so 6-8 min is easy? Thin mines are flagged |
| `views` | x2 | Do similar what-ifs pull views now; does the thumbnail work at a glance? (No thumbnail, no idea) |
| `engine` | x1 | Does the rule keep making new, bigger situations; does *you* lose something (character over spectacle)? |
| `buildable` | x1 | Can the paper-cut look show it this week? |

Each score is 1-10 with a one-line reason. `copies_trending: true` (the same twist as a trending video) takes 10 off the
total. The scorer also writes `best_moment`.

## 4. What the owner gets

- One page (`python -m studio.topics page`), every topic ranked by total, each with its brief, its scores and reasons,
  and a Pick button; at most three picks, saved on the page (db `picks/owner`) for the session to read back.
- `channels/say-suppose/backlog/topics-<date>.md` and `.json` with the same list, so nothing lives only on the page.
- The three picks enter the pipeline at G1 (packaging), then the first-cut review.

No paid provider: Claude and Cursor subscriptions only.

## 5. Lessons for the other stages (from the owner's three reference videos)

Sources: Think Media, "MrBeast Shares His Best YouTube Advice"; Think Media Podcast with Dr Plants, "He Got 6 Million
Subscribers With Only 12 Videos"; Aprilynne Alter, "I Watched Every MrBeast Interview". All craft talks.

| Stage | Change |
|---|---|
| G1 | `rules/thumbnails.md` K16: the title is under 50 characters, sized to the runtime, one extreme claim the film delivers |
| G2 | `rules/story.md` #13 **Every fact moves the story**: each real-world fact pushes a beat or a feeling on the feeling map, or it is cut |
| G2 | `rules/story.md` #14 **A restart every ~3 minutes**: a new complication from the rule; dense front half; one big payoff kept for the end |
| G2 | Check #3 tightened: the hook lands premise, stakes and tension inside 10 s; the title's promise is met by about 0:15 |
| G2 | Story loop: read the script aloud with the local narration; a line that tires on the second listen is cut. The owner's stranger test: the opening played to one person who doesn't care about the topic, alone, unannounced |
| G3 | Sound first: the final picture-lock pass renders the cut with the **narration muted**; it must still hold on music and sound alone |
| G3 | The first 30 s: something changes about every 3 s, bright, and the opening frame works as an autoplay preview |
| G4 | Cold viewers' pause points are edit notes; a small fix (a colour, a background) can stop a mass drop-off |
| All | One named thing improved per film, recorded in `taste.md` |

The story editor owns #13 and #14; the viewer owns the tightened #3 with the story editor.
