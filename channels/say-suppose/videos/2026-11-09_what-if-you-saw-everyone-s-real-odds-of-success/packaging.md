# Packaging: everyone's real odds of success

status: G1 passed by the owner, 2026-11-09 (batch 1 picks in chat): title A, thumbnail c ("QUIT?")
topic: idea room 2026-11-09, M24, median 9 (8-9), proposed by Gemini 4 Argon (`backlog/idea-room-2026-11-09.md`)

## Premise

You sit in a coaching hall of four hundred students and a glowing chip lights over every head: the real odds that
this person gets what they most want. Then you see your own: nought point nought four per cent.
The chips are invented. The odds behind them are the real-world part, to be sourced at G2: seats against
applicants for one exam, and base rates.

## The viewer

Riya (`audience.md`), 22, Pune, in final-year exam season; the bus, chai outside the coaching centre, mock-test
scores, a younger cousin at home. Here "you" sit in an entrance exam's coaching batch. The English packaging stays
readable worldwide.

## Five lines (rules/story.md, check 1)

| | |
|---|---|
| Situation | You prepare for the exam everyone sits, telling yourself hard work makes anything possible |
| Desire | To get in, and to know it will pay off before you spend another year |
| Conflict | Your chip reads 0.04%, so you chase the biggest number and steer everyone, your younger cousin first, towards safe ones |
| Change | You find a number tells you what is likely, never what is worth choosing: your advice set your cousin's to zero |
| Result | You know your odds and sit down to work anyway; your cousin is back in the lane with his bat |

## Beat outline (runtime shares; length estimated 7 to 8 minutes, the script decides)

| Share | Beat | What happens | Checks |
|---|---|---|---|
| within 20 s | The change | First seven seconds, the thumbnail's picture: the night batch, row three, you copying the topper's notes as always, when chips flicker on over every head and yours glows crimson, 0.04%; you stare at it. The title question is spoken over that picture | 2 (confirm the click: the hall, the chips), 4 (the habit: copying the topper) |
| within 30 s | The rule | Each chip is the chance that this person gets the goal they would choose with nobody watching: it starts from the crowd's base rate and updates from what they do now. Your own, the 0.04% from the opening, seen over your shoulder: the hall becomes one lit chair among two thousand five hundred, then back to your face. You decide: "The biggest number is the right choice" (the planted line). What you can lose: the year, the dream; the question: do you keep going? | 3, K13 (your chip by 0:30); the base rate is stated here, before halfway |
| to 35% | First jump: the hall | First, the lane at home: your younger cousin bowls to you, you fix his grip, promise another game; his chip says nought point two. Then the hall. You check the teacher expecting certainty: three per cent. Therefore you trust the topper, but her chip is for music, not the exam. So you test the chaiwala, expecting another fantasy: sixty-one. You drop the exam for the safest-looking target | 5 (therefore, so), 6 (each reading reverses an expectation), 9 (cousin named by 0:45 with a warm beat) |
| ~45% | The picture only this premise can show | You tell your cousin to quit and stop wasting the family's money. The wordless peak: his chip drains to zero the moment he nods, his hand leaves the bat, and it rolls out of frame | 8 (before the midpoint) |
| to 65% | Second jump: the year | Misconception first: you take the fat-number placement and stop studying; therefore your mock score falls, and your chip with it, to forty-eight per cent. One sourced comparison, seats against applicants for one exam (to source at G2), shows that a big number is a crowd's base rate, not a verdict on you; in the next line you reopen your notes and the chip stirs. The cost near 60%: your cousin's bat, hidden behind the cupboard | 7 (misconception first), 9 |
| to 90% | Third jump: a city of chips | The city lit up, built only from people we know: the teacher, the topper at her keyboard, the chaiwala's new board, your cousin's dark chip. The turn breaks "The biggest number is the right choice": the biggest number tells you what is likely; it cannot tell you what is worth choosing. The choice at about 78%: keep the safe placement, which means his bat stays hidden; you give the bat back and let him choose before you choose your own exam | 10, the choice at 75-80% |
| last tenth | Back to you | Row three, not copying. You don't look up at your chip. Last line, quiet, inside the image: "Row three. You don't look up. Out in the lane: thwack." | 12 (opposite of the opening: you knew nothing and believed; now you know and go anyway) |

No new power rule after halfway; no new person after 60%. Body and exam stress explained, never advised.

**Rule device:** the glowing chip over a head; it starts at the crowd's base rate and moves when that person acts. Your own is shown over the shoulder, never as a phone-camera close-up (animator, round 1).

**Research for G2** (not verified yet): entrance-exam applicants against seats for one named exam (one dataset, one claims row; fact-checker, round 1); the seats and
applicants said as people on Riya's bus, not as a ratio; no named biases (the first-time viewer, round 1, would not
know "planning fallacy" without pausing).

**The viewer's "but what about":** What counts as success, who decides (the rule beat: the goal you'd choose with nobody
watching)? Does it know my effort? Does it change if I study harder (the second jump: it moves with what you do)? Is my
cousin's dream mine to judge? What does 0.04% even mean in people (one chair in two thousand five hundred)?

## Titles (yt-package `title.py`, ten written, three kept)

| | Title | Score | Phone cut |
|---|---|---|---|
| A | What If You Saw Everyone's Real Odds of Success? | 84 | "What If You Saw Everyone's Real Odds of..." keeps the subject |
| B | What If You Knew Your Dream Had a 1 in 2,500 Chance? | 100 | "What If You Knew Your Dream Had a 1 in..." loses the number |
| C | What If Your Odds of Success Floated Above Your Head? | 84 | "What If Your Odds of Success Floated..." |

B scores higher (it carries a digit) but a phone cuts it before the number, and it says the thumbnail's number twice
in other words. A is the owner's pick and leaves "everyone" to the hall. Others: `title-lint.json`.

## Thumbnails (rules/thumbnails.md, K1-K15)

Drawn in code with the engine's rig (`channels/say-suppose/brand/thumbs/`). Renders in `renders/packaging/`
(git-ignored), numbers in `thumb-checks.json`.

The set: a night coaching hall under tube lights, emptied so the frame keeps few focal points (the cold read took the
blurred rows of students for noise); you large at the left, shocked, looking at a crimson chip glowing beside your
head; the tag "ME?".
**One variable (K15): the tag; the chip reads 0.04% on all three, the number the film gives you by 0:30.**

| | Value | Words on it | K3 head | K4 grey sep. | K5 words, cap, contrast | K7 shared with A/B/C | K8 | K9 colour, mean lum. | K10 edge on white / dark | K11 |
|---|---|---|---|---|---|---|---|---|---|---|
| a | ME? | "ME?" + counter/chip "0.04%" | 44.3% pass | 4.16:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 70.2, 0.074 pass | 20.14 / 1.05 | pass |
| b | STAY? | "STAY?" + counter/chip "0.04%" | 44.3% pass | 4.16:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 71.7, 0.079 pass | 20.14 / 1.05 | pass |
| c | QUIT? | "QUIT?" + counter/chip "0.04%" | 44.3% pass | 4.16:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 71.6, 0.079 pass | 20.14 / 1.05 | pass |

Measured by `brand/thumbs/check.py` (K3, K4, K5, K8, K9, K10, K11); K7 by `title.py` against all three titles. K10's numbers are the frame edge against the feed: every candidate is a dark frame, so on the dark theme the edge melts into the page (about 1:1) and the hero and the tag carry it; whether you are still found first on both themes is the cold read (K1, K2), in the room notes below. K6 (tag type), K12 (phone cut), K13 (payoff by 0:30, see the beat outline) and K14 (family likeness) are judged, not measured.


Recommendation: **A, title A with thumbnail a ("ME?").** It is your reaction to the number, and the cold read named
0.04% the most clickable number of the first round's three (0.04%, 0%, 97%). The first round's 0% and 97% were retired:
neither is on screen by 0:30 (K13, first-time viewer, round 1). "STAY?" and "QUIT?" put the film's choice on the tag.

## Runtime

The channel's paper-cut engine (`render_runtime: external`), logged in `artifacts/decision_log.json`; Remotion and
HyperFrames through `video_compose` were considered and set aside (no rig, no cue timeline).

<!-- ROOM -->

Ship it, or change it?
