/** The film's sound plan in seconds of the v5 narration timeline (cues.yaml is the intent; this is where it plays).
 *  Owner on the saw-who-wants-you-to-fail v3 (2026-11-13): "better sound in the video just to break the continuous
 *  background music flowing throughout the video which might be monotonous". So the score changes with each section
 *  (a cue made locally by make_music.py) and every set has its own ambience bed (make_ambience.py). Section starts are
 *  the beats' first lines (assets/narration/props.json); bed changes follow the picture's set changes. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 12.8 },          // the skit in the pod hall: the channel's signal
  { file: "cues/wonder.wav", from: 12.8, to: 66.7 },       // The Rule: the counters, the thousand, the strip
  { file: "cues/piano.wav", from: 66.7, to: 131.5 },       // The Piano: the inside year, the cardboard keys
  { file: "cues/montage.wav", from: 131.5, to: 200.5 },    // Seven Years a Week: a night a trick, the door code
  { file: "cues/city.wav", from: 200.5, to: 287.1 },       // The City Plugs In, down to the silent train
  { file: "cues/cold.wav", from: 287.1, to: 325.5 },       // The Cold Apology
  { file: "cues/vertigo.wav", from: 325.5, to: 374.5 },    // Night Thirty
  { file: "cues/guilt.wav", from: 374.5, to: 398.7 },      // It Was Yesterday
  { file: "cues/deep.wav", from: 398.7, to: 444.9 },       // The Timeline
  { file: "cues/tender.wav", from: 444.9, to: 483.0 },     // Her Offer
  { file: "theme-dark-thin.wav", from: 483.0, to: 543.7 }, // The Slow Room: the signal, thinner, at the cost
  { file: "cues/resolve.wav", from: 543.7, to: 566.0 },    // Tell Me Now
  { file: "theme-light.mp3", from: 566.0, to: 574.2 },     // the end card: the signal again
];

/** The slow room's wordless peak (the 9 s hold after "Tomorrow's too far."): the score drops to a floor and one held
 *  note plays, then the theme comes back in once (rules/sound.md #3). */
export const PEAK = { from: 507.6, to: 516.6, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. Section-level for the first cut;
 *  finer set changes are spotted at G4. */
export const BEDS: [number, string][] = [
  [0, "pod-hall"], [66.7, "town"], [100, "kitchen"], [131.5, "kitchen"], [170, "pod-hall"], [190, "street-night"],
  [200.5, "pod-hall"], [215, "room"], [270, "train"], [287.1, "kitchen-night"], [325.5, "town"], [374.5, "kitchen-night"],
  [398.7, "pod-hall"], [444.9, "pod-hall"], [483.0, "slow"], [543.7, "kitchen-morning"],
];
