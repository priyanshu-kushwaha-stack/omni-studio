# G2 room, round 2: notes and what was done

Verdicts: `room/g2/round-2/` (written by the room tools). Precedence: CLAUDE.md and the gates, fact blockers, `taste.md`,
then `rules/`. Lint ok. The viewer seat had a slimmer input set (`audience.md`, `cast.md`, `rules/story.md`,
`packaging.md`) and still timed out at the room's fixed 600 s (`core/studio/room/call.py`); see the outcome of its one
re-run in `room-g2.md`. Grok's ok calls on this channel today took 380 to 596 s, so it brushes the limit on every film.

| Seat | Kind | Note | Done |
|---|---|---|---|
| voice director | **blocker** l110, story #11 | "You've done to him exactly what you did to yourself." explains the peak the picture already shows | applied: "He didn't even argue." [low, flat], one plain fact that does not judge (the seat's own fallback) |
| voice director | **blocker** l125, story #11 | "Grey. Zero." narrates the window shot | applied: "And Aarav's." only; the hold and the one note finish it |
| retention editor | suggestion l33 | "It never tells you what that thing is." (why you can misread the chips) | applied |
| retention editor | suggestion l119 | Cut the teacher's window; it repeats the chaiwala reveal | not applied: the teacher's three per cent is planted in the first jump and would be left unanswered. Taken the voice director's way instead: trimmed to the reveal |
| retention editor | suggestion l151 | Cut "You know your number now."; hold on your handwriting, then "thwack" | applied: cut; the handwriting hold is 3 s |
| voice director | suggestion l151 | Replace it with "Row three. You don't look up." | not applied: round 1's voice blocker found "you don't look up" narrates the picture; the retention editor's cut leaves the end inside the image |
| voice director | suggestion l88 | Three short takes | applied |
| voice director | suggestion l86 | Two beats | applied: "Your chip started from a crowd too." / "Last year? About one in a thousand UPSC applicants got in (c01)." |
| voice director | suggestion l119 | Start at the reveal | applied: "The teacher? He's sitting the exam himself. Again. His three was never about you." |
| voice director | suggestion l122 | Cut "The topper, at a keyboard." | applied |
| voice director | suggestion l54 | "his" is unclear | applied: "Aarav's tiny number" |
| voice director | suggestions l148, l99, l31 | Directions and a trim | applied (narration notes; "For you. The one who can see the numbers.") |
| animator | suggestion l85 | Reuse the chair grid for the crowd of applicants | applied |
| animator | suggestion l114 | Build the city as one instanced chip sprite on two parallax layers; bus as a window frame | kept for G3 (a build note; the scene line already has no numerals off the key windows) |
| animator | suggestion l123 | Reuse the stall layers plus a shutter | applied in the scene line |
| animator | suggestion l128 | The reflection at about 25%, or cut it | applied, with "cut it if it costs the week" |
| animator | suggestion l71 | Scarf continuity (hook vs bag) | applied: folded into your bag |
| animator | suggestion l79 | cue_stall thins too early | applied in `cues.yaml`: on the 0.02% stamp |
| animator | suggestion l104 | 10 s of speech on one shot | applied: fee slip close, your face, a push on the lamp |
| animator | suggestion l152 | The music fade must finish on "Out in the lane...", not earlier | applied in `cues.yaml` |
| fact-checker | none | Facts 10/10, no notes | - |

Keeps (protected): "You can't borrow someone's odds. Only their apron." (retention, voice); "Quit." (animator, voice);
"The biggest number? It tells you what's likely. It can't tell you what's worth choosing." (all three);
"But it's his. And it's moving." (retention); "Out in the lane... thwack." (voice); the drain-not-nod music note
(animator).
