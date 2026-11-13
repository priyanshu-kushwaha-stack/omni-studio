// Rig helpers for builder A's beats (The Chair, Night One, The Rule): where a figure's hand or head is in the world,
// the arm angles that put a hand on a target, a talking mouth, and a group drawn in a figure's head coordinates (for
// the band, the nurse's paper cap).
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { GHOST } from "../shared";

/** The placement of a Figure: everything its transform needs. */
export interface Placed { x: number; y: number; scale: number; facing: 1 | -1; rotate?: number; pose: Pose }

/** p of the way through line i, as a whole frame. */
export const lineAt = (clips: Clip[], i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);

/** A figure-local point (feet at 0,0, facing right, unscaled) in world units, through the Figure's own transform. */
export function toWorld(f: Placed, p: { x: number; y: number }) {
  const hipY = joints(f.pose).hip.y * f.scale;
  const sx = p.x * f.scale * f.facing;
  const sy = p.y * f.scale - hipY;
  const a = ((f.rotate ?? 0) * Math.PI) / 180;
  return { x: f.x + sx * Math.cos(a) - sy * Math.sin(a), y: f.y + hipY + sx * Math.sin(a) + sy * Math.cos(a) };
}

/** A world point in a figure's local units (the inverse of toWorld). */
export function toLocal(f: Placed, w: { x: number; y: number }) {
  const hipY = joints(f.pose).hip.y * f.scale;
  const a = (-(f.rotate ?? 0) * Math.PI) / 180;
  const dx = w.x - f.x;
  const dy = w.y - f.y - hipY;
  const rx = dx * Math.cos(a) - dy * Math.sin(a);
  const ry = dx * Math.sin(a) + dy * Math.cos(a);
  return { x: rx / (f.scale * f.facing), y: (ry + hipY) / f.scale };
}

/** Where a hand is in figure-local units. */
export function handLocal(pose: Pose, arm: "armF" | "armB") {
  const j = joints(pose);
  const [u, f] = pose[arm];
  const a = dir(u);
  const b = dir(u + f);
  return { x: j.shoulder.x + (a.x + b.x) * LIMB, y: j.shoulder.y + (a.y + b.y) * LIMB };
}

export const handWorld = (f: Placed, arm: "armF" | "armB") => toWorld(f, handLocal(f.pose, arm));
export const headWorld = (f: Placed) => toWorld(f, joints(f.pose).head);

/** The arm angles that put a figure's hand on a world point (as far as the arm reaches). */
export function aim(f: Placed, target: { x: number; y: number }): [number, number] {
  const l = toLocal(f, target);
  const s = joints(f.pose).shoulder;
  return reach(l.x - s.x, l.y - s.y);
}

/** A mouth that moves while a line plays (open, o, open, flat ...), never lip-sync; `rest` outside it. */
export function talk(frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth {
  if (frame < from || frame >= to) return rest;
  const step = Math.floor((frame - from) / 5) % 4;
  return (["open", "o", "open", "flat"] as const)[step];
}

/** Draws children in a figure's head coordinates (head centre at 0,0, radius 46, facing right), so a band or a cap
 *  follows the head through the figure's lean, tilt and recline. */
export const HeadGear: React.FC<{ f: Placed; children: React.ReactNode }> = ({ f, children }) => {
  const j = joints(f.pose);
  return (
    <g transform={`translate(${f.x} ${f.y}) rotate(${f.rotate ?? 0} 0 ${j.hip.y * f.scale}) scale(${f.scale * f.facing} ${f.scale})`}>
      <g transform={`translate(${j.head.x} ${j.head.y}) rotate(${f.pose.tilt})`}>{children}</g>
    </g>
  );
};

/** The band across a forehead, in head coordinates (as parts.tsx Sleeper draws it); `lit` 0..1. */
export const BandOnHead: React.FC<{ lit: number; color?: string }> = ({ lit, color }) => (
  <g>
    <path d="M-44 -22 Q0 -36 44 -22" fill="none" stroke="#1b1d24" strokeWidth={8} strokeLinecap="round" />
    {lit > 0.05 && <circle cx={30} cy={-28} r={16} fill={color ?? GHOST.light} opacity={0.3 * lit} />}
    <circle cx={30} cy={-28} r={7} fill={lit > 0.05 ? (color ?? GHOST.light) : "#2a3a3a"} stroke="#1b1d24" strokeWidth={3} />
  </g>
);

/** Where the band's light is in head coordinates (BandOnHead). */
export const BAND_LIGHT = { x: 30, y: -28 };

/** A point in head coordinates in world units. */
export function headToWorld(f: Placed, p: { x: number; y: number }) {
  const j = joints(f.pose);
  const a = (f.pose.tilt * Math.PI) / 180;
  return toWorld(f, { x: j.head.x + p.x * Math.cos(a) - p.y * Math.sin(a), y: j.head.y + p.x * Math.sin(a) + p.y * Math.cos(a) });
}

/** A Figure at a placement, with the rest of its props. */
export const Body: React.FC<{ f: Placed } & Omit<FigureProps, "x" | "y" | "scale" | "facing" | "rotate" | "pose">> = ({ f, ...rest }) => (
  <Figure x={f.x} y={f.y} scale={f.scale} facing={f.facing} rotate={f.rotate} pose={f.pose} {...rest} />
);

/** A few banknotes, fanned, centred on (x, y). `n` notes. */
export const Notes: React.FC<{ x: number; y: number; n: number; scale?: number; tilt?: number }> = ({ x, y, n, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`rotate(${(i - (n - 1) / 2) * 12})`}>
        <rect x={-34} y={-18} width={68} height={36} rx={4} fill="#b9d7a8" stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={0} r={9} fill="none" stroke="#6f9a5c" strokeWidth={3} />
      </g>
    ))}
  </g>
);
