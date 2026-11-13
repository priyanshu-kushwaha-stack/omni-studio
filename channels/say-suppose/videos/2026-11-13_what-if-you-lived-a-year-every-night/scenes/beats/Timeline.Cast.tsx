// The cast and small props shared by the last four beats (The Timeline, Her Offer, The Slow Room, Tell Me Now): body
// maths (a shoulder, a hand, aiming an arm at a point), each character as a Figure with its colours, an open palm, the
// cable's plug and coil, the rent envelope, and the mood of the line being spoken. World coordinates, for a <Stage>
// slot. No sound here.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { BOSS, blinking, FLATMATE, HERO, lastIndex, OLD, PIANO, type Shot } from "../shared";

// ------------------------------------------------------------------------------------------------ timing

/** Line n of a beat (counted from its firstLine): its start, a point p of the way through it, and its end. */
export function lineTimes(clips: Clip[], first: number) {
  const c = (n: number) => clips[first + n];
  return {
    from: (n: number) => c(n).from,
    at: (n: number, p: number) => Math.round(c(n).from + c(n).frames * p),
    end: (n: number) => c(n).from + c(n).frames,
  };
}

/** The mood of the line being spoken (the script's `> MOOD:`), for a set's lights. */
export function moodAt(shot: Shot, fallback: MoodName = "night"): MoodName {
  const i = lastIndex(shot.clips, (c) => shot.frame >= c.from);
  return (shot.lines[i]?.mood as MoodName) ?? fallback;
}

// ------------------------------------------------------------------------------------------------ bodies

/** Where a figure stands and how: the numbers you pass to <Figure>. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }
export type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

export function headOf(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.head.x * b.scale * b.facing, y: b.y + j.head.y * b.scale, r: 46 * b.scale };
}

/** Arm angles that put a hand on a world point (as far as the arm reaches). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

// ------------------------------------------------------------------------------------------------ the cast

type Who = { body: Body; face: Face; frame: number; held?: React.ReactNode; opacity?: number; seed?: number };

const Fig: React.FC<Who & { look: Partial<FigureProps> }> = ({ body, face, frame, held, opacity = 1, seed = 0, look }) => (
  <g opacity={opacity}>
    <Figure {...body} {...look} {...face} head={look.head ?? "#ccc"} blink={blinking(frame, seed)} time={frame} held={held} />
  </g>
);

/** You: mustard head with a tuft, teal scarf. */
export const You: React.FC<Who> = (p) => <Fig {...p} seed={p.seed ?? 0} look={{ head: HERO.head, scarf: HERO.scarf, tuft: true, flow: 0.08 }} />;
/** Your flatmate: pale-lilac head; the cream apron, or a grey top with it off. */
export const Mate: React.FC<Who & { apron?: boolean }> = ({ apron = true, ...p }) => (
  <Fig {...p} seed={p.seed ?? 3} look={{ head: FLATMATE.head, coat: apron ? FLATMATE.coat : "#8b8f9e" }} />
);
export const Boss: React.FC<Who> = (p) => <Fig {...p} seed={p.seed ?? 5} look={{ head: BOSS.head, coat: BOSS.coat, tie: BOSS.tie }} />;
export const Old: React.FC<Who & { head?: string; coat?: string }> = ({ head = OLD.head, coat = OLD.coat, ...p }) => (
  <Fig {...p} seed={p.seed ?? 7} look={{ head, coat }} />
);
export const Teacher: React.FC<Who> = (p) => <Fig {...p} seed={p.seed ?? 9} look={{ head: PIANO.head, coat: PIANO.coat }} />;

// ------------------------------------------------------------------------------------------------ props

/** An open hand, palm up, for a Figure's `held` (figure-local units). */
export const PalmUp: React.FC<{ color: string }> = ({ color }) => (
  <path d="M-16 -4 Q-14 12 2 12 Q16 12 18 -6 L10 -2 Q2 4 -8 -2 Z" fill={color} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
);

/** The cable's plug: a teal grip and two pins, pointing along `angle` (degrees, 0 = right). */
export const Plug: React.FC<{ x?: number; y?: number; angle?: number; scale?: number }> = ({ x = 0, y = 0, angle = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <rect x={-22} y={-11} width={34} height={22} rx={6} fill={TEAL} stroke={INK} strokeWidth={4} />
    <line x1={12} y1={-5} x2={26} y2={-5} stroke="#c9ced6" strokeWidth={4} strokeLinecap="round" />
    <line x1={12} y1={5} x2={26} y2={5} stroke="#c9ced6" strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** A coil of teal cable, `n` loops (0..1 grows it as it is wound), hanging from its top at (x, y). `plugs` ends hang
 *  out of the bottom. */
export const Coil: React.FC<{ x: number; y: number; r?: number; wound?: number; plugs?: number }> = ({ x, y, r = 46, wound = 1, plugs = 1 }) => {
  const loops = Math.max(1, Math.round(4 * wound));
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: loops }, (_, i) => (
        <ellipse key={i} cx={(i - loops / 2) * 4} cy={r + i * 3} rx={r * 0.78} ry={r} fill="none" stroke={INK} strokeWidth={14} />
      ))}
      {Array.from({ length: loops }, (_, i) => (
        <ellipse key={`t${i}`} cx={(i - loops / 2) * 4} cy={r + i * 3} rx={r * 0.78} ry={r} fill="none" stroke={TEAL} strokeWidth={7} />
      ))}
      {Array.from({ length: plugs }, (_, i) => {
        const px = (i - (plugs - 1) / 2) * 34;
        return (
          <g key={`p${i}`}>
            <path d={`M${px * 0.4} ${r * 2} Q${px} ${r * 2 + 30} ${px} ${r * 2 + 50}`} fill="none" stroke={INK} strokeWidth={12} />
            <path d={`M${px * 0.4} ${r * 2} Q${px} ${r * 2 + 30} ${px} ${r * 2 + 50}`} fill="none" stroke={TEAL} strokeWidth={6} />
            <Plug x={px} y={r * 2 + 62} angle={90} scale={0.8} />
          </g>
        );
      })}
    </g>
  );
};

/** A hook on the wall (a small brass curl), the coil's hanging point at (x, y). */
export const Hook: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 14} y={y - 26} width={28} height={16} rx={4} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
    <path d={`M${x} ${y - 12} L${x} ${y + 4} Q${x} ${y + 16} ${x + 12} ${y + 10}`} fill="none" stroke="#c9a24a" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** The rent envelope: a cream envelope, a crimson stamp, ink bars for the address (no words). */
export const Envelope: React.FC<{ x: number; y: number; rotate?: number; scale?: number }> = ({ x, y, rotate = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-70} y={-44} width={140} height={88} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    <path d="M-70 -44 L0 8 L70 -44" fill="none" stroke="#cdbfa6" strokeWidth={4} />
    <rect x={38} y={-36} width={24} height={28} rx={3} fill={CRIMSON} />
    <rect x={-50} y={12} width={70} height={7} rx={3} fill={INK} opacity={0.7} />
    <rect x={-50} y={25} width={50} height={7} rx={3} fill={INK} opacity={0.7} />
  </g>
);
