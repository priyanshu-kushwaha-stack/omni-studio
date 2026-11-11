// A college canteen, side on. From "60 Seconds" (sets.tsx Canteen: the tiled wall, the long bench, the wall TV with the
// cricket on it) and "Nobody Could Say No" (Loan.parts.tsx CanteenBack: the counter, the steel tables). The counter
// with its tea urn and samosa tray at the back, a steel table in front with people on both benches. Seat people
// (`behind` for the far bench); the table (Mid) goes over their laps.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { CRIMSON, INK, PAPER } from "../theme";
import { FRIEND, HERO, SIBLING, VENDOR } from "./cast";
import { Deep, Floor, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, TubeLight, type SetDef, type SetProps } from "./common";
import { ChaiGlass, SteelPlate } from "./props";

const FLOOR = 960;
const TABLE = { from: 560, to: 1240, top: 780 };
const SEAT_TOP = 850;
const COUNTER = { from: 1380, to: 2000, top: 700 };

export interface CanteenOptions {
  /** What the wall TV shows. */
  tv: "cricket" | "off";
  /** The cricket ball's run down the pitch, 0 to 1 (and over 1 it flies for six). */
  ball: number;
  /** Food on the table. */
  food: boolean;
}

const Back: React.FC<SetProps<CanteenOptions>> = ({ cam, mood, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  const six = Math.max(0, options.ball - 1);
  return (
    <>
      <Deep cam={cam} depth={0.65} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#d2c4a2" : "#e8dcc0"} />
        {Array.from({ length: 36 }, (_, i) => <rect key={i} x={-1400 + i * 140} y={560} width={136} height={400} fill={i % 2 ? "#cfe0d6" : "#d9e8df"} />)}
        {/* the wall TV */}
        <g transform="translate(420 300)">
          <rect x={-230} y={-140} width={460} height={280} rx={10} fill={INK} />
          <rect x={-214} y={-124} width={428} height={248} fill={options.tv === "off" ? "#262a36" : "#5aa86a"} />
          {options.tv === "cricket" && (
            <g>
              <rect x={-32} y={-124} width={64} height={248} fill="#d9c896" />
              <rect x={-10} y={-100} width={20} height={14} fill={PAPER} /><rect x={-10} y={86} width={20} height={14} fill={PAPER} />
              <circle cx={six * 160} cy={-90 + Math.min(1, options.ball) * 170 - six * 220} r={8} fill={CRIMSON} />
            </g>
          )}
        </g>
        {/* the menu board: colour blocks and prices as bars, no words */}
        <rect x={1300} y={160} width={560} height={260} rx={8} fill="#2f4a3e" stroke="#6b4b3a" strokeWidth={10} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <circle cx={1350} cy={200 + i * 46} r={12} fill={["#f2b632", "#d8344f", "#9fd8a8", PAPER, "#e6a0a0"][i]} />
            <rect x={1380} y={192 + i * 46} width={260 - (i * 37) % 90} height={14} rx={7} fill={PAPER} opacity={0.8} />
            <rect x={1760} y={192 + i * 46} width={60} height={14} rx={7} fill="#f2b632" opacity={0.9} />
          </g>
        ))}
        {[200, 1100].map((x) => <TubeLight key={x} x={x} y={90} w={300} on={on} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={FLOOR - 20} fill="#bfae8c" gap={200} slant={-100} opacity={0.06} />
        <rect x={TABLE.from - 60} y={SEAT_TOP} width={TABLE.to - TABLE.from + 120} height={16} rx={6} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
        {[TABLE.from - 40, TABLE.to + 30].map((x) => <rect key={x} x={x} y={SEAT_TOP + 16} width={12} height={FLOOR - SEAT_TOP - 36} fill="#6b7280" />)}
      </Deep>
    </>
  );
};

/** The counter over whoever serves, and the steel table over the far bench's laps: samosas, chutney, chai. */
const Mid: React.FC<SetProps<CanteenOptions>> = ({ options }) => (
  <g>
    {/* the counter: steel top, tea urn, samosa tray, glasses (over whoever serves) */}
    <rect x={COUNTER.from} y={COUNTER.top} width={COUNTER.to - COUNTER.from} height={FLOOR - COUNTER.top} fill="#c7884f" stroke={INK} strokeWidth={5} />
    <rect x={COUNTER.from - 10} y={COUNTER.top - 14} width={COUNTER.to - COUNTER.from + 20} height={20} rx={5} fill="#c9ced6" stroke={INK} strokeWidth={4} />
    <rect x={1460} y={COUNTER.top - 150} width={110} height={136} rx={16} fill="#c9ced6" stroke={INK} strokeWidth={5} />
    <rect x={1570} y={COUNTER.top - 60} width={30} height={12} fill={INK} />
    <path d={`M1640 ${COUNTER.top - 14} h190 l-14 -24 h-162Z`} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${1665 + i * 26} ${COUNTER.top - 38} l14 -26 l14 26Z`} fill="#e0a23c" stroke={INK} strokeWidth={2} />)}
    {[1880, 1920].map((x) => <ChaiGlass key={x} x={x} y={COUNTER.top - 14} scale={0.8} />)}
    <rect x={TABLE.from} y={TABLE.top} width={TABLE.to - TABLE.from} height={20} rx={6} fill="#c9ced6" stroke={INK} strokeWidth={5} />
    {[TABLE.from + 40, TABLE.to - 52].map((x) => <rect key={x} x={x} y={TABLE.top + 20} width={12} height={FLOOR - TABLE.top - 40} fill="#6b7280" />)}
    {options.food && (
      <g>
        <SteelPlate x={760} y={TABLE.top - 4} scale={0.7} />
        <SteelPlate x={1040} y={TABLE.top - 4} scale={0.7} />
        <ChaiGlass x={900} y={TABLE.top} scale={0.8} />
        <ChaiGlass x={1160} y={TABLE.top} scale={0.8} fill={0.3} />
      </g>
    )}
  </g>
);

export const canteen: SetDef<CanteenOptions> = {
  name: "canteen",
  about: "college canteen: steel table and benches, the counter with tea urn and samosas, menu board, cricket on the TV",
  spots: {
    benchLeft: seat(640, SEAT_TOP, 1.1, 1),
    benchMid: seat(900, SEAT_TOP, 1.05, -1),
    benchRight: seat(1260, SEAT_TOP, 1.1, -1),
    counter: { x: 1660, y: COUNTER.top + 40, scale: 0.95, facing: -1 },
    standing: { x: 360, y: FLOOR + 10, scale: 1.15, facing: 1 },
  },
  cameras: {
    wide: REF,
    table: { x: 920, y: 640, zoom: 1.5 },
    tv: { x: 420, y: 300, zoom: 2.4 },
  },
  lights: () => [{ x: 650, y: 100, depth: 0.65, r: 700, color: "#fdfbea", strength: 0.28, moods: LIGHTS_ON }],
  defaults: { tv: "cricket", ball: 0.6, food: true },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [
      { spot: "counter", who: { ...VENDOR, look: { x: 0.6, y: 0 } }, face: EXPRESSIONS.happy, behind: true, pose: { ...STAND, armF: [80, 20] } },
      { spot: "benchMid", who: { ...SIBLING, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy, behind: true },
      { spot: "benchLeft", who: { ...HERO, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.shocked },
      { spot: "benchRight", who: { ...FRIEND, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.sceptical },
    ],
  },
};
