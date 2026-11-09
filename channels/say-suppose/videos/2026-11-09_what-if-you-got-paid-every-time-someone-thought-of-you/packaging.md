# Packaging: paid every time someone thinks of you

status: G1 passed by the owner, 2026-11-09 (batch 1 picks in chat): title A, thumbnail b ("NOT HER?")
topic: idea room 2026-11-09, M09, median 9 (8-9), proposed by Claude Fable 5.1 (`backlog/idea-room-2026-11-09.md`)

## Premise

A coin drops into your account every time anyone, anywhere, thinks of you, and the app says who. You check it
expecting to be rich: your crush has paid nothing, and your mother pays every four minutes.
The app is invented. What it reveals is the real-world part, to be sourced at G2: the spotlight effect, how much
less other people notice us than we think.

## The viewer

Riya (`audience.md`), 22, Pune; the metro, the group chat, a crush who replies late, a mother who calls twice a
day, chai at the stall outside college. Funny first, then warm: the lighter film between two heavy ones in the
batch.

## Five lines (rules/story.md, check 1)

| | |
|---|---|
| Situation | Every night in bed you check who liked and who replied before you sleep |
| Desire | To be on the minds of the people you want to impress |
| Conflict | The app shows they barely think of you, so you buy attention, good or bad, and lose the friend who carried you |
| Change | You open the tab you never opened: Sent, what you would have paid others. Mom's column is almost empty |
| Result | You stop checking who thinks of you and call Asha |

## Beat outline (runtime shares; length estimated 6 to 8 minutes, the script decides)

| Share | Beat | What happens | Checks |
|---|---|---|---|
| within 20 s | The change | First seven seconds, the thumbnail's picture: the lamp-lit bed, the phone filling the frame, mom's bar full, a heart at zero, coins spilling. You check who liked you before you are even lying down, as always; a new app pings with a coin. The title question is spoken over that screen | 2 (the phone, the ledger), 4 (the habit: checking who noticed you) |
| within 30 s | The rule | Every waking thought about you pays one coin, kind or cruel, and the app names who had it. There is a second tab, Sent; you don't open it (planted). First look: mom's bar full, the crush's empty. You decide: "Coins are care. At least now you can count it" (the planted line). What you can lose: the story you tell about who cares; the question: who is really thinking of you? | 3, K13 (the ledger by 0:30) |
| to 35% | First jump: the day | Your best photo: three hundred likes, four coins. The internship boss pays every night at eleven, just before the late message. You wear the loud shirt onto the metro and guess the whole carriage noticed: two coins. Asha, your friend from the chai stall, pays a little every day: she saves your chai and sends you the metro notes | 5, 6 (every use has a gap), 7 (misconception first: you believe everyone watches you), 9 (Asha named with two warm beats) |
| ~45% | The picture only this premise can show | Night: coins dropping one by one at 2 a.m., every one from mom, a skyline of her bar over everyone else's | 8 (before the midpoint) |
| to 65% | Second jump: the month | The fact lands on you, in one spoken line over the metro shirt: people guess far more of a room noticed them than did (the spotlight-effect study, to source at G2; one number). Therefore you go looking for attention: you double-text the crush, then start a fight in the group chat expecting proof that people care, and coins pour in from anger. But Asha's row goes dark. The cost near 60%: her seat at the chai stall is empty, and her row stopped on a day you can't name | 6 (you expect care, you get anger), 7, 9 |
| to 90% | Third jump: a lifetime | Because Asha's row has gone dark, you stop farming coins and scroll back through the three columns you know, mom, the boss at eleven, Asha, a day, a year, your whole life, the phone in the same hand as the hand ages. Then you open Sent. You love Mom; Sent is nearly empty. Asha's row stopped the week yours did. Coins were never care: the turn breaks the line you said at 0:30. The choice at about 78%: keep farming coins, or spend the evening on someone else | 5 (because, then), 10 (breaks "Coins are care"; the tab was planted at 0:30), the choice at 75-80% |
| last tenth | Back to you | The phone face down. You call Asha; somewhere a coin we never see drops for her. Last line, dry and warm, inside the image: "Two rings. She picks up." | 12 (the opposite of the opening: waiting to be thought of, then thinking of someone) |

No new power rule after halfway (Sent is planted in the rule beat); no new person after 60%.

**Rule device:** a coin dropping with a tick into the thinker's bar, beside a small face chip; no names are written on screen. Sent is the same panel flipped, with mom's bar a sliver (animator, round 1).

**Research for G2** (not verified yet): Gilovich, Medvec and Savitsky (2000), the spotlight effect and the T-shirt
study (predicted against actual noticing, cited with the scope the paper states); any measure of how often people think about family members (if a source exists; else the film stays
story-only on that point).

**The viewer's "but what about":** Do bad thoughts pay too (yes, the rule says so)? Does a dream count (waking
thoughts only)? Can I see who exactly? Why is mom so high (cutaways: packing food, checking the metro time)?

## Titles (yt-package `title.py`, ten written, three kept)

| | Title | Score | Phone cut |
|---|---|---|---|
| A | What If Someone Thinking of You Paid You? | 84 | "What If Someone Thinking of You Paid..." keeps the premise |
| B | What If You Got Paid Every Time Someone Thought of You? | 84 | "What If You Got Paid Every Time Someone..." loses "thought of you" |
| C | What If You Could See Who Really Thinks of You? | 84 | "What If You Could See Who Really Thinks..." |

B is the owner's pick from the idea room, moved to second: the first-time viewer seat failed it on K12 (round 1), because
a phone cuts it before the thought, and the thumbnail cannot say "thought". A keeps the premise inside the phone cut.
"What If Every Thought of You Paid?" (34 characters) was set aside: it is a neighbour's title from the last two weeks
with "$1" removed (pick card item 9). The idea room's tag "Thinking of You" repeats the title, so it is not used.
Others: `title-lint.json`.

## Thumbnails (rules/thumbnails.md, K1-K15)

Drawn in code with the engine's rig (`channels/say-suppose/brand/thumbs/`). Renders in `renders/packaging/`
(git-ignored), numbers in `thumb-checks.json`.

The set: your room at night, lamp-lit; you large at the left, sceptical and hurt, holding up a phone; on the screen
mom's face with a full green bar, a heart with an empty one. (The first renders had coins spilling; the cold read did
not see them as money, so they were cut.) **One variable (K15): the tag.**

| | Value | Words on it | K3 head | K4 grey sep. | K5 words, cap, contrast | K7 shared with A/B/C | K8 | K9 colour, mean lum. | K10 edge on white / dark | K11 |
|---|---|---|---|---|---|---|---|---|---|---|
| a | ONLY MOM? | "ONLY MOM?" | 44.3% pass | 4.07:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 69.2, 0.151 pass | 19.02 / 1.01 | pass |
| b | NOT HER? | "NOT HER?" | 44.3% pass | 4.07:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 68.0, 0.147 pass | 19.02 / 1.01 | pass |
| c | ZERO?! | "ZERO?!" | 44.3% pass | 4.07:1 pass | 1, 12.3%, 8.4:1 pass | none | 0 pass | 65.9, 0.141 pass | 19.02 / 1.01 | pass |

Measured by `brand/thumbs/check.py` (K3, K4, K5, K8, K9, K10, K11); K7 by `title.py` against all three titles. K10's numbers are the frame edge against the feed: every candidate is a dark frame, so on the dark theme the edge melts into the page (about 1:1) and the hero and the tag carry it; whether you are still found first on both themes is the cold read (K1, K2), in the room notes below. K6 (tag type), K12 (phone cut), K13 (payoff by 0:30, see the beat outline) and K14 (family likeness) are judged, not measured.


Recommendation: **A, title A with thumbnail a ("ONLY MOM?").** It is the joke and the ache at once, and it names the
person the film turns on. "NOT HER?" plays the crush and is the most clickable for a young viewer; "ZERO?!" is the
loudest but the vaguest.

## Runtime

The channel's paper-cut engine (`render_runtime: external`), logged in `artifacts/decision_log.json`; Remotion and
HyperFrames through `video_compose` were considered and set aside (no rig, no cue timeline).

<!-- ROOM -->

Ship it, or change it?
