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
