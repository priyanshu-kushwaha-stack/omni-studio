// G1 thumbnail candidates for "What If You Saw 60 Seconds Into the Future?" (2026-11-10). Plain data, no JSX:
// `Sixty.tsx` draws them and `sixty-manifest.ts` dumps them for `check.py`. Rules: ../../rules/thumbnails.md.
// The scene is the film's first seven seconds (K13): the chai stall at night, a full glass in your hand, and in the
// pale ghost layer one minute ahead, your ghost and the same glass in pieces on the counter. One variable: the tag.
import { joints, reach, STAND, type Pose } from "../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Candidate, type Hero, type Tag } from "./batch1";

const V = "2026-11-10_what-if-you-saw-60-seconds-into-the-future";

/** Arm angles that put a hand on a screen point (the rig's two-bone IK, in the figure's own units). */
export function armTo(h: Hero, target: { x: number; y: number }): [number, number] {
  const sh = joints(h.pose).shoulder;
  return reach((target.x - h.x) / h.scale - sh.x, (target.y - h.y) / h.scale - sh.y);
}

/** Where your front hand holds the glass, screen px. */
export const GLASS_AT = { x: 905, y: 905 };
/** The ghost glass in pieces on the counter, and the crimson arrow's tip. */
export const SHARDS = { x: 1080, y: 852, w: 470, h: 170 };

const SURPRISE: Pose = { ...STAND, tilt: -5, lean: -3, armB: [52, 96] };
const base: Hero = { x: 560, y: 2085, scale: 5.2, face: "shocked", look: { x: 0.75, y: 0.55 }, pose: SURPRISE };
const hero: Hero = { ...base, pose: { ...base.pose, armF: armTo(base, GLASS_AT) } };

/** Your ghost, one minute ahead: a half-step right, head bowed, hands empty. */
export const GHOST: Hero = {
  x: 1290, y: 2085, scale: 5.2, face: "worried", look: { x: 0.4, y: 0.9 },
  pose: { ...STAND, tilt: 14, lean: 4, armF: [8, 6], armB: [-4, 4] },
};

const tagBox = (t: Tag): Box => {
  const w = t.text.length * t.size * 0.72 + t.size * 0.8;
  return { x: t.align === "right" ? 1920 - t.x - w : t.x, y: t.y, w, h: t.size * 1.3 };
};
const headBox = (h: Hero): Box => {
  const c = headOf(h);
  return { x: c.x - c.r, y: c.y - c.r, w: 2 * c.r, h: 2 * c.r };
};

const TAGS = ["ALREADY?", "NOT YET!", "WAIT, WHAT?"];

export const SIXTY: Candidate[] = TAGS.map((text, i) => {
  const tag: Tag = { text, x: 40, y: 36, size: 190, tilt: -3, align: "right" };
  return {
    video: V, id: "abc"[i], variable: "the tag", value: text, scene: "hall", // scene is unused by Sixty.tsx
    hero, tag, stake: null, pointers: 1,
    keys: {
      head: headBox(hero), tag: tagBox(tag), shards: SHARDS,
      glass: { x: GLASS_AT.x - 60, y: GLASS_AT.y - 140, w: 120, h: 150 },
    },
  };
});
