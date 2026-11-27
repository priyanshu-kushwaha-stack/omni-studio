# character-voice
Model: local Qwen3 VoiceDesign (core/lock.yaml local_voices qwen3-design), free
Used by: core/openmontage/skills/studio/studio-suppose-edit.md (a new cast member's voice, Decision 8)
Source: channels/say-suppose/voices.yaml (the what-if engine's character descriptions and the seed-sweep rule,
2026-11-12); spec Decision 8

## Inputs
- {{age_and_gender}}: the voice type first, then the person: gender, register (alto, mezzo, tenor-baritone,
  baritone or bass) and age (for example "relaxed male baritone: a man of about thirty")
- {{character}}: who they are to the hero (for example "the hero's best friend since school")
- {{manner}}: texture and manner, two to four words or phrases (for example "warm and a little husky, quick and
  playful, easy laughter under the words")

## Prompt
A {{age_and_gender}}, {{character}}. {{manner}}, clear diction, natural pace, casual modern English.

## Checklist
- The description opens with gender and a voice type (alto, mezzo, baritone, bass); without one the model drifts
  between takes.
- Every voice stays apart from the narrator's (Luc) and from the rest of the cast.
- Picked by ear once from three seeds; the chosen seed and description go into `library/cast/cast.json` under the
  character's `voice`.
