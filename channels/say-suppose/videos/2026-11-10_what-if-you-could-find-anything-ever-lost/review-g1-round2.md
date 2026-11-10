# G1 room, rounds 2 and 3 (owner-notes rounds)

**Owner's notes, 2026-11-11:** "Yes, A + a and the list." Title A ("What If You Could Find Anything Ever Lost?") with
thumbnail a ("DOWN THERE?"), and the merged edit list in `review-g1-round1.md` as written: rows 1, 2, 3, 3b, 5, 6 and 7
applied; rows 8 and 9 not applied; row 4 (the `> SCENE:` line) at G2. Added to `taste.md` the same day.

## Round 2

The writer (Claude Fable 5.1, `claude -p --tools "" --model claude-fable-5-1`) applied the list. Lint ok
(`--owner-notes`). Seats: the required two (`viewer_required: false`).

| Seat | Status | Note | Done |
|---|---|---|---|
| claims check | **failed**, cursor-agent exit 124 (timed out) | none | not re-run on round 2; it ran on round 3 instead |
| story editor | ok, 2 blockers | **blocker** l36, story #3: "within ten metres" reads as a range limit that the 41 m and kilometre lines then break | applied in round 3: the rule says "if no living person knows where it is, a line draws itself..." (the condition is unchanged; the phrase only confused it) |
| story editor | | **blocker** l42, story #6 and no new power rule after halfway: the wreck searched again has no gap, and "every gold earring", "everything the sea has taken" are category searches the singular rule never allowed | applied in round 3, inside the owner's note (scale what the film planted): one singular target at a time, each with a gap and each bigger: the oldest earring under the city's drains (you expect the bazaar; the line runs past the old fort), then the first ship this coast ever lost (you expect the Konkan wreck; the line runs out to open sea). "The sea's line" and the keep line "The whole sea is on your line" still hold |
| story editor | | suggestion l43: plant that dropping a line makes its target unfindable forever | not applied: a new rule, and the choice already costs the sea |
| story editor | | suggestion l39: make the dump argue the under-question | not applied: kept for G2, where the script can give the cross-section one line on what digging would tear open |

The two round-3 edits are word swaps from the seat's own diagnosis, made by this session (Opus 5.5); the writer's
spine (five lines, `> UNDER:`, keep lines) is untouched.

## Round 3

Lint ok (`--owner-notes`). Both seats ok; no fact blocker, so round 3 is a candidate and ships (`room/g1.json`:
shipped round 3, sha256 `686d0983…`; `room verify`: room evidence ok).

| Seat | Status | Note | Done |
|---|---|---|---|
| claims check | ok, facts 9, 0 blockers | suggestions: "the council landfill", not "his landfill" (Newport City Council owns it); UNESCO's exact "over three million" wording; the 1878 Act's section 4 (notice to the Collector, deposit in the nearest Government treasury or give security) | for the G2 research and `claims.md` |
| story editor | ok, 3 blockers | **blocker** l38, story #7: the 1878 Act line carries three numbers (ten rupees, a year, 1878) | **open, to the owner:** at G2 the spoken line keeps one number at a time, e.g. "Under an old law, treasure found in the soil must be reported to the Collector", with the prison term only if it lands on you. Unchanged since round 1 in substance |
| story editor | | **blocker** l43, story #6: the pill search has no gap (you ask, you get) | **open, to the owner:** the beat is the choice, not a use; the seat's fix (the line loops back to a tear in his kurta lining, the pocket he patted) is a good gap and costs nothing. Take at G2? |
| story editor | | **blocker** l37, story #5: the first-jump montage needs but/therefore joins (lunch first, then the searches chained) | **open, to the owner:** a script-order fix; the G2 script chains them |
| story editor | | suggestions: make a dropped line irreversible; a harder query at the third jump; one warm action at Sunday lunch (grandfather saves you the best mango slice) | the warm action goes into the G2 script; the other two add rules after the midpoint and are not taken |

These three blockers sit on lines the room read in rounds 1 and 2 without raising them; the room is one pass (pipeline
v2), so they go to the owner as one line each instead of a fourth round.
