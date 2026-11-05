# Phase 2: channel layer

Goal: several channels share one OpenMontage without sharing projects, budgets, playbooks or
assets. Professor of Us is Phase 3.

## What OpenMontage already does, and what we reuse

| Need | Upstream mechanism | Studio adds |
|---|---|---|
| Project folder | `OPENMONTAGE_PROJECTS_DIR` read by `lib/paths.py` | Points it at `channels/<slug>/videos` |
| Gates | `write_checkpoint` raises `GATE VIOLATION` and `PREREQUISITE VIOLATION` | `omni approve`, which calls it |
| Budget | `tools/cost_tracker.py`, `BudgetMode.CAP` | `tracker_for`, which sets the channel's budget. Tools do not call the tracker on their own |
| Playbooks | `load_playbook` by name, falling back to `styles/custom/` | A symlink per channel |
| Board | Backlot on one projects root | One server per channel, ports 4761-4799 |
| Same-named assets | `video_compose` hashes each source path into a per-render `--public-dir` | Nothing. Confirmed on `d21f5d4` with real renders |

## Decisions

- `formats` maps a format name to a pipeline, because `new-video` must know which pipeline to use.
- `review_level` is recorded only. Gates stay in the pipeline manifests, and no setting skips one.
- A video's budget is fixed in its `cost_log.json` when it is created.
- `omni check` validates channel configuration only: not gate state, spend, assets or videos.

## Verification

Each exit check runs against dummy channels that are deleted afterwards. `make test` covers the
rest, and `core/studio/tests/test_channels.py` keeps one real Remotion render.
