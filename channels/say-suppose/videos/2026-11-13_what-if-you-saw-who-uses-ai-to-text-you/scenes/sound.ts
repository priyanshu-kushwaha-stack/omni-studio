// The film's sound plan, anchored to spoken lines (shots.tsx anchors), so it re-times with the voice. cues.yaml is the
// intent. The owner on the wants-you-to-fail cut (2026-11-13): "better sound in the video just to break the
// continuous background music flowing throughout the video which might be monotonous": a score cue per section
// (make_music.py, ACE-Step, local) and an ambience bed per set (make_ambience.py).
import { E, S, type Anchor } from "./shots";

/** One score cue per section; `file` is under assets/music/. The first starts at frame 0. */
export const SCORE: { file: string; at: Anchor }[] = [
  { file: "theme-light.mp3", at: S("Mother: Make a wish") },          // the skit and the key shot: the channel's signal
  { file: "cues/wonder.wav", at: S("You've always graded") },         // The Rule: the dots, the map
  { file: "cues/hunt.wav", at: S("The landlord.") },                  // The Detective: testing everyone, the aunts
  { file: "cues/test.wav", at: S("Your best friend. Bea.") },         // The Test and Your Own Dots: the goat, the sent folder
  { file: "cues/cold.wav", at: S("You type every word") },            // The Cold Week
  { file: "cues/home.wav", at: E("The one person who never") },       // The Shoebox
  { file: "cues/night.wav", at: S("The night bus.") },                // The Bench, The Cost
  { file: "cues/crowd.wav", at: S("The restaurant downstairs.") },    // Fields of Red: the internet, the offer
  { file: "theme-dark-thin.wav", at: S("You walk out with the dots") },  // The Dark City: the signal, thinner
  { file: "cues/resolve.wav", at: S("Your phone buzzes.") },          // The Cafe, Three Words
  { file: "theme-light.mp3", at: S("So, would you fix the typo?") },  // the end card
];

/** The roof's wordless peak: the score drops to a floor and one held note plays (rules/sound.md #3). */
export const PEAK = { from: E("Now take away the dotted ones."), to: S("Those are the people typing."), floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its anchor to the next. */
export const BEDS: { name: string; at: Anchor }[] = [
  { name: "home", at: S("Mother: Make a wish") },
  { name: "bus", at: S("The landlord.") },
  { name: "home", at: S("Your two aunts.") },
  { name: "office", at: S("The man from the dating app.") },
  { name: "street-dusk", at: S("Your best friend. Bea.") },
  { name: "home", at: S("Your sent folder.") },
  { name: "office", at: S("You type every word") },
  { name: "bus", at: S("The dots become a blade.") },
  { name: "office", at: E("The dots become a blade.") },
  { name: "home", at: S("Mother: Why so cold") },
  { name: "bus-night", at: S("The night bus.") },
  { name: "callcentre", at: E("Twelve hours a night.") },
  { name: "office", at: S("The restaurant downstairs.") },
  { name: "rooftop", at: S("You walk out with the dots") },
  { name: "cafe", at: S("You delete it.") },
  { name: "home", at: S("Your father's message. Two weeks") },
];

/** The title card after the premise; the paper subscribe tag on the night bus; the end card. */
export const CARD = E("Your father. Eight months");
export const SUBSCRIBE = S("The night bus.", 30);
export const END = S("So, would you fix the typo?");
