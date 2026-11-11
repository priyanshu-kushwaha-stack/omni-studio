// Inside a sleeper coach, side on: one bay with three tiers of berths, the barred window with fields (or the city)
// sliding past, the chain, the fan, a blanket, a chai seller in the aisle. Built for the library from the metro coach
// and the bus (the world sliding past the window) and the ceiling fan.
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { HERO, VENDOR } from "./cast";
import { Deep, Fan, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, seat, Sky, type SetDef, type SetProps } from "./common";
import { ChaiGlass } from "./props";

const FLOOR = 980;
const LOWER = 820;
const MIDDLE = 560;
const UPPER = 300;
const BAY = { from: 280, to: 1360 };
const WINDOW = { x: 560, y: 380, w: 520, h: 300 };

export interface SleeperCoachOptions {
  /** How fast the world slides past the window, px a frame. */
  speed: number;
  /** What is outside: fields or the edge of a city. */
  outside: "fields" | "city";
  /** The middle berth is up (night) or folded down as a backrest (day). */
  middleUp: boolean;
}

const Outside: React.FC<{ frame: number; mood: SetProps<SleeperCoachOptions>["mood"]; o: SleeperCoachOptions }> = ({ frame, mood, o }) => {
  const dark = OUTSIDE[mood].dark;
  const off = -((frame * o.speed) % 1200);
  return (
    <g>
      <Sky id="sleeper" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 900, y: 330 }} />
      {[0, 1, 2, 3].map((rep) => (
        <g key={rep} transform={`translate(${off + (rep - 1) * 1200} 0)`}>
          {o.outside === "fields"
            ? (
              <g>
                <rect x={0} y={560} width={1200} height={600} fill={dark ? "#24402f" : "#8fbf6a"} />
                {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={i * 220 + 60} cy={540 - noise(i) * 30} r={50 + noise(i + 3) * 30} fill={dark ? "#1c3326" : "#4c9a5a"} />)}
                {[200, 800].map((x) => <line key={x} x1={x} y1={420} x2={x} y2={600} stroke={dark ? "#111" : "#5a5048"} strokeWidth={8} />)}
              </g>
            )
            : Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={i * 150} y={600 - 100 - noise(i) * 160} width={140} height={600} fill={dark ? "#262c52" : ["#d9b99a", "#c7d6cf", "#e6cd98"][i % 3]} />
            ))}
        </g>
      ))}
    </g>
  );
};

const Berth: React.FC<{ y: number; from: number; to: number }> = ({ y, from, to }) => (
  <g>
    <rect x={from} y={y} width={to - from} height={34} rx={8} fill="#2f5aa0" stroke={INK} strokeWidth={4} />
    <rect x={from} y={y + 34} width={to - from} height={12} fill="#4a5262" />
  </g>
);

const Back: React.FC<SetProps<SleeperCoachOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  const w = WINDOW;
  return (
    <>
      <Deep cam={cam} depth={0.3} flat><Outside frame={frame} mood={mood} o={options} /></Deep>
      <Deep cam={cam} depth={1}>
        <path d={`M-1400 -800 H3400 V1600 H-1400Z M${w.x} ${w.y} h${w.w} v${w.h} h${-w.w}Z`} fillRule="evenodd" fill={dark ? "#9aa9a0" : "#c9d6cc"} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={w.x + 30 + i * 58} y1={w.y} x2={w.x + 30 + i * 58} y2={w.y + w.h} stroke={INK} strokeWidth={6} />)}
        <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="none" stroke="#5c6675" strokeWidth={14} />
        {/* the bay's partitions, the berths, the ladder, the chain */}
        <rect x={BAY.from - 40} y={-200} width={40} height={FLOOR + 200} fill="#7a8a80" stroke={INK} strokeWidth={4} />
        <rect x={BAY.to} y={-200} width={40} height={FLOOR + 200} fill="#7a8a80" stroke={INK} strokeWidth={4} />
        <Berth y={UPPER} from={BAY.from} to={BAY.to} />
        {options.middleUp
          ? <Berth y={MIDDLE} from={BAY.from} to={BAY.to} />
          : <rect x={BAY.from} y={LOWER - 280} width={BAY.to - BAY.from} height={220} rx={10} fill="#2f5aa0" stroke={INK} strokeWidth={4} />}
        <Berth y={LOWER} from={BAY.from} to={BAY.to} />
        <rect x={BAY.from} y={LOWER + 46} width={BAY.to - BAY.from} height={FLOOR - LOWER - 66} fill="#4a5262" />
        <path d={`M${BAY.from + 120} ${UPPER - 120} l14 26 h-28Z`} fill="#d8344f" />
        <path d={`M${BAY.from + 120} ${UPPER - 94} Q${BAY.from + 140} ${UPPER - 60} ${BAY.from + 120} ${UPPER - 20}`} fill="none" stroke="#9aa1ab" strokeWidth={4} />
        <rect x={BAY.from + 300} y={UPPER + 20} width={220} height={28} rx={10} fill="#c96f2d" stroke={INK} strokeWidth={3} />
        <rect x={-1400} y={FLOOR - 20} width={4800} height={800} fill="#6b6258" />
        <rect x={1460} y={-800} width={44} height={FLOOR + 780} rx={18} fill="#c8ccd2" stroke={INK} strokeWidth={5} />
      </Deep>
      <Deep cam={cam} depth={1} flat>
        <Fan x={1700} y={150} frame={frame} scale={0.7} color={on ? "#7a8490" : "#6b7480"} />
      </Deep>
    </>
  );
};

export const sleeperCoach: SetDef<SleeperCoachOptions> = {
  name: "sleeper-coach",
  about: "sleeper coach bay: three tiers of berths, the barred window with fields or city sliding past, fan, chai seller",
  spots: {
    lower: seat(700, LOWER, 1.1, 1),
    lowerRight: seat(1100, LOWER, 1.1, -1),
    upper: seat(900, UPPER, 0.9, 1),
    aisle: { x: 1640, y: FLOOR, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    window: { x: WINDOW.x + WINDOW.w / 2, y: 600, zoom: 1.5 },
    upper: { x: 900, y: 240, zoom: 1.8 },
  },
  lights: () => [{ x: 820, y: 200, r: 700, color: "#ffe9b0", strength: 0.25, moods: LIGHTS_ON }],
  defaults: { speed: 6, outside: "fields", middleUp: false },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "lower", who: { ...HERO, look: { x: 0.6, y: -0.4 } }, face: EXPRESSIONS.relieved },
      { spot: "aisle", who: { ...VENDOR, look: { x: 0.8, y: 0 }, held: <ChaiGlass scale={0.8} /> }, face: EXPRESSIONS.happy },
    ],
  },
};
