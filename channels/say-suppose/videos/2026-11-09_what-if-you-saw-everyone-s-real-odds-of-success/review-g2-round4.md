# G2 room, round 4 (owner notes): notes and what was done

Verdicts: `room/g2/round-4/`. The owner's note (2026-11-10, "Take the room's fix"): the round-3 voice blocker's line,
"The last bus home. And you can't stop reading them. Like timetables.", replaces the bus line that captioned the
picture. Recorded in `taste.md`. Linted with `--owner-notes`; story lint and the claims qc pass.

Two things changed under this round. **Grok finished:** the room's per-model timeout (PR #15) let the first-time viewer
run (540 s, ok). **Gemini 3.7 Flash is gone:** cursor-agent stopped offering `gemini-3.7-flash-high` today, so both fact
calls failed in about 5 s ("Cannot use this model"). The fact seat moved to `gemini-3.8-flash-high` (studio PR #26),
and was re-run once. **Room v2** (owner, 2026-11-10) also landed on main mid-round. Its story seat is the story editor,
so that seat ran here as well. The retention editor's verdict, made under the earlier config, stays on record.

| Seat | Kind | Note | Done |
|---|---|---|---|
| fact-checker (Gemini 3.8) | **blocker** l87 | "UPSC applicants" generalises one exam's figure to every UPSC exam | applied in round 5: "UPSC civil services applicants" (script and c01) |
| first-time viewer | **blocker** l17, story #2 | The opening's 7 s are only the copying; the thumbnail's 0.04% chip arrives about 12 s in | open: raised again in round 5, left for the owner |
| first-time viewer | **blocker** l114, story #11 | "He didn't even argue." says what the peak showed | not applied: in round 5 the same seat and the story editor keep the line |
| first-time viewer | suggestions l33, l38, l87 | Shorter rule, the ident under the planted line, land c01 on an action | open (owner or G3) |
| fact-checker | suggestion l89 | Restore c02 so a sourced fact breaks the misconception | not applied: c02 was cut in round 1 for pace (story #7) |
| retention editor | suggestions l80, l102, l123 | Drop goal labels; "But at home..."; compress the reveals | open (the labels question is on the owner page) |
| story editor | none | story 9 | - |
