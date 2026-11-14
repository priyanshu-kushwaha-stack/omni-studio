/** The film's sound plan (cues.yaml is the intent; this is where it plays). The owner on v3 (2026-11-13): "better sound
 *  in the video just to break the continuous background music flowing throughout the video which might be monotonous".
 *  So the score changes with each section, and every set has its own ambience bed.
 *
 *  v5 (2026-11-14, "exciting, not sad"): the plan is placed on v5's lines (story.json numbering), so it follows the
 *  narration with no retiming. Each cue starts on its section's first line; each bed on the line where its set comes in. */
import type { Clip } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";

/** One score cue per section, on the line it starts with; `file` is under assets/music/. */
const SCORE: { file: string; line: number }[] = [
  { file: "theme-light.mp3", line: 0 },          // the skit on the platform: the channel's signal
  { file: "cues/wonder.wav", line: 1 },          // Made the Cut, The Rule: the card, the scale, the store, the lie test
  { file: "cues/hunt.wav", line: 22 },           // Who's Red: testing the card on everyone
  { file: "cues/home.wav", line: 48 },           // Her Back: the doorway
  { file: "cues/hunt.wav", line: 51 },           // The Weapon: the mock-score montage
  { file: "cues/crowd.wav", line: 62 },          // Five Hundred, A Thousand Cards
  { file: "cues/hunt.wav", line: 74 },           // Second: the climb, the rival finally hates you
  { file: "cues/friend.wav", line: 78 },         // The Ladder: the notebook
  { file: "cues/dread.wav", line: 84 },          // Backs: the rival turns the room
  { file: "cues/resolve.wav", line: 91 },        // the notebook left on his desk, exam morning
  { file: "cues/dread.wav", line: 94 },          // the gate closes, the country holds its breath
  { file: "cues/wonder.wav", line: 97 },         // results, the sleeping sister
  { file: "theme-dark-thin.wav", line: 101 },    // the window showdown
  { file: "cues/resolve.wav", line: 106 },       // the room in the glass: teal
  { file: "theme-light.mp3", line: 110 },        // the door, the end card: the signal again
];

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its line's start to the next one's. */
const BEDS: [number, string][] = [
  [0, "platform"], [3, "street-night"], [10, "store"], [18, "home"], [22, "classroom"], [33, "street-day"],
  [35, "bus"], [43, "street-night"], [48, "home"], [51, "classroom"], [66, "street-night"], [74, "classroom"],
  [78, "reading"], [84, "classroom"], [91, "reading"], [92, "street-day"], [94, "hush"], [97, "home"],
  [101, "classroom"], [110, "home"],
];

/** The window's wordless peak: the hold after "The card never said a face had to be the right way round." */
const PEAK_AFTER = 104;

export type SoundPlan = {
  score: { file: string; from: number; to: number }[];
  beds: [number, string][];
  /** The wordless peak: the score drops to a floor, one held note plays, then the theme comes back in once
   *  (rules/sound.md #3). */
  peak: { from: number; to: number; floor: number };
};

/** The cold open's sound (G2 round 18): the hunt under the hug and the flashes, the night street's bed. */
const COLD_SCORE = "cues/hunt.wav";
const COLD_BED = "street-night";

/** The plan in seconds, from the beats' clips (the cold open's lines left out) and the frame the platform starts on. */
export function soundPlan(clips: Clip[], totalFrames: number, start = 0): SoundPlan {
  const at = (i: number) => (i === 0 ? start / FPS : clips[i].from / FPS);
  const end = (i: number) => (clips[i].from + clips[i].frames) / FPS;
  const cues = [...(start > 0 ? [{ file: COLD_SCORE, line: -1 }] : []), ...SCORE];
  const starts = cues.map((c) => (c.line < 0 ? 0 : at(c.line)));
  const score = cues.map((c, i) => ({ file: c.file, from: starts[i], to: starts[i + 1] ?? totalFrames / FPS }));
  const beds: [number, string][] = [...(start > 0 ? [[0, COLD_BED] as [number, string]] : []),
    ...BEDS.map(([line, name]): [number, string] => [at(line), name])];
  return { score, beds, peak: { from: end(PEAK_AFTER), to: at(PEAK_AFTER + 1), floor: 0.1 } };
}
