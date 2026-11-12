// General helpers every beat may use (adapted from the saw-who-wants-you-to-fail film's parts): where a figure's head and
// hands are, arm angles that put a hand on a point, the timing helper, the mood of the line being spoken, a pool of
// shade behind a bright head, far walkers, speech bubbles, a paper sheet for facts, an apron and a paper cap. Everything
// is drawn in WORLD coordinates inside a <Stage> slot (an SVG), so the camera moves it.
import { interpolate, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, HEAD_R, joints, LIMB, reach, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook, type SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { FPS, INK, PAPER } from "@whatif/kit/theme";
import { lastIndex, noise, PASTELS, type Shot } from "./shared";
import { Deep } from "./sets/common";

/** Where a figure's head centre is, in world coordinates. `facing` mirrors x. */
export function headAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

/** A springy 0..1 pop from `at`. */
export const pop = (frame: number, at: number, stiffness = 210) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness, mass: 0.6 } });

/** Where a figure stands and how: the numbers you pass to <Figure>. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }

/** A figure's shoulder in world coordinates (both arms hang from it). */
export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

/** A figure's front (or back) hand in world coordinates. */
export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

/** Arm angles that put a hand on a world point (as far as the arm reaches). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** `at(i, p)`: the frame p of the way through narration line i. */
export const lineAt = (clips: Clip[]) => (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);

/** The mood of the line being spoken. */
export const moodNow = (shot: Shot): MoodName => {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (shot.lines[i]?.mood ?? "lamp") as MoodName;
};

/** The look for a set's lights in the current line's mood. */
export const lookFor = (shot: Shot, lights: SetLight[], cam: Camera) => setLook(lights, moodNow(shot), cam);

/** A soft pool of shadow on the set behind a head, so a bright head stands off a bright set. */
export const Shade: React.FC<{ id: string; x: number; y: number; r: number; strength?: number }> = ({ id, x, y, r, strength = 0.9 }) => (
  <g>
    <defs>
      <radialGradient id={`shade-${id}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.4" stopColor="#07080d" stopOpacity={strength} />
        <stop offset="1" stopColor="#07080d" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r * 1.9} fill={`url(#shade-${id})`} />
  </g>
);

/** A few small people walking both ways along a far floor on a set layer of `depth` (authored at REF). */
export const Strollers: React.FC<{ cam: Camera; depth: number; frame: number; y: number; scale: number; count?: number; seed?: number; from?: number }> = ({
  cam, depth, frame, y, scale, count = 6, seed = 0, from = 0,
}) => {
  if (frame < from) return null;
  const span = 4200;
  return (
    <Deep cam={cam} depth={depth} flat>
      {Array.from({ length: count }, (_, i) => {
        const facing = (noise(seed + i) > 0.5 ? 1 : -1) as 1 | -1;
        const v = 1.6 + noise(seed + i + 9) * 1.2;
        const x = (((noise(seed + i + 20) * span + facing * (frame - from) * v) % span) + span) % span - 1100;
        return (
          <Figure key={i} x={x} y={y + (i % 3) * 6} scale={scale} facing={facing} pose={walkPose(frame * 0.2 + i * 1.7)}
            head={PASTELS[(seed + i) % PASTELS.length]} coat={i % 2 ? "#2a2d36" : "#3b4a6b"} look={{ x: 0.7, y: 0 }} mouth="flat" time={frame} />
        );
      })}
    </Deep>
  );
};

/**
 * A speech bubble, four words or fewer, pointing down-left or down-right at a speaker. (x, y) is the tail's tip.
 * Pops in at `at`, gone at `until`. You never speak aloud: your one line in the film is a bubble.
 */
export const Bubble: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right";
}> = ({ frame, at, until, x, y, text, size = 46, side = "right" }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame, at, 260);
  const w = Math.max(size * 3, text.length * size * 0.58 + size * 1.2);
  const h = size * 1.9;
  const d = side === "right" ? 1 : -1;
  const bx = x + d * size * 0.6 - (side === "right" ? 0 : w);
  const by = y - size * 0.9 - h;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <path d={`M${x} ${y} L${x + d * size * 0.5} ${by + h - 2} L${x + d * size * 1.5} ${by + h - 2}Z`}
        fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx} y={by} width={w} height={h} rx={h * 0.45} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={x + d * size * 0.55 - 4} y={by + h - 9} width={size + 8} height={12} fill={PAPER} />
      <text x={bx + w / 2} y={by + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size}
        fill={INK}>{text}</text>
    </g>
  );
};

/**
 * A cream paper sheet that unfolds at `at`: real facts are drawn on paper diagrams, never written out (style.md).
 * Children are drawn in the sheet's own coordinates, 0..w by 0..h; use <DrawLine> from the kit for lines that draw
 * themselves. No words on the sheet beyond a key letter or a number the narrator says.
 */
export const Sheet: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; w: number; h: number; tilt?: number;
  children?: React.ReactNode;
}> = ({ frame, at, until, x, y, w, h, tilt = -2, children }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const t = interpolate(frame, [at, at + 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${0.6 + 0.4 * t} ${t})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={10} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={PAPER} stroke="#cdbfa6" strokeWidth={4} />
      <line x1={-w / 2} y1={0} x2={w / 2} y2={0} stroke="#e2d6bf" strokeWidth={3} />
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
    </g>
  );
};

/** A stall apron over a figure's torso (draw AFTER the <Figure>). */
export const Apron: React.FC<{ b: Body; color?: string }> = ({ b, color = "#7a5a3a" }) => {
  const j = joints(b.pose);
  const top = { x: b.x + j.neck.x * b.scale * b.facing, y: b.y + (j.neck.y + 26) * b.scale };
  const w = 46 * b.scale;
  const h = 150 * b.scale;
  return (
    <path d={`M${top.x - w * 0.42} ${top.y} h${w * 0.84} l${w * 0.16} ${h} h${-w * 1.16}z`} fill={color} stroke={INK}
      strokeWidth={Math.max(3, 4 * b.scale)} strokeLinejoin="round" opacity={0.95} />
  );
};

/** A paper cap on a head (the coffee seller's; draw AFTER the <Figure>). */
export const PaperCap: React.FC<{ x: number; y: number; r: number; color?: string }> = ({ x, y, r, color = PAPER }) => (
  <path d={`M${x - r * 0.9} ${y - r * 0.55} Q${x} ${y - r * 1.45} ${x + r * 0.9} ${y - r * 0.55} Z`} fill={color} stroke={INK}
    strokeWidth={Math.max(3, r * 0.06)} strokeLinejoin="round" />
);

/** A baseball cap on a head (the kid's; draw AFTER the <Figure>). `facing` points the peak. */
export const Cap: React.FC<{ x: number; y: number; r: number; color: string; facing?: 1 | -1 }> = ({ x, y, r, color, facing = 1 }) => (
  <g>
    <path d={`M${x - r * 0.95} ${y - r * 0.3} A${r * 0.95} ${r * 0.95} 0 0 1 ${x + r * 0.95} ${y - r * 0.3} Z`} fill={color} stroke={INK} strokeWidth={Math.max(3, r * 0.06)} />
    <path d={`M${x + facing * r * 0.6} ${y - r * 0.32} h${facing * r * 0.75}`} stroke={color} strokeWidth={r * 0.18} strokeLinecap="round" />
  </g>
);
