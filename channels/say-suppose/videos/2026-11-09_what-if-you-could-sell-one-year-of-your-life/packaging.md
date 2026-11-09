# Packaging: sell one year of your life

status: G1 passed by the owner, 2026-11-09 (batch 1 picks in chat): title A, thumbnail a ("WORTH IT?")
topic: idea room 2026-11-09, M35, median 9 (8-9), proposed by Kimi K3 (`backlog/idea-room-2026-11-09.md`)

## Premise

Your father needs surgery and the bill is more than your family earns in years. An app on your phone makes an offer: tap
once, age one year in a second, and the money is in your account.
The app is invented. The real-world part, to be sourced at G2: what health costs do to Indian households, and how
many hours a year a job buys.

## The viewer

Riya (`audience.md`), 22, Pune, final year with a part-time internship, the elder child; the bus, the office, and
for this story the hospital canteen and a father who says he is fine. The script may speak in rupees and lakhs; the
English packaging never does (`₹` is out, so the idea room's tag "1 YEAR = 1 CRORE" is replaced, see Thumbnails).

## Five lines (rules/story.md, check 1)

| | |
|---|---|
| Situation | You price everything in money: the bus or the metro, what an hour of your internship pays |
| Desire | To pay for your father's surgery without taking the family into debt |
| Conflict | One tap pays the bill, and the next taps pay for everything else; you keep ageing |
| Change | On the hospital bench you are the same age as your father, and see you bought years he may live without you |
| Result | You start pricing everything in time, and close the laptop at six to sit with him |

## Beat outline (runtime shares; length estimated 7 to 8 minutes, the script decides)

| Share | Beat | What happens | Checks |
|---|---|---|---|
| within 20 s | The change | First seven seconds, the thumbnail's picture: the night ward, Papa asleep behind you, the phone lit with an hourglass and one red button, your hand hovering. You price his bill in internship hours, the way you price the bus. The title question is spoken before the seventh second. The bill he hid under his pillow, the one he says is nothing | 2 (the phone, the hourglass, the button), 4 (the habit: pricing everything in money) |
| within 30 s | The rule | One tap: you age one year in a second and the money arrives; only your own years, and the tally shows how many you have sold; at zero years left, your life ends. There is no buy button: a sold year never comes back. Planted line, yours: "One year from me buys him ten. Good deal." What you can lose: years; the question: how many would you sell? | 3, K13 (your finger over the button by 0:30) |
| to 35% | First jump: one tap | You tap. One grey eyebrow hair, and the bill is paid. You pay your mother's phone bill, the twice-a-day calls, and you don't tell her. You expected to look distinguished; you got your grandfather's eyebrow. Papa, after his surgery, teases you about your bus pass | 5, 6 (every use has a gap), 9 (two warm beats: the hidden bill, the bus-pass tease) |
| ~45% | The picture only this premise can show | Papa holds yesterday's photo of you beside your face, one year apart overnight, while the tally on your phone ticks to one | 8 (before the midpoint) |
| to 65% | Second jump: the decade | But one lost year looks small beside the exam notice and Papa's new prescription. You tap again. You expect the exam fee to buy you a clean final year; you sit the exam older than the invigilator. You expect his medicine to be the last tap; the pharmacy bill asks for another. Misconception first: you believed time and money are separate currencies. The one fact: the sourced cost of his surgery, turned into internship hours (to source at G2); the hours peel off your figure as Papa watches. The cost near 60%: he has seen the app, and refuses to let you pay for his medicine | 5 (but), 6, 7 (misconception first, one number, landing on you and Papa) |
| to 90% | Third jump: a lifetime | The wordless peak: each work-hour card folds into a year and drops off your figure. You and Papa on the hospital bench, the same age; his patient wristband lies between your identical-looking hands, and yours reaches for it first. The turn breaks your own line "One year from me buys him ten": you did not buy ten years with him; you bought ten years he may have without you. And every job is the same trade at a lower price. The choice at about 78%: his second operation, or his wish that you stop | 10, the choice at 75-80% |
| last tenth | Back to you | Six o'clock, the laptop shut, the bus to the hospital; you sit with him and count nothing. Last line, warm and unhurried, inside the image: "He's teasing you about the bus pass again. You let him." The comment question on the end card: what hour wouldn't you sell? | 12 (the opposite of the opening: from money to time) |

No new power rule after halfway; no new person after 60%. Health is explained, never advised; the film is not
financial advice.

**Rule device:** the hourglass: each tap drains a measure of sand and greys the world a step, while you and your father keep colour; the hospital is one set kit (counter, bench, ward) re-lit (animator, round 1).

**Research for G2** (not verified yet): the Public Health Foundation of India's estimate of families pushed into
poverty by health costs (the idea room cites 55 million a year: to be checked against the source, and whether it counts people or
households; fact-checker, round 1); average annual
working hours in India; the cost of a common surgery in a private hospital (a range from a source, not a guess).

**The viewer's "but what about":** Does my body age or just my face (the first tap)? Can I sell someone else's year
(the rule: no)? Is there a buy button (the rule: no)? What happens at the end of my years (the rule)? Does Papa know (he
sees the app before 60%)?

## Titles (yt-package `title.py`, ten written, three kept)

| | Title | Score | Phone cut |
|---|---|---|---|
| A | What If You Could Sell One Year of Your Life? | 84 | "What If You Could Sell One Year of Your..." keeps the deal |
| B | What If Your Life Had a Sell Button? | 98 | none, 36 characters |
| C | What If You Could Sell One Year to Save Your Dad? | 84 | "What If You Could Sell One Year to Save..." |

B is the shortest and survives every feed whole; A names the exact price and is the owner's pick. C gives away the
stakes the thumbnail already shows. Others, including "Sell 1 Year" (100, a digit swap): `title-lint.json`.

## Thumbnails (rules/thumbnails.md, K1-K15)

Drawn in code with the engine's rig (`channels/say-suppose/brand/thumbs/`). Renders in `renders/packaging/`
(git-ignored), numbers in `thumb-checks.json`.

The set: a hospital ward at night, your father asleep behind, blurred; you large at the left, worried, holding the
phone; on it an hourglass and a crimson button, your other hand hovering. **One variable (K15): the tag**, which is
also the global replacement for "1 YEAR = 1 CRORE".

| | Value | Words on it | K3 head | K4 grey sep. | K5 words, cap, contrast | K7 shared with A/B/C | K8 | K9 colour, mean lum. | K10 edge on white / dark | K11 |
|---|---|---|---|---|---|---|---|---|---|---|
| a | WORTH IT? | "WORTH IT?" | 44.3% pass | 4.36:1 pass | 2, 12.3%, 8.4:1 pass | none | 0 pass | 68.0, 0.144 pass | 19.47 / 1.02 | pass |
| b | $100,000? | "$100,000?" | 44.3% pass | 4.36:1 pass | 1, 12.3%, 8.4:1 pass | none | 0 pass | 68.8, 0.146 pass | 19.47 / 1.02 | pass |
| c | DEAL? | "DEAL?" | 44.3% pass | 4.36:1 pass | 1, 12.3%, 8.4:1 pass | none | 0 pass | 64.2, 0.134 pass | 19.47 / 1.02 | pass |

Measured by `brand/thumbs/check.py` (K3, K4, K5, K8, K9, K10, K11); K7 by `title.py` against all three titles. K10's numbers are the frame edge against the feed: every candidate is a dark frame, so on the dark theme the edge melts into the page (about 1:1) and the hero and the tag carry it; whether you are still found first on both themes is the cold read (K1, K2), in the room notes below. K6 (tag type), K12 (phone cut), K13 (payoff by 0:30, see the beat outline) and K14 (family likeness) are judged, not measured.


Recommendation: **A, title A with thumbnail a ("WORTH IT?").** A question the viewer answers in the comments, with no
currency at all. "$100,000?" is the closest global version of the crore (rounded; the script's rupees convert to
about that, to check at G2) but puts a dollar on a film set in India; "DEAL?" is the shortest and reads as the app's
voice.

## Runtime

The channel's paper-cut engine (`render_runtime: external`), logged in `artifacts/decision_log.json`; Remotion and
HyperFrames through `video_compose` were considered and set aside (no rig, no cue timeline).

<!-- ROOM -->

Ship it, or change it?
