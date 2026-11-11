// Helpers for "The stage" (StageBeat.tsx): what the big screen shows (your tangled draft, the Milgram diagram, the
// crowd's smile on the glass), the Milgram paper diagram itself, the boss in the front row, Dev at the sound desk, and
// YES tags over the near rows' backs. World coordinates for a <Stage> slot; no sound here.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { Headphones, YesTag } from "../parts";
import { blinking, BOSS, DEV, linear, noise, PASTELS } from "../shared";
import { Deep, REF } from "../sets/common";
import { HALL_ROWS, HALL_STAGE } from "../sets/Hall";

/** Your idea as it was drawn on the whiteboard: a big tangled loop (also the meeting page's sketch, Choice.tsx).
 *  Centred on 0,0, about 600 x 340. */
export const TANGLE =
  "M-260 40 C-200 -160 -40 -150 -60 0 C-80 150 120 160 140 20 C160 -120 -20 -170 40 -60 C100 50 260 -40 230 -120 " +
  "C200 -200 60 -130 120 40 C170 170 -150 180 -170 60 C-190 -60 20 -100 -20 70";
/** The extra strokes that make it a mess under the lights (they draw in as you see it). */
export const TANGLE_MESS = [
  "M-220 -60 C-120 120 60 -150 200 90",
  "M-120 140 C-40 -90 90 160 250 -20",
  "M-30 -150 C-170 -20 160 60 60 150",
];

/** The tangled shape, `mess` 0..1 drawing the extra strokes over [messFrom, messTo]. */
export const Tangle: React.FC<{ x: number; y: number; scale?: number; color?: string; messFrom?: number; messTo?: number; width?: number }> = ({
  x, y, scale = 1, color = INK, messFrom, messTo, width = 9,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d={TANGLE} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    {messFrom !== undefined && messTo !== undefined && TANGLE_MESS.map((d, i) => {
      const step = (messTo - messFrom) / TANGLE_MESS.length;
      return <DrawLine key={i} d={d} from={messFrom + i * step} to={messFrom + (i + 1) * step} color={CRIMSON} width={width * 0.8} />;
    })}
  </g>
);

// ------------------------------------------------------------------------------------------------ the Milgram diagram

/** The diagram's size in its own units. */
export const MILGRAM = { w: 1500, h: 860 } as const;

const LABELS: string[][] = [
  ["Slight", "Shock"], ["Moderate"], ["Strong"], ["Very", "Strong"], ["Intense"], ["Extreme", "Intensity"], ["Danger:", "Severe Shock"], ["XXX"],
];
const DIAL = { x: 750, y: 470, r: 250 };
const SWITCHES = 30;

export interface MilgramTimes {
  /** The dial arc and the panel draw from here. */
  draw: number;
  /** Label i appears at labels[i] (left to right). */
  labels: number[];
  /** The needle's swing, 0 at the left end to 1 at XXX. */
  swingFrom: number;
  swingTo: number;
  /** The calm voice: the grey coat's empty bubble. */
  voice: number;
}

/** The paper diagram of Milgram's study, drawn in MILGRAM units: a dial whose labels appear left to right, a long
 *  panel of switches flipping as the needle swings, and a row of pastel heads, every hand on a switch. */
export const Milgram: React.FC<{ frame: number; t: MilgramTimes; flicker?: number }> = ({ frame, t, flicker = 0 }) => {
  const needle = interpolate(frame, [t.swingFrom, t.swingTo], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const angle = 180 - needle * 180;
  const rad = (a: number) => (a * Math.PI) / 180;
  const arc = `M${DIAL.x - DIAL.r} ${DIAL.y} A${DIAL.r} ${DIAL.r} 0 0 1 ${DIAL.x + DIAL.r} ${DIAL.y}`;
  const red = `M${DIAL.x + DIAL.r * Math.cos(rad(26))} ${DIAL.y - DIAL.r * Math.sin(rad(26))} A${DIAL.r} ${DIAL.r} 0 0 1 ${DIAL.x + DIAL.r} ${DIAL.y}`;
  const on = 1 - flicker;
  const panel = linear(frame, t.draw + 10, t.draw + 30);
  return (
    <g opacity={on}>
      {/* the dial */}
      <DrawLine d={arc} from={t.draw} to={t.draw + 24} color={INK} width={16} />
      {frame >= t.draw + 24 && <path d={red} fill="none" stroke={CRIMSON} strokeWidth={22} strokeLinecap="round" />}
      {Array.from({ length: 15 }, (_, i) => {
        const a = rad(180 - (i * 180) / 14);
        const show = frame >= t.draw + (i / 14) * 24;
        return show ? (
          <line key={i} x1={DIAL.x + (DIAL.r - 26) * Math.cos(a)} y1={DIAL.y - (DIAL.r - 26) * Math.sin(a)}
            x2={DIAL.x + (DIAL.r - 6) * Math.cos(a)} y2={DIAL.y - (DIAL.r - 6) * Math.sin(a)} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        ) : null;
      })}
      {LABELS.map((lines, i) => {
        if (frame < t.labels[i]) return null;
        const a = rad(180 - (i * 180) / 7);
        const lx = DIAL.x + 318 * Math.cos(a), ly = DIAL.y - 318 * Math.sin(a);
        const anchor = lx < DIAL.x - 30 ? "end" : lx > DIAL.x + 30 ? "start" : "middle";
        const pop = linear(frame, t.labels[i], t.labels[i] + 6);
        return (
          <text key={i} x={lx} y={ly - (lines.length - 1) * 15 + 9} textAnchor={anchor} fontFamily={FONT} fontWeight={800} fontSize={27}
            fill={i >= 6 ? CRIMSON : INK} opacity={pop}>
            {lines.map((l, j) => <tspan key={j} x={lx} dy={j === 0 ? 0 : 30}>{l}</tspan>)}
          </text>
        );
      })}
      {frame >= t.draw + 8 && (
        <g transform={`rotate(${-angle + 90} ${DIAL.x} ${DIAL.y})`}>
          <path d={`M${DIAL.x - 9} ${DIAL.y} L${DIAL.x} ${DIAL.y - DIAL.r + 34} L${DIAL.x + 9} ${DIAL.y} Z`} fill={CRIMSON} stroke={INK} strokeWidth={4} />
        </g>
      )}
      <circle cx={DIAL.x} cy={DIAL.y} r={22} fill={INK} />

      {/* the panel of switches */}
      <g opacity={panel} transform={`translate(0 ${(1 - panel) * 20})`}>
        <rect x={120} y={590} width={1260} height={96} rx={10} fill="#5a5f6e" stroke={INK} strokeWidth={6} />
        {Array.from({ length: SWITCHES }, (_, j) => {
          const sx = 150 + j * (1200 / (SWITCHES - 1));
          const flipped = needle >= (j + 1) / SWITCHES;
          return (
            <g key={j}>
              <rect x={sx - 12} y={612} width={24} height={52} rx={5} fill="#2e3140" />
              <rect x={sx - 8} y={flipped ? 640 : 616} width={16} height={20} rx={4} fill={flipped ? (j > 25 ? CRIMSON : "#f2b632") : PAPER} />
            </g>
          );
        })}
      </g>
      {/* the row of heads: backs to us, each hand up on a switch */}
      {[0, 1, 2, 3, 4].map((i) => {
        if (frame < t.draw + 26 + i * 5) return null;
        const hx = 260 + i * 245;
        const sw = Math.round(((hx - 150) / 1200) * (SWITCHES - 1));
        const sx = 150 + sw * (1200 / (SWITCHES - 1));
        return (
          <g key={i}>
            <ellipse cx={hx} cy={826} rx={88} ry={40} fill="#3b3e47" />
            <path d={`M${hx + 40} ${800} Q${sx + 30} ${740} ${sx} ${668}`} fill="none" stroke="#3b3e47" strokeWidth={22} strokeLinecap="round" />
            <circle cx={sx} cy={664} r={16} fill={PASTELS[(i * 3 + 2) % PASTELS.length]} stroke={INK} strokeWidth={3} />
            <circle cx={hx} cy={752} r={56} fill={PASTELS[(i * 3 + 2) % PASTELS.length]} />
          </g>
        );
      })}
      {/* the calm voice: a grey coat at the end of the row, an empty speech bubble */}
      {frame >= t.voice && (
        <g opacity={linear(frame, t.voice, t.voice + 8)}>
          <ellipse cx={1420} cy={826} rx={64} ry={40} fill="#8a8f9c" />
          <circle cx={1420} cy={744} r={48} fill="#c9ccd4" />
          <path d="M1330 640 h-150 a24 24 0 0 0 -24 24 v40 a24 24 0 0 0 24 24 h100 l30 26 l-6 -26 h26 a24 24 0 0 0 24 -24 v-40 a24 24 0 0 0 -24 -24 z"
            fill={PAPER} stroke={INK} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the big screen

export type ScreenMode = "draft" | "milgram";

/** What the big screen shows, drawn on the stage view's screen layer (depth 0.7). In `draft` mode your tangled shape,
 *  with its mess drawing in over [messFrom, messTo]; in `milgram` mode the diagram. `smiles` 0..1 lays the crowd's
 *  smile over the glass; `flicker` 0..1 turns it off with a stutter. */
export const ScreenSlide: React.FC<{
  cam: Camera; frame: number; mode: ScreenMode; milgram: MilgramTimes; messFrom?: number; messTo?: number; smiles?: number; flicker?: number;
}> = ({ cam, frame, mode, milgram, messFrom, messTo, smiles = 0, flicker = 0 }) => {
  const s = HALL_STAGE.screen;
  // A stutter as it goes out: on, off, on, off.
  const stutter = flicker <= 0 ? 0 : flicker >= 1 ? 1 : Math.floor(frame / 3) % 2 === 0 ? flicker : 1;
  const k = 0.55;
  return (
    <Deep cam={cam} depth={0.7}>
      <clipPath id="hall-screen"><rect x={s.x - s.w / 2} y={s.y - s.h / 2} width={s.w} height={s.h} /></clipPath>
      <g clipPath="url(#hall-screen)">
        {stutter > 0 && <rect x={s.x - s.w / 2} y={s.y - s.h / 2} width={s.w} height={s.h} fill="#1a1c28" opacity={stutter} />}
        <g opacity={1 - stutter}>
          {mode === "draft"
            ? <Tangle x={s.x - 30} y={s.y + 10} scale={1.05} messFrom={messFrom} messTo={messTo} width={12} />
            : <g transform={`translate(${s.x - (MILGRAM.w * k) / 2} ${s.y - (MILGRAM.h * k) / 2 + 6}) scale(${k})`}><Milgram frame={frame} t={{ ...milgram, voice: Number.MAX_SAFE_INTEGER }} /></g>}
        </g>
        {smiles > 0 && (
          <g opacity={0.32 * smiles}>
            {Array.from({ length: 36 }, (_, i) => {
              const x = s.x - s.w / 2 + 50 + (i % 12) * 80 + (Math.floor(i / 12) % 2) * 40;
              const y = s.y + 40 + Math.floor(i / 12) * 60;
              return <path key={i} d={`M${x - 22} ${y} Q${x} ${y + 20} ${x + 22} ${y}`} fill="none" stroke="#9fc0e0" strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
      </g>
    </Deep>
  );
};

// ------------------------------------------------------------------------------------------------ people in the rows

/** The boss in the front row (rows view): a lilac head with a crimson tie at HALL_ROWS.boss, the smile once his tag
 *  is up, clapping with the rest. */
export const BossSeat: React.FC<{ frame: number; tagAt: number; clap: number }> = ({ frame, tagAt, clap }) => {
  const { x, y } = HALL_ROWS.boss;
  const r = HALL_ROWS.rows[0].r;
  const smiling = frame >= tagAt;
  const bob = Math.abs(Math.sin(frame * 0.9 + 3)) * r * 0.25 * clap;
  return (
    <g>
      <ellipse cx={x} cy={y + r * 1.5} rx={r * 1.5} ry={r * 0.9} fill={BOSS.coat} />
      <path d={`M${x} ${y + r * 0.95} l${r * 0.18} ${r * 0.25} l${-r * 0.18} ${r * 0.7} l${-r * 0.18} ${-r * 0.7}Z`} fill={BOSS.tie} />
      <circle cx={x} cy={y} r={r} fill={BOSS.head} />
      <ellipse cx={x - r * 0.33} cy={y - r * 0.1} rx={r * 0.15} ry={r * 0.22} fill={INK} />
      <ellipse cx={x + r * 0.33} cy={y - r * 0.1} rx={r * 0.15} ry={r * 0.22} fill={INK} />
      {smiling
        ? <path d={`M${x - r * 0.4} ${y + r * 0.3} Q${x} ${y + r * 0.7} ${x + r * 0.4} ${y + r * 0.3}`} fill="none" stroke={INK} strokeWidth={r * 0.1} strokeLinecap="round" />
        : <line x1={x - r * 0.25} y1={y + r * 0.42} x2={x + r * 0.25} y2={y + r * 0.42} stroke={INK} strokeWidth={r * 0.09} strokeLinecap="round" />}
      {clap > 0 && <g transform={`translate(0 ${r * 1.2 - bob})`}><circle cx={x - r * 0.35} cy={y} r={r * 0.22} fill={BOSS.head} /><circle cx={x + r * 0.35} cy={y} r={r * 0.22} fill={BOSS.head} /></g>}
      <YesTag frame={frame} at={tagAt} x={x} headY={y} r={r} />
    </g>
  );
};

/** Dev at the sound desk at the back of the rows view, on the set's desk layer (depth 0.4): head and shoulders over
 *  the desk, headphones round his neck, arms down. He never claps. `look` turns his eyes. */
export const DevAtDesk: React.FC<{ cam: Camera; frame: number; look?: { x: number; y: number }; face?: "flat" | "frown" }> = ({ cam, frame, look = { x: -0.2, y: 0.3 }, face = "flat" }) => {
  const d = HALL_ROWS.desk;
  const x = d.x + 40, y = d.y + 20, s = d.scale;
  // Drawn on the desk layer's plane (depth 0.4) but without its depth-of-field blur, so his face reads in the push in.
  const k = 1 - 0.4;
  return (
    <g transform={`translate(${(cam.x - REF.x) * k} ${(cam.y - REF.y) * k})`}>
      <Figure x={x} y={y} scale={s} facing={-1} pose={STAND} head={DEV.head} coat={DEV.coat} look={look} mouth={face}
        brows={face === "frown" ? "sad" : "flat"} lids={0.2} blink={blinking(frame, 6)} time={frame} />
      <Headphones x={x} y={y} scale={s} pose={STAND} facing={-1} />
      <rect x={d.x - 160} y={d.y - 50} width={320} height={60} rx={6} fill="#3b3e47" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={d.x - 140 + i * 28} y={d.y - 40} width={8} height={20} fill={i % 3 ? "#9fd8a8" : "#f2b632"} />)}
    </g>
  );
};

/** YES tags over the backs of the two nearest rows of the stage view (HallFront's heads, depth 1.3). */
export const FrontTags: React.FC<{ cam: Camera; frame: number; at: (i: number) => number }> = ({ cam, frame, at }) => (
  <Deep cam={cam} depth={1.3}>
    {[0, 1].map((r) => Array.from({ length: 12 - r }, (_, i) => (
      <YesTag key={`${r}-${i}`} frame={frame} at={at(r * 20 + i)} x={-60 + i * 180 + r * 90} headY={1010 - r * 70} r={58} tilt={-4 + noise(i + r * 9) * 8} />
    )))}
  </Deep>
);
