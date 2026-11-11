// An ATM cabin on a street, side on: the machine with its screen and cash slot, the guard on his stool by the glass
// door, the bank's colour band, the street outside through the glass, a queue on the pavement. Built for the library
// from the street (pavement, skyline) and the phone (screens drawn as shapes and ink bars, never words).
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK, PAPER } from "../theme";
import { CONDUCTOR, HERO, PASTELS } from "./cast";
import { DARK, Deep, Floor, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, Sky, Skyline, TubeLight, type SetDef, type SetProps } from "./common";

const FLOOR = 960;
const ATM = { x: 1400, y: 300 };
const GLASS = { from: 420, to: 1060 };
const STOOL = { x: 280, top: 860 };

export interface BankAtmOptions {
  /** What the screen shows. */
  screen: "menu" | "cash" | "error";
  /** Notes sticking out of the slot, 0 to 1. */
  cash: number;
  /** People queueing outside on the pavement. */
  queue: number;
}

const Note: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-60} y={-24} width={120} height={48} rx={4} fill="#c9a0d6" stroke={INK} strokeWidth={3} />
    <circle cx={22} cy={0} r={14} fill="#a87cc0" />
  </g>
);

const Back: React.FC<SetProps<BankAtmOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const o = OUTSIDE[mood];
  const sc = options.screen;
  return (
    <>
      <Deep cam={cam} depth={0.2} flat>
        <Sky id="atm" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 700, y: 260 }} />
        <Skyline mood={mood} from={-1400} to={3400} base={760} tall={360} seed={4} />
      </Deep>
      <Deep cam={cam} depth={0.6}>
        <rect x={-1400} y={760} width={4800} height={600} fill={o.dark ? "#5f5a54" : "#cfc2a6"} />
        {Array.from({ length: Math.min(4, options.queue) }, (_, i) => (
          <g key={i} transform={`translate(${520 + i * 140} 900)`}>
            <rect x={-24} y={-150} width={48} height={150} rx={18} fill={["#5a6488", "#7a5a8c", "#6d7f8f", "#8a5c3b"][i]} />
            <circle cx={0} cy={-180} r={34} fill={PASTELS[(i * 3 + 2) % PASTELS.length]} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the cabin: walls round the glass front, the bank's band, the floor */}
        <path d={`M-1400 -800 H3400 V1600 H-1400Z M${GLASS.from} 200 H${GLASS.to} V${FLOOR - 20} H${GLASS.from}Z`} fillRule="evenodd" fill={o.dark ? "#cfd6dc" : "#eef1f4"} />
        <rect x={-1400} y={120} width={4800} height={60} fill="#3d6fb0" />
        <rect x={-1400} y={180} width={4800} height={14} fill="#f2b632" />
        <Floor y={FLOOR - 20} fill="#b9c0c8" gap={240} slant={-100} opacity={0.06} />
        <TubeLight x={1500} y={230} w={260} on={on} />
        {/* the machine */}
        <rect x={ATM.x - 30} y={ATM.y} width={340} height={FLOOR - ATM.y - 20} rx={14} fill="#5c6675" stroke={INK} strokeWidth={6} />
        <rect x={ATM.x} y={ATM.y + 40} width={280} height={190} rx={8} fill={sc === "error" ? "#ffd8d8" : "#cfe9f4"} stroke={INK} strokeWidth={5} />
        {sc === "menu" && [0, 1, 2, 3].map((i) => <rect key={i} x={ATM.x + (i % 2 ? 150 : 20)} y={ATM.y + 70 + Math.floor(i / 2) * 70} width={110} height={44} rx={8} fill="#3d6fb0" opacity={0.8} />)}
        {sc === "cash" && <g><Note x={ATM.x + 140} y={ATM.y + 130} r={-6} /><rect x={ATM.x + 60} y={ATM.y + 190} width={160} height={14} rx={7} fill={INK} opacity={0.5} /></g>}
        {sc === "error" && <g><circle cx={ATM.x + 140} cy={ATM.y + 120} r={50} fill="#d8344f" /><rect x={ATM.x + 132} y={ATM.y + 90} width={16} height={44} rx={6} fill={PAPER} /><circle cx={ATM.x + 140} cy={ATM.y + 150} r={9} fill={PAPER} /></g>}
        <rect x={ATM.x + 20} y={ATM.y + 260} width={240} height={110} rx={8} fill="#3b3e47" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={ATM.x + 36 + (i % 4) * 56} y={ATM.y + 272 + Math.floor(i / 4) * 32} width={44} height={24} rx={4} fill="#c9ced6" />)}
        <rect x={ATM.x + 40} y={ATM.y + 410} width={200} height={20} rx={6} fill={INK} />
        {options.cash > 0 && [0, 1, 2].map((k) => <Note key={k} x={ATM.x + 140 + k * 6} y={ATM.y + 420 + options.cash * 40 - k * 6} r={k * 4 - 4} />)}
        {Math.floor(frame / 15) % 2 === 0 && <circle cx={ATM.x + 280} cy={ATM.y + 20} r={8} fill="#3fbf7f" />}
        {/* the guard's stool */}
        <rect x={STOOL.x - 50} y={STOOL.top} width={100} height={16} rx={6} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
        {[-40, 30].map((dx) => <rect key={dx} x={STOOL.x + dx} y={STOOL.top + 16} width={10} height={FLOOR - STOOL.top - 36} fill="#4a3a30" />)}
      </Deep>
    </>
  );
};

/** The glass front over the street: pale panes, a streak, the door's steel handle. */
const Front: React.FC<SetProps<BankAtmOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1}>
    <rect x={GLASS.from} y={200} width={GLASS.to - GLASS.from} height={FLOOR - 220} fill="#dff0f4" opacity={0.18} />
    <line x1={(GLASS.from + GLASS.to) / 2} y1={200} x2={(GLASS.from + GLASS.to) / 2} y2={FLOOR - 20} stroke="#9aa3ad" strokeWidth={10} />
    <path d={`M${GLASS.from + 80} ${FLOOR - 60} L${GLASS.from + 220} 240`} stroke="#fff" strokeWidth={26} opacity={0.14} />
    <rect x={(GLASS.from + GLASS.to) / 2 + 20} y={520} width={14} height={160} rx={7} fill="#c9ced6" stroke={INK} strokeWidth={3} />
  </Deep>
);

export const bankAtm: SetDef<BankAtmOptions> = {
  name: "bank-atm",
  about: "ATM cabin: the machine (menu, cash or error on its screen, notes out of the slot), the guard's stool, a queue",
  spots: {
    atm: { x: ATM.x - 120, y: FLOOR, scale: 1.15, facing: 1 },
    guard: seat(STOOL.x, STOOL.top, 1.1, 1),
    door: { x: 860, y: FLOOR, scale: 1.15, facing: 1 },
  },
  cameras: {
    wide: REF,
    screen: { x: ATM.x + 140, y: ATM.y + 140, zoom: 3 },
    slot: { x: ATM.x + 140, y: ATM.y + 420, zoom: 3 },
  },
  lights: () => [
    { x: 1500, y: 240, r: 600, color: "#eef4ff", strength: 0.3, moods: LIGHTS_ON },
    { x: ATM.x + 140, y: ATM.y + 140, r: 260, color: "#cfe9f4", strength: 0.35, moods: DARK },
  ],
  defaults: { screen: "menu", cash: 0, queue: 2 },
  Back,
  Front,
  example: {
    camera: "wide",
    options: { screen: "cash", cash: 1 },
    cast: [
      { spot: "guard", who: { ...CONDUCTOR, look: { x: 0.8, y: 0.2 } }, face: EXPRESSIONS.sceptical },
      { spot: "atm", who: { ...HERO, look: { x: 0.8, y: 0.4 } }, face: EXPRESSIONS.shocked, pose: { ...STAND, armF: [60, 40] } },
    ],
  },
};
