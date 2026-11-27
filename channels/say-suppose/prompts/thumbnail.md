# thumbnail
Model: Higgsfield gpt_image_2_6, quality high, 2k, 16:9 (paid, 2 credits an image, owner OK first); Scarf reference:
colour Scarf design sheet job 658b292d-2448-44a9-a3d9-6ab874837336 (variation 2) and parts sheet job
f56184eb-a23c-483f-a87d-ab566dda3fa2
Used by: .claude/skills/say-suppose-thumbnails
Source: pilot thumbnail round 2 (jobs 21298d64, d8695194, 0daf8b02, read back from Higgsfield on 2026-11-27) and
pilot/only-100/thumbs/README.md; spec L2, L5, Decision 5. Kept from round 2: "Use the character from the reference
image exactly for ONE character only", the contradiction read at a glance, the empty caption area and "no text".
Changed: round 2 asked for a "glossy stylized 3D cartoon render" of the round-headed Scarf (media
fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b); the film kit paints thumbnails in style A with the tall colour Scarf, so the
thumbnail matches the film.

## Inputs
- {{premise}}: the scene that shows the premise as one contradiction read at a glance: where it is, who else is
  there (each re-described in full, with NO green scarf) and what they do
- {{prop}}: the one premise prop, large and lit (for example "a glowing smartphone with a list of profile photos")
- {{readout}}: where the premise readout hangs as a glowing blank in-world label (for example "a small glowing blank
  tag floating above his head"), or "none"; the number itself is set in code
- {{emotion}}: Scarf's expression (for example "shocked, eyes wide, brows up, mouth open")
- {{caption_side}}: where the empty caption area goes (left, right or top)

## Prompt
Premium YouTube thumbnail art. Use the character from the reference image exactly for ONE character only: a tall,
lean young man with natural warm skin tone, messy black hair, big round eyes with whites and pupils, thick brows, a
long dark charcoal coat, dark trousers, grey-white sneakers and a long bright green knitted scarf. His face is large
and readable at small size: {{emotion}}.
{{premise}}. The one premise prop: {{prop}}. Readout: {{readout}}, left blank.
One face readable at feed size, one premise prop, nothing else competing. A lit ground with depth under the figures,
soft bokeh behind them, a strong rim light on the character, high contrast. Empty area on the {{caption_side}} for a
caption. No caption text: the caption is set in code.

<!-- style-a-footer -->
Style A footer: soft painted storybook 2D illustration in the style of a premium YouTube animation, matching the
reference images exactly: rounded chunky shapes, clean outlines, gentle shading with soft painterly gradients, subtle
paper grain, warm key light with cool violet shadows, a warm rim light on the edges that face the light. No
photorealism, no 3D render. No text, no letters, no numbers, no labels, no logos, no watermark anywhere.
<!-- /style-a-footer -->

## Checklist
- Before answering, the model checks: one Scarf only, with the green scarf, and nobody else wearing green; his face
  is large and readable; one prop; a lit ground with depth; the caption area is empty; no text, letters or numbers.
  It fixes any miss.
- The agent checks the image at about 170 px wide: the face and the prop still read.
- Captions and the readout number are set in code with the kit's `Thumb` composition, never painted.
