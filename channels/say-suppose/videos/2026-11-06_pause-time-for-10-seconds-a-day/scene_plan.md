# Scene plan: pause time for 10 seconds a day (rough cut, G4)

From script v6 (G2, 2026-11-07) and the narration as generated (G3, 2026-11-07). Line numbers are the narration
lines in `story.json` (0 to 70). Cues are `{line, word}` anchors in `timing.yaml`; scenes read cue frames, never
fixed times. "+N s" is extra time after a line for action, also in `timing.yaml`.

Sets reused from the owner's sample (`core/engines/whatif/examples/pause-sample/scenes`): Bedroom, Kitchen, Hallway,
Street. New sets: Black (title and void), OfficeKitchen (counter, plate), Home (living room with a lamp, stairs),
NightRoom (bed and window onto the city), BusStop, Lane (street cricket), Corner (older street), Mirror, Sky.

Every scene: mood from the script (`moodLook`), pause bars while time is stopped, a face reaction within 2 s of a
reveal, something changing every 2 to 4 s outside holds, source tag on cited lines (11, 13, 22, 23, 36, 65).

## Beat 1. The change and the rule (lines 0 to 10; file `Opening.tsx`)

| Lines | Set, mood | Shot and action | Cues | Extra |
|---|---|---|---|---|
| 0 | Street, frozen | Flash-forward: wide frozen crossing at dusk, bus a metre from the kid, counter at 7, bars in. Slow push. Cut to black on "seconds" | `flash` 0 "seconds" | |
| 1-3 | Bedroom, morning | Morning light. Alarm rings; you snap at it on "pause"; grey wave from your hand, bars slide in; dust hangs; the cat frozen mid-leap off the bed (line 2); push to your face, eyes wide (line 3) | `snap1` 1 "pause", `cat` 2 "cat" | +1.0 after 3 (colour back, cat lands) |
| 4-5 | Bedroom, morning | Counter drops in at 10 on "Ten"; grey on "stops"; counter flips 10→0 on line 5, colour back, cat finishes jump | `counter` 4 "Ten", `stops` 4 "stops", `restart` 5 "starts" | |
| 6 | Bedroom, night | Clock turns to midnight; flaps blank then flip back to 10 | `midnight` 6 "midnight" | |
| 7 | Black void, frozen | Amber block snaps shut around you (on "seal"); cut to black frame, only your eyes blinking (on "light") | `amber` 7 "seal", `blind` 7 "light" | |
| 8 | Bedroom, frozen | Block shatters into paper flakes on "cheat"; three beats: a breath ripples the air ("Air"), your eyes catch light ("see"), a grabbed pillow moves with your hand then stops dead when let go ("touch") | `cheat` 8 "cheat", `air` 8 "Air", `see` 8 "see", `touch` 8 "touch" | +0.5 |
| 9-10 | Bedroom, frozen to day | You hold up one finger (line 9), grin, glance at your phone on the bedside (line 10) | `grin` 10 "selfish" | |

## Beat 2. The first days (lines 11 to 24; file `FirstDays.tsx`)

| Lines | Set, mood | Shot and action | Cues | Extra |
|---|---|---|---|---|
| 11-12 | Kitchen, day | Phone slips from your hand, screen-first; TAG 0.45 S; on "Not today." you snap: grey, bars | `slip` 11 "phone", `snap2` 12 "today" | +0.6 after 12 |
| 13 | Kitchen to side-on cutaway, frozen | Camera pulls out through the walls; a paper tape runs past rooms as you stroll; TAG 10–14 M at the tape's end | `tape` 13 "covers" | |
| 14 | Kitchen, day | Close: you pluck the phone from the air; colour back; check the screen; smirk | `crack` 14 "crack" | +0.5 |
| 15-16 | Hallway, day | Boss steps out waving, bubble "Got a minu—"; on "Vanish." snap, grey, you tiptoe under his arm; colour; boss blinks at the empty hallway | `boss` 15 "boss", `vanish` 16 "Vanish" | +1.2 after 16 |
| 17-18 | OfficeKitchen, day | One samosa; colleague's hand reaching (17); snap, swap samosa for a napkin, stroll off chewing; colleague stares at the napkin (18) | `reach` 17 "reaching", `swap` 18 "saint" | +0.6 after 17 |
| 19 | Home, lamp | Mother's chappal flies; snap: grey; it hangs; you step left; colour; it sails past; she stares at her hand, then laughs | `chappal` 19 "chappal", `step` 19 "aside", `laugh` 19 "missed" | +0.8 |
| 20-23 | Hallway, day | Close on the wall clock; your eyes dart (20); second hand sticks then jumps (21); TAG CHRONOSTASIS (22); big-eyes close with three quick darts on "jump" (23) | `clock` 20 "pause", `stick` 21 "stick", `term` 22 "chronostasis", `darts` 23 "jump" | |
| 24 | Hallway, day | A paper TV remote drops into your hand on "remote" | `remote` 24 "remote" | +0.5 |

## Beat 3. Day twelve (lines 25 to 37; file `DayTwelve.tsx`; the sample's Street, relit)

| Lines | Set, mood | Shot and action | Cues | Extra |
|---|---|---|---|---|
| 25-26 | Street, dusk | Walking home; TAG DAY 12; bus coming; red light | `walk` 25 "walking", `bus` 26 "bus", `red` 26 "red" | |
| 27-29 | Street, dusk | Kid in a blue cap chases a ball onto the crossing; close on your face (eyes wide, brows up); the stranger planted far back, still, facing the wrong way | `kid` 27 "kid", `shout` 28 "shout", `neither` 29 "Neither" | |
| 30 | Street, dusk to frozen | On "pause": grey wave from you, bars slide in, bus stops a metre short, pigeons hang; counter 10 | `pause` 30 "pause" | +0.4 |
| 31-34 | Street, frozen | Sprint with motion blur (31); lift the kid to the pavement, ball stays (32-33); step back onto the kerb (34). Counter flips on each number word | `run` 31 "run", `nine`…`one` on each number word | +0.3 after 31, 32, 33 |
| 35 | Street, dusk | Colour back, bars out; bus brakes through the crossing, flattens the ball; kid blinks on the pavement | `resume` 35 "screams", `ball` 35 "ball" | |
| 36 | Street, dusk | Wide side-on: tape unrolls from the bus bumper; TAG 23 M; source tag | `tape23` 36 "needs" | |
| 37 + hold 4 s | Street, dusk | Mother hugs the kid, thanks the driver; you at the edge of frame; hold: you walk away, hands trembling | `mother` 37 "mother", `nobody` 37 "Nobody" | |

## Beat 4. The catch (lines 38 to 51; file `Catch.tsx`)

| Lines | Set, mood | Shot and action | Cues | Extra |
|---|---|---|---|---|
| 38-41 | NightRoom, night | Close on trembling hands (38); your face in the dark (39); you at the window over the street (40-41) | `hands` 38 "saved", `free` 39 "free", `window` 41 "watching" | |
| 42-43 | BusStop, morning | Doors closing, fingers twitch (42); snap: grey; stroll aboard; colour; sit, pleased (43) | `doors` 42 "doors", `once` 43 "once" | +0.8 after 43 |
| 44 + hold 8 s | Home, lamp | Mother at the top of the stairs with a washing basket; misses a step; you snap; nothing, counter reads 0. Hold: slow motion, lamp stays warm, shadows deepen, vignette closes; she falls the last three steps; you kneel; she sits up, waves you off | `stairs` 44 "misses", `nothing` 44 "Nothing" | |
| 45 | Home, lamp | Close on her rubbing her arm; then your face | `notyou` 45 "not" | |
| 46-47 | NightRoom, night | You in bed, eyes open; counter on the wall at 10 | `awake` 46 "awake" | |
| (montage) | Street, BusStop, Home | TAG MONTH 6; two-second shots: you watching at the crossing, on the bus, at the foot of the stairs | `month6` 47 "never" | |
| 48 + hold 4 s, 49 | NightRoom, night | Midnight: snap; the frozen city through the window; held chord | `midnight2` 48 "midnight" | |
| 50 | NightRoom, night | A curtain swings shut in a frozen window across the street; counter 0; colour; you stare | `curtain` 50 "curtain" | +0.6 |
| 51 | NightRoom, night | You at the window, night after night; the curtain still | `check` 51 "check" | |

## Beat 5. The long run (lines 52 to 64; file `LongRun.tsx`)

| Lines | Set, mood | Shot and action | Cues | Extra |
|---|---|---|---|---|
| 52-53 | Bank daydream (thought cloud), day | Cloud: you at a vault, counter at 10; cloud pops on "vault" | `bank` 52 "bank", `vault` 53 "vault" | |
| 54 | Lane, day | Street cricket; ball skied; snap; walk under it; colour; catch; lane erupts | `six` 54 "six", `catch` 54 "do" | +1.0 |
| 55-56 | Quick cuts, day | Bottle nudged from a bike wheel; pan handle turned in; toddler lifted from the top stair (2 s each) | `small` 56 "disasters" | +1.0 after 55 |
| 57-59 + hold 4 s | Home, lamp | Mother, older, asks (57); close on her brows; "Promise her, or keep watching?" (58); you stay on the bottom step; she shakes her head, smiles, takes your hand on the way down (hold) | `asks` 57 "stop", `stay` 59 "stay" | |
| 60-61 | Street, dusk, seasons | TAG YEAR 40; seasons pass (leaves, rain, snow, sun) during the hold before 60; the stranger frozen far back in one winter frame; you older at a corner, eyes flicking to a ladder, a dog, a driver on a phone | `year40` 60 "Forty", `before` 61 "before" | |
| 62 | Sky/clocks, dusk | Two paper clocks; yours gives a small extra tick | `clocks` 62 "pauses" | |
| 63-64 | Mirror, lamp | Mirror, TAG 2 DAYS beside it; pull back to the window and the street of strangers | `mirror` 63 "older", `strangers` 64 "strangers" | |

## Beat 6. Back to you (lines 65 to 70; file `Ending.tsx`)

| Lines | Set, mood | Shot and action | Cues | Extra |
|---|---|---|---|---|
| 65 | Street crossing, dusk | Ordinary busy crossing; a car approaches; tag 1.5 S beside the driver; source tag | `designers` 65 "designers" | |
| 66 + hold 6 s | Street, frozen | Evening; snap; crowd freezes grey, bars in; you turn to walk home. Hold: silence; the stranger walks through the frozen crowd towards you | `notice` 66 "notice" | |
| 67-69 | Street, frozen | Stranger stops, turns, looks straight at you; close on your face (eyes wide, lids up, mouth open); "Somebody knows." | `moving` 67 "moving", `looking` 68 "looking", `knows` 69 "knows" | +0.8 after 69 (bubble) |
| 70 | Black, then end card | Bubble "Nice catch. Day twelve."; black 1 s; end card: you small in the left two-thirds with your phone and a paper counter; right third empty | `endcard` 70 "spend" | |

## Rough-cut scope

The rough cut is for structure and timing: every shot present and lit, actions on their cues, the counter, bars and
tags right. Fine acting (hand poses, prop secondary motion), the score and sound design come at G5. The bed is the
sample's synthesised pad until the music is decided.
