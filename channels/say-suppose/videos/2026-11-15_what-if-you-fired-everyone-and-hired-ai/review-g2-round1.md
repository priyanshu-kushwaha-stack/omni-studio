# G2 review, round 1: fired everyone and hired AI

G1 passed by the owner (2026-11-16, "Pair A + WHO EATS?"). G2 is the story lock: the script, the free local narration
and a 720p first cut, reviewed together. Nothing paid is made before G2.

## The script (v1.1)

Claude Fable 5.1 wrote v1 in one call (`claude -p`) from the approved packet, the claims ledger, `research.md`,
`taste.md`, `rules/story.md`, `style.md`, `cast.md` and the AI-texts G2 script as the shape, with the G1 room's six notes
applied:

1. The Reuther story moves after the missing line ("...and he ate here"), told as an old story, the manager unnamed (c18).
2. "Who owns the dial?" is answered on screen before the climax: the mayor can't move the ring; you slide her the
   napkin; the town writes the number; you keep only the turning.
3. No SHOP tile after halfway: the sequel hook reuses the CUSTOMER machine, paying with a card that isn't yours.
4. "In the two economists' model the usual fixes fail ... a tax on the machine itself can" (c05, c06).
5. Visa's agent purchases "in pilot trials" (c28).
6. "Two centuries".

v1 voiced at 11:59: voice B speaks about 180 words a minute, not the 155 the brief assumed, and v1 had about 1,680
spoken words. Before the owner's read, Fable tightened it to v1.1 in a second call (about 290 words and 33 s of holds
cut: Finland's trial, the handmade study and the cheque's model line went; Keynes, the paper, Reuther, Ford and the arms
race are said once and shorter). Every set piece, the five lines, `> UNDER:`, the three darlings, the title question and
the six G1 notes stay. `sequel.md` (Part 2: "What If Your Machines Started Shopping?") and `say.yaml` (one emotion and
a delivery direction per line, numbers spelled out) are Fable's too; the session checked that say.yaml changes only
number spellings.

story_lint passes; `omni qc story_script` passes (claims, clicks).

## The narration (local, free)

104 lines, 10:13, voice B (the channel's narrator, locked 2026-11-15) and eight new character voices designed for this
film in `voices.yaml` (Marco, Waitress, Plant boss, Banker, Mayor, Rival, Plumber, Reporter; no name collides with
another film's cast). Clicks: three end-of-take pops and one lead-in blip muted (`mutes.txt`); one in-word step in the
Rival's "too" (line 89) taken out with a 6 kHz low-pass on that one take, as on the AI-texts film (the take is
git-ignored; the original is kept beside it as `.orig.wav`). The last-syllable fix in PR #61 (cut where the voice stops,
not at Whisper's word end) is not on main yet, so this mix uses the current cutter; listen for a clipped final syllable.

## Room round 1 (shipped; 2 of 16 calls; owner first: the script and narration went to the owner before the seats)

| Seat | Verdict | Note | Proposed for the owner-notes round |
|---|---|---|---|
| story editor | blocker, #21 | "you keep the turning" leaves the obvious exploit open: you could lower the dial at three in the morning | **The owner's call.** The G1 room asked to answer "who owns the dial?" on screen and leave a smaller loophole for the comments; this blocker asks to close it (the editor's fix: the phone in a clear box, three keys held by the mayor, Marco and the boss). Keep it open for the comments, or close it with the keys |
| story editor | blocker, #5 | "And then the town comes for the machines." is an and-then | Take: "But the cheque buys one week, not peace. The town comes for the machines." |
| story editor | blocker, no new person after 60% | A new human waitress first appears in the closing scene | Take: the steel waitress serves the room; no new human |
| story editor | suggestions | "Nobody answers that. Hold on to it." -> "Nobody answers."; "the one thing the app told you to remember" -> the planted words, "Only you can turn it." | Take both |
| claims check | 0 blockers; suggestions | Farms: one sentence with the citation; Ford: "announced a five-dollar day, doubling his workers' pay" (the museum's words, c16); Jevons: "did not cut coal use" | Take all three |

Keep lines named: the story editor's "Six weeks from now you'll be the richest person this town has ever had. And its
last customer.", the first darling, and "You're still the richest person in town. You just stopped being its only
customer."; the claims check's paper line, the Keynes line and the model's-fix line.

None of these is applied yet: by pipeline v2 they merge with the owner's G2 notes into the one owner-notes round.
