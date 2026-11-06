# Narrator voice

provider: higgsfield            # owner decision 2026-10-25: own voice, cloned, English + Hindi; see voice_recording_kit.md. 2026-10-28: open engines (Qwen3, Chatterbox) lost the blind read; next video moves to ElevenLabs direct, Starter plan, same 2:24 read cloned in the app, id in .env.local as ELEVEN_VOICE_ID (scripts/tts.py --engine eleven)
voice_id: 891aae2c-f2b3-44bd-bb67-c78a4bad7594   # "Priyanshu EN" clone (voice_type element), created 2026-10-26 from a 2:24 phone read; Grady preset e2a2d2e6-9ed2-59cd-82af-feaa27f8a678 stays the fallback
voice_name: Priyanshu EN
hi_voice_id: 887e1a64-5ef0-4a19-9498-536b6ff2208d   # "Priyanshu HI" (element), created 2026-10-27 from the WhatsApp Hindi read cut to 2:56; NOT approved: the owner meant to record a proper sample first and will re-record for a future Hindi video (re-clone 40 credits). Unused on video 1
model: elevenlabs_v4_turbo      # reads at ~152 wpm; the text2speech_v2 route read at 122 wpm
languages: [en, hi]
stability: 0.45
similarity_boost: 0.8
style: 0.2
speed: 1.0
target_wpm: 155
blind_test: see docs/superpowers/plans/phase0-verification.md "Voice blind test"
escalation: after 3 flat samples in a row, choose one of: better microphone for own voice, ElevenLabs Pro, hired narrator

## Pronunciations
- Homo sapiens: HOH-moh SAY-pee-enz
- Pleistocene: PLYS-tuh-seen
- Neanderthal: nee-AN-der-tahl
- insomnia: in-SOM-nee-uh (the Grady placeholder read it as "within Somnia" at 31.6 s)
- Tsimane: chee-MAH-neh (placeholder read "Timane" at 137.9 s)
- Hadza: HAD-zuh
- G/wi: GWEE
