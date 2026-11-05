# Patches to upstream OpenMontage

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

## New files with `studio` names

| File | Purpose |
|---|---|
| `STUDIO_PATHS.md` | Says OpenMontage's docs are relative to this folder |

## Generated links

`omni new-channel <slug>` adds `styles/custom/<slug>.yaml`, a relative symlink to
`../../../../channels/<slug>/playbook.yaml`. Upstream loads playbooks by file name, so this file
is named for the channel rather than `studio`. Nothing else is written inside `core/openmontage/`.
It adds no code and needs no re-check after an upstream pull. `styles/custom/` holds no other file
in this repo.

## Upstream tests the denylist affects

No upstream test file is edited for this. Root `Makefile` deselects
`tests/contracts/test_kling_official_avatar.py::test_registry_discovers_kling_lip_sync`, which
asserts a banned tool is discovered. `test_agent_skill_pointer_resolves` is generated per
registered tool, so each denylisted tool removes its cases from the collected count.

## Known unpinned text

Upstream docs and skills such as `skills/core/hyperframes.md` still say `npx hyperframes`, and
`tests/tools/test_hyperframes_compose.py` asserts that text. They are unchanged. Root
`CLAUDE.md` tells agents to use the locked version.
