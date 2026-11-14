// The Weapon at the counter (builder A's Store set, script v5, lines 59-61), fluorescent white against the dark street.
//   59  "And every night at the counter:": the store wide, your best friend by the chiller, you at the counter, the cat.
//   60  "You want half?": he holds out the bigger half of the bar he has snapped, the smaller half in his other hand.
//   61  "You take the smaller half. On principle.": your hand goes past the big half and takes the small one; your chin up,
//       eyes shut. "And his number keeps going down.": close on him, the big half still out, his card snaps open on -88.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Chocolate, headAt, Meter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp } from "../shared";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { armTo } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

/** The clerk: a pastel head and the store's teal uniform. */
const CLERK = { head: PASTELS[4], coat: "#2f7f74" } as const;
const MX = 1000;
const YX = 1290;
/** His card at the end of the beat: down from week two's -86. */
export const HALF_VALUE = -88;

/** A figure's front or back hand in world coordinates. */
function handOf(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1, arm: "front" | "back" = "front") {
  const j = joints(pose);
  const [u, f] = arm === "front" ? pose.armF : pose.armB;
  const a = dir(u), b = dir(u + f);
  return { x: x + (j.shoulder.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (j.shoulder.y + (a.y + b.y) * LIMB) * scale };
}

type View = "store" | "half" | "take" | "proud" | "down";

export const StoreHalf: React.FC<{ frame: number; k: SeatsTimes }> = ({ frame, k }) => {
  const mood: MoodName = "night";
  const view = current<View>(frame, [[0, "store"], [k.half, "half"], [k.take, "take"], [k.principle + 6, "proud"], [k.down - 4, "down"]]);
  const s = STORE.scale, floor = STORE.floor;
  // his arms: the big half held out to you (front), the small half at his chest (back), from his line on
  const out = ramp(frame, k.half - 10, k.half + 2);
  const mPose: Pose = { ...STAND, lean: 4 * out, armF: [mix(40, 84, out), mix(60, 6, out)], armB: [mix(20, 60, out), mix(70, 50, out)] };
  const mh = headAt(MX, floor, s, mPose, 1);
  const big = handOf(MX, floor, s, mPose, 1, "front");
  const small = handOf(MX, floor, s, mPose, 1, "back");
  // your front arm reaches past the big half to the small one, then comes back with it
  const reachT = ramp(frame, k.take + 2, k.take + 14) * (1 - ramp(frame, k.take + 20, k.take + 32));
  const got = frame >= k.take + 16;
  const rest: Pose = { ...STAND, armF: [30, 60] };
  const reachPose: Pose = { ...STAND, lean: 6, armF: armTo(YX, floor, s, STAND, -1, { x: small.x + 6, y: small.y }) };
  const yPose: Pose = { ...rest, lean: mix(0, 6, reachT), armF: [mix(rest.armF[0], reachPose.armF[0], reachT), mix(rest.armF[1], reachPose.armF[1], reachT)] };
  const yh = headAt(YX, floor, s, yPose, -1);
  const myHand = handOf(YX, floor, s, yPose, -1, "front");
  const proud = frame >= k.principle;
  const yourFace = proud
    ? { brows: "flat" as const, lids: 0.75, mouth: "smirk" as const, eyes: 1, look: { x: 0.2, y: -0.6 } }
    : frame >= k.take ? { brows: "none" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.5 } }
    : { brows: "none" as const, lids: 0.25, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.1 } };
  const hisFace = frame >= k.down
    ? { brows: "sad" as const, lids: 0.4, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.1 } }
    : frame >= k.take + 10 ? { brows: "worry" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: 0.6, y: 0.4 } }
    : frame >= k.half ? { brows: "raised" as const, lids: 0.1, mouth: frame < k.take ? "open" as const : "smile" as const, eyes: 1, look: { x: 0.95, y: 0 } }
    : { brows: "none" as const, lids: 0, mouth: "smile" as const, eyes: 1, look: { x: 0.8, y: 0.2 } };
  const mid = { x: (big.x + yh.x) / 2, y: big.y - 20 };
  const cams: Record<View, Camera> = {
    store: camAt(frame, [[k.store, { x: 1020, y: 640, zoom: 1.2 }], [k.half, { x: 1080, y: 650, zoom: 1.32 }]]),
    half: camAt(frame, [[k.half, { x: 1150, y: 620, zoom: 1.75 }], [k.take, { x: 1150, y: 620, zoom: 1.85 }]]),
    take: camAt(frame, [[k.take, { x: mid.x - 60, y: mid.y, zoom: 2.6 }], [k.principle + 6, { x: mid.x - 70, y: mid.y, zoom: 2.75 }]]),
    proud: camAt(frame, [[k.principle + 6, closeUp(yh.x - 30, yh.y, 2.7)], [k.down - 4, closeUp(yh.x - 30, yh.y, 2.85)]]),
    down: camAt(frame, [[k.down - 4, closeUp(mh.x + 40, mh.y - 80, 2.2)], [k.end, closeUp(mh.x + 40, mh.y - 85, 2.4)]]),
  };
  const cam = drift(cams[view], frame, "half", 3);
  const c = { ...STORE.clerk, x: STORE.clerk.x - 90 };
  const smallAt = got ? myHand : small;
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={
        <>
          <Figure {...CLERK} x={c.x} y={c.y} scale={c.scale} facing={c.facing} brows={proud ? "raised" : "none"} lids={0.25} mouth="flat" eyes={1}
            look={{ x: 0.9, y: 0.1 }} blink={blinking(frame, 7)} time={frame} />
          <StoreCounter />
          <Cat {...STORE.cat} frame={frame} look={0.8} />
          <Figure {...MINJUN} x={MX} y={floor} scale={s} pose={mPose} {...hisFace} blink={blinking(frame, 2)} time={frame} />
          {/* the big half (front hand) and the small one (his back hand, then yours) */}
          {out > 0.2 && <Chocolate x={big.x + 10} y={big.y - 6} scale={0.85} half="right" tilt={-8} />}
          <Chocolate x={smallAt.x + (got ? -4 : 4)} y={smallAt.y - 4} scale={0.42} half="left" tilt={got ? 10 : -20} />
          <Meter frame={frame} at={k.down} x={mh.x} headY={mh.y} r={mh.r} value={HALF_VALUE} until={k.end} />
          <Figure {...HERO} x={YX} y={floor} scale={s} facing={-1} pose={yPose} {...yourFace} blink={!proud && blinking(frame, 1)} time={frame} />
        </>
      } />
    </LookContext.Provider>
  );
};
