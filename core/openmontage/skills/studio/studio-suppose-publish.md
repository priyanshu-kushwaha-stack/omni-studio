# studio-suppose: publish_prep (G5, publish)

omni-studio skill for the `studio-suppose` pipeline. `<video>` is `channels/say-suppose/videos/<id>`.

**Gate:** G5, stage `publish_prep`.
**Reads:** `<video>/outline.md` (the G1 title), `claims.md`, `art/thumb_*.png`, the final-watch render.
**Writes:** `publish.md`, `art/thumbnail.jpg`, `upload.yaml`, `qc/publish_prep.json`, the `publish_prep` checkpoint.

1. Write `publish.md` while the final-watch render or watch runs: the G1 title, a description with the sources from
   `claims.md` and 6-8 named chapters (`0:00 <name>`, one per beat of the outline), audience (not made for kids), the
   altered-content answer (the art is AI-made: GPT Image 2.6, and the narration is a synthetic voice), and the pinned
   comment: the film's either/or choice (`CHOICE:` in `outline.md`) asked as a question.
2. **Thumbnail.** Convert the thumbnail the owner picked at G1 (`art/thumb_<k>.png`) to
   `<video>/art/thumbnail.jpg`, a 1280x720 JPG under 2 MB (YouTube's limit; `omni upload` refuses a larger file):

   ```sh
   .venv/bin/python -c "import sys,io; from PIL import Image; im=Image.open(sys.argv[1]).convert('RGB').resize((1280,720)); enc=lambda q:(lambda f:(im.save(f,'JPEG',quality=q),f.getvalue())[1])(io.BytesIO()); open(sys.argv[2],'wb').write(next(d for d in map(enc,(92,85,78,70,60,45)) if len(d)<2_000_000))" $V/art/thumb_<k>.png $V/art/thumbnail.jpg
   ```

   (it keeps the first JPG quality, from 92 down, that comes in under 2 MB). The file stays in the git-ignored `art/` (images are not committed): `omni upload` reads it
   from disk at that path through `thumbnail: art/thumbnail.jpg`, so keep the folder until the upload is done.
   Write `upload.yaml`: `file` (the exact render `final_watch` approved, `render/film-1080p.mp4`), `title`,
   `description`, `tags`, `made_for_kids`, `contains_synthetic_media`, `thumbnail: art/thumbnail.jpg` and optional
   `captions`. No privacy or schedule field: uploads are always private.
3. `.venv/bin/omni upload say-suppose <id>`: the dry run prints the exact private upload. `.venv/bin/omni qc
   say-suppose <id> publish_prep` must pass (claims, cast_claims, loudness, clicks, similarity, upload_request, and the
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
