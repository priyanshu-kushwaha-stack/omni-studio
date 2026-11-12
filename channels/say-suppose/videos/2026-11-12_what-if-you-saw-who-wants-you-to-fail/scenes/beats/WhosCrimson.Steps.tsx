// Who's Red, lines 28-31: the academy steps at dusk (builder A's AcademyStreet, street view), you and your best friend
// sitting with your bags between your feet. No card opens: you said nothing good.
//
// The performed moment (script v2.1, two holds round his bubble; the narrator is silent, in the gap after line 28):
//   you point straight up at the air above his head, mouth open. He follows your finger: looks up, sees nothing, looks
//   at the sky, then at you, brows up. "What number?" He pats the top of his own head twice, checking, then laughs and
//   shoves your shoulder.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { Backpack, setLook } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, headAt } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, ramp } from "../shared";
import { ACADEMY, academyLights, AcademyStreetBack } from "../sets/AcademyStreet";
import { armTo } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

/** You on the landing's edge (ACADEMY.sitYou); he sits closer than the set's spot so his hand can reach your shoulder. */
const SY = ACADEMY.sitYou;
const SM = { ...ACADEMY.sitMinjun, x: 432 };
const yY = seatedY(SY.seatTop, SY.scale);
const mY = seatedY(SM.seatTop, SM.scale);
/** Pointing straight up: upper arm forward, forearm up, the hand in front of your face, not across it (you face 1). */
const POINT: Pose = { ...SEATED, armF: [95, 55] };

type View = "steps" | "point" | "up" | "back" | "ask" | "pat" | "pair" | "yours" | "wide";

/** His eyes through the moment: your face, your finger, straight up, the sky, you again. */
function minjunFace(frame: number, k: CrimsonTimes, view: View) {
  if (view === "steps") return { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0 } };
  if (frame < k.follow) return { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: 0.95, y: 0 } };
  if (frame < k.up) return { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.75, y: -0.6 } };
  if (frame < k.sky) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: 0.05, y: -1 } };
  if (frame < k.back) return { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: -0.75, y: -0.9 } };
  if (frame < k.ask) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.15, look: { x: 0.95, y: -0.05 } };
  if (frame < k.pat) return { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: 0.95, y: 0 } };
  if (frame < k.laugh) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: 0.2, y: -0.85 } };
  if (frame < k.yours) return { brows: "raised" as const, lids: 0.2, mouth: frame < k.pair + 20 ? "open" as const : "smile" as const, eyes: 1, look: { x: 0.9, y: 0 } };
  return { ...EXPRESSIONS.happy, look: { x: 0.9, y: -0.1 } };
}

function yourFace(frame: number, k: CrimsonTimes, view: View) {
  if (view === "steps") return { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: -0.3 } };
  if (frame < k.back) return { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.1, look: { x: 0.8, y: -0.75 } };
  if (frame < k.laugh) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.85, y: -0.5 } };
  if (frame < k.yours) return { brows: "none" as const, lids: 0.2, mouth: "smile" as const, eyes: 1, look: { x: 0.85, y: -0.55 } };
  return { brows: "worry" as const, lids: 0.25, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: -0.7 } };
}

export const StepsShot: React.FC<{ frame: number; k: CrimsonTimes }> = ({ frame, k }) => {
  const mood: MoodName = "dusk";
  const view = current<View>(frame, [[0, "steps"], [k.point, "point"], [k.up, "up"], [k.back, "back"], [k.ask, "ask"], [k.pat, "pat"],
    [k.pair, "pair"], [k.yours, "yours"], [k.wide, "wide"]]);
  // you: the arm goes up and stays while he looks; down when he looks back at you; rocked back by the shove
  const point = ramp(frame, k.point + 2, k.point + 12) * (1 - ramp(frame, k.back + 4, k.back + 16));
  const rock = ramp(frame, k.shove + 2, k.shove + 8) * (1 - ramp(frame, k.shove + 14, k.shove + 30));
  const yBase = lerpPose(SEATED, POINT, point);
  const yPose: Pose = { ...yBase, lean: yBase.lean - 12 * rock };
  const yx = SY.x - 8 * rock;
  const yh = headAt(yx, yY, SY.scale, yPose, SY.facing);
  // him: the back hand pats the top of his head twice; then the front hand shoves your shoulder
  const lookUp = ramp(frame, k.up - 4, k.up + 6) * (1 - ramp(frame, k.back - 4, k.back + 4));
  const mBase: Pose = { ...SEATED, tilt: -16 * lookUp, lean: 22 * ramp(frame, k.shove - 6, k.shove + 2) * (1 - ramp(frame, k.shove + 12, k.shove + 26)) };
  const mh0 = headAt(SM.x, mY, SM.scale, mBase, SM.facing);
  const patting = frame >= k.pat - 6 && frame < k.laugh + 6;
  const patUp = ramp(frame, k.pat - 6, k.pat) * (1 - ramp(frame, k.laugh, k.laugh + 6));
  const tap = Math.abs(Math.sin(((frame - k.pat) / (k.laugh - k.pat)) * Math.PI * 2)) * 12;
  const armB: [number, number] = patting
    ? (() => { const a = armTo(SM.x, mY, SM.scale, mBase, SM.facing, { x: mh0.x + 4, y: mh0.y - mh0.r * 0.9 - tap }); return [mix(SEATED.armB[0], a[0], patUp), mix(SEATED.armB[1], a[1], patUp)]; })()
    : SEATED.armB;
  const shoving = ramp(frame, k.shove - 6, k.shove + 2) * (1 - ramp(frame, k.shove + 12, k.shove + 26));
  const yShoulder = { x: yx + 14 * SY.scale, y: yY - 205 * SY.scale };
  const shoveArm = armTo(SM.x, mY, SM.scale, mBase, SM.facing, yShoulder);
  const mPose: Pose = { ...mBase, armB, armF: [mix(SEATED.armF[0], shoveArm[0], shoving), mix(SEATED.armF[1], shoveArm[1], shoving)] };
  const mh = headAt(SM.x, mY, SM.scale, mPose, SM.facing);
  const cams: Record<View, Camera> = {
    steps: camAt(frame, [[k.steps, { x: 420, y: 800, zoom: 1.5 }], [k.point, { x: 400, y: 810, zoom: 1.75 }]]),
    point: camAt(frame, [[k.point, { x: 372, y: 790, zoom: 2.55 }], [k.up, { x: 380, y: 785, zoom: 2.7 }]]),
    up: camAt(frame, [[k.up, closeUp(mh.x + 10, mh.y - 30, 3.8)], [k.sky, closeUp(mh.x + 10, mh.y - 80, 3.8)], [k.back, closeUp(mh.x + 10, mh.y - 90, 3.9)]]),
    back: camAt(frame, [[k.back, { x: 372, y: 805, zoom: 2.7 }], [k.ask, { x: 372, y: 805, zoom: 2.8 }]]),
    ask: camAt(frame, [[k.ask, closeUp(mh.x + 40, mh.y - 45, 3.6)], [k.pat, closeUp(mh.x + 40, mh.y - 45, 3.7)]]),
    pat: camAt(frame, [[k.pat, { x: 372, y: 805, zoom: 2.55 }], [k.pair, { x: 372, y: 810, zoom: 2.45 }]]),
    pair: camAt(frame, [[k.pair, { x: 372, y: 805, zoom: 2.3 }], [k.yours, { x: 372, y: 800, zoom: 2.45 }]]),
    yours: camAt(frame, [[k.yours, closeUp(yh.x - 10, yh.y - 20, 4.0)], [k.wide, closeUp(yh.x - 10, yh.y - 24, 4.2)]]),
    wide: camAt(frame, [[k.wide, { x: 520, y: 800, zoom: 1.5 }], [k.end, { x: 700, y: 640, zoom: 0.95 }]]),
  };
  const cam = drift(cams[view], frame, "steps", view === "wide" ? 4 : 2);
  return (
    <LookContext.Provider value={setLook(academyLights("street"), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<AcademyStreetBack cam={cam} mood={mood} frame={frame} view="street" />} actors={
        <>
          <Backpack x={366} y={1002} scale={0.36} color="#3d6fb0" />
          <Figure {...MINJUN} x={SM.x} y={mY} scale={SM.scale} facing={SM.facing} pose={mPose} {...minjunFace(frame, k, view)} blink={blinking(frame, 2)} time={frame} />
          <Figure {...HERO} x={yx} y={yY} scale={SY.scale} facing={SY.facing} pose={yPose} {...yourFace(frame, k, view)} blink={blinking(frame, 1)} time={frame} />
          {/* the patting hand, drawn over the crown (the back arm itself stays behind his head) */}
          {patting && patUp > 0.5 && <circle cx={mh.x + 4} cy={mh.y - mh.r * 0.92 - tap} r={11 * SM.scale * 1.15} fill={MINJUN.head} stroke="#23252b" strokeWidth={3} />}
          <Bubble frame={frame} at={k.ask} until={k.askEnd} x={mh.x + mh.r * 0.3} y={mh.y - mh.r * 1.1} text="What number?" size={20} side="right" />
        </>
      } />
    </LookContext.Provider>
  );
};
