// Helpers for "The loan" (Loan.tsx): the college canteen, Dev's family dinner under one lamp, the props (notes, the bike
// key with the cracked cover, the bounced payment on your phone, the thali), Dev's mother and sister, the thought
// bubble and the paper diagram of the 1959 experiment. World coordinates for a <Stage> slot, like parts.tsx. Also
// `talk()`, the mouth of someone speaking, used by Midpoint.tsx and Cost.tsx too.
import { interpolate } from "remotion";
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { joints, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Headphones, headAt } from "../parts";
import { DEV, noise, PASTELS } from "../shared";
import { Chair, Deep } from "../sets/common";

// ------------------------------------------------------------------------------------------------ speaking

/** The mouth of someone speaking between `from` and `to` (not lip-sync: a few shapes changing about every 4 frames),
 *  `rest` outside it. */
export function talk(frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth {
  if (frame < from || frame >= to) return rest;
  const shapes: Mouth[] = ["open", rest === "smile" ? "smile" : "flat", "o", "open", rest];
  return shapes[Math.floor(noise(Math.floor(frame / 4)) * shapes.length)];
}

// ------------------------------------------------------------------------------------------------ the props

export const NOTE = "#b9d7a8";

/** One banknote, upright in a hand (centred). */
export const Note: React.FC<{ x?: number; y?: number; scale?: number; tilt?: number }> = ({ x = 0, y = 0, scale = 1, tilt = -18 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-32} y={-16} width={64} height={32} rx={3} fill={NOTE} stroke={INK} strokeWidth={3} />
    <ellipse cx={8} cy={0} rx={10} ry={9} fill="#d9ebcf" stroke="#7a9a6c" strokeWidth={2} />
    <rect x={-26} y={-8} width={16} height={4} rx={2} fill="#7a9a6c" />
  </g>
);

/** A fold of notes in a hand, fanned (n notes, at most 8 drawn). */
export const Fold: React.FC<{ n: number; scale?: number }> = ({ n, scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    {Array.from({ length: Math.min(8, n) }, (_, i) => <Note key={i} x={i * 2} y={-i * 2} tilt={-30 + i * 6} />)}
  </g>
);

/** A pile of notes lying on a table, base centre at (x, y): n slabs. */
export const Pile: React.FC<{ x: number; y: number; n: number; scale?: number }> = ({ x, y, n, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-34 + (noise(i + 3) - 0.5) * 8} y={-5 * (i + 1)} width={68} height={6} rx={2} fill={NOTE} stroke={INK} strokeWidth={1.6} />
    ))}
  </g>
);

/** Dev's bike key standing on the table, base at (x, y): a round black head with a crack across it, a steel blade. */
export const BikeKey: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={10} y={-12} width={40} height={10} rx={3} fill="#c9ced6" stroke={INK} strokeWidth={2.5} />
    <path d="M36 -2 v4 h5 v-4 M44 -2 v3" stroke={INK} strokeWidth={2} fill="none" />
    <circle cx={-6} cy={-18} r={18} fill="#2b2e38" stroke={INK} strokeWidth={3} />
    <path d="M-20 -26 L-10 -20 L-14 -12 L-2 -8 L2 -1" fill="none" stroke="#c7ccd6" strokeWidth={2.4} strokeLinejoin="round" />
    <circle cx={-12} cy={-28} r={4} fill="none" stroke="#9aa1ab" strokeWidth={2.4} />
    <circle cx={-30} cy={-26} r={9} fill="none" stroke="#9aa1ab" strokeWidth={3} />
  </g>
);

/** A paper cup, base at (x, y). */
const Cup: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-15 0 L-19 -40 H19 L15 0Z" fill="#f6f1e6" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <rect x={-20} y={-44} width={40} height={6} rx={3} fill="#c98a4b" />
  </g>
);

/** A steel plate seen from the side with rice and dal on it, centred on its rim at (x, y). */
const Plate: React.FC<{ x: number; y: number; food?: number }> = ({ x, y, food = 1 }) => (
  <g>
    <ellipse cx={x} cy={y} rx={42} ry={8} fill="#c9ced6" stroke={INK} strokeWidth={3} />
    {food > 0 && <ellipse cx={x - 8} cy={y - 5} rx={22 * food} ry={8 * food} fill="#f3e9d7" />}
    {food > 0 && <ellipse cx={x + 18} cy={y - 4} rx={11 * food} ry={5 * food} fill="#e0a23c" />}
  </g>
);

/** A thali: a steel plate with three small bowls and a roti, centred on the rim at (x, y). */
export const Thali: React.FC<{ x: number; y: number; scale?: number; eaten?: number }> = ({ x, y, scale = 1, eaten = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={58} ry={10} fill="#c9ced6" stroke={INK} strokeWidth={3} />
    {[[-30, "#e0a23c"], [-6, "#5aa04a"], [18, "#f6f1e6"]].map(([dx, c]) => (
      <g key={dx as number}>
        <path d={`M${(dx as number) - 11} -4 Q${dx as number} 8 ${(dx as number) + 11} -4Z`} fill="#b9bfc8" stroke={INK} strokeWidth={2} />
        <ellipse cx={dx as number} cy={-4} rx={11} ry={3} fill={c as string} />
      </g>
    ))}
    {eaten < 0.9 && <ellipse cx={40} cy={-5} rx={16 * (1 - eaten * 0.6)} ry={5} fill="#e8c27a" stroke="#b98d4a" strokeWidth={2} />}
  </g>
);

// ------------------------------------------------------------------------------------------------ the canteen

/** The canteen blocking: you at the left facing right, Dev at the right facing left, both seated at S. */
export const CANTEEN = {
  floor: 960,
  seat: 893,
  you: 760,
  dev: 1160,
  table: { from: 800, to: 1120, top: 840 },
  phone: { x: 820, y: 838 },
  yourPlate: 878,
  devPlate: 1085,
  key: { x: 968, y: 838 },
  pileFrom: 1030,
  pileTo: 918,
} as const;

/** The canteen behind the actors: a dusk window, a tiled lower wall, the serving hatch with steel pots and steam, a
 *  chalk menu board (bars, no words), a tube light, far tables with students. */
export const CanteenBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.4} flat>
      <rect x={-1400} y={-800} width={4800} height={1700} fill="#e9cfa6" />
      <rect x={-1400} y={560} width={4800} height={360} fill="#a9cbb4" />
      {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1400 + i * 120} y1={560} x2={-1400 + i * 120} y2={920} stroke="#8fb39c" strokeWidth={3} />)}
      <rect x={-1400} y={552} width={4800} height={10} fill="#7fa08b" />
      {/* the dusk window */}
      <rect x={60} y={160} width={480} height={320} rx={8} fill="#f0a072" stroke="#7a5a40" strokeWidth={14} />
      <rect x={60} y={340} width={480} height={140} fill="#9a6fa0" opacity={0.7} />
      <circle cx={420} cy={330} r={46} fill="#ffd38a" />
      <path d="M300 160 V480 M60 320 H540" stroke="#7a5a40" strokeWidth={10} />
      {/* the menu board: chalk bars */}
      <rect x={700} y={140} width={420} height={230} rx={8} fill="#2f4a3a" stroke="#7a5a40" strokeWidth={12} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={730} y={170 + i * 32} width={150 + noise(i) * 120} height={10} rx={5} fill={PAPER} opacity={0.75} />)}
      {Array.from({ length: 6 }, (_, i) => <rect key={`p${i}`} x={1040} y={170 + i * 32} width={50} height={10} rx={5} fill={PAPER} opacity={0.75} />)}
      {/* the serving hatch */}
      <rect x={1300} y={260} width={620} height={300} fill="#3b3330" stroke="#7a5a40" strokeWidth={12} />
      {[1390, 1560, 1740].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 70} 470 V400 H${x + 70} V470Z`} fill="#c9ced6" stroke={INK} strokeWidth={4} />
          <ellipse cx={x} cy={400} rx={70} ry={12} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
          {[0, 1].map((s) => {
            const p = ((frame / 70 + i * 0.3 + s * 0.5) % 1);
            return <circle key={s} cx={x + Math.sin(p * 6 + i) * 14} cy={380 - p * 120} r={14 + p * 18} fill="#fff" opacity={0.35 * (1 - p)} />;
          })}
        </g>
      ))}
      <rect x={1280} y={540} width={660} height={30} fill="#c9ced6" stroke={INK} strokeWidth={5} />
      <rect x={-1400} y={70} width={4800} height={14} fill="#fdfaf1" opacity={0.9} />
      <rect x={760} y={92} width={420} height={16} rx={8} fill="#fffbe8" />
    </Deep>
    <Deep cam={cam} depth={0.65} flat>
      {/* far tables with students eating */}
      {[180, 1500].map((tx, t) => (
        <g key={tx}>
          {[-1, 1].map((side, i) => (
            <Figure key={side} x={tx + side * 150} y={980} scale={0.62} facing={(-side) as 1 | -1}
              pose={{ lean: 6, tilt: 0, armB: [40, 40], armF: [55, 50 + Math.sin(frame / 11 + t + i) * 12], legB: [88, -88], legF: [92, -92], drop: 0 }}
              head={PASTELS[(t * 2 + i + 1) % PASTELS.length]} look={{ x: 0.6, y: 0.3 }} mouth={noise(Math.floor(frame / 25) + t * 7 + i) > 0.6 ? "open" : "smile"} time={frame} />
          ))}
          <rect x={tx - 130} y={860} width={260} height={14} rx={4} fill="#9fbcc9" stroke={INK} strokeWidth={4} />
          <rect x={tx - 110} y={874} width={10} height={86} fill="#8a92a2" /><rect x={tx + 100} y={874} width={10} height={86} fill="#8a92a2" />
        </g>
      ))}
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={CANTEEN.floor - 20} width={4800} height={700} fill="#b9b39f" />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={-1300 + noise(i) * 4400} cy={960 + noise(i + 40) * 120} r={4} fill="#8f8a78" />)}
    </Deep>
  </>
);

/** The canteen table for the actors' slot, over the sitters' legs, with the plates, the cups, the bike key and your
 *  phone. `lit` lights the phone's screen (0..1); `children` sit on the top (the pile of notes). */
export const CanteenTable: React.FC<{ lit?: number; children?: React.ReactNode }> = ({ lit = 0, children }) => {
  const t = CANTEEN.table;
  return (
    <g>
      <Cup x={935} y={t.top - 6} />
      <Cup x={1032} y={t.top - 6} />
      <rect x={t.from} y={t.top} width={t.to - t.from} height={18} rx={4} fill="#9fbcc9" stroke={INK} strokeWidth={5} />
      <rect x={t.from + 10} y={t.top + 18} width={12} height={CANTEEN.floor - t.top - 18} fill="#8a92a2" stroke={INK} strokeWidth={3} />
      <rect x={t.to - 22} y={t.top + 18} width={12} height={CANTEEN.floor - t.top - 18} fill="#8a92a2" stroke={INK} strokeWidth={3} />
      <Plate x={CANTEEN.yourPlate} y={t.top - 2} />
      <Plate x={CANTEEN.devPlate} y={t.top - 2} />
      <BikeKey x={CANTEEN.key.x} y={t.top} scale={0.9} />
      {/* your phone, flat on the table: a thin slab whose screen glows crimson when it lights */}
      <rect x={CANTEEN.phone.x - 26} y={t.top - 7} width={52} height={7} rx={3} fill="#1b1d24" />
      {lit > 0 && <ellipse cx={CANTEEN.phone.x} cy={t.top - 10} rx={46} ry={14} fill={CRIMSON} opacity={0.35 * lit} />}
      {lit > 0 && <rect x={CANTEEN.phone.x - 22} y={t.top - 9} width={44} height={3} rx={1.5} fill="#ffd0d6" opacity={lit} />}
      {children}
    </g>
  );
};

/** The chairs the two of you sit on (draw before the figures). */
export const CanteenChairs: React.FC = () => (
  <>
    <Chair x={CANTEEN.you} y={CANTEEN.seat} scale={1.15} facing={1} color="#8a92a2" />
    <Chair x={CANTEEN.dev} y={CANTEEN.seat} scale={1.15} facing={-1} color="#8a92a2" />
  </>
);

/** Your phone from straight above on the canteen table, big, for the insert: the payment card on the screen, then a
 *  crimson cross that draws itself over it from `cross` (whole-film frames); `lit` 0..1 is the screen. */
export const BouncedPhone: React.FC<{ x: number; y: number; lit: number; cross: number }> = ({ x, y, lit, cross }) => (
  <g>
    <rect x={-1400} y={-1400} width={4800} height={4000} fill="#9fbcc9" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={-200 + noise(i) * 2400} cy={-100 + noise(i + 70) * 1300} r={5} fill="#86a6b4" />)}
    <circle cx={x + 520} cy={y - 180} r={190} fill="#c9ced6" stroke={INK} strokeWidth={6} />
    <circle cx={x + 520} cy={y - 180} r={130} fill="#f3e9d7" />
    <circle cx={x - 470} cy={y + 260} r={70} fill="#f6f1e6" stroke={INK} strokeWidth={5} />
    <circle cx={x - 470} cy={y + 260} r={52} fill="#c98a4b" />
    <g transform={`translate(${x} ${y}) rotate(-8)`}>
      <rect x={-170} y={-320} width={340} height={640} rx={44} fill="#1b1d24" stroke={INK} strokeWidth={6} />
      <rect x={-150} y={-286} width={300} height={572} rx={18} fill={lit > 0.5 ? "#eef1f4" : "#262a36"} />
      <g opacity={lit}>
        <rect x={-150} y={-286} width={300} height={70} rx={18} fill="#d9dee6" />
        <rect x={-120} y={-262} width={130} height={18} rx={9} fill={INK} opacity={0.5} />
        {/* the payment card */}
        <rect x={-120} y={-150} width={240} height={250} rx={22} fill="#ffffff" stroke="#c7ccd6" strokeWidth={4} />
        <circle cx={0} cy={-86} r={36} fill="#e6d7b6" stroke={INK} strokeWidth={4} />
        <path d="M-14 -100 H14 M-14 -88 H14 M-6 -100 Q12 -96 -10 -72" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <rect x={-80} y={-30} width={160} height={20} rx={10} fill={INK} opacity={0.75} />
        <rect x={-60} y={10} width={120} height={14} rx={7} fill={INK} opacity={0.4} />
        <rect x={-50} y={44} width={100} height={14} rx={7} fill={INK} opacity={0.4} />
        <rect x={-120} y={150} width={240} height={60} rx={30} fill={CRIMSON} opacity={0.18} />
      </g>
      <DrawLine d="M-100 -130 L100 80" from={cross} to={cross + 8} color={CRIMSON} width={26} />
      <DrawLine d="M100 -130 L-100 80" from={cross + 6} to={cross + 14} color={CRIMSON} width={26} />
      {/* your thumb at the edge */}
      <path d="M170 160 C230 170 300 230 330 330 L230 380 C210 300 190 250 150 220Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  </g>
);

// ------------------------------------------------------------------------------------------------ Dev and his family

/** Dev: pale green head, his coat, the headphones round his neck. */
export const Dev: React.FC<Omit<FigureProps, "head">> = (p) => (
  <>
    <Figure head={DEV.head} coat={DEV.coat} {...p} />
    <Headphones x={p.x} y={p.y} scale={p.scale ?? 1} pose={p.pose!} facing={p.facing ?? 1} />
  </>
);

export const DEV_MOM = { head: "#e3b48f", coat: "#4f6e5a", bun: "#cfc8bd", pallu: "#c9a24a" } as const;
export const SISTER = { head: "#c4e3a0", coat: "#c96f8f", hair: "#3a2a2a" } as const;

/** Dev's mother: a peach head, a grey bun, a green sari with a gold pallu over the shoulder. */
export const DevMother: React.FC<Omit<FigureProps, "head">> = (p) => {
  const s = p.scale ?? 1, f = p.facing ?? 1, pose = p.pose!;
  const h = headAt(p.x, p.y, s, pose, f);
  const j = joints(pose);
  const nx = p.x + j.neck.x * s * f, ny = p.y + j.neck.y * s;
  return (
    <>
      <circle cx={h.x - f * h.r * 0.7} cy={h.y - h.r * 0.5} r={h.r * 0.4} fill={DEV_MOM.bun} />
      <Figure head={DEV_MOM.head} coat={DEV_MOM.coat} {...p} />
      <path d={`M${nx - f * 14 * s} ${ny} Q${nx + f * 10 * s} ${ny + 40 * s} ${nx + f * 30 * s} ${ny + 96 * s} L${nx + f * 10 * s} ${ny + 104 * s} Q${nx - f * 6 * s} ${ny + 50 * s} ${nx - f * 26 * s} ${ny + 8 * s}Z`}
        fill={DEV_MOM.pallu} stroke={INK} strokeWidth={3 * s} strokeLinejoin="round" />
    </>
  );
};

/** Dev's sister: a light lime head with two dark pigtails, a pink kurta. */
export const Sister: React.FC<Omit<FigureProps, "head">> = (p) => {
  const s = p.scale ?? 1, f = p.facing ?? 1;
  const h = headAt(p.x, p.y, s, p.pose!, f);
  return (
    <>
      {[-1, 1].map((side) => <circle key={side} cx={h.x + side * h.r * 0.95} cy={h.y + h.r * 0.2} r={h.r * 0.3} fill={SISTER.hair} />)}
      <Figure head={SISTER.head} coat={SISTER.coat} {...p} />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the dinner

/** The dinner blocking: Dev at the left facing right, his mother at the right facing left, his sister behind the table
 *  in the middle (smaller, further back). The lamp hangs over the middle; the paper goes on the wall at the right. */
export const DINNER = {
  floor: 960,
  seat: 893,
  dev: 640,
  mother: 1280,
  sister: { x: 960, seat: 872, scale: 0.95 },
  table: { from: 700, to: 1220, top: 840 },
  plates: { dev: 772, sister: 960, mother: 1150 },
  key: { x: 850, y: 838 },
  lamp: { x: 960, y: 390 },
  sheet: { x: 1440, y: 300, w: 740, h: 420 },
} as const;

/** Dev's family room behind the actors: a dark warm wall, a framed photo, a shelf, a night window, the lamp. */
export const DinnerBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => {
  const sway = Math.sin(frame / 40) * 1.2;
  return (
    <>
      <Deep cam={cam} depth={0.5} flat>
        <rect x={-1400} y={-800} width={4800} height={1720} fill="#6b4a40" />
        <rect x={-1400} y={640} width={4800} height={280} fill="#5a3d35" />
        <rect x={-1400} y={632} width={4800} height={10} fill="#4a302a" />
        <rect x={100} y={220} width={330} height={300} rx={8} fill="#1d2440" stroke="#4a302a" strokeWidth={14} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={130 + (i % 3) * 100} y={260 + Math.floor(i / 3) * 80} width={24} height={20} fill="#f5d98a" opacity={noise(i) > 0.4 ? 0.8 : 0.15} />)}
        <path d="M265 220 V520 M100 370 H430" stroke="#4a302a" strokeWidth={10} />
        <rect x={560} y={250} width={150} height={190} rx={4} fill="#c9a77a" stroke="#3a2620" strokeWidth={10} />
        <circle cx={635} cy={320} r={30} fill="#9fd8a8" /><circle cx={600} cy={360} r={22} fill="#e3b48f" />
        <rect x={-1400} y={560} width={1600} height={14} fill="#3a2620" />
      </Deep>
      <Deep cam={cam} depth={1} flat>
        <rect x={-1400} y={DINNER.floor - 20} width={4800} height={700} fill="#4a3228" />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400 + i * 200} y1={DINNER.floor - 20} x2={-1400 + i * 200} y2={1700} stroke="#000" strokeWidth={3} opacity={0.12} />)}
        {/* the one lamp: a cord, a cone shade, the bulb */}
        <g transform={`rotate(${sway} ${DINNER.lamp.x} -400)`}>
          <line x1={DINNER.lamp.x} y1={-400} x2={DINNER.lamp.x} y2={DINNER.lamp.y - 60} stroke="#2a1c18" strokeWidth={5} />
          <path d={`M${DINNER.lamp.x - 30} ${DINNER.lamp.y - 62} L${DINNER.lamp.x - 90} ${DINNER.lamp.y} H${DINNER.lamp.x + 90} L${DINNER.lamp.x + 30} ${DINNER.lamp.y - 62}Z`}
            fill="#c96f2d" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={DINNER.lamp.x} cy={DINNER.lamp.y + 2} rx={34} ry={14} fill="#fff3c4" />
        </g>
      </Deep>
    </>
  );
};

/** The lamp's light falling on the table (the front slot: drawn over the actors, faint). */
export const LampLight: React.FC = () => {
  const l = DINNER.lamp, t = DINNER.table;
  return (
    <g>
      <defs>
        <radialGradient id="loan-lamp" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#fff1c4" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#fff1c4" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M${l.x - 80} ${l.y} L${t.from - 120} ${t.top + 60} H${t.to + 120} L${l.x + 80} ${l.y}Z`} fill="url(#loan-lamp)" />
    </g>
  );
};

/** The dinner table for the actors' slot: three thalis, steel glasses, a pot, the bike key by Dev's plate. */
export const DinnerTable: React.FC<{ eaten?: number }> = ({ eaten = 0 }) => {
  const t = DINNER.table, p = DINNER.plates;
  return (
    <g>
      <rect x={t.from} y={t.top} width={t.to - t.from} height={20} rx={4} fill="#7a4f32" stroke={INK} strokeWidth={5} />
      <rect x={t.from + 16} y={t.top + 20} width={14} height={DINNER.floor - t.top - 20} fill="#5a3a26" stroke={INK} strokeWidth={3} />
      <rect x={t.to - 30} y={t.top + 20} width={14} height={DINNER.floor - t.top - 20} fill="#5a3a26" stroke={INK} strokeWidth={3} />
      <Thali x={p.sister} y={t.top - 6} scale={0.85} />
      <path d={`M1030 ${t.top} Q1022 ${t.top - 56} 1060 ${t.top - 58} Q1098 ${t.top - 56} 1090 ${t.top}Z`} fill="#c9ced6" stroke={INK} strokeWidth={4} />
      {[905, 1215 - 120].map((x) => <rect key={x} x={x - 14} y={t.top - 44} width={28} height={44} rx={5} fill="#c9ced6" stroke={INK} strokeWidth={3} />)}
      <Thali x={p.dev} y={t.top - 2} eaten={eaten} />
      <Thali x={p.mother} y={t.top - 2} />
      <BikeKey x={DINNER.key.x} y={t.top} scale={0.9} />
    </g>
  );
};

/** A thought bubble, popping in at `at`: a paper cloud at (x, y), w x h, with three small puffs trailing down to the
 *  thinker's head at (tx, ty). Children are drawn in the cloud's own coordinates (0..w, 0..h). */
export const ThoughtCloud: React.FC<{
  frame: number; at: number; x: number; y: number; w: number; h: number; tx: number; ty: number; children?: React.ReactNode;
}> = ({ frame, at, x, y, w, h, tx, ty, children }) => {
  if (frame < at) return null;
  const pop = interpolate(frame, [at, at + 12], [0, 1], { extrapolateRight: "clamp" });
  const puffs = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { cx: Math.cos(a) * w * 0.46, cy: Math.sin(a) * h * 0.42, r: Math.min(w, h) * (0.2 + noise(i + 11) * 0.06) };
  });
  const trail = [0.25, 0.5, 0.75].map((p, i) => ({ x: mix2(tx, x - w * 0.3, p), y: mix2(ty, y + h * 0.42, p), r: 8 + i * 6 }));
  return (
    <g>
      {trail.map((p, i) => frame >= at + i * 3 && <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={PAPER} stroke={INK} strokeWidth={4} />)}
      <g transform={`translate(${x} ${y}) scale(${pop})`}>
        {puffs.map((p, i) => <circle key={`s${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={PAPER} stroke={INK} strokeWidth={9} />)}
        <ellipse cx={0} cy={0} rx={w * 0.5} ry={h * 0.44} fill={PAPER} stroke={INK} strokeWidth={9} />
        {puffs.map((p, i) => <circle key={`f${i}`} cx={p.cx} cy={p.cy} r={p.r - 4.5} fill={PAPER} />)}
        <ellipse cx={0} cy={0} rx={w * 0.5 - 4.5} ry={h * 0.44 - 4.5} fill={PAPER} />
        <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
      </g>
    </g>
  );
};

const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

/** Inside the thought: three frames of memory in a strip. The first two are empty (nothing before it); the third is the
 *  canteen table, you with your mouth open, Dev nodding. `dim` 0..1 greys the empty frames' dashed outlines. */
export const Memory: React.FC<{ frame: number; w: number; h: number; empty: number }> = ({ frame, w, h, empty }) => {
  const fw = w * 0.26, fh = h * 0.5, y0 = h * 0.25;
  const xs = [w * 0.06, w * 0.37, w * 0.68];
  const nod = Math.sin(frame / 6) * 8;
  const sit: Pose = { lean: 4, tilt: 0, armB: [40, 30], armF: [60, 30], legB: [88, -88], legF: [92, -92], drop: 0 };
  return (
    <g>
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x} y={y0} width={fw} height={fh} rx={8} fill={i < 2 ? "#e9e0cc" : "#fbf5e8"} stroke={INK} strokeWidth={4}
            strokeDasharray={i < 2 ? "12 10" : undefined} opacity={i < 2 ? 0.55 + 0.45 * empty : 1} />
          {i === 2 && (
            <g>
              <clipPath id="loan-memory"><rect x={x} y={y0} width={fw} height={fh} rx={8} /></clipPath>
              <g clipPath="url(#loan-memory)">
                <rect x={x} y={y0 + fh * 0.72} width={fw} height={fh} fill="#a9cbb4" />
                <Figure x={x + fw * 0.22} y={y0 + fh * 1.02} scale={0.3} pose={sit} head={MUSTARD} tuft scarf="#1d9a8f" mouth="open" brows="raised" look={{ x: 1, y: 0 }} />
                <Figure x={x + fw * 0.8} y={y0 + fh * 1.02} scale={0.3} facing={-1} pose={{ ...sit, tilt: nod }} head={DEV.head} coat={DEV.coat} mouth="smile" brows="raised" look={{ x: 1, y: 0 }} />
                <rect x={x + fw * 0.3} y={y0 + fh * 0.66} width={fw * 0.42} height={8} fill="#9fbcc9" stroke={INK} strokeWidth={2} />
              </g>
            </g>
          )}
        </g>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the paper diagram

/** When each part of the paper draws (whole-film frames). */
export interface PaperCues { work: number; note: number; curl: number; curlEnd: number; twenty: number }

/** A bare paper figure (circle head, line body) at a peg board, turning one peg; its mouth curls from flat into a
 *  small smile by `curl` 0..1. In the sheet's coordinates, panel origin at (ox, 0). */
const PegFigure: React.FC<{ frame: number; ox: number; from: number; curl: number }> = ({ frame, ox, from, curl }) => {
  const peg = Math.floor(Math.max(0, frame - from) / 22) % 9;
  const px = ox + 70 + (peg % 3) * 50, py = 150 + Math.floor(peg / 3) * 50;
  const hx = ox + 260, hy = 140;
  const m = 7 * curl;
  return (
    <g>
      <DrawLine d={`M${ox + 40} 120 H${ox + 200} V300 H${ox + 40} Z`} from={from} to={from + 14} color={INK} width={6} />
      {frame >= from + 10 && Array.from({ length: 9 }, (_, i) => {
        const x = ox + 70 + (i % 3) * 50, y = 150 + Math.floor(i / 3) * 50;
        const a = i === peg ? frame * 12 : i * 40;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
            <circle r={13} fill="#e2d6bf" stroke={INK} strokeWidth={4} />
            <line x1={-9} y1={0} x2={9} y2={0} stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
      <DrawLine d={`M${hx} ${hy + 34} V${hy + 150} M${hx} ${hy + 150} L${hx - 26} ${hy + 220} M${hx} ${hy + 150} L${hx + 26} ${hy + 220}`} from={from + 4} to={from + 18} color={INK} width={6} />
      {frame >= from + 2 && <circle cx={hx} cy={hy} r={34} fill={PAPER} stroke={INK} strokeWidth={6} />}
      {frame >= from + 8 && (
        <g>
          <circle cx={hx - 18} cy={hy - 6} r={4.5} fill={INK} />
          <circle cx={hx - 2} cy={hy - 6} r={4.5} fill={INK} />
          <path d={`M${hx - 24} ${hy + 14 - m * 0.3} Q${hx - 12} ${hy + 14 + m} ${hx} ${hy + 14 - m * 0.3}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      )}
      {frame >= from + 18 && <line x1={hx} y1={hy + 70} x2={px + 12} y2={py} stroke={INK} strokeWidth={6} strokeLinecap="round" />}
    </g>
  );
};

/** A hand coming in from the bottom right holding out notes (`n`: 1, or a thick fold), sliding in from `at`. */
const PayHand: React.FC<{ frame: number; ox: number; at: number; n: number }> = ({ frame, ox, at, n }) => {
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + 16], [0, 1], { extrapolateRight: "clamp" });
  const hx = ox + 330 - 40 * p, hy = 300 + 120 * (1 - p);
  return (
    <g>
      <line x1={hx + 30} y1={hy + 20} x2={Math.min(ox + 360, hx + 90)} y2={Math.min(400, hy + 110)} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <circle cx={hx + 22} cy={hy + 14} r={16} fill={INK} />
      <g transform={`translate(${hx} ${hy - 6})`}>
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={-36} y={-18 - i * 3.2} width={64} height={30} rx={3} fill={NOTE} stroke={INK} strokeWidth={i === n - 1 ? 3 : 1.4} />
        ))}
      </g>
    </g>
  );
};

/** The 1959 paper (claim c05): two panels. Left: a figure turning pegs, a hand holds out one note, its flat mouth curls
 *  into a smile. Right: the same work, a thick fold of notes, the mouth stays flat. Sheet coordinates (w 740, h 420). */
export const DissonancePaper: React.FC<{ frame: number; c: PaperCues }> = ({ frame, c }) => {
  const curl = interpolate(frame, [c.curl, c.curlEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g>
      <PegFigure frame={frame} ox={0} from={c.work} curl={curl} />
      <PayHand frame={frame} ox={0} at={c.note} n={1} />
      <DrawLine d="M375 60 V380" from={c.twenty - 6} to={c.twenty + 4} color="#cdbfa6" width={5} />
      {frame >= c.twenty && <PegFigure frame={frame} ox={370} from={c.twenty} curl={0} />}
      <PayHand frame={frame} ox={370} at={c.twenty + 10} n={18} />
    </g>
  );
};
