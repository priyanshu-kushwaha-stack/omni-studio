// The flat's kitchen at seven (the library `kitchen`, dressed): a sink at the left with a tower of plates, the table in
// front of the counter, your flatmate at it in his dressing gown with his cereal, a radio on the counter, you in the
// doorway at the right with your lanyard on. Used by Click and Rule. No AI images.
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { kitchen, type KitchenOptions } from "@whatif/kit/sets/Kitchen";
import { Chair, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { HERO } from "../shared";
import { Counter } from "./Counter";
import { aim, counterOver, FLATMATE, handWorld, headWorld, HeroMug, Lanyard, type Placed } from "./FrameKit";

const TOP = 760;
export const K = {
  table: { top: 800, from: 640, to: 1240 },
  seat: 850,
  mate: { x: 545, scale: 1.15 },
  bowl: { x: 760, y: 800 },
  sink: { from: 270, to: 470 },
  radio: { x: 1190, y: TOP - 18 },
  you: { x: 1640, y: 975, scale: 1.2 },
};

const OPTIONS: KitchenOptions = { stove: "kettle", steam: 0, counter: [] };

export const mateAt = (pose: Pose): Placed => ({ x: K.mate.x, y: seatedY(K.seat, K.mate.scale), scale: K.mate.scale, facing: 1, pose });

export interface Face { brows?: Brows; lids?: number; mouth?: Mouth; eyes?: number; look?: { x: number; y: number }; blink?: boolean }

export interface KitchenState {
  mate: Face;
  /** 0..1 the spoon's trip from bowl to mouth. */
  spoon: number;
  /** He pats his hair (0..1), checks the back of his spoon (0..1), shrugs (0..1). */
  pat?: number;
  check?: number;
  shrug?: number;
  /** His counter: base, ticks, the frame it blinks on (none: not yet seen). */
  count?: { base: number; ticks?: number[]; on?: number };
  you: Face;
  youPose?: Pose;
  /** You in the doorway (default) or gone. */
  youHere?: boolean;
  /** The radio's sound waves, 0..1. */
  radio?: number;
}

const Sink: React.FC = () => {
  const { from, to } = K.sink;
  return (
    <g>
      <rect x={from} y={TOP - 22} width={to - from} height={14} rx={4} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
      <path d={`M${to - 40} ${TOP - 22} V${TOP - 110} Q${to - 40} ${TOP - 140} ${to - 80} ${TOP - 140} H${to - 100}`} fill="none" stroke="#9aa1ab" strokeWidth={12} strokeLinecap="round" />
      {/* the tower of plates, leaning */}
      {Array.from({ length: 13 }, (_, i) => (
        <ellipse key={i} cx={from + 85 + Math.sin(i * 1.3) * 7 + i * 1.6} cy={TOP - 30 - i * 17} rx={66 - (i % 3) * 4} ry={11}
          fill={i % 4 === 3 ? "#e6a0a0" : PAPER} stroke={INK} strokeWidth={4} />
      ))}
      {[2, 6, 10].map((i) => <circle key={i} cx={from + 60 + i * 3} cy={TOP - 30 - i * 17 - 4} r={5} fill="#c98a3a" />)}
      <path d={`M${from + 150} ${TOP - 32} q14 -20 6 -48`} fill="none" stroke="#c9ced6" strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

const Radio: React.FC<{ waves: number; frame: number }> = ({ waves, frame }) => (
  <g transform={`translate(${K.radio.x} ${K.radio.y})`}>
    <line x1={40} y1={-80} x2={90} y2={-170} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={-80} y={-84} width={170} height={84} rx={14} fill="#c96f2d" stroke={INK} strokeWidth={5} />
    <circle cx={-34} cy={-42} r={26} fill="#5b3c2a" stroke={INK} strokeWidth={4} />
    <rect x={10} y={-64} width={60} height={20} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
    <circle cx={56} cy={-22} r={9} fill={INK} />
    {waves > 0 && [0, 1, 2].map((i) => {
      const t = ((frame / 10 + i / 3) % 1);
      return <path key={i} d={`M${100 + t * 40} ${-70 - t * 10} q${18 + t * 20} 30 0 ${60 + t * 20}`} fill="none" stroke={INK} strokeWidth={4} opacity={waves * (1 - t) * 0.7} />;
    })}
  </g>
);

/** The table, the people and the props. */
const People: React.FC<{ frame: number; s: KitchenState }> = ({ frame, s }) => {
  const base: Pose = { ...SEATED, lean: 3, armF: [60, 50], armB: [75, 45] };
  const probe = mateAt(base);
  const head = headWorld(probe);
  const mouth = { x: head.x + 22, y: head.y + 25 };
  const bowl = { x: K.bowl.x - 10, y: K.bowl.y - 22 };
  const up = Math.sin(Math.min(1, s.spoon) * Math.PI);
  let armF: [number, number] = aim(probe, { x: bowl.x + (mouth.x - bowl.x) * up, y: bowl.y + (mouth.y - bowl.y) * up });
  let armB: [number, number] = [70, 50];
  if (s.check) armF = aim(probe, { x: head.x + 70, y: head.y + 10 * (1 - s.check) });
  if (s.pat) armB = aim(probe, { x: head.x - 10, y: head.y - 52 - Math.sin(frame * 0.8) * 6 * s.pat });
  const shrug = s.shrug ?? 0;
  const mate = mateAt({ ...base, armF, armB: shrug > 0 ? [60 - 40 * shrug, 120 * shrug] : armB, tilt: shrug * 8 });
  const spoon = handWorld(mate, "armF");
  const c = counterOver(mate, 44);
  const blinkOn = s.count?.on;
  const blinkAlpha = blinkOn !== undefined && frame >= blinkOn && frame < blinkOn + 16 ? (Math.floor((frame - blinkOn) / 3) % 2 ? 0.35 : 1) : 1;
  const you: Placed = { x: K.you.x, y: K.you.y, scale: K.you.scale, facing: -1, pose: s.youPose ?? { ...STAND, armF: [40, 90] } };
  const youHand = handWorld(you);
  return (
    <>
      <Sink />
      <Radio waves={s.radio ?? 0} frame={frame} />
      <Chair x={K.mate.x - 20} y={K.seat} scale={1.2} facing={1} color="#8a5c3b" />
      <Figure x={mate.x} y={mate.y} scale={mate.scale} facing={1} pose={mate.pose} head={FLATMATE.head} coat={FLATMATE.coat} time={frame}
        brows={s.mate.brows} lids={s.mate.lids} mouth={s.mate.mouth} eyes={s.mate.eyes} look={s.mate.look} blink={s.mate.blink} />
      {/* the dressing gown's belt */}
      <line x1={mate.x - 22} y1={mate.y - 150 * mate.scale} x2={mate.x + 22} y2={mate.y - 150 * mate.scale} stroke="#5a3f6a" strokeWidth={8} strokeLinecap="round" />
      <line x1={spoon.x} y1={spoon.y} x2={spoon.x + 30} y2={spoon.y - 8} stroke="#b8bec8" strokeWidth={7} strokeLinecap="round" />
      <ellipse cx={spoon.x + 36} cy={spoon.y - 9} rx={11} ry={7} fill="#b8bec8" stroke={INK} strokeWidth={3} />
      {/* the table */}
      <rect x={K.table.from} y={K.table.top} width={K.table.to - K.table.from} height={26} rx={8} fill="#b27a4d" stroke={INK} strokeWidth={5} />
      <rect x={K.table.from + 30} y={K.table.top + 26} width={22} height={140} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <rect x={K.table.to - 52} y={K.table.top + 26} width={22} height={140} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <path d={`M${K.bowl.x - 70} ${K.bowl.y - 50} Q${K.bowl.x} ${K.bowl.y + 20} ${K.bowl.x + 70} ${K.bowl.y - 50}Z`} fill="#7fa0c4" stroke={INK} strokeWidth={5} />
      <ellipse cx={K.bowl.x} cy={K.bowl.y - 50} rx={70} ry={10} fill="#f6e3b0" stroke={INK} strokeWidth={4} />
      <rect x={980} y={K.table.top - 120} width={60} height={120} rx={6} fill="#e8c86a" stroke={INK} strokeWidth={4} />
      {s.count && (
        <g opacity={blinkAlpha}>
          <Counter x={c.x} y={c.y} base={s.count.base} ticks={s.count.ticks} frame={frame} size={44} on={s.count.on} id="mate-count" />
        </g>
      )}
      {(s.youHere ?? true) && (
        <g>
          <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
            brows={s.you.brows} lids={s.you.lids} mouth={s.you.mouth} eyes={s.you.eyes} look={s.you.look} blink={s.you.blink} />
          <Lanyard f={you} />
          <HeroMug x={youHand.x} y={youHand.y} scale={you.scale} tilt={10} steam={false} />
        </g>
      )}
    </>
  );
};

/** The kitchen through `cam`. */
export const KitchenScene: React.FC<{ frame: number; cam: Camera; s: KitchenState; mood?: MoodName; children?: React.ReactNode }> = ({
  frame, cam, s, mood = "morning", children,
}) => {
  const props = { cam, mood, frame, options: OPTIONS };
  return (
    <LookContext.Provider value={setLook(kitchen.lights(OPTIONS), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={kitchen.Back(props)}
        actors={<><People frame={frame} s={s} />{children}</>}
        // the doorway edge slides over you in a close-up (depth 1.4): only in the wider shots
        front={cam.zoom < 1.6 ? kitchen.Front?.(props) : undefined} />
    </LookContext.Provider>
  );
};

/** Head centres for close-ups. */
export const MATE_HEAD = headWorld(mateAt({ ...SEATED, lean: 3 }));
export const YOU_HEAD = headWorld({ x: K.you.x, y: K.you.y, scale: K.you.scale, facing: -1, pose: STAND });
