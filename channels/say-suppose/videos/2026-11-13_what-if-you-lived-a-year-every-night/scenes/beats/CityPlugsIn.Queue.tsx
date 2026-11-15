// The City Plugs In, "a waiting list to the harbour": the hotel's front at night (round porthole windows, the crimson
// counter strip over the door, no lettering), the old sleeper at the head of a queue that runs down the street, round
// the corner and up the quay road towards the harbour cranes. The camera pans the queue from the door to the cranes.
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { Deep } from "../sets/common";
import { camAt, noise, OLD, PASTELS } from "../shared";
import { OwnSet, Person, type Body } from "./CityPlugsIn.Kit";

const FLOOR = 960;
const DOOR = 420;
const COATS = ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#3b3e47", "#6a5a4c", "#2f4a5a", "#56496b"];
/** The corner where the street meets the quay road, and how far up the road the queue goes. */
const CORNER = 2380;
const NEAR = 20;
const FAR = 18;

/** Where queuer i stands: along the pavement, then up the quay road into the distance, smaller each step. */
function spot(i: number): { x: number; y: number; scale: number } {
  if (i < NEAR) return { x: DOOR + 110 + i * 98, y: FLOOR, scale: 0.95 };
  const u = i - NEAR + 1;
  const scale = 0.95 * Math.pow(0.88, u);
  return { x: CORNER + u * 30 + (1 - Math.pow(0.88, u)) * 400, y: FLOOR - (1 - Math.pow(0.88, u)) * 300, scale };
}

/** A harbour crane in silhouette: an A-frame, a boom over the water, a cab and a blinking crimson light. */
const Crane: React.FC<{ x: number; y: number; s: number; frame: number; seed: number }> = ({ x, y, s, frame, seed }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#2c3552" strokeWidth={14} strokeLinecap="round">
    <path d="M-60 0 L-20 -320 L20 -320 L60 0 M-48 -100 L48 -100 M-36 -200 L36 -200" />
    <path d="M-160 -320 L260 -320 M-20 -320 L0 -420 L20 -320 M0 -420 L260 -320 M0 -420 L-160 -320" strokeWidth={10} />
    <rect x={-30} y={-360} width={60} height={40} fill="#2c3552" stroke="none" />
    <line x1={180} y1={-320} x2={180} y2={-200} strokeWidth={4} />
    {(frame + seed * 13) % 40 < 20 && <circle cx={0} cy={-430} r={10} fill={CRIMSON} stroke="none" />}
  </g>
);

/** Far: night sky, the harbour water and the cranes (depth 0.4). */
const Harbour: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-1400} y={-900} width={6000} height={2900} fill="#151a2a" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={-400 + noise(i) * 4200} cy={-200 + noise(i + 50) * 600} r={2 + noise(i + 9) * 2} fill="#f3e9d7" opacity={0.5} />)}
    <rect x={1500} y={620} width={2600} height={500} fill="#1f2a44" />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={1560 + i * 180 + (frame % 60)} y1={650 + (i % 3) * 22} x2={1640 + i * 180 + (frame % 60)} y2={650 + (i % 3) * 22} stroke="#3a4a6e" strokeWidth={5} />)}
    <Crane x={1900} y={630} s={0.9} frame={frame} seed={1} />
    <Crane x={2300} y={630} s={1.05} frame={frame} seed={2} />
    <Crane x={2720} y={630} s={0.85} frame={frame} seed={3} />
    {/* stacked containers on the quay */}
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1700 + i * 120} y={590 - (i % 3) * 26} width={110} height={30 + (i % 3) * 26} fill={["#5c3f4a", "#2f4a5a", "#6a5a4c"][i % 3]} stroke={INK} strokeWidth={3} />)}
  </g>
);

/** Middle: the street's other buildings, dark with a few warm windows (depth 0.8). */
const Street: React.FC = () => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const x = 760 + i * 190;
      const top = 260 + (i % 3) * 70;
      return (
        <g key={i}>
          <rect x={x} y={top} width={180} height={880 - top} fill={i % 2 ? "#232a40" : "#2a3049"} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, w) => (
            <rect key={w} x={x + 22 + (w % 3) * 50} y={top + 30 + Math.floor(w / 3) * 90} width={34} height={46} rx={4}
              fill={noise(i * 8 + w) > 0.55 ? "#ffc46b" : "#3a4363"} stroke={INK} strokeWidth={3} />
          ))}
        </g>
      );
    })}
  </g>
);

/** Near: the hotel's front, the pavement, the road and the quay road turning off towards the harbour (depth 1). */
const Front: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-1400} y={880} width={6000} height={900} fill="#2a2d38" />
    <rect x={-1400} y={880} width={CORNER + 1500} height={110} fill="#3a3e4c" />
    <polygon points={`${CORNER - 60},990 ${CORNER + 300},990 ${CORNER + 1000},650 ${CORNER + 860},650`} fill="#3a3e4c" />
    <rect x={-700} y={160} width={1300} height={724} fill="#262d45" stroke={INK} strokeWidth={8} />
    {[-560, -320, -80, 160].map((x, i) => (
      <g key={x}>
        {[300, 520].map((y) => (
          <g key={y}>
            <circle cx={x + 80} cy={y} r={60} fill="#ffc46b" stroke={INK} strokeWidth={8} />
            <circle cx={x + 80} cy={y} r={60} fill="#fff6dc" opacity={0.3 + 0.2 * Math.sin(frame / 9 + i + y)} />
          </g>
        ))}
      </g>
    ))}
    <rect x={DOOR - 90} y={600} width={180} height={284} rx={10} fill="#ffd98a" stroke={INK} strokeWidth={8} />
    <rect x={DOOR - 100} y={540} width={200} height={50} rx={8} fill={INK} stroke="#3a4363" strokeWidth={4} />
    {[0, 1, 2].map((k) => <rect key={k} x={DOOR - 82 + k * 58} y={548} width={48} height={34} rx={5} fill={CRIMSON} stroke="#f3e9d7" strokeWidth={2} />)}
  </g>
);

const IDLE: Pose = { ...STAND, armF: [14, 20], armB: [-4, 12] };

export const QueueShot: React.FC<{ frame: number; start: number; end: number }> = ({ frame, start, end }) => {
  const cam: Camera = drift(camAt(frame, [[start, { x: 820, y: 640, zoom: 1.05 }], [start + 10, { x: 860, y: 640, zoom: 1.05 }],
    [end - 18, { x: 2560, y: 620, zoom: 0.95 }], [end, { x: 2600, y: 620, zoom: 0.95 }]]), frame, "cp-queue", 3);
  const n = NEAR + FAR;
  const queue = Array.from({ length: n }, (_, k) => n - 1 - k).map((i) => {
    const s = spot(i);
    const sway = Math.sin(frame / 14 + i) * 3;
    const watch = noise(i + 7) > 0.8 && i > 0;
    const body: Body = { x: s.x, y: s.y, scale: s.scale, facing: -1, pose: { ...IDLE, lean: sway, armF: watch ? [120, 40] : IDLE.armF } };
    if (i === 0) {
      return <Person key={i} body={body} frame={frame} seed={i} who={{ ...OLD, lids: 0.86, mouth: "flat", look: { x: 1, y: 0.1 } }} />;
    }
    const yawn = (frame + i * 17) % 120 < 18 && noise(i) > 0.5;
    return (
      <Person key={i} body={body} frame={frame} seed={i}
        who={{ head: PASTELS[i % PASTELS.length], coat: COATS[i % COATS.length], lids: 0.3 + noise(i + 2) * 0.3, mouth: yawn ? "o" : "flat",
          look: watch ? { x: 0.6, y: 0.6 } : { x: 1, y: 0 } }} />
    );
  });
  return (
    <OwnSet mood="night" cam={cam} back={
      <g>
        <Deep cam={cam} depth={0.4} flat><Harbour frame={frame} /></Deep>
        <Deep cam={cam} depth={0.8}><Street /></Deep>
        <Front frame={frame} />
      </g>
    }>
      {queue}
    </OwnSet>
  );
};
