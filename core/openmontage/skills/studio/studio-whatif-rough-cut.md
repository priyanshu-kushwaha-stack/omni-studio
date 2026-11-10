# studio-whatif: rough_cut (G4)

Scenes live in the video folder, `scenes/` with an `index.ts` entry, and import the kit as `@whatif/kit/...`
(`core/engines/whatif/src/kit`; worked example: `core/engines/whatif/examples/pause-sample`).

**The look test first.** Before the full build, render the one picture only this premise can show (story #8) in two
or three ways, as stills or 5-second clips, and let the owner pick one. The thumbnail and the film hang on this
shot; it is decided from renders, never described. Never restage the picked shot afterwards.

1. Build each `> SCENE:` from the kit, lit by its `> MOOD:` (`moodLook`), with pause bars, named expressions, shot
   helpers, and the channel's rule for sources (Say Suppose: in the description, not on screen). Use the kit: sets as layers at different depths, rigged figures, props. Reuse a
   set before drawing a new one. No AI images and no AI video clips: everything on screen is drawn in code.
   `scenes/Root.tsx` registers two compositions with the same props: `RoughCut` (the film) and `RoughCutSound`, the
   film inside `<SoundOnly.Provider value={true}>` (`@whatif/kit/sound`), which the audio pass renders. Put every
   `<Audio>` outside `<Stage>` and `<Figure>` (as the pause-time film's beats do), or the sound composition drops it.
2. Motion reads named cues anchored to spoken words, never hard-coded times, so a new voice take re-times the
   scene. Something changes every 2 to 4 seconds; no hold is longer than 6 seconds.
3. Life comes from poses, eyes, props and the camera. No lip-sync and no line boil.
4. On-screen text is a tag, a counter or a speech bubble, off faces and inside the safe area
   (`core/studio/rules/text-placement.md`).
5. Check frames with `whatif_stills`, then render the watch copy as a 1280x720 preview into `renders/` (git-ignored)
   with `whatif_render` (`quality` defaults to `preview`). G4 and G5 are always watched at 720p; never render
   1920x1080 before G6.
   In the same sitting as the G4 watch, quote the music (tool, provider, model, cost) and ask the owner's yes, so G5
   does not wait on a second reply.
   `status: awaiting_human`, then stop.
