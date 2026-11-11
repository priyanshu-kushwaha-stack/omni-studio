// A school corridor, side on: classroom doors and windows along the wall (heads at the desks inside), the notice
// board, the water cooler, the bell, a chequered floor, and the open side's pillars in front. Built for the library
// from the coaching class (the far row of heads) and the pause film's office hallway (doors along a wall).
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { FRIEND, HERO, PASTELS, TEACHER } from "./cast";
import { Deep, LIGHTS_ON, lightsOn, OUTSIDE, REF, TubeLight, type SetDef, type SetProps } from "./common";
import { Backpack } from "./props";

const FLOOR = 960;
const DOORS = [180, 1180];
const WINDOWS = [480, 1480];

export interface SchoolCorridorOptions {
  /** The bell on the wall is ringing (lines shake out of it on `frame`). */
  bell: boolean;
  /** Students' heads in the classroom windows. */
  classes: boolean;
  /** Bags lined up along the wall. */
  bags: boolean;
}

const Back: React.FC<SetProps<SchoolCorridorOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#b9c79f" : "#dfe8c4"} />
        <rect x={-1400} y={600} width={4800} height={360} fill={dark ? "#8fa07a" : "#b7c99a"} />
        <rect x={-1400} y={590} width={4800} height={14} fill="#7f9064" />
        {DOORS.map((x) => (
          <g key={x}>
            <rect x={x - 10} y={250} width={220} height={FLOOR - 250} fill="#2f6d68" stroke={INK} strokeWidth={5} />
            <rect x={x + 30} y={300} width={140} height={110} fill={on ? "#ffe9b0" : "#cfe6ec"} stroke={INK} strokeWidth={4} />
            <circle cx={x + 170} cy={620} r={10} fill="#e8c23a" />
          </g>
        ))}
        {WINDOWS.map((x, w) => (
          <g key={x}>
            <rect x={x} y={250} width={460} height={230} fill={on ? "#fff1c9" : "#e8f2f4"} stroke={INK} strokeWidth={5} />
            {options.classes && Array.from({ length: 5 }, (_, i) => (
              <g key={i} transform={`translate(${x + 60 + i * 86} ${430 + Math.sin(frame / 40 + i + w) * 2})`}>
                <rect x={-18} y={0} width={36} height={60} rx={14} fill="#3b3e47" />
                <circle cx={0} cy={-22} r={24} fill={PASTELS[(i * 3 + w) % PASTELS.length]} />
              </g>
            ))}
            {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x + 30 + i * 80} y1={250} x2={x + 30 + i * 80} y2={480} stroke={INK} strokeWidth={4} opacity={0.7} />)}
          </g>
        ))}
        {/* the notice board, the bell, the cooler */}
        <rect x={720} y={220} width={340} height={230} rx={6} fill="#a87c52" stroke={INK} strokeWidth={5} />
        {[[740, 240, "#f3e9d7"], [860, 250, "#f2b632"], [960, 236, "#9fd8a8"], [760, 350, "#e6a0a0"], [900, 340, "#f3e9d7"]].map(([x, y, c], i) => (
          <rect key={i} x={Number(x)} y={Number(y)} width={90} height={84} fill={String(c)} transform={`rotate(${(i % 3) - 1} ${Number(x) + 45} ${Number(y) + 42})`} />
        ))}
        <circle cx={1110} cy={200} r={26} fill="#c9a33a" stroke={INK} strokeWidth={4} />
        {options.bell && [0, 1, 2].map((i) => {
          const p = ((frame / 8 + i / 3) % 1);
          return <path key={i} d={`M${1146 + p * 30} ${180 - p * 10} q12 20 0 40`} fill="none" stroke={INK} strokeWidth={4} opacity={1 - p} />;
        })}
        <rect x={980} y={640} width={130} height={300} rx={10} fill="#c9ced6" stroke={INK} strokeWidth={5} />
        <rect x={1000} y={700} width={22} height={14} rx={4} fill={INK} />
        <TubeLight x={900} y={120} w={300} on={on} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 20} width={4800} height={800} fill="#c9c2b0" />
        {Array.from({ length: 40 }, (_, i) => Array.from({ length: 4 }, (_, r) => (
          (i + r) % 2 === 0 ? <rect key={`${i}-${r}`} x={-1400 + i * 120 - r * 40} y={FLOOR - 20 + r * 60} width={120} height={60} fill="#a9a08e" /> : null
        )))}
        {options.bags && [240, 330, 1300].map((x, i) => <Backpack key={x} x={x} y={FLOOR - 16} scale={0.8} color={["#3d6fb0", "#d8344f", "#1d9a8f"][i]} />)}
      </Deep>
    </>
  );
};

/** The open side's pillars, soft in front. */
const Front: React.FC<SetProps<SchoolCorridorOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.4}>
    {[60, 1780].map((x) => <rect key={x} x={x} y={-400} width={110} height={1800} fill="#e6d7b6" stroke={INK} strokeWidth={6} />)}
  </Deep>
);

export const schoolCorridor: SetDef<SchoolCorridorOptions> = {
  name: "school-corridor",
  about: "school corridor: classroom doors and windows with heads inside, notice board, bell, water cooler, pillars",
  spots: {
    hero: { x: 700, y: FLOOR, scale: 1.15, facing: 1 },
    friend: { x: 920, y: FLOOR, scale: 1.15, facing: -1 },
    door: { x: DOORS[1] + 100, y: FLOOR - 10, scale: 1.15, facing: -1 },
    cooler: { x: 1150, y: FLOOR + 10, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    twoShot: { x: 820, y: 620, zoom: 1.5 },
    board: { x: 890, y: 340, zoom: 2 },
  },
  lights: () => [{ x: 900, y: 130, depth: 0.8, r: 600, color: "#fdfbea", strength: 0.3, moods: LIGHTS_ON }],
  defaults: { bell: false, classes: true, bags: true },
  Back,
  Front,
  example: {
    camera: "wide",
    options: { bell: true },
    cast: [
      { spot: "hero", who: { ...HERO, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.worried },
      { spot: "friend", who: { ...FRIEND, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
      { spot: "door", who: { ...TEACHER, look: { x: 0.6, y: 0 } }, face: EXPRESSIONS.sceptical },
    ],
  },
};
