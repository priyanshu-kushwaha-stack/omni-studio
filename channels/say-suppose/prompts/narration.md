# narration
Model: Higgsfield elevenlabs_v4, Luc preset 04e867c7-9e41-5cff-80d3-5284e74d7bd1 (paid, after G2, owner OK first)
Used by: core/openmontage/skills/studio/studio-suppose-edit.md
Source: W9 (the workflow's voice instruction), memory "narration cinematic, not documentary", pilot v2 Luc takes

## Inputs
- {{line}}: one narrator line from the cast pass, exactly as written

## Prompt
Direction: a warm, clear storyteller talking to one friend, conversational and slightly awed, as if explaining
something mind-blowing over coffee. Moderate to slightly fast pace. Real pauses at ellipses. Weight on contrast
words and numbers. Emotional moments a little slower. Intimate, never robotic, never shouty, never documentary.
Line: {{line}}

## Checklist
- One job per line (Luc can repeat phrases inside long takes).
- whisper transcript of the take equals the line; otherwise trim or retake (a retake beyond the quote needs an OK).
- Takes are stitched with core/engines/suppose/scripts/stitch.py, never by hand.
