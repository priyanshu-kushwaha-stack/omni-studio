// The flat's kitchen in the morning (library `kitchen`, kettle on, rain on the window): a small table in front of the
// counter, you on the left chair, your flatmate on the right over a bowl of cereal, a spoon in her hand (milk dripping
// off it when it stops mid-air); the cardboard keyboard, the bowl she taps in time, a plate of eggs you slide across
// and she pushes back with one finger. Shared by Night One (Piano.tsx) and Seven Years a Week.
import { kitchen } from "@whatif/kit/sets/Kitchen";
import { setLook } from "@whatif/kit/sets/common";
import { SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { Chair } from "../sets/common";
import { mix, noise } from "../shared";
import { aimArm, handAt, Person, type Body, type Face } from "./TellMeTomorrow.Kit";

export const KITCHEN = {
  floor: 960,
  table: { from: 660, to: 1180, top: 800 },
  seatTop: 850,
  you: 540,
  mate: 1300,
  bowl: { x: 1090, y: 800 },
  card: { x: 820, y: 800 },
  toast: { from: 1010, to: 870, y: 800 },
};
const S = 1.15;

export interface KitchenState {
  /** Your x (walking in) and whether you're seated. */
  youX?: number;
  youSeated: boolean;
  youFace: Face;
  /** The cardboard keyboard: null (none), 0..1 coming up from the floor onto the table, then on it. */
  card?: number | null;
  /** Your hands play the cardboard. */
  playing?: boolean;
  mateFace: Face;
  /** Her spoon hand: "eat" (bowl to mouth), "still", "tap" (tapping the bowl in time), "toast" (sliding it). */
  spoon?: "eat" | "still" | "tap" | "toast" | "talk";
  /** The toast plate 0 (her side) .. 1 (yours). */
  toast?: number;
  /** Her x when she gets up and goes (null: seated). */
  mateWalk?: number | null;
  /** A plate of eggs on the table at x (world), slid by you ("you": your front hand on it) or pushed back by her
   *  ("her": one finger on its far rim). */
  plate?: { x: number; by?: "you" | "her" } | null;
  /** Milk dripping off her stopped spoon. */
  drip?: boolean;
  /** Your pose, overriding the one the state implies (the flourish, chin up, hands behind your head). */
  youPose?: Pose;
}

/** Rain streaks on the kitchen window (the kit window is at 140, 200, 360 x 300 on its 0.85 layer). */
const Rain: React.FC<{ frame: number }> = ({ frame }) => (
  <g opacity={0.6}>
    {Array.from({ length: 16 }, (_, i) => {
      const x = 160 + noise(i) * 320;
      const y = 210 + ((noise(i + 20) * 280 + frame * 9) % 280);
      return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke="#dbe8f6" strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

/** A plate of two fried eggs. */
const Eggs: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-6} rx={78} ry={14} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[-28, 26].map((dx) => (
      <g key={dx}>
        <path d={`M${dx - 30} -12 q4 -16 22 -14 q14 -10 28 2 q10 10 -6 14 q-20 6 -44 -2Z`} fill="#fffaf0" stroke={INK} strokeWidth={3} />
        <ellipse cx={dx} cy={-16} rx={11} ry={8} fill="#f2b632" stroke={INK} strokeWidth={3} />
      </g>
    ))}
  </g>
);

/** Her spoon, in her front hand (figure-local units). */
const Spoon: React.FC = () => (
  <g transform="rotate(-30)">
    <line x1={0} y1={0} x2={0} y2={-34} stroke="#9aa1ab" strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={0} cy={-40} rx={8} ry={11} fill="#c9ced6" stroke={INK} strokeWidth={2.5} />
  </g>
);

export const KitchenScene: React.FC<{ frame: number; cam: Camera; mood: MoodName; s: KitchenState }> = ({ frame, cam, mood, s }) => {
  const K = KITCHEN;
  const options = { ...kitchen.defaults, stove: "kettle" as const, steam: 0.4, counter: [] };
  const props = { cam, mood, frame, options };

  // you
  const seatY = seatedY(K.seatTop, S);
  const youBase: Body = s.youSeated ? { x: K.you, y: seatY, scale: S, facing: 1, pose: SEATED } : { x: s.youX ?? K.you, y: K.floor, scale: S, facing: 1, pose: STAND };
  const card = s.card ?? null;
  const cardPos = card === null ? null : card < 1 ? { x: mix(K.you + 40, K.card.x, card), y: mix(K.floor - 60, K.card.y - 8, card) - Math.sin(card * Math.PI) * 80 } : { x: K.card.x, y: K.card.y - 8 };
  let youPose: Pose = s.youSeated ? { ...SEATED, lean: 6, armF: [40, 50], armB: [20, 50] } : walkPose(frame * 0.3);
  if (s.youSeated && cardPos && card !== null && card < 1) youPose = { ...youPose, lean: 14, armF: aimArm({ ...youBase, pose: { ...youPose, lean: 14 } }, cardPos) };
  if (s.youSeated && s.plate?.by === "you") youPose = { ...youPose, lean: 16, armF: aimArm({ ...youBase, pose: { ...youPose, lean: 16 } }, { x: s.plate.x - 60, y: K.table.top - 10 }) };
  if (s.youSeated && s.playing) {
    const p = Math.sin(frame / 3) * 10;
    const lean = { ...SEATED, lean: 14 };
    youPose = { ...lean, armF: aimArm({ ...youBase, pose: lean }, { x: K.card.x + 40 + p, y: K.card.y - 14 }), armB: aimArm({ ...youBase, pose: lean }, { x: K.card.x - 40 - p, y: K.card.y - 14 }) };
  }

  // her
  const walking = s.mateWalk !== undefined && s.mateWalk !== null;
  const mateBase: Body = walking ? { x: s.mateWalk as number, y: K.floor, scale: S, facing: 1, pose: walkPose(frame * 0.3) } : { x: K.mate, y: seatY, scale: S, facing: -1, pose: SEATED };
  let matePose: Pose = mateBase.pose;
  const lean = { ...SEATED, lean: 10 };
  if (!walking) {
    const spoon = s.spoon ?? "eat";
    if (spoon === "eat") matePose = { ...lean, armF: [120 + Math.sin(frame / 10) * 20, 50], armB: aimArm({ ...mateBase, pose: lean }, { x: K.bowl.x + 30, y: K.bowl.y - 6 }) };
    else if (spoon === "still") matePose = { ...lean, armF: [95, 40], armB: aimArm({ ...mateBase, pose: lean }, { x: K.bowl.x + 30, y: K.bowl.y - 6 }) };
    else if (spoon === "tap") matePose = { ...lean, armF: aimArm({ ...mateBase, pose: lean }, { x: K.bowl.x + 10, y: K.bowl.y - 30 + (frame % 8 < 3 ? 10 : -6) }), armB: [20, 40] };
    else if (spoon === "talk") matePose = { ...SEATED, lean: 4, armF: [70 + Math.sin(frame / 6) * 10, 70], armB: [20, 40] };
    else matePose = { ...lean, lean: 18, armF: aimArm({ ...mateBase, pose: { ...lean, lean: 18 } }, { x: mix(K.toast.from, K.toast.to, s.toast ?? 0) + 30, y: K.toast.y - 10 }), armB: [20, 40] };
    if (s.plate?.by === "her") matePose = { ...lean, lean: 16, armF: aimArm({ ...mateBase, pose: { ...lean, lean: 16 } }, { x: s.plate.x + 70, y: K.table.top - 14 }), armB: [30, 60] };
  }
  if (s.youPose) youPose = s.youPose;
  const toastX = mix(K.toast.from, K.toast.to, s.toast ?? 0);
  const spoon = !walking && s.spoon !== "talk" && s.spoon !== "toast" && s.plate?.by !== "her";
  const spoonHand = handAt({ ...mateBase, pose: matePose }, "front");

  return (
    <LookContext.Provider value={setLook(kitchen.lights(options), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<>{kitchen.Back(props)}<g transform={`translate(${(cam.x - 960) * 0.15} ${(cam.y - 540) * 0.15})`}><Rain frame={frame} /></g></>}
        actors={
          <>
            <Chair x={K.you} y={K.seatTop} scale={1.1} facing={1} />
            <Chair x={K.mate} y={K.seatTop} scale={1.1} facing={-1} />
            <Person who="you" b={{ ...youBase, pose: youPose }} face={s.youFace} frame={frame} />
            <Person who="mate" b={{ ...mateBase, pose: matePose }} face={s.mateFace} frame={frame} seed={5} held={spoon ? <Spoon /> : undefined} />
            {/* the table, over your laps */}
            <rect x={K.table.from + 30} y={K.table.top + 10} width={16} height={K.floor - K.table.top - 10} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
            <rect x={K.table.to - 46} y={K.table.top + 10} width={16} height={K.floor - K.table.top - 10} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
            <rect x={K.table.from} y={K.table.top} width={K.table.to - K.table.from} height={22} rx={6} fill="#8a6a4f" stroke={INK} strokeWidth={5} />
            {/* the bowl, the toast, the fancy plate, the cardboard */}
            {!walking && <g>
              <path d={`M${K.bowl.x - 50} ${K.bowl.y - 40} Q${K.bowl.x} ${K.bowl.y + 10} ${K.bowl.x + 50} ${K.bowl.y - 40}Z`} fill="#7fa0c4" stroke={INK} strokeWidth={4} />
              <ellipse cx={K.bowl.x} cy={K.bowl.y - 40} rx={50} ry={9} fill="#f2e6c8" stroke={INK} strokeWidth={3} />
            </g>}
            {s.toast !== undefined && <g transform={`translate(${toastX} ${K.toast.y})`}>
              <ellipse cx={0} cy={-6} rx={56} ry={10} fill={PAPER} stroke={INK} strokeWidth={4} />
              <rect x={-30} y={-46} width={60} height={42} rx={14} fill="#d9a35a" stroke={INK} strokeWidth={4} />
            </g>}
            {s.plate && <Eggs x={s.plate.x} y={K.table.top} />}
            {s.plate?.by === "her" && <line x1={spoonHand.x} y1={spoonHand.y} x2={spoonHand.x - 16} y2={spoonHand.y + 2} stroke="#c9b4ec" strokeWidth={8} strokeLinecap="round" />}
            {spoon && s.drip && [0, 1, 2].map((d) => {
              const q = ((frame + d * 9) % 27) / 27;
              return <ellipse key={d} cx={spoonHand.x - 22} cy={spoonHand.y - 24 + q * (K.table.top - spoonHand.y + 10)} rx={5} ry={7} fill="#fbfaf4" stroke={INK} strokeWidth={2} opacity={1 - q * 0.3} />;
            })}
            {cardPos && <g transform={`translate(${cardPos.x} ${cardPos.y}) rotate(${card !== null && card < 1 ? -20 * (1 - card) : 0})`}>
              <rect x={-100} y={-14} width={200} height={16} rx={2} fill="#c9a06a" stroke={INK} strokeWidth={4} />
              {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-90 + i * 22} y1={-14} x2={-90 + i * 22} y2={2} stroke={INK} strokeWidth={2} />)}
            </g>}
          </>
        }
        front={kitchen.Front?.(props)} />
    </LookContext.Provider>
  );
};
