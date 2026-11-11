# Scene plan: What If Nobody Could Say No to You? (drop 2, the 720p first cut)

The first cut of the whole script on the free local narration (`studio-whatif-script.md`, drop 2): every scene present
and moving; polish is for picture lock (G3). Read first: `channels/say-suppose/style.md` (Look; Light, faces and shots),
`channels/say-suppose/cast.md`, `script.md` (the `> SCENE:`, `> HOLD:`, `> TAG:`, `> BUBBLE:` lines ARE the shot list),
and the pause-time film's scenes (`videos/2026-11-06_pause-time-for-10-seconds-a-day/scenes/`) for kit usage.

## Layout (`scenes/`)

| File | What |
|---|---|
| `index.ts`, `Root.tsx` | Entry; `RoughCut` (the film) and `RoughCutSound` (the same tree inside `SoundOnly`) |
| `Film.tsx` | Picks the beat by narration line, lights it by the line's `> MOOD:`, plays narration and the score. Do not edit unless the plan says so |
| `shared.ts` | `Shot`, `Beat`, the cast colours (`HERO`, `MOTHER`, `DEV`, `BOSS`, `CHECKER`, `STRANGER`, `PASTELS`), `ramp`, `linear`, `mix`, `camAt`, `cutAt`, `current`, `lineEnd`, `blinking`, `noise` |
| `parts.tsx` | `YesTag` (the rule device), `Bubble`, `Sheet` (the paper that facts are drawn on), `Bun`, `Shawl`, `Headphones`, `Arrow`, `headAt` |
| `sets/*.tsx` | Sets used by more than one beat (below) |
| `beats/*.tsx` | One file per beat (`beats/index.ts` lists them); a beat may add `beats/<Beat>.<Part>.tsx` helpers |
| `make_sfx.sh` | Makes `assets/sfx/snap.wav` and `snap-soft.wav` (git-ignored) |

## Rules every beat follows

- **Timing from the narration, never hard-coded seconds.** `shot.clips[i].from` is line i's first frame (0-based, the
  order of spoken lines in script.md and `assets/narration/props.json` `lines`); `lineEnd(clips, i)` its last. Every
  shot change, pose change and tag flip is a frame computed from these, so a new take re-times the scene. Frames are
  whole-film frames; `shot.frame` is the current one, `shot.from`/`shot.to` the beat's range.
- **Something changes every 2 to 4 s** (a camera move, a pose, a prop, a cut); no hold over 6 s except the wordless
  peak (the paper, up to 10 s, with motion every 2-4 s). Shot variety: wides to set a place, close-ups for feeling, an
  insert or top-down every 20-30 s, over-the-shoulder with a blurred foreground head (`ForegroundHead`).
- **Draw everything in code** with the kit (`@whatif/kit/...`: `Stage`, `Figure`, `EXPRESSIONS`, `moodLook`, `drift`,
  `closeUp`, `wide`, `medium`, `insert`, `DrawLine`, `Flip`). Sets are layers at different depths; no AI images. Faces
  act with brows and lids (`EXPRESSIONS`); a face reaction follows every reveal within 2 s. No lip-sync, no line boil.
- **The rule device:** every `> TAG: YES` is a `YesTag` over the asked person's head, flipping at the frame the yes
  lands (usually the line's first frame or just after the ask), with `assets/sfx/snap.wav` played at that frame by an
  `<Audio>` placed OUTSIDE `<Stage>` (in a `<Sequence from={at}>`); the mother's flip uses `slow` and `snap-soft.wav`.
- **On-screen text** is only a YES tag, a stamped tag, a counter or a `Bubble` (four words or fewer, `> BUBBLE:`
  lines), off faces, inside the safe area (5% margins). No captions, no sources on screen.
- **You** (`HERO`: mustard head, tuft, teal scarf) are in nearly every scene. **The stranger** (crimson head, long dark
  coat) appears exactly once, in Sunday, for one second.
- **Facts are drawn** on a `Sheet` with `DrawLine` (a number against a normal number, a diagram that draws itself).
- **The last 15 s** keep the right third of the frame quiet (end screens).
- Lit by `Film.tsx` from the line's mood: do not set your own `LookContext` unless a beat needs a special look (the
  peak's grey drain uses `Stage`'s `radius`/`origin`, the grey wave, growing from the edges).
- Check frames with `bash scenes/stills.sh <out.png> <frame> ...` run through the render queue:
  `.venv/bin/python -m studio.jobs run --step stills --channel say-suppose --video 2026-11-10_what-if-nobody-could-say-no-to-you --queue render -- bash channels/say-suppose/videos/2026-11-10_what-if-nobody-could-say-no-to-you/scenes/stills.sh <out.png> <frames...>`
  (from the repo root; frames at 30 fps). Typecheck: `cd core/engines/whatif && npx tsc --noEmit -p ../../../channels/say-suppose/videos/2026-11-10_what-if-nobody-could-say-no-to-you/scenes/tsconfig.json`.

## Beats (narration lines, 0-based) and who draws them

| Beat | File | Lines | Starts | Sets |
|---|---|---|---|---|
| The change | `Change.tsx` | 0-7 | 0:00 | Metro (gate) |
| The rule | `Rule.tsx` | 8-11 | 0:25 | Metro (gate) |
| The first jump | `FirstJump.tsx` | 12-35 | 0:47 | ChaiStall, Metro (car, platform), Office (doorway); bus, auto, mirror drawn in the beat |
| The clerk | `Clerk.tsx` | 36-44 | 2:09 | copy shop drawn in the beat; Metro (platform) |
| Sunday | `Sunday.tsx` | 45-51 | 2:57 | MothersHouse (gate, table) |
| The office | `Office.tsx` | 52-61 | 3:27 | Office (floor top-down, meeting room) |
| The loan | `Loan.tsx` | 62-72 | 4:20 | canteen, Dev's family dinner, drawn in the beat |
| The midpoint | `Midpoint.tsx` | 73-81 | 5:17 | your room, flat dinner drawn in the beat; Metro (car) |
| The cost | `Cost.tsx` | 82-90 | 6:05 | MothersHouse (gate) |
| The stage | `StageBeat.tsx` | 91-96 | 6:47 | Hall (stage, rows) |
| The choice | `Choice.tsx` | 97-105 | 7:34 | Hall (backstage corridor) |
| The paper | `PaperBeat.tsx` | 106-109 | 8:31 | Hall (corridor), Metro (car, night) |
| Back to you | `Back.tsx` | 110-114 | 8:56 | Metro (car, night); the end card |

## Shared sets (`sets/`)

| Set | Views it exports |
|---|---|
| `Metro.tsx` | the gate concourse at night (the thumbnail's set: turnstiles far back), the car interior with a window seat and a window that can show a reflection, the platform |
| `ChaiStall.tsx` | the stall outside college: kettle, glasses, the steel chutney bowl, a counter |
| `Office.tsx` | the doorway at the boss's glass partition, the floor seen top-down (desk rows), the glass-walled meeting room with a table for eight and a whiteboard |
| `MothersHouse.tsx` | the small gate and yard with a tulsi plant and the step, the lunch table indoors with a ceiling fan |
| `Hall.tsx` | the hall: a stage, a big screen, a lectern, rows of small pastel heads; the backstage corridor of stacked chairs with an exit door |

Each set exports `XxxBack` (and `XxxFront` where something passes in front of the figures) components drawn in world
coordinates for a 1920x1080 stage, plus named anchor points (floor line, door, seat) the beats place figures on.
