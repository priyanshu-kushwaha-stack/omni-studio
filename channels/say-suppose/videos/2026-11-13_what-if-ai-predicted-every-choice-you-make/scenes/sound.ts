/** The film's sound plan in seconds of the v2 timeline (voice B, 2026-11-15) (cues.yaml is the intent; this is where it plays). The owner on
 *  the last film (taste.md, 2026-11-13): one theme looping under a whole film is monotonous, so the score changes with
 *  each section (make_music.py, ACE-Step, local) and every set has its own ambience bed (make_ambience.py). Section
 *  starts are the beats' first lines in assets/narration/props.json; re-place them after a re-voice. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 11.1 },             // The Lamp: the skit, the channel's signal
  { file: "cues/wonder.wav", from: 11.1, to: 91.3 },          // Half Price, The Rule: the first tags, the torn tag
  { file: "cues/mischief.wav", from: 91.3, to: 139.4 },       // Random: the mirror, the four reds, the coin
  { file: "cues/carnival.wav", from: 139.4, to: 252.9 },      // Your Stall, The City Plays: the lunch queue to the forty-phone train
  { file: "cues/routine.wav", from: 252.9, to: 306.4 },       // Boring Pays: the same lunch, the napkin tie
  { file: "cues/mischief.wav", from: 306.4, to: 340.2 },      // Sixty Per Cent: "Machine hates me." (v1's warm cue; v2 plays it as comedy)
  { file: "cues/dread.wav", from: 340.2, to: 419.1 },         // Red: the crimson seventy-one, the chase, the facts
  { file: "cues/clock.wav", from: 419.1, to: 459.3 },         // The Dilemma
  { file: "theme-dark-thin.wav", from: 459.3, to: 472.6 },    // The Key: the signal thinned under 94, 96, 98
  // 472.6-474.4: nothing at all, the blank card (cues.yaml planned silence)
  { file: "theme-light.mp3", from: 474.4, to: 497.0 },        // The Key: the triumph, the signal back in full
  { file: "cues/reveal.wav", from: 497.0, to: 567.4 },        // The Board: the board spun backwards, the city
  { file: "cues/resolve.wav", from: 567.4, to: 611.4 },       // The Queue: the copycats, the train, the kid
  { file: "theme-light.mp3", from: 611.4, to: 622 },          // the close and the end card: the signal again
];

/** The key's 10 s wordless peak (the hold after "Ninety-four.", line 86): the score drops to a floor and one held note
 *  plays, then the theme comes back in (rules/sound.md #3). */
export const PEAK = { from: 460.4, to: 470.4, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. Section-level for the first cut. */
export const BEDS: [number, string][] = [
  [0, "court-night"], [42.0, "walkway"], [91.3, "bathroom"], [103.7, "court-day"], [165.2, "platform"],
  [193.0, "street-day"], [209.5, "court-day"], [237.6, "train"], [252.9, "court-day"], [340.2, "court-night"],
  [361.7, "court-day"], [363.4, "platform"], [376.6, "paper"], [399.8, "court-night"], [497.0, "lamppost"],
  [550, "city"], [567.4, "court-day"], [596.0, "train"],
];
