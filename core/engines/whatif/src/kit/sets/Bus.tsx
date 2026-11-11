// Inside a city bus, side on. From "Nobody Could Say No" (FirstJump.Bus.tsx: the street sliding past the windows, the
// bench, the grab rail and straps, the yellow pole), with the street following the mood and a few strap-hangers.
import { Figure } from "../rig/Figure";
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK } from "../theme";
import { CONDUCTOR, HERO, PASTELS } from "./cast";
import { HandPhone } from "./props";
import { Deep, defineSet, lightsOn, LIGHTS_ON, noise, OUTSIDE, seatedY, Sky, type SetProps } from "./common";

const FLOOR = 960;
const SEAT = 840;
const RAIL = 170;
const WINDOWS = [-260, 380, 1020, 1660];

export interface BusOptions {
  /** How fast the street slides past, world px a frame (0 at a stop). */
  speed: number;
  /** Strap-hangers standing further down the bus, 0 to 4. */
  hangers: number;
}

/** The street outside: shopfronts with coloured awnings, trees, street lamps after dark. */
const Street: React.FC<{ frame: number; speed: number; mood: SetProps<BusOptions>["mood"] }> = ({ frame, speed, mood }) => {
  const o = OUTSIDE[mood];
  const TILE = 2400;
  const off = -((frame * speed) % TILE);
  return (
    <>
      <Sky id="bus" mood={mood} x={-1400} y={-600} w={4800} h={1700} sunAt={{ x: 600, y: 330 }} />
      {[0, 1, 2].map((rep) => (
        <g key={rep} transform={`translate(${off + (rep - 1) * TILE} 0)`}>
          {Array.from({ length: 12 }, (_, i) => {
            const bx = i * 200;
            const h = 160 + noise(i + 5) * 200;
            return (
              <g key={i}>
                <rect x={bx} y={620 - h} width={190} height={h + 300} fill={o.dark ? ["#2e3460", "#262c52"][i % 2] : ["#e8c9a0", "#cfe0c8", "#f0d58e", "#e3b8a8"][i % 4]} />
                <rect x={bx + 20} y={560} width={150} height={40} fill={["#d8344f", "#1d9a8f", "#f2b632"][i % 3]} />
                {[0, 1].map((w) => <rect key={w} x={bx + 30 + w * 80} y={640 - h + 30} width={50} height={40} rx={4} fill={noise(i * 7 + w) < o.lit + 0.1 ? "#ffe39a" : "#8fa6b5"} />)}
              </g>
            );
          })}
          {[300, 1100, 1900].map((tx) => <circle key={tx} cx={tx} cy={470} r={90} fill={o.dark ? "#2f4a48" : "#5ba06f"} />)}
          {lightsOn(mood) && [700, 1500, 2300].map((lx) => <circle key={lx} cx={lx} cy={420} r={26} fill="#ffe6a0" />)}
        </g>
      ))}
    </>
  );
};

const Back: React.FC<SetProps<BusOptions>> = ({ cam, mood, frame, options }) => {
  const holes = WINDOWS.map((x) => `M${x + 24} 300 H${x + 556} Q${x + 580} 300 ${x + 580} 324 V556 Q${x + 580} 580 ${x + 556} 580 H${x + 24} Q${x} 580 ${x} 556 V324 Q${x} 300 ${x + 24} 300Z`).join(" ");
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.4} flat><Street frame={frame} speed={options.speed} mood={mood} /></Deep>
      <Deep cam={cam} depth={1}>
        <path d={`M-1400 -800 H3400 V1800 H-1400Z ${holes}`} fillRule="evenodd" fill={dark ? "#a9bdb0" : "#cfe3d4"} />
        {WINDOWS.map((x) => <rect key={x} x={x} y={300} width={580} height={280} rx={24} fill="none" stroke="#7a8a80" strokeWidth={14} />)}
        <rect x={-1400} y={-800} width={4800} height={950} fill={dark ? "#c2cbbf" : "#e9efe6"} />
        <rect x={-1400} y={RAIL - 6} width={4800} height={12} rx={6} fill="#9aa39c" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => -300 + i * 300).map((x) => (
          <g key={x}><line x1={x} y1={RAIL} x2={x} y2={RAIL + 70} stroke="#5c6675" strokeWidth={5} /><circle cx={x} cy={RAIL + 86} r={16} fill="none" stroke="#5c6675" strokeWidth={6} /></g>
        ))}
        <rect x={-1400} y={620} width={4800} height={220} fill="#2f7a6a" />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-1300 + i * 240} y={632} width={8} height={200} fill="#000" opacity={0.12} />)}
        <rect x={-1400} y={SEAT - 8} width={4800} height={34} rx={10} fill="#3a8f7c" stroke={INK} strokeWidth={4} />
        <rect x={-1400} y={SEAT + 26} width={4800} height={100} fill="#4a5262" />
        <rect x={-1400} y={FLOOR} width={4800} height={600} fill="#6b6258" />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 160} y1={FLOOR} x2={-1400 + i * 160 - 120} y2={FLOOR + 300} stroke="#5a524a" strokeWidth={4} />)}
        {[960, 1720].map((x) => <rect key={x} x={x} y={-800} width={46} height={1760} rx={20} fill="#e2c03a" stroke={INK} strokeWidth={5} />)}
      </Deep>
      <Deep cam={cam} depth={0.96}>
        {/* passengers standing further down the bus, on their phones */}
        {Array.from({ length: Math.min(4, options.hangers) }, (_, i) => (
          <Figure key={i} x={-260 + i * 330} y={FLOOR - 10} scale={0.95} facing={i % 2 ? -1 : 1} head={PASTELS[(i * 3) % PASTELS.length]}
            coat={["#5a6488", "#7a5a8c", "#6d7f8f", "#8a5c3b"][i]} pose={{ ...STAND, armF: [30, 75] }} held={<HandPhone />} mouth="flat" look={{ x: 0.6, y: 0.7 }} time={frame} />
        ))}
      </Deep>
    </>
  );
};

export const bus = defineSet<BusOptions>({
  name: "bus",
  about: "inside a city bus: the street sliding past the windows, the bench, straps and the yellow pole, strap-hangers",
  spots: {
    window: { x: 1360, y: seatedY(SEAT, 1.1), scale: 1.1, facing: -1, sit: true },
    seat: { x: 1120, y: seatedY(SEAT, 1.1), scale: 1.1, facing: -1, sit: true },
    seatLeft: { x: 420, y: seatedY(SEAT, 1.1), scale: 1.1, facing: 1, sit: true },
    aisle: { x: 850, y: FLOOR + 20, scale: 1.2, facing: 1 },
    pole: { x: 1620, y: FLOOR + 20, scale: 1.2, facing: -1 },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    seats: { x: 1200, y: 650, zoom: 1.5 },
    aisle: { x: 900, y: 560, zoom: 1.6 },
  },
  lights: [{ x: 700, y: 120, r: 600, color: "#fff4d8", strength: 0.2, moods: LIGHTS_ON }],
  defaults: { speed: 7, hangers: 2 },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "window", who: { head: "#c9a0d6", coat: "#b0306a" }, face: EXPRESSIONS.sceptical },
      { spot: "pole", who: { ...CONDUCTOR }, face: EXPRESSIONS.neutral, pose: { ...STAND, armB: [-85, 5] } },
      { spot: "aisle", who: { ...HERO, look: { x: 0.8, y: 0.3 } }, face: EXPRESSIONS.worried, pose: { ...STAND, armF: [92, 8] } },
    ],
  },
});
