# G2 room, round 1: notes and what was done

Verdicts: `room/g2/round-1/` (written by the room tools). Precedence: CLAUDE.md and the gates, fact blockers, `taste.md`,
then `rules/`. Every blocker quoted a line and gave a fix; all seven were applied for round 2. Run on 2026-11-09 after
the owner lifted the day's call cap ("no limits for today"; `daily_cap` raised locally for this run, not committed).
The first-time viewer timed out once (cursor-agent exit 124) and was re-run, as the skill allows.

Before round 1, an informal pre-read by a fresh agent (not a seat, no room calls) found the counter contradiction (an
unplanned trip dropped it once and raised it once); script v2 fixed it: arrival always uses a visit, and only a spoken
plan moves the forecast ("Let's see" drops it, "Next Friday" lifts it).

| Seat | Kind | Note | Done |
|---|---|---|---|
| first-time viewer | **blocker** l19 | story #2: the first line runs past 7 s before the counter and the worried look | applied: "Every morning, she waves. You wave back. Not looking." (the counter lands inside 4 s) |
| first-time viewer | **blocker** l95 | story #11: "Everyone's spending theirs." names the carriage hold | applied: cut |
| first-time viewer | **blocker** l165 | story #11: "So you take the Friday train. And it counts down again..." captions the seasons hold | applied: cut; the montage now ends on Grandpa stopping mid-story, so it turns (story #5) |
| first-time viewer | **blocker** l178 | story #11: "She's still at the door." says the shot | applied: the last line is "Of course she is.", which answers the plant "She always is." The G1 room kept the two-sentence version; the owner can restore it |
| retention editor | **blocker** l160 | story #6: declining the offer gives exactly the expected recovery | applied: the cross lifts 9 only to 38; booking a repeating Friday train takes it to 260; new line "Saying no isn't a plan. A ticket is." |
| retention editor | **blocker** l130 | story #7: seventy-six, 93%, twenty-two and 99% stacked | applied: unlabelled strips; only Urban's 93% is spoken, then "Your strip is thinner." The 76 DAYS tag and the 99% line are gone |
| voice director | **blocker** l80 | story #11: "He's forgotten the ending." repeats the bubble | applied: cut |
| retention editor, first-time viewer | suggestion l115 | the festival-trains fact stops the story | applied: c03 dropped; the footbridge picture carries the rush |
| retention editor, first-time viewer | suggestion l171 | the familiar-partners fact drains the Grandpa payoff | applied: c04 and "You didn't have to imagine it" dropped |
| retention editor, first-time viewer | suggestion l52 | cut the chocolate fact | not applied: it is the only fact under the title's own question (lasts feel different); split into short spoken lines instead (voice director's fix) |
| voice director | suggestion l52, l129 | chocolate and Urban lines too long for one breath | applied: both split |
| voice director | suggestion l19 | trim the opening to three beats | applied (same as the viewer's blocker) |
| voice director | suggestion l165 | "And the next. And the next." | moot: the line is cut |
| voice director | suggestion l171 | make the c04 line spoken | moot: c04 dropped |
| voice director | suggestion l161 | one-word lines as their own takes | applied in the narration notes |
| animator | suggestion l153 | OFFER and ACCEPT written on screen | applied: envelope icon, green tick and red cross, one OFFER tag |
| animator | suggestion l164 | the seasons hold is 7 s, over 6 | applied: 6 s, 1.5 s a season |
| animator | suggestion l64 | the train-fields hold falls between two cues (a third silence) | applied: the first jump's music runs out after that hold, into the weekend cue |
| animator | suggestion l167 | Grandpa's counter is never seen again | applied: 8 has climbed to 31 when he starts the story |
| animator | suggestion l172 | the c04 stretch has no new picture | moot: c04 dropped |
| animator | suggestion l150 | no picture under the reveal line | applied: push-in on 260 with a paper timetable ghost (icons only) |
| animator | suggestion cues | one "tense" intent for the whole third jump | applied: tense to the flip, warm from "It only counted down", out at "He prefers yours." |
| animator | suggestion l68, l31, l60 | reuse sets; three counters on the lane; the app as icons | applied |
| retention editor | suggestion l32 | say "the meetings your current plans put you on course to have" | not applied: the line already says "if your plans stay as they are" |
| first-time viewer | suggestion l98 | cut "It only counts down." in the carriage | not applied: the repeat sets up the break at the turn (story #10) |
| first-time viewer | suggestion l5 | needs the rendered thumbnail | not applied: the seats take text only (`room/README.md`, "Not covered yet") |

Fact-checker: ok, no blockers or suggestions (factual accuracy 10).
