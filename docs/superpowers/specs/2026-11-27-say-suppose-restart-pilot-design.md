# Say Suppose restart: the pilot POC

Owner approved 2026-11-27. Replaces nothing yet: the v1 Say Suppose specs stay archived, and no pipeline, template,
gate change or cadence is designed until a pilot clears the bar below.

## Why

On 2026-11-26 the owner restarted Say Suppose: the four public videos got 2–83 views, and the owner rates the channel at
30–40% of the benchmark's quality and 5% of its thumbnails. A teardown of 10 breakout channels (14 films, 61
thumbnails) produced nine learnings, agreed one by one with the owner:
`docs/research/2026-11-27-say-suppose-learnings.md`. Teardown page:
https://claude.ai/code/artifact/a152c9a7-08cd-4a53-b89b-b87d24fb62f7

## Decisions already made

- AI images are allowed, for thumbnails and in the film (owner, 2026-11-26: "throw all rules to the bin like NO AI
  Images"). Craft rules are open again; the safety rules in CLAUDE.md still bind.
- The nine learnings (L1–L9) are the brief for every POC.
- The bar: in a side-by-side, the owner can't tell our thumbnail and 60 s from the benchmark's.

## The POC, in order

1. **Premise (L1).** Run the topic room (`say-suppose-topics`) with L1 as hard constraints: "What if you…", a number or
   status payoff, a 37–49 character title, the click test against the 10-channel set. The owner picks one premise.
2. **60 s script (L3, L4).** The film's first minute: the cold open with one absurd detail, the "So what if…" title by
   about 0:50, the start of "how it works". Second-person narrator with one or two short character lines, plus a
   first-person version of the same minute (the L3 variant). The owner reads it before anything is drawn.
3. **The "you" character (L7).** Three candidates, each with an expression sheet (neutral, smug, shocked, worried), shown
   at feed size beside the 10 channels' mascots. No yellow, red or blue hoodie. The owner picks one; all looks use it.
4. **Thumbnail (L2, L5).** Three variants: art from local FLUX.2 klein 4B, type set in code in one channel typeface.
   Shown in a mock YouTube home feed at phone size, mixed with real Awaken, YOUniverse, Ifverse and ConChaser
   thumbnails.
5. **Narration (L3).** One track in voice B (free, local), performed as a storyteller, used under all three looks.
   15 s benchmark narration clips sit beside it on the review page. Luc (paid) only when the owner asks, cost stated
   first.
6. **The same 60 s in three looks (L6, L8).** Same audio, beats and on-screen number (L5):
   - (a) flat 2D with cinematic light: Remotion 4.0.484, new code, not the v1 set library;
   - (b) soft simple 3D: three.js in Remotion (`@remotion/three`, pinned in `core/lock.yaml` before use);
   - (c) an AI-painted world: FLUX background plates layered for depth, the code-animated character acting in them.
   Each render goes through `studio.jobs run --queue render`, one at a time.
7. **Review page.** The three films, the thumbnail feed mock, the character sheet, the voice clips, benchmark frames
   at the same timestamps, and per look the measured render minutes per film minute and the longest static stretch
   (L8). The owner picks a look or asks for another round.

Owner checkpoints: after 1 (premise), 2 (script), 3 (character), and 7. Steps 3 and 4 may run while the owner reads
the script.

## Where things live

- POC code: `channels/say-suppose/pilot/`. Rendered media, FLUX outputs and downloaded reference films stay out of git.
- Studio and engine code is not changed. Anything the POC needs from them is recorded with `omni fix`.

## Out of scope

Pipelines, templates, gates, cadence, Shorts and dubbing; uploads of any kind; paid provider calls without the
owner's OK; `omni approve`. The four public videos stay as they are until the owner decides (open decision 3 in the
handover).
