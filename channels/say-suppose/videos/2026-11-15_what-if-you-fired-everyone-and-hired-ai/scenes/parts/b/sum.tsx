// The Missing Line's explainer (script v2): the worked sum on your napkin, drawn large, one step at a time on the
// spoken words. Marco ate here; four hundred a week; forty back over your counter; the rest to the barber, the garage,
// the grocer and the bar; you kept four hundred and lost forty; they lost the rest. Then every owner's napkin with the
// same sum, every slice landing on your counter, and all the slices together making the town. Plain words, plain
// numbers, simple drawings. Screen pixels (1920 x 1080). No AI images.
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { WORKER_HEADS } from "../Cast";
import { Napkin } from "../Props";
import { ease, mix, ramp } from "../util";

const NAPKIN_INK = "#3b3f8f";
const pop = (f: number, at: number, len = 8) => ease(ramp(f, at, at + len));
const rad = (d: number) => ((d - 90) * Math.PI) / 180;

/** A pie wedge of a disc of radius r from angle a0 to a1 (degrees, 0 at the top, clockwise), centred on the origin. */
export const wedge = (r: number, a0: number, a1: number) => {
  const p0 = { x: Math.cos(rad(a0)) * r, y: Math.sin(rad(a0)) * r };
  const p1 = { x: Math.cos(rad(a1)) * r, y: Math.sin(rad(a1)) * r };
  return `M0 0 L${p0.x} ${p0.y} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1.x} ${p1.y} Z`;
};
const mid = (a0: number, a1: number, r: number) => ({ x: Math.cos(rad((a0 + a1) / 2)) * r, y: Math.sin(rad((a0 + a1) / 2)) * r });

const Ink: React.FC<{ x: number; y: number; size?: number; color?: string; k?: number; anchor?: "start" | "middle" | "end"; children: React.ReactNode }> = ({
  x, y, size = 56, color = NAPKIN_INK, k = 1, anchor = "middle", children,
}) => (k <= 0 ? null : (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} opacity={k}
    transform={`rotate(-1.5 ${x} ${y})`}>{children}</text>
));

/** A wide paper napkin (scalloped edge, the fold, the dashed border), w x h, top-left at the origin. */
const NapkinSheet: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const n = Math.round(w / 34), m = Math.round(h / 34);
  let d = "M0 0";
  for (let i = 0; i < n; i++) d += ` Q${((i + 0.5) * w) / n} -8 ${((i + 1) * w) / n} 0`;
  for (let i = 0; i < m; i++) d += ` Q${w + 8} ${((i + 0.5) * h) / m} ${w} ${((i + 1) * h) / m}`;
  for (let i = n; i > 0; i--) d += ` Q${((i - 0.5) * w) / n} ${h + 8} ${((i - 1) * w) / n} ${h}`;
  for (let i = m; i > 0; i--) d += ` Q-8 ${((i - 0.5) * h) / m} 0 ${((i - 1) * h) / m}`;
  return (
    <g>
      <path d={`${d} Z`} fill="#000" opacity={0.32} transform="translate(14 18)" />
      <path d={`${d} Z`} fill="#fbf7ee" stroke="#d9cfbd" strokeWidth={3} />
      <rect x={26} y={26} width={w - 52} height={h - 52} fill="none" stroke="#e7dccb" strokeWidth={3} strokeDasharray="3 10" />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#efe6d6" strokeWidth={3} />
    </g>
  );
};

/** A coin of radius r (the whole wage), centred on the origin, with Marco's paper hat drawn on it. */
const WageCoin: React.FC<{ r: number; hat?: boolean; from?: number; to?: number; color?: string }> = ({ r, hat = true, from = 0, to = 360, color = MUSTARD }) => (
  <g>
    {to - from >= 359.9 ? <circle r={r} fill={color} stroke={INK} strokeWidth={6} /> : <path d={wedge(r, from, to)} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
    {hat && (
      <g transform={`scale(${r / 120})`}>
        <path d="M-52 18 L56 18 L46 -22 Q4 -44 -42 -22 Z" fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-44 6 H48" stroke={INK} strokeWidth={4} opacity={0.5} />
      </g>
    )}
  </g>
);

const SHOPS = [
  { word: 257, color: "#e85f6f", icon: "pole" },
  { word: 269, color: "#7d8d99", icon: "wrench" },
  { word: 289, color: "#7fc29b", icon: "apple" },
  { word: 313, color: "#b58fc7", icon: "mug" },
] as const;

const Shopfront: React.FC<{ x: number; y: number; color: string; icon: string; k: number; dim: number }> = ({ x, y, color, icon, k, dim }) => (k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * k})`} opacity={k}>
    <rect x={-70} y={-60} width={140} height={120} fill={color} stroke={INK} strokeWidth={5} />
    <path d="M-80 -60 L-66 -92 H66 L80 -60Z" fill={PAPER} stroke={INK} strokeWidth={5} />
    <rect x={-48} y={-36} width={60} height={50} fill={dim > 0.5 ? "#6b6f7a" : "#fff1c6"} stroke={INK} strokeWidth={4} />
    <rect x={22} y={-36} width={30} height={96} fill="#5a4a3a" stroke={INK} strokeWidth={4} />
    <g transform="translate(0 -76)">
      {icon === "pole" && <g><rect x={-8} y={-14} width={16} height={28} fill={PAPER} stroke={INK} strokeWidth={3} /><path d="M-8 -6 L8 -14 M-8 6 L8 -2 M-8 14 L8 10" stroke={CRIMSON} strokeWidth={4} /></g>}
      {icon === "wrench" && <path d="M-14 12 L10 -10 M4 -16 Q18 -18 14 -4" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />}
      {icon === "apple" && <g><circle r={12} fill={CRIMSON} stroke={INK} strokeWidth={3} /><path d="M0 -12 q4 -8 10 -8" stroke="#2f7a4a" strokeWidth={4} fill="none" /></g>}
      {icon === "mug" && <g><rect x={-12} y={-12} width={20} height={24} rx={3} fill={MUSTARD} stroke={INK} strokeWidth={3} /><path d="M8 -6 q10 0 8 10 q-2 6 -8 4" fill="none" stroke={INK} strokeWidth={3} /></g>}
    </g>
  </g>
));

/** Your counter: a teal counter, a stool, your mustard head, in napkin pencil. */
const YourCounter: React.FC<{ x: number; y: number; grin: number }> = ({ x, y, grin }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={-40} cy={-120} r={44} fill={MUSTARD} stroke={INK} strokeWidth={5} />
    <circle cx={-26} cy={-128} r={5} fill={INK} /><circle cx={-6} cy={-128} r={5} fill={INK} />
    <path d={grin > 0.5 ? "M-36 -104 Q-16 -86 2 -106" : "M-34 -102 H-4"} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={-130} y={-60} width={260} height={66} rx={8} fill={TEAL} stroke={INK} strokeWidth={5} />
    <rect x={-140} y={-70} width={280} height={18} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
  </g>
);

/** The worked sum, step by step. `f` is frames from the start of "Here's the line you missed." `zoom` pushes the
 *  whole napkin in toward your counter (the second half). */
export const SumNapkin: React.FC<{ f: number; zoom?: number }> = ({ f, zoom = 1 }) => {
  const W = 1500, H = 800;
  const coin = { x: 470, y: 360 };
  const counter = { x: 1180, y: 690 };
  const marcoK = pop(f, 44);
  const coinK = pop(f, 86, 10);
  const slice = ease(ramp(f, 146, 182));
  const sliceAt = { x: mix(coin.x, counter.x + 60, slice), y: mix(coin.y, counter.y - 96, slice) };
  const split = ramp(f, 236, 246);
  const fired = pop(f, 345);
  const kept = pop(f, 373, 10);
  const lost = pop(f, 404);
  const grin = pop(f, 420);
  const shopX = (i: number) => 760 + i * 190;
  const shopY = 230;
  return (
    <g transform={`translate(960 600) scale(${zoom}) translate(${-W / 2 + (zoom - 1) * -320} ${-H / 2 + (zoom - 1) * -260})`}>
      <NapkinSheet w={W} h={H} />
      {/* the napkin's old lines, small, the third one underlined: the line you missed */}
      <Ink x={60} y={84} size={34} anchor="start" k={1}>3 wages: gone.  Burgers: same.</Ink>
      <Ink x={640} y={84} size={34} anchor="start">...and he ate here</Ink>
      <line x1={640} y1={98} x2={640 + 320 * ease(ramp(f, 4, 26))} y2={96} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
      {/* Marco ate here */}
      <g opacity={marcoK} transform={`translate(170 360) scale(${0.8 + 0.2 * marcoK})`}>
        <circle r={62} fill="#a9d4ec" stroke={INK} strokeWidth={5} />
        <circle cx={14} cy={-6} r={6} fill={INK} /><circle cx={34} cy={-6} r={6} fill={INK} />
        <path d="M14 20 Q26 30 40 18" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path d="M-60 -36 L64 -36 L54 -78 Q6 -100 -50 -78 Z" fill={PAPER} stroke={INK} strokeWidth={5} transform="rotate(24 0 -40)" />
        {fired > 0 && <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" opacity={fired * 0.85} />}
      </g>
      <Ink x={170} y={500} size={50} k={marcoK}>Marco</Ink>
      {/* four hundred a week: the coin, then the slice back to your counter, then the rest to the shops */}
      <g transform={`translate(${coin.x} ${coin.y}) scale(${coinK})`}>
        {split < 1 && <WageCoin r={120} from={slice > 0 ? 36 : 0} to={360} />}
        {split >= 1 && SHOPS.map((s, i) => {
          const a0 = 36 + i * 81, a1 = a0 + 81;
          const u = ease(ramp(f, s.word, s.word + 20));
          const m = mid(a0, a1, 0);
          const tx = mix(m.x, shopX(i) - coin.x, u), ty = mix(m.y, shopY + 100 - coin.y, u);
          const loss = pop(f, i === 3 ? 512 : 466 + [0, 13, 33][i]);
          return (
            <g key={i} transform={`translate(${tx} ${ty}) scale(${mix(1, 0.45, u)})`}>
              <path d={wedge(120, a0, a1)} fill={loss > 0.5 ? CRIMSON : MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            </g>
          );
        })}
      </g>
      <Ink x={coin.x} y={coin.y + 190} size={58} k={coinK * (1 - split)}>400 a week</Ink>
      {slice > 0 && (
        <g transform={`translate(${sliceAt.x} ${sliceAt.y}) scale(${mix(1, 0.8, slice)})`} opacity={1 - lost * 0.75}>
          <path d={wedge(120, 0, 36)} fill={lost > 0.5 ? CRIMSON : MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      <YourCounter x={counter.x} y={counter.y} grin={grin} />
      <g opacity={pop(f, 190)}>
        <path d={`M${counter.x - 116} ${counter.y - 104} h34 q0 26 -17 26 q-17 0 -17 -26z`} fill={PAPER} stroke={INK} strokeWidth={4} />
        <path d={`M${counter.x + 80} ${counter.y - 74} l40 -30 l20 30z`} fill="#e2a85a" stroke={INK} strokeWidth={4} />
      </g>
      <Ink x={counter.x - 360} y={counter.y - 10} size={52} k={pop(f, 160) * (1 - lost)} anchor="end">40 back here</Ink>
      <Ink x={counter.x - 360} y={counter.y - 10} size={52} k={lost} color={CRIMSON} anchor="end">lost 40</Ink>
      {/* the shops */}
      {SHOPS.map((s, i) => <Shopfront key={i} x={shopX(i)} y={shopY} color={s.color} icon={s.icon} k={pop(f, s.word - 6)} dim={ramp(f, 538, 548)} />)}
      <Ink x={1045} y={440} size={52} k={pop(f, 318) * (1 - pop(f, 466))}>360 to the town</Ink>
      <Ink x={1045} y={440} size={52} k={pop(f, 466)} color={CRIMSON}>they lost the rest</Ink>
      {/* you kept four hundred */}
      <g opacity={kept} transform={`translate(${counter.x + 215} ${counter.y - 115}) scale(${0.6 + 0.4 * kept})`}>
        <WageCoin r={60} />
      </g>
      <Ink x={counter.x + 215} y={counter.y - 200} size={44} k={kept} color={TEAL}>kept 400</Ink>
      {grin > 0 && <path d={`M${counter.x + 30} ${counter.y - 170} l24 26 l46 -58`} fill="none" stroke={TEAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={grin} />}
    </g>
  );
};

/** Every owner's napkin, the same sum: ten coins each missing a slice; the slices land on your counter; then all the
 *  slices together make the town. `f` is frames from "Then every owner in town did the same sum". */
export const SlicesTown: React.FC<{ f: number }> = ({ f }) => {
  const inks = ["#2f7a4a", "#4f5f6a", "#6b5a8a", "#c0394f", "#3b4a8f", "#8a5a2a", "#2f6a8a", "#7a3a6a", "#4a7a3a", "#5a4a8a"];
  const spots = Array.from({ length: 10 }, (_, i) => ({ x: 360 + (i % 5) * 300, y: i < 5 ? 270 : 520 }));
  const counter = { x: 960, y: 960 };
  const gather = ease(ramp(f, 248, 280));
  const town = pop(f, 284, 12);
  const whole = Math.max(0, Math.sin(Math.PI * ramp(f, 180, 198)));
  return (
    <g>
      {spots.map((p, i) => {
        const k = pop(f, 2 + i * 4);
        return (
          <g key={i} opacity={k * (1 - 0.6 * gather)} transform={`translate(${p.x} ${p.y + (1 - k) * 40})`}>
            <Napkin s={0.36} rot={((i * 37) % 9) - 4} scribbles={1} seed={i + 11} ink={inks[i]} />
            <circle cx={-70} cy={-70} r={20} fill={WORKER_HEADS[i]} stroke={INK} strokeWidth={4} />
            <g transform={`scale(${0.42 * (1 + 0.15 * whole)})`}>
              <WageCoin r={120} hat={false} from={f > 85 + i * 5 ? 36 : 0} />
              {f > 205 && <path d={wedge(120, 0, 36)} fill="none" stroke={CRIMSON} strokeWidth={8} strokeDasharray="14 10" opacity={pop(f, 205)} />}
            </g>
          </g>
        );
      })}
      {spots.map((p, i) => {
        const fly = ease(ramp(f, 85 + i * 5, 110 + i * 5));
        if (fly <= 0) return null;
        const rest = { x: counter.x - 270 + i * 60, y: counter.y - 90 };
        const disc = { x: 960, y: 560 };
        const x = gather > 0 ? mix(rest.x, disc.x, gather) : mix(p.x, rest.x, fly);
        const y = gather > 0 ? mix(rest.y, disc.y, gather) : mix(p.y, rest.y, fly) - 120 * fly * (1 - fly);
        const s = gather > 0 ? mix(0.42, 1.6, gather) : 0.42;
        const a0 = gather > 0 ? i * 36 * gather : 0;
        return (
          <g key={`w${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={wedge(120, a0, a0 + 36)} fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>
        );
      })}
      {town > 0 && (
        <g transform="translate(960 560)" opacity={town}>
          {Array.from({ length: 7 }, (_, i) => {
            const x = -150 + i * 44;
            const h = 50 + ((i * 29) % 50);
            return <path key={i} d={`M${x} 60 V${60 - h} L${x + 20} ${40 - h} L${x + 40} ${60 - h} V60Z`} fill={PAPER} stroke={INK} strokeWidth={4} />;
          })}
          <text x={0} y={260} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={PAPER} stroke={INK} strokeWidth={2}>the town</text>
        </g>
      )}
      <g opacity={1 - gather}>
        <rect x={counter.x - 320} y={counter.y - 60} width={640} height={70} rx={10} fill={TEAL} stroke={INK} strokeWidth={5} />
        <rect x={counter.x - 330} y={counter.y - 70} width={660} height={18} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
        <circle cx={counter.x + 380} cy={counter.y - 70} r={40} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};
