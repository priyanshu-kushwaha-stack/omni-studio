# studio-whatif: proposal (G1, packaging)

omni-studio skill for the `studio-whatif` pipeline. Channel files live in `channels/<slug>/`. Read
`channels/<slug>/style.md` and `cast.md` first.

## Do
1. Take the topic from `channels/<slug>/backlog/topics.yaml`, or from the owner. Write `packaging.md` in the
   video folder: three title + thumbnail pairs that make one promise, and the premise in two lines. Lint every
   title with the yt-package skill's `title.py`. The thumbnail carries at most three words and never repeats
   the title.
2. Write a schema-valid `proposal_packet`.
3. **Render runtime.** This pipeline renders with the channel's own paper-cut engine, not `video_compose`. Set
   `render_runtime: "external"`. Do not silently assume it: present the alternatives to the owner in one line
   each (Remotion or hyperframes through `video_compose`, versus the engine), say why the engine is the default
   here (the owner-approved look, figures timed to cue words), and log the choice in `decision_log` with
   category `render_runtime_selection`.
4. Write the checkpoint with `status: awaiting_human` and stop. Only the owner passes G1, with `omni approve`.

## Never
- Generate assets, call a paid provider, or approve a gate yourself.
