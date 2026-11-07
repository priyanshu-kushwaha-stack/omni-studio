# Say Suppose brand kit

These are the channel's opening idents and subscribe nudges, drawn in code. Each video imports them from its
`scenes/`, for example `import { IdentC } from "../../../brand/IdentC"`. The palette and the ringed-Earth mark come
from the channel art in `../page/avatar.png` and `banner.png`.

Every video opens with its hook, followed by one ident in the gap before the story's first line. The owner asked for
this on 2026-11-07, after studying fern ("The Death of Educational Content") and Modern Ideas ("The Power of
Delusional Self Belief"): a hooking opening, then subtle branding, never "welcome to my channel".

## Idents (each 3 to 4 s)

| File | Option | Status |
|---|---|---|
| `IdentC.tsx` | **C, title card.** The hook's frozen frame shrinks into a paper print. "Say Suppose" and the mark sit above it, the episode's question in Rubik below. The card flips over onto the story's first frame. | **Used in the pause-time video** (owner, 2026-11-07). |
| `IdentA.tsx` | **A, ringed Earth.** The channel art in motion. A ring sweeps round a paper Earth, the wordmark stamps in with "Change one thing. See what follows.", then the camera dives into the planet onto the first scene. | Kept for later videos at the owner's request. Works for any topic. |
| `IdentB.tsx` | **B, split-flap board.** The countdown's flip tiles clatter onto SAY SUPPOSE, then the episode's what-if. | Kept for later videos. The owner liked the idea but found **the sound too much at the start**: quieten the flap clatter before using it. |

`IdentC` takes the scenes for its two faces as props. In the film they are `<Freeze>` renders of the film itself.
Frozen beats add no audio: a with-and-without render of the card window measured -91 dB difference.

`IdentA` and `IdentB` were mocked with still frames (`staticFile("frames/...")`). Give them the same scene props as
`IdentC` before using them in a video.

## Subscribe nudges (no voice)

| Part | What | Where in the pause-time video |
|---|---|---|
| `SubscribeTag` (S1) | A small paper tag on a string, top left, reading "Subscribe · a new what-if every day". It hangs about 3 s and peels away. | On your trembling hands after the rescue (cue `hands`), drawn by `scenes/Film.tsx`. |
| `Poster` (S2) | The channel's ad: indigo, the mark, "a new what-if every day", and a SUBSCRIBE pill. | On a bus shelter in the bus-stop scene, `scenes/beats/Catch.Bus.tsx`. |
| End-card tags | "Like it?", "Subscribe" and "Comment your ten seconds", stamping in 0.6 s apart. "Comment" lands on "Tell us below". | `scenes/beats/Ending.EndTags.tsx`. |

Rules for all of them:
- Keep them off faces.
- Keep the lower-right corner clear, and the right third clear during the last 20 s (end screens go there).
- One quiet pop at most.

## Music: the channel themes (one-time, reused by every video)

The owner's plan, 2026-11-07: buy the channel's sound once on ElevenLabs. Play it under the ident and the end card in
every video, and feed it to the local model (ACE-Step 1.5, `reference_audio`) so each video's own cues are free and
sound like one channel.

| Theme | Brief | Versions (Higgsfield job ids) |
|---|---|---|
| Light | The Say Suppose theme: whimsical, curious, paper-cut; pizzicato, celesta, felt piano, clarinet, a ticking-clock motif; 100 BPM, C major; opens with a four-note motif that works as a sting | `e7d9677a-021c-43c7-bd66-e4727febf4c6`, `eeb7c65b-3125-40d9-a41c-db2be369c4b7` |
| Dark | When the story turns: the motif in a minor key; felt piano, high strings, a music box, a low drone; 70 BPM, A minor; bittersweet, not horror | `df65322c-5479-4c7b-bf5c-8a4e931bc2f2`, `9e896e4a-7692-4189-8004-2af08a61389c` |

- **Cost.** ElevenLabs Music v2.5, instrumental, 60 s each: 34.88 credits in all.
- **Files.** Saved in `../page/candidates/theme/` (git-ignored, because media stays out of git). Any job can be
  fetched again with `higgsfield generate get <id> --json`.
- **The owner's picks (2026-11-07).** Light: the first version (`e7d9677a`). Dark: the first version (`df65322c`).
  Kept as `brand/music/theme-light.mp3` and `theme-dark.mp3`; that folder is git-ignored apart from its `.gitignore`.
  Re-fetch them by job id on a fresh checkout.
- **CLI gotcha.** `batch_size 2` makes two jobs, but the CLI's `create` prints only the first id. Find the second
  with `higgsfield generate list`.
