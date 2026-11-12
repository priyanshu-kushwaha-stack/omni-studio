/** The film's sound plan in seconds of the v1 timeline (cues.yaml is the intent; this is where it plays). The owner on
 *  the last film (taste.md, 2026-11-13): one theme looping under a whole film is monotonous, so the score changes with
 *  each section (make_music.py, ACE-Step, local) and every set has its own ambience bed (make_ambience.py). Section
 *  starts are the beats' first lines in assets/narration/props.json; re-place them after a re-voice. */

/** One score cue per section; `file` is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [
  { file: "theme-light.mp3", from: 0, to: 16.7 },            // The Lamp: the skit, the channel's signal
  { file: "cues/wonder.wav", from: 16.7, to: 95.5 },          // Half Price, The Rule: the first tags, the walk home
  { file: "cues/mischief.wav", from: 95.5, to: 141.2 },       // Random: the mirror, the four reds, the coin
  { file: "cues/carnival.wav", from: 141.2, to: 230.4 },      // The City Plays: the montage, the pickpocket, the train
  { file: "cues/routine.wav", from: 230.4, to: 291.7 },       // The Cheapest Man: the same lunch, the joke not told
  { file: "cues/warm.wav", from: 291.7, to: 340.5 },          // Sixty Per Cent: the brain scan, the napkin tie
  { file: "cues/dread.wav", from: 340.5, to: 430.0 },         // Red, A Man in Trouble: the cost
  { file: "cues/clock.wav", from: 430.0, to: 469.6 },         // The Dilemma
  { file: "theme-dark-thin.wav", from: 469.6, to: 508.3 },    // The Key: the signal, thinner, at the cost
  { file: "cues/reveal.wav", from: 508.3, to: 583.6 },        // The Board: the board running backwards, the city
  { file: "cues/resolve.wav", from: 583.6, to: 630.5 },       // The Train
  { file: "theme-light.mp3", from: 630.5, to: 636 },          // the end card: the signal again
];

/** The key's 10 s wordless peak (the hold after "Ninety-four.", line 84): the score drops to a floor and one held note
 *  plays, then the theme comes back in (rules/sound.md #3). */
export const PEAK = { from: 470.3, to: 480.3, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. Section-level for the first cut. */
export const BEDS: [number, string][] = [
  [0, "court-night"], [46.0, "walkway"], [95.5, "bathroom"], [118, "court-day"], [141.2, "platform"],
  [158, "street-day"], [168, "court-day"], [190, "platform"], [212, "train"], [230.4, "court-day"],
  [291.7, "court-night"], [340.5, "court-night"], [358, "court-day"], [380.5, "paper"], [392, "court-night"],
  [430.0, "court-night"], [508.3, "lamppost"], [565, "city"], [583.6, "court-day"], [600, "train"],
];
