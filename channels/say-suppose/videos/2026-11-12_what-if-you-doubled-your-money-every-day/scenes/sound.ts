/** The film's score (owner, 2026-11-13, on the v2 cut: "Monotonous music"): one cue per section instead of one theme
 *  looping under all nine minutes. Each starts at a spoken line, by its opening words, the same anchors make_music.py
 *  sizes the cues from; files are under assets/music/. The channel theme opens and closes the film. */
export const SCORE: { file: string; from: string | null }[] = [
  { file: "theme-light.mp3", from: null },                  // One Cent: the card declined, the midnight rip
  { file: "cues/wonder.wav", from: "Two cents. Last night" }, // the narrator, the rule, the king's wheat
  { file: "cues/giddy.wav", from: "Day eleven." },          // your own roll, thirty-one cakes, the whole tram
  { file: "cues/uneasy.wav", from: "But here's the problem" }, // yesterday's number, Herr Brandt's form
  { file: "cues/awe.wav", from: "Day twenty-eight." },      // the building, the billion cents
  { file: "cues/spree.wav", from: "So you spend." },        // the club, the balloon, the shops
  { file: "cues/cost.wav", from: "Karl: Same flour." },     // Lotte's chalkboard, her savings
  { file: "cues/dread.wav", from: "So you try the obvious" }, // not me, the planet
  { file: "cues/countdown.wav", from: "Herr Brandt: So it was" }, // exactly zero
  { file: "cues/resolve.wav", from: "Day fifty-six." },     // back to the counter
];
