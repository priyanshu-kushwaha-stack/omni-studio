// Shared bits for the moments script v6 added (the Cursor frame-by-frame review, review-cursor-v5.md): the debt note on
// the fridge and the graduation flyer beside it, and the v6 line numbers the picture keys on. v6 lines are story.json's
// (113 lines); beats read them from shot.v6. World coordinates, for a <Stage> slot.
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import type { Clip } from "@whatif/kit/timeline";

/** v6 line numbers (story.json, 113 lines). */
export const V6 = {
  premise: 3,
  plasma: 4,
  graduates: 5,
  band: 6,
  pale: 7,
  feel: 8,
  photo: 62,
  crash: 67,
  table: 77,
  deeper: 78,
  sign: 79,
  job: 92,
  redLight: 93,
  designed: 94,
  globe: 95,
  pen: 96,
  knock: 100,
  window: 101,
  peel: 107,
  steps: 108,
  street: 111,
  end: 112,
  total: 113,
} as const;

/** Whether the timeline is v6's (the new moments need its line numbers). */
export const isV6 = (v6: Clip[]) => v6.length >= V6.total;

/** p of the way through v6 line i, as a whole frame. */
export const at6 = (v6: Clip[], i: number, p: number) => Math.round(v6[i].from + v6[i].frames * p);

/** The kitchen fridge's upper door in the library kitchen (kit sets/Kitchen.tsx), where the note and the flyer go. */
export const FRIDGE = { x0: 1420, x1: 1740, top: 260, mid: 475, note: { x: 1530, y: 362 }, flyer: { x: 1668, y: 372 } };

/** The debt, as the fridge note shows it at each point of the story. */
export const DEBT = { start: "$14,200", crumbs: "$14,000", photo: "$12,900", crash: "$14,200" } as const;

/**
 * The yellow note on the fridge: OWE and the amount, big and readable (the family's debt). `was` draws the last amount
 * small and struck through above it, when the number has moved. (x, y) is its centre; `s` its scale.
 */
export const DebtNote: React.FC<{ x: number; y: number; amount: string; was?: string; s?: number; tilt?: number }> = ({
  x, y, amount, was, s = 1, tilt = -4 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <rect x={-92 + 6} y={-70 + 8} width={184} height={140} fill="#000" opacity={0.18} />
    <rect x={-92} y={-70} width={184} height={140} fill="#ffe066" stroke={INK} strokeWidth={4} />
    <path d="M-92 -70 H92 V-52 H-92Z" fill="#f5cf3f" />
    <circle cx={0} cy={-62} r={9} fill={CRIMSON} stroke={INK} strokeWidth={3} />
    {was && (
      <g>
        <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={INK} opacity={0.55}>{was}</text>
        <line x1={-52} y1={-28} x2={52} y2={-28} stroke={CRIMSON} strokeWidth={4} />
      </g>
    )}
    <text x={0} y={was ? 8 : -6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={was ? 26 : 34} fill={INK}>OWE</text>
    <text x={0} y={was ? 50 : 46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={CRIMSON}>{amount}</text>
  </g>
);

/** The graduation flyer: a mortarboard, GRADUATION, SAT. (x, y) is its centre. */
export const GradFlyer: React.FC<{ x: number; y: number; s?: number; tilt?: number }> = ({ x, y, s = 1, tilt = 5 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <rect x={-58 + 5} y={-80 + 7} width={116} height={160} fill="#000" opacity={0.18} />
    <rect x={-58} y={-80} width={116} height={160} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={-58} y={-80} width={116} height={22} fill="#3e5c8f" />
    <circle cx={0} cy={-88} r={8} fill="#1d9a8f" stroke={INK} strokeWidth={3} />
    {/* the mortarboard */}
    <path d="M-34 -24 L0 -40 L34 -24 L0 -8Z" fill={INK} />
    <path d="M-20 -18 V-2 Q0 8 20 -2 V-18" fill={INK} />
    <path d="M26 -26 V0" stroke="#e8b33a" strokeWidth={4} />
    <circle cx={26} cy={2} r={5} fill="#e8b33a" />
    <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} fill={INK}>GRADUATION</text>
    <text x={0} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={CRIMSON}>SAT</text>
  </g>
);

/** The note and the flyer on the fridge's upper door, at their story amount. */
export const FridgeNotes: React.FC<{ amount: string; was?: string; flyer?: boolean }> = ({ amount, was, flyer = true }) => (
  <g>
    {/* the kit fridge's own small yellow tab sits under the note: paper over it */}
    <DebtNote x={FRIDGE.note.x} y={FRIDGE.note.y} amount={amount} was={was} s={0.82} />
    {flyer && <GradFlyer x={FRIDGE.flyer.x} y={FRIDGE.flyer.y} s={0.78} />}
  </g>
);
