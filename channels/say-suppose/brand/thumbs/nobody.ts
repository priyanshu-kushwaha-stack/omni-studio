// G1 thumbnail candidates for "What If Nobody Could Say No to You?" (2026-11-10). Plain data, no JSX: `NobodyThumbs.tsx`
// draws them and `manifest-nobody.ts` dumps them for `check.py`. Kept apart from batch1.ts so films in flight at the same
// time never edit one file. Rules: channels/say-suppose/rules/thumbnails.md (K1-K16).
import { joints, reach, STAND, type Pose } from "../../../../core/engines/whatif/src/kit/rig/pose";
import { headOf, type Box, type Hero, type Tag } from "./batch1";

export interface NobodyCandidate {
  video: string;
  id: string;
  variable: string;
  value: string;
  scene: "gate";
  hero: Hero;
  tag: Tag;
  stake: string | null;
  pointers: number;
  keys: Record<string, Box>;
}

const VIDEO = "2026-11-10_what-if-nobody-could-say-no-to-you";

/** The row of three who all say yes: same size, same tilt, same smile. Head centres, screen px. */
export const ROW = { y: 640, scale: 2.35, tilt: -9, xs: [1150, 1425, 1700] } as const;
export const rowFeet = (x: number) => ({ x, y: ROW.y - joints(STAND).head.y * ROW.scale });

const headBox = (h: Hero): Box => {
  const c = headOf(h);
  return { x: c.x - c.r, y: c.y - c.r, w: 2 * c.r, h: 2 * c.r };
};
const tagBox = (t: Tag): Box => {
  const w = t.text.length * t.size * 0.72 + t.size * 0.8;
  return { x: t.align === "right" ? 1920 - t.x - w : t.x, y: t.y, w, h: t.size * 1.3 };
};

/** You, large at the left, one hand out, palm up, toward the row: the instant before you see the smiles are the same. */
const OFFER: Pose = { ...STAND, tilt: -5, lean: -4, armF: [70, 30], armB: [-10, 14] };
function withHandAt(h: Hero, target: { x: number; y: number }): Hero {
  const sh = joints(h.pose).shoulder;
  return { ...h, pose: { ...h.pose, armF: reach((target.x - h.x) / h.scale - sh.x, (target.y - h.y) / h.scale - sh.y) } };
}
const HERO: Hero = withHandAt(
  { x: 400, y: 1990, scale: 5.2, face: "shocked", look: { x: 0.95, y: 0.05 }, pose: OFFER },
  { x: 960, y: 900 },
);

const rowKeys = Object.fromEntries(
  ROW.xs.map((x, i) => [["boss_head", "checker_head", "mother_head"][i], {
    x: x - 46 * ROW.scale, y: ROW.y - 46 * ROW.scale, w: 92 * ROW.scale, h: 92 * ROW.scale,
  }]),
);

// One variable (K15): the tag. Set, pose, faces and the one crimson arrow at the mother's smile are the same on all three.
export const CANDIDATES: NobodyCandidate[] = ["MEANT IT?", "EVEN HER?", "ALL OF THEM?"].map((text, i) => {
  const tag: Tag = { text, x: 40, y: 40, size: 190, tilt: -3, align: "right" };
  return {
    video: VIDEO, id: "abc"[i], variable: "the tag", value: text, scene: "gate", hero: HERO, tag, stake: null,
    pointers: 1, keys: { head: headBox(HERO), tag: tagBox(tag), ...rowKeys },
  };
});

export { headOf };
