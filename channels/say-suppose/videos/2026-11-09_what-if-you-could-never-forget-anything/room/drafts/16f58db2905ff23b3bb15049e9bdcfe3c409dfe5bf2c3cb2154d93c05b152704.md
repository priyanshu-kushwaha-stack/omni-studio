# Packaging: never forget anything

status: G1 awaiting the owner (batch 1, video 5 of 5)
topic: idea room 2026-11-09, M03, median 8 (8-8), proposed by Claude Fable 5.1, Gemini 4 Argon and Grok 4.7
(`backlog/idea-room-2026-11-09.md`)

## Premise

It is the night before your final-year exam and you remember every page you have ever read. You also remember, word for
word, what your mother shouted at you when you were nine, and it is playing right now.
The power is invented. The real-world part, to be sourced at G2: the research on people with highly superior
autobiographical memory, and what they say about living with it.

## The viewer

Riya (`audience.md`), 22, Pune, in final-year exam season; revision at night, chai brought to the desk by a mother
who calls twice a day, a family that argues and makes up. Here "you" sit a final-year exam. Three of five researchers proposed this on their own.

## Five lines (rules/story.md, check 1)

| | |
|---|---|
| Situation | The night before the exam you cram, and say what everyone says: you'll forget it all after anyway |
| Desire | To remember everything, top the exam, never lose a thing you learned |
| Conflict | You keep everything, including every hurt, and treat your mother as the person from one bad day |
| Change | You find forgetting was how you two forgave each other; you can't lose the shout, but you can stop replaying it |
| Result | You keep the shout but stop replaying it, and take the tea she brings you |

## Beat outline (runtime shares; length estimated 7 to 8 minutes, the script decides)

| Share | Beat | What happens | Checks |
|---|---|---|---|
| within 20 s | The change | First seven seconds, the thumbnail's picture: the lamp on, your hands up, pages swirling round your head, the crimson shout with mom's face from when you were nine. The first words, yours, from a second before: "I'll forget it all after anyway", cramming as always, the tea already in her hand. The title question is spoken before twenty seconds | 2 (the thumbnail's pages and shout), 4 (the habit: cram and forget) |
| within 30 s | The rule | Nothing you experience fades, from now and backwards; you can't choose what stays. Planted line: "Forgetting is losing." What you can lose: the shout keeps playing because you can't choose what stays, and the exam is in the morning; the question: is forgetting a flaw? | 3, K13 |
| to 35% | First jump: the exam | Every page, the internship boss's late messages, the ad on the metro, all at once in the exam silence. Then the question quotes no page; it asks you to apply one to something new, and you freeze. The fact lands at once: one sourced finding on recall against understanding (to source at G2), on your marked answer within two lines | 5, 6 (each use has a gap), 7 (misconception first: perfect memory makes you the smartest; the fact explains the freeze) |
| ~45% | The picture only this premise can show | Your room papered with every page you have read, and the crimson shout from age nine following you into the kitchen, talking over the tea she just brought | 8 (before the midpoint), 9 (mom named at 0:00, warm beats: the tea, the shawl over your shoulders) |
| to 65% | Second jump: the year | You repeat mom's exact words from years ago, expecting her to remember and say sorry; she genuinely remembers none of it, and the argument gets worse. That is the cost, near 60%. Then the second fact, landing on your replay within two lines: people who remember almost every day of their lives, and Jill Price's own words about living the old fights again (both to source at G2; planted here, before 60%) | 6 (you expect an apology, you get a blank), 7, 9 |
| to 90% | Third jump: a lifetime | At eighty, the shout from age nine is as loud as this morning, and so is the morning she taught you to ride a cycle. Jill Price's words come back, already planted. The turn breaks "Forgetting is losing": forgetting was how you two forgave each other. The choice at about 78%: you remember both; which one gets the last word tonight? | 10, the choice at 75-80% |
| last tenth | Back to you | Exam night again. Mom brings tea; you take it, look up, and the pages settle on the desk. Last line, inside the frame: "She doesn't remember the shout. You do. The tea's still warm." The pages settle, you drink, end card | 12 (the opposite of the opening: wanting to keep everything, then letting one thing go) |

No new power rule after halfway (nothing fades; what changes is what you replay, a habit, not a rule; G2 must keep
it that way); no new person after 60% (Jill Price is planted in the second jump). Mental health is explained, never advised.

**Rule device:** the pages: they gather around you and stay in colour while the room fades to grey paper; ruled sheets with ink scribbles, no readable text. The exam hall is one row of desks as a drifting layer (animator, round 1).

**Research for G2** (not verified yet): Parker, Cahill and McGaugh (2006) and LePort et al. (2012) on highly superior
autobiographical memory; Jill Price's own words about her memory; a peer-reviewed source on forgetting as useful
(for example Richards and Frankland 2017), not self-help; a source on recall against understanding for the exam beat.

**The viewer's "but what about":** Do I remember from before the power? Can I still learn new things? Will I go mad?
Does mom remember it too? Is there a cure?

## Titles (yt-package `title.py`, ten written, three kept)

| | Title | Score | Phone cut |
|---|---|---|---|
| A | What If You Could Never Forget Anything? | 98 | none, 40 characters |
| B | What If You Remembered Every Page and Every Fight? | 84 | "What If You Remembered Every Page and..." loses the fight |
| C | What If You Couldn't Forget, Even If You Tried? | 84 | "What If You Couldn't Forget, Even If..." |

A fits a phone whole and is the owner's pick. B is the film's real promise but the phone cuts the second half.
"What If You Never Forgot Anything?" was dropped: a neighbour's title from the last month (pick card item 9).
Others: `title-lint.json`.

## Thumbnails (rules/thumbnails.md, K1-K15)

Drawn in code with the engine's rig (`channels/say-suppose/brand/thumbs/`). Renders in `renders/packaging/`
(git-ignored), numbers in `thumb-checks.json`.

The set: your room at night before the exam, lamp-lit; you large at the left, afraid, hands up beside your head;
pages swirling around you, and a crimson shout bubble with mom's angry face. **One variable (K15): the tag.**

| | Value | Words on it | K3 head | K4 grey sep. | K5 words, cap, contrast | K7 shared with A/B/C | K8 | K9 colour, mean lum. | K10 edge on white / dark | K11 |
|---|---|---|---|---|---|---|---|---|---|---|
| a | MAKE IT STOP | "MAKE IT STOP" | 44.3% pass | 3.41:1 pass | 3, 12.3%, 8.4:1 pass | none | 0 pass | 81.7, 0.098 pass | 18.3 / 1.05 | pass |
| b | TOO LOUD | "TOO LOUD" | 44.3% pass | 3.83:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 79.1, 0.089 pass | 18.3 / 1.05 | pass |
| c | WHY NOW? | "WHY NOW?" | 44.3% pass | 3.83:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 79.6, 0.09 pass | 18.3 / 1.05 | pass |

Measured by `brand/thumbs/check.py` (K3, K4, K5, K8, K9, K10, K11); K7 by `title.py` against all three titles. K10's numbers are the frame edge against the feed: every candidate is a dark frame, so on the dark theme the edge melts into the page (about 1:1) and the hero and the tag carry it; whether you are still found first on both themes is the cold read (K1, K2), in the room notes below. K6 (tag type), K12 (phone cut), K13 (payoff by 0:30, see the beat outline) and K14 (family likeness) are judged, not measured.


Recommendation: **A, title A with thumbnail a ("MAKE IT STOP").** It is a reaction, the instant before the outcome,
and with a 40-character title nothing is cut. "WHY NOW?" ties it to the exam night; "TOO LOUD" is the shortest.

## Runtime

The channel's paper-cut engine (`render_runtime: external`), logged in `artifacts/decision_log.json`; Remotion and
HyperFrames through `video_compose` were considered and set aside (no rig, no cue timeline).

<!-- ROOM -->

Ship it, or change it?
