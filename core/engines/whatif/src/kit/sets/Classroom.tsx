// A coaching class, side on. New for the library, built from pieces of the films: "Nobody Could Say No" (sets/Hall.tsx:
// the rows seen from the side, the screen for diagrams; sets/MothersHouse.tsx: the ceiling fan) and "60 Seconds"
// (sets.tsx Diagram: ink drawings on a cream panel). The whiteboard carries ink drawings, never words; the students sit
// at bench desks facing the teacher. Seat the students (`behind`), then the desks (Mid) go over their laps.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK } from "../theme";
import { FRIEND, HERO, PASTELS, TEACHER } from "./cast";
import { Deep, defineSet, Fan, LIGHTS_ON, lightsOn, OUTSIDE, seatedY, TubeLight, Window, type SetProps } from "./common";
import { Books } from "./props";

const FLOOR = 960;
const BOARD = { x: 1300, y: 180, w: 620, h: 360 };
const SEAT_TOP = 850;
const SEATS = [380, 640, 900];

export interface ClassroomOptions {
  /** What is drawn on the whiteboard. */
  board: "graph" | "diagram" | "blank";
  /** How much of the board's drawing is there, 0 to 1 (draw it on during a line). */
  drawn: number;
  /** The far row of students' heads. */
  farRow: boolean;
}

/** The whiteboard's ink: a graph with a rising curve, or boxes joined by arrows. Lengths reveal with `drawn`. */
const BoardInk: React.FC<{ kind: ClassroomOptions["board"]; drawn: number }> = ({ kind, drawn }) => {
  const { x, y, w, h } = BOARD;
  const dash = (len: number, at: number) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, Math.max(0, drawn * 2 - at))) });
  if (kind === "graph") {
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${x + 70} ${y + 60} V${y + h - 50} H${x + w - 60}`} stroke={INK} strokeWidth={7} style={dash(900, 0)} />
        <path d={`M${x + 80} ${y + h - 70} Q${x + 260} ${y + h - 80} ${x + 360} ${y + 190} T${x + w - 80} ${y + 70}`} stroke="#d8344f" strokeWidth={9} style={dash(700, 0.5)} />
        <circle cx={x + 360} cy={y + 190} r={14} fill="#1d9a8f" stroke="none" opacity={drawn > 0.9 ? 1 : 0} />
      </g>
    );
  }
  if (kind === "diagram") {
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={7}>
        {[[x + 60, y + 70], [x + 380, y + 70], [x + 220, y + 220]].map(([bx, by], i) => (
          <rect key={i} x={bx} y={by} width={170} height={90} rx={12} stroke={[INK, "#1d9a8f", "#d8344f"][i]} style={dash(520, i * 0.3)} />
        ))}
        <path d={`M${x + 230} ${y + 115} H${x + 380} M${x + 145} ${y + 160} L${x + 260} ${y + 220} M${x + 465} ${y + 160} L${x + 350} ${y + 220}`} stroke={INK} style={dash(500, 0.8)} />
      </g>
    );
  }
  return null;
};

const Back: React.FC<SetProps<ClassroomOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.7} flat>
        <rect x={-1400} y={-800} width={4800} height={1800} fill={dark ? "#d9cba8" : "#f1e6c8"} />
        <rect x={-1400} y={720} width={4800} height={220} fill={dark ? "#9fb0a8" : "#bfd0c6"} />
        <Window id="classroom" mood={mood} x={-80} y={200} w={380} h={340} frame="#6b7a72" />
        {/* the coaching banner: colour blocks and a star, no words */}
        <rect x={420} y={150} width={600} height={90} rx={8} fill="#1d9a8f" stroke={INK} strokeWidth={4} />
        <path d="M470 195 l14 -28 l14 28 l-28 -18 h28Z" fill="#f2b632" />
        {[0, 1, 2].map((i) => <rect key={i} x={540 + i * 150} y={180} width={120} height={30} rx={8} fill="#f3e9d7" />)}
        {/* the far row: students' heads over a long desk, all facing the board */}
        {options.farRow && Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`translate(${-100 + i * 150} ${640 + Math.sin(frame / 50 + i) * 2})`}>
            <rect x={-22} y={-10} width={44} height={70} rx={16} fill="#3b3e47" />
            <circle cx={0} cy={-36} r={30} fill={PASTELS[(i * 5) % PASTELS.length]} />
          </g>
        ))}
        {options.farRow && <rect x={-1400} y={690} width={2800} height={40} fill="#8a5c3b" stroke={INK} strokeWidth={4} />}
        {[300, 1000].map((x) => <TubeLight key={x} x={x} y={90} w={260} on={on} />)}
      </Deep>
      <Deep cam={cam} depth={0.92}>
        <rect x={BOARD.x - 20} y={BOARD.y - 20} width={BOARD.w + 40} height={BOARD.h + 40} rx={10} fill="#9aa3ad" stroke={INK} strokeWidth={5} />
        <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={6} fill="#fdfcf7" />
        <BoardInk kind={options.board} drawn={options.drawn} />
        <rect x={BOARD.x + 60} y={BOARD.y + BOARD.h + 20} width={160} height={16} rx={4} fill="#7a8088" />
        {["#d8344f", "#1d9a8f", INK].map((c, i) => <rect key={c} x={BOARD.x + 80 + i * 40} y={BOARD.y + BOARD.h + 10} width={30} height={10} rx={5} fill={c} />)}
      </Deep>
      <Deep cam={cam} depth={1} flat>
        <Fan x={760} y={110} frame={frame} scale={0.9} />
        <rect x={-1400} y={FLOOR - 30} width={4800} height={800} fill="#a9a08e" />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400 + i * 200} y1={FLOOR - 30} x2={-1400 + i * 200 - 100} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
        {/* the long bench the students sit on, and the teacher's platform */}
        <rect x={200} y={SEAT_TOP} width={900} height={18} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
        {[230, 1060].map((x) => <rect key={x} x={x} y={SEAT_TOP + 18} width={16} height={FLOOR - SEAT_TOP - 48} fill="#6a4630" />)}
        <rect x={1240} y={FLOOR - 60} width={900} height={40} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      </Deep>
    </>
  );
};

/** A bench desk in front of each seat, over the students' laps: a slanted top, a notebook, a pen. */
const Mid: React.FC<SetProps<ClassroomOptions>> = () => (
  <g>
    {SEATS.map((x, i) => (
      <g key={x}>
        <path d={`M${x + 70} 770 L${x + 220} 750 L${x + 220} 770 L${x + 70} 790Z`} fill="#a87c52" stroke={INK} strokeWidth={4} />
        <rect x={x + 200} y={770} width={16} height={FLOOR - 800} fill="#6a4630" />
        <path d={`M${x + 100} 772 L${x + 170} 763`} stroke="#f3e9d7" strokeWidth={8} strokeLinecap="round" />
        {i === 2 && <Books x={x + 150} y={758} scale={0.5} n={2} />}
      </g>
    ))}
  </g>
);

/** The near bench's edge at the bottom left, soft. */
const Front: React.FC<SetProps<ClassroomOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.35}>
    <path d="M-200 900 L520 860 L520 900 L-200 950Z" fill="#a87c52" stroke={INK} strokeWidth={6} />
    <rect x={160} y={830} width={200} height={40} rx={6} fill="#f3e9d7" transform="rotate(-4 260 850)" />
  </Deep>
);

export const classroom = defineSet<ClassroomOptions>({
  name: "classroom",
  about: "coaching class: whiteboard with ink drawings (no words), bench desks, far row of heads, fan and tube lights",
  spots: {
    teacher: { x: 1500, y: FLOOR - 60, scale: 1.15, facing: -1 },
    board: { x: 1760, y: FLOOR - 60, scale: 1.15, facing: -1 },
    seat1: { x: SEATS[0], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: 1, sit: true },
    seat2: { x: SEATS[1], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: 1, sit: true },
    seat3: { x: SEATS[2], y: seatedY(SEAT_TOP, 1.05), scale: 1.05, facing: 1, sit: true },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    board: { x: 1560, y: 420, zoom: 1.7 },
    bench: { x: 720, y: 640, zoom: 1.6 },
  },
  lights: [
    { x: 650, y: 100, depth: 0.7, r: 700, color: "#fdfbea", strength: 0.28, moods: LIGHTS_ON },
    { x: 110, y: 370, depth: 0.7, r: 420, color: "#fff2cc", strength: 0.35, moods: ["morning", "day"] },
  ],
  defaults: { board: "graph", drawn: 1, farRow: true },
  Back,
  Mid,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "seat1", who: { head: PASTELS[2], coat: "#5a6488" }, face: EXPRESSIONS.neutral, behind: true },
      { spot: "seat2", who: { ...FRIEND, look: { x: -0.8, y: 0.2 } }, face: EXPRESSIONS.sceptical, behind: true },
      { spot: "seat3", who: { ...HERO, look: { x: 0.9, y: -0.3 } }, face: EXPRESSIONS.shocked, behind: true },
      { spot: "teacher", who: { ...TEACHER, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.determined, pose: { ...STAND, armB: [-115, -10] } },
    ],
  },
});
