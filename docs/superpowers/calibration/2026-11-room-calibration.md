# Review room calibration, 2026-11 (A1 Task 13)

One round (g2) per channel on a historical script, run through `python -m studio.room` with cursor-agent seats:
viewer grok-4.7-high, story gpt-5.6-sol-high, fact gemini-3.7-flash-high. No judge (one round). The claims ledger was
passed to each seat. No neutrality, craft or voice seat. The writer family (anthropic) was not called. The
calibration ledger has 10 calls (one casual-viewer timeout plus its retry); the live sandbox check used 3 more (two
test calls and one unsandboxed diagnostic `claude` call).

## Read this first

- **n=1.** One script and one run per channel; model output varies run to run. These are anecdotes, not rates.
- **Unequal seats.** The hand panels had more seats than the room's three mandatory ones: Say Suppose five (viewer,
  fact-checker, retention editor, voice director, animator), Power and Citizen five (viewer, editor, professor,
  dialogue editor, neutrality or picture), dreams one doctor review. Many panel-only notes come from seats the room
  did not run (voice and build notes on Say Suppose; neutrality, picture and dialogue notes on Power and Citizen).
- **Unequal config.** Dreams used the real channel config including the ASK-cadence lint. Say Suppose and Power and
  Citizen used a stripped config (`linters: []`, no cadence setting), so no cadence lint ran there.
- **Counting basis (all channels).** One panel note = one row; every panel note is accounted for. "Partly" counts as
  caught by both. A room note counts as "caught" if a seat blocker or suggestion on the same issue exists. Notes the
  room raised that the panel did not are "room only" (seat notes only; lint findings are listed separately).
- **Owner column.** No owner notes are recorded in the repo for Say Suppose or Power and Citizen. For dreams the
  owner's note is quoted in the panel file; which rows it covers is my inference.
- **False blockers.** "No room blocker was rejected on record" means there is no evidence either way; debatable ones
  are listed per channel.
- Claude-side live check: pending the owner's `claude auth login` (login expired; fails without the sandbox too).
  cursor-agent passed the sandbox check.

## Professor of Us: dreams (script_v1.md, claims.md)

Hand panel: `script_review_round1.md` in faceless-channel (verdict REWRITE). Owner's note: "not very understandable
reading it... Is it engaging?" Room run: lint failed (six ASK gaps over 30 s), 3/3 seats ok, 5 blockers.

| Note | Panel | Room | Owner (inferred) |
|---|---|---|---|
| Dog-paws line is unbacked | yes | yes: fact and story blockers, line 60 | |
| Lizard and animal parade is a list | yes | yes: viewer blocker, line 48 | |
| REM used before explained, jargon | yes | yes: viewer suggestion | yes |
| Spider sentence too long | yes | yes: viewer and story suggestions | |
| No single question the video answers | yes | partly: story blocker, opening question never closed | yes |
| Twist should state the belief, then break it | yes | yes: story blocker, line 81 | |
| Maze nap and Tetris payoff buried | yes | no | |
| Take-home "sleep after you learn" generic | yes | no | |
| Octopus callback repeats the open | no | yes: viewer suggestion | |

Counts (8 panel notes): both 6, panel only 2, room only 1, owner only 0. Lint only: six ASK gaps (panel's own lint
did not use the cadence rule). Room blockers rejected on record: none. Debatable: story line 81 (it asks to state the common belief before
breaking it, but the belief is already implied by the cold open and the panel's own fix only reorders the twist, so
the added setup may cost pace) and story line 124 (it wants the opening question answered aloud before the callback
image, which may undercut the unresolved ending).

## Say Suppose: pause time for 10 seconds (script.md at e546291)

Hand panel: `review-g2-round1.md`, 23 notes. Room run: lint ok (one "and then" warning), 3/3 seats ok, 13 blockers.

| Note | Panel | Room | Owner |
|---|---|---|---|
| A1 head ages faster than feet (33 cm) | yes | yes: fact blocker | |
| A2 "Nobody human" overstated | yes | no | |
| A3 astronauts drop "six months" | yes | yes: fact blocker | |
| A4 GPS 10 km drift contested | yes | yes: fact blocker | |
| A5 2.5 s brake misstated | yes | yes: fact blocker | |
| A6 "most dangerous thing in this kid's life" uncited | yes | no | |
| A7 "exactly two cheats" | yes | no | |
| A8 1.4 m/s is one age group | yes | yes: fact blocker | |
| A9 3.5 days vs 3.4 | yes | no | |
| A10 "They define a second" wrong subject | yes | yes: viewer and editor suggestions on the atomic-clock lines | |
| B1 road statistics while the bus moves | yes | yes: editor and viewer blockers | |
| B2 relativity lecture ends in "never mind" | yes | yes: editor blocker | |
| B3 thumbnail not paid off until 3:00 | yes | no | |
| B4 first two minutes a list of numbers | yes | yes: editor blocker, viewer suggestion | |
| B5 clock runs backwards (day twelve) | yes | partly: editor suggestion on the hinge | |
| B6 countdown stops at three | yes | yes: editor blocker | |
| B7 "why only one?" gives the twist away | yes | no | |
| B8 ending bleeds the chill | yes | yes: editor blocker, line 120 | |
| B9 generic comment call | yes | no | |
| B10 bank and exam beat | yes | yes: editor blocker | |
| B11 midnight use makes no sense | yes | yes: editor suggestion | |
| B12 "dodge your boss" | yes | no | |
| B13 viewer questions bunch up | yes | no (no cadence setting in this config) | |
| 238 wpm is English non-fiction only | no | yes: fact blocker | |
| Mug "0.45 s" needs 1 m drop | no | yes: fact suggestion | |

Counts (23 panel notes): both 14, panel only 9, room only 2, owner only 0. Fact notes A1-A10: room caught 6 of 10.
Lint only: one "and then" warning. Room blockers rejected on record: none. Debatable blockers: the editor's line-120
blocker (it matches panel B8, but it asks for the open question to be answered, while the panel's own fix keeps the
stranger as the ending, so it is debatable on its merits) and the fact blocker on the 238 wpm scope (a qualifier,
not an error in the claim as used).

## Power and Citizen: president loses Congress (script-h.md)

Hand panel: `panel-review-script-h.md` (21 numbered fixes) plus the casual viewer's verdict in its scores table
(counted as note 22). Room run: lint failed ("claims.md has no verbatim quote column", a ledger-format issue), the
casual viewer timed out at 600 s and succeeded on one rerun (585 s), 3/3 seats ok, 9 blockers.

| Note (panel fix no.) | Panel | Room | Owner |
|---|---|---|---|
| 1 11 December reads as a shutdown | yes | no | |
| 2 simple-majority items are Senate-only | yes | no | |
| 3 dollar card wording | yes | no (cards not in the draft) | |
| 4 "NEVER REMOVED" stamp | yes | no (cards) | |
| 5 Callaghan frame, Carter out | yes | no (picture) | |
| 6 accuracy wording repairs (figures, dates, labels) | yes | no | |
| 7 "this week" holds only if out by 9 Nov | yes | no | |
| 8 five prime ministers named | yes | yes: professor blocker, no ledger row | |
| 9-15 neutrality items (one row, counted as seven) | yes x7 | no (no neutrality seat run) | |
| 16 Quinn explains instead of asking | yes | yes: editor suggestion, line 150 | |
| 17 unanswered questions | yes | yes: editor blocker, line 176 | |
| 18 Quinn gaps over 15 s | yes | yes: editor blocker, cadence | |
| 19 plain-word swaps | yes | no | |
| 20 voice and cards say the same words | yes | no | |
| 21 India section shorter (caretaker, Kargil) | yes | yes: professor blocker, viewer suggestion | |
| 22 casual viewer: middle is a history lecture | yes | yes: viewer blocker, line 136 | |
| "Thumping" quote has no ledger row | no | yes: professor blocker | |
| July 2007 all-night debate has no ledger row | no | yes: professor blocker | |
| January 2008 rebate has no ledger row | no | yes: professor blocker | |
| Final answer only negative, weak payoff | no | yes: editor blocker, line 183 | |

Counts (22 panel notes): both 6 (fixes 8, 16, 17, 18, 21 and note 22), panel only 16 (fixes 1-7, 9-15, 19, 20),
room only 4, owner only 0. Seven of the 16 panel-only notes are neutrality fixes outside the room's seats. Lint only:
the ledger-format failure. Room blockers rejected on record: none; debatable: editor line 183.

## What one run each can show

- On Say Suppose the room caught 6 of the 10 panel fact notes (A1-A10). On Power and Citizen it caught fix 8 and
  missed the fact fixes 1, 2, 6 and 7. It also added a few ledger gaps the panels did not list (238 wpm scope; three Power and
  Citizen claims without a row).
- Panel-only notes cluster in structure that needs the whole film or a seat the room lacked (buried payoff,
  thumbnail pay-off, twist order, neutrality, picture, voice). With three seats against five or six, this run cannot
  say whether the room would miss them with equal seats.
- Timing: seats took 69 to 331 s except the Power and Citizen casual viewer, which hit the 600 s timeout and then
  took 585 s on the retry. The timeout is tight for the viewer seat on a 17 KB draft.
- Process: the ledger lint refuses a claims file without a "verbatim quote" column; seats still ran after the lint
  failures.
