# studio-whatif: final_edit (G3, picture lock)

The picture loop runs on the narration G2 locked. It ends with the voice A/B, then G3 locks the cut, key shot, text,
music and mix, and the voice the A/B chose. Watch copies are always 1280x720; never render 1920x1080 before G4.

Scenes live in the video folder, `scenes/` with an `index.ts` entry, and import the kit as `@whatif/kit/...`
(`core/engines/whatif/src/kit`; worked example: `core/engines/whatif/examples/pause-sample`).

## The look test first

Before building out, render the one picture only this premise can show (story #8) in two or three ways, as stills or
5-second clips, and let the owner pick one. The thumbnail and the film hang on this shot; it is decided from renders,
never described. Never restage the picked shot afterwards.

## Build

1. Build each `> SCENE:` from the kit, lit by its `> MOOD:` (`moodLook`), with pause bars, named expressions, shot
   helpers, and the channel's rule for sources (Say Suppose: in the description, not on screen). Use the kit: sets as
   layers at different depths, rigged figures, props. Reuse a set before drawing a new one. No AI images and no AI
   video clips: everything on screen is drawn in code. `scenes/Root.tsx` registers two compositions with the same
   props: `RoughCut` (the film) and `RoughCutSound`, the film inside `<SoundOnly.Provider value={true}>`
   (`@whatif/kit/sound`), which the audio pass renders. Put every `<Audio>` outside `<Stage>` and `<Figure>` (as the
   pause-time film's beats do), or the sound composition drops it.
2. Motion reads named cues anchored to spoken words, never hard-coded times, so a new voice take re-times the scene.
   Something changes every 2 to 4 seconds; no hold is longer than 6 seconds.
3. Life comes from poses, eyes, props and the camera. No lip-sync and no line boil.
4. On-screen text is a tag, a counter or a speech bubble, off faces and inside the safe area
   (`core/studio/rules/text-placement.md`).
5. Sound effects and the bed sit under the voice; ducks ramp, cues fade in (`core/studio/rules/no-audio-clicks.md`).
   The last 15 seconds keep the right third of the frame quiet for end screens.
6. Check frames with `whatif_stills`. Build the watch copy at 1280x720 in `renders/` (git-ignored): the picture
   (`whatif_render` `mode: picture`), the sound (`whatif_render` `mode: audio`, `composition: RoughCutSound`, to a
   `.wav`), and the watch file (`whatif_mux` of the two). Every render tool takes the render queue and records its own
   time, so do not wrap it in `studio.jobs run`. Per-video render hours: `python -m studio.jobs report --video <id>
   --step whatif_`. In the same sitting as the first picture watch, quote the music (tool, provider, model, cost) and
   ask the owner's yes.

**A sound-only note** (music level, ducks, an effect's volume, mutes, the narration track): change the code, render
`whatif_render` `mode: audio` (`composition: RoughCutSound`) to a `.wav`, then `whatif_mux` it onto the last picture
pass. Pass `sound_only_change: true` only when every file the mux lists in `scene_files_changed` changes sound alone,
and name those files in the hand-over. A note that moves timing (a gap, a tempo, a new take) changes props.json; the
mux refuses it, so render the picture again. Apply every owner note, or say in one line why not.

## The voice A/B (paid only on the owner's yes)

7. When the picture is near-final, take the opening ten lines and the dilemma line in the paid narrator: rebuild the
   story with `WHATIF_VOICE=paid` (`whatif_story`), quote them (`higgsfield generate cost` per line; the build also
   quotes), announce tool, provider, model and total, and wait for the owner's yes. Then `whatif_narration` with
   `owner_approved_paid_call: true` and `max_credits` set to the approved cap. Paid and local takes are cached apart.
8. The owner compares paid and local by ear on the same lines. If paid is clearly better: quote the full script, get
   the owner's yes, run the full paid batch, and re-render (motion re-times itself on the cue words). If not, the local
   voice ships and nothing more is spent.

## Lock

9. `.venv/bin/omni qc <slug> <video> final_edit --media <render>` must pass: loudness inside the channel's
   `loudness.story` targets, no clicks or steps, no near-duplicate (`omni similar`).
10. `status: awaiting_human`, then stop.
