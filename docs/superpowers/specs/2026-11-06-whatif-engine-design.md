# What-if engine: bringing the paper-cut rig into omni-studio

2026-11-06. The owner chose to do this in the Say Suppose session ("Do it here"), approved the shape below, then
adopted the reference study's quality rules ("Adopt all", `docs/research/2026-11-06-say-suppose-reference-study.md`),
which add the lighting, acting, shot and sound pieces listed under "Quality layer".

## Goal

Say Suppose videos render from inside omni-studio: an approved `script.md` becomes narration, then a 1920x1080 render,
through the `studio-whatif` pipeline. The owner's sample (`~/Exploration/sandbox/what-if-pause`, no commits) is only
read, never written.

## Where things live

| Path | What |
|---|---|
| `core/engines/whatif/` | The engine: a Node project with its own `package.json` and `pnpm-lock.yaml`. `node_modules/` is git-ignored |
| `core/engines/whatif/src/kit/` | Shared parts every video reuses: rig and poses, stage, camera and layers, the lighting layer, tags, counter, bubbles, source tags, world clock, timeline and cue alignment, theme and fonts |
| `core/engines/whatif/pipeline/` | Narration build (voice, tighten, transcribe, timeline), sound effects, story builder from `script.md` |
| `core/engines/whatif/examples/pause-sample/` | The owner's 34-second sample, rebuilt on the kit: its four scenes and its story file. The parity test renders it |
| `core/engines/whatif/tests/` | vitest tests: the sample's 18 plus the new pieces |
| `channels/<slug>/videos/<id>/scenes/` | One video's scenes. They import the kit through the `@whatif/kit` alias |
| `channels/<slug>/videos/<id>/story.json` | The video's lines, gaps, holds, moods and cues, built from `script.md` |

Bundling: Remotion bundles from a per-video entry. `remotion.config.ts` in the engine adds a webpack alias
`@whatif/kit` → `core/engines/whatif/src/kit` and resolves packages from the engine's `node_modules`, so a scene file
in a channel folder needs no packages of its own.

## Story from script

`pipeline/story.py` reads `script.md`:

- spoken lines (bare lines under `## [mm:ss]` headings, cites stripped) become `lines[]`;
- `> HOLD: N s` becomes a wordless gap of N seconds after the previous line;
- `> MOOD:` sets the mood for the lines after it;
- each line's ledger ids are kept, so the renderer can show the source tag from `claims.md`;
- the spoken text of a take comes from `say.yaml` in the video folder when the script line needs spelling out or direction
  (numbers spelled, `[whispers]`), so the script keeps its digits.

Named cues for animation (`{line, word}`) are added at the rough-cut stage in `story.json`.

## Narration

The sample's `pipeline/build.ts`, changed in four places:

1. Voice model from `channels/<slug>/voices.yaml`: Eleven v4 with Arthur, falling back to `text2speech_v2`.
2. Cache key: a hash of voice, direction and text, so an unchanged line is never bought twice.
3. Credit cap from the command line (`--max-credits`), which the studio tool passes only with the owner's approval;
   the build quotes the pending lines first and stops if the quote exceeds the cap.
4. Word timings run in the studio's `.venv-media` (faster-whisper 1.2.1), not another project's Python.

No speed-up on takes; silences are capped at 0.3 s.

## Quality layer (adopted from the reference study)

| Piece | What it does |
|---|---|
| `Look` | Per-mood colour grade, rim light on actors, depth-of-field blur by layer depth, glows, vignette, filmic contrast. Moods: `morning`, `day`, `dusk`, `night`, `lamp`, `frozen` |
| Pause signature | Letterbox bars slide in while time is stopped and out when it starts |
| Faces | Brows (raised, worry, sad, angry, flat), eyelids, mouths `frown` and `wobble` |
| Shots | Helpers for close-up, insert, over-the-shoulder with a blurred foreground head, top-down |
| Motion | `@remotion/motion-blur` on fast moves; a slow-motion ghost for the peak; `@remotion/noise` for organic camera drift (never line boil) |
| Drawn facts | `@remotion/paths` for lines that draw themselves (tape measures, arcs) |
| Source tags | A small paper tag in a lower corner for every spoken line that cites a ledger row, text from `claims.md` |
| Sound | A score track per video mixed with ducking under the voice and rises in holds; sound effects synthesised as in the sample |

The lighting and face pieces were prototyped on a scratch copy of the sample on 2026-11-06 (renders in
`channels/say-suppose/page/candidates/look-round-3/`).

## Studio tools

New `studio`-named files, auto-discovered like the `pou_*` tools:

| Tool | Runs | Paid |
|---|---|---|
| `whatif_story` | `pipeline/story.py` on a video | no |
| `whatif_narration` | the narration build | yes: refuses without `owner_approved_paid_call: true` and a `max_credits` |
| `whatif_render` | Remotion render, then the loudness limiter | no |
| `whatif_stills` | contact sheet of chosen frames | no |

`studio-whatif.yaml` names these tools on the narration, rough-cut and edit stages; the stage skills say how to use
them.

## Pins

`core/lock.yaml` gains a `whatif_engine` entry: the npm packages from the engine's lockfile (Remotion 4.0.484 and its
add-ons, React 18.3.1, tsx, vitest, TypeScript), pnpm 9.15.9, and the Higgsfield CLI 1.1.23 it calls. yt-dlp
2026.10.21 (installed under `.tools/` for the reference study) is recorded too.

## Tests

- `make test` gains a line that runs the engine's vitest suite and type check; if `node_modules` is missing it fails
  with "run pnpm install --frozen-lockfile in core/engines/whatif".
- Python tests for the studio tools: the narration tool refuses without approval and a cap; the story builder turns a
  small script into the expected lines, holds, moods and ledger ids.

## Done when

- One command renders the sample from omni-studio, matching the sandbox's `out/pause.mp4` in length (34.2 s),
  frame size (1920x1080) and loudness (about -14.9 LUFS), using the sample's cached voice takes: no paid call.
- A quality test render of the sample's street with the `dusk` and `frozen` looks, faces and bars, for the owner.
- `make test` is green; `omni check say-suppose` passes.

## Out of scope

The pause-time video's own scenes (built at G4, after narration), any narration or music call (quoted at G3 and
approved by the owner), Shorts.
