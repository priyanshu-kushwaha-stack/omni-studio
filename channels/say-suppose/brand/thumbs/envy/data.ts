// G1 thumbnail candidates for "What If You Saw Who Wants You to Fail?" (2026-11-12). Plain data, no JSX, in the shape
// of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
// The picture is the film's first seven seconds: 10 p.m. on a cram-school street in Seoul, the sign towers still lit.
// You, large at the left, hold up the letter that says you made the cut, mid-smile, and look up; your best friend
// claps beside you, grinning, and above his head a crimson split-flap meter has just snapped to minus eighty-four per
// cent. One variable: the tag.
import { STAND, type Pose } from "../../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero } from "../batch1";

export { headOf };

/** A stamped tag of one or two lines. `x` is the right margin. Size 190 puts the cap height at 12.3% (K5 asks 12%). */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "right" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "hagwon-street";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-12_what-if-you-saw-who-wants-you-to-fail";

/** The meter over your best friend's head, the film's rule device. */
export const METER = "-84%";

/** Chin up, the letter held high in the front hand: you made it. */
const SHOW: Pose = { ...STAND, lean: -2, tilt: -6, armF: [78, 74], armB: [-14, 16] };

/** You, drawn at screen scale (the thumbnail's stage camera is the identity), cut at the knees like the family. */
export const HERO: Hero = { x: 440, y: 1760, scale: 4.3, face: "shocked", look: { x: 0.75, y: -0.55 }, pose: SHOW };

/** Your best friend beside you, facing you, a fist up for you. */
export const FRIEND = { x: 1390, y: 1640, scale: 3.3 };

/** The meter's tiles, centred over the friend's head. */
export const METER_AT = { x: 1360, y: 445, tile: 150 };

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
  { value: "NOT HIM.", lines: ["NOT HIM."] },
  { value: "HE'S GLAD?", lines: ["HE'S GLAD?"] },
  { value: "STILL HUGS.", lines: ["STILL HUGS."] },
];

// One variable (K15): the tag. The street, you, the letter, your friend and the meter are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.value, lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "right" };
  const m = METER_AT;
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "hagwon-street",
    hero: HERO, tag, stake: METER, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      meter: { x: m.x - 2 * m.tile, y: m.y - m.tile * 0.65, w: 4 * m.tile, h: m.tile * 1.3 },
      friend_head: { x: FRIEND.x - 160, y: 590, w: 320, h: 320 },
    },
  };
});
