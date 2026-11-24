// G1 thumbnail candidates for "What If You Could See Everyone's Lies Today?" (2026-11-24). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K17).
// The picture is the film's first frame (packaging.md, 0:00): the Monday meeting, blinds down, projector off, the only
// light a glowing 47 over your boss's head; he grins with a hand on his heart; you, large at the left, mug halfway to
// your mouth, stunned. One variable: the tag (a: none, the number alone; b: BY 9AM?; c: SINCE MIDNIGHT?).
import { STAND, type Pose } from "../../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero } from "../batch1";

export { headOf };

/** A stamped tag. `x` is the left edge. Size 190 puts the cap height at 12.3% (K5 asks 12%). Empty `lines`: no tag. */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "left" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "meeting-room";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-24_what-if-you-could-see-how-many-times-everyone-lied-today";

/** The counter over your boss's head, the film's rule device. */
export const COUNT = "47";

/** The mug halfway to your mouth, frozen: you just heard it. */
const MUG: Pose = { ...STAND, lean: 4, tilt: 4, armF: [40, 118], armB: [-10, 12] };

/** You, drawn at screen scale, cut at the knees like the family. */
export const HERO: Hero = { x: 430, y: 1880, scale: 4.4, face: "shocked", look: { x: 0.85, y: -0.35 }, pose: MUG };

/** Your boss, standing at the head of the table, facing you: one hand on his heart, the other up mid-sentence. */
export const BOSS_POSE: Pose = { ...STAND, lean: -4, tilt: -6, armF: [28, -128], armB: [-165, -8] };
export const BOSS = { x: 1450, y: 1640, scale: 3.6 };

/** The counter's centre and digit size, over the boss's head. */
export const COUNTER_AT = { dy: -330, size: 230 };

const headBox = (h: Hero): Box => {
  const c = headOf(h);
  return { x: c.x - c.r, y: c.y - c.r, w: 2 * c.r, h: 2 * c.r };
};

const tagBox = (t: Tag): Box => {
  if (!t.lines.length) return { x: t.x, y: t.y, w: 0, h: 0 };
  const w = Math.max(...t.lines.map((l) => l.length)) * t.size * 0.74 + t.size * 0.44;
  const h = t.lines.length * t.size * 1.02 + t.size * 0.22;
  return { x: t.x, y: t.y, w, h };
};

export const VALUES: { value: string; lines: string[] }[] = [
  { value: "(none)", lines: [] },
  { value: "BY 9AM?", lines: ["BY 9AM?"] },
  { value: "SINCE MIDNIGHT?", lines: ["SINCE", "MIDNIGHT?"] },
];

/** The boss's head centre on screen (the counter hangs above it). */
export function bossHead() {
  return headOf({ x: BOSS.x, y: BOSS.y, scale: BOSS.scale, face: "happy", look: { x: -1, y: 0 }, pose: BOSS_POSE, facing: -1 });
}

// One variable (K15): the tag. The room, you, your boss and the 47 are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.lines.join(" "), lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "left" };
  const b = bossHead();
  const cy = b.y + COUNTER_AT.dy;
  const s = COUNTER_AT.size;
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "meeting-room",
    hero: HERO, tag, stake: COUNT, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      counter: { x: b.x - s * 1.0, y: cy - s * 0.66, w: s * 2.0, h: s * 1.32 },
      boss_head: { x: b.x - b.r, y: b.y - b.r, w: 2 * b.r, h: 2 * b.r },
    },
  };
});
