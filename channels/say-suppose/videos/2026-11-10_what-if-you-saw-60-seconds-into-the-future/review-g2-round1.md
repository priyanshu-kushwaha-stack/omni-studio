# G2 room, round 1: sixty seconds ahead

Writer: **Claude Opus 5.5** (this session), at the owner's word, 2026-11-11: "Opus writes it now". Fable 5.1, the
room's writer, was at its weekly limit (resets 2026-11-13). Opus wrote `script.md` and `say.yaml` from the brief
prepared for Fable (approved packaging, review-g1-round2's G2 notes, claims.md, research.md, the channel rules).

Drop 1 went to the owner before any seat ran: the script and the free local Qwen-Arthur narration (7:30). The local
voice read at about 185 words a minute, so `timing.yaml` plays every take at 0.8x (about 148 wpm); no take was re-made.
Lint ok; `omni qc story_script` passes (claims, clicks; 12 end-of-take pops muted in `mutes.txt`).

Seats: story editor (GPT-5.6 Sol) ok, 3 blockers; claims check (Gemini 3.8 Flash) ok, 1 fact blocker, fact 8. The
first-time viewer (Claude Opus 5.5 through the `claude` CLI) failed: the CLI is at the same weekly limit until
2026-11-13, so its one re-run would fail too. The viewer is not required (`viewer_required: false`); it was also the
writer's own model this time. Round 1 is not a candidate (one fact blocker). Nothing below is applied yet: the owner's
notes come first, then this list, in one owner-notes round.

## The merged edit list, as the writer would take it

| # | Seat | Note | Proposed handling |
|---|---|---|---|
| 1 | claims (blocker) | "Bullet trains have their own quake sensors": the sensors are JR's, trackside along the lines, not on the trains | Take it: "In Japan, the bullet train lines have their own quake sensors. At the first tremor of a big quake, they cut the power and the train brakes itself (c13)." (also takes the claims seat's threshold suggestion) |
| 2 | story (blocker, #3) | By 0:30 the power is clear but the cost is not (the gift and "nothing will ever be new" land at 0:42-0:46) | Take the diagnosis, not the fix (the fix rewrites a planted spine line). Move "You'll never be caught out again. That's the gift." and "And nothing will ever be new again. Small price." up to straight after "Move, and it redraws.", so the cost lands by about 0:33; "Only a minute..." and "no off switch" follow |
| 3 | story (blocker, #8) | The doubled dinner table starts at 4:18, after the midpoint (3:45) | Take it: move "The table" up to straight after Mother (the "Mom stops halfway" lines follow her beat naturally), so it lands near 3:15; money follows it |
| 4 | story (blocker, #7) | The cricket fact gives two numbers at once (speed and time) | Take it: "The batter on that screen has it worse. A fast bowler's ball reaches him in under half a second (c04)." |
| 5 | story (suggestion) | "You think this is new. It isn't, quite." arrives as an "and then" | Take it: "You saw a minute ahead and still arrived late. Seeing always does." |
| 6 | story (suggestion) | The coin beat should follow from having no answer for Mom | Take it: "So you try something that can't ask you back. A coin. You call it ten times in a row." (with #3 the coin now follows the table, so it reads "something that can't look at you") |
| 7 | story (suggestion) | Cut the bullet-train sentence and overlay; let the real braking and grandfather's hand carry it | Owner's call. The claims seat keeps it (fixed by #1); the writer's lean is to keep it, since "A stop." needs the train to have stopped for a reason |
| 8 | claims (suggestion) | The shoe came later; the first unit was armpit-worn | Take it: "...built a computer to beat roulette, and later hid it in a shoe (c06)" (a check on c06's quote first) |

Keep lines named by the seats: "Grandpa: You've heard it." and "Being caught out was the gift." (story); "You have one
minute. You always had." (story); "Some scientists think your brain guesses forward to cover the gap.", the batters'
line (c05) and the dopamine line (c16) (claims).

## Length

The story editor read the script as about 9:15 and named why a viewer stays past 8:00 (grandfather's punchline, the
bus-stop payoff). The narrated film is 7:30 at 0.8x tempo (6:20 at the local voice's own speed); the pace is the
owner's call by ear.
