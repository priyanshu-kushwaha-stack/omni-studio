/** The film's sound plan in seconds of the v7 narration timeline (cues.yaml is the intent; this is where it plays).
 *  Owner on the saw-who-wants-you-to-fail v3 (2026-11-13): "better sound in the video just to break the continuous
 *  background music flowing throughout the video which might be monotonous". So the score changes with each section
 *  (a cue made locally by make_music.py) and every set has its own ambience bed (make_ambience.py). Section starts are
 *  the beats' first lines (assets/narration/props.json); bed changes follow the picture's set changes. */

/** One score cue per section; `file` is under assets/music/. v7 (2026-11-14): exciting, not sad. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 12.8 },          // the skit in the pod hall: the channel's signal
  { file: "cues/wonder.wav", from: 12.8, to: 73.7 },       // The Rule: juggling, the counters, the limit, the strip
  { file: "cues/piano.wav", from: 73.7, to: 134.8 },       // Night One: the inside year, the cardboard keys, Haruko
  { file: "cues/montage.wav", from: 134.8, to: 217.2 },    // Seven Years a Week: eggs, the lottery, the coach party
  { file: "cues/city.wav", from: 217.2, to: 313.1 },       // The City Plugs In, down to the train and the town
  { file: "cues/staff.wav", from: 313.1, to: 356.4 },      // Staff Last: the catch, the padlock, no naps
  { file: "cues/vertigo.wav", from: 356.4, to: 377.3 },    // Night Thirty: the town of thousands
  { file: "cues/warm.wav", from: 377.3, to: 397.1 },       // three in the morning: the one warm beat, then the idea
  { file: "cues/heist.wav", from: 397.1, to: 445.7 },      // The Kettle Lead: the caper, the stall, the peak's floor
  { file: "cues/triumph.wav", from: 445.7, to: 475.8 },    // the design spreads; kettles banned and un-banned
  { file: "cues/awe.wav", from: 475.8, to: 510.9 },        // Tomorrow: night 123, the timeline, the city
  { file: "cues/twist.wav", from: 510.9, to: 523.6 },      // the hatch beside yours, "Tell me tomorrow.", two plugs
  { file: "theme-light.mp3", from: 523.6, to: 536.2 },     // the end card: the signal again
];

/** The wordless peak (the 9 s hold after "Your hands have had thirty years."): the caper drops to a floor under the
 *  slowed counter flutter, the click on 365 lands in the quiet, then the triumph comes in (rules/sound.md #3). */
export const PEAK = { from: 436.7, to: 445.7, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. Section-level for the first cut;
 *  finer set changes are spotted at G4. */
export const BEDS: [number, string][] = [
  [0, "pod-hall"], [73.7, "town"], [103.3, "kitchen"], [134.8, "kitchen"], [139.9, "town"], [167.9, "room"],
  [182.3, "kitchen-morning"], [211.8, "pod-hall"], [214.9, "street-night"], [217.2, "pod-hall"], [225.3, "room"],
  [291.0, "train"], [308.8, "town"], [313.1, "room"], [342.3, "pod-hall"], [356.4, "town"], [377.3, "pod-hall"],
  [475.8, "pod-hall"], [502.5, "street-night"], [510.9, "pod-hall"],
];
