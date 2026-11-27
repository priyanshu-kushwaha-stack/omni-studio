# Only 100: cold-open look tests (2026-11-27)

The first 17 s of the pilot (the shots and beats in `src/timing.ts`), built in three looks over narration track A (voice B, local):

| Composition | Look | Render (17 s) |
|---|---|---|
| `LookA` | flat 2D in SVG, film light, three crowd depth layers | 10 s |
| `LookB` | soft 3D in `@remotion/three` | 10 s |
| `LookC` | `LookA` characters over two painted FLUX plates (no people) | 12 s |

Review page: https://claude.ai/code/artifact/4e930eca-b351-4874-9316-12a595677f71 (the owner picks one look for the full 60 s).

`public/` is git-ignored. To render, put `narr_a.wav` (from `../audio/stitch.py`) and the plates in it, then run:

    pnpm install
    npx remotion render src/index.ts LookA out/lookA.mp4        # LookB also needs --gl=angle

Wrap the render with `studio.jobs run --step render_lookX --channel say-suppose --video pilot-only-100 --queue render -- ...`.

The plates come from local FLUX: `mflux-generate-flux2 --model flux2-klein-4b --steps 4 -q 8 --width 1280 --height 720`.
- `plate1.png`, seed 71: "Empty Tokyo train station concourse at morning rush light, wide eye-level view, a glowing amber departures board high on the back wall, yellow exit signs, green JR signage on pillars, polished floor with warm light pools and reflections, soft haze, painterly illustrated animation background, gouache texture, cinematic warm key light and cool shadows, no people, empty"
- `plate2.png`, seed 72: "Close view of an empty Tokyo station concourse background, a large glowing amber departures board and yellow exit sign on the wall, shallow depth of field, soft bokeh lights, painterly illustrated animation background, gouache texture, warm light, no people, empty"

Plate 1 shows JR logos. Paint them out (or drop "JR" from the prompt) before anything ships.

## Cut-out pass (`CutoutC`, 2026-11-27)

The owner's call: paint the set and character parts with Higgsfield, then animate them ourselves. GPT Image 2.6 (high, 2K,
16:9), 8 credits, owner-approved. Jobs: set wide `2ecb2081`, set close `dd9ba780`, Scarf parts `54b08435` (Scarf
reference media `fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b`), man parts `fc31b762`. `../cutout/slice.py <sheet> <out>
<prefix>` cuts a sheet into `public/cut/<prefix>_<n>.png`. Joints and timing are in `src/CutoutC.tsx`, and the rig is
in `src/Puppet.tsx`.

Refined (`CutoutC2`): both puppets come from one parts sheet (GPT Image job `603bfb4f`, 2 credits, with the Scarf reference and the
wide set as style references), so they share one style. Pieces go in `public/cut2/` under readable names, and the rig is in `src/Cast2.tsx`.

## The 60 s pilot (`Pilot60`, 2026-11-27)

Script A, voice B, 14 shots in `src/Pilot60.tsx` and building blocks in `src/FilmParts.tsx`. The generic cut-out person
is `src/Person.tsx`, and piece sizes are in `src/castData.ts`. The extra cast (Kenji and two commuters) is GPT Image
job `5e61bd0b` (2 credits), sliced into `public/cut3/`. Shot times follow whisper word times on `narr_a.wav`. The sound is
local: `../audio/pilot_mix.py <narr_a.wav> <raw.wav>`, then `ffmpeg -af loudnorm=I=-16:TP=-1.5:LRA=11` writes
`public/pilot_mix.wav`. Rendering takes 43 s on the Mac with `--queue render`.
