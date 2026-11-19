// The Weapon, line 51 (outside review of v6, sheet 20: the national rule first, on a national field, not your class):
// "The national exam grades on a curve.": exam desks seen from above, the camera pulling back from a few heads until
// the field runs off every edge of the frame; "only the top 4 per cent": the top band lights teal in a sweep while
// the rest go grey; "get the top grade": one large card, TOP 4% = TOP GRADE, upper middle inside the safe area (the
// caption's THE CURVE card sits lower right). Line 52 then collapses it to your class (HundredSheet).
import { AbsoluteFill, interpolate, spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift } from "@whatif/kit/stage/shots";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { camAt, noise, PASTELS } from "../shared";
import { FlatShot } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

const COLS = 64, ROWS = 34, GX = 46, GY = 40;
const X0 = 960 - ((COLS - 1) * GX) / 2, Y0 = -40;
/** 4 per cent of the field: the first 87 seats, the top row and a bit of the next. */
const TOP = Math.round(COLS * ROWS * 0.04);

const Field: React.FC<{ frame: number; k: SeatsTimes }> = ({ frame, k }) => (
  <g>
    <rect x={-2400} y={-1400} width={6800} height={4200} fill="#2c3550" />
    {Array.from({ length: ROWS }, (_, r) => (
      <rect key={r} x={X0 - 30} y={Y0 + r * GY + 6} width={(COLS - 1) * GX + 60} height={12} rx={4} fill="#c9b48a" opacity={0.55} />
    ))}
    {Array.from({ length: COLS * ROWS }, (_, i) => {
      const r = Math.floor(i / COLS), c = i % COLS;
      const x = X0 + c * GX + (noise(i) - 0.5) * 6, y = Y0 + r * GY;
      const top = i < TOP;
      // the sweep: the top band lights left to right from `pct`; everyone else greys
      const lit = top ? interpolate(frame, [k.pct + c * 0.4, k.pct + c * 0.4 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
      const grey = top ? 0 : interpolate(frame, [k.pct + 4, k.pct + 16], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const base = PASTELS[(r * 7 + c * 3) % PASTELS.length];
      return (
        <g key={i}>
          {lit > 0 && <circle cx={x} cy={y} r={17 * lit} fill={TEAL} opacity={0.35} />}
          <circle cx={x} cy={y} r={11 + 3 * lit} fill={lit > 0.5 ? TEAL : base} opacity={1 - grey * 0.7} stroke={INK} strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

/** TOP 4% = TOP GRADE, one big line, upper middle (screen space: under the title bar's 10%). */
const TopCard: React.FC<{ frame: number; at: number; until: number }> = ({ frame, at, until }) => {
  if (frame < at || frame >= until) return null;
  const s = spring({ frame: frame - at, fps: 30, config: { damping: 10, stiffness: 220, mass: 0.6 } });
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(960 200) scale(${Math.min(1.08, 0.6 + 0.4 * s)}) rotate(-1.5)`} opacity={Math.min(1, s * 1.4)}>
        <rect x={-600} y={-80} width={1200} height={160} rx={18} fill={PAPER} stroke={INK} strokeWidth={8} />
        <rect x={-600} y={-80} width={26} height={160} rx={10} fill={TEAL} />
        <text x={14} y={33} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={92} fill={INK}>
          <tspan fill={TEAL}>TOP 4%</tspan> = TOP GRADE
        </text>
      </g>
    </svg>
  );
};

export const NationShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.curve, { x: 1000, y: 620, zoom: 2.6 }], [k.pct, { x: 960, y: 330, zoom: 0.62 }], [k.hundred, { x: 960, y: 320, zoom: 0.6 }]]), frame, "nation", 3);
  return (
    <AbsoluteFill>
      <FlatShot cam={cam} mood={mood} back={<Field frame={frame} k={k} />} actors={null} />
      <TopCard frame={frame} at={k.top4} until={k.hundred} />
    </AbsoluteFill>
  );
};
