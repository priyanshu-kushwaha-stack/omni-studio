// Four in a Hundred, line 48 and the performed moment after it (script v2.1, HOLD 5 s; the narrator is silent): the
// store at night (builder A's set), fluorescent white against the dark street. "Half?" Your best friend snaps his
// chocolate bar and holds out the bigger half, looking at you, half a smile. You look at the chocolate, then at the
// card over his head, still open on -88, then past him. You walk. His hand stays out one beat too long, then drops. He
// looks at the half in his hand, then puts both halves in his pocket.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, Chocolate, headAt, Meter } from "../parts";
import { blinking, camAt, current, HERO, linear, MINJUN, mix, PASTELS, ramp } from "../shared";
import { STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import type { SeatsTimes } from "./FourSeats.Times";

/** The clerk: a pastel head and the store's teal uniform, left of the till so the screen never covers the face. */
const CLERK = { head: PASTELS[4], coat: "#2f7f74" } as const;
/** Your best friend by the chiller, facing the counter (and you); you leave from the counter to the door. */
const MX = 1040;
const YOU_FROM = 1330;
const YOU_TO = 120;

/** A figure's front or back hand in world coordinates. */
function handOf(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1, arm: "front" | "back" = "front") {
  const j = joints(pose);
  const [u, f] = arm === "front" ? pose.armF : pose.armB;
  const a = dir(u), b = dir(u + f);
  return { x: x + (j.shoulder.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (j.shoulder.y + (a.y + b.y) * LIMB) * scale };
}

type View = "store" | "half" | "look" | "card" | "past" | "walk" | "stay" | "pocket";

/** His arms: the bar at his chest; snapped; the bigger half held out to you; held too long; dropped; pocketed. */
function hisPose(frame: number, k: SeatsTimes): Pose {
  const out = ramp(frame, k.offer, k.offer + 10) * (1 - ramp(frame, k.drop, k.drop + 14));
  const pocketIn = Math.round(mix(k.pocket, k.climb, 0.5));
  const away = ramp(frame, pocketIn, pocketIn + 10);
  const chest: [number, number] = [mix(40, 86, out), mix(60, 4, out)];
  const low: [number, number] = [mix(chest[0], -6, away), mix(chest[1], 34, away)];
  const back: [number, number] = frame < k.snap ? [30, 70] : [mix(30, -10, away), mix(70, 40, away)];
  const look = frame >= k.pocket && frame < pocketIn ? { armF: [mix(chest[0], 30, ramp(frame, k.pocket, k.pocket + 8)), 70] as [number, number] } : {};
  return { ...STAND, lean: mix(0, 5, out), armF: low, armB: back, ...look };
}

function hisFace(frame: number, k: SeatsTimes, passed: boolean) {
  if (frame >= k.pocket) return { brows: "sad" as const, lids: 0.5, mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: 0.85 } };
  if (frame >= k.drop) return { brows: "sad" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: -0.6, y: 0.3 } };
  if (passed) return { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1, look: { x: -0.9, y: 0.05 } };
  if (frame >= k.half) return { brows: "raised" as const, lids: 0.1, mouth: "smirk" as const, eyes: 1, look: { x: 0.95, y: 0 } };
  return { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: 0.5 } };
}

/** Your eyes in the close-up: the chocolate, the card over his head, then past him. */
function yourFace(frame: number, k: SeatsTimes) {
  if (frame < k.look) return { brows: "none" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.1 } };
  if (frame < k.card) return { brows: "none" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.6 } };
  if (frame < k.pastHim) return { brows: "flat" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: -0.8 } };
  return { brows: "flat" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0 } };
}

export const StoreNight: React.FC<{ frame: number; k: SeatsTimes }> = ({ frame, k }) => {
  const mood: MoodName = "night";
  const view = current<View>(frame, [[0, "store"], [k.half, "half"], [k.look, "look"], [k.card, "card"], [k.pastHim, "past"], [k.walk, "walk"], [k.stay, "stay"], [k.pocket, "pocket"]]);
  const s = STORE.scale, floor = STORE.floor;
  const mPose = hisPose(frame, k);
  const mh = headAt(MX, floor, s, mPose, 1);
  const front = handOf(MX, floor, s, mPose, 1, "front");
  const back = handOf(MX, floor, s, mPose, 1, "back");
  const pocketIn = Math.round(mix(k.pocket, k.climb, 0.5)) + 8;
  const snapped = frame >= k.snap;
  const walk = linear(frame, k.walk, k.drop + 6);
  const yx = mix(YOU_FROM, YOU_TO, walk);
  const yPose = walk > 0 && walk < 1 ? walkPose(frame * 0.34) : STAND;
  const yh = headAt(yx, floor, s, yPose, -1);
  const passed = yx < MX - 40;
  const cams: Record<View, Camera> = {
    store: camAt(frame, [[k.store, { x: 1120, y: 650, zoom: 1.28 }], [k.half, { x: 1150, y: 660, zoom: 1.4 }]]),
    half: camAt(frame, [[k.half, { x: 1190, y: 690, zoom: 1.75 }], [k.look, { x: 1180, y: 690, zoom: 1.85 }]]),
    look: camAt(frame, [[k.look, closeUp(yh.x - 40, yh.y, 2.7)], [k.card, closeUp(yh.x - 40, yh.y, 2.85)]]),
    card: camAt(frame, [[k.card, closeUp(mh.x + 40, mh.y - 90, 2.4)], [k.pastHim, closeUp(mh.x + 40, mh.y - 95, 2.5)]]),
    past: camAt(frame, [[k.pastHim, closeUp(yh.x - 40, yh.y, 2.85)], [k.walk, closeUp(yh.x - 40, yh.y, 2.95)]]),
    walk: camAt(frame, [[k.walk, { x: 1040, y: 690, zoom: 1.6 }], [k.stay, { x: 960, y: 690, zoom: 1.65 }]]),
    stay: camAt(frame, [[k.stay, { x: (mh.x + front.x) / 2 + 20, y: mh.y + 70, zoom: 2.5 }], [k.pocket, { x: (mh.x + front.x) / 2 + 10, y: mh.y + 60, zoom: 2.7 }]]),
    pocket: camAt(frame, [[k.pocket, { x: MX + 40, y: mh.y + 90, zoom: 2.2 }], [k.climb, { x: MX + 30, y: mh.y + 80, zoom: 2.35 }]]),
  };
  const cam = drift(cams[view], frame, "storeN", 3);
  const c = { ...STORE.clerk, x: STORE.clerk.x - 90 };
  const held = frame >= pocketIn ? null : snapped
    ? <Chocolate x={6} y={-6} scale={0.62} half="right" tilt={-80} />
    : <Chocolate x={6} y={-6} scale={0.55} tilt={-70} />;
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={
        <>
          <Figure {...CLERK} x={c.x} y={c.y} scale={c.scale} facing={c.facing} brows="none" lids={0.25} mouth="flat" eyes={1}
            look={{ x: 0.3, y: 0.6 }} blink={blinking(frame, 7)} time={frame} />
          <StoreCounter />
          {snapped && frame < pocketIn && <Chocolate x={back.x} y={back.y - 4} scale={0.5} half="left" tilt={-100} />}
          <Figure {...MINJUN} x={MX} y={floor} scale={s} pose={mPose} {...hisFace(frame, k, passed)} blink={blinking(frame, 2)} time={frame}
            held={held ?? undefined} />
          <Meter frame={frame} at={k.second} x={mh.x} headY={mh.y} r={mh.r} value={-88} until={k.climb} />
          <Figure {...HERO} x={yx} y={floor} scale={s} facing={-1} pose={yPose} {...yourFace(frame, k)} blink={blinking(frame, 1)} time={frame} />
          <Bubble frame={frame} at={k.half} until={k.halfEnd} x={mh.x + mh.r * 0.95} y={mh.y + mh.r * 0.25} text="Half?" size={30} side="right" />
        </>
      } />
    </LookContext.Provider>
  );
};
