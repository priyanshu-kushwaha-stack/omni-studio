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
