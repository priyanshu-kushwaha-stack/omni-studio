# studio-suppose: proposal (G1, packaging)

omni-studio skill for the `studio-suppose` pipeline (Say Suppose films on the film kit; spec
`docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md`, "From topic to a 720p first cut"). Paths are from
the repo root. `<video>` is `channels/say-suppose/videos/<id>`.

**Gate:** G1, stage `proposal`. The owner passes the packaging and, with it, OKs the art spend quoted in `art.yaml`.

**Reads:** the owner's picked title (from the topic skill, `say-suppose-topics`, which runs `prompts/topic.md`),
`channels/say-suppose/library/cast/cast.json`, `channels/say-suppose/prompts/outline.md`, `prompts/thumbnail.md`,
`prompts/set-plate.md`, `prompts/parts-sheet.md`, `prompts/cast-lineup.md`.
**Writes:** `<video>/outline.md`, `<video>/art/thumb_*.png`, `<video>/art.yaml`, `<video>/review/proposal.html`, the
`proposal_packet` and the `proposal` checkpoint.

## Do

1. `.venv/bin/omni new-video say-suppose "<title>" --format film`, and export the `OPENMONTAGE_PROJECTS_DIR` line it
   prints.
2. **Outline.** Fill `channels/say-suppose/prompts/outline.md`: `{{title}}`, `{{series_context}}` ("standalone", or
   the previous episode) and `{{cast_library}}` (the `id, roles, signature` lines from `cast.json`). Answer it, check
   the answer against the prompt's checklist, and save the **raw answer unchanged** to `<video>/outline.md`.
   `review.py` builds the G1 page from that exact file and its labels (`TITLE:`, `ALT TITLES:`, `SYNOPSIS:`,
   `CHARACTERS:`, `RULE:`, `OUTLINE:`, `PLANTED:`, `CHOICE:`, `FACTS:`); never rename, reorder or reformat them.
   Write the five lines and `> UNDER:` the stage has always asked for into the proposal packet.
3. **Thumbnails.** Run the `say-suppose-thumbnails` skill (`.claude/skills/say-suppose-thumbnails`) for three
   thumbnails. It is a paid call: Higgsfield GPT Image 2.6, 2 credits an image, 6 credits for three. Announce tool,
   model and cost and wait for the owner's OK before any call. Save the captioned results as
   `<video>/art/thumb_1.png` ... `thumb_3.png` (the review page's feed mock reads `art/thumb_*.png`).
4. **Art list.** Write `<video>/art.yaml`: the library sets and cast members the film reuses, and every new set
   (one plate per angle, `prompts/set-plate.md`), character (`prompts/cast-lineup.md`, then `prompts/parts-sheet.md`)
   and prop, each with its filled prompt and references, and the total credit quote (GPT Image 2.6 at 2 credits an
   image). Reuse the library before asking for new art. The owner's G1 approval OKs exactly this spend and no more.
5. **Review page.** `.venv/bin/python core/engines/suppose/scripts/review.py <video> proposal` writes
   `<video>/review/proposal.html`; publish it as an Artifact and give the owner the link.
6. Write a schema-valid `proposal_packet`. **Render runtime:** this pipeline renders with the film kit
   (`core/engines/suppose/kit`, `filmRoot`), not `video_compose`, so set `render_runtime: "external"`. Do not
   silently assume it: present the alternatives to the owner in one line each (Remotion or hyperframes through
   `video_compose`, versus the kit), say why the kit is the default here (the library's sets and rigged cast, shots
   timed to the narration's words), and log the choice in `decision_log` with category `render_runtime_selection`.
7. Write the `proposal` checkpoint with `status: awaiting_human` and stop; only the owner passes the gate, with
   `omni approve`.

## Never

- Make a paid call (thumbnails or art) without the owner's OK with tool, model and cost stated first.
- Run `omni approve`, read the approval key, upload, or make a video public.
- Commit media: images in `art/` stay out of git.
- Change studio, engine, kit or library code; record a need with `omni fix` and carry on.
