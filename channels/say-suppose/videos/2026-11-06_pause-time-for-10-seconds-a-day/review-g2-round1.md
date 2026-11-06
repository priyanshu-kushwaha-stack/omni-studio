# Script review, round 1 (before the owner's G2 read)

2026-11-06. Five independent reviewers read `script.md` (commit e546291), each from one seat, without seeing
each other's notes: a first-time viewer (20, Pune, watches on a phone at night), a science fact-checker, a
retention editor, a voice director, and the animator who has to build it. Notes are merged here; the column on the
right says who raised each one. Nothing has been changed yet: the owner decides what to apply.

Verdict of the first-time viewer: "I'd probably finish it, but only because of the bus and the cliffhanger, and
I'd skim the middle." Best moments named: chronostasis ("You just got the remote"), "too small for greed, the right
size for an accident", the stranger.

## A. Facts that are wrong or overstated

| # | Line | Problem | Proposed fix | Raised by |
|---|---|---|---|---|
| A1 | "Your own head ages faster than your feet. Over 79 years, it adds up to about 90 billionths of a second (c16)." | NIST's 90 ns is for 33 cm of height, not head to feet (checked in the saved page) | "Live one foot higher than your twin, and over 79 years you age about 90 billionths of a second more (c16)." | fact-checker |
| A2 | "Nobody catches that. Nobody human." | People catch falling mugs; reaction time is shorter than 0.45 s | "Usually, you just watch it go." | fact-checker |
| A3 | "Astronauts on the space station come home 0.007 seconds younger…" | Drops "after six months" | Add it | fact-checker |
| A4 | "Ignore that, and your map drifts by about 10 kilometres a day (c17)." | A classroom estimate; receivers correct for clock offset, so physicists dispute it | Cut the drift, or mark c17 contested and say "would" | fact-checker |
| A5 | "…and 2.5 seconds before the brakes even bite (c13)." | 2.5 s is the design allowance to reach the brake, and clashes with the 23 m figure | "allow 2.5 seconds between seeing danger and reaching the brake"; "even an alert driver needs about 23 metres" | fact-checker, voice |
| A6 | "Roads are the most dangerous thing in this kid's life." | Uncited, and only true worldwide; under-5s are outside the WHO statistic | "Worldwide, roads are the leading cause of death from age 5 to 29 (c12)"; draw the kid school-age | fact-checker |
| A7 | "So we cheat on exactly two things… Everything else in this video is real." | The story also cheats on things you touch moving with you (the mug, the kid) | "Three cheats… Every fact in this video is real." | fact-checker |
| A8 | "People walk about 1.4 metres a second… 14 metres" | That is the fastest age group's mean | "A brisk walker covers about 14 metres" | fact-checker |
| A9 | "three and a half days" | 292,000 s is 3.4 days | "about three and a third days", said once | fact-checker, viewer, voice |
| A10 | "They define a second as…" | The SI definition sets the second, not the clocks | "A second is defined as…" (or cut, see B4) | fact-checker |

## B. Story and pacing

| # | Problem | Proposed fix | Raised by |
|---|---|---|---|
| B1 | About 30 s of road statistics while the bus is still moving: tension leaks at the peak, and it cannot be staged | Kid in road → "Do you shout? Do you run? Neither works." → pause. Statistics after the rescue, over the stopped bus | viewer, editor, animator |
| B2 | Three relativity facts in a row, then "No satellite would notice… The cost is not your age": a lecture that ends in "never mind"; the likeliest scroll-away point | Keep one or two lines; move the real cost ("you can never stop watching") up to the 3:30 turn | viewer, editor |
| B3 | The thumbnail (bus, kid, counter) is not paid off until about 3:00; "a confession before we start" reads as preamble | A two-second flash-forward of the frozen crossing in the first 20 s: "On day twelve, ten seconds will stand between a bus and a kid. On day one, you spend them on coffee." Shrink the physics confession to two lines | editor |
| B4 | The first two minutes are a list of numbers (atomic clock, mug, walking, sprint, typing, heartbeat); "Take a guess" then a list feels like a quiz | Keep the mug and the sprint; cut the atomic clock, typing and heartbeat | viewer, editor, voice |
| B5 | The clock runs backwards: "about an hour a year" and a montage, then "DAY 12" | Day twelve comes straight after the first days; the year montage moves after the rescue | viewer, editor |
| B6 | The countdown stops at "Three" while the rule says ten seconds | "Three. Two. One." Colour returns on zero; the counter is the split-flap, not a tag | voice, animator |
| B7 | "If one person got this power, why would it be only one?" gives the twist away a scene early | Cut it. Plant the stranger, on purpose, in the frozen crowd at the bus scene (the sample already has them there) for a rewatch | viewer, editor, animator |
| B8 | The ending: narration after the blackout bleeds the chill; "Ten seconds will not make you rich…" is about the power, not the real world | Real-world line (chronostasis: your brain already pauses time) before the stranger; end on "they're looking right at you", then a short end card | editor, viewer |
| B9 | Generic comment call, which invites the bank robbery the video just ruled out | "Would you spend yours every morning, or save it for a day that might never come?" | editor |
| B10 | Bank and exam beat: distance is the wrong argument, and nobody cheats by reading | Bank: "Ten seconds gets you to the counter. It does not open a vault." Cut the exam | viewer, fact-checker |
| B11 | "use it at midnight to finish a sentence before anyone can interrupt" makes no sense | Replace with a clear small use | viewer, animator |
| B12 | "Dodge your boss" means nothing to a student | Optional: owner's call. The sample has the boss | viewer |
| B13 | Viewer questions bunch up: none from 0:12 to 1:29 or 2:09 to 3:21 | Add "What's your first pause for?" and a lift-door choice, answered at once by the figure | editor |

## C. Sound (voice director)

- Contractions throughout ("you're", "doesn't"); full forms only for emphasis ("It is not free").
- Generate the countdown as one take and slice it to the counter; one-word lines ("Pause.", "You run.") in a
  carrier phrase.
- A separate TTS text per line with numbers spelled out ("seven thousandths of a second"); the script keeps digits
  for the claims check. "Chronostasis" respelled for the voice.
- Tense slips: "You just got the remote" → "Now you have the remote"; "could" and "would" drift inside the story.

## D. Build (animator)

- About 22 scenes; 13 reuse the sample's four sets. New: sky (ISS, satellite), mirror, night desk, an "exhibit"
  wall for fact props; props cat, wall clock, lift, bicycle, vault; rig work for carrying the kid.
- Five narration stretches have no `> SCENE:` line (the physics confession, the ten-second list, chronostasis, the
  relativity run, the long run). Each needs one.
- Numbers worth showing on a tag: 0.45 s, 14 m, about an hour a year.
- Continuity: the kid's ball (leave it in the road), one trigger gesture (the sample uses a snap, the script a
  slap), the kid stays grey while carried.

## Recommendation

Apply all of A, B1 to B11 and B13, the contractions and tense fixes from C, and every scene gap in D, as one
revision (v2). Keep the boss (B12) unless the owner prefers a student setting. Refill to 900+ words with choices
the figure acts out, not more facts. Then re-run the claims check and a second, shorter review round on v2.
