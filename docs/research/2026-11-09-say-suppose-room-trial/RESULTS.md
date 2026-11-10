# Room trial results (owner's marks, 2026-11-09)

Read back from the review page's store (`review/marks`, version 12). One script and one owner pass, so these are
signals for the next films, not settled numbers.

## Writer bake-off

The owner picked **Script B, Claude Fable 5.1**, reading blind (key: `out/writers/KEY-open-after-reading.json`,
A = Opus 5.5, B = Fable 5.1). No note given. Fable's file is about twice as long (3,637 words against 1,802,
including its notes), so its next script needs the 8-minute length check.

## Blockers

| Room | Seat | Model | Raised | Agreed | Unsure | Disagreed | Seconds |
|---|---|---|---|---|---|---|---|
| current | first-time viewer | Grok 4.7 | 3 | 2 (L119, L120) | 1 (L17) | 0 | 675 |
| current | retention editor | GPT-5.6 Sol | 1 | 1 (L119) | 0 | 0 | 193 |
| current | voice director | Claude Sonnet 5.5 | 1 | 0 | 0 | 1 (L119) | 30 |
| current | animator | Claude Sonnet 5.5 | 0 | 0 | 0 | 0 | 30 |
| both | fact-checker | Gemini 3.7 Flash | 0 | 0 | 0 | 0 | 136 |
| persona | first-time viewer | Gemini 3.7 Flash | 0 | 0 | 0 | 0 | 159 |
| persona | story editor | GPT-5.6 Sol | 2 | 2 (L96, L120) | 0 | 0 | 160 |
| persona | director | Claude Fable 5.1 | 3 | 2 (L17, L31) | 1 (L111) | 0 | 173 |
| persona | voice actor | Claude Sonnet 5.5 | 1 | 0 | 1 (L119) | 0 | 24 |

| | Current room | Persona room |
|---|---|---|
| Blockers agreed | 3 of 5 | 4 of 6 |
| Distinct script lines agreed | 2 (119, 120) | 4 (17, 31, 96, 120) |
| Round time (slowest seat) | 675 s | 173 s |

Every line the owner agreed on: 17, 31, 96, 119, 120. The persona room missed only 119 (its voice actor flagged it;
marked unsure). The current room missed 17 (Grok flagged it; marked unsure), 31 and 96.

## What the marks say

- **GPT-5.6 on the story seat** is the most reliable seat: 3 of 3 agreed across both briefs.
- **The Fable director** found the two agreed issues nobody else raised: the first seven seconds (story #2) and the
  0:30 hook (story #3).
- **The viewer seat:** Grok's blockers were real (2 of 3) but it took 11 minutes; Gemini raised nothing. Neither is
  clearly the right viewer yet.
- **Voice seats on Sonnet:** 0 of 2 agreed. On line 119 the owner agreed with Grok's and GPT's fixes and disagreed
  with the voice director's, so the fix's wording matters as much as the diagnosis.
- **Fact-checker and animator:** no blockers again (claims are already checked by `omni qc`; there are no scenes yet).
