# G2 room, round 1: notes and the proposed edit list

Draft: `script.md` v1 (sha256 `15b85a65…`), written by **Claude Opus 5.5** on the owner's word ("Opus writes it now"):
the room's writer, Claude Fable 5.1, hit the account's weekly limit (resets Nov 13). Verdicts: `room/g2/round-1/`.

Pipeline v2 (`owner_first`, `rounds: 1`): the owner got the script and the local narration first; the room ran beside.
Nothing below is applied. The owner's notes come first; this list joins them in the owner-notes round (round 2).

**Seats.** The first-time viewer seat (Claude Opus 5.5) did not run: it is the draft's own model, and a seat never
reviews its own model's draft (`room.yaml`, viewer trial note). `viewer_required: false`, so the round needs only the
story editor and the claims check.

| Seat | Model | Status | Blockers | Scores |
|---|---|---|---|---|
| story editor | gpt-5.6-sol-high | ok | 3 | story 8; length 7:50, "the unread envelope sustains the ending" 9 |
| claims check | gemini-3.8-flash-high | ok | 3 (fact, never cut) | facts 6 |

## Proposed edit list (the writer's merge; the owner's notes outrank it)

| # | Seat | Kind | Line | Note | Proposed |
|---|---|---|---|---|---|
| 1 | claims check | **fact blocker** | 94 | "Treasure found in the soil goes to the Collector (c01)" misstates s. 4: the finder gives the Collector notice in writing; the treasure goes to the government treasury | **Apply:** "There's a law from 1878. Find treasure in the soil, and you tell the Collector (c01). In writing." then "It goes into the government treasury." (the c01 row's quote already covers notice; s. 4's deposit sentence is in its note: widen the quote to it) |
| 2 | claims check | **fact blocker** | 114 | "8,000 bitcoin" is Howells's pleaded figure, assumed in the judgment, not a finding; "A judge threw his case out" is not in c03's quote | **Apply:** "On it, he says, the key to 8,000 bitcoin (c03)." and widen c03's quote to the judgment's dismissal line, which is in the saved page |
| 3 | claims check | **fact blocker** | 115 | "In 2025, he gave up" rests on the BBC page, which is in c03's note, not its URL or quote | **Apply:** add row c07 for the BBC (7 Aug 2025) with its own verbatim quote, and cite it |
| 4 | story editor | **blocker**, story #12 | 200 | The last line ("Somewhere under that grate is something somebody lost") is invented, not a real thing | **Apply:** set the last image by the bazaar's chai stall and land on c02: "Gold dust still washes into these drains. And men still sift the mud for it (c02)." then "What would you leave lost?" |
| 5 | story editor | **blocker**, story #6 | 68 | The bazaar grate gives exactly what you expect (gold in a gold bazaar) | **Apply:** a shopkeeper asks for a nose-pin the rain took; you expect the nearest grate, and the line surfaces in the old sifter's pan; he notices only when you point |
| 6 | story editor | **blocker**, story #7 | 113 | Three fact lines in a row at the dump with no return to you | **Apply:** "A man in Wales spent years asking to dig his council's landfill for one hard drive (c03). In 2025, he gave up (c07)." then you put the trowel back in your bag, the line still eleven metres down |
| 7 | claims check | suggestion | 104 | Howells's ex-partner threw the bag out, not him | **Apply:** "Cousin: Someone threw out a hard drive. Bitcoin on it." |
| 8 | claims check | suggestion | 96 | Cite the prison line | **Apply:** "(c01)" on it, with s. 20 in the quote |
| 9 | story editor | suggestion | 158 | "So you search for something no family is waiting for" makes the third jump argue the under-question | **Apply** |
| 10 | story editor | suggestion | 174 | Make Madhav's arrival a consequence: "Your cousin sent the video to the family group. It found Madhav first." | **Apply** |
| 11 | claims check | suggestion | 113 | Past tense for Howells | covered by #6 |

## Keep lines (protected)

- story editor: "You expected money. You get a receipt. And a queue."; "Knowing where was never the hard part."; "The rule
  held. Nobody alive knew."
- claims check: the c02 line ("In the old gold bazaars, men still sift the drains..."); the c04 line; "Finders keepers.
  Right?"

## Writer's notes for the owner (not the room's)

- **Length.** The local voice reads faster than 115 words a minute: the film is 5 min 25 s on the local narration
  (7 min 50 s was the estimate). The paid voice at the A/B will be slower.
- **The choice lands late** (about 87%, against 75-80%): the first jump runs long. Cutting the bicycle test or the
  crow would bring it forward; both are planted gags, so that is the owner's call.
- **Character lines** (Grandfather, Madhav, the cousin) are read by the narrator's voice in this cut; real voices are a
  G3 question.
