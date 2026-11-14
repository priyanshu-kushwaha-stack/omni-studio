// Backs: the classroom side on (outside review of v6, sheets 35-36: "use the established classroom set with layered desk
// rows and visible chair backs", "frame from desk height so legs, seats and rotation are readable", "a side-angle wave
// of chair rotations"). The kit classroom's walls, window, banner, whiteboard, fans and platform (kit Classroom.tsx),
// with ten rows of chairs and desks running back from the board (row 0 the front, at the right) and four ranks deep
// (rank 0 nearest the camera), so the room holds about a hundred. Every student sits on a chair with legs, at a desk,
// facing the board; `turn` 0..1 spins a chair round with a little hop (the scrape) until its student faces the back wall.
import { evolvePath } from "@remotion/paths";
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { classroom, Deep, Fan, Floor, lightsOn, OUTSIDE, setLook, TubeLight, Window } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { blinking, MINJUN, noise, PASTELS, TAEHO } from "../shared";

/** The floor line (the kit classroom draws its floor at 960 - 30) and the teacher's platform top. */
export const FLOOR = 930;
export const PLATFORM = 900;
const BOARD = { x: 1300, y: 180, w: 620, h: 360 };

export type Rank = { depth: number; s: number; top: number; floor: number; dx: number };
/** The four ranks of a row, near to far: paper depth, scale, seat top, floor line, x offset. */
export const RANKS: Rank[] = [
  { depth: 1, s: 1.05, top: 850, floor: FLOOR, dx: 0 },
  { depth: 0.9, s: 0.88, top: 796, floor: 864, dx: 64 },
  { depth: 0.8, s: 0.74, top: 750, floor: 808, dx: 118 },
  { depth: 0.7, s: 0.62, top: 712, floor: 760, dx: 160 },
];
export const ROWS = 10;
/** Row k's chair x on rank 0 (row 0 the front, nearest the board). */
export const rowX = (k: number) => 900 - 250 * k;

/** Who sits where (rank 0): you in the front row, your best friend one row back, the rival two rows back. */
export const YOU_ROW = 0;
export const MINJUN_ROW = 1;
export const TAEHO_ROW = 2;
export const seatHead = (row: number, pose: Pose = SEATED) => headAt(rowX(row), seatedY(RANKS[0].top, RANKS[0].s), RANKS[0].s, pose);
export const SEAT_Y = seatedY(RANKS[0].top, RANKS[0].s);

const COATS = ["#3b3e47", "#2a2d36", "#4a4f63", "#3b4a6b", "#5a4a63", "#33403c"];

// ------------------------------------------------------------------------------------------------ furniture

/** A school chair side on, its back on the left (the sitter faces right): seat top `top`, legs to `floor`. */
export const SideChair: React.FC<{ x: number; top: number; floor: number; s: number }> = ({ x, top, floor, s }) => (
  <g>
    <line x1={x - 36 * s} y1={top + 6 * s} x2={x - 40 * s} y2={floor} stroke={INK} strokeWidth={8 * s} strokeLinecap="round" />
    <line x1={x + 36 * s} y1={top + 6 * s} x2={x + 40 * s} y2={floor} stroke={INK} strokeWidth={8 * s} strokeLinecap="round" />
    <rect x={x - 50 * s} y={top - 124 * s} width={16 * s} height={130 * s} rx={5 * s} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
    <rect x={x - 54 * s} y={top - 128 * s} width={24 * s} height={44 * s} rx={6 * s} fill="#7d5a45" stroke={INK} strokeWidth={4} />
    <rect x={x - 46 * s} y={top - 6 * s} width={92 * s} height={14 * s} rx={5 * s} fill="#7d5a45" stroke={INK} strokeWidth={4} />
  </g>
);

/** The desk in front of a chair (to its right): a slanted top, a notebook, one leg to the floor. */
export const SideDesk: React.FC<{ x: number; top: number; floor: number; s: number; seed?: number }> = ({ x, top, floor, s, seed = 0 }) => (
  <g>
    <rect x={x + 168 * s} y={top - 84 * s} width={14 * s} height={floor - top + 84 * s} fill="#6a4630" />
    <path d={`M${x + 62 * s} ${top - 78 * s} L${x + 196 * s} ${top - 96 * s} L${x + 196 * s} ${top - 76 * s} L${x + 62 * s} ${top - 58 * s}Z`}
      fill="#a87c52" stroke={INK} strokeWidth={4} />
    <path d={`M${x + 92 * s} ${top - 80 * s} L${x + 150 * s} ${top - 88 * s}`} stroke={noise(seed) > 0.5 ? "#f3e9d7" : "#cfe3f0"} strokeWidth={8 * s} strokeLinecap="round" />
  </g>
);

// ------------------------------------------------------------------------------------------------ one seat

export type Who = { head: string; coat?: string; tuft?: boolean; scarf?: string };

/** One student on a chair at a desk. `turn` spins chair and student round (cos squash plus a hop); `face` and `pose` are
 *  Figure props (a turned student is the mirror image: `look.x` +1 then looks at the back wall). */
export const SideSeat: React.FC<{ x: number; rank: Rank; who: Who | null; turn?: number; face?: Partial<FigureProps>; pose?: Pose; frame: number;
  seed: number; desk?: boolean }> = ({ x, rank, who, turn = 0, face, pose, frame, seed, desk = true }) => {
  const { s, top, floor } = rank;
  const c = Math.cos(Math.PI * Math.min(1, Math.max(0, turn)));
  const sx = Math.sign(c || 1) * Math.max(0.06, Math.abs(c));
  const hop = Math.sin(Math.PI * Math.min(1, Math.max(0, turn))) * 16 * s;
  return (
    <g>
      <g transform={`translate(${x} ${-hop}) scale(${sx} 1) translate(${-x} 0)`}>
        <SideChair x={x} top={top} floor={floor} s={s} />
        {who && <Figure {...who} x={x} y={seatedY(top, s)} scale={s} facing={1} pose={pose ?? SEATED} brows="none" lids={0.15} mouth="flat"
          look={{ x: 0.9, y: -0.15 }} blink={blinking(frame, seed)} time={frame} {...face} />}
      </g>
      {desk && <SideDesk x={x} top={top} floor={floor} s={s} seed={seed} />}
    </g>
  );
};

/** A classmate's colours, by seat. */
export const classmate = (row: number, rank: number): Who => {
  const i = row * 4 + rank;
  return { head: PASTELS[(i * 3 + rank) % PASTELS.length], coat: COATS[i % COATS.length] };
};

/** Who sits at (row, rank): the three named on rank 0, a classmate elsewhere; null for your own (empty) chair. */
export function sitter(row: number, rank: number, youSeated: boolean, taehoSeated = true): Who | null {
  if (rank === 0 && row === YOU_ROW) return youSeated ? HERO_WHO : null;
  if (rank === 0 && row === MINJUN_ROW) return MINJUN;
  if (rank === 0 && row === TAEHO_ROW) return taehoSeated ? TAEHO : null;
  return classmate(row, rank);
}
const HERO_WHO: Who = { head: MUSTARD, scarf: "#1d9a8f", tuft: true, coat: undefined };

// ------------------------------------------------------------------------------------------------ the room

/** The whiteboard's drawing (his diagram of your trick, small): you, a face, an eye over the face, the face crossed out. */
const BoardDrawing: React.FC<{ drawn: number }> = ({ drawn }) => {
  const { x, y } = BOARD;
  const strokes = [
    { d: `M${x + 150} ${y + 230} m-46 0 a46 46 0 1 0 92 0 a46 46 0 1 0 -92 0`, c: INK },
    { d: `M${x + 220} ${y + 230} H${x + 330} m-22 -16 l22 16 l-22 16`, c: INK },
    { d: `M${x + 420} ${y + 230} m-46 0 a46 46 0 1 0 92 0 a46 46 0 1 0 -92 0 M${x + 404} ${y + 220} v8 M${x + 436} ${y + 220} v8 M${x + 402} ${y + 250} h36`, c: INK },
    { d: `M${x + 380} ${y + 110} q40 -30 80 0 q-40 30 -80 0`, c: CRIMSON },
    { d: `M${x + 360} ${y + 170} L${x + 480} ${y + 290} M${x + 480} ${y + 170} L${x + 360} ${y + 290}`, c: CRIMSON },
  ];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={x + 150} cy={y + 230} r={44} fill={MUSTARD} opacity={drawn > 0 ? 0.85 : 0} />
      {strokes.map((st, i) => {
        const t = Math.min(1, Math.max(0, drawn * strokes.length - i));
        return t > 0 ? <path key={i} d={st.d} stroke={st.c} strokeWidth={9} {...evolvePath(t, st.d)} /> : null;
      })}
    </g>
  );
};

/** The walls, the window row, the banner, the board, the fans, the floor and the teacher's platform. */
const SideBack: React.FC<{ cam: Camera; mood: MoodName; frame: number; drawn: number }> = ({ cam, mood, frame, drawn }) => {
  const dark = OUTSIDE[mood].dark;
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.7} flat>
        <rect x={-2400} y={-800} width={5800} height={2400} fill={dark ? "#d9cba8" : "#f1e6c8"} />
        <rect x={-2400} y={720} width={5800} height={220} fill={dark ? "#9fb0a8" : "#bfd0c6"} />
        {[-80, -760, -1440].map((wx, i) => <Window key={wx} id={`backs-side-${i}`} mood={mood} x={wx} y={200} w={380} h={340} frame="#6b7a72" />)}
        <rect x={420} y={150} width={600} height={90} rx={8} fill="#1d9a8f" stroke={INK} strokeWidth={4} />
        <path d="M470 195 l14 -28 l14 28 l-28 -18 h28Z" fill="#f2b632" />
        {[0, 1, 2].map((i) => <rect key={i} x={540 + i * 150} y={180} width={120} height={30} rx={8} fill="#f3e9d7" />)}
        {[1000, 300, -420, -1100].map((tx) => <TubeLight key={tx} x={tx} y={90} w={260} on={on} />)}
      </Deep>
      <Deep cam={cam} depth={0.92}>
        <rect x={BOARD.x - 20} y={BOARD.y - 20} width={BOARD.w + 40} height={BOARD.h + 40} rx={10} fill="#9aa3ad" stroke={INK} strokeWidth={5} />
        <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={6} fill="#fdfcf7" />
        <BoardDrawing drawn={drawn} />
        <rect x={BOARD.x + 60} y={BOARD.y + BOARD.h + 20} width={160} height={16} rx={4} fill="#7a8088" />
      </Deep>
      <Deep cam={cam} depth={1} flat>
        <Fan x={760} y={110} frame={frame} scale={0.9} />
        <Fan x={-760} y={110} frame={frame + 7} scale={0.9} />
        <Floor y={FLOOR} fill="#a9a08e" gap={200} slant={-100} />
        <rect x={1240} y={PLATFORM} width={1000} height={40} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      </Deep>
    </>
  );
};

export type SeatFn<T> = (row: number, rank: number) => T;

/** The class side on. `turnOf(row, rank)` 0..1, `faceOf` / `poseOf` Figure props per seat; `youSeated` puts you in
 *  your front-row chair (else it is empty); `actors` draws over the near rank (you standing, the rival walking). */
export const SideClass: React.FC<{
  frame: number; cam: Camera; mood?: MoodName; drawn?: number; rows?: number; youSeated?: boolean; taehoSeated?: boolean;
  turnOf?: SeatFn<number>; faceOf?: SeatFn<Partial<FigureProps> | undefined>; poseOf?: SeatFn<Pose | undefined>;
  behind?: React.ReactNode; actors?: React.ReactNode;
}> = ({ frame, cam, mood = "day", drawn = 0, rows = ROWS, youSeated = true, taehoSeated = true, turnOf, faceOf, poseOf, behind, actors }) => {
  const look = setLook(classroom.lights(classroom.defaults), mood, cam);
  const seats = (rank: number) => Array.from({ length: rows }, (_, row) => (
    <SideSeat key={row} x={rowX(row) + RANKS[rank].dx} rank={RANKS[rank]} who={sitter(row, rank, youSeated, taehoSeated)} frame={frame} seed={row * 4 + rank}
      turn={turnOf?.(row, rank) ?? 0} face={faceOf?.(row, rank)} pose={poseOf?.(row, rank)} />
  ));
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<SideBack cam={cam} mood={mood} frame={frame} drawn={drawn} />}
        actors={
          <>
            {[3, 2, 1].map((rank) => <Deep key={rank} cam={cam} depth={RANKS[rank].depth}>{seats(rank)}</Deep>)}
            {behind}
            {seats(0)}
            {actors}
          </>
        } />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the scrape

/** When seat (row, rank) spins round: front row first, a wave to the back over about one second (`wave` frames), the
 *  far ranks a frame or two behind the near; the rival holds, grinning, and goes last at `rivalAt`. */
export function waveTurn(frame: number, at: number, rivalAt: number, wave = 24, spin = 8) {
  return (row: number, rank: number) => {
    const rival = rank === 0 && row === TAEHO_ROW;
    const start = rival ? rivalAt : at + (row / (ROWS - 1)) * (wave - spin / 2) + rank * 1.2 + noise(row * 7 + rank) * 3;
    return Math.min(1, Math.max(0, (frame - start) / spin));
  };
}

/** A turned student's face: none (FACELESS), the head a plain back. The rival, until he turns, is
 *  grinning at you; for a few frames after, his eyes still slide back over his shoulder. */
export function turnedFace(frame: number, rivalAt: number, turnOf: SeatFn<number>) {
  return (row: number, rank: number): Partial<FigureProps> | undefined => {
    const t = turnOf(row, rank);
    if (rank === 0 && row === TAEHO_ROW) {
      if (t < 0.5) return { brows: "angry", lids: 0.2, mouth: "smirk", eyes: 1.05, look: { x: 0.95, y: -0.1 } };
      // turned, his eyes slide back over his shoulder at you for a moment, still grinning; then he is a blank back too
      return frame < rivalAt + 22 ? { brows: "angry", lids: 0.2, mouth: "smirk", eyes: 1, look: { x: -1, y: -0.2 } } : FACELESS;
    }
    return t >= 0.5 ? FACELESS : undefined;
  };
}
/** A turned head shows no face: no eyes, brows or mouth (eyes 0 with blink draws nothing; Figure.tsx). */
export const FACELESS: Partial<FigureProps> = { eyes: 0, blink: true, mouth: "none", brows: "none", lids: 0 };
export const NOSE_UP: Pose = { ...SEATED, tilt: -9 };
