# thumbnail
Model: Higgsfield gpt_image_2_6, quality high, 2k, 16:9 (paid, 2 credits an image, owner OK first); Scarf reference:
Reference 1 = the colour Scarf design sheet job 658b292d-2448-44a9-a3d9-6ab874837336 (variation 2 only)
Used by: .claude/skills/say-suppose-thumbnails
Source: pilot thumbnail round 2 (jobs 21298d64, d8695194, 0daf8b02, read back from Higgsfield on 2026-11-27) and
pilot/only-100/thumbs/README.md; spec L2, L5, Decision 5. Kept from round 2: "Use the character from the reference
image exactly for ONE character only", the contradiction read at a glance, the empty caption area and "no text".
Changed: round 2 asked for a "glossy stylized 3D cartoon render" of the round-headed Scarf (media
fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b); the film kit paints thumbnails in style A with the tall colour Scarf, so the
thumbnail matches the film. Reference ids: only 658b292d. The parts sheet f56184eb is not used: it is disassembled
pieces, so it would pull the thumbnail toward cut-out parts. The pilot has no approved single-figure full-colour
Scarf image (lineup ca00753c predates the tall Scarf), so the design sheet plus the explicit "second variation, full
colour" instruction is the reference.

## Inputs
- {{premise}}: the scene that shows the premise as one contradiction read at a glance: where it is, who else is
  there (each re-described in full, with NO green scarf) and what they do
- {{prop}}: the one premise prop, large and lit (for example "a glowing smartphone with a list of profile photos")
- {{readout}}: where the premise readout hangs as a glowing blank in-world label (for example "a small glowing blank
  tag floating above his head"), or "none"; the number itself is set in code
- {{emotion}}: Scarf's expression (for example "shocked, eyes wide, brows up, mouth open")
- {{caption_side}}: where the empty caption area goes (left, right or top)

## Prompt
Premium YouTube thumbnail art. Reference 1 is a character design sheet with several figures: use the character
from Reference 1 exactly, the tall young man, the SECOND variation only, in FULL warm colour (not faded, not grey),
for ONE character only, and ignore the other variations and figures on it: a tall,
lean young man with natural warm skin tone, messy black hair, big round eyes with whites and pupils, thick brows, a
long dark charcoal coat, dark trousers, grey-white sneakers and a long bright green knitted scarf. His face is large
and readable at small size: {{emotion}}.
{{premise}}. The one premise prop: {{prop}}. If a readout is given ({{readout}}), paint it as a blank glowing in-world label with no text on it; if it is
"none", paint no label at all.
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
- The on-image text is at most three words or one number, set in code, never painted.
