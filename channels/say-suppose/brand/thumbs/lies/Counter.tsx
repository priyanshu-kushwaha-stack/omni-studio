// The film's rule device for the thumbnails: the lie counter that floats over a head. A dark rounded plate with
// glowing digits and a small "+1" spark. Drawn in screen pixels (the thumbnail's OnScreen group). No AI images.
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";

export interface CounterProps {
  /** Centre of the plate, screen pixels. */
  x: number;
  y: number;
  /** Digits to show, e.g. "47". */
  value: string;
  /** Digit height in pixels. */
  size: number;
  /** Glow colour of the digits. */
  glow: string;
  /** Show the "+1" spark at the plate's top right. */
  spark?: boolean;
  /** Unique id for the SVG filter. */
  id: string;
}

/** A plate with neon digits and a soft halo of light, so the counter reads as the light source of a dark frame. */
export const Counter: React.FC<CounterProps> = ({ x, y, value, size, glow, spark = false, id }) => {
  const w = value.length * size * 0.66 + size * 0.7;
  const h = size * 1.32;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={size * 0.07} result="b1" />
          <feGaussianBlur stdDeviation={size * 0.2} result="b2" in="SourceGraphic" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={glow} stopOpacity={0.55} />
          <stop offset="0.55" stopColor={glow} stopOpacity={0.16} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* the light it throws on the set */}
      <ellipse cx={0} cy={size * 0.25} rx={w * 1.25} ry={h * 2.1} fill={`url(#${id}-halo)`} />
      {/* the plate */}
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={h * 0.24} fill="#000" opacity={0.45} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.24} fill={INK} stroke={glow} strokeWidth={size * 0.06} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size}
        fill={glow} filter={`url(#${id}-glow)`}>{value}</text>
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size}
        fill={PAPER} stroke={glow} strokeWidth={size * 0.025} style={{ fontVariantNumeric: "tabular-nums" }}>{value}</text>
      {/* the tail pointing down at the head */}
      <path d={`M${-size * 0.16} ${h / 2 - 2} L0 ${h / 2 + size * 0.22} L${size * 0.16} ${h / 2 - 2}Z`} fill={INK}
        stroke={glow} strokeWidth={size * 0.05} strokeLinejoin="round" />
      {spark && (
        <g transform={`translate(${w / 2 - size * 0.05} ${-h / 2 - size * 0.05}) rotate(10)`}>
          <circle r={size * 0.3} fill={glow} opacity={0.9} />
          <text x={0} y={size * 0.11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.3}
            fill={INK}>+1</text>
        </g>
      )}
    </g>
  );
};
