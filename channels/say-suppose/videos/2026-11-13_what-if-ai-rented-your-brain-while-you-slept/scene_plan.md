# Scene plan: What If AI Rented Your Brain While You Slept? (drop 2, the 720p first cut)

The first cut of the whole script on the free local narration (`studio-whatif-script.md`, drop 2): every scene present
and moving; polish is for picture lock (G3). Read first: `channels/say-suppose/style.md` (Look; Light, faces and shots),
`channels/say-suppose/cast.md`, `script.md` (the `> SCENE:`, `> HOLD:`, `> TAG:`, `> BUBBLE:` lines ARE the shot list),
and the last film's scenes for the pattern (`git show origin/claude/wants-you-to-fail-g1-f13563:channels/say-suppose/videos/2026-11-12_what-if-you-saw-who-wants-you-to-fail/scenes/beats/HerBack.tsx`,
and its `parts.tsx`, `sets/Home.tsx`). The kit: `core/engines/whatif/src/kit/` (rig, stage, shots, the set library
`@whatif/kit/sets`; `core/openmontage/skills/studio/studio-whatif-edit.md` lists the sets).

## Layout (`scenes/`)

| File | What |
|---|---|
| `index.ts`, `Root.tsx` | Entry; `RoughCut` (the film) and `RoughCutSound` (the same tree inside `SoundOnly`) |
| `Film.tsx` | Picks the beat by narration line, lights it by the line's `> MOOD:`, plays narration, score and beds. Do not edit |
| `shared.ts` | `Shot`, `Beat`, the cast colours (`HERO`, `BROTHER`, `NURSE`, `BROKER`, `BOSS`, `GRANDMOTHER`, `CLERK`, `BRIDGE_WOMAN`, `GHOST`, `STRANGER`, `PASTELS`), `ramp`, `linear`, `mix`, `camAt`, `cutAt`, `current`, `lineEnd`, `blinking`, `noise` |
| `parts.tsx` | The rule device, drawn exactly as the thumbnail: `Sleeper` (you or anyone asleep, laid back, band and light), `bandLight`, `Blanket`, `Ghost` (the pale second you at its floating desk; `deviceAt` gives its 0..1), `Thread`, `Coin`, `CoinArc` + `landings`, `Jar`, `Band`, `BandBox`; text: `PayFlap` ($90 split-flap), `StampTag` (KEYS, DOOR, YOU), `Bubble`, `Sheet`; `PaperCap` (the nurse); sound (outside `<Stage>`): `DeviceSound` (chime + typing), `ClinkSound`; `headAt` |
| `sets/BunkRoom.tsx` | The key location and the thumbnail's frame: `<BunkRoom frame mood view device coins you brother ...>`; `view` is a 2D camera over the thumbnail frame (`KEY_VIEW` = the thumbnail exactly); `BUNK` holds every anchor. Shared by every builder; owner: the session (ask before changing its exports) |
| `sets/*.tsx` | Other sets used by more than one beat (below); each owned by ONE builder |
| `beats/*.tsx` | One file per beat (`beats/index.ts` lists them); a beat may add `beats/<Beat>.<Part>.tsx` helpers |
| `make_sfx.sh` | `assets/sfx/chime.wav`, `typing.wav`, `clink.wav`, `stamp.wav`, `paper.wav`, `tick.wav`, `knock.wav`, `peak-note.wav` (git-ignored; already run) |

## Rules every beat follows

- **Timing from the narration, never hard-coded seconds.** `shot.clips[i].from` is line i's first frame (0-based, the
  order of spoken lines in script.md and `assets/narration/props.json` `lines`); `lineEnd(clips, i)` its last. Every
  shot change, pose change and device turn is a frame computed from these (`at(i, p)`: p of the way through line i), so
  a new take re-times the scene. Frames are whole-film frames; `shot.frame` is the current one, `shot.from`/`shot.to` the
  beat's range. 30 fps.
- **Performed moments.** Every `> HOLD: N s. Performed.` is a gap after a line in which the narrator is silent and the
  characters act it in full, beat by beat; stage them in the frames between `lineEnd(clips, i)` and `clips[i + 1].from`
  (the skit's opening holds are the lead-in before line 0). Characters SPEAK in their own voices (lines with `speaker`
  in props.json): show the speaker, a mouth shape while their line plays (`mouth` "open"/"o" alternating), never
  lip-sync. A face reaction within 2 s of every reveal.
- **Something changes every 2 to 4 s** (a camera move, a pose, a prop or a cut); no hold over 6 s except the wordless
  peak (the globe, 9 s, motion every 2-4 s). Shot variety: wides to set a place, close-ups for feeling, an insert or
  top-down every 20-30 s, over-the-shoulder with a blurred foreground head (`ForegroundHead`, `@whatif/kit/stage/shots`).
- **Draw everything in code** with the kit (`Stage`, `Figure`, `EXPRESSIONS`, `drift`, `closeUp`, `insert`,
  `DrawLine`). Sets are layers at different depths; no AI images. No lip-sync, no line boil, no wobble. Reuse library
  sets first (`kitchen`, `bus`, `officeDesk`, `bankAtm`, `street`, `phone`, `hospitalCorridor` ...).
- **The rule device** is the band's teal light, the dotted thread and the pale second you typing at its floating desk,
  coins arcing into a jar. Whenever a band is on, draw it with `Sleeper` / `Ghost` / `Thread` / `CoinArc` from
  `parts.tsx`, and put `<DeviceSound at frames>` and `<ClinkSound at={landings(...)}>` OUTSIDE `<Stage>`. Over a
  sleeper who is not you, the ghost takes that person's head colour, lightened (`GHOST.head` for you).
- **On-screen text** is only a stamped tag (`StampTag`), the split-flap pay (`PayFlap`, every `> TAG: $..`), a `Bubble`
  (`> BUBBLE:` lines) or drawn diagrams on a `Sheet` (no words). Off faces, inside the safe area. No captions, no
  sources on screen, no lettering on signs (bars for text).
- **Arms:** a raised FRONT arm on a figure facing -1 crosses its face; raise the BACK arm instead. Arms are short.
- **You** (`HERO`) are in nearly every scene. **The stranger** appears exactly once: More Hours, the hundred-window
  street at dusk, walking under a lamp below, never looking up.
- **The last 15 s** keep the right third of the frame quiet (end screens).
- Lit by `Film.tsx` from the line's mood: do not set your own `LookContext` unless a beat needs a special look
  (`BunkRoom` sets its own).
- **Check frames** with `bash scenes/stills.sh <out.png> <frame> ...` run THROUGH THE RENDER QUEUE (one render at a time
  on this Mac; three other films render tonight):
  `.venv/bin/python -m studio.jobs run --step stills --channel say-suppose --video 2026-11-13_what-if-ai-rented-your-brain-while-you-slept --queue render -- bash channels/say-suppose/videos/2026-11-13_what-if-ai-rented-your-brain-while-you-slept/scenes/stills.sh <out.png> <frames...>`
  (from the repo root, with `PYTHONPATH=core`; write the png to your scratchpad, not the repo). Render a handful of
  frames per beat (6-9 per contact sheet), not dozens; at most three or four sheets per beat.
  Typecheck: `cd core/engines/whatif && pnpm exec tsc --noEmit -p ../../../channels/say-suppose/videos/2026-11-13_what-if-ai-rented-your-brain-while-you-slept/scenes/tsconfig.json`.

## Beats (narration lines, 0-based) and who builds them

| Beat | File | Lines | Builder | Sets |
|---|---|---|---|---|
| The Chair (the skit) | `Chair.tsx` | 0-1 (plus the lead-in holds before line 0) | A | `Clinic` (new: dawn, blinds, a wall clock, the reclining chair, a drip stand, the door) |
| Night One | `NightOne.tsx` | 2-9 | A | `Clinic` door; the bridge walkway insert (from `Bridge`, B's, or a simple insert); `BunkRoom` (THE KEY SHOT at line 4: `view=KEY_VIEW`, `device`, `coins`, the brother watching: the thumbnail exactly); morning: the brother hangs down, `PayFlap` $90 |
| The Rule | `Rule.tsx` | 10-16 | A | the title card ident C (3 s, before line 10: `channels/say-suppose/brand/IdentC.tsx`) ; library `kitchen` (morning): the jar, the leaflet `Sheet`s drawing themselves (BRAIN, BAND, JAR stamps; the head slice and dimming bulb; the dish with a tiny bat and ball), the brother reading it upside down |
| Crumbs | `Crumbs.tsx` | 17-32 | B | `kitchen`; a shower and the wall (new, small); `Bridge` (new: the walkway at dawn, the queue, the woman); the notebook (two columns, drawn crumbs); inserts: Loewi's corridor and frog heart, `phone` with squiggly letters and newspapers turning to text |
| More Hours | `MoreHours.tsx` | 33-43 | B | library `bus`; `Clinic` at noon (A's; import after it exists); library `officeDesk` (the nap room with a till); a doorway couple; the warehouse outside (C's `Warehouse` exterior, or a simple front); the grandmother's window; `WindowStreet` (new: THE picture only this premise can show, the hundred windows at dusk, pull back and up, the stranger under a lamp); library `bankAtm`; your street doorstep |
| The Night Shift | `NightShift.tsx` | 44-54 | C | `BunkRoom` (lamp, you awake on the bottom bunk, band in hand); inserts on `Sheet`s: the clock a third dark, the mouse brain washing, the rat maze replayed, the filing cabinet, the science-fair boy; the bathroom mirror; the stamps (KEYS, DOOR, YOU) |
| The Photo | `Photo.tsx` | 55-61 | C | `GradHall` (new: folding chairs, a stage, a banner with no lettering); `BunkRoom` (the split-flap weekend rate); the kitchen morning (`kitchen`); the phone photo (`phone` set) |
| The Warehouses | `Warehouses.tsx` | 62-70 | C | the kitchen breakfasts (`PayFlap` $90, $41, $12); `Bridge` at dusk (B's) with brokers; a paper map insert; `Warehouse` (new: rows of cots, a thousand sleepers and ghosts, threads to the rafters, the roller door, the clerk); the chess robot insert; the clerk at the door, your brother refused |
| The Contract | `Contract.tsx` | 71-77 | D | library `kitchen` at `lamp`: the table, the contract, the pen, the clock, the broker, your brother in the doorway; the dream-ad insert on the contract's margin |
| One Mind | `OneMind.tsx` | 78-85 | D | `BunkRoom` (night, the notebook pages on the bottom bunk, the two of you cross-legged, the laptop); `Globe` (new: the dark half lit like one brain cell firing, THE 9 s WORDLESS PEAK); the pages joining into a machine drawing |
| Midnight | `Midnight.tsx` | 86-89 | D | `BunkRoom` (night): the clock, the drawer, the bands going in, the knock |
| Morning | `Morning.tsx` | 90-95 | D | `BunkRoom` (morning), the bridge dream insert; the door with the tags; the `Clinic` steps (A's) with the broker's red-light band; the end card (left two-thirds tags, right third quiet) |

## Shared sets (`sets/`) and owners

| Set | Owner | What |
|---|---|---|
| `BunkRoom.tsx` | session | done; the key shot |
| `Clinic.tsx` | A | a plasma clinic at dawn: blinds, a wall clock, a reclining chair with a tube and a drip stand, the door; a front step outside (for Morning's sequel hook). Write it FIRST and keep its exports stable: B and D use it |
| `Bridge.tsx` | B | the river bridge walkway at dawn and dusk: the railing, the river, a queue walking in, the far city across the river. Write it FIRST: C uses it |
| `WindowStreet.tsx` | B | your street at dusk as a facade of a hundred windows, each a sleeper with a ghost and a jar (draw small `Sleeper` + `Ghost`), a lamp below |
| `GradHall.tsx` | C | a school hall: folding chairs, a stage with a curtain, a banner (no lettering) |
| `Warehouse.tsx` | C | rows of cots, a roller door, a clipboard desk; outside front for More Hours (B imports it) |
| `Globe.tsx` | D | the night globe |

Each set exports components in world coordinates for a 1920x1080 stage (`Deep` and `REF` from `sets/common.tsx`), plus
named anchor points (floor line, door, seat). A builder may use another builder's set only after it exists; until then
draw a stand-in in your own beat file.

## Builders: what done means

Every beat in your rows: replace its stub file in `beats/` (the index already lists it; keep the export name and `firstLine`), typechecks, and 6-9 frames
checked on a contact sheet (through the queue). Nothing hard-coded to seconds. Report: files written, the frames you
checked, what you could not do. Do not edit `Film.tsx`, `Root.tsx`, `shared.ts`, `parts.tsx` or `sets/BunkRoom.tsx`
(if you need a change there, say so in your report and draw it locally); do not render the film; do not commit.
