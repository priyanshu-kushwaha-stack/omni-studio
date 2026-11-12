// The walk home (The Rule, builder a): a covered walkway at night beside the main road, its roof on thin posts, a
// railing, and a lamppost every twenty paces, each with the city's teal lamp clipped under its arm and a split-flap
// rate board on the post. Beyond the railing the main road with its traffic and, far off, a gantry over it with a price
// lit on it; the city's towers behind. Drawn for REF in paper layers, long in x so two figures can walk through it.
// No lettering anywhere: the gantry and the boards carry digits only.
//
//   <Stage cam={cam} back={<WalkwayBack cam={cam} frame={f} />} actors={<>...figures...<Lampposts .../></>} />
//   lights for setLook: walkwayLights
import { Deep, Sky, Skyline, type SetLight } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { RateBoard, TealLamp, type BoardKey } from "../device";

/** Where things are, at REF. Figures walk on FLOOR. Lampposts stand at LAMPS.x0 + i * LAMPS.gap. */
export const WALKWAY = {
  floor: 1000,
  scale: 2.0,
  lamps: { x0: -400, gap: 900, n: 12, top: 150 },
  /** The gantry over the main road, far off (a depth 0.45 layer): its beam's centre. */
  gantry: { x: 2500, y: 520, depth: 0.45 },
} as const;

/** The i-th lamppost's x, and its lamp and board, at REF in the actors' plane. */
export const lampX = (i: number) => WALKWAY.lamps.x0 + i * WALKWAY.lamps.gap;
export const lampAt = (i: number) => ({ x: lampX(i) + 70, y: WALKWAY.lamps.top + 58 });
export const boardAt = (i: number) => ({ x: lampX(i), y: 420 });
/** The lamppost nearest to x. */
export const nearestLamp = (x: number) => Math.max(0, Math.min(WALKWAY.lamps.n - 1, Math.round((x - WALKWAY.lamps.x0) / WALKWAY.lamps.gap)));

const X0 = -2400;
const X1 = 11000;

/** Cars on the main road: headlights one way, tail lights the other. */
const Traffic: React.FC<{ frame: number; y: number }> = ({ frame, y }) => (
  <g>
    {Array.from({ length: 16 }, (_, i) => {
      const dir = i % 2 ? 1 : -1;
      const span = X1 - X0;
      const x = ((((i * 911) + frame * (7 + (i % 3)) * dir) % span) + span) % span + X0;
      const ly = y + (dir === 1 ? 6 : 34);
      return (
        <g key={i}>
          <rect x={x - 70} y={ly - 26} width={140} height={34} rx={12} fill={["#3d4a78", "#5f3d6b", "#2f5f63", "#6b5a33"][i % 4]} stroke={INK} strokeWidth={4} />
          <rect x={x - 40} y={ly - 46} width={80} height={24} rx={8} fill="#2a2d36" stroke={INK} strokeWidth={4} />
          <circle cx={x + dir * 66} cy={ly - 8} r={7} fill={dir === 1 ? "#fff3c2" : "#ff5a5a"} />
          {dir === 1 && <path d={`M${x + 70} ${ly - 14} l120 -16 v40z`} fill="#fff3c2" opacity={0.12} />}
        </g>
      );
    })}
  </g>
);

/** The gantry over the road: two legs, a beam, a lit panel with a price in split-flap digits. */
export const Gantry: React.FC<{ frame: number; x: number; y: number; keys: BoardKey[] }> = ({ frame, x, y, keys }) => (
  <g>
    <rect x={x - 520} y={y - 40} width={24} height={300} fill="#4a5168" stroke={INK} strokeWidth={4} />
    <rect x={x + 496} y={y - 40} width={24} height={300} fill="#4a5168" stroke={INK} strokeWidth={4} />
    <rect x={x - 540} y={y - 70} width={1080} height={44} fill="#5a6278" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={x - 520 + i * 130} y1={y - 70} x2={x - 455 + i * 130} y2={y - 26} stroke={INK} strokeWidth={3} opacity={0.5} />)}
    <rect x={x - 150} y={y - 26} width={300} height={110} rx={8} fill="#141722" stroke={INK} strokeWidth={5} />
    <circle cx={x - 110} cy={y + 29} r={14} fill={TEAL} />
    <RateBoard frame={frame} x={x + 30} y={y - 16} size={60} keys={keys} />
  </g>
);

/** Everything behind the walkway's actors: the sky, the towers, the main road and its gantry, the walkway's roof and
 *  railing. `gantry` sets the price on the gantry. */
export const WalkwayBack: React.FC<{ cam: Camera; frame: number; gantry?: BoardKey[] }> = ({ cam, frame, gantry = [{ at: -1e4, value: "2.00" }] }) => (
  <g>
    <Deep cam={cam} depth={0.05} flat><Sky id="walkway-a" mood="night" x={-1400} y={-900} w={4800} h={1500} sunAt={{ x: 1500, y: 140 }} /></Deep>
    <Deep cam={cam} depth={0.15} flat><Skyline mood="night" from={-1400} to={3600} base={640} tall={480} seed={21} /></Deep>
    <Deep cam={cam} depth={0.28} flat><Skyline mood="night" from={-1400} to={5200} base={680} tall={320} seed={8} /></Deep>
    <Deep cam={cam} depth={WALKWAY.gantry.depth} flat>
      <rect x={X0} y={690} width={X1 - X0} height={160} fill="#262a3a" />
      <rect x={X0} y={690} width={X1 - X0} height={10} fill="#3a4156" />
      {Array.from({ length: 70 }, (_, i) => <rect key={i} x={X0 + i * 200} y={755} width={90} height={8} fill={PAPER} opacity={0.35} />)}
      <Traffic frame={frame} y={760} />
      <Gantry frame={frame} x={WALKWAY.gantry.x} y={WALKWAY.gantry.y} keys={gantry} />
    </Deep>
    <Deep cam={cam} depth={0.9}>
      {/* the railing and the walkway's floor */}
      <rect x={X0} y={WALKWAY.floor - 10} width={X1 - X0} height={800} fill="#3a3d4a" />
      <rect x={X0} y={760} width={X1 - X0} height={14} fill="#6b7080" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 90 }, (_, i) => <rect key={i} x={X0 + i * 150} y={774} width={10} height={WALKWAY.floor - 784} fill="#545868" />)}
    </Deep>
    <Deep cam={cam} depth={0.97}>
      {/* the roof on its posts */}
      <rect x={X0} y={-900} width={X1 - X0} height={940} fill="#1c2033" />
      <rect x={X0} y={30} width={X1 - X0} height={30} fill="#11131e" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={X0 + 200 + i * 350} y={60} width={22} height={WALKWAY.floor - 60} fill="#2a2f44" stroke={INK} strokeWidth={4} />)}
      {Array.from({ length: 40 }, (_, i) => <rect key={`l${i}`} x={X0 + 300 + i * 350} y={44} width={150} height={10} rx={5} fill="#e9f0ea" opacity={0.55} />)}
    </Deep>
    <rect x={X0} y={WALKWAY.floor} width={X1 - X0} height={600} fill="#454957" />
    {Array.from({ length: 70 }, (_, i) => <line key={i} x1={X0 + i * 200} y1={WALKWAY.floor} x2={X0 + i * 200 - 120} y2={WALKWAY.floor + 600} stroke="#000" strokeWidth={3} opacity={0.12} />)}
  </g>
);

/** The lampposts in the actors' plane: a post, an arm, the teal lamp under it, a rate board on the post. `boards`
 *  gives a lamppost's board keys by index (default: a price that never moves). `label` names the boards. */
export const Lampposts: React.FC<{ frame: number; boards?: Record<number, BoardKey[]>; labels?: Record<number, string>; dim?: number }> = ({
  frame, boards = {}, labels = {}, dim = 1,
}) => (
  <g>
    {Array.from({ length: WALKWAY.lamps.n }, (_, i) => {
      const x = lampX(i);
      const lamp = lampAt(i);
      const b = boardAt(i);
      return (
        <g key={i}>
          <rect x={x - 14} y={WALKWAY.lamps.top} width={28} height={WALKWAY.floor - WALKWAY.lamps.top} fill="#3b404e" stroke={INK} strokeWidth={5} />
          <rect x={x - 10} y={WALKWAY.lamps.top - 6} width={110} height={18} rx={6} fill="#3b404e" stroke={INK} strokeWidth={5} />
          <TealLamp frame={frame} x={lamp.x} y={lamp.y} size={20} dim={dim} />
          <RateBoard frame={frame} x={b.x} y={b.y} size={40} label={labels[i]} keys={boards[i] ?? [{ at: -1e4, value: ["2.10", "1.50", "3.00", "0.90"][i % 4] }]} />
        </g>
      );
    })}
  </g>
);

/** The walkway's lights for setLook: the teal lamps (the actors' plane), the far road's glow. */
export const walkwayLights: SetLight[] = Array.from({ length: WALKWAY.lamps.n }, (_, i) => ({
  ...lampAt(i), r: 300, color: "#5fd6c8", strength: 0.32, moods: ["night", "lamp", "dusk"],
}));
