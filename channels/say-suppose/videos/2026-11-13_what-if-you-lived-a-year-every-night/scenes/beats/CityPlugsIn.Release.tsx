// The City Plugs In, the prisoner served (story line 46): three nights in a pod, three years inside. He climbs out
// grey-eyed and bows to the court; asks to stay in, turns and dives back into the hatch, legs kicking; a guard walks in,
// takes him by the ankles and pulls him out; on "So is his bladder." he stands knees together, hopping, and bolts.
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook, worldOf } from "@whatif/kit/sets/common";
import { INK } from "@whatif/kit/theme";
import { PodHallBack, podHallLights, POD_ONE } from "../sets/PodHall";
import { camAt, mix, PASTELS, ramp } from "../shared";
import { aim, OnFace, Person, type Body } from "./CityPlugsIn.Kit";

const FLOOR = 960;
const SCALE = 1.1;
/** The hip's height above the feet for this scale (the Figure rotates about the hip). */
const HIP = 112 * SCALE;

export interface ReleaseTimes { start: number; bow: number; climb: number; guard: number; pull: number; bladder: number; end: number }

const rot = (x: number, y: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
};

export const ReleaseShot: React.FC<{ frame: number; k: ReleaseTimes }> = ({ frame, k }) => {
  const cam: Camera = drift(camAt(frame, [[k.start, { x: 700, y: 700, zoom: 1.7 }], [k.climb, { x: 720, y: 700, zoom: 1.75 }],
    [k.guard, { x: 820, y: 720, zoom: 1.55 }], [k.end, { x: 860, y: 720, zoom: 1.45 }]]), frame, "cp-rel", 2);
  // the hatch in this camera's world: its lip (bottom right of the opening) and its right post
  const lip = worldOf(cam, POD_ONE.x + POD_ONE.w - 18, POD_ONE.y + POD_ONE.h - 22, 0.85);
  const post = worldOf(cam, POD_ONE.x + POD_ONE.w - 20, POD_ONE.y, 0.85);
  // where he is and how he lies: out and bowing, back in (diving, legs kicking), pulled out, hopping
  const out = ramp(frame, k.start + 4, k.start + 26);
  const bow = ramp(frame, k.bow, k.bow + 10) * (1 - ramp(frame, k.climb - 6, k.climb));
  const dive = ramp(frame, k.climb + 8, k.climb + 18);
  const pulled = ramp(frame, k.pull, k.pull + 14);
  const bolt = ramp(frame, k.end - 14, k.end);
  const lying = dive * (1 - pulled);
  const standX = mix(lip.x + 40, 860, out);
  const backX = mix(standX, lip.x + 70, ramp(frame, k.climb, k.climb + 8));
  let x = frame < k.climb ? standX : mix(backX, lip.x + 30, dive);
  x = mix(x, lip.x + 230, pulled) + bolt * 700;
  const hipY = mix(FLOOR - HIP, lip.y - 10, lying);
  const angle = -82 * lying;
  const kick = lying > 0.5 ? Math.sin(frame / 2.2) * 30 : 0;
  const hop = frame >= k.bladder && bolt === 0 ? Math.abs(Math.sin(frame / 3.5)) * 16 : 0;
  let pose: Pose;
  if (frame < k.start + 26) pose = walkPose(frame * 0.25);
  else if (frame < k.climb) pose = { ...STAND, lean: 34 * bow, armF: [10, 20], armB: [-10, 20] };
  else if (frame < k.climb + 8) pose = walkPose(frame * 0.5);
  else if (lying > 0.05) pose = { ...STAND, armF: [170, 10], armB: [160, 10], legF: [10 + kick, -20], legB: [-10 - kick, -20] };
  else if (frame >= k.bladder) pose = bolt > 0 ? walkPose(frame * 0.9) : { ...STAND, lean: 8, armF: [12, 40], armB: [8, 44], legF: [-7, 4], legB: [7, -4] };
  else pose = { ...STAND, lean: -4, armF: [40, 30], armB: [30, 30] };
  const facing: 1 | -1 = frame >= k.climb && frame < k.pull + 14 ? -1 : 1;
  const pris: Body = { x, y: hipY + HIP - hop, scale: SCALE, facing, pose };
  // his ankles in the world (for the guard's grip): the feet rotate with him about the hip
  const feet = rot(0, HIP, angle);
  const ankles = { x: x + feet.x, y: hipY + feet.y };
  const guardIn = ramp(frame, k.guard, k.guard + 16);
  const tug = ramp(frame, k.pull - 4, k.pull + 6);
  const gx = mix(1400, ankles.x + 150, guardIn) + 60 * pulled;
  const guard: Body = { x: gx, y: FLOOR, scale: 1.15, facing: -1, pose: guardIn < 1 ? walkPose(frame * 0.35) : { ...STAND, lean: mix(10, -18, tug) } };
  if (guardIn >= 1 && pulled < 1) guard.pose = { ...guard.pose, armF: aim(guard, ankles), armB: aim(guard, { x: ankles.x + 10, y: ankles.y + 8 }) };
  if (pulled >= 1) guard.pose = { ...STAND, armF: [60, 70], armB: [50, 80], lean: 0 };
  const stubble = <g fill="#9a9a9a" opacity={0.7}>{[0, 6, 12, 18, 24].map((dx) => <circle key={dx} cx={-4 + dx} cy={30} r={2.2} />)}</g>;
  const greyEyes = { head: PASTELS[1], coat: "#8a8a8a" };
  const face = frame >= k.bladder
    ? { brows: "worry" as const, lids: 0, eyes: 1.3, mouth: "wobble" as const, look: { x: 1, y: 0.1 } }
    : lying > 0.5 ? { brows: "none" as const, lids: 0.62, mouth: "smile" as const, look: { x: 1, y: 0 } }
      : { brows: "flat" as const, lids: 0.62, mouth: bow > 0 ? "smile" as const : "flat" as const, look: { x: 1, y: 0.3 } };
  return (
    <LookContext.Provider value={setLook(podHallLights(), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodHallBack cam={cam} frame={frame} door={1} counter={{ value: "365" }} />}
        actors={
          <>
            <g transform={`rotate(${angle} ${x} ${hipY})`}>
              <Person body={{ ...pris, y: hipY + HIP - hop }} frame={frame} seed={9} temples who={{ ...greyEyes, ...face }} />
              <OnFace body={{ ...pris, y: hipY + HIP - hop }}>{stubble}</OnFace>
            </g>
            {/* the hatch's right post over his thighs while he is in it */}
            {lying > 0.3 && <rect x={post.x} y={post.y + 10} width={22} height={POD_ONE.h - 20} rx={6} fill="#262d45" stroke={INK} strokeWidth={5} />}
            <Person body={guard} frame={frame} seed={13} who={{ head: PASTELS[2], coat: "#2f3e6a", cap: "#2f3e6a", brows: pulled > 0.5 ? "flat" : "angry", lids: 0.3,
              mouth: tug > 0 && pulled < 1 ? "open" : "flat", look: { x: 1, y: 0.4 } }} />
          </>
        } />
    </LookContext.Provider>
  );
};
