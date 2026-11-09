// Batch 1 thumbnail candidates (G1, 2026-11-09). Plain data, no JSX: the Remotion root draws them and
// `manifest.ts` dumps them, with the hero's head geometry and the layout boxes, for `check.py` and the review page.
// Rules: channels/say-suppose/rules/thumbnails.md (K1-K15). Every video has three candidates that differ in ONE
// variable, named in `variable`; everything else is shared by the video's `base`.
import { HEAD_R, joints, reach, STAND, type Pose } from "../../../../core/engines/whatif/src/kit/rig/pose";

export type Scene = "doorway" | "hall" | "ledger" | "hourglass" | "pages";
export type Face = "worried" | "shocked" | "afraid" | "sceptical";

export interface Box { x: number; y: number; w: number; h: number }

export interface Hero {
  x: number;      // feet, screen px (the figure is drawn at screen scale; the stage camera is the identity)
  y: number;
  scale: number;
  face: Face;
  look: { x: number; y: number };
  pose: Pose;
  facing?: 1 | -1;
}

/** A stamped tag. `x` is the left edge, or the right margin when `align` is "right". Size 190 puts the cap height
 *  at about 133 px, 12.3% of the frame (K5 asks 12%). */
export interface Tag { text: string; x: number; y: number; size: number; tilt: number; align: "left" | "right" }

export interface Candidate {
  video: string;          // folder under channels/say-suppose/videos/
  id: string;             // a, b, c
  variable: string;       // what differs between the three
  value: string;          // this candidate's value of it
  scene: Scene;
  hero: Hero;
  tag: Tag;
  /** The scene's stake text drawn on a prop (a counter, a chip), or null. Counts toward K5's three words. */
  stake: string | null;
  /** Crimson arrows, circles or underlines (K8). */
  pointers: number;
  /** Top-left of the scene's main prop (the phone), screen px. */
  prop?: { x: number; y: number };
  /** Boxes of the key elements (hero head, tag, stake, prop), for K11's badge zone. */
  keys: Record<string, Box>;
}

const V1 = "2026-11-09_what-if-you-knew-the-last-time-you-d-see-someone";
const V2 = "2026-11-09_what-if-you-saw-everyone-s-real-odds-of-success";
const V3 = "2026-11-09_what-if-you-got-paid-every-time-someone-thought-of-you";
const V4 = "2026-11-09_what-if-you-could-sell-one-year-of-your-life";
const V5 = "2026-11-09_what-if-you-could-never-forget-anything";

/** Where the hero's head lands on screen, from the rig's own joint maths. */
export function headOf(h: Hero) {
  const j = joints(h.pose);
  const dir = h.facing ?? 1;
  return { x: h.x + j.head.x * h.scale * dir, y: h.y + j.head.y * h.scale, r: HEAD_R * h.scale };
}

const headBox = (h: Hero): Box => {
  const c = headOf(h);
  return { x: c.x - c.r, y: c.y - c.r, w: 2 * c.r, h: 2 * c.r };
};

// Rubik 800 caps: the plate's width is about 0.74 em a character plus its padding (measured on the first render).
const tagBox = (t: Tag): Box => {
  const w = t.text.length * t.size * 0.72 + t.size * 0.8;
  return { x: t.align === "right" ? 1920 - t.x - w : t.x, y: t.y, w, h: t.size * 1.3 };
};

/** Arm angles that put a hand on a screen point (the rig's two-bone IK, in the figure's own units). */
function armTo(h: Hero, target: { x: number; y: number }): [number, number] {
  const sh = joints(h.pose).shoulder;
  return reach((target.x - h.x) / h.scale - sh.x, (target.y - h.y) / h.scale - sh.y);
}
function withArms(h: Hero, front?: { x: number; y: number }, back?: { x: number; y: number }): Hero {
  const pose = { ...h.pose };
  if (front) pose.armF = armTo(h, front);
  if (back) pose.armB = armTo(h, back);
  return { ...h, pose };
}

const PHONE_AT = { x: 850, y: 350 };

const WAVE: Pose = { ...STAND, tilt: 4, armF: [112, 40], armB: [-10, 12] };
const LOOK_UP: Pose = { ...STAND, tilt: -6, lean: -3, armF: [20, 30], armB: [-8, 10] };
const PHONE: Pose = { ...STAND, tilt: 5, lean: 4, armF: [62, 70], armB: [-6, 10] };
const HOVER: Pose = { ...STAND, tilt: 6, lean: 6, armF: [58, 72], armB: [70, 40] };
const CLUTCH: Pose = { ...STAND, tilt: -4, armF: [168, 32], armB: [-168, -32] };

function three(
  base: Omit<Candidate, "id" | "value" | "keys">,
  values: string[],
  apply: (c: Omit<Candidate, "keys">, v: string) => Omit<Candidate, "keys">,
  extraKeys: (c: Omit<Candidate, "keys">) => Record<string, Box> = () => ({}),
): Candidate[] {
  return values.map((v, i) => {
    const c = apply({ ...base, id: "abc"[i], value: v }, v);
    return { ...c, keys: { head: headBox(c.hero), tag: tagBox(c.tag), ...extraKeys(c) } };
  });
}

export const CANDIDATES: Candidate[] = [
  // 1. The last time. Mom waves at the door; a split-flap counter over her head reads 42, the number the film opens on.
  // Variable: the tag. (Round 1 varied the counter, 42 / 3 / 1; the room retired 3 and 1 on K13.)
  ...three(
    {
      video: V1, variable: "the tag", scene: "doorway", pointers: 0, stake: "42",
      hero: { x: 430, y: 1975, scale: 5.2, face: "worried", look: { x: 0.85, y: -0.3 }, pose: WAVE },
      tag: { text: "", x: 40, y: 36, size: 190, tilt: -3, align: "right" },
    },
    ["MOM?", "ONLY 42?", "WAIT, MOM?"],
    (c, v) => ({ ...c, tag: { ...c.tag, text: v } }),
    () => ({ counter: { x: 1450, y: 330, w: 250, h: 316 }, mom_head: { x: 1460, y: 650, w: 230, h: 230 } }),
  ),
  // 2. Real odds. A crimson chip beside your head in a night coaching hall reads 0.04%, the number the film gives you.
  // Variable: the tag. (Round 1 varied the number, 0.04% / 0% / 97%; the room retired 0% and 97% on K13.)
  ...three(
    {
      video: V2, variable: "the tag", scene: "hall", pointers: 0, stake: "0.04%",
      hero: { x: 430, y: 1975, scale: 5.2, face: "shocked", look: { x: 0.9, y: -0.25 }, pose: LOOK_UP },
      tag: { text: "", x: 60, y: 60, size: 190, tilt: -4, align: "right" },
    },
    ["ME?", "STAY?", "QUIT?"],
    (c, v) => ({ ...c, tag: { ...c.tag, text: v } }),
    () => ({ chip: { x: 780, y: 380, w: 640, h: 230 } }),
  ),
  // 3. Paid when someone thinks of you. A phone ledger: mom's bar full, the heart's empty. Variable: the tag.
  ...three(
    {
      video: V3, variable: "the tag", scene: "ledger", pointers: 0, stake: null,
      prop: PHONE_AT,
      hero: withArms({ x: 430, y: 1975, scale: 5.2, face: "sceptical", look: { x: 0.9, y: 0.25 }, pose: PHONE }, { x: 880, y: 980 }),
      tag: { text: "", x: 40, y: 36, size: 190, tilt: -3, align: "right" },
    },
    ["ONLY MOM?", "NOT HER?", "ZERO?!"],
    (c, v) => ({ ...c, tag: { ...c.tag, text: v } }),
    () => ({ phone: { x: PHONE_AT.x - 14, y: PHONE_AT.y - 14, w: 428, h: 668 } }),
  ),
  // 4. Sell one year. The offer on your phone: an hourglass and a crimson button, your finger above it.
  // Variable: the tag (the global replacement for "1 YEAR = 1 CRORE").
  ...three(
    {
      video: V4, variable: "the tag", scene: "hourglass", pointers: 0, stake: null,
      prop: PHONE_AT,
      hero: withArms({ x: 430, y: 1975, scale: 5.2, face: "worried", look: { x: 0.9, y: 0.35 }, pose: HOVER },
        { x: 880, y: 980 }, { x: 990, y: 770 }),
      tag: { text: "", x: 40, y: 36, size: 190, tilt: -3, align: "right" },
    },
    ["WORTH IT?", "$100,000?", "DEAL?"],
    (c, v) => ({ ...c, tag: { ...c.tag, text: v } }),
    () => ({ phone: { x: PHONE_AT.x - 14, y: PHONE_AT.y - 14, w: 428, h: 668 } }),
  ),
  // 5. Never forget. Night before the exam: every page you ever read, and one shout, swirl round your head.
  // Variable: the tag.
  ...three(
    {
      video: V5, variable: "the tag", scene: "pages", pointers: 0, stake: null,
      hero: withArms({ x: 430, y: 1975, scale: 5.2, face: "afraid", look: { x: 0.5, y: -0.1 }, pose: CLUTCH },
        { x: 860, y: 470 }, { x: 40, y: 520 }),
      tag: { text: "", x: 40, y: 36, size: 190, tilt: -3, align: "right" },
    },
    ["MAKE IT STOP", "TOO LOUD", "WHY NOW?"],
    (c, v) => ({ ...c, tag: { ...c.tag, text: v } }),
  ),
];
