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
  // v6 (wider; owner, 2026-11-15): the same local electronic cues, re-spotted on the new story.
  { file: "theme-light.mp3", from: null },                       // midnight, the rip: the channel signal
  { file: "cues/wonder.wav", from: "There is no off switch" },    // the rule, the sticky note, the chessboard
  { file: "cues/climb.wav", from: "Day eleven." },               // everything you ever wanted
  { file: "cues/jackpot.wav", from: "Day twenty-seven." },       // the penthouse, the sea, the club, the billion cents
  { file: "cues/future.wav", from: "So you spend." },            // the cash machine, the spree, the shares, the drones
  { file: "cues/price.wav", from: "Karl: Same flour." },         // the board climbing
  { file: "cues/ache.wav", from: "She counts what her savings" }, // the one quiet beat
  { file: "cues/chaos.wav", from: "So you try the obvious" },    // a million each, 1324, 1923
  { file: "cues/planet.wav", from: "Day fifty-two." },           // the news, the Earth, the universe, the last number
  { file: "cues/countdown.wav", from: "You call Herr Brandt" },  // the call, the refund, the run
  { file: "cues/triumph.wav", from: "Zero, doubled" },           // the win, the cliffhanger
];

/** [bed (assets/sfx/bed-<name>.wav), from the start of this line (or an anchor)]; the first plays from frame 0. */
export const BEDS: [string, string | Anchor | null][] = [
  ["flat-night", null],
  ["bakery", "There is no off switch"],
  ["hush", "So you make yourself a rule"],
  ["bakery-lamp", "A king, a chessboard"],
  ["bakery", "Day eleven."],
  ["flat-clock", "Day seventeen."],
  ["party", "Day twenty-one."],
  ["street", "Day twenty-two."],
  ["hush", { line: "Day twenty-two.", edge: "end" }],
  ["bank", "Herr Brandt: Is it a mistake"],
  ["night", "Day twenty-seven."],
  ["bakery", "Day twenty-eight."],
  ["street-quiet", "Anna has never seen the sea."],
  ["ground", "Day thirty."],
  ["bakery", { line: "Jonas: I don't know what", edge: "end" }],
  ["street", "So you spend."],
  ["hush", "A car. A tiny jet."],
  ["street", "Day thirty-five."],
  ["bakery", "Money is a ticket"],
  ["street", "And everything you spend"],
  ["backdoor", "Karl: Same flour."],
  ["bakery", "Day forty."],
  ["bakery-lamp", { line: "Day forty.", edge: "end" }],
  ["street", "So you try the obvious"],
  ["bakery", "Nobody goes to work"],
  ["hush", "This has happened before."],
  ["hush", "Day fifty-two."],
  ["night", "You call Herr Brandt"],
  ["bank-night", "Herr Brandt: Everything goes"],
  ["night", "Herr Brandt: Fifty minutes"],
  ["street", "Who takes one cent"],
  ["door", "Anna: All counted?"],
  ["bakery", "Day fifty-six."],
];
