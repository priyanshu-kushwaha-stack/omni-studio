// Shared bits for the moments script v5 added (owner, 2026-11-14: exciting, not sad; a laugh in every scene). Their
// lines have no v1 number, so beats draw them from shot.v3 (current numbering, story.json). V5 names each new line once
// here, so a later renumbering is one edit.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { Chair } from "@whatif/kit/sets/common";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { GHOST, lineEnd } from "../shared";
import { headOf, type Body } from "./Crumbs.Rig";

/** The current line numbers of the v5 moments (story.json, 138 lines). */
export const V5 = {
  /** Crumbs: "And the chair? You still sit in it." .. "Rested, for once." */
  chair: 35,
  /** Crumbs: "Saturday. ... two teal lights under his cap." "Okay. What'd you get?" then the two bands .. "Worth a shot." */
  saturday: 42,
  twoBands: 44,
  worth: 46,
  /** More Hours: the evening news; noon on the bunk .. "You're doing it wrong."; "So you push the nights instead." */
  news: 58,
  noon: 59,
  wrong: 61,
  push: 62,
  /** The Warehouses: the plasma fact (four lines), the border sign, the suits under it. */
  plasma: 87,
  sign: 91,
  suits: 92,
  /** The Contract: "Not yet. Look." "Six weeks of crumbs" "Is that a shoe?" "Offer closes midnight." */
  notYet: 103,
  shoe: 105,
  closes: 106,
  /** One Mind: the 2020 home computers (three lines). */
  computers: 113,
  /** One Mind: "Brother: What'd we get?" just before "So what's the job?" */
  weGet: 116,
  /** Midnight: "Scam. Told you." "Come back Thursday." "Nobody opens." */
  scam: 123,
  thursday: 124,
  nobody: 125,
  /** Morning: the clinic steps, the red-light bands, "Everyone else already said yes.", the twist, the end card. */
  steps: 133,
  daytime: 134,
  yes: 135,
  twist: 136,
  card: 137,
  /** story.json's line count: the moments draw only on a timeline voiced from it. */
  total: 138,
} as const;

/** Whether the timeline is the current script's (the moments need its line numbers). */
export const isV5 = (v3: Clip[]) => v3.length >= V5.total;

/** p of the way through line i, as a whole frame. */
export const atV = (v3: Clip[], i: number, p: number) => Math.round(v3[i].from + v3[i].frames * p);

/** The middle of the gap after line i (where a cut between two lines goes). */
export const gapAfter = (v3: Clip[], i: number) => Math.round((lineEnd(v3, i) + v3[i + 1].from) / 2);

/** The daytime band's small red light (Morning). */
export const RED_LIGHT = "#ff4a5a";

/** The band worn awake on a standing figure's forehead, its light in `color` (a red one for the daytime bands). */
export const BandAwake: React.FC<{ body: Body; color: string }> = ({ body, color }) => {
  const h = headOf(body);
  const r = h.r;
  const f = body.facing;
  const light = { x: h.x + f * r * 0.62, y: h.y - r * 0.6 };
  return (
    <g>
      <path d={`M${h.x - f * r * 0.95} ${h.y - r * 0.5} Q${h.x} ${h.y - r * 0.78} ${h.x + f * r * 0.98} ${h.y - r * 0.42}`} fill="none"
        stroke="#1b1d24" strokeWidth={r * 0.18} strokeLinecap="round" />
      <circle cx={light.x} cy={light.y} r={r * 0.4} fill={color} opacity={0.3} />
      <circle cx={light.x} cy={light.y} r={r * 0.16} fill={color} stroke="#1b1d24" strokeWidth={2} />
    </g>
  );
};

/** Where BandAwake draws its light. */
export const bandAwakeLight = (body: Body) => {
  const h = headOf(body);
  return { x: h.x + body.facing * h.r * 0.62, y: h.y - h.r * 0.6 };
};

/**
 * The pale second you with nothing to do: on its floating chair, arms folded, the laptop shut on its little desk,
 * looking down; `tap` (0..1) taps the wrist like a watch. Drawn like parts.tsx's Ghost (feet at x, y as a seated rig;
 * the desk on its facing side) but with no aura filter and no typing.
 */
export const FoldedGhost: React.FC<{ x: number; y: number; scale: number; frame: number; facing?: 1 | -1; tap?: number;
  look?: { x: number; y: number }; brows?: "flat" | "angry" | "raised" }> = ({ x, y, scale: s, frame, facing = -1, tap = 0,
  look = { x: 0.6, y: 0.8 }, brows = "flat" }) => {
  const hip = y - 112 * s;
  const tick = tap > 0 && Math.floor(frame / 5) % 2 === 0 ? 1 : 0;
  // arms folded over the chest; the BACK hand lifts off the front wrist and taps it
  const pose: Pose = { ...SEATED, lean: -4, armF: [34, 96], armB: [44, 84 + tick * 20 * tap] };
  const k = s / 1.65;
  const deskX = x + facing * 95 * k;
  return (
    <g>
      <circle cx={x} cy={hip - 120 * k} r={260 * k} fill="#cfefff" opacity={0.16} />
      <g transform={`translate(${deskX} ${hip - 4}) scale(${k * facing} ${k})`}>
        <rect x={0} y={0} width={300} height={22} rx={6} fill="#9fd9dc" stroke={INK} strokeWidth={6} />
        <rect x={20} y={22} width={14} height={90} fill="#9fd9dc" stroke={INK} strokeWidth={4} />
        <rect x={266} y={22} width={14} height={90} fill="#9fd9dc" stroke={INK} strokeWidth={4} />
        {/* the laptop, shut */}
        <rect x={120} y={-16} width={150} height={16} rx={4} fill="#3b3e47" stroke={INK} strokeWidth={4} />
      </g>
      <g transform={`translate(${x} ${hip}) scale(${facing} 1) translate(${-x} ${-hip})`}>
        <Chair x={x} y={hip} scale={1.25 * k} facing={1} color={GHOST.scarf} />
      </g>
      <g opacity={0.94}>
        <Figure x={x} y={y} scale={s} facing={facing} pose={pose} head={GHOST.head} scarf={GHOST.scarf} tuft eyes={1.1} brows={brows}
          lids={0.35} mouth="flat" look={look} />
      </g>
    </g>
  );
};
