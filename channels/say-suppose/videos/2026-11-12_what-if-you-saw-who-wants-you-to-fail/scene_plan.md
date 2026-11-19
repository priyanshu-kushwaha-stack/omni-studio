# Scene plan: What If You Saw Who Wants You to Fail? (drop 2, the 720p first cut)

The first cut of the whole script on the free local narration (`studio-whatif-script.md`, drop 2): every scene present
and moving; polish is for picture lock (G3). Read first: `channels/say-suppose/style.md` (Look; Light, faces and shots),
`channels/say-suppose/cast.md`, `script.md` (the `> SCENE:`, `> HOLD:`, `> TAG:`, `> BUBBLE:` lines ARE the shot list),
and the nobody-says-no film's scenes for the pattern (`git show origin/claude/serene-benz-11af06:channels/say-suppose/videos/2026-11-10_what-if-nobody-could-say-no-to-you/scenes/beats/Rule.tsx`,
and its `parts2.tsx` and `sets/`). The kit: `core/engines/whatif/src/kit/` (rig, stage, shots, sets library
`@whatif/kit/sets`, see `docs/superpowers/specs/2026-11-11-whatif-set-library-design.md`).

## Layout (`scenes/`)

| File | What |
|---|---|
| `index.ts`, `Root.tsx` | Entry; `RoughCut` (the film) and `RoughCutSound` (the same tree inside `SoundOnly`) |
| `Film.tsx` | Picks the beat by narration line, lights it by the line's `> MOOD:`, plays narration and the score. Do not edit |
| `shared.ts` | `Shot`, `Beat`, the cast colours (`HERO`, `MINJUN`, `JIYOON`, `TAEHO`, `KANG`, `STRANGER`, `PASTELS`), `ramp`, `linear`, `mix`, `camAt`, `cutAt`, `current`, `lineEnd`, `blinking`, `noise` |
| `parts.tsx` | `Meter` + `MeterSound` (the rule device), `Bubble`, `Sheet`, `Letter`, `Kimbap`, `Ponytail`, `HairDown`, `Vest`, `Glasses`, `headAt` |
| `sets/*.tsx` | Sets used by more than one beat (below); each owned by ONE builder |
| `beats/*.tsx` | One file per beat (`beats/index.ts` lists them); a beat may add `beats/<Beat>.<Part>.tsx` helpers |
| `make_sfx.sh` | Makes `assets/sfx/snap.wav`, `snap-soft.wav`, `flutter.wav`, `click.wav`, `roomtone.wav` (git-ignored; already run) |

## Rules every beat follows

- **Timing from the narration, never hard-coded seconds.** `shot.clips[i].from` is line i's first frame (0-based, the
  order of spoken lines in script.md and `assets/narration/props.json` `lines`); `lineEnd(clips, i)` its last. Every
  shot change, pose change and meter flip is a frame computed from these (`at(i, p)`: p of the way through line i), so a
  new take re-times the scene. Frames are whole-film frames; `shot.frame` is the current one, `shot.from`/`shot.to` the
  beat's range. 30 fps.
- **Something changes every 2 to 4 s** (a camera move, a pose, a prop or a cut); no hold over 6 s except the wordless
  peak at the dock (9 s, motion every 2-4 s). Shot variety: wides to set a place, close-ups for feeling, an insert or
  top-down every 20-30 s, over-the-shoulder with a blurred foreground head (`ForegroundHead` from `@whatif/kit/stage/shots`).
- **Draw everything in code** with the kit (`Stage`, `Figure`, `EXPRESSIONS`, `drift`, `closeUp`, `insert`,
  `DrawLine`). Sets are layers at different depths; no AI images. Faces act with brows and lids; a face reaction
  follows every reveal within 2 s. No lip-sync, no line boil, no wobble.
- **The rule device:** every `> TAG:` with a percentage is a `<Meter value={...}>` over that person's head, opening at the
  frame the news lands (the line that says it, or just after), with `<MeterSound at={...}>` OUTSIDE `<Stage>`
  (`soft` for Ji-yoon). It folds sixty seconds later unless the scene cuts away (pass `until`). Only you can see them.
  Values: Min-jun -84 (then -88, -91 in Four Seats), Tae-ho -6, Ms. Kang +41, the clerk 0, the tour group eleven 0s, the
  cat `value={null}` (nothing opens; better: no card at all), Ji-yoon -68. A Meter is drawn after the head it hangs over.
- **On-screen text** is only a meter, a stamped tag, a split-flap counter, a `Bubble` (`> BUBBLE:` lines, four words or
  fewer) or the drawn result screen ("grade one" as a big 1 in a box, no words). Off faces, inside the safe area. No
  captions, no sources on screen. The academy signboards carry NO lettering (bars for text, as in the thumbnail).
- **Arms:** a raised FRONT arm on a figure facing -1 crosses its face; raise the BACK arm instead, or reach forward.
  Figures' arms are short (2 x 56 units).
- **You** (`HERO`) are in nearly every scene. **The stranger** appears exactly once: A Thousand Tags, at the bus stop,
  reading a timetable, never looking up.
- **The last 15 s** keep the right third of the frame quiet (end screens).
- Lit by `Film.tsx` from the line's mood: do not set your own `LookContext` unless a beat needs a special look.
- **Check frames** with `bash scenes/stills.sh <out.png> <frame> ...` run THROUGH THE RENDER QUEUE (one render at a time
  on this Mac; it froze under parallel load before):
  `.venv/bin/python -m studio.jobs run --step stills --channel say-suppose --video 2026-11-12_what-if-you-saw-who-wants-you-to-fail --queue render -- bash channels/say-suppose/videos/2026-11-12_what-if-you-saw-who-wants-you-to-fail/scenes/stills.sh <out.png> <frames...>`
  (from the repo root; write the png to your scratchpad, not the repo). Render a handful of frames per beat, not dozens.
  Typecheck: `cd core/engines/whatif && pnpm exec tsc --noEmit -p ../../../channels/say-suppose/videos/2026-11-12_what-if-you-saw-who-wants-you-to-fail/scenes/tsconfig.json`.

## Beats (narration lines, 0-based) and who builds them

| Beat | File | Lines (v3) | Builder | Sets |
|---|---|---|---|---|
| The Platform (the opening skit) | `Platform.tsx` | 0 (plus the lead-in holds before it) | A | kit `metroPlatform` (morning) with a split-flap departure board |
| Made the Cut | `MadeTheCut.tsx` | 1-6 | A | AcademyStreet (night, the thumbnail's frame) |
| The Rule | `Rule.tsx` | 7-20 | A | Store (the clerk at 0, the cat on the crate); the phone set; the warehouse aisle |
| Who's Red | `WhosCrimson.tsx` | 21-47 | B | kit `schoolCorridor`, `classroom`, a mirror over a sink, the street outside a metro station (tour group), kit `bus` (the kid); AcademyStreet (dusk, steps) |
| Her Back | `HerBack.tsx` | 48-52 | C | Home |
| A Thousand Cards | `ThousandTags.tsx` | 53-61 | A | AcademyStreet (night, steps, the crowd, the bus stop, two classmates' close-ups) |
| Four in a Hundred | `FourSeats.tsx` | 62-79 | B | kit `classroom`, `phone` (group chat, shared folder); Store (night, two nights) |
| The Notebook | `Notebook.tsx` | 80-88 | D | ReadingRoom |
| Say It Again | `SayItAgain.tsx` | 89-96 | C | Home (dining table) |
| The Country Holds Its Breath | `HoldsBreath.tsx` | 97-105 | D | ReadingRoom; kit `classroom`, `examHall`, `citySkyline`, `street` |
| A Text Would Open Nothing | `TextOpensNothing.tsx` | 106-116 | D | kit `classroom`, `phone` (nine messages), `bus` |
| The Loading Dock | `LoadingDock.tsx` | 117-127 | C | LoadingDock |
| Two Letters | `TwoLetters.tsx` | 128-134 | C | Home; the end card |

**v3 (owner's notes, 2026-11-12, `taste.md`):** the film opens on a SKIT before the narrator speaks (the metro platform:
you open the letter, show a stranger, a card snaps open over her and folds under your finger); more uses of the power,
more people reacting (the clerk, the cat, the tour group, a mirror, a kid on the bus, the group chat, the folder); and
characters now SPEAK in their own free local voices (lines with `speaker` in props.json `lines`). Plain words, roles
not names, and the PERFORMED MOMENTS from v2.1 stay: every `> HOLD: N s. Performed.` is a gap after a line in which
the narrator is silent and the characters act it in full, beat by beat; stage them in the frames between
`lineEnd(clips, i)` and `clips[i + 1].from` (the skit's opening hold is the lead-in before line 0). Something changes
every 2-4 s; a face reaction within 2 s; the snack is `Chocolate`.

## Shared sets (`sets/`) and owners

| Set | Owner | Views |
|---|---|---|
| `AcademyStreet.tsx` | A | the cram-school street: towers of lit academy signboards (no lettering), the academy's front steps, a kimbap shop front, a bus stop with a timetable board; night and dusk |
| `Store.tsx` | A | the convenience store: fluorescent white, the triangle-kimbap shelf, the counter with the clerk's spot, a crate by the door for the cat. Builder B uses it too: A writes it FIRST and keeps its exports stable |
| `Home.tsx` | C | the small flat: the kitchen with the fridge (letters and a calendar on it) and the kimchi jar of brushes on top, the doorway, the dining table under one lamp, the front door |
| `ReadingRoom.tsx` | D | rows of partitioned desks, one lamp each |
| `LoadingDock.tsx` | C | a raised concrete dock, roller shutters, sodium lamps, pallets, a forklift |

Each set exports `XxxBack` (and `XxxFront` where something passes in front of the figures) in world coordinates for a
1920x1080 stage (`Deep` and `REF` as in the nobody film's `sets/common.tsx`; copy that helper to `sets/common.tsx` if it
is not there yet), plus named anchor points (floor line, door, seat, counter top).
