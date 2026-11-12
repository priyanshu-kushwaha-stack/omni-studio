// The reading room (scene_plan.md, "Shared sets"; owner: builder D). A Seoul study cafe past midnight: rows of
// partitioned desks, one small lamp each, dark between. Three views, each drawn for the REF camera (sets/common.tsx):
//
//   view "rows"  side on, along the rows: the near row of carrels (chair, desk, a front partition with a clamp lamp),
//                two smaller rows behind it, the dark wall. People sit facing right. Draw seated people, then
//                <ReadingRoomMid> (the near desk tops go over their laps), then anyone standing in front.
//                Min-jun's carrel is READING.minjun, yours READING.you; his notebook lies open on his desk.
//   view "top"   straight down on Min-jun's desk: the open notebook under his lamp, your wrong answers copied out in
//                rows (ink bars), a "?" beside each in his blue pen. `rows` and `marks` (0..1) draw them on.
//   view "plan"  the whole room from above: the rows of desks as lanes, a lamp pool at each lit desk, heads bent over
//                a few. `lane` picks one lane; `others` (0..1) dims every other lane to dark.
//
// Usage: back={<ReadingRoomBack cam={cam} view="rows" />} actors={<>{seated}<ReadingRoomMid />{standing}</>}
// Lamps glow through the Look: wrap the Stage in <LookContext.Provider value={withGlows(look, readingGlows(...))}>.
// Typical cameras: rows wide REF; Min-jun's carrel { x: 960, y: 760, zoom: 1.9 }; top REF pushing to zoom 1.6 on a row;
// plan from { x: 960, y: 660, zoom: 1.8 } up to { x: 960, y: 560, zoom: 0.75 }.
import type { Glow, Look } from "@whatif/kit/stage/Look";
import { toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { seatedY } from "@whatif/kit/rig/pose";
import { MINJUN, noise, PASTELS } from "../shared";
import { Chair, Deep, REF } from "./common";

export type ReadingView = "rows" | "top" | "plan";

// ------------------------------------------------------------------------------------------------ the rows (side on)

/** One carrel's width; the near row's first carrel starts at FIRST. */
const U = 420;
const FIRST = -540;
const FLOOR = 985;

const WALL = "#1b1d2b";
const WOOD = "#7d5f44";
const WOOD_LIT = "#b58a5c";
const PANEL = "#38423f";
const SHADE = "#c9c3b5";
const POOL = "#ffd38a";
const PEN = "#2f5d9a";

/** Near-row anchors, world units (scale about 1.1 for people). */
export const READING = {
  floor: FLOOR,
  deskTop: FLOOR - 135,
  seatTop: FLOOR - 75,
  /** Min-jun's carrel and yours, beside it on the left. */
  minjun: 3,
  you: 2,
  /** Carrel i of the near row: its left edge, the chair (seat centre x), the desk span, the lamp's bulb, the pool. */
  carrel: (i: number) => {
    const x0 = FIRST + i * U;
    return {
      x0, chair: x0 + 70, desk: { from: x0 + 110, to: x0 + 400 }, lamp: { x: x0 + 318, y: FLOOR - 312 },
      pool: { x: x0 + 300, y: FLOOR - 135 },
    };
  },
  /** The figure y that seats someone on a near-row chair. */
  seatY: (scale: number) => seatedY(FLOOR - 75, scale),
  /** Min-jun's open notebook on his desk (centre of its bottom edge). */
  notebook: { x: FIRST + 3 * U + 250, y: FLOOR - 135 },
} as const;

/** Near-row lamps on by default: his, and a scatter of others (yours is dark until you sit there). */
export const DEFAULT_LIT = [0, 3, 5, 6];

/** One row of carrels, in row-local units (floor at 0), from carrel `first` to `last`. `part` "back" draws the chairs,
 *  partitions and lamps; "desk" the desk tops, light pools and what is on them; "all" both, with heads bent over a few
 *  desks (the far rows). */
const Carrels: React.FC<{
  first: number; last: number; lit: (i: number) => boolean; part: "back" | "desk" | "all"; seed: number; people?: number;
  notebook?: number; chairOut?: number[];
}> = ({ first, last, lit, part, seed, people = 0, notebook, chairOut = [] }) => {
  const ids = Array.from({ length: last - first + 1 }, (_, k) => first + k);
  const back = part !== "desk";
  const desk = part !== "back";
  return (
    <g>
      {ids.map((i) => {
        const x0 = i * U;
        const on = lit(i);
        const sitting = part === "all" && on && noise(i * 7 + seed) < people;
        const out = chairOut.includes(i) ? -40 : 0;
        return (
          <g key={i}>
            {back && (
              <g>
                {on && <path d={`M${x0 + 286} -312 L${x0 + 350} -312 L${x0 + 400} -135 L${x0 + 196} -135Z`} fill={POOL} opacity={0.12} />}
                <rect x={x0 + 392} y={-392} width={22} height={257} fill={PANEL} stroke={INK} strokeWidth={4} />
                <rect x={x0 + 386} y={-400} width={34} height={12} rx={4} fill="#4d5955" stroke={INK} strokeWidth={3} />
                <path d={`M${x0 + 398} -330 L${x0 + 352} -366 L${x0 + 320} -340`} fill="none" stroke="#5a5a62" strokeWidth={6} strokeLinejoin="round" />
                <path d={`M${x0 + 298} -342 L${x0 + 340} -342 L${x0 + 352} -312 L${x0 + 284} -312Z`} fill={SHADE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
                {on && <ellipse cx={x0 + 318} cy={-312} rx={26} ry={6} fill="#fff6dc" />}
                {!sitting && <Chair x={x0 + 70 + out} y={-75} scale={1.2} color="#4a3b33" />}
                {sitting && (
                  <g>
                    <rect x={x0 + 40} y={-250} width={64} height={130} rx={26} fill={["#3b3e47", "#4a4f63", "#3d4a5c"][i % 3]} transform={`rotate(24 ${x0 + 72} -120)`} />
                    <circle cx={x0 + 132} cy={-238} r={40} fill={PASTELS[(i * 3 + seed) % PASTELS.length]} stroke={INK} strokeWidth={3} />
                    <path d={`M${x0 + 96} -260 Q${x0 + 132} -292 ${x0 + 168} -250`} fill="#2a2730" opacity={0.85} />
                  </g>
                )}
              </g>
            )}
            {desk && (
              <g>
                <rect x={x0 + 110} y={-135} width={290} height={16} rx={3} fill={on ? WOOD_LIT : WOOD} stroke={INK} strokeWidth={4} />
                <rect x={x0 + 120} y={-119} width={12} height={119} fill="#4a3a2e" />
                <rect x={x0 + 382} y={-119} width={12} height={119} fill="#4a3a2e" />
                {on && <ellipse cx={x0 + 300} cy={-137} rx={95} ry={9} fill={POOL} opacity={0.75} />}
                {notebook === i ? <SideNotebook x={x0 + 250} y={-135} /> : on && noise(i + seed * 3) > 0.35 && (
                  <g>
                    <rect x={x0 + 170 + noise(i + 2) * 40} y={-147} width={110} height={12} rx={2} fill={["#d8344f", "#1d9a8f", "#7fa0c4", "#d9c26a"][(i + seed) % 4]} stroke={INK} strokeWidth={3} />
                    <rect x={x0 + 180 + noise(i + 2) * 40} y={-157} width={96} height={10} rx={2} fill={PAPER} stroke={INK} strokeWidth={2} />
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** An open notebook lying on a desk, side on (a little tipped toward us), its bottom edge centred at (x, y). */
export const SideNotebook: React.FC<{ x: number; y: number; scale?: number; cover?: string }> = ({ x, y, scale = 1, cover = MINJUN.coat }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-96 0 L96 0 L84 -18 L-84 -18Z" fill={cover} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M-90 -3 L-2 -3 L-6 -21 L-78 -24Z M2 -3 L90 -3 L78 -24 L6 -21Z" fill={PAPER} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {[0, 1].map((r) => <g key={r}>
      <line x1={-70 + r * 4} y1={-9 - r * 7} x2={-26} y2={-9 - r * 7} stroke="#4a4d58" strokeWidth={2.5} />
      <line x1={22} y1={-9 - r * 7} x2={62 - r * 4} y2={-9 - r * 7} stroke="#4a4d58" strokeWidth={2.5} />
      <circle cx={-16} cy={-9 - r * 7} r={2.5} fill={PEN} /><circle cx={72 - r * 4} cy={-9 - r * 7} r={2.5} fill={PEN} />
    </g>)}
    <rect x={104} y={-6} width={70} height={6} rx={3} fill={MINJUN.coat} transform="rotate(-6 104 -3)" />
  </g>
);

const RowsBack: React.FC<{ cam: Camera; lit: number[]; chairOut: number[]; farPeople: number }> = ({ cam, lit, chairOut, farPeople }) => (
  <>
    <Deep cam={cam} depth={0.3} flat>
      <rect x={-1400} y={-800} width={4800} height={2400} fill={WALL} />
      {/* high windows onto the night, a dim exit light, ducts */}
      {[-300, 500, 1300, 2100].map((x) => <rect key={x} x={x} y={70} width={360} height={110} rx={6} fill="#141833" stroke="#2c2f44" strokeWidth={10} />)}
      {[-300, 500, 1300, 2100].map((x) => <circle key={`s${x}`} cx={x + 60 + noise(x) * 240} cy={110 + noise(x + 1) * 40} r={3} fill="#f3ead2" opacity={0.6} />)}
      <rect x={-1400} y={20} width={4800} height={24} fill="#23263a" />
      <rect x={1700} y={250} width={70} height={34} rx={4} fill="#2f7a5a" opacity={0.7} />
    </Deep>
    <Deep cam={cam} depth={0.5} flat>
      <rect x={-1400} y={640} width={4800} height={1200} fill="#20212c" />
      <g transform="translate(-700 640) scale(0.42)">
        <Carrels first={0} last={20} lit={(i) => noise(i * 5 + 11) < 0.45} part="all" seed={4} people={farPeople * 0.8} />
      </g>
    </Deep>
    <Deep cam={cam} depth={0.7} flat>
      <rect x={-1400} y={770} width={4800} height={1200} fill="#24252f" />
      <g transform="translate(-820 770) scale(0.62)">
        <Carrels first={0} last={14} lit={(i) => noise(i * 3 + 2) < 0.5} part="all" seed={1} people={farPeople} />
      </g>
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={FLOOR - 10} width={4800} height={900} fill="#2c2b33" />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 180} y1={FLOOR - 10} x2={-1500 + i * 180} y2={1700} stroke="#000" strokeWidth={3} opacity={0.12} />)}
      <g transform={`translate(${FIRST} ${FLOOR})`}>
        <Carrels first={-2} last={9} lit={(i) => lit.includes(i)} part="back" seed={0} chairOut={chairOut} />
      </g>
    </Deep>
  </>
);

/** The near row's desk tops, pools and what is on them: in the actors' slot, after anyone seated. */
export const ReadingRoomMid: React.FC<{ lit?: number[]; notebook?: boolean; extra?: React.ReactNode }> = ({ lit = DEFAULT_LIT, notebook = true, extra }) => (
  <g>
    <g transform={`translate(${FIRST} ${FLOOR})`}>
      <Carrels first={-2} last={9} lit={(i) => lit.includes(i)} part="desk" seed={0} notebook={notebook ? READING.minjun : undefined} />
    </g>
    {extra}
  </g>
);

// ------------------------------------------------------------------------------------------------ the notebook (top)

/** The open notebook from above, in REF units: two pages and the rows on them. */
export const TOP = {
  left: { x: 440, y: 270, w: 470, h: 640 },
  right: { x: 910, y: 270, w: 470, h: 640 },
  rows: 7,
  /** Row r (0..13: seven on the left page, then seven on the right): where its bars start and end, and its "?". */
  row: (r: number) => {
    const page = r < 7 ? 0 : 1;
    const k = r % 7;
    const x = page ? 950 : 480;
    const len = 250 + noise(r + 4) * 110;
    return { x, y: 345 + k * 80, len, mark: { x: x + 395, y: 345 + k * 80 } };
  },
};

/** A question mark in pen, centred at (x, y). */
export const QMark: React.FC<{ x: number; y: number; s?: number; color?: string; tilt?: number }> = ({ x, y, s = 1, color = PEN, tilt = 8 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M-13 -16 Q-13 -32 3 -32 Q19 -32 19 -18 Q19 -8 7 -3 Q1 0 1 9" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={1} cy={21} r={4.5} fill={color} />
  </g>
);

/** Pencil handwriting standing for a line of working: short ink bars of varying length. */
const Writing: React.FC<{ x: number; y: number; len: number; shown: number; seed: number }> = ({ x, y, len, shown, seed }) => {
  const parts = Array.from({ length: 5 }, (_, i) => 0.12 + noise(seed * 9 + i) * 0.16);
  const total = parts.reduce((a, b) => a + b, 0) + 0.05 * parts.length;
  let at = 0;
  return (
    <g>
      {parts.map((p, i) => {
        const from = at;
        at += p + 0.05;
        const vis = Math.max(0, Math.min(p, shown * total - from));
        return vis > 0 ? <rect key={i} x={x + (from / total) * len} y={y - 7} width={(vis / total) * len} height={14} rx={7} fill="#4a4d58" opacity={0.85} /> : null;
      })}
    </g>
  );
};

const TopBack: React.FC<{ cam: Camera; rows: number; marks: number }> = ({ cam, rows, marks }) => {
  const n = TOP.rows * 2;
  return (
    <>
      <Deep cam={cam} depth={0.85} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#4e3a2b" />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M-1400 ${-300 + i * 90} Q600 ${-280 + i * 90 + noise(i) * 30} 3400 ${-300 + i * 90}`} fill="none" stroke="#3e2e22" strokeWidth={8} opacity={0.6} />
        ))}
        {/* the front partition and the right one, the lamp's head from above, the pool of light */}
        <defs>
          <radialGradient id="rr-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={POOL} stopOpacity={0.55} />
            <stop offset="0.6" stopColor={POOL} stopOpacity={0.18} />
            <stop offset="1" stopColor={POOL} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={960} cy={560} rx={900} ry={620} fill="url(#rr-pool)" />
        <rect x={-1400} y={-800} width={4800} height={880} fill={PANEL} />
        <rect x={-1400} y={60} width={4800} height={24} fill="#4d5955" stroke={INK} strokeWidth={4} />
        <rect x={1700} y={-800} width={1700} height={2400} fill={PANEL} />
        <rect x={1690} y={60} width={24} height={1600} fill="#4d5955" stroke={INK} strokeWidth={4} />
        <circle cx={1560} cy={150} r={86} fill={SHADE} stroke={INK} strokeWidth={6} />
        <circle cx={1560} cy={150} r={44} fill="#fff6dc" />
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the notebook: navy cover under two cream pages, a ruled grid, the spine's shadow */}
        <rect x={418} y={250} width={984} height={684} rx={14} fill={MINJUN.coat} stroke={INK} strokeWidth={6} />
        {[TOP.left, TOP.right].map((p, k) => (
          <g key={k}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
            {Array.from({ length: 15 }, (_, i) => <line key={i} x1={p.x + 14} y1={p.y + 35 + i * 40} x2={p.x + p.w - 14} y2={p.y + 35 + i * 40} stroke="#9fc0e0" strokeWidth={2} opacity={0.6} />)}
            <line x1={p.x + 30} y1={p.y + 10} x2={p.x + 30} y2={p.y + p.h - 10} stroke="#e6a0a0" strokeWidth={3} opacity={0.6} />
          </g>
        ))}
        <rect x={895} y={262} width={30} height={656} fill="#000" opacity={0.12} />
        {Array.from({ length: n }, (_, r) => {
          const row = TOP.row(r);
          const shown = Math.min(1, Math.max(0, rows * n - r));
          const marked = marks * n - r > 0;
          return (
            <g key={r}>
              <circle cx={row.x - 2} cy={row.y} r={10} fill="none" stroke="#4a4d58" strokeWidth={3} opacity={shown > 0 ? 0.8 : 0} />
              <Writing x={row.x + 22} y={row.y} len={row.len} shown={shown} seed={r} />
              {marked && <QMark x={row.mark.x} y={row.mark.y} s={0.9} tilt={6 + noise(r) * 8} />}
            </g>
          );
        })}
        {/* his pen and an eraser by the notebook */}
        <g transform="translate(1500 760) rotate(-28)">
          <rect x={-150} y={-10} width={300} height={20} rx={10} fill={PEN} stroke={INK} strokeWidth={4} />
          <path d="M150 -10 L186 0 L150 10Z" fill="#e8e0cc" stroke={INK} strokeWidth={3} />
        </g>
        <rect x={250} y={740} width={110} height={60} rx={10} fill="#e6a0a0" stroke={INK} strokeWidth={4} transform="rotate(12 305 770)" />
      </Deep>
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the room (plan)

/** Lanes of desks from above: each lane's desk strip y, and the seats' x. */
export const PLAN = {
  lanes: [-120, 140, 400, 660, 920, 1180],
  /** Your lane. */
  you: 3,
  seats: Array.from({ length: 18 }, (_, c) => -1250 + c * 260),
  /** Your seat (x) in your lane, and Min-jun's beside it. */
  yourSeat: 960,
  hisSeat: 1220,
};

/** A person seen from straight above: shoulders and a head (the nobody film's office plan). `bent` adds the shadow of
 *  a head bowed over a desk. */
export const TopDownHead: React.FC<{ x: number; y: number; head: string; turn?: number; scale?: number; coat?: string; hair?: string; tuft?: boolean }> = ({
  x, y, head, turn = 0, scale = 1, coat = "#3b3e47", hair, tuft,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
    <ellipse cx={0} cy={10} rx={62} ry={30} fill={coat} stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={0} r={38} fill={head} stroke={INK} strokeWidth={4} />
    {hair && <path d="M-34 -14 A38 38 0 0 1 34 -14 Q0 4 -34 -14Z" fill={hair} />}
    {tuft && <path d="M-6 -36 Q-4 -60 12 -58 Q4 -48 8 -36Z" fill={INK} />}
    <path d="M-24 10 Q0 30 24 10" fill="none" stroke="#000" strokeWidth={6} opacity={0.12} />
  </g>
);

const PlanBack: React.FC<{ cam: Camera; lane: number; others: number }> = ({ cam, lane, others }) => (
  <Deep cam={cam} depth={1}>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#22232c" />
    {PLAN.lanes.map((ly, l) => (
      <g key={l}>
        <rect x={-1400} y={ly - 40} width={4800} height={80} fill={WOOD} stroke={INK} strokeWidth={4} />
        {PLAN.seats.map((sx, c) => {
          const on = (l === lane && (sx === PLAN.yourSeat || sx === PLAN.hisSeat)) || noise(l * 31 + c * 7) < 0.4;
          const person = on && noise(l * 13 + c) < 0.55 && !(l === lane && (sx === PLAN.yourSeat || sx === PLAN.hisSeat));
          return (
            <g key={c}>
              <rect x={sx + 118} y={ly - 120} width={14} height={160} fill={PANEL} stroke={INK} strokeWidth={3} />
              {on && <circle cx={sx} cy={ly - 6} r={115} fill={POOL} opacity={0.32} />}
              {on && <circle cx={sx + 70} cy={ly - 22} r={22} fill={SHADE} stroke={INK} strokeWidth={3} />}
              <circle cx={sx} cy={ly + 92} r={34} fill="#4a3b33" stroke={INK} strokeWidth={3} />
              {person && <TopDownHead x={sx} y={ly + 78} head={PASTELS[(l * 5 + c) % PASTELS.length]} scale={0.8} turn={180} hair="#2a2730" />}
              {on && !person && noise(c + l) > 0.5 && <rect x={sx - 40} y={ly - 28} width={80} height={50} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />}
            </g>
          );
        })}
        {l === lane && <rect x={PLAN.hisSeat - 60} y={ly - 32} width={120} height={60} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />}
        {l !== lane && others < 1 && <rect x={-1400} y={ly - 130} width={4800} height={260} fill="#0d0e14" opacity={(1 - others) * 0.78} />}
      </g>
    ))}
  </Deep>
);

// ------------------------------------------------------------------------------------------------ the set

/** Everything behind the actors for a view. */
export const ReadingRoomBack: React.FC<{
  cam: Camera; view: ReadingView;
  /** rows: near-row carrels whose lamp is on; chairOut: chairs pushed back from the desk; farPeople 0..1. */
  lit?: number[]; chairOut?: number[]; farPeople?: number;
  /** top: how much of the rows and the "?" marks are on the page, 0..1. */
  rows?: number; marks?: number;
  /** plan: the lane in focus and how lit the others stay, 0..1. */
  lane?: number; others?: number;
}> = ({ cam, view, lit = DEFAULT_LIT, chairOut = [READING.minjun], farPeople = 0.45, rows = 1, marks = 1, lane = PLAN.you, others = 1 }) => {
  if (view === "top") return <TopBack cam={cam} rows={rows} marks={marks} />;
  if (view === "plan") return <PlanBack cam={cam} lane={lane} others={others} />;
  return <RowsBack cam={cam} lit={lit} chairOut={chairOut} farPeople={farPeople} />;
};

/** A soft dark partition edge in the near foreground at the left (rows view), for over-the-shoulder framings. */
export const ReadingRoomFront: React.FC<{ cam: Camera; x?: number }> = ({ cam, x = -60 }) => (
  <Deep cam={cam} depth={1.4}>
    <rect x={x} y={200} width={90} height={1200} fill="#15161d" />
    <rect x={x + 70} y={200} width={20} height={1200} fill="#2e3532" />
  </Deep>
);

/** Screen glows for the lamps the camera sees in a view (add them to the mood's Look). */
export function readingGlows(cam: Camera, view: ReadingView, lit: number[] = DEFAULT_LIT): Glow[] {
  if (view === "top") {
    const p = toScreen(cam, 1100, 520);
    return [{ x: p.x, y: p.y, r: 900 * cam.zoom, color: POOL, strength: 0.35 }];
  }
  if (view === "plan") return [];
  return lit.map((i) => {
    const c = READING.carrel(i);
    const p = toScreen(cam, c.lamp.x, c.lamp.y + 60);
    return { x: p.x, y: p.y, r: 260 * cam.zoom, color: POOL, strength: 0.42 };
  }).filter((g) => g.x > -400 && g.x < 2320 && g.y > -400 && g.y < 1480);
}

/** A look with extra glows on top (the film's mood stays). */
export const withGlows = (look: Look, glows: Glow[]): Look => ({ ...look, glows: [...(look.glows ?? []), ...glows] });

export { REF };
