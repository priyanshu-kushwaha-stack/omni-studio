# Dub tracks (YouTube multi-language audio)

Each language is an audio-only file the length of the video, added in YouTube Studio: Languages, the video, Add
language, Dub. The picture, music and effects are the English cut's; only the narration changes.

## How a track is built (Hindi, 2026-11-08, on edit v6)

1. Script: `hi/script.md`, one line per English line, fitted to its slot; reviewed in `hi/reviews/`.
2. Takes: Arthur (Higgsfield, ElevenLabs Eleven v4, preset Arthur) at tempo 1.2, through the engine's `build.ts`
   (24.15 credits, `costs.md`). The countdown (lines 30-32) reuses the English takes.
3. Fit: `core/engines/whatif/pipeline/dub_narration.py <video> <takes dir> hi --keep 30,31,32` writes
   `hi/narration.wav`, `hi/words.json` and `hi/fit.txt`.
4. Stem: the film rendered with `"narration": false` in its props (`me-props.json`), audio only
   (`npx remotion render ... --codec=wav`), gives `me-stem.wav`, the music and effects alone.
5. Mix: stem + narration (+0.6 dB, to the English narration's -18.0 LUFS), `alimiter=limit=0.84:level=false`, then a
   two-pass loudnorm to -14 LUFS / -1.5 dBTP: `hi/pause-time-hi-dub.wav` (and `.mp3`).
6. Checks: loudness, clicks and opening pass (qc/loudness.py, qc/clicks.py, qc/opening.py).

Media here is git-ignored; the steps above rebuild it.
