# G2 room, round 3 (the last): notes, none applied

Verdicts: `room/g2/round-3/`. Lint ok. Round 3 is the room's round cap (`rounds: 3`), and no round is a candidate,
because the first-time viewer (Grok 4.7) timed out in every round. So the room stopped without shipping
(`room-g2.md`), and these notes are left open for the owner rather than applied to an unreviewed round 4. `script.md`
is the round-3 draft unchanged (`room/drafts/00506b12...md`).

**First-time viewer: failed, six calls in three rounds,** each stopped at exactly 600 s (`cursor-agent exited 124`;
the room's fixed timeout in `core/studio/room/call.py`). Shrinking its inputs (round 2: four files; round 3:
`audience.md` only) did not help, so it is the model's run time, not the prompt. Grok's ok calls on this channel
today took 380 to 596 s.

| Seat | Kind | Note | Open, or why not |
|---|---|---|---|
| voice director | **blocker** l119, story #11 | "That night, on the bus, the whole city is lit up. Every head. Every number. All of them moving." captions the picture | open. The seat's fix: "The last bus home. And you can't stop reading them. Like timetables." [hushed, a little awed, tired], the 2.5 s hold wordless |
| retention editor | suggestion l23 | After the title line add "So... do you quit?", so the QUIT? thumbnail pays off at once | open |
| retention editor | suggestion l33 | "It never tells you what that thing is. You have to watch the person."; drop the SECOND STALL, HIS OWN RANK and MUSIC labels and reveal goals by the tin, the exam form and the keyboard | open. Note: the labels are the owner-visible reveal device the G1 room accepted; dropping them is a staging choice for the owner |
| retention editor | suggestion l127 | Cut the blink-long chai-stall cut in the city | open |
| voice director | suggestion l33 | Break the rule line into takes | open (narration notes at G3) |
| voice director | suggestions l87, l119, l158 | say.yaml "U-P-S-C"; directions for the bus line and the end-card question | open (G3) |
| voice director | suggestion l54 | The narration notes quote "But his tiny number", the script says "But Aarav's tiny number" | open: a notes typo, to fix with the G3 take list |
| voice director | suggestion l102 | "A fee slip for a cricket academy." narrates the shot | open |
| animator | suggestions l34, l89 | Stage the rule and the c01 stretch with more cuts | open (G3 scene plan) |
| animator | suggestion l48 | Fixing the grip as two pose swaps | open (G3) |
| animator | suggestion l118 | Build the city from parallax strips of about 12 chip variants; one shared interior for the two windows | open (G3) |
| animator | suggestion l153 | Keep the right third quiet in the last 15 s | open (G3) |
| animator | suggestion l64 | Hide the stranger in the lit city too | open |
| fact-checker | none | 10/10 | - |
