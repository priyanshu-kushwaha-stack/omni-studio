// The chai stall outside college (scene_plan.md, "Shared sets"), side on, drawn for the REF camera (sets/common.tsx):
// the college gate and trees far back, the street, and the stall: a tin roof on poles, a shelf of jars, the stove with
// the kettle (steam rises on `frame`), a stack of glasses and the steel chutney bowl on the counter.
//
// Usage: back={<ChaiStallBack cam={cam} frame={frame} />}; in the actors' slot draw the chai man FIRST (at
// CHAI.man, behind the counter), then <ChaiCounter ... />, then you and the customers (at CHAI.customer, CHAI.student).
// The counter's props are switchable: `bowl={false}` once he has handed you the bowl; `glasses` the stack's count.
// The props themselves (<ChutneyBowl>, <ChaiGlass>, <Saucer>) are exported to put in hands (Figure `held`).
// Typical cameras: wide REF; two-shot { x: 1080, y: 600, zoom: 1.5 }; the counter insert insert(CHAI.bowl.x, CHAI.bowl.y, 3.2).
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { noise } from "../shared";
import { Deep } from "./common";

export const CHAI = {
  /** Feet line on the street side (you, the student). Scale about 1.15. */
  floor: 960,
  /** The chai man's feet, behind the counter (scale 1.1, facing -1 toward you). */
  man: { x: 1320, y: 960 },
  /** Where you stand at the counter (facing 1). */
  customer: { x: 760, y: 960 },
  /** Where the student beside you stands. */
  student: { x: 520, y: 960 },
  /** The counter: its front from x `from` to `to`, its top at y `top`. */
  counter: { from: 900, to: 1560, top: 800 },
  /** The steel chutney bowl's centre on the counter. */
  bowl: { x: 1010, y: 782 },
  /** The kettle's spout tip (steam starts here) and the stove under it. */
  kettle: { x: 1462, y: 680 },
  /** The base centre of the stack of glasses. */
  glasses: { x: 1140, y: 800 },
} as const;

/** The steel bowl of green chutney, centred on its rim line. */
export const ChutneyBowl: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 0, y = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-46 -6 Q-42 26 0 28 Q42 26 46 -6Z" fill="#c9ced6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={-6} rx={46} ry={11} fill="#5aa04a" stroke={INK} strokeWidth={5} />
    <ellipse cx={-12} cy={-9} rx={14} ry={4} fill="#86c96a" />
    <path d="M-30 6 Q-22 18 -6 20" fill="none" stroke="#fff" strokeWidth={4} opacity={0.6} />
  </g>
);

/** A cutting-chai glass, base at (x, y). `fill` 0..1 is the chai level; over 1 the chai brims over the top. */
export const ChaiGlass: React.FC<{ x?: number; y?: number; scale?: number; fill?: number }> = ({ x = 0, y = 0, scale = 1, fill = 0.75 }) => {
  const h = 62;
  const level = Math.min(1, fill) * (h - 6);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M-20 0 L-24 ${-h} H24 L20 0Z`} fill="#e9f3f4" opacity={0.75} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {fill > 0 && <path d={`M-19 -3 L${-19 - (level / h) * 4} ${-3 - level} H${19 + (level / h) * 4} L19 -3Z`} fill="#c98a4b" />}
      {fill > 1 && <path d={`M-25 ${-h} Q0 ${-h - 10} 25 ${-h} L28 ${-h + 30} Q24 ${-h + 8} 22 ${-h + 4} L-22 ${-h + 4} Q-26 ${-h + 10} -28 ${-h + 34}Z`} fill="#c98a4b" />}
      {[-16, -6, 4, 14].map((gx) => <line key={gx} x1={gx} y1={-6} x2={gx * 1.15} y2={-h + 4} stroke="#fff" strokeWidth={2} opacity={0.6} />)}
    </g>
  );
};

/** A steel saucer, centred at (x, y). `brim` 0..1 fills it with spilt chai. */
export const Saucer: React.FC<{ x?: number; y?: number; scale?: number; brim?: number }> = ({ x = 0, y = 0, scale = 1, brim = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse rx={58} ry={12} fill="#c9ced6" stroke={INK} strokeWidth={4} />
    {brim > 0 && <ellipse rx={52 * brim} ry={9 * brim} fill="#c98a4b" />}
  </g>
);

/** The kettle on its stove. Steam curls up from the spout on `frame`. */
const Kettle: React.FC<{ frame: number }> = ({ frame }) => {
  const { x, y } = CHAI.kettle;
  return (
    <g>
      <rect x={x - 120} y={y + 60} width={130} height={60} rx={8} fill="#3b3e47" stroke={INK} strokeWidth={5} />
      <ellipse cx={x - 55} cy={y + 60} rx={50} ry={8} fill="#e0793f" opacity={0.9} />
      <path d={`M${x - 110} ${y + 56} Q${x - 116} ${y - 10} ${x - 55} ${y - 14} Q${x + 6} ${y - 10} ${x} ${y + 56}Z`} fill="#b8bec8" stroke={INK} strokeWidth={5} />
      <path d={`M${x - 10} ${y + 20} Q${x + 10} ${y + 6} ${x} ${y}`} fill="none" stroke="#b8bec8" strokeWidth={14} strokeLinecap="round" />
      <path d={`M${x - 92} ${y - 14} Q${x - 55} ${y - 60} ${x - 18} ${y - 14}`} fill="none" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => {
        const p = ((frame / 50 + i / 4) % 1);
        const sx = x + 4 + Math.sin(frame / 14 + i) * 10 * p;
        return <circle key={i} cx={sx} cy={y - 10 - p * 150} r={14 + p * 26} fill={PAPER} opacity={0.5 * (1 - p)} />;
      })}
    </g>
  );
};

/** The counter and what sits on it, for the actors' slot (between the chai man and the customers). */
export const ChaiCounter: React.FC<{ frame: number; bowl?: boolean; glasses?: number }> = ({ frame, bowl = true, glasses = 5 }) => {
  const c = CHAI.counter;
  return (
    <g>
      <Kettle frame={frame} />
      <rect x={c.from - 20} y={c.top - 16} width={c.to - c.from + 40} height={22} rx={6} fill="#9a6a44" stroke={INK} strokeWidth={5} />
      <rect x={c.from} y={c.top + 6} width={c.to - c.from} height={CHAI.floor - c.top - 6} fill="#c7884f" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={c.from + 20 + i * 108} y={c.top + 24} width={86} height={CHAI.floor - c.top - 48} rx={6} fill="#b5763f" />)}
      {Array.from({ length: glasses }, (_, i) => <ChaiGlass key={i} x={CHAI.glasses.x + (i % 2) * 6 - 3} y={c.top - 16 - i * 22} scale={0.8} fill={0} />)}
      {bowl && <ChutneyBowl x={CHAI.bowl.x} y={CHAI.bowl.y} />}
    </g>
  );
};

/** The street, the college beyond it, and the stall's roof, back shelf and poles. */
export const ChaiStallBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.3} flat>
      <rect x={-1400} y={-800} width={4800} height={1700} fill="#bfe0ea" />
      <circle cx={300} cy={170} r={70} fill="#fff1b8" />
    </Deep>
    <Deep cam={cam} depth={0.55} flat>
      {/* the college: a cream block with an arch gate and windows */}
      <rect x={-500} y={260} width={1500} height={520} fill="#e8d3a8" />
      <rect x={-500} y={240} width={1500} height={30} fill="#c9a77a" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 10 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-440 + c * 145} y={300 + r * 100} width={70} height={60} rx={30} fill="#8fa6b5" opacity={0.8} />
      )))}
      <path d="M180 780 V560 Q300 440 420 560 V780Z" fill="#6b5240" />
      {[-900, 1200, 1700, 2300].map((x, i) => (
        <g key={x}>
          <rect x={x - 12} y={520} width={24} height={260} fill="#6f4a2f" />
          <circle cx={x} cy={480} r={110 + noise(i) * 30} fill="#5ba06f" /><circle cx={x + 70} cy={530} r={70} fill="#4c9a76" />
        </g>
      ))}
      <rect x={-1400} y={770} width={4800} height={30} fill="#cfc2a6" />
    </Deep>
    <Deep cam={cam} depth={0.8} flat>
      <rect x={-1400} y={790} width={4800} height={120} fill="#6c6f76" />
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-1300 + i * 240} y={846} width={110} height={8} rx={4} fill={PAPER} opacity={0.7} />)}
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={900} width={4800} height={700} fill="#d9cbb0" />
      <rect x={-1400} y={900} width={4800} height={12} fill="#b7a98f" />
      {/* the stall: back wall, a shelf of jars, poles and the tin roof */}
      <rect x={CHAI.counter.from - 40} y={380} width={CHAI.counter.to - CHAI.counter.from + 80} height={530} fill="#7a4a3a" />
      <rect x={CHAI.counter.from} y={480} width={CHAI.counter.to - CHAI.counter.from} height={12} fill="#4a2a20" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={CHAI.counter.from + 30 + i * 90} y={420} width={56} height={60} rx={10} fill="#e9f3f4" opacity={0.85} stroke={INK} strokeWidth={4} />
          <rect x={CHAI.counter.from + 36 + i * 90} y={446} width={44} height={30} rx={6} fill={["#e6a23c", "#d8344f", "#f3e9d7", "#9a6a44"][i % 4]} />
        </g>
      ))}
      {[CHAI.counter.from - 40, CHAI.counter.to + 30].map((x) => <rect key={x} x={x} y={300} width={16} height={620} fill="#4a3a30" />)}
      <path d={`M${CHAI.counter.from - 120} 340 L${CHAI.counter.from - 60} 270 H${CHAI.counter.to + 110} L${CHAI.counter.to + 170} 340Z`} fill="#3d8a80" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={CHAI.counter.from - 90 + i * 70} y1={276} x2={CHAI.counter.from - 120 + i * 76} y2={340} stroke="#2e6d65" strokeWidth={5} />)}
    </Deep>
  </>
);
