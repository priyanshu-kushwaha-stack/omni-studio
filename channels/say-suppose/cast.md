# Say Suppose cast

Approved with the format on 2026-11-06 (`docs/superpowers/specs/2026-11-06-say-suppose-format-design.md`).

| Who | Role | Look | Voice |
|---|---|---|---|
| **You** | The viewer. Everything happens to you | Mustard head `#F2B632` with a tuft, teal scarf `#1D9A8F`, ink body | None. You react; at most a bubble |
| **The narrator** | Speaks to you in second person. Dry, warm, exact. Never seen | none | Arthur (`voices.yaml`) |
| **The stranger** | Hidden once in every video, for a second watch. Affects the plot only when a script says so | Crimson head `#D8344F`, long dark coat | None |
| **Everyone else** | The world you move through. Stock roles: the boss (tie), the kid (cap) | Pastel heads, ink bodies | Bubbles only |

Whether the stranger appears in every video is an open item for the owner (spec, "Open items").

## Script format

- A bare line is spoken by the narrator. There are no speaker prefixes: nobody else has a voice.
- **The five lines** (`rules/story.md` #1) come before the first beat, one line each, in this order:
  `> SITUATION:`, `> DESIRE:`, `> CONFLICT:`, `> CHANGE:`, `> RESULT:`. Not spoken; the room's lint checks them
  (`core/engines/whatif/pipeline/story_lint.py`).
- `> UNDER:` the question under the question, right after the five lines, once (`rules/story.md`). Not spoken.
- `> DARLING:` a spoken line the writer names and defends against review, at most three, each quoting a line of the
  script word for word. Not spoken itself; part of the protected spine.
- `## [mm:ss] Beat name` starts a beat. Any other `## ` heading ends the spoken script (word count, not said,
  sources).
- `> SCENE:` a set and what happens in it. Not spoken.
- `> BUBBLE:` a speech bubble, four words or fewer, with who says it. Not spoken.
- `> TAG:` a stamped label or counter value on screen. Not spoken.
- `> MOOD:` the light for the scenes that follow: `morning`, `day`, `dusk`, `night`, `lamp` or `frozen`. Not spoken.
- `> HOLD:` a wordless beat and how long it lasts, with what the picture and music do. Not spoken.
- Source tags need no line: every spoken line that cites a ledger row shows that row's source on screen.
- A choice put to you is an ordinary narrator line. The figure answers at once by acting. No held pause, no quiz
  board.
- **Digits mean facts.** A spoken digit must cite a `claims.md` row, e.g. `(c07)`. Story numbers are written as
  words ("day twelve", "ten seconds"). Digits inside `>` lines are props, not claims.

## On screen

- You are in nearly every scene and in every thumbnail.
- Figures act with poses, eyes, five mouth shapes and props. No lip-sync, no line boil, no AI motion.
- Only you, the stranger and the rule device keep full colour when a video's device drains the world.
