// Shared parts for "What If You Lived a Year Every Night?": the rule device (the split-flap day counter on every pod
// hatch, and the same counter hung in the inside town's sky as its sun), speech bubbles and the paper sheet facts are
// drawn on. Everything here is drawn in WORLD coordinates and goes inside a <Stage> `actors` or `back` slot (an SVG),
// so the camera moves it. Nothing here plays sound: the counter's flutter and click are <CounterSound> placed OUTSIDE
// <Stage> (kit/sound.ts).
import { Audio, interpolate, Sequence, spring, staticFile } from "remotion";
import { joints, HEAD_R, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, PAPER } from "@whatif/kit/theme";
import { noise } from "./shared";

/** Where a figure's head centre is, in world coordinates. `facing` mirrors x. */
export function headAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

const pop = (frame: number, at: number, stiffness = 210) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness, mass: 0.6 } });

/** Frames the counter takes to flutter from 001 to 365 (one inside year: one night out here). */
export const FLUTTER_FRAMES = 36;

/** What the counter shows at this frame: blank (dark) before `at` when `dark`, a blur of digits while it flutters, then
 *  `value`. `value` is a string of digits, "365" by default. */
export function counterText(frame: number, at: number, value = "365"): string | null {
  if (frame < at) return null;
  if (frame >= at + FLUTTER_FRAMES) return value;
  const t = (frame - at) / FLUTTER_FRAMES;
  const n = Math.max(1, Math.round(1 + t * (Number(value) - 1) + (noise(frame) - 0.5) * 20));
  return String(Math.min(Number(value), n)).padStart(value.length, "0");
}

/** One crimson split-flap tile, its lower flap just landed. A blank tile when `ch` is "". */
const Tile: React.FC<{ ch: string; x: number; y: number; s: number; lit: boolean }> = ({ ch, x, y, s, lit }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill="#000" opacity={0.4} transform={`translate(${s * 0.05} ${s * 0.08})`} />
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill={lit ? CRIMSON : "#2b2f3d"} stroke={PAPER} strokeWidth={s * 0.045} />
    <line x1={-s * 0.4} y1={0} x2={s * 0.4} y2={0} stroke={lit ? "#7a1022" : "#15171f"} strokeWidth={s * 0.035} />
    {ch && <text x={0} y={s * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.82} fill={PAPER}>{ch}</text>}
  </g>
);

/**
 * The rule device: the day counter, three crimson split-flap tiles on an ink plate. (x, y) is its centre, `tile` the
 * tile height in px. It flutters from 001 to `value` starting at `at` (a frame), or shows `value` steadily when `at` is
 * undefined; `dark` shows three blank, unlit tiles (the last morning).
 */
export const Counter: React.FC<{ frame: number; x: number; y: number; tile?: number; at?: number; value?: string; dark?: boolean }> = ({
  frame, x, y, tile = 150, at, value = "365", dark,
}) => {
  const text = dark ? null : at === undefined ? value : counterText(frame, at, value) ?? "000";
  const chars = (text ?? "   ").split("");
  const w = tile * 0.86;
  const x0 = x - ((chars.length - 1) * w) / 2;
  return (
    <g>
      <rect x={x0 - tile * 0.55} y={y - tile * 0.7} width={(chars.length - 1) * w + tile * 1.1} height={tile * 1.4} rx={tile * 0.16} fill={INK} stroke={PAPER} strokeWidth={Math.max(3, tile * 0.05)} />
      {chars.map((ch, i) => <Tile key={i} ch={ch.trim()} x={x0 + i * w} y={y} s={tile} lit={!dark} />)}
    </g>
  );
};

/** The counter's sound: the card flutter while it runs and the click as it stops (assets/sfx, make_sfx.sh). Place it
 *  OUTSIDE <Stage>. */
export const CounterSound: React.FC<{ at: number; volume?: number }> = ({ at, volume = 1 }) => (
  <>
    <Sequence from={at} durationInFrames={FLUTTER_FRAMES + 4}><Audio src={staticFile("sfx/flutter.wav")} volume={0.7 * volume} /></Sequence>
    <Sequence from={at + FLUTTER_FRAMES} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={volume} /></Sequence>
  </>
);

/** The wall clock's single tick (one night out here), placed OUTSIDE <Stage>. */
export const TickSound: React.FC<{ at: number; volume?: number }> = ({ at, volume = 0.8 }) => (
  <Sequence from={at} durationInFrames={8}><Audio src={staticFile("sfx/tick.wav")} volume={volume} /></Sequence>
);

/** A wall clock, its hand at `minutes` past the hour (0..60) and its hour hand at `hours`. */
export const WallClock: React.FC<{ x: number; y: number; r?: number; minutes: number; hours: number }> = ({ x, y, r = 60, minutes, hours }) => {
  const m = (minutes / 60) * 360;
  const h = ((hours % 12) / 12) * 360 + m / 12;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={PAPER} stroke={INK} strokeWidth={r * 0.1} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-r * 0.78} x2={0} y2={-r * 0.9} stroke={INK} strokeWidth={r * 0.06} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={INK} strokeWidth={r * 0.09} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.75} stroke={INK} strokeWidth={r * 0.06} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={r * 0.07} fill={CRIMSON} />
    </g>
  );
};

/** The cable: teal with an ink edge, along an SVG path. */
export const Cable: React.FC<{ d: string; width?: number }> = ({ d, width = 18 }) => (
  <g>
    <path d={d} fill="none" stroke={INK} strokeWidth={width + 10} strokeLinecap="round" />
    <path d={d} fill="none" stroke="#1D9A8F" strokeWidth={width} strokeLinecap="round" />
  </g>
);

/** A mop held upright: (x, y) is the hand, the head on the floor `reach` px below. */
export const Mop: React.FC<{ x: number; y: number; reach?: number; scale?: number }> = ({ x, y, reach = 260, scale = 1 }) => (
  <g>
    <line x1={x} y1={y - 120 * scale} x2={x} y2={y + reach} stroke="#c9915a" strokeWidth={9 * scale} strokeLinecap="round" />
    <path d={`M${x - 40 * scale} ${y + reach} Q${x} ${y + reach - 26 * scale} ${x + 40 * scale} ${y + reach} L${x + 30 * scale} ${y + reach + 40 * scale} L${x - 30 * scale} ${y + reach + 40 * scale} Z`} fill="#dcd6c6" stroke={INK} strokeWidth={4} />
  </g>
);

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

