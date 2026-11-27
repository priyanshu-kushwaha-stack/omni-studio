# studio-suppose: story_script (G2, story lock on the 720p first cut)

omni-studio skill for the `studio-suppose` pipeline. The owner reviews a film, not a text: the script, voice B
narration with the free character voices, and a 720p first cut (spec 2026-11-27, "From topic to a 720p first cut").
Paths are from the repo root (`$ROOT`); `<video>` is `channels/say-suppose/videos/<id>`, `$V` its absolute path.
Engine scripts are in `core/engines/suppose/scripts/`; run them with `.venv/bin/python` from `$ROOT`, and where a
snippet imports an engine module, set `PYTHONPATH=core/engines/suppose/scripts` as the snippets below do. `$V` is the
video's absolute path. New art stays local to the video until G3 (steps 5 and 7; `studio-suppose-final-watch` step 1
moves it into the library).

**Gate:** G2, stage `story_script`.
**Reads:** `<video>/outline.md` (G1), `art.yaml` (G1), the channel library, `prompts/script.md`, `cast-pass.md`,
`set-plate.md`, `parts-sheet.md`, `cast-lineup.md`, `character-voice.md`, `shots.md`.
**Writes:** `script.md`, `cast-pass.yaml`, `claims.md`, `audio/` (takes, `narration.wav`, `cues_b.json`,
`narration.words.json`, `mix.wav`, `sweep/`), `voices.yaml`, new art under `art/` (`art/cast/`, `art/sets/`), `shots.yaml`, `custom/Shots.tsx`, `remotion/index.ts`, `film.json`, `render/`,
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
   if not, redo the pass, never edit the script to fit. Add every `claims` entry to `<video>/claims.md` (id, source URL fetched and read this session, verbatim quote,
   status), copying the entry's `claim` text into the ledger's claim cell word for word: the `cast_claims` check
   matches each cast-pass claim to a ledger row by that text, and fails for any real figure with no row. Numbers stay in words in the script.
4. **Voices (free, local).** Every character who speaks needs a voice `{desc, seed}`. `voices.py` takes it from the
   library cast (a map's `voice:`) and, over that, from `<video>/voices.yaml`, which this step writes and which wins:

   ```yaml
   # <video>/voices.yaml: character id -> voice (prompts/character-voice.md)
   kenji: {desc: "A relaxed male baritone: a man of about thirty, the hero's best friend since school. Warm and a little husky, quick and playful, clear diction, natural pace, casual modern English.", seed: 23}
   ```

   For each speaking character with no voice yet (a new character, or a library one whose map has no `voice:`): fill
   `prompts/character-voice.md` and write its `desc` into `voices.yaml` with no seed. Then sweep three seeds of the
   free local Qwen3 VoiceDesign (`local_tts.py`'s `qwen3-design`, no paid call) on that character's first line:

   ```sh
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/voices.py --sweep $V <id>
   ```

   It writes `$V/audio/sweep/<id>_seed11.wav`, `_seed23.wav`, `_seed37.wav` (other seeds: add them after `<id>`).
   Listen, pick the one that sounds like the character and stays apart from the narrator and the rest of the cast, and
   write its number as `seed:` in `voices.yaml` (sweep again with new seeds if none fits). Then
   `PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/voices.py $V`: voice B for
   the narrator, each character in their own voice; it writes `audio/takes/`, `audio/narration.wav`,
   `audio/cues_b.json` and `audio/narration.words.json`. The owner reads the script and listens to the track (not a
   gate). Apply their notes; if any words changed, re-run steps 2-4. `voices.yaml` is committed with the film; at G3
   its entries move into the cast maps (`studio-suppose-final-watch` step 0).
5. **Art (approved at G1), kept local to the video.** Run the approved GPT Image 2.6 calls from `art.yaml` with
   `prompts/set-plate.md`, `prompts/cast-lineup.md` and `prompts/parts-sheet.md`, exactly as quoted, and save the
   images under `<video>/art/`. Nothing goes into the channel library yet: the library only takes a film's art after
   G3 (`studio-suppose-final-watch` step 1), so a film the owner rejects leaves it untouched. Keep each image's
   Higgsfield job id and prompt name in `<video>/art.yaml` for then. For each new character, with the same layout
   the library uses, under `<video>/art/`:

   ```sh
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/slice.py <parts-sheet.png> $V/art/cast/pieces <id>
   # write its map $V/art/cast/maps/<id>.yaml (as the maps in channels/say-suppose/library/cast/maps/)
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/rig.py $V/art
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/rig.py --check $V/art <id> $V/art/cast/<id>-check.png
   ```

   The prefix is the new character's id (and its map's `sheet:`); `slice.py` refuses one the library already uses (a
   cast id, a map's sheet such as `s1`-`s5`, or existing pieces), since the video's pieces would override the
   library's. `rig.py` writes `$V/art/cast/cast.json` (srcs stay library-relative, `cast/pieces/<name>.png`). The check sheet lays
   out the ten pieces with their names and an assembled rest pose; look at it, and fix the map, before animating.
   Measure each new set into `$V/art/sets/<set>/set.json` (the library's `station` set is the model). `sheetcheck.py`,
   `voices.py`, `review.py` and `Library.stage` all read `<video>/art/cast/` and `<video>/art/sets/` on top of the
   library, so the film resolves them at render time exactly as it will once they are in the library.
6. **Shot sheet.** Fill `prompts/shots.md` with the cast-pass lines on their whisper times, the sets, cast, beats and
   readout; save the answer as `<video>/shots.yaml`. Write the hero beats as custom shots in `<video>/custom/Shots.tsx`
   (one `export const <Name>: Shot` per shot; the entry imports exactly this file, and `Shots.tsx` may import sibling
   files in `custom/`), and the film's entry `<video>/remotion/index.ts`:

   ```ts
   import {registerRoot} from 'remotion';
   import {filmRoot} from '@suppose/kit';
   import * as shots from '../custom/Shots';
   registerRoot(filmRoot(shots));
   ```

   Keep `registerRoot(...)` written out in this file: the Remotion CLI refuses an entry file whose text lacks the word.

   Write custom shot bodies against the voice B times in `shots.yaml` (`t` is film seconds, `l` seconds into the shot).
   They stay on that clock after G3: `film-luc.json` carries the time warp and the kit unwarps `t` and the shot's start
   for every custom shot, so never convert times inside a custom shot.

   Then `.venv/bin/python core/engines/suppose/scripts/sheetcheck.py <video> --emit` until it prints no FAIL; it writes
   `<video>/film.json` (git-ignored: regenerate it, never edit it). The last shot must end with the narration
   (`audio/cues_b.json`): past the end, or more than 0.5 s short, is a FAIL.
7. **Mix and render.** `.venv/bin/python core/engines/suppose/scripts/mix.py <video> <library score wav>` (a temp
   score from `channels/say-suppose/library/scores/`; with none that fits, leave the score out and say so on the review
   page) writes `audio/mix.wav` at -16 LUFS. Stage the public dir (library plus the video's own art and audio):
   `PYTHONPATH=core/engines/suppose/scripts .venv/bin/python -c "import sys; from pathlib import Path; from library import Library; Library.for_channel('say-suppose').stage(Path(sys.argv[1]), Path(sys.argv[1]) / 'public')" $V`. Renders run one at a time
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
   <video>/audio/narration.words.json` must pass (claims, cast_claims, clicks). `.venv/bin/python
   core/engines/suppose/scripts/review.py <video> story_script`; publish `review/story_script.html` as an Artifact and
   give the owner the link. Write the `story_script` checkpoint with `status: awaiting_human` and stop;
   only the owner passes the gate, with `omni approve`.

Owner notes come back as `<video>/review/notes.md`, a to-do list: apply each one or say in one line why not, then
re-present.

## Never

- Make a paid call the G1 approval did not cover, or call Luc before G2.
- `Library.add` or move files into `channels/say-suppose/library/`: that waits for G3 (`studio-suppose-final-watch`).
- Run `omni approve`, read the approval key, upload, or make a video public.
- Change studio, engine, kit or library code: a film session records the need with `omni fix say-suppose --format
  film --stage story_script ...` and carries on.
- Commit media: images, audio and renders (`art/`, `audio/`, `public/`, `render/`) stay out of git.
