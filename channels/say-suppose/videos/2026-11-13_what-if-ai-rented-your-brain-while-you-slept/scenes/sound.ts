/** The film's sound plan in seconds of the v1 timeline (cues.yaml is the intent; this is where it plays). From the
 *  owner's note on the last film (2026-11-13): "better sound in the video just to break the continuous background music
 *  flowing throughout the video which might be monotonous". So the score changes with each section, and every set has
 *  its own ambience bed. Section starts are the beats' first lines (props.json); bed changes follow the picture's set
 *  changes. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 13.5 },        // the skit in the clinic: the channel's signal
  { file: "cues/hush.wav", from: 13.5, to: 49.3 },       // Night One: the first rented night
  { file: "cues/leaflet.wav", from: 49.3, to: 103.7 },   // The Rule: the leaflet
  { file: "cues/crumbs.wav", from: 103.7, to: 214.0 },   // Crumbs
  { file: "cues/boom.wav", from: 214.0, to: 294.7 },     // More Hours: the gold rush, then the keys
  { file: "cues/unease.wav", from: 294.7, to: 369.8 },   // The Night Shift
  { file: "cues/photo.wav", from: 369.8, to: 414.0 },    // The Photo
  { file: "cues/market.wav", from: 414.0, to: 487.8 },   // The Warehouses: the price falls
  { file: "cues/dread.wav", from: 487.8, to: 535.5 },    // The Contract
  { file: "cues/awe.wav", from: 535.5, to: 603.5 },      // One Mind: the globe
  { file: "cues/release.wav", from: 603.5, to: 627.8 },  // Midnight
  { file: "cues/dawn.wav", from: 627.8, to: 662.0 },     // Morning
  { file: "theme-light.mp3", from: 662.0, to: 668.9 },   // the end card: the signal again
];

/** The globe's wordless peak (the 9 s hold after line 82): the score drops to a floor and one held note plays, then the
 *  cue comes back in once (rules/sound.md #3). */
export const PEAK = { from: 579.1, to: 588.1, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. */
export const BEDS: [number, string][] = [
  [0, "clinic"], [13.5, "bridge"], [17, "bunk-night"], [30, "bunk-morning"], [49.3, "kitchen"],
  [140, "bridge"], [150, "kitchen"], [214, "bus"], [225, "office"], [240, "street"],
  [294.7, "bunk-night"], [369.8, "hall"], [385, "kitchen"], [414, "kitchen"], [418, "bridge"], [434, "warehouse"], [482.5, "bridge"],
  [487.8, "kitchen-lamp"], [535.5, "bunk-night"], [627.8, "bunk-morning"], [655, "street"],
];
