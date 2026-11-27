# shots
Model: Claude (this session)
Used by: core/openmontage/skills/studio/studio-suppose-script.md (first cut)
Source: spec W1-W7, D9, L5, L8; the workflow's shot vocabulary

## Inputs
- {{lines}}: the cast-pass `lines` with whisper start and end times
- {{sets}}: library sets with their angles
- {{cast}}: cast ids with roles and signature items
- {{beats}}: story beats: title question, rule, each montage beat, cost, heart, crisis, choice, resolution, sting
- {{readout}}: the premise number, or "none"

## Prompt
```text
You are the director of a Say Suppose film. Turn the narration below into a shot sheet in the YAML format given at
the end. The picture is a cut-out puppet film in painted sets; characters act with eyes, brows, mouth shapes, hands
and posture; there is no lip-sync.

1. Split the narration into beats of about 13 words (never more than 15, about 6 seconds each). Each beat is one
   shot, or two when a reaction cut helps.
2. Give every shot a type from: wide (opens each new place, small figures, slow push-in), two (two-shot, side view),
   ots (over-the-shoulder: a big blurred near figure, the other sharp), face (giant close-up for reactions and
   "you" moments), insert (a hand, a phone, a watch), top (top-down or diagram), freeze (time-stop, one to three per
   film), data, blueprint (science segments and "Is any of this real?"), title, end. Aim for about: wide 10%, two
   25%, ots 10%, face 10-15%, insert 10%, top 5%. Never the same type twice in a row. Compose on thirds; only face is
   centred.
3. Every shot moves the camera: push, pull, drift, pan, roll (unease) or shake (impact); moves stay inside one set.
4. Anyone the narration mentions speaking, reacting or watching is in frame and visibly reacting. Most scenes have
   two or three characters; never more than four in focus.
5. Change an expression on the word that earns it, using: neutral, smile, happy, joy, surprised, shocked, scared,
   worried, nervous, angry, determined, sad, cry, smirk, sleepy, thinking, confused, awe.
6. Every number the narrator says appears as a label on that word (at most two labels at once). The premise number
   {{readout}} is the readout and changes only on a story beat.
7. Light follows the beat: warm for tender or triumphant, cool for tense, void or blueprint for explanation. Scope
   letterbox for the title, freezes, the climax and intense close-ups.
8. Something meaningful changes about every 4-5 s. A longer hold needs a hold: reason.
9. Sound effects use only these names: tick, thump, blip, glide, whoosh. Labels are data, dim, callout or pill. Crowd
   bands are the ones the set's angle lists, and the camera zoom never passes the angle's zmax.
10. A walk, run or stop that follows another move gives `from: [x, y]`, where the figure is; without it the figure
    starts back at its cast mark and the pose jumps.
11. The last shot ends when the narration ends (its last line's end plus the closing pause).

Narration: {{lines}}
Sets: {{sets}}
Cast: {{cast}}
Story beats: {{beats}}

Answer with only the YAML, in the format documented in core/engines/suppose/scripts/sheet.py.
```

## Checklist
- The agent runs `sheetcheck.py <video_dir>` and fixes every FAIL (it fails unknown sfx names, label kinds, moods,
  crowd bands, zooms past the set's bounds, and a last shot that ends past the narration or more than 0.5 s short).
- WARNs are reviewed and either fixed or given a reason (a `hold:` line, a beat moved).
