// The film's sound plan, anchored to spoken lines (shotTypes.ts anchors), so it re-times with the voice. cues.yaml is
// the intent. A score cue per section (make_music.py, ACE-Step, local and free) and an ambience bed per set
// (scenes/make_ambience.py), so the music changes with the story instead of one theme looping (owner, 2026-11-13:
// "better sound in the video just to break the continuous background music").
import { E, S, type Anchor } from "./shotTypes";

/** One score cue per section; `file` is under assets/music/. The first starts at frame 0. */
export const SCORE: { file: string; at: Anchor }[] = [
  { file: "theme-light.mp3", at: S("What if you fired everyone") },        // the frame and the skit: the channel signal
  { file: "cues/rule.wav", at: S("Every lunch, the same count.") },          // The Rule
  { file: "cues/fired.wav", at: S("Marco: Who's this?") },                   // Fired
  { file: "cues/plant.wav", at: S("The boss rents fifty") },                 // The Plant
  { file: "cues/town.wav", at: S("Banker: ATMs didn't kill tellers") },      // The Whole Town
  { file: "cues/rich.wav", at: S("The key to the town.") },                  // Rich
  { file: "cues/turn.wav", at: S("Forty stools. Nobody on them.") },         // The Missing Line
  { file: "cues/buy.wav", at: S("So you type CUSTOMER.") },                  // Make Them Buy
  { file: "cues/cheque.wav", at: S("You write every resident a cheque.") },  // The Cheque
  { file: "cues/hammers.wav", at: S("Nobody can bring themselves") },        // Hammers
  { file: "cues/dial.wav", at: S("Rival: Mine too? All eight?") },           // The Dial, to the peak
  { file: "theme-light.mp3", at: S("Plant boss: Still cheaper than a cook?") }, // Stool Four and the end card
];

/** The wordless peak (the whistle, 10 s): the score drops to a floor and one held note plays (rules/sound.md #3). */
export const PEAK = { from: E("Friday noon. The board votes to stay."), to: S("In the two economists' model"), floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its anchor to the next. */
export const BEDS: { name: string; at: Anchor }[] = [
  { name: "diner-night", at: S("What if you fired everyone") },
  { name: "diner", at: S("Waitress: Marco's sick. Again.") },
  { name: "plant", at: S("The boss rents fifty") },
  { name: "town", at: S("Banker: ATMs didn't kill tellers") },
  { name: "diner", at: S("The key to the town.") },
  { name: "diner-night", at: S("Forty stools. Nobody on them.") },
  { name: "town", at: S("You write every resident a cheque.") },
  { name: "crowd", at: S("Nobody can bring themselves") },
  { name: "diner", at: S("Rival: Mine too? All eight?") },
];

/** The title card after the premise; the paper subscribe tag on the news van; the end card. */
export const CARD = E("Six weeks from now");
export const SUBSCRIBE = S("Reporter: The town's first machine millionaire!", 30);
export const END = S("So, who do you think paid");
