// Small helpers builder C's beats share (The Night Shift, The Photo, The Warehouses): aiming an arm at a point, a
// talking mouth, the hand's position, a line that draws itself, and the paper insert (a sheet on a lamp-lit table).
import { Audio, Sequence, staticFile } from "remotion";
import { dir, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import type { Mouth } from "@whatif/kit/rig/Figure";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Deep } from "@whatif/kit/sets/common";
import { INK } from "@whatif/kit/theme";
import { Sheet } from "../parts";

export interface Body { x: number; y: number; scale: number; facing: 1 | -1; pose: Pose }

/** The shoulder of a Figure, in world coordinates. */
export function shoulderOf(b: Body) {
  const sh = joints(b.pose).shoulder;
  return { x: b.x + sh.x * b.scale * b.facing, y: b.y + sh.y * b.scale };
}

/** Arm angles (for armF or armB) that put the hand on a world point (as near as the arm reaches). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderOf(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** Where a hand is, in world coordinates, for arm angles `arm`. */
export function handOf(b: Body, arm: [number, number]) {
  const s = shoulderOf(b);
  const a = dir(arm[0]);
  const c = dir(arm[0] + arm[1]);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

/** A mouth that moves while a line plays (alternating shapes, never lip-sync), else `rest`. */
export const talk = (frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth =>
  frame >= from && frame < to ? (Math.floor((frame - from) / 4) % 3 === 1 ? "o" : "open") : rest;

/** A path that draws itself as `t` goes 0..1 (fills once drawn, if `fill`). */
export const Draw: React.FC<{ d: string; t: number; color?: string; w?: number; fill?: string; opacity?: number }> = ({
  d, t, color = INK, w = 6, fill, opacity = 1 }) => {
  if (t <= 0) return null;
  const k = Math.min(1, t);
  return (
    <g opacity={opacity}>
      {fill && <path d={d} fill={fill} opacity={Math.max(0, (t - 0.85) / 0.15)} />}
      <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} fill="none" stroke={color} strokeWidth={w}
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** The paper insert: a cream sheet unfolding at `at` on a dark table under the lamp, the camera pushing in a little.
 *  Children draw on the sheet, in its own coordinates (0..w by 0..h). */
export const PaperInsert: React.FC<{ frame: number; at: number; end: number; w?: number; h?: number; tilt?: number;
  table?: string; children: React.ReactNode }> = ({ frame, at, end, w = 1240, h = 800, tilt = -1.5, table = "#4a3426", children }) => {
  const p = Math.min(1, Math.max(0, (frame - at) / Math.max(1, end - at)));
  const cam: Camera = { x: 960 + p * 10, y: 540 - p * 6, zoom: 0.97 + p * 0.07 };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={0.9} flat>
          <rect x={-800} y={-600} width={3600} height={2400} fill={table} />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M-800 ${i * 120 - 100} C200 ${i * 120 - 70} 1400 ${i * 120 - 130} 2800 ${i * 120 - 90}`} fill="none" stroke="#000" strokeWidth={4} opacity={0.12} />
          ))}
          <circle cx={1500} cy={120} r={900} fill="#ffd9a0" opacity={0.12} />
        </Deep>
      }
      actors={<Sheet frame={frame} at={at} x={960} y={545} w={w} h={h} tilt={tilt}>{children}</Sheet>} />
  );
};

/** A sound effect from assets/sfx (e.g. "stamp", "paper", "tick") at each frame given. Place OUTSIDE <Stage>. */
export const Sfx: React.FC<{ name: string; at: number[]; volume?: number; frames?: number }> = ({ name, at, volume = 0.4, frames = 30 }) => (
  <>
    {at.map((f, i) => (
      <Sequence key={i} from={f} durationInFrames={frames}>
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);
