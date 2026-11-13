// The Night Shift's facts, drawn on paper (style.md, "Facts are drawn"): each is the inside of a <PaperInsert> sheet,
// in the sheet's own coordinates (1240 x 800). No words: shapes, a clock, a mouse, a maze, a cabinet, a boy.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { GHOST, linear, mix, noise, PASTELS, ramp } from "../shared";
import { Draw } from "./NightShift.Rig";

const NAVY = "#2b3560";
const circlePath = (cx: number, cy: number, r: number) => `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`;
const polar = (cx: number, cy: number, r: number, deg: number) => ({ x: cx + r * Math.sin((deg * Math.PI) / 180), y: cy - r * Math.cos((deg * Math.PI) / 180) });

/** A sleeping head, side on: a mustard (or any) circle with shut eyes and the band. */
const SleepyHead: React.FC<{ x: number; y: number; r: number; head?: string; band?: boolean }> = ({ x, y, r, head = MUSTARD, band = true }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={head} stroke={INK} strokeWidth={3} />
    <path d={`M${x - r * 0.5} ${y} q${r * 0.18} ${r * 0.16} ${r * 0.36} 0 M${x + r * 0.1} ${y} q${r * 0.18} ${r * 0.16} ${r * 0.36} 0`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    {band && <path d={`M${x - r * 0.95} ${y - r * 0.45} Q${x} ${y - r * 0.75} ${x + r * 0.95} ${y - r * 0.45}`} fill="none" stroke="#1b1d24" strokeWidth={r * 0.14} strokeLinecap="round" />}
    {band && <circle cx={x + r * 0.5} cy={y - r * 0.62} r={r * 0.13} fill={GHOST.light} stroke="#1b1d24" strokeWidth={2} />}
  </g>
);

// ---------------------------------------------------------------- a third of your life

/** A paper clock draws itself, then a third of its face shades dark, with a little sleeping head inside the dark. */
export const ClockSheet: React.FC<{ frame: number; at: number; shade: readonly [number, number] }> = ({ frame, at, shade }) => {
  const C = { x: 620, y: 410, r: 290 };
  const s = ramp(frame, shade[0], shade[1]) * 120;
  const a = polar(C.x, C.y, C.r - 8, s);
  return (
    <g>
      {s > 0.5 && <path d={`M${C.x} ${C.y} L${C.x} ${C.y - C.r + 8} A${C.r - 8} ${C.r - 8} 0 0 1 ${a.x} ${a.y}Z`} fill={NAVY} />}
      <Draw d={circlePath(C.x, C.y, C.r)} t={linear(frame, at + 4, at + 26)} w={10} />
      {Array.from({ length: 12 }, (_, i) => {
        const p = polar(C.x, C.y, C.r - 24, i * 30);
        const q = polar(C.x, C.y, C.r - (i % 3 ? 44 : 64), i * 30);
        return <Draw key={i} d={`M${p.x} ${p.y}L${q.x} ${q.y}`} t={linear(frame, at + 18 + i, at + 24 + i)} w={i % 3 ? 5 : 9} color={s > i * 30 + 5 && i * 30 < 120 ? PAPER : INK} />;
      })}
      <Draw d={`M${C.x} ${C.y}L${C.x - 110} ${C.y + 60}`} t={linear(frame, at + 30, at + 38)} w={12} />
      <Draw d={`M${C.x} ${C.y}L${C.x + 40} ${C.y - 200}`} t={linear(frame, at + 34, at + 42)} w={8} />
      <circle cx={C.x} cy={C.y} r={14} fill={INK} opacity={frame > at + 30 ? 1 : 0} />
      {s > 60 && (
        <g opacity={ramp(frame, mix(shade[0], shade[1], 0.5), shade[1])}>
          <SleepyHead x={polar(C.x, C.y, 175, 62).x} y={polar(C.x, C.y, 175, 62).y} r={44} />
          <path d={`M${C.x + 100} ${C.y - 210} a34 34 0 1 0 30 50 a26 26 0 1 1 -30 -50Z`} fill="#f3ead2" />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- the mouse brain washing

/** A paper mouse asleep; a callout on its brain: the cells, the gaps between them widening, a tide washing through and
 *  carrying the dark specks away. */
export const MouseSheet: React.FC<{ frame: number; at: number; widen: readonly [number, number]; tide: readonly [number, number] }> = ({ frame, at, widen, tide }) => {
  const draw = linear(frame, at + 4, at + 30);
  const w = ramp(frame, widen[0], widen[1]);
  const C = { x: 860, y: 400, r: 300 };
  const tideX = mix(C.x - C.r - 360, C.x + C.r + 380, linear(frame, tide[0], tide[1]));
  const cells: { x: number; y: number; k: number }[] = [];
  for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) cells.push({ x: C.x + i * 112 + (j % 2 ? 56 : 0), y: C.y + j * 98, k: i * 7 + j * 3 });
  const r = 48 * (1 - 0.32 * w);
  const show = ramp(frame, at + 28, at + 44);
  return (
    <g>
      {/* the mouse, asleep */}
      <Draw d="M440 560 C430 470 330 430 240 450 C170 465 130 520 160 590 C190 640 420 650 440 560Z" t={draw} w={6} fill="#cfc8bc" />
      <Draw d="M240 455 C200 400 120 410 95 470 C80 510 120 540 170 540" t={draw} w={6} fill="#cfc8bc" />
      <Draw d={circlePath(205, 420, 34)} t={draw} w={5} fill="#e9b8b0" />
      <Draw d="M440 560 C520 600 560 680 470 700 C420 712 400 680 430 660" t={draw} w={5} />
      <path d="M120 478 q12 9 24 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={draw} />
      <circle cx={92} cy={488} r={8} fill="#e98a9a" opacity={draw} />
      <ellipse cx={175} cy={455} rx={34} ry={22} fill="#f3c6cf" stroke={INK} strokeWidth={3} opacity={show} />
      {/* the callout */}
      <g opacity={show}>
        <path d={`M200 440 L${C.x - C.r * 0.9} ${C.y - 120} M200 470 L${C.x - C.r * 0.85} ${C.y + 150}`} stroke={INK} strokeWidth={3} strokeDasharray="10 10" />
        <clipPath id="ns-mouse-call"><circle cx={C.x} cy={C.y} r={C.r} /></clipPath>
        <g clipPath="url(#ns-mouse-call)">
          <rect x={C.x - C.r} y={C.y - C.r} width={C.r * 2} height={C.r * 2} fill="#efe1c6" />
          <rect x={tideX - 380} y={C.y - C.r} width={380} height={C.r * 2} fill="#9fd4ea" opacity={0.55} />
          <path d={`M${tideX} ${C.y - C.r} ${Array.from({ length: 8 }, (_, i) => `Q${tideX + 40} ${C.y - C.r + (i + 0.5) * 75} ${tideX} ${C.y - C.r + (i + 1) * 75}`).join(" ")}`} fill="none" stroke="#5aa8c8" strokeWidth={6} opacity={tideX > C.x - C.r && tideX < C.x + C.r + 40 ? 0.8 : 0} />
          {cells.map((c, i) => {
            const sx = c.x + 56;
            const sy = c.y + 49;
            const off = Math.min(1, Math.max(0, (tideX - sx) / 180));
            return <ellipse key={`s${i}`} cx={sx + off * 300} cy={sy + Math.sin(i) * 10 * off} rx={8} ry={6} fill="#4a3a2a" opacity={0.8 * (1 - off)} />;
          })}
          {cells.map((c, i) => (
            <ellipse key={i} cx={c.x} cy={c.y} rx={r * 1.08} ry={r * 0.92} transform={`rotate(${(c.k * 23) % 180} ${c.x} ${c.y})`} fill="#f3c6cf" stroke={INK} strokeWidth={4} />
          ))}
        </g>
        <circle cx={C.x} cy={C.y} r={C.r} fill="none" stroke={INK} strokeWidth={8} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- 1924: forgot less after sleeping

/** Two paper people at a desk, one asleep on it, one awake and yawning; over each a cloud of six things they learned.
 *  As the little clock turns, the awake one's things fall away; the sleeper keeps nearly all. */
export const MemorySheet: React.FC<{ frame: number; at: number; loss: readonly [number, number] }> = ({ frame, at, loss }) => {
  const p = linear(frame, loss[0], loss[1]);
  const draw = linear(frame, at + 4, at + 24);
  const things = (cx: number, cy: number, lost: number[]) => (
    <g>
      <Draw d={circlePath(cx, cy, 120)} t={draw} w={5} />
      {Array.from({ length: 6 }, (_, i) => {
        const at2 = lost.indexOf(i);
        const f = at2 < 0 ? 0 : linear(p, [0.15, 0.4, 0.6, 0.82][at2], [0.15, 0.4, 0.6, 0.82][at2] + 0.12);
        const x = cx - 60 + (i % 3) * 60;
        const y = cy - 26 + Math.floor(i / 3) * 56 + f * 170;
        return <rect key={i} x={x - 20} y={y - 20} width={40} height={40} rx={8} fill={[TEAL, MUSTARD, "#d8344f", "#7fa0c4", "#7fc29b", "#b58fc7"][i]} stroke={INK} strokeWidth={3}
          opacity={draw * (1 - f)} transform={`rotate(${f * 70} ${x} ${y})`} />;
      })}
    </g>
  );
  const asleep: Pose = { ...SEATED, lean: 62, tilt: 30, armF: [100, 30], armB: [90, 40] };
  const awake: Pose = { ...SEATED, tilt: -14, armB: [150, 120], armF: [30, 50] };
  return (
    <g opacity={ramp(frame, at + 2, at + 12)}>
      <rect x={260} y={600} width={720} height={18} rx={4} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <path d="M290 618 V740 M950 618 V740" stroke={INK} strokeWidth={8} />
      <Figure x={420} y={650 + 112 * 0.9} scale={0.9} pose={asleep} head={PASTELS[0]} coat="#5a4a3f" blink mouth="smile" />
      <Figure x={820} y={650 + 112 * 0.9} scale={0.9} facing={-1} pose={awake} head={PASTELS[3]} coat="#3f4a5c" mouth="open" lids={0.55} brows="flat" />
      {things(430, 250, [4])}
      {things(830, 250, [0, 2, 3, 5])}
      <circle cx={630} cy={150} r={44} fill={PAPER} stroke={INK} strokeWidth={5} opacity={draw} />
      <line x1={630} y1={150} x2={polar(630, 150, 34, p * 360).x} y2={polar(630, 150, 34, p * 360).y} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={draw} />
    </g>
  );
};

// ---------------------------------------------------------------- rats: the maze replayed at double speed

const MAZE_PATH: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [3, 1], [3, 0], [4, 0], [5, 0], [5, 1], [4, 1], [4, 2], [5, 2], [5, 3]];
const MAZE_OPEN = new Set(["1,2|2,2", "3,2|3,3", "3,3|4,3", "3,1|3,2"]);

/** The maze's walls as one path, `cell` px a cell, origin (ox, oy), 6 x 4 cells. */
function mazeWalls(ox: number, oy: number, cell: number) {
  const open = new Set(MAZE_OPEN);
  for (let i = 1; i < MAZE_PATH.length; i++) {
    const [a, b] = [MAZE_PATH[i - 1], MAZE_PATH[i]].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    open.add(`${a[0]},${a[1]}|${b[0]},${b[1]}`);
  }
  let d = `M${ox} ${oy + cell}V${oy + 4 * cell}H${ox + 6 * cell - cell}M${ox + 6 * cell} ${oy + 3 * cell}V${oy}H${ox}`;
  for (let x = 0; x < 6; x++) for (let y = 0; y < 4; y++) {
    if (x < 5 && !open.has(`${x},${y}|${x + 1},${y}`)) d += `M${ox + (x + 1) * cell} ${oy + y * cell}v${cell}`;
    if (y < 3 && !open.has(`${x},${y}|${x},${y + 1}`)) d += `M${ox + x * cell} ${oy + (y + 1) * cell}h${cell}`;
  }
  return d;
}

/** A point p (0..1) along the maze's solution, and the direction there. */
function mazeAt(ox: number, oy: number, cell: number, p: number) {
  const n = MAZE_PATH.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, p * n));
  const i = Math.floor(f);
  const t = f - i;
  const [a, b] = [MAZE_PATH[i], MAZE_PATH[i + 1]];
  const x = ox + (mix(a[0], b[0], t) + 0.5) * cell;
  const y = oy + (mix(a[1], b[1], t) + 0.5) * cell;
  return { x, y, angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
}

const Rat: React.FC<{ x: number; y: number; angle: number; s?: number; asleep?: boolean }> = ({ x, y, angle, s = 1, asleep }) => (
  <g transform={`translate(${x} ${y}) rotate(${asleep ? 0 : angle}) scale(${s})`}>
    {asleep ? (
      <g>
        <path d="M30 10 C60 20 50 46 10 40" fill="none" stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={10} rx={40} ry={26} fill="#b9b4ab" stroke={INK} strokeWidth={4} />
        <circle cx={-30} cy={2} r={16} fill="#b9b4ab" stroke={INK} strokeWidth={4} />
        <circle cx={-26} cy={-14} r={9} fill="#e9b8b0" stroke={INK} strokeWidth={3} />
        <path d="M-40 2 q5 4 10 0" fill="none" stroke={INK} strokeWidth={3} />
      </g>
    ) : (
      <g>
        <path d="M-24 0 C-50 -4 -60 14 -76 8" fill="none" stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={0} rx={28} ry={16} fill="#b9b4ab" stroke={INK} strokeWidth={4} />
        <path d="M22 -10 L44 0 L22 10Z" fill="#b9b4ab" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={18} cy={-12} r={8} fill="#e9b8b0" stroke={INK} strokeWidth={3} />
        <circle cx={32} cy={-3} r={3} fill={INK} />
      </g>
    )}
  </g>
);

/** A rat runs the maze; then it sleeps beside it, and over its head the same maze plays back at double speed. */
export const MazeSheet: React.FC<{ frame: number; at: number; run: readonly [number, number]; sleep: number; replay: readonly [number, number] }> = ({ frame, at, run, sleep, replay }) => {
  const M = { x: 110, y: 220, cell: 84 };
  const asleep = frame >= sleep;
  const pos = mazeAt(M.x, M.y, M.cell, linear(frame, run[0], run[1]));
  const B = { x: 900, y: 300, r: 210 };
  const m = { x: B.x - 3 * 46, y: B.y - 2 * 46, cell: 46 };
  const lap = linear(frame, replay[0], replay[1]) * 2;
  const dot = mazeAt(m.x, m.y, m.cell, lap % 1 || (lap >= 2 ? 1 : 0));
  const show = ramp(frame, sleep, sleep + 12);
  return (
    <g>
      <Draw d={mazeWalls(M.x, M.y, M.cell)} t={linear(frame, at + 4, at + 30)} w={8} />
      {!asleep && <Rat x={pos.x} y={pos.y} angle={pos.angle} s={0.9} />}
      {/* the day's trail */}
      <path d={Array.from({ length: 40 }, (_, i) => { const q = mazeAt(M.x, M.y, M.cell, (i / 39) * linear(frame, run[0], run[1])); return `${i ? "L" : "M"}${q.x} ${q.y}`; }).join("")}
        fill="none" stroke={TEAL} strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" opacity={0.6} />
      {asleep && (
        <g opacity={show}>
          <Rat x={900} y={650} angle={0} s={1.5} asleep />
          <circle cx={870} cy={570} r={12} fill={PAPER} stroke={INK} strokeWidth={3} />
          <circle cx={880} cy={535} r={18} fill={PAPER} stroke={INK} strokeWidth={3} />
          <circle cx={B.x} cy={B.y} r={B.r} fill={PAPER} stroke={INK} strokeWidth={5} />
          <path d={mazeWalls(m.x, m.y, m.cell)} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          {frame >= replay[0] && <circle cx={dot.x} cy={dot.y} r={12} fill={GHOST.light} stroke={INK} strokeWidth={3} />}
          {frame >= replay[0] && <circle cx={dot.x} cy={dot.y} r={26} fill={GHOST.light} opacity={0.3} />}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- your day, a filing cabinet

const PageIcon: React.FC<{ i: number }> = ({ i }) => {
  switch (i % 5) {
    case 0: return <g><circle cx={-8} cy={-6} r={10} fill="none" stroke={INK} strokeWidth={4} /><path d="M2 -6 H22 M16 -6 v8" stroke={INK} strokeWidth={4} /></g>;
    case 1: return <g><circle cx={0} cy={-4} r={16} fill={PASTELS[i % 8]} stroke={INK} strokeWidth={3} /><circle cx={-5} cy={-6} r={2.5} fill={INK} /><circle cx={6} cy={-6} r={2.5} fill={INK} /></g>;
    case 2: return <g><rect x={-12} y={-24} width={24} height={40} fill="#8a5a3a" stroke={INK} strokeWidth={3} /><circle cx={6} cy={-2} r={3} fill={MUSTARD} /></g>;
    case 3: return <g><rect x={-22} y={-18} width={44} height={26} rx={6} fill={MUSTARD} stroke={INK} strokeWidth={3} /><circle cx={-12} cy={10} r={5} fill={INK} /><circle cx={12} cy={10} r={5} fill={INK} /></g>;
    default: return <path d="M-14 -16 L-10 12 H10 L14 -16Z" fill="#f7f4ee" stroke={INK} strokeWidth={3} />;
  }
};

const Page: React.FC<{ x: number; y: number; rot: number; i: number; s?: number }> = ({ x, y, rot, i, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-36} y={-46} width={72} height={92} rx={4} fill="#fffaf0" stroke={INK} strokeWidth={3} />
    <g transform="translate(0 -6)"><PageIcon i={i} /></g>
    <rect x={-24} y={26} width={48} height={6} rx={3} fill={INK} opacity={0.35} />
  </g>
);

/** The filing cabinet: the drawers fly open, the day's pages whirl in on fast forward; then it is shut and the pages
 *  fall to the floor, unfiled. */
export const CabinetSheet: React.FC<{ frame: number; at: number; open: readonly [number, number]; whirl: readonly [number, number];
  shut: number; fall: readonly [number, number] }> = ({ frame, at, open, whirl, shut, fall }) => {
  const K = { x: 620, top: 170, w: 320, h: 480 };
  const floor = K.top + K.h;
  const o = ramp(frame, open[0], open[1]) * (1 - ramp(frame, shut, shut + 5));
  const N = 18;
  const pages: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const born = mix(whirl[0], whirl[1], i / N);
    const t = (frame - born) / 12;
    if (frame < shut && t > 0 && t < 1) {
      const a = (1 - t) * 540 + i * 40;
      const rr = (1 - t) * 420;
      const tx = K.x;
      const ty = K.top + 40 + (i % 3) * (K.h / 3);
      pages.push(<Page key={i} x={tx + rr * Math.cos((a * Math.PI) / 180)} y={ty + rr * 0.6 * Math.sin((a * Math.PI) / 180)} rot={a} i={i} s={1 - 0.5 * t} />);
    }
    if (frame >= fall[0]) {
      const ft = ramp(frame, mix(fall[0], fall[1], (i % 9) / 12), mix(fall[0], fall[1], (i % 9) / 12 + 0.3));
      const rx = 140 + noise(i + 3) * 960;
      const restY = floor - 8 - noise(i + 5) * 40 + (i > 8 ? 60 : 0);
      if (Math.abs(rx - K.x) < K.w / 2 + 30 && i <= 8) continue;
      pages.push(<Page key={`f${i}`} x={rx + Math.sin(ft * 6 + i) * 30 * (1 - ft)} y={mix(40, restY, ft)} rot={mix(i * 40, (noise(i) - 0.5) * 70 + 90 * (i % 2), ft)} i={i} s={0.9} />);
    }
  }
  return (
    <g>
      <Draw d={`M60 ${floor} H1180`} t={linear(frame, at + 2, at + 16)} w={5} />
      <Draw d={`M${K.x - K.w / 2} ${floor} V${K.top} H${K.x + K.w / 2} V${floor}`} t={linear(frame, at + 6, at + 24)} w={7} fill="#8a96a8" />
      {[0, 1, 2].map((d) => {
        const y = K.top + 20 + d * (K.h / 3);
        const dy = o * 26 * (d === 1 ? 1.2 : 1);
        return (
          <g key={d} opacity={linear(frame, at + 16 + d * 3, at + 24 + d * 3)}>
            {o > 0.05 && <rect x={K.x - K.w / 2 + 16} y={y - 4} width={K.w - 32} height={22 + dy} fill="#3a3f4c" />}
            <rect x={K.x - K.w / 2 + 14 - o * 12} y={y + dy} width={K.w - 28 + o * 24} height={K.h / 3 - 30} rx={6} fill="#a9b3c2" stroke={INK} strokeWidth={5} />
            <rect x={K.x - 40} y={y + dy + 40} width={80} height={18} rx={9} fill={INK} />
          </g>
        );
      })}
      {pages}
    </g>
  );
};

// ---------------------------------------------------------------- the boy at the science fair

/** A boy at a science-fair table (a three-panel board of drawings, no words), a paper clock on the wall behind him
 *  gaining a tick a day, eleven in all; his lids fall and his head goes over as they come. */
export const FairSheet: React.FC<{ frame: number; at: number; ticks: readonly [number, number] }> = ({ frame, at, ticks }) => {
  const p = linear(frame, ticks[0], ticks[1]);
  const n = Math.min(11, Math.floor(p * 11.999));
  const C = { x: 930, y: 230, r: 140 };
  const pose: Pose = { ...STAND, lean: -2 + n * 0.8, tilt: n * 2.2, armF: [20 + n, 30], armB: [-10, 20] };
  return (
    <g opacity={ramp(frame, at + 2, at + 12)}>
      <circle cx={C.x} cy={C.y} r={C.r} fill={PAPER} stroke={INK} strokeWidth={6} />
      {Array.from({ length: n }, (_, i) => {
        const a = polar(C.x, C.y, C.r - 18, (i + 1) * 30);
        const b = polar(C.x, C.y, C.r - 52, (i + 1) * 30);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d8344f" strokeWidth={8} strokeLinecap="round" />;
      })}
      <line x1={C.x} y1={C.y} x2={polar(C.x, C.y, 90, n * 30).x} y2={polar(C.x, C.y, 90, n * 30).y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      {/* the boy behind the table */}
      <Figure x={730} y={720} scale={1.05} pose={pose} head={PASTELS[5]} coat="#3d6fb0" cap="#c0392b" eyes={1}
        lids={Math.min(0.75, n * 0.07)} brows={n > 6 ? "sad" : "none"} mouth={n > 8 ? "wobble" : n > 4 ? "flat" : "smile"} look={{ x: 0.3, y: 0.2 + n * 0.03 }} />
      {/* the table and the three-panel board */}
      <rect x={260} y={560} width={560} height={20} rx={4} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <rect x={270} y={580} width={540} height={150} fill={TEAL} stroke={INK} strokeWidth={4} />
      <path d="M300 560 L280 380 L380 400 L380 560Z" fill="#f7f4ee" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={380} y={360} width={200} height={200} fill="#f7f4ee" stroke={INK} strokeWidth={4} />
      <path d="M580 560 L580 400 L680 380 L660 560Z" fill="#f7f4ee" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M440 420 a28 28 0 1 0 30 44 a22 22 0 1 1 -30 -44Z" fill={MUSTARD} stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((i) => <rect key={i} x={410 + i * 50} y={540 - (3 - i) * 26} width={32} height={(3 - i) * 26} fill={["#7fa0c4", "#e6a0a0", "#7fc29b"][i]} stroke={INK} strokeWidth={3} />)}
      <circle cx={330} cy={470} r={22} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={630} cy={460} r={16} fill={INK} />
    </g>
  );
};
