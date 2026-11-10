# studio-whatif: final_edit (G5, edit)

Apply every owner note from G4, or say in one line why not.

**A sound-only note** (music level, ducks, an effect's volume, mutes, the narration track): change the code, render
`whatif_render` `mode: audio` (`composition: RoughCutSound`) to a `.wav`, then `whatif_mux` it onto the last picture
pass (`whatif_render` `mode: picture`). Pass `sound_only_change: true` only when every file the mux lists in
`scene_files_changed` changes sound alone, and name those files in the hand-over. A note that moves timing (a gap, a
tempo, a new take) changes props.json; the mux refuses it, so render the picture again. The watch copy stays 1280x720.

1. Sound effects and the bed sit under the voice; ducks ramp, cues fade in (`core/studio/rules/no-audio-clicks.md`).
2. The last 15 seconds keep the right third of the frame quiet for end screens.
3. `.venv/bin/omni qc <slug> <video> final_edit --media <render>` must pass: loudness inside the channel's
   `loudness.story` targets, no clicks or steps, no near-duplicate (`omni similar`).
4. `status: awaiting_human`, then stop.
