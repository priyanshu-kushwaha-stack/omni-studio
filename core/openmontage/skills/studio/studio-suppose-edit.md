# studio-suppose: final_edit (G3, picture lock)

omni-studio skill for the `studio-suppose` pipeline. After G2 the paid narrator replaces voice B, the film moves onto
his timing, the final score goes in and the owner's G2 notes are applied (spec 2026-11-27, "After G2"). Paths and
`$ROOT`, `$V`, `<video>` as in `studio-suppose-script`.

**Gate:** G3, stage `final_edit`.
**Reads:** `cast-pass.yaml`, `audio/takes/`, `audio/cues_b.json`, `shots.yaml`, `film.json`, `review/notes.md`,
`prompts/narration.md`, `prompts/score.md`.
**Writes:** `audio/luc/` takes and their whisper transcripts, `audio/narration_luc.wav`, `audio/cues_luc.json`, `film-luc.json` (the warped film), `audio/mix.wav`, `render/film-1080p.mp4`, `review/final_edit.html`, the `final_edit` checkpoint.

## Steps

1. **Quote Luc.** Luc is Higgsfield `elevenlabs_v4` with the Luc preset (`prompts/narration.md`). Quote: the
   characters of every narrator line in `cast-pass.yaml` x 0.006 credits, x 1.4 for retakes (about 50 credits for a
   1,000-word film). Announce tool, model and the credit total, and wait for the owner's OK. Only after G2.
2. **One job per line.** For each narrator line, one job with `prompts/narration.md` filled with that line exactly.
   Save each take in `<video>/audio/luc/` and whisper-check it (`core/engines/whatif/pipeline/transcribe.py` in the
   main checkout's `.venv-media`, as `voices.py` runs it): the transcript must equal the line. Luc can repeat
   phrases: trim the take, or retake it; a retake beyond the quote needs its own OK. Character lines keep their free
   local takes from `audio/takes/`.
3. **Stitch.** In script order, narrator lines from `audio/luc/<NNN>_narrator.wav` and character lines from their
   free takes `audio/takes/<NNN>_<speaker>.wav` (the names `voices.py` wrote); never by hand:

   ```sh
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python -c "import sys,yaml; from pathlib import Path; from stitch import stitch, gap_after; v=Path(sys.argv[1]); L=yaml.safe_load((v/'cast-pass.yaml').read_text())['lines']; stitch([(f\"{l['n']:03d}_{l['speaker']}\", v/'audio'/('luc' if l['speaker']=='narrator' else 'takes')/f\"{l['n']:03d}_{l['speaker']}.wav\", gap_after(l['text'], l['speaker'], i==len(L)-1)) for i,l in enumerate(L)], v/'audio/narration_luc.wav', v/'audio/cues_luc.json')" $V
   ```

4. **Time warp.** `shots.yaml` and `film.json` stay on voice B time; the film plays on Luc time:

   ```sh
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/timewarp.py $V --from audio/cues_b.json --to audio/cues_luc.json
   ```

   It writes `$V/film-luc.json`: every time in `film.json` (shot from/to, beats, act at/to, label at/to, line, readout
   and sfx at, duration) mapped through the line cues. Mix on it, with the final score from step 5 (omit the score
   path for none):

   ```sh
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/mix.py $V <score.wav> --luc
   ```

   which reads `film-luc.json` and `audio/narration_luc.wav` and writes `audio/mix.wav`. After the owner's notes
   change `shots.yaml`, re-run `sheetcheck.py --emit`, then this step again.
5. **Final score.** Either a library cue from `channels/say-suppose/library/scores/` that fits, or a new score per
   `prompts/score.md` (Higgsfield ElevenLabs Music, about 0.145 credits a second): quote it, wait for the owner's OK,
   then generate. Re-run the mix of step 4 with that score.
6. **Notes.** Apply every G2 note in `review/notes.md`, or say in one line why not.
7. **1080p render.** Re-stage the public dir (`PYTHONPATH=core/engines/suppose/scripts .venv/bin/python -c "import sys; from pathlib import Path; from library import Library; Library.for_channel('say-suppose').stage(Path(sys.argv[1]), Path(sys.argv[1]) / 'public')" $V`), then from `core/engines/suppose/kit`:

   ```sh
   $ROOT/.venv/bin/python -m studio.jobs run --step final-edit --channel say-suppose --video <id> --queue render -- \
     npx remotion render $V/remotion/index.ts Film $V/render/film-1080p.mp4 \
     --props=$V/film-luc.json --public-dir=$V/public --scale=1.5
   ```

   (the sheet is laid out at 1280x720; `--scale=1.5` gives 1920x1080).
8. **QC and review.** `.venv/bin/omni qc say-suppose <id> final_edit --media <video>/render/film-1080p.mp4` must pass
   (loudness at the `film` target, clicks, similarity); an `opening` WARN is the owner's call.
   `.venv/bin/python core/engines/suppose/scripts/review.py <video> final_edit`; publish the page. Write the
   `final_edit` checkpoint with `status: awaiting_human` and stop; only the owner passes the gate, with
   `omni approve`.

## Never

- Call Luc, ElevenLabs Music or GPT Image without the owner's OK with tool, model and cost stated first.
- Run `omni approve`, read the approval key, upload, or make a video public.
- Change studio, engine, kit or library code; record the need with `omni fix` and carry on.
- Commit media: audio and renders stay out of git.
