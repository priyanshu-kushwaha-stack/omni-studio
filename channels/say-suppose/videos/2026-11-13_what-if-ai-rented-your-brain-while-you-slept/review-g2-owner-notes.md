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

## Part 2: the owner's notes on a second watch (2026-11-13), applied in v3

Owner notes outrank the room. All five are in `taste.md` under 2026-11-13.

| # | Owner note | Applied in v3 |
|---|---|---|
| 1 | "better Skit to start with and more clarity In the first and second line around." | The nurse says what she took ("That's all the plasma we can take this week. Come back Thursday."); your bubble over the three notes ("That's it?"); the broker explains the demonstration ("You fell asleep for ten seconds, and you earned a coin.") and then the offer ("Wear this tonight. Sleep all night, and get paid for every hour."). The first narrator lines: "Twice a week, you sell your plasma, the pale part of your blood. It's the most the law allows." / "It's how your family keeps up with what it owes." |
| 2 | "I would suggest you define Band also in the starting when you introduce it." | Right after the title question, on its own shot: "That's the band. A thin strip you wear across your forehead." / "While you sleep, it lends your brain to a company. And it pays you, by the hour." Then "That pale figure up there? That's your sleeping brain, at work for the company." A THE BAND card. |
| 3 | "More clarity around leaflet says and band.. Around 1:00" | "The band came with a leaflet. It sets out the deal." The rule in short steps, one line each (wear it to bed; the company runs its work on your brain; it pays you by the hour; you won't feel a thing; many bands can link for one job, but the leaflet promises each brain stays separate); "crumbs" named as it is defined; the title card now plays in its own gap, so it no longer covers the first leaflet line. One number per line ("about twenty watts"). THE LEAFLET and CRUMBS cards. |
| 4 | "More pauses and stresses in voice wherever required for better explanation of the concept." | `timing.yaml`: 0.3 s more air after every line, 0.8 s after 29 concept, card, problem and it's-true lines. Every concept line's direction names its stressed words; long explanations split into shorter lines. |
| 5 | "Text on the Screen if needed." | 16 cards (the concepts as defined, Problems 1-3, the it's-true facts with their years, the job) and 7 role tags at first close-ups (roles, no names), one at a time, lower left (`scenes/Captions.tsx`). |

**Narration v3.** 108 lines, 12:51 with the extra air (v1 11:09). Free and local; the six cast voices re-made for clear
diction. Every take transcribed back: four were misheard and re-directed (the brother's "what'd" heard as "where'd",
the countdown run together as "1941", the clerk's "rested" heard as "rusted", "pen" heard as "pin"); all four now
transcribe right. 36 click mutes; `omni qc story_script` on the narration passes (claims, clicks).

**For the owner.** The title question now lands at 0:30 (v1 0:15), because the skit and the plasma lines come first.
The length is longer, as the clearer opening and the pauses asked; the room's trims (blockers #1 and #2, the Coors
aside) are still open if you want it shorter. The room's owner-notes round is not run yet: it reads v3 after you do.

**The v3 cut.** `renders/v3/v3-720p.mp4` (git-ignored; 1280x720, 12:51, -15.6 LUFS). The full-mix click scan is down
from five spots to two (`qc/v3-mix-clicks.json`): 1:02.6 (the pay-flap effect on "What'd you get?") and 11:50 (the
midnight knock on the door), both effects, kept for your ear. `story_script` is `awaiting_human` on v3; G2 passes only by
your own `omni approve`.

## Part 3: the owner's notes on the v3 cut (2026-11-13), applied in v4

| # | Owner note | Applied in v4 |
|---|---|---|
| 1 | "His spoon hits the floor. That he got amazed and surprised to see that. Does it mean that. ? Not obvious." | "Nobody can fold a fitted sheet." added, and the brother says it: "Since when can you do that?" |
| 2 | "Around 4:00. review it again." | The reCAPTCHA aside and "Spare seconds..." are cut (also the room's blocker #1): the dream fact, "Sleeping brains do real work. Normally, you keep it.", then Problem one at once. |
| 3 | "voice at 5:58 broken." | A click mute had cut into "nothing" ("Did you think it was for nothing?"). The narration is re-voiced, and every mute is now refused when there is speech on both sides of it. |
| 4 | "Need to improve the music more ig. And maybe we should change the narrator voice." | Options rendered first: narrators A-D, scores M1-M3. The owner picked **B** and heard it drift between sentences, so B is cloned from one cool read for every line (`narrator.py`), and from Midnight from one warm read. The score is in **M2** (ambient drones, glassy pads, data blips) for every section before Midnight; the owner didn't pick a score, so M2 is the default, the coolest of the three. |
| 5 | "I want to make it a SciFi thing but not very emotional thing. Emotional part should come only at the end where it is teaching a lesson." | 77 narrator directions before Midnight re-written to cool, precise sci-fi delivery (the clone carries the cool read's delivery); warmth only from Midnight (the warm clone, and the warm release and dawn cues). |

**Narration v4.** 107 lines, voice B, 87 new local takes, all transcribed back. Six pitch outliers re-taken; the voice now
sits at 90-118 Hz line to line. Two click mutes, none inside speech. `omni qc story_script` passes on the narration.

**The v4 cut.** `renders/v4/v4-720p.mp4` (git-ignored; 11:55, -20.7 LUFS, levelled at G3). On the full mix the click scan
flags two effect spots (2:44.6, 10:57.1) and one small level step at 8:27.3 (`qc/v4-mix-clicks.json`); picture-lock work.
