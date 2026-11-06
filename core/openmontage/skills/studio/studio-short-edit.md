# studio-short: final_edit (G5, edit)

Apply every owner note from G4, or say in one line why not.

1. `overlay_check --fix` before the render; it must exit 0.
2. `pou_compose --size 1080x1920` with the channel music, `--motion` (effect `none`), no `--burn-captions`.
   Compose's Short mode places at most one pencil per 5 s at -26 dB, no page turns, and fades the music out over
   the 2.4 s tail (`core/studio/rules/shorts-sound-ending.md`).
3. `.venv/bin/omni qc <slug> <video> final_edit --media <render>` must pass: loudness inside the channel's
   `loudness.short` targets, no clicks or steps, the 2.4 s fade-out tail, and no near-duplicate of another
   channel's or this channel's recent videos.
4. `status: awaiting_human`, then stop.
