// The Kettle Lead's inserts (KettleLead.tsx): the piano teacher's back room inside (radios and lamps in pieces on a
// bench, a window where the counter-sun crosses again and again), the long paper drawing of the plug's insides that
// grows over a year, the price card (a street, circled) beside your pay slip (a desk), and close on your hands twisting
// the lamp cord and the kettle lead into one. World coordinates for a <Stage> drawn with an own set (REF framing).
import { interpolate } from "remotion";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { LookContext, type Glow } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { HERO, linear, mix, noise, ramp } from "../shared";
import { HomePlug, Kettle, LeadPlug } from "./NightThirty.Hall";

/** An own-drawn set on the Stage, lit by a mood and screen-space glows. */
export const OwnStage: React.FC<{ cam: Camera; mood: MoodName; back: React.ReactNode; actors?: React.ReactNode; front?: React.ReactNode; glows?: Glow[] }> = ({
  cam, mood, back, actors, front, glows = [],
}) => (
  <LookContext.Provider value={moodLook(mood, { glows })}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={<>{actors}</>} front={front} />
  </LookContext.Provider>
);

export const ROOM_FLOOR = 960;
export const BENCH_TOP = 760;

/** A radio in pieces: a wooden box, a speaker grille, a dial, the back off. */
const Radio: React.FC<{ x: number; y: number; s?: number; open?: boolean; c?: string }> = ({ x, y, s = 1, open, c = "#a8774e" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-80} width={120} height={80} rx={12} fill={c} stroke={INK} strokeWidth={4} />
    <circle cx={-22} cy={-40} r={22} fill="#5b4636" stroke={INK} strokeWidth={3} />
    {[-34, -26, -18, -10].map((dx) => <line key={dx} x1={dx} y1={-56} x2={dx} y2={-24} stroke={INK} strokeWidth={2} opacity={0.5} />)}
    <circle cx={30} cy={-46} r={11} fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={18} y={-24} width={26} height={8} rx={3} fill={INK} />
    {open && <path d="M60 -78 l24 -8 l0 70 l-24 16z" fill="#7a5d47" stroke={INK} strokeWidth={3} />}
  </g>
);

/** The teacher's back room: a brick-red wall, a shelf of radios, a window whose sky cycles day to night as the
 *  counter-sun crosses (`cycle` > 0 turns it, laps per second), the workbench with lamps in pieces and a soldering iron. */
export const BackRoom: React.FC<{ frame: number; cycle?: number }> = ({ frame, cycle = 0 }) => {
  const lap = cycle > 0 ? (frame * cycle / 30) % 1 : 0.3;
  const day = cycle > 0 ? Math.max(0, Math.sin(lap * Math.PI)) : 0.75;
  const sky = `rgb(${Math.round(mix(40, 150, day))},${Math.round(mix(44, 190, day))},${Math.round(mix(90, 220, day))})`;
  return (
    <g>
      <rect x={-1400} y={-900} width={4800} height={2900} fill="#7a4a3e" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={-200 + (i % 10) * 240 + (Math.floor(i / 10) % 2) * 120} y={60 + Math.floor(i / 10) * 70} width={220} height={60} rx={4} fill="#86554a" opacity={0.6} />
      ))}
      {/* the window and the counter-sun crossing it */}
      <rect x={1180} y={120} width={420} height={300} rx={10} fill={sky} stroke="#3b2f2a" strokeWidth={16} />
      <g>
        <clipPath id="kl-win"><rect x={1180} y={120} width={420} height={300} /></clipPath>
        <g clipPath="url(#kl-win)">
          <g transform={`translate(${mix(1120, 1660, lap)} ${300 - 150 * Math.sin(lap * Math.PI)})`}>
            <rect x={-44} y={-24} width={88} height={48} rx={8} fill={INK} stroke={PAPER} strokeWidth={3} />
            {[0, 1, 2].map((k) => <rect key={k} x={-38 + k * 27} y={-18} width={22} height={36} rx={3} fill={CRIMSON} opacity={0.85} />)}
          </g>
          <rect x={1180} y={360} width={420} height={60} fill="#5a4a60" />
        </g>
      </g>
      <line x1={1390} y1={120} x2={1390} y2={420} stroke="#3b2f2a" strokeWidth={10} />
      {/* the shelf of radios */}
      <rect x={160} y={330} width={760} height={18} fill="#5b4636" stroke={INK} strokeWidth={4} />
      <Radio x={260} y={330} s={0.9} c="#a8774e" />
      <Radio x={430} y={330} s={0.8} c="#8a9a6a" open />
      <Radio x={590} y={330} s={0.95} c="#c9935f" />
      <Radio x={780} y={330} s={0.85} c="#7a8aa8" open />
      {/* the floor and the bench */}
      <rect x={-1400} y={ROOM_FLOOR - 70} width={4800} height={900} fill="#5b4a3e" />
      <rect x={200} y={BENCH_TOP} width={1300} height={26} rx={6} fill="#a8774e" stroke={INK} strokeWidth={6} />
      <rect x={240} y={BENCH_TOP + 26} width={22} height={ROOM_FLOOR - BENCH_TOP - 40} fill="#5b4636" />
      <rect x={1440} y={BENCH_TOP + 26} width={22} height={ROOM_FLOOR - BENCH_TOP - 40} fill="#5b4636" />
    </g>
  );
};

/** Lamps in pieces and a soldering iron on the bench top (drawn in front of the figures' hands). */
export const BenchClutter: React.FC<{ frame: number; smoke?: boolean }> = ({ frame, smoke = true }) => (
  <g>
    <path d={`M300 ${BENCH_TOP} L320 ${BENCH_TOP - 70} L380 ${BENCH_TOP - 70} L400 ${BENCH_TOP}Z`} fill="#e8c27a" stroke={INK} strokeWidth={4} />
    <circle cx={350} cy={BENCH_TOP - 14} r={14} fill="#fff6dc" stroke={INK} strokeWidth={3} />
    <path d={`M430 ${BENCH_TOP - 6} q40 -30 80 -4 t80 0`} fill="none" stroke="#efe6d2" strokeWidth={6} />
    <rect x={1240} y={BENCH_TOP - 18} width={130} height={14} rx={6} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
    <line x1={1240} y1={BENCH_TOP - 11} x2={1190} y2={BENCH_TOP - 14} stroke="#c9ced6" strokeWidth={5} strokeLinecap="round" />
    {smoke && [0, 1].map((i) => (
      <path key={i} d={`M${1190 - i * 6} ${BENCH_TOP - 24 - ((frame * 1.4 + i * 22) % 44)} q-8 -12 0 -22`} fill="none" stroke="#e8e2d2" strokeWidth={3} opacity={0.6} />
    ))}
  </g>
);

/** Little music notes popping out of a radio at (x, y) (it works). */
export const Notes: React.FC<{ frame: number; x: number; y: number; at: number }> = ({ frame, x, y, at }) => {
  if (frame < at) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = ((frame - at + i * 12) % 36) / 36;
        return (
          <g key={i} transform={`translate(${x + i * 26 + t * 40} ${y - t * 90})`} opacity={1 - t}>
            <circle r={9} fill={INK} /><line x1={8} y1={0} x2={8} y2={-30} stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

/** The long drawing of the plug's insides on the bench, drawn up to `grow` (0..1): wires, a fuse, the counter's little
 *  box, all in ink and teal, no words. (x, y) is its left top; it lies flat as a long sheet. */
export const PlugDrawing: React.FC<{ x: number; y: number; w: number; h: number; grow: number; held?: boolean }> = ({ x, y, w, h, grow, held }) => {
  const shown = Math.max(0, Math.min(1, grow));
  const n = 9;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={6} y={8} width={w} height={h} rx={6} fill="#000" opacity={0.2} />
      <rect x={0} y={0} width={w} height={h} rx={6} fill={PAPER} stroke="#cdbfa6" strokeWidth={4} />
      <clipPath id={`kl-draw-${held ? 1 : 0}`}><rect x={0} y={0} width={w * shown} height={h} /></clipPath>
      <g clipPath={`url(#kl-draw-${held ? 1 : 0})`}>
        <path d={`M20 ${h * 0.5} ${Array.from({ length: n }, (_, i) => `Q${(i + 0.5) * (w / n)} ${h * (i % 2 ? 0.2 : 0.8)} ${(i + 1) * (w / n)} ${h * 0.5}`).join(" ")}`} fill="none" stroke={TEAL} strokeWidth={5} />
        <path d={`M20 ${h * 0.62} H${w - 20}`} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="12 8" />
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(${(i + 0.5) * (w / n)} ${h * 0.5})`}>
            {i % 3 === 0 && <rect x={-16} y={-12} width={32} height={24} rx={4} fill="none" stroke={INK} strokeWidth={3} />}
            {i % 3 === 1 && <circle r={12} fill="none" stroke={CRIMSON} strokeWidth={3} />}
            {i % 3 === 2 && <path d="M-14 8 L-6 -10 L2 8 L10 -10" fill="none" stroke={INK} strokeWidth={3} />}
          </g>
        ))}
        <g transform={`translate(${w - 50} ${h * 0.5})`}>
          <rect x={-20} y={-14} width={34} height={28} rx={6} fill="none" stroke={INK} strokeWidth={4} />
          <path d="M14 -6 h14 M14 6 h14" stroke={INK} strokeWidth={4} />
        </g>
      </g>
    </g>
  );
};

/** The price card (a coin, a car, a flat, a street; the first three crossed out, the street circled at `circle`) and
 *  your pay slip sliding in beside it at `slip` (one small drawing of a desk). Screen-sized world coordinates. */
export const PriceAndSlip: React.FC<{ frame: number; at: number; circle: number; slip: number }> = ({ frame, at, circle, slip }) => {
  const c = ramp(frame, circle, circle + 14);
  const s = ramp(frame, slip, slip + 12);
  const items = [
    <g key="coin"><circle r={34} fill={MUSTARD} stroke={INK} strokeWidth={4} /><circle r={20} fill="none" stroke={INK} strokeWidth={3} /></g>,
    <g key="car"><rect x={-60} y={-22} width={120} height={34} rx={10} fill={CRIMSON} stroke={INK} strokeWidth={4} /><path d="M-36 -22 L-20 -44 H22 L38 -22" fill="#f3e9d7" stroke={INK} strokeWidth={4} /><circle cx={-34} cy={14} r={12} fill={INK} /><circle cx={34} cy={14} r={12} fill={INK} /></g>,
    <g key="flat"><rect x={-40} y={-50} width={80} height={90} fill="#c9b07a" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((r) => [0, 1].map((cx) => <rect key={`${r}${cx}`} x={-28 + cx * 34} y={-40 + r * 28} width={20} height={18} fill="#5a6a86" />))}</g>,
    <g key="street">{[0, 1, 2, 3].map((i) => <g key={i}><polygon points={`${-110 + i * 56},-10 ${-84 + i * 56},-40 ${-58 + i * 56},-10`} fill="#7a4b3a" stroke={INK} strokeWidth={3} /><rect x={-108 + i * 56} y={-10} width={48} height={50} fill={["#e8b98a", "#d79c7a", "#c9b07a", "#e2c8a0"][i]} stroke={INK} strokeWidth={3} /></g>)}</g>,
  ];
  return (
    <g>
      <Sheet frame={frame} at={at} x={760} y={540} w={560} h={820} tilt={-2}>
        {items.map((it, i) => (
          <g key={i} transform={`translate(280 ${120 + i * 190})`}>
            {it}
            {i < 3 && <path d="M-130 30 L130 -30 M-130 -30 L130 30" stroke={CRIMSON} strokeWidth={9} strokeLinecap="round" />}
          </g>
        ))}
        {c > 0 && <ellipse cx={280} cy={690} rx={170 * c} ry={80 * c} fill="none" stroke={CRIMSON} strokeWidth={8} transform="rotate(-4 280 690)" />}
      </Sheet>
      {frame >= slip && (
        <g transform={`translate(${mix(1900, 1300, s)} ${mix(700, 660, s)}) rotate(${mix(20, 6, s)})`}>
          <rect x={-130} y={-90} width={260} height={180} rx={8} fill="#000" opacity={0.25} transform="translate(8 10)" />
          <rect x={-130} y={-90} width={260} height={180} rx={8} fill="#e9f0e6" stroke="#9fb39a" strokeWidth={4} />
          <rect x={-104} y={-66} width={120} height={10} rx={4} fill={INK} opacity={0.6} />
          <rect x={-104} y={-46} width={80} height={10} rx={4} fill={INK} opacity={0.6} />
          <g transform="translate(40 40) scale(0.7)">
            <rect x={-60} y={-20} width={120} height={14} rx={4} fill="#7a5d47" stroke={INK} strokeWidth={4} />
            <rect x={-50} y={-6} width={10} height={50} fill="#5b4636" /><rect x={40} y={-6} width={10} height={50} fill="#5b4636" />
            <path d="M20 -20 v-34 M8 -54 h28 l-8 -14 h-12z" stroke={INK} strokeWidth={4} fill="#ffd27a" />
          </g>
        </g>
      )}
    </g>
  );
};

/** A big mitten of a hand (mustard, your colour) at (x, y), turned `angle`. */
const Hand: React.FC<{ x: number; y: number; angle: number; flip?: boolean }> = ({ x, y, angle, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-150} y={-46} width={120} height={92} rx={30} fill="#3b3e47" stroke={INK} strokeWidth={6} />
    <path d="M-40 -56 Q40 -66 70 -24 Q86 0 70 26 Q40 66 -40 56 Z" fill={HERO.head} stroke={INK} strokeWidth={6} />
    <path d="M10 -58 Q40 -94 60 -64" fill={HERO.head} stroke={INK} strokeWidth={6} />
    {[-24, -6, 12].map((dy) => <path key={dy} d={`M30 ${dy} q20 6 36 0`} fill="none" stroke={INK} strokeWidth={4} opacity={0.4} />)}
  </g>
);

/** Close on your hands at the desk: the lamp cord (cream) and the kettle lead (black) twisted into one, `twist` 0..1,
 *  the hands turning against each other at `speed`; a knife beside them; `plug` shows the finished homemade plug. */
export const HandsInsert: React.FC<{ frame: number; twist: number; speed: number; plug?: boolean }> = ({ frame, twist, speed, plug }) => {
  const turn = Math.sin(frame * 0.35 * speed) * 16;
  const strand = (phase: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const x = 400 + i * 28;
      const local = Math.max(0, Math.min(1, (twist * 40 - i) / 6 + 0.5));
      const amp = mix(60, 14, local) * (i < 4 ? 1 : 1);
      const y = 560 + Math.sin(i * mix(0.08, 0.9, local) + phase + frame * 0.15 * speed * local) * amp + (phase ? 40 : -40) * (1 - local);
      pts.push(`${i ? "L" : "M"}${x} ${y}`);
    }
    return pts.join(" ");
  };
  return (
    <g>
      <rect x={-1400} y={-900} width={4800} height={2900} fill="#3a2a22" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-1400} y={-200 + i * 170} width={4800} height={6} fill="#000" opacity={0.15} />)}
      <g transform="translate(1340 820) rotate(-14)">
        <rect x={-110} y={-12} width={130} height={24} rx={6} fill="#c9ced6" stroke={INK} strokeWidth={4} />
        <rect x={20} y={-16} width={110} height={32} rx={10} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      </g>
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${560 + i * 160 + noise(i) * 40} ${780 + noise(i + 3) * 60} q10 -8 22 0`} stroke="#d9873a" strokeWidth={4} fill="none" />
      ))}
      {!plug && (
        <>
          <path d={strand(0)} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
          <path d={strand(0)} fill="none" stroke="#2b2f3d" strokeWidth={10} strokeLinecap="round" />
          <path d={strand(Math.PI)} fill="none" stroke={INK} strokeWidth={15} strokeLinecap="round" />
          <path d={strand(Math.PI)} fill="none" stroke="#efe6d2" strokeWidth={9} strokeLinecap="round" />
          <path d="M1530 545 l40 -12 M1530 560 l46 2 M1530 575 l40 14" stroke="#d9873a" strokeWidth={5} strokeLinecap="round" />
          <Hand x={560} y={570} angle={-8 + turn} />
          <Hand x={1300} y={560} angle={8 - turn} flip />
        </>
      )}
      {plug && (
        <>
          <Hand x={760} y={600} angle={-10} />
          <HomePlug x={1000} y={540} angle={-8} scale={3.2} />
        </>
      )}
    </g>
  );
};

/** Her hand behind her back counting seconds: a hand with `n` fingers up (1..5). Drawn at (x, y), `s` scale. */
export const CountingHand: React.FC<{ x: number; y: number; n: number; s?: number; color: string }> = ({ x, y, n, s = 1, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 5 }, (_, i) => {
      const up = i < n;
      const a = -40 + i * 20;
      return <rect key={i} x={-7} y={up ? -64 : -34} width={14} height={up ? 52 : 22} rx={7} fill={color} stroke={INK} strokeWidth={3} transform={`rotate(${a} 0 0)`} />;
    })}
    <circle r={26} fill={color} stroke={INK} strokeWidth={4} />
  </g>
);

/** The plain kettle lead held up beside the drawing: a lead with a plug. (Used for "a lamp cord with opinions".) */
export const LooseLead: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g>
    <path d={`M${x} ${y} q-10 60 4 120 t-6 110`} fill="none" stroke="#efe6d2" strokeWidth={7} transform={`rotate(${Math.sin(frame / 9) * 4} ${x} ${y})`} />
    <LeadPlug x={x} y={y - 6} angle={-90} color="#efe6d2" />
  </g>
);

/** The kettle and its plain lead, small (a prop for the teaching inset). */
export const SmallKettle: React.FC<{ x: number; y: number }> = ({ x, y }) => <Kettle x={x} y={y} scale={0.9} />;

/** How far the drawing has grown at `frame` across [from, to], in visible jumps (a sun crossing per jump). */
export const growth = (frame: number, from: number, to: number) => {
  const t = linear(frame, from, to);
  return interpolate(Math.floor(t * 12) + ramp(frame, from + Math.floor(t * 12) * ((to - from) / 12), from + (Math.floor(t * 12) + 0.6) * ((to - from) / 12)), [0, 12], [0.05, 1], { extrapolateRight: "clamp" });
};
