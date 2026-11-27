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

## Restart overrides for scoring (owner, 2026-11-27) — these win over the scorecard above

- The room picks ONE premise for the first film of a restarted channel. Judge each as that film.
- Hard L1 test inside `excitement` and `views`: a one-line "What if you…" you can picture as one frame, with a hard
  number or a status/social payoff; would it sit among the top films of Awaken, YOUniverse, Ifverse, Jeremy Bearimy,
  Minute Zero, ConChaser, Ifinite, The Hidden Why, Hypothetically and AI In Context without looking weaker? A premise
  that copies theirs sets `copies_trending: true`.
- Do NOT lower a score because the best moment is a loss or goodbye: the ending's tone now follows what the audience
  wants. Do NOT score against a 9-10 minute template: length is free and the story sets it.
- `content`: real material that serves the story; facts are used only where they don't distract.
- `engine` also asks: is there a protagonist arc with a choice that costs something, and a twist ending that opens a
  Part 2? Is there one natural number that can live on screen and change at story beats?
- `buildable`: can a simple round-head character in flat-lit 2D, soft simple 3D, or an AI-painted world show it
  clearly in a 60 s pilot? (ignore "paper-cut").
