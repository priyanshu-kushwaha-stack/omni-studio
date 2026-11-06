# studio-short: publish_prep (G7)

1. Write `publish.md` (title, description with sources from `claims.md`, pinned comment) and `upload.yaml`:
   `file`, `title`, `description`, `tags`, and the two answers YouTube needs, `made_for_kids` and
   `contains_synthetic_media` (altered or synthetic content). Defaults come from `channel.yaml` (`made_for_kids`,
   `upload.contains_synthetic_media`); the upload is refused while either is unanswered.
2. Privacy is always private. `upload.yaml` has no privacy or schedule field: `public`, `unlisted`, `publishAt`
   or any scheduling key is refused before the uploader runs.
3. `.venv/bin/omni upload <slug> <video>` (dry run, the default) prints the exact command and metadata.
4. `status: awaiting_human`, then stop. A real upload (`--run`) happens only when the owner asks for it, and the
   public flip is always the owner's, by hand in YouTube Studio.
