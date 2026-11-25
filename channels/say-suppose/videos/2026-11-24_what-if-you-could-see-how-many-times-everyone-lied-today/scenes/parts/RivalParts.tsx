// Parts for the back half of the film (Rival, Polygraph, Statement, ReadItAloud, Nine): the cast's looks, a person with
// their lie counter, speech bubbles, the studio props (thermal camera, stools, polygraph, scoreboard, microphone, cards)
// and the kitchen's table and sink. Everything is drawn in WORLD coordinates for a Stage's actors slot unless it says
// screen pixels. No AI images.
import { spring } from "remotion";
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { dir, HEAD_R, joints, LIMB, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Counter } from "./Counter";
import { blinking, findLine, GLOW, type Shot } from "../shared";

/** The rival: sage head, white coat. */
export const RIVAL = { head: "#9fbb8a", coat: "#eef0ea" } as const;
/** The television host: pink head, plum dress. */
export const HOST = { head: "#f2a0bd", coat: "#6a3d78" } as const;
/** Your flatmate: pale-blue head, dressing gown. */
export const FLATMATE = { head: "#a9cfe9", coat: "#8a6f9e" } as const;
/** The leader: steel-grey head, dark suit, a sash. */
export const LEADER = { head: "#8e98a4", coat: "#2b3245", tie: "#b8323e" } as const;
export const SASH = "#2f6db0";
/** The challenger: copper head. */
export const CHALLENGER = { head: "#c97b4b", coat: "#3d5a6c" } as const;

export type Who = Partial<FigureProps> & { head: string };
export type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

/** Where a figure's head centre is, in world coordinates. */
export function headAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

/** Where a figure's front hand is, in world coordinates. */
export function handAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + (sh.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** Start and end frames of the n-th line (0 = first) at or after the beat's start whose text starts with `prefix`. */
export function lineNth(shot: Shot, prefix: string, n = 0) {
  const start = Math.max(0, shot.clips.findIndex((c) => c.from >= shot.from));
  let i = -1;
  for (let k = 0; k <= n; k++) i = findLine(shot.lines, prefix, i < 0 ? start : i + 1);
  const c = shot.clips[i];
  return { at: c.from, end: c.from + c.frames };
}

/** True while the line is being spoken. */
export const speaking = (shot: Shot, prefix: string) => shot.frame >= shot.at(prefix) && shot.frame < shot.end(prefix);

/** The share of the way into a line where `word` starts (for a cue inside a line). */
export function wordAt(shot: Shot, prefix: string, word: string) {
  const i = findLine(shot.lines, prefix, Math.max(0, shot.clips.findIndex((c) => c.from >= shot.from)));
  const text = shot.lines[i].text.toLowerCase();
  const k = text.indexOf(word.toLowerCase());
  return shot.at(prefix, k > 0 ? k / text.length : 0);
}

export interface CountSpec { base: number; ticks?: number[]; size?: number; on?: number; hidden?: boolean; glow?: string }

/**
 * A person with their lie counter over their head (every head that can lie carries one). `count` null draws no counter
 * (you: you can't see your own; the stranger: no counter at all).
 */
export const Person: React.FC<{
  who: Who; x: number; y: number; scale?: number; facing?: 1 | -1; pose: Pose; face?: Partial<Face>; frame: number; seed?: number;
  count?: CountSpec | null; held?: React.ReactNode; id: string; sash?: string; earpiece?: boolean; sweat?: number; lift?: number;
}> = ({ who, x, y, scale = 1, facing = 1, pose, face, frame, seed = 0, count, held, id, sash, earpiece, sweat = 0, lift = 0 }) => {
  const h = headAt(x, y, scale, pose, facing);
  const j = joints(pose);
  const size = count?.size ?? 62 * scale;
  return (
    <g>
      <Figure {...who} x={x} y={y} scale={scale} facing={facing} pose={pose} {...face} blink={blinking(frame, seed)} time={frame} held={held} />
      {sash && (
        <line x1={x + (j.neck.x - 16) * scale * facing} y1={y + (j.neck.y + 10) * scale} x2={x + (j.hip.x + 26) * scale * facing}
          y2={y + (j.hip.y + 30) * scale} stroke={sash} strokeWidth={15 * scale} strokeLinecap="round" />
      )}
      {earpiece && (
        <g>
          <circle cx={h.x - facing * h.r * 0.92} cy={h.y + 4 * scale} r={7 * scale} fill={INK} />
          <path d={`M${h.x - facing * h.r * 0.92} ${h.y + 10 * scale} q${-facing * 10 * scale} ${22 * scale} ${-facing * 2 * scale} ${50 * scale}`}
            fill="none" stroke={INK} strokeWidth={3 * scale} />
        </g>
      )}
      {sweat > 0 && [0, 1, 2].map((k) => {
        const t = ((frame + k * 11 + seed * 7) % 34) / 34;
        return (
          <path key={k} transform={`translate(${h.x + (k - 1) * h.r * 0.7} ${h.y - h.r * 0.5 + t * h.r * 1.2}) scale(${scale})`}
            d="M0 -10 Q7 2 0 8 Q-7 2 0 -10Z" fill="#bfe6ff" stroke={INK} strokeWidth={2} opacity={sweat * (1 - t)} />
        );
      })}
      {count && (
        <Counter x={h.x} y={h.y - h.r - size * 0.95 - lift} base={count.base} ticks={count.ticks} frame={frame} size={size}
          on={count.on} hidden={count.hidden} glow={count.glow} id={id} />
      )}
    </g>
  );
};

/** A speech bubble, four words or fewer, its tail tip at (x, y), pointing down at the speaker. Pops in at `at`. */
export const Bubble: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right" }> = ({
  frame, at, until, x, y, text, size = 46, side = "right",
}) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness: 260, mass: 0.6 } });
  const w = Math.max(size * 3, text.length * size * 0.58 + size * 1.2);
  const h = size * 1.9;
  const d = side === "right" ? 1 : -1;
  const bx = x + d * size * 0.6 - (side === "right" ? 0 : w);
  const by = y - size * 0.9 - h;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <path d={`M${x} ${y} L${x + d * size * 0.5} ${by + h - 2} L${x + d * size * 1.5} ${by + h - 2}Z`} fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx} y={by} width={w} height={h} rx={h * 0.45} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={x + d * size * 0.55 - 4} y={by + h - 9} width={size + 8} height={12} fill={PAPER} />
      <text x={bx + w / 2} y={by + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={INK}>{text}</text>
    </g>
  );
};

/** A handheld microphone for a hand (drawn in the hand's frame). */
export const Mic: React.FC<{ tilt?: number }> = ({ tilt = -35 }) => (
  <g transform={`rotate(${tilt})`}>
    <rect x={-6} y={-52} width={12} height={58} rx={5} fill="#2a2d36" stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-60} r={15} fill="#5c6675" stroke={INK} strokeWidth={3} />
    <rect x={-8} y={-30} width={16} height={8} fill={CRIMSON} />
  </g>
);

/** A sheet of paper held up (the leader's statement): ink lines, no words. */
export const SheetProp: React.FC<{ tilt?: number; scale?: number; lines?: number; hot?: number }> = ({ tilt = -8, scale = 1, lines = 9, hot = -1 }) => (
  <g transform={`rotate(${tilt}) scale(${scale})`}>
    <rect x={-36} y={-104} width={76} height={100} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
    {Array.from({ length: lines }, (_, i) => (
      <rect key={i} x={-28} y={-96 + i * 10} width={i % 3 === 2 ? 40 : 58} height={4} rx={2} fill={i === hot ? CRIMSON : INK} opacity={0.6} />
    ))}
  </g>
);

/** A small white card. */
export const CardProp: React.FC<{ tilt?: number; scale?: number; scrawl?: number }> = ({ tilt = -10, scale = 1, scrawl = 1 }) => (
  <g transform={`rotate(${tilt}) scale(${scale})`}>
    <rect x={-30} y={-46} width={64} height={42} rx={4} fill="#fffaf0" stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((i) => <rect key={i} x={-24} y={-38 + i * 11} width={52 * Math.max(0, Math.min(1, scrawl * 3 - i))} height={4} rx={2} fill={INK} opacity={0.7} />)}
  </g>
);

/** A spoon. */
export const Spoon: React.FC<{ tilt?: number }> = ({ tilt = -40 }) => (
  <g transform={`rotate(${tilt})`}>
    <rect x={-3} y={-50} width={6} height={50} rx={3} fill="#c9ced6" stroke={INK} strokeWidth={2} />
    <ellipse cx={0} cy={-58} rx={9} ry={13} fill="#c9ced6" stroke={INK} strokeWidth={2} />
  </g>
);

/** A teal mug in the hand. */
export const MugProp: React.FC<{ tilt?: number; steam?: number; frame?: number }> = ({ tilt = -10, steam = 0, frame = 0 }) => (
  <g transform={`rotate(${tilt})`}>
    <rect x={-22} y={-52} width={44} height={52} rx={8} fill={TEAL} stroke={INK} strokeWidth={4} />
    <path d="M22 -42 q20 4 0 30" fill="none" stroke={INK} strokeWidth={6} />
    {steam > 0 && <path d={`M-6 -62 q-8 -12 0 -24 q8 -12 0 -24`} fill="none" stroke={PAPER} strokeWidth={4} opacity={0.45 * steam}
      transform={`translate(${Math.sin(frame / 12) * 3} 0)`} strokeLinecap="round" />}
  </g>
);

/** A raised hand counting: `n` fingers up (0 to 5). */
export const Fingers: React.FC<{ n: number; tilt?: number; color: string }> = ({ n, tilt = 0, color }) => (
  <g transform={`rotate(${tilt})`}>
    {Array.from({ length: 5 }, (_, i) => {
      const up = i < n;
      const a = -40 + i * 20;
      return <rect key={i} x={-4} y={up ? -34 : -18} width={8} height={up ? 26 : 12} rx={4} fill={color} stroke={INK} strokeWidth={2}
        transform={`rotate(${a}) translate(0 -4)`} />;
    })}
    <circle r={13} fill={color} stroke={INK} strokeWidth={2.5} />
  </g>
);

/** A sponge. */
export const Sponge: React.FC = () => <rect x={-14} y={-22} width={28} height={18} rx={4} fill="#f2d24a" stroke={INK} strokeWidth={3} />;

/** A plate held in the hand, `turn` spins it while washing. */
export const PlateProp: React.FC<{ turn?: number }> = ({ turn = 0 }) => (
  <g transform={`rotate(${turn})`}>
    <ellipse cx={0} cy={-10} rx={30} ry={30} fill="#f4f4f0" stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={-10} rx={18} ry={18} fill="none" stroke="#c9ced6" strokeWidth={3} />
  </g>
);

/** A face in heat colours inside a box (the rival's thermal camera picture). `who` shapes the head; `nose` colours the
 *  nose (orange warm, blue cool). Drawn at (x, y) top-left, w by h. */
export const ThermalFace: React.FC<{ x: number; y: number; w: number; h: number; who: "you" | "rival" | "leader"; nose: string; frame: number; id: string }> = ({
  x, y, w, h, who, nose, frame, id,
}) => {
  const cx = x + w / 2, cy = y + h * 0.5;
  const r = Math.min(w, h) * 0.3;
  const shimmer = Math.sin(frame / 9) * r * 0.02;
  return (
    <g>
      <clipPath id={`th-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#th-${id})`}>
        <rect x={x} y={y} width={w} height={h} fill="#1c0a40" />
        <rect x={x} y={y + h * 0.82} width={w} height={h} fill="#3a1470" />
        <path d={`M${cx - r * 1.7} ${y + h} Q${cx} ${cy + r * 0.7} ${cx + r * 1.7} ${y + h}Z`} fill="#7a1f8f" />
        <ellipse cx={cx} cy={cy} rx={r * 1.12 + shimmer} ry={r * 1.18 + shimmer} fill="#c2185b" />
        <ellipse cx={cx} cy={cy} rx={r * 0.98} ry={r * 1.04} fill="#ef5b2a" />
        <ellipse cx={cx} cy={cy + r * 0.1} rx={r * 0.72} ry={r * 0.76} fill="#ffa31a" />
        <ellipse cx={cx} cy={cy + r * 0.25} rx={r * 0.42} ry={r * 0.36} fill="#ffe14d" />
        {who === "you" && <path d={`M${cx - r * 0.2} ${cy - r * 1.1} q${-r * 0.1} ${-r * 0.5} ${r * 0.3} ${-r * 0.6} q${-r * 0.1} ${r * 0.3} ${r * 0.2} ${r * 0.4}Z`} fill="#c2185b" />}
        {who === "leader" && <rect x={cx - r * 1.4} y={cy + r * 1.2} width={r * 2.8} height={r * 0.3} fill="#4a2a9a" transform={`rotate(-14 ${cx} ${cy + r * 1.3})`} />}
        <ellipse cx={cx - r * 0.38} cy={cy - r * 0.12} rx={r * 0.13} ry={r * 0.09} fill="#5a1a8a" />
        <ellipse cx={cx + r * 0.38} cy={cy - r * 0.12} rx={r * 0.13} ry={r * 0.09} fill="#5a1a8a" />
        <circle cx={cx} cy={cy + r * 0.16} r={r * 0.17} fill={nose} stroke="#fff" strokeWidth={r * 0.02} opacity={0.95} />
        {/* the colour bar down the right edge */}
        {["#ffe14d", "#ffa31a", "#ef5b2a", "#c2185b", "#7a1f8f", "#3a1470", "#2a5bd8"].map((c, i) => (
          <rect key={c} x={x + w - w * 0.06} y={y + h * 0.1 + i * h * 0.11} width={w * 0.035} height={h * 0.11} fill={c} />
        ))}
      </g>
    </g>
  );
};

/** The rival's thermal camera on a tripod. (x, y) is the floor under it; `aim` 1 points right, -1 left; `swing` turns it. */
export const ThermalCam: React.FC<{ x: number; y: number; aim: number; scale?: number }> = ({ x, y, aim, scale = 1 }) => {
  const top = y - 420 * scale;
  return (
    <g>
      <path d={`M${x} ${top + 40 * scale} L${x - 80 * scale} ${y} M${x} ${top + 40 * scale} L${x} ${y} M${x} ${top + 40 * scale} L${x + 80 * scale} ${y}`}
        stroke="#3b3e47" strokeWidth={12 * scale} strokeLinecap="round" />
      <g transform={`translate(${x} ${top}) scale(${aim * scale} ${scale})`}>
        <rect x={-70} y={-48} width={150} height={92} rx={14} fill="#e8e4d6" stroke={INK} strokeWidth={6} />
        <rect x={80} y={-30} width={44} height={60} rx={8} fill="#3b3e47" stroke={INK} strokeWidth={5} />
        <circle cx={124} cy={0} r={20} fill="#ff7a2a" stroke={INK} strokeWidth={4} />
        <circle cx={124} cy={0} r={8} fill="#ffe14d" />
        <circle cx={-50} cy={-30} r={7} fill={CRIMSON} />
      </g>
    </g>
  );
};

/** A tall studio stool, seat top at `top`. */
export const Stool: React.FC<{ x: number; top: number; floor: number }> = ({ x, top, floor }) => (
  <g>
    <path d={`M${x - 50} ${floor} L${x - 20} ${top} M${x + 50} ${floor} L${x + 20} ${top}`} stroke="#c9ced6" strokeWidth={9} strokeLinecap="round" />
    <line x1={x - 38} y1={(top + floor) / 2 + 40} x2={x + 38} y2={(top + floor) / 2 + 40} stroke="#c9ced6" strokeWidth={7} />
    <ellipse cx={x} cy={top} rx={62} ry={14} fill={CRIMSON} stroke={INK} strokeWidth={5} />
  </g>
);

/** The polygraph on its trolley: a box with a paper roll and three needles drawing wandering lines. */
export const Polygraph: React.FC<{ x: number; floor: number; frame: number; wild?: number }> = ({ x, floor, frame, wild = 0.4 }) => {
  const top = floor - 330;
  const trace = (k: number) => Array.from({ length: 24 }, (_, i) => {
    const t = frame * 0.9 - i * 4;
    const v = Math.sin(t / (6 + k * 2) + k) * (8 + wild * 18) + Math.sin(t / 2.3 + k * 3) * wild * 8;
    return `${i === 0 ? "M" : "L"}${x + 80 - i * 7} ${top + 30 + k * 34 + v}`;
  }).join(" ");
  return (
    <g>
      <rect x={x - 140} y={top + 120} width={280} height={18} rx={6} fill="#5c6675" stroke={INK} strokeWidth={4} />
      <path d={`M${x - 120} ${top + 138} V${floor - 30} M${x + 120} ${top + 138} V${floor - 30}`} stroke="#5c6675" strokeWidth={10} />
      <rect x={x - 130} y={floor - 160} width={260} height={14} rx={5} fill="#5c6675" />
      {[-110, 110].map((d) => <circle key={d} cx={x + d} cy={floor - 18} r={16} fill={INK} />)}
      <rect x={x - 130} y={top - 10} width={260} height={132} rx={10} fill="#4a5568" stroke={INK} strokeWidth={5} />
      <rect x={x - 110} y={top} width={200} height={112} fill={PAPER} stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((k) => <path key={k} d={trace(k)} fill="none" stroke={[CRIMSON, TEAL, INK][k]} strokeWidth={3.5} />)}
      {[0, 1, 2].map((k) => <line key={k} x1={x + 80} y1={top + 30 + k * 34} x2={x + 118} y2={top + 18 + k * 34} stroke={INK} strokeWidth={4} />)}
    </g>
  );
};

/** The scoreboard: YOU, POLYGRAPH, RIVAL and their counts. `hi` lights one column. (x, y) is its top-left. */
export const Scoreboard: React.FC<{ x: number; y: number; scores: [number, number, number]; hi?: number }> = ({ x, y, scores, hi = -1 }) => (
  <g>
    <rect x={x} y={y} width={560} height={250} rx={18} fill={INK} stroke={GLOW} strokeWidth={6} />
    {["YOU", "POLYGRAPH", "RIVAL"].map((label, i) => (
      <g key={label}>
        {hi === i && <rect x={x + 14 + i * 180} y={y + 14} width={172} height={222} rx={12} fill={GLOW} opacity={0.18} />}
        <text x={x + 100 + i * 180} y={y + 64} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={i === 1 ? 30 : 36}
          fill={i === 0 ? MUSTARD : PAPER} letterSpacing={1}>{label}</text>
        <text x={x + 100 + i * 180} y={y + 190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={PAPER}
          style={{ fontVariantNumeric: "tabular-nums" }}>{scores[i]}</text>
      </g>
    ))}
  </g>
);

/** A row of studio audience seen from behind (backs of heads and shoulders) along y `y`, each with a small counter;
 *  `laugh` bounces them. `empty` leaves seats empty (the painted seat shows). */
export const AudienceBacks: React.FC<{ from: number; to: number; y: number; n: number; frame: number; laugh?: number; r?: number;
  counts: number[]; stranger?: number; empty?: number[]; seed?: number; counterSize?: number }> = ({
  from, to, y, n, frame, laugh = 0, r = 54, counts, stranger = -1, empty = [], seed = 0, counterSize = 34,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = from + ((to - from) * (i + 0.5)) / n + Math.sin(i * 7 + seed) * 12;
      if (empty.includes(i)) return null;
      const bob = -Math.abs(Math.sin((frame + i * 5) / 3.2)) * 10 * laugh;
      const isStranger = i === stranger;
      const head = isStranger ? "#D8344F" : ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"][(i + seed) % 8];
      return (
        <g key={i} transform={`translate(0 ${bob})`}>
          <path d={`M${x - r * 1.5} ${y + r * 3} Q${x - r * 1.4} ${y + r * 0.8} ${x} ${y + r * 0.75} Q${x + r * 1.4} ${y + r * 0.8} ${x + r * 1.5} ${y + r * 3}Z`}
            fill={isStranger ? "#3f3346" : "#2f3242"} stroke={INK} strokeWidth={5} />
          {isStranger && <path d={`M${x - r * 0.6} ${y + r * 0.8} L${x} ${y + r * 1.6} L${x + r * 0.6} ${y + r * 0.8}`} fill="none" stroke="#2a2230" strokeWidth={8} />}
          <circle cx={x} cy={y} r={r} fill={head} stroke={INK} strokeWidth={4} />
          {!isStranger && <Counter x={x} y={y - r - counterSize * 0.95} base={counts[i % counts.length]} frame={frame} size={counterSize} id={`aud-${seed}-${i}`} />}
        </g>
      );
    })}
  </g>
);

/** A small kitchen table with a chair beside it, table top at `top`. */
export const Table: React.FC<{ x: number; top: number; floor: number; w?: number }> = ({ x, top, floor, w = 360 }) => (
  <g>
    <rect x={x - w / 2 + 20} y={top + 10} width={16} height={floor - top - 10} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    <rect x={x + w / 2 - 36} y={top + 10} width={16} height={floor - top - 10} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    <rect x={x - w / 2} y={top - 4} width={w} height={22} rx={6} fill="#b9895f" stroke={INK} strokeWidth={5} />
  </g>
);

/** A kitchen chair seen side on: seat top at `seat`. */
export const Chair: React.FC<{ x: number; seat: number; floor: number; back?: 1 | -1 }> = ({ x, seat, floor, back = -1 }) => (
  <g>
    <rect x={x - 46} y={seat} width={92} height={14} rx={4} fill="#b9895f" stroke={INK} strokeWidth={4} />
    <line x1={x - 38} y1={seat + 14} x2={x - 38} y2={floor} stroke={INK} strokeWidth={8} />
    <line x1={x + 38} y1={seat + 14} x2={x + 38} y2={floor} stroke={INK} strokeWidth={8} />
    <line x1={x + back * 42} y1={seat} x2={x + back * 48} y2={seat - 150} stroke="#8a5c3b" strokeWidth={12} strokeLinecap="round" />
  </g>
);

/** A steel sink set into the platform with a tap, and a stack of `plates` dirty plates beside it. (x, top) is the sink's
 *  centre at the platform top. */
export const Sink: React.FC<{ x: number; top: number; plates: number }> = ({ x, top, plates }) => (
  <g>
    <rect x={x - 130} y={top - 22} width={260} height={30} rx={6} fill="#b8bec8" stroke={INK} strokeWidth={4} />
    <path d={`M${x - 20} ${top - 22} V${top - 120} Q${x - 20} ${top - 150} ${x + 20} ${top - 150} H${x + 50} V${top - 130}`} fill="none" stroke="#9aa1ab" strokeWidth={14} strokeLinecap="round" />
    {Array.from({ length: plates }, (_, i) => (
      <ellipse key={i} cx={x + 70 + Math.sin(i * 2.1) * 8} cy={top - 30 - i * 13} rx={56} ry={9} fill={i % 3 === 1 ? "#e9e2d0" : "#f4f4f0"} stroke={INK} strokeWidth={3} />
    ))}
    {plates > 2 && <ellipse cx={x - 60} cy={top - 28} rx={40} ry={7} fill="#f4f4f0" stroke={INK} strokeWidth={3} transform={`rotate(-20 ${x - 60} ${top - 28})`} />}
  </g>
);
