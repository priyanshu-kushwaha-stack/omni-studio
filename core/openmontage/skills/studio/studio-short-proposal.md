# studio-short: proposal (G1, packaging)

omni-studio skill for the `studio-short` pipeline (9:16 Shorts). Channel files live in `channels/<slug>/`; the
engine is `core/engines/pou/scripts/` (paths from the omni-studio root). Read `channels/<slug>/style.md`,
`cast.md` and `core/studio/rules/shorts-sound-ending.md` first. Watch the approved reference clip named in
`core/reference/short/` before planning: it is how a Short should look and sound.

## Do
1. One question the viewer already half-knows, answered in under 58 s. Write `packaging.md`: three title +
   hook-frame pairs (title under 40 characters; the first frame is the thumbnail), the premise in two lines.
2. Write a schema-valid `proposal_packet`.
3. **Render runtime.** Shorts render with the Professor of Us engine (`pou_compose --size 1080x1920`,
   `pou_puppet`), not `video_compose`. Set `render_runtime: "external"`. Do not silently assume Remotion: present
   both alternatives to the owner in one line each (Remotion or hyperframes through `video_compose`, versus the
   engine), say why the engine is the default (code puppets, the channel's paper look, the owner-approved Short
   reference), and log the choice in `decision_log` with category `render_runtime_selection`.
4. Write the checkpoint with `status: awaiting_human` and stop. Only the owner passes G1, with `omni approve`.

## Never
- Generate assets, call a paid provider, or approve a gate yourself.
