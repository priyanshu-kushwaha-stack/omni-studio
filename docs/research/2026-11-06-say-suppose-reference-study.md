# Say Suppose: reference study and quality proposal

2026-11-06. The owner asked for "super notch" quality and emotion, with "our own touch", from three reference
channels: Ifverse (`@IfverseTales`), Primal Space (`@primalspace`) and ConChaser (`@ConChaser`). The owner
downloaded five videos; they were measured with ffmpeg (cuts, loudness) and faster-whisper (words), then studied
frame by frame by three reviewers, one per channel. The files stay outside the repo.

## Measured

| Video | Views | Length | Words/min | Wordless time | Cuts/min | Median shot | Loudness |
|---|---|---|---|---|---|---|---|
| Ifverse, Reaction Time 10x Faster | 4.6M | 7:13 | 98 | 136 s (31%) | 12.8 | 2.0 s | -15.0 LUFS |
| Ifverse, One Second Felt Like Ten | 689K | 6:47 | 122 | 91 s (22%) | low * | 4.6 s * | -15.1 LUFS |
| Ifverse, You Had 500 IQ | 1.4M | 8:56 | 113 | 94 s (18%) | 11.1 | 2.5 s | -15.0 LUFS |
| Primal Space, Europe's Smartest Criminal | 1.1M | 13:35 | 156 | little | 9.4 | 5.2 s | -14.9 LUFS |
| ConChaser, How Many Lives Everyone Has Saved | n/a | 14:25 | 151 | none | 17.3 | 2.2 s | -14.1 LUFS |

\* The cut detector misses soft cuts in dark scenes; the frames show many more shots.

In Ifverse's wordless stretches the music plays almost at voice level (-16.6 against -15.2 LUFS short-term), so the
music carries the feeling there. At their biggest beats the loudness also drops 3 to 4 LU.

## What makes them work

**Story (all three).** Open on the power in a small everyday moment, not an explanation; the title lands by about
0:35. State the rule in one sentence, then a test with a normal number next to yours. Escalate in short set pieces.
The cost lands near 60% of the runtime; at 75 to 80% comes a choice between the power and a person. Plant a line in
minute one and pay it back with the same words at the end. End on a twist and one question.

**Emotion.** The viewer cares about a person, not the power (a ball boy, a mother, a janitor). The biggest beat gets
8 to 10 wordless seconds: music swells or drops, colour drains, motion slows. Humour breaks tension. Peaks are cut
at half the usual rate.

**Look.** Lighting carries most of the quality, in every channel:
- every location has a mood light (warm dusk, moonlit blue, a single lamp for grief, cold teal for bad news);
- rim light on every figure, depth-of-field blur behind close-ups, glows, haze, vignette;
- shot variety: an insert or top-down shot every 20 to 30 s, over-the-shoulder with a blurred foreground head;
- the puppets underneath are simple flat shapes with 2 to 4 face shapes; brows and eyelids do the acting.

**Facts.** One number against a normal number, drawn on the scene. Primal Space adds self-drawing maps, cutaway
cross-sections, and objects that pile up or multiply so a number becomes physical.

**Narration.** Ifverse: about 5 words a sentence, 98 to 122 words a minute, a cut on many sentences. Primal and
ConChaser talk faster, 151 to 156, with no breathing room.

## Where our sample falls short

| | Sample | References |
|---|---|---|
| Light | Flat midday everywhere | A mood light per scene, rim light, depth, glow |
| Faces | Eyes, blink, 5 mouths | Brows, eyelids, wobbling mouths, wide-eye shock |
| Shots | Mostly medium-wide | Wides, close-ups, inserts, top-down, over-the-shoulder |
| Sound | Synthesised drone and effects | A score that swells and drops; silence at the peak |
| Voice | One flat TTS route, no direction | Directed delivery: hushed, breathless, dry |
| Pace | Script rule of about 140 words/min | Ifverse 98 to 122, with wordless beats |

## A clash to fix

Ifverse's 4.6M-view video opens with the power catching a fly, then a friend's falling coffee cup. Our pause-time
script's first-days gag is catching a falling coffee mug. It is in our owner's original sample, but next to their
biggest hit it will read as a copy.

## Proposal

Rendered tests (git-ignored, `channels/say-suppose/page/candidates/look-round-3/`): before-and-after lighting on
the sample's street and frozen close-up, the bedroom by day, morning and midnight, an expression sheet, and an
8-second dusk street clip.

**Look**
1. A lighting system in the engine: a colour grade, rim light, depth of field, glows and vignette per shot, set by a
   mood name in the scene plan (`morning`, `dusk`, `night`, `frozen`, `lamp`).
2. Our own signature for the pause: the world drains to grey and a letterbox slides in while time is stopped, and out
   when it starts. The references keep bars on all the time; ours mean something.
3. Brows, eyelids and two new mouths on the rig (sceptical, worried, sad, shocked, determined, relieved, afraid).
4. Shot vocabulary in the engine: close-up, insert, over-the-shoulder with a blurred foreground head, top-down; a
   face reaction within 2 s of every reveal.
5. Motion blur on fast moves and a slow-motion ghost for the peak (`@remotion/motion-blur`).

**Facts, our own way**
6. A small paper source tag in a corner whenever a sourced number is spoken ("UK Highway Code"). It makes the
   channel's honesty visible, and none of the references do it.
7. Self-drawing paper diagrams for numbers (a tape measure from a bumper, a falling-mug arc), using
   `@remotion/paths`.

**Sound and voice** (paid; each quoted before use)
8. A real score per video from ElevenLabs Music v2.5 through Higgsfield: a theme for "you", a cold cue for the catch,
   silence before the stranger. Music rises in wordless beats and ducks under the voice.
9. Narration on Eleven v4 if Arthur is available there, with per-line delivery direction; first a two-line test.

**Pace and story**
10. Slow the narration to about 115 words a minute and plan 15 to 20% wordless time where action and music carry
    the story. The script's word target drops from 900 to 1,100 to about 750 to 900.
11. For the pause-time script: replace the coffee-mug gag, plant one line in minute one that returns in the last
    minute, and give the old man's fall and the stranger's reveal 8 to 10 wordless seconds each.

## Signatures not to copy

Ifverse: black round-headed figures with white eyes, hoodie colour coding, permanent letterbox with magenta dusk,
head-filling close-ups with a glowing brain trace, "What if your ___ was 10x ___?" title cards, the fedora agent and
black car, Part 2 cliffhanger cards. ConChaser: neon counters above heads and the "999+" cap, dark pill captions,
top-left time stamps, the janitor whistleblower plot. Primal Space: colour-coded ghost figures as their house style.

## Engine tools this adds

`@remotion/motion-blur`, `@remotion/paths`, `@remotion/noise` (organic camera drift, no line boil) and
`@remotion/transitions`, all at the pinned Remotion version 4.0.484; a `Look` lighting layer; the rig's brows and
lids; shot helpers; a source tag component.
