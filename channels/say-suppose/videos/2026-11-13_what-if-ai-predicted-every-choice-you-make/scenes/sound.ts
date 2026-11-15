/** The film's sound plan in seconds of the v2 timeline (cues.yaml is the intent; this is where it plays). The owner on
 *  the last film (taste.md, 2026-11-13): one theme looping under a whole film is monotonous, so the score changes with
 *  each section (make_music.py, ACE-Step, local) and every set has its own ambience bed (make_ambience.py). Section
 *  starts are the beats' first lines in assets/narration/props.json; re-place them after a re-voice. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 11.1 },             // The Lamp: the skit, the channel's signal
  { file: "cues/wonder.wav", from: 11.1, to: 98.2 },          // Half Price, The Rule: the first tags, the torn tag
  { file: "cues/mischief.wav", from: 98.2, to: 148.5 },       // Random: the mirror, the four reds, the coin
  { file: "cues/carnival.wav", from: 148.5, to: 269.2 },      // Your Stall, The City Plays: the lunch queue to the forty-phone train
  { file: "cues/routine.wav", from: 269.2, to: 325.0 },       // Boring Pays: the same lunch, the napkin tie
  { file: "cues/mischief.wav", from: 325.0, to: 362.2 },      // Sixty Per Cent: "Machine hates me." (v1's warm cue; v2 plays it as comedy)
  { file: "cues/dread.wav", from: 362.2, to: 445.4 },         // Red: the crimson seventy-one, the chase, the facts
  { file: "cues/clock.wav", from: 445.4, to: 486.6 },         // The Dilemma
  { file: "theme-dark-thin.wav", from: 486.6, to: 499.6 },    // The Key: the signal thinned under 94, 96, 98
  // 499.6-501.3: nothing at all, the blank card (cues.yaml planned silence)
  { file: "theme-light.mp3", from: 501.3, to: 524.3 },        // The Key: the triumph, the signal back in full
  { file: "cues/reveal.wav", from: 524.3, to: 596.6 },        // The Board: the board spun backwards, the city
  { file: "cues/resolve.wav", from: 596.6, to: 640.8 },       // The Queue: the copycats, the train, the kid
  { file: "theme-light.mp3", from: 640.8, to: 652 },          // the close and the end card: the signal again
];

/** The key's 10 s wordless peak (the hold after "Ninety-four.", line 86): the score drops to a floor and one held note
 *  plays, then the theme comes back in (rules/sound.md #3). */
export const PEAK = { from: 487.6, to: 497.6, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. Section-level for the first cut. */
export const BEDS: [number, string][] = [
  [0, "court-night"], [42.5, "walkway"], [98.2, "bathroom"], [111.6, "court-day"], [175.4, "platform"],
  [205.3, "street-day"], [222.4, "court-day"], [253.3, "train"], [269.2, "court-day"], [362.2, "court-night"],
  [384.0, "court-day"], [391.0, "platform"], [400.0, "paper"], [416.5, "court-night"], [524.3, "lamppost"],
  [580, "city"], [596.6, "court-day"], [625.7, "train"],
];
