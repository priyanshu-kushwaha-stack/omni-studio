# studio-dialogue: narration (G3, narration lock)

1. Voices come from `channels/<slug>/voices.yaml`. Local engines through `pou_tts` (qwen3, chatterbox) cost
   nothing. `--engine eleven` and Higgsfield voices are paid: announce tool, provider, model and cost, and wait
   for the owner. `pou_tts` refuses `eleven` without `owner_approved_paid_call: true`.
2. Fade every line edge, mute end-of-take pops. No held silence after a `> ASK:`: the answer follows at the
   normal line gap.
3. Word timings into `narration/words.json` (faster-whisper in `.venv-media`), per-line files and
   `narration/lines.json` for the talking puppets.
4. Check: `.venv/bin/python core/engines/pou/scripts/audio_check.py <video>/narration/narration.wav --words
   <video>/narration/words.json`. No gap bursts, no steps (`core/studio/rules/no-audio-clicks.md`).
5. `status: awaiting_human`, then stop.
