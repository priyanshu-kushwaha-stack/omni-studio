// The depot's loading dock at dusk (scene_plan.md, "Shared sets"; owner: builder C). Side on, drawn for the REF camera
// (sets/common.tsx): the dusk sky and a far city, a chain fence and a pole lamp in the yard at the left, concrete steps
// up to the raised dock lip, the warehouse wall with three roller shutters half up (warm racking inside), a sodium
// lamp over each bay that comes on with `lamps` (0..1), pallets on the dock, and a parked forklift in the yard.
//
// People on the dock stand at y DOCK.top; in the yard at y DOCK.ground. Climbing the steps: dockStepY(x) is the feet
// line at x between DOCK.steps.from and .to.
// Usage: back={<LoadingDockBack cam={cam} frame={frame} lamps={...} />}, front={<LoadingDockFront cam={cam} />} (the
// forklift and the pole lamp, in front of anyone in the yard). Glows: dockLamps(on) for useGlows (HerBack.Sister.tsx).
// Typical cameras: wide REF; the two on the dock { x: 800, y: 560, zoom: 1.9 }; the steps { x: 620, y: 760, zoom: 1.5 }.
import { Skyline, Sky } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { Deep } from "./common";

export const DOCK = {
  /** The yard's feet line. */
  ground: 980,
  /** The dock top's feet line. */
  top: 760,
  /** The dock lip runs from here to the right, out of frame. */
  lip: 640,
  /** The steps: from the yard at `from` up to the dock at `to`, `n` steps. */
  steps: { from: 520, to: 640, n: 4 },
  /** You at the foot of the steps (yard), and where the two of you meet on the dock. */
  foot: { x: 455 },
  meet: { you: 730, her: 862 },
  /** The roller-shutter bays: centre x, width; the opening's top; how far up the shutters are. */
  bays: [{ x: 905, w: 320 }, { x: 1345, w: 320 }, { x: 1785, w: 320 }],
  bayTop: 330,
  /** The sodium lamps' heads (one over each bay) and the pole lamp in the yard. */
  lamps: [{ x: 905, y: 262 }, { x: 1345, y: 262 }, { x: 1785, y: 262 }],
  pole: { x: 300, y: 214 },
  forklift: { x: 1520 },
} as const;

/** The feet line on the steps at x (yard below DOCK.steps.from, dock above .to). */
export function dockStepY(x: number) {
  const { from, to, n } = DOCK.steps;
  if (x <= from) return DOCK.ground;
  if (x >= to) return DOCK.top;
  const k = Math.min(n - 1, Math.floor(((x - from) / (to - from)) * n));
  return DOCK.ground - ((DOCK.ground - DOCK.top) / n) * (k + 1);
}

const SODIUM = "#ffb347";

/** One pallet (x is its left edge, y its bottom). `load` stacks wrapped boxes on it. */
const Pallet: React.FC<{ x: number; y: number; load?: number; tone?: string }> = ({ x, y, load = 0, tone = "#c79a62" }) => (
  <g>
    <rect x={x} y={y - 26} width={150} height={10} fill={tone} stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((i) => <rect key={i} x={x + 6 + i * 62} y={y - 16} width={22} height={16} fill={tone} stroke={INK} strokeWidth={3} />)}
    {load > 0 && (
      <g>
        <rect x={x + 4} y={y - 26 - load} width={142} height={load} fill="#b98f62" stroke={INK} strokeWidth={4} />
        <rect x={x + 4} y={y - 26 - load} width={142} height={load} fill="#e8eef2" opacity={0.35} />
        <line x1={x + 4} y1={y - 26 - load / 2} x2={x + 146} y2={y - 26 - load / 2} stroke={INK} strokeWidth={3} opacity={0.5} />
        <line x1={x + 75} y1={y - 26 - load} x2={x + 75} y2={y - 26} stroke={INK} strokeWidth={3} opacity={0.5} />
      </g>
    )}
  </g>
);

/** A sodium lamp on a gooseneck from the wall; `on` 0..1 lights the head and its cone. */
const WallLamp: React.FC<{ x: number; y: number; on: number; flicker: number }> = ({ x, y, on, flicker }) => (
  <g>
    {on > 0 && <path d={`M${x - 26} ${y + 10} L${x - 190} ${DOCK.top} H${x + 190} L${x + 26} ${y + 10}Z`} fill={SODIUM} opacity={0.14 * on * flicker} />}
    <path d={`M${x + 70} ${y - 40} Q${x + 10} ${y - 52} ${x} ${y - 8}`} fill="none" stroke="#4a4a52" strokeWidth={8} strokeLinecap="round" />
    <rect x={x + 62} y={y - 56} width={20} height={32} rx={4} fill="#4a4a52" />
    <path d={`M${x - 30} ${y - 6} Q${x} ${y - 30} ${x + 30} ${y - 6}Z`} fill="#4a4a52" stroke={INK} strokeWidth={4} />
    <ellipse cx={x} cy={y - 4} rx={24} ry={7} fill={on > 0.05 ? SODIUM : "#8a8478"} opacity={on > 0.05 ? 0.6 + 0.4 * on * flicker : 1} />
  </g>
);

/** The far yard, the warehouse wall, the shutters, the lamps and the dock. */
export const LoadingDockBack: React.FC<{ cam: Camera; frame: number; lamps: number; open?: number; dark?: number }> = ({
  cam, frame, lamps, open = 0.5, dark = 0,
}) => {
  const flick = (i: number) => (lamps < 1 && lamps > 0 ? 0.75 + 0.25 * Math.sin(frame * 1.7 + i * 2.1) : 1);
  return (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <Sky id="dock" mood="dusk" x={-1400} y={-800} w={4800} h={1560} sunAt={{ x: 250, y: 220 }} />
        <rect x={-1400} y={-800} width={4800} height={2000} fill="#2a2c58" opacity={dark * 0.45} />
      </Deep>
      <Deep cam={cam} depth={0.5} flat>
        <Skyline mood="dusk" from={-1400} to={3400} base={800} tall={260} seed={3} />
      </Deep>
      <Deep cam={cam} depth={0.78} flat>
        {/* far depot sheds and the chain fence */}
        <rect x={-1400} y={640} width={1700} height={220} fill="#6e6a86" />
        <path d={Array.from({ length: 18 }, (_, i) => `M${-1400 + i * 100} 640 V860`).join("")} stroke="#5a5672" strokeWidth={6} />
        <rect x={-1400} y={800} width={2100} height={400} fill="#7b7488" />
        <path d={`M-1400 790 H560`} stroke="#3b3e47" strokeWidth={5} />
        <path d={Array.from({ length: 40 }, (_, i) => `M${-1400 + i * 50} 790 L${-1370 + i * 50} 880 M${-1370 + i * 50} 790 L${-1400 + i * 50} 880`).join("")}
          stroke="#3b3e47" strokeWidth={2} opacity={0.6} />
        {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-1400 + i * 100} y={780} width={8} height={110} fill="#3b3e47" />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the yard */}
        <rect x={-1400} y={880} width={4800} height={1000} fill="#5d5a66" />
        <rect x={-1400} y={DOCK.ground - 4} width={4800} height={900} fill="#6a6672" />
        {[-600, -200, 200].map((x) => <rect key={x} x={x} y={DOCK.ground + 30} width={150} height={12} fill="#e8c23a" opacity={0.8} />)}
        {/* the warehouse wall: corrugated cladding, the roof edge */}
        <rect x={560} y={130} width={2840} height={DOCK.top - 130} fill="#8892a4" stroke={INK} strokeWidth={6} />
        <path d={Array.from({ length: 72 }, (_, i) => `M${580 + i * 40} 150 V${DOCK.top}`).join("")} stroke="#76809a" strokeWidth={6} />
        <rect x={546} y={112} width={2870} height={30} fill="#4a4f5e" stroke={INK} strokeWidth={5} />
        {DOCK.bays.map((b, i) => {
          const l = b.x - b.w / 2;
          const h = DOCK.top - DOCK.bayTop;
          const shut = h * (1 - (i === 2 ? open * 0.4 : open));
          return (
            <g key={i}>
              <rect x={l - 14} y={DOCK.bayTop - 44} width={b.w + 28} height={h + 44} fill="#5b6070" stroke={INK} strokeWidth={5} />
              {/* inside: warm light and racking */}
              <rect x={l} y={DOCK.bayTop} width={b.w} height={h} fill="#3a2e2a" />
              <rect x={l} y={DOCK.bayTop} width={b.w} height={h} fill="#ffcf8a" opacity={0.18} />
              {[0, 1].map((r) => <rect key={r} x={l + 20} y={DOCK.bayTop + 160 + r * 120} width={b.w - 40} height={12} fill="#e8792f" />)}
              {[0, 1, 2].map((r) => <rect key={r} x={l + 20 + r * ((b.w - 52) / 2)} y={DOCK.bayTop + 120} width={12} height={h - 120} fill="#3b6fb0" />)}
              {[0, 1].map((r) => <rect key={`b${r}`} x={l + 44 + r * 130} y={DOCK.bayTop + 112 + r * 120} width={90} height={48} fill="#b98f62" opacity={0.85} />)}
              {/* the shutter, rolled half up, and its housing */}
              <rect x={l} y={DOCK.bayTop} width={b.w} height={shut} fill="#a9b0bd" stroke={INK} strokeWidth={4} />
              <path d={Array.from({ length: Math.floor(shut / 18) }, (_, k) => `M${l} ${DOCK.bayTop + 18 * (k + 1)} H${l + b.w}`).join("")} stroke="#8d94a3" strokeWidth={3} />
              <rect x={l + b.w / 2 - 30} y={DOCK.bayTop + shut - 16} width={60} height={10} rx={4} fill="#4a4f5e" />
              <rect x={l - 8} y={DOCK.bayTop - 36} width={b.w + 16} height={38} rx={10} fill="#6b7282" stroke={INK} strokeWidth={4} />
            </g>
          );
        })}
        {/* the dock: its top and front face, the striped lip, bumpers */}
        <rect x={DOCK.lip} y={DOCK.top} width={2800} height={DOCK.ground - DOCK.top} fill="#b8b0a2" stroke={INK} strokeWidth={6} />
        <rect x={DOCK.lip} y={DOCK.top} width={2800} height={14} fill="#d4cdbf" />
        <path d={Array.from({ length: 70 }, (_, i) => `M${DOCK.lip + i * 40} ${DOCK.top + 14} l20 0 l-14 14 l-20 0z`).join("")} fill="#e8c23a" />
        <rect x={DOCK.lip} y={DOCK.top + 14} width={2800} height={14} fill="none" stroke={INK} strokeWidth={3} />
        {DOCK.bays.map((b, i) => (
          <g key={i}>
            {[-1, 1].map((s) => <rect key={s} x={b.x + s * 110 - 22} y={DOCK.top + 60} width={44} height={70} rx={6} fill="#26272e" />)}
          </g>
        ))}
        {/* the steps, with a yellow rail */}
        {Array.from({ length: DOCK.steps.n }, (_, k) => {
          const { from, to, n } = DOCK.steps;
          const sw = (to - from) / n;
          const top = DOCK.ground - ((DOCK.ground - DOCK.top) / n) * (k + 1);
          return <rect key={k} x={from + k * sw} y={top} width={to - from - k * sw} height={DOCK.ground - top} fill="#c4bcae" stroke={INK} strokeWidth={4} />;
        })}
        <path d={`M${DOCK.steps.from + 6} ${DOCK.ground - 100} L${DOCK.steps.to + 6} ${DOCK.top - 100} H${DOCK.steps.to + 60}`} fill="none" stroke="#e8c23a" strokeWidth={9} strokeLinecap="round" />
        <path d={`M${DOCK.steps.from + 6} ${DOCK.ground - 100} V${DOCK.ground} M${DOCK.steps.to + 6} ${DOCK.top - 100} V${DOCK.top}`} stroke="#e8c23a" strokeWidth={7} />
        {/* pallets on the dock and in the yard */}
        <Pallet x={2010} y={DOCK.top} load={110} />
        <Pallet x={2170} y={DOCK.top} />
        <Pallet x={2170} y={DOCK.top - 26} />
        <Pallet x={2170} y={DOCK.top - 52} load={60} tone="#b5885a" />
        <Pallet x={120} y={DOCK.ground} />
        <Pallet x={120} y={DOCK.ground - 26} load={80} />
        {DOCK.lamps.map((l, i) => <WallLamp key={i} x={l.x} y={l.y} on={lamps} flicker={flick(i)} />)}
      </Deep>
    </>
  );
};

/** The forklift (parked, forks down, facing left) and the pole lamp, in front of the yard. */
export const LoadingDockFront: React.FC<{ cam: Camera; lamps: number }> = ({ cam, lamps }) => {
  const f = DOCK.forklift.x;
  const g = DOCK.ground;
  const p = DOCK.pole;
  return (
    <Deep cam={cam} depth={1}>
      {/* the pole lamp */}
      {lamps > 0 && <path d={`M${p.x + 40} ${p.y + 10} L${p.x - 140} ${g} H${p.x + 220} L${p.x + 70} ${p.y + 10}Z`} fill={SODIUM} opacity={0.12 * lamps} />}
      <rect x={p.x - 8} y={p.y} width={16} height={g - p.y} fill="#4a4a52" stroke={INK} strokeWidth={3} />
      <path d={`M${p.x} ${p.y + 6} Q${p.x + 20} ${p.y - 20} ${p.x + 56} ${p.y}`} fill="none" stroke="#4a4a52" strokeWidth={8} />
      <path d={`M${p.x + 30} ${p.y + 6} Q${p.x + 56} ${p.y - 16} ${p.x + 84} ${p.y + 6}Z`} fill="#4a4a52" stroke={INK} strokeWidth={3} />
      <ellipse cx={p.x + 57} cy={p.y + 6} rx={20} ry={6} fill={lamps > 0.05 ? SODIUM : "#8a8478"} />
      {/* the forklift */}
      <g>
        <rect x={f - 40} y={g - 300} width={16} height={290} fill="#5a5f6e" stroke={INK} strokeWidth={4} />
        <rect x={f - 18} y={g - 300} width={12} height={290} fill="#5a5f6e" stroke={INK} strokeWidth={3} />
        <path d={`M${f - 44} ${g - 70} H${f - 220} V${g - 56} H${f - 44}Z`} fill="#3b3e47" stroke={INK} strokeWidth={3} />
        <path d={`M${f - 44} ${g - 22} H${f - 230} V${g - 8} H${f - 44}Z`} fill="#3b3e47" stroke={INK} strokeWidth={3} />
        <path d={`M${f} ${g - 40} V${g - 160} H${f + 70} L${f + 100} ${g - 200} H${f + 220} V${g - 40}Z`} fill="#d9a32b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={f + 170} y={g - 150} width={70} height={110} rx={8} fill="#c58f22" stroke={INK} strokeWidth={4} />
        <path d={`M${f + 30} ${g - 160} V${g - 330} H${f + 190} V${g - 200}`} fill="none" stroke="#2f3340" strokeWidth={9} strokeLinejoin="round" />
        <rect x={f + 96} y={g - 230} width={50} height={14} rx={6} fill="#2f3340" />
        <circle cx={f + 50} cy={g - 34} r={34} fill="#23252b" />
        <circle cx={f + 50} cy={g - 34} r={13} fill="#8a8478" />
        <circle cx={f + 190} cy={g - 28} r={28} fill="#23252b" />
        <circle cx={f + 190} cy={g - 28} r={10} fill="#8a8478" />
      </g>
    </Deep>
  );
};

/** The sodium lamps as practical lights for useGlows, at `on` 0..1. */
export const dockLamps = (on: number) =>
  on <= 0 ? [] : [
    ...DOCK.lamps.map((l) => ({ x: l.x, y: l.y, r: 260, color: SODIUM, strength: 0.45 * on })),
    { x: DOCK.pole.x + 57, y: DOCK.pole.y + 6, r: 200, color: SODIUM, strength: 0.4 * on },
  ];
