import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext, useLook } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Counter, evenTicks } from "../parts";
import { HomeBack, FLOOR_Y, LAMP, stepTop } from "../sets/Home";
import { blinking, camAt, current, HERO, MOTHER, mix, ramp, type Shot } from "../shared";
import { armTo, blendArm, body, firstDaysPauses, Sfx } from "./FirstDays.common";

/** Line 18: home, the lamp. Your mother's chappal flies at your head; snap; it hangs; you step aside; it sails past
 *  and slaps the stairs; she stares at her hand, then laughs. */

const FEET = FLOOR_Y + 25;
const MOM_X = 560;
const HERO_X = 1120;
const STEP_TO = 990;
const GRAVITY = 0.55;
/** Where the chappal lands: on step 5, after hitting the riser of step 6. */
const LAND = stepTop(5);

const Chappal: React.FC<{ rotate?: number }> = ({ rotate = 0 }) => (
  <g transform={`rotate(${rotate})`}>
    <path d="M-40 -6 Q-42 -14 -30 -14 L30 -12 Q44 -11 42 0 Q40 9 28 9 L-30 8 Q-42 7 -40 -6Z" fill="#8a5a3a" stroke={INK} strokeWidth={4} />
    <path d="M-4 -13 Q6 -30 18 -12" fill="none" stroke="#d8344f" strokeWidth={7} strokeLinecap="round" />
  </g>
);

export const HomeLamp: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues, clips } = shot;
  const pause = firstDaysPauses(cues, clips).chappal;
  const lChappal = clips[18].from;
  const end = clips[19].from;

  const shotName = current(frame, [[lChappal, "throw"], [cues.chappal + 15, "face"], [cues.step - 35, "step"], [cues.laugh - 5, "mother"]] as [number, string][]);

  // Mother: wind up, throw (released 9 frames before the snap), follow through; then look at her hand; then laugh.
  const release = wc(cues.chappal) - 9;
  const wind = ramp(t, release - 12, release - 5);
  const fling = ramp(t, release - 4, release + 1);
  const momBase: Pose = { ...STAND, lean: mix(0, -6, wind) + fling * 14 };
  let momArm: [number, number] = blendArm([9, 10], [-40, 60], wind);
  momArm = blendArm(momArm, [112, 8], fling);
  const look_ = ramp(t, wc(pause.to) + 10, wc(pause.to) + 18);
  const momHeadNow = body(MOM_X, FEET, momBase).head;
  momArm = blendArm(momArm, armTo(MOM_X, FEET, momBase, 1, 1, momHeadNow.x + 58, momHeadNow.y + 40), look_);
  const laughing = frame >= cues.laugh;
  const shake = laughing ? Math.sin((frame - cues.laugh) / 2.2) : 0;
  const momPose: Pose = { ...momBase, armF: momArm, tilt: laughing ? -10 + shake * 5 : 0, lean: momBase.lean - (laughing ? 4 : 0) };
  const momHead = body(MOM_X, FEET, momPose).head;

  // The chappal: from her hand at release, straight at your head, frozen a hand's width short; then on to the stairs.
  const r0 = body(MOM_X, FEET, { ...momBase, lean: 14, armF: [112, 8] }).handF;
  const youHead = body(HERO_X, FEET, STAND, -1).head;
  const frozenAt = { x: youHead.x - 92, y: youHead.y - 10 };
  const vx = (frozenAt.x - r0.x) / 9;
  const vy = (frozenAt.y - r0.y - 0.5 * GRAVITY * 81) / 9;
  const tau = t - release;
  const hitTau = (LAND.x + 10 - r0.x) / vx;
  const flying = tau < hitTau;
  const chappal = flying
    ? { x: r0.x + vx * tau, y: r0.y + vy * tau + 0.5 * GRAVITY * tau * tau, rot: tau * 22 }
    : { x: LAND.x + 6, y: mix(r0.y + vy * hitTau + 0.5 * GRAVITY * hitTau * hitTau, LAND.y - 10, ramp(tau, hitTau, hitTau + 6)), rot: mix(hitTau * 22, 360 * Math.ceil(hitTau * 22 / 360), ramp(tau, hitTau, hitTau + 6)) };
  const thrown = tau >= 0;

  // You: see it, snap, look at it, poke it, glance at her, step aside, smug.
  const snap = ramp(frame, cues.chappal - 5, cues.chappal);
  const relax = ramp(frame, cues.chappal + 16, cues.chappal + 30);
  let pose: Pose = lerpPose(lerpPose(STAND, SNAP, snap), STAND, relax);
  const pokeK = ramp(frame, cues.chappal + 38, cues.chappal + 46) * (1 - ramp(frame, cues.chappal + 52, cues.chappal + 60));
  pose = { ...pose, armF: blendArm(pose.armF, armTo(HERO_X, FEET, STAND, -1, 1, frozenAt.x + 30, frozenAt.y), pokeK) };
  const stepK = ramp(frame, cues.step - 8, cues.step + 6);
  const x = mix(HERO_X, STEP_TO, stepK);
  const y = FEET + 22 * stepK;
  const scale = 1 + 0.05 * stepK;
  if (stepK > 0 && stepK < 1) pose = walkPose(stepK * Math.PI * 2);
  const snapHand = body(HERO_X, FEET, SNAP, -1).handF;

  const cams: Record<string, Camera> = {
    throw: camAt(frame, [[lChappal, { x: 860, y: 640, zoom: 1.3 }], [cues.chappal + 15, { x: 870, y: 635, zoom: 1.36 }]]),
    face: camAt(frame, [[cues.chappal + 15, closeUp(youHead.x - 60, youHead.y, 2.7)], [cues.step - 35, closeUp(youHead.x - 60, youHead.y, 3.1)]]),
    step: camAt(frame, [[cues.step - 35, { x: 1010, y: 640, zoom: 1.32 }], [cues.laugh - 5, { x: 990, y: 640, zoom: 1.38 }]]),
    mother: drift(closeUp(momHead.x + 210, momHead.y, 2.3), frame, "mom"),
  };
  const cam = cams[shotName];
  const origin = toScreen(cams.throw, snapHand.x, snapHand.y);
  const paused = frame >= pause.from && frame < pause.to;

  const back = (
    <>
      <HomeBack cam={cam} />
      <Layer cam={cam} depth={1}>
        <circle cx={momHead.x - 34} cy={momHead.y - 26} r={22} fill="#2a1f22" />
        <Figure
          {...MOTHER}
          x={MOM_X} y={FEET}
          pose={momPose}
          mouth={laughing ? "open" : frame >= pause.to + 10 ? "o" : "flat"}
          brows={laughing ? "raised" : frame >= pause.to + 10 ? "raised" : "angry"}
          lids={laughing ? 0.6 : 0}
          eyes={frame >= pause.to + 10 && !laughing ? 1.25 : 1}
          look={look_ > 0.5 && !laughing ? { x: 0.7, y: 0.4 } : { x: 0.9, y: 0 }}
          blink={!paused && blinking(Math.round(t), 6)}
        />
        {thrown && <g transform={`translate(${chappal.x} ${chappal.y})`}><Chappal rotate={chappal.rot} /></g>}
      </Layer>
    </>
  );
  const watching = frame >= cues.chappal + 16 && frame < cues.step - 20;
  const actors = (
    <Figure
      {...HERO}
      x={x} y={y} scale={scale} facing={-1}
      pose={pose}
      mouth={frame < cues.chappal + 20 ? "o" : frame < cues.step ? "flat" : "smirk"}
      brows={frame < cues.chappal + 40 ? "raised" : frame < cues.step ? "flat" : "none"}
      eyes={frame < cues.chappal + 40 ? 1.3 : 1}
      lids={frame >= cues.chappal + 40 && frame < cues.step - 10 ? 0.3 : 0}
      look={watching ? { x: 0.9, y: 0.05 } : { x: 0.9, y: 0 }}
      blink={blinking(frame, 4)}
      time={frame}
    />
  );

  const look = useLook();
  const lamp = toScreen(cam, LAMP.x, LAMP.y);
  const momLit = toScreen(cam, momHead.x, momHead.y + 60);
  const youLit = toScreen(cam, x - 20, y - 230);
  const glows = paused ? [] : [
    { x: lamp.x, y: lamp.y, r: 620 * Math.min(1.6, cam.zoom), color: "#ffcf7a", strength: 0.55 },
    { x: momLit.x, y: momLit.y, r: 170 * cam.zoom, color: "#ffd2a0", strength: 0.35 },
    { x: youLit.x, y: youLit.y, r: 150 * cam.zoom, color: "#ffc890", strength: 0.25 },
  ];
  return (
    <AbsoluteFill>
      <LookContext.Provider value={{ ...look, glows: [...(look.glows ?? []), ...glows] }}>
        <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back} actors={actors} />
      </LookContext.Provider>
      <Counter ticks={evenTicks(pause.from, pause.to)} until={pause.to} />
      <Sfx at={cues.chappal - 13} name="whoosh" volume={0.3} until={end} />
      <Sfx at={pause.from - 3} name="timestop" volume={0.42} until={end} />
      <Sfx at={pause.to - 13} name="resume" volume={0.3} until={end} />
    </AbsoluteFill>
  );
};
