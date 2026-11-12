// Small pieces for builder B's beats (The City Plays, The Cheapest Man): a Stage wrapper lit by a set's lights in a
// given mood, an eased camera glide, a talking mouth, the rock-paper-scissors hands, a hood, a shoulder bag, an
// envelope, a fan of cards, a phone with its glow, a coin, the coach's sandwich board, a rat. All drawn in world (or,
// for `held` props, figure) units inside a <Stage> slot.
import { setLook, type SetLight } from "@whatif/kit/sets/common";
import type { Mouth } from "@whatif/kit/rig/Figure";
import { joints, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { FONT } from "@whatif/kit/fonts";
import { mix, ramp } from "../shared";
import type { Body } from "../kit";

/** A Stage lit by `lights` in `mood`. */
export const Shot: React.FC<{
  cam: Camera; mood: MoodName; lights: SetLight[]; back: React.ReactNode; actors: React.ReactNode; front?: React.ReactNode;
}> = ({ cam, mood, lights, back, actors, front }) => (
  <LookContext.Provider value={setLook(lights, mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} front={front} />
  </LookContext.Provider>
);

/** An eased camera move from `a` to `b` between frames; zoom moves on a log scale so a pull-back keeps its pace. */
export function glide(frame: number, from: number, to: number, a: Camera, b: Camera): Camera {
  const t = ramp(frame, from, to);
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), zoom: Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), t)) };
}

/** A speaking mouth between two frames (open and shut every few frames, no lip-sync), `rest` outside it. */
export const talk = (frame: number, from: number, to: number, rest: Mouth = "flat", beat = 5): Mouth =>
  frame >= from && frame < to ? (Math.floor((frame - from) / beat) % 2 === 0 ? "open" : rest) : rest;

/** Rock, paper or scissors in a front hand (figure units, drawn at the hand). `skin` is the head colour. */
export const Throw: React.FC<{ shape: "rock" | "paper" | "scissors"; skin: string }> = ({ shape, skin }) => {
  if (shape === "rock") {
    return (
      <g>
        <circle r={17} fill={skin} stroke={INK} strokeWidth={4} />
        {[-7, 0, 7].map((y) => <line key={y} x1={4} y1={y} x2={14} y2={y} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
      </g>
    );
  }
  if (shape === "paper") {
    return (
      <g transform="rotate(-10)">
        <rect x={-6} y={-16} width={40} height={32} rx={10} fill={skin} stroke={INK} strokeWidth={4} />
        {[-8, 0, 8].map((y) => <line key={y} x1={14} y1={y} x2={32} y2={y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />)}
      </g>
    );
  }
  return (
    <g>
      <circle r={14} fill={skin} stroke={INK} strokeWidth={4} />
      <path d="M6 -4 L36 -18 M6 4 L36 16" stroke={skin} strokeWidth={9} strokeLinecap="round" />
      <path d="M6 -4 L36 -18 M6 4 L36 16" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

/** The pump and throw of rock-paper-scissors: three pumps in the 24 frames before `at`, then the arm out. Returns the
 *  front arm and whether the shape is out. */
export function pump(frame: number, at: number): { armF: [number, number]; out: boolean } {
  if (frame >= at && frame < at + 40) return { armF: [84, 12], out: true };
  if (frame >= at - 24 && frame < at) {
    const p = (frame - (at - 24)) / 8;
    return { armF: [62 + Math.sin(p * Math.PI * 2) * 30, 64], out: false };
  }
  return { armF: [58, 70], out: false };
}

/** A hood round a head (draw BEFORE the figure so the face shows in it). */
export const Hood: React.FC<{ b: Body; color: string }> = ({ b, color }) => {
  const j = joints(b.pose);
  const hx = b.x + j.head.x * b.scale * b.facing;
  const hy = b.y + j.head.y * b.scale;
  const r = 46 * b.scale;
  return (
    <g>
      <circle cx={hx - b.facing * r * 0.18} cy={hy - r * 0.08} r={r * 1.28} fill={color} stroke={INK} strokeWidth={Math.max(3, 4 * b.scale)} />
      <path d={`M${hx - b.facing * r * 1.1} ${hy + r * 0.2} q${-b.facing * r * 0.2} ${r * 1.0} ${b.facing * r * 0.5} ${r * 1.3}`} fill="none" stroke={color} strokeWidth={r * 0.5} strokeLinecap="round" />
    </g>
  );
};

/** A shoulder bag on a figure's back hip, the strap over the shoulder (draw AFTER the figure). */
export const ShoulderBag: React.FC<{ b: Body; color?: string }> = ({ b, color = "#b5643a" }) => {
  const j = joints(b.pose);
  const s = b.scale;
  const sx = b.x + j.shoulder.x * s * b.facing, sy = b.y + j.shoulder.y * s;
  const bx = b.x - b.facing * 30 * s, by = b.y + (j.hip.y - 10) * s;
  return (
    <g>
      <line x1={sx} y1={sy} x2={bx + b.facing * 10 * s} y2={by} stroke={INK} strokeWidth={5 * s} />
      <rect x={bx - 26 * s} y={by - 6 * s} width={52 * s} height={44 * s} rx={8 * s} fill={color} stroke={INK} strokeWidth={4 * s} />
      <rect x={bx - 26 * s} y={by - 6 * s} width={52 * s} height={14 * s} rx={6 * s} fill="#000" opacity={0.18} />
    </g>
  );
};

/** An envelope held in a hand (figure units); `open` 0..1 lifts the letter out. */
export const Envelope: React.FC<{ open?: number; tilt?: number }> = ({ open = 0, tilt = -12 }) => (
  <g transform={`rotate(${tilt}) translate(-4 -30)`}>
    {open > 0 && <rect x={-20} y={-14 - open * 30} width={40} height={44} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />}
    {open > 0 && [0, 1, 2].map((i) => <rect key={i} x={-13} y={-6 - open * 30 + i * 9} width={26} height={4} rx={2} fill={INK} opacity={0.5} />)}
    <rect x={-26} y={0} width={52} height={36} rx={4} fill="#efe3c8" stroke={INK} strokeWidth={3.5} />
    <path d={open > 0 ? "M-26 0 L0 -16 L26 0" : "M-26 0 L0 18 L26 0"} fill="#e3d4b2" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={0} cy={22} r={5} fill="#7d7f86" />
  </g>
);

/** A fan of playing cards held up (figure units). `spread` 0 closes it. */
export const CardFan: React.FC<{ spread?: number }> = ({ spread = 1 }) => (
  <g transform="translate(6 -26)">
    {[-2, -1, 0, 1, 2].map((i) => (
      <g key={i} transform={`rotate(${i * 13 * spread} 0 30)`}>
        <rect x={-14} y={-26} width={28} height={42} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={-6} r={6} fill={i % 2 ? CRIMSON : INK} />
      </g>
    ))}
  </g>
);

/** A phone in a hand, screen toward the face, and the screen's cool light (figure units). */
export const LitPhone: React.FC<{ glow?: number }> = ({ glow = 1 }) => (
  <g transform="rotate(-24) translate(-8 -36)">
    <circle cx={0} cy={20} r={46} fill="#cfe9f4" opacity={0.18 * glow} />
    <rect x={-13} y={-2} width={28} height={48} rx={6} fill="#1b1d24" />
    <rect x={-10} y={2} width={22} height={38} rx={3} fill="#d6eef7" />
  </g>
);

/** A coin (world units). */
export const Coin: React.FC<{ x: number; y: number; r?: number; edge?: number }> = ({ x, y, r = 12, edge = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(1 ${Math.max(0.15, edge)})`}>
    <circle r={r} fill="#e8b84a" stroke={INK} strokeWidth={Math.max(2, r * 0.22)} />
    <circle r={r * 0.55} fill="none" stroke="#b58a2a" strokeWidth={Math.max(1.5, r * 0.12)} />
  </g>
);

/** The coach's sandwich board, two cream boards with no lettering, and a small paper subscribe tag pinned to the
 *  corner (a red paper tag with a little white bell). Draw AFTER the figure. */
export const SandwichBoard: React.FC<{ b: Body; frame: number }> = ({ b, frame }) => {
  const j = joints(b.pose);
  const s = b.scale;
  const nx = b.x + j.neck.x * s * b.facing, ny = b.y + j.neck.y * s;
  const top = ny + 30 * s, h = 160 * s, w = 96 * s;
  const sway = Math.sin(frame / 9) * 3;
  return (
    <g>
      <line x1={nx - 12 * s} y1={ny + 4 * s} x2={nx - w / 2 + 10 * s} y2={top} stroke={INK} strokeWidth={4 * s} />
      <line x1={nx + 12 * s} y1={ny + 4 * s} x2={nx + w / 2 - 10 * s} y2={top} stroke={INK} strokeWidth={4 * s} />
      <g transform={`rotate(${sway * 0.4} ${nx} ${top})`}>
        <rect x={nx - w / 2} y={top} width={w} height={h} rx={6 * s} fill="#efe3c8" stroke={INK} strokeWidth={5 * s} />
        <rect x={nx - w / 2 + 10 * s} y={top + 10 * s} width={w - 20 * s} height={h - 20 * s} rx={4 * s} fill="none" stroke="#cdbfa6" strokeWidth={3 * s} />
        {/* the subscribe tag, pinned to the lower corner, on its own small swing */}
        <g transform={`translate(${nx + w / 2 - 14 * s} ${top + h - 26 * s}) rotate(${-8 + sway})`}>
          <circle cx={0} cy={-6 * s} r={3 * s} fill={INK} />
          <rect x={-16 * s} y={-4 * s} width={34 * s} height={24 * s} rx={5 * s} fill={CRIMSON} stroke={INK} strokeWidth={3 * s} />
          <path d={`M${-5 * s} ${13 * s} q0 ${-10 * s} ${6 * s} ${-10 * s} q${6 * s} 0 ${6 * s} ${10 * s}z`} fill={PAPER} />
          <circle cx={1 * s} cy={15 * s} r={2 * s} fill={PAPER} />
        </g>
      </g>
    </g>
  );
};

/** A small rat seen side on (sheet units), facing right; `tail` 0 hides the tail. */
export const Rat: React.FC<{ x: number; y: number; s?: number; flip?: boolean; tail?: boolean }> = ({ x, y, s = 1, flip, tail = true }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {tail && <path d="M-34 4 q-30 6 -46 -14" fill="none" stroke="#c98a8a" strokeWidth={5} strokeLinecap="round" />}
    <ellipse cx={0} cy={0} rx={36} ry={20} fill="#8e8a84" stroke={INK} strokeWidth={4} />
    <circle cx={32} cy={-8} r={14} fill="#8e8a84" stroke={INK} strokeWidth={4} />
    <circle cx={26} cy={-22} r={8} fill="#c98a8a" stroke={INK} strokeWidth={3} />
    <circle cx={38} cy={-10} r={3} fill={INK} />
  </g>
);

/** A rat's tail alone (sheet units). */
export const Tail: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path d={`M${x - 30 * s} ${y + 10 * s} q${20 * s} ${-40 * s} ${40 * s} ${-6 * s} q${16 * s} ${26 * s} ${24 * s} ${-14 * s}`} fill="none" stroke="#c98a8a" strokeWidth={7 * s} strokeLinecap="round" />
);

/** Stamped number tiles on a sheet: a number the narrator says (sheet units). */
export const Stamp: React.FC<{ x: number; y: number; text: string; color: string; size: number }> = ({ x, y, text, color, size }) => (
  <g transform={`translate(${x} ${y})`}>
    {text.split("").map((ch, i, all) => {
      const cx = (i - (all.length - 1) / 2) * size * 0.62;
      return (
        <g key={i} transform={`translate(${cx} 0)`}>
          <rect x={-size * 0.28} y={-size * 0.42} width={size * 0.56} height={size * 0.84} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={4} />
          <text x={0} y={size * 0.26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.66} fill={PAPER}>{ch}</text>
        </g>
      );
    })}
  </g>
);

/** Pose helpers. */
export const withArms = (p: Pose, armF?: [number, number], armB?: [number, number]): Pose => ({ ...p, ...(armF ? { armF } : {}), ...(armB ? { armB } : {}) });
