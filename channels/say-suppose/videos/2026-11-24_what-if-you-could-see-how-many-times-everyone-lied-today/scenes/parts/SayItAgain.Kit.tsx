// Small parts shared by the SayItAgain, TenOutOfTen, Stadium and EverybodyTexts beats: where a figure's head is, the
// lie counter placed over a head, a speech bubble and a paper tag in world units, a talking mouth, a phone in the hand,
// and a Stage lit by a mood. Everything here is drawn in code. No sound here (sound.ts places it).
import { spring } from "remotion";
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { HEAD_R, joints, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, PAPER } from "@whatif/kit/theme";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Glow } from "@whatif/kit/stage/Look";
import { Counter } from "./Counter";
import { blinking } from "../shared";

/** A figure's head centre and radius in world units. */
export function headOf(x: number, y: number, scale: number, pose: Pose = STAND, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

/** Where a counter of digit height `size` sits over that head (the plate's tail just clears the hair). */
export function counterSpot(x: number, y: number, scale: number, pose: Pose = STAND, facing: 1 | -1 = 1, size = 60 * scale) {
  const h = headOf(x, y, scale, pose, facing);
  return { x: h.x, y: h.y - h.r - size * 0.95 - 12 * scale };
}

export interface Person {
  x: number;
  y: number;
  scale: number;
  facing?: 1 | -1;
  pose?: Pose;
}

/** A person and the counter over their head, in one go. `count` is { base, ticks }; leave it out for you (you never see
 *  your own). Extra Figure props pass through. */
export const Body: React.FC<Person & Omit<Partial<FigureProps>, "x" | "y" | "scale" | "facing" | "pose"> & {
  head: string; frame: number; id: string; count?: { base: number; ticks?: number[]; on?: number; hidden?: boolean; glow?: string };
  size?: number; seed?: number;
}> = ({ x, y, scale, facing = 1, pose = STAND, frame, id, count, size, seed = 0, ...fig }) => {
  const s = size ?? 58 * scale;
  const c = counterSpot(x, y, scale, pose, facing, s);
  return (
    <g>
      <Figure x={x} y={y} scale={scale} facing={facing} pose={pose} time={frame} blink={blinking(frame, seed)} {...fig} />
      {count && <Counter x={c.x} y={c.y} base={count.base} ticks={count.ticks} frame={frame} size={s} id={id}
        on={count.on} hidden={count.hidden} glow={count.glow} />}
    </g>
  );
};

/** A mouth that moves while a line is spoken (open and shut at a talking pace, not lip-synced). */
export const talk = (frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth =>
  frame >= from && frame < to ? (Math.floor((frame - from) / 5) % 3 === 2 ? "flat" : "open") : rest;

const pop = (frame: number, at: number) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness: 240, mass: 0.6 } });

/** A speech bubble, four words or fewer, in world units. (x, y) is the tail's tip; the bubble opens to `side`. */
export const Bubble: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right";
}> = ({ frame, at, until, x, y, text, size = 46, side = "right" }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame, at);
  const w = Math.max(size * 3, text.length * size * 0.58 + size * 1.2);
  const h = size * 1.9;
  const dir = side === "right" ? 1 : -1;
  const bx = x + dir * size * 0.6 - (side === "right" ? 0 : w);
  const by = y - size * 0.9 - h;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <path d={`M${x} ${y} L${x + dir * size * 0.5} ${by + h - 2} L${x + dir * size * 1.5} ${by + h - 2}Z`}
        fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx} y={by} width={w} height={h} rx={h * 0.45} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={x + dir * size * 0.55 - 4 - (dir < 0 ? size : 0)} y={by + h - 9} width={size + 8} height={12} fill={PAPER} />
      <text x={bx + w / 2} y={by + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={INK}>{text}</text>
    </g>
  );
};

/** A stamped paper tag with ink letters, centred on (x, y), in world units. */
export const PaperTag: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number;
  tilt?: number; color?: string }> = ({ frame, at, until, x, y, text, size = 44, tilt = -3, color = INK }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = 1 + 0.3 * (1 - Math.min(1, (frame - at) / 6));
  const w = text.length * size * 0.62 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <rect x={-w / 2 + 6} y={-size * 0.75 + 8} width={w} height={size * 1.5} rx={8} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

/** A small phone for a hand, its screen lit. `screen` draws on the screen (local units, 24 x 40 from its top left). */
export const Handset: React.FC<{ scale?: number; rotate?: number; lit?: string; children?: React.ReactNode }> = ({ scale = 1, rotate = -8, lit = "#cfe9f4", children }) => (
  <g transform={`scale(${scale}) rotate(${rotate}) translate(-6 -40)`}>
    <rect x={-14} y={-4} width={30} height={52} rx={6} fill="#1b1d24" />
    <rect x={-11} y={0} width={24} height={42} rx={3} fill={lit} />
    <g transform="translate(-11 0)">{children}</g>
  </g>
);

/** Playing cards and a chip stack, for the poker table. */
export const Chips: React.FC<{ x: number; y: number; n: number; color?: string; scale?: number }> = ({ x, y, n, color = CRIMSON, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <ellipse cx={0} cy={-i * 7} rx={20} ry={7} fill={i % 3 === 0 ? PAPER : color} stroke={INK} strokeWidth={2.5} />
      </g>
    ))}
  </g>
);

/** A Stage on its own camera, lit by a mood (plus any glows): for scenes drawn here rather than through SetScene. */
export const MoodStage: React.FC<{ mood: MoodName; cam: Camera; back: React.ReactNode; actors: React.ReactNode;
  front?: React.ReactNode; glows?: Glow[]; dof?: number }> = ({ mood, cam, back, actors, front, glows = [], dof }) => (
  <LookContext.Provider value={moodLook(mood, { glows, ...(dof !== undefined ? { dof } : {}) })}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} front={front} />
  </LookContext.Provider>
);

/** 0..1..0: in over `fade` frames from `from`, out over `fade` frames to `to`. */
export const within = (frame: number, from: number, to: number, fade = 8) =>
  Math.max(0, Math.min(1, (frame - from) / fade, (to - frame) / fade));
