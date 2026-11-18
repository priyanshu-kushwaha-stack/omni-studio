// Part B's small shared pieces: the foundation's steel colours (re-exported), a split-flap tile that can be blank, the
// diner with extras (a split-flap counter on the board over the pie case; things seen through the long window across
// the road, clipped to the glass), the apron pocket's hum, coins leaving a pocket, glasses that slide down a nose, a
// finger that taps, and a ghost (a cast member drawn faint). Drawn in code. No AI images.
import { FONT } from "@whatif/kit/fonts";
import { joints, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Deep, REF, type SetDef, type SetProps } from "@whatif/kit/sets/common";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { DINER, diner, type DinerOptions } from "../../sets/Diner";
import type { Person } from "../Cast";
import { CASH_GREEN } from "../Props";
import { ease, ramp } from "../util";
import { Dressed } from "../Wear";

export { GLOW, SCREEN, STEEL, STEEL_DARK, STEEL_LIGHT } from "../Props";

/** A split-flap tile (the film's counter device), centre (x, y); `ch` "" is a blank flap. */
export const Tile_: React.FC<{ ch: string; x: number; y: number; s?: number }> = ({ ch, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-54} y={-72} width={108} height={144} rx={14} fill={INK} stroke={PAPER} strokeWidth={6} />
    <line x1={-54} y1={0} x2={54} y2={0} stroke="#0d0e12" strokeWidth={5} />
    {ch && <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={PAPER}>{ch}</text>}
  </g>
);

// ---- The diner with extras -----------------------------------------------------------------------------------------

/** The split-flap counter on the blank board over the pie case: a steel head and five tiles, the number climbing. */
export const ShiftCounter: React.FC<{ value: number }> = ({ value }) => {
  const b = DINER.board;
  const digits = String(Math.max(0, Math.floor(value))).padStart(5, "0").slice(-5);
  return (
    <g>
      <rect x={b.x + 6} y={b.y + 6} width={b.w - 12} height={b.h - 12} rx={6} fill="#14171c" />
      <g transform={`translate(${b.x + b.w / 2} ${b.y + 70})`}>
        <rect x={-34} y={-26} width={68} height={52} rx={12} fill="#9fb0bd" stroke={PAPER} strokeWidth={4} />
        <rect x={-25} y={-17} width={50} height={34} rx={7} fill="#18252e" />
        <path d="M-15 5 q5 -8 10 0 M5 5 q5 -8 10 0" fill="none" stroke="#8fe9ff" strokeWidth={4} strokeLinecap="round" />
      </g>
      {digits.split("").map((c, i) => <Tile_ key={i} x={b.x + 30 + i * 40} y={b.y + 170} s={0.34} ch={c} />)}
    </g>
  );
};

/** Draws `children` in the outside's layer (depth 0.45, the plant across the road), clipped to the long window's glass,
 *  with the mullions drawn back over it. Coordinates are the diner's REF coordinates for the outside layer. */
const FarClip: React.FC<{ p: SetProps<DinerOptions>; children: React.ReactNode }> = ({ p, children }) => {
  const w = DINER.window;
  const k = DINER.wallDepth - DINER.outsideDepth;
  const ox = -k * (p.cam.x - REF.x);
  const oy = -k * (p.cam.y - REF.y);
  const id = `far-${Math.round(p.cam.x)}-${Math.round(p.cam.y)}`;
  return (
    <Deep cam={p.cam} depth={DINER.outsideDepth} flat>
      <clipPath id={id}><rect x={w.x + ox + 9} y={w.y + oy + 9} width={w.w - 18} height={w.h - 18} /></clipPath>
      <g clipPath={`url(#${id})`}>
        {children}
        {[w.x + w.w / 3, w.x + (2 * w.w) / 3].map((x) => <rect key={x} x={x + ox - 9} y={w.y + oy} width={18} height={w.h} fill="#2b3a44" />)}
      </g>
    </Deep>
  );
};

export interface DinerExtras {
  /** Drawn on the back wall's layer (the board, the clock): e.g. <ShiftCounter>. */
  wall?: (p: SetProps<DinerOptions>) => React.ReactNode;
  /** Drawn across the road, seen only through the long window (the gate is at x 1000-1170, base 410; the road 428-618). */
  far?: (p: SetProps<DinerOptions>) => React.ReactNode;
}

/** The foundation's diner with extras on the wall and across the road (the foundation file is not edited). */
export function dinerWith(extra: DinerExtras): SetDef<DinerOptions> {
  return {
    ...diner,
    Back: (p) => (
      <>
        {diner.Back(p)}
        {extra.wall && <Deep cam={p.cam} depth={DINER.wallDepth} flat>{extra.wall(p)}</Deep>}
        {extra.far && <FarClip p={p}>{extra.far(p)}</FarClip>}
      </>
    ),
  };
}

// ---- Little actions ----------------------------------------------------------------------------------------------

/** Where a standing (or seated) figure's hip is, in world units, for a hum at the apron pocket. */
export const hipOf = (x: number, y: number, scale: number, facing: 1 | -1, pose: Pose = STAND) => {
  const j = joints(pose);
  return { x: x + facing * (j.hip.x + 18) * scale, y: y + (j.hip.y + 24) * scale };
};

/** The apron pocket humming: short arcs either side of the pocket, shaking on `frame`. */
export const Hum: React.FC<{ x: number; y: number; s?: number; frame: number; k?: number }> = ({ x, y, s = 1, frame, k = 1 }) => {
  const j = Math.sin(frame * 2.1) * 3;
  return (
    <g transform={`translate(${x + j * 0.4} ${y}) scale(${s})`} opacity={k} fill="none" stroke={MUSTARD} strokeWidth={5} strokeLinecap="round">
      <path d="M-34 -16 q-10 16 0 32" /><path d="M-48 -24 q-14 24 0 48" />
      <path d="M34 -16 q10 16 0 32" /><path d="M48 -24 q14 24 0 48" />
    </g>
  );
};

/** Coins leaving a pocket at (x, y): they rise, tumble and fade over `len` frames from `at`. */
export const CoinsOut: React.FC<{ x: number; y: number; f: number; at: number; len?: number; n?: number; s?: number; toward?: { x: number; y: number } }> = ({
  x, y, f, at, len = 24, n = 4, s = 1, toward,
}) => {
  if (f < at || f > at + len + n * 3) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = ease(ramp(f, at + i * 3, at + i * 3 + len));
        if (u <= 0 || u >= 1) return null;
        const tx = toward ? x + (toward.x - x) * u : x + (i - n / 2) * 30 * u;
        const ty = toward ? y + (toward.y - y) * u - 120 * u * (1 - u) : y - 140 * u;
        return (
          <g key={i} transform={`translate(${tx} ${ty}) scale(${s}) rotate(${u * 300})`} opacity={1 - u * 0.7}>
            <ellipse rx={18} ry={18 * Math.abs(Math.cos(u * 6 + i))} fill={MUSTARD} stroke={INK} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

/** A banknote flying (green, small), for rent arriving at the till. */
export const NoteFly: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; u: number }> = ({ from, to, u }) => {
  if (u <= 0 || u >= 1) return null;
  const e = ease(u);
  return (
    <g transform={`translate(${from.x + (to.x - from.x) * e} ${from.y + (to.y - from.y) * e - 140 * e * (1 - e)}) rotate(${e * 40 - 20})`}>
      <rect x={-40} y={-20} width={80} height={40} rx={4} fill={CASH_GREEN} stroke={INK} strokeWidth={3} />
      <circle r={9} fill="none" stroke="#3f7d42" strokeWidth={3} />
    </g>
  );
};

/** Glasses drawn over a figure's eyes, sliding down the nose by `slide` (0..1). Figure at (x, y, scale, facing, pose). */
export const SlidingGlasses: React.FC<{ x: number; y: number; scale: number; facing: 1 | -1; pose?: Pose; slide: number }> = ({
  x, y, scale, facing, pose = SEATED, slide,
}) => {
  const j = joints(pose);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <g transform={`translate(${j.head.x} ${j.head.y + slide * 16}) rotate(${pose.tilt + slide * 6})`} fill="#fff" fillOpacity={0.12} stroke={INK} strokeWidth={4}>
        <circle cx={-5} cy={-5} r={15} />
        <circle cx={22} cy={-5} r={15} />
        <path d="M10 -7 Q13.5 -11 7 -7" fill="none" />
        <path d="M-20 -7 L-42 -12" fill="none" />
      </g>
    </g>
  );
};

/** A cast member drawn faint (a memory on a stool): a Dressed figure at reduced opacity. */
export const Ghost: React.FC<{ who: Person; x: number; y: number; scale: number; facing: 1 | -1; pose?: Pose; k: number; time: number }> = ({
  who, x, y, scale, facing, pose = SEATED, k, time,
}) => {
  if (k <= 0) return null;
  const { wear, ...fig } = who;
  return (
    <g opacity={0.55 * k}>
      <Dressed {...fig} wear={wear} x={x} y={y - (1 - k) * 20} scale={scale} facing={facing} pose={pose} time={time} mouth="smile" />
    </g>
  );
};

/** A fingertip (sleeve and hand) pressing at (x, y): `press` 0..1 lowers it onto the point. */
export const Finger: React.FC<{ x: number; y: number; press: number; sleeve?: string; skin?: string; s?: number }> = ({
  x, y, press, sleeve = "#3b4a5a", skin = "#a9c4a0", s = 1,
}) => (
  <g transform={`translate(${x + 30 * (1 - press)} ${y - 40 * (1 - press)}) scale(${s}) rotate(-28)`}>
    <rect x={-40} y={40} width={80} height={300} rx={20} fill={sleeve} stroke={INK} strokeWidth={6} />
    <rect x={-32} y={-10} width={64} height={70} rx={22} fill={skin} stroke={INK} strokeWidth={5} />
    <rect x={-12} y={-70} width={26} height={80} rx={13} fill={skin} stroke={INK} strokeWidth={5} />
  </g>
);
