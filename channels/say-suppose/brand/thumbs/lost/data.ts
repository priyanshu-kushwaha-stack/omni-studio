// G1 thumbnail candidates for "What If You Could Find Anything Ever Lost?" (2026-11-10). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
// Kept in its own folder so the other films' G1 sessions can draw theirs beside it without touching batch1.
import { walkPose, type Pose } from "../../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero } from "../batch1";

export { headOf };

/** A stamped tag of one or two lines. `x` is the right margin. Size 190 puts the cap height at 12.3% (K5 asks 12%). */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "right" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "platform";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-10_what-if-you-could-find-anything-ever-lost";

/** Mid-step on the wet platform, leaning in, the front arm thrown out: the instant before you see what is down there. */
const STEP: Pose = { ...walkPose(0.6), lean: 9, tilt: 12, armF: [62, 38], armB: [-34, 20] };

export const HERO: Hero = { x: 470, y: 1062, scale: 3.3, face: "shocked", look: { x: 0.95, y: 0.75 }, pose: STEP };

/** The grate's box on the floor (top-left, size): the end of the line. */
export const GRATE = { x: 1100, y: 822, w: 430, h: 118 };

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

const VALUES: { value: string; lines: string[] }[] = [
  { value: "DOWN THERE?", lines: ["DOWN", "THERE?"] },
  { value: "WHO HID THIS?", lines: ["WHO HID", "THIS?"] },
  { value: "ALL OF IT?", lines: ["ALL OF", "IT?"] },
];

// One variable (K15): the tag. The platform, the line, the grate and the pointer are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const tag: Tag = { text: v.value, lines: v.lines, x: 48, y: 44, size: 190, tilt: -3, align: "right" };
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "platform",
    hero: HERO, tag, stake: null, pointers: 1,
    keys: { head: headBox(HERO), tag: tagBox(tag), grate: GRATE },
  };
});
