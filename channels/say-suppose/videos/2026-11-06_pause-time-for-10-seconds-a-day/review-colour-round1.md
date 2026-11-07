# Colour review, round 1, and the intro options

2026-11-07. The owner watched the v7 rough cut ("Video looks fine") and asked for three things:

1. A hooking opening that also brands the channel, without saying "Welcome to…". The owner's references were fern,
   "The Death of Educational Content" (around 0:15 and 1:43), and Modern Ideas, "The Power of Delusional Self Belief"
   (its intro).
2. A subtle subscribe nudge that doesn't break the flow.
3. An expert review of the colour, across all frames.

## Colour: two experts, both 5/10

The two reviewers were a senior colourist and the channel's art director. Each read a frame every 2 s of the v7 cut
(`renders/review-pack-v7/`) against the owner's sample.

**Where they agree:**

- **Day and the freeze are on-brand.** The day scenes match the sample. Frozen mustard and crimson against a grey
  crowd is the channel's best frame.
- **The grades dye the characters.**
  - The grades multiply over the characters as well as the world.
  - Your mustard head turns pumpkin orange at dusk, brown under the lamp and cream in the midnight freeze.
  - The teal scarf turns grey-green.
  - The stranger's crimson is lost among red and orange dusk crowds.
- **The freeze is lavender, not the sample's neutral grey.** The midnight freeze looks the same as the night shots
  around it.
- **Vignettes of 0.70-0.75 and dusk roads crush the frame on a phone** at low brightness.
- **Moods blur together.** Morning is as orange as dusk; the first night reads as dusk. The lamp mood has four
  different looks.
- **The end card is the weakest frame:** an orange head on an orange disc.
- **Protect the brand colours: yes, both say.** The characters keep about a fifth of the grade at most, so the world
  takes the mood and the characters keep mustard, teal and crimson.

## The fix, rendered as before and after (not yet applied to the film)

The fix uses the experts' numbers, averaged where they differed:

| Mood | Grade opacity | Vignette | Other changes |
|---|---|---|---|
| Morning | 0.8 → 0.5 | 0.55 → 0.35 | |
| Dusk | 0.9 → 0.55 | 0.75 → 0.45 | Warmer, lighter grade |
| Night | 0.8 → 0.65 | 0.7 → 0.45 | |
| Lamp | 0.72 → 0.5 | 0.72 → 0.45 | |
| Frozen | 0.85 → 0.45 | 0.6 → 0.4 | Neutral grey grade, as in the sample |

**Characters.** `Light` now runs in two passes. The world pass sits under the characters. The over pass gives them
only 0.2 of the grade, plus the vignette and the glows.

**Tests.** The kit's tests now require vignettes of 0.45 or less, a neutral freeze, and characters graded at 0.25 or
less.

**Comparison.** `renders/colour/before-after.png` shows 12 frames, before and after. Trade-off: dusk is gentler, so
the "Year 40" street reads closer to late afternoon.

## Intro and subscribe options

The renders are in `channels/say-suppose/page/candidates/ident/` (git-ignored). Each intro clip plays the end of the
hook, then the ident, then the bedroom.

| Option | What it is |
|---|---|
| A, Ringed Earth | The channel art in motion. A ring sweeps round a paper Earth, the wordmark stamps in, and the camera dives into the planet onto the bedroom. Works for every video. |
| B, Split-flap board | The film's counter tiles clatter onto SAY SUPPOSE, then WHAT IF TIME PAUSED?, with the crest above. |
| C, Title card | Like fern. The frozen hook shrinks into a paper print, with the name above and the episode title below, then flips over to the bedroom. |
| S1, Paper tag | A small tag on a string, top left: "Subscribe · a new what-if every day". It appears at a quiet moment (2:44) and peels away. |
| S2, Bus-shelter ad | An ad in the world itself, at 3:00. |

**Noticed while building these:** `rough-cut-v7.mp4` shows the bedroom in the frozen grade for about half a second
(frames 223-239) before line 1. Film uses the mood of the last line spoken, and line 0 is frozen. An ident in that
gap removes it.
