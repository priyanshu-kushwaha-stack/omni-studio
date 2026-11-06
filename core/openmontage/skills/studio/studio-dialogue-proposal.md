# studio-dialogue: proposal (G1, packaging)

omni-studio skill for the `studio-dialogue` pipeline. Channel files live in `channels/<slug>/`; the engine is
`core/engines/pou/scripts/` (paths from the omni-studio root). Read `channels/<slug>/style.md` and `cast.md` first.

## Do
1. Pick the topic from `channels/<slug>/backlog/topics.yaml`. Write `packaging.md` in the video folder: three
   title + thumbnail pairs that make one promise, and the premise in two lines (use the yt-package skill to lint).
2. Write a schema-valid `proposal_packet`.
3. **Render runtime.** This pipeline renders with the Professor of Us engine (`pou_compose`, `pou_puppet`), not
   `video_compose`. Set `render_runtime: "external"`. Do not silently assume Remotion: present both
   alternatives to the owner in one line each (Remotion or hyperframes through `video_compose`, versus the
   engine), say why the engine is the default here (code puppets, the channel's paper look, owner-approved
   pipeline), and log the choice in `decision_log` with category `render_runtime_selection`.
4. Write the checkpoint with `status: awaiting_human` and stop. Only the owner passes G1, with `omni approve`.

## Never
- Generate assets, call a paid provider, or approve a gate yourself.
