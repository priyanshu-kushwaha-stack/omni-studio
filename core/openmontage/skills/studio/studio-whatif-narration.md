# studio-whatif: narration (G3, narration lock)

The engine is not in this repo yet (`pipeline_defs/studio-whatif.yaml`). Do not start this stage until it is.

1. The voice comes from `channels/<slug>/voices.yaml`. Every narration call is paid: announce tool, provider,
   model and cost, and wait for the owner. One take per script line, cached by a hash of voice and text, so an
   unchanged line is never bought twice.
2. Tighten each take as `voices.yaml` says. Fade every line edge and mute end-of-take pops
   (`core/studio/rules/no-audio-clicks.md`).
3. Word timings into `narration/words.json` (faster-whisper in `.venv-media`); the stitched voice into
   `narration/narration.wav`.
4. `.venv/bin/omni qc <slug> <video> narration` (claims, clicks) must pass.
5. `status: awaiting_human`, then stop.
