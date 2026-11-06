# studio-short: publish_prep (G7)

1. Write `publish.md` (title, description with sources from `claims.md`, pinned comment) and `upload.yaml`:
   `file`, `title`, `description`, `tags`, and the two answers YouTube needs, `made_for_kids` and
   `contains_synthetic_media` (altered or synthetic content). Defaults come from `channel.yaml` (`made_for_kids`,
   `upload.contains_synthetic_media`); the upload is refused while either is unanswered.
2. Privacy is always private. `upload.yaml` has no privacy or schedule field: `public`, `unlisted`, `publishAt`
   or any scheduling key is refused before the uploader runs.
3. `.venv/bin/omni qc <slug> <video> publish_prep` checks the file `upload.yaml` names (the render approved at G6);
   `.venv/bin/omni upload <slug> <video>` (dry run, the default) prints the exact command and metadata. The owner's
   G7 approval signs that file's sha256 and the upload metadata, and the upload refuses any other file, changed content or changed metadata (finish title, description and tags before G7).
4. `status: awaiting_human`, then stop. A real upload (`--run`) happens only when the owner asks for it, and the
   public flip is always the owner's, by hand in YouTube Studio.
