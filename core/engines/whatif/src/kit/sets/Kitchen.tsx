// A home kitchen, side on. From the pause sample's Kitchen (examples/pause-sample/scenes/Kitchen.tsx: the window, the
// teal cabinets, the fridge, the red counter) and "60 Seconds" (sets.tsx Home: the tiled splashback, the stove),
// made Indian: a granite platform, the gas stove with a pressure cooker, the steel rack and the spice shelf.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK, PAPER } from "../theme";
import { HERO, MOTHER } from "./cast";
import { Deep, Floor, LIGHTS_ON, lightsOn, REF, TubeLight, Window, type SetDef, type SetProps } from "./common";
import { ChaiGlass, Mug, PressureCooker, Tiffin } from "./props";

const FLOOR = 960;
const TOP = 760;
const COUNTER = { from: 260, to: 1340 };
const STOVE = 820;

export type KitchenThing = "mug" | "glass" | "tiffin";

export interface KitchenOptions {
  /** What is on the stove. */
  stove: "cooker" | "kettle" | "none";
  /** Steam from the stove, 0 to 1. */
  steam: number;
  /** Things on the platform, left to right from x 900. */
  counter: KitchenThing[];
}

const Kettle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-56 0 Q-62 -66 0 -70 Q62 -66 56 0Z" fill="#b8bec8" stroke={INK} strokeWidth={5} />
    <path d="M50 -30 Q78 -44 84 -66" fill="none" stroke="#b8bec8" strokeWidth={14} strokeLinecap="round" />
    <path d="M-36 -70 Q0 -112 36 -70" fill="none" stroke={INK} strokeWidth={6} />
  </g>
);

/** One thing on the platform, base at (x, y). */
const thing = (t: KitchenThing, x: number, y: number) =>
  t === "mug" ? <Mug x={x} y={y} /> : t === "glass" ? <ChaiGlass x={x} y={y} /> : <Tiffin x={x} y={y} scale={0.8} />;

const Back: React.FC<SetProps<KitchenOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.85} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#d6e8d8" />
        <Window id="kitchen" mood={mood} x={140} y={200} w={360} h={300} frame="#e8e2d2" />
        <rect x={128} y={496} width={384} height={18} rx={4} fill="#e8e2d2" stroke={INK} strokeWidth={4} />
        {/* the spice shelf and the steel plate rack */}
        <rect x={620} y={360} width={420} height={14} fill="#8a5c3b" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={636 + i * 56} y={316} width={40} height={44} rx={6} fill="#e9f3f4" opacity={0.85} stroke={INK} strokeWidth={3} />
            <rect x={640 + i * 56} y={334} width={32} height={24} rx={4} fill={["#e6a23c", "#d8344f", "#f3e9d7", "#9a6a44", "#5aa04a"][i % 5]} />
          </g>
        ))}
        <rect x={1090} y={210} width={300} height={170} rx={6} fill="none" stroke="#9aa1ab" strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={1130 + i * 44} cy={300} rx={18} ry={70} fill="#c9ced6" stroke={INK} strokeWidth={3} />)}
        {/* the tiled splashback */}
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={COUNTER.from + (i % 12) * 90} y={TOP - 190 + Math.floor(i / 12) * 90} width={86} height={86} fill={i % 2 ? "#eef3ea" : "#e1ebe0"} />)}
        <TubeLight x={840} y={150} w={300} on={on} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={FLOOR - 20} fill="#c98f5e" gap={200} slant={-80} />
        {/* the platform: red cupboards under a granite top */}
        <rect x={COUNTER.from} y={TOP} width={COUNTER.to - COUNTER.from} height={FLOOR - 20 - TOP} fill="#d8344f" />
        {[1, 2, 3].map((k) => <line key={k} x1={COUNTER.from + k * 270} y1={TOP + 20} x2={COUNTER.from + k * 270} y2={FLOOR - 20} stroke="#a82238" strokeWidth={7} />)}
        <rect x={COUNTER.from - 20} y={TOP - 18} width={COUNTER.to - COUNTER.from + 40} height={26} rx={7} fill="#4a4a52" stroke={INK} strokeWidth={5} />
        {/* the gas stove */}
        <rect x={STOVE - 150} y={TOP - 42} width={300} height={26} rx={6} fill="#2f3340" stroke={INK} strokeWidth={4} />
        {[-80, 80].map((dx) => <ellipse key={dx} cx={STOVE + dx} cy={TOP - 44} rx={42} ry={7} fill={options.stove !== "none" && dx < 0 ? "#5ab0ff" : "#3a3f4c"} />)}
        {options.stove === "cooker" && <PressureCooker x={STOVE - 80} y={TOP - 48} frame={frame} steam={options.steam} />}
        {options.stove === "kettle" && <Kettle x={STOVE - 80} y={TOP - 48} />}
        {options.counter.map((t, i) => <g key={i}>{thing(t, 1060 + i * 110, TOP - 18)}</g>)}
        {/* the fridge */}
        <rect x={1420} y={260} width={320} height={FLOOR - 280} rx={22} fill={PAPER} stroke={INK} strokeWidth={7} />
        <line x1={1420} y1={475} x2={1740} y2={475} stroke={INK} strokeWidth={7} />
        <rect x={1455} y={375} width={18} height={70} rx={8} fill={INK} /><rect x={1455} y={505} width={18} height={100} rx={8} fill={INK} />
        <rect x={1560} y={300} width={60} height={46} rx={4} fill="#f2b632" transform="rotate(-6 1590 323)" />
        <circle cx={1680} cy={540} r={16} fill="#1d9a8f" />
      </Deep>
    </>
  );
};

/** The doorway's edge at the right, soft in front. */
const Front: React.FC<SetProps<KitchenOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.4}>
    <rect x={1830} y={-400} width={160} height={1800} fill="#b9895f" stroke={INK} strokeWidth={6} />
  </Deep>
);

export const kitchen: SetDef<KitchenOptions> = {
  name: "kitchen",
  about: "home kitchen: window with a grille, granite platform, gas stove (pressure cooker or kettle), spice shelf, fridge",
  spots: {
    cook: { x: 560, y: FLOOR, scale: 1.15, facing: 1 },
    counter: { x: 1250, y: FLOOR, scale: 1.15, facing: -1 },
    fridge: { x: 1560, y: FLOOR + 10, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    stove: { x: 760, y: 620, zoom: 1.7 },
    twoShot: { x: 800, y: 620, zoom: 1.4 },
  },
  lights: () => [
    { x: 840, y: 160, depth: 0.85, r: 520, color: "#fdfbea", strength: 0.3, moods: LIGHTS_ON },
    { x: 320, y: 350, depth: 0.85, r: 380, color: "#fff2cc", strength: 0.35, moods: ["morning", "day"] },
  ],
  defaults: { stove: "cooker", steam: 0.6, counter: ["mug", "glass"] },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "cook", who: { ...MOTHER, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.sceptical, pose: { ...STAND, armF: [62, 40] } },
      { spot: "counter", who: { ...HERO, look: { x: 0.8, y: 0.2 } }, face: EXPRESSIONS.happy },
    ],
  },
};
