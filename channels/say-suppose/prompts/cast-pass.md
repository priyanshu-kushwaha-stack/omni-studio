# cast-pass
Model: Claude (this session, no extra cost)
Used by: core/openmontage/skills/studio/studio-suppose-script.md
Source: spec Decision 8 and the claims ledger

## Inputs
- {{script}}: the paragraph after `SCRIPT:`
- {{characters}}: the CHARACTERS block from the G1 outline, with the cast ids

## Prompt
Here is a finished Say Suppose script and its characters. Do not change a single word of the script.

SCRIPT: {{script}}
CHARACTERS: {{characters}}

Split the script into sentences in order. Answer with one YAML document:
lines:
  - {n: 1, text: "<sentence exactly as written>", speaker: narrator}
  - {n: 2, text: "<sentence>", speaker: <cast id of the character who says it>}
claims:
  - {n: <sentence number>, claim: "<the real-world fact stated, in plain words>"}
A sentence is a character line only when a character says it aloud; everything else is narrator. List every
real-world number, record, mechanism or named study as a claim; story events are not claims.

## Checklist
- The joined `text` values equal the script exactly, the text unchanged (the agent checks this with code).
- Every speaker is `narrator` or an id in CHARACTERS.
- At least five claims.
