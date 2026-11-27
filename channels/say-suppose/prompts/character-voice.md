# character-voice
Model: local Qwen3 VoiceDesign (core/lock.yaml local_voices qwen3-design), free
Used by: core/openmontage/skills/studio/studio-suppose-script.md step 4 (a speaking character with no voice yet,
Decision 8)
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
- Picked by ear once from three seeds; never a paid voice.

## Where the answer goes
The filled prompt is the voice's `desc`. Keys, per character id:

```yaml
# <video>/voices.yaml (committed with the film; wins over the library)
<id>: {desc: "<the filled prompt>", seed: <int>}
```

1. Write `<id>: {desc: "..."}` (no seed yet) into `<video>/voices.yaml`.
2. Three seeds, free and local (`local_tts.py`'s `qwen3-design`, the voice drawn from `desc` and the seed):
   `PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/voices.py --sweep <video> <id>`
   writes `<video>/audio/sweep/<id>_seed11.wav`, `_seed23.wav` and `_seed37.wav` from the character's first
   cast-pass line (other seeds: list them after `<id>`).
3. Listen to the three; write the chosen number as `seed:` in `voices.yaml`.

At G3 (`studio-suppose-final-watch` step 0) `voices.py --to-maps` moves each entry into the character's map
(`library/cast/maps/<id>.yaml`, `voice: {desc, seed}`), the durable home: `rig.py` carries it into `cast.json`. Never
edit `cast.json` by hand; `rig.py` rebuilds it from the maps.
