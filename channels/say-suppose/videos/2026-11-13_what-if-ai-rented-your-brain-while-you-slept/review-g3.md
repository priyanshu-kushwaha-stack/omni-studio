# G3 picture lock: "What If AI Rented Your Brain While You Slept?" (2026-11-16)

**Owner, 2026-11-15:** "Lets approve G2 and move forward", then "Start G3". The narrator is voice B, which the owner
locked as the channel's narrator ("lets lock it as the narrators voice"), so no voice A/B was run.

- **The cut:** `renders/g3/g3c-720p.mp4`, 10:47, 1280x720 (no 1080p before G4); a phone copy is `renders/g3/g3c-480p-phone.mp4`.
- **The script and narration are unchanged since G2:** 113 lines, free local voice B.
- **Checks:** `omni qc final_edit` passes loudness (-14.2 LUFS, -1.8 dBTP, LRA 7.5 LU), clicks and similarity. The
  opening warning is noted below.
- **Cost:** no paid call; G3 cost $0.

## Picture: what changed since the G2 cut

1. **The brother at Midnight** (`beats/Midnight.Brother.tsx`, new): a figure lying in the top bunk, replacing v6's
   grey wedge. He has his head on a pillow, the red cap, a blanket and the hoodie shoulder, and a short two-part arm
   reaching over the rail. His hand goes to his mouth on "Come back Thursday".
2. **Long holds:** cut or given a move at:
   - "Problem one" (3:26): the jar, the coins, the clock and your eyes, one on each phrase;
   - the maze (4:56): it used to play in 0.6 s and then sit still for 9 s, a side effect of the v6 remap; it now runs
     the whole line;
   - the darling close;
   - the shelf of jars (4:24);
   - the visa sign (6:30);
   - the broker's "deeper" line (7:26), a cut to a two-shot;
   - the two-bands page (3:01);
   - Midnight (9:15), a cut to a two-shot;
   - the fridge flyer (0:29).
   The globe peak already pushes in, so it is unchanged.
3. **The band when held** is the thin glowing strip everywhere. In the Photo it had been drawn as a ring, and in the
   Night Shift it read as a remote.
4. **The fridge:** the stray white boxes from v5 were not found in v6. The Rule beat's kitchen now carries the OWE
   note and the flyer, like the other kitchen shots.
5. **Known flaws from G2, fixed:**
   - a bigger coin with a glow and a glint as it lands;
   - the line-96 shot reframed, face and both hands in frame;
   - the landing is a lit set: a wall lamp, the HOME door, a doormat, the stair rail;
   - the KEYS / DOOR / YOU strip moved clear of the bunk rail.
6. **The first 30 s:** the first 0.47 s is the thumbnail's picture (the bunk at night, the ghost typing, the coins),
   so autoplay viewers see the thumbnail. Then a hard cut to the clinic close. Something changes about every 2 to 3 s.
7. **The last 15 s:** the right third is the still street only, kept clear for end screens. The end tags are one row
   across the top of the left two-thirds, off every face.

## Sound

- **Loudness:** the G2 cut sat at -21 LUFS. The watch copy is mastered to the channel target with +7.5 dB, a 13 kHz
  lowpass and a limiter (`scenes/render_watch.sh`).
- **Clicks:** five spots flagged on the first G3 render are fixed:
  - the pay-flap at 0:53 is 7 dB lower;
  - the coin clink has a softer attack and a short tail, and is 4 dB lower;
  - the knock is 4 dB lower (2:12 and 9:33);
  - the brother's "Still" sibilant (1:48) is cleared by the lowpass;
  - a 60 ms 2 dB dip covers a spike inside the nurse's "rested" (2:35); a mute there would cut the word.
- **Ambience:** the bed under the new fridge shot is the kitchen at night; it had still been the bridge from v5.
- **Music:** unchanged. The eleven local ACE-Step cues follow the sections automatically, so they fit v6's shorter
  ones; cool sci-fi until Midnight, warm only for the lesson.
- **Narration muted:** no second of the film falls below -55 dB without the voice. The ambience beds carry every moment.

## For the owner to judge at 1x

- **The opening warning:** the first word is at 3.4 s (the check wants 1.0 s). That is the cold open you saw in v6:
  0.5 s of the thumbnail picture, then 1.5 s of the band going on and 1.5 s of the ghost rising, before the broker's
  "Ten seconds, asleep. One coin." It is a warning, not a failure. Say if you want the broker to speak sooner.
- **The 0.47 s thumbnail flash** before the clinic: right for autoplay, but judge it at full speed.
- **The brother's hood** reads as a soft grey lump behind his head.
- **The end street:** the red forehead lights are small on a phone.

`checkpoint_final_edit.json` is `awaiting_human`. Only the owner passes G3.
