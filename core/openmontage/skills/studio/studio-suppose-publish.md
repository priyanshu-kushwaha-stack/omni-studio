# studio-suppose: publish_prep (G5, publish)

omni-studio skill for the `studio-suppose` pipeline. `<video>` is `channels/say-suppose/videos/<id>`.

**Gate:** G5, stage `publish_prep`.
**Reads:** `<video>/outline.md` (the G1 title), `claims.md`, `art/thumb_*.png`, the final-watch render.
**Writes:** `publish.md`, `upload.yaml`, `qc/publish_prep.json`, the `publish_prep` checkpoint.

1. Write `publish.md` while the final-watch render or watch runs: the G1 title, a description with the sources from
   `claims.md` and 6-8 named chapters (`0:00 <name>`, one per beat of the outline), audience (not made for kids), the
   altered-content answer (the art is AI-made: GPT Image 2.6, and the narration is a synthetic voice), and the pinned
   comment: the film's either/or choice (`CHOICE:` in `outline.md`) asked as a question.
2. Write `upload.yaml`: `file` (the exact render `final_watch` approved, `render/film-1080p.mp4`), `title`,
   `description`, `tags`, `made_for_kids`, `contains_synthetic_media`, optional `thumbnail` (the thumbnail the owner
   picked at G1, a JPG or PNG of at most 2 MB in the video folder) and optional `captions`. No privacy or schedule
   field: uploads are always private.
3. `.venv/bin/omni upload say-suppose <id>`: the dry run prints the exact private upload. `.venv/bin/omni qc
   say-suppose <id> publish_prep` must pass (claims, loudness, clicks, similarity, upload_request, and the
   deliverable proof from final_watch).
4. Write the `publish_prep` checkpoint with `status: awaiting_human` and stop; only the owner passes the gate, with
   `omni approve`.

The owner's G5 approval signs the file and the upload metadata; any later change to the title, description, tags,
category, language or the kids or AI answer needs the owner to approve again. A real upload (`omni upload --run
--confirm say-suppose/<id>`) happens only when the owner asks for that exact upload, and it is always private. The
public flip is the owner's, by hand in YouTube Studio. After upload, remind the owner to run YouTube's Test & Compare
with the three G1 thumbnails (`say-suppose-thumbnails`). What only Studio does (dub tracks, end screens, the A/B test,
the pinned comment, the public flip) is listed in `studio-whatif-publish`.

## Never

- Upload, or make a video public. Run `omni approve`, read the approval key, or set `OMNI_STUDIO_APPROVAL_KEY`.
- Put public, unlisted or a schedule in `upload.yaml`.
- Change studio, engine, kit or library code; record the need with `omni fix` and carry on.
