# omni-studio

Private multi-channel YouTube studio. OpenMontage is a full-history git subtree in
`core/openmontage/`. The studio layer is `core/studio/`. Channels arrive in Phase 2.

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
| `projects/<id>/` output | `core/openmontage/projects/<id>/` (gitignored) |

Run OpenMontage's Python commands from `core/openmontage/` using the root venv and an
absolute `PYTHONPATH`:

    cd core/openmontage && PYTHONPATH="$PWD:$PWD/.." ../../.venv/bin/python -c "..."

Do not move upstream folders. `video_compose` looks for `remotion-composer/` next to
`tools/`, tools must stay under `tools/`, and pipelines under `pipeline_defs/`.

## Commands

| Command | What it does |
|---|---|
| `make test` | Upstream core suites, then `core/studio/tests` |
| `make board PROJECT=<id>` | Opens Backlot on port 4760. Port 4750 is the owner's other board |
| `make new-channel` | Stub until Phase 2 |
| `make upstream-pull SHA=<commit>` | `git subtree pull`, full history, no squash |
| `.venv/bin/omni status` | Pins, runtimes, disabled tools |

## Gates

Seven human gates. Never skip one, and only the owner passes a gate.

| Gate | Owner approves |
|---|---|
| G1 | Packaging: title and thumbnail |
| G2 | Script, read in full before any asset is generated |
| G3 | Narration lock |
| G4 | Rough cut |
| G5 | Edit |
| G6 | Final watch at 1x, with cold viewers |
| G7 | Publish, by hand in YouTube Studio, private first |

Agents never upload and never make a video public. Done means the owner watched or
listened, not that tests passed. Owner review notes are a to-do list: apply each one or
say in one line why not, then re-present.

## Owner rules

- Banned: `lip_sync`, Wav2Lip, H3 models, and the line-boil or wobble effect. Use camera
  moves and puppet hands, eyes and faces for life.
- Disabled tools are listed in `core/studio/config/disabled_tools.yaml`. MiniMax H3 is also
  the default model of some tools that remain enabled (`minimax_video`, for example), and
  `kling_lip_sync` remains registered. Do not select them.
- No paid provider call without the owner's approval. Announce tool, provider, model and
  cost first.
- Keep secrets in `~/.config/omni-studio/`. Never read or print them.
- Keep rendered media, LoRA weights and virtualenvs out of git.
- Pin every outside tool in `core/lock.yaml`. Skills may say `npx hyperframes`; always run
  the version from the lock, `npx hyperframes@0.9.16`. Review a third-party skill before
  installing it, then record it in the lock.
- Never push to or open anything against `calesthio/OpenMontage`. `gh` defaults to that
  repo here, so always pass `--repo priyanshu-kushwaha-stack/omni-studio`.
- Do not change `~/Exploration/projects/faceless-channel` or `~/Exploration/sandbox/openmontage`.

Video craft rules, from the owner's notes on Professor of Us:

- Characters talk to each other in distinct voices, not documentary narration.
- Ask the viewer a question, pause, then answer, about every 20-30 s.
- Audio: fade line edges, mute end-of-take pops, ramp music ducks, and scan for clicks
  before handing audio over.
- On-screen text stays UI-safe, off the drawing, off faces, and never overlaps.
- Shorts: one quiet pencil sound per 5 s, no page turns, a 2.4 s fade-out tail, and code
  puppets rather than AI clips or wobble.

## Changing upstream files

Inside `core/openmontage/`, add only new files with `studio` in the name. Any other edit
must be listed in `core/PATCHES.md`. Never move or delete upstream files.
