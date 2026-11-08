# studio-whatif: final_edit (G5, edit)

Apply every owner note from G4, or say in one line why not.

1. Sound effects and the bed sit under the voice; ducks ramp, cues fade in (`core/studio/rules/no-audio-clicks.md`).
2. The last 15 seconds keep the right third of the frame quiet for end screens.
3. `.venv/bin/omni qc <slug> <video> final_edit --media <render>` must pass: loudness inside the channel's
   `loudness.story` targets, no clicks or steps, no near-duplicate (`omni similar`).
4. `status: awaiting_human`, then stop.
