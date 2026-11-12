// Shared parts for "What If You Saw Who Wants You to Fail?": the rule device (the paper meter), speech bubbles, the paper
// sheet facts are drawn on, and the props that mark the cast. Everything here is drawn in WORLD coordinates and goes
// inside a <Stage> `actors` or `back` slot (an SVG), so the camera moves it. Nothing here plays sound: the meter's snap,
// flutter and click are <MeterSound> placed OUTSIDE <Stage> (kit/sound.ts).
import { Audio, interpolate, Sequence, spring, staticFile } from "remotion";
import { joints, HEAD_R, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { JIYOON } from "./shared";

/** Where a figure's head centre is, in world coordinates. `facing` mirrors x. */
export function headAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

const pop = (frame: number, at: number, stiffness = 210) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness, mass: 0.6 } });

/** Frames the flaps take to run from zero to their number. */
export const FLAP_FRAMES = 18;
/** The meter stays open sixty seconds (the rule), unless a scene cuts away first. */
export const METER_OPEN = 60 * FPS;

const GREY = "#9a9a94";

/** The number the flaps show at this frame: running from 0 to `value` in whole steps over FLAP_FRAMES. */
export function flapValue(frame: number, at: number, value: number) {
  const t = interpolate(frame, [at + 4, at + 4 + FLAP_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.round(value * t);
}

/**
 * The rule device: a cream paper card the size of a bus ticket that unfolds over a head with a paper snap at `at`, a
 * stamped scale from +100 to -100 along its bottom edge with a marker, and split-flap digits that run to `value`
 * (teal when positive, crimson when negative, grey at zero). It folds shut at `until` (default sixty seconds later).
 * (x, headY, r) is the head it hangs over. `value: null` is a card that opens on nothing (the cat): no digits.
 */
export const Meter: React.FC<{
  frame: number; at: number; x: number; headY: number; r: number; value: number | null; until?: number; tilt?: number;
  scale?: number;
}> = ({ frame, at, x, headY, r, value, until, tilt = -3, scale = 1 }) => {
  const end = until ?? at + METER_OPEN;
  if (frame < at || frame >= end + 8) return null;
  const open = pop(frame, at);
  const close = frame >= end ? interpolate(frame, [end, end + 8], [1, 0], { extrapolateRight: "clamp" }) : 1;
  const h = r * 1.05 * scale;
  const w = h * 2.5;
  const top = headY - r - h * 1.5;
  const v = value === null ? null : flapValue(frame, at, value);
  const colour = v === null || v === 0 ? GREY : v < 0 ? CRIMSON : TEAL;
  const text = v === null ? "" : `${v > 0 ? "+" : v < 0 ? "-" : ""}${Math.abs(v)}%`;
  const chars = text.split("");
  const tw = h * 0.46;
  const sway = Math.sin((frame - at) / 9) * 2 * Math.max(0, 1 - (frame - at) / 60);
  const marker = v === null ? 0.5 : 0.5 - v / 200;
  return (
    <g transform={`translate(${x} ${top}) rotate(${tilt + sway}) scale(1 ${Math.max(0.001, open * close)})`}>
      <rect x={-w / 2 + h * 0.06} y={h * 0.08} width={w} height={h} rx={h * 0.14} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={0} width={w} height={h} rx={h * 0.14} fill={PAPER} stroke={INK} strokeWidth={Math.max(3, r * 0.05)} />
      {/* the stamped scale: teal half, crimson half, and the marker */}
      <rect x={-w / 2 + h * 0.12} y={h * 0.8} width={w / 2 - h * 0.12} height={h * 0.08} fill={TEAL} />
      <rect x={0} y={h * 0.8} width={w / 2 - h * 0.12} height={h * 0.08} fill={CRIMSON} />
      <path d={`M${-w / 2 + h * 0.12 + (w - h * 0.24) * marker} ${h * 0.76} l${-h * 0.07} ${-h * 0.1} h${h * 0.14}z`} fill={INK} />
      {chars.map((ch, i) => {
        const cx = (i - (chars.length - 1) / 2) * tw * 1.08;
        return (
          <g key={i} transform={`translate(${cx} ${h * 0.4})`}>
            <rect x={-tw / 2} y={-h * 0.3} width={tw} height={h * 0.6} rx={h * 0.06} fill={colour} stroke={INK} strokeWidth={Math.max(2, r * 0.03)} />
            <line x1={-tw / 2} y1={0} x2={tw / 2} y2={0} stroke={INK} strokeWidth={Math.max(1.5, r * 0.02)} opacity={0.6} />
            <text x={0} y={h * 0.19} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.52} fill={PAPER}>{ch}</text>
          </g>
        );
      })}
    </g>
  );
};

/** The meter's sounds at `at`: the paper snap, the flutter of the flaps, the click when they stop. Place OUTSIDE
 *  <Stage>. `soft` for Ji-yoon's cards. */
export const MeterSound: React.FC<{ at: number; soft?: boolean; volume?: number }> = ({ at, soft, volume = 1 }) => (
  <>
    <Sequence from={at} durationInFrames={20}><Audio src={staticFile(soft ? "sfx/snap-soft.wav" : "sfx/snap.wav")} volume={volume} /></Sequence>
    <Sequence from={at + 4} durationInFrames={FLAP_FRAMES + 4}><Audio src={staticFile("sfx/flutter.wav")} volume={0.7 * volume} /></Sequence>
    <Sequence from={at + 4 + FLAP_FRAMES} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={volume} /></Sequence>
  </>
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

/** The letter you made the cut with: paper, ink lines, a teal seal. (x, y) is its bottom-centre (put it at a hand). */
export const Letter: React.FC<{ x: number; y: number; scale?: number; tilt?: number; yellowed?: boolean }> = ({ x, y, scale = 1, tilt = 8, yellowed }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-58} y={-150} width={120} height={160} rx={5} fill="#000" opacity={0.3} transform="translate(5 7)" />
    <rect x={-58} y={-150} width={120} height={160} rx={5} fill={yellowed ? "#e8d6a6" : PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-42} y1={-124 + i * 20} x2={i === 3 ? 6 : 46} y2={-124 + i * 20} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.55} />)}
    <circle cx={28} cy={-22} r={20} fill="none" stroke={TEAL} strokeWidth={5} />
    <circle cx={28} cy={-22} r={11} fill={TEAL} opacity={0.85} />
  </g>
);

/** A triangle kimbap, or half of one: a rice triangle with a dark seaweed band. (x, y) is its centre. */
export const Kimbap: React.FC<{ x: number; y: number; scale?: number; half?: boolean; tilt?: number }> = ({ x, y, scale = 1, half, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    {half
      ? <path d="M0 -40 L36 30 L0 30Z" fill="#f4efe2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      : <path d="M0 -40 L44 30 L-44 30Z" fill="#f4efe2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
    <rect x={half ? 0 : -18} y={4} width={half ? 18 : 36} height={26} fill="#1f2b22" />
  </g>
);

/** Ji-yoon's hair tied back (behind her head). Draw BEFORE her <Figure>. */
export const Ponytail: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const h = headAt(x, y, scale, pose, facing);
  return (
    <g fill={JIYOON.hair}>
      <circle cx={h.x - facing * h.r * 0.7} cy={h.y - h.r * 0.55} r={h.r * 0.36} />
      <path d={`M${h.x - facing * h.r * 0.9} ${h.y - h.r * 0.5} q${-facing * h.r * 0.5} ${h.r * 0.5} ${-facing * h.r * 0.15} ${h.r * 1.1} q${facing * h.r * 0.25} ${-h.r * 0.5} ${facing * h.r * 0.35} ${-h.r * 1.0}z`} />
    </g>
  );
};

/** Ji-yoon's hair down, off duty: a dark cap of hair over the top and back of her head. Draw AFTER her <Figure>. */
export const HairDown: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const h = headAt(x, y, scale, pose, facing);
  const b = -facing;
  return (
    <path d={`M${h.x + facing * h.r * 0.75} ${h.y - h.r * 0.55} A${h.r} ${h.r} 0 0 ${facing === 1 ? 0 : 1} ${h.x + b * h.r * 0.98} ${h.y + h.r * 0.2}
      L${h.x + b * h.r * 1.05} ${h.y + h.r * 1.1} L${h.x + b * h.r * 0.55} ${h.y + h.r * 1.0} L${h.x + b * h.r * 0.5} ${h.y - h.r * 0.15}
      Q${h.x} ${h.y - h.r * 0.75} ${h.x + facing * h.r * 0.75} ${h.y - h.r * 0.55}Z`} fill={JIYOON.hair} />
  );
};

/** Ji-yoon's orange warehouse vest with a reflective stripe, over her torso. Draw AFTER her <Figure>. */
export const Vest: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const j = joints(pose);
  const s = scale;
  const nx = x + j.neck.x * s * facing, ny = y + j.neck.y * s;
  const hx = x + j.hip.x * s * facing, hy = y + j.hip.y * s;
  const w = 24 * s;
  return (
    <g>
      <path d={`M${nx - w} ${ny + 6 * s} L${nx + w} ${ny + 6 * s} L${hx + w * 0.9} ${hy} L${hx - w * 0.9} ${hy}Z`} fill={JIYOON.vest} stroke={INK} strokeWidth={Math.max(2, 3 * s)} strokeLinejoin="round" />
      <path d={`M${(nx + hx) / 2 - w * 0.95} ${(ny + hy) / 2 + 6 * s} L${(nx + hx) / 2 + w * 0.95} ${(ny + hy) / 2 + 6 * s}`} stroke="#f4efe2" strokeWidth={6 * s} />
    </g>
  );
};

/** Ms. Kang's glasses. Draw AFTER her <Figure>. */
export const Glasses: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing?: 1 | -1 }> = ({ x, y, scale, pose, facing = 1 }) => {
  const h = headAt(x, y, scale, pose, facing);
  const s = h.r / 46;
  return (
    <g fill="none" stroke={INK} strokeWidth={4 * s}>
      <circle cx={h.x + facing * 10 * s} cy={h.y - 4 * s} r={13 * s} />
      <circle cx={h.x + facing * 38 * s} cy={h.y - 4 * s} r={13 * s} />
      <line x1={h.x + facing * 23 * s} y1={h.y - 4 * s} x2={h.x + facing * 25 * s} y2={h.y - 4 * s} />
    </g>
  );
};

/** A chocolate bar in its paper wrapper, or one half of it snapped along the fold (v2: the snack he always shares).
 *  (x, y) is its centre; `half` is "left", "right" or undefined for the whole bar. */
export const Chocolate: React.FC<{ x: number; y: number; scale?: number; half?: "left" | "right"; tilt?: number }> = ({ x, y, scale = 1, half, tilt = 0 }) => {
  const w = half ? 46 : 96;
  const x0 = half === "right" ? 2 : -48;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      <rect x={x0} y={-22} width={w} height={44} rx={5} fill="#5a3422" stroke={INK} strokeWidth={4} />
      {Array.from({ length: half ? 2 : 4 }, (_, i) => <line key={i} x1={x0 + 23 * (i + 1)} y1={-20} x2={x0 + 23 * (i + 1)} y2={20} stroke="#3e2216" strokeWidth={3} />)}
      <line x1={x0 + 2} y1={0} x2={x0 + w - 2} y2={0} stroke="#3e2216" strokeWidth={3} />
      {/* the wrapper, peeled back on the outer end */}
      <path d={half === "right" ? `M${x0 + w - 18} -24 h20 v48 h-20z` : `M${x0 - 2} -24 h20 v48 h-20z`} fill={TEAL} stroke={INK} strokeWidth={4} />
    </g>
  );
};
