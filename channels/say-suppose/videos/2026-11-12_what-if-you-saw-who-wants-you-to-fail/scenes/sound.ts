/** The film's sound plan (cues.yaml is the intent; this is where it plays). The owner on v3 (2026-11-13): "better sound
 *  in the video just to break the continuous background music flowing throughout the video which might be monotonous".
 *  So the score changes with each section, and every set has its own ambience bed.
 *
 *  It was spotted in seconds of the v3 cut (section starts are the beats' first lines, bed changes follow the
 *  picture's set changes on 2 s contact sheets of renders/v3/picture.mp4). v4 (2026-11-13) moved every line, so each
 *  v3 time is carried to v4 through the line starts both cuts share (remap.ts); the exam beat, reordered in v4, is
 *  placed on its v4 lines instead. */
import type { Clip } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import { V3_FROM, V3_TO_V4, V3_TOTAL } from "./remap";

/** One score cue per section, in v3 seconds; `file` is under assets/music/. */
const SCORE_V3: { file: string; from: number }[] = [
  { file: "theme-light.mp3", from: 0 },          // the skit on the platform: the channel's signal
  { file: "cues/wonder.wav", from: 14.4 },       // Made the Cut, The Rule: the card, the scale, the store
  { file: "cues/hunt.wav", from: 120.7 },        // Who's Red: testing the rule on everyone
  { file: "cues/home.wav", from: 251.9 },        // Her Back: your sister in the doorway
  { file: "cues/crowd.wav", from: 284.3 },       // A Thousand Cards, Four in a Hundred
  { file: "cues/friend.wav", from: 407.3 },      // The Notebook
  { file: "cues/dread.wav", from: 455.5 },       // Say It Again, The Country Holds Its Breath: the cost
  { file: "cues/ache.wav", from: 538.8 },        // A Text Would Open Nothing
  { file: "theme-dark-thin.wav", from: 590.2 },  // The Loading Dock: the signal, thinner, at the cost
  { file: "cues/resolve.wav", from: 645.6 },     // Two Letters
  { file: "theme-light.mp3", from: 677.0 },      // the end card: the signal again
];

/** Ambience beds (assets/sfx/bed-<name>.wav) in v3 seconds, each from its start to the next one's. "exam" marks where
 *  the exam beat's own v4 beds go (examBeds). */
const BEDS_V3: [number, string][] = [
  [0, "platform"], [25, "classroom"], [29, "street-night"], [53, "reading"], [67, "store"],
  [119, "classroom"], [161, "street-day"], [171, "bus"], [187, "classroom"], [223, "street-night"],
  [251.9, "home"], [284.3, "street-night"], [335, "classroom"], [375, "store"], [387, "classroom"],
  [405, "reading"], [459, "street-night"], [461, "home"], [491, "exam"],
  [538.8, "home"], [543, "classroom"], [547, "home"], [559, "classroom"],
  [561, "home"], [569, "classroom"], [575, "home"], [583, "bus"], [589.4, "dock"], [623, "home"],
  [627, "dock"], [645.6, "home"],
];

/** v3 lines the exam beat reordered: they are not anchors. */
const MOVED = new Set([100, 101, 102]);

export type SoundPlan = {
  score: { file: string; from: number; to: number }[];
  beds: [number, string][];
  /** The dock's wordless peak (the hold after "You do."): the score drops to a floor, one held note plays, then the
   *  theme comes back in once (rules/sound.md #3). */
  peak: { from: number; to: number; floor: number };
};

/** The plan in v4 seconds, from the v4 clips. */
export function soundPlan(clips: Clip[], totalFrames: number): SoundPlan {
  const at = (i: number) => clips[i].from / FPS;
  const end = (i: number) => (clips[i].from + clips[i].frames) / FPS;
  const anchors: [number, number][] = [[0, 0]];
  V3_FROM.forEach((f, i) => { if (!MOVED.has(i)) anchors.push([f / FPS, at(V3_TO_V4[i])]); });
  anchors.push([V3_TOTAL / FPS, totalFrames / FPS]);
  const retime = (s: number) => {
    for (let k = 1; k < anchors.length; k++) {
      const [a0, b0] = anchors[k - 1];
      const [a1, b1] = anchors[k];
      if (s <= a1) return b0 + ((s - a0) / Math.max(1e-6, a1 - a0)) * (b1 - b0);
    }
    return anchors[anchors.length - 1][1];
  };
  const starts = SCORE_V3.map((c) => retime(c.from));
  const score = SCORE_V3.map((c, i) => ({ file: c.file, from: starts[i], to: starts[i + 1] ?? totalFrames / FPS }));
  // The exam beat on its v4 lines: the study room's week (97), the classroom the night before (98), the street at the
  // gate on exam morning (101), the hush of the hall and the grounded sky once the gate closes (104).
  const examBeds: [number, string][] = [[at(97), "reading"], [at(98) - 1.5, "classroom"], [at(101), "street-day"], [at(104), "hush"]];
  const beds = BEDS_V3.flatMap(([s, name]): [number, string][] => (name === "exam" ? examBeds : [[retime(s), name]]));
  return { score, beds, peak: { from: end(123), to: at(124), floor: 0.1 } };
}
