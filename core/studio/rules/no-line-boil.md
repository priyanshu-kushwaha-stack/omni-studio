# No line boil

check: automated. `pou_compose --motion` refuses a motion.json with effect `boil`; `pou_puppet render|clips|frames`
refuses a stage with `"boil": true` (`tools/studio/studio_pou_tools.py`, tested in
`core/studio/tests/test_studio_tools.py`).

Owner on video 3 draft v2 (2026-10-31): the line-boil wobble on every drawing ("the screen which shakes") looks
bad; camera and frame movements look good; hand and eye puppet movement looks better and should be used on more
drawings.

Why: the boil reads as cheap jitter rather than life; on-word character acting reads as real animation.

How: motion.json effect `none` and puppet stage `"boil": false`; give life through character idle motion
(blinks, breath, eye darts), gestures on the word, local ambient motion, and camera moves.
