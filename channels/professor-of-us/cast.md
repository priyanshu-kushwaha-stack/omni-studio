# Cast (from video 5, 2026-11-01)

Owner note after video 4: the format still felt like a documentary, so from video 5 the scripts use **dialogue between recurring characters**, each with its own voice and on-screen acting. Cast approved by the owner 2026-11-01 ("yes looks fine"); voices picked by ear from an audition the same day ("You 2 Cody. Oog Gideon Gradma Nora"); Oog switched to Knox the same day ("Oog : Nox works as well I guess", then "Switch to Knox"), Gideon kept as backup. Audition clips: `~/Desktop/voice-audition/`.

| character | role in a scene | voice | engine + settings | look |
|---|---|---|---|---|
| **The Professor** | host and referee: brings the evidence, turns to camera for the viewer questions | owner's clone "Priyanshu EN" (element 891aae2c-f2b3-44bd-bb67-c78a4bad7594) | `qwen_audio_tts`, voice_type element, `instruction` for delivery (≤128 chars), wav 48 kHz | the glasses figure from the channel logo (`channel/page`) |
| **Oog** | the past: lived experience, deadpan, slow, dry jokes | preset **Knox** (195e386a-cb61-5c1b-a53b-0e2f0669c408); backup Gideon (1ad38ba4-9cc4-4f2f-9fde-b0fefdf67ae5) | `seed_audio`, voice_type preset, `speech_rate -10`, `pitch_rate -2`, wav 48 kHz | caveman, wild hair, fur tunic (same as videos 2-4) |
| **You** | the viewer: says the myth out loud, doubts, asks what the audience would ask | preset **Cody** (1ffcdbb3-078b-5491-959d-359e3021e917) | `seed_audio`, voice_type preset, `speech_rate 0`, wav 48 kHz; in the stitch `atempo 1.20` then `agate=threshold=0.04:ratio=4:range=0.06:attack=3:release=40`. (Was speech_rate 20 after the owner's "tune You's voice a little"; the owner heard an echo in it on the video 5 narration v1: Seed's fast rate stretches the room tail to ~210 ms. Rate 0 + atempo + gate brings the tail to ~45 ms at the same pace, 2026-11-01.) Samples `~/Desktop/voice-audition/You_Cody_rate*.wav` | the modern figure with round glasses and the satchel (`style_refs/model-sheet-you.png`) |
| **Grandma** (guest, used when the topic needs an elder; first in video 5) | a forager grandmother: proof by example | preset **Nora** (d081b915-6623-4a44-bacf-80d0f1c90a03) | `seed_audio`, voice_type preset, `speech_rate -5`, wav 48 kHz | new figure per topic (design in the video's prompts) |

## Engine notes
- Qwen Audio refuses preset voices ("Voice preset is not available for Qwen Audio"); only the owner's clone runs on Qwen. Seed Audio takes presets but has **no instruction field**: delivery for Oog / You / Grandma comes from the writing (short lines, punctuation, "..." for pauses) plus speed and pitch.
- Qwen reads "REM"-style acronyms as words badly; respell in the TTS prompt (e.g. "Rem"). Check every line with faster-whisper.
- Submit at most one batch of 12 at a time per model; a second batch in parallel returns 429 (nothing charged; resubmit after the first finishes).

## Script format
- Narration and the Professor: `PROF:` lines (a bare prose line is also read as the Professor).
- Dialogue: `OOG:`, `YOU:`, `GRANDMA:` at the start of a line.
- `> SAY:` still sets delivery for the next Professor line; `> ASK:` is a question inside the dialogue that a character answers at once, at the normal line gap. No `> QUIZ:` boards and no pause (owner 2026-11-06, `core/studio/rules/viewer-questions.md`; `script_lint.py` item 27 fails a board). Video 5's quiz boards and holds (2026-11-01) are history, not the format.
- About half the runtime is two-character dialogue; each section opens on a disagreement (You's myth vs Oog's or Grandma's reality) that the Professor settles with a claim from `claims.md`. Characters never state a contested claim as settled fact.

## On screen
- Dialogue scenes are two-shots with the characters facing each other, eyes open with visible pupils, simple mouths. The speaker's mouth moves with their own audio; the listener blinks and looks at the speaker (code puppets, no line boil, no AI motion).
