# G2 review, round 1: AI rented your brain while you slept

Script v1, G2 drop 1 (2026-11-13). Claude Fable 5.1 wrote `script.md`, `say.yaml` and `sequel.md` (`claude -p --tools
""`) from the approved G1 packet (pair A, "THAT'S ME?"), the G1 room's notes, `claims.md`, the channel's rules, `taste.md`
and the owner's twelve lessons from the doubled-money and saw-who-wants-you-to-fail films. The room ran on round 1's
draft after it was recorded as presented (owner first). G1 was passed on the owner's instruction by the coordinator
(`review-g1-round1.md`, "G1 passed").

**What v1 does.** About 1,645 spoken words, 11:09 on the local narration (96 lines: the narrator and seven characters
in their own free local voices). It opens on a ten-second performed skit in the clinic: the broker lays a band on you
while you doze, the pale second you sits up at a floating desk, one coin drops into your palm, the nurse plucks it off
("Thursday. Not before."), the broker: "Sleep tonight. Get paid." The title question at 0:15, the thumbnail's frame
from about 0:20 and the cost by 0:27 ("a night you sell is a night your brain doesn't keep"). Twenty performed moments;
the globe is the one wordless peak (9 s). Nobody is named. Every G1 room note is taken (the skit test, the cost by
0:30, the linked mind planted in the rule, reCAPTCHA connected to the band, the "therefore" chain, the claims wording),
and plain words replace "exascale" and "Pong". The script lists every change from G1 under "Changed from the approved
G1" (twelve, including the runtime: 11:09 against the template's 9:30, because of the performed moments and the extra
content the owner asked for on the last two films).

**Session fixes before the room read it.** The bridge woman's voice label is `Bridge woman:` (the channel's `Woman`
voice belongs to the doubled-money film); one `> DARLING:` quoted part of a line and now quotes the whole spoken line
(lint); say.yaml keys carry no citations (story.py matches the cleaned line). Six character voices added to
`voices.yaml` (Brother, Nurse, Broker, Boss, Grandmother, Clerk; each opens with gender and a voice type).

**Narration.** Free and local (Qwen3 Arthur clone for the narrator, Qwen3 VoiceDesign for the characters), 96 takes,
668.9 s on the render queue. 26 breath clicks muted in `mutes.txt`. `omni qc story_script` passes (claims, clicks).

**Room round 1** (`room-g2.md`: shipped round 1, 2 of 16 calls; `room verify` ok). The claims check returned no
blocker (fact score 10); the story editor three (story score 8). Story blockers don't stop a candidate; the room has one
round, so they go to the owner with the cut and ride the owner-notes round.

| # | Seat | Line | Note | Proposed (writer's view) |
|---|---|---|---|---|
| 1 | story, blocker #17 | 148 | About 125 s between stake jumps (1:56 to 4:01) | Take it: cut the Loewi and reCAPTCHA asides to one line each or move "Problem one" up after the notebook, so the stake jump lands by about 3:00 |
| 2 | story, blocker #7 | 79 | The twenty-watts line stacks three numbers (two per cent, twenty per cent, twenty watts); lines 210, 220 and 282 stack too | Take it: "It burns about twenty watts (c10). The leaflet calls that unused power."; one number per line elsewhere (drop 1924 from 210; split 282) |
| 3 | story, blocker #5 | 307 | "And that's when the man in the grey suit comes back" is an "and then" | Take it: "But one offer hasn't fallen. The man in the grey suit comes back." |
| 4 | story, suggestion | 112 | Beat the fitted-sheet gag with a second turn ("He opens it. You've folded his cap inside.") | Take it |
| 5 | story, suggestion | 318 | Cut the Coors aside and spend the time on the live dilemma | The owner's call: it is the film's one "somebody already tried to buy the night" fact (c07, c08); the writer keeps it unless the owner prefers the editor's |
| 6 | story, suggestion #19 | 414 | "So: clear the debt, or keep your nights?" as the close | The owner's call (as at G1): the template's spoken close stays unless the owner prefers this |
| 7 | claims, suggestions | 289, 282, 40 | Join the chess robot and the website in one sentence; "The US" for "This country"; "Twice in seven days" | Take all three |

Keep lines: "Sleep was never nothing. It was the one shift you always worked for yourself." / "Sign, and nobody in this
house sits in that chair again. Don't, and it's Thursday forever. You can't sleep on it. Sleeping is the job." / "The
biggest idea people ever had together, and nobody was awake for it." (story editor); the mice line, the 1924 and rats
line, the bat-and-ball line (claims check).

**For the owner.** Watch the 720p first cut once with the script and give every note at once (script, narration,
picture, music). The room's notes 1-7 join yours in the owner-notes round. G2 passes only by the owner's own
`omni approve`.

## Drop 2: the 720p first cut (2026-11-13)

`renders/firstcut/firstcut-720p.mp4` (git-ignored; 1280x720, 11:09, -15.4 LUFS integrated, not yet levelled for
upload). All twelve beats are drawn on the kit with six new sets (clinic, bridge, window street, graduation hall,
warehouse, globe), a score cue per section (eleven ACE-Step cues, the channel theme at both ends, the globe's held note
over a dropped score) and an ambience bed per set. Rendered on the render queue; nothing paid.

**Checks.** `omni qc story_script` on the narration: claims and clicks pass (the G2 check). On the full mix, the click
scan flags five spots (`qc/firstcut-mix-clicks.json`). The knock and clock tick were remade softer (`make_sfx.sh`),
which cleared two; the five left go into the notes round with your ear:

| Time | What it is |
|---|---|
| 0:34.6 | the pay-flap effect on "What'd you get?" |
| 1:52.9 | the start of the brother's "That's a shoe" over a ducked bed |
| 2:01.8 | the shower-wall bang (knock) in a quiet passage |
| 8:54.2 | a short tick before "Eleven" (the kitchen clock) |
| 10:16.5 | the midnight knock on the door |

**Picture flaws I know of.** Midnight (about 10:13-10:18): the brother's head overlaps yours and one tight insert
beside the drawer reads oddly. Night One (about 0:35): the hanging brother's arm crosses his face slightly. Picture
notes are kept for picture lock unless they're quick.

**Length.** Kept at 11:09 for this cut rather than trimmed blind. Trims ready for the notes round, about a minute: the
blocker-1 asides to one line each (Loewi, reCAPTCHA), one number per line (blocker 2), the Coors aside if you prefer
the editor's call, and the descriptive repeats.

**Calls I made on my own:** keeping the length; the `Bridge woman` voice label; the title question at 0:15; one
thumbnail picture as the key shot (pair A). G1 was passed by the coordinator on your instruction.

`story_script` is `awaiting_human`. G2 passes only by your own `omni approve`.
