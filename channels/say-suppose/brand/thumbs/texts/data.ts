// G1 thumbnail candidates for "What If You Saw Who Uses AI to Text You?" (2026-11-13). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
// The picture is the film's frame at 0:24 (packaging.md): your birthday, a dark kitchen before six, the lamp on. You,
// large at the left, hold your phone up at chest height and look down at it, the instant before you understand; on
// the screen four long warm bubbles each carry a small crimson dot, and one short grey-blue bubble at the bottom has
// none. Behind you on the table, a small cake, its one candle just blown out, a thread of smoke curling up. One
// variable: the tag.
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
  scene: "birthday-kitchen";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-13_what-if-you-saw-who-uses-ai-to-text-you";

/** The phone held up in the front hand at chest height, the forearm across the body below the face. */
const HOLD: Pose = { ...STAND, lean: 4, tilt: 8, armF: [55, 95], armB: [-8, 14] };

/** You, drawn at screen scale, cut at the knees like the family. Eyes down on the screen. */
export const HERO: Hero = { x: 470, y: 1780, scale: 4.3, face: "worried", look: { x: 0.55, y: 0.75 }, pose: HOLD };

/** The phone's screen, centred at (x, y), w by h, in screen px. */
export const PHONE = { x: 960, y: 700, w: 300, h: 560 };

/** The cake on the table behind you, base centre. */
export const CAKE = { x: 1430, y: 905 };

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
  { value: "EVEN HER?", lines: ["EVEN HER?"] },
  { value: "A MACHINE DID.", lines: ["A MACHINE DID."] },
  { value: "ALL OF THEM?", lines: ["ALL OF THEM?"] },
];

// One variable (K15): the tag. The kitchen, you, the phone, its dots and the cake are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.value, lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "right" };
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "birthday-kitchen",
    hero: HERO, tag, stake: null, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      phone: { x: PHONE.x - PHONE.w / 2 - 20, y: PHONE.y - PHONE.h / 2 - 30, w: PHONE.w + 40, h: PHONE.h + 60 },
      cake: { x: CAKE.x - 150, y: CAKE.y - 260, w: 300, h: 270 },
    },
  };
});
