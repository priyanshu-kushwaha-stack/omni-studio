# only-100: pilot v8 rebuilt on the kit

The kit's acceptance test (plan Task 17): the approved pilot v8, "What if only 100 people could ever see you?"
(`channels/say-suppose/pilot/only-100/remotion/src/Pilot60.tsx`), rebuilt as a kit film and compared frame by frame
with v8. The pilot folder is the frozen reference and is not touched.

## What is here

- `shots.yaml`: the pilot's 18 shots (Pilot60's `SHOTS`) with its times. S1, S3a and S3b are sheet shots on the
  library's `station` set (angles high, high, wide; the pilot's zooms as push/pull; its crowd counts, seeds and
  speeds; Scarf idle with the pilot's look-around as `lookAt` acts; the 3.5 million fact as a `pill` label). Every
  other shot is `type: custom`.
- `custom/Shots.tsx`: those 15 custom shots. Each body is Pilot60's, unchanged except imports and the lines that read
  the cast (`usePilot()` / `useHeads()`); Pilot60's local `View` and `clampF` are the kit's (identical code).
- `custom/FilmParts.tsx`: the pilot-only parts (Phone, LIST, BoardDots, scarfRest, fadeIn from FilmParts.tsx;
  scarfAt, manAt from CutoutC.tsx; the pose types from Cast2.tsx; Scarf4, Man4, RiceBall and the face helpers from
  Cast4.tsx), the pilot's time warp, and `onOld`, which turns a pilot shot body into a kit `Shot`.
- `index.ts`: `registerRoot(filmRoot(shots))`.

Cast and art come from film.json, not from castV4.ts: Scarf is `film.cast.scarf` (the pilot's SCARFC pieces), Kenji
is `student`, the selfie woman `office`, Mr. Okada `gent`, the rice-ball man `salary` (all in `film.crowd`, the
library's crowd-role cast); the rice ball and phone are `film.props`; set plates are `film.sets.station`. The library
pieces and plates are byte-identical to the pilot's `public/cut4` and `public/cut` files (sha1 checked).

film.json and film-luc.json are not committed: they are generated from shots.yaml and the library in two commands
(below), embed the library's cast data and would go stale when the library changes.

## Time base

The pilot is written on the voice B timeline and plays on Luc's narration: `Pilot60` maps each frame through
`toOld` (pilot `timewarp.ts`) and picks the shot on the old clock. The example keeps that:

1. `shots.yaml` holds the old (voice B) times, exactly as Pilot60's `SHOTS` (S14 ends at 59.56 so it warps to
   69.899 s, the pilot's 69.9 s comp: 2097 frames).
2. `scripts/timewarp.py` writes `film-luc.json` with every shot, act and label time warped through the pilot's cue
   sheets (`audio/cues_a.json` -> `audio/cues_luc.json`); those knots are the same as `timewarp.ts`'s. The kit's
   `Film` picks shots on Luc's clock from these warped times.
3. Custom shots are wrapped in `onOld` (FilmParts.tsx): it maps the kit's film time back with the pilot's own
   `toOld` (same knots), and the shot's start the same way, so each body gets the pilot's `t` and `l`.
4. Sheet shots run on Luc's clock (their act and label times were warped in step 2). Crowds walk on film time, so
   their positions differ slightly from v8, which walked them on the old clock.

## Run it

From the repo root, with `S` a scratch folder (renders and media never go in git):

```bash
E=core/engines/suppose/examples/only-100; A=$PWD/channels/say-suppose/pilot/only-100/audio
PYTHONPATH="$PWD/core/openmontage:$PWD/core" .venv/bin/python core/engines/suppose/scripts/sheetcheck.py $E --emit
.venv/bin/python core/engines/suppose/scripts/timewarp.py $E --from $A/cues_a.json --to $A/cues_luc.json
mv $E/film.json $E/film-luc.json $S/
.venv/bin/python -c "import sys; sys.path.insert(0,'core/engines/suppose/scripts'); from library import Library; \
  from pathlib import Path; Library.for_channel('say-suppose').stage(Path('$E'), Path('$S/public'))"
cp <pilot worktree>/remotion/public/pilot_mix_luc.wav $S/public/audio/mix.wav
cd core/engines/suppose/kit && npx remotion render ../examples/only-100/index.ts Film $S/kit.mp4 \
  --props=$S/film-luc.json --public-dir=$S/public --gl=angle     # through studio.jobs run --queue render
```

`--gl=angle` matches the pilot's `Config.setChromiumOpenGlRenderer('angle')`.

## sheetcheck

No FAIL. Warnings (recorded, not fixed; the pilot predates the sheet rules):

```
WARN S7: hold of 7.9 s with no hold: reason (L8, a guide)
WARN S9: hold of 6.1 s with no hold: reason (L8, a guide)
WARN S11: hold of 8.0 s with no hold: reason (L8, a guide)
WARN S3a, S3b: same type wide twice in a row (W1)
```

No spoken-number (W5) warnings: the example has no `audio/narration.words.json`, so sheetcheck has no words to check.
The holds are custom shots that animate inside (the phone scroll, the board, the selfie); the sheet cannot see that.

## Frame diff against v8

Run 2026-11-27. v8 stills from the pilot worktree (`npx remotion still src/index.ts Pilot60`), kit stills from
`core/engines/suppose/kit` (`npx remotion still ../examples/only-100/index.ts Film --props=film-luc.json
--public-dir=<staged> --gl=angle`), both through `studio.jobs run --queue render`; then
`python core/engines/suppose/scripts/framediff.py <v8> <kit> 2.0`. Mean absolute RGB difference, 0-255.

| frame | time (Luc) | shot | kind | diff | limit | result |
|---|---|---|---|---|---|---|
| f60 | 2.00 s | S1 | sheet | 15.476 | 6.0 | over |
| f140 | 4.67 s | S2 | custom | 0.113 | 1.0 | pass |
| f260 | 8.67 s | S3b | sheet | 20.919 | 6.0 | over |
| f480 | 16.00 s | S4c | custom | 0.112 | 1.0 | pass |
| f900 | 30.00 s | S7 | custom | 0.119 | 1.0 | pass |
| f1350 | 45.00 s | S9 | custom | 0.000 | 1.0 | pass |
| f1650 | 55.00 s | S11 | custom | 0.001 | 1.0 | pass |
| f1990 | 66.33 s | S13 | custom | 0.001 | 1.0 | pass |

Every custom shot is within 0.12 of v8 (invisible; the residue is on frames whose plate is blurred 3-10 px), so the port changed nothing.

The sheet shots were 22.43 (f60) and 22.49 (f260) on the kit as it stood. Three kit fixes brought them to 15.5 and
20.9: Scarf drawn at the set's legacy scale (he was 29% too big) and centred on his mark (he was half a torso left);
`crowd[].kinds`, so the bands use the pilot's weighted mix; and the high angle's `parallax: 1`, so its floor plate
moves with the crowd as in v8. What remains is structural, not a port error:

- Crowds walk on film time (Luc's clock). v8 walked them on the old clock through the warp; at f260 the two clocks
  are 1.1 s apart, so every walker has moved on. At f60 they are 0.24 s apart.
- `push` and `pull` ease in and out; v8's S1 and S3b pushes are linear (S3a's pull matches: v8 eased it too).
- The kit adds its own 2 px handheld drift on both axes; v8's High drifted 4 px on x only.
- v8's high angle has a soft glow under Scarf, and his eyes swing on a sine where the sheet uses `lookAt` acts.

Crowd frames are many small high-contrast figures, so a few pixels of walking or zoom move the mean a lot; the two
stills look the same shot with the same people, framed alike, mid-stride elsewhere.
