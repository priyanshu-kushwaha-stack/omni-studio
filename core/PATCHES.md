# Patches to upstream OpenMontage

Every edit inside `core/openmontage/` that is not a new `studio`-named file. Re-check this
list after each `make upstream-pull`. Base: upstream `d21f5d4`.

| File | Change | Why |
|---|---|---|
| `tools/video/hyperframes_compose.py` | Adds `_locked_npm_spec()` and `_NPM_SPEC`, read from `core/lock.yaml`. `_resolve_npm_package`, `_probe_cli` and `_run_hf` use the spec. Sets `HYPERFRAMES_NO_TELEMETRY=1` and `DISABLE_TELEMETRY=1` at import | Pin HyperFrames; telemetry off |
| `tools/tool_registry.py` | Adds `DISABLED_TOOLS`, read from `core/studio/config/disabled_tools.yaml`. `register()` ignores those names and `register_module()` does not report them | Tool denylist |
| `tools/video/video_compose.py` | Accepts `render_runtime="external"`. One branch in `_render` calls the new `_accept_external_render`, which checks the file and runs the final review without rendering. Docstring and error text updated | `external` runtime |
| `schemas/artifacts/edit_decisions.schema.json` | Adds `external` to the `render_runtime` enum | `external` runtime |
| `schemas/artifacts/proposal_packet.schema.json` | Adds `external` to the `render_runtime` enum | `external` runtime |
| `schemas/artifacts/final_review.schema.json` | Adds `external` to the `render_runtime_used` enum | `external` runtime |
| `tests/tools/test_hyperframes_compose.py` | `test_proposal_packet_schema_accepts_render_runtime` expects `external` | That assertion pins the enum changed above |
| `Makefile` | Adds `HYPERFRAMES_SPEC`, read from `core/lock.yaml`. `setup` and `hyperframes-warm` fetch that version | Pin HyperFrames in cache warmers |

## New files with `studio` names

| File | Purpose |
|---|---|
| `STUDIO_PATHS.md` | Says OpenMontage's docs are relative to this folder |

## Known unpinned text

Upstream docs and skills such as `skills/core/hyperframes.md` still say `npx hyperframes`, and
`tests/tools/test_hyperframes_compose.py` asserts that text. They are unchanged. Root
`CLAUDE.md` tells agents to use the locked version.
