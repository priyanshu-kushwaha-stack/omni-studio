// Paper pieces for "The Timeline" (Timeline.tsx): the paper timeline that unrolls along the hall floor from your pod,
// the stamped pages of old writing that stand up out of it (squiggles, never real letters), the dark it runs into, the
// paper cut-outs of you at either end, and the portrait sheet (the very old woman beside a tally of years, yours passing
// hers). World coordinates for the strip and cut-outs; the portrait sheet is drawn in screen pixels.
import { interpolate, spring } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { linear, mix, noise } from "../shared";
import { You } from "./Timeline.Cast";

/** The strip on the floor: from your pod (now) back to three and a half thousand years ago, off into the dark. */
export const STRIP = { start: 640, end: 3400, y: 912, h: 34, years: 3650 };
export const yearX = (years: number) => STRIP.start + ((STRIP.end - STRIP.start) * years) / STRIP.years;
/** Where the hall's light gives out. */
export const DARK_FROM = 2150;

/** One row of made-up glyphs: angular strokes for the old pages, wedges and dots for the older ones. */
function glyphRow(seed: number, x0: number, y: number, w: number, kind: number): string {
  let d = "";
  let x = x0;
  let i = 0;
  while (x < x0 + w - 14) {
    const r = noise(seed * 31 + i * 7);
    const s = noise(seed * 17 + i * 3);
    if (kind === 0) d += `M${x} ${y + 12} L${x + 5} ${y - 10} L${x + 10} ${y + 12} ` + (r > 0.5 ? `M${x + 2} ${y} L${x + 9} ${y - 4} ` : "");
    else if (kind === 1) d += `M${x} ${y - 8} l8 6 l-8 6 ` + (s > 0.5 ? `M${x + 10} ${y - 10} v20 ` : "");
    else d += `M${x + 4} ${y} m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 ` + (r > 0.6 ? `M${x} ${y + 9} h12 ` : "");
    x += 13 + Math.round(s * 6) + (r > 0.82 ? 14 : 0);
    i++;
  }
  return d;
}

/** A page of old writing standing up out of the strip at `x`, rising from `at`. `kind` 0 old letters, 1 wedges, 2 dots.
 *  `stamp` draws the crimson stamp where it meets the strip. */
export const OldPage: React.FC<{ frame: number; at: number; x: number; kind: number; scale?: number; fade?: number }> = ({ frame, at, x, kind, scale = 1, fade = 1 }) => {
  if (frame < at) return null;
  const up = spring({ frame: frame - at, fps: FPS, config: { damping: 12, stiffness: 150, mass: 0.7 } });
  const w = 230, h = 290;
  return (
    <g opacity={fade}>
      <ellipse cx={x} cy={STRIP.y + STRIP.h / 2} rx={34} ry={12} fill={CRIMSON} opacity={0.85} />
      <g transform={`translate(${x} ${STRIP.y + 6}) scale(${scale} ${scale * up}) rotate(${-3 + kind * 2})`}>
        <line x1={0} y1={0} x2={0} y2={-40} stroke="#b9a989" strokeWidth={6} />
        <rect x={-w / 2 + 8} y={-40 - h + 10} width={w} height={h} rx={8} fill="#000" opacity={0.25} />
        <rect x={-w / 2} y={-40 - h} width={w} height={h} rx={8} fill={kind === 0 ? "#efe2c4" : "#e3d4b0"} stroke="#b9a989" strokeWidth={4} />
        {Array.from({ length: 9 }, (_, r) => (
          <path key={r} d={glyphRow(r + kind * 20 + Math.round(x), -w / 2 + 22, -40 - h + 36 + r * 28, w - 40, kind)}
            fill="none" stroke={INK} strokeWidth={kind === 2 ? 2.5 : 3} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
        ))}
        {kind === 0 && <rect x={-w / 2 + 20} y={-40 - h + 22} width={30} height={34} rx={4} fill={CRIMSON} opacity={0.75} />}
      </g>
    </g>
  );
};

/** The strip, unrolled from your pod to `front` (world x), with a roll of paper at its end. */
export const Strip: React.FC<{ front: number }> = ({ front }) => {
  const { start, y, h } = STRIP;
  if (front <= start + 2) return null;
  const ticks: string[] = [];
  for (let x = start + 30; x < front - 20; x += 46) {
    const big = Math.round((x - start) / 46) % 5 === 0;
    ticks.push(`M${x} ${y + 4} v${big ? h - 8 : h * 0.4}`);
  }
  const roll = Math.min(26, 10 + (STRIP.end - front) / 120);
  return (
    <g>
      <defs>
        <linearGradient id="strip-fade" x1={start} y1="0" x2={STRIP.end} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={PAPER} />
          <stop offset="0.55" stopColor="#e6d9bd" />
          <stop offset="1" stopColor="#6b6352" />
        </linearGradient>
      </defs>
      <polygon points={`${start},${y} ${front},${y} ${front - 8},${y + h} ${start - 8},${y + h}`} fill="url(#strip-fade)" stroke="#b9a989" strokeWidth={3} />
      <path d={ticks.join("")} stroke={INK} strokeWidth={3} opacity={0.55} />
      {front < STRIP.end - 4 && (
        <g transform={`translate(${front} ${y + h / 2 - roll * 0.4})`}>
          <circle r={roll} fill={PAPER} stroke="#b9a989" strokeWidth={4} />
          <path d={`M0 0 m-${roll * 0.5} 0 a${roll * 0.5} ${roll * 0.5} 0 1 1 ${roll * 0.5} ${roll * 0.5}`} fill="none" stroke="#b9a989" strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** The dark the hall runs into, past its last pods: drawn over the far end of everything. */
export const Dark: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="hall-dark" x1={DARK_FROM} y1="0" x2={DARK_FROM + 900} y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#06070c" stopOpacity={0} />
        <stop offset="1" stopColor="#06070c" stopOpacity={0.96} />
      </linearGradient>
    </defs>
    <rect x={DARK_FROM} y={-1600} width={900} height={4000} fill="url(#hall-dark)" />
    <rect x={DARK_FROM + 899} y={-1600} width={9000} height={4000} fill="#06070c" opacity={0.96} />
  </g>
);

/** A paper cut-out of you standing on the strip: a cream card behind the figure, rising from flat at `at`. `shape`
 *  draws the far one as a dim shape. Both with an open mouth and no bubble. */
export const PaperYou: React.FC<{ frame: number; at: number; x: number; scale: number; shape?: boolean; facing: 1 | -1; worry?: boolean }> = ({
  frame, at, x, scale, shape, facing, worry,
}) => {
  if (frame < at) return null;
  const up = spring({ frame: frame - at, fps: FPS, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const y = STRIP.y + STRIP.h / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${up}) translate(${-x} ${-y})`}>
      <rect x={x - 70 * scale} y={y - 330 * scale} width={140 * scale} height={330 * scale} rx={40 * scale} fill={shape ? "#3a3f55" : PAPER}
        stroke={shape ? "#555b75" : "#b9a989"} strokeWidth={4} opacity={shape ? 0.75 : 1} />
      <g opacity={shape ? 0.75 : 1}>
        {shape ? (
          <You body={{ x, y: y - 8 * scale, scale, facing, pose: { ...STAND, lean: 8, tilt: 10 } }} frame={frame}
            face={{ brows: "none", lids: 0.3, mouth: "open", eyes: 0.8, look: { x: 0.6, y: 0.2 } }} />
        ) : (
          <You body={{ x, y: y - 8 * scale, scale, facing, pose: { ...STAND, armF: [40, 50] } }} frame={frame}
            face={{ brows: worry ? "worry" : "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 1, y: 0 } }} />
        )}
      </g>
    </g>
  );
};

/** The very old woman's portrait (a pencil-and-paper oval: grey bun, lined face, a small smile). Sheet units. */
const Portrait: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse rx={130} ry={160} fill="#e9dcc0" stroke="#8a7a5a" strokeWidth={8} />
    <ellipse rx={112} ry={142} fill="#d9cdb2" />
    <path d="M-80 150 Q-70 70 0 66 Q70 70 80 150 Z" fill="#5b5a66" stroke={INK} strokeWidth={4} />
    <path d="M-30 74 L0 104 L30 74" fill="#f3e9d7" stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-104} r={34} fill="#d8d6d0" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-18} r={70} fill="#efd9bf" stroke={INK} strokeWidth={4} />
    <path d="M-70 -30 Q-60 -92 0 -90 Q60 -92 70 -30 Q40 -66 0 -64 Q-40 -66 -70 -30Z" fill="#d8d6d0" stroke={INK} strokeWidth={4} />
    <path d="M-36 -22 q10 -8 20 0 M16 -22 q10 -8 20 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <path d="M-20 16 q20 14 40 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <path d="M-48 -4 q6 10 0 20 M48 -4 q-6 10 0 20 M-14 -44 h28 M-10 -52 h20" fill="none" stroke="#9a7f62" strokeWidth={3} strokeLinecap="round" />
  </g>
);

/** The portrait sheet: her, her tally of years (the 122 stamps in at `name`), and yours climbing past it and off the
 *  top of the paper. Screen pixels; centre (x, y). */
export const PortraitSheet: React.FC<{ frame: number; at: number; until: number; climb: [number, number]; name: number; x: number; y: number }> = ({
  frame, at, until, climb, name, x, y,
}) => {
  const w = 980, h = 620;
  const base = h - 70;
  const hers = 330 * linear(frame, at + 6, at + 30);
  const yours = mix(0, 640, interpolate(frame, climb, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const rungs = (bx: number, height: number, color: string) => (
    <g>
      <rect x={bx - 34} y={base - height} width={68} height={height} rx={6} fill={color} stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.floor(height / 22) }, (_, i) => (
        <line key={i} x1={bx - 34} x2={bx + 34} y1={base - 22 * (i + 1)} y2={base - 22 * (i + 1)} stroke={INK} strokeWidth={2.5} opacity={0.45} />
      ))}
    </g>
  );
  const top = Math.max(26, base - yours);
  const s = frame >= name ? spring({ frame: frame - name, fps: FPS, config: { damping: 10, stiffness: 220, mass: 0.6 } }) : 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <Sheet frame={frame} at={at} until={until} x={x} y={y} w={w} h={h} tilt={-1.5}>
        <Portrait x={220} y={300} />
        <line x1={420} y1={base} x2={w - 60} y2={base} stroke={INK} strokeWidth={5} />
        {rungs(520, hers, "#c9c4b8")}
        <line x1={460} x2={w - 70} y1={base - 330} y2={base - 330} stroke={CRIMSON} strokeWidth={4} strokeDasharray="14 10" opacity={hers >= 329 ? 0.9 : 0} />
        {s > 0 && (
          <g transform={`translate(520 ${base - 360}) scale(${s}) rotate(-4)`}>
            <rect x={-62} y={-34} width={124} height={56} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INK}>122</text>
          </g>
        )}
        <clipPath id="tally-clip"><rect x={600} y={20} width={300} height={base - 20} /></clipPath>
        <g clipPath="url(#tally-clip)">
          {rungs(740, Math.max(0, base - top), MUSTARD)}
          {yours > 4 && (
            <g transform={`translate(740 ${top - 34})`}>
              <path d="M-6 -30 Q-10 -48 4 -50 Q-1 -40 8 -38 Q5 -32 6 -28 Z" fill={INK} />
              <circle r={30} fill={MUSTARD} stroke={INK} strokeWidth={4} />
              <circle cx={6} cy={-4} r={4} fill={INK} /><circle cx={18} cy={-4} r={4} fill={INK} />
            </g>
          )}
        </g>
        {yours > base - 30 && <path d="M740 16 l-22 26 h44 z" fill={MUSTARD} stroke={INK} strokeWidth={4} opacity={0.9} transform="translate(0 -40)" />}
      </Sheet>
    </svg>
  );
};
