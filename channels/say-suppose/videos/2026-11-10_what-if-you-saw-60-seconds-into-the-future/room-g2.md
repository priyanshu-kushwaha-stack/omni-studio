# Room report, G2 (story_script)

Shipped: none. No round is a candidate (lint ok, an ok verdict from story, fact, no fact blocker), so the gate check will fail.
Calls: 4 of 18

Owner first: round 1's draft went to the owner at 2026-11-11T03:05:47+00:00

## Open notes in round 1

- claims check (fact) blocker, line 206: "In Japan, bullet trains have their own quake sensors. At the first faint tremor, they cut the power and the train brakes itself (c13).". The source (Compact UrEDAS) and ledger note specify that this is JR's trackside detection system along Shinkansen lines and substations, not onboard sensors mounted on the bullet trains themselves. Claiming the bullet trains 'have their own quake sensors' mislocates the instrumentation and overstates onboard train hardware. Fix: In Japan, bullet train lines have their own trackside quake sensors. At the first faint tremor, they cut the power and the train brakes itself (c13).
- claims check keep, line 103: "Some scientists think your brain guesses forward to cover the gap (c03)."
- claims check keep, line 73: "So the best batters read the bowler's hand and arm before the ball is even let go, and get ready early (c05)."
- claims check keep, line 230: "Your dopamine cells fire for a reward that surprises you. For one you saw coming, they stay flat (c16)."
- first-time viewer (viewer): FAILED, claude exited 1
- story editor (story) blocker, line 31: "You have one minute. You've always had one minute. You just never knew it.". Check #3 fails: by 0:30 the power is clear, but what it can cost is not stated. Fix: Replace with: “You have one minute. You've always had one minute. Now nothing can catch you out. And nothing can be new.”
- story editor (story) blocker, line 152: "## [05:20] The table". Check #8 fails: the only named picture unique to this premise begins after the midpoint of this roughly nine-minute script. Fix: Move lines 152–158 immediately after line 129 and change the heading to “## [04:10] The table”; keep the doubled-table scene unchanged.
- story editor (story) blocker, line 71: "The batter on that screen has it worse. At a hundred and fifty kilometres an hour, the ball reaches him in under half a second (c04).". Check #7 fails: the fact introduces two numbers at once—the speed and travel time. Fix: Replace with: “The batter on that screen has it worse. A fast bowler's ball reaches him in under half a second (c04).”
- story editor keep, line 179: "Grandpa: You've heard it."
- story editor keep, line 232: "Being caught out was the gift."
- story editor keep, line 243: "You have one minute. You always had."

## Rounds

| round | lint | seats ok | blockers | judge |
|---|---|---|---|---|
| 1 | ok | 2/3 | 4 | - |
