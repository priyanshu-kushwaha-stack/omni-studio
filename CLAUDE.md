# omni-studio

Private multi-channel YouTube studio. OpenMontage is a full-history git subtree in
`core/openmontage/`. The studio layer is `core/studio/`. Channels live in `channels/<slug>/`.

## Using OpenMontage from this root

**Before any video production request, read `core/openmontage/AGENT_GUIDE.md`.**

**Every path in OpenMontage's docs is relative to `core/openmontage/`.** When a doc says
`skills/meta/onboarding.md`, open `core/openmontage/skills/meta/onboarding.md`.

| Docs say | Open from the root |
|---|---|
| `AGENT_GUIDE.md`, `PROJECT_CONTEXT.md` | `core/openmontage/<same>` |
| `skills/` (Layer 2) | `core/openmontage/skills/` |
| `.agents/skills/` (Layer 3) | `core/openmontage/.agents/skills/` |
| `pipeline_defs/`, `schemas/`, `styles/`, `tools/` | `core/openmontage/<same>` |
| `projects/<id>/` output | `channels/<slug>/videos/<id>/`, the channel's `OPENMONTAGE_PROJECTS_DIR` |

Run OpenMontage's Python commands from `core/openmontage/` using the root venv and an
absolute `PYTHONPATH`:

    cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." ../../.venv/bin/python -c "..."

Do not move upstream folders. `video_compose` looks for `remotion-composer/` next to
`tools/`, tools must stay under `tools/`, and pipelines under `pipeline_defs/`.

## Commands

| Command | What it does |
|---|---|
| `make test` | Upstream core suites, then `core/studio/tests`, then the engine's `core/engines/pou/tests` |
| `make board CHANNEL=<slug>` | That channel's Backlot board, on a port from 4761. Port 4750 is the owner's other board |
| `make new-channel SLUG=<slug>` | Same as `omni new-channel` |
| `make links` / `omni link` | Re-create every channel's git-ignored playbook link. Run once after a fresh clone |
| `make upstream-pull SHA=<commit>` | `git subtree pull`, full history, no squash |
| `.venv/bin/omni status` | Pins, runtimes, disabled tools, and every channel with its pending gates |
| `omni new-channel <slug>` | Scaffold from `channels/_template` and link the playbook |
| `omni new-video <slug> "<title>" --format <name>` | Project folder with the channel's budget |
| `omni approve <slug> <video> <stage>` | Pass a gate. Only when the owner says so |
| `omni check [<slug>]` | Validate channels |
| `omni fix <slug> --format --stage --severity --example` | Record a note in `core/studio/issues/` |
| `omni qc <slug> <video> <stage> [--media f]` | Run a stage's automated checks (claims, quiz boards, loudness, clicks, similarity, upload request); writes `videos/<id>/qc/<stage>.json` |
| `omni similar <slug> <video>` | Near-duplicate check against every other channel and the channel's recent videos |
| `omni upload <slug> <video>` | Dry run (the default) of a private YouTube upload through the pinned youtubeuploader. `--install` installs the pinned binary into `.tools/` |
| `omni youtube-auth <slug>` | Owner only. Google consent for the channel; the token is saved only if `channels.list(mine=true)` is the channel's `youtube_channel_id` |
| `omni approve-upload <slug> <video> --format <f>` | Owner only. For an imported video marked `legacy_upload: true` in its `upload.yaml` and with no pipeline state (no project.json, no `checkpoint_*.json`), e.g. the tails Short: runs the publish_prep checks on `upload.yaml`'s file and signs its sha256 and the upload metadata digest |

Before running OpenMontage for a channel, export the line `omni new-video` prints:
`OPENMONTAGE_PROJECTS_DIR=<root>/channels/<slug>/videos`. Track spend with
`studio.channels.tracker_for(channel, video_id)`, which caps at the channel's budget. Tools do
not call it for you. Do not render with files in `remotion-composer/public/`; `video_compose`
staging keeps same-named assets from different channels apart.

## Professor of Us engine

`core/engines/pou/` is faceless-channel's `scripts/` and `tests/`, imported with history. The scripts import each
other as siblings (`import compose`), so keep them in one folder. They read channel paths from
`channels/<slug>/engine.yaml` through `scripts/pou_paths.py`; `POU_CHANNEL_DIR` picks the channel (default
`channels/professor-of-us`). Paths stored in a video (stage.json, rig sources) are relative to the channel folder.

Run the engine through the studio tools (`pou_tts`, `pou_stills`, `pou_puppet`, `pou_compose`,
`overlay_check`), or directly with `.venv/bin/python core/engines/pou/scripts/<script>.py`. Media models run in
`.venv-media` (NumPy 1.26, torch, mlx, mflux, chatterbox), built from `requirements-media.lock.txt` with
`uv pip install --no-deps`; the core `.venv` keeps NumPy 2.x. Before every render run `overlay_check.py --fix`
and, on the result, `audio_check.py`. The owner's craft rules and their checks are in `core/studio/rules/`.

## Gates

Seven human gates. Never skip one, and only the owner passes a gate. Agents write
`awaiting_human` and stop. On a channel project, OpenMontage accepts an approval only with the proof
`omni approve` writes (`lib/studio_approval.py`, patch 9): a direct `write_checkpoint(human_approved=True)` or
a hand-edited checkpoint is refused. Never call `write_checkpoint` with `human_approved=True` or run
`omni approve` yourself unless the owner told you to approve that stage.

| Gate | Owner approves |
|---|---|
| G1 | Packaging: title and thumbnail |
| G2 | Script, read in full before any asset is generated |
| G3 | Narration lock |
| G4 | Rough cut |
| G5 | Edit |
| G6 | Final watch at 1x, with cold viewers |
| G7 | Publish: upload private first; the public flip is by hand in YouTube Studio |

Pipelines name automated checks per stage in `metadata.studio_checks` (`core/studio/checks.py`). `omni approve`
re-runs them and refuses to sign while any fails, so the owner's approval can't pass a gate whose claims ledger,
loudness, clicks or similarity check is red. A check never passes a gate by itself.

`review_level` in channel.yaml is a recorded label only: it never skips or adds a gate.

Agents never upload and never make a video public. `omni upload` is a dry run unless `--run --confirm
<slug>/<video>` is given, and an agent passes `--run` only when the owner asked for that exact upload. Uploads are
always private and there is no privacy flag: public, unlisted and any schedule (`publishAt`) in `upload.yaml` are
refused before the binary runs, and `made_for_kids` and `contains_synthetic_media` must both be answered
(channel.yaml or the video's `upload.yaml`). The upload must be the exact file the checks passed on: `omni approve`
of publish_prep (G7), or `omni approve-upload` for a `legacy_upload: true` video with no pipeline state, signs that
file's path and sha256 and a digest of the upload metadata (the metaJSON: title, description, tags, category,
language, privacy, kids and AI answers). `omni upload` re-hashes the file, refuses any other path, changed content
or changed metadata, and gives youtubeuploader a private copy (0700 temp dir) hashed after copying. A pipeline video
cannot reach G7 without a valid G6 media proof: publish_prep's `deliverable` check fails when final_watch is
unapproved or its media proof is missing, forged or edited (the G6 stage proof covers approval.media).
youtubeuploader cannot do consent without uploading, and its own first-run consent could not check the channel
first, so `omni upload --run` needs a token made by `omni youtube-auth`, which checks the channel before saving it
(PKCE S256, loopback redirect only).

Test upload, owner only: set the title in `upload.yaml` (e.g. `[TEST] ...`) BEFORE `omni approve-upload` (or
before G7), because the approval signs the metadata. Any later change to the title, description, tags, category,
language or the kids or AI answer needs the owner to approve again; restoring the approved text matches again.

Who can approve: `omni approve` and `omni approve-upload` are owner-only by convention, backed by the approval key
(`~/.config/omni-studio/approval.key`, mode 600). The key is not a security boundary against a process running as
the owner: an agent with shell access that read or used that key could approve its own work. So agents never
read, copy, create or chmod the approval key, never set `OMNI_STUDIO_APPROVAL_KEY`, and never run `omni approve` or
`omni approve-upload`, unless the owner told them to approve that exact stage or upload.
Done means the owner watched or
listened, not that tests passed. Owner review notes are a to-do list: apply each one or
say in one line why not, then re-present.

## Owner rules

- Banned: `lip_sync`, Wav2Lip, H3 models, and the line-boil or wobble effect. Use camera
  moves and puppet hands, eyes and faces for life.
- Disabled tools are listed in `core/studio/config/disabled_tools.yaml`. `atlas_video` and
  `comfyui_video` stay enabled because they default to other models, but each can still select
  MiniMax H3 if asked. Never pass them `minimax/h3/*`, `minimax_h3_api` or `minimax_h3_local`.
- No paid provider call without the owner's approval. Announce tool, provider, model and
  cost first.
- Keep secrets in `~/.config/omni-studio/`. Never read or print them. Only `omni upload --run` reads the OAuth
  client and the channel token, in memory, to upload and read the result back.
- Keep rendered media, LoRA weights and virtualenvs out of git.
- Pin every outside tool in `core/lock.yaml` (youtubeuploader is pinned with the sha256 of its tarball and binary). Skills may say `npx hyperframes`; always run
  the version from the lock, `npx hyperframes@0.9.16`. Review a third-party skill before
  installing it, then record it in the lock.
- Never push to or open anything against `calesthio/OpenMontage`. `gh` defaults to that
  repo here, so always pass `--repo priyanshu-kushwaha-stack/omni-studio`.
- Do not change `~/Exploration/projects/faceless-channel` or `~/Exploration/sandbox/openmontage`.

Video craft rules, from the owner's notes on Professor of Us:

- Characters talk to each other in distinct voices, not documentary narration.
- Ask a question about every 20-30 s inside the dialogue; a character answers at once. No pause, no quiz boards
  (owner, 2026-11-06).
- Audio: fade line edges, mute end-of-take pops, ramp music ducks, and scan for clicks
  before handing audio over.
- On-screen text stays UI-safe, off the drawing, off faces, and never overlaps.
- Shorts: one quiet pencil sound per 5 s, no page turns, a 2.4 s fade-out tail, and code
  puppets rather than AI clips or wobble.

## Changing upstream files

Inside `core/openmontage/`, add only new files with `studio` in the name. Any other edit
must be listed in `core/PATCHES.md`. Never move or delete upstream files.
