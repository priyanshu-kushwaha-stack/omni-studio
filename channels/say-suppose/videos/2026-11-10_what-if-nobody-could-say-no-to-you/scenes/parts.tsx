// Shared parts for "What If Nobody Could Say No to You?": the rule device (the stamped YES tag), speech bubbles, the
// paper sheet facts are drawn on, and the props that mark the cast. Everything here is drawn in WORLD coordinates and
// goes inside a <Stage> `actors` or `back` slot (an SVG), so the camera moves it. Nothing here plays sound: sounds sit
// outside <Stage> and <Figure> (kit/sound.ts).
import { interpolate, spring } from "remotion";
import { joints, HEAD_R, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, PAPER } from "@whatif/kit/theme";
import { MOTHER } from "./shared";

/** Where a figure's head centre is, in world coordinates. `facing` mirrors x. */
export function headAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

const pop = (frame: number, at: number, stiffness = 210) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness, mass: 0.6 } });

/**
 * The rule device: a cream paper tag stamped YES that flips up over whoever you ask, with one paper snap (the snap
 * itself is a sound the beat places outside the Stage, at `at`). It hangs from a short string above the head.
 * `slow` gives the mother's slow, soft flip. `size` is the tag height in world px (default 0.9 of the head radius x 2).
 */
export const YesTag: React.FC<{
  frame: number; at: number; x: number; headY: number; r: number; slow?: boolean; text?: string; tilt?: number;
  until?: number;
}> = ({ frame, at, x, headY, r, slow, text = "YES", tilt = -4, until }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const t = slow
    ? interpolate(frame, [at, at + 40], [0, 1], { extrapolateRight: "clamp" })
    : pop(frame, at);
  const h = r * 0.95;
  const w = h * (text.length * 0.62 + 0.7);
  const top = headY - r - h * 1.55;
  // The flip: the tag rotates up from flat (scaleY 0) about its top edge, overshooting a little.
  const sway = Math.sin((frame - at) / 9) * 2 * Math.max(0, 1 - (frame - at) / 60);
  return (
    <g transform={`translate(${x} ${top}) rotate(${tilt + sway}) scale(1 ${Math.max(0.001, t)})`}>
      <line x1={0} y1={-h * 0.45} x2={0} y2={h * 0.08} stroke={INK} strokeWidth={Math.max(2, r * 0.04)} />
      <rect x={-w / 2} y={0} width={w} height={h} rx={h * 0.16} fill={PAPER} stroke={INK} strokeWidth={Math.max(3, r * 0.06)} />
      <circle cx={-w / 2 + h * 0.28} cy={h * 0.5} r={h * 0.09} fill="none" stroke={INK} strokeWidth={Math.max(2, r * 0.035)} />
      <text x={h * 0.12} y={h * 0.74} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.66}
        fill={INK} letterSpacing={2}>{text}</text>
    </g>
  );
};

/**
 * A speech bubble, four words or fewer, pointing down-left or down-right at a speaker. (x, y) is the tail's tip.
 * Pops in at `at`, gone at `until`.
 */
export const Bubble: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right";
}> = ({ frame, at, until, x, y, text, size = 46, side = "right" }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame, at, 260);
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
      <rect x={x + dir * size * 0.55 - 4} y={by + h - 9} width={size + 8} height={12} fill={PAPER} />
      <text x={bx + w / 2} y={by + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size}
        fill={INK}>{text}</text>
    </g>
  );
};

/**
 * A cream paper sheet that unfolds at `at` (facts are drawn on paper: style.md, "Facts are drawn"). Children are drawn
 * in the sheet's own coordinates, 0..w by 0..h; use <DrawLine> from the kit for lines that draw themselves.
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

/** Your mother's bun, behind her head. Draw it BEFORE her <Figure> so the head covers its lower half. */
export const Bun: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const h = headAt(x, y, scale, pose, facing);
  return <circle cx={h.x - facing * h.r * 0.62} cy={h.y - h.r * 0.82} r={h.r * 0.42} fill={MOTHER.bun} />;
};

/** Your mother's orange shawl with a paper hem, over both shoulders. Draw it AFTER her <Figure>. */
export const Shawl: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const h = headAt(x, y, scale, pose, facing);
  const s = scale;
  const cx = h.x, top = h.y + h.r * 0.95;
  return (
    <path d={`M${cx - 30 * s} ${top} Q${cx} ${top + 14 * s} ${cx + 30 * s} ${top}
      L${cx + 52 * s} ${top + 74 * s} Q${cx} ${top + 48 * s} ${cx - 52 * s} ${top + 74 * s} Z`}
      fill={MOTHER.shawl} stroke={PAPER} strokeWidth={Math.max(3, 4 * s)} strokeLinejoin="round" />
  );
};

/** Dev's headphones, round his neck. Draw AFTER his <Figure>. */
export const Headphones: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const h = headAt(x, y, scale, pose, facing);
  const s = scale;
  return (
    <g fill="none" stroke="#1b1d24" strokeWidth={7 * s} strokeLinecap="round">
      <path d={`M${h.x - 26 * s} ${h.y + h.r + 2 * s} Q${h.x} ${h.y + h.r + 22 * s} ${h.x + 26 * s} ${h.y + h.r + 2 * s}`} />
      <circle cx={h.x - 28 * s} cy={h.y + h.r + 2 * s} r={9 * s} fill="#1b1d24" />
      <circle cx={h.x + 28 * s} cy={h.y + h.r + 2 * s} r={9 * s} fill="#1b1d24" />
    </g>
  );
};

/** A crimson pointer arrow (at most one per frame). From (x1,y1) to the tip (x2,y2). */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; width?: number }> = ({ x1, y1, x2, y2, width = 16 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const l = width * 3;
  const p = (da: number) => `${x2 - l * Math.cos(a + da)} ${y2 - l * Math.sin(a + da)}`;
  return (
    <g fill="none" stroke={CRIMSON} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} />
      <path d={`M${p(0.5)} L${x2} ${y2} L${p(-0.5)}`} />
    </g>
  );
};
