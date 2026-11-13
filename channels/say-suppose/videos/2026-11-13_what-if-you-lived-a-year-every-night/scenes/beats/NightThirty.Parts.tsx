// Night Thirty's pieces: the walking crowd of the inside town (sped up), the bench, the grave with its paper flower, the
// worn street, the tally sheet (a night's thin strip against a year's wall, thirty times, then ninety-nine of a
// hundred), the far window onto the flat's kitchen, and the town's post office (a letter in, a book out). World
// coordinates, drawn for REF like the town set.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { TOWN_FLOOR } from "../sets/InsideTown";
import { headAt } from "../parts";
import { blinking, FLATMATE, mix, noise, PASTELS, ramp } from "../shared";

const COATS = ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#3b3e47", "#6a5a4c", "#2f4a5a"];

/** A street full of people walking both ways at market speed (sped up), smaller further back. `rows` deep. */
export const Crowd: React.FC<{ frame: number; n?: number; rows?: number; speed?: number; seed?: number; hats?: boolean }> = ({
  frame, n = 14, rows = 2, speed = 1, seed = 0, hats,
}) => (
  <g>
    {Array.from({ length: rows }, (_, r) => {
      const scale = 0.62 + r * 0.2;
      const y = TOWN_FLOOR - 40 + r * 40 - (rows - 1) * 40;
      return Array.from({ length: n }, (_, i) => {
        const id = i + r * 50 + seed * 7;
        const dir = noise(id) > 0.5 ? 1 : -1;
        const v = (3 + noise(id + 3) * 4) * speed;
        const span = 2800;
        const x = ((((noise(id + 9) * span + dir * frame * v) % span) + span) % span) - 400;
        const h = headAt(x, y, scale, walkPose(frame * 0.5 * speed + id), dir as 1 | -1);
        return hats ? (
          <g key={`${r}-${i}`}>
            <Figure x={x} y={y} scale={scale} facing={dir as 1 | -1} pose={walkPose(frame * 0.5 * speed + id)} head={PASTELS[id % PASTELS.length]}
              coat={COATS[id % COATS.length]} time={frame} blink={blinking(frame, id)} mouth="smile" />
            <Hat x={h.x} y={h.y - h.r * 0.75} r={h.r} kind={(id + Math.floor(frame / 7)) % 4} color={PASTELS[(id * 5 + Math.floor(frame / 7)) % PASTELS.length]} />
          </g>
        ) : (
          <Figure key={`${r}-${i}`} x={x} y={y} scale={scale} facing={dir as 1 | -1} pose={walkPose(frame * 0.5 * speed + id)}
            head={PASTELS[id % PASTELS.length]} coat={COATS[id % COATS.length]} time={frame} blink={blinking(frame, id)}
            mouth={noise(id + 1) > 0.6 ? "smile" : "none"} />
        );
      });
    })}
  </g>
);

/** A hat sitting on a head of radius r whose crown is at (x, y): top hat, wide brim, beret or cone. */
const Hat: React.FC<{ x: number; y: number; r: number; kind: number; color: string }> = ({ x, y, r, kind, color }) => (
  <g transform={`translate(${x} ${y}) scale(${r / 46})`}>
    {kind === 0 && <><rect x={-30} y={-80} width={60} height={70} rx={4} fill={color} stroke={INK} strokeWidth={4} /><rect x={-48} y={-14} width={96} height={12} rx={5} fill={color} stroke={INK} strokeWidth={4} /></>}
    {kind === 1 && <><ellipse cx={0} cy={-8} rx={78} ry={14} fill={color} stroke={INK} strokeWidth={4} /><path d="M-32 -10 Q-30 -50 0 -50 Q30 -50 32 -10Z" fill={color} stroke={INK} strokeWidth={4} /></>}
    {kind === 2 && <ellipse cx={8} cy={-16} rx={50} ry={22} fill={color} stroke={INK} strokeWidth={4} transform="rotate(-12)" />}
    {kind === 3 && <path d="M-36 -6 L0 -100 L36 -6Z" fill={color} stroke={INK} strokeWidth={4} />}
  </g>
);

/** A plain park bench, seat top at (x, top), `w` wide. */
export const Bench: React.FC<{ x: number; top: number; w?: number }> = ({ x, top, w = 520 }) => (
  <g>
    <rect x={x - w / 2} y={top - 120} width={w} height={20} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    <rect x={x - w / 2} y={top - 80} width={w} height={20} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    <rect x={x - w / 2 - 10} y={top - 6} width={w + 20} height={20} rx={6} fill="#a8774e" stroke={INK} strokeWidth={4} />
    {[-1, 1].map((s) => <rect key={s} x={x + s * (w / 2 - 20) - 7} y={top + 14} width={14} height={TOWN_FLOOR - 60 - top - 14} fill="#3b3e47" />)}
  </g>
);

/** A small grave on a grass mound with a paper flower at its foot. */
export const Grave: React.FC<{ x: number; frame: number }> = ({ x, frame }) => {
  const base = TOWN_FLOOR - 60;
  const sway = Math.sin(frame / 20) * 3;
  return (
    <g>
      <ellipse cx={x} cy={base} rx={190} ry={30} fill="#6f8f5a" stroke={INK} strokeWidth={4} />
      <path d={`M${x - 70} ${base - 4} V${base - 150} Q${x} ${base - 220} ${x + 70} ${base - 150} V${base - 4}Z`} fill="#a9a59c" stroke={INK} strokeWidth={6} />
      <path d={`M${x - 36} ${base - 130} H${x + 36} M${x - 30} ${base - 104} H${x + 30}`} stroke="#7d7a72" strokeWidth={6} strokeLinecap="round" />
      <g transform={`rotate(${sway} ${x + 110} ${base})`}>
        <line x1={x + 110} y1={base} x2={x + 110} y2={base - 90} stroke="#4a7a4a" strokeWidth={6} />
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={x + 110} cy={base - 108} rx={10} ry={20} fill={CRIMSON} stroke={INK} strokeWidth={3} transform={`rotate(${a} ${x + 110} ${base - 90}) translate(0 0)`} />)}
        <circle cx={x + 110} cy={base - 90} r={9} fill={PAPER} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

/** The street worn smooth where you walk: a pale band down the middle of the cobbles. */
export const WornStreet: React.FC = () => (
  <g>
    {Array.from({ length: 60 }, (_, i) => (
      <rect key={i} x={-600 + (i % 20) * 140 + (Math.floor(i / 20) % 2) * 70} y={TOWN_FLOOR - 50 + Math.floor(i / 20) * 34} width={120} height={26} rx={8}
        fill="#a8957c" stroke="#8d7a62" strokeWidth={3} />
    ))}
    <path d={`M-600 ${TOWN_FLOOR - 4} H2600 V${TOWN_FLOOR + 30} H-600Z`} fill="#e4d6bd" opacity={0.75} />
  </g>
);

/** The tally on paper (sheet coordinates, 0..1300 by 0..760), no digits: a night's thin strip against a year's wall;
 *  thirty nights of both; then a hundred squares, ninety-nine of them in there. */
export const Tally: React.FC<{ frame: number; thin: number; wall: number; month: number; monthEnd: number; grid: number }> = ({
  frame, thin, wall, month, monthEnd, grid,
}) => {
  const tt = ramp(frame, thin, thin + 12);
  const wt = ramp(frame, wall, wall + 22);
  const nights = Math.max(1, Math.round(30 * ramp(frame, month, monthEnd)));
  if (frame >= grid) {
    const on = Math.round(99 * ramp(frame, grid, grid + 40));
    return (
      <g>
        {Array.from({ length: 100 }, (_, i) => {
          const fill = i === 99 ? "#fffaf0" : i < on ? TEAL : "#efe4cf";
          return <rect key={i} x={400 + (i % 10) * 52} y={120 + Math.floor(i / 10) * 52} width={44} height={44} rx={6} fill={fill} stroke={INK} strokeWidth={3} />;
        })}
        {on >= 99 && <circle cx={400 + 9 * 52 + 22} cy={120 + 9 * 52 + 22} r={34} fill="none" stroke={CRIMSON} strokeWidth={6} />}
      </g>
    );
  }
  return (
    <g>
      <line x1={80} y1={680} x2={1220} y2={680} stroke={INK} strokeWidth={5} />
      {/* night one: the thin strip and the wall */}
      {frame < month ? (
        <g>
          <rect x={300} y={680 - 10 * tt} width={60} height={10 * tt} fill={CRIMSON} stroke={INK} strokeWidth={3} />
          <rect x={720} y={680 - 560 * wt} width={240} height={560 * wt} fill={TEAL} stroke={INK} strokeWidth={4} />
          {Array.from({ length: Math.floor(12 * wt) }, (_, i) => <line key={i} x1={720} y1={680 - i * 46.7} x2={960} y2={680 - i * 46.7} stroke={INK} strokeWidth={2} opacity={0.4} />)}
        </g>
      ) : (
        <g>
          {Array.from({ length: nights }, (_, i) => (
            <g key={i}>
              <rect x={100 + i * 36} y={672} width={28} height={8} fill={CRIMSON} />
              <rect x={100 + i * 36} y={680 - 520} width={28} height={512} fill={TEAL} stroke={INK} strokeWidth={2} opacity={0.9} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

/** The far window: a dark wall at dusk with one window in it, and through it, small and far, the flat's kitchen by
 *  lamp, her lilac head at the table. Drawn in REF coordinates. */
export const FarWindow: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <defs>
      <linearGradient id="nt-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9466" /><stop offset="1" stopColor="#6b5a9c" /></linearGradient>
      <clipPath id="nt-win"><rect x={700} y={300} width={520} height={400} rx={10} /></clipPath>
    </defs>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="url(#nt-dusk)" />
    <g clipPath="url(#nt-win)">
      {/* the kitchen, tiny and far */}
      <rect x={700} y={300} width={520} height={400} fill="#c9a77a" />
      <rect x={700} y={560} width={520} height={140} fill="#8a6a4a" />
      <line x1={960} y1={300} x2={960} y2={440} stroke={INK} strokeWidth={3} />
      <path d="M935 440 L985 440 L1000 466 L920 466Z" fill="#e6a23c" stroke={INK} strokeWidth={3} />
      <circle cx={960} cy={500} r={120} fill="#ffe2a6" opacity={0.35} />
      <rect x={880} y={560} width={160} height={10} fill="#6a4630" />
      <rect x={890} y={570} width={6} height={50} fill="#6a4630" /><rect x={1024} y={570} width={6} height={50} fill="#6a4630" />
      <circle cx={900} cy={522} r={16} fill={FLATMATE.head} stroke={INK} strokeWidth={2} />
      <rect x={890} y={536} width={20} height={30} rx={6} fill={FLATMATE.coat} />
      <rect x={1040} y={500} width={8} height={60} fill="#7a5a40" /><rect x={1000} y={540} width={44} height={6} fill="#7a5a40" />
      <rect x={1150} y={330} width={50} height={230} fill="#f3e9d7" opacity={0.85} />
      {/* the dusk light on the glass */}
      <path d="M760 700 L880 300" stroke="#fff" strokeWidth={30} opacity={0.08 + 0.03 * Math.sin(frame / 30)} />
    </g>
    <path d="M-1400 -900 H3400 V2000 H-1400Z M700 300 V700 H1220 V300Z" fillRule="evenodd" fill="#5a4a5e" />
    <rect x={700} y={300} width={520} height={400} rx={10} fill="none" stroke="#3b2f3e" strokeWidth={24} />
    <line x1={960} y1={300} x2={960} y2={700} stroke="#3b2f3e" strokeWidth={14} />
    <rect x={680} y={700} width={560} height={26} rx={6} fill="#4a3c4e" stroke={INK} strokeWidth={4} />
  </g>
);

/** The town's post office: a front with a counter hatch, a clerk behind it, a crimson post box beside it. A letter goes
 *  into the slot at `letter`; a book comes back out of the hatch at `book`. */
export const PostOffice: React.FC<{ frame: number; letter: number; book: number }> = ({ frame, letter, book }) => {
  const base = TOWN_FLOOR - 60;
  const lt = ramp(frame, letter, letter + 14);
  const bt = ramp(frame, book, book + 16);
  return (
    <g>
      <rect x={560} y={300} width={800} height={base - 300} fill="#c9b07a" stroke={INK} strokeWidth={6} />
      <polygon points={`540,300 960,180 1380,300`} fill="#7a4b3a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={760} y={330} width={400} height={50} rx={8} fill={CRIMSON} stroke={INK} strokeWidth={5} />
      <rect x={720} y={480} width={300} height={220} rx={10} fill="#3a3550" stroke={INK} strokeWidth={6} />
      {/* the clerk behind the hatch */}
      <Figure x={870} y={760} scale={0.95} head={PASTELS[6]} coat="#2f4a5a" pose={{ ...STAND, armF: [mix(30, 80, bt), mix(20, 10, bt)] }}
        time={frame} blink={blinking(frame, 4)} mouth={frame >= book ? "smile" : "flat"} brows="none" look={{ x: 0.6, y: 0.2 }} />
      <rect x={704} y={706} width={332} height={base - 706} fill="#c9b07a" />
      <rect x={700} y={690} width={340} height={30} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
      {/* the post box and its slot */}
      <rect x={1150} y={560} width={120} height={base - 560} rx={20} fill={CRIMSON} stroke={INK} strokeWidth={6} />
      <rect x={1170} y={600} width={80} height={12} rx={6} fill={INK} />
      {frame >= letter && lt < 1 && (
        <g transform={`translate(${mix(1420, 1210, lt)} ${mix(480, 606, lt)}) rotate(${mix(-30, 0, lt)})`}>
          <rect x={-40} y={-24} width={80} height={48} fill={PAPER} stroke={INK} strokeWidth={3} />
          <path d="M-40 -24 L0 4 L40 -24" fill="none" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {frame >= book && (
        <g transform={`translate(${mix(880, 980, bt)} ${mix(700, 690, bt)})`}>
          <rect x={-70} y={-52} width={140} height={52} rx={4} fill={TEAL} stroke={INK} strokeWidth={4} />
          <rect x={-62} y={-44} width={124} height={8} fill={PAPER} opacity={0.7} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={70} y1={-46 + i * 12} x2={70} y2={-40 + i * 12} stroke={PAPER} strokeWidth={4} />)}
        </g>
      )}
    </g>
  );
};
