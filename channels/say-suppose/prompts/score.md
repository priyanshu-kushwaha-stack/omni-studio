# score
Model: Higgsfield elevenlabs_music_v2_5, force_instrumental true (paid, about 0.145 credits a second, after G2,
owner OK first)
Used by: core/openmontage/skills/studio/studio-suppose-edit.md (the film's score)
Source: pilot score job 71870626-fd1d-4c22-bff1-038bcc78a27a (60 s), read back from Higgsfield on 2026-11-27

## Inputs
- {{seconds}}: the cue length in whole seconds (also sent as the job's duration)
- {{mood}}: the place and the feeling (for the pilot: "a Tokyo train station at morning rush. Warm, curious and
  slightly melancholy")
- {{beat}}: the cue's shape in time, each turn at its second from the cut (for the pilot: "Opens quiet and lonely,
  lifts with quiet wonder around 20 seconds, playful bounce from 24 to 38 seconds, a short swell at 39 seconds for a
  title, steady light rhythm under rules from 43 seconds, then thins to a single held tense note at 57 seconds and
  stops")

## Prompt
Instrumental score for a {{seconds}}-second animated what-if story set in {{mood}}: soft felt piano motif, light
pizzicato strings, gentle marimba, airy pads, a subtle ticking pulse. {{beat}}. Sits under narration, no vocals, no
big drums.

## Checklist
- The beat times come from the cut's shot times, so each turn lands on its story beat.
- After generating: no vocals; the swell and the ending land within a second of their beats (stretch with `atempo`
  if needed, as the pilot did); duck under the voice in the mix.
- Cost stated before the call: seconds x 0.145 credits.
