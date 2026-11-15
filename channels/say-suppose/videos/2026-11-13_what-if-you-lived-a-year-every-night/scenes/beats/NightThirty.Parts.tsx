// Night Thirty's town pieces (v7): the walking crowd of the inside town at market speed (with the city in it now: a
// bride, a surgeon, kids), the paper tally on the sky (a night's thin crimson line beside a year's teal wall, thirty
// times, no digits), the town's post office (a letter in, a clerk who thinks a year and grows a beard, a book out), and
// a wordless speech bubble (a squiggle for a word nobody needs to read). World coordinates, drawn for REF like the town
// set. Crowd keeps its v5 signature: CityPlugsIn.Train imports it.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { TOWN_FLOOR } from "../sets/InsideTown";
import { headAt } from "../parts";
import { blinking, mix, noise, PASTELS, ramp } from "../shared";

const COATS = ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#3b3e47", "#6a5a4c", "#2f4a5a"];
const SURGEON = "#5f9e8a";

/** A street full of people walking both ways at market speed (sped up), smaller further back. `rows` deep. `city` dresses
 *  some of them as the faces from the city montage: a bride with a veil, a surgeon in a cap, kids. */
export const Crowd: React.FC<{ frame: number; n?: number; rows?: number; speed?: number; seed?: number; hats?: boolean; city?: boolean }> = ({
  frame, n = 14, rows = 2, speed = 1, seed = 0, hats, city,
}) => (
  <g>
    {Array.from({ length: rows }, (_, r) => {
      const base = 0.62 + r * 0.2;
      const y = TOWN_FLOOR - 40 + r * 40 - (rows - 1) * 40;
      return Array.from({ length: n }, (_, i) => {
        const id = i + r * 50 + seed * 7;
        const kind = city ? id % 7 : -1;
        const scale = kind === 4 ? base * 0.7 : base;
        const dir = noise(id) > 0.5 ? 1 : -1;
        const v = (3 + noise(id + 3) * 4) * speed;
        const span = 2800;
        const x = ((((noise(id + 9) * span + dir * frame * v) % span) + span) % span) - 400;
        const pose = walkPose(frame * 0.5 * speed + id);
        const h = headAt(x, y, scale, pose, dir as 1 | -1);
        const coat = kind === 0 ? "#f3efe6" : kind === 2 ? SURGEON : COATS[id % COATS.length];
        return (
          <g key={`${r}-${i}`}>
            {kind === 0 && <path d={`M${h.x - dir * h.r * 0.2} ${h.y - h.r * 0.9} Q${h.x - dir * h.r * 2.2} ${h.y + h.r} ${h.x - dir * h.r * 1.6} ${h.y + h.r * 3.6} L${h.x - dir * h.r * 0.4} ${h.y + h.r * 1.4} Z`} fill="#fff" opacity={0.75} />}
            <Figure x={x} y={y} scale={scale} facing={dir as 1 | -1} pose={pose} head={PASTELS[id % PASTELS.length]} coat={coat}
              cap={kind === 2 ? SURGEON : undefined} time={frame} blink={blinking(frame, id)} mouth={hats || noise(id + 1) > 0.5 ? "smile" : "none"} />
            {kind === 0 && <circle cx={h.x} cy={h.y - h.r * 0.95} r={h.r * 0.28} fill="#fff" stroke={INK} strokeWidth={2} />}
            {hats && <Hat x={h.x} y={h.y - h.r * 0.75} r={h.r} kind={(id + Math.floor(frame / 5)) % 4} color={PASTELS[(id * 5 + Math.floor(frame / 5)) % PASTELS.length]} />}
          </g>
        );
      });
    })}
  </g>
);

/** A hat sitting on a head of radius r whose crown is at (x, y): top hat, wide brim, beret or cone. */
export const Hat: React.FC<{ x: number; y: number; r: number; kind: number; color: string }> = ({ x, y, r, kind, color }) => (
  <g transform={`translate(${x} ${y}) scale(${r / 46})`}>
    {kind === 0 && <><rect x={-30} y={-80} width={60} height={70} rx={4} fill={color} stroke={INK} strokeWidth={4} /><rect x={-48} y={-14} width={96} height={12} rx={5} fill={color} stroke={INK} strokeWidth={4} /></>}
    {kind === 1 && <><ellipse cx={0} cy={-8} rx={78} ry={14} fill={color} stroke={INK} strokeWidth={4} /><path d="M-32 -10 Q-30 -50 0 -50 Q30 -50 32 -10Z" fill={color} stroke={INK} strokeWidth={4} /></>}
    {kind === 2 && <ellipse cx={8} cy={-16} rx={50} ry={22} fill={color} stroke={INK} strokeWidth={4} transform="rotate(-12)" />}
    {kind === 3 && <path d="M-36 -6 L0 -100 L36 -6Z" fill={color} stroke={INK} strokeWidth={4} />}
  </g>
);

/** The tally drawn on the sky (REF coordinates, for a Deep layer at 0.5): a cream paper band, and night by night a thin
 *  crimson line (eight hours out here) beside a tall teal wall (a year in there), up to thirty. No digits. */
export const SkyTally: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  if (frame < from) return null;
  const nights = Math.max(1, Math.round(30 * ramp(frame, from, to)));
  const open = ramp(frame, from, from + 12);
  const x0 = 228, step = 49, base = 340;
  return (
    <g>
      <rect x={x0 - 30} y={base - 108} width={(30 * step + 40) * open} height={124} rx={10} fill={PAPER} stroke="#cdbfa6" strokeWidth={4} opacity={0.94} />
      {Array.from({ length: nights }, (_, i) => {
        const x = x0 + i * step;
        const grow = ramp(frame, from + (i * (to - from)) / 30, from + (i * (to - from)) / 30 + 8);
        return (
          <g key={i}>
            <rect x={x} y={base - 4} width={8} height={4} fill={CRIMSON} />
            <rect x={x + 12} y={base - 86 * grow} width={26} height={86 * grow} rx={3} fill={TEAL} stroke={INK} strokeWidth={2.5} />
            {grow > 0.9 && [1, 2, 3].map((k) => <line key={k} x1={x + 12} x2={x + 38} y1={base - k * 21} y2={base - k * 21} stroke={INK} strokeWidth={1.5} opacity={0.35} />)}
          </g>
        );
      })}
      <line x1={x0 - 12} y1={base} x2={x0 + 30 * step} y2={base} stroke={INK} strokeWidth={4} opacity={open} />
    </g>
  );
};

/** The town's post office: a front with a counter hatch, a clerk behind it, a crimson post box beside it. A letter goes
 *  into the slot at `letter`; the clerk thinks a year over `think` (hand on chin, a grey beard growing), and a fat book
 *  slides out of the hatch at `book`. */
export const PostOffice: React.FC<{ frame: number; letter: number; book: number; think?: [number, number] }> = ({ frame, letter, book, think }) => {
  const base = TOWN_FLOOR - 60;
  const lt = ramp(frame, letter, letter + 14);
  const bt = ramp(frame, book, book + 12);
  const th = think ? ramp(frame, think[0], think[1]) : 0;
  const thinking = think !== undefined && frame >= think[0] && frame < book;
  const pose = thinking ? { ...STAND, armF: [150, 60] as [number, number] } : { ...STAND, armF: [mix(30, 80, bt), mix(20, 10, bt)] as [number, number] };
  const ch = headAt(870, 760, 0.95, pose);
  return (
    <g>
      <rect x={560} y={300} width={800} height={base - 300} fill="#c9b07a" stroke={INK} strokeWidth={6} />
      <polygon points={`540,300 960,180 1380,300`} fill="#7a4b3a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={760} y={330} width={400} height={50} rx={8} fill={CRIMSON} stroke={INK} strokeWidth={5} />
      <path d="M800 345 h40 l-20 14z M820 345 v20" fill="none" stroke={PAPER} strokeWidth={4} opacity={0.8} />
      <rect x={720} y={480} width={300} height={220} rx={10} fill="#3a3550" stroke={INK} strokeWidth={6} />
      <Figure x={870} y={760} scale={0.95} head={PASTELS[6]} coat="#2f4a5a" pose={pose}
        time={frame} blink={blinking(frame, 4)} mouth={frame >= book ? "smile" : thinking ? "flat" : "flat"} brows={thinking ? "flat" : "none"}
        lids={thinking ? 0.35 : 0} look={thinking ? { x: 0.3, y: -0.8 } : { x: 0.8, y: 0.2 }} />
      {th > 0 && (
        <path d={`M${ch.x - ch.r * 0.7} ${ch.y + ch.r * 0.55} Q${ch.x + ch.r * 0.15} ${ch.y + ch.r * (0.9 + 1.8 * th)} ${ch.x + ch.r * 0.9} ${ch.y + ch.r * 0.55} Q${ch.x + ch.r * 0.15} ${ch.y + ch.r * 0.95} ${ch.x - ch.r * 0.7} ${ch.y + ch.r * 0.55}Z`}
          fill="#a9a59c" stroke={INK} strokeWidth={3} />
      )}
      <rect x={704} y={706} width={332} height={base - 706} fill="#c9b07a" />
      <rect x={700} y={690} width={340} height={30} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
      <rect x={1150} y={560} width={120} height={base - 560} rx={20} fill={CRIMSON} stroke={INK} strokeWidth={6} />
      <rect x={1170} y={600} width={80} height={12} rx={6} fill={INK} />
      {frame >= letter && lt < 1 && (
        <g transform={`translate(${mix(1420, 1210, lt)} ${mix(480, 606, lt)}) rotate(${mix(-30, 0, lt)})`}>
          <rect x={-40} y={-24} width={80} height={48} fill={PAPER} stroke={INK} strokeWidth={3} />
          <path d="M-40 -24 L0 4 L40 -24" fill="none" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {frame >= book && bt < 1 && <FatBook x={mix(880, 1040, bt)} y={690} />}
    </g>
  );
};

/** A fat teal book, a year's answer to one email, its bottom centre at (x, y). */
export const FatBook: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({ x, y, scale = 1, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-74} y={-110} width={148} height={110} rx={6} fill={TEAL} stroke={INK} strokeWidth={5} />
    <rect x={-66} y={-102} width={14} height={94} fill="#157a71" />
    {Array.from({ length: 7 }, (_, i) => <line key={i} x1={74} y1={-100 + i * 14} x2={74} y2={-92 + i * 14} stroke={PAPER} strokeWidth={5} />)}
    <rect x={-40} y={-80} width={90} height={12} rx={5} fill={PAPER} opacity={0.8} />
  </g>
);

/** A wordless speech bubble: a squiggle of ink instead of a word. (x, y) is the tail's tip; `side` mirrors it. */
export const InkBubble: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; side?: 1 | -1; size?: number; sparkle?: boolean }> = ({
  frame, at, until, x, y, side = 1, size = 1, sparkle,
}) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = Math.min(1, (frame - at) / 6) * size;
  return (
    <g transform={`translate(${x} ${y}) scale(${side * s} ${s})`}>
      <path d="M0 0 L30 -46 L70 -46 Z" fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={10} y={-150} width={200} height={110} rx={50} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={34} y={-50} width={50} height={12} fill={PAPER} />
      <path d="M48 -96 q16 -24 32 0 t32 0 t32 0" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      {sparkle && <path d="M196 -150 l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6z" fill="#f2b632" stroke={INK} strokeWidth={3} />}
    </g>
  );
};
