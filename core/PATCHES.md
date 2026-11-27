# Patches to upstream OpenMontage

Edits to upstream files: 10 of a budget of about 10.

Every edit inside `core/openmontage/` that is not a new `studio`-named file. Re-check this
list after each `make upstream-pull`. Base: upstream `d21f5d4`.

| File | Change | Why |
|---|---|---|
| `tools/video/hyperframes_compose.py` | Adds `_locked_npm_spec()` and `_NPM_SPEC`, read from `core/lock.yaml`. `_resolve_npm_package`, `_probe_cli` and `_run_hf` use the spec. Sets `HYPERFRAMES_NO_TELEMETRY=1` and `DISABLE_TELEMETRY=1` at import. Raises the `npm view` timeout from 5 s to 30 s | Pin HyperFrames; telemetry off; `npm view` takes about 5 s on this machine, so the old limit falsely reported the runtime as unavailable |
| `tools/tool_registry.py` | Adds `DISABLED_TOOLS`, read from `core/studio/config/disabled_tools.yaml`. `register()` ignores those names and `register_module()` does not report them. Fails closed: a missing, unreadable or malformed file, a missing key, an empty list, or anything other than a list of non-empty strings with no surrounding whitespace raises at import, naming the file and the problem. A full `discover()` of `tools` records every real tool name in `_seen_tool_names` and, if a denylist name matches none, clears the registry and raises | Tool denylist |
| `tools/video/video_compose.py` | Accepts `render_runtime="external"`. One branch in `_render` calls the new `_accept_external_render`, which rejects a missing or zero-byte file and runs the final review without rendering. Docstring and error text updated | `external` runtime |
| `schemas/artifacts/edit_decisions.schema.json` | Adds `external` to the `render_runtime` enum | `external` runtime |
| `schemas/artifacts/proposal_packet.schema.json` | Adds `external` to the `render_runtime` enum | `external` runtime |
| `schemas/artifacts/final_review.schema.json` | Adds `external` to the `render_runtime_used` enum | `external` runtime |
| `tests/tools/test_hyperframes_compose.py` | `test_proposal_packet_schema_accepts_render_runtime` and `test_edit_decisions_schema_accepts_render_runtime` expect `external` | Those assertions pin the enums changed above |
| `Makefile` | Adds `HYPERFRAMES_SPEC`, read from `core/lock.yaml`. `setup` and `hyperframes-warm` fetch that version, and their messages say so | Pin HyperFrames in cache warmers |
| `lib/checkpoint.py` | `write_checkpoint`: on a gated stage, `human_approved=True` for a studio channel project must carry a valid `lib/studio_approval.py` proof, or it raises `GATE VIOLATION`. `_enforce_stage_prerequisites`: a gated (by manifest or by its own `human_approval_required`) predecessor of a channel project counts as unapproved unless its proof verifies. Projects outside a channel are unchanged | Gate bypass: only `omni approve` can mark a gated stage approved. A direct `write_checkpoint(human_approved=True)`, a hand-edited checkpoint, or artifacts changed after approval are refused. Tests: `core/studio/tests/test_gate_bypass.py`. Also, `validate_checkpoint` and `_validate_artifacts_for_stage` validate through `lib/studio_schema.py` (artifacts with `load_schema(name)`, the schema `validate_artifact` loads), so a schema is checked against its metaschema once, not on every call |
| `styles/playbook_loader.py` | `validate_playbook` calls `lib/studio_schema.validate` instead of `jsonschema.validate` | Speed: `jsonschema.validate` re-checked the playbook schema (about 50 ms) on every call, and a gate run loads playbooks hundreds of times. Same errors (`best_match`). Cut `core/studio/tests` from 268 s to 124 s with the test-media cache. Tests: `core/studio/tests/test_studio_schema.py` |

## New files with `studio` names

| File | Purpose |
|---|---|
| `STUDIO_PATHS.md` | Says OpenMontage's docs are relative to this folder |
| `lib/studio_approval.py` | HMAC proof for `omni approve` (and `sign_media`/`verify_media`, binding an approval to a file's sha256 and, for publish approvals, the upload metadata digest; the stage proof also covers `approval.media`), keyed from `~/.config/omni-studio/approval.key` (made on first approval, mode 600); `verify` is what `lib/checkpoint.py` calls |
| `lib/studio_schema.py` | `validate(instance, schema)`: `jsonschema.validate` with the checked validator kept per schema (keyed by the schema's JSON in its own key order); same `best_match` error, an invalid schema raises `SchemaError` every time and is never kept. Used by `lib/checkpoint.py` and `styles/playbook_loader.py` |
| `tools/studio/__init__.py`, `tools/studio/studio_pou_tools.py` | `pou_tts`, `pou_stills`, `pou_puppet`, `pou_compose`, `overlay_check`: the Professor of Us engine (`core/engines/pou`) by subprocess, auto-discovered; each tool run is timed through `studio.jobs.timing.record_tool` (a decorator that is a no-op when `studio` is not importable) |
| `pipeline_defs/studio-dialogue.yaml` | Seven owner gates G1-G7 for dialogue explainers; `metadata.studio_checks` per stage |
| `skills/studio/studio-dialogue-*.md` | One stage skill per gate |
| `pipeline_defs/studio-short.yaml` | Seven owner gates G1-G7 for 9:16 Shorts (Shorts sound and ending rule); `metadata.studio_checks` |
| `skills/studio/studio-short-*.md` | One stage skill per gate for Shorts |
| `pipeline_defs/studio-whatif.yaml` | Seven owner gates G1-G7 for Say Suppose's second-person what-if stories; `metadata.studio_checks`, and `metadata.studio_warnings` (`opening`: reported, never blocks); names the `whatif_*` tools |
| `skills/studio/studio-whatif-*.md` | One stage skill per gate for what-if stories |
| `pipeline_defs/studio-suppose.yaml` | Five owner gates G1-G5 for Say Suppose films on the film kit (the five stage names of `studio-whatif`); `metadata.studio_checks` as studio-whatif's plus `cast_claims` at story_script and publish_prep, and the same `metadata.studio_warnings`; no OpenMontage tools (the kit renders, `render_runtime: external`) |
| `skills/studio/studio-suppose-*.md` | One stage skill per gate for film-kit films: the prompts in `channels/say-suppose/prompts/` and the scripts in `core/engines/suppose/scripts/` in order |
| `tools/studio/studio_whatif_tools.py` | `whatif_story`, `whatif_narration`, `whatif_render`, `whatif_stills`: the what-if engine (`core/engines/whatif`) by subprocess, auto-discovered. `whatif_narration` passes a credit cap only with the owner's approval |
| `skills/studio/studio-room.md` | The quality room loop for G1 packaging and G2 script (`python -m studio.room`, `core/studio/room/`): lint, seats, judge, report, verify |

## Generated links

`omni new-channel <slug>` adds `styles/custom/<slug>.yaml`, a relative symlink to
`../../../../channels/<slug>/playbook.yaml`. Upstream loads playbooks by file name, so this file
is named for the channel rather than `studio`. Nothing else is written inside `core/openmontage/`.
It adds no code and needs no re-check after an upstream pull. Root `.gitignore` ignores
`core/openmontage/styles/custom/*.yaml`, so these links are never committed; a fresh clone has none
until each channel's link is made again: run `omni link` (or `make links`) once after cloning.

## Upstream tests the denylist affects

No upstream test file is edited for this. Root `Makefile` deselects
`tests/contracts/test_kling_official_avatar.py::test_registry_discovers_kling_lip_sync`, which
asserts a banned tool is discovered. `test_agent_skill_pointer_resolves` is generated per
registered tool, so each denylisted tool removes its cases from the collected count.

`tests/tools` is not in `make test`. Two of its tests are red by design because they assert a
banned tool is discovered: `tests/tools/test_minimax_video.py::test_minimax_video_is_discovered_as_direct_provider`
(`minimax_video`, which defaults to H3) and
`tests/tools/test_new_video_model_support.py::test_fal_gemini_omni_and_minimax_h3_are_discovered_and_submit`
(`minimax_fal_video`, which can only run H3).

## Upstream tests that channel playbooks affect

No upstream test file is edited for this either. `tests/contracts/test_remotion_theme_playbook_keys.py` and
`test_theme_text_contrast_contract.py` enumerate `list_playbooks()`, which includes `styles/custom/`, and then
read `styles/<name>.yaml`, so any real channel link fails them. Root `Makefile` loads `-p studio.pytest_upstream`
(`core/studio/pytest_upstream.py`), which hides channel links from that enumeration for the upstream run only.
`core/studio/tests/test_channel_playbooks.py` runs the same checks on each channel playbook by its real path.
professor-of-us fails upstream's caption contrast (dark bar on cream paper, 1.7:1); that test is a strict xfail
because the channel renders outside `video_compose`.

`pou_tts` declares capability `studio_tts`, not `tts`: `test_phase3_contracts.py::test_registry_catalog_views`
pins the exact set of tts providers.

## Known unpinned text

Upstream docs and skills such as `skills/core/hyperframes.md` still say `npx hyperframes`, and
`tests/tools/test_hyperframes_compose.py` asserts that text. They are unchanged. Root
`CLAUDE.md` tells agents to use the locked version.
