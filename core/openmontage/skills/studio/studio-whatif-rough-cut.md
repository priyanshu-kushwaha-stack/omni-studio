# studio-whatif: rough_cut (G4)

The engine is not in this repo yet (`pipeline_defs/studio-whatif.yaml`). Do not start this stage until it is.

1. Build each `> SCENE:` from the scene kit: sets as layers at different depths, rigged figures, props. Reuse a
   set before drawing a new one. No AI images and no AI video clips: everything on screen is drawn in code.
2. Motion reads named cues anchored to spoken words, never hard-coded times, so a new voice take re-times the
   scene. Something changes every 2 to 4 seconds; no hold is longer than 6 seconds.
3. Life comes from poses, eyes, props and the camera. No lip-sync and no line boil.
4. On-screen text is a tag, a counter or a speech bubble, off faces and inside the safe area
   (`core/studio/rules/text-placement.md`).
5. Render 1920x1080 into `renders/` (git-ignored). `status: awaiting_human`, then stop.
