# G2 owner-notes round: AI rented your brain while you slept

## Part 1: the owner's notes on the fail film, carried over (2026-11-13)

The owner on the first cut: "This video felt good script wise. At certain places, it was difficult to understand.
from context was sort of unclear." The owner is watching again and will send detailed notes; they join this round.
The owner also asked to take the learnings from the eleven notes on "What If You Saw Who Wants You to Fail?" (v3, in
`taste.md` on `claude/wants-you-to-fail-g1-f13563`, commit feed453) wherever they apply here.

Script v2 (`script.md`, `say.yaml`) has the text changes below. It is **not voiced yet**: the re-voice, the picture
items and the re-render wait for the owner's own notes, so they are made in one pass. story lint is clean, story.py
parses 98 lines (v1: 96), and the claims check passes. `story.json` stays v1 until the re-voice.

| # | Note on the fail film | Where it applies here | Done |
|---|---|---|---|
| 1 | A stranger's line in the first ten seconds is heard right the first time: a full, plain sentence, and a voice made for them | The skit's "Thursday. Not before." and "Sleep tonight. Get paid." were fragments, and Thursday meant nothing yet | Text: "That's twice this week. Come back Thursday." / "Why wait for Thursday? Sleep tonight, and get paid." |
| 2 | Name the thing the viewer knows first | "The pale part of your blood" and "the chair" never said plasma; the family's debt was first heard at the contract (9:06); "the whole border" before any border was named; "the website named after it" | Text: "That's your Thursday. Selling your plasma, the pale part of your blood. Twice a week, the most the law allows. It's how your family pays what it owes."; "her plasma too"; "Everyone has a band on now."; "from Mexico"; "Amazon named a website after it, Mechanical Turk"; "no more Thursdays in the chair" |
| 3 | Don't list the rule's limits in the rules speech; more air between lines | "The leaflet calls them harmless. Remember that." (the same "Remember that." the owner cut there) | Text: "Remember that." cut. Re-voice pass: `timing.yaml` with 0.3 s more after every line, more where a card lands (about +30 s) |
| 4 | Introduce the characters so people remember them | Your brother, the nurse, the man in the grey suit, your boss, the grandmother next door, the clerk | Picture pass: a cast tag at each one's first close-up, a role and one thing they do (roles only, no names), built like the fail film's `scenes/Captions.tsx` |
| 5 | On-screen text only where it helps, one card at a time | Problem one, two and three; a third of your life asleep; the US and two thirds of the world's plasma; 2022 brain cells; the 2021 dream ad; under two dollars an hour | Picture pass |
| 6 | When the narrator says you speak, the hero speaks on screen | "So you try it on the woman at the bridge"; "You wake saying sorry in a voice that isn't yours" | Picture pass: your bubble with the word; your bubble "Sorry" |
| 7 | Say what is meant, not "it" | "That's how you know" (know what?); "So is the chair's way out" | Text: "You remember nothing of your nights. Only the crumbs. And now you know what they were building. You'd rather sit in that chair every Thursday than build it every night."; "The offer's gone. And so is your way out of the chair." |
| 8 | A choice needs its stakes both ways and the reason it's taken | Your brother's "Not yet. Look." had no reason; the drawer at midnight had no reason said | Text: new line "Six weeks of crumbs, his and yours. He thinks they add up to something."; the midnight reason in 7 |
| 9 | A fact that sounds made up gets "it's true", its year and a card | The brain cells and the old video game; the US and the world's plasma; the Kenyan workers | Text: "It's true. In 2022, brain cells in a dish..." (c19); "It's true. The US is one of the few countries..." (c01); "It's true. The Kenyan workers..." (c09). Cards in the picture pass |
| 10 | Tell scenes in order and name the moment on screen | The knock at midnight was not said to be the grey suit; graduation, that night, a week later | Text: new line "The man in the grey suit, at midnight, for your answer. Nobody opens." Picture pass: small moment cards (SATURDAY, GRADUATION; THAT NIGHT; MIDNIGHT) |
| 11 | Clearer voices; ElevenLabs only at the end | The cast voices asked for a cracked laugh, a Texas accent, a crackly old voice, a monotone bass, a velvety voice close to the ear | voices.yaml: all six re-described for crisp, clear diction. Re-voice pass: each take transcribed back and checked against its text. The paid A/B stays last, at picture lock, with a quote first |

Also in v2, from the room's round 1 (story blocker #3): "But one offer hasn't fallen. The man in the grey suit comes
back." replaces the "and then" line.

Not changed yet, for the owner with their notes: the length (11:09 on v1; v2 is about 20 s longer before the extra air),
the room's blockers #1 and #2 (the asides before the first stake jump, one number per line), the Coors aside, and the
spoken close.
