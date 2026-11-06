# Owner rules for Professor of Us

Six rules from the owner's review notes (sourced from the owner's memory notes
`feedback-*.md`, 2026-10-30 to 2026-11-02). Each names its automated check, or is a G6 watch item when no
check exists. `core/studio/tests/test_rules.py` keeps this table and the files in step.

| Rule | Check | Kind |
|---|---|---|
| [viewer-questions](viewer-questions.md) | none for spacing; G6 watch | watch |
| [no-line-boil](no-line-boil.md) | `pou_compose` / `pou_puppet` refuse boil (`boil_in_motion`, `boil_in_stage`) | automated |
| [shorts-sound-ending](shorts-sound-ending.md) | `compose.plan_sfx(short=True)`; `audio_check.py --short` tail | automated |
| [text-placement](text-placement.md) | `overlay_check.py --fix` before every render | automated |
| [dialogue-characters](dialogue-characters.md) | none for dialogue share; G6 watch | watch |
| [no-audio-clicks](no-audio-clicks.md) | `audio_check.py` bursts and steps | automated |
