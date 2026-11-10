# G3 plan: narration for the last-time film

Prepared 2026-11-10, after G2 passed. Nothing is bought yet: every take below is a paid Higgsfield call and waits
for the owner's yes.

## What gets voiced

- 64 lines from the approved script (`story.json`, built from `script.md` sha a28bcf10), one take per line.
- Voice: Arthur, Higgsfield preset, on ElevenLabs Eleven v4 (`voices.yaml`), at tempo 1.1 (`timing.yaml`), the same
  set-up the owner picked for the first film.
- Every line carries its direction from the script's narration notes (`say.yaml`), e.g. `[quiet] Forty-two.`,
  `[cold, quiet] Nine.`, `[hushed, warm] Of course she is.`
- Spoken forms, new for this film: "Mehta" is sent as "Mayta", "Diwali" as "Diwaali", "dal" as "dahl"; 64% and 93%
  are spelled out ("sixty-four per cent", "ninety-three per cent").

## Cost (free quotes from `higgsfield generate cost`, 2026-11-10)

| Option | Tool, provider, model | Takes | Credits |
|---|---|---|---|
| Full narration | Higgsfield, ElevenLabs Eleven v4, preset Arthur, with directions | 64 | **24.15** (24 at 0.23, 39 at 0.46, 1 at 0.69) |
| Pronunciation test | same | 4 (the Mayta lines 23 and 43, Diwaali 39, dahl 60) | **1.15** |
| Fallback route | Higgsfield, text2speech_v2 (ElevenLabs variant), preset Arthur, no directions | 64 | **12.90** |

**Balance: 17.21 credits** (Higgsfield `account status`, plan "max"), which is less than the full narration.
Takes are cached by voice and text, so test takes are reused by the full run and never billed twice. The first
film's narration was 29.26 credits.

## Options

1. **Test now, full run after a top-up (recommended).** Buy the 4-line pronunciation test (1.15 credits) and
   listen; the owner tops up Higgsfield credits; then the other 60 lines (23.00 credits).
2. **Top up first, then all 64 at once** (24.15 credits).
3. **Fallback route now** (12.90 credits): fits the balance, but drops every direction. The owner chose Eleven v4
   over this route in the first film's voice A/B.

## After the takes

Fade line edges and mute end-of-take pops, run `omni qc say-suppose <video> narration` (claims, clicks), write
`narration/narration.wav` for the owner to listen to at 1x, and set the narration checkpoint to `awaiting_human`.
Only the owner passes G3.
