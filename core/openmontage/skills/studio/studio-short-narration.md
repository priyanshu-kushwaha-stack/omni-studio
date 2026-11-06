# studio-short: narration (G3, narration lock)

1. Voices from `channels/<slug>/voices.yaml`, local engines through `pou_tts` (free). Paid engines (`eleven`,
   Higgsfield voices): announce tool, provider, model and cost and wait for the owner.
2. Fade every line edge and mute end-of-take pops. The answer to the `> ASK:` follows at the normal line gap.
3. Word timings into `narration/words.json`; per-line files and `narration/lines.json` for the talking puppets.
4. `.venv/bin/omni qc <slug> <video> narration --media <video>/narration/narration.wav` must pass
   (claims, clicks).
5. `status: awaiting_human`, then stop.
