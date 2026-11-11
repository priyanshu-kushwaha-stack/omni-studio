// A hospital corridor, side on: pale green walls, the steel waiting bench, the theatre doors with the red lamp over
// them, a wheelchair, a drip stand, the cross sign, tube lights. Built for the library from the school corridor and
// the office (doors along a wall, a bench to wait on). The red lamp is the scene's clock: on while someone is inside.
import { EXPRESSIONS } from "../rig/expressions";
import { INK, PAPER } from "../theme";
import { ELDER, FATHER, HERO } from "./cast";
import { Deep, Floor, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, TubeLight, Window, type SetDef, type SetProps } from "./common";

const FLOOR = 960;
const BENCH = { from: 300, to: 980, top: 850 };
const DOOR = { x: 1380, top: 300 };

export interface HospitalCorridorOptions {
  /** The red lamp over the theatre doors. */
  inUse: boolean;
  /** A wheelchair by the wall. */
  wheelchair: boolean;
  /** A drip stand by the bench. */
  drip: boolean;
}

const Back: React.FC<SetProps<HospitalCorridorOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#a9c2b4" : "#d4e8dc"} />
        <rect x={-1400} y={640} width={4800} height={320} fill={dark ? "#8fae9e" : "#b7d6c6"} />
        <Window id="hospital" mood={mood} x={-260} y={220} w={380} h={300} frame="#9aa3ad" bars={false} />
        {/* the cross sign and a chart of the body (shapes, no words) */}
        <rect x={420} y={230} width={130} height={130} rx={12} fill={PAPER} stroke={INK} strokeWidth={4} />
        <path d="M465 255 h40 v35 h35 v40 h-35 v35 h-40 v-35 h-35 v-40 h35Z" fill="#d8344f" />
        <rect x={640} y={230} width={200} height={260} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
        <circle cx={740} cy={280} r={24} fill="#e6a0a0" />
        <path d="M710 310 h60 l10 100 h-80Z M720 410 l-10 60 M760 410 l10 60" fill="#e6a0a0" stroke="#c97a7a" strokeWidth={6} />
        <TubeLight x={560} y={120} w={300} on={on} />
        <TubeLight x={1500} y={120} w={300} on={on} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={FLOOR - 20} fill="#c9d2cc" gap={160} slant={-80} opacity={0.05} />
        {/* the theatre doors and the lamp */}
        <rect x={DOOR.x - 30} y={DOOR.top - 30} width={460} height={FLOOR - DOOR.top + 10} fill="#9aa3ad" stroke={INK} strokeWidth={5} />
        {[0, 1].map((k) => (
          <g key={k}>
            <rect x={DOOR.x + k * 200} y={DOOR.top} width={196} height={FLOOR - DOOR.top - 20} fill="#e8eef0" stroke={INK} strokeWidth={5} />
            <rect x={DOOR.x + 50 + k * 200} y={DOOR.top + 80} width={96} height={70} rx={8} fill={options.inUse ? "#ffe9e0" : "#cfe6ec"} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        <rect x={DOOR.x + 140} y={DOOR.top - 90} width={120} height={50} rx={10} fill={INK} />
        <circle cx={DOOR.x + 200} cy={DOOR.top - 65} r={18} fill={options.inUse ? "#ff3b4f" : "#5a2a32"} />
        {options.inUse && <circle cx={DOOR.x + 200} cy={DOOR.top - 65} r={40 + Math.sin(frame * 0.2) * 6} fill="#ff3b4f" opacity={0.3} />}
        {/* the steel waiting bench */}
        <rect x={BENCH.from} y={BENCH.top} width={BENCH.to - BENCH.from} height={16} rx={6} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
        <rect x={BENCH.from} y={BENCH.top - 90} width={BENCH.to - BENCH.from} height={14} rx={6} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
        {[BENCH.from + 30, BENCH.to - 40].map((x) => <rect key={x} x={x} y={BENCH.top - 80} width={12} height={FLOOR - BENCH.top + 60} fill="#6b7280" />)}
        {options.drip && (
          <g transform="translate(1100 0)">
            <rect x={-4} y={420} width={8} height={FLOOR - 440} fill="#9aa1ab" />
            <path d={`M-40 ${FLOOR - 20} L0 ${FLOOR - 50} L40 ${FLOOR - 20}`} fill="none" stroke="#9aa1ab" strokeWidth={6} />
            <rect x={-28} y={430} width={56} height={80} rx={14} fill="#e9f3f4" opacity={0.85} stroke={INK} strokeWidth={3} />
            <path d="M0 510 Q30 600 10 700" fill="none" stroke="#9fb7c4" strokeWidth={3} />
          </g>
        )}
        {options.wheelchair && (
          <g transform="translate(1900 900)">
            <circle cx={0} cy={0} r={60} fill="none" stroke={INK} strokeWidth={8} />
            <path d="M-50 -60 H50 V-150 M-50 -60 L-70 -10" fill="none" stroke="#5c6675" strokeWidth={10} strokeLinecap="round" />
            <rect x={-50} y={-80} width={100} height={22} rx={6} fill="#3d6fb0" />
          </g>
        )}
      </Deep>
    </>
  );
};

export const hospitalCorridor: SetDef<HospitalCorridorOptions> = {
  name: "hospital-corridor",
  about: "hospital corridor: steel waiting bench, theatre doors with the red lamp, drip stand, wheelchair, tube lights",
  spots: {
    bench1: seat(480, BENCH.top, 1.1, 1),
    bench2: seat(760, BENCH.top, 1.1, 1),
    doors: { x: DOOR.x + 200, y: FLOOR - 10, scale: 1.15, facing: -1 },
    pacing: { x: 1180, y: FLOOR + 10, scale: 1.15, facing: 1 },
  },
  cameras: {
    wide: REF,
    bench: { x: 640, y: 620, zoom: 1.6 },
    lamp: { x: DOOR.x + 200, y: DOOR.top, zoom: 2.4 },
  },
  lights: () => [
    { x: 1030, y: 130, depth: 0.8, r: 800, color: "#f2fff6", strength: 0.25, moods: LIGHTS_ON },
    { x: DOOR.x + 200, y: DOOR.top - 65, r: 160, color: "#ff3b4f", strength: 0.45, moods: LIGHTS_ON },
  ],
  defaults: { inUse: true, wheelchair: true, drip: true },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "bench1", who: { ...ELDER, look: { x: 0.8, y: 0.4 } }, face: EXPRESSIONS.sad },
      { spot: "bench2", who: { ...HERO, look: { x: 0.9, y: -0.3 } }, face: EXPRESSIONS.worried },
      { spot: "pacing", who: { ...FATHER, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.worried },
    ],
  },
};
