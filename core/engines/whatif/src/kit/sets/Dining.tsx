// A joint family's dining table, side on. From "Nobody Could Say No" (sets/MothersHouse.tsx view "table": the ceiling
// fan, the window, the calendar, the lunch table with steel plates; Loan.parts.tsx: Dev's family dinner under one lamp)
// and "60 Seconds" (sets.tsx Home: the dinner table), widened to eight places: four behind the table, two at the ends,
// and someone standing to serve. Draw the far side (`behind`), then the table (Mid) over their laps, then the ends.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK, PAPER } from "../theme";
import { ELDER, FATHER, HERO, MOTHER, SIBLING } from "./cast";
import { Deep, defineSet, Fan, LIGHTS_ON, lightsOn, OUTSIDE, seatedY, TubeLight, Window, type SetProps } from "./common";
import { Bottle, SteelPlate } from "./props";

const FLOOR = 960;
const TABLE = { from: 560, to: 1400, top: 790 };
const SEAT_TOP = 850;
const FAR = [680, 860, 1040, 1220];

export interface DiningOptions {
  /** Food on the plates, 0 (cleared) to 1. */
  food: number;
  /** The ceiling fan turning. */
  fan: boolean;
  /** The garlanded photograph of a grandparent on the wall. */
  photo: boolean;
}

const Back: React.FC<SetProps<DiningOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.6} flat>
        <rect x={-1400} y={-800} width={4800} height={1800} fill={dark ? "#c9a47c" : "#e8c9a0"} />
        <rect x={-1400} y={640} width={4800} height={300} fill={dark ? "#b38c66" : "#d9b48a"} />
        <rect x={-1400} y={632} width={4800} height={12} fill="#b98f66" />
        <Window id="dining" mood={mood} x={120} y={220} w={340} h={300} />
        {/* the calendar, the photo with its marigold garland, the showcase */}
        <rect x={1540} y={250} width={170} height={230} rx={4} fill={PAPER} stroke={INK} strokeWidth={5} />
        <rect x={1540} y={250} width={170} height={70} fill="#d8344f" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1556 + (i % 4) * 38} y={340 + Math.floor(i / 4) * 40} width={26} height={22} rx={3} fill="#cdbfa6" />)}
        {options.photo && (
          <g>
            <rect x={880} y={200} width={200} height={240} rx={6} fill="#efe6d2" stroke="#6b4b3a" strokeWidth={14} />
            <circle cx={980} cy={290} r={44} fill={ELDER.head} />
            <path d="M920 420 Q980 350 1040 420Z" fill={ELDER.coat} />
            <path d="M880 210 Q980 330 1080 210" fill="none" stroke="#f2a23c" strokeWidth={16} strokeDasharray="14 6" strokeLinecap="round" />
          </g>
        )}
        <rect x={1800} y={330} width={320} height={560} rx={8} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((r) => <rect key={r} x={1820} y={360 + r * 120} width={280} height={96} fill="#cfe6ec" opacity={0.6} />)}
        <TubeLight x={560} y={150} w={280} on={on} />
      </Deep>
      <Deep cam={cam} depth={1} flat>
        {options.fan ? <Fan x={980} y={110} frame={frame} /> : <Fan x={980} y={110} frame={0} />}
        <rect x={-1400} y={FLOOR - 20} width={4800} height={800} fill="#b5553a" />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400 + i * 200} y1={FLOOR - 20} x2={-1400 + i * 200} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
        {/* the far-side chairs' backs, under the table edge */}
        {FAR.map((x) => <rect key={x} x={x - 50} y={SEAT_TOP - 140} width={100} height={140} rx={8} fill="#6b4b3a" stroke={INK} strokeWidth={4} />)}
      </Deep>
    </>
  );
};

/** The table over the far side's laps: a cloth, steel plates and katoris, a pot of dal, rotis, a jug of water. */
const Mid: React.FC<SetProps<DiningOptions>> = ({ options }) => {
  const t = TABLE;
  return (
    <g>
      <rect x={t.from} y={t.top} width={t.to - t.from} height={24} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
      <rect x={t.from} y={t.top + 18} width={t.to - t.from} height={60} fill="#e6d7b6" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${t.from + 40 + i * 80} ${t.top + 78} l30 18 l30 -18`} fill="#e6d7b6" stroke={INK} strokeWidth={3} />)}
      <rect x={t.from + 30} y={t.top + 78} width={16} height={FLOOR - t.top - 78} fill="#6b4b3a" />
      <rect x={t.to - 46} y={t.top + 78} width={16} height={FLOOR - t.top - 78} fill="#6b4b3a" />
      {FAR.map((x) => <SteelPlate key={x} x={x + 40} y={t.top - 4} scale={0.75} food={options.food} />)}
      <path d={`M950 ${t.top} Q940 ${t.top - 70} 1000 ${t.top - 74} Q1060 ${t.top - 70} 1050 ${t.top}Z`} fill="#c9ced6" stroke={INK} strokeWidth={5} />
      {options.food > 0 && <ellipse cx={1000} cy={t.top - 72} rx={40} ry={8} fill="#e0a23c" />}
      <path d={`M1110 ${t.top} h120 l-14 -36 h-92Z`} fill="#c9a77a" stroke={INK} strokeWidth={4} />
      {options.food > 0 && [0, 1, 2].map((i) => <ellipse key={i} cx={1150 + i * 22} cy={t.top - 40 - i * 3} rx={30} ry={8} fill="#f0d29a" stroke={INK} strokeWidth={2} />)}
      <Bottle x={t.from + 90} y={t.top} scale={1.1} />
    </g>
  );
};

export const dining = defineSet<DiningOptions>({
  name: "dining",
  about: "joint-family dining table: eight places, steel plates and dal, ceiling fan, garlanded photo, calendar, showcase",
  spots: {
    far1: { x: FAR[0], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: 1, sit: true },
    far2: { x: FAR[1], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: -1, sit: true },
    far3: { x: FAR[2], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: 1, sit: true },
    far4: { x: FAR[3], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: -1, sit: true },
    headLeft: { x: 470, y: seatedY(SEAT_TOP + 10, 1.15), scale: 1.15, facing: 1, sit: true },
    headRight: { x: 1490, y: seatedY(SEAT_TOP + 10, 1.15), scale: 1.15, facing: -1, sit: true },
    serving: { x: 1640, y: FLOOR + 10, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    table: { x: 980, y: 640, zoom: 1.35 },
    head: { x: 560, y: 600, zoom: 1.8 },
  },
  lights: [{ x: 560, y: 160, depth: 0.6, r: 600, color: "#fdfbea", strength: 0.3, moods: LIGHTS_ON }],
  defaults: { food: 1, fan: true, photo: true },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [
      { spot: "far1", who: { ...SIBLING, look: { x: 0.7, y: 0.2 } }, face: EXPRESSIONS.happy, behind: true },
      { spot: "far2", who: { ...FATHER, look: { x: 0.7, y: 0 } }, face: EXPRESSIONS.sceptical, behind: true },
      { spot: "far3", who: { ...ELDER, look: { x: 0.7, y: 0 } }, face: EXPRESSIONS.happy, behind: true },
      { spot: "headLeft", who: { ...HERO, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.worried },
      { spot: "serving", who: { ...MOTHER, look: { x: 0.8, y: 0.3 } }, face: EXPRESSIONS.neutral, pose: { ...STAND, armF: [70, 20] } },
    ],
  },
});
