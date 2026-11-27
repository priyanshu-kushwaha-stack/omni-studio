# set-plate
Model: Higgsfield gpt_image_2_6, quality high, resolution 2k, aspect 16:9 (paid, 2 credits a plate, owner OK first);
reference: the station wide plate job 2ecb2081-44cd-4d71-bf7f-5ef855371405 as style reference
Used by: core/openmontage/skills/studio/studio-suppose-edit.md (sets for a film, one plate per angle)
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
