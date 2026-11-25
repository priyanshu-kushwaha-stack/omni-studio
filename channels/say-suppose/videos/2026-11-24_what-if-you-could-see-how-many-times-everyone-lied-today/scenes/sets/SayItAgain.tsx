// Sets drawn for the SayItAgain beat (no library set fits): a garage with your car up on a two-post lift (drawn once,
// visited twice: `second` swaps the paint and the sign, the lift stays the same kind), your stairwell with the upper
// landing, and a restaurant at dusk with your table and the next one. Drawn for REF in paper layers (Deep), lit by the
// mood. No words on the walls.
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Chair, Deep, Floor, OUTSIDE, Sky, Skyline, TubeLight, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";

type P = { cam: Camera; mood: MoodName; frame: number };

export const GARAGE = { floor: 970, mech: { x: 960, y: 975, scale: 1.15 }, you: { x: 380, y: 985, scale: 1.2 }, door: 260 };

/** Your car side on, up on the lift. Body bottom at y. */
const Car: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 V-90 Q0 -110 30 -116 L150 -130 L250 -220 H470 L570 -130 L660 -118 Q700 -110 700 -80 V0Z" fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M270 -206 H360 V-136 H200Z" fill="#cfe9f4" stroke={INK} strokeWidth={5} />
    <path d="M380 -206 H460 L540 -136 H380Z" fill="#cfe9f4" stroke={INK} strokeWidth={5} />
    <rect x={20} y={-70} width={44} height={22} rx={6} fill="#fff1b8" stroke={INK} strokeWidth={4} />
    {[150, 560].map((w) => (
      <g key={w}><circle cx={w} cy={8} r={58} fill={INK} /><circle cx={w} cy={8} r={24} fill="#9aa1ab" /></g>
    ))}
    <rect x={240} y={-60} width={120} height={10} rx={5} fill={INK} opacity={0.5} />
  </g>
);

/** The garage: open roller door on the street, a pegboard of tools, the lift's two posts with the car up on its arms. */
export const GarageBack: React.FC<P & { second?: boolean }> = ({ cam, mood, second }) => {
  const wall = second ? "#c9b48a" : "#b9c7c9";
  const stripe = second ? CRIMSON : TEAL;
  return (
    <>
      <Deep cam={cam} depth={0.35} flat>
        <Sky id={second ? "gar2" : "gar1"} mood={mood} x={-1400} y={-800} w={4800} h={1500} sunAt={{ x: 200, y: 200 }} />
        <Skyline mood={mood} from={-1400} to={1400} base={700} tall={300} seed={second ? 3 : 1} />
      </Deep>
      <Deep cam={cam} depth={0.7}>
        <path d={`M-1400 -800 H3400 V1600 H-1400Z M-260 160 H${GARAGE.door + 300} V880 H-260Z`} fillRule="evenodd" fill={wall} />
        <rect x={-260} y={140} width={GARAGE.door + 560} height={46} fill="#8a94a0" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={-260} y={186 + i * 14} width={GARAGE.door + 560} height={6} fill="#6b7280" />)}
        <rect x={-1400} y={700} width={4800} height={40} fill={stripe} opacity={0.85} />
        {/* the pegboard: spanners and a hammer as shapes */}
        <rect x={1840} y={260} width={420} height={300} rx={6} fill="#c7884f" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={1870 + i * 64} y={300 + (i % 2) * 20} width={14} height={160 - (i % 3) * 30} rx={7} fill="#5c6675" />)}
        <TubeLight x={1100} y={90} w={360} on={OUTSIDE[mood].dark} />
        {/* the sign over the bay: a spanner badge, no words */}
        <circle cx={1400} cy={200} r={70} fill={stripe} stroke={INK} strokeWidth={6} />
        <path d="M1360 240 L1440 160 M1430 150 a22 22 0 1 0 22 22" stroke={PAPER} strokeWidth={14} fill="none" strokeLinecap="round" />
        <rect x={2300} y={560} width={120} height={300} rx={10} fill={second ? "#5c6675" : CRIMSON} stroke={INK} strokeWidth={5} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={GARAGE.floor - 30} fill="#8a8578" gap={220} slant={-80} opacity={0.08} />
        <ellipse cx={1500} cy={GARAGE.floor + 30} rx={180} ry={22} fill="#3b3e47" opacity={0.35} />
        {/* the lift: two posts and arms, the car up on them */}
        {[1060, 1880].map((x) => (
          <g key={x}>
            <rect x={x - 26} y={240} width={52} height={GARAGE.floor - 230} fill="#d9a63a" stroke={INK} strokeWidth={6} />
            <rect x={x - 46} y={GARAGE.floor - 10} width={92} height={20} fill="#6b7280" stroke={INK} strokeWidth={4} />
          </g>
        ))}
        <rect x={1060} y={526} width={820} height={20} fill="#9aa1ab" stroke={INK} strokeWidth={5} />
        <Car x={1120} y={510} color={second ? "#7fa0c4" : "#7fa0c4"} />
      </Deep>
    </>
  );
};

export const STAIRS = {
  ground: 990,
  landing: 600,
  landlord: { x: 1380, y: 604, scale: 0.98 },
  kid: { x: 1180, y: 995, scale: 0.7 },
  mum: { x: 1460, y: 995, scale: 1.05 },
  you: { x: 430, y: 1005, scale: 1.18 },
};

/** Your stairwell: the flight up to the landing on the right, a door on the landing, the downstairs flat's door below. */
export const StairwellBack: React.FC<P> = ({ cam, mood }) => {
  const dark = OUTSIDE[mood].dark;
  const s = STAIRS;
  const steps = Array.from({ length: 10 }, (_, i) => {
    const x = 560 + i * 60;
    const y = s.ground - 20 - i * 39;
    return `M${x} ${y} h60 v-39`;
  }).join(" ");
  return (
    <>
      <Deep cam={cam} depth={0.6} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#a89a82" : "#d9cbb0"} />
        <rect x={-1400} y={720} width={4800} height={300} fill={dark ? "#8f826c" : "#c4b496"} />
        {/* a high window onto the light well */}
        <rect x={180} y={120} width={240} height={300} fill={dark ? "#2a2f5a" : "#cfe8ee"} stroke="#7a5a40" strokeWidth={12} />
        <line x1={300} y1={120} x2={300} y2={420} stroke="#7a5a40" strokeWidth={8} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={s.ground - 20} fill="#9b8a72" gap={180} slant={0} opacity={0.06} />
        {/* the downstairs flat's door under the landing */}
        <rect x={1240} y={s.landing + 60} width={500} height={s.ground - s.landing - 80} fill="#8f826c" />
        <rect x={1560} y={720} width={170} height={s.ground - 740} rx={6} fill="#6b4b3a" stroke={INK} strokeWidth={5} />
        <circle cx={1580} cy={860} r={8} fill={MUSTARD} />
        {/* the landing slab and its door */}
        <rect x={1160} y={s.landing} width={900} height={60} fill="#cfc2a6" stroke={INK} strokeWidth={5} />
        <rect x={1600} y={s.landing - 300} width={170} height={300} rx={6} fill="#7a5a40" stroke={INK} strokeWidth={5} />
        <rect x={1640} y={s.landing - 260} width={90} height={40} rx={4} fill={PAPER} opacity={0.5} />
        {/* the flight: a stringer and the treads */}
        <path d={`M560 ${s.ground - 20} L1160 ${s.landing} V${s.landing + 60} L620 ${s.ground - 20}Z`} fill="#bfb090" stroke={INK} strokeWidth={5} />
        <path d={`M560 ${s.ground - 20} ${steps}`} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M560 ${s.ground - 140} L1160 ${s.landing - 120} H1500`} fill="none" stroke="#6b4b3a" strokeWidth={10} strokeLinecap="round" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={600 + i * 75} y1={s.ground - 160 - i * 49} x2={600 + i * 75} y2={s.ground - 40 - i * 49} stroke="#6b4b3a" strokeWidth={6} />)}
        <rect x={180} y={600} width={120} height={180} rx={6} fill="#9fb3c4" stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((r) => <rect key={r} x={196} y={616 + r * 54} width={88} height={40} rx={4} fill="#c9ced6" />)}
      </Deep>
    </>
  );
};

export const DINER = {
  floor: 980,
  table: { from: 720, to: 1200, top: 800 },
  seatTop: 850,
  you: { x: 600, scale: 1.12 },
  date: { x: 1330, scale: 1.12 },
  next: { from: 2000, to: 2400, top: 800, woman: 1880, man: 2520, scale: 1.02 },
  phone: { x: 880, y: 794 },
};

/** A small table for two with a cloth, a candle and two glasses, centred between `from` and `to`. */
const Table: React.FC<{ from: number; to: number; top: number; frame: number; glasses?: boolean }> = ({ from, to, top, frame, glasses = true }) => {
  const mid = (from + to) / 2;
  const flick = Math.sin(frame / 3) * 2;
  return (
    <g>
      <rect x={from} y={top} width={to - from} height={22} rx={6} fill={PAPER} stroke={INK} strokeWidth={5} />
      <path d={`M${from} ${top + 20} H${to} L${to - 20} ${top + 110} H${from + 20}Z`} fill="#efe3c8" stroke={INK} strokeWidth={4} />
      <rect x={mid - 8} y={top + 110} width={16} height={DINER.floor - top - 120} fill="#5b4636" />
      <rect x={mid - 60} y={DINER.floor - 20} width={120} height={14} rx={6} fill="#5b4636" />
      <rect x={mid - 9} y={top - 70} width={18} height={70} rx={4} fill="#f7f1e2" stroke={INK} strokeWidth={3} />
      <path d={`M${mid} ${top - 104 + flick} q-12 18 0 32 q12 -14 0 -32Z`} fill="#ffcf5a" />
      {glasses && [mid - 120, mid + 110].map((g) => (
        <g key={g}>
          <path d={`M${g - 16} ${top - 76} h32 q0 34 -16 40 q-16 -6 -16 -40Z`} fill="#e9f3f4" opacity={0.8} stroke={INK} strokeWidth={3} />
          <path d={`M${g - 12} ${top - 62} h24 q-2 18 -12 22 q-10 -4 -12 -22Z`} fill="#9b2335" />
          <line x1={g} y1={top - 36} x2={g} y2={top} stroke={INK} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

/** The restaurant at dusk: a long window on the evening city, pendant lamps, a plant, the tables. `tables` are drawn by
 *  the scene (RestaurantTables) in the actors' slot so they go over the diners' laps. */
export const RestaurantBack: React.FC<P> = ({ cam, mood }) => {
  const o = OUTSIDE[mood];
  return (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <Sky id="diner" mood={mood} x={-1400} y={-800} w={5200} h={1500} sunAt={{ x: 1500, y: 260 }} />
        <Skyline mood={mood} from={-1400} to={3800} base={720} tall={360} seed={4} />
      </Deep>
      <Deep cam={cam} depth={0.6} flat>
        <path d={`M-1400 -800 H3800 V1600 H-1400Z ${Array.from({ length: 6 }, (_, i) => `M${-500 + i * 700} 150 h560 v520 h-560Z`).join(" ")}`}
          fillRule="evenodd" fill={o.dark ? "#4a3a44" : "#6b4b52"} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-500 + i * 700} y={410} width={560} height={10} fill="#3d2f36" />)}
        <rect x={-1400} y={700} width={5200} height={400} fill="#5a3f44" />
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-1400 + i * 200} y={700} width={8} height={300} fill="#4a333a" />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={DINER.floor - 20} fill="#7a4e3a" gap={140} slant={-60} opacity={0.1} />
        {[960, 2200].map((x) => (
          <g key={x}>
            <line x1={x} y1={-200} x2={x} y2={250} stroke={INK} strokeWidth={4} />
            <path d={`M${x - 70} 310 Q${x} 220 ${x + 70} 310Z`} fill={MUSTARD} stroke={INK} strokeWidth={5} />
            <ellipse cx={x} cy={312} rx={40} ry={10} fill="#fff1b8" />
          </g>
        ))}
        <rect x={1580} y={760} width={90} height={200} rx={10} fill="#a35d3a" stroke={INK} strokeWidth={4} />
        {[-30, 0, 30].map((d) => <ellipse key={d} cx={1625 + d} cy={700} rx={26} ry={80} fill="#5ba06f" transform={`rotate(${d} ${1625 + d} 760)`} />)}
        <Chair x={DINER.you.x - 10} y={DINER.seatTop} facing={1} color="#3d2f36" />
        <Chair x={DINER.date.x + 10} y={DINER.seatTop} facing={-1} color="#3d2f36" />
        <Chair x={DINER.next.woman - 10} y={DINER.seatTop} facing={1} color="#3d2f36" />
        <Chair x={DINER.next.man + 10} y={DINER.seatTop} facing={-1} color="#3d2f36" />
      </Deep>
    </>
  );
};

/** Both tables, in the actors' slot after the diners (over their laps). */
export const RestaurantTables: React.FC<{ frame: number; nextGlasses?: boolean }> = ({ frame, nextGlasses = true }) => (
  <g>
    <Table from={DINER.table.from} to={DINER.table.to} top={DINER.table.top} frame={frame} />
    <Table from={DINER.next.from} to={DINER.next.to} top={DINER.next.top} frame={frame + 11} glasses={nextGlasses} />
  </g>
);

export type { SetProps };
