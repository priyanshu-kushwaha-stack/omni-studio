# G2 room, round 7 (owner notes): shipped

Verdicts: `room/g2/round-7/`. The owner's note (2026-11-10, "Take both fixes", the round-6 viewer blockers):
- "But yours moved. Down." is now "But a verdict doesn't move. Yours did."
- The last line is now "Every night. And you know the number."

Both are recorded in `taste.md`, and the narration note for the last line is updated. Lint and the claims check pass.

**The cap.** Pipeline v2 (main, 2026-11-10) set `rounds: 1`, which makes this film's call cap 20. The film had already
used 30 calls. The owner said "Yes, lift it once". So `rounds: 3` (cap 40) was set in the working tree to run this
round and write its report, then restored; the change is not committed. `room/g2.json` records the cap this round ran
under: 33 of 40.

The seats were Room v2 plus pipeline v2: the first-time viewer is now Claude Opus 5.5, with the story editor (GPT-5.6
Sol) and the fact-checker (Gemini 3.8 Flash). All were ok, with no fact blocker, so the round shipped under the
owner-notes rule. `verify` reports the room evidence ok.

| Seat | Kind | Note | Done |
|---|---|---|---|
| first-time viewer | **blocker** l99, story #11 | "At home, Aarav's waiting. A fee slip for a cricket academy." captions the shot. Fix: "One question. For the one who can see the numbers.", with the academy carried on l105 ("Against a cricket academy's fees. The family's money.") | **open, for the owner** |
| first-time viewer | **blocker** l153, story #11 | "Out in the lane... thwack." names the sound the hold just played. Fix: cut it and let the effect carry it (a crisp thwack and a far-off laugh) | **open, for the owner**: a protected keep since round 2 (voice director) |
| first-time viewer | suggestions l30, l103, l135 | Cut "Here's how it works."; "Yours moved when you moved. His... you read like a verdict."; cut "You give it back." | open |
| story editor | suggestions l77, l11, l130 | Reveal goals without chip labels; add `> UNDER: If the odds say no, is it still your choice?`; make both sides of the dilemma cost something | open (UNDER is required only from videos dated 2026-11-10) |
| fact-checker | suggestions l86, l84 | "treating your number like a verdict"; "In the last cycle?" | open (c01 is spot-checked, and "last year" is the CSE 2025 cycle) |

Keeps: "But a verdict doesn't move. Yours did." (viewer, story); "Every night. And you know the number." (story); "The
last bus home..." (viewer); "You can't borrow someone's odds. Only their apron." (viewer); "One chair. Out of two
thousand five hundred." (fact); "The biggest number?..." (story, fact).
