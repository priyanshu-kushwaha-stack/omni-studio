# Say Suppose: three films a week on a locked template

> **Superseded (2026-11-26):** Say Suppose is restarting from scratch; this is the archived v1 design. See `channels/say-suppose/RESTART.md`.

Owner, 2026-11-11: "ok aligned lets do it your recommended way", after the competitor decode
(five what-if channels at 0.9-12.7M views in about a month; growth from volume on one locked template, sequels on
breakouts, a personal power with a social stake) and the script research (the 10-step spine, about 159 words a minute).
For three weeks (nine films) Say Suppose makes three films a week, each changing one thing, then the numbers decide
whether to push toward daily.

## 1. The rhythm

| Step | What happens | Owner time |
|---|---|---|
| Batch packaging (G1) | `/say-suppose-topics` slate, the owner picks three; their three G1 packets are shown together and passed in one sitting | ~10 min for three |
| Drops | Script on the template, the free local narration, the 720p first cut, as `studio-whatif-script` describes | none |
| **Cut review** | The owner watches the 720p cut once with the script, gives every note at once, and after the one notes round signs G2 (story lock) and G3 (picture lock) in the same sitting | ~15 min |
| Final watch (G4) and publish (G5) | Unchanged | ~10 min |

Every gate stays in code and only the owner passes it; the cut review is one sitting with two signatures. No paid call
by default: the local Qwen-Arthur voice ships, and the paid voice A/B runs only when the owner asks for it on a film.

## 2. The template (every script starts from it)

`rules/story.md` gains the template checks; `style.md` the pace.

| Item | Rule |
|---|---|
| Length | 9-10 minutes at about 155 words a minute (1,300-1,500 spoken words); holds about 5% of the runtime |
| Spine | Cold open inside the power, working; premise by 0:30; a two-or-three-line rule with one limit flagged ("remember that"); a fast honeymoon ladder; the "but" hinge; numbered problems; a ticking-clock climax solved by a plant; the peak gives something up; a sequel hook |
| Pull | An open loop at least once a minute; a stake jump about every 80 seconds; humour about once a minute |
| Cast | "You" plus a small recurring cast (a cousin, a friend, family) with a running gag that carries the emotion |
| Facts | Each real fact becomes what it means for you ("a normal person X, you Y"), a joke, a shock or a raised stake |
| Close | "So, would you …? Tell us in the comments. And if you'd have done the same, hit like and subscribe." |
| Chapters | 6-8 named chapters in the description |
| Sequel | Every script ships with a sequel outline (`sequel.md`: the hook, the new rule twist, five beats) |

The "written to be spoken" rule (owner, 2026-11-08) stays: fragments give colour, but every line moves the story;
no run of mood-only fragments.

## 3. The room

One reviewer, the story editor (GPT-5.6 Sol, now also judging the template checks), plus the claims check (Gemini).
The viewer seat leaves; the room code requires only the roles a round needs to ship (`required_roles`), so a room with
`viewer_required: false` may omit the viewer.

## 4. Breakouts

A film that beats three times the channel's median views within 48 hours gets its Part 2 within three days, from its
`sequel.md`. Part titles carry "Part 2" and the thumbnail a PART badge.

## 5. Not in this change

- The reusable scene library (coaching class, metro, home, office, hostel), so a film reuses most of its sets: its own
  task, built from the sets of the three films in flight.
- Same-day Shorts and Hindi versions: after the first batch.
