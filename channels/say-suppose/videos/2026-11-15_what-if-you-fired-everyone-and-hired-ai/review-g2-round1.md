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

## The 720p first cut

`renders/firstcut/firstcut-720p.mp4` (git-ignored): 1280x720, 10:13, -20.2 LUFS. `omni qc story_script` on the cut
passes (claims, clicks). Everything is drawn in code with the what-if kit; no AI images, no paid call.

- **Sets.** A new diner set (`scenes/sets/Diner.tsx`: five moods, seven cameras, robots, plates, the plant through the
  long window, the overalls crossing at the whistle), the paint shop, and part B's and C's own town sets (the plant
  gate, the square, the bank hall, the street with the salon, the bar's string quartet and the plant). The opening is
  the thumbnail's frame as a live shot (`scenes/parts/KeyShot.tsx`), and it is the thumbnail at frame 0.
- **Shots.** 210, in three parts built in parallel (`scenes/shots/a.tsx`, `b.tsx`, `c.tsx`), each anchored to a spoken
  line by its opening words, so a re-voiced line re-times the cut. Cards for every "it's true" fact (sources stay in the
  description); cast tags on first appearance; the napkin gag throughout; the 10 s wordless peak at the whistle as one
  long take.
- **Sound.** A score cue per section, made locally with ACE-Step 1.5 (`make_music.py`, `cues.yaml`), the channel theme
  at the open and the close, an ambience bed per set (`scenes/make_ambience.py`), the peak's floor and one held note.
- **Render.** Two whole picture passes stalled on a single frame each (frames 4228 and 1157) though every such frame
  renders in about 3 s alone; the cause was the 22 looping audio elements mounted in the muted picture pass. The picture
  now renders from `RoughCutPicture` (the film with no audio elements; `RoughCutSound` is the sound pass) in 2,000-frame
  chunks, joined losslessly, then muxed with the tools' limiter. `whatif_render` has no per-frame timeout input:
  recorded as `core/studio/issues/2026-11-19-say-suppose-story_script-1.yaml`.

Known rough spots, for picture lock unless you flag them: the "Cheap." bubble has no tail; the mayor's sash reads as a
stripe from the side; a garage robot under a car reads roughly; the night gate shot is dark. The plumber's cast tag line
("fixes his own pipes") is the builder's, not the script's.

**For the owner.** Watch the cut once with the script and give every note at once (script, narration, picture, music).
Also: the dial loophole (keep it open for the comments, or close it with three keys). Your notes and the room's go into
one notes round; G2 passes only by your own `omni approve`.
