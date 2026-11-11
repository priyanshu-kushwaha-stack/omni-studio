// A railway station platform, side on: the blue coaches with barred windows standing at the far track, the open coach
// door, the yellow station board (colour blocks, no words), the hanging clock, a tea trolley, luggage, the canopy on
// cast-iron posts. Built for the library from the metro platform (canopy, edge, the train) and the chai stall (kettle).
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK, PAPER } from "../theme";
import { HERO, MOTHER } from "./cast";
import { Deep, LIGHTS_ON, lightsOn, OUTSIDE, REF, Sky, Skyline, type SetDef, type SetProps } from "./common";
import { ChaiGlass, Tiffin } from "./props";

const FLOOR = 960;
const EDGE = 840;
const DOOR = 1180;

export interface TrainPlatformOptions {
  /** The train at the platform: world px it still has to travel (0 standing), or null for an empty track. */
  train: number | null;
  /** Bags piled by the posts. */
  luggage: boolean;
  /** The tea trolley. */
  trolley: boolean;
}

const Coaches: React.FC<{ x: number; lit: boolean }> = ({ x, lit }) => (
  <g transform={`translate(${x} 0)`}>
    {Array.from({ length: 4 }, (_, c) => {
      const cx = -1300 + c * 1260;
      return (
        <g key={c}>
          <rect x={cx} y={360} width={1240} height={470} rx={24} fill="#2f5aa0" stroke={INK} strokeWidth={6} />
          <rect x={cx} y={400} width={1240} height={16} fill="#f2b632" />
          <rect x={cx} y={760} width={1240} height={14} fill="#f2b632" />
          {Array.from({ length: 8 }, (_, w) => {
            const wx = cx + 60 + w * 145;
            if (Math.abs(wx + 40 - DOOR) < 120) return null;
            return (
              <g key={w}>
                <rect x={wx} y={460} width={96} height={120} rx={8} fill={lit ? "#ffe39a" : "#1f2a40"} stroke={INK} strokeWidth={4} />
                {[0, 1, 2, 3].map((b) => <line key={b} x1={wx + 12 + b * 24} y1={460} x2={wx + 12 + b * 24} y2={580} stroke={INK} strokeWidth={3} />)}
              </g>
            );
          })}
        </g>
      );
    })}
    <rect x={DOOR - 70} y={440} width={140} height={EDGE - 440} fill={lit ? "#fff1c9" : "#3a4660"} stroke={INK} strokeWidth={6} />
    <rect x={DOOR - 90} y={EDGE - 20} width={180} height={20} fill="#6b7280" />
    {[DOOR - 84, DOOR + 76].map((hx) => <rect key={hx} x={hx} y={480} width={8} height={240} rx={4} fill="#c9ced6" />)}
  </g>
);

const Back: React.FC<SetProps<TrainPlatformOptions>> = ({ cam, mood, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.15} flat>
        <Sky id="train-platform" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 1500, y: 280 }} />
        <Skyline mood={mood} from={-1400} to={3400} base={620} tall={300} seed={9} />
      </Deep>
      <Deep cam={cam} depth={0.7} flat>
        <rect x={-1400} y={600} width={4800} height={300} fill="#5a5048" />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1400 + i * 120} y={760} width={70} height={16} fill="#6a5a48" />)}
        <rect x={-1400} y={748} width={4800} height={8} fill="#a7adb6" />
      </Deep>
      <Deep cam={cam} depth={1}>
        {options.train !== null && <Coaches x={options.train} lit={on} />}
        {/* the canopy: corrugated roof on cast-iron posts, the board and the clock */}
        <rect x={-1400} y={-800} width={4800} height={900} fill={o.dark ? "#4a3f38" : "#8a7a68"} />
        {Array.from({ length: 60 }, (_, i) => <line key={i} x1={-1400 + i * 80} y1={60} x2={-1400 + i * 80} y2={100} stroke="#000" strokeWidth={4} opacity={0.15} />)}
        {[200, 1500].map((x) => (
          <g key={x}>
            <rect x={x - 16} y={100} width={32} height={EDGE - 100} fill="#2f6d68" stroke={INK} strokeWidth={4} />
            <path d={`M${x - 120} 110 Q${x} 200 ${x + 120} 110`} fill="none" stroke="#2f6d68" strokeWidth={12} />
          </g>
        ))}
        <rect x={560} y={150} width={420} height={110} rx={6} fill="#f2c94c" stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((r) => <rect key={r} x={590 + r * 130} y={180} width={110} height={50} rx={6} fill={INK} opacity={0.85} />)}
        <circle cx={1200} cy={180} r={56} fill={PAPER} stroke={INK} strokeWidth={8} />
        <line x1={1200} y1={180} x2={1200} y2={146} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <line x1={1200} y1={180} x2={1226} y2={194} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        {/* the platform floor and its edge */}
        <rect x={-1400} y={EDGE} width={4800} height={800} fill="#b5ab98" />
        <rect x={-1400} y={EDGE} width={4800} height={14} fill="#6a645a" />
        <rect x={-1400} y={EDGE + 24} width={4800} height={12} fill={PAPER} />
        {options.luggage && (
          <g>
            <rect x={240} y={FLOOR - 120} width={150} height={110} rx={12} fill="#8a3a3a" stroke={INK} strokeWidth={4} />
            <rect x={270} y={FLOOR - 196} width={110} height={78} rx={10} fill="#3d6fb0" stroke={INK} strokeWidth={4} />
            <Tiffin x={440} y={FLOOR - 10} scale={0.8} />
          </g>
        )}
        {options.trolley && (
          <g transform="translate(1620 0)">
            <rect x={-110} y={760} width={220} height={120} rx={10} fill="#c7884f" stroke={INK} strokeWidth={5} />
            <rect x={-70} y={680} width={70} height={80} rx={12} fill="#b8bec8" stroke={INK} strokeWidth={4} />
            {[30, 70].map((gx) => <ChaiGlass key={gx} x={gx} y={760} scale={0.8} />)}
            {[-80, 80].map((wx) => <circle key={wx} cx={wx} cy={FLOOR - 40} r={26} fill={INK} />)}
          </g>
        )}
      </Deep>
    </>
  );
};

export const trainPlatform: SetDef<TrainPlatformOptions> = {
  name: "train-platform",
  about: "railway platform: blue coaches with barred windows and an open door, station board, clock, tea trolley, luggage",
  spots: {
    hero: { x: 860, y: FLOOR, scale: 1.15, facing: 1 },
    seeingOff: { x: 1440, y: FLOOR, scale: 1.15, facing: -1 },
    door: { x: DOOR, y: EDGE - 20, scale: 1.0, facing: -1 },
    vendor: { x: 1780, y: FLOOR + 10, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    door: { x: DOOR, y: 600, zoom: 1.6 },
    board: { x: 770, y: 205, zoom: 2.2 },
  },
  lights: () => [{ x: 960, y: 110, r: 900, color: "#ffe9b0", strength: 0.25, moods: LIGHTS_ON }],
  defaults: { train: 0, luggage: true, trolley: true },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "door", who: { ...MOTHER, look: { x: 0.6, y: 0.4 } }, face: EXPRESSIONS.sad, pose: { ...STAND, armF: [100, 20] } },
      { spot: "hero", who: { ...HERO, flow: 0.3, look: { x: 0.8, y: -0.2 } }, face: EXPRESSIONS.worried, pose: { ...STAND, armF: [120, 10] } },
    ],
  },
};
