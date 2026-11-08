# Review room calibration, 2026-11 (A1 Task 13)

One round (g2) per channel on a historical script, run through `python -m studio.room` with cursor-agent seats:
viewer grok-4.7-high, story gpt-5.6-sol-high, fact gemini-3.7-flash-high. No judge (one round). Seats ran in the
sandbox with the claims ledger passed as an input. No neutrality, craft or voice seat. Writer family (anthropic) was
not called. 10 model calls in the calibration ledger (one casual-viewer retry after a 600 s timeout), plus 3 in the
live sandbox check.

Live sandbox check: cursor-agent (gpt-5.6-sol-high) passed: exit 0, the canary file in the repo was not read.
The claude half is **pending the owner's `claude auth login`**: the login has expired ("Failed to authenticate"),
which also fails without the sandbox, so it says nothing about the sandbox paths.

Method notes: "room caught it" means a blocker or a suggestion in a seat file, or a lint problem, on the same
issue as the panel note. Panel notes are paraphrased; no owner notes are recorded in the repo for the Say Suppose or
Power and Citizen drafts, so "owner raised it" is only filled for dreams. A room blocker counts as false only if a
panel or owner note rejected it; none was found rejected, so false blockers are 0 on every channel (some are
debatable and listed).

## Professor of Us: dreams (script_v1.md, claims.md)

Hand-run panel: `script_review_round1.md` in faceless-channel (verdict REWRITE). Owner's note on that draft: "not
very understandable reading it... Is it engaging?" Room run: lint failed (six ASK-cadence gaps over 30 s, the
cadence setting in the channel's room.yaml; the panel's own script lint passed), 3/3 seats ok, 5 blockers.

| Note | Panel | Room | Owner |
|---|---|---|---|
| Dog-paws line is unbacked ("something is replaying") | yes | yes: fact and story blockers, line 60 | |
| Lizard and animal parade is a list; cut | yes | yes: viewer blocker, line 48 | |
| REM used before it is explained, jargon | yes | yes: viewer suggestion, unpack on first use | yes (not understandable) |
| Spider sentence too long | yes | yes: viewer and story suggestions, line 18 | |
| No single question the video answers | yes | partly: story blocker, opening question never closed | yes (engaging?) |
| Twist should state the belief, then break it | yes | yes: story blocker, line 81 | |
| Maze nap and Tetris payoff buried, move up | yes | no (maze kept, Tetris reworded) | |
| Take-home "sleep after you learn" is generic | yes | no (kept as a keep line) | |
| ASK gaps over 30 s | no | yes: lint | |
| Octopus callback repeats the open; delete | no | yes: viewer suggestion | |

Counts: caught by both 6, room only 2, panel only 2, owner only 0, false blockers 0 (the line-81 and line-124
story blockers are the debatable ones).

## Say Suppose: pause time for 10 seconds (script.md at e546291, claims.md)

Hand-run panel: `review-g2-round1.md` (five seats, 23 numbered notes, A1-A10 facts, B1-B13 story). Room run: lint
ok (one "and then" warning), 3/3 seats ok, 13 blockers (fact-checker 6, retention editor 6, viewer 1).

| Note | Panel | Room | Owner |
|---|---|---|---|
| A1 head ages faster than feet (33 cm) | yes | yes: fact blocker | |
| A3 astronauts: drops "six months" | yes | yes: fact blocker | |
| A4 GPS 10 km drift is contested | yes | yes: fact blocker | |
| A5 2.5 s brake reaction misstated | yes | yes: fact blocker | |
| A8 1.4 m/s is one age group | yes | yes: fact blocker | |
| A10 atomic-clock line / B4 list of numbers up front | yes | yes: viewer and editor notes | |
| B1 road statistics while the bus is moving | yes | yes: editor and viewer blockers | |
| B2 relativity lecture ends in "never mind" | yes | yes: editor blocker, viewer cut | |
| B6 countdown stops at three | yes | yes: editor blocker | |
| B8 ending bleeds the chill | yes | yes: editor blocker, line 120 | |
| B10 bank and exam beat | yes | yes: editor blocker | |
| B11 midnight use makes no sense | yes | yes: editor suggestion | |
| A2 "Nobody human" overstated | yes | no | |
| A6 "most dangerous thing in this kid's life" uncited | yes | no | |
| A7 "exactly two cheats" | yes | no | |
| A9 3.5 days vs 3.4 | yes | no | |
| B3 thumbnail not paid off until 3:00 | yes | no | |
| B5 clock runs backwards (day twelve) | yes | partly: editor suggestion, hinge line | |
| B7 "why only one?" gives the twist away | yes | no | |
| B9 generic comment call | yes | no | |
| B12 "dodge your boss" | yes | no | |
| B13 viewer questions bunch up | yes | no (no cadence setting in this config) | |
| 238 wpm is English non-fiction only | no | yes: fact blocker | |
| Mug "falls in 0.45 s" needs 1 m | no | yes: fact suggestion | |

Counts: caught by both 12, room only 2, panel only 10, owner only 0 (no owner notes recorded), false blockers 0.
The three-way viewer, editor and fact overlap on A1-A5 and B1-B2 is the strongest agreement of the run.

## Power and Citizen: president loses Congress (script-h.md, claims.md)

Hand-run panel: `panel-review-h.md` and `panel-review-script-h.md` (21 merged fixes, five seats including
neutrality and picture). Room run: lint failed ("claims.md has no verbatim quote column"; the ledger format is not
the lint's), casual viewer first call timed out at 600 s (exit 124, not retried by the tool) and succeeded when
re-run once, 3/3 seats ok, 9 blockers (professor 5, editor 3, viewer 1).

| Note | Panel | Room | Owner |
|---|---|---|---|
| "Five prime ministers" figure has no ledger row (panel fix 8) | yes | yes: professor blocker, line 60 | |
| Caretaker / war with Pakistan not in the sources (fix 21) | yes | yes: professor blocker, viewer suggestion | |
| Quinn's line explains instead of asking (fix 16) | yes | yes: editor suggestion, line 150 | |
| Unanswered question "Forty-nine to fifty" (fix 17) | yes | yes: editor blocker, line 176 | |
| Quinn gaps over 15 s (fix 18) | yes | yes: editor blocker, cadence | |
| Middle is a history lecture, momentum drops | yes | yes: viewer blocker, line 136 | |
| 11 December reads as a Democrat shutdown (fix 1) | yes | no | |
| Simple-majority items are Senate-only (fix 2) | yes | no | |
| Dollar card, "NEVER REMOVED", Callaghan frame (fixes 3-5) | yes | no (cards and frames are not in the draft) | |
| Neutrality: Obama-only override, OUT stamps, Kashmir, Gulf (fixes 9-15) | yes | no (no neutrality seat run) | |
| Plain-word swaps, card and voice match (fixes 19, 20) | yes | no | |
| "Thumping" quote, July 2007 all-night debate, January 2008 rebate have no ledger id | no | yes: professor blockers | |
| Final answer is only negative, payoff weak | no | yes: editor blocker, line 183 | |

Counts: caught by both 6, room only 4, panel only 16 (counting each numbered fix, 14 of them in rows above, 7 of
those neutrality and picture items outside this run's seats), owner only 0, false blockers 0.

## What this shows

- Fact catches are the room's strongest point: it matched 5 of 6 hand-panel fact notes on Say Suppose and caught
  ledger gaps the hand panel did not (238 wpm scope, three Power and Citizen claims with no row).
- It is weaker on story-level structure that needs the whole film in view (buried payoff, thumbnail pay-off,
  twist given away) and on picture and neutrality (not in the draft, or no seat run).
- Timing: seats took 69 to 331 s; Grok on the dreams viewer 331 s and on the Power and Citizen viewer 600 s
  (timeout) then success on retry. The 600 s timeout is close for the viewer seat on a 17 KB draft.
- Process notes: the ASK-cadence lint flagged six gaps on dreams that the hand panel's lint did not use; the ledger
  lint refuses claims files without a "verbatim quote" column (Power and Citizen), which made lint fail while the
  seats still ran.
- The Claude-only hand panels and the room agree on most facts, so the room's added value here is mainly the
  second-family fact check and the ledger-gap scan, not new story ideas.
