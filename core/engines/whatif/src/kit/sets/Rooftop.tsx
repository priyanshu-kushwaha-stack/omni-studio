// A flat rooftop terrace, side on: the black water tank on its stand, a dish antenna, a clothesline, the stair-head
// room with its door, the parapet wall in front, and the city all round under the sky (stars at night, kites by day).
// Built for the library from the balcony and courtyard (Skyline, neighbours' roofs and water tanks).
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { FRIEND, HERO } from "./cast";
import { DARK, Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, Sky, Skyline, type SetDef, type SetProps } from "./common";

const FLOOR = 960;
const PARAPET = 800;

export interface RooftopOptions {
  /** Kites in the sky (by day; they hide after dark). */
  kites: boolean;
  /** Fairy lights along the parapet (lit after dark). */
  lights: boolean;
  /** Washing on the line. */
  washing: boolean;
}

const Back: React.FC<SetProps<RooftopOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.1} flat>
        <Sky id="rooftop" mood={mood} x={-1400} y={-800} w={4800} h={1600} sunAt={{ x: 1450, y: 220 }} />
        {options.kites && !o.dark && [[300, 160, "#d8344f"], [760, 90, "#f2b632"], [1200, 200, "#1d9a8f"]].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${Number(x) + Math.sin(frame / 30 + i) * 14} ${Number(y) + Math.cos(frame / 25 + i) * 8}) rotate(${Math.sin(frame / 20 + i) * 8})`}>
            <path d="M0 -40 L30 0 L0 40 L-30 0Z" fill={String(c)} stroke={INK} strokeWidth={3} />
            <path d="M0 40 Q20 120 -10 220" fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={0.3} flat><Skyline mood={mood} from={-1400} to={3400} base={720} tall={380} seed={7} /></Deep>
      <Deep cam={cam} depth={0.55} flat>
        {Array.from({ length: 8 }, (_, i) => {
          const x = -900 + i * 560;
          const top = 560 + noise(i + 11) * 80;
          return (
            <g key={i}>
              <rect x={x} y={top} width={520} height={800} fill={o.dark ? "#2a2f52" : ["#e4b48e", "#e6cd98", "#a3c7bf", "#dc9d8f"][i % 4]} />
              <rect x={x + 60} y={top - 80} width={110} height={80} rx={10} fill={o.dark ? "#14172c" : "#2f3340"} />
              <rect x={x + 300} y={top + 50} width={80} height={60} rx={6} fill={noise(i + 2) < o.lit + 0.1 ? "#ffe39a" : o.dark ? "#1a1f3d" : "#6c7f8f"} />
            </g>
          );
        })}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 60} width={4800} height={800} fill={o.dark ? "#6f6a63" : "#b9b2a6"} />
        {/* the stair-head room and its door */}
        <rect x={-500} y={360} width={760} height={FLOOR - 420} fill={o.dark ? "#a78e74" : "#e8d3b0"} stroke={INK} strokeWidth={6} />
        <rect x={80} y={520} width={150} height={FLOOR - 580} fill={on ? "#ffd99a" : "#6b3f2a"} stroke={INK} strokeWidth={5} />
        {/* the water tank on its stand, the dish */}
        <rect x={1460} y={560} width={14} height={300} fill="#4a5262" /><rect x={1700} y={560} width={14} height={300} fill="#4a5262" />
        <path d="M1440 560 Q1440 380 1590 380 Q1740 380 1740 560Z" fill="#23252b" stroke={INK} strokeWidth={5} />
        {[440, 480, 520].map((y) => <line key={y} x1={1444} y1={y} x2={1736} y2={y} stroke="#3b3e47" strokeWidth={4} />)}
        <rect x={1560} y={360} width={60} height={24} rx={6} fill="#3b3e47" />
        <g transform="translate(1260 700)">
          <ellipse rx={70} ry={80} fill="#d9d6cf" stroke={INK} strokeWidth={5} transform="rotate(-30)" />
          <line x1={0} y1={0} x2={50} y2={-50} stroke={INK} strokeWidth={5} />
          <rect x={-6} y={60} width={12} height={150} fill="#4a5262" />
        </g>
        {options.washing && (
          <g>
            <path d="M260 560 Q760 620 1400 560" fill="none" stroke={INK} strokeWidth={3} />
            {[[420, "#d8344f"], [620, "#7fa0c4"], [900, "#f2b632"], [1120, "#e6a0a0"]].map(([x, c], i) => (
              <path key={i} d={`M${x} ${580 + (i % 2) * 6} h90 l-6 ${120 + i * 10} h-78Z`} fill={String(c)} stroke={INK} strokeWidth={3} />
            ))}
          </g>
        )}
      </Deep>
    </>
  );
};

/** The parapet wall in front of the roof's edge, with its string of lights. */
const Front: React.FC<SetProps<RooftopOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  return (
    <Deep cam={cam} depth={1.06}>
      <rect x={-1400} y={PARAPET} width={4800} height={400} fill={OUTSIDE[mood].dark ? "#8a7a68" : "#d9c8a8"} stroke={INK} strokeWidth={6} />
      <rect x={-1400} y={PARAPET - 16} width={4800} height={22} fill={OUTSIDE[mood].dark ? "#6f6352" : "#c2ad88"} stroke={INK} strokeWidth={4} />
      {options.lights && Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={-160 + i * 60} cy={PARAPET + 20 + Math.sin(i * 1.1) * 6} r={8}
          fill={on ? ["#ffe39a", "#ff9a8a", "#9fe0c8"][i % 3] : "#c9c6bb"} opacity={on ? 0.7 + 0.3 * Math.sin(frame * 0.2 + i) : 0.8} />
      ))}
    </Deep>
  );
};

export const rooftop: SetDef<RooftopOptions> = {
  name: "rooftop",
  about: "flat rooftop over the city: water tank, dish, washing line, stair-head door, parapet with lights, kites by day",
  spots: {
    parapet: { x: 760, y: FLOOR, scale: 1.15, facing: 1 },
    parapetRight: { x: 1080, y: FLOOR, scale: 1.15, facing: -1 },
    door: { x: 160, y: FLOOR - 50, scale: 1.1, facing: 1 },
    tank: { x: 1820, y: FLOOR, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    twoShot: { x: 920, y: 600, zoom: 1.5 },
    sky: { x: 900, y: 320, zoom: 1.1 },
  },
  lights: () => [
    { x: 160, y: 700, r: 360, color: "#ffd99a", strength: 0.4, moods: LIGHTS_ON },
    { x: 960, y: PARAPET + 20, depth: 1.06, r: 800, color: "#ffe39a", strength: 0.18, moods: DARK },
  ],
  defaults: { kites: true, lights: true, washing: true },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "parapet", who: { ...HERO, flow: 0.5, look: { x: 0.6, y: -0.4 } }, face: EXPRESSIONS.relieved },
      { spot: "parapetRight", who: { ...FRIEND, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
};
