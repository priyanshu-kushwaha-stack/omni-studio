// The film's rule device: the lie counter floating over a head (the thumbnail's Counter, brand/thumbs/lies, in motion).
// A dark rounded plate with glowing digits and a tail pointing at the head. `ticks` are the frames a lie leaves the
// mouth: each one adds 1 to `base`, pops the plate and flashes a "+1" spark. Drawn in the coordinates it is placed in
// (inside a Stage's actors it moves with the camera). No AI images.
import { interpolate } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { GLOW } from "../shared";

export interface CounterProps {
  x: number;
  y: number;
  /** The count before the first tick. */
  base: number;
  /** Frames at which the count goes up by one (a lie). */
  ticks?: number[];
  frame: number;
  /** Digit height. */
  size?: number;
  glow?: string;
  /** Fade in over 8 frames from this frame (the sight switching on). */
  on?: number;
  /** Hide the digits (a railing or a hand in the way): the plate's glow still shows. */
  hidden?: boolean;
  id: string;
}

export function countAt(base: number, ticks: number[] = [], frame: number) {
  return base + ticks.filter((t) => frame >= t).length;
}

export const Counter: React.FC<CounterProps> = ({ x, y, base, ticks = [], frame, size = 90, glow = GLOW, on, hidden, id }) => {
  const value = String(countAt(base, ticks, frame));
  const last = [...ticks].reverse().find((t) => frame >= t);
  const since = last === undefined ? 999 : frame - last;
  const pop = since < 10 ? interpolate(since, [0, 3, 10], [1, 1.22, 1], { extrapolateRight: "clamp" }) : 1;
  const spark = since < 18 ? interpolate(since, [0, 4, 18], [0, 1, 0], { extrapolateRight: "clamp" }) : 0;
  const alpha = on === undefined ? 1 : interpolate(frame, [on, on + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (alpha <= 0) return null;
  const w = Math.max(2, value.length) * size * 0.66 + size * 0.7;
  const h = size * 1.32;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop})`} opacity={alpha}>
      <defs>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={glow} stopOpacity={0.5} />
          <stop offset="0.55" stopColor={glow} stopOpacity={0.14} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={size * 0.25} rx={w * 1.2} ry={h * 1.9} fill={`url(#${id}-halo)`} />
      <rect x={-w / 2 + 6} y={-h / 2 + 9} width={w} height={h} rx={h * 0.24} fill="#000" opacity={0.4} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.24} fill={INK} stroke={glow} strokeWidth={size * 0.06} />
      {!hidden && (
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size}
          fill={PAPER} stroke={glow} strokeWidth={size * 0.03} style={{ fontVariantNumeric: "tabular-nums" }}>{value}</text>
      )}
      <path d={`M${-size * 0.16} ${h / 2 - 2} L0 ${h / 2 + size * 0.22} L${size * 0.16} ${h / 2 - 2}Z`} fill={INK}
        stroke={glow} strokeWidth={size * 0.05} strokeLinejoin="round" />
      {spark > 0 && (
        <g transform={`translate(${w / 2} ${-h / 2}) scale(${0.6 + spark * 0.5})`} opacity={spark}>
          <circle r={size * 0.3} fill={glow} />
          <text x={0} y={size * 0.11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.3} fill={INK}>+1</text>
        </g>
      )}
    </g>
  );
};

/** The corner readout that climbs as the world widens: a label and a number, top right, inside the safe area. HTML over
 *  the picture (screen space). */
export const Readout: React.FC<{ label: string; value: number; frame: number; on: number; off?: number }> = ({ label, value, frame, on, off }) => {
  const a = interpolate(frame, [on, on + 10, (off ?? 1e9) - 10, off ?? 1e9], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 120, top: 130, opacity: a, background: INK, color: PAPER, fontFamily: FONT,
      border: `5px solid ${GLOW}`, borderRadius: 16, padding: "12px 24px", textAlign: "right", boxShadow: "0 8px 0 rgba(0,0,0,.3)" }}>
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 3, color: GLOW }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 64, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value.toLocaleString("en-US")}</div>
    </div>
  );
};
