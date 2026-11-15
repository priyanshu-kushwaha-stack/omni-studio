// The film's sound plan, anchored to spoken lines (shots.tsx anchors), so it re-times with the voice. cues.yaml is the
// intent. The owner on the wants-you-to-fail cut (2026-11-13): "better sound in the video just to break the
// continuous background music flowing throughout the video which might be monotonous": a score cue per section
// (make_music.py, ACE-Step, local) and an ambience bed per set (make_ambience.py).
import { E, S, type Anchor } from "./shots";

/** One score cue per section; `file` is under assets/music/. The first starts at frame 0. Script v2.3 (exciting, not
 *  sad): the cues are re-spotted to the new sections; "cold" (staccato low strings, a metallic tick) now drives the
 *  office set piece, "home" the dinner bet, "night" the stakeout. */
export const SCORE: { file: string; at: Anchor }[] = [
  { file: "theme-light.mp3", at: S("Mother: Make a wish") },           // the skit and the key shot: the channel's signal
  { file: "cues/wonder.wav", at: S("You've always graded") },          // The Rule
  { file: "cues/hunt.wav", at: S("You go through your phone") },       // The Detective: customs, the aunts, asking
  { file: "cues/test.wav", at: S("Your best friend. Bea.") },          // The Test and Your Own Dots
  { file: "cues/home.wav", at: S("Saturday. Your mother's party") },   // Set for Two
  { file: "cues/night.wav", at: S("But your best friend's dot") },     // Catch Her at It
  { file: "cues/cold.wav", at: S("Monday. The office.") },             // The Office
  { file: "cues/crowd.wav", at: S("Then you look up") },               // Fields of Red, The Offer
  { file: "theme-dark-thin.wav", at: S("On the roof, you see") },      // The Dark City: the signal, thinner
  { file: "cues/resolve.wav", at: S("You delete it.") },               // The Cafe, Three Words
  { file: "theme-light.mp3", at: S("So, how many of your last") },     // the end card
];

/** The roof's wordless peak: the score drops to a floor and one held note plays (rules/sound.md #3). */
export const PEAK = { from: E("Now take away the dotted ones."), to: S("Half the city is talking"), floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its anchor to the next. */
export const BEDS: { name: string; at: Anchor }[] = [
  { name: "home", at: S("Mother: Make a wish") },
  { name: "bus", at: S("You go through your phone") },
  { name: "home", at: S("Your two aunts.") },
  { name: "bus", at: S("Now, the obvious move.") },
  { name: "street-dusk", at: S("Your best friend. Bea.") },
  { name: "home", at: S("Your sent folder.") },
  { name: "bus-night", at: S("Two a.m. The night bus.") },
  { name: "callcentre", at: E("Six years old.") },
  { name: "office", at: S("Monday. The office.") },
  { name: "street-dusk", at: S("Then you look up") },
  { name: "cafe", at: E("The restaurant downstairs.") },
  { name: "office", at: S("Cousin: Thank you all") },
  { name: "home", at: S("Newsreader: The senator's") },
  { name: "office", at: S("So you do the cleverest") },
  { name: "rooftop", at: S("On the roof, you see") },
  { name: "cafe", at: S("You delete it.") },
  { name: "home", at: S("That evening. Your boss.") },
];

/** The title card after the premise; the paper subscribe tag on the night bus; the end card. */
export const CARD = E("And the only wish");
export const SUBSCRIBE = S("Two a.m. The night bus.", 30);
export const END = S("So, how many of your last");
