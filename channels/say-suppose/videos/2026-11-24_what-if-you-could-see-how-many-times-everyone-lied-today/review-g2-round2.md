# G2 round 2: the owner's notes on the first cut (2026-11-25)

The owner watched the first cut (`renders/g2/lies-cut-v1-720p.mp4`, 10:20) and gave three notes:

1. "Firstly I think video length can be made shorter."
2. "We are giving stats at a lot of points. I dont think that is needed just taking away story continuity only where it
   makes sense we should show or just show it as a card in the bottom very short or not even that."
3. "Video again looks very plain 2D. Check how video of Ifverse are created ? And lets try to replicate the same here
   also."

The notes are not added to `taste.md` (owner, 2026-11-24: no changes to channel files in this session), so the
owner-notes rounds register no `--owner-note` and draw on the ordinary call cap.

## Note 1 and 2: the script (session revision; Fable's draft kept the pen at round 1)

- **Length:** 10:20 to 8:05 (485 s of narration with holds; 1,076 spoken words). Cut: the landlord and the kid, the
  rally, the client's call, the canteen text, the phone camera, the lie definition, the polygraph report.
- **Stats:** from about sixteen spoken findings to four, each where it turns the story: the misconception (c12), who
  lies (c03, c04), the coin flip (c06), frost not fire (c15). Cut: c01, c05, c07, c09, c11, c13, c14, c16, c17, c18 and
  c03's 60% on its own line. Cards are short dark tags at the bottom ("ABOUT 5% TELL ALMOST HALF THE LIES", "54%",
  "ALMOST 90% WHITE LIES"); PROBLEM cards are a small pill upper left; the "everyone you can see" readout is a small
  pill top left.

## The room (owner-notes rounds 2-4; `room-g2.md`)

- **Round 2:** claims seat, 3 blockers, all applied: the nose science (c13, c18 are contested: the narrator now says
  only "Nobody's nose is a counter" and the rival says "A liar's nose always gives them away"); "most people reported
  no lies at all that day" joins the 5% line so the 10-to-200 belief is broken. Story seat, 3 blockers: poker is caused
  ("So on Friday, you find a game where everybody lies"), lunch gets a laugh (the team texting each other at one
  table), applied; cutting "That's nine. And he's the honest one." not taken (the minute-one line the brief returns).
- **Round 3:** claims seat, 1 blocker, applied: "A coin flip that leans toward believing" (no "everyone else"); "you
  may be lied to" as the talk said it, and "ALMOST HALF" on the tag. Story seat, 3 blockers, applied: the stadium is
  caused ("So tonight, you go to the biggest room in the city"); the rule in three lines; the close ends on "Tomorrow,
  when you say you're fine, listen for the click." and a short comment question.
- **Round 4:** claims seat clean; shipped by the owner-notes rule. The story seat's three round-4 notes are open for
  the owner's cut review, not applied: the spread line sits at about 4:00 of 8:05, at the midpoint, not after it;
  "The host puts you side by side" is a small bridge; the lift beat stays the film's one quiet habit beat (the
  printer callback it proposes would add a line).
- `verify`: room evidence ok.

## Narration

Free local, voice B and the film's designed cast (`cast.py`). Re-voiced only the changed lines (13, 8, 6 and 1 takes
over the rounds). "Desk man: Sent it Friday." was re-voiced as "Sent it. Friday." because its onset tripped the clicks
check by a hair; muting it clipped the "S". Mutes re-indexed by line text: `50@1.690:0.05,70@2.810:0.04,82@1.985:0.105,
100@1.350:0.1`. `omni qc story_script`: claims pass, clicks pass.

## Note 3: the look

Studied in the owner's Chrome, frame by frame (`look-study-ifverse.md`). Three looks of the same 6 s moment were rendered
(`renders/looks/`): A our cast on our code-drawn room with Ifverse framing; B painted room with dark Ifverse-style
figures (a signature `style.md` says not to copy); C painted room with our cast. **The owner chose C.**

Look C: an empty painted room per set (FLUX.2 klein 4B through mflux, free and local, `plates/plates.sh` and
`plates/plates.tsv`; one style prompt for all eighteen so they read as one film; the first two meeting rooms came out
near-photographic and were re-rolled with "not photorealistic, not a 3D render" in the prompt; the morning studio came
out with a person at the desk and was re-rolled with seed 300+i). The characters, counters and props stay code
puppets. `scenes/parts/Plate.tsx` puts a plate behind the Stage, blurs it as the camera closes in, and lights the
actors with a warm rim. The beats are reframed around close-ups and over-the-shoulder shots.
