# parts-sheet
Model: Higgsfield gpt_image_2_6, quality high, resolution 2k, aspect 16:9 (paid, 2 credits a sheet, owner OK first);
reference: the character's lineup image ({{reference}})
Used by: core/openmontage/skills/studio/studio-suppose-edit.md (new cast member, after cast-lineup.md)
Source: pilot jobs f56184eb (colour Scarf), aae0e723, f24defdd, fcedb67b, 1ffdcdc8 (the v4 cast), read back from
Higgsfield on 2026-11-27; spec "Prompts and skills", W6, W8

## Inputs
- {{character}}: the full description: role, age, body (tall and lean, small and round...), skin tone, hair or
  headwear, clothes top to bottom, shoes, and the one signature item and its colour (for colour Scarf: "the tall
  young man, natural warm skin tone, messy black hair, a long dark charcoal coat, dark trousers, grey-white sneakers
  and a bright green knitted scarf")
- {{reference}}: the attached lineup or design sheet job id and which figure in it is this character (for example
  "lineup job ca00753c, figure 2, the office woman")
- {{props}}: props the character holds, each drawn as one more separate piece (for example "a smartphone"), or "none"

## Prompt
Cut-out puppet parts sheet in the exact soft painted storybook style of the reference, plain pure white background.
One character only: {{character}}, exactly as in the reference ({{reference}}), in full warm colour.
Lay the body out as separate pieces in one row with generous white space between every piece so no piece touches
another, front view, same scale as the full figure: 1 head with hair (or headwear) and neck stub, face skin left
blank with NO eyes, NO eyebrows, NO mouth and NO nose; 2 torso from shoulders to hips, a scarf, collar or coat skirt
belongs to the torso; 3 left upper arm (sleeve); 4 left forearm with sleeve cuff and bare hand; 5 right upper arm;
6 right forearm with hand; 7 left thigh; 8 left shin with shoe; 9 right thigh; 10 right shin with shoe. Props drawn
as their own separate pieces after the body: {{props}}.
Limbs straight and vertical, rounded joint ends that would overlap neatly. Solid opaque colours, no transparency
fades. Nothing else on the sheet: no labels, no text, no numbers, no shadows on the ground.

<!-- style-a-footer -->
Style A footer: soft painted storybook 2D illustration in the style of a premium YouTube animation, matching the
reference images exactly: rounded chunky shapes, clean outlines, gentle shading with soft painterly gradients, subtle
paper grain, warm key light with cool violet shadows, a warm rim light on the edges that face the light. No
photorealism, no 3D render. No text, no letters, no numbers, no labels, no logos, no watermark anywhere.
<!-- /style-a-footer -->

## Checklist
- Before answering, the model checks: ten separate body pieces plus one per prop, none touching; a blank face; front
  view; plain white background. It fixes any miss.
- `slice.py` finds 10 blobs plus one per prop; if a piece is split or two pieces merge, regenerate after an OK.
- A leg drawn as three pieces is mapped with `top`/`flip` in the rig map.
- The character is re-described in full every time (W8), never "the same man as before".
