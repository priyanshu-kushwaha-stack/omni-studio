// The Weapon at the counter (builder A's Store set, script v7, lines 59-61), fluorescent white against the dark street.
//   59  "And every night at the counter:": the store wide, your best friend by the chiller, you at the counter, the cat.
//   60  "You want half?": he holds out a huge half and a stub (outside review of v6, sheet 23: unequal on purpose); in the
//       pause your hand measures them, a teal bracket over the big one, then a tiny one over the stub.
//   61  "You take the smaller half. On principle.": your hand takes the stub; your chin up, eyes shut. "And his number
//       keeps going down.": close on him, the big half still out, his card snaps open on -84 and ticks down a night at a
//       time, click, click, to -88 (a visible time jump, not one flap).
import { Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Chocolate, headAt, Meter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp } from "../shared";
import { INK, TEAL } from "@whatif/kit/theme";
import { interpolate } from "remotion";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { armTo } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

/** The clerk: a pastel head and the store's teal uniform. */
const CLERK = { head: PASTELS[4], coat: "#2f7f74" } as const;
const MX = 1000;
const YX = 1290;
/** His card at the end of the beat: down from week two's -86. */
export const HALF_VALUE = -88;
/** It opens on week one's -84 and ticks down to -88, one night per tick. */
const OPEN_VALUE = -84;
const TICK = 7;

/** A teal dimension bracket |<-->| of width w centred at (x, y), drawn in from `at`. */
const Measure: React.FC<{ frame: number; at: number; x: number; y: number; w: number }> = ({ frame, at, x, y, w }) => {
  if (frame < at) return null;
  const t = ramp(frame, at, at + 5);
  const h = (w * t) / 2;
  return (
    <g stroke={TEAL} strokeWidth={4} strokeLinecap="round">
      <line x1={x - h} y1={y} x2={x + h} y2={y} />
      <line x1={x - h} y1={y - 9} x2={x - h} y2={y + 9} />
      <line x1={x + h} y1={y - 9} x2={x + h} y2={y + 9} />
      <circle cx={x} cy={y} r={2} fill={INK} stroke="none" />
    </g>
  );
};

/** A point eased between keyframes [frame, point], held at both ends (frames forced strictly increasing). */
function pathAt(frame: number, raw: [number, { x: number; y: number }][]) {
  const keys: [number, { x: number; y: number }][] = [];
  for (const [f, p] of raw) keys.push([keys.length ? Math.max(f, keys[keys.length - 1][0] + 1) : f, p]);
  const f = keys.map((k) => k[0]);
  const o = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  return { x: interpolate(frame, f, keys.map((k) => k[1].x), o), y: interpolate(frame, f, keys.map((k) => k[1].y), o) };
}

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
  // your front hand: over the big half (measuring), over the stub, then it takes the stub and comes back with it
  const rest: Pose = { ...STAND, armF: [30, 60] };
  const restHand = handOf(YX, floor, s, rest, -1, "front");
  const overBig = { x: big.x + 34, y: big.y - 46 }, overSmall = { x: small.x - 4, y: small.y - 40 };
  const target = pathAt(frame, [[k.half + 6, restHand], [k.half + 16, overBig], [k.half + 26, overBig], [k.half + 33, overSmall], [k.take, overSmall],
    [k.take + 10, { x: small.x + 4, y: small.y }], [k.take + 16, { x: small.x + 4, y: small.y }], [k.take + 30, restHand]]);
  const reach = ramp(frame, k.half + 6, k.half + 14) * (1 - ramp(frame, k.take + 18, k.take + 30));
  const yPose: Pose = { ...rest, lean: 6 * reach, armF: armTo(YX, floor, s, { ...rest, lean: 6 * reach }, -1, target) };
  const got = frame >= k.take + 12;
  const yh = headAt(YX, floor, s, yPose, -1);
  const myHand = handOf(YX, floor, s, yPose, -1, "front");
  const tick = Math.max(0, Math.min(OPEN_VALUE - HALF_VALUE, Math.floor((frame - k.down - 24) / TICK) + 1));
  const value = OPEN_VALUE - tick;
  const proud = frame >= k.principle;
  const yourFace = proud
    ? { brows: "flat" as const, lids: 0.75, mouth: "smirk" as const, eyes: 1, look: { x: 0.2, y: -0.6 } }
    : frame >= k.half + 10 ? { brows: "raised" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.5 } }
    : { brows: "none" as const, lids: 0.25, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.1 } };
  const hisFace = frame >= k.down
    ? { brows: "sad" as const, lids: 0.4, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.1 } }
    : frame >= k.take + 10 ? { brows: "worry" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: 0.6, y: 0.4 } }
    : frame >= k.half ? { brows: "raised" as const, lids: 0.1, mouth: frame < k.take ? "open" as const : "smile" as const, eyes: 1, look: { x: 0.95, y: 0 } }
    : { brows: "none" as const, lids: 0, mouth: "smile" as const, eyes: 1, look: { x: 0.8, y: 0.2 } };
  const mid = { x: (big.x + yh.x) / 2, y: big.y - 20 };
  const cams: Record<View, Camera> = {
    store: camAt(frame, [[k.store, { x: 1020, y: 640, zoom: 1.2 }], [k.half, { x: 1080, y: 650, zoom: 1.32 }]]),
    half: camAt(frame, [[k.half, { x: 1150, y: 620, zoom: 1.75 }], [k.half + 12, { x: mid.x - 40, y: mid.y, zoom: 2.4 }], [k.take, { x: mid.x - 50, y: mid.y, zoom: 2.5 }]]),
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
          {out > 0.2 && <Chocolate x={big.x + 6} y={big.y - 8} scale={1.2} half="right" tilt={-8} />}
          <Chocolate x={smallAt.x + (got ? -4 : 4)} y={smallAt.y - 4} scale={0.34} half="left" tilt={got ? 10 : -20} />
          {frame < k.take && <Measure frame={frame} at={k.half + 15} x={big.x + 34} y={big.y - 52} w={58} />}
          {frame < k.take && <Measure frame={frame} at={k.half + 32} x={small.x - 4} y={small.y - 34} w={18} />}
          <Meter frame={frame} at={k.down} x={mh.x} headY={mh.y} r={mh.r} value={value} until={k.end} />
          <Figure {...HERO} x={YX} y={floor} scale={s} facing={-1} pose={yPose} {...yourFace} blink={!proud && blinking(frame, 1)} time={frame} />
        </>
      } />
      {/* a click per night as the number keeps going down */}
      {Array.from({ length: OPEN_VALUE - HALF_VALUE }, (_, i) => (
        <Sequence key={i} from={k.down + 24 + i * TICK} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>
      ))}
    </LookContext.Provider>
  );
};
