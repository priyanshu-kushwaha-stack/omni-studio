# Shorts: sound and ending

check: automated. `compose.plan_sfx(..., short=True)` places at most one pencil per 5 s at -26 dB and no page
turns (engine test `test_short_sfx_are_sparse_and_quiet`); `audio_check.py <render> --words <words.json> --short`
fails unless 2.4 s follow the last word and the end is at least 20 dB below it.

Owner on Shorts draft v2 (2026-10-31): the Shorts ended abruptly, and the pencil/page sound at every still change
was "a lot of noise" because Shorts cut every 2-3 s. They asked for animation inside the stills "without AI".

How: in 9:16 renders at most one pencil per 5 s at -26 dB, no page turns, stings at -16 dB; `short_plan.py` holds
2.4 s after the last word while the music fades. Animate with `short_rigs.py` + `puppet_render.py clips`
(blinks, eye darts, small head tilts, props that swing, bob, enter or exit); never boil. Props drawn tangled
into other line work can't be lifted cleanly; leave those as camera-move stills.

G6 watch: does the Short feel like it ends, not stops? Is any prop motion code, not AI?
