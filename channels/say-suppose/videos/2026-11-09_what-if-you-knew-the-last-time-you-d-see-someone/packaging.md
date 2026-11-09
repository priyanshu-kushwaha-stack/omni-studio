# Packaging: the last time you'd see someone

status: G1 passed by the owner, 2026-11-09 (batch 1 picks in chat): title A, thumbnail a ("MOM?")
topic: idea room 2026-11-09, M34, median 9 (9-10), proposed by Kimi K3 (`backlog/idea-room-2026-11-09.md`)

## Premise

You are leaving home next month for your first job, in another city. Mom waves at the door like always, and today a split-flap
counter hangs over her head: forty-two, the times you will see her again.
The counter is invented. The arithmetic under it is the real-world part, to be sourced at G2: how much in-person time
with parents is left once you move out.

## The viewer

Riya (`audience.md`), 22, Pune, final year, a first job offer in another city; a mother who calls twice a day,
chai at the door, the metro, the internship. Here "you" are about to leave home for the first time, which is the week
Riya is in. Every gag comes from it. The English packaging stays readable worldwide: no `₹`, no local slang.

## Five lines (rules/story.md, check 1)

| | |
|---|---|
| Situation | Your first job starts next month in another city; mom waves at the door every morning and you never look back |
| Desire | To start your own life, with home always there "later" |
| Conflict | A counter over mom's head says forty-two, and it drops every time you leave her |
| Change | You find the counter counts your trains home, not her years: it moves when you do |
| Result | You leave home, and at the corner you turn round and wave back |

## Beat outline (runtime shares; length estimated 7 to 8 minutes, the script decides)

| Share | Beat | What happens | Checks |
|---|---|---|---|
| within 20 s | The change | First seven seconds, the thumbnail's picture: dusk, the porch light, the open door, mom smiling and waving; you wave back the way you always do, phone still up, not looking, until a counter flips into place over her head, 42, and you look up mid-wave. The title question is spoken over that picture. You leave for your first job next month | 2 (confirm the click: the thumbnail's door, wave and counter), 4 (the habit: you never look back) |
| within 30 s | The rule | Everyone you know has a counter: a forecast of the times you will meet them again in person, recalculated whenever your plans change. You shrug: "It only counts down" (the planted line). What you can lose: forty-two mornings; the question: what would you do with them? | 3 (second hook by 0:30), K13 |
| to 35% | First jump: the city | Counters everywhere. The metro stranger reads four hundred: you expect a one-off face, then find she shares your commute. The colleague reads three thousand, so you hide, and land in the seat beside him. Your grandfather reads eight; you stay for the ending of his story you usually dodge, and he forgets it and asks you to finish it. The first weekend home, mom keeps chai waiting and packs food for the return train; you expect her counter to flip as the train leaves, but it flips when you decline the next visit | 5, 6 (each use has a gap), 9 (warm beats: the chai, the packed food) |
| ~45% | The picture only this premise can show | Because mom's flip bothers you, you study the carriage: counters fall across the window as people part at each station, yours reflected among them. Therefore you decide the numbers only shrink, and start treating forty-two as a fixed allowance | 5 (because, therefore), 8 (before the midpoint) |
| to 65% | Second jump: the year | Misconception first: forty-two visits is plenty, so you skip the festival for a deadline. The empty tiffin sits on your desk while mom's counter flips to thirty-seven beside her empty doorway. Then one sourced calculation (the Tail End arithmetic, to source at G2; spoken only as far as the source goes) turns your real visit rate into total days together; that single number lands beside her chair and makes "plenty" false. That is the cost, near 60% | 7 (misconception first: later is unlimited; one number, on her counter), 9 (mom named at 0:00, two warm beats before the loss) |
| to 90% | Third jump: a lifetime | You take the Friday train home, and the next, and the counter climbs (the forecast stated at 0:30, recalculated): it was never her clock, only your trains. This breaks the planted line "It only counts down." The choice at about 78%: the offer that keeps you away through every festival this year, which drops it to nine, or the job that lets you take the Friday train | 10 (the turn breaks a line already said), the choice at 75-80% |
| last tenth | Back to you | The next time you leave, you stop at the corner, turn round and wave. We never see the new number. Last line, low and warm, inside the image: "She's still at the door. Of course she is." | 12 (leave fast; the opposite of the opening) |

No new power rule after the halfway point; no new person after 60%. Never say the feeling (check 11): the script
shows the wave, it does not name the sadness. Video calls do not count: the counter is in-person meetings only.

**Rule device:** the split-flap counter over a head; it flips whenever a meeting is used or a plan changes. Your half-wave with the phone up is the trigger gesture, repeated at each leaving and mirrored at the corner (animator, round 1).

**Research for G2** (from the idea room; not verified yet, nothing here is a claim until `claims.md` cites it):
Tim Urban's "The Tail End" arithmetic on time with parents after moving out; how often people who move cities visit
home (a survey, if one exists for India). Spoken as a calculation from an assumed visit rate, never as a countdown
of her life (fact-checker, round 1).

**The viewer's "but what about"** (answered where they arise): Is it her life or my visits? Can I cheat it by staying
away? Does a video call count? Does she have a counter for me? Why only forty-two?

## Titles (yt-package `title.py`, ten written, three kept)

| | Title | Score | Phone cut (about 40 characters) |
|---|---|---|---|
| A | What If You Knew the Last Time You'd See Someone? | 84 | "What If You Knew the Last Time You'd..." keeps the subject |
| B | What If You Knew How Many Goodbyes You Had Left? | 84 | "What If You Knew How Many Goodbyes You..." |
| C | What If Every Goodbye Came With a Countdown? | 84 | "What If Every Goodbye Came With a..." loses "countdown" |

All three lose 14 points for having no digit; a digit in the title would duplicate the counter. A is the owner's pick
from the idea room and keeps "someone" open, so the thumbnail's "MOM?" adds the person. The other seven titles and
their scores: `title-lint.json`.

## Thumbnails (rules/thumbnails.md, K1-K15)

Drawn in code with the engine's rig (`channels/say-suppose/brand/thumbs/`), no AI images. Renders in
`renders/packaging/` (git-ignored): `thumb-a.png`, `-b`, `-c`, each with `-feed.png` (168x94), `-white.png` and
`-dark.png` (feed themes). Measured numbers: `thumb-checks.json`.

The set: dusk hall, the open door with the porch light; you large at the left mid-wave, worried, looking at the
counter; mom smiling in the doorway, waving; a split-flap counter over her head at 42.
**One variable (K15): the tag; the counter reads 42 on all three, the number the film opens on.**

| | Value | Words on it | K3 head | K4 grey sep. | K5 words, cap, contrast | K7 shared with A/B/C | K8 | K9 colour, mean lum. | K10 edge on white / dark | K11 |
|---|---|---|---|---|---|---|---|---|---|---|
| a | MOM? | "MOM?" + counter/chip "42" | 44.3% pass | 3.84:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 72.0, 0.095 pass | 13.15 / 1.46 | pass |
| b | ONLY 42? | "ONLY 42?" + counter/chip "42" | 44.3% pass | 3.84:1 pass | 3, 12.3%, 8.4:1 pass | none | 0 pass | 74.2, 0.102 pass | 13.15 / 1.46 | pass |
| c | WAIT, MOM? | "WAIT, MOM?" + counter/chip "42" | 44.3% pass | 3.84:1 pass | 3, 12.3%, 8.4:1 pass | none | 0 pass | 75.9, 0.108 pass | 13.15 / 1.46 | pass |

Measured by `brand/thumbs/check.py` (K3, K4, K5, K8, K9, K10, K11); K7 by `title.py` against all three titles. K10's numbers are the frame edge against the feed: every candidate is a dark frame, so on the dark theme the edge melts into the page (about 1:1) and the hero and the tag carry it; whether you are still found first on both themes is the cold read (K1, K2), in the room notes below. K6 (tag type), K12 (phone cut), K13 (payoff by 0:30, see the beat outline) and K14 (family likeness) are judged, not measured.


Recommendation: **A, title A with thumbnail c ("WAIT, MOM?").** A cold reader shown only these three picked it as the one
with a twist ("how much time is left"); "ONLY 42?" read as a game score and "MOM?" alone as confusing. None of the
three says what 42 counts without the title, which is the title's job here. The first round's counters 3 and 1 were retired: the film
never shows them by 0:30 (K13, first-time viewer, round 1), and the cold read liked 1 best, so the owner should know
what it would have needed: a different film that counts down to one.

## Runtime

Rendered by the channel's paper-cut engine (`render_runtime: external`), logged in `artifacts/decision_log.json`.
Alternatives: Remotion or HyperFrames through `video_compose` (no rig, no cue timeline; it would mean rebuilding the
approved look). The engine is the default because it is the look the owner approved and it times figures to cue words.

<!-- ROOM -->

Ship it, or change it?
