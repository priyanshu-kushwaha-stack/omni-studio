# studio-whatif: final_edit (G3, picture lock)

The picture loop runs on the narration G2 locked. It ends with the voice A/B, then G3 locks the cut, key shot, text,
music and mix, and the voice the A/B chose. Watch copies are always 1280x720; never render 1920x1080 before G4.

Scenes live in the video folder, `scenes/` with an `index.ts` entry, and import the kit as `@whatif/kit/...`
(`core/engines/whatif/src/kit`; worked example: `core/engines/whatif/examples/pause-sample`).

## Reuse a library set before drawing a new one

`core/engines/whatif/src/kit/sets/` (`@whatif/kit/sets`) holds the viewer's week as ready sets. Start every `> SCENE:`
from one of them and draw a new set only when none fits; a film should reuse about 70% of its sets. Each set is drawn
for one reference camera (`REF`, the 1920x1080 frame at zoom 1) in paper layers at different depths, takes its light
from `> MOOD:` (windows, lamps, tube lights and street lamps follow the mood), and has:

- `spots`: named places for figures (x, y, scale, facing, `sit` for chairs, benches and cots); `poseFor(spot)` gives
  the pose;
- `cameras`: `wide` (REF) and two or three named framings to start a shot from;
- `defaults`: the props you can swap (what is on the stove, the whiteboard, the monitor, the train's door);
- `example`: one composition, rendered in all six moods by `examples/set-library` (`whatif_stills`, composition
  `SetLibrary`, props `{"set": "<name>"}`, frames 0-5).

`<SetScene set={kitchen} mood="dusk" cam={...} options={{ stove: "kettle" }} cast={[...]} />` puts a set on the Stage
with people on its spots; or use `set.Back`, `set.Mid` and `set.Front` in your own `<Stage>` for full control. A cast
member marked `behind` is drawn before the set's `Mid` (a counter, a table, a cart), so it hides their legs.

| Set | What it is |
|---|---|
| `classroom` | coaching class: whiteboard with ink drawings (no words), bench desks, far row of heads, fan and tube lights |
| `metro-platform` | elevated metro platform: a train that pulls in and opens its door, the far platform, the city beyond |
| `metro-coach` | inside a metro coach: the city sliding past two windows, bench, poles and handles, a reflection in the glass |
| `bus` | inside a city bus: the street sliding past, the bench, straps and the yellow pole, strap-hangers |
| `kitchen` | home kitchen: window with a grille, granite platform, gas stove (pressure cooker or kettle), spice shelf, fridge |
| `bedroom` | your bedroom: window with curtains, bed, bedside alarm clock and phone, study desk with lamp and laptop |
| `dining` | joint-family dining table: eight places, steel plates and dal, ceiling fan, garlanded photo, calendar |
| `courtyard` | family courtyard: the tulsi on its plinth, a neem over the back wall, washing, a charpai, the house door |
| `balcony` | a flat's balcony over the city: railing in front, plants and fairy lights, a plastic chair, washing |
| `office-desk` | your desk on an open office floor: monitor, mug, plant, cubicles and colleagues, the boss's glass cabin |
| `hostel-room` | shared hostel room: two steel cots, study table under the window, steel almirah, clothesline |
| `street` | city street: shopfront buildings, road with a zebra crossing, trees, traffic light, lamps, bus, auto |
| `bazaar` | bazaar lane: shopfronts, striped awnings over fruit crates, bunting, bulbs at night, a vegetable cart |
| `chai-stall` | chai stall outside college: tin roof, shelf of jars, kettle steaming, glasses, the bulb at night |
| `phone` | phone-screen close-up in your hand: a chat (ink bars, ticks, typing dots), a call, a feed |
| `school-corridor` | school corridor: classroom doors and windows with heads inside, notice board, bell, cooler |
| `exam-hall` | exam hall: single desks with answer sheets, the big wall clock (settable), far rows over papers |
| `canteen` | college canteen: steel table and benches, counter with tea urn and samosas, cricket on the TV |
| `gaming-desk` | gaming setup: big monitor (game, stream or off), RGB strip, gaming chair, headphones |
| `train-platform` | railway platform: blue coaches with barred windows and an open door, board, clock, tea trolley |
| `sleeper-coach` | sleeper coach bay: three tiers of berths, barred window with fields or city sliding past |
| `hospital-corridor` | hospital corridor: waiting bench, theatre doors with the red lamp, drip stand, wheelchair |
| `bank-atm` | ATM cabin: the machine (menu, cash or error, notes out of the slot), the guard, a queue |
| `rooftop` | flat rooftop: water tank, dish, washing, parapet with lights, kites by day, the city all round |
| `festival-street` | a lane on Diwali: string lights, lanterns, diyas, rangoli, rockets after dark (`Sparkler` prop) |
| `wedding-hall` | wedding hall: stage with marigold curtain and the couple's thrones, guests, chandeliers |
| `gully-cricket` | gully cricket: stumps chalked on the end wall, a parked bike, an aunty at the window (`Bat` prop) |
| `stadium` | cricket stadium from the stands: tiers of crowd, flags and a wave, floodlights, big screen |
| `city-skyline` | the city across the bay from a sea-front wall: layered skyline, flyover traffic, shore lamps |
| `tv-studio` | news studio or live stream: anchor desk, big screen (chart, map or a guest), city backdrop |

A set a film draws for itself goes in the video's `scenes/`. If it would serve other films (another room of the
viewer's week), lift it into the library afterwards: same contract, a vitest entry in `tests/sets.test.ts`, and a still
in all six moods for the owner.

## The look test first

Before building out, render the one picture only this premise can show (story #8) in two or three ways, as stills or
5-second clips, and let the owner pick one. The thumbnail and the film hang on this shot; it is decided from renders,
never described. Never restage the picked shot afterwards.

## Build

1. Build each `> SCENE:` from the kit, lit by its `> MOOD:` (`moodLook`), with pause bars, named expressions, shot
   helpers, and the channel's rule for sources (Say Suppose: in the description, not on screen). Use the kit: sets as
   layers at different depths, rigged figures, props. Reuse a library set before drawing a new one (above). No AI images and no AI
   video clips: everything on screen is drawn in code. `scenes/Root.tsx` registers two compositions with the same
   props: `RoughCut` (the film) and `RoughCutSound`, the film inside `<SoundOnly.Provider value={true}>`
   (`@whatif/kit/sound`), which the audio pass renders. Put every `<Audio>` outside `<Stage>` and `<Figure>` (as the
   pause-time film's beats do), or the sound composition drops it.
2. Motion reads named cues anchored to spoken words, never hard-coded times, so a new voice take re-times the scene.
   Something changes every 2 to 4 seconds; no hold is longer than 6 seconds.
3. Life comes from poses, eyes, props and the camera. No lip-sync and no line boil.
4. On-screen text is a tag, a counter or a speech bubble, off faces and inside the safe area
   (`core/studio/rules/text-placement.md`).
5. Sound effects and the bed sit under the voice; ducks ramp, cues fade in (`core/studio/rules/no-audio-clicks.md`).
   The last 15 seconds keep the right third of the frame quiet for end screens.
6. Check frames with `whatif_stills`. Build the watch copy at 1280x720 in `renders/` (git-ignored): the picture
   (`whatif_render` `mode: picture`), the sound (`whatif_render` `mode: audio`, `composition: RoughCutSound`, to a
   `.wav`), and the watch file (`whatif_mux` of the two). Every render tool takes the render queue and records its own
   time, so do not wrap it in `studio.jobs run`. Per-video render hours: `python -m studio.jobs report --video <id>
   --step whatif_`. In the same sitting as the first picture watch, quote the music (tool, provider, model, cost) and
   ask the owner's yes.

**A sound-only note** (music level, ducks, an effect's volume, mutes, the narration track): change the code, render
`whatif_render` `mode: audio` (`composition: RoughCutSound`) to a `.wav`, then `whatif_mux` it onto the last picture
pass. Pass `sound_only_change: true` only when every file the mux lists in `scene_files_changed` changes sound alone,
and name those files in the hand-over. A note that moves timing (a gap, a tempo, a new take) changes props.json; the
mux refuses it, so render the picture again. Apply every owner note, or say in one line why not.

**The first 30 seconds.** Something changes about every 3 s, the frames are bright, and the opening frame works as an
autoplay preview: it looks like the thumbnail, because autoplay viewers never see the thumbnail (story #2).

**Sound first.** Before the lock, render the sound pass with the narration muted and watch it with the picture: the cut
must still hold on music, Foley and the sound beds alone (Dr Plants: "watchable with just sound"). Note what fails and
fix it before G3.

## The voice A/B (only when the owner asks for it)

The local Qwen-Arthur voice ships by default (owner, 2026-11-11, three films a week). Run this A/B only when the owner
asks for it on a film, usually one that is breaking out.

7. When the picture is near-final, take the opening ten lines and the dilemma line in the paid narrator: rebuild the
   story with `WHATIF_VOICE=paid` (`whatif_story`), quote them (`higgsfield generate cost` per line; the build also
   quotes), announce tool, provider, model and total, and wait for the owner's yes. Then `whatif_narration` with
   `owner_approved_paid_call: true` and `max_credits` set to the approved cap. Paid and local takes are cached apart.
8. The owner compares paid and local by ear on the same lines. If paid is clearly better: quote the full script, get
   the owner's yes, run the full paid batch, and re-render (motion re-times itself on the cue words). If not, the local
   voice ships and nothing more is spent.

## Lock

9. `.venv/bin/omni qc <slug> <video> final_edit --media <render>` must pass: loudness inside the channel's
   `loudness.story` targets, no clicks or steps, no near-duplicate (`omni similar`).
10. `status: awaiting_human`, then stop.
