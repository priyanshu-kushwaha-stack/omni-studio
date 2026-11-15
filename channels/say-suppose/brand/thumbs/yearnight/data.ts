// Thumbnail candidates for "What If You Lived a Year Every Night?". Plain data, no JSX, in the shape of `../batch1.ts`
// so `../check.py` measures them. Rules: channels/say-suppose/rules/thumbnails.md (K1-K17).
// v2 (2026-11-14, K17 "the power in use and someone stunned", owner 2026-11-13): the film's key shot at 0:06, staged
// exactly in the film. A dark hall of sleep pods; you, large at the left, sit half out of your open pod, lids heavy
// and a sly grin, juggling three coils of the boss's teal cable in a perfect cascade: a year of practice, one night.
// On the pod frame the split-flap day counter has stopped on 365, in crimson. Your flatmate, right of centre, jaw
// dropped, her mop sliding out of her hand. (v1, the G1 pick: a flat stare at her mid-sentence; it fails K17.)
// One variable: the tag.
import { SEATED, type Pose } from "../../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero } from "../batch1";

export { headOf };

/** A stamped tag on one line. `x` is the right margin. Size 190 puts the cap height at 12.3% (K5 asks 12%). */
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; align: "right" }

export interface Candidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "pod-hall";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-13_what-if-you-lived-a-year-every-night";

/** The day counter on your pod's hatch, the film's rule device. */
export const COUNTER = "365";

/** Sitting on the lip of the pod, both forearms up and out at chest height: juggling. */
const JUGGLE: Pose = { ...SEATED, lean: 2, tilt: 4, armF: [72, 62], armB: [40, 100] };

/** You, drawn at screen scale (the thumbnail's stage camera is the identity), cut by the frame below the knees. */
export const HERO: Hero = { x: 470, y: 1694, scale: 4.3, face: "sceptical", look: { x: 0.9, y: -0.2 }, pose: JUGGLE };

/** Your flatmate, right of centre, facing you, mop in the back hand, mid-sentence. */
export const MATE = { x: 1500, y: 1500, scale: 3.1 };

/** The counter's tiles, on the pod frame right of your head. */
export const COUNTER_AT = { x: 1210, y: 425, tile: 140 };

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
  { value: "SAME DAY?", lines: ["SAME DAY?"] },
  { value: "ONE SLEEP.", lines: ["ONE SLEEP."] },
  { value: "YESTERDAY?", lines: ["YESTERDAY?"] },
];

// One variable (K15): the tag. The hall, you, the counter and your flatmate are the same on all three.
export const CANDIDATES: Candidate[] = VALUES.map((v, i) => {
  const size = 190;
  const tag: Tag = { text: v.value, lines: v.lines, x: 40, y: 36, size, tilt: -3, align: "right" };
  const m = COUNTER_AT;
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: v.value, scene: "pod-hall",
    hero: HERO, tag, stake: COUNTER, pointers: 0,
    keys: {
      head: headBox(HERO), tag: tagBox(tag),
      counter: { x: m.x - 1.6 * m.tile, y: m.y - m.tile * 0.7, w: 3.2 * m.tile, h: m.tile * 1.4 },
      mate_head: { x: MATE.x - 150, y: 560, w: 300, h: 300 },
    },
  };
});
