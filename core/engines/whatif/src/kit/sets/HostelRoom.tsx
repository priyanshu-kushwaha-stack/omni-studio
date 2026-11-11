// A shared hostel room, side on. From "Nobody Could Say No" (Midpoint.parts.tsx RoomBack: your room at night, the low
// bed, the window on the city) and "Find Anything Ever Lost" (Treasure.tsx Bedroom), made a hostel: two steel cots, a
// study table under the window, the steel almirah, a towel on the line, a bucket, posters, a tube light.
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { FRIEND, HERO } from "./cast";
import { Deep, defineSet, LIGHTS_ON, lightsOn, OUTSIDE, seatedY, TubeLight, Window, type SetProps } from "./common";
import { Backpack, Books, Bottle, Laptop } from "./props";

const FLOOR = 960;
const COT = { top: 800, h: 40 };
const COTS = [{ from: 120, to: 640 }, { from: 1300, to: 1820 }];
const TABLE = { from: 760, to: 1180, top: 740 };

export interface HostelRoomOptions {
  /** A laptop open on the study table (else books). */
  laptop: boolean;
  /** The towel and clothes on the line across the room. */
  line: boolean;
  /** Mess on the floor: a backpack, a bottle, a bucket. */
  mess: boolean;
}

const Cot: React.FC<{ from: number; to: number; sheet: string }> = ({ from, to, sheet }) => (
  <g>
    <rect x={from} y={COT.top - 120} width={14} height={FLOOR - COT.top + 120 - 40} fill="#7a8490" />
    <rect x={to - 14} y={COT.top - 60} width={14} height={FLOOR - COT.top + 60 - 40} fill="#7a8490" />
    <rect x={from} y={COT.top + COT.h} width={to - from} height={10} fill="#7a8490" />
    <rect x={from + 10} y={COT.top} width={to - from - 20} height={COT.h} rx={10} fill="#efe9dc" stroke={INK} strokeWidth={4} />
    <rect x={from + 120} y={COT.top - 8} width={to - from - 140} height={32} rx={12} fill={sheet} stroke={INK} strokeWidth={4} />
    <ellipse cx={from + 70} cy={COT.top - 10} rx={56} ry={22} fill="#fffaf0" stroke={INK} strokeWidth={4} />
  </g>
);

const Back: React.FC<SetProps<HostelRoomOptions>> = ({ cam, mood, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.82} flat>
        <rect x={-1400} y={-800} width={4800} height={1800} fill={dark ? "#9fb3b0" : "#cfe0dc"} />
        <rect x={-1400} y={FLOOR - 140} width={4800} height={200} fill={dark ? "#8aa09c" : "#b9cfca"} />
        <Window id="hostel" mood={mood} x={800} y={240} w={340} h={300} frame="#5c6675" />
        {/* posters, a timetable, a mirror */}
        <rect x={280} y={260} width={150} height={210} fill="#d8344f" stroke={INK} strokeWidth={4} transform="rotate(-3 355 365)" />
        <circle cx={355} cy={340} r={40} fill="#f3e9d7" />
        <rect x={470} y={300} width={180} height={130} fill="#f3e9d7" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={482 + (i % 4) * 42} y={316 + Math.floor(i / 4) * 36} width={34} height={26} fill={["#f2b632", "#9fd8a8", "#e6a0a0", "#cfe0dc"][(i * 3) % 4]} />)}
        <rect x={1330} y={300} width={110} height={150} rx={50} fill="#dfeef2" stroke="#7a8490" strokeWidth={8} />
        <TubeLight x={970} y={150} w={300} on={on} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 40} width={4800} height={800} fill="#9a8f80" />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-1400 + i * 300} y1={FLOOR - 40} x2={-1400 + i * 300 - 140} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
        {/* the steel almirah at the far right */}
        <rect x={1860} y={300} width={260} height={FLOOR - 340} rx={8} fill="#7a8a94" stroke={INK} strokeWidth={5} />
        <line x1={1990} y1={300} x2={1990} y2={FLOOR - 40} stroke={INK} strokeWidth={4} />
        <rect x={1970} y={560} width={12} height={60} rx={5} fill={INK} /><rect x={1998} y={560} width={12} height={60} rx={5} fill={INK} />
        {/* the study table under the window */}
        <rect x={TABLE.from} y={TABLE.top} width={TABLE.to - TABLE.from} height={20} rx={4} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        <rect x={TABLE.from + 20} y={TABLE.top + 20} width={14} height={FLOOR - TABLE.top - 60} fill="#6a4630" />
        <rect x={TABLE.to - 34} y={TABLE.top + 20} width={14} height={FLOOR - TABLE.top - 60} fill="#6a4630" />
        {options.laptop ? <Laptop x={1000} y={TABLE.top} scale={0.85} screen={on ? "video" : "code"} /> : <Books x={1000} y={TABLE.top} n={5} />}
        <Books x={840} y={TABLE.top} n={3} scale={0.8} />
        <Bottle x={1130} y={TABLE.top} />
        <Cot {...COTS[0]} sheet="#7fa0c4" />
        <Cot {...COTS[1]} sheet="#c9a0d6" />
        {options.mess && (
          <g>
            <Backpack x={700} y={FLOOR - 30} scale={0.9} />
            <path d="M1220 920 L1230 840 H1290 L1300 920Z" fill="#1d9a8f" stroke={INK} strokeWidth={4} />
            <path d="M1236 840 Q1260 800 1284 840" fill="none" stroke={INK} strokeWidth={4} />
          </g>
        )}
      </Deep>
    </>
  );
};

/** The clothesline across the room, near the camera: a towel and a shirt hanging soft at the top. */
const Front: React.FC<SetProps<HostelRoomOptions>> = ({ cam, options }) =>
  options.line ? (
    <Deep cam={cam} depth={1.25}>
      <path d="M-200 60 Q900 130 2200 50" fill="none" stroke={INK} strokeWidth={4} />
      <path d="M260 84 h170 l-10 210 h-150Z" fill="#f2b632" stroke={INK} strokeWidth={4} />
      <path d="M1500 92 h150 l40 60 l-30 16 v120 h-170 v-120 l-30 -16Z" fill="#d8344f" stroke={INK} strokeWidth={4} />
    </Deep>
  ) : null;

export const hostelRoom = defineSet<HostelRoomOptions>({
  name: "hostel-room",
  about: "shared hostel room: two steel cots, study table under the window, steel almirah, posters, clothesline, mess",
  spots: {
    cotLeft: { x: 520, y: seatedY(COT.top, 1.1), scale: 1.1, facing: 1, sit: true },
    cotRight: { x: 1420, y: seatedY(COT.top, 1.1), scale: 1.1, facing: -1, sit: true },
    table: { x: 1120, y: FLOOR + 10, scale: 1.15, facing: -1 },
    floor: { x: 960, y: FLOOR + 30, scale: 1.2, facing: 1 },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    twoShot: { x: 960, y: 640, zoom: 1.4 },
    table: { x: 980, y: 600, zoom: 1.8 },
  },
  lights: [{ x: 970, y: 160, depth: 0.82, r: 620, color: "#fdfbea", strength: 0.32, moods: LIGHTS_ON }],
  defaults: { laptop: true, line: true, mess: true },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "cotLeft", who: { ...HERO, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.shocked },
      { spot: "cotRight", who: { ...FRIEND, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
});
