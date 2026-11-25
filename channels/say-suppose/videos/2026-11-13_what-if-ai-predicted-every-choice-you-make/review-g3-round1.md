# G3 review, round 1: AI predicted every choice you make, picture lock (2026-11-25)

The owner on 2026-11-25: "Finish this film with voice B. Lock the picture (G3), do the final watch and upload it
private, all with no spend. - GO AHEAD." G3 (`final_edit`) is `awaiting_human`; nothing here approves anything.

## What is up for the lock

`renders/final-edit/final-edit-720p.mp4` (git-ignored), 1280x720, 12:24. It is the v3 cut the owner approved at G2 "as
is". The picture is unchanged (`renders/firstcut/picture-720p.mp4`, copied stream for stream). Only the sound is
mastered.

| G3 item | Locked as |
|---|---|
| Cut | v3 as approved at G2, 12:24, no change |
| Key shot | The key held out over the box under two tags, at 0:00 and at The Key (the look-test pick) |
| Text | The tags, rate boards and bubbles of v3; no change |
| Music and mix | The ACE-Step cues and beds of v3 (local, free), mastered to the channel target |
| Voice | Voice B, free and local. The paid A/B ran (Luc picked as the channel's paid voice, 2026-11-25), and the owner chose to finish this film on voice B with no spend |

## The one change: the master

The v3 mix measured -20.2 LUFS. The channel's target is -14 ±1 (`channel.yaml`), and final_edit qc checks it.
`scenes/master.py`:
- lifts the mix 6.4 dB into a limiter;
- dips one consonant by 8 dB for 30 ms with ramps. This is the "t" of the Pickpocket's "I didn't touch it." at 3:31.9.
  The lift pushed it over the clicks check's step limit. It is a burst inside the take, not an edit, so it is softened
  rather than muted.

## Checks

`omni qc final_edit` on `renders/final-edit/final-edit-720p.mp4`:
- loudness: PASS, -14.3 LUFS, -2.2 dBTP, LRA 6.0 LU;
- clicks: PASS;
- similarity: PASS;
- opening: WARN, the first word comes at 2.4 s. This is the 2.4 s lead-in under the two tags dropping on the key. It is
  the owner's call: G2 passed with it.

Not done before this lock: the sound-first watch (the cut on music, Foley and beds with the narration muted). It needs
a separate sound render, and the owner asked to finish with no extra passes.

## Open from G2 (the owner's to take or leave)

The room's round-5 notes in `review-g2-round3.md` were not merged. The owner approved v3 as is:
- the "broke man next to a cash box" line;
- c24, the hundred-and-sixty-teams fact;
- three small suggestions.

## Next, after the owner's G3

1. G4 `final_watch`: the 1920x1080 render (one render through the queue), watched by the owner at 1x.
2. G5 `publish_prep`: `upload.yaml`, then a private upload only on the owner's word.
