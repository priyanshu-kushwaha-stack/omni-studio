// A flat's balcony, looking out over the city. New for the library, from pieces of the films: the pause film's
// LongRun.Mirror street-below-the-window, "60 Seconds" (StreetNight's lit skyline) and the shared Skyline. The railing
// sits in front of whoever leans on it; plants on the ledge, a plastic chair, the room's door behind.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK } from "../theme";
import { HERO, SIBLING } from "./cast";
import { Chair, DARK, Deep, Floor, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, seat, Sky, Skyline, type SetDef, type SetProps } from "./common";
import { ChaiGlass } from "./props";

const FLOOR = 960;
const RAIL = 700;
const CHAIR = { x: 1500, top: 850 };

export interface BalconyOptions {
  /** Potted plants on the ledge. */
  plants: boolean;
  /** A string of fairy lights along the railing (lit after dark). */
  fairyLights: boolean;
  /** Clothes drying on a stand at the right. */
  drying: boolean;
}

const Back: React.FC<SetProps<BalconyOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.15} flat>
        <Sky id="balcony" mood={mood} x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 1200, y: 260 }} />
      </Deep>
      <Deep cam={cam} depth={0.3} flat>
        <Skyline mood={mood} from={-1400} to={3400} base={700} tall={360} seed={11} />
      </Deep>
      <Deep cam={cam} depth={0.5} flat>
        {/* the block across the lane: balconies, a water tank, lit windows */}
        {Array.from({ length: 6 }, (_, i) => {
          const x = -900 + i * 760;
          const top = 360 + noise(i + 4) * 80;
          return (
            <g key={i}>
              <rect x={x} y={top} width={680} height={900} fill={o.dark ? "#2e3460" : ["#e6cd98", "#dc9d8f", "#a3c7bf"][i % 3]} />
              <rect x={x + 80} y={top - 90} width={120} height={90} rx={12} fill={o.dark ? "#1a1e38" : "#2f3340"} />
              {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
                <g key={`${r}-${c}`}>
                  <rect x={x + 50 + c * 210} y={top + 60 + r * 200} width={150} height={110} rx={6}
                    fill={noise(i * 17 + r * 3 + c) < o.lit + 0.15 ? "#ffe39a" : o.dark ? "#1a1f3d" : "#6c7f8f"} />
                  <rect x={x + 40 + c * 210} y={top + 150 + r * 200} width={170} height={14} fill={o.dark ? "#1a1e38" : "#8a7a68"} />
                </g>
              )))}
            </g>
          );
        })}
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the wall of the flat at the left with its door, the balcony floor */}
        <rect x={-1400} y={-800} width={1700} height={2400} fill={o.dark ? "#b89a80" : "#e8d3b0"} stroke={INK} strokeWidth={6} />
        <rect x={60} y={300} width={200} height={FLOOR - 300} fill={on ? "#ffd99a" : "#6b8a9a"} stroke={INK} strokeWidth={6} />
        <path d="M60 300 V960 M160 300 V960" stroke="#3a3f4c" strokeWidth={5} opacity={0.6} />
        <Floor y={FLOOR - 30} fill="#b9a690" gap={220} slant={-120} />
        {options.drying && (
          <g>
            <path d="M1640 960 L1720 600 L1800 960 M1680 780 H1760" fill="none" stroke="#9aa1ab" strokeWidth={8} />
            {[["#d8344f", 1650], ["#7fa0c4", 1700], ["#f2b632", 1750]].map(([c, x]) => <rect key={x} x={Number(x)} y={606} width={44} height={150} rx={4} fill={String(c)} stroke={INK} strokeWidth={3} />)}
          </g>
        )}
        <Chair x={CHAIR.x} y={CHAIR.top} facing={-1} color="#d8344f" />
        <ChaiGlass x={1360} y={RAIL - 6} scale={0.8} />
      </Deep>
    </>
  );
};

/** The railing and the ledge plants: in front of whoever stands at it. */
const Front: React.FC<SetProps<BalconyOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  return (
    <Deep cam={cam} depth={1.04}>
      <rect x={300} y={RAIL - 16} width={3200} height={20} rx={6} fill="#4a5262" stroke={INK} strokeWidth={4} />
      <line x1={320} y1={RAIL + (FLOOR - RAIL - 30) / 2} x2={3500} y2={RAIL + (FLOOR - RAIL - 30) / 2} stroke="#4a5262" strokeWidth={FLOOR - RAIL - 30} strokeDasharray="10 38" />
      <rect x={300} y={FLOOR - 40} width={3200} height={16} fill="#4a5262" />
      {options.fairyLights && Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={330 + i * 54} cy={RAIL + 14 + Math.sin(i * 1.3) * 6} r={7}
          fill={on ? ["#ffe39a", "#ff9a8a", "#9fe0c8"][i % 3] : "#c9c6bb"} opacity={on ? 0.7 + 0.3 * Math.sin(frame * 0.2 + i) : 0.8} />
      ))}
      {options.plants && [440, 900, 1180].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 40} ${RAIL - 16} L${x - 32} ${RAIL - 76} H${x + 32} L${x + 40} ${RAIL - 16}Z`} fill="#c96f2d" stroke={INK} strokeWidth={4} />
          {[-24, 0, 24].map((dx) => <ellipse key={dx} cx={x + dx} cy={RAIL - 110 - (i % 2) * 14} rx={22} ry={40} fill={["#5ba06f", "#4c9a76"][i % 2]} transform={`rotate(${dx} ${x + dx} ${RAIL - 110})`} />)}
        </g>
      ))}
    </Deep>
  );
};

export const balcony: SetDef<BalconyOptions> = {
  name: "balcony",
  about: "a flat's balcony over the city: railing in front, plants and fairy lights, a plastic chair, washing drying",
  spots: {
    railing: { x: 820, y: FLOOR, scale: 1.15, facing: 1 },
    railingRight: { x: 1150, y: FLOOR, scale: 1.15, facing: -1 },
    chair: seat(CHAIR.x, CHAIR.top, 1.1, -1),
    door: { x: 160, y: FLOOR - 20, scale: 1.15, facing: 1 },
  },
  cameras: {
    wide: REF,
    railing: { x: 980, y: 560, zoom: 1.5 },
    city: { x: 1100, y: 420, zoom: 1.2 },
  },
  lights: () => [
    { x: 160, y: 600, r: 420, color: "#ffd99a", strength: 0.4, moods: LIGHTS_ON },
    { x: 1000, y: RAIL, r: 700, color: "#ffe39a", strength: 0.2, moods: DARK },
  ],
  defaults: { plants: true, fairyLights: true, drying: true },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "railing", who: { ...HERO, flow: 0.3, look: { x: 0.8, y: -0.2 } }, face: EXPRESSIONS.relieved, pose: { ...STAND, lean: 6 } },
      { spot: "railingRight", who: { ...SIBLING, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
};
