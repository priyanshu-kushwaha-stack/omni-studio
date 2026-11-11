// The hall (scene_plan.md, "Shared sets"). Three views, each drawn for the REF camera (sets/common.tsx):
//
//   view "stage"     from the back of the rows: the stage with a big screen (HALL_STAGE.screen, draw slides and
//                    diagrams on it) and the lectern. You stand at HALL_STAGE.lectern; draw <Lectern/> in the actors'
//                    slot AFTER you. The nearest rows are the backs of heads: <HallFront view="stage"/>.
//   view "rows"      from the stage looking out: rows of small pastel faces (<Crowd>, about two hundred), the boss in
//                    the front row (HALL_ROWS.boss), Dev at the sound desk at the back (HALL_ROWS.desk). crowdHeads()
//                    gives every head's centre and radius, so a beat can hang a YesTag on each.
//   view "corridor"  backstage: a long corridor of stacked chairs, a stack of flyers on a chair (HALL_CORRIDOR.flyers),
//                    the exit door at the right end (HALL_CORRIDOR.door, `doorOpen` 0..1 shows the lit hall beyond).
//
// Usage: back={<HallBack cam={cam} view="rows" frame={frame} />}  actors={<><Crowd frame={frame} tilt={...} />...</>}
// Typical cameras: stage wide REF, you at the lectern medium(HALL_STAGE.lectern.x, 600); rows REF pulling back to
// zoom 0.8; corridor REF, the door { x: 1500, y: 620, zoom: 1.6 }.
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { noise, PASTELS } from "../shared";
import { Deep } from "./common";

export type HallView = "stage" | "rows" | "corridor";

/** Stage view anchors. */
export const HALL_STAGE = {
  /** The stage floor (feet line for you, scale about 0.9). */
  floor: 760,
  /** The big screen's centre and size. */
  screen: { x: 960, y: 330, w: 980, h: 480 },
  /** Your place behind the lectern (feet), facing the rows (toward the camera, so facing 1 or -1 both read). */
  lectern: { x: 1420, y: 760 },
} as const;

/** Rows view anchors. */
export const HALL_ROWS = {
  /** Rows of heads, front (bottom of frame) to back: y of the head centres, head radius, how many across. */
  rows: Array.from({ length: 10 }, (_, i) => ({ y: 960 - i * 62, r: 34 - i * 2.2, n: 14 + i * 2 })),
  /** The boss's seat in the front row (head centre). */
  boss: { x: 760, y: 960 },
  /** The sound desk at the back, where Dev stands (feet, scale about 0.45). */
  desk: { x: 1500, y: 360, scale: 0.45 },
};

/** Corridor view anchors. */
export const HALL_CORRIDOR = {
  /** Feet line (scale about 1.15). */
  floor: 960,
  /** The exit door at the right end: its centre x, top and bottom. */
  door: { x: 1640, top: 420, bottom: 960, w: 240 },
  /** The flyer stack on a chair, for grabbing (top centre). */
  flyers: { x: 520, y: 780 },
  /** Where Dev comes in from (left) and where you wait. */
  devStart: { x: -200, y: 960 },
  hero: { x: 900, y: 960 },
} as const;

/** Every head of the rows view's crowd (head centre, radius, colour, a stable index), front row first. The boss's
 *  seat is left empty (draw the boss there yourself). */
export function crowdHeads(): { x: number; y: number; r: number; head: string; i: number }[] {
  const out: { x: number; y: number; r: number; head: string; i: number }[] = [];
  let i = 0;
  HALL_ROWS.rows.forEach((row, ri) => {
    const span = 1920 + 300 + ri * 60;
    for (let c = 0; c < row.n; c++) {
      const x = 960 - span / 2 + (c + 0.5 + (ri % 2) * 0.5) * (span / row.n);
      if (ri === 0 && Math.abs(x - HALL_ROWS.boss.x) < row.r * 1.6) continue;
      out.push({ x, y: row.y + (noise(i) - 0.5) * 6, r: row.r, head: PASTELS[(i * 5 + ri) % PASTELS.length], i });
      i++;
    }
  });
  return out;
}

/** The crowd, facing you, back rows first so the front rows overlap them. `tilt(i)` turns head i (degrees), `smile`
 *  (i) gives it the fixed smile, `clap` 0..1 bounces the hands. Draw it in the actors' slot of the rows view. */
export const Crowd: React.FC<{ frame: number; tilt?: (i: number) => number; smile?: (i: number) => boolean; clap?: number }> = ({
  frame, tilt = () => 0, smile = () => false, clap = 0,
}) => {
  const heads = crowdHeads().reverse();
  return (
    <g>
      {heads.map((h) => {
        const a = tilt(h.i);
        const bob = clap > 0 ? Math.abs(Math.sin(frame * 0.9 + h.i)) * h.r * 0.25 * clap : 0;
        return (
          <g key={h.i} transform={`translate(${h.x} ${h.y}) rotate(${a})`}>
            <ellipse cx={0} cy={h.r * 1.5} rx={h.r * 1.5} ry={h.r * 0.9} fill="#3b3e47" />
            <circle r={h.r} fill={h.head} />
            <ellipse cx={-h.r * 0.33} cy={-h.r * 0.1} rx={h.r * 0.15} ry={h.r * 0.22} fill={INK} />
            <ellipse cx={h.r * 0.33} cy={-h.r * 0.1} rx={h.r * 0.15} ry={h.r * 0.22} fill={INK} />
            {smile(h.i)
              ? <path d={`M${-h.r * 0.4} ${h.r * 0.3} Q0 ${h.r * 0.7} ${h.r * 0.4} ${h.r * 0.3}`} fill="none" stroke={INK} strokeWidth={Math.max(2, h.r * 0.1)} strokeLinecap="round" />
              : <line x1={-h.r * 0.25} y1={h.r * 0.42} x2={h.r * 0.25} y2={h.r * 0.42} stroke={INK} strokeWidth={Math.max(2, h.r * 0.09)} strokeLinecap="round" />}
            {clap > 0 && <g transform={`translate(0 ${h.r * 1.2 - bob})`}><circle cx={-h.r * 0.35} r={h.r * 0.22} fill={h.head} /><circle cx={h.r * 0.35} r={h.r * 0.22} fill={h.head} /></g>}
          </g>
        );
      })}
    </g>
  );
};

/** The lectern, for the actors' slot after you. */
export const Lectern: React.FC = () => {
  const { x, y } = HALL_STAGE.lectern;
  return (
    <g>
      <path d={`M${x - 60} ${y} L${x - 44} ${y - 120} H${x + 44} L${x + 60} ${y}Z`} fill="#5b3c2a" stroke={INK} strokeWidth={5} />
      <path d={`M${x - 70} ${y - 120} L${x - 54} ${y - 146} H${x + 54} L${x + 70} ${y - 120}Z`} fill="#6b4b3a" stroke={INK} strokeWidth={5} />
      <line x1={x + 30} y1={y - 146} x2={x + 14} y2={y - 186} stroke={INK} strokeWidth={5} />
      <ellipse cx={x + 12} cy={y - 190} rx={8} ry={12} fill={INK} />
    </g>
  );
};

const StageView: React.FC<{ cam: Camera }> = ({ cam }) => {
  const s = HALL_STAGE.screen;
  return (
    <>
      <Deep cam={cam} depth={0.4} flat>
        <rect x={-1400} y={-800} width={4800} height={1700} fill="#22203a" />
        {/* the curtains */}
        {[-1, 1].map((side) => (
          <path key={side} d={side < 0 ? "M-400 -200 H260 Q200 400 280 900 H-400Z" : "M2320 -200 H1660 Q1720 400 1640 900 H2320Z"} fill="#7a2a3a" />
        ))}
        {[180, 120, 60, 1740, 1800, 1860].map((x) => <line key={x} x1={x} y1={-200} x2={x + (x < 960 ? 20 : -20)} y2={900} stroke="#5a1c2a" strokeWidth={10} />)}
      </Deep>
      <Deep cam={cam} depth={0.7}>
        <rect x={s.x - s.w / 2 - 14} y={s.y - s.h / 2 - 14} width={s.w + 28} height={s.h + 28} rx={8} fill="#111" />
        <rect x={s.x - s.w / 2} y={s.y - s.h / 2} width={s.w} height={s.h} fill="#eef0f6" />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={HALL_STAGE.floor - 10} width={4800} height={40} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        <rect x={-1400} y={HALL_STAGE.floor + 30} width={4800} height={600} fill="#2a2440" />
        {[300, 960, 1620].map((x) => <ellipse key={x} cx={x} cy={HALL_STAGE.floor + 10} rx={160} ry={14} fill="#fff1c9" opacity={0.25} />)}
      </Deep>
    </>
  );
};

const RowsView: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Deep cam={cam} depth={0.4} flat>
      <rect x={-1400} y={-800} width={4800} height={1720} fill="#2a2440" />
      {[-600, 300, 1200, 2100].map((x) => <rect key={x} x={x} y={60} width={300} height={20} rx={10} fill="#fff1c9" opacity={0.35} />)}
      {/* the back wall's exit lights and the sound desk */}
      <rect x={HALL_ROWS.desk.x - 160} y={HALL_ROWS.desk.y - 50} width={320} height={60} rx={6} fill="#3b3e47" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={HALL_ROWS.desk.x - 140 + i * 28} y={HALL_ROWS.desk.y - 40} width={8} height={20} fill={i % 3 ? "#9fd8a8" : "#f2b632"} />)}
    </Deep>
    <Deep cam={cam} depth={1} flat>
      {HALL_ROWS.rows.map((r, i) => <rect key={i} x={-1400} y={r.y + r.r * 1.4} width={4800} height={r.r * 0.8} fill="#4a2a3a" opacity={0.9} />)}
    </Deep>
  </>
);

const CorridorView: React.FC<{ cam: Camera; doorOpen: number }> = ({ cam, doorOpen }) => {
  const d = HALL_CORRIDOR.door;
  return (
    <>
      <Deep cam={cam} depth={0.45} flat>
        <rect x={-1400} y={-800} width={4800} height={1720} fill="#5a5a6e" />
        <rect x={-1400} y={120} width={4800} height={16} fill="#fff1c9" opacity={0.4} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-1300 + i * 340} y={160} width={8} height={760} fill="#4a4a5c" />)}
      </Deep>
      <Deep cam={cam} depth={0.75}>
        {/* stacked chairs along the back wall */}
        {Array.from({ length: 9 }, (_, i) => -900 + i * 300).filter((x) => Math.abs(x - d.x) > 260).map((x, k) => (
          <g key={x}>
            {Array.from({ length: 5 + (k % 3) }, (_, j) => (
              <g key={j} transform={`translate(${x} ${880 - j * 26})`}>
                <rect x={-60} y={-8} width={120} height={14} rx={4} fill={["#b5553a", "#3d6f73", "#7a5a8c"][k % 3]} stroke={INK} strokeWidth={3} />
                <rect x={-64} y={-90} width={12} height={90} fill={["#b5553a", "#3d6f73", "#7a5a8c"][k % 3]} stroke={INK} strokeWidth={3} />
              </g>
            ))}
            <line x1={x - 50} y1={890} x2={x - 54} y2={920} stroke={INK} strokeWidth={6} /><line x1={x + 50} y1={890} x2={x + 54} y2={920} stroke={INK} strokeWidth={6} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={HALL_CORRIDOR.floor - 20} width={4800} height={700} fill="#6a6058" />
        {/* the exit door: the lit hall shows through as it opens; an exit pictogram above it (a running figure, no words) */}
        <rect x={d.x - d.w / 2 - 20} y={d.top - 20} width={d.w + 40} height={d.bottom - d.top + 20} fill="#3a3a48" stroke={INK} strokeWidth={6} />
        <rect x={d.x - d.w / 2} y={d.top} width={d.w} height={d.bottom - d.top} fill="#fff1c9" />
        <rect x={d.x - d.w / 2} y={d.top} width={d.w * (1 - doorOpen * 0.85)} height={d.bottom - d.top} fill="#8a8f9c" stroke={INK} strokeWidth={5} />
        <rect x={d.x - d.w / 2 + d.w * (1 - doorOpen * 0.85) - 40} y={(d.top + d.bottom) / 2} width={26} height={10} rx={4} fill={INK} />
        <rect x={d.x - 60} y={d.top - 110} width={120} height={60} rx={6} fill="#2f9a5a" stroke={INK} strokeWidth={4} />
        <circle cx={d.x - 18} cy={d.top - 94} r={7} fill={PAPER} />
        <path d={`M${d.x - 20} ${d.top - 86} l10 18 l-14 12 M${d.x - 10} ${d.top - 70} l16 10 M${d.x - 20} ${d.top - 80} l-14 6`} stroke={PAPER} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M${d.x + 14} ${d.top - 80} h26 m-10 -10 l10 10 l-10 10`} stroke={PAPER} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* the chair with the flyer stack */}
        <rect x={HALL_CORRIDOR.flyers.x - 60} y={HALL_CORRIDOR.flyers.y + 30} width={120} height={14} rx={4} fill="#b5553a" stroke={INK} strokeWidth={3} />
        <rect x={HALL_CORRIDOR.flyers.x - 64} y={HALL_CORRIDOR.flyers.y - 50} width={12} height={90} fill="#b5553a" stroke={INK} strokeWidth={3} />
        <line x1={HALL_CORRIDOR.flyers.x - 50} y1={HALL_CORRIDOR.flyers.y + 44} x2={HALL_CORRIDOR.flyers.x - 54} y2={HALL_CORRIDOR.floor} stroke={INK} strokeWidth={6} />
        <line x1={HALL_CORRIDOR.flyers.x + 50} y1={HALL_CORRIDOR.flyers.y + 44} x2={HALL_CORRIDOR.flyers.x + 54} y2={HALL_CORRIDOR.floor} stroke={INK} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={HALL_CORRIDOR.flyers.x - 44 + i} y={HALL_CORRIDOR.flyers.y + 22 - i * 6} width={88} height={8} rx={2} fill={i % 2 ? "#f2b632" : PAPER} stroke={INK} strokeWidth={2} />)}
      </Deep>
    </>
  );
};

/** The hall behind the actors. */
export const HallBack: React.FC<{ cam: Camera; view: HallView; frame: number; doorOpen?: number }> = ({ cam, view, doorOpen = 0 }) => {
  if (view === "rows") return <RowsView cam={cam} />;
  if (view === "corridor") return <CorridorView cam={cam} doorOpen={doorOpen} />;
  return <StageView cam={cam} />;
};

/** In front of the actors: on the stage view, the backs of the two nearest rows of heads, dark and soft. */
export const HallFront: React.FC<{ cam: Camera; view: HallView }> = ({ cam, view }) => {
  if (view !== "stage") return null;
  return (
    <Deep cam={cam} depth={1.3}>
      {[0, 1].map((r) => Array.from({ length: 12 - r }, (_, i) => (
        <g key={`${r}-${i}`}>
          <ellipse cx={-60 + i * 180 + r * 90} cy={1100 - r * 70} rx={110} ry={60} fill="#1b1d24" />
          <circle cx={-60 + i * 180 + r * 90} cy={1010 - r * 70} r={58} fill={PASTELS[(i + r * 3) % PASTELS.length]} opacity={0.75} />
        </g>
      )))}
    </Deep>
  );
};
