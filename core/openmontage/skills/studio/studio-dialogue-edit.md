# studio-dialogue: final_edit (G5, edit)

Apply every owner note from G4, or say in one line why not.

1. `overlay_check --fix` before the render; it must exit 0.
2. `pou_compose` with the channel music (`music.allowed` in channel.yaml), `--motion` (effects `none`).
   Shorts use the `studio-short` pipeline (`skills/studio/studio-short-edit.md`).
3. `.venv/bin/omni qc <slug> <video> final_edit --media <render>` must pass: loudness inside the channel's
   `loudness.dialogue` targets, no clicks or steps (`audio_check.py`), no near-duplicate (`omni similar`).
4. `status: awaiting_human`, then stop.
