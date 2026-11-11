// An exam hall, side on: single desks in a row, answer sheets, the big wall clock, a blackboard with chalk lines, high
// windows, the far rows' heads bent over their papers, the invigilator walking. Built for the library from the
// coaching class (far row, bench desks) and the pause film's bedroom clock (settable hands). Seat the students
// (`behind`); the desks (Mid) go over their laps.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK, PAPER } from "../theme";
import { HERO, PASTELS, TEACHER } from "./cast";
import { Deep, Fan, Floor, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, TubeLight, Window, type SetDef, type SetProps } from "./common";

const FLOOR = 960;
const SEAT_TOP = 850;
const SEATS = [300, 720, 1140];
const CLOCK = { x: 1500, y: 260 };

export interface ExamHallOptions {
  /** The wall clock's minute hand (0-59); the hour hand sits near 11. */
  minute: number;
  /** Answer sheets on the desks. */
  papers: boolean;
  /** The far rows of heads bent over their papers. */
  farRows: boolean;
}

const Back: React.FC<SetProps<ExamHallOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  const m = (options.minute / 60) * Math.PI * 2;
  const h = ((10 + options.minute / 60) / 12) * Math.PI * 2;
  return (
    <>
      <Deep cam={cam} depth={0.7} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#cdbf9d" : "#efe2c2"} />
        {[-60, 380].map((x, i) => <Window key={x} id={`exam-${i}`} mood={mood} x={x} y={120} w={300} h={180} frame="#6b7a72" />)}
        <rect x={700} y={170} width={560} height={280} rx={6} fill="#2f4a3e" stroke="#6b4b3a" strokeWidth={14} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${740 + i * 20} ${220 + i * 70} q120 -20 240 0 t200 0`} fill="none" stroke="#f3e9d7" strokeWidth={6} opacity={0.75} />)}
        {options.farRows && Array.from({ length: 2 }, (_, r) => Array.from({ length: 10 }, (_, i) => (
          <g key={`${r}-${i}`} transform={`translate(${-200 + i * 220 + r * 110} ${600 + r * 60})`}>
            <rect x={-22} y={0} width={44} height={70} rx={16} fill="#3b3e47" />
            <circle cx={10} cy={-20} r={28} fill={PASTELS[(i * 3 + r) % PASTELS.length]} />
            <rect x={30} y={30} width={120} height={14} fill="#8a5c3b" />
          </g>
        )))}
        <TubeLight x={1000} y={90} w={300} on={on} />
      </Deep>
      <Deep cam={cam} depth={0.9}>
        <circle cx={CLOCK.x} cy={CLOCK.y} r={110} fill={PAPER} stroke={INK} strokeWidth={12} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={CLOCK.x + Math.sin(a) * 86} y1={CLOCK.y - Math.cos(a) * 86} x2={CLOCK.x + Math.sin(a) * 98} y2={CLOCK.y - Math.cos(a) * 98} stroke={INK} strokeWidth={5} />;
        })}
        <line x1={CLOCK.x} y1={CLOCK.y} x2={CLOCK.x + Math.sin(h) * 50} y2={CLOCK.y - Math.cos(h) * 50} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <line x1={CLOCK.x} y1={CLOCK.y} x2={CLOCK.x + Math.sin(m) * 80} y2={CLOCK.y - Math.cos(m) * 80} stroke="#d8344f" strokeWidth={6} strokeLinecap="round" />
      </Deep>
      <Deep cam={cam} depth={1} flat>
        <Fan x={500} y={60} frame={frame} scale={0.8} />
        <Floor y={FLOOR - 30} fill="#b5a68a" gap={200} slant={-100} />
        {SEATS.map((x) => (
          <g key={x}>
            <rect x={x - 70} y={SEAT_TOP} width={150} height={16} rx={5} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
            {[-60, 60].map((dx) => <rect key={dx} x={x + dx} y={SEAT_TOP + 16} width={12} height={FLOOR - SEAT_TOP - 46} fill="#4a3a30" />)}
          </g>
        ))}
      </Deep>
    </>
  );
};

/** A desk in front of each seat, an answer sheet on it. */
const Mid: React.FC<SetProps<ExamHallOptions>> = ({ options }) => (
  <g>
    {SEATS.map((x) => (
      <g key={x}>
        <rect x={x + 70} y={770} width={200} height={18} rx={4} fill="#a87c52" stroke={INK} strokeWidth={4} />
        <rect x={x + 240} y={788} width={14} height={FLOOR - 818} fill="#6a4630" />
        {options.papers && <rect x={x + 100} y={760} width={120} height={12} rx={2} fill={PAPER} stroke={INK} strokeWidth={2} />}
      </g>
    ))}
  </g>
);

export const examHall: SetDef<ExamHallOptions> = {
  name: "exam-hall",
  about: "exam hall: single desks with answer sheets, the big wall clock (settable), blackboard, far rows bent over papers",
  spots: {
    seat1: seat(SEATS[0], SEAT_TOP, 1.05, 1),
    seat2: seat(SEATS[1], SEAT_TOP, 1.05, 1),
    seat3: seat(SEATS[2], SEAT_TOP, 1.05, 1),
    invigilator: { x: 1640, y: FLOOR + 10, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    clock: { x: CLOCK.x, y: CLOCK.y, zoom: 2.6 },
    desk: { x: SEATS[1] + 80, y: 660, zoom: 1.8 },
  },
  lights: () => [{ x: 1000, y: 100, depth: 0.7, r: 700, color: "#fdfbea", strength: 0.28, moods: LIGHTS_ON }],
  defaults: { minute: 50, papers: true, farRows: true },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [
      { spot: "seat1", who: { head: PASTELS[0], coat: "#5a6488", look: { x: 0.4, y: 0.8 } }, face: EXPRESSIONS.neutral, behind: true },
      { spot: "seat2", who: { ...HERO, look: { x: 0.8, y: -0.6 } }, face: EXPRESSIONS.afraid, behind: true },
      { spot: "seat3", who: { head: PASTELS[4], coat: "#7a5a8c", look: { x: 0.4, y: 0.8 } }, face: EXPRESSIONS.determined, behind: true },
      { spot: "invigilator", who: { ...TEACHER, look: { x: 0.8, y: 0.3 } }, face: EXPRESSIONS.sceptical, pose: { ...STAND, armB: [-30, 60] } },
    ],
  },
};
