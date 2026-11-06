# studio-dialogue: final_edit (G5, edit)

Apply every owner note from G4, or say in one line why not.

1. `overlay_check --fix` before the render; it must exit 0.
2. `pou_compose` with the channel music (`music.allowed` in channel.yaml), `--motion` (effects `none`).
   Shorts: `--size 1080x1920`, no `--burn-captions`; compose spaces pencils 5 s apart at -26 dB, drops page
   turns and holds 2.4 s after the last word while the music fades (`core/studio/rules/shorts-sound-ending.md`).
3. `audio_check.py <render> --words <words.json>` (add `--short` for Shorts) must exit 0.
4. `status: awaiting_human`, then stop.
