/** The film's sound (cues.yaml is the intent; this is where it plays).
 *
 *  Score (owner, 2026-11-13, on the v2 cut: "Monotonous music"): one cue per section, each from a spoken line by its
 *  opening words, the same anchors make_music.py sizes the cues from; files under assets/music/. The channel theme opens
 *  and closes the film. v4 (owner, 2026-11-13: "This is a little EMOTIONAL angle story ... Maybe with music we can make
 *  it better"): Lotte's theme comes back at her savings book (ache), Jonas's "Not me" (notme), the glass door (door) and,
 *  whole, after the silence (resolve).
 *
 *  Beds (v4, as on the wants-you-to-fail film, rules/sound.md #6): a two-layer ambience per set (make_ambience.py),
 *  each from the line that opens the set's first shot, so no moment is digital silence and the planned silence keeps a
 *  room-tone floor (#5). */
import type { Anchor } from "./shots";

export const SCORE: { file: string; from: string | null }[] = [
  // v5 (owner, 2026-11-13: "I want exciting stuff"; the outside review): an electronic score that climbs with the money.
  { file: "cues/hook.wav", from: null },                         // the flash-forward
  { file: "theme-light.mp3", from: "Lotte: Declined." },         // One Cent: the channel signal
  { file: "cues/wonder.wav", from: "Two cents. Last night" },     // the narrator, the rule, the chessboard (riser, drop)
  { file: "cues/climb.wav", from: "Day eleven." },               // your own roll, the cakes, the tram
  { file: "cues/uneasy.wav", from: "But here's the problem" },   // the bar chart, the bank
  { file: "cues/jackpot.wav", from: "Day twenty-eight." },       // the building, the billion cents, the spree, the club, the shares
  { file: "cues/future.wav", from: "Day thirty-five. A hundred" }, // BREAD-NET's thousand drones
  { file: "cues/price.wav", from: "Karl: Same flour." },         // the back door, the board climbing
  { file: "cues/ache.wav", from: "She counts what her savings" }, // the one quiet beat: Lotte's theme, once
  { file: "cues/chaos.wav", from: "So you try the obvious" },    // a million each, the city stops, Mansa Musa, "Not me"
  { file: "cues/planet.wav", from: "Day fifty-two. You're" },    // the news, the Earth, the universe
  { file: "cues/countdown.wav", from: "Herr Brandt: So it was" }, // the call, the refund, the run, into the silence
  { file: "cues/triumph.wav", from: "Zero, doubled" },           // after the silence: the win, the cliffhanger
];

/** [bed (assets/sfx/bed-<name>.wav), from the start of this line (or an anchor)]; the first plays from frame 0. */
export const BEDS: [string, string | Anchor | null][] = [
  ["bakery", null],                              // the counter, seven in the morning
  ["flat-night", { line: "Jonas: My treat.", edge: "end" }], // midnight, the flat
  ["bakery", "Here's the rule, once"],
  ["bakery-lamp", { line: "Lotte doesn't laugh", edge: "end" }], // after closing, the chessboard
  ["bakery", "Day eleven."],
  ["street", "Day twenty-one."],
  ["party", "Jonas: Who are all"],
  ["tram", "Frau Weber: Who's paying"],
  ["street-quiet", "But here's the problem"],    // the morning after the party
  ["bakery", "The number's ahead"],
  ["bank", "Herr Brandt: Where does"],
  ["bakery", "Day twenty-eight."],
  ["hush", "So you spend."],
  ["ground", "Day thirty-three."],
  ["bakery", "You're thinking it."],
  ["street", "Day thirty-five. A hundred"],                // the balloon over the roofs
  ["bakery", "It isn't. Money is a ticket"],
  ["backdoor", "Karl: Same flour."],
  ["bakery", "Day forty."],
  ["bakery-lamp", { line: "Day forty.", edge: "end" }], // her savings book
  ["street", "So you try the obvious"],
  ["bakery", "Lotte: Flour. Not money."],
  ["hush", "This has happened before."],         // Cairo, a picture
  ["bakery", "Jonas: Sixty-three?"],
  ["hush", "Day fifty-two. You're"],             // the studio, the Earth, the universe
    ["bakery-lamp", "And there's only one way out"],
  ["flat-clock", "Herr Brandt: So it was"],      // eleven at night, the clock
  ["bank-night", "Herr Brandt: Everything goes"],
  ["flat-clock", "Herr Brandt: Fifty minutes"],
  ["street", "Who takes one cent"],              // the night run
  ["door", "Lotte: All counted?"],               // the glass door: the silence's floor
  ["bakery", "Day fifty-six."],
];
