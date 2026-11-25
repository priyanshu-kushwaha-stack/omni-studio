# How Ifverse films are made, against our first cut (2026-11-25)

The owner's G2 picture note: "Video again looks very plain 2D. Check how video of Ifverse are created? And lets try to
replicate the same here also." Studied in the owner's Chrome, frame by frame (no downloads): "Everyone Has a Power
Level. Mine Is 1." (OmoUA68n13k, 137K views, 10:06, a number over every head, the closest premise to ours) and "What
If You Were Trapped in a Time Loop?" (n_BlWAmU1Zk, 185K, 8:15), with the channel's 2026-11-06 reference study
(`docs/research/2026-11-06-say-suppose-reference-study.md`). Our side: 16 frames of `renders/g2/lies-cut-v1-720p.mp4`.

## Length

Ifverse's last 25 uploads run 4:28 to 24:22 (two "full movie" compilations); the singles sit at 5 to 10 minutes, and the
biggest of the last year are 5:48 (425K), 8:36 (560K) and 8:16 (185K). Our first cut was 10:20.

## What makes theirs read as more than flat 2D

The figures are as flat as ours (round heads, stick limbs, two or three face shapes). The difference is all around them:

1. **Close-ups carry the film.** About half the frames are a head filling a third to two thirds of the frame; the rest
   are medium shots with one or two people. Wides are rare and short (a top-down street, a bar). Ours: mostly wides
   with eight to forty small figures.
2. **Depth of field everywhere.** Behind every close-up the room is soft and out of focus, with round bokeh lights; in
   medium shots a blurred head or shoulder sits in the foreground. Ours: every layer sharp.
3. **Painted rooms, not diagrams.** Their sets have perspective, soft gradients, pools of light on the floor, lamps
   that glow, windows with dusk behind. Ours: flat fills with hard ink outlines.
4. **One light per scene, and a rim on every figure.** A warm orange edge on the side toward the light, matching the
   scene's dusk or lamp. Our moods grade the frame but the figures stay unlit.
5. **Almost no text.** One small pill in a corner (LEVEL 1, LIVES: 64); the occasional title card. Numbers over heads are
   small, dark and warm. Ours: a counter over every head, a readout box, and large stat cards across the picture.

## What we keep as ours

The style rule (`style.md`, "Signatures not to copy") lists Ifverse's black round-headed figures with white eyes, its
permanent letterbox and its title cards. The look options below separate the craft (framing, depth, light, painted
plates, small HUD) from that signature (option B), so the owner can choose.

## Options rendered (`renders/looks/`, git-ignored)

The same 6 s moment (the opening: over your shoulder at the boss, click 47 to 48, then close on you), three ways:

- **A:** our cast and our code-drawn meeting room, reframed: close-ups, depth of field, rim light, bloom, the small HUD.
- **B:** a painted plate behind, dark figures with white eyes and the orange rim (the Ifverse cast look).
- **C:** a painted plate behind, our cast. Plates are made on this Mac with FLUX.2 klein 4B (mflux, free, about 30 s
  each, `renders/looks/plates.sh`): empty rooms only, no people; the characters stay code puppets (no AI motion).
