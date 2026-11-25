// The Stadium beat's own pictures (the library `stadium` is a side-on view from the stands; this film also needs the
// whole bowl from above): the bowl at night seen from high over your seat, sixty thousand heads as tiny dim plates
// (zeros frost-white, ones a touch warmer), the floodlights that dim, the directors' box blazing with double digits
// like a bonfire, the commentary box glowing beside it, a paper subscribe tag on one hoarding. Also: dim counters over
// the library stadium's crowd tiers, and the pitch close up. Drawn in code, cheaply: the crowd is one path per colour.
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { Deep, noise } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { Counter } from "../parts/Counter";
import { PaperTag } from "../parts/SayItAgain.Kit";

export const BOWL = { cx: 960, cy: 560, inner: { rx: 470, ry: 215 }, outer: { rx: 930, ry: 470 }, box: { x: 1700, y: 520 }, comm: { x: 1660, y: 660 } };

/** Where a seat in the bowl is: row t (0 pitch side .. 1 the top), angle a (radians, 0 at the right). */
const seatAt = (t: number, a: number) => ({
  x: BOWL.cx + Math.cos(a) * (BOWL.inner.rx + 30 + t * (BOWL.outer.rx - BOWL.inner.rx - 40)),
  y: BOWL.cy + Math.sin(a) * (BOWL.inner.ry + 20 + t * (BOWL.outer.ry - BOWL.inner.ry - 30)),
});

/** The crowd's plates, computed once: rows round the bowl, skipping the boxes on the right. */
const SEATS: { x: number; y: number; one: boolean; s: number }[] = (() => {
  const out: { x: number; y: number; one: boolean; s: number }[] = [];
  const rows = 22;
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const n = Math.round(150 + t * 170);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r % 2) * (Math.PI / n);
      const p = seatAt(t, a);
      if (Math.abs(p.y - BOWL.box.y) < 120 && p.x > 1560) continue;
      out.push({ ...p, one: noise(r * 997 + i) > 0.58, s: 0.75 + t * 0.6 });
    }
  }
  return out;
})();

const BOX_COUNTS = [12, 31, 17, 44, 26, 19, 38, 23, 15, 41, 29, 33];

/** The bowl from above. `lights` 1 floodlights full on .. 0 off; `frame` twinkles a few plates as people click. */
export const BowlBack: React.FC<{ cam: Camera; frame: number; lights: number; boxTicks?: number[] }> = ({ cam, frame, lights, boxTicks = [] }) => {
  const zeros: string[] = [];
  const ones: string[] = [];
  const flash: string[] = [];
  SEATS.forEach((p, i) => {
    const w = 5 * p.s, h = 4 * p.s;
    const d = `M${p.x.toFixed(1)} ${p.y.toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}Z`;
    if (noise(i * 13 + Math.floor(frame / 9)) > 0.9985) flash.push(d);
    else (p.one ? ones : zeros).push(d);
  });
  const glowBox = 0.85 + Math.sin(frame / 5) * 0.08 + Math.sin(frame / 2.3) * 0.05;
  return (
    <>
      <Deep cam={cam} depth={1} flat>
        <rect x={-2000} y={-1400} width={6000} height={4000} fill="#070914" />
        <defs>
          <radialGradient id="bowl-fire" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffb347" stopOpacity={0.75} />
            <stop offset="0.45" stopColor="#ff7a2a" stopOpacity={0.3} />
            <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="bowl-flood" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fffbe0" stopOpacity={0.9} />
            <stop offset="1" stopColor="#fffbe0" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* the stands: the bowl's concrete, dark, the roof ring */}
        <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.outer.rx + 60} ry={BOWL.outer.ry + 40} fill="#1a1d30" stroke="#2a2f4a" strokeWidth={18} />
        <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.outer.rx} ry={BOWL.outer.ry} fill="#11142a" />
        {/* the pitch */}
        <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.inner.rx} ry={BOWL.inner.ry} fill="#1f4a2c" />
        <rect x={BOWL.cx - 360} y={BOWL.cy - 150} width={720} height={300} fill="#2a5e38" stroke="#7fa88a" strokeWidth={3} opacity={0.9} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={BOWL.cx - 360 + i * 120} y={BOWL.cy - 150} width={60} height={300} fill="#24543a" opacity={0.6} />)}
        <line x1={BOWL.cx} y1={BOWL.cy - 150} x2={BOWL.cx} y2={BOWL.cy + 150} stroke="#7fa88a" strokeWidth={3} />
        <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={60} ry={40} fill="none" stroke="#7fa88a" strokeWidth={3} />
        {/* the hoardings round the pitch, and one paper tag on them */}
        <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.inner.rx + 12} ry={BOWL.inner.ry + 8} fill="none" stroke="#2f3550" strokeWidth={10} />
        {/* the crowd: frost */}
        <path d={zeros.join("")} fill="#cfe3ff" opacity={0.55} />
        <path d={ones.join("")} fill="#ffe9b0" opacity={0.7} />
        <path d={flash.join("")} fill="#fff4c0" stroke="#ffcf5a" strokeWidth={3} />
        {/* the directors' box: glass, a dozen double digits, the bonfire */}
        <ellipse cx={BOWL.box.x} cy={BOWL.box.y} rx={260 * glowBox} ry={190 * glowBox} fill="url(#bowl-fire)" />
        <rect x={BOWL.box.x - 120} y={BOWL.box.y - 70} width={240} height={130} rx={10} fill="#2a1a14" stroke="#ff9a4a" strokeWidth={5} />
        {/* the commentary box, glowing softer */}
        <ellipse cx={BOWL.comm.x} cy={BOWL.comm.y + 30} rx={130} ry={70} fill="url(#bowl-fire)" opacity={0.5} />
        <rect x={BOWL.comm.x - 80} y={BOWL.comm.y} width={160} height={66} rx={8} fill="#22182a" stroke="#d98a5a" strokeWidth={4} />
        {/* the floodlights at the four corners, dimming */}
        {[[120, 70], [1800, 70], [80, 1060], [1840, 1060]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={260} fill="url(#bowl-flood)" opacity={0.6 * lights} />
            <rect x={x - 60} y={y - 30} width={120} height={60} rx={8} fill="#3b3e47" />
            {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={x - 40 + (j % 3) * 40} cy={y - 12 + Math.floor(j / 3) * 24} r={9}
              fill={lights > 0.3 ? "#fffbe0" : "#5c6070"} opacity={0.4 + 0.6 * lights} />)}
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={1}>
        {BOX_COUNTS.map((n, i) => (
          <Counter key={i} x={BOWL.box.x - 95 + (i % 4) * 63} y={BOWL.box.y - 38 + Math.floor(i / 4) * 40} base={n}
            ticks={boxTicks.filter((_, j) => j % 12 === i)} frame={frame} size={20} glow="#ff9a4a" id={`box${i}`} />
        ))}
        {[7, 9, 5].map((n, i) => (
          <Counter key={i} x={BOWL.comm.x - 50 + i * 50} y={BOWL.comm.y + 32} base={n} frame={frame} size={18} glow="#ffcf5a" id={`comm${i}`} />
        ))}
        <PaperTag frame={frame} at={-1000} x={BOWL.cx + 210} y={BOWL.cy + BOWL.inner.ry + 6} text="SUBSCRIBE" size={18} tilt={-2} />
      </Deep>
    </>
  );
};

/** Dim counters over the library stadium's two near crowd tiers (their heads are drawn by the set; these line up with
 *  them: same depth, same spacing, same bob). Most read 0, some 1. */
export const TierCounters: React.FC<{ cam: Camera; frame: number; rise?: number }> = ({ cam, frame, rise = 0 }) => (
  <>
    {[{ depth: 0.65, y: 780, r: 20, gap: 58, seed: 2 }, { depth: 0.82, y: 860, r: 28, gap: 82, seed: 3 }].map((t) => (
      <Deep key={t.depth} cam={cam} depth={t.depth}>
        {Array.from({ length: Math.ceil(4000 / t.gap) }, (_, i) => {
          const x = -1100 + i * t.gap + (t.seed % 2) * t.gap * 0.5;
          const bob = Math.sin(frame / 9 + i + t.seed) * 2;
          const one = noise(i * 7 + t.seed * 31) > 0.62;
          const y = t.y + bob - t.r * 2.3 - rise * t.r * 0.6;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={0.8}>
              <rect x={-t.r * 0.55} y={-t.r * 0.6} width={t.r * 1.1} height={t.r * 1.15} rx={t.r * 0.25} fill={INK} stroke="#ffcf5a" strokeWidth={t.r * 0.08} />
              <text x={0} y={t.r * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={t.r * 0.9} fill={PAPER}>{one ? "1" : "0"}</text>
            </g>
          );
        })}
      </Deep>
    ))}
  </>
);

/** Dark discs over the library stadium's floodlight lamps: the floodlights go off in your eyes. `dim` 0..1. */
export const FloodsOff: React.FC<{ cam: Camera; dim: number }> = ({ cam, dim }) => (
  <Deep cam={cam} depth={0.1} flat>
    {[100, 1800].map((x) => (
      <g key={x} opacity={dim}>
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={x - 66 + (i % 4) * 44} cy={44 + Math.floor(i / 4) * 40} r={15} fill="#4a4f60" />)}
      </g>
    ))}
  </Deep>
);

/** The pitch close up at night: the floodlit grass with its stripes, the box line, the goal, the crowd a dark band. */
export const PitchBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.3} flat>
      <rect x={-1400} y={-800} width={4800} height={1300} fill="#0b0e22" />
      {Array.from({ length: 160 }, (_, i) => (
        <rect key={i} x={-1300 + (i % 80) * 60} y={250 + Math.floor(i / 80) * 60 + Math.sin(frame / 9 + i) * 2} width={9} height={7}
          fill={noise(i) > 0.6 ? "#ffe9b0" : "#cfe3ff"} opacity={0.5} />
      ))}
      <rect x={-1400} y={420} width={4800} height={40} fill="#2f3550" />
    </Deep>
    <Deep cam={cam} depth={0.7}>
      <rect x={-1400} y={460} width={4800} height={1200} fill="#2a6a3a" />
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-1400 + i * 200} y={460} width={100} height={1200} fill="#2f7442" />)}
      <path d="M-200 620 H2200" stroke="#e8f2e8" strokeWidth={6} opacity={0.8} />
      <rect x={1500} y={380} width={460} height={150} fill="none" stroke="#f3f3f3" strokeWidth={10} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={1500 + i * 46} y1={380} x2={1500 + i * 46} y2={530} stroke="#f3f3f3" strokeWidth={2} opacity={0.4} />)}
    </Deep>
  </>
);

export { CRIMSON };
