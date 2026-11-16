# G1 review, round 1: fired everyone and hired AI

Topic: the owner's own request (2026-11-15): "What would the world look like with AI all around us ? The AI trap and
other theories explaining everything properly like a what if video". Idea source: a short reel on "The AI Layoff Trap"
(Hemenway Falk and Tsoukalas, 2026, arXiv 2603.20617); nothing of its wording, framing or pictures is used. Claude Fable
5.1 wrote this draft in one call (`claude -p --tools ""`) from the session's concept, the claims ledger, `taste.md`,
`rules/story.md`, `rules/thumbnails.md`, `style.md`, `cast.md` and the AI-texts film's G1 packet as the shape. The
room ran round 1 after the draft went to the owner (owner first). Reviews kept lean, as the owner asked today: one
room round, no outside model review.

**What the draft decided.** The layoff trap is told from the boss's chair, not a worker's: you own a forty-stool diner
across the road from a car plant, an app hires a machine for any job at no wage, and you rent machines to the plant and
the whole town. The catch is the paper's sum (c02): each owner saves a whole wage and loses only a slice of the spending
it carried, so everyone automates, everyone knows (c03), and the stools empty. The theories arrive as set pieces and
loopholes said out loud: Flippy (c23), Jevons (c12), the ATM and the tellers (c11), the farms (c10), Keynes's
fifteen-hour week with his "temporary phase" kept (c07, c08), Ford's own words on wages and sales (c17), "make the robots
buy" and "prices will fall", the cheque (Alaska c19, Finland c25, the model's UBI result c05), Baumol's quartet and the
handmade premium (c13, c21), the Luddites (c26). The climax is the app's one dial, flagged at 0:50: you put a toll on
every machine shift equal to the spending its worker would have done in town, which is the model's one fix (c06, Pigou
c22), said as one model, not yet checked by other economists (c01). Running gag: the napkin sum with a line missing,
seven times; second gag: the robots' screen smiles that never change. It opens cold on the thumbnail's frame (0:00-0:08,
the owner's 2026-11-14 note), flips to "six weeks earlier" and plays a 20 s skit before the narrator.

**Not a repeat.** `omni similar` passed (title only at G1, against the channel's four videos with features). The
packet separates it from the unmerged slate's two AI-jobs briefs (both in the worker's chair) and from the three AI
films in progress (mind, prediction, messages).

**Thumbnails.** Drawn in code (`brand/thumbs/aitrap/`); renders in `renders/packaging/` (git-ignored), numbers in
`thumb-checks.json`: all three pass K3 (head 34.1%), K4 (5.22:1), K5, K8 (0), K9 (dark, mean luminance 0.15-0.16,
colourfulness 58-63), K10 and K11. One variable, the tag: a WHO EATS?, b ANYONE?, c UH OH. Rendered outside the render
queue at concurrency 1 (three stills, about 15 s; a sibling film held the queue with a full render).

**Research.** `claims.md`, 28 rows. c01-c06 (the paper) read by the session from the arXiv abstract and all marked
`contested` (a preprint model, no journal). c07-c28 sourced by a cheaper-model research pass; the session re-fetched
c08, c16 and c17 and found each quote on the live page. Corrections made before the draft: the Gates line is Quartz's
headline (c20); the robots-and-dues story is Reuther's own, about an unnamed manager, never Henry Ford II (c18,
contested); Baumol wrote of a Schubert quartet (c13); GPT-4's bar result is contested (c27); "under 2%" is for 2000
(c10).

## Room round 1 (shipped; 3 of 16 calls, the claims check timed out once and was re-run)

| Seat | Verdict | Note | Proposed for the owner-notes round |
|---|---|---|---|
| story editor | blocker, #10 | The Reuther story at 2:15 says the missing-customer turn two minutes before 4:35 | Agree. Move it to just after the missing line (4:35), where it confirms the turn instead of giving it away |
| story editor | blocker, #21 | "Who owns the dial?" is left open for the comments, but it is the first exploit a viewer types | Agree in part. Answer it on screen before the climax (the boss asks; you hand the dial's setting to the town and keep only the turning), and leave a smaller loophole for the comments |
| story editor | blocker, no new rule after halfway | The SHOP tile at 8:50 is a new power | Agree. The sequel hook reuses the CUSTOMER machine from 5:10, paying with a card you don't recognise; your phone doesn't ping. Visa's pilots (c28) stay the real hook |
| claims check | suggestion | 8:05: "found one fix and only one" overstates c06 | Take: "standard fixes like a basic income fail in their model; a tax on the machine itself can" (c05, c06) |
| claims check | suggestion | 8:55: Visa's purchases were pilots | Take: "completed real purchases in pilot trials" (c28) |
| claims check | suggestion | 6:25: "two hundred years" | Take: "two centuries" |
| story editor | suggestions | The dial overshoots first; the dilemma answered by acting; a closing question tied to the last image | For the G2 writer to weigh |

Keep lines named: the story editor's three are the writer's three darlings ("You didn't fire a cook...", "Everyone in
town has done the sum...", "A machine never calls in sick..."); the claims check's three are the Keynes card, the
Reuther line and the paper card.

One process slip, noted plainly: the claims check ran without `claims.md` passed as an input; it checked every cited
line against the draft's own wording and returned no blocker. The ledger is attached here for the owner, and the G2
claims check gets `claims.md`.

None of these is applied yet: by pipeline v2 they merge with the owner's G1 notes into the one owner-notes round.

## The owner's pick (2026-11-16)

"Pair A + WHO EATS?": title A ("What If You Fired Everyone and Hired AI?") with thumbnail a ("WHO EATS?"), the writer's
recommendation. No other notes. The room's three story blockers and the three claims wordings taken above go into the
G2 script: the Reuther story moves after the missing-line turn at 4:35; "who owns the dial?" is answered on screen
before the climax, with a smaller loophole left for the comments; the sequel hook reuses the CUSTOMER machine instead
of a new SHOP tile; "a tax on the machine itself can", Visa's "pilot trials", "two centuries". The G2 claims check gets
`claims.md` as an input. Recorded in `taste.md` and in `artifacts/proposal_packet.json` (selected concept A).
`packaging.md` is unchanged: it is the draft the room reviewed (`room verify` checks its hash). G1 passes only by the
owner's own `omni approve`.
