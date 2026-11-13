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
  { file: "theme-light.mp3", from: null },                       // One Cent: the card declined, the midnight rip
  { file: "cues/wonder.wav", from: "Two cents. Last night" },     // the narrator, the rule, the king's wheat
  { file: "cues/giddy.wav", from: "Day eleven." },               // your own roll, thirty-one cakes, the whole tram
  { file: "cues/uneasy.wav", from: "But here's the problem" },   // yesterday's number, Herr Brandt's form
  { file: "cues/awe.wav", from: "Day twenty-eight." },           // the building, the billion cents
  { file: "cues/spree.wav", from: "So you spend." },             // the club, the balloon, the shops
  { file: "cues/price.wav", from: "Karl: Same flour." },         // the back door, the board climbing
  { file: "cues/ache.wav", from: "Same rolls. Four twenty" },    // Lotte's savings book (her theme, sad)
  { file: "cues/giving.wav", from: "So you try the obvious" },   // the envelopes
  { file: "cues/notme.wav", from: "Jonas: Six thirty?" },        // Jonas's "Not me" (her theme on cello)
  { file: "cues/dread.wav", from: "Day fifty-five." },           // the planet, the choice
  { file: "cues/countdown.wav", from: "Herr Brandt: So it was" }, // exactly zero, the refund, down the stairs
  { file: "cues/door.wav", from: "Lotte: All counted?" },        // the glass door (her theme, tender), into the silence
  { file: "cues/resolve.wav", from: "Zero, doubled" },           // after the silence: her theme whole, the morning
];

/** [bed (assets/sfx/bed-<name>.wav), from the start of this line (or an anchor)]; the first plays from frame 0. */
export const BEDS: [string, string | Anchor | null][] = [
  ["bakery", null],                              // the counter, seven in the morning
  ["flat-night", { line: "Lotte: And a day-old", edge: "end" }], // midnight, the flat
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
  ["street", "So you spend."],
  ["ground", "Day thirty-three."],
  ["street", "Day thirty-five."],                // the balloon over the roofs
  ["bakery", "It isn't. Money is a ticket"],
  ["backdoor", "Karl: Same flour."],
  ["bakery", "Day forty."],
  ["bakery-lamp", { line: "Same rolls. Four twenty", edge: "end" }], // her savings book
  ["street", "So you try the obvious"],
  ["bakery", "Lotte: Flour. Not money."],
  ["hush", "This has happened before."],         // Cairo, a picture
  ["bakery", "Jonas: Six thirty?"],
  ["night", "Day fifty-five."],
  ["bakery-lamp", "Here's your choice."],
  ["flat-clock", "Herr Brandt: So it was"],      // eleven at night, the clock
  ["bank-night", "Herr Brandt: Everything goes"],
  ["flat-clock", "Herr Brandt: Fifty minutes"],
  ["door", "Lotte: All counted?"],               // the glass door: the silence's floor
  ["bakery", "Day fifty-six."],
];
