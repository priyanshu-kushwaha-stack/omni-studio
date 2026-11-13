// Pieces for "Tell Me Now" (TellMeNow.tsx): the kitchen table and chairs, two birds on the window sill, the doorway
// behind her with the stairs going down to the hall (the cable on its hook, the dark counter on your hatch), the hall's
// stairs and the lit doorway at their foot for your boss, and the end card's paper tags (left two-thirds only).
import { AbsoluteFill, spring } from "remotion";
import { Mug } from "@whatif/kit/sets/props";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Chair, Deep } from "../sets/common";
import { Coil, Hook } from "./Timeline.Cast";

/** The table, its top at TABLE.top; her chair on the right, yours (pulled round) on the left. */
export const TABLE = { x: 820, w: 380, top: 790, seat: 856, chairScale: 1.3 };
export const HER_SEAT = 1150;

export const Table: React.FC<{ cupAt: number }> = ({ cupAt }) => (
  <g>
    <rect x={TABLE.x} y={TABLE.top} width={TABLE.w} height={20} rx={6} fill="#a8774e" stroke={INK} strokeWidth={5} />
    <line x1={TABLE.x + 30} y1={TABLE.top + 18} x2={TABLE.x + 30} y2={940} stroke={INK} strokeWidth={10} />
    <line x1={TABLE.x + TABLE.w - 30} y1={TABLE.top + 18} x2={TABLE.x + TABLE.w - 30} y2={940} stroke={INK} strokeWidth={10} />
    <Mug x={cupAt} y={TABLE.top} scale={0.8} />
    <path d={`M${cupAt - 6} ${TABLE.top - 46} q-8 -16 0 -30 M${cupAt + 10} ${TABLE.top - 46} q-8 -16 0 -30`} fill="none" stroke="#e8e2d2" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
  </g>
);

export const KitchenChair: React.FC<{ x: number; facing: 1 | -1 }> = ({ x, facing }) => (
  <Chair x={x} y={TABLE.seat} scale={TABLE.chairScale} facing={facing} />
);

/** Two birds on the kitchen window sill, hopping. Kitchen back, depth 0.85 coordinates. */
export const Birds: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <Deep cam={cam} depth={0.85}>
    {[230, 380].map((x, i) => {
      const hop = Math.max(0, Math.sin(frame / 7 + i * 2)) * 10;
      return (
        <g key={i} transform={`translate(${x} ${494 - hop}) scale(${i ? -1 : 1} 1)`}>
          <ellipse cx={0} cy={-16} rx={22} ry={15} fill="#8a6a4a" stroke={INK} strokeWidth={3} />
          <circle cx={16} cy={-30} r={10} fill="#8a6a4a" stroke={INK} strokeWidth={3} />
          <circle cx={19} cy={-32} r={2.5} fill={INK} />
          <path d="M26 -30 l9 2 l-9 3z" fill="#e8b23a" />
          <path d="M-20 -14 l-14 -6 l2 10z" fill="#6f5a40" />
        </g>
      );
    })}
  </Deep>
);

/** The doorway behind her in the kitchen's far wall: down the stairs, the cable coiled on its hook and the dark
 *  counter on your hatch. Kitchen back, after the set (depth 0.85). */
export const KitchenDoorway: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={0.85}>
    <rect x={1760} y={300} width={190} height={640} fill="#1a1f30" stroke="#b9895f" strokeWidth={14} />
    {Array.from({ length: 7 }, (_, i) => (
      <rect key={i} x={1770 + i * 8} y={560 + i * 52} width={170 - i * 8} height={14} fill="#2c3350" />
    ))}
    <rect x={1800} y={700} width={140} height={150} rx={18} fill="#262d45" stroke={INK} strokeWidth={4} />
    <rect x={1838} y={672} width={64} height={22} rx={4} fill={INK} />
    {[0, 1, 2].map((k) => <rect key={k} x={1843 + k * 20} y={676} width={16} height={14} rx={2} fill="#2b2f3d" />)}
    <g transform="translate(1790 430) scale(0.55)">
      <Hook x={0} y={0} />
      <Coil x={0} y={0} r={40} />
    </g>
  </Deep>
);

/** The hall's stairs up to the kitchen, at the right of the hall, and the lit doorway at their foot. Actors slot. */
export const HallStairs: React.FC<{ door?: boolean }> = ({ door }) => (
  <g>
    {door && <rect x={1520} y={560} width={220} height={400} fill="#ffe2a6" stroke="#7a5d47" strokeWidth={16} />}
    {Array.from({ length: 9 }, (_, i) => (
      <g key={i}>
        <rect x={1760 + i * 50} y={960 - (i + 1) * 52} width={600} height={52} fill={i % 2 ? "#4a4f60" : "#545a6c"} stroke={INK} strokeWidth={4} />
      </g>
    ))}
    <line x1={1740} y1={860} x2={2220} y2={400} stroke="#8a6a3a" strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** Where your feet are on the hall stairs, `p` 0 at the bottom to 1 near the top. */
export const stairsAt = (p: number) => ({ x: 1785 + p * 400, y: 908 - p * 416 });

/** A stamped paper tag with an icon, in screen pixels; stamps in at `at`. */
const EndTag: React.FC<{ frame: number; at: number; x: number; y: number; text: string; icon: "like" | "bell" | "talk"; tilt: number }> = ({
  frame, at, x, y, text, icon, tilt,
}) => {
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness: 190, mass: 0.6 } });
  const h = 92, w = 130 + text.length * 34;
  const sway = Math.sin((frame - at) / 14 + x) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt + sway}) scale(${s})`}>
      <line x1={26} y1={-80} x2={26} y2={h / 2} stroke="#d9c9a6" strokeWidth={3} />
      <rect x={6} y={8} width={w} height={h} rx={14} fill="#05031f" opacity={0.35} />
      <rect x={0} y={0} width={w} height={h} rx={14} fill={PAPER} stroke={INK} strokeWidth={4} />
      <circle cx={26} cy={h / 2} r={8} fill="none" stroke={INK} strokeWidth={3} />
      <g transform={`translate(72 ${h / 2})`}>
        {icon === "like" && <path d="M-16 4 h8 v18 h-8z M-6 6 l8 -2 l4 -16 q3 -5 7 -2 q2 3 0 9 l-2 9 h12 q5 0 4 6 l-3 12 q-1 4 -5 4 h-25z" fill={MUSTARD} stroke={INK} strokeWidth={3} strokeLinejoin="round" transform="translate(0 -12)" />}
        {icon === "bell" && <path d="M-16 10 q4 -4 4 -14 q0 -14 12 -16 q12 2 12 16 q0 10 4 14 z M-5 14 q5 8 10 0" fill={CRIMSON} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
        {icon === "talk" && <path d="M-20 -14 h40 q6 0 6 6 v18 q0 6 -6 6 h-20 l-12 10 l2 -10 h-10 q-6 0 -6 -6 v-18 q0 -6 6 -6z" fill={TEAL} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      </g>
      <text x={108} y={h * 0.67} fontFamily={FONT} fontWeight={800} fontSize={44} fill={INK} letterSpacing={2}>{text}</text>
    </g>
  );
};

/** The end card: the picture dimmed, the right third quieter still (end screens go there), and three tags in the left
 *  two-thirds: COMMENT on "Tell us in the comments", then LIKE and SUBSCRIBE. */
export const EndCard: React.FC<{ frame: number; dim: number; comment: number; like: number; subscribe: number }> = ({ frame, dim, comment, like, subscribe }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: `rgba(12,10,20,${0.35 * dim})` }} />
    <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(12,10,20,0) 58%, rgba(12,10,20,${0.5 * dim}) 68%)` }} />
    <svg width={1920} height={1080}>
      <g transform="translate(130 300)">
        <EndTag frame={frame} at={comment} x={0} y={0} text="COMMENT" icon="talk" tilt={-3} />
        <EndTag frame={frame} at={like} x={60} y={170} text="LIKE" icon="like" tilt={2} />
        <EndTag frame={frame} at={subscribe} x={0} y={340} text="SUBSCRIBE" icon="bell" tilt={-2} />
      </g>
    </svg>
  </AbsoluteFill>
);
