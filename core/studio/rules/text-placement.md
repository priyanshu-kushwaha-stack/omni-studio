# Text placement

check: automated. `overlay_check.py <video> --fix` before every render, Shorts and long-form; exit 1 on any fail.
For a Short outside `shorts/`, it finds the 9:16 frame from `anim.json`, or pass `--size 1080x1920`.

Owner on 2026-10-31 (Shorts draft v3): "we need to improve where we are writing the text in the videos. There
should be some check to validate that position."

Why: labels landed under the Shorts player chrome (top icons, bottom title strip, right button column), on top of
drawings, and captions crossed faces; nothing checked positions.

How: faces come from `anim.json` eyes, so rig characters before the check. When a label fits nowhere, drop it if
the caption already says it. Shorts still prompts keep the top fifth and the 56-72 % band as empty paper.
Update 2026-10-31: Shorts render without `--burn-captions` and no SRT is uploaded; `overlay_check` checks
captions only with `--captions`.
