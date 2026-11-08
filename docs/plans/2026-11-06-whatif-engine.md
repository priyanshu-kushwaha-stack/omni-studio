# What-if engine: implementation plan

Spec: `docs/superpowers/specs/2026-11-06-whatif-engine-design.md`.

**Goal:** the owner's sample renders from omni-studio through a shared kit, with the adopted quality layer, studio
tools and pins, and `make test` green.

## Constraints

- Read the sandbox (`~/Exploration/sandbox/what-if-pause`); never write to it.
- New `studio`-named files only under `core/openmontage/`, listed in `core/PATCHES.md`. The engine is under
  `core/engines/whatif/`, beside `core/engines/pou`, which is not touched.
- No paid call. The parity render reuses the sample's cached voice takes, copied into a git-ignored folder.
- `node_modules/`, `public/`, `out/` and media are git-ignored. Node through nvm: `source ~/.nvm/nvm.sh` in the same
  command as pnpm or npx.
- Commit after each task. No push.

## Task 1: import the kit with its tests

- [ ] Copy `src/`, `pipeline/`, `tests/`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json` from the sandbox into
      `core/engines/whatif/`. Move the shared parts into `src/kit/`; the four scenes, `Video.tsx` and `pause.json`
      into `examples/pause-sample/`. Add the engine's `.gitignore`.
- [ ] `pnpm install --frozen-lockfile`; `pnpm test` (18 pass) and `pnpm typecheck`.
- [ ] `remotion.config.ts` with the `@whatif/kit` alias and engine `node_modules` resolution; the example imports
      the kit through the alias.
- [ ] Commit.

## Task 2: the quality layer (test first)

- [ ] Tests: `layerBlur` is 0 at the focus depth and grows with distance; each mood name resolves to a full `Look`;
      the pause bars are 0 outside a pause and full height inside it after the slide; the source-tag text for a line
      comes from its ledger rows.
- [ ] `kit/stage/Look.tsx` (from the prototype) with named moods; bars driven by the pause; `Figure` brows, lids and
      two mouths; shot helpers; `SourceTag`; motion blur and noise add-ons at 4.0.484.
- [ ] Tests pass; commit.

## Task 3: story and narration pipeline (test first)

- [ ] Python test: a small `script.md` becomes the expected `story.json` (lines, holds, moods, ledger ids, `say.yaml`
      overrides).
- [ ] `pipeline/story.py`; `pipeline/build.ts` reads `story.json`, `voices.yaml` (Eleven v4 with Arthur, fallback),
      takes `--max-credits`, hashes voice, direction and text, runs whisper in `.venv-media`, no speed-up.
- [ ] Tests pass; commit.

## Task 4: studio tools and pipeline wiring (test first)

- [ ] Python tests: `whatif_narration` refuses without `owner_approved_paid_call` and `max_credits`; the tools are
      discovered; `studio-whatif.yaml` names them.
- [ ] `core/openmontage/tools/studio/studio_whatif_tools.py`; update `studio-whatif.yaml` stages and the narration,
      rough-cut and edit skills; `core/PATCHES.md`.
- [ ] `make test` line for the engine; `core/lock.yaml` entries. Commit.

## Task 5: parity and quality renders

- [ ] Copy the sample's `public/pause` takes and `public/sfx` into the engine's git-ignored `public/`.
- [ ] Render the sample with the `whatif_render` tool (in the background); compare duration, size and loudness with
      the sandbox's `out/pause.mp4`.
- [ ] Render the quality test: the sample's street in `dusk` and `frozen`, with faces and bars.
- [ ] `make test`; commit; hand the renders to the owner.
