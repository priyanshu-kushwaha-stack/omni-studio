// The Cold Apology's paper inserts: the 31-metre fall into a net with two stopwatches (c18; the faller's arc 36% longer
// than the watcher's), and the two memory cards (hers thick with the argument drawn on top, yours blank with a year of
// inside weather stacked on it). Each sits on a dark desk under the lamp, in world coordinates on its own Stage.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { FLATMATE, HERO, linear, mix, ramp } from "../shared";
import { OwnSet } from "./CityPlugsIn.Kit";

const W = 1300;
const H = 760;

/** The dark desk the sheets lie on. */
export const Desk: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#3a2a22" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-1400} y={-200 + i * 170} width={4800} height={6} fill="#000" opacity={0.15} />)}
  </g>
);

/** A stopwatch: a face, a crown, and a crimson arc swept to `deg` degrees. */
const Stopwatch: React.FC<{ x: number; y: number; r: number; deg: number; icon: "fall" | "eye" }> = ({ x, y, r, deg, icon }) => {
  const a = (Math.min(359.5, deg) * Math.PI) / 180;
  const ex = x + Math.sin(a) * r * 0.82, ey = y - Math.cos(a) * r * 0.82;
  return (
    <g>
      <rect x={x - 16} y={y - r - 34} width={32} height={26} rx={6} fill={INK} />
      <circle cx={x} cy={y} r={r} fill="#fffaf0" stroke={INK} strokeWidth={10} />
      {deg > 0 && <path d={`M${x} ${y} L${x} ${y - r * 0.82} A${r * 0.82} ${r * 0.82} 0 ${deg > 180 ? 1 : 0} 1 ${ex} ${ey} Z`} fill={CRIMSON} opacity={0.75} />}
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <circle cx={x} cy={y} r={10} fill={INK} />
      {icon === "fall" ? (
        <g transform={`translate(${x} ${y + r + 60})`}>
          <circle cx={0} cy={-18} r={14} fill={MUSTARD} stroke={INK} strokeWidth={3} />
          <path d="M0 -4 V24 M-18 -10 L0 4 L18 -10 M-12 40 L0 24 L12 40" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M-30 -40 V-60 M30 -40 V-60" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : (
        <g transform={`translate(${x} ${y + r + 60})`}>
          <path d="M-40 0 Q0 -36 40 0 Q0 36 -40 0Z" fill="#fffaf0" stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={0} r={14} fill={INK} />
        </g>
      )}
    </g>
  );
};

/** The fall: a scaffold tower, a figure dropping into the net, the height; then the two stopwatches. */
export const FallInsert: React.FC<{ frame: number; start: number; drop: [number, number]; sweep: [number, number]; pct: number; push: number }> = ({
  frame, start, drop, sweep, pct, push,
}) => {
  const fall = linear(frame, drop[0], drop[1]);
  const fy = mix(150, 600, fall * fall) + (fall >= 1 ? -Math.abs(Math.sin((frame - drop[1]) / 3)) * 30 * Math.max(0, 1 - (frame - drop[1]) / 24) : 0);
  const s = ramp(frame, sweep[0], sweep[1]);
  const cam: Camera = drift({ x: mix(960, 1180, ramp(frame, push, push + 30)), y: 560, zoom: mix(1.05, 1.5, ramp(frame, push, push + 30)) }, frame, "fall", 4);
  return (
    <OwnSet mood="lamp" cam={cam} back={<Desk />}>
      <Sheet frame={frame} at={start} x={960} y={560} w={W} h={H} tilt={-1.5}>
        {/* the tower and the net */}
        <path d="M150 90 V640 M250 90 V640 M150 90 H330 M150 200 L250 300 M250 200 L150 300 M150 400 L250 500 M250 400 L150 500" stroke={INK} strokeWidth={7} fill="none" />
        <rect x={250} y={100} width={90} height={14} fill={INK} />
        <path d="M240 600 Q340 680 470 600" fill="none" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={250 + i * 40} y1={608 + Math.sin((i / 5) * Math.PI) * 50} x2={270 + i * 40} y2={600} stroke={INK} strokeWidth={3} />)}
        <line x1={235} y1={634} x2={235} y2={680} stroke={INK} strokeWidth={6} /><line x1={475} y1={600} x2={475} y2={680} stroke={INK} strokeWidth={6} />
        <g transform={`translate(355 ${fy})`}>
          <Figure x={0} y={0} scale={0.42} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={fall > 0 && fall < 1 ? 1 : 0}
            pose={{ ...STAND, armF: [150, 20], armB: [160, 10], legF: [20, -40], legB: [-10, -20] }} mouth={fall > 0 ? "o" : "flat"} eyes={1.3} brows="raised" />
        </g>
        {/* the height, dashed, and its number */}
        <line x1={110} y1={110} x2={110} y2={620} stroke={CRIMSON} strokeWidth={5} strokeDasharray="16 12" />
        <text x={60} y={380} fontFamily={FONT} fontWeight={800} fontSize={52} fill={CRIMSON} transform="rotate(-90 60 380)" textAnchor="middle">31 m</text>
        {/* the faller's watch and the watcher's */}
        <Stopwatch x={720} y={330} r={130} deg={s * 272} icon="fall" />
        <Stopwatch x={1060} y={330} r={130} deg={s * 200} icon="eye" />
        {frame >= pct && (
          <g transform={`translate(720 120) scale(${Math.min(1, (frame - pct) / 6)})`}>
            <rect x={-80} y={-44} width={160} height={64} rx={14} fill={CRIMSON} />
            <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={PAPER}>+36%</text>
          </g>
        )}
      </Sheet>
    </OwnSet>
  );
};

/** A weather sticker: sun, cloud, snowflake, rain or leaf. */
const Weather: React.FC<{ kind: number; x: number; y: number; r?: number }> = ({ kind, x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-58} y={-46} width={116} height={92} rx={12} fill="#fffaf0" stroke={INK} strokeWidth={4} />
    {kind === 0 && <g><circle r={22} fill={MUSTARD} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={-28} x2={0} y2={-38} stroke={MUSTARD} strokeWidth={5} transform={`rotate(${i * 45})`} />)}</g>}
    {kind === 1 && <path d="M-34 14 Q-40 -10 -16 -10 Q-10 -30 12 -22 Q34 -26 34 0 Q44 14 30 16Z" fill="#cfd3e6" stroke={INK} strokeWidth={4} />}
    {kind === 2 && <g stroke="#7fa0c4" strokeWidth={5}>{[0, 60, 120].map((a) => <line key={a} x1={0} y1={-28} x2={0} y2={28} transform={`rotate(${a})`} />)}</g>}
    {kind === 3 && <g>{[-20, 0, 20].map((dx) => <line key={dx} x1={dx} y1={-20} x2={dx - 8} y2={18} stroke="#7fa0c4" strokeWidth={6} strokeLinecap="round" />)}</g>}
    {kind === 4 && <path d="M-24 18 Q-24 -24 24 -24 Q24 18 -24 18Z M-24 18 L10 -10" fill="#d97b3a" stroke={INK} strokeWidth={4} />}
  </g>
);

/** The two memory cards: hers a thick stack with last night drawn on top, yours blank, then the weather piling on. */
export const CardsInsert: React.FC<{ frame: number; start: number; hers: number; yours: number; weather: number; end: number }> = ({
  frame, start, hers, yours, weather, end,
}) => {
  const n = Math.round(10 * ramp(frame, hers, hers + 24));
  const piles = Array.from({ length: 9 }, (_, i) => weather + Math.round(((end - weather) * i) / 10));
  const cam: Camera = drift({ x: mix(960, 1000, linear(frame, start, end)), y: 560, zoom: mix(1.05, 1.18, linear(frame, start, end)) }, frame, "cards", 4);
  return (
    <OwnSet mood="lamp" cam={cam} back={<Desk />}>
      <Sheet frame={frame} at={start} x={960} y={560} w={W} h={H} tilt={1.2}>
        {/* hers: a thick stack */}
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={170 - i * 3} y={430 - i * 9} width={340} height={230} rx={14} fill={i % 2 ? "#fffaf0" : "#efe4cf"} stroke={INK} strokeWidth={3} />
        ))}
        <g transform={`translate(${170 - n * 3} ${430 - n * 9})`}>
          <rect x={0} y={0} width={340} height={230} rx={14} fill="#fffaf0" stroke={INK} strokeWidth={5} />
          {/* last night: the table, two heads, mouths open, the bill */}
          <rect x={60} y={150} width={220} height={12} fill="#a8774e" />
          <circle cx={90} cy={100} r={30} fill={FLATMATE.head} stroke={INK} strokeWidth={3} />
          <circle cx={250} cy={100} r={30} fill={HERO.head} stroke={INK} strokeWidth={3} />
          <ellipse cx={108} cy={112} rx={7} ry={9} fill={INK} /><ellipse cx={232} cy={112} rx={7} ry={9} fill={INK} />
          <path d="M70 80 l20 6 M270 80 l-20 6" stroke={INK} strokeWidth={4} />
          <rect x={140} y={136} width={60} height={14} fill={PAPER} stroke={INK} strokeWidth={2} />
          <path d="M140 50 l10 -16 l10 16 M190 50 l10 -16 l10 16" fill="none" stroke={CRIMSON} strokeWidth={4} />
        </g>
        <circle cx={340} cy={700} r={20} fill={FLATMATE.head} stroke={INK} strokeWidth={3} />
        {/* yours: one blank card, then a year of someone else's weather on top */}
        {frame >= yours && (
          <rect x={790} y={430} width={340} height={230} rx={14} fill="#fffaf0" stroke={INK} strokeWidth={5} />
        )}
        {piles.map((at, i) => frame >= at && (
          <g key={i} transform={`translate(0 ${-Math.max(0, 60 - (frame - at) * 12)})`}>
            <Weather kind={i % 5} x={900 + ((i * 67) % 140)} y={520 - i * 26} r={((i * 37) % 30) - 15} />
          </g>
        ))}
        <circle cx={960} cy={700} r={20} fill={HERO.head} stroke={INK} strokeWidth={3} />
        <rect x={948} y={714} width={24} height={8} fill={TEAL} />
      </Sheet>
    </OwnSet>
  );
};
