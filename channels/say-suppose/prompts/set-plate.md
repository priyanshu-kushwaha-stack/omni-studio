# set-plate
Model: Higgsfield gpt_image_2_6, quality high, resolution 2k, aspect 16:9 (paid, 2 credits a plate, owner OK first);
reference: the station wide plate job 2ecb2081-44cd-4d71-bf7f-5ef855371405 as style reference
Used by: core/openmontage/skills/studio/studio-suppose-proposal.md step 4 (quoted in art.yaml) and
studio-suppose-script.md step 5 (sets for a film, one plate per angle)
Source: pilot jobs 2ecb2081 (wide), dd9ba780 (close) and f256053f (the v3 high plate, made with 2ecb2081 as its
reference), read back from Higgsfield on 2026-11-27; spec "Prompts and skills" and W7, W8

## Inputs
- {{place}}: the place in concrete detail: what it is, the time of day, the big shapes on the back wall, the
  furniture, the floor (for the pilot: "an empty Tokyo train station concourse at morning: a large glowing amber
  departures board with abstract unreadable glyph rows, a plain yellow exit sign with an arrow icon, square tiled
  pillars, warm ceiling light strips, a wide polished floor with warm light pools")
- {{angle}}: wide eye-level (straight-on, the floor in the lower 40% of the frame), close (one wall feature fills the
  upper middle, the floor line at about 75% of the frame height), or high (the camera about 45 degrees above,
  looking down at a floor that fills most of the frame)
- {{light}}: the one key light, what it is and where it comes from (for the pilot: the glowing departures board
  and the ceiling strips, warm from above and behind)
- {{stage_area}}: where the characters will stand (for example "the centre of the floor in front of the board")

## Prompt
Background plate for a 2D animated film, in exactly the same painted style, palette and light as the reference
station image. Take only the painting style, palette and light from the reference, never its place, objects or
layout. {{place}}. Camera: {{angle}}.
An empty painted set: absolutely no people, no characters, no text, no letters, no logos and no signage lettering
anywhere; signs and boards carry only abstract unreadable glyphs or icons.
Light: one strong light source that is visible in frame, {{light}}, with its glow and its spill across the walls and
the floor, gentle haze in the air.
Values: 60–75% of the frame in dark mid-tones, with only one to three bright accents. The brightest area sits
directly behind {{stage_area}}, so dark figures standing there read clearly, and that area is open and uncluttered
with lots of floor so small characters can stand and walk on it.
Depth: clear layers from the far background through the middle ground to a near floor at the bottom of the frame.
Walls, floor, ceiling and sky continue past the frame edge on every side, with no border, vignette or frame, so a
camera push or drift never shows an edge.

<!-- style-a-footer -->
Style A footer: soft painted storybook 2D illustration in the style of a premium YouTube animation, matching the
reference images exactly: rounded chunky shapes, clean outlines, gentle shading with soft painterly gradients, subtle
paper grain, warm key light with cool violet shadows, a warm rim light on the edges that face the light. No
photorealism, no 3D render. No text, no letters, no numbers, no labels, no logos, no watermark anywhere.
<!-- /style-a-footer -->

## Checklist
- Before answering, the model checks: no people, no text, no logos; the light source is in frame; 60–75% dark
  mid-tones; the bright area is behind the stage area; the edges continue past the frame. It fixes any miss.
- After generating, the agent looks at the plate: no people, text or logos (paint out or regenerate after an OK);
  the light source is in frame; a stage area is clear.
- After slicing, the agent measures `set.json` (floor line, horizon, key-light direction for `Rim`).
- One plate per angle; the wide plate of a new place is attached as the style reference for its close and high plates.

## set.json field guide
After the plates are made, measure `<video>/art/sets/<set>/set.json` by hand on the 1280x720 frame (the plate is drawn
60 px wider each side and 40 px taller, so measure on the plate scaled to that). The library's `station` set is the
model. Per angle, under `angles.<angle>`:

- `plate`: `sets/<set>/<angle>.png` (library-relative; the video's art resolves there until G3).
- `scarf: {x, y, s}`: Scarf's mark, feet at `(x, y)` in frame pixels, and his scale `s` there (the pilot's station:
  wide 0.2, high 0.133, close 0.28). Everyone else is sized to match him at their depth.
- `h`: how height falls off with depth. `{horizon, at}`: the horizon's y (may be negative on a high angle, off the
  top of the frame) and the y where a person is Scarf's height (usually `scarf.y`); a figure's height scales with
  `(y - horizon) / (at - horizon)`. `{fixed: k}` for a flat close plate with no depth: everyone is `k` of a peer at
  Scarf's scale.
- `crowd: {<band>: [y0, y1]}`: the floor strips crowds walk in, by name (`back`, `front`; `front` draws over the
  cast). A sheet's `crowd[].band` must be one of these names.
- `clear: [x0, x1, y0?, y1?]`: the box kept empty of back-band walkers around the subject (x only, or x and y).
- `bounds: {zmax}`: the furthest the camera may zoom before the plate's painted edge shows; sheetcheck fails a
  `camera.z` past it.
- `key: {side, color}`: the key light's side (`left`, `right`, `top`) and colour, for `rim: true`.
- `parallax`: how far the plate layer moves against the people, default 0.6; 1 for a top-down plate the crowd walks on.

At the set's top level: `id`, `place` (one line) and `ambience` (`murmur` for a crowd bed, or leave it out).
