# studio-suppose: story_script (G2, story lock on the 720p first cut)

omni-studio skill for the `studio-suppose` pipeline. The owner reviews a film, not a text: the script, voice B
narration with the free character voices, and a 720p first cut (spec 2026-11-27, "From topic to a 720p first cut").
Paths are from the repo root (`$ROOT`); `<video>` is `channels/say-suppose/videos/<id>`, `$V` its absolute path.
Engine scripts are in `core/engines/suppose/scripts/`; run them with `.venv/bin/python`.

**Gate:** G2, stage `story_script`.
**Reads:** `<video>/outline.md` (G1), `art.yaml` (G1), the channel library, `prompts/script.md`, `cast-pass.md`,
`set-plate.md`, `parts-sheet.md`, `cast-lineup.md`, `character-voice.md`, `shots.md`.
**Writes:** `script.md`, `cast-pass.yaml`, `claims.md`, `audio/` (takes, `narration.wav`, `cues_b.json`,
`narration.words.json`, `mix.wav`), `shots.yaml`, `custom/*.tsx`, `remotion/index.ts`, `film.json`, `render/`,
`review/story_script.html`, the `story_script` checkpoint.

**Paid calls:** only the art G1 approved, as quoted in `art.yaml`. Anything beyond it (a retake, an extra set) needs
its own quote and the owner's OK with tool, model and cost stated first. Voice B and the character voices are local
Qwen3 (VoiceDesign for characters) and free. Luc comes after G2 (`studio-suppose-edit`), never here.

## Steps, in order

1. **Script.** Fill `channels/say-suppose/prompts/script.md` with the G1 title, the series context and the outline
   (the `OUTLINE`, `RULE`, `CHARACTERS`, `PLANTED` and `CHOICE` blocks of `<video>/outline.md`); answer; save the
   answer as `<video>/script.md`.
2. **Script check.** `.venv/bin/python core/engines/suppose/scripts/scriptcheck.py <video>/script.md` (add
   `--hero NAME` for any name the hero must never get). Fix every FAIL and re-run until it exits 0; note the WARNs
   (voice targets) for the review page.
3. **Cast pass.** Fill `prompts/cast-pass.md` with the script and the CHARACTERS block; save the YAML answer as
   `<video>/cast-pass.yaml`. Check with code that the `lines` texts joined with single spaces equal the script exactly;
   if not, redo the pass, never edit the script to fit. Add every `claims` entry to `<video>/claims.md` (id, claim as
   spoken, source URL fetched and read this session, verbatim quote, status). Numbers stay in words in the script.
4. **Voices (free).** A new character with no voice in the cast library gets one from `prompts/character-voice.md`.
   Then `.venv/bin/python core/engines/suppose/scripts/voices.py <video>`: voice B for the narrator, each character in
   their own voice; it writes `audio/takes/`, `audio/narration.wav`, `audio/cues_b.json` and
   `audio/narration.words.json`. The owner reads the script and listens to the track (not a gate). Apply their notes;
   if any words changed, re-run steps 2-4.
5. **Art (approved at G1).** Run the approved GPT Image 2.6 calls from `art.yaml` with `prompts/set-plate.md`,
   `prompts/cast-lineup.md` and `prompts/parts-sheet.md`, exactly as quoted. For each new character:
   `.venv/bin/python core/engines/suppose/scripts/slice.py <parts-sheet.png> channels/say-suppose/library/cast/pieces <prefix>`,
   write its map `channels/say-suppose/library/cast/maps/<id>.yaml` (as the existing maps), then
   `.venv/bin/python core/engines/suppose/scripts/rig.py channels/say-suppose/library`, and render a rig check sheet
   (a still of the character in its poses) to look at before animating. For each new set, measure its
   `channels/say-suppose/library/sets/<set>/set.json` (the `station` set is the model). Record each new file with
   `Library.add(path, job, prompt)` (`core/engines/suppose/scripts/library.py`, the Higgsfield job id and prompt).
6. **Shot sheet.** Fill `prompts/shots.md` with the cast-pass lines on their whisper times, the sets, cast, beats and
   readout; save the answer as `<video>/shots.yaml`. Write the hero beats as custom shots in `<video>/custom/*.tsx`
   (`export const <Name>: Shot`), and the film's entry `<video>/remotion/index.ts`:

   ```ts
   import {registerFilm} from '@suppose/kit';
   import * as shots from '../custom/Shots';
   registerFilm(shots);
   ```

   Then `.venv/bin/python core/engines/suppose/scripts/sheetcheck.py <video> --emit` until it prints no FAIL; it writes
   `<video>/film.json`.
7. **Mix and render.** `.venv/bin/python core/engines/suppose/scripts/mix.py <video> <library score wav>` (a temp
   score from `channels/say-suppose/library/scores/`; with none that fits, leave the score out and say so on the review
   page) writes `audio/mix.wav` at -16 LUFS. Stage the public dir:
   `Library.for_channel("say-suppose").stage(Path("<video>"), Path("<video>/public"))`. Renders run one at a time
   through the render queue, from `core/engines/suppose/kit`:

   ```sh
   cd core/engines/suppose/kit
   $ROOT/.venv/bin/python -m studio.jobs run --step cold-open --channel say-suppose --video <id> --queue render -- \
     npx remotion render $V/remotion/index.ts Film $V/render/cold-open-720p.mp4 \
     --props=$V/film.json --public-dir=$V/public --frames=0-899
   ```

   First the **cold open** (the first ~30 s, frames 0-899 at 30 fps). Check it yourself against W1-W7 and the five
   look qualities (L6.2) on the review page's checklists; fix the sheet or custom shots and re-render until it holds.
   This is the agent's check, not an owner step. Then render the full 720p cut the same way with `--step cut` to
   `$V/render/cut-720p.mp4` and no `--frames` (the review page plays the last `render/*.mp4` by name).
8. **QC and review.** `.venv/bin/omni qc say-suppose <id> story_script --media <video>/render/cut-720p.mp4 --words
   <video>/audio/narration.words.json` must pass (claims, clicks). `.venv/bin/python
   core/engines/suppose/scripts/review.py <video> story_script`; publish `review/story_script.html` as an Artifact and
   give the owner the link. Write the `story_script` checkpoint with `status: awaiting_human` and stop;
   only the owner passes the gate, with `omni approve`.

Owner notes come back as `<video>/review/notes.md`, a to-do list: apply each one or say in one line why not, then
re-present.

## Never

- Make a paid call the G1 approval did not cover, or call Luc before G2.
- Run `omni approve`, read the approval key, upload, or make a video public.
- Change studio, engine, kit or library code: a film session records the need with `omni fix say-suppose --format
  film --stage story_script ...` and carries on.
- Commit media: images, audio and renders (`art/`, `audio/`, `public/`, `render/`) stay out of git.
