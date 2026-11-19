# G2 review, owner-notes round: v2 (flowing, clear in one watch, facts as surprises)

The owner on the v1.1 first cut (2026-11-19, `taste.md`): **"Looks fine overall but not flowing in terms of dialogue /
narration wise. I think we should make it like people get everything in just one watch they should feel surprised
knowing the facts and curious also to what happens next ?"**

## The diagnosis (v1.1's 104 spoken lines)

1. Telegraph fragments the picture had to decode ("The key to the town. A convoy, off to the next town. Your till
   hums." / "His napkin. Your sum. Same line missing." / "Problem three.").
2. Lines that only made sense if you saw something ("It is not." / "Marco: Got hired here!" "Again?" "Again." /
   "Here, you type the new job in." / "Too far." / "Checked by Marco.").
3. Characters didn't talk to each other: about thirty one-off remarks thrown at "you", who never answers.
4. Facts arrived as formula inserts ("It's true, by the way." / "It's been done, more or less." / "It's been tried."),
   never as the viewer's guess flipped.
5. The core sum stayed abstract ("bears only a slice of the spending it destroys"), so the climax's toll was hard to
   follow on one watch.

## What v2 does (Fable 5.1 rewrote every spoken line; the picture's structure kept)

- Sentences that hand off between narrator and characters; scenes as exchanges ("It isn't me. It's Mondays." / "Tell
  them Tuesday."; "That's my grill." / "It was your grill on Mondays. Now it's his every day."; "You hiring?" /
  "Night shift." / "I typed WATCHER."; "So we all stop." / "You stop first." / "...No." / "Then nobody stops.").
- Every fact set up as the viewer's guess, then flipped ("Most people would guess the cash machines killed the
  tellers. They didn't."; "You'd think a boss who doubled his workers' pay had lost his mind."). Facts that didn't
  surprise or move the story were cut: Flippy, Jevons's coal, Baumol's quartet, Pigou's name, the Reuther story.
- The core sum worked through with Marco on the napkin: four hundred a week; forty back over your counter; the rest
  to the barber, the garage, the grocer and the bar; you keep four hundred and lose forty, they lose the rest; every
  owner does it, and the slices are the town. The dial pays it off in the same numbers: a machine costs its rent plus
  the three hundred and sixty its worker used to spend elsewhere, and that goes out again as the town's cheque.
- A pull into the next section at every seam ("And by now the whole town has heard where the plant got its
  painters." / "And at midnight you try to fix it with one more word.").

## Room (owner-notes rounds 2-6; the note registered at round 2; 12 of 20 calls)

Taken: Ford's line said as his own reason, the pay spent "with storekeepers and distributors" (c17), not "buying
customers"; "better AI" (c04's word); the contested model never "checked" by the invented story; Alaska's *eligible*
residents (c19); Visa's "hundreds of real transactions, in pilot trials with its partners" (c28; the ledger row
reworded to match its quote); the second hook by 0:30 ("Six weeks from now..." follows the title question); tellers
misconception-first; the walk-away rule planted in the rule at minute one ("the moment you do, any renter can walk
away"); CUSTOMER typed as a job ("the one job nobody in town is doing any more"); the close as a choice ("So, would
you have turned the dial?"); the cheque's failure causing the march; plainer stakes on "Too far"; the key line given
a consequence. The session's own fix after reading the cut: "a machine now costs ... its rent plus the three hundred
and sixty", so the rival's "Cheaper to hire a cook." is true. Round 6 ships (claims 0).

**Left for the owner, one line each** (story editor, round 6):
1. The dial loophole: you could still lower the dial later (raised in every round; the G1 room wanted a small one
   left for the comments). Keep it open, or close it.
2. The rule runs past "three lines" (the dial's walk-away clause makes it long).
3. The napkin's first step gives four hundred and forty close together.
The story editor also calls the sequel hook (a card that isn't yours) a new rule after halfway: it is the G1 room's
own sequel twist, kept.

## Narration (free, local)

96 lines, 11:29, voice B and the eight character voices. Every take was checked against the script by speech
recognition (`taste.md` 2026-11-17: every word must be heard): ten takes re-rolled with a changed direction (the local
voice had improvised laughter on three, and swallowed "Then" twice), three lines reworded so they can't be misheard
("Smash our machines", "a machine can only pay with your card", "taxing the machine itself", which was heard as
"attacks"). What remains are spelling variants only (cheque/check, two/to). Mutes in `mutes.txt`; the Rival's line
low-passed again. The mix now uses main's cutter (PR #61, voice end, not Whisper's word end).

## The cut

Parts A, B and C re-anchored to v2 by their builders (72, 75 and 91 shots): new shots for every exchange (each
speaker on their line, the listener reacting), the guess shown before each fact's card, the worked sum drawn on the
napkin one spoken phrase at a time, the dial's napkin paying it off. Make Them Buy moved from part B to part C (C
imports B's components).

`renders/v2/v2-720p.mp4` (git-ignored): 1280x720, 11:29, -19.6 LUFS. `omni qc story_script` on the cut passes (claims,
clicks; two of the Rival's takes needed a mute and a low-pass in the full mix). Rendered as before: `RoughCutPicture`
in 2,000-frame chunks, `RoughCutSound`, then the mux with the tools' limiter.

**For the owner.** Watch the v2 cut once and give every note at once. Also the three one-line story notes above (the
dial loophole first). G2 passes only by your own `omni approve`.
