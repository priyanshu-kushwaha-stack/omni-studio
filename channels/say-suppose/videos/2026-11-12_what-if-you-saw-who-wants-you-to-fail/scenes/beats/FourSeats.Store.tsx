// Four Seats, lines 53-54 and the hold: the store at night (builder A's set), fluorescent white against the dark street.
// Min-jun holds out his half of the kimbap: "Half?" You walk past it, to the door, without looking. His hand stays out
// a beat too long, then drops.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, headAt, Kimbap } from "../parts";
import { blinking, camAt, current, HERO, linear, MINJUN, mix, ramp } from "../shared";
import { STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { CLERK } from "./WhosCrimson.Out";
import type { SeatsTimes } from "./FourSeats.Times";

/** Min-jun by the chiller, facing the counter (and you); you leave from the counter to the door. */
const MX = 1060;
const YOU_FROM = 1520;
const YOU_TO = 230;

/** A figure's front hand in world coordinates. */
function handOf(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1) {
  const j = joints(pose);
  const [u, f] = pose.armF;
  const a = dir(u), b = dir(u + f);
  return { x: x + (j.shoulder.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (j.shoulder.y + (a.y + b.y) * LIMB) * scale };
}

type StoreView = "store" | "half" | "past" | "hold";

export const StoreNight: React.FC<{ frame: number; k: SeatsTimes }> = ({ frame, k }) => {
  const mood: MoodName = "night";
  const view = current<StoreView>(frame, [[0, "store"], [k.half, "half"], [k.past, "past"], [k.hold, "hold"]]);
  const s = STORE.scale, floor = STORE.floor;
  // his arm: out with the half from just before "Half?", held, then dropped
  const out = ramp(frame, k.half - 14, k.half) * (1 - ramp(frame, k.drop, k.drop + 16));
  const mPose: Pose = { ...STAND, lean: mix(0, 4, out), armF: [mix(18, 86, out), mix(22, 4, out)] };
  const hand = handOf(MX, floor, s, mPose, 1);
  const mh = headAt(MX, floor, s, mPose, 1);
  // you: at the counter, then walking to the door past him, not looking
  const walk = linear(frame, k.past - 6, k.drop + 10);
  const yx = mix(YOU_FROM, YOU_TO, walk);
  const yPose = walk > 0 && walk < 1 ? walkPose(frame * 0.32) : STAND;
  const passed = yx < MX - 40;
  const mFace = frame >= k.drop
    ? { brows: "sad" as const, lids: 0.5, mouth: "flat" as const, eyes: 1, look: { x: 0.2, y: 0.8 } }
    : passed
      ? { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1, look: { x: -0.9, y: 0.05 } }
      : { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1, look: { x: 0.95, y: 0 } };
  const cams: Record<StoreView, Camera> = {
    store: camAt(frame, [[k.store, { x: 1120, y: 650, zoom: 1.28 }], [k.half, { x: 1140, y: 660, zoom: 1.4 }]]),
    half: camAt(frame, [[k.half, { x: 1210, y: 690, zoom: 1.75 }], [k.past, { x: 1200, y: 690, zoom: 1.8 }]]),
    past: camAt(frame, [[k.past, { x: 1160, y: 690, zoom: 1.7 }], [k.hold, { x: 980, y: 690, zoom: 1.6 }]]),
    hold: camAt(frame, [[k.hold, { x: (mh.x + hand.x) / 2 + 20, y: mh.y + 70, zoom: 2.5 }], [k.climb, { x: (mh.x + hand.x) / 2 + 10, y: mh.y + 60, zoom: 2.75 }]]),
  };
  const cam = drift(cams[view], frame, "storeN", 3);
  const c = STORE.clerk;
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={
        <>
          <Figure {...CLERK} x={c.x} y={c.y} scale={c.scale} facing={c.facing} brows="none" lids={0.5} mouth="flat" eyes={1}
            look={{ x: 0.3, y: 0.6 }} blink={blinking(frame, 7)} time={frame} />
          <StoreCounter />
          <Figure {...MINJUN} x={MX} y={floor} scale={s} pose={mPose} {...mFace} blink={blinking(frame, 2)} time={frame}
            held={<Kimbap x={10} y={-26} scale={0.95} half />} />
          <Figure {...HERO} x={yx} y={floor} scale={s} facing={-1} pose={yPose} brows="flat" lids={0.3} mouth="flat" eyes={1}
            look={{ x: 0.9, y: 0.1 }} blink={blinking(frame, 1)} time={frame} />
          <Bubble frame={frame} at={k.half} until={k.hold} x={mh.x + mh.r * 0.4} y={mh.y - mh.r * 1.05} text="Half?" size={30} side="right" />
        </>
      } />
    </LookContext.Provider>
  );
};
