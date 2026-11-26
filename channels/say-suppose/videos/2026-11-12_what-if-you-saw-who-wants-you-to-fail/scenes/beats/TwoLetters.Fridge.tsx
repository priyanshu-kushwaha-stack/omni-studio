// The fridge door in "Two Letters" (TwoLetters.tsx), on the outside review of v4.1: her letter must look six years old
// next to yours, and the taping must be seen. World coordinates, for a <Stage>'s actors. Also Min-jun's shoulder for
// the close-ups on you at the door (screen space, like parts.tsx YourShoulder).
import { spring } from "remotion";
import { FPS, INK } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { LETTER_S } from "../sets/Home";
import { MINJUN } from "../shared";

/** A strip of tape like the set's (sets/Home.tsx), popping on at `at` as a hand presses it down. */
export const TapeStrip: React.FC<{ frame: number; at: number; x: number; y: number; tilt?: number; w?: number }> = ({ frame, at, x, y, tilt = 0, w = 44 }) => {
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 12, stiffness: 260, mass: 0.5 } });
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${0.4 + 0.6 * s} 1)`}>
      <rect x={-w / 2} y={-8} width={w} height={16} fill="#f3eccf" opacity={0.85} stroke="#cfc3a2" strokeWidth={2} />
    </g>
  );
};

/** Your letter on the fridge door at (x, y) (bottom centre), its two strips of tape pressed on at `strips`. */
export const YoursTaped: React.FC<{ frame: number; x: number; y: number; strips: [number, number] }> = ({ frame, x, y, strips }) => (
  <g>
    <Letter x={x} y={y} scale={LETTER_S} tilt={0} />
    <TapeStrip frame={frame} at={strips[0]} x={x + 2} y={y - 94} tilt={-6} />
    <TapeStrip frame={frame} at={strips[1]} x={x + 2} y={y - 4} tilt={5} />
  </g>
);

/**
 * Six years over her letter, drawn on top of the set's yellowed one at the same place (bottom centre x, y, tilt): a
 * deeper yellow, browned edges, a fold across the middle and one down it, foxing at the corners, a dog-eared corner,
 * the seal faded to brown; then its two strips of tape again, over the tint.
 */
export const AgedLetter: React.FC<{ x: number; y: number; tilt: number }> = ({ x, y, tilt }) => (
  <g>
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${LETTER_S})`}>
      <rect x={-58} y={-150} width={120} height={160} rx={5} fill="#c99a4a" opacity={0.3} />
      <rect x={-53} y={-145} width={110} height={150} rx={4} fill="none" stroke="#a87b3a" strokeWidth={10} opacity={0.3} />
      <line x1={-58} y1={-70} x2={62} y2={-70} stroke="#8f6b35" strokeWidth={3} opacity={0.65} />
      <line x1={-58} y1={-66} x2={62} y2={-66} stroke="#fbf1d6" strokeWidth={2.5} opacity={0.6} />
      <line x1={2} y1={-150} x2={2} y2={10} stroke="#8f6b35" strokeWidth={2.5} opacity={0.35} />
      {[[44, -132, 9], [-44, -8, 7], [-38, -136, 5], [50, -4, 6]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#a8783a" opacity={0.32} />)}
      <circle cx={28} cy={-22} r={22} fill="#c49a5a" opacity={0.7} />
      <circle cx={28} cy={-22} r={20} fill="none" stroke="#8a6a3e" strokeWidth={4} opacity={0.7} />
      <path d="M62 -150 L62 -126 L38 -150Z" fill="#dfe9e4" />
      <path d="M62 -126 L38 -150 L39 -127Z" fill="#d6bd86" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <rect x={-58} y={-150} width={120} height={160} rx={5} fill="none" stroke={INK} strokeWidth={4} />
    </g>
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <rect x={x + 2 - 22} y={y - 94 - 8} width={44} height={16} fill="#efe2b8" opacity={0.85} stroke="#c9b98f" strokeWidth={2} transform={`rotate(-6 ${x + 2} ${y - 94})`} />
      <rect x={x + 2 - 22} y={y - 4 - 8} width={44} height={16} fill="#efe2b8" opacity={0.85} stroke="#c9b98f" strokeWidth={2} transform={`rotate(5 ${x + 2} ${y - 4})`} />
    </g>
  </g>
);

/** The edge of Min-jun's head and navy hood at the left edge, soft, for a close-up on you over his shoulder at the door.
 *  Screen space: put it OUTSIDE <Stage>. */
export const HisShoulder: React.FC<{ blur?: number }> = ({ blur = 8 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
    <g transform="translate(-70 1080)">
      <rect x={-260} y={-260} width={480} height={340} rx={150} fill={MINJUN.coat} stroke={INK} strokeWidth={8} />
      <circle cx={0} cy={-430} r={175} fill={MINJUN.head} stroke={INK} strokeWidth={10} />
    </g>
  </svg>
);
