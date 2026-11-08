# studio-whatif: rough_cut (G4)

Scenes live in the video folder, `scenes/` with an `index.ts` entry, and import the kit as `@whatif/kit/...`
(`core/engines/whatif/src/kit`; worked example: `core/engines/whatif/examples/pause-sample`).

1. Build each `> SCENE:` from the kit, lit by its `> MOOD:` (`moodLook`), with pause bars, named expressions, shot
   helpers, and the channel's rule for sources (Say Suppose: in the description, not on screen). Use the kit: sets as layers at different depths, rigged figures, props. Reuse a
   set before drawing a new one. No AI images and no AI video clips: everything on screen is drawn in code.
2. Motion reads named cues anchored to spoken words, never hard-coded times, so a new voice take re-times the
   scene. Something changes every 2 to 4 seconds; no hold is longer than 6 seconds.
3. Life comes from poses, eyes, props and the camera. No lip-sync and no line boil.
4. On-screen text is a tag, a counter or a speech bubble, off faces and inside the safe area
   (`core/studio/rules/text-placement.md`).
5. Check frames with `whatif_stills`, then render 1920x1080 into `renders/` (git-ignored) with `whatif_render`.
   `status: awaiting_human`, then stop.
