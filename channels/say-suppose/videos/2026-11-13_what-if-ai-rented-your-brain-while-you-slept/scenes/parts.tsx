// Shared parts for "What If AI Rented Your Brain While You Slept?": the rule device (the band, its teal light, the
// dotted thread and the pale second you at a floating desk, the coins and the jar), the split-flap pay tag, stamped
// tags, speech bubbles and the paper sheet facts are drawn on. Everything here is drawn in WORLD coordinates and goes
// inside a <Stage> `actors` or `back` slot (an SVG), so the camera moves it. Nothing here plays sound: the chime,
// typing patter and coin clink are <DeviceSound> / <ClinkSound>, placed OUTSIDE <Stage> (kit/sound.ts).
//
// The rule device is drawn exactly as the G1 thumbnail draws it (brand/thumbs/brainrent/Rent.tsx), so the film's key
// shot and the thumbnail are one picture (owner, 2026-11-12: "A, the thumbnail").
import { Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { HEAD_R, joints, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Chair } from "@whatif/kit/sets/common";
import { Laptop } from "@whatif/kit/sets/props";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { GHOST, HERO } from "./shared";

/** Where a figure's head centre is, in world coordinates. `facing` mirrors x. */
export function headAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

const pop = (frame: number, at: number, stiffness = 210) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness, mass: 0.6 } });

/** 0..1 as the device comes on at `on` and goes off at `off` (the ghost rises out of the band and folds back). */
export const deviceAt = (frame: number, on: number, off = Infinity) =>
  Math.min(pop(frame, on, 160), 1 - pop(frame, off, 260));

// ---------------------------------------------------------------- the sleeper

/** You (or anyone) asleep on your back, the rig laid back on a pillow at `tilt` degrees, head at (x, y). Only the head
 *  and shoulders show (a blanket goes over the rest: <Blanket>). `band` draws the thin band with its teal light; `lit`
 *  is the light's 0..1. `blink` shut eyes; `mouth` the sleeping smile. Head radius is 46 * scale. */
export const Sleeper: React.FC<{
  x: number; y: number; scale: number; tilt?: number; head?: string; scarf?: string; tuft?: boolean; cap?: string;
  band?: boolean; lit?: number; eyes?: "shut" | "open"; mouth?: "smile" | "flat" | "o"; id: string;
}> = ({ x, y, scale, tilt = -72, head = HERO.head, scarf = HERO.scarf, tuft = true, cap, band = true, lit = 1,
  eyes = "shut", mouth = "smile", id }) => (
  <g>
    <clipPath id={`sleeper-${id}`}><circle cx={x + 60 * (scale / 3.1)} cy={y + 40 * (scale / 3.1)} r={HEAD_R * scale * 1.75} /></clipPath>
    <g clipPath={`url(#sleeper-${id})`}>
      <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
        <Figure x={0} y={264} pose={STAND} head={head} scarf={scarf} tuft={tuft} cap={cap} blink={eyes === "shut"}
          mouth={mouth} look={{ x: 0.6, y: -0.2 }} />
        {band && <path d="M-40 -24 Q2 -34 44 -22" fill="none" stroke="#1b1d24" strokeWidth={9} strokeLinecap="round" />}
        {band && lit > 0.05 && <circle cx={30} cy={-27} r={18} fill={GHOST.light} opacity={0.35 * lit} />}
        {band && <circle cx={30} cy={-27} r={8} fill={lit > 0.05 ? GHOST.light : "#2a3a3a"} stroke="#1b1d24" strokeWidth={3}
          opacity={0.4 + 0.6 * lit} />}
      </g>
    </g>
  </g>
);

/** Where the band's light is on screen, for a <Sleeper> at (x, y, scale, tilt). */
export function bandLight(x: number, y: number, scale: number, tilt = -72) {
  const a = (tilt * Math.PI) / 180;
  return { x: x + (30 * Math.cos(a) + 27 * Math.sin(a)) * scale, y: y + (30 * Math.sin(a) - 27 * Math.cos(a)) * scale };
}

/** The blanket over a sleeper at the thumbnail's size, from the shoulders (x0) to the feet (x1), its top at `top`. */
export const Blanket: React.FC<{ x0: number; x1: number; top: number; base: number; color?: string }> = ({ x0, x1, top, base, color = "#3e5c8f" }) => {
  const w = x1 - x0;
  return (
    <g>
      <path d={`M${x0} ${base - 40} C${x0 + w * 0.02} ${top + 80} ${x0 + w * 0.08} ${top + 10} ${x0 + w * 0.2} ${top}
        C${x0 + w * 0.34} ${top - 12} ${x0 + w * 0.4} ${top + 40} ${x0 + w * 0.52} ${top + 60}
        C${x0 + w * 0.7} ${top + 90} ${x0 + w * 0.86} ${top + 90} ${x1 - 40} ${top + 120}
        C${x1} ${top + 135} ${x1 + 10} ${top + 160} ${x1 + 10} ${top + 190} L${x1 + 10} ${base} L${x0} ${base} Z`}
        fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M${x0 + w * 0.32} ${top + 10} Q${x0 + w * 0.38} ${top + 110} ${x0 + w * 0.35} ${base - 10}`} fill="none" stroke={INK} strokeWidth={5} opacity={0.4} />
      <path d={`M${x0 + w * 0.72} ${top + 92} Q${x0 + w * 0.77} ${top + 150} ${x0 + w * 0.74} ${base - 10}`} fill="none" stroke={INK} strokeWidth={5} opacity={0.4} />
      <path d={`M${x0 + 30} ${base - 100} C${x0 + w * 0.05} ${top + 50} ${x0 + w * 0.12} ${top + 18} ${x0 + w * 0.2} ${top + 18}
        C${x0 + w * 0.27} ${top + 16} ${x0 + w * 0.31} ${top + 32} ${x0 + w * 0.36} ${top + 50}`} fill="none" stroke="#e9dcc4" strokeWidth={24} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- the rule device

/** Bolt upright, both hands on the keys; `k` (0..1) jiggles the hands as it types. */
const typing = (k: number): Pose => ({ ...SEATED, lean: 4, tilt: 4, armF: [64 + k * 6, 44 - k * 4], armB: [56 - k * 5, 48 + k * 4] });

/**
 * The pale second you, the rule device: sitting bolt upright on a paper chair that floats, both hands on a lit laptop
 * on a little floating desk, glowing. (x, y) are the ghost's feet as a seated rig (its hip at y - 112 * scale, its
 * head at y - 264 * scale); the desk sits in front of it. `t` is 0..1 as it rises out of the band (deviceAt), `frame`
 * drives the typing. `worry` raises the brows (the thumbnail's face). The thumbnail's numbers: x 1010, y 880, scale 1.65.
 */
export const Ghost: React.FC<{ x: number; y: number; scale: number; t: number; frame: number; worry?: boolean;
  head?: string; facing?: 1 | -1; desk?: boolean }> = ({ x, y, scale, t, frame, worry = true, head = GHOST.head,
  facing = 1, desk = true }) => {
  if (t <= 0.01) return null;
  const s = scale;
  const hip = y - 112 * s;
  const k = (Math.sin(frame * 1.7) + 1) / 2;
  const rise = (1 - t) * 160 * s;
  const deskX = x + facing * 95 * s / 1.65;
  return (
    <g opacity={Math.min(1, t * 1.3)} transform={`translate(0 ${rise}) translate(${x} ${hip}) scale(${0.4 + 0.6 * t}) translate(${-x} ${-hip})`}>
      <filter id="ghost-aura" x="-50%" y="-50%" width="200%" height="200%">
        <feColorMatrix type="matrix" values="0 0 0 0 0.78  0 0 0 0 0.96  0 0 0 0 0.97  0 0 0 1 0" />
        <feMorphology operator="dilate" radius={10} />
        <feGaussianBlur stdDeviation={18} />
      </filter>
      {desk && (
        <g>
          <circle cx={deskX + facing * 165} cy={hip - 90} r={170 * (s / 1.65)} fill="#cfefff" opacity={0.16} />
          <g transform={`translate(${deskX} ${hip - 4}) scale(${(s / 1.65) * facing} ${s / 1.65})`}>
            <rect x={0} y={0} width={300} height={22} rx={6} fill="#9fd9dc" stroke={INK} strokeWidth={6} />
            <rect x={20} y={22} width={14} height={90} fill="#9fd9dc" stroke={INK} strokeWidth={4} />
            <rect x={266} y={22} width={14} height={90} fill="#9fd9dc" stroke={INK} strokeWidth={4} />
            <Laptop x={180} y={0} scale={1.05} screen="code" facing={-1} />
          </g>
        </g>
      )}
      <g filter="url(#ghost-aura)" opacity={0.55}>
        <Figure x={x} y={y} scale={s} facing={facing} pose={typing(k)} head={head} />
      </g>
      <g transform={`translate(${x} ${hip}) scale(${facing} 1) translate(${-x} ${-hip})`}>
        <Chair x={x} y={hip} scale={1.25 * (s / 1.65)} facing={1} color={GHOST.scarf} />
      </g>
      <g opacity={0.92}>
        <Figure x={x} y={y} scale={s} facing={facing} pose={typing(k)} head={head} scarf={GHOST.scarf} tuft
          eyes={1.3} brows={worry ? "worry" : "none"} mouth={worry ? "o" : "flat"} look={{ x: 0.9, y: 0.35 }} />
      </g>
    </g>
  );
};

/** The dotted glowing thread from the band's light (a) up to the ghost's back (b). `t` 0..1 draws it. Script v6: bright
 *  pulses run along it from the band UP to the ghost (the brain's work goes up; the money comes down, as coins). */
export const Thread: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; t: number; bend?: number }> = ({ a, b, t, bend = 260 }) => {
  const frame = useCurrentFrame();
  if (t <= 0.01) return null;
  const c1 = { x: a.x + 40, y: a.y - 220 };
  const c2 = { x: b.x - bend, y: b.y - 60 };
  const d = `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`;
  const at = (u: number) => {
    const v = 1 - u;
    return {
      x: v * v * v * a.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * b.x,
      y: v * v * v * a.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * b.y,
    };
  };
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  return (
    <g opacity={t}>
      <path d={d} fill="none" stroke={GHOST.light} strokeWidth={26} opacity={0.18} strokeLinecap="round" />
      <path d={d} fill="none" stroke={GHOST.light} strokeWidth={7} opacity={0.8} strokeLinecap="round" strokeDasharray="2 16" pathLength={1000}
        strokeDashoffset={frame * 6} />
      {[0, 1, 2].map((i) => {
        const u = ((frame / 40) + i / 3) % 1;
        const p = at(u);
        const r = Math.max(5, len * 0.012);
        return (
          <g key={i} opacity={Math.min(1, u * 6, (1 - u) * 6)}>
            <circle cx={p.x} cy={p.y} r={r * 2.4} fill={GHOST.light} opacity={0.35} />
            <circle cx={p.x} cy={p.y} r={r} fill="#ffffff" />
          </g>
        );
      })}
    </g>
  );
};

/** One coin, a little tilted. */
export const Coin: React.FC<{ x: number; y: number; r?: number; tilt?: number }> = ({ x, y, r = 22, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <ellipse rx={r} ry={r * 0.92} fill="#ffd36b" stroke={INK} strokeWidth={4} />
    <ellipse rx={r * 0.55} ry={r * 0.5} fill="none" stroke="#c98f1f" strokeWidth={3} />
  </g>
);

/**
 * The night's pay: coins dropping from `from` in an arc over `via` into `to`, one every `every` frames from `start`,
 * each taking `fall` frames. Draws the coins in the air at this frame.
 */
export const CoinArc: React.FC<{ frame: number; start: number; end?: number; from: { x: number; y: number };
  via: { x: number; y: number }; to: { x: number; y: number }; every?: number; fall?: number; r?: number }> = ({
  frame, start, end = Infinity, from, via, to, every = 9, fall = 26, r = 24 }) => {
  if (frame < start) return null;
  const at = (t: number) => ({
    x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * via.x + t * t * to.x,
    y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * via.y + t * t * to.y,
  });
  const coins: React.ReactNode[] = [];
  const first = Math.max(0, Math.floor((frame - start - fall) / every));
  for (let n = first; ; n++) {
    const born = start + n * every;
    if (born > frame || born > end) break;
    const t = (frame - born) / fall;
    if (t > 1) continue;
    const p = at(t);
    coins.push(<Coin key={n} x={p.x} y={p.y} r={r} tilt={(n * 37 + frame * 9) % 360} />);
  }
  return <g>{coins}</g>;
};

/** Frames at which coins land, for <ClinkSound>: one per coin of a <CoinArc> with the same timing. */
export const landings = (start: number, end: number, every = 9, fall = 26) => {
  const out: number[] = [];
  for (let b = start; b <= end; b += every) out.push(b + fall);
  return out;
};

/** The glass jar on a bedside table or kitchen table, `fill` 0..1 of gold. (x, y) is its bottom-centre. */
export const Jar: React.FC<{ x: number; y: number; w?: number; h?: number; fill?: number }> = ({ x, y, w = 150, h = 190, fill = 0.55 }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={22} fill="#cfe9f4" opacity={0.18} />
    {fill > 0.02 && <rect x={x - w / 2 + 6} y={y - h * fill} width={w - 12} height={h * fill - 6} rx={16} fill={MUSTARD} />}
    {fill > 0.02 && [0, 1, 2, 3, 4, 5, 6].map((i) => (
      <ellipse key={i} cx={x - w * 0.32 + (i % 4) * w * 0.213 + (i > 3 ? w * 0.107 : 0)} cy={y - h * fill + 6 + (i > 3 ? 34 : 0)}
        rx={w * 0.16} ry={10} fill="#ffd36b" stroke={INK} strokeWidth={3} />
    ))}
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={22} fill="none" stroke={PAPER} strokeWidth={6} />
    <path d={`M${x - w / 2 + 18} ${y - h + 24} V${y - 30}`} stroke="#ffffff" strokeWidth={8} opacity={0.35} strokeLinecap="round" />
    <rect x={x - w / 2 - 8} y={y - h - 18} width={w + 16} height={24} rx={8} fill="#8a96a8" stroke={INK} strokeWidth={5} />
  </g>
);

/** A band held in a hand or lying on a table: the thumbnail's band, a thin dark strip, gently curved, with its one
 *  small teal light glowing (script v6: never a ring, never a stalk). (x, y) is its centre; at scale 1 it is about a
 *  head wide (100 units). */
export const Band: React.FC<{ x: number; y: number; scale?: number; lit?: boolean; color?: string; tilt?: number }> = ({
  x, y, scale = 1, lit = true, color, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    {lit && <circle cx={0} cy={8} r={22} fill={color ?? GHOST.light} opacity={0.35} />}
    <path d="M-52 -4 Q0 16 52 -4" fill="none" stroke="#1b1d24" strokeWidth={11} strokeLinecap="round" />
    <path d="M-46 -6 Q0 11 46 -6" fill="none" stroke="#3b3f4a" strokeWidth={3} strokeLinecap="round" />
    <circle cx={0} cy={6} r={8} fill={lit ? (color ?? GHOST.light) : "#2a3a3a"} stroke="#1b1d24" strokeWidth={3} />
  </g>
);

/** The broker's shoebox of bands, open, a row of teal lights inside. (x, y) bottom-centre. */
export const BandBox: React.FC<{ x: number; y: number; scale?: number; color?: string }> = ({ x, y, scale = 1, color }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-80} y={-60} width={160} height={60} rx={6} fill="#c9b48f" stroke={INK} strokeWidth={5} />
    {[-50, -17, 17, 50].map((dx) => <circle key={dx} cx={dx} cy={-50} r={9} fill={color ?? GHOST.light} stroke="#1b1d24" strokeWidth={3} />)}
    <rect x={-80} y={-72} width={160} height={14} rx={4} fill="#b39e78" stroke={INK} strokeWidth={4} transform="rotate(-14 -80 -65)" />
  </g>
);

// ---------------------------------------------------------------- text on screen

/**
 * The band's split-flap pay counter, a small cream plate with mustard digits, e.g. "$90". It flutters through to its
 * value over FLAP frames from `at`. (x, y) is its centre. Story numbers on screen (> TAG: $90).
 */
const FLAP = 16;
export const PayFlap: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; value: string; size?: number;
  settle?: number; popAt?: number }> = ({ frame, at, until, x, y, value, size = 90, settle = FLAP, popAt }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  // `popAt`: when the plate itself appeared (a later value on the same plate flips its digits without popping again)
  const s = pop(frame, popAt ?? at, 240);
  const p = Math.min(1, (frame - at) / Math.max(1, settle));
  const chars = value.split("");
  const w = size * 0.78;
  const x0 = -((chars.length - 1) * w) / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={x0 - w * 0.75} y={-size * 0.82} width={(chars.length - 1) * w + w * 1.5} height={size * 1.64} rx={size * 0.16}
        fill={INK} stroke={PAPER} strokeWidth={8} />
      {chars.map((ch, i) => {
        const settled = p >= (i + 1) / chars.length;
        const shown = settled || ch === "$" ? ch : String((Math.floor(frame / 2) + i * 3) % 10);
        return (
          <g key={i} transform={`translate(${x0 + i * w} 0)`}>
            <rect x={-w * 0.45} y={-size * 0.64} width={w * 0.9} height={size * 1.28} rx={size * 0.1} fill="#2f323b" />
            <line x1={-w * 0.45} y1={0} x2={w * 0.45} y2={0} stroke="#15171c" strokeWidth={size * 0.04} />
            <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.95} fill={MUSTARD}>{shown}</text>
          </g>
        );
      })}
    </g>
  );
};

/** A stamped cream paper tag (KEYS, DOOR, YOU, BRAIN ...), ink letters, slightly tilted. (x, y) is its centre. */
export const StampTag: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; tilt?: number }> = ({
  frame, at, until, x, y, text, size = 54, tilt = -4 }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = 1 + 0.35 * (1 - Math.min(1, (frame - at) / 6));
  const w = text.length * size * 0.72 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={CRIMSON} opacity={0.88}>{text}</text>
    </g>
  );
};

/** A speech bubble, four words or fewer (> BUBBLE:). (x, y) is the tail's tip. */
export const Bubble: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right";
}> = ({ frame, at, until, x, y, text, size = 46, side = "right" }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame, at, 260);
  const w = Math.max(size * 3, text.length * size * 0.58 + size * 1.2);
  const h = size * 1.9;
  const dir = side === "right" ? 1 : -1;
  const bx = x + dir * size * 0.6 - (side === "right" ? 0 : w);
  const by = y - size * 0.9 - h;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <path d={`M${x} ${y} L${x + dir * size * 0.5} ${by + h - 2} L${x + dir * size * 1.5} ${by + h - 2}Z`}
        fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx} y={by} width={w} height={h} rx={h * 0.45} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={x + dir * size * 0.55 - 4} y={by + h - 9} width={size + 8} height={12} fill={PAPER} />
      <text x={bx + w / 2} y={by + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size}
        fill={INK}>{text}</text>
    </g>
  );
};

/**
 * A cream paper sheet that unfolds at `at` (facts are drawn on paper: style.md, "Facts are drawn"). Children are drawn
 * in the sheet's own coordinates, 0..w by 0..h; use <DrawLine> from the kit for lines that draw themselves.
 */
export const Sheet: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; w: number; h: number; tilt?: number;
  children?: React.ReactNode;
}> = ({ frame, at, until, x, y, w, h, tilt = -2, children }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  // script v6: no insert opens on blank or folded paper: the sheet is fully open on its first frame
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={10} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={PAPER} stroke="#cdbfa6" strokeWidth={4} />
      <line x1={-w / 2} y1={0} x2={w / 2} y2={0} stroke="#e2d6bf" strokeWidth={3} />
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
    </g>
  );
};

/** The nurse's white paper cap, on a head at (x, y) of radius r. */
export const PaperCap: React.FC<{ x: number; y: number; r: number; lit?: boolean }> = ({ x, y, r, lit }) => (
  <g>
    <path d={`M${x - r * 0.95} ${y - r * 0.45} Q${x} ${y - r * 1.45} ${x + r * 0.95} ${y - r * 0.45} Z`} fill="#f7f4ee" stroke={INK} strokeWidth={4} />
    {lit && <circle cx={x + r * 0.5} cy={y - r * 0.5} r={r * 0.12} fill={GHOST.light} stroke="#1b1d24" strokeWidth={2} />}
  </g>
);

// ---------------------------------------------------------------- sound (outside <Stage>)

/** The band's sound as the device comes on at `at`: a soft teal chime, then the dry patter of typing for `frames`.
 *  Files in assets/sfx (make_sfx.sh): chime.wav, typing.wav (a loop). */
export const DeviceSound: React.FC<{ at: number; frames: number; volume?: number; chime?: boolean }> = ({ at, frames, volume = 1, chime = true }) => (
  <>
    {chime && (
      <Sequence from={at} durationInFrames={FPS * 2}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.35 * volume} />
      </Sequence>
    )}
    {frames > 0 && (
      <Sequence from={at + 6} durationInFrames={frames}>
        <Audio src={staticFile("sfx/typing.wav")} loop volume={(f) => 0.18 * volume * Math.min(1, f / 8, (frames - f) / 8)} />
      </Sequence>
    )}
  </>
);

/** A coin landing in glass (or a palm: `soft`) at each frame given. File: assets/sfx/clink.wav. */
export const ClinkSound: React.FC<{ at: number[]; volume?: number }> = ({ at, volume = 1 }) => (
  <>
    {at.map((f, i) => (
      <Sequence key={i} from={f} durationInFrames={20}>
        <Audio src={staticFile("sfx/clink.wav")} volume={0.22 * volume * (0.8 + 0.2 * ((i * 7) % 3) / 2)} />
      </Sequence>
    ))}
  </>
);

export { CRIMSON, TEAL };
