// G1 thumbnail candidates for "What If AI Rented Your Brain While You Slept?" (2026-11-13). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
// The picture is the film's first rented night: your bedroom after midnight. You, large at the left, asleep on your back
// with the thin band on, smiling; out of your head a pale second you sits bolt upright at a little desk, working, wide
// awake; coins drop from its desk into the jar on your bedside table. One variable: the tag.
import { type Box, type Hero } from "../batch1";
import { STAND } from "../../../../../core/engines/whatif/src/kit/rig/pose";

const VIDEO = "2026-11-13_what-if-ai-rented-your-brain-while-you-slept";

/** A stamped tag of one line. `x` is the right margin. Size 190 puts the cap height at 12.3% (K5 asks 12%). */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "right" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "bedroom-night";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

/** You, asleep: the rig's figure lying on its back, head to the left. Scale 3.1 makes the head 26% of the height (K3). */
export const SLEEPER = { scale: 3.1, head: { x: 470, y: 700 } };
export const HEAD = { x: SLEEPER.head.x, y: SLEEPER.head.y, r: 46 * SLEEPER.scale };

/** The working second you: seated at its little desk, facing right, centre of the frame under the tag. */
export const GHOST = { x: 1010, y: 880, scale: 1.65 };
export const DESK = { x: 1105, y: 692, w: 300 };

/** The jar on the bedside table, where the night's pay lands. */
export const JAR = { x: 150, y: 742, w: 150, h: 190 };

/** Hero for check.py's shape: the head is supplied directly (HEAD), so the pose is only nominal. */
export const HERO: Hero = { x: HEAD.x, y: HEAD.y, scale: SLEEPER.scale, face: "happy", look: { x: 0, y: -1 }, pose: STAND } as Hero;

const headBox: Box = { x: HEAD.x - HEAD.r, y: HEAD.y - HEAD.r, w: 2 * HEAD.r, h: 2 * HEAD.r };

// Rubik 800 caps: about 0.74 em a character plus the plate's padding (batch1's measure).
const tagBox = (t: Tag): Box => {
  const w = Math.max(...t.lines.map((l) => l.length)) * t.size * 0.74 + t.size * 0.44;
  const h = t.lines.length * t.size * 1.02 + t.size * 0.22;
  return { x: 1920 - t.x - w, y: t.y, w, h };
};

export const VALUES: { value: string; lines: string[] }[] = [
  { value: "THAT'S ME?", lines: ["THAT'S ME?"] },
  { value: "WORTH IT?", lines: ["WORTH IT?"] },
  { value: "EASY CASH?", lines: ["EASY CASH?"] },
];

// One variable (K15): the tag. The room, you, the band, the second you, the desk and the jar are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.value, lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "right" };
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "bedroom-night",
    hero: HERO, tag, stake: null, pointers: 1,
    keys: {
      head: headBox, tag: tagBox(tag),
      ghost: { x: GHOST.x - 110, y: GHOST.y - 360, w: 220, h: 380 },
      desk: { x: DESK.x, y: DESK.y - 120, w: DESK.w, h: 160 },
      jar: { x: JAR.x - JAR.w / 2, y: JAR.y - JAR.h, w: JAR.w, h: JAR.h },
    },
  };
});
