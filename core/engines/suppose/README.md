# Say Suppose engine

The film kit for Say Suppose (spec: docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md).

- `scripts/`: Python tools, run as siblings (`python core/engines/suppose/scripts/<tool>.py`): scriptcheck,
  sheetcheck, slice, rig, library, voices, stitch, timewarp, mix, review, framediff.
- `kit/`: the Remotion package. `pnpm install --frozen-lockfile` once. A film renders from its own entry:
  `cd core/engines/suppose/kit && npx remotion render <video>/remotion/index.ts Film <out.mp4>
  --props=<video>/film.json --public-dir=<staged public>` wrapped in `studio.jobs run --queue render`. The entry is
  `import {registerRoot} from 'remotion'; import {filmRoot} from '@suppose/kit'; import * as shots from '../custom/Shots';
  registerRoot(filmRoot(shots));`; `registerRoot` must appear in that file's text, or the CLI refuses it.
- `examples/only-100/`: the pilot rebuilt on the kit, the kit's acceptance test.

Film sessions never change this engine; they record needs with `omni fix`.
