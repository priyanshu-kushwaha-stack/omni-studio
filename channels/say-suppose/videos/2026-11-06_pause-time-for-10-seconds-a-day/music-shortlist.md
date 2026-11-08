# Score: Pixabay shortlist (G5)

The owner chose free Pixabay library tracks over ElevenLabs Music on 2026-11-07. The ElevenLabs quote for the five
cues was 45.94 credits.

**Licence.** Pixabay Content License. It allows:
- free use;
- no attribution needed;
- modification and adaptation.

It forbids selling or distributing the track on its own, unchanged. A narrated film is far from that.

**Content ID.** A Pixabay track can still trigger a YouTube claim. Keep each chosen track's page link here, so a claim
can be disputed with it.

**Status.** The candidates below were read from Pixabay search results on 2026-11-07, not listened to. The owner
picks by ear on each link.

| Cue | Where | Length needed | Mood | Candidate 1 | Candidate 2 |
|---|---|---|---|---|---|
| 1 | Opening and first days, 0:10–1:50 | about 110 s | Your theme, light, a little mischievous | [Quirky Sneaky](https://pixabay.com/music/comedy-quirky-sneaky-375264/), leberch, 1:46 | [Quirky Sneaky Music](https://pixabay.com/music/fantasy-dreamy-childrens-quirky-sneaky-music-614988/), ViacheslavStarostin, 2:00 |
| 2 | Day twelve to the rescue, 1:50–2:42 | about 52 s | Tension building | [Suspense Tension Building](https://pixabay.com/music/main-title-suspense-tension-building-569428/), ARPMedia, 1:29 | [Suspense Tension](https://pixabay.com/music/orchestral-suspense-tension-580864/), leberch, 1:58 |
| 3 | The catch, 2:42–4:00 | about 78 s | Cold and sad: the stairs fall, midnight | [Sad Piano](https://pixabay.com/music/solo-piano-sad-piano-628076/), leberch, 1:56 | [Emotional Piano](https://pixabay.com/music/solo-piano-emotional-piano-621564/), AtlasAudio, 2:33 |
| 4 | The long run, 4:00–4:50 | about 50 s | Warm, bittersweet | [Bittersweet](https://pixabay.com/music/modern-classical-bittersweet-524997/), leberch, 2:18 | [Asagiri (Nostalgic Piano)](https://pixabay.com/music/solo-piano-asagiri-nostalgic-piano-494120/), HarumachiMusic, 2:03 |
| 5 | The twist, 4:50–5:16 | about 26 s | Silence, then something eerie | [Eerie](https://pixabay.com/music/orchestral-eerie-580863/), leberch, 1:42 | [Mysterious](https://pixabay.com/music/mystery-mysterious-626022/), leberch, 2:12 |

## How the chosen tracks go in

1. **Trim.** Each track is cut to its cue and faded in and out, with no hard starts.
2. **Duck.** The music sits under the voice and rises in the wordless holds.
3. **Silence.** It drops to silence just before "And then you notice something."
4. **Sound effects.** They stay as they are, quiet.
5. **Loudness.** The mix is set to the channel's -14 LUFS, then the G5 checks run: loudness, clicks and similarity.

## Our own score, made locally (owner, 2026-11-07)

**The owner's verdict on the shortlist.** "These are completely different options... First still felt good but others
cannot say... what if we create our own sound? ... I don't want to compromise with the quality."

**What was made.** `make_music.py` (tracked) generates the score locally with ACE-Step 1.5. It is MIT-licensed, its
outputs can be used commercially, it is pinned in `core/lock.yaml`, and the Power & Citizen session already uses it.

- 5 cues, sized to the timeline, 3 seeds each: 15 takes.
- Cost: no paid call.
- Takes are saved to `assets/music/<cue>-<seed>.wav` (git-ignored).

**Listening files.** `renders/music-listen/cue-<cue>.mp3`. Each plays its stretch of the real narration three times,
once over each take (seeds 11, 29, 47), with the music ducked under the voice.

**Checks.** All 15 takes measure between -16.3 and -13.1 LUFS at full length. Nobody has listened to them yet.

The Pixabay cue-1 pick the owner liked ("Quirky Sneaky", leberch) stays the fallback for cue 1.
