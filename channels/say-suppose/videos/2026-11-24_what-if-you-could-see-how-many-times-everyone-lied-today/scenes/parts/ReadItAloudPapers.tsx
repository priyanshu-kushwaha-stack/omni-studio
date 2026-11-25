// The morning after (ReadItAloud.tsx): newspapers spinning up over the studio with their paper-tag headlines (no
// numbers), then your face on a front page, mug in hand, held up by someone reading it. Screen pixels. No AI images.
import { AbsoluteFill, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { mix, ramp } from "../shared";
import { FLATMATE, MugProp } from "./RivalParts";

/** Grey ink bars standing for newsprint columns. */
const Columns: React.FC<{ x: number; y: number; w: number; h: number; cols?: number }> = ({ x, y, w, h, cols = 3 }) => (
  <g>
    {Array.from({ length: cols }, (_, c) => Array.from({ length: Math.floor(h / 22) }, (_, i) => (
      <rect key={`${c}-${i}`} x={x + (c * w) / cols + 8} y={y + i * 22} width={w / cols - 16 - ((i * 7 + c * 3) % 5) * 6} height={9} rx={4} fill={INK} opacity={0.35} />
    )))}
  </g>
);

/** One newspaper that spins in at `at`: a masthead of ink bars, the headline as a stamped paper tag, columns. */
const SpinPaper: React.FC<{ frame: number; at: number; x: number; y: number; tilt: number; headline: string }> = ({ frame, at, x, y, tilt, headline }) => {
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 13, stiffness: 120, mass: 0.8 } });
  const w = 640, h = 420;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt + (1 - s) * 540}) scale(${(0.2 + 0.8 * s) * 0.78})`}>
      <rect x={-w / 2 + 14} y={-h / 2 + 18} width={w} height={h} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#efe8d8" stroke={INK} strokeWidth={5} />
      <rect x={-w / 2 + 30} y={-h / 2 + 24} width={w - 60} height={30} rx={6} fill={INK} opacity={0.8} />
      <line x1={-w / 2 + 20} y1={-h / 2 + 70} x2={w / 2 - 20} y2={-h / 2 + 70} stroke={INK} strokeWidth={4} />
      <g transform={`translate(0 ${-h / 2 + 140}) rotate(-2)`}>
        <rect x={-w / 2 + 34} y={-48} width={w - 68} height={96} rx={10} fill={PAPER} stroke={INK} strokeWidth={5} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={headline.length > 12 ? 58 : 66} fill={INK} letterSpacing={2}>{headline}</text>
      </g>
      <Columns x={-w / 2 + 24} y={-h / 2 + 210} w={w - 48} h={190} />
    </g>
  );
};

const HEADLINES = ["LINE TWO: FALSE", "LINE FOUR: FALSE", "THE PENNY", "THE MONEY"];
const SPOTS = [
  { x: 600, y: 420, tilt: -7 },
  { x: 1320, y: 400, tilt: 6 },
  { x: 640, y: 720, tilt: 4 },
  { x: 1290, y: 700, tilt: -5 },
];

/** The four headlines spinning up, one at each of `ats`, over whatever is behind (the studio). */
export const Headlines: React.FC<{ frame: number; ats: number[] }> = ({ frame, ats }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      <rect width={1920} height={1080} fill="#0d1120" opacity={0.45 * ramp(frame, ats[0] - 6, ats[0] + 6)} />
      {HEADLINES.map((h, i) => <SpinPaper key={h} frame={frame} at={ats[i]} x={SPOTS[i].x} y={SPOTS[i].y} tilt={SPOTS[i].tilt} headline={h} />)}
    </svg>
  </AbsoluteFill>
);

/** Your face on a front page, mug in hand, held up in two pale-blue hands at the edges of the frame: someone else is
 *  looking at your head. `t` 0..1 runs a slow push. */
export const FrontPage: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const up = spring({ frame: frame - from, fps: FPS, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const z = mix(1, 1.07, ramp(frame, from, to));
  const w = 980, h = 820;
  return (
    <AbsoluteFill style={{ background: "#e9dcc4" }}>
      <svg width={1920} height={1080}>
        {/* a morning kitchen wall, soft behind the paper */}
        <rect width={1920} height={1080} fill="#d6e8d8" />
        <rect x={120} y={140} width={360} height={300} fill="#ffe2b0" stroke="#e8e2d2" strokeWidth={14} />
        <g transform={`translate(960 ${mix(1500, 560, up)}) scale(${z}) rotate(${mix(6, -1.5, up)})`}>
          <rect x={-w / 2 + 16} y={-h / 2 + 20} width={w} height={h} fill="#000" opacity={0.3} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#efe8d8" stroke={INK} strokeWidth={6} />
          <rect x={-w / 2 + 50} y={-h / 2 + 34} width={w - 100} height={52} rx={8} fill={INK} opacity={0.85} />
          <line x1={-w / 2 + 30} y1={-h / 2 + 110} x2={w / 2 - 30} y2={-h / 2 + 110} stroke={INK} strokeWidth={5} />
          <rect x={-w / 2 + 50} y={-h / 2 + 135} width={w - 100} height={30} rx={8} fill={INK} opacity={0.6} />
          {/* the photo: you with your mug, eyes wide */}
          <clipPath id="front-photo"><rect x={-w / 2 + 50} y={-h / 2 + 190} width={560} height={500} /></clipPath>
          <rect x={-w / 2 + 50} y={-h / 2 + 190} width={560} height={500} fill="#9fb7c9" stroke={INK} strokeWidth={5} />
          <g clipPath="url(#front-photo)">
            <Figure x={-w / 2 + 330} y={-h / 2 + 1080} scale={2.6} pose={{ ...STAND, armF: [40, 118], tilt: 4 }} head={MUSTARD} scarf={TEAL} tuft
              brows="raised" eyes={1.3} mouth="o" look={{ x: 0.7, y: -0.2 }} held={<MugProp tilt={-14} />} time={frame} />
          </g>
          <g transform={`translate(${-w / 2 + 640} ${-h / 2 + 200})`}>
            {Array.from({ length: 21 }, (_, i) => <rect key={i} x={0} y={i * 23} width={280 - ((i * 7) % 5) * 18} height={10} rx={5} fill={INK} opacity={0.35} />)}
          </g>
          <Columns x={-w / 2 + 40} y={h / 2 - 110} w={w - 80} h={90} cols={4} />
        </g>
        {/* the reader's hands at the paper's edges */}
        <g transform={`translate(0 ${mix(940, 0, up)})`}>
          <circle cx={960 - w / 2 * z + 6} cy={640} r={54} fill={FLATMATE.head} stroke={INK} strokeWidth={6} />
          <circle cx={960 + w / 2 * z - 6} cy={640} r={54} fill={FLATMATE.head} stroke={INK} strokeWidth={6} />
          <rect x={960 - w / 2 * z - 120} y={660} width={130} height={500} rx={50} fill={FLATMATE.coat} stroke={INK} strokeWidth={6} />
          <rect x={960 + w / 2 * z - 10} y={660} width={130} height={500} rx={50} fill={FLATMATE.coat} stroke={INK} strokeWidth={6} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
