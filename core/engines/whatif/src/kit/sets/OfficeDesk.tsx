// Your desk on an open office floor, side on. From "Nobody Could Say No" (sets/Office.tsx view "doorway": the desks
// with monitors, the boss's glass cabin, the carpet) and the pause film (FirstDays.Office.tsx), with rows of cubicles
// and colleagues' heads further back and the city in the tall windows.
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { BOSS, FRIEND, HERO, PASTELS } from "./cast";
import { Chair, Deep, defineSet, LIGHTS_ON, lightsOn, noise, OUTSIDE, seatedY, Skyline, Sky, TubeLight, type SetProps } from "./common";
import { Mug } from "./props";

const FLOOR = 960;
const DESK = { from: 860, to: 1380, top: 760 };
const CHAIR = { x: 780, top: 850 };
const CABIN = { from: 1560, door: 1640 };

export interface OfficeDeskOptions {
  /** What your monitor shows. */
  screen: "code" | "chart" | "mail" | "off";
  /** Colleagues' heads over the cubicles further back. */
  colleagues: boolean;
  /** Sticky notes on the monitor's edge. */
  notes: number;
}

const Monitor: React.FC<{ x: number; y: number; screen: OfficeDeskOptions["screen"]; notes: number; scale?: number }> = ({ x, y, screen, notes, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-12} y={-50} width={24} height={50} fill="#3b3e47" />
    <rect x={-60} y={-6} width={120} height={10} rx={4} fill="#3b3e47" />
    <rect x={-150} y={-230} width={300} height={186} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={5} />
    <rect x={-138} y={-218} width={276} height={162} rx={4} fill={screen === "off" ? "#1d2029" : "#eef1f5"} />
    {screen === "code" && [0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-124 + (i % 3) * 16} y={-204 + i * 24} width={70 + ((i * 41) % 110)} height={10} rx={5} fill={["#1d9a8f", "#d8344f", INK][i % 3]} opacity={0.7} />)}
    {screen === "chart" && <path d="M-120 -80 L-70 -110 L-20 -96 L40 -170 L120 -150" fill="none" stroke="#d8344f" strokeWidth={8} strokeLinejoin="round" />}
    {screen === "mail" && [0, 1, 2, 3].map((i) => (
      <g key={i}><circle cx={-110} cy={-190 + i * 38} r={12} fill={PASTELS[i]} /><rect x={-88} y={-196 + i * 38} width={180 - i * 20} height={12} rx={6} fill={INK} opacity={0.5} /></g>
    ))}
    {Array.from({ length: notes }, (_, i) => <rect key={i} x={110 + (i % 2) * 8} y={-226 + i * 40} width={44} height={40} fill={["#f2b632", "#e6a0a0", "#9fd8a8"][i % 3]} transform={`rotate(${i % 2 ? 6 : -4} ${132} ${-206 + i * 40})`} />)}
  </g>
);

const Back: React.FC<SetProps<OfficeDeskOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <Sky id="office" mood={mood} x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 300, y: 260 }} />
        <Skyline mood={mood} from={-1400} to={3400} base={640} tall={380} seed={5} />
      </Deep>
      <Deep cam={cam} depth={0.45} flat>
        {/* the office's far wall: tall windows between pillars */}
        <path d={`M-1400 -800 H3400 V900 H-1400Z ${Array.from({ length: 8 }, (_, i) => `M${-1100 + i * 560} 140 h460 v460 h-460Z`).join(" ")}`} fillRule="evenodd" fill={o.dark ? "#cfc8b8" : "#e9e4d8"} />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-870 + i * 560} 140 V600 M${-1100 + i * 560} 370 H${-640 + i * 560}`} stroke="#a5998a" strokeWidth={8} />)}
        <rect x={-1400} y={600} width={4800} height={300} fill={o.dark ? "#bfb7a6" : "#ddd6c6"} />
      </Deep>
      <Deep cam={cam} depth={0.72}>
        {/* the cubicle rows: partitions, monitor backs, colleagues' heads */}
        {Array.from({ length: 10 }, (_, i) => {
          const x = -1100 + i * 440;
          return (
            <g key={i}>
              {options.colleagues && noise(i + 3) > 0.25 && (
                <g transform={`translate(${x + 200 + Math.sin(frame / 60 + i) * 4} 0)`}>
                  <rect x={-26} y={590} width={52} height={80} rx={20} fill="#3b3e47" />
                  <circle cx={0} cy={566} r={34} fill={PASTELS[i % PASTELS.length]} />
                </g>
              )}
              <rect x={x} y={640} width={400} height={180} fill="#8a94a0" stroke={INK} strokeWidth={4} />
              <rect x={x + 60} y={560} width={120} height={84} rx={6} fill="#3b3e47" />
            </g>
          );
        })}
        {[-200, 700, 1600, 2500].map((x) => <TubeLight key={x} x={x} y={60} w={320} on={on} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 40} width={4800} height={800} fill="#8a94a0" />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 160} y1={FLOOR - 40} x2={-1400 + i * 160 - 90} y2={1700} stroke="#000" strokeWidth={3} opacity={0.05} />)}
        {/* the boss's glass cabin at the right */}
        <rect x={CABIN.from} y={200} width={900} height={FLOOR - 240} fill="#dcd5c4" />
        <rect x={CABIN.from + 260} y={720} width={340} height={20} rx={4} fill="#5b3c2a" stroke={INK} strokeWidth={5} />
        <rect x={CABIN.from + 280} y={740} width={300} height={180} fill="#6b4b3a" stroke={INK} strokeWidth={5} />
        <circle cx={CABIN.from + 520} cy={620} r={44} fill="#4c9a76" />
        <rect x={CABIN.from - 16} y={200} width={32} height={FLOOR - 240} fill="#7a6a58" stroke={INK} strokeWidth={5} />
        <rect x={CABIN.from - 16} y={190} width={960} height={30} fill="#7a6a58" stroke={INK} strokeWidth={5} />
        {/* your desk: the top, the legs, the monitor, the mug, a plant, the drawer */}
        <rect x={DESK.from} y={DESK.top} width={DESK.to - DESK.from} height={20} rx={4} fill="#c9a77a" stroke={INK} strokeWidth={5} />
        <rect x={DESK.from + 20} y={DESK.top + 20} width={14} height={FLOOR - DESK.top - 60} fill="#7a6a58" />
        <rect x={DESK.to - 150} y={DESK.top + 20} width={130} height={FLOOR - DESK.top - 60} rx={6} fill="#a88a68" stroke={INK} strokeWidth={4} />
        <Monitor x={1060} y={DESK.top} screen={options.screen} notes={options.notes} />
        <Mug x={1270} y={DESK.top} scale={0.8} />
        <rect x={1320} y={DESK.top - 50} width={40} height={50} rx={6} fill="#c96f2d" />
        {[-14, 0, 14].map((dx) => <ellipse key={dx} cx={1340 + dx} cy={DESK.top - 74} rx={10} ry={26} fill="#5ba06f" transform={`rotate(${dx * 2} ${1340 + dx} ${DESK.top - 60})`} />)}
        <Chair x={CHAIR.x} y={CHAIR.top} facing={1} color="#2f3242" />
      </Deep>
    </>
  );
};

/** The glass of the cabin over whoever is inside it, and a soft near partition at the bottom left. */
const Front: React.FC<SetProps<OfficeDeskOptions>> = ({ cam }) => (
  <>
    <Deep cam={cam} depth={1}>
      <rect x={CABIN.from + 16} y={220} width={900} height={FLOOR - 260} fill="#dff0f4" opacity={0.16} />
      {[0, 1].map((i) => <path key={i} d={`M${CABIN.from + 120 + i * 360} ${FLOOR - 60} L${CABIN.from + 260 + i * 360} 240`} stroke="#fff" strokeWidth={22} opacity={0.14} />)}
    </Deep>
    <Deep cam={cam} depth={1.35}>
      <rect x={-300} y={880} width={560} height={400} rx={8} fill="#8a94a0" stroke={INK} strokeWidth={6} />
    </Deep>
  </>
);

export const officeDesk = defineSet<OfficeDeskOptions>({
  name: "office-desk",
  about: "your desk on an open office floor: monitor, mug, plant, cubicles and colleagues behind, the boss's glass cabin",
  spots: {
    desk: { x: CHAIR.x, y: seatedY(CHAIR.top, 1.1), scale: 1.1, facing: 1, sit: true },
    behind: { x: 560, y: FLOOR + 10, scale: 1.15, facing: 1 },
    beside: { x: 1480, y: FLOOR + 10, scale: 1.15, facing: -1 },
    cabin: { x: CABIN.door + 140, y: FLOOR - 20, scale: 1.1, facing: -1 },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    desk: { x: 940, y: 620, zoom: 1.6 },
    screen: { x: 1060, y: 650, zoom: 2.6 },
  },
  lights: [
    { x: 700, y: 70, depth: 0.72, r: 600, color: "#fdfbea", strength: 0.25, moods: LIGHTS_ON },
    { x: 1060, y: 650, r: 260, color: "#cfe9f4", strength: 0.35, moods: ["night", "lamp"] },
  ],
  defaults: { screen: "code", colleagues: true, notes: 3 },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "desk", who: { ...HERO, look: { x: 0.9, y: 0.1 } }, face: EXPRESSIONS.determined },
      { spot: "beside", who: { ...FRIEND, look: { x: 0.8, y: 0.2 } }, face: EXPRESSIONS.happy },
      { spot: "cabin", who: { ...BOSS, look: { x: 0.6, y: 0 } }, face: EXPRESSIONS.sceptical },
    ],
  },
});
