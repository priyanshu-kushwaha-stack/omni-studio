# studio-suppose: final_watch (G4, final watch)

omni-studio skill for the `studio-suppose` pipeline. Paths, `$ROOT`, `$V` and `<video>` as in `studio-suppose-script`.

**Gate:** G4, stage `final_watch`.
**Reads:** the 1080p render G3 (picture lock) approved, `claims.md`. **Writes:** `qc/final_watch.json`,
`channels/say-suppose/taste.md` lines, the `final_watch` checkpoint.

0. **G3 is passed, so the film's art joins the library.** Only now, and only for a film the owner passed. From `$ROOT`,
   with `V=channels/say-suppose/videos/<id>` and `L=channels/say-suppose/library`:

   ```sh
   mkdir -p $L/cast/pieces $L/cast/maps && mv $V/art/cast/pieces/* $L/cast/pieces/ && mv $V/art/cast/maps/* $L/cast/maps/
   for d in $V/art/sets/*/; do mv "$d" $L/sets/; done; rm -f $V/art/cast/cast.json
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python core/engines/suppose/scripts/rig.py $L
   ```

   (skip the lines for art the film did not make). Maps and `set.json` files move with the pieces, and `rig.py` rebuilds
   `$L/cast/cast.json` from every map. A new prop goes into `$L/props/props.json` by hand. Then record each moved
   file with its Higgsfield job id and prompt name from `art.yaml`, one call per file:

   ```sh
   PYTHONPATH=core/engines/suppose/scripts .venv/bin/python -c "import sys; from pathlib import Path; from library import Library; Library.for_channel('say-suppose').add(Path(sys.argv[1]).resolve(), job=sys.argv[2], prompt=sys.argv[3])" $L/cast/pieces/<file>.png <job-id> <prompt-name>
   ```

   and check `PYTHONPATH=core/engines/suppose/scripts .venv/bin/python -c "from library import Library; print(Library.for_channel('say-suppose').verify())"` prints `[]`.
   The files stay out of git (images); `manifest.yaml`, the maps, `cast.json` and the `set.json` files are committed
   with the film. Re-stage the public dir afterwards (`studio-suppose-edit` step 7); the render is unchanged because
   the library now supplies what the video's `art/` supplied.
1. **The file the owner watches.** Use `<video>/render/film-1080p.mp4` as G3 approved it. If anything changed since
   G3, re-render it once from `core/engines/suppose/kit` the way `studio-suppose-edit` step 7 does (`--step
   final-watch`, `--queue render`, `--scale=1.5`). Never stitch or mux the final-watch file by hand: G4's media proof
   covers this exact file, and G5 uploads it.
2. `.venv/bin/omni qc say-suppose <id> final_watch --media <video>/render/film-1080p.mp4` (loudness, clicks,
   similarity; `opening` warns only).
3. Hand the owner the render path, its duration and every check result, plus the watch list: is each real-world claim
   the one in `claims.md`; does anything hold longer than 5 seconds without its reason; any click or pop; any text on a
   face, overlapping, or out of the safe area. The owner watches at 1x with cold viewers. Tests passing is not done;
   the owner watching is.
4. Write the `final_watch` checkpoint with `status: awaiting_human` and stop; only the owner passes the gate, with
   `omni approve`. While the owner watches, prepare G5 (`studio-suppose-publish`) so G4 and G5 can be taken in one
   sitting.

After the watch, add one dated line per cold viewer to `channels/say-suppose/taste.md` (where they looked away,
laughed, asked a question or reached for the phone), and the one named thing this film improved on the last one.

## Never

- Run `omni approve`, read the approval key, upload, or make a video public.
- Make a paid call without the owner's OK with tool, model and cost stated first.
- Change studio, engine, kit or library code; record the need with `omni fix` and carry on.
