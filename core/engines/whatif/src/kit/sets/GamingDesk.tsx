// A gaming setup in your room, side on: the big monitor with the game on it, the RGB light strip and keyboard glow,
// the gaming chair, headphones on a stand, posters, a dark window. Built for the library from the bedroom (window,
// desk) and the office desk (monitor). The RGB colour cycles on `frame` unless fixed.
import { EXPRESSIONS } from "../rig/expressions";
import { CRIMSON, INK, MUSTARD, TEAL } from "../theme";
import { HERO, SIBLING } from "./cast";
import { DARK, Deep, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, SEATED, Window, type SetDef, type SetProps } from "./common";

const FLOOR = 960;
const DESK = { from: 900, to: 1560, top: 740 };
const MONITOR = { x: 1240, y: 520 };
const CHAIR = { x: 760, top: 830 };
const RGB = ["#ff3bd4", "#3bc8ff", "#7dff6a", "#ffcf3b"];

export interface GamingDeskOptions {
  /** What the monitor shows. */
  screen: "game" | "stream" | "off";
  /** The RGB colour: null cycles on `frame`, or fix one. */
  rgb: string | null;
  /** The game's progress bar / health, 0 to 1. */
  health: number;
}

const Screen: React.FC<{ mode: GamingDeskOptions["screen"]; frame: number; health: number }> = ({ mode, frame, health }) => {
  const { x, y } = MONITOR;
  if (mode === "off") return <rect x={x - 250} y={y - 150} width={500} height={280} fill="#14161c" />;
  if (mode === "stream") {
    return (
      <g>
        <rect x={x - 250} y={y - 150} width={500} height={280} fill="#2f3550" />
        <rect x={x - 230} y={y - 130} width={320} height={190} fill="#4c9a76" />
        <circle cx={x - 70} cy={y - 40} r={40} fill={MUSTARD} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x + 110} y={y - 120 + i * 34} width={110 - (i * 23) % 50} height={14} rx={7} fill="#f3e9d7" opacity={0.7} />)}
        <circle cx={x - 210} cy={y - 115} r={10} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.4} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x - 250} y={y - 150} width={500} height={280} fill="#1b2240" />
      <path d={`M${x - 250} ${y + 90} L${x - 120} ${y - 10} L${x - 20} ${y + 60} L${x + 110} ${y - 60} L${x + 250} ${y + 70} V${y + 130} H${x - 250}Z`} fill="#3d4a7a" />
      <path d={`M${x - 40} ${y + 40} l30 -60 l30 60Z`} fill={TEAL} stroke="#fff" strokeWidth={3} />
      {[0, 1, 2].map((i) => <circle key={i} cx={x + 80 + i * 50} cy={y - 40 + Math.sin(frame / 6 + i) * 20} r={14} fill={CRIMSON} />)}
      <rect x={x - 230} y={y - 136} width={180} height={16} rx={8} fill="#3a3f4c" />
      <rect x={x - 230} y={y - 136} width={180 * health} height={16} rx={8} fill="#7dff6a" />
    </g>
  );
};

const Back: React.FC<SetProps<GamingDeskOptions>> = ({ cam, mood, frame, options }) => {
  const dark = OUTSIDE[mood].dark;
  const rgb = options.rgb ?? RGB[Math.floor(frame / 20) % RGB.length];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.85} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#2e2f4a" : "#585a78"} />
        <Window id="gaming" mood={mood} x={60} y={200} w={340} h={300} frame="#23252b" />
        {/* posters: a controller, a game hero */}
        <rect x={520} y={200} width={200} height={270} fill="#1b2240" stroke={INK} strokeWidth={5} />
        <path d="M560 360 q60 -60 120 0 q20 40 -10 50 l-30 -24 h-40 l-30 24 q-30 -10 -10 -50Z" fill={rgb} opacity={0.85} />
        <rect x={1650} y={200} width={190} height={260} fill="#d8344f" stroke={INK} strokeWidth={5} />
        <circle cx={1745} cy={290} r={50} fill={MUSTARD} />
        {/* the RGB strip along the wall behind the desk */}
        <rect x={DESK.from - 40} y={DESK.top - 360} width={DESK.to - DESK.from + 80} height={8} rx={4} fill={rgb} />
        <rect x={DESK.from - 80} y={DESK.top - 400} width={DESK.to - DESK.from + 160} height={90} rx={40} fill={rgb} opacity={on ? 0.25 : 0.12} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 40} width={4800} height={800} fill="#3a3550" />
        <rect x={DESK.from} y={DESK.top} width={DESK.to - DESK.from} height={22} rx={5} fill={INK} stroke="#000" strokeWidth={4} />
        {[DESK.from + 20, DESK.to - 40].map((x) => <rect key={x} x={x} y={DESK.top + 22} width={20} height={FLOOR - DESK.top - 62} fill="#1b1d24" />)}
        <rect x={DESK.from - 10} y={DESK.top + 18} width={DESK.to - DESK.from + 20} height={6} fill={rgb} />
        {/* the monitor on its arm, the keyboard and mouse glowing */}
        <rect x={MONITOR.x - 14} y={MONITOR.y + 140} width={28} height={DESK.top - MONITOR.y - 140} fill="#2a2d36" />
        <rect x={MONITOR.x - 270} y={MONITOR.y - 170} width={540} height={320} rx={12} fill="#14161c" stroke={INK} strokeWidth={6} />
        <Screen mode={options.screen} frame={frame} health={options.health} />
        <rect x={1000} y={DESK.top - 18} width={240} height={18} rx={4} fill="#2a2d36" />
        <rect x={1004} y={DESK.top - 6} width={232} height={4} fill={rgb} />
        <ellipse cx={1320} cy={DESK.top - 10} rx={26} ry={12} fill="#2a2d36" stroke={rgb} strokeWidth={3} />
        {/* headphones on their stand */}
        <rect x={1470} y={DESK.top - 160} width={12} height={160} fill="#2a2d36" />
        <path d={`M1430 ${DESK.top - 100} Q1476 ${DESK.top - 210} 1522 ${DESK.top - 100}`} fill="none" stroke="#2a2d36" strokeWidth={14} />
        {[1430, 1522].map((x) => <rect key={x} x={x - 18} y={DESK.top - 120} width={36} height={56} rx={14} fill="#2a2d36" stroke={rgb} strokeWidth={3} />)}
        {/* the gaming chair */}
        <path d={`M${CHAIR.x - 90} ${CHAIR.top - 330} Q${CHAIR.x - 110} ${CHAIR.top - 360} ${CHAIR.x - 40} ${CHAIR.top - 360} L${CHAIR.x - 30} ${CHAIR.top}  H${CHAIR.x - 90}Z`} fill={CRIMSON} stroke={INK} strokeWidth={5} />
        <rect x={CHAIR.x - 90} y={CHAIR.top} width={170} height={26} rx={10} fill="#23252b" stroke={INK} strokeWidth={4} />
        <rect x={CHAIR.x - 10} y={CHAIR.top + 26} width={16} height={60} fill="#3b3e47" />
        <path d={`M${CHAIR.x - 70} ${FLOOR - 30} H${CHAIR.x + 80}`} stroke="#3b3e47" strokeWidth={12} strokeLinecap="round" />
      </Deep>
    </>
  );
};

export const gamingDesk: SetDef<GamingDeskOptions> = {
  name: "gaming-desk",
  about: "gaming setup: big monitor (game, stream or off), RGB strip and keyboard glow, gaming chair, headphones, posters",
  spots: {
    chair: seat(CHAIR.x, CHAIR.top, 1.1, 1),
    behind: { x: 480, y: FLOOR, scale: 1.15, facing: 1 },
    door: { x: 1760, y: FLOOR, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    screen: { x: MONITOR.x, y: MONITOR.y, zoom: 2.4 },
    overShoulder: { x: 1000, y: 560, zoom: 1.6 },
  },
  lights: () => [
    { x: MONITOR.x, y: MONITOR.y, r: 520, color: "#9fb7ff", strength: 0.4, moods: LIGHTS_ON },
    { x: 1230, y: DESK.top - 360, depth: 0.85, r: 500, color: "#ff3bd4", strength: 0.2, moods: DARK },
  ],
  defaults: { screen: "game", rgb: null, health: 0.35 },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "chair", who: { ...HERO, look: { x: 1, y: -0.3 } }, face: EXPRESSIONS.determined, pose: { ...SEATED, armF: [70, 30] } },
      { spot: "door", who: { ...SIBLING, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.sceptical },
    ],
  },
};
