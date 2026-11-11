// The top-down office floor for "The office: a wake of yes" (Office.tsx): the wake of YES tags that flips behind you
// like dominoes and then runs the length of the floor, every head turning to you with the same smile. Everything
// here is world coordinates on the Office set's "floor" view (sets/Office.tsx), for a <Stage> actors slot.
import { interpolate } from "remotion";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { YesTag } from "../parts";
import { DEV, linear, noise, PASTELS } from "../shared";
import { OFFICE_FLOOR, TopDownHead } from "../sets/Office";

/** Everyone on the floor: the 22 desk seats along the aisle, then the 22 heads of the far rows (the set draws those
 *  as plain circles; a TopDownHead covers each). `col` is the column along the aisle, `row` 0 near, 1 far. */
export interface Seat { x: number; y: number; side: 1 | -1; col: number; row: 0 | 1; head: string; work: number; dev: boolean }

/** Dev sits at seat 13 (column 6, below the aisle). */
export const DEV_SEAT = 13;

export const SEATS: Seat[] = [
  ...OFFICE_FLOOR.seats.map((s, i) => ({
    x: s.x, y: s.y, side: s.side, col: Math.floor(i / 2), row: 0 as const, head: i === DEV_SEAT ? DEV.head : s.head,
    // facing their own desk while they work: up (180) above the aisle, down (0) below it
    work: s.side < 0 ? 180 : 0, dev: i === DEV_SEAT,
  })),
  ...Array.from({ length: 22 }, (_, i) => {
    const col = Math.floor(i / 2);
    const side = (i % 2 === 0 ? -1 : 1) as 1 | -1;
    return {
      x: -420 + col * 290, y: OFFICE_FLOOR.aisle.y + side * 560, side, col, row: 1 as const,
      head: PASTELS[(col + 2) % PASTELS.length], work: side < 0 ? 0 : 180, dev: false,
    };
  }),
];

/** Your walk down the aisle: x at a frame (start, end and their frames). */
export interface Walk { x0: number; x1: number; f0: number; f1: number }
export const walkX = (w: Walk, frame: number) => w.x0 + (w.x1 - w.x0) * linear(frame, w.f0, w.f1);
const passFrame = (w: Walk, x: number) => w.f0 + ((x - w.x0) / (w.x1 - w.x0)) * (w.f1 - w.f0);

/**
 * The frame each seat's tag flips. Behind you as you pass (you have just asked); then, from `domino`, like dominoes:
 * the wake runs on ahead down the floor a column every `step` frames, the far rows a few frames after the near ones.
 */
export function flipFrames(w: Walk, domino: number, step = 4): number[] {
  const startCol = Math.max(0, Math.floor((walkX(w, domino) + 420) / 290));
  return SEATS.map((s) => {
    const passed = passFrame(w, s.x + 70) + (s.side > 0 ? 3 : 0);
    const run = domino + Math.max(0, s.col - startCol) * step + (s.side > 0 ? 2 : 0);
    return Math.round(Math.min(passed, run) + (s.row === 1 ? 7 : 0));
  });
}

/** The angle (degrees, TopDownHead's `turn`) that points a head's face from (x, y) at (tx, ty). */
const aim = (x: number, y: number, tx: number, ty: number) => (Math.atan2(-(tx - x), ty - y) * 180) / Math.PI;

/** Turn smoothly from `a` to `b` the short way round, t 0..1. */
const turnBetween = (a: number, b: number, t: number) => {
  let d = ((b - a) % 360 + 540) % 360 - 180;
  if (Math.abs(d) < 0.001) d = 0;
  return a + d * t;
};

/** Every seat: working, then from its flip frame turned to you with the same smile and a YES tag over the head. */
export const FloorPeople: React.FC<{ frame: number; flips: number[]; you: { x: number; y: number }; tags?: boolean }> = ({ frame, flips, you, tags = true }) => (
  <g>
    {SEATS.map((s, i) => {
      const t = interpolate(frame, [flips[i], flips[i] + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const working = s.work + Math.sin(frame / 20 + i) * 6;
      const turn = turnBetween(working, aim(s.x, s.y, you.x, you.y), t);
      return (
        <g key={i}>
          <TopDownHead x={s.x} y={s.y} head={s.head} turn={turn} face={t > 0.3} smile={t > 0.3} scale={s.row === 1 ? 0.95 : 1} />
          {s.dev && <DevPhones x={s.x} y={s.y} turn={turn} />}
        </g>
      );
    })}
    {tags && SEATS.map((s, i) => <YesTag key={`t${i}`} frame={frame} at={flips[i]} x={s.x} headY={s.y} r={40} tilt={-4 + noise(i) * 2} />)}
  </g>
);

/** Dev's headphones from above: a dark band round the back of his neck, the two cups at his shoulders. */
const DevPhones: React.FC<{ x: number; y: number; turn: number }> = ({ x, y, turn }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`} fill="#1b1d24">
    <path d="M-44 -6 Q0 -46 44 -6" fill="none" stroke="#1b1d24" strokeWidth={9} strokeLinecap="round" />
    <ellipse cx={-46} cy={-2} rx={10} ry={13} /><ellipse cx={46} cy={-2} rx={10} ry={13} />
  </g>
);

/** You from straight above: mustard head with the tuft, the teal scarf with its tails trailing, shoulders, and feet
 *  stepping out ahead in turn. `dir` is the walking direction (degrees, 0 = right), `look` turns your head (degrees,
 *  + toward the bottom of the screen) as you ask the people at either side. `step` is the walk's phase. */
export const TopDownYou: React.FC<{ x: number; y: number; dir?: number; look?: number; step: number; scale?: number; held?: React.ReactNode }> = ({
  x, y, dir = 0, look = 0, step, scale = 1.1, held,
}) => {
  const a = Math.sin(step);
  return (
    <g transform={`translate(${x} ${y}) rotate(${dir}) scale(${scale})`}>
      {/* feet, ahead and behind in turn */}
      <ellipse cx={26 * a + 10} cy={-20} rx={22} ry={11} fill={INK} />
      <ellipse cx={-26 * a + 10} cy={20} rx={22} ry={11} fill={INK} />
      <g transform={`rotate(${a * 5})`}>
        <ellipse cx={0} cy={0} rx={30} ry={62} fill="#3b3e47" stroke={INK} strokeWidth={5} />
        {/* the scarf: a band at the neck and two tails flying back */}
        <path d={`M-10 -8 Q-50 ${-14 + a * 8} -86 ${-4 + a * 12}`} fill="none" stroke={TEAL} strokeWidth={14} strokeLinecap="round" />
        <path d={`M-10 8 Q-46 ${18 - a * 8} -78 ${16 - a * 12}`} fill="none" stroke={TEAL} strokeWidth={14} strokeLinecap="round" />
        <circle cx={0} cy={0} r={46} fill={TEAL} />
        {held && <g transform="translate(34 46)">{held}</g>}
      </g>
      <g transform={`rotate(${look})`}>
        <circle cx={0} cy={0} r={40} fill={MUSTARD} stroke={INK} strokeWidth={4} />
        {/* the tuft on top, and a shade on the back of the head (the face looks the way the head turns) */}
        <path d="M-26 -14 Q-40 0 -26 14" fill="none" stroke="#000" strokeWidth={6} opacity={0.15} />
        <path d="M-6 -4 Q-24 -16 -18 4 Q-10 -2 -2 8 Z" fill={INK} />
        <ellipse cx={30} cy={0} rx={6} ry={10} fill="#d99a1f" />
      </g>
    </g>
  );
};

/** An office chair from above: five-star base, round seat, the back's arc. Centre (x, y), its back toward `turn`. */
export const TopChair: React.FC<{ x: number; y: number; turn?: number }> = ({ x, y, turn = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`}>
    {[0, 72, 144, 216, 288].map((r) => (
      <g key={r} transform={`rotate(${r})`}><rect x={-5} y={0} width={10} height={56} rx={5} fill="#3b3e47" /><circle cx={0} cy={56} r={8} fill={INK} /></g>
    ))}
    <circle cx={0} cy={0} r={40} fill="#4a5262" stroke={INK} strokeWidth={5} />
    <path d="M-36 -26 Q0 -54 36 -26" fill="none" stroke="#3b3e47" strokeWidth={16} strokeLinecap="round" />
  </g>
);

/** A phone charger with its cable coiled behind it (seen from above). */
export const Charger: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 0, y = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M14 0 C40 0 40 30 14 30 C-12 30 -12 56 14 56 C40 56 40 80 10 84" fill="none" stroke="#e9edf0" strokeWidth={6} />
    <rect x={-20} y={-18} width={40} height={36} rx={8} fill="#f6f7f8" stroke={INK} strokeWidth={4} />
    <rect x={-8} y={-30} width={4} height={12} fill="#9aa1ab" /><rect x={4} y={-30} width={4} height={12} fill="#9aa1ab" />
  </g>
);

/** A colleague's arm reaching from (x0, y0) to (x1, y1), seen from above: a sleeve and a hand. */
export const TopArm: React.FC<{ x0: number; y0: number; x1: number; y1: number; head: string; children?: React.ReactNode }> = ({ x0, y0, x1, y1, head, children }) => (
  <g>
    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#3b3e47" strokeWidth={20} strokeLinecap="round" />
    <circle cx={x1} cy={y1} r={14} fill={head} stroke={INK} strokeWidth={3} />
    <g transform={`translate(${x1} ${y1})`}>{children}</g>
  </g>
);

/** A sheet on a desk for a signature, seen from above (centre x, y). */
export const DeskPage: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-6)`}>
    <rect x={-60} y={-80} width={120} height={160} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((r) => <rect key={r} x={-44} y={-62 + r * 22} width={88 - r * 10} height={8} rx={4} fill={INK} opacity={0.45} />)}
    <line x1={-44} y1={50} x2={44} y2={50} stroke={INK} strokeWidth={3} />
  </g>
);
