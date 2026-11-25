# G4 final watch, round 1 (2026-11-25)

`checkpoint_final_watch.json` is awaiting_human. Only the owner passes G4.

## The file

`renders/final/final-1080p.mp4` (git-ignored). Specs:

- 1920x1080, 12:24.6 long, 484 MB.
- sha256 `9d38064d6ae1b4df08d53604fc164bff38cfb1656b236c3626a143ad0ae8f84f`.
- Made in one `whatif_render` run (quality final, mode full), with no mux after it. G4's media proof will cover this exact file, and G5 uploads the same file.

The picture and sound are the ones the owner approved at G3, with voice B. Two changes are in code, not in a mux:

- **Master gain:** `scenes/master.tsx` adds +6.0 dB to every audio track.
- **Click fix:** the narration dips to 0.7 for two frames around the Pickpocket's "t" at 211.85 s (`Film.tsx`, `consonantDip`). This is the same fix the G3 copy got.

## Checks (`omni qc ... final_watch`)

| Check | Result |
|---|---|
| loudness | PASS: -14.3 LUFS, -1.20 dBTP, LRA 6.2 LU (target -14 ±1, at most -1 dBTP) |
| clicks | PASS |
| similarity | PASS |
| opening | WARN: the first word comes at 2.4 s. Accepted at G2 and G3; it does not block |

## Watch list (at 1x, start to end)

- Do the claims on screen match `claims.md`? Check the 70-80%, 93%, 60%, "a fifth" and "twice the rate" figures.
- Does any shot hold more than 6 s with nothing moving?
- Is there any click or pop, especially around 3:31 (the "t")?
- Does any text sit on a face, or outside the safe area?
- Cold viewers: one or two people who have not seen it. Note where they look away and what they say at the end.
- Still to do: the sound-first watch with the narration muted, from the G3 notes.

## G5, drafted for the same sitting

`upload.yaml`, `publish.md` and `subtitles/en.srt` are ready. Two answers are open, and both are the owner's:

1. Thumbnail: `thumb-a.png` "TRUST HIM?" (the G1 pick) or `thumb-b.png` "TRUST ME?".
2. Altered or synthetic content: `false`, the channel's answer since pause-time. Confirm it.

After G4, `omni upload` runs as a dry run. The private upload runs only on the owner's word.

## Owner notes

(to fill in)
