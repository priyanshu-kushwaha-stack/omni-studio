// Helpers for "Sunday" (Sunday.tsx): your mother (always with her bun and shawl), the stranger on the far lane, the
// lane's corner you turn at the end, a steel glass of water and her ladle.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { Bun, Shawl } from "../parts";
import { MOTHER, STRANGER } from "../shared";
import { Deep, REF } from "../sets/common";
import { MOTHER_GATE } from "../sets/MothersHouse";

/** Your mother: the bun behind her head, the figure, the shawl over her shoulders. Same props as a Figure. */
export const Mom: React.FC<Omit<FigureProps, "head" | "coat">> = (p) => {
  const b = { x: p.x, y: p.y, scale: p.scale ?? 1, pose: p.pose ?? STAND, facing: p.facing ?? 1 };
  return (
    <>
      <Bun {...b} />
      <Figure head={MOTHER.head} coat={MOTHER.coat} {...p} />
      <Shawl {...b} />
    </>
  );
};

/** The far lane's layer depth (MothersHouse.tsx draws the far pavement on the 0.55 layer). */
const D = 0.55;
/** A world x or y on the actors' plane, as a coordinate on a Deep layer of depth d under this camera. */
const toLayer = (v: number, camV: number, refV: number, d: number) => v - (camV - refV) * (1 - d);

/**
 * The stranger: crimson head, long dark coat, walking left to right along MOTHER_GATE.farLane, never turning. For the
 * `back` slot, after the set. He walks from behind `fromX` (a world x on the actors' plane, your mother, who is drawn
 * over him) to behind the house front (world x 1380), and the compound wall (world y 720) hides him below the waist:
 * both are clipped here for this camera, since the set's layers are drawn before him. `p` is 0..1 across the walk.
 */
export const Stranger: React.FC<{ cam: Camera; frame: number; p: number; fromX: number }> = ({ cam, frame, p, fromX }) => {
  if (p <= 0 || p >= 1) return null;
  const startX = toLayer(fromX, cam.x, REF.x, D);
  const edge = toLayer(1380, cam.x, REF.x, D);
  const wallTop = toLayer(720, cam.y, REF.y, D);
  const x = startX + (edge + 60 - startX) * p;
  const s = MOTHER_GATE.farLane.scale, y = MOTHER_GATE.farLane.y;
  const pose = walkPose(frame * 0.45);
  return (
    <Deep cam={cam} depth={D} flat>
      <clipPath id="sunday-stranger"><rect x={-2000} y={-2000} width={edge + 2000} height={wallTop + 2000} /></clipPath>
      <g clipPath="url(#sunday-stranger)">
        <Figure x={x} y={y} scale={s} facing={1} pose={pose} head={STRANGER.head} coat={STRANGER.coat} look={{ x: 0.9, y: 0 }}
          mouth="flat" brows="flat" time={frame} />
        {/* the long coat, past the knees */}
        <path d={`M${x - 20 * s} ${y - 224 * s} L${x + 22 * s} ${y - 224 * s} L${x + 40 * s} ${y - 40 * s} L${x - 38 * s} ${y - 40 * s}Z`}
          fill={STRANGER.coat} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </Deep>
  );
};

/** The lane's corner: a near house wall at the far left of the gate view you walk behind at the end (front slot). */
export const LaneCorner: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={1}>
    <rect x={-1400} y={120} width={1250} height={1100} fill="#d9a77e" stroke={INK} strokeWidth={6} />
    <rect x={-190} y={120} width={40} height={1100} fill="#c08e66" />
    <rect x={-560} y={380} width={220} height={200} rx={8} fill="#6c7f8f" stroke={INK} strokeWidth={6} />
    <path d="M-1400 120 H-130 L-150 90 H-1400Z" fill="#b5553a" stroke={INK} strokeWidth={5} />
  </Deep>
);

/** A steel tumbler of water, base centre at (x, y). */
export const Tumbler: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-18 -56 L18 -56 L14 0 L-14 0Z" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={0} cy={-56} rx={18} ry={5} fill="#cfe6ec" stroke={INK} strokeWidth={3} />
  </g>
);

/** Her ladle (Figure `held`): a long handle and a bowl, `full` with dal. */
export const Ladle: React.FC<{ tilt?: number; full?: boolean }> = ({ tilt = 30, full }) => (
  <g transform={`rotate(${tilt})`}>
    <line x1={0} y1={0} x2={0} y2={70} stroke="#9aa1ab" strokeWidth={7} strokeLinecap="round" />
    <path d="M-20 70 Q0 100 20 70Z" fill="#c9ced6" stroke={INK} strokeWidth={4} />
    {full && <ellipse cx={0} cy={72} rx={16} ry={5} fill="#e0a23c" />}
  </g>
);
