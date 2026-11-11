// G1 thumbnail candidates for "What If You Doubled Your Money Every Day?" (2026-11-11). Plain data, no JSX, in the
// shape of `../batch1.ts` so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
// The picture: a pier kiosk at night, the bay and the city behind; you large at the left, owning it, your phone held
// out with its balance spilling off the screen as split-flap digits over the counter; Mrs. Vance behind the counter,
// holding out a paper cup, shocked. One variable: the tag.
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
  scene: "pier-kiosk";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-11_what-if-you-doubled-your-money-every-day";

/** The balance on day thirty-one: two to the power of thirty, the cold open's number. */
export const BALANCE = "1073741824";

/** Standing tall, chin up, the phone held out at the counter in the front hand: you own this. */
const SHOW: Pose = { ...STAND, lean: -3, tilt: -5, armF: [70, 62], armB: [-12, 14] };

/** You, drawn at screen scale (the thumbnail's stage camera is the identity), cut at the knees like the family. */
export const HERO: Hero = { x: 470, y: 1740, scale: 4.3, face: "shocked", look: { x: 0.9, y: 0.35 }, pose: SHOW };

/** Mrs. Vance behind the counter, facing you: feet hidden by the counter. */
export const VENDOR = { x: 1190, y: 1250, scale: 2.5 };

/** The counter's top edge on screen. */
export const COUNTER_TOP = 820;

/** The digit tiles: out of the phone's screen, across the counter below his face and over its edge, larger as they
 *  come, clear of the badge zone. */
export const TILES: { ch: string; x: number; y: number; s: number; r: number }[] = (() => {
  const seq = BALANCE.split("");
  const flying = seq.map((ch, i) => {
    const t = i / (seq.length - 1);
    const x = 1000 + t * 540;
    const y = 705 + t * 250 - Math.sin(t * Math.PI) * 40;
    return { ch, x, y, s: 0.5 + t * 0.55, r: Math.sin(i * 1.7) * 14 };
  });
  // a few that already landed: on the counter top and against its front
  const landed = [
    { ch: "7", x: 1660, y: 770, s: 0.6, r: -78 },
    { ch: "3", x: 1440, y: 1015, s: 0.95, r: -24 },
  ];
  return [...landed, ...flying];
})();

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
  { value: "DAY 31.", lines: ["DAY 31."] },
  { value: "NO BRAKES.", lines: ["NO BRAKES."] },
  { value: "EVERYTHING.", lines: ["EVERYTHING."] },
];

// One variable (K15): the tag. The kiosk, you, the phone, the digits and Mrs. Vance are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const tag: Tag = { text: v.value, lines: v.lines, x: 48, y: 44, size: 190, tilt: -3, align: "right" };
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "pier-kiosk",
    hero: HERO, tag, stake: BALANCE, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      digits: { x: 940, y: 560, w: 660, h: 520 },
      vendor_head: { x: VENDOR.x - 130, y: 390, w: 260, h: 260 },
    },
  };
});
