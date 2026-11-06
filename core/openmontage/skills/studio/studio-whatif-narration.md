# studio-whatif: narration (G3, narration lock)

1. `whatif_story` turns the approved `script.md` into `story.json` (spoken lines, holds, moods, cited sources).
   Where a line needs numbers spelled out or a delivery direction (`[whispers]`, `[dry]`), add it to
   `narration/say.yaml` as `"<script line>": "<what the voice says>"`; the script keeps its digits for the claims
   check. Directions come from the script's "Narration notes".
2. The voice comes from `channels/<slug>/voices.yaml` (Arthur on Eleven v4). Every new take is paid: quote first with
   `higgsfield generate cost` per line (the build also quotes), announce tool, provider, model and total to the owner,
   and wait for a yes. Then run `whatif_narration` with `owner_approved_paid_call: true` and `max_credits` set to the
   approved cap. Without both, the tool reuses cached takes only and the build refuses any new one.
3. Takes are cached by a hash of voice and spoken text, so a changed line re-bills only that line. Fade every line
   edge and mute end-of-take pops (`core/studio/rules/no-audio-clicks.md`).
4. Output: `assets/narration/` (git-ignored): takes, word timings, `props.json` for the render.
5. `.venv/bin/omni qc <slug> <video> narration` (claims, clicks) must pass.
6. `status: awaiting_human`, then stop.
