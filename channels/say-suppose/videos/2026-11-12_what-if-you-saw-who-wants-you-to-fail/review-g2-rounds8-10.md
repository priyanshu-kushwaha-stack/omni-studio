# G2 review, owner-notes rounds 8-10: saw who wants you to fail (v3)

The owner watched the v2.1 cut (9:05) and wrote (`taste.md`, 2026-11-12):

- "Removing them i dont know if that is the solution or not as cat was fine. which rule said to drop it". No rule said to.
  v2.1's cut of the clerk, the tour group, the cat, the group chat and the folder was the session's own reading of
  "didn't quite follow". The taste.md entry that called it "few threads" is corrected, and v3 brings them back.
- "it should start with a short skit and there it should show that you have or got this superpower somehow and then
  probably the narration of the story" (and: "you have been holding this ? what this ?").
- "Story should have more content and people should have a lot. Just like Mr. Beast videos. Every line in his script
  has meaning and keeps the viewer on their toe."

Registered in round 8 (`room lint --owner-note`, two notes; the gate's cap went from 28 to 36 calls).

**v3 (Fable 5.1, `claude -p --tools ""`)** keeps v2.1's plain words, roles in narration and performed moments.
- **The opening skit.** It starts on the metro platform before a word of narration. You open the envelope, read it
  twice, and hold it out to the only other face there. A card snaps open over her head and runs to +22. "Well done,
  love." You point; she sees nothing, steps away and boards. You touch the card and it folds under your finger.
- **"This" is named.** The first narration line says "That's your scholarship letter. You made the cut."
- **More uses of the power, each with a twist:**
  - the clerk at 0 ("Receipt?");
  - the cat (no card at all);
  - the rival at -6;
  - your maths teacher at +41;
  - a mirror (nothing opens, so the one card you can't see is yours);
  - the tour group's eleven zeros;
  - a kid on the bus at +77 ("What did you win?");
  - two classmates you know by what they do (-30, -44);
  - the group chat and the shared folder as the weapon, and their nine congratulations on results day;
  - the clerk's "Just you tonight?".
- **Open loops are concrete questions:** "So who are the other two?", "So what does first cost?"
- **Characters speak in their own free local voices** (PR #51, merged from main; this film's cast added to
  `voices.yaml`: Min-jun, Ji-yoon, Tae-ho, Teacher, Clerk; Woman and Kid use stock voices). "Ms. Kang:" became
  "Teacher:" because story.py's speaker pattern has no full stop (`omni fix` recorded:
  `core/studio/issues/2026-11-12-say-suppose-story_script-1.yaml`).

| Round | Claims check | Story editor | What changed |
|---|---|---|---|
| 8 | 0 | 3: the title question after 0:30; about 95 s of tests without a stake jump; the crowd line inventoried the shot | Taken: "...the dangerous number is at the next desk."; "You asked a thousand strangers to prove your best friend was the exception..."; the day montage cut to one insert |
| 9 | 1: "the 1992 Olympics" must be the 1992 Summer Olympics | 1: the premise question still too late | Both taken. The title question now sits in the second line after the skit, with the letter named in the first |
| 10 | 0 | 3, polish (below) | **Shipped**: `room-g2.md`, round 10, 20 of 36 calls, `room verify` ok |

**Open for the owner, from round 10** (story editor; not applied, so the shipped draft is the one the room read):
1. Line 38: the premise question still lands after the skit, about 0:30-0:36. Proposed: start the narration on "You made
   the cut. So what if every piece of good news showed you who wants you to fail?" and drop "That's your scholarship
   letter". That conflicts with your "what this?" note, so I kept the letter named.
2. Lines 209-215: two numbers in a row (a thousand academies, the ten o'clock curfew). Proposed: "At ten, you climb the
   steps as Seoul's teaching curfew sends every class outside (c03). Around you, one neighbourhood holds about a
   thousand academies (c04). You say it once."
3. Line 355: "Neither of you says a word. Nothing opens." captions the gate. Proposed: "For once, silence lets you
   accept what she gives."
