# cast-lineup
Model: Higgsfield gpt_image_2_6, quality high, resolution 2k, aspect 16:9 (paid, 2 credits, owner OK first);
references: colour Scarf (design sheet job 658b292d-2448-44a9-a3d9-6ab874837336, variation 2, and its parts sheet
job f56184eb-a23c-483f-a87d-ab566dda3fa2) and lineup A job ca00753c-98fa-4cd5-8a16-68d4257a0236
Used by: core/openmontage/skills/studio/studio-suppose-edit.md (a new cast member, before its parts sheet)
Source: pilot jobs ca00753c (lineup A) and 658b292d (tall Scarf design sheet), read back from Higgsfield on
2026-11-27; spec W6, W8. The brief named Scarf media fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b, but that upload is the
round black-headed Scarf from before pilot v4; the approved Scarf is the tall colour one above, so attach those.

## Inputs
- {{role}}: the role and person, in full (best friend, scientist, skeptic, authority, kid, antagonist), with age,
  body, skin tone and clothes (for example "the hero's best friend, a cheerful young man in his twenties, warm brown
  skin, blue jeans and white sneakers")
- {{signature}}: one signature item and its colour, not bright green (Scarf's) and not another cast member's colour
  (for example "a bright orange hoodie")
- {{headwear}}: the headwear or hair that sets the silhouette apart (for example "a backwards yellow cap")

## Prompt
Character lineup sheet for a 2D cut-out animated short. Match the soft painted storybook style of the reference
lineup exactly (rounded shapes, gentle shading, clean outlines, warm light). Plain white background, no scenery.
Draw, left to right, evenly spaced, full body, front three-quarter view, arms hanging slightly away from the body,
legs slightly apart, nothing overlapping:
first, for scale, the main character from the first reference: a TALL, lean young man, about 1 to 6 head-to-body,
long legs, narrow shoulders, slightly slouched shy posture, natural warm skin tone, messy black hair, big gentle
eyes, a long dark charcoal coat, dark trousers, grey-white sneakers and a long bright green knitted scarf;
then the new character: {{role}}, wearing {{signature}} as the one signature item, with {{headwear}}. An adult
stands about 0.88 of the main character's height; a child stands 0.72 of an adult's height. Simple expressive face
with dot eyes and small eyebrows, a silhouette and hairstyle clearly different from the main character's.

<!-- style-a-footer -->
Style A footer: soft painted storybook 2D illustration in the style of a premium YouTube animation, matching the
reference images exactly: rounded chunky shapes, clean outlines, gentle shading with soft painterly gradients, subtle
paper grain, warm key light with cool violet shadows, a warm rim light on the edges that face the light. No
photorealism, no 3D render. No text, no letters, no numbers, no labels, no logos, no watermark anywhere.
<!-- /style-a-footer -->

## Checklist
- Before answering, the model checks: two figures only, the main character unchanged, the new character at the
  stated scale, one signature colour, nothing overlapping. It fixes any miss.
- The new character has one signature colour, never Scarf's green and never another cast member's.
- The silhouette differs from the existing cast at small size (W6): check the lineup scaled to 170 px wide.
- Next: parts-sheet.md with this lineup as its reference.
