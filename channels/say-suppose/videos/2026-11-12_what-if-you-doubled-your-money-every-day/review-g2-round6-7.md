# G2 review, rounds 6-7 (owner notes): script v2

The owner's eight first-cut notes (2026-11-12, `taste.md`: "Start of the script felt boring." and the rest) went to
Fable 5.1 as one brief; v1 is kept in `history/script-v1/`. Script v2:

| # | Owner's note | Done |
|---|---|---|
| 1 | Names hard to follow | Three names only (Lotte, the baker; Jonas, your flatmate; you, unnamed); the rest are roles ("the man from the bank", "the flour man", "the woman with the bags", "the driver"); a returning name carries its role |
| 2, 6 | Let characters perform with the narration stopped | Eight performed scenes: the opening, your first paid roll, the thirty-one cakes, the free tram, the bank, Jonas's football club, the bread balloon, the flour man, Jonas's "Not me", the call to the bank |
| 3 | Vocabulary hard | Plain words, one idea a line ("the bank says it was a mistake"; "money is a ticket for things people make") |
| 4, 5 | Start boring; open on a story, then the narration and the title | A performed opening at Lotte's counter and the flat at midnight: the coin tears in two on the lock screen; then the narrator and the title card at about 0:50 |
| 7, 8 | Long but few components; more situations, exciting, funny | Jonas's birthday that grows to sixty-two cakes and a brass band, the whole tram free all day, a football club that finally wins, bread by hot-air balloon, the spending run, then the cost |
| 8 | Multiple emotions; the voice is flat | Every line has its emotion in `say.yaml` (character lines too). The free local voice drops the directions and has one voice for everyone: the owner's decision, below |

Also: "you" is never "he" in the characters' lines ("that one", or straight to you), per "you is anyone".

**Room round 6** (owner-notes, the note registered: cap 16 -> 20): claims check 0 blockers; story editor 3. Applied:
the flour man is planted in the balloon scene (no new person after 60%); Mansa Musa now leads into Jonas ("Your gifts
do it to bread. Ask Jonas."); the claims check's catch that tripled flour leaves a third, not half ("Tonight, four
months." / "Lotte: A third."); "Sixty-two cakes" (the order doubled overnight); the narrated "That's the moment" cut.
**Not applied:** the premise question by 0:15 (check #3): it would cut the performed opening the owner asked for, and
the owner's note outranks the template (`taste.md`).

**Room round 7** ships (`room-g2.md`, `room verify` ok, 14 of 20 calls): claims check 0 blockers. Story editor: #3 again
(not applied, as above); two picture-only notes for the cut: the opening must not show the cent leave the phone and
come back (only the midnight tear doubles it), and the pensioners at the window become Jonas reading the board.

Narration: 124 free local takes, 9:10; `omni qc story_script` passes (claims, clicks after 17 mutes).

## Drop 3: character voices and the v2 cut (2026-11-12)

The owner kept voicing A ("A: emotion per line", PR #51): Lotte, Jonas, the man from the bank, the flour man, the
woman and the driver each speak in a free local Qwen3 VoiceDesign voice from `voices.yaml`, with their line's
direction as the emotion; the narrator stays Arthur's local clone. 58 new character takes, nothing paid; 9:37 at
tempo 1. `omni qc story_script` passes (claims; clicks after 21 mutes, take 78's widened to 140 ms).

The cut follows script v2 shot by shot. Shots now anchor to a line's opening words, not its index, so a reordered
script re-times the cut and a missing line fails the render. New places: the flat at midnight (Jonas asleep under his
coat, then sitting up with your phone), the free tram (the woman with her bags, the driver, Jonas pretending not to
know you), Jonas's ground (the score turns 0:2 to 4:2), the bread balloon (it drifts off; Jonas holds the rope), and
the flour man at the back door. Round 7's two picture notes are in: the opening's cent is a real coin out of your fist
and the phone keeps 0,01 (only the midnight tear doubles it), and Jonas reads the board on day forty.

Cut: `renders/firstcut/firstcut-v2-720p.mp4`, 1280x720, 9:37, -15.9 LUFS, true peak -2.5 dBTP. `omni qc story_script
--media` passes (claims, clicks). The music bed exposed one more end-of-take blip after "the lot." (217.8 s), now muted
(`53@6.838:0.090`, 22 mutes). The Remotion mp4 audio sat 47.6 ms late (AAC priming), so the cut's sound is the
RoughCutSound pass rendered to WAV and muxed onto the picture; recorded with `omni fix`.
