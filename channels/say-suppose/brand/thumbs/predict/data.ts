// G1 thumbnail candidates for "What If AI Predicted Every Choice You Make?" (2026-11-13). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
// The picture is the film's key shot (7:40): the food stall's counter at closing, one lamp over it, the food court
// shuttered and dark behind. You, large at the left, shocked, hold the cash-box key out across the counter on an open
// palm; your best friend at the right looks down at it, one hand flat on the tin box, and over his head, on a thread
// from the city's teal lamp, a crimson card reads 94%. One variable: the tag.
import { dir, joints, LIMB, STAND, type Pose } from "../../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero } from "../batch1";

export { headOf };

/** A stamped tag of one line. `x` is the right margin. Size 190 puts the cap height at 12.3% (K5 asks 12%). */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "right" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "stall-counter";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-13_what-if-ai-predicted-every-choice-you-make";

/** The forecast card over your best friend's head: the film's rule device, crimson. */
export const CARD = "94%";

/** Reaching across the counter: the front arm out level, the forearm turned up a little, so the hand is a palm. */
const OFFER: Pose = { ...STAND, lean: 6, tilt: 4, armF: [84, -6], armB: [-6, 14] };

/** You, drawn at screen scale (the thumbnail's stage camera is the identity), cut at the knees like the family. */
export const HERO: Hero = { x: 400, y: 1775, scale: 4.2, face: "shocked", look: { x: 1, y: 0.15 }, pose: OFFER };

/** Your best friend across the box, facing you, a hand on the lid. */
export const FRIEND = { x: 1600, y: 1450, scale: 3.0 };

/** Your best friend: leaning in over the box, the near hand down flat on its lid. */
export const LEAN: Pose = { ...STAND, lean: 10, tilt: 14, armF: [72, 22], armB: [-10, 10] };

/** Where a front hand lands on screen, from the rig's own maths. */
export function handAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + facing * (sh.x + (a.x + b.x) * LIMB) * scale, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** The card's tiles, centred over the friend's head, under the city's teal lamp. */
export const CARD_AT = { x: 1560, y: 405, tile: 120 };

/** The counter's top edge and the tin box on it. */
export const COUNTER_TOP = 960;
const FRIEND_HAND = handAt(FRIEND.x, FRIEND.y, FRIEND.scale, LEAN, -1);
/** The box stands on the counter with its lid just under your friend's hand. */
export const BOX = { x: FRIEND_HAND.x - 60, w: 300, h: COUNTER_TOP - FRIEND_HAND.y - 8 };

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
  { value: "TRUST HIM?", lines: ["TRUST HIM?"] },
  { value: "HE WOULDN'T.", lines: ["HE WOULDN'T."] },
  { value: "IT'S WRONG.", lines: ["IT'S WRONG."] },
];

// One variable (K15): the tag. The counter, you, the key, the box, your friend and the card are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.value, lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "right" };
  const m = CARD_AT;
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "stall-counter",
    hero: HERO, tag, stake: CARD, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      card: { x: m.x - 1.6 * m.tile, y: m.y - m.tile * 0.7, w: 3.2 * m.tile, h: m.tile * 1.4 },
      box: { x: BOX.x - BOX.w / 2, y: COUNTER_TOP - BOX.h, w: BOX.w, h: BOX.h },
      friend_head: { x: FRIEND.x - 200, y: 490, w: 320, h: 300 },
    },
  };
});
