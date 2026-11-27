# Pilot thumbnails (L2)

Art: local FLUX.2 klein 4B (`.venv-media/bin/mflux-generate-flux2 --model flux2-klein-4b --steps 4 -q 8`, 1280x720),
with Scarf rendered from `../characters/characters.js` as the `--image` reference. Seed 42 for all three; seed 21 broke
into white collages. About 35 s a frame on the Mac, run through `studio.jobs run --step flux_thumb`. The PNGs are
git-ignored media and live outside the repo.

Type: `compose.html#v1|v2|v3` puts the caption and the readout over `v<n>_s42.png` in Rubik Black, rendered to
1280x720 with headless Chrome.

Shared prompt parts:
- character: "a cute minimal cartoon character with a perfectly round glossy solid black head, two big round white eyes
  with small black pupils, absolutely no mouth and no nose, wearing a charcoal grey coat and a long bright green scarf"
- style: "Glossy stylized 3D cartoon render, YouTube thumbnail art, saturated colors, cinematic rim light, deep bokeh,
  high contrast"

| Variant | Scene | Caption |
|---|---|---|
| v1 | Frozen in a rush-hour Tokyo station at dusk, commuters streaming past, one young woman in a red coat staring at him | WHO'S #100? + 99/100 over his head |
| v2 | Nose to nose with a businessman eating an onigiri who looks past him at the departures board | HE CAN'T SEE ME. |
| v3 | Worried, holding up a phone with a glowing numbered list | CUT GRANDMA? + 100/100 |

## Round 2 (2026-11-27, owner-approved paid round)

Owner on round 1: v2 gave "you" three eyes, and none of the three was intriguing. Local FLUX also couldn't handle
more than one character: it put Scarf's head and scarf on grandma and the girl.

Round 2 builds each thumbnail on a contradiction you read at a glance. Art: Higgsfield GPT Image 2.6 (`gpt_image_2_6`,
quality high, 2K, 16:9), Scarf uploaded as `image_references` (media `fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b`). 6 drafts,
2 credits each, 12 credits in all, approved by the owner. Every prompt says "Use the character from the reference image
exactly … for ONE character only", "NO mouth, NO nose" and "No text, no letters anywhere"; our type goes on in
`compose-round2.html#g1|g3|g4`.

| Job | Concept | Caption |
|---|---|---|
| g0 `2f926d04` | Grey ghost crowd, you in colour under a spotlight, three coloured people staring | (not used) |
| g1 `21298d64` | High angle: an empty circle around you in a grey ghost crowd, one girl in red at its edge | WHY HER? + 99/100 |
| g2 `c7be13f7` | Grandma beams at the family, looking through you at dinner | (not used) |
| g3 `d8695194` | Grandma puzzled at a family photo with a gap where you were; you crying behind her | SHE FORGOT ME. |
| g4 `0daf8b02` | Rainy platform: the girl in red about to swipe your photo off her phone list | I'M #100?! |
| g5 `4f43c811` | The girl smirks at you holding a notebook with your face; you point at yourself | (not used) |
