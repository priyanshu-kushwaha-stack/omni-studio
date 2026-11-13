// The Rule's paper inserts, all in screen pixels (drawn in an Overlay): the inside town in a paper circle with its four
// seasons, the fact sheet (the economist's guess, then the 8,760 strip folding into one night against the wall clock),
// and the title card.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Sheet, WallClock } from "../parts";
import { TownBack } from "../sets/InsideTown";
import { REF } from "../sets/common";
import { HERO, mix, noise, PASTELS, ramp } from "../shared";

/** The four seasons the inset cuts through: a tint over the town and what falls. */
const SEASONS = [
  { tint: "#bfe6a8", op: 0.22, fall: "#f6c6d8" },
  { tint: "#ffd27a", op: 0.2, fall: null },
  { tint: "#e08a3c", op: 0.28, fall: "#d9692a" },
  { tint: "#e8f0ff", op: 0.45, fall: "#ffffff" },
] as const;

/**
 * The inside town in a paper circle over the picture: the sky counter blurring where the sun should be, other sleepers
 * walking, and the four seasons in four cuts (`season` 0..3, or -1 for none). Opens from `at`.
 */
export const TownInset: React.FC<{ frame: number; at: number; until: number; season: number; cx?: number; cy?: number; r?: number }> = ({
  frame, at: from, until, season, cx = 960, cy = 470, r = 340,
}) => {
  if (frame < from || frame >= until) return null;
  const open = ramp(frame, from, from + 12) * (1 - ramp(frame, until - 8, until));
  const rr = r * open;
  const s = 0.66;
  const S = season >= 0 ? SEASONS[season] : null;
  return (
    <g>
      <defs><clipPath id="rule-inset"><circle cx={cx} cy={cy} r={rr} /></clipPath></defs>
      <circle cx={cx + 10} cy={cy + 16} r={rr} fill="#000" opacity={0.35} />
      <g clipPath="url(#rule-inset)">
        <g transform={`translate(${cx - 960 * s} ${cy - 560 * s}) scale(${s})`}>
          <TownBack cam={REF} frame={frame} lit={season === 3} />
          {[0, 1, 2, 3, 4].map((i) => {
            const x = ((frame * (i % 2 ? 2.2 : -1.8) + i * 420) % 2200 + 2200) % 2200 - 150;
            return <Figure key={i} x={x} y={905} scale={0.9} facing={i % 2 ? 1 : -1} pose={walkPose(frame * 0.25 + i)} head={i === 2 ? HERO.head : PASTELS[i]}
              scarf={i === 2 ? HERO.scarf : undefined} tuft={i === 2} mouth="smile" look={{ x: 0.6, y: 0 }} time={frame / 30} />;
          })}
          {S && <rect x={-200} y={-200} width={2400} height={1500} fill={S.tint} opacity={S.op} />}
          {S?.fall && Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={noise(i) * 1920} cy={((noise(i + 50) * 1100 + frame * (3 + noise(i + 9) * 3)) % 1100) - 20} r={season === 3 ? 9 : 7} fill={S.fall} opacity={0.9} />
          ))}
        </g>
      </g>
      <circle cx={cx} cy={cy} r={rr} fill="none" stroke={PAPER} strokeWidth={16} />
      <circle cx={cx} cy={cy} r={rr + 8} fill="none" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A small drawing of an uploaded mind: a box with a brain squiggle and speed lines streaming off it. */
const FastMind: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2, 3].map((k) => {
      const off = ((frame * 14 + k * 40) % 160);
      return <line key={k} x1={-150 - off} y1={-50 + k * 32} x2={-110 - off} y2={-50 + k * 32} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={0.7} />;
    })}
    <rect x={-100} y={-90} width={200} height={180} rx={20} fill="#cfd8e6" stroke={INK} strokeWidth={6} />
    <path d="M-60 10 Q-70 -50 -20 -50 Q0 -80 30 -55 Q75 -55 65 0 Q75 45 25 45 Q0 65 -25 45 Q-70 50 -60 10Z" fill="#f2a7b8" stroke={INK} strokeWidth={5} />
    <path d="M-30 -20 Q0 -5 -10 20 M15 -35 Q35 -10 20 20" fill="none" stroke={INK} strokeWidth={4} />
  </g>
);

/** The fact sheet over the hatch: the economist and his guess (from `at`), then the 8,760 strip (from `strip`) that
 *  folds on itself (from `fold`) until it is one night wide, laid against the wall clock. */
export const FactSheet: React.FC<{ frame: number; at: number; until: number; guess: number; strip: number; fold: number }> = ({
  frame, at: from, until, guess, strip, fold,
}) => {
  const f = ramp(frame, fold, fold + 45);
  const w = mix(1000, 110, f);
  const panels = Math.max(1, Math.round(mix(1, 16, f)));
  const right = 960;
  const showStrip = frame >= strip;
  const stamp = interpolate(frame, [strip, strip + 8], [1.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={540} w={1360} h={720} tilt={-1.5}>
      {!showStrip && (
        <g>
          <Figure x={330} y={600} scale={1.6} facing={1} pose={{ ...STAND, armF: [80, 50] }} head="#9fc0e0" coat="#5a6070" tie="#3a5a8a" mouth="smile"
            look={{ x: 0.8, y: -0.1 }} brows="raised" />
          <FastMind x={820} y={330} frame={frame} />
          {frame >= guess && (
            <text x={820} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={CRIMSON}
              transform={`translate(820 520) scale(${ramp(frame, guess, guess + 8)}) translate(-820 -520)`}>×1,000</text>
          )}
        </g>
      )}
      {showStrip && (
        <g>
          <WallClock x={1130} y={360} r={110} minutes={(frame - fold) * 0.4} hours={11} />
          {Array.from({ length: panels }, (_, i) => {
            const pw = w / panels;
            const x = right - w + i * pw;
            return <rect key={i} x={x} y={300} width={pw} height={120} fill={i % 2 ? "#e3c47a" : MUSTARD} stroke={INK} strokeWidth={4} />;
          })}
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={right - w + (w * i) / 24} y1={300} x2={right - w + (w * i) / 24} y2={322} stroke={INK} strokeWidth={3} opacity={1 - f} />
          ))}
          <text x={right - w / 2} y={392} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86 * stamp} fill={INK} opacity={1 - f}>8,760</text>
          {f > 0.95 && <text x={right - w / 2} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70} fill={CRIMSON}
            opacity={ramp(frame, fold + 42, fold + 52)}>×1,000</text>}
        </g>
      )}
    </Sheet>
  );
};

/** The title card: a cut-paper ink card, the title in mustard. */
export const TitleCard: React.FC<{ frame: number; at: number }> = ({ frame, at: from }) => {
  if (frame < from) return null;
  const s = interpolate(frame, [from, from + 10, from + 90], [0.92, 1, 1.04], { extrapolateRight: "clamp" });
  const o = ramp(frame, from, from + 6);
  return (
    <g opacity={o}>
      <rect width={1920} height={1080} fill="#10121b" />
      <g transform={`translate(960 540) scale(${s}) rotate(-1.5)`}>
        <rect x={-760} y={-250} width={1540} height={520} rx={26} fill="#000" opacity={0.4} transform="translate(18 24)" />
        <rect x={-760} y={-250} width={1520} height={500} rx={26} fill={INK} stroke={PAPER} strokeWidth={10} />
        <rect x={-700} y={-190} width={1400} height={380} rx={16} fill="none" stroke={MUSTARD} strokeWidth={4} opacity={0.5} />
        <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={118} fill={MUSTARD}>What If You Lived</text>
        <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={118} fill={MUSTARD}>a Year Every Night?</text>
      </g>
    </g>
  );
};
