# Viewer seat trial: results

Run on 10 Nov 2026. The first-time viewer brief was run on three scripts by four models, 12 calls in all, with no failures.
The owner marked all 22 blockers blind (`review/viewer-marks` on the trial page) before the key was opened.

## Marks per card

| Viewer | Model | Blockers raised | Agreed | Unsure | Disagreed | Median time | Slowest |
|---|---|---|---|---|---|---|---|
| 1 | grok-4.7-high-fast | 8 | 2 | 5 | 1 | 7.5 min | 8.5 min |
| 2 | grok-4.7-high (today's seat) | 9 | 3 | 6 | 0 | 9.9 min | 15.7 min |
| 3 | kimi-k3-high | 2 | 1 | 1 | 0 | 1.3 min | 1.4 min |
| 4 | gpt-5.6-luna-high | 3 | 2 | 1 | 0 | 1.5 min | 1.5 min |

## Each problem counted once (`issues.json`)

Several viewers often flagged the same problem, and the owner sometimes marked the same note differently on two cards.
Here a problem counts as agreed if the owner agreed with any card that raised it. The owner agreed with 5 distinct problems:

| Problem | Fast | Grok | Kimi | Luna |
|---|---|---|---|---|
| Film 2, line 17: the opening doesn't show the thumbnail | ✓ | ✓ | ✓ | ✓ |
| Film 2, line 31: the second hook lands after 0:30 | | ✓ | | |
| Film 2, line 114: the line repeats what the shot shows | ✓ | | | |
| Film 2, line 120: the examples are outside the viewer's week | ✓ | ✓ | | |
| Fable's Film 2, line 46: the examples are outside the viewer's week | ✓ | | | ✓ |
| **Found, of 5** | **4** | **3** | **1** | **2** |

Three problems stayed unsure, all of them on Fable's script or Film 1:
- The second hook is late. All four viewers raised it; the owner disagreed once and was unsure three times.
- The window lines repeat the shots. Seven cards from the two Grok models raised it.
- Film 1's neighbour examples.

## Reading

- The two fast models are about 6x quicker but find fewer than half the agreed problems. Each one also missed a problem that only one model found.
- grok-4.7-high-fast found the most agreed problems (4 of 5) and is about a quarter faster than grok-4.7-high. Its slowest call was 8.5 min, against 15.7 min. It drew the trial's only disagreement.
- Pipeline v2 (PR #28) took the viewer off the critical path (`viewer_required: false`), so the viewer's speed no longer holds up a round.
  What counts now is what it finds.
- The sample is small: 3 scripts, 5 agreed problems, 13 cards left unsure.
  The reviewer scores from PR #28 will keep judging the seat on real films.
