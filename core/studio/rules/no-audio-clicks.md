# No audio clicks

check: automated. `audio_check.py <render or narration> --words <words.json>` fails on an isolated burst between
words (80 ms or less, 15 dB above both sides) and on a sample jump over 8x the track's p99 jump. A burst inside a
word is a WARN (likely a consonant): listen to it.

Owner on the video 5 narration and music samples (2026-11-02): "there are noises in the audio whenever its
transitioning that needs to be fixed." And: "Noise when OOG says seventy two in the starting 5 secs."

Causes found: TTS takes start or end mid-sound, and a hard cut into silence clicks; ffmpeg `volume` with
`eval=frame` steps once per ~1024 samples, so a duck clicks (needs `asetnsamples=n=48`); timed cues with no
fade-in click at their start; Seed takes sometimes end with a ~20 ms pop 15-20 dB louder after the voice.

How: every line gets a raised-cosine fade (10 ms in, 30 ms out, 60 ms out when the take ends loud); mute a burst
of 80 ms or less at a take edge when 40 ms of quiet separates it from speech; music ducks ramp and cues fade in
(`compose.py` does both). Scan before handing audio over.

G6 watch: listen for any click, pop or step at line edges and music ducks.
