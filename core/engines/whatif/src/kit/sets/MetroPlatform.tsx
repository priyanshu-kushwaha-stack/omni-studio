// An elevated metro platform, side on. From "Nobody Could Say No" (sets/Metro.tsx, view "platform": the train with a
// door that slides open, the yellow edge) and "60 Seconds" (sets.tsx Platform: the pillars), opened up to the city so
// the mood reads: the far platform and the skyline under the sky, the canopy's strip lights on in the evening.
import { INK, PAPER } from "../theme";
import { DARK, Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, seat, Sky, Skyline, type SetDef, type SetProps } from "./common";
import { FRIEND, HERO, PASTELS } from "./cast";
import { EXPRESSIONS } from "../rig/expressions";

const FLOOR = 960;
const EDGE = 860;
const DOOR = 1250;
const BENCH = { x: 1640, top: 836 };

export interface MetroPlatformOptions {
  /** World px the train still has to travel to stop (0 stopped, null no train). */
  train: number | null;
  /** The door's leaves, 0 shut to 1 open. */
  doorOpen: number;
  /** Commuters waiting far down the platform. */
  crowd: boolean;
}

const Train: React.FC<{ x: number; doorOpen: number; lit: boolean }> = ({ x, doorOpen, lit }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-1400} y={330} width={4800} height={540} rx={30} fill="#c9ced8" stroke={INK} strokeWidth={7} />
    <rect x={-1400} y={720} width={4800} height={26} fill="#d8344f" />
    <rect x={-1400} y={360} width={4800} height={12} fill="#9aa1ab" />
    {Array.from({ length: 14 }, (_, i) => -1300 + i * 330).filter((wx) => Math.abs(wx + 90 - DOOR) > 200).map((wx) => (
      <rect key={wx} x={wx} y={420} width={180} height={150} rx={18} fill={lit ? "#ffe9b0" : "#bfe0ea"} stroke={INK} strokeWidth={6} />
    ))}
    <rect x={DOOR - 130} y={380} width={260} height={480} fill={lit ? "#fff1c9" : "#e8eef0"} />
    <rect x={DOOR - 130} y={760} width={260} height={100} fill="#8a92a2" />
    <rect x={DOOR - 130 - doorOpen * 120} y={380} width={130} height={480} fill="#b3bac6" stroke={INK} strokeWidth={6} />
    <rect x={DOOR + doorOpen * 120} y={380} width={130} height={480} fill="#b3bac6" stroke={INK} strokeWidth={6} />
    <rect x={DOOR - 150} y={370} width={300} height={500} fill="none" stroke={INK} strokeWidth={8} />
  </g>
);

const Back: React.FC<SetProps<MetroPlatformOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.2} flat>
        <Sky id="metro-platform" mood={mood} x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 400, y: 260 }} />
      </Deep>
      <Deep cam={cam} depth={0.35} flat>
        <Skyline mood={mood} from={-1400} to={3400} base={640} tall={420} seed={3} />
      </Deep>
      <Deep cam={cam} depth={0.55} flat>
        {/* the far platform: its slab, its canopy on posts, a few people waiting */}
        <rect x={-1400} y={560} width={4800} height={60} fill={dark ? "#3a3f52" : "#b8b2a4"} />
        <rect x={-1400} y={556} width={4800} height={10} fill="#e8c23a" />
        <path d="M-1400 250 H3400 V280 H-1400Z" fill={dark ? "#2a2f44" : "#8a94a0"} />
        {Array.from({ length: 13 }, (_, i) => <rect key={i} x={-1300 + i * 380} y={280} width={22} height={280} fill={dark ? "#2a2f44" : "#8a94a0"} />)}
        {options.crowd && Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(${-500 + i * 520 + noise(i) * 120} 556)`}>
            <rect x={-12} y={-70} width={24} height={70} rx={10} fill="#3b3e47" />
            <circle cx={0} cy={-88} r={20} fill={PASTELS[i % PASTELS.length]} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={0.8} flat>
        {/* the track bed and the rails */}
        <rect x={-1400} y={640} width={4800} height={240} fill="#4a4d55" />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1400 + i * 120} y={760} width={70} height={18} fill="#6a5a48" />)}
        <rect x={-1400} y={748} width={4800} height={8} fill="#a7adb6" />
        <rect x={-1400} y={790} width={4800} height={8} fill="#a7adb6" />
      </Deep>
      <Deep cam={cam} depth={1}>
        {options.train !== null && <Train x={options.train} doorOpen={options.doorOpen} lit={on} />}
        {/* our canopy: the roof edge and the strip lights */}
        <rect x={-1400} y={-800} width={4800} height={880} fill={dark ? "#30364c" : "#9aa3ad"} />
        <rect x={-1400} y={70} width={4800} height={24} fill={dark ? "#20253a" : "#7a8490"} />
        {[-600, 300, 1200, 2100].map((x) => <rect key={x} x={x} y={100} width={520} height={16} rx={8} fill={on ? "#eef4ff" : "#cfd6dc"} />)}
        {/* the platform: its edge, the yellow line, the slabs */}
        <rect x={-1400} y={EDGE} width={4800} height={800} fill="#a6a296" />
        <rect x={-1400} y={EDGE} width={4800} height={14} fill="#5c5a55" />
        <rect x={-1400} y={EDGE + 26} width={4800} height={16} fill="#e8c23a" />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 180} y1={EDGE + 44} x2={-1400 + i * 180 - 60} y2={1200} stroke="#8e8a80" strokeWidth={4} />)}
        {/* a pillar with the line's pictogram sign, and a steel bench */}
        <rect x={360} y={80} width={84} height={EDGE - 80} fill="#b8bec7" stroke={INK} strokeWidth={5} />
        <rect x={250} y={250} width={300} height={90} rx={10} fill="#22305a" stroke={INK} strokeWidth={5} />
        <path d="M290 295 H360 M340 275 L362 295 L340 315" fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={400} y={272} width={110} height={46} rx={14} fill={PAPER} />
        {[412, 446, 478].map((wx) => <rect key={wx} x={wx} y={282} width={22} height={14} rx={3} fill="#22305a" />)}
        <rect x={BENCH.x - 170} y={BENCH.top} width={340} height={16} rx={6} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
        <rect x={BENCH.x - 170} y={BENCH.top - 70} width={340} height={14} rx={6} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
        {[-140, 140].map((dx) => <rect key={dx} x={BENCH.x + dx - 6} y={BENCH.top - 60} width={12} height={FLOOR - BENCH.top + 60} fill="#6b7280" />)}
      </Deep>
    </>
  );
};

/** A near pillar at the left edge, soft with depth of field. */
const Front: React.FC<SetProps<MetroPlatformOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.4}>
    <rect x={20} y={-400} width={120} height={1800} fill="#8e96a0" stroke={INK} strokeWidth={6} />
  </Deep>
);

export const metroPlatform: SetDef<MetroPlatformOptions> = {
  name: "metro-platform",
  about: "elevated metro platform: a train that pulls in and opens its door, the far platform and the city beyond",
  spots: {
    hero: { x: 760, y: FLOOR, scale: 1.15, facing: 1 },
    waiting: { x: 1100, y: FLOOR, scale: 1.15, facing: -1 },
    door: { x: DOOR, y: EDGE, scale: 1.0, facing: -1 },
    bench: seat(BENCH.x, BENCH.top, 1.1, -1),
  },
  cameras: {
    wide: REF,
    twoShot: { x: 980, y: 640, zoom: 1.45 },
    door: { x: DOOR, y: 620, zoom: 1.7 },
  },
  lights: () => [
    { x: 560, y: 110, r: 420, color: "#eef4ff", strength: 0.35, moods: LIGHTS_ON },
    { x: 1460, y: 110, r: 420, color: "#eef4ff", strength: 0.35, moods: LIGHTS_ON },
    { x: DOOR, y: 560, r: 300, color: "#fff1c9", strength: 0.4, moods: DARK },
  ],
  defaults: { train: 0, doorOpen: 0, crowd: true },
  Back,
  Front,
  example: {
    camera: "wide",
    options: { train: 2500, doorOpen: 0 },
    cast: [
      { spot: "hero", who: { ...HERO, flow: 0.4 }, face: EXPRESSIONS.shocked },
      { spot: "waiting", who: { ...FRIEND, facing: 1, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
      { spot: "bench", who: { head: PASTELS[3], coat: "#5a6488" }, face: EXPRESSIONS.neutral },
    ],
  },
};
