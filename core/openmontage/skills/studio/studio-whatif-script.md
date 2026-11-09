# studio-whatif: story_script (G2, script)

1. Research first. Write `research.md` from sources you fetched and read in this session, each with its URL.
   Never write a number, a result or a source from memory.
2. Write `claims.md`: one row per real-world claim (id, claim as it will be spoken, source URL, verbatim quote,
   status, note). Status is `sourced`, `contested`, `spot-checked` or `dropped`.
3. Write `script.md` to the beats and script rules in `channels/<slug>/style.md`: second person, one narrator,
   three jumps of consequence, no word count (about 115 words a minute; past about 8 minutes the story seat must
   name why a viewer stays), 15 to 20% wordless (`> HOLD:`), a mood light per scene (`> MOOD:`), stakes the premise
   earns, and a line planted in minute one that returns in the last. Open with the five lines (Situation, Desire,
   Conflict, Change, Result) and pass the must-pass checks in `channels/<slug>/rules/story.md` where the channel has one. Bare
   lines are spoken by the narrator. `> SCENE:`, `> BUBBLE:`, `> TAG:`, `> MOOD:` and `> HOLD:` lines are directions
   and are not spoken (`channels/<slug>/cast.md`).
4. **Digits mean facts.** Every spoken number, date, name or finding about the real world cites its row inline,
   e.g. `(c03)`. Story numbers are written as words ("day twelve"). What the viewer does in the story is never
   stated as fact. Where the science is uncertain the narrator says so and the row is `contested`.
5. `.venv/bin/omni qc <slug> <video> story_script` must pass (claims).
6. `status: awaiting_human`, then stop. The owner reads the whole script before any asset is generated.

## Never
- Generate assets, call a paid provider, or approve a gate yourself.
