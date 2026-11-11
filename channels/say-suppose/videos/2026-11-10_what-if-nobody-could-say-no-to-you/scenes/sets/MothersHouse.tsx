// Your mother's house (scene_plan.md, "Shared sets"). Two views, each drawn for the REF camera (sets/common.tsx):
//
//   view "gate"   side on: the lane at the left, a low compound wall with a small iron gate, the yard with the tulsi
//                 plant in its pot, the house front with the door and one step at the right. Across the lane (far
//                 back) the neighbours' houses and a far pavement (MOTHER_GATE.farLane) where someone small can walk
//                 by (the stranger, scale about 0.6). Draw <MothersGate open={...}/> in the actors' slot between
//                 the people inside and outside it. The steel tiffin stack is <Tiffin>, for the step or for hands.
//   view "table"  indoors: a window, a calendar, a ceiling fan turning on `frame` (MOTHER_TABLE.fan), the lunch
//                 table. Seat people with CHAIR_SIT (parts2.tsx) at MOTHER_TABLE.you / .her (figure y = seat y),
//                 then draw <LunchTable/> over their legs.
//
// Usage: back={<MothersHouseBack cam={cam} view="gate" frame={frame} />}
// Typical cameras: gate wide REF, the two at the gate { x: 900, y: 640, zoom: 1.6 }, her at the door closeUp(...);
// table wide REF, two-shot { x: 960, y: 620, zoom: 1.5 }, the fan insert(MOTHER_TABLE.fan.x, MOTHER_TABLE.fan.y, 2.5).
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { Deep } from "./common";

export type MothersHouseView = "gate" | "table";

/** Gate view anchors. */
export const MOTHER_GATE = {
  /** Feet line in the lane and the yard (scale about 1.15). */
  floor: 960,
  /** The gate's hinge post (left) and its width; it swings open toward the yard. */
  gate: { x: 760, w: 200 },
  /** You in the lane, outside the gate (facing right). */
  lane: { x: 560, y: 960 },
  /** Her inside the gate (facing left), close enough to hand you something over it. */
  inside: { x: 1080, y: 960 },
  /** Her at the door, on the step (feet). */
  door: { x: 1560, y: 900 },
  /** The step's top centre: the tiffin waits here. */
  step: { x: 1560, y: 900 },
  /** The tulsi pot's top centre. */
  tulsi: { x: 1230, y: 790 },
  /** The far pavement across the lane: y of the feet and the scale that reads as far. */
  farLane: { y: 720, scale: 0.6 },
} as const;

/** Table view anchors. */
export const MOTHER_TABLE = {
  /** Feet line (scale about 1.15). */
  floor: 960,
  /** The table top's span and height. */
  table: { from: 640, to: 1300, top: 790 },
  /** Your chair (figure x, y for CHAIR_SIT, facing right). */
  you: { x: 560, y: 960 },
  /** Her chair (facing left); she stands to serve at herStand. */
  her: { x: 1380, y: 960 },
  herStand: { x: 1180, y: 960 },
  /** The ceiling fan's hub. */
  fan: { x: 960, y: 120 },
  /** Your plate and hers, on the table top. */
  plates: [{ x: 780, y: 784 }, { x: 1160, y: 784 }],
} as const;

/** The steel tiffin stack: three tiers and a handle, base centre at (x, y). `jar` puts the pickle jar on top. */
export const Tiffin: React.FC<{ x?: number; y?: number; scale?: number; jar?: boolean }> = ({ x = 0, y = 0, scale = 1, jar }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[0, 1, 2].map((i) => <rect key={i} x={-40} y={-34 - i * 36} width={80} height={34} rx={8} fill="#c9ced6" stroke={INK} strokeWidth={4} />)}
    <path d="M-30 -112 V-142 H30 V-112" fill="none" stroke="#9aa1ab" strokeWidth={7} />
    {jar && (
      <g transform="translate(0 -142)">
        <rect x={-22} y={-50} width={44} height={50} rx={9} fill="#e9a23c" stroke={INK} strokeWidth={4} opacity={0.95} />
        <rect x={-24} y={-60} width={48} height={14} rx={4} fill="#d8344f" stroke={INK} strokeWidth={3} />
      </g>
    )}
  </g>
);

/** The small iron gate, for the actors' slot. `open` 0..1 swings it (it narrows as it turns toward the yard). */
export const MothersGate: React.FC<{ open?: number }> = ({ open = 0 }) => {
  const { x, w } = MOTHER_GATE.gate;
  const ww = w * Math.cos(open * Math.PI * 0.45);
  const top = 760;
  return (
    <g>
      <rect x={x - 16} y={top - 40} width={32} height={MOTHER_GATE.floor - top + 40} fill="#c9a77a" stroke={INK} strokeWidth={5} />
      <rect x={x + w - 4} y={top - 40} width={32} height={MOTHER_GATE.floor - top + 40} fill="#c9a77a" stroke={INK} strokeWidth={5} />
      <g>
        <rect x={x + 16} y={top} width={ww - 20} height={14} fill="#2f6d68" />
        <rect x={x + 16} y={MOTHER_GATE.floor - 40} width={ww - 20} height={12} fill="#2f6d68" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x + 22 + (i * (ww - 36)) / 5} y={top} width={8} height={MOTHER_GATE.floor - top - 30} fill="#2f6d68" />)}
      </g>
    </g>
  );
};

const GateYard: React.FC<{ cam: Camera }> = ({ cam }) => {
  const g = MOTHER_GATE;
  return (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <rect x={-1400} y={-800} width={4800} height={1700} fill="#bfe0ea" />
      </Deep>
      <Deep cam={cam} depth={0.55} flat>
        {/* the neighbours' houses across the lane */}
        {[-700, -200, 300, 820, 1340, 1860, 2380].map((x, i) => (
          <g key={x}>
            <rect x={x} y={300 + (i % 3) * 40} width={480} height={460} fill={["#e4b48e", "#e6cd98", "#a3c7bf", "#dc9d8f"][i % 4]} />
            <rect x={x + 60} y={380 + (i % 3) * 40} width={110} height={90} rx={6} fill="#6c7f8f" />
            <rect x={x + 290} y={380 + (i % 3) * 40} width={110} height={90} rx={6} fill="#6c7f8f" />
            <rect x={x + 180} y={560 + (i % 3) * 20} width={110} height={200} fill="#7a4a3a" />
          </g>
        ))}
        <rect x={-1400} y={g.farLane.y} width={4800} height={40} fill="#cfc2a6" />
      </Deep>
      <Deep cam={cam} depth={0.85} flat>
        <rect x={-1400} y={g.farLane.y + 30} width={4800} height={200} fill="#b8aa8e" />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={g.floor - 20} width={4800} height={700} fill="#d9cbb0" />
        {/* the yard floor and the low compound wall at the back of the yard */}
        <rect x={g.gate.x} y={g.floor - 20} width={2400} height={700} fill="#cdb98f" />
        <rect x={g.gate.x + g.gate.w + 24} y={720} width={2400} height={g.floor - 740} fill="#e6d7b6" stroke={INK} strokeWidth={5} />
        <rect x={-1400} y={720} width={1400 + g.gate.x - 16} height={g.floor - 740} fill="#e6d7b6" stroke={INK} strokeWidth={5} />
        {/* the house front: wall, door, window, the step */}
        <rect x={1380} y={240} width={1200} height={g.floor - 240} fill="#f0c9a0" stroke={INK} strokeWidth={6} />
        <path d="M1340 250 L1980 150 L2620 250Z" fill="#b5553a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={g.door.x - 90} y={560} width={180} height={g.step.y - 560} fill="#6b3f2a" stroke={INK} strokeWidth={6} />
        <circle cx={g.door.x + 56} cy={740} r={8} fill="#e8c23a" />
        <rect x={1800} y={420} width={220} height={180} rx={8} fill="#6c7f8f" stroke={INK} strokeWidth={6} />
        <path d="M1800 510 H2020 M1910 420 V600" stroke={INK} strokeWidth={6} />
        <rect x={g.step.x - 140} y={g.step.y} width={280} height={g.floor - g.step.y} fill="#bfb3a0" stroke={INK} strokeWidth={5} />
        {/* the tulsi in its raised pot */}
        <path d={`M${g.tulsi.x - 60} ${g.floor} L${g.tulsi.x - 50} ${g.tulsi.y} H${g.tulsi.x + 50} L${g.tulsi.x + 60} ${g.floor}Z`} fill="#d8763f" stroke={INK} strokeWidth={5} />
        <rect x={g.tulsi.x - 62} y={g.tulsi.y - 12} width={124} height={18} rx={4} fill="#c96f2d" stroke={INK} strokeWidth={4} />
        {[-36, -14, 8, 30].map((dx, i) => (
          <g key={dx}>
            <line x1={g.tulsi.x + dx * 0.4} y1={g.tulsi.y - 10} x2={g.tulsi.x + dx} y2={g.tulsi.y - 100 - i * 8} stroke="#3f6b3a" strokeWidth={5} />
            {[0.4, 0.7, 1].map((p) => <ellipse key={p} cx={g.tulsi.x + dx * (0.4 + 0.6 * p)} cy={g.tulsi.y - 10 - (90 + i * 8) * p} rx={14} ry={8} fill="#5ba06f" transform={`rotate(${dx} ${g.tulsi.x + dx * (0.4 + 0.6 * p)} ${g.tulsi.y - 10 - (90 + i * 8) * p})`} />)}
          </g>
        ))}
      </Deep>
    </>
  );
};

/** The lunch table for the actors' slot, over the sitters' legs: a steel plate each, a pot, a jug of water. */
export const LunchTable: React.FC<{ food?: number }> = ({ food = 1 }) => {
  const t = MOTHER_TABLE.table;
  return (
    <g>
      <rect x={t.from} y={t.top} width={t.to - t.from} height={24} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
      <rect x={t.from} y={t.top + 18} width={t.to - t.from} height={60} fill="#e6d7b6" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${t.from + 40 + i * 80} ${t.top + 78} l30 18 l30 -18`} fill="#e6d7b6" stroke={INK} strokeWidth={3} />)}
      <rect x={t.from + 30} y={t.top + 78} width={16} height={MOTHER_TABLE.floor - t.top - 78} fill="#6b4b3a" />
      <rect x={t.to - 46} y={t.top + 78} width={16} height={MOTHER_TABLE.floor - t.top - 78} fill="#6b4b3a" />
      {MOTHER_TABLE.plates.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y} rx={74} ry={12} fill="#c9ced6" stroke={INK} strokeWidth={4} />
          {food > 0 && <ellipse cx={p.x - 10} cy={p.y - 6} rx={34 * food} ry={8 * food} fill="#f3e9d7" />}
          {food > 0 && <ellipse cx={p.x + 34} cy={p.y - 5} rx={16 * food} ry={6 * food} fill="#e0a23c" />}
        </g>
      ))}
      <path d={`M920 ${t.top} Q910 ${t.top - 70} 970 ${t.top - 74} Q1030 ${t.top - 70} 1020 ${t.top}Z`} fill="#c9ced6" stroke={INK} strokeWidth={5} />
      <rect x={1060} y={t.top - 80} width={44} height={80} rx={8} fill="#cfe6ec" opacity={0.85} stroke={INK} strokeWidth={4} />
    </g>
  );
};

const Fan: React.FC<{ frame: number }> = ({ frame }) => {
  const { x, y } = MOTHER_TABLE.fan;
  const a = frame * 9;
  return (
    <g>
      <rect x={x - 5} y={-400} width={10} height={y + 400} fill="#5a5048" />
      {[0, 120, 240].map((b) => <ellipse key={b} cx={x} cy={y} rx={180 * Math.abs(Math.cos(((a + b) * Math.PI) / 180))} ry={14} fill="#8a7a68" transform={`translate(${Math.sin(((a + b) * Math.PI) / 180) * 30} 0)`} />)}
      <ellipse cx={x} cy={y} rx={34} ry={18} fill="#6b5e50" stroke={INK} strokeWidth={4} />
    </g>
  );
};

const Indoors: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.5} flat>
      <rect x={-1400} y={-800} width={4800} height={1720} fill="#e8c9a0" />
      <rect x={-1400} y={640} width={4800} height={280} fill="#d9b48a" />
      <rect x={-1400} y={632} width={4800} height={12} fill="#b98f66" />
      {/* the window on the yard, and the calendar */}
      <rect x={220} y={230} width={340} height={300} rx={8} fill="#bfe0ea" stroke="#7a5a40" strokeWidth={14} />
      <path d="M390 230 V530 M220 380 H560" stroke="#7a5a40" strokeWidth={10} />
      <circle cx={300} cy={470} r={44} fill="#5ba06f" />
      <rect x={1500} y={260} width={170} height={230} rx={4} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={1500} y={260} width={170} height={70} fill="#d8344f" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1516 + (i % 4) * 38} y={350 + Math.floor(i / 4) * 40} width={26} height={22} rx={3} fill="#cdbfa6" />)}
    </Deep>
    <Deep cam={cam} depth={1} flat>
      <Fan frame={frame} />
      <rect x={-1400} y={MOTHER_TABLE.floor - 20} width={4800} height={700} fill="#b5553a" />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400 + i * 200} y1={MOTHER_TABLE.floor - 20} x2={-1400 + i * 200} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
    </Deep>
  </>
);

/** Your mother's house behind the actors. */
export const MothersHouseBack: React.FC<{ cam: Camera; view: MothersHouseView; frame: number }> = ({ cam, view, frame }) =>
  view === "table" ? <Indoors cam={cam} frame={frame} /> : <GateYard cam={cam} />;
