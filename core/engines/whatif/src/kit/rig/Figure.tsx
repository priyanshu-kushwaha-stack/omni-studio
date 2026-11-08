import { INK } from "../theme";
import { dir, HEAD_R, joints, LIMB, STAND, TORSO, type Pose } from "./pose";

export type Mouth = "none" | "smile" | "smirk" | "o" | "flat" | "open" | "frown" | "wobble";
/** Brow shapes: worry and sad lift the inner ends, angry drops them, raised lifts both. */
export type Brows = "none" | "raised" | "worry" | "sad" | "angry" | "flat";

export interface FigureProps {
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  rotate?: number;
  pose?: Pose;
  head: string;
  scarf?: string;
  /** How far the scarf flies back, 0 hanging to 1 streaming. */
  flow?: number;
  /** Time driving the scarf ripple. Freeze it with the world for frozen figures. */
  time?: number;
  look?: { x: number; y: number };
  eyes?: number;
  blink?: boolean;
  mouth?: Mouth;
  brows?: Brows;
  /** Upper eyelids, 0 open to 1 shut: 0.4 reads tired or sceptical, 0.6 sad. */
  lids?: number;
  tuft?: boolean;
  tie?: string;
  cap?: string;
  coat?: string;
  torso?: number;
  /** Something held in the front hand, drawn at the hand. */
  held?: React.ReactNode;
}

const Limb: React.FC<{ from: { x: number; y: number }; angles: [number, number]; color: string; end: string }> = ({ from, angles, color, end }) => {
  const a = dir(angles[0]);
  const b = dir(angles[0] + angles[1]);
  const mid = { x: from.x + a.x * LIMB, y: from.y + a.y * LIMB };
  const tip = { x: mid.x + b.x * LIMB, y: mid.y + b.y * LIMB };
  return (
    <>
      <polyline
        points={`${from.x},${from.y} ${mid.x},${mid.y} ${tip.x},${tip.y}`}
        fill="none" stroke={color} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx={tip.x} cy={tip.y} r={9} fill={end} />
    </>
  );
};

const handOf = (from: { x: number; y: number }, [u, f]: [number, number]) => {
  const a = dir(u);
  const b = dir(u + f);
  return { x: from.x + (a.x + b.x) * LIMB, y: from.y + (a.y + b.y) * LIMB };
};

const Scarf: React.FC<{ at: { x: number; y: number }; color: string; flow: number; time: number }> = ({ at, color, flow, time }) => {
  const points = [at];
  let angle = 12;
  for (let i = 1; i <= 5; i++) {
    const target = -92 + 5 * i;
    const hang = 12 - 3 * i;
    const ripple = Math.sin(time * 0.32 - i * 0.95) * (6 + i * 3.5) * (0.25 + flow);
    angle = hang + (target - hang) * flow + ripple;
    const d = dir(angle);
    const prev = points[i - 1];
    points.push({ x: prev.x + d.x * 27, y: prev.y + d.y * 27 });
  }
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  return <polyline points={line} fill="none" stroke={color} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />;
};

const mouths: Record<Exclude<Mouth, "none">, React.ReactNode> = {
  smile: <path d="M-7 17 Q6 31 21 17" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  smirk: <path d="M-3 22 Q10 25 22 14" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  flat: <path d="M0 21 L17 21" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  o: <ellipse cx={8} cy={23} rx={7} ry={9} fill={INK} />,
  open: <path d="M-8 15 Q7 11 24 15 Q21 36 7 36 Q-5 36 -8 15Z" fill={INK} />,
  frown: <path d="M-5 26 Q7 15 20 26" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  wobble: <path d="M-6 22 Q-1 18 4 22 Q9 26 14 22 Q19 18 22 22" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />,
};

export const Figure: React.FC<FigureProps> = ({
  x, y, scale = 1, facing = 1, rotate = 0, pose = STAND, head, scarf, flow = 0, time = 0,
  look = { x: 0.4, y: 0 }, eyes = 1, blink = false, mouth = "none", brows = "none", lids = 0, tuft, tie, cap, coat, torso = TORSO, held,
}) => {
  const j = joints(pose, torso);
  const hand = handOf(j.shoulder, pose.armF);
  const eyeRy = blink ? 1.8 : 12.5 * eyes;
  const eyeRx = 8.5 * Math.min(1.25, eyes);
  const ex = look.x * 12;
  const ey = look.y * 8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} 0 ${j.hip.y * scale}) scale(${scale * facing} ${scale})`}>
      <Limb from={j.hip} angles={pose.legB} color="#3b3e47" end="#3b3e47" />
      <Limb from={j.shoulder} angles={pose.armB} color="#3b3e47" end={head} />
      {coat ? (
        <path d={`M${j.neck.x - 19} ${j.neck.y} L${j.neck.x + 19} ${j.neck.y} L${j.hip.x + 34} ${j.hip.y + 62} L${j.hip.x - 34} ${j.hip.y + 62} Z`} fill={coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      ) : (
        <line x1={j.hip.x} y1={j.hip.y} x2={j.neck.x} y2={j.neck.y} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      )}
      <Limb from={j.hip} angles={pose.legF} color={INK} end={INK} />
      {tie && <path d={`M${j.neck.x} ${j.neck.y + 8} l11 15 l-11 45 l-11 -45 Z`} fill={tie} />}
      {scarf && <Scarf at={{ x: j.neck.x - 7, y: j.neck.y + 4 }} color={scarf} flow={flow} time={time} />}
      {scarf && <line x1={j.neck.x - 17} y1={j.neck.y + 1} x2={j.neck.x + 17} y2={j.neck.y + 1} stroke={scarf} strokeWidth={21} strokeLinecap="round" />}
      <g transform={`translate(${j.head.x} ${j.head.y}) rotate(${pose.tilt})`}>
        {tuft && <path d="M-9 -41 Q-14 -66 4 -71 Q-2 -58 11 -55 Q7 -47 8 -41 Z" fill={INK} />}
        <circle r={HEAD_R} fill={head} />
        <path d={`M${-HEAD_R} 0 A${HEAD_R} ${HEAD_R} 0 0 0 ${HEAD_R} 0 A${HEAD_R} ${HEAD_R * 0.83} 0 0 1 ${-HEAD_R} 0Z`} fill="#000" opacity={0.08} />
        {cap && <path d={`M${-HEAD_R} -8 A${HEAD_R} ${HEAD_R} 0 0 1 ${HEAD_R} -8 L${HEAD_R + 24} -6 L${HEAD_R} 2 L${-HEAD_R} -2Z`} fill={cap} />}
        <ellipse cx={-10 + ex} cy={-5 + ey} rx={eyeRx} ry={eyeRy} fill={INK} />
        <ellipse cx={17 + ex} cy={-5 + ey} rx={eyeRx} ry={eyeRy} fill={INK} />
        {!blink && <circle cx={-7.5 + ex} cy={-10 + ey} r={3} fill="#fff" />}
        {!blink && <circle cx={19.5 + ex} cy={-10 + ey} r={3} fill="#fff" />}
        {!blink && lids > 0 && [-10, 17].map((cx) => (
          <rect key={cx} x={cx + ex - eyeRx - 1} y={-5 + ey - eyeRy - 1} width={eyeRx * 2 + 2} height={(eyeRy * 2 + 2) * Math.min(1, lids)} fill={head} />
        ))}
        {!blink && lids > 0 && [-10, 17].map((cx) => (
          <line key={`l${cx}`} x1={cx + ex - eyeRx} x2={cx + ex + eyeRx} y1={-5 + ey - eyeRy + (eyeRy * 2) * Math.min(1, lids)} y2={-5 + ey - eyeRy + (eyeRy * 2) * Math.min(1, lids)} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        ))}
        {brows !== "none" && (() => {
          const tilt = { raised: [0, 0], worry: [6, -2], sad: [8, -3], angry: [-8, 3], flat: [0, 0] }[brows];
          const lift = brows === "raised" ? -8 : brows === "flat" ? 2 : 0;
          const y = -5 - eyeRy - 9 + lift;
          // inner ends sit near x = 3; tilt[0] lifts (+) or drops (-) the inner end
          return (
            <>
              <line x1={-22} y1={y - tilt[1]} x2={-3} y2={y - tilt[0]} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
              <line x1={7} y1={y - tilt[0]} x2={28} y2={y - tilt[1]} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            </>
          );
        })()}
        {mouth !== "none" && mouths[mouth]}
      </g>
      <Limb from={j.shoulder} angles={pose.armF} color={INK} end={head} />
      {held && <g transform={`translate(${hand.x} ${hand.y})`}>{held}</g>}
    </g>
  );
};
