/** The film's sound plan in seconds of the v3 timeline (voice B, 2026-11-23; re-placed from v2 by line-anchored mapping) (cues.yaml is the intent; this is where it plays). The owner on
 *  the last film (taste.md, 2026-11-13): one theme looping under a whole film is monotonous, so the score changes with
 *  each section (make_music.py, ACE-Step, local) and every set has its own ambience bed (make_ambience.py). Section
 *  starts are the beats' first lines in assets/narration/props.json; re-place them after a re-voice. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0.0, to: 11.1 },             // The Lamp: the skit, the channel's signal
  { file: "cues/wonder.wav", from: 11.1, to: 111.7 },          // Half Price, The Rule: the first tags, the torn tag
  { file: "cues/mischief.wav", from: 111.7, to: 169.3 },       // Random: the mirror, the four reds, the coin
  { file: "cues/carnival.wav", from: 169.3, to: 307.8 },      // Your Stall, The City Plays: the lunch queue to the forty-phone train
  { file: "cues/routine.wav", from: 307.8, to: 371.9 },       // Boring Pays: the same lunch, the napkin tie
  { file: "cues/mischief.wav", from: 371.9, to: 414.7 },      // Sixty Per Cent: "Machine hates me." (v1's warm cue; v2 plays it as comedy)
  { file: "cues/dread.wav", from: 414.7, to: 505.3 },         // Red: the crimson seventy-one, the chase, the facts
  { file: "cues/clock.wav", from: 505.3, to: 551.4 },         // The Dilemma
  { file: "theme-dark-thin.wav", from: 551.4, to: 564.7 },    // The Key: the signal thinned under 94, 96, 98
  // 564.7-566.5: nothing at all, the blank card (cues.yaml planned silence)
  { file: "theme-light.mp3", from: 566.5, to: 593.4 },        // The Key: the triumph, the signal back in full
  { file: "cues/reveal.wav", from: 593.4, to: 679.0 },        // The Board: the board spun backwards, the city
  { file: "cues/resolve.wav", from: 679.0, to: 731.5 },       // The Queue: the copycats, the train, the kid
  { file: "theme-light.mp3", from: 731.5, to: 742.1 },          // the close and the end card: the signal again
];

/** The key's 10 s wordless peak (the hold after "Ninety-four.", line 86): the score drops to a floor and one held note
 *  plays, then the theme comes back in (rules/sound.md #3). */
export const PEAK = { from: 552.5, to: 562.5, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. Section-level for the first cut. */
export const BEDS: [number, string][] = [
  [0.0, "court-night"], [49.3, "walkway"], [111.7, "bathroom"], [130.1, "court-day"], [201.0, "platform"],
  [233.0, "street-day"], [256.6, "court-day"], [290.5, "train"], [307.8, "court-day"], [414.7, "court-night"],
  [442.2, "court-day"], [443.9, "platform"], [457.1, "paper"], [484.4, "court-night"], [593.4, "lamppost"],
  [661.6, "city"], [679.0, "court-day"], [708.4, "train"],
];
