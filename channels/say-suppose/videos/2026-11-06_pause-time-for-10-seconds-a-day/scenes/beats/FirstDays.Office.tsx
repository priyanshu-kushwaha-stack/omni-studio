import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { useLook, LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Counter, evenTicks } from "../parts";
import { blinking, camAt, current, HERO, mix, ramp, type Shot } from "../shared";
import { armTo, blendArm, body, firstDaysPauses, Sfx } from "./FirstDays.common";

/** Lines 17-18: the office kitchen. One samosa, a colleague's hand already reaching; snap on "saint", swap it for a
 *  napkin, stroll off chewing; the colleague stares at the napkin. */

const FLOOR = 860;
const FEET = 885;
const PLATE = { x: 1000, y: 634 };
const HERO_X = 870;
const COLL_X = 1135;
const COLLEAGUE = { head: "#c27c56", coat: "#5a7fa8" };

const Samosa: React.FC<{ bitten?: boolean }> = ({ bitten }) => (
  <g>
    <path d="M-36 0 L36 0 L0 -54Z" fill="#d9a04a" stroke="#8a5a22" strokeWidth={5} strokeLinejoin="round" />
    <path d="M-14 -6 L0 -40 M10 -8 L2 -34" stroke="#b07a32" strokeWidth={4} strokeLinecap="round" />
    {bitten && <path d="M-6 -36 Q2 -28 12 -36 L0 -54Z" fill="#f6d79a" stroke="#8a5a22" strokeWidth={4} strokeLinejoin="round" />}
  </g>
);

const Napkin: React.FC = () => (
  <g>
    <path d="M-32 0 L28 0 L36 -16 L-24 -16Z" fill="#fffaf0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-28 -8 L30 -8" stroke="#d9d0c0" strokeWidth={3} />
  </g>
);

const OfficeBack: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Layer cam={cam} depth={0.85}>
      <rect x={-600} y={-400} width={3400} height={1400} fill="#e7e1d1" />
      <rect x={-600} y={90} width={3400} height={40} fill="#c9c0aa" />
      <path d="M-80 200 H300 V560 H-80Z" fill="#a8dcea" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-80} y={210 + i * 38} width={380} height={14} fill="#f3e9d7" opacity={0.85} />)}
      <rect x={1880} y={260} width={330} height={240} rx={8} fill="#c69c6d" stroke={INK} strokeWidth={7} />
      {[[1910, 290, "#f2b632"], [2010, 300, "#7fc29b"], [2110, 285, "#e6a0a0"], [1940, 390, "#a8dcea"], [2060, 400, "#f2b632"]].map(([x, y, c], i) => (
        <rect key={i} x={x as number} y={y as number} width={70} height={70} fill={c as string} transform={`rotate(${(i % 3) * 4 - 4} ${x} ${y})`} />
      ))}
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={430} y={170} width={1140} height={210} rx={8} fill="#2f6f8f" stroke={INK} strokeWidth={6} />
      {[620, 810, 1000, 1190, 1380].map((x) => <line key={x} x1={x} y1={170} x2={x} y2={380} stroke="#24576f" strokeWidth={6} />)}
      <rect x={430} y={430} width={1140} height={206} fill="#d3e4e6" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={430 + i * 82} y1={430} x2={430 + i * 82} y2={636} stroke="#b9d0d3" strokeWidth={4} />)}
      {[480, 550].map((y) => <line key={y} x1={430} y1={y} x2={1570} y2={y} stroke="#b9d0d3" strokeWidth={4} />)}
      <rect x={1650} y={260} width={200} height={600} rx={18} fill="#f3e9d7" stroke={INK} strokeWidth={7} />
      <line x1={1650} y1={460} x2={1850} y2={460} stroke={INK} strokeWidth={6} />
      <rect x={1680} y={360} width={14} height={70} rx={6} fill={INK} />
      <rect x={130} y={600} width={120} height={260} rx={10} fill="#d9dee0" stroke={INK} strokeWidth={6} />
      <rect x={140} y={430} width={100} height={170} rx={30} fill="#9fd3ea" opacity={0.9} stroke={INK} strokeWidth={6} />
      <rect x={-600} y={FLOOR} width={3400} height={600} fill="#b9c2c6" />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-500 + i * 160} y1={FLOOR} x2={-540 + i * 160} y2={FLOOR + 200} stroke="#a7b0b4" strokeWidth={4} />)}
      <rect x={440} y={650} width={1120} height={210} fill="#7d8c91" />
      {[720, 1000, 1280].map((x) => <line key={x} x1={x} y1={650} x2={x} y2={860} stroke="#677579" strokeWidth={6} />)}
      <rect x={420} y={636} width={1160} height={22} rx={6} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
      <rect x={1340} y={560} width={70} height={76} rx={8} fill="#fff6e3" stroke={INK} strokeWidth={5} />
      <path d="M1410 576 q22 4 18 22 q-4 14 -18 12" fill="none" stroke="#fff6e3" strokeWidth={7} />
      <ellipse cx={PLATE.x} cy={PLATE.y} rx={78} ry={11} fill="#fffaf0" stroke={INK} strokeWidth={5} />
    </Layer>
  </>
);

export const OfficeKitchen: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues, clips } = shot;
  const pause = firstDaysPauses(cues, clips).samosa;
  const l17 = clips[17].from;
  const l18 = clips[18].from;
  const end = clips[19].from;

  const shotName = current(frame, [[l17, "samosa"], [l17 + 60, "two"], [l17 + 140, "you"], [l18 + 14, "snap"], [pause.to + 4, "stare"]] as [number, string][]);

  // Colleague: the hand creeps towards the samosa (world time), freezes, then lands on the napkin.
  const creep = ramp(t, wc(l17 + 64), wc(cues.reach) + 20) * 0.55 + ramp(t, wc(cues.reach), wc(cues.swap)) * 0.3;
  const land = ramp(t, wc(pause.to), wc(pause.to) + 8);
  const collBase: Pose = { ...STAND, lean: mix(0, 14, creep) };
  const target = { x: mix(PLATE.x + 26, PLATE.x + 6, land), y: PLATE.y - 22 + land * 6 };
  const collArm = blendArm([9, 10], armTo(COLL_X, FEET, collBase, -1, 1, target.x, target.y), Math.min(1, creep + land));
  const collPose: Pose = { ...collBase, armF: collArm };
  const collHead = body(COLL_X, FEET, collPose, -1).head;
  const stare = frame - pause.to;

  // You: snap, lean in, take the samosa, drop the napkin, turn and stroll off chewing.
  const snap = ramp(frame, pause.from - 6, pause.from);
  const lean = ramp(frame, pause.from + 4, pause.from + 12);
  const takeAt = pause.from + 16;
  const napkinAt = pause.from + 26;
  const turnAt = pause.from + 32;
  let pose: Pose = lerpPose(STAND, SNAP, snap * (1 - lean));
  const leanPose: Pose = { ...STAND, lean: 14, drop: 4 };
  pose = lerpPose(pose, leanPose, lean);
  const grabArm = armTo(HERO_X, FEET, leanPose, 1, 1, PLATE.x - 4, PLATE.y - 26);
  const napkinArm = armTo(HERO_X, FEET, leanPose, 1, 1, PLATE.x - 6, PLATE.y - 10);
  const mouthArm = armTo(HERO_X, FEET, STAND, 1, 1, HERO_X + 54, body(HERO_X, FEET, STAND).head.y + 30);
  let armF: [number, number] = blendArm(pose.armF, grabArm, ramp(frame, pause.from + 6, takeAt));
  armF = blendArm(armF, mouthArm, ramp(frame, takeAt + 2, takeAt + 10));
  let armB: [number, number] = blendArm(pose.armB, napkinArm, ramp(frame, takeAt, napkinAt));
  armB = blendArm(armB, STAND.armB, ramp(frame, napkinAt + 2, napkinAt + 8));
  pose = { ...lerpPose(pose, STAND, ramp(frame, napkinAt, turnAt)), armF, armB };
  let x = HERO_X;
  let facing: 1 | -1 = 1;
  if (frame >= turnAt) {
    facing = -1;
    const d = (frame - turnAt) * 6;
    x = HERO_X - d;
    pose = { ...walkPose(d / 15), armF: [40, 90] };
  }
  const holding = frame >= takeAt;
  const napkinOnPlate = frame >= napkinAt;
  const napkinHand = body(x, FEET, pose, facing).handB;
  const chewing = holding && frame > takeAt + 10;

  const heroHead = body(HERO_X, FEET, STAND).head;
  const cams: Record<string, Camera> = {
    samosa: camAt(frame, [[l17, insert(PLATE.x, PLATE.y - 40, 3.4)], [l17 + 60, insert(PLATE.x, PLATE.y - 34, 4.0)]]),
    two: camAt(frame, [[l17 + 60, { x: 1005, y: 600, zoom: 1.45 }], [l17 + 140, { x: 1010, y: 605, zoom: 1.6 }]]),
    you: drift(closeUp(heroHead.x + 50, heroHead.y, 2.6), frame, "oy"),
    snap: camAt(frame, [[l18 + 14, { x: 990, y: 610, zoom: 1.55 }], [pause.to + 4, { x: 970, y: 612, zoom: 1.62 }]]),
    stare: camAt(frame, [[pause.to + 4, { x: 1060, y: 615, zoom: 2.3 }], [end, { x: 1068, y: 615, zoom: 2.5 }]]),
  };
  const cam = cams[shotName];
  const snapHand = body(HERO_X, FEET, SNAP, 1).handF;
  const origin = toScreen(cams.snap, snapHand.x, snapHand.y);

  const back = (
    <>
      <OfficeBack cam={cam} />
      <Layer cam={cam} depth={1}>
        {!holding && <g transform={`translate(${PLATE.x} ${PLATE.y - 4})`}><Samosa /></g>}
        {napkinOnPlate && <g transform={`translate(${PLATE.x} ${PLATE.y - 4})`}><Napkin /></g>}
        {shotName === "samosa" && [0, 1, 2].map((i) => {
          const ph = ((t + i * 22) % 66) / 66;
          return <path key={i} d={`M${PLATE.x - 18 + i * 18} ${PLATE.y - 62 - ph * 60} q-10 -14 0 -28`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6 * Math.sin(Math.PI * ph)} />;
        })}
        <Figure
          {...COLLEAGUE}
          x={COLL_X} y={FEET} facing={-1}
          pose={collPose}
          mouth={frame < pause.to ? "smirk" : stare < 14 ? "flat" : "o"}
          brows={frame < pause.to ? "none" : "raised"}
          eyes={frame < pause.to ? 1 : 1.25}
          look={frame < pause.to ? { x: 0.8, y: 0.6 } : { x: 0.7, y: 0.9 }}
          blink={frame >= pause.to ? stare > 26 && stare < 30 : blinking(Math.round(t), 4)}
        />
      </Layer>
    </>
  );
  const actors = (
    <>
      {frame >= takeAt && !napkinOnPlate && <g transform={`translate(${napkinHand.x} ${napkinHand.y})`}><Napkin /></g>}
      <Figure
        {...HERO}
        x={x} y={FEET} facing={facing}
        pose={pose}
        held={holding ? <g transform="rotate(-20)"><Samosa bitten={frame > takeAt + 12} /></g> : undefined}
        mouth={chewing ? (Math.floor(frame / 5) % 2 ? "flat" : "smile") : frame >= l18 ? "smirk" : "flat"}
        brows={frame >= l18 && frame < pause.from + 4 ? "angry" : frame >= l17 + 150 && frame < l18 ? "flat" : "none"}
        lids={frame >= l17 + 150 && frame < l18 + 14 ? 0.35 : 0}
        look={frame >= turnAt ? { x: 0.6, y: 0 } : { x: 0.8, y: 0.7 }}
        blink={blinking(frame, 9)}
        flow={frame >= turnAt ? 0.25 : 0}
        time={frame}
      />
    </>
  );

  const look = useLook();
  const glow = toScreen(cam, PLATE.x, PLATE.y - 30);
  const glows = shotName === "samosa" ? [{ x: glow.x, y: glow.y, r: 420, color: "#ffcf7a", strength: 0.45 }] : [];
  return (
    <AbsoluteFill>
      <LookContext.Provider value={{ ...look, glows: [...(look.glows ?? []), ...glows] }}>
        <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back} actors={actors} />
      </LookContext.Provider>
      <Counter ticks={evenTicks(pause.from, pause.to)} until={pause.to} />
      <Sfx at={pause.from - 3} name="timestop" volume={0.42} until={end} />
      <Sfx at={pause.to - 13} name="resume" volume={0.3} until={end} />
    </AbsoluteFill>
  );
};
