// G1 thumbnail candidates for "What If You Fired Everyone and Hired AI?" (2026-11-15). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K17).
// The picture: your diner across the road from the car plant, late. You, large at the left, a fan of cash in your
// hand, stunned; behind the counter a row of robot cooks flip burgers into the air; along the counter a pile of
// plated burgers and a row of empty stools. The power working, and nobody to eat it. One variable: the tag.
import { STAND, type Pose } from "../../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero } from "../batch1";

export { headOf };

/** A stamped tag of one line. `x` is the right margin. Size 190 puts the cap height at 12.3% (K5 asks 12%). */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "right" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "robot-diner";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-15_what-if-you-fired-everyone-and-hired-ai";

/** Arms thrown out in surprise: the front hand up and forward with the cash, the back arm out behind. */
const WHOA: Pose = { ...STAND, lean: -6, tilt: 6, armF: [100, 38], armB: [-95, -30] };

/** You, drawn at screen scale, cut at the waist by the counter. Eyes on the robots behind the counter. */
export const HERO: Hero = { x: 440, y: 1500, scale: 4.0, face: "shocked", look: { x: 0.85, y: -0.1 }, pose: WHOA };

/** The robot line behind the counter: x of each robot's centre, the counter top, the burgers' highest point. */
export const ROBOTS = [930, 1180, 1430, 1680];
export const BACK_COUNTER = 780;
export const FRONT_COUNTER = 905;

const headBox = (h: Hero): Box => {
  const c = headOf(h);
  return { x: c.x - c.r, y: c.y - c.r, w: 2 * c.r, h: 2 * c.r };
};

// Rubik 800 caps: about 0.74 em a character plus the plate's padding (batch1's measure).
const tagBox = (t: Tag): Box => {
  const w = Math.max(...t.lines.map((l) => l.length)) * t.size * 0.74 + t.size * 0.44;
  const h = t.lines.length * t.size * 1.02 + t.size * 0.22;
  return { x: 1920 - t.x - w, y: t.y, w, h };
};

export const VALUES: { value: string; lines: string[] }[] = [
  { value: "WHO EATS?", lines: ["WHO EATS?"] },
  { value: "ANYONE?", lines: ["ANYONE?"] },
  { value: "UH OH.", lines: ["UH OH."] },
];

// One variable (K15): the tag. The diner, you, the robots, the burgers and the empty stools are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.value, lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "right" };
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "robot-diner",
    hero: HERO, tag, stake: null, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      robots: { x: ROBOTS[0] - 110, y: 380, w: ROBOTS[3] - ROBOTS[0] + 220, h: BACK_COUNTER - 380 },
      stools: { x: 720, y: FRONT_COUNTER + 80, w: 860, h: 95 },
    },
  };
});
