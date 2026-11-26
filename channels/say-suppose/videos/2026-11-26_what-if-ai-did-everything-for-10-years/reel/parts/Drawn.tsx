// The narrator's four pictures, drawn in code on a cream paper sheet over the dimmed still (facts and pictures are
// drawn on paper, the channel's style): gym, concert, wheel, exam. Ink outlines, flat mustard, teal and crimson, black
// figures like the 3D cast's matte black heads. Life comes from the action and the camera only (no line boil).
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { easeOut, mix, ramp } from "../data";

const SW = 1400; // sheet size, in sheet units
const SH = 800;
const BLACK = "#17181c";
const STEEL = "#c4ccd4";
const STEEL_D = "#9aa4ae";
const WOOD = "#b98552";
const PANTS = "#2E3440";

/** A seeded shuffle, the same every frame. */
function order(n: number, seed: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

// ---------------------------------------------------------------- gym

const Robot: React.FC<{ lift: number }> = ({ lift }) => {
  const barY = mix(385, 190, lift);
  const arm = (sx: number, hx: number, out: number) => {
    const ex = (sx + hx) / 2 + out * mix(46, 10, lift);
    const ey = (385 + barY) / 2 + mix(30, 0, lift);
    return `M${sx} 385 L${ex} ${ey} L${hx} ${barY}`;
  };
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x={333} y={520} width={34} height={130} rx={10} fill={STEEL_D} stroke={INK} strokeWidth={6} />
      <rect x={393} y={520} width={34} height={130} rx={10} fill={STEEL_D} stroke={INK} strokeWidth={6} />
      <rect x={300} y={360} width={160} height={175} rx={24} fill={STEEL} stroke={INK} strokeWidth={6} />
      <rect x={345} y={400} width={70} height={46} rx={10} fill={TEAL} stroke={INK} strokeWidth={5} />
      <line x1={380} y1={262} x2={380} y2={232} stroke={INK} strokeWidth={6} />
      <circle cx={380} cy={226} r={10} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <rect x={328} y={262} width={104} height={92} rx={20} fill={STEEL} stroke={INK} strokeWidth={6} />
      <rect x={342} y={286} width={76} height={38} rx={14} fill={INK} />
      <circle cx={364} cy={305} r={8} fill="#7FF3FF" />
      <circle cx={396} cy={305} r={8} fill="#7FF3FF" />
      {[arm(312, 248, -1), arm(448, 512, 1)].map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke={INK} strokeWidth={36} />
          <path d={d} fill="none" stroke={STEEL_D} strokeWidth={24} />
        </g>
      ))}
      <line x1={160} y1={barY} x2={600} y2={barY} stroke={INK} strokeWidth={13} />
      {[170, 556].map((x) => <rect key={x} x={x} y={barY - 58} width={34} height={116} rx={7} fill={INK} />)}
      {[208, 526].map((x) => <rect key={x} x={x} y={barY - 42} width={22} height={84} rx={6} fill={CRIMSON} stroke={INK} strokeWidth={5} />)}
    </g>
  );
};

const SittingYou: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <rect x={820} y={560} width={400} height={30} rx={10} fill={WOOD} stroke={INK} strokeWidth={6} />
    <rect x={850} y={590} width={22} height={60} fill={INK} />
    <rect x={1168} y={590} width={22} height={60} fill={INK} />
    <rect x={958} y={530} width={160} height={44} rx={20} fill={PANTS} stroke={INK} strokeWidth={5} />
    <rect x={1082} y={548} width={36} height={102} rx={14} fill={PANTS} stroke={INK} strokeWidth={5} />
    <ellipse cx={1110} cy={650} rx={34} ry={13} fill="#2B2B2B" />
    <rect x={948} y={420} width={116} height={146} rx={36} fill={MUSTARD} stroke={INK} strokeWidth={6} />
    <rect x={952} y={414} width={108} height={30} rx={15} fill={TEAL} stroke={INK} strokeWidth={5} />
    {["M966 452 L972 556", "M1046 452 L1062 552"].map((d) => (
      <g key={d}>
        <path d={d} stroke={INK} strokeWidth={28} />
        <path d={d} stroke={MUSTARD} strokeWidth={17} />
      </g>
    ))}
    <circle cx={972} cy={562} r={13} fill={BLACK} />
    <circle cx={1062} cy={558} r={13} fill={BLACK} />
    <circle cx={1006} cy={366} r={48} fill={BLACK} />
    <ellipse cx={985} cy={360} rx={10} ry={13} fill="#fff" />
    <ellipse cx={1013} cy={360} rx={10} ry={13} fill="#fff" />
    <circle cx={980} cy={363} r={5} fill={INK} />
    <circle cx={1008} cy={363} r={5} fill={INK} />
  </g>
);

const Gym: React.FC<{ f: number }> = ({ f }) => {
  const lift = 0.5 - 0.5 * Math.cos((2 * Math.PI * f) / 40);
  const reps = Math.floor((f + 20) / 40);
  return (
    <g>
      <line x1={60} y1={650} x2={1340} y2={650} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <rect x={870} y={60} width={380} height={170} rx={18} fill={INK} stroke={PAPER} strokeWidth={0} />
      <text x={1060} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={MUSTARD}>
        {40 + reps * 20}
        <tspan fontSize={50} dx={10}>kg</tspan>
      </text>
      <Robot lift={lift} />
      <SittingYou />
    </g>
  );
};

// ---------------------------------------------------------------- concert

const ROWS = [
  { base: 430, s: 0.78, n: 10, x0: 140, step: 125 },
  { base: 565, s: 0.93, n: 9, x0: 190, step: 128 },
  { base: 725, s: 1.12, n: 7, x0: 160, step: 180 },
];

const Concert: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  const people = ROWS.flatMap((r, ri) => Array.from({ length: r.n }, (_, c) => ({ ri, x: r.x0 + c * r.step, ...r })));
  const seed = people.find((p) => p.ri === 2 && Math.abs(p.x - 700) < 100) ?? people[people.length - 1];
  const ranked = [...people].sort((a, b) => Math.hypot(a.x - seed.x, (a.base - seed.base) * 1.6) - Math.hypot(b.x - seed.x, (b.base - seed.base) * 1.6));
  const upAt = new Map(ranked.map((p, k) => [p, dur * (0.1 + 0.7 * (k / (ranked.length - 1)))]));
  return (
    <g>
      <rect x={240} y={36} width={920} height={176} rx={12} fill="#2b2f45" stroke={INK} strokeWidth={6} />
      {[480, 700, 920].map((x, i) => (
        <g key={x}>
          <polygon points={`${x},40 ${x - 95},208 ${x + 95},208`} fill={MUSTARD} opacity={0.22} />
          <rect x={x - 22} y={140} width={44} height={68} rx={14} fill={[CRIMSON, MUSTARD, TEAL][i]} stroke={INK} strokeWidth={4} />
          <circle cx={x} cy={124} r={20} fill={BLACK} />
        </g>
      ))}
      <rect x={220} y={208} width={960} height={22} rx={6} fill="#3a3c44" />
      {ROWS.map((r, ri) => (
        <g key={ri}>
          <rect x={60} y={r.base - 96 * r.s} width={1280} height={96 * r.s} rx={14 * r.s} fill="#9b3b48" stroke={INK} strokeWidth={5} />
          {people.filter((p) => p.ri === ri).map((p) => {
            const up = easeOut(ramp(f, upAt.get(p)!, upAt.get(p)! + 9));
            const lift = up * 70 * p.s;
            return (
              <g key={p.x}>
                <rect x={p.x - 46 * p.s} y={p.base - 92 * p.s - lift} width={92 * p.s} height={400} rx={32 * p.s} fill={BLACK} />
                <circle cx={p.x} cy={p.base - 122 * p.s - lift} r={31 * p.s} fill={BLACK} />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- wheel

const CX = 700;
const CY = 380;
const SCREWS: { r: number; a: number }[] = [
  ...Array.from({ length: 24 }, (_, i) => ({ r: 96, a: (i / 24) * 360 })),
  ...[0, 90, 180].flatMap((a) => [146, 178, 210, 240].map((r) => ({ r, a }))),
  ...Array.from({ length: 28 }, (_, i) => ({ r: 270, a: (i / 28) * 360 + 6 })),
];
const FALL = order(SCREWS.length, 7);

const at = (r: number, deg: number) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)];

const Screw: React.FC<{ x: number; y: number; rot: number; o?: number }> = ({ x, y, rot, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <circle r={10} fill="#e4e8ec" stroke={INK} strokeWidth={3.5} />
    <line x1={-6} y1={0} x2={6} y2={0} stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </g>
);

const Wheel: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  const angle = (t: number) => 7 * Math.sin((2 * Math.PI * t) / 100);
  const a = angle(f);
  const falls = Math.round(SCREWS.length * 0.7);
  const fallAt = new Map(FALL.slice(0, falls).map((idx, k) => [idx, dur * (0.12 + 0.78 * (k / falls))]));
  const [hx, hy] = at(270, -150 + a);
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d={`M0 660 Q700 590 1400 660 L1400 800 L0 800 Z`} fill="#3a3c44" />
      <rect x={CX - 32} y={CY} width={64} height={460} fill={INK} />
      <g transform={`rotate(${a} ${CX} ${CY})`}>
        <circle cx={CX} cy={CY} r={270} fill="none" stroke={INK} strokeWidth={48} />
        <circle cx={CX} cy={CY} r={270} fill="none" stroke="#3a3d46" strokeWidth={12} />
        {[0, 90, 180].map((d) => {
          const [x, y] = at(252, d);
          return <line key={d} x1={CX} y1={CY} x2={x} y2={y} stroke={INK} strokeWidth={42} />;
        })}
        <circle cx={CX} cy={CY} r={122} fill={STEEL} stroke={INK} strokeWidth={6} />
        <circle cx={CX} cy={CY} r={62} fill={MUSTARD} stroke={INK} strokeWidth={6} />
        {SCREWS.map((s, i) => {
          const t = fallAt.get(i);
          if (t !== undefined && f >= t) return null;
          const [x, y] = at(s.r, s.a);
          return <Screw key={i} x={x} y={y} rot={s.a * 3} />;
        })}
      </g>
      {SCREWS.map((s, i) => {
        const t = fallAt.get(i);
        if (t === undefined || f < t) return null;
        const dt = f - t;
        const [x0, y0] = at(s.r, s.a + angle(t));
        const y = y0 + 0.7 * dt * dt + 2 * dt;
        if (y > SH + 40) return null;
        return <Screw key={`f${i}`} x={x0 + (i % 2 ? 1.6 : -1.6) * dt} y={y} rot={s.a * 3 + dt * 22} />;
      })}
      <path d={`M-80 900 Q${hx - 260} ${hy + 330} ${hx} ${hy}`} fill="none" stroke={INK} strokeWidth={94} />
      <path d={`M-80 900 Q${hx - 260} ${hy + 330} ${hx} ${hy}`} fill="none" stroke={MUSTARD} strokeWidth={80} />
      <g transform={`translate(${hx} ${hy}) rotate(${-60 + a})`}>
        <rect x={-46} y={-34} width={92} height={68} rx={30} fill={BLACK} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- exam

const Exam: React.FC<{ f: number }> = ({ f }) => {
  const starts = order(20, 3);
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x={400} y={36} width={600} height={132} rx={8} fill="#2f4a3e" stroke={WOOD} strokeWidth={14} />
      <text x={700} y={118} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={PAPER} letterSpacing={3}>
        EXAM · CLOSED BOOK
      </text>
      <circle cx={1200} cy={100} r={54} fill={PAPER} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = [1200 + 42 * Math.cos((i * Math.PI) / 6), 100 + 42 * Math.sin((i * Math.PI) / 6)];
        return <circle key={i} cx={x1} cy={y1} r={3} fill={INK} />;
      })}
      <line x1={1200} y1={100} x2={1200 + 24 * Math.cos(-2.2)} y2={100 + 24 * Math.sin(-2.2)} stroke={INK} strokeWidth={7} />
      <line x1={1200} y1={100} x2={1200 + 38 * Math.cos(-Math.PI / 2 + f * 0.02)} y2={100 + 38 * Math.sin(-Math.PI / 2 + f * 0.02)}
        stroke={CRIMSON} strokeWidth={5} />
      {[0, 1, 2, 3].map((r) => {
        const s = 0.62 + r * 0.15;
        const y = 290 + r * 128;
        return [0, 1, 2, 3, 4].map((c) => {
          const x = 700 + (c - 2) * 250 * s;
          const k = starts[r * 5 + c];
          const marks = Math.floor(ramp(f, 6 + k * 4, 66 + k * 4) * 3.99);
          return (
            <g key={`${r}${c}`} transform={`translate(${x} ${y}) scale(${s})`}>
              <rect x={-44} y={-52} width={88} height={70} rx={30} fill={BLACK} />
              <circle cx={0} cy={-70} r={32} fill={BLACK} />
              <polygon points="-84,0 84,0 98,30 -98,30" fill={WOOD} stroke={INK} strokeWidth={5} />
              <rect x={-92} y={30} width={184} height={44} fill="#9a6a3a" stroke={INK} strokeWidth={5} />
              <line x1={-80} y1={74} x2={-80} y2={118} stroke={INK} strokeWidth={8} />
              <line x1={80} y1={74} x2={80} y2={118} stroke={INK} strokeWidth={8} />
              <polygon points="-30,6 30,6 34,24 -34,24" fill="#fbf7ee" stroke={INK} strokeWidth={3} />
              {Array.from({ length: marks }, (_, m) => (
                <line key={m} x1={-22} y1={11 + m * 4.5} x2={mix(-6, 22, (m + 1) / 4)} y2={11 + m * 4.5} stroke={INK} strokeWidth={2} />
              ))}
            </g>
          );
        });
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the sheet

const PICTURES: Record<string, React.FC<{ f: number; dur: number }>> = { gym: Gym, concert: Concert, wheel: Wheel, exam: Exam };

export const Drawn: React.FC<{ picture: string; f: number; dur: number }> = ({ picture, f, dur }) => {
  const Pic = PICTURES[picture];
  const k = easeOut(ramp(f, 0, 12));
  const push = mix(1, 1.035, Math.min(1, f / Math.max(1, dur)));
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id="sheet"><rect x={0} y={0} width={SW} height={SH} rx={14} /></clipPath>
      </defs>
      <g transform={`translate(960 540) scale(${mix(0.93, 1, k) * push}) rotate(-1.2)`} opacity={k}>
        <rect x={-SW / 2 + 16} y={-SH / 2 + 22} width={SW} height={SH} rx={14} fill="#000" opacity={0.38} />
        <rect x={-SW / 2} y={-SH / 2} width={SW} height={SH} rx={14} fill={PAPER} />
        <g transform={`translate(${-SW / 2} ${-SH / 2})`} clipPath="url(#sheet)">
          {Pic ? <Pic f={f} dur={dur} /> : (
            <text x={SW / 2} y={SH / 2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={INK}>{picture}</text>
          )}
        </g>
        <rect x={-SW / 2} y={-SH / 2} width={SW} height={SH} rx={14} fill="none" stroke={INK} strokeWidth={7} />
      </g>
    </svg>
  );
};
