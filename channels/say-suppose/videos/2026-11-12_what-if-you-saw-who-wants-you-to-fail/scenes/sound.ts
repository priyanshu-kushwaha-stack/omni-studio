/** The film's sound plan in seconds of the v3 timeline (cues.yaml is the intent; this is where it plays). The owner on
 *  v3 (2026-11-13): "better sound in the video just to break the continuous background music flowing throughout the
 *  video which might be monotonous". So the score changes with each section, and every set has its own ambience bed.
 *  Section starts are the beats' first lines (props.json); bed changes follow the picture's set changes. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 14.4 },        // the skit on the platform: the channel's signal
  { file: "cues/wonder.wav", from: 14.4, to: 120.7 },    // Made the Cut, The Rule: the card, the scale, the store
  { file: "cues/hunt.wav", from: 120.7, to: 251.9 },     // Who's Red: testing the rule on everyone
  { file: "cues/home.wav", from: 251.9, to: 284.3 },     // Her Back: your sister in the doorway
  { file: "cues/crowd.wav", from: 284.3, to: 407.3 },    // A Thousand Cards, Four in a Hundred
  { file: "cues/friend.wav", from: 407.3, to: 455.5 },   // The Notebook
  { file: "cues/dread.wav", from: 455.5, to: 538.8 },    // Say It Again, The Country Holds Its Breath: the cost
  { file: "cues/ache.wav", from: 538.8, to: 590.2 },     // A Text Would Open Nothing
  { file: "theme-dark-thin.wav", from: 590.2, to: 645.6 }, // The Loading Dock: the signal, thinner, at the cost
  { file: "cues/resolve.wav", from: 645.6, to: 677.0 },  // Two Letters
  { file: "theme-light.mp3", from: 677.0, to: 694.2 },   // the end card: the signal again
];

/** The dock's wordless peak (the 9 s hold before line 122): the score drops to a floor and one held note plays, then the
 *  theme comes back in once (rules/sound.md #3). */
export const PEAK = { from: 604.1, to: 613.1, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. */
export const BEDS: [number, string][] = [
  [0, "platform"], [25, "classroom"], [29, "street-night"], [53, "reading"], [67, "store"],
  [119, "classroom"], [161, "street-day"], [171, "bus"], [187, "classroom"], [223, "street-night"],
  [251.9, "home"], [284.3, "street-night"], [335, "classroom"], [375, "store"], [387, "classroom"],
  [405, "reading"], [459, "street-night"], [461, "home"], [491, "reading"], [495, "classroom"],
  [507, "hush"], [517, "classroom"], [538.8, "home"], [543, "classroom"], [547, "home"], [559, "classroom"],
  [561, "home"], [569, "classroom"], [575, "home"], [583, "bus"], [589.4, "dock"], [623, "home"],
  [627, "dock"], [645.6, "home"],
];
