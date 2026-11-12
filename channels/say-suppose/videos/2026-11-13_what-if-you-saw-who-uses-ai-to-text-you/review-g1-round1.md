# G1 review, round 1: saw who uses AI to text you

Topic: the 2026-11-12 AI-and-the-future slate's `f-see-who-uses-ai-to-text` (Fable's own pitch, 77/100 blind); the
owner's pick, 2026-11-13, film 4 of 4 that night. Claude Fable 5.1 wrote this draft (`claude -p --tools ""`) from the
brief, the claims ledger, the channel's rules and the owner's notes from the first two films (the skit opening, scenes
that play without the narrator, roles not names, plain words, a lot happens, emotion per scene). The room ran on round
1's draft after it went to the owner (owner first).

**What the draft decided.** The Philippines stays, argued on the idea: a country once called the texting capital of the
world (c01, the country, not Manila, and "was called"), over a billion texts a day by 2008 (c02), about two million
people working overseas (c04), families kept together by big group chats (c05), so a dot on a message is a dot on the
relationship. The United States was weighed and lost (there a text is one channel among many). Manila stays in the
pictures, never in the words. The best friend is a role, named once beside it; the father on a cargo ship, the mother
with a shoebox of his cards, two aunts, a man from a dating app, a boss. It opens on a skit (the birthday wish, the
smoke, the dots ticking on, your mother's "What? What is it?"), and eight scenes play without the narrator. The
father's three misspelt words are the running gag and carry the peak; the turn breaks "A machine can't mean it" at the
cafe neither of you booked.

**Fixed before the room read it** (research, in `claims.md`): "Manila, the texting capital of the world" became "the
Philippines was called" (c01); "hundreds of millions of texts a day" became about thirty million a day in 2001 and over a
billion by 2008 (c02); "typos read as warmer" has no source and is never stated (the typo as a signature is the story's
own line); Weizenbaum's "alone with it" wording, a "Pew 23%" figure and the 2025 dating-app numbers were dropped.

**Not a repeat.** `omni similar` passed (title only at G1, against the channel's four videos with features). The
packet's "How it differs" paragraph separates it from the hear-thoughts and who-cares powers (hidden feelings) and from
the wants-you-to-fail meter (feelings about your news): this one reveals only authorship.

**Thumbnails.** Drawn in code (`brand/thumbs/texts/`, the library's kitchen at `night` with a dark pool behind your
head). Renders in `renders/packaging/` (git-ignored), numbers in `thumb-checks.json`: all three pass K3 (head 37%), K4
(4.78:1), K5, K8 (0), K9 (colour 60-64, mean luminance 0.13), K10 and K11. One call made on my own: the dots are drawn a
little larger than the packet's "smaller than an eye" so they read as a red column at the 168x94 feed size; the bare
bubble stays the only one without a dot. Tag b, "A MACHINE DID.", is the longest that still fits at the K5 size.

**Room round 1** (`room-g1.md`: shipped round 1, 2 of 16 calls; `room verify` ok). The claims check returned no
blocker, the story editor three. Story blockers don't stop a candidate; they go to the owner with the draft, and the
fixes ride into the G2 script (the G1 spine binds the room, not the writer).

| # | Seat | Line | Note | Proposed (writer's view) |
|---|---|---|---|---|
| 1 | story, blocker #2 | 47 | The thumbnail's frame lands at 0:24, after the 7 s confirm-the-click window | Partly: the owner's skit note (2026-11-12) outranks the template's cold open and asks only that the thumbnail's moment land by 0:30 (K13), so the skit stays first. But tighten it: the dots tick on at about 0:05, the pink paragraph's dot at 0:07, the father's bare message and the thumbnail frame by about 0:12, the title question by 0:15 |
| 2 | story, blocker (late rule) | 56 | Reviews, comments and a petition at 6:30 read as a new power after halfway | Take it in part: the rule at 0:30 already says "every message you can read, in any app", so plant reviews and comments there in one clause; cut the petition (a count of people is more than the rule says); keep the bot figure (c09, a claims-check keep line) |
| 3 | story, blocker #6 | 49 | The landlord and the bank are dotted as expected: no gap | Take it: the landlord's cold reminder has no dot (he wrote every word); your boss's praise is dotted, his one-word "noted" is not |
| 4 | story, suggestion | 58 | "You go. She is there." is passive | Take it: you delete the reminder, then go anyway |
| 5 | story, suggestion | 54 | Dunbar (c19) pauses the bench scene after its reveal | Take it: move it to the night bus |
| 6 | story, suggestion | 49 | The aunts' machine loop is the obvious gag | Take it: one aunt types "lovely", her assistant turns it into an apology, the other's accepts an offence neither aunt noticed |
| 7 | claims, suggestions | 54, 58, 12 | "costs hours" (c19: "time"); "the use never hurt anyone" (c22: the conversation); "every study in the ledger" | Take all three at G2 |

Keep lines: "She was keeping you with the only hours she had left: the ones she was asleep for." / "Nobody wrote it. Both
of you meant it." / "A dot is a greeting card that hides the card." (story editor); the texting-capital line (c01, c02),
the lazy-and-insincere study (c20) and the bots line (c09) (claims check).

**For the owner.** Pick one title and thumbnail pair (recommended: **A + "EVEN HER?"**, the topic's own title in the
proven form, and the tag is the first thought anyone has at a dot on their best friend's message), and approve the
five lines and the under-question ("If a machine wrote it but they meant it, does it still count?"). Notes 1-7 go into
the G2 script with any notes of yours. G1 passes only by `omni approve` (the session never runs it).
