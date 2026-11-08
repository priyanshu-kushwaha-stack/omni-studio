import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK, PAPER } from "@whatif/kit/theme";
import { Counter } from "../parts";
import { HomeBack, LANDING_Y, STAIR_X, STEP_W, STEPS } from "../sets/Home";
import { SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, linear, mix, noise, ramp, type Shot } from "../shared";
import { armTo, beatTimes, blendArm, handAt, SHORT, smooth, You } from "./LongRun.parts";

/** A short pause's counter: it shows 10, then 9, as a second goes by. */
const ShortCounter: React.FC<{ from: number }> = ({ from }) => (
  <Counter ticks={[{ at: from, n: 10 }, { at: from + 26, n: 9 }]} until={from + SHORT} />
);

/* ---------- 1. the bottle under the bike wheel ---------- */

const Bike: React.FC<{ x: number; t: number; frozen: boolean }> = ({ x, t, frozen }) => {
  const ped = t * 0.35;
  return (
    <g>
      {!frozen && [0, 1, 2].map((i) => <rect key={i} x={x + 190 + ((t * 8 + i * 30) % 70)} y={800 + i * 30} width={70} height={6} rx={3} fill="#fff" opacity={0.5} />)}
      {[x, x + 140].map((w) => (
        <g key={w} transform={`rotate(${-t * 12} ${w} 868)`}>
          <circle cx={w} cy={868} r={36} fill="none" stroke={INK} strokeWidth={8} />
          <line x1={w - 34} y1={868} x2={w + 34} y2={868} stroke={INK} strokeWidth={3} />
          <line x1={w} y1={834} x2={w} y2={902} stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <path d={`M${x} 868 L${x + 30} 790 L${x + 100} 800 L${x + 140} 868 M${x + 30} 790 L${x + 70} 868 L${x + 100} 800 M${x + 92} 786 H${x + 118} M${x + 30} 790 L${x + 20} 768 H${x + 44}`}
        fill="none" stroke="#2c6fbb" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <Figure x={x + 104} y={786 + 98} scale={0.88} facing={-1} head="#7fc29b" time={t}
        pose={{ ...STAND, lean: 18, armF: [70, 20], armB: [64, 22], legF: [62 + Math.sin(ped) * 22, -70 - Math.cos(ped) * 20], legB: [62 - Math.sin(ped) * 22, -70 + Math.cos(ped) * 20] }}
        mouth="smile" look={{ x: 0.7, y: 0 }} />
    </g>
  );
};

const Bottle: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-34} y={-13} width={52} height={26} rx={10} fill="#3f9a6a" stroke={INK} strokeWidth={4} />
    <rect x={16} y={-7} width={24} height={14} rx={4} fill="#3f9a6a" stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-8} width={30} height={5} rx={2} fill="#bff0d0" opacity={0.8} />
  </g>
);

const BottleCut: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc } = shot;
  const b = beatTimes(shot.cues, shot.clips);
  const pause = { from: b.bottleSnap, to: b.bottleSnap + SHORT };
  const paused = frame >= pause.from && frame < pause.to;
  const bikeX = 1240 - (t - wc(b.cuts)) * 9;
  const cam: Camera = drift(camAt(frame, [[b.cuts, { x: 1060, y: 820, zoom: 1.55 }], [b.panCut, { x: 1040, y: 830, zoom: 1.65 }]]), frame, "bottle", 4);

  const p = pause.from;
  const snapK = ramp(frame, p - 6, p);
  const crouch = ramp(frame, p + 4, p + 13) * (1 - ramp(frame, p + 25, p + 33));
  const body: Pose = lerpPose(lerpPose(STAND, SNAP, snapK * (1 - ramp(frame, p + 2, p + 8))), { ...STAND, lean: 46, drop: 22 }, crouch);
  const youP = { x: 975, y: 1000, scale: 1.2, facing: 1 as const, pose: body };
  const slide = ramp(frame, p + 13, p + 24);
  const bottle = { x: mix(1045, 930, slide), y: mix(906, 948, slide), rot: mix(8, -20, slide) };
  const toBottle = armTo(youP, bottle.x + 8, bottle.y - 10);
  const armF = blendArm(body.armF, toBottle, ramp(frame, p + 8, p + 13) * (1 - ramp(frame, p + 24, p + 30)));
  const pose = { ...body, armF };
  const snapHand = handAt({ ...youP, pose: lerpPose(STAND, SNAP, 1) });

  const actors = (
    <>
      <Bottle {...bottle} />
      <Bike x={bikeX} t={t} frozen={paused} />
      <You {...youP} pose={pose} mouth={frame >= pause.to ? "smirk" : "flat"} look={{ x: 0.7, y: crouch > 0.3 ? 0.8 : 0.1 }} eyes={frame >= p - 8 && frame < p + 4 ? 1.2 : 1} blink={blinking(frame, 6)} time={frame} />
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={paused ? waveRadius(frame, pause) : 0} origin={toScreen(cam, snapHand.x, snapHand.y)} sky={SKY}
        back={<StreetBack cam={cam} frame={frame} t={t} paused={paused} />} actors={actors} />
      <ShortCounter from={pause.from} />
    </AbsoluteFill>
  );
};

/* ---------- 2. the pan handle (a top-down insert of the hob) ---------- */

const PanCut: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc } = shot;
  const b = beatTimes(shot.cues, shot.clips);
  const pause = { from: b.panSnap, to: b.panSnap + SHORT };
  const paused = frame >= pause.from && frame < pause.to;
  const p = pause.from;
  const cam: Camera = drift(camAt(frame, [[b.panCut, { x: 960, y: 560, zoom: 1.0 }], [b.todCut, { x: 940, y: 590, zoom: 1.08 }]]), frame, "pan", 4);
  const PAN = { x: 1000, y: 640 };
  const turn = smooth(linear(frame, p + 12, p + 26));
  const handleA = mix(112, 20, turn); // degrees: 150 points out over the edge (down-left), 20 points back in
  const rad = (handleA * Math.PI) / 180;
  const tip = { x: PAN.x + Math.cos(rad) * 330, y: PAN.y + Math.sin(rad) * 330 };
  // the toddler's hand rises from below the counter edge, then finds nothing
  const kt = t - wc(b.panCut);
  const after = Math.max(0, frame - pause.to);
  const kidY = mix(1160, 1010, Math.min(1, kt / 18)) - Math.min(after, 10) * 4 + Math.max(0, after - 14) * 14;
  const kidX = 820 + Math.min(after, 14) * 3;
  // your arm comes in from the top right
  const reachK = ramp(frame, p + 3, p + 12) * (1 - ramp(frame, p + 28, p + 36));
  const yourHand = { x: mix(1900, tip.x + 10, reachK), y: mix(-60, tip.y - 6, reachK) };
  const snapK = frame >= p - 8 && frame < p + 3;

  const back = (
    <Layer cam={cam} depth={1}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#e9dccb" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-200} y1={i * 110} x2={2200} y2={i * 110} stroke="#d7c6b0" strokeWidth={4} />)}
      <rect x={430} y={200} width={1100} height={640} rx={24} fill="#3b3e47" />
      {[[700, 360], [1260, 360], [700, 640], [1260, 640]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={120} fill="#2a2c33" stroke="#565a65" strokeWidth={8} />
          {i === 1 && !paused && Array.from({ length: 10 }, (_, k) => <circle key={k} cx={x + Math.cos(k * 0.63) * 80} cy={y + Math.sin(k * 0.63) * 80} r={13 + Math.sin(t * 0.8 + k) * 3} fill="#5fb6ff" opacity={0.85} />)}
        </g>
      ))}
      <rect x={-200} y={900} width={2400} height={30} fill="#b98a5a" />
      <rect x={-200} y={930} width={2400} height={400} fill="#c98f5e" />
    </Layer>
  );
  const actors = (
    <>
      <g transform={`translate(${PAN.x} ${PAN.y}) rotate(${handleA})`}>
        <rect x={150} y={-22} width={200} height={44} rx={18} fill={INK} />
      </g>
      <circle cx={PAN.x} cy={PAN.y} r={180} fill="#9aa3ad" stroke={INK} strokeWidth={9} />
      <circle cx={PAN.x} cy={PAN.y} r={150} fill="#e6a04a" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={PAN.x - 70 + noise(i) * 140} cy={PAN.y - 60 + noise(i + 4) * 120} r={14 + noise(i + 2) * 12} fill="#f6c46e" />)}
      {Array.from({ length: 4 }, (_, i) => {
        const k = ((t * 0.02 + i * 0.25) % 1);
        return <circle key={`s${i}`} cx={PAN.x - 60 + i * 40 + Math.sin(t * 0.1 + i) * 14} cy={PAN.y - 30 - k * 300} r={30 + k * 40} fill={PAPER} opacity={0.4 * (1 - k)} />;
      })}
      {/* the toddler's arm */}
      <line x1={kidX - 40} y1={1180} x2={kidX} y2={kidY + 30} stroke="#3b3e47" strokeWidth={30} strokeLinecap="round" />
      <circle cx={kidX} cy={kidY} r={34} fill="#f0c0a0" stroke={INK} strokeWidth={4} />
      {/* your arm and hand */}
      {reachK > 0 && <>
        <line x1={2000} y1={-120} x2={yourHand.x} y2={yourHand.y} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <circle cx={yourHand.x} cy={yourHand.y} r={36} fill="#f2b632" stroke={INK} strokeWidth={4} />
      </>}
      {snapK && <>
        <line x1={1680} y1={240} x2={1840} y2={-40} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <circle cx={1680} cy={240} r={36} fill="#f2b632" stroke={INK} strokeWidth={4} />
        {frame >= p - 2 && [0, 1, 2].map((i) => <line key={i} x1={1680 + Math.cos(-2.4 + i * 0.6) * 54} y1={240 + Math.sin(-2.4 + i * 0.6) * 54} x2={1680 + Math.cos(-2.4 + i * 0.6) * 84} y2={240 + Math.sin(-2.4 + i * 0.6) * 84} stroke={PAPER} strokeWidth={8} strokeLinecap="round" />)}
      </>}
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={paused ? waveRadius(frame, pause) : 0} origin={toScreen(cam, 1680, 240)} back={back} actors={actors} />
      <ShortCounter from={pause.from} />
    </AbsoluteFill>
  );
};

/* ---------- 3. the toddler at the top stair ---------- */

const CRAWL: Pose = { lean: 75, tilt: -10, drop: 56, armF: [30, -60], armB: [10, -40], legF: [-30, -60], legB: [-44, -50] };
const EDGE = STAIR_X + STEPS * STEP_W;

const ToddlerCut: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues } = shot;
  const b = beatTimes(cues, shot.clips);
  const pause = { from: cues.small, to: cues.small + SHORT };
  const paused = frame >= pause.from && frame < pause.to;
  const p = pause.from;
  const cam: Camera = drift(camAt(frame, [[b.todCut, { x: 2030, y: 290, zoom: 1.5 }], [b.mother, { x: 2010, y: 300, zoom: 1.6 }]]), frame, "tod", 4);

  const kt = t - wc(b.todCut);
  const crawlX = Math.max(EDGE + 30, 2010 - kt * 3.2);
  const tip = smooth(linear(kt, 8, 14)) * 26;
  const lift = smooth(linear(frame, p + 18, p + 30));

  const step = linear(frame, p + 4, p + 18);
  const youX = mix(2290, 2130, step);
  const snapK = ramp(frame, p - 6, p) * (1 - ramp(frame, p + 3, p + 9));
  let body: Pose = lerpPose(STAND, SNAP, snapK);
  if (step > 0 && step < 1) body = walkPose((frame - p) * 0.4);
  const bend = ramp(frame, p + 14, p + 20) * (1 - lift);
  body = lerpPose(body, { ...STAND, lean: 30, drop: 14 }, bend);
  const youP = { x: youX, y: LANDING_Y, scale: 0.9, facing: -1 as const, pose: body };
  const chest = { x: youX - 46, y: LANDING_Y - 150 };
  const grab = { x: crawlX + 50, y: LANDING_Y - 50 };
  const todAt = { x: mix(grab.x, chest.x, lift), y: mix(grab.y, chest.y, lift) };
  const armK = ramp(frame, p + 12, p + 18);
  const armF = blendArm(body.armF, armTo(youP, todAt.x - 6, todAt.y + 4), armK);
  const armB = blendArm(body.armB, armTo(youP, todAt.x + 12, todAt.y + 8), armK);
  const snapHand = handAt({ x: 2290, y: LANDING_Y, scale: 0.9, facing: -1, pose: SNAP });

  const todScale = 0.42;
  const todPose: Pose = lift > 0 ? lerpPose(CRAWL, { ...STAND, armF: [140, 20], armB: [130, 20], legF: [20, -30], legB: [-10, -20], tilt: 6 }, lift) : CRAWL;
  const todX = lift > 0 ? todAt.x : crawlX;
  const todY = lift > 0 ? mix(LANDING_Y, todAt.y + 70, lift) : LANDING_Y;
  const actors = (
    <>
      <g transform={`rotate(${lift > 0 ? mix(-tip, 0, lift) : -tip} ${EDGE} ${LANDING_Y})`}>
        <Figure x={todX} y={todY} scale={todScale} facing={-1} head="#f0c0a0" pose={todPose} mouth={frame >= pause.to ? "smile" : "o"} eyes={1.15}
          look={{ x: 0.6, y: 0.5 }} blink={!paused && blinking(frame, 8)} time={t} />
      </g>
      <You {...youP} pose={{ ...body, armF, armB }} mouth={frame >= pause.to + 4 ? "smile" : "flat"} brows={frame >= p - 8 && frame < pause.to ? "worry" : "none"}
        lids={frame >= pause.to + 6 ? 0.4 : 0} eyes={frame >= p - 10 && frame < p + 10 ? 1.25 : 1} look={{ x: 0.7, y: 0.5 }} blink={blinking(frame, 3)} time={frame} />
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={paused ? waveRadius(frame, pause) : 0} origin={toScreen(cam, snapHand.x, snapHand.y)} back={<HomeBack cam={cam} lampOn={false} />} actors={actors} />
      <ShortCounter from={pause.from} />
    </AbsoluteFill>
  );
};

export const QuickCuts: React.FC<{ shot: Shot }> = ({ shot }) => {
  const b = beatTimes(shot.cues, shot.clips);
  if (shot.frame < b.panCut) return <BottleCut shot={shot} />;
  if (shot.frame < b.todCut) return <PanCut shot={shot} />;
  return <ToddlerCut shot={shot} />;
};
