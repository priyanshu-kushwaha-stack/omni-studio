// The flat's kitchen at seven in look C (Click, Rule, Nine): the painted plate `kitchen-morning` (plate world units, x
// -240..2160, y -135..1215). The painted table at the left carries the tower of dishes; whoever sits at it sits behind
// its far edge, in front of the window, cut off at the table top. Whoever stands is near the lens at the right. Code
// props only where the action needs them: the cereal bowl and spoon, the radio, your mug, the counter. No AI images.
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { HERO } from "../shared";
import { Counter } from "./Counter";
import { aim, counterOver, FLATMATE, handWorld, headWorld, HeroMug, Lanyard, type Placed } from "./FrameKit";
import { Above, byHead, counterLight, dof, Soft } from "./FrameLook";
import { PlateScene } from "./Plate";

/** Where things are in the painted kitchen. */
export const KP = {
  /** The far edge of the table top where the seated figure sits (everything below it is behind the table). */
  tableTop: 668,
  seat: { head: { x: 735, y: 450 }, scale: 2.2 },
  stand: { head: { x: 1520, y: 400 }, scale: 2.6 },
  bowl: { x: 815, y: 676 },
  radio: { x: 1172, y: 563, scale: 0.62 },
  dishes: { x: 445, y: 585 },
  kettle: { x: 1676, y: 446 },
} as const;

const SEAT_BASE: Pose = { ...SEATED, lean: 3 };
const SEAT_FEET = byHead({ scale: KP.seat.scale, facing: 1, pose: SEAT_BASE }, KP.seat.head);
const STAND_FEET = byHead({ scale: KP.stand.scale, facing: -1, pose: STAND }, KP.stand.head);

/** The seated figure at the table (feet fixed, the pose moves the body). */
export const seatAt = (pose: Pose): Placed => ({ x: SEAT_FEET.x, y: SEAT_FEET.y, scale: KP.seat.scale, facing: 1, pose });
/** The standing figure near the lens at the right, facing the table. */
export const standAt = (pose: Pose): Placed => ({ x: STAND_FEET.x, y: STAND_FEET.y, scale: KP.stand.scale, facing: -1, pose });

export const SEAT_HEAD = headWorld(seatAt(SEAT_BASE));
export const STAND_HEAD = headWorld(standAt(STAND));
/** Kept for the close-ups: the flatmate at the table, you by the counter. */
export const MATE_HEAD = SEAT_HEAD;
export const YOU_HEAD = STAND_HEAD;

/** The kitchen through `cam`. `r` is the head radius of the face the camera is on (for the depth of field). */
export const KitchenScene: React.FC<{
  frame: number; cam: Camera; mood?: MoodName; r?: number; blur?: number; lights?: SetLight[];
  far?: React.ReactNode; seated?: React.ReactNode; onTable?: React.ReactNode; standing?: React.ReactNode; children?: React.ReactNode;
}> = ({ cam, mood = "morning", r = 0, blur, lights, far, seated, onTable, standing, children }) => {
  const px = blur ?? dof(cam, r);
  return (
    <PlateScene plate="kitchen-morning" cam={cam} mood={mood} blur={px} rimFrom="left" lights={lights}
      actors={
        <>
          {far && <Soft id="kitchen-far" px={px} zoom={cam.zoom}>{far}</Soft>}
          <Above id="kitchen-table" y={KP.tableTop}>{seated}</Above>
          {onTable}
          {standing}
          {children}
        </>
      } />
  );
};

/** The radio on the counter, its sound waves 0..1. */
export const Radio: React.FC<{ waves: number; frame: number }> = ({ waves, frame }) => (
  <g transform={`translate(${KP.radio.x} ${KP.radio.y}) scale(${KP.radio.scale})`}>
    <line x1={40} y1={-80} x2={90} y2={-170} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={-80} y={-84} width={170} height={84} rx={14} fill="#c96f2d" stroke={INK} strokeWidth={5} />
    <circle cx={-34} cy={-42} r={26} fill="#5b3c2a" stroke={INK} strokeWidth={4} />
    <rect x={10} y={-64} width={60} height={20} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
    {waves > 0 && [0, 1, 2].map((i) => {
      const t = (frame / 10 + i / 3) % 1;
      return <path key={i} d={`M${100 + t * 40} ${-70 - t * 10} q${18 + t * 20} 30 0 ${60 + t * 20}`} fill="none" stroke={INK} strokeWidth={4} opacity={waves * (1 - t) * 0.7} />;
    })}
  </g>
);

/** A cereal bowl on the table top, in front of the seated figure. */
export const Bowl: React.FC = () => (
  <g transform={`translate(${KP.bowl.x} ${KP.bowl.y})`}>
    <path d="M-62 -40 Q0 22 62 -40Z" fill="#f2efe6" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={-40} rx={62} ry={10} fill="#e8b45a" stroke={INK} strokeWidth={3} />
  </g>
);

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
  /** You by the counter (default) or gone. */
  youHere?: boolean;
  /** The radio's sound waves, 0..1. */
  radio?: number;
}

/** The flatmate at the table with his cereal (the Click and the Rule), his counter over him. */
export const MateAtTable: React.FC<{ frame: number; s: KitchenState }> = ({ frame, s }) => {
  const probe = seatAt(SEAT_BASE);
  const head = headWorld(probe);
  const mouth = { x: head.x + head.r * 0.5, y: head.y + head.r * 0.55 };
  const bowl = { x: KP.bowl.x - 10, y: KP.bowl.y - 40 };
  const up = Math.sin(Math.min(1, s.spoon) * Math.PI);
  let armF: [number, number] = aim(probe, { x: bowl.x + (mouth.x - bowl.x) * up, y: bowl.y + (mouth.y - bowl.y) * up });
  let armB: [number, number] = [70, 50];
  if (s.check) armF = aim(probe, { x: head.x + head.r * 1.5, y: head.y + head.r * 0.2 * (1 - s.check) });
  if (s.pat) armB = aim(probe, { x: head.x - head.r * 0.2, y: head.y - head.r * 1.1 - Math.sin(frame * 0.8) * 6 * s.pat });
  const shrug = s.shrug ?? 0;
  const mate = seatAt({ ...SEAT_BASE, armF, armB: shrug > 0 ? [60 - 40 * shrug, 120 * shrug] : armB, tilt: shrug * 8 });
  const spoon = handWorld(mate, "armF");
  const k = mate.scale;
  return (
    <g>
      <Figure x={mate.x} y={mate.y} scale={k} facing={1} pose={mate.pose} head={FLATMATE.head} coat={FLATMATE.coat} time={frame}
        brows={s.mate.brows} lids={s.mate.lids} mouth={s.mate.mouth} eyes={s.mate.eyes} look={s.mate.look} blink={s.mate.blink} />
      <line x1={spoon.x} y1={spoon.y} x2={spoon.x + 13 * k} y2={spoon.y - 4 * k} stroke="#b8bec8" strokeWidth={3 * k} strokeLinecap="round" />
      <ellipse cx={spoon.x + 16 * k} cy={spoon.y - 4 * k} rx={5 * k} ry={3.2 * k} fill="#b8bec8" stroke={INK} strokeWidth={1.4 * k} />
    </g>
  );
};

/** His counter, blinking on at `count.on`. */
export const MateCount: React.FC<{ frame: number; count: NonNullable<KitchenState["count"]>; size?: number }> = ({ frame, count, size = 40 }) => {
  const c = counterOver(seatAt(SEAT_BASE), size);
  const on = count.on;
  const alpha = on !== undefined && frame >= on && frame < on + 16 ? (Math.floor((frame - on) / 3) % 2 ? 0.35 : 1) : 1;
  return (
    <g opacity={alpha}>
      <Counter x={c.x} y={c.y} base={count.base} ticks={count.ticks} frame={frame} size={size} on={on} id="mate-count" />
    </g>
  );
};

/** The counter's light on the seated face. */
export const mateLight = (size = 40, strength = 0.45) => counterLight(counterOver(seatAt(SEAT_BASE), size), strength, 200);

/** You standing by the counter with your lanyard and mug. */
export const YouStanding: React.FC<{ frame: number; s: KitchenState }> = ({ frame, s }) => {
  const you = standAt(s.youPose ?? { ...STAND, armF: [40, 90] });
  const hand = handWorld(you);
  return (
    <g>
      <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
        brows={s.you.brows} lids={s.you.lids} mouth={s.you.mouth} eyes={s.you.eyes} look={s.you.look} blink={s.you.blink} />
      <Lanyard f={you} />
      <HeroMug x={hand.x} y={hand.y} scale={you.scale} tilt={10} steam={false} />
    </g>
  );
};
