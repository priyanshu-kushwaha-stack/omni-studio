// Helpers shared by builder B's two beats (Who's Crimson, Four Seats): a kit set on our own Stage with a slot for
// seated people behind its desks, the clock from the narration clips, and the small props these beats draw (the shoe
// lockers, the top-down desks, the wood under a paper sheet, the head icons drawn on paper). World
// coordinates, for a <Stage> slot, like parts.tsx. No sound here.
import { setLook, type SetDef } from "@whatif/kit/sets";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import { joints, reach, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Chocolate } from "../parts";
import { lastIndex, lineEnd, type Shot } from "../shared";
import { REF } from "../sets/common";

// ------------------------------------------------------------------------------------------------ timing

/** The narration clock: `from(i)` line i's first frame, `end(i)` its last, `at(i, p)` p of the way through it. */
export function clock(clips: Clip[]) {
  return {
    from: (i: number) => clips[i].from,
    end: (i: number) => lineEnd(clips, i),
    at: (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p),
  };
}

/** The mood of the line being spoken (`> MOOD:`), for a set's own lights. */
export function moodAt(shot: Shot): MoodName {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (shot.lines[i]?.mood ?? "day") as MoodName;
}

/** The arm angles (front or back arm) that put a hand on a world point, as far as the arm reaches. */
export function armTo(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1, target: { x: number; y: number }): [number, number] {
  const j = joints(pose);
  const sx = x + j.shoulder.x * scale * facing, sy = y + j.shoulder.y * scale;
  return reach(((target.x - sx) / scale) * facing, (target.y - sy) / scale);
}

/** The camera that centres a point authored on a Deep layer of depth d (sets/common.tsx), at a zoom. */
export const onLayer = (x: number, y: number, d: number, zoom: number): Camera => ({
  x: (x - REF.x * (1 - d)) / d, y: (y - REF.y * (1 - d)) / d, zoom,
});

// ------------------------------------------------------------------------------------------------ a kit set on a Stage

/**
 * A library set (`@whatif/kit/sets`) on the kit's Stage, lit by `mood` plus the set's own lights. `behind` is drawn
 * before the set's Mid piece (people seated behind desks or a counter), `actors` after it, `far` after the set's Back
 * (in the back slot, for things drawn on a Deep layer), `front` after the set's Front.
 */
export function SetShot<O extends object>({ set, mood, frame, cam, options, behind, actors, far, front, look }: {
  set: SetDef<O>; mood: MoodName; frame: number; cam: Camera; options?: Partial<O>;
  behind?: React.ReactNode; actors?: React.ReactNode; far?: React.ReactNode; front?: React.ReactNode; look?: Partial<Look>;
}) {
  const o = { ...set.defaults, ...options } as O;
  const p = { cam, mood, frame, options: o };
  return (
    <LookContext.Provider value={setLook(set.lights(o), mood, cam, look)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
        back={<>{set.Back(p)}{far}</>}
        actors={<>{behind}{set.Mid?.(p)}{actors}</>}
        front={set.Front || front ? <>{set.Front?.(p)}{front}</> : undefined} />
    </LookContext.Provider>
  );
}

/** A plain Stage on a flat ground (`back`), for inserts and paper sheets. */
export const FlatShot: React.FC<{ cam: Camera; back: React.ReactNode; actors: React.ReactNode; mood: MoodName }> = ({ cam, back, actors, mood }) => (
  <LookContext.Provider value={setLook([], mood, cam, { dof: 0 })}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
  </LookContext.Provider>
);

// ------------------------------------------------------------------------------------------------ props

/** A school shoe (side on), toe to the right. (x, y) is the sole's middle. */
export const Shoe: React.FC<{ x?: number; y?: number; scale?: number; color?: string; tilt?: number }> = ({ x = 0, y = 0, scale = 1, color = "#f3efe6", tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M-30 0 L-30 -22 Q-26 -30 -14 -30 L4 -24 Q22 -20 32 -8 L34 0Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-32} y={-4} width={68} height={7} rx={3} fill={INK} opacity={0.75} />
  </g>
);

/** The school's shoe lockers: a wooden grid of cubbies with shoes in most, its bottom-left corner at (x, y). */
export const ShoeLockers: React.FC<{ x: number; y: number; cols?: number; rows?: number }> = ({ x, y, cols = 5, rows = 5 }) => {
  const cw = 86, ch = 74;
  const w = cols * cw + 20, h = rows * ch + 20;
  const colours = ["#f3efe6", "#3b3e47", "#7fa0c4", "#f3efe6", "#e6a0a0"];
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} rx={6} fill="#b98a5a" stroke={INK} strokeWidth={5} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const cx = x + 10 + c * cw, cy = y - h + 10 + r * ch;
        const full = (i * 7) % 5 !== 0;
        return (
          <g key={i}>
            <rect x={cx + 4} y={cy + 4} width={cw - 8} height={ch - 8} rx={4} fill="#6e4b30" />
            {full && <Shoe x={cx + cw / 2} y={cy + ch - 10} scale={0.8} color={colours[(i * 3) % colours.length]} />}
          </g>
        );
      })}
    </g>
  );
};

/** Ms. Kang's red pen, for a hand (Figure `held`). */
export const RedPen: React.FC = () => (
  <g transform="rotate(-35)">
    <rect x={-5} y={-46} width={10} height={52} rx={4} fill={CRIMSON} stroke={INK} strokeWidth={3} />
    <path d="M-5 -46 L0 -58 L5 -46Z" fill={INK} />
  </g>
);

/** The past-paper folder: a manila folder with sheets showing at the top, its bottom-centre at (x, y). */
export const Folder: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-58} y={-86} width={110} height={80} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} transform="rotate(-4)" />
    <rect x={-52} y={-92} width={110} height={80} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} transform="rotate(3)" />
    <path d="M-66 -76 H-20 L-10 -88 H22 L30 -76 H66 V0 H-66Z" fill="#d9b26a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-40} y={-50} width={80} height={10} rx={5} fill={INK} opacity={0.35} />
  </g>
);

/** A wooden surface seen from straight above (under a paper sheet or an insert of desks). Fills the world. */
export const WoodTop: React.FC<{ color?: string; seed?: number }> = ({ color = "#c9a77a", seed = 0 }) => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={2600} fill={color} />
    {Array.from({ length: 22 }, (_, i) => (
      <path key={i} d={`M-1400 ${-200 + i * 90 + (seed % 3) * 20} Q960 ${-160 + i * 90} 3400 ${-210 + i * 90}`} fill="none" stroke="#000" strokeWidth={5} opacity={0.06} />
    ))}
  </g>
);

/** A small head, front on, as drawn on paper: a disc with two eyes (and your tuft). */
export const HeadIcon: React.FC<{ x: number; y: number; r: number; color: string; tuft?: boolean; mouth?: "smile" | "flat" | "frown"; dim?: number }> = ({
  x, y, r, color, tuft, mouth, dim = 1,
}) => (
  <g transform={`translate(${x} ${y})`} opacity={dim}>
    {tuft && <path d={`M${-r * 0.2} ${-r * 0.9} Q${-r * 0.3} ${-r * 1.45} ${r * 0.1} ${-r * 1.5} Q${-r * 0.02} ${-r * 1.2} ${r * 0.22} ${-r * 1.15}Z`} fill={INK} />}
    <circle r={r} fill={color} stroke={INK} strokeWidth={Math.max(2, r * 0.08)} />
    <ellipse cx={-r * 0.32} cy={-r * 0.1} rx={r * 0.12} ry={r * 0.18} fill={INK} />
    <ellipse cx={r * 0.32} cy={-r * 0.1} rx={r * 0.12} ry={r * 0.18} fill={INK} />
    {mouth === "smile" && <path d={`M${-r * 0.3} ${r * 0.3} Q0 ${r * 0.55} ${r * 0.3} ${r * 0.3}`} fill="none" stroke={INK} strokeWidth={Math.max(2, r * 0.08)} strokeLinecap="round" />}
    {mouth === "flat" && <path d={`M${-r * 0.25} ${r * 0.38} H${r * 0.25}`} stroke={INK} strokeWidth={Math.max(2, r * 0.08)} strokeLinecap="round" />}
    {mouth === "frown" && <path d={`M${-r * 0.3} ${r * 0.48} Q0 ${r * 0.25} ${r * 0.3} ${r * 0.48}`} fill="none" stroke={INK} strokeWidth={Math.max(2, r * 0.08)} strokeLinecap="round" />}
  </g>
);

/** A pencil seen from above, its point at (x, y), lying at `angle` degrees. */
export const Pencil: React.FC<{ x: number; y: number; angle?: number; scale?: number }> = ({ x, y, angle = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M0 0 L26 -9 V9Z" fill="#e9cfa0" stroke={INK} strokeWidth={3} />
    <path d="M0 0 L8 -3 V3Z" fill={INK} />
    <rect x={26} y={-9} width={190} height={18} fill={MUSTARD} stroke={INK} strokeWidth={3} />
    <rect x={216} y={-9} width={16} height={18} fill="#b9bcc4" stroke={INK} strokeWidth={3} />
    <rect x={232} y={-9} width={22} height={18} rx={4} fill="#e6a0a0" stroke={INK} strokeWidth={3} />
  </g>
);

/**
 * Two classroom desks side by side seen from straight above, centred on (x, y): two notebooks, two pencils, and in
 * the gap between them a napkin with the two halves of one chocolate bar. `halves` false hides them (the napkin stays).
 */
export const TwoDesksTop: React.FC<{ x: number; y: number; halves?: boolean; emptyRight?: boolean }> = ({ x, y, halves = true, emptyRight }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 1].map((side) => (
      <g key={side} transform={`translate(${side * 330} 0)`}>
        <rect x={-320} y={-260} width={640} height={520} rx={14} fill="#c9935e" stroke={INK} strokeWidth={6} />
        <rect x={-320} y={-260} width={640} height={30} rx={14} fill="#a87c52" />
        {!(emptyRight && side === 1) && (
          <>
            <rect x={-200} y={-150} width={300} height={220} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} transform={`rotate(${side * -5})`} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={-170} y1={-110 + i * 40} x2={60} y2={-110 + i * 40} stroke={TEAL} strokeWidth={3} opacity={0.5} transform={`rotate(${side * -5})`} />)}
            <Pencil x={side * 40 - 60} y={150} angle={side * 8 - 4} />
          </>
        )}
      </g>
    ))}
    <rect x={-170} y={-110} width={340} height={230} rx={6} fill="#cfe6e0" stroke={INK} strokeWidth={4} transform="rotate(6)" />
    {halves && (
      <>
        <Chocolate x={-80} y={10} scale={2.6} half="left" tilt={-14} />
        <Chocolate x={80} y={-4} scale={2.6} half="right" tilt={9} />
      </>
    )}
  </g>
);
