// The depot at night, for The Rule's phone call (drawn in the beat, not a shared set): an aisle of tall racking with
// orange beams and boxes, lamps hanging from the dark roof, a concrete floor with a yellow lane line, a pallet of
// boxes in front, and a forklift carrying a pallet along the aisle behind Ji-yoon. Drawn for REF, like the sets.
import type { Camera } from "@whatif/kit/stage/Stage";
import type { SetLight } from "@whatif/kit/sets/common";
import { INK, PAPER } from "@whatif/kit/theme";
import { mix, noise } from "../shared";
import { Deep } from "../sets/common";

export const DEPOT = {
  floor: 980,
  /** Ji-yoon's place, facing left (-1), toward the cut from the store. */
  jiyoon: { x: 1120, y: 980, scale: 1.15, facing: -1 as const },
  /** The pallet in front, its top centre. */
  pallet: { x: 1560, y: 900 },
  /** The forklift's lane (on the 0.8 layer): its feet line. */
  lane: 900,
};

export const depotLights = (): SetLight[] => [380, 980, 1580].map((x) => ({ x, y: 120, depth: 0.6, r: 520, color: "#ffd38a", strength: 0.3, moods: ["night", "lamp", "dusk", "day", "morning", "frozen"] }));

/** A box on a shelf or a pallet: kraft card with tape. */
const Box: React.FC<{ x: number; y: number; w: number; h: number; tone?: number }> = ({ x, y, w, h, tone = 0 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={["#c99a62", "#b8874f", "#d6aa72"][tone % 3]} stroke={INK} strokeWidth={4} />
    <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#e8d6a6" opacity={0.7} />
  </g>
);

/** A rack bay: blue uprights, orange beams, boxes on three levels. */
const Rack: React.FC<{ x: number; w: number; seed: number }> = ({ x, w, seed }) => (
  <g>
    {[0, 1, 2, 3].map((lv) => (
      <g key={lv}>
        {lv < 3 && Array.from({ length: 3 }, (_, i) => {
          const bw = w / 3 - 18;
          const bh = 90 + noise(seed + lv * 5 + i) * 50;
          const top = 780 - lv * 240;
          return noise(seed + lv * 11 + i) > 0.15 ? <Box key={i} x={x + 12 + i * (w / 3)} y={top - bh} w={bw} h={bh} tone={lv + i} /> : null;
        })}
        <rect x={x} y={780 - lv * 240} width={w} height={20} fill="#e8792f" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    <rect x={x - 10} y={-60} width={20} height={1000} fill="#3d6fb0" stroke={INK} strokeWidth={4} />
    <rect x={x + w - 10} y={-60} width={20} height={1000} fill="#3d6fb0" stroke={INK} strokeWidth={4} />
  </g>
);

/** A wooden pallet with a stack of boxes, base centre at (x, y). */
export const Pallet: React.FC<{ x: number; y: number; scale?: number; boxes?: number }> = ({ x, y, scale = 1, boxes = 3 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-120} y={-28} width={240} height={14} fill="#a8774a" stroke={INK} strokeWidth={4} />
    <rect x={-120} y={-10} width={240} height={10} fill="#a8774a" stroke={INK} strokeWidth={4} />
    {[-110, -8, 94].map((bx) => <rect key={bx} x={bx} y={-16} width={16} height={8} fill="#7a5232" />)}
    {Array.from({ length: boxes }, (_, i) => <Box key={i} x={-110 + (i % 2) * 112} y={-28 - 90 * (Math.floor(i / 2) + 1)} w={108} h={90} tone={i} />)}
  </g>
);

/** A counterbalance forklift carrying a pallet, base at (x, y), forks to the right when `facing` is 1. */
export const Forklift: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; driver?: string }> = ({ x, y, scale = 1, facing = 1, driver = "#7fa0c4" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    {/* the mast and forks with the pallet */}
    <rect x={120} y={-300} width={18} height={300} fill="#3b3e47" stroke={INK} strokeWidth={4} />
    <rect x={138} y={-24} width={150} height={12} fill="#3b3e47" />
    <Pallet x={214} y={-12} scale={0.62} boxes={2} />
    {/* the body, the overhead guard, the driver */}
    <path d="M-150 -40 L-150 -150 L-40 -150 L-10 -210 L100 -210 L110 -40Z" fill="#f2b632" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-150} y={-120} width={70} height={80} fill="#3b3e47" />
    <path d="M-30 -210 L-30 -330 L110 -330 L110 -210" fill="none" stroke="#3b3e47" strokeWidth={10} />
    <circle cx={30} cy={-250} r={30} fill={driver} stroke={INK} strokeWidth={4} />
    <rect x={10} y={-222} width={44} height={14} rx={7} fill="#e8792f" />
    <circle cx={-90} cy={-30} r={34} fill="#23252b" stroke={INK} strokeWidth={5} />
    <circle cx={60} cy={-30} r={34} fill="#23252b" stroke={INK} strokeWidth={5} />
    <circle cx={-90} cy={-30} r={12} fill="#8a949c" />
    <circle cx={60} cy={-30} r={12} fill="#8a949c" />
    <circle cx={-46} cy={-338} r={10} fill="#e8792f" />
  </g>
);

/** The depot behind Ji-yoon. `lift` 0..1 is the forklift's run along the aisle behind her (left to right). */
export const DepotBack: React.FC<{ cam: Camera; lift: number }> = ({ cam, lift }) => (
  <>
    <Deep cam={cam} depth={0.4} flat>
      <rect x={-1400} y={-900} width={4800} height={2600} fill="#15172a" />
      {Array.from({ length: 12 }, (_, i) => <Rack key={i} x={-1300 + i * 420} w={400} seed={i * 7} />)}
    </Deep>
    <Deep cam={cam} depth={0.6} flat>
      {/* the roof's lamps on their cables */}
      {[380, 980, 1580, -220, 2180].map((x) => (
        <g key={x}>
          <line x1={x} y1={-400} x2={x} y2={90} stroke="#3b3e47" strokeWidth={4} />
          <path d={`M${x - 70} 130 L${x - 40} 90 H${x + 40} L${x + 70} 130Z`} fill="#3b3e47" stroke={INK} strokeWidth={4} />
          <ellipse cx={x} cy={132} rx={60} ry={10} fill="#fff1c4" />
        </g>
      ))}
    </Deep>
    <Deep cam={cam} depth={0.8}>
      <rect x={-1400} y={DEPOT.lane - 10} width={4800} height={900} fill="#4a4c55" />
      <Forklift x={mix(-500, 2500, lift)} y={DEPOT.lane} scale={0.9} driver="#a8c97f" />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={940} width={4800} height={900} fill="#5a5c66" />
      <rect x={-1400} y={1060} width={4800} height={16} fill="#f2b632" opacity={0.85} />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-1400 + i * 320} y1={940} x2={-1500 + i * 320} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
      <Pallet x={DEPOT.pallet.x} y={DEPOT.floor} boxes={4} />
      <rect x={-1400} y={940} width={4800} height={6} fill={PAPER} opacity={0.08} />
    </Deep>
  </>
);
