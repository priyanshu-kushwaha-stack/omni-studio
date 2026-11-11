# What-if set library (Say Suppose)

2026-11-11. Follows `2026-11-11-say-suppose-three-a-week-design.md` §5: three films a week need most sets ready-made.
Building 40-70 scenes from scratch was the slowest step per film.

## Goal

A new film reuses about 70% of its sets, so scene building drops from hours of agent work to about an hour.

## What was built

`core/engines/whatif/src/kit/sets/` (`@whatif/kit/sets`): 15 sets covering the viewer's week (a young Indian,
comfortable in English, on a phone in the evening), harvested from the four films so far and generalised:

| Set | Harvested from |
|---|---|
| `classroom` | new, from Hall (rows, screen), MothersHouse (fan), 60 Seconds (Diagram) |
| `metro-platform` | Nobody Could Say No `sets/Metro.tsx` (platform, train, door), 60 Seconds `Platform` |
| `metro-coach` | Nobody Could Say No `sets/Metro.tsx` (car, city, near pole) |
| `bus` | Nobody Could Say No `FirstJump.Bus.tsx` |
| `kitchen` | pause sample `Kitchen`, 60 Seconds `Home` |
| `bedroom` | pause sample `Bedroom`, pause film `Opening.Bedroom`, 60 Seconds `Bedroom` |
| `dining` | Nobody Could Say No `MothersHouse` (table view), `Loan.parts` (dinner), 60 Seconds `Home` |
| `courtyard` | Find Anything Ever Lost `Late.tsx`/`Street.tsx` (tulsi, neem), `MothersHouse` (gate yard) |
| `balcony` | new, from the shared skyline and the pause film's street-below-the-window |
| `office-desk` | Nobody Could Say No `sets/Office.tsx` (doorway), pause film `FirstDays.Office` |
| `hostel-room` | Nobody Could Say No `Midpoint.parts` (your room), Find Anything `Treasure` (bedroom) |
| `street` | pause film `sets/Street.tsx` (the owner's sample street) |
| `bazaar` | Find Anything Ever Lost `Street.tsx` (Lane with shops, Grate, Mango) |
| `chai-stall` | Nobody Could Say No `sets/ChaiStall.tsx`, 60 Seconds `StreetNight` |
| `phone` | Nobody Could Say No `parts2.tsx` (PhoneTop), `Back.EndCard` |

## The contract (`sets/common.tsx`)

- Drawn for one camera, `REF` = `{960, 540, 1}`: a set reads like a picture in 1920x1080 coordinates. `Deep` (from
  Nobody Could Say No) is the kit's `Layer` shifted so every depth draws where its coordinates say at REF; as the
  camera moves, far layers drift less (real parallax), and the mood's depth of field softens them.
- `SetDef`: `spots` (x, y, scale, facing, `sit`), `cameras` (`wide` = REF plus named framings), `lights` (lamps and
  windows that glow only in listed moods), `defaults` (swappable props), `Back`, optional `Mid` (a counter, a table,
  a cart, drawn between the `behind` cast and the rest) and `Front` (a pole, a railing), and an `example`.
- Mood: every set takes `mood` and draws its windows, skies, lamps and lit windows from `OUTSIDE[mood]`;
  `setLook(set.lights, mood, cam)` is `moodLook(mood)` plus the set's lights projected to the screen.
- `SetScene` puts a set on the Stage with people on its spots (an unknown spot throws). It also takes the pause's
  `radius` and `origin`.
- Words never appear on screen in a set: boards, signs, screens and chats are ink drawings, colour blocks and ink bars.

## Checks

- `tests/sets.test.ts`: every set is registered, keeps its named spots (films place people by these names), keeps
  spots on the set at a sane size, mounts in all six moods with its example, and draws night differently from day;
  lights follow their moods; `Deep` parallax; an unknown spot throws.
- `examples/set-library`: composition `SetLibrary`, props `{"set": "<name>"}`, frame n = mood n. Rendered through
  `whatif_stills` under the render queue, one set at a time; the owner judges the contact sheet.

## Not in this change

- Moving the films in flight onto the library (they keep their own sets; their next revision can switch).
- More sets (hospital, temple, wedding hall, airport): add on first need, same contract.
