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
