# studio-short: rough_cut (G4)

1. `shots.json` (one still per anchor phrase, a change every 2-4 s), then `short_plan.py <video>`: it holds 2.4 s
   after the last word.
2. Stills: `pou_stills` at 9:16 (FLUX.2 klein + the channel LoRA, local).
3. Life comes from code puppets only: `short_rigs.py` (blinks, eye darts, head tilts, props that swing, bob,
   enter or exit; speakers' mouths from their own line audio) and `pou_puppet` with `clips`. No AI motion clips,
   no `lip_sync`, no `character_rig_renderer`, never boil (`"boil": false`, motion effect `none`).
4. `overlay_check --fix` before every render (`core/studio/rules/text-placement.md`), then `pou_compose
   --size 1080x1920` into `renders/` (git-ignored). `status: awaiting_human`, then stop.
