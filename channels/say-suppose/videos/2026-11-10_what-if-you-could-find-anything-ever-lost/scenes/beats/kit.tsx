// Scene helpers shared by every beat of this film: scene-local time, the camera, and the generic set pieces (a wall,
// a floor, a window). A scene's own drawing lives in its beat file.
import { Easing, interpolate } from "remotion";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Shot } from "../shared";

/** Scene-local time: `f` frames since the scene began, `d` its length, `at(i)`/`end(i)` line i's start/end in the
 *  scene's frames (negative if before it). */
export function local(shot: Shot) {
  const f = shot.frame - shot.from;
  const d = shot.to - shot.from;
  const at = (i: number) => (shot.clips[i] ? shot.clips[i].from - shot.from : d);
  const end = (i: number) => (shot.clips[i] ? shot.clips[i].from + shot.clips[i].frames - shot.from : d);
  return { f, d, at, end };
}

export const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A camera moving between two framings across the scene, with a slow drift so a held frame breathes. */
export function push(f: number, d: number, from: Camera, to: Camera, seed = "cam"): Camera {
  const t = ease(f, 0, Math.max(1, d));
  return drift({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, zoom: from.zoom + (to.zoom - from.zoom) * t }, f, seed, 5);
}

export const WIDE: Camera = { x: 960, y: 540, zoom: 1 };

/** A scene on the kit's stage with the camera identity at WIDE. */
export const Set: React.FC<{ cam?: Camera; back: React.ReactNode; actors: React.ReactNode; front?: React.ReactNode }> = ({
  cam = WIDE, back, actors, front,
}) => <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} front={front} />;

/** A plain room: a back wall, a skirting line and a floor. */
export const Room: React.FC<{ wall: string; floor: string; horizon?: number; trim?: string }> = ({ wall, floor, horizon = 760, trim = "#00000033" }) => (
  <g>
    <rect width={1920} height={1080} fill={wall} />
    <rect y={horizon} width={1920} height={1080 - horizon} fill={floor} />
    <rect y={horizon - 10} width={1920} height={12} fill={trim} />
  </g>
);

/** A window with its own sky behind bars. */
export const Window: React.FC<{ x: number; y: number; w: number; h: number; sky: string; children?: React.ReactNode }> = ({ x, y, w, h, sky, children }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={sky} />
    {children}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#3b2f2a" strokeWidth={14} />
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#3b2f2a" strokeWidth={8} />
    <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#3b2f2a" strokeWidth={8} />
  </g>
);
