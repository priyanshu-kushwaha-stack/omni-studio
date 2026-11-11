// The meeting room for "The office: a wake of yes" (Office.tsx): who sits where, the tangled shape on the whiteboard,
// the paper diagram of a ring of heads whose bubbles flatten into one tick, and the glossy flyer for the hall.
// World coordinates on the Office set's "meeting" view (sets/Office.tsx).
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { BOSS, DEV, PASTELS, ramp } from "../shared";
import { Deep } from "../sets/common";
import { OFFICE_MEETING } from "../sets/Office";

/** Seated scale in the meeting room (the set's seats are for scale 1). */
export const MS = 1;
/** The far side of the table: seven people facing you at the left end (Dev first, at your left). With you and the
 *  boss that is nine round the table, so eight tags can run round it. */
export const FAR = [590, 720, 850, 980, 1110, 1240, 1370].map((x, i) => ({
  x, y: OFFICE_MEETING.seats[0].y, head: i === 0 ? DEV.head : PASTELS[(i * 3 + 2) % PASTELS.length], coat: i === 0 ? DEV.coat : i % 2 ? "#3f4a5c" : undefined,
}));
export const YOU_SEAT = OFFICE_MEETING.seats[6];
export const BOSS_SEAT = OFFICE_MEETING.seats[7];
export { BOSS };

/** Dev's page on the table in front of him (centre x, the table top y) and the pitch stack in the middle. */
export const PAGE = { x: 520, y: OFFICE_MEETING.table.top };

/** The page lying on the table top, seen from the side and a little above: a thin cream shape with ink lines. */
export const TablePage: React.FC<{ x: number; y: number; signed?: number }> = ({ x, y, signed = 0 }) => (
  <g>
    <path d={`M${x - 46} ${y + 2} L${x + 40} ${y + 2} L${x + 50} ${y - 10} L${x - 36} ${y - 10}Z`} fill={PAPER} stroke={INK} strokeWidth={3} />
    {signed > 0 && <path d={`M${x - 20} ${y - 4} q6 -6 12 0 t12 0`} fill="none" stroke="#1d3a8a" strokeWidth={3} opacity={signed} />}
  </g>
);

/** A pen for a hand (Figure `held`). `capped` adds the cap. */
export const Pen: React.FC<{ tilt?: number; capped?: boolean }> = ({ tilt = 150, capped }) => (
  <g transform={`rotate(${tilt})`}>
    <rect x={-4} y={-6} width={8} height={46} rx={3} fill="#1d3a8a" stroke={INK} strokeWidth={2} />
    {capped ? <rect x={-5} y={28} width={10} height={20} rx={3} fill="#1d3a8a" stroke={INK} strokeWidth={2} /> : <path d="M-3 40 L0 50 L3 40Z" fill={INK} />}
  </g>
);

/** Your idea on the whiteboard: one big tangled shape (drawn on the whiteboard's layer, for the `back` slot). */
export const Tangle: React.FC<{ cam: Camera; dim?: number }> = ({ cam, dim = 1 }) => {
  const w = OFFICE_MEETING.whiteboard;
  return (
    <Deep cam={cam} depth={0.95}>
      <g transform={`translate(${w.x} ${w.y})`} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={dim}>
        <path d="M-260 40 C-200 -120 -40 120 20 -60 S180 -110 120 40 S-60 120 -120 -20 S60 -140 220 -40 S240 110 60 90 S-180 60 -230 -60"
          stroke={INK} strokeWidth={9} />
        <path d="M-150 -90 C-60 -20 -200 60 -40 70 S90 -20 10 -100 S200 10 170 100" stroke={CRIMSON} strokeWidth={8} />
        <path d="M200 -120 l20 20 m-20 0 l20 -20 M-280 90 l60 -10" stroke={INK} strokeWidth={6} />
      </g>
    </Deep>
  );
};

/** The eight different things the ring says, before they flatten into the same tick. Small paths about 30 across. */
const SAYS = [
  "M-14 0 Q-7 -12 0 0 T14 0", "M-14 -8 L-5 8 L4 -8 L14 8", "M-12 6 L0 -10 L12 6Z", "M-10 -8 L10 8 M-10 8 L10 -8",
  "M-6 -8 Q0 -14 6 -8 Q8 -2 0 1 V6", "M-10 -8 H10 V8 H-10Z", "M-14 0 H14 M0 -10 V10", "M-12 4 Q-12 -10 0 -10 Q12 -10 12 4",
];
const TICK = "M-12 0 L-3 9 L13 -9";

/**
 * The paper diagram over the whiteboard: a ring of eight heads round a table, nodding; each has a bubble with its own
 * mark, and from `flatten` they flatten one by one (every `gap` frames) into the same tick. For the `back` slot (it
 * sits on the whiteboard's layer).
 */
export const RingDiagram: React.FC<{ cam: Camera; frame: number; at: number; flatten: number; gap: number }> = ({ cam, frame, at, flatten, gap }) => {
  const w = OFFICE_MEETING.whiteboard;
  const cx = 350, cy = 172;
  return (
    <Deep cam={cam} depth={0.95}>
      <Sheet frame={frame} at={at} x={w.x} y={w.y + 6} w={700} h={330} tilt={-1}>
        <DrawLine d={`M${cx - 120} ${cy} A120 56 0 1 0 ${cx + 120} ${cy} A120 56 0 1 0 ${cx - 120} ${cy}`} from={at + 6} to={at + 26} color={INK} width={6} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const hx = cx + Math.cos(a) * 170, hy = cy + Math.sin(a) * 94;
          const bx = cx + Math.cos(a) * 282, by = cy + Math.sin(a) * 136;
          const show = ramp(frame, at + 14 + i * 3, at + 22 + i * 3);
          const flat = frame >= flatten + i * gap;
          const squash = flat ? Math.min(1, (frame - flatten - i * gap) / 5) : 0;
          const nod = Math.max(0, Math.sin((frame - at) / 5 + (flat ? 0 : i))) * (flat ? 6 : 2);
          return show > 0 ? (
            <g key={i}>
              <g transform={`translate(${hx} ${hy + nod}) scale(${show})`}>
                <circle r={22} fill={PASTELS[(i * 3 + 1) % PASTELS.length]} stroke={INK} strokeWidth={3} />
                <path d="M-8 6 Q0 12 8 6" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
              </g>
              <g transform={`translate(${bx} ${by}) scale(${show})`}>
                <rect x={-30} y={-21} width={60} height={42} rx={16} fill={PAPER} stroke={INK} strokeWidth={3} />
                <path d={flat ? TICK : SAYS[i]} transform={`scale(1 ${flat ? 0.4 + 0.6 * squash : 1})`} fill="none"
                  stroke={flat ? "#1d9a8f" : INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ) : null;
        })}
      </Sheet>
    </Deep>
  );
};

/** The glossy flyer sliding along the table top, seen from the side: a thin bright card with a sheen. */
export const FlyerSide: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x - 70} ${y + 2} L${x + 60} ${y + 2} L${x + 74} ${y - 14} L${x - 56} ${y - 14}Z`} fill="#22305a" stroke={INK} strokeWidth={3} />
    <path d={`M${x - 40} ${y - 1} L${x + 30} ${y - 1} L${x + 40} ${y - 11} L${x - 30} ${y - 11}Z`} fill="#f2b632" opacity={0.85} />
  </g>
);

/**
 * The flyer close up, centred at (x, y), about 1000 x 640: a hall seen from the back, a tiny stage with the tangled
 * shape on its screen, rows and rows of tiny pastel heads turned to it, and a date box (ink bars, no digits) that a
 * crimson ring draws round from `ring`. The rows appear front to back from `rows`.
 */
export const FlyerTop: React.FC<{ x: number; y: number; frame: number; ring: number; rows: number }> = ({ x, y, frame, ring, rows }) => {
  const W = 1000, H = 640;
  return (
    <g transform={`translate(${x - W / 2} ${y - H / 2})`}>
      <rect x={14} y={18} width={W} height={H} rx={14} fill="#000" opacity={0.3} />
      <rect x={0} y={0} width={W} height={H} rx={14} fill="#22305a" stroke={INK} strokeWidth={6} />
      {/* the stage, its screen with the tangle, a lectern */}
      <rect x={300} y={60} width={400} height={170} rx={6} fill="#f6efe0" stroke={INK} strokeWidth={4} />
      <path d="M340 160 C370 90 420 200 460 120 S540 90 520 160 S440 200 420 140 S520 80 600 130 S620 200 560 190" fill="none" stroke={INK} strokeWidth={5} />
      <path d="M380 120 C420 150 380 190 450 190 S520 140 480 100" fill="none" stroke={CRIMSON} strokeWidth={4} />
      <rect x={220} y={238} width={560} height={30} fill="#7a4a3a" stroke={INK} strokeWidth={4} />
      <rect x={640} y={200} width={34} height={40} fill="#5b3c2a" />
      {/* rows of tiny heads, all turned to the stage */}
      {Array.from({ length: 6 }, (_, r) => {
        const show = ramp(frame, rows + r * 5, rows + r * 5 + 8);
        const n = 12 + r * 2, ry = 310 + r * 50, rr = 12 + r * 1.6;
        return show > 0 ? (
          <g key={r} opacity={show}>
            {Array.from({ length: n }, (_, i) => (
              <circle key={i} cx={W / 2 + (i - (n - 1) / 2) * (rr * 2.6)} cy={ry} r={rr} fill={PASTELS[(i * 5 + r * 3) % PASTELS.length]} stroke={INK} strokeWidth={2} />
            ))}
          </g>
        ) : null;
      })}
      {/* the date box: ink bars only, ringed in crimson */}
      <rect x={830} y={40} width={130} height={110} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
      <rect x={830} y={40} width={130} height={30} rx={8} fill={CRIMSON} />
      <rect x={858} y={88} width={74} height={16} rx={8} fill={INK} />
      <rect x={868} y={114} width={54} height={10} rx={5} fill={INK} opacity={0.5} />
      <DrawLine d="M960 70 C1010 120 940 190 880 176 C800 160 790 60 870 34 C920 18 970 40 980 70" from={ring} to={ring + 16} color={CRIMSON} width={9} />
      {/* the gloss */}
      <path d="M80 640 L300 0 H380 L160 640Z" fill="#fff" opacity={0.07} />
    </g>
  );
};
