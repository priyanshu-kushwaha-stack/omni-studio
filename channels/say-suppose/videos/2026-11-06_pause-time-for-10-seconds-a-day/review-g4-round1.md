# Rough-cut review, round 1 (G4)

2026-11-07. The owner watched the rough cut (`renders/rough-cut.mp4`, 6:26) and the original 34 s sample. They said
the sample looks fine, the latest "feels slower", and they want the sample's voice. They asked for this review by
agent personalities, run in parallel, and said they will judge this time.

The five reviewers read a frame every 2 s of both cuts (`renders/review-pack/`), with timed transcripts. None of them
could hear the audio.

| Seat | Rough cut | Sample | In one line |
|---|---|---|---|
| First-time viewer (26, Mumbai) | 6 | 8 | "It keeps stopping to teach me things"; would leave at 2:03 (chronostasis); felt most at the dead snap on the stairs (3:47) |
| Retention editor | 6 | 8 | Structure works and the bus lands, but "two lectures too long"; would cut to about 4:30 to 4:45 |
| Animator and director | 6 | 8 | Acting and frozen scenes strong; the moody grades drift from the sample's bright look; the hallway repeats |
| Reference-channel fan | 6 | 7 | The look holds its own next to Ifverse; facts sit on the peaks (2:55, 5:50); the mother story beats them |
| Voice and pace director | 6.5 | 8 | The voice is not slower on the same words; the drag is long lines, long holds, and still pictures |
| **Average** | **6.1** | **7.8** | |

## What makes it feel slower (all five agree it is too slow)

Measured on the transcripts:
- The rough cut speaks at 144 words a minute; the sample at 165 (it was sped up 10%).
- Overall, with silences, the rough cut runs at 120 words a minute and the sample at 131.
- On shared lines the speed is the same: "You hit pause" takes 1.4 s against 1.3 s.
- What differs is the shape:
  - a new line every 5.4 s, against 2.5 s in the sample;
  - 26 s of holds of 2 s or more, where the sample has none;
  - three talky stretches over an unchanging picture.

## Where they agree

| Change | Reviewers | Proposals |
|---|---|---|
| Chronostasis, lines 20-24 (1:55-2:20) | 5 of 5 | Cut it, or keep one or two lines over a single big clock shot |
| Physics rules, lines 7-8 (0:40-1:06), in a dark void | 4 of 5 | Merge into one line under 6 s: "So we cheat. Anything you touch moves with you." |
| The 23 m stopping fact, line 36 (2:55), right after the save | 4 of 5 | Cut it, or move it before the rescue as stakes |
| The road-designers fact, line 65 (5:50), right before the twist | 3 of 5 | Cut it, or move it; one reviewer would put it at 2:31 |
| Bank and cricket, lines 52-55 (4:37-5:01), after the mother's fall | 3 of 5 | Cut 52-53 (two reviewers), or cut 52-55 (one) |
| Ageing said twice | 3 of 5 | Cut line 41, line 40, or lines 62-63 (one each) |
| Hold after line 48 (frozen city, then a line describing it) | 5 of 5 | 4 s down to 1.5-2.5 s |
| Hold after line 37 | 4 of 5 | 4 s down to 2-2.5 s |
| Hold after line 66 | 4 of 5 | 6 s down to 2-4 s |
| Hold after line 44 (the fall) | 4 of 5 | 8 s down to 3-5 s; one reviewer would keep 8 s |
| Narration speed | 5 of 5 | 1.05x to 1.1x; leave the countdown (lines 32-34) at real speed |
| Still or repeated frames | 3 of 5 | Cold open 0:00-0:07 (counter stuck on 7); 23 M wide 2:56-3:03; end card; the hallway's twelve frames of one door |

**Keep (all five):**
- the mother thread: the dead snap and fall at 3:43, "Bruised. You're not.", and "You stay on the bottom step";
- the real-time countdown at 2:36-2:49;
- the frozen crossing and the stranger's reveal.

**Split views:**
- **Line 69, "Somebody knows."** The first-time viewer would cut it. The voice director calls its whispered reading
  the climax.
- **The grade.** The animator wants the sample's flat daylight, with the grey freeze as the only colour change. The
  reference fan says the dusk and night light holds up next to Ifverse.

## Voice: the sample's route

The sample used the same narrator, Arthur, through `text2speech_v2` (ElevenLabs), sped up 10%. That model takes no
directions. The pipeline now drops them for that route (fcc23ba) instead of reading them aloud.

The voice director names what loses most without directions, in this order:
1. "Somebody knows." (whispered)
2. "You're not." (lower, slower)
3. The breathless countdown, lines 32-34
4. "It is not free."

Quotes from `higgsfield generate cost` (free, nothing generated):
- A five-line test, lines 1, 13, 32, 45 and 69: **1.20 credits**. These cover a long line, a number-dense line, the
  countdown, and the two directed peaks.
- All 71 lines: **18.00 credits**. Fewer if the cuts above go first.

## Smaller fixes

- **Faces too small** at 1:18 (house cutaway), 2:32, 3:22, 4:38-4:46 (lane) and 5:28 (clock posts).
- **Heads cut off** at 0:54, 1:10 and 2:02. The banister crosses the mother's face at 3:58.
- **Counter shown outside a pause** at 0:24 and 4:08; at 4:08 it sits on a pedestrian's head.
- **Source tags** are too small for a phone and get cut off at 5:50.
- **At "Somebody knows" (6:14)** your face reads as a grin. It should be shock.
- **The gaps** between lines are almost all exactly 0.4 s. The sample varies them from 0.1 to 0.6 s.

## For the owner to decide

Cutting or moving lines changes the G2-approved script, so each cut is the owner's call. Changing the voice reopens
G3. Nothing here has been applied.

## Applied (owner, 2026-11-07)

**Voice.** After the A/B/C test, the owner chose "C: v4 at 1.1x". The same Eleven v4 takes play at 1.1x. The
countdown stays at real speed.

**Script, v7.** The owner picked these from the list above ("These ones"). All were built from cached takes, at no
cost.

| Change | v6 lines | Result |
|---|---|---|
| Chronostasis shrinks | 20, 23 cut | 21, 22 and 24 stay |
| Physics: no-spend version of "merge 7-8" | 7 cut | 8 stays as recorded |
| 23 m stopping fact | 36 moves | Now right after "There's a kid in the road.", as stakes |
| Road-designers fact | 65 cut | |
| Bank | 52-53 cut | |

| Hold after | Before | After |
|---|---|---|
| The rescue | 4 s | 2.5 s |
| The stairs fall | 8 s | 4.5 s |
| The frozen city | 4 s | 2 s |
| "notice something" | 6 s | 3 s |

**Result.** 6:26 becomes 5:14, and the narration passes its claims and clicks checks. G2 and G3 are reopened for the
owner.

**Not taken this round:**
- the grade (the animator's flat-daylight view);
- cutting "Somebody knows";
- the smaller framing fixes. Only the Opening's cold-open motion and the Ending's "Somebody knows" face and end-card
  push are being done, alongside the restaging.
