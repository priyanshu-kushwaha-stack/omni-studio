# studio-dialogue: rough_cut (G4)

1. Scene plan: `scene_plan_from_script.py` (long-form) or `short_plan.py` (Shorts), then
   `scene_plan_check.py` (at least 8 changes per minute).
2. Stills: `pou_stills` (FLUX.2 klein + the channel LoRA, local).
3. Talking puppets: `short_rigs.py` builds rigs and a stage from `anim.json`; speakers get mouths from their own
   line audio (`puppet.py` `mouth_envelope`/`talk_keys`, `short_rigs.py` `dialogue_actions`), listeners look at
   the speaker. Then `pou_puppet` with `clips`. Never `character_rig_renderer`, never `lip_sync`, never boil:
   every stage scene has `"boil": false` and motion.json uses effect `none` (the tools refuse boil).
4. Run the `overlay_check` tool with `--fix` before every render (`core/studio/rules/text-placement.md`).
5. `pou_compose` the rough cut into `renders/` (git-ignored). `status: awaiting_human`, then stop.
