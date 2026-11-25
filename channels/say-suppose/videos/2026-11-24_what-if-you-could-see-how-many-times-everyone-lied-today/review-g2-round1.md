# G2 round 1: What If You Saw How Many Lies Everyone Told? (2026-11-25)

**Start.** The owner passed G1 (`omni approve ... proposal`, 2026-11-25 08:03 UTC) and said "Approved, start G2".

**Writer.** Claude Fable 5.1, through `claude -p --tools "" --model claude-fable-5-1`, in two calls: the script
(prompt: the approved packaging, the G1 review record with its carried notes, `claims.md`, `brief.md`, `rules/story.md`,
`rules/sound.md`, `style.md`, `cast.md`, `taste.md`, `audience.md`, and the AI-rents film's script and sequel as the
format example), then `say.yaml` and `sequel.md` from the finished script. A first single call for all three files ran
past 25 minutes with no output and was stopped.

**The room's G1 notes carried to this script, all met by the writer:**
- #16, plant the spread before the midpoint: "Two rows down. Someone counting the box on their fingers. The way you do. /
  Can this spread? You don't know. You don't know how you got it." at the stadium, about 4:40.
- The crimson stranger at the stadium, the space over their head hidden by a railing; again in the debate's front row
  with no counter; at the peak counting in step with you; then gone.
- #7, the 54% card carries one number only.
- Also taken: the habit change at the close ("Fine" erased, "Not really" sent), poker night causal (the guest's clip
  brings the morning show), a close of about 40 s, the claims seat's precision notes.

## The session's changes before the owner's drop

- Speaker names the engine can parse (at most three words): "Man on the bus" -> "Bus man"; "Woman at the next table"
  -> "Woman diner"; "Her date" -> "Man diner"; the three stand-up colleagues -> "Desk woman", "Desk man", "Printer
  man" (three people, three voices). "A lie: ..." and "Same survey: ..." were read as speakers: reworded.
- The 632 / 91 days figures were cited to c17; they are in c15's note, so the cite moved to c15 (then cut, below).
- A 4 s hold for the title ident (IdentC is 120 frames).
- Lint warning: "And then someone on television" -> "But then".
- Claims statuses moved to the qc vocabulary: `verified` -> `sourced`; c12 `wrong_belief` -> `sourced` (the film says
  only that the talk said it and named no study).

## Checks on the drop

- `studio.room lint g2 --round 1`: ok, no problems, no warnings (draft e4572a25...).
- `omni qc ... story_script`: claims pass; clicks pass after five mutes (`mutes.txt`).
- Narration: free local, voice B (channel narrator) and twenty characters in designed voices of their own
  (`cast.py`; the channel's `voices.yaml` unchanged). 1,478 words at 178 a minute; 10:38 with the holds.
- `room present` recorded the draft at 2026-11-25 09:17 UTC; the script and the narration mp3 went to the owner then.

## The room, round 1

Both seats ok on the first try (story editor gpt-5.6-sol-high, claims check gemini-3.8-flash-high).

**Claims check, 3 blockers, all applied:**
- "632 people kept a diary of their lies for 91 days (c15)": the row's quote has neither figure nor a diary. Now "In
  another large study, most people lied rarely. A few prolific liars told most of the lies (c17)."
- "In developmental studies, most children aged 3 to 8 ..." overstated one study: now "In one study, ..." (c16).
- "a US national survey of 1,000 adults": 1,000 is not in the quote (and the sample was 998). Now "a US national survey".

**Claims check, 3 suggestions:** "Feels like everybody's lying by two inches": applied. "two diary studies" spelled
out: applied. "Lying shows up around age 2 to 3 (c08)": not taken, the sentence was cut for the story editor's #7.

**Story editor, 3 blockers, all applied:**
- #16, the forfeit rule was unplanted: the polygraph beat now ends "Dodge a direct challenge there, and you lose your
  closing."
- #21, "All in." is true once the chips move, so it cannot click: now "Player: I've got a flush." (click, he folds), then
  "Except the quiet one. / Quiet player: Pocket aces." (no click, you fold, two aces: the honest player is the gap), and
  "You take the table in an hour anyway."
- #7, too many numbers at once: the dating line keeps 81% only; the 1996 line keeps adults only; the strangers line says
  "a short chat" (its card follows); the kid line keeps one study; the stadium line keeps no figure.

**Story editor, 3 suggestions:**
- You sending the boss's draft yourself: applied as "You wait at his desk until he sends it."
- Cut "The way you do.": not taken. It is the G1 spread plant the room asked for, and it ties the stranger's counting
  to yours before "Nine?".
- End the stadium on an action: applied, "You stop watching the pitch. You watch the box."

Round 1 had fact blockers, so it is not a candidate. The applied draft goes into the owner-notes round with the
owner's notes on the first cut (one merged list, owner notes first), as `rounds: 1` allows.

**Re-voice:** 14 takes (the changed lines only); 10:28 with the holds; qc claims and clicks pass (mutes re-indexed).
