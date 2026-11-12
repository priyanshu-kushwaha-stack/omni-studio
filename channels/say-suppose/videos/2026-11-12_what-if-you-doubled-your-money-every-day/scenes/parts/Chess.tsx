// The king's chessboard on Lotte's counter, top down, after closing (lamp): one grain on the first square, doubling
// square by square; then the pull-back until the board is a speck under a dune of wheat (story #8's jaw drop).
import { INK } from "@whatif/kit/theme";
import { ease, mix, Push, ramp, type ShotTime } from "./util";

const SQ = 92;
const X0 = 960 - 4 * SQ;
const Y0 = 540 - 4 * SQ;

/** Grains on square i as a little pile: a few dots, then a growing mound. */
const Pile: React.FC<{ i: number; amount: number }> = ({ i, amount }) => {
  const cx = X0 + (i % 8) * SQ + SQ / 2;
  const cy = Y0 + Math.floor(i / 8) * SQ + SQ / 2;
  const n = 2 ** i;
  if (n <= 16) {
    return (
      <g>
        {Array.from({ length: Math.round(n * amount) }, (_, k) => (
          <ellipse key={k} cx={cx + Math.cos(k * 2.4) * (6 + k * 1.6)} cy={cy + Math.sin(k * 2.4) * (6 + k * 1.6)} rx={6} ry={3.5}
            transform={`rotate(${k * 37} ${cx} ${cy})`} fill="#e3b45c" stroke={INK} strokeWidth={1.5} />
        ))}
      </g>
    );
  }
  const r = Math.min(SQ * 0.9, 10 + Math.log2(n) * 4.5) * amount;
  return <ellipse cx={cx} cy={cy + 4} rx={r} ry={r * 0.8} fill="#e3b45c" stroke={INK} strokeWidth={3} />;
};

export const Chess: React.FC<{ t: ShotTime; mode: "board" | "dune"; squares?: [number, number] }> = ({ t, mode, squares = [0, 12] }) => {
  const shown = mode === "board" ? Math.floor(mix(squares[0], squares[1], ease(t.p))) : 64;
  const pull = mode === "dune" ? ease(t.p) : 0;
  const zoom = mix(1, 0.12, pull);
  const dune = mix(0, 1, ramp(t.p, 0.15, 1));
  return (
    <Push t={t} from={1} to={mode === "board" ? 1.08 : 1}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="chess-lamp" cx="0.5" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#8a6a48" />
            <stop offset="1" stopColor="#2a1c14" />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#chess-lamp)" />
        <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
          {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-4000 + i * 300} y={-3000} width={300} height={9000} fill={i % 2 ? "#6b4a32" : "#714f36"} />)}
          {Array.from({ length: 64 }, (_, i) => (
            <rect key={i} x={X0 + (i % 8) * SQ} y={Y0 + Math.floor(i / 8) * SQ} width={SQ} height={SQ}
              fill={(i + Math.floor(i / 8)) % 2 ? "#3a2a20" : "#e8dcc0"} />
          ))}
          <rect x={X0} y={Y0} width={8 * SQ} height={8 * SQ} fill="none" stroke={INK} strokeWidth={12} />
          {Array.from({ length: Math.min(64, shown + 1) }, (_, i) => <Pile key={i} i={i} amount={i === shown ? ramp((t.p * 64) % 1, 0, 1) : 1} />)}
        </g>
        {mode === "dune" && (
          <path d={`M0 1080 L0 ${mix(1080, 560, dune)} C 500 ${mix(1080, 600, dune)}, 1300 ${mix(1080, 620, dune)}, 1920 ${mix(1080, 540, dune)} L1920 1080Z`}
            fill="#e3b45c" stroke={INK} strokeWidth={6} />
        )}
      </svg>
    </Push>
  );
};
