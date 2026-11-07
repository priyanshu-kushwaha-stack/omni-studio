import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { FLOOR_Y, HomeBack, LAMP, stepTop } from "../sets/Home";
import { blinking, camAt, cutAt, linear, mix, ramp, type Shot } from "../shared";
import { armTo, beatTimes, blendArm, headAt, Lit, Mother, smooth, You } from "./LongRun.parts";

/** Lines 57-59 and the 4 s hold: your mother, older, on the stairs; you stay on the bottom step; she takes your hand. */
export const MotherScene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues, clips } = shot;
  const b = beatTimes(cues, clips);
  const q = clips[58].from;   // "Promise her, or keep watching?"
  const watching = q + 33;    // "or keep watching"
  const stay = cues.stay;
  const end = clips[60].from;

  // her walk down: from step 6 to step 2, then off the bottom step to the floor beside you
  const shake = linear(frame, stay + 22, stay + 58);
  const smile = frame >= stay + 50;
  const down = linear(frame, stay + 66, stay + 128);
  const onStep = 6 - down * 4;
  const n = Math.floor(onStep);
  const frac = onStep - n;
  const s0 = stepTop(Math.max(1, n));
  const s1 = stepTop(Math.max(1, n + 1));
  const final = 0; // she stops on step 2 and pulls you up to her
  const momX = mix(mix(s0.x, s1.x, frac), 1225, final);
  const momY = mix(mix(s0.y, s1.y, smooth(frac)), FLOOR_Y, final);
  const walking = (down > 0 && down < 1) || (final > 0 && final < 1);
  let momBody: Pose = walking ? walkPose((frame - stay) * 0.3) : { ...STAND, lean: 6, drop: 4 };
  momBody = { ...momBody, tilt: shake > 0 && shake < 1 ? Math.sin(shake * Math.PI * 4) * 9 : frame >= cues.asks && frame < q ? 6 : 0 };
  const momP = { x: momX, y: momY, scale: 1, facing: -1 as const, pose: momBody };
  const akimbo = frame >= cues.asks && frame < stay + 40;

  // you: at the foot of the stairs, looking up; on "stay" you sit on the bottom step
  const seat = stepTop(1);
  const sitK = ramp(frame, stay, stay + 14);
  const riseK = ramp(frame, stay + 138, stay + 156);
  const sitting: Pose = { ...STAND, legF: [90, -88], legB: [84, -84], armF: [30, 40], armB: [20, 30] };
  const youX = mix(mix(1150, seat.x - 30, sitK), 1190, riseK);
  const youY = mix(mix(FLOOR_Y, seat.y + 112, sitK), FLOOR_Y, riseK);
  const youBody: Pose = sitK < 0.5 || riseK > 0.5 ? { ...STAND, tilt: -10 * (1 - riseK) } : { ...sitting, tilt: -12 };
  const youFacing: 1 | -1 = sitK > 0.5 && riseK < 0.5 ? -1 : 1;
  const youP = { x: youX, y: youY, scale: 1, facing: youFacing, pose: youBody };

  // hands meet
  const meet = ramp(frame, stay + 116, stay + 132);
  const handPt = { x: mix(youX, momX, 0.5) + 10, y: mix(youY - 170, momY - 170, 0.5) };
  const momArmF = akimbo ? armTo(momP, momX + 6, momY - 110) : blendArm(momBody.armF, armTo(momP, handPt.x, handPt.y), meet);
  const momArmB = akimbo ? armTo(momP, momX - 18, momY - 106) : momBody.armB;
  const yourArm = blendArm(youBody.armB, armTo({ ...youP, pose: youBody }, handPt.x, handPt.y + 6), meet);

  const momHead = headAt({ ...momP, x: stepTop(6).x, y: stepTop(6).y });
  const youHead = headAt({ x: 1150, y: FLOOR_Y, pose: { ...STAND, tilt: -10 } });
  const cam: Camera = cutAt(frame, [
    [b.mother, drift(camAt(frame, [[b.mother, { x: 1180, y: 560, zoom: 1.05 }], [cues.asks, { x: 1220, y: 545, zoom: 1.12 }]]), frame, "home")],
    [cues.asks, drift(camAt(frame, [[cues.asks, closeUp(momHead.x, momHead.y, 2.9)], [q, closeUp(momHead.x, momHead.y - 6, 3.2)]]), frame, "brows", 3)],
    [q, drift(camAt(frame, [[q, closeUp(youHead.x + 60, youHead.y - 30, 2.2)], [stay, closeUp(youHead.x + 60, youHead.y - 30, 2.4)]]), frame, "you", 3)],
    [stay - 2, drift(camAt(frame, [[stay - 2, { x: 1200, y: 600, zoom: 1.15 }], [end, { x: 1230, y: 630, zoom: 1.3 }]]), frame, "hold", 5)],
  ]);

  const lamp = toScreen(cam, LAMP.x, LAMP.y);
  const stairs = toScreen(cam, 1400, 560);
  const youLook = frame < q ? { x: 0.5, y: -0.8 }
    : frame < watching ? { x: 0.6, y: -0.9 }
    : frame < stay ? { x: 0.8, y: 0.6 }
    : riseK > 0.5 ? { x: 0.7, y: -0.6 } : { x: -0.9, y: -0.7 };
  const actors = (
    <>
      <Mother {...momP} pose={{ ...momBody, armF: momArmF, armB: momArmB }} brows={frame >= cues.asks - 4 && !smile ? "raised" : smile ? "none" : "flat"}
        lids={smile ? 0.4 : 0.12} mouth={smile ? "smile" : frame >= cues.asks ? "flat" : "none"} look={{ x: 0.6, y: 0.6 }} blink={blinking(frame, 4)} time={frame} />
      <You {...youP} pose={{ ...youBody, armB: yourArm }} mouth={riseK > 0.5 || meet > 0.5 ? "smile" : frame >= watching ? "flat" : "none"}
        brows={frame >= watching && frame < stay + 40 ? "worry" : "none"} lids={meet > 0.5 ? 0.35 : 0} look={youLook}
        blink={blinking(frame, 2)} time={frame} />
    </>
  );
  return (
    <Lit glows={[
      { x: lamp.x, y: lamp.y, r: 620 * cam.zoom, color: "rgba(255,196,120,0.6)" },
      { x: stairs.x, y: stairs.y, r: 520 * cam.zoom, color: "rgba(255,180,110,0.32)" },
    ]}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} />} actors={actors} />
    </Lit>
  );
};
