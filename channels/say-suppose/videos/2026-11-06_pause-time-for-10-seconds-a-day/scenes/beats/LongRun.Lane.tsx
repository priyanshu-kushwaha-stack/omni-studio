import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, runPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, HEIGHT, INK, PAPER, WIDTH } from "@whatif/kit/theme";
import { Counter, evenTicks } from "../parts";
import { blinking, camAt, cutAt, lineEnd, linear, mix, noise, ramp, type Shot } from "../shared";
import { armTo, beatTimes, blendArm, handAt, KID_HEADS, smooth, You } from "./LongRun.parts";

/** The Lane: a narrow street-cricket lane between old houses. Feet at LANE_Y. */
export const LANE_Y = 905;
const STEP = { x: 1530, w: 180, top: 849 };
const WICKET_X = 360;

const LANE_SKY = (
  <>
    <defs>
      <linearGradient id="lane-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fd0e4" />
        <stop offset="0.6" stopColor="#fbe7c2" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#lane-sky)" />
  </>
);

const HOUSES = [
  { x: -520, w: 420, h: 780, c: "#e4b48e" },
  { x: -100, w: 520, h: 830, c: "#a3c7bf" },
  { x: 420, w: 440, h: 700, c: "#e6cd98" },
  { x: 860, w: 400, h: 860, c: "#dc9d8f" },
  { x: 1260, w: 480, h: 760, c: "#c9b3d6" },
  { x: 1740, w: 420, h: 830, c: "#e4b48e" },
  { x: 2160, w: 460, h: 720, c: "#a3c7bf" },
];

const LaneBack: React.FC<{ cam: Camera; t: number }> = ({ cam, t }) => (
  <>
    <Layer cam={cam} depth={0.45} flat>
      {[-300, 300, 900, 1500, 2100].map((x, i) => (
        <g key={x}>
          <rect x={x} y={60 - noise(i) * 80} width={260} height={400} fill="#c9dcd2" />
          <rect x={x + 60} y={10 - noise(i) * 80} width={70} height={60} rx={6} fill="#b5ccc1" />
        </g>
      ))}
    </Layer>
    <Layer cam={cam} depth={0.85}>
      {HOUSES.map((h, i) => {
        const top = LANE_Y - h.h;
        return (
          <g key={i}>
            <rect x={h.x} y={top} width={h.w} height={h.h + 20} fill={h.c} />
            <rect x={h.x - 10} y={top - 18} width={h.w + 20} height={22} fill="#8a6a55" />
            {[0, 1, 2].map((r) => top + 70 + r * 210 < LANE_Y - 260 && [0, 1].map((c) => (
              <g key={`${r}${c}`}>
                <rect x={h.x + 60 + c * (h.w - 220)} y={top + 70 + r * 210} width={100} height={120} rx={8} fill="#5a6d7a" stroke={INK} strokeWidth={6} />
                <rect x={h.x + 52 + c * (h.w - 220)} y={top + 186 + r * 210} width={116} height={12} fill="#8a6a55" />
                <line x1={h.x + 110 + c * (h.w - 220)} y1={top + 70 + r * 210} x2={h.x + 110 + c * (h.w - 220)} y2={top + 190 + r * 210} stroke={INK} strokeWidth={5} />
              </g>
            )))}
            <rect x={h.x + h.w / 2 - 60} y={LANE_Y - 215} width={120} height={215} rx={8} fill={["#2c6fbb", "#1d9a8f", "#cf5b3a", "#6b4a8a"][i % 4]} stroke={INK} strokeWidth={6} />
            <circle cx={h.x + h.w / 2 + 34} cy={LANE_Y - 110} r={7} fill="#f2b632" />
          </g>
        );
      })}
      {/* chalk wickets on the wall behind the batsman */}
      {[0, 1, 2].map((i) => <rect key={i} x={WICKET_X - 50 + i * 30} y={LANE_Y - 170} width={9} height={160} rx={4} fill="#fbf6ea" opacity={0.92} />)}
      <rect x={WICKET_X - 56} y={LANE_Y - 182} width={78} height={8} rx={4} fill="#fbf6ea" opacity={0.92} />
      {/* washing line */}
      <path d="M-100 330 Q450 400 1000 340" fill="none" stroke={INK} strokeWidth={4} />
      {[40, 170, 300, 520, 650, 820].map((x, i) => {
        const y = 330 + Math.sin(((x + 100) / 1100) * Math.PI) * 52;
        return <rect key={x} x={x} y={y} width={70 + (i % 2) * 30} height={90 + (i % 3) * 20} rx={6} fill={["#f3e9d7", "#d8344f", "#2c6fbb", "#f2b632", "#7fc29b", "#f3e9d7"][i]} transform={`rotate(${Math.sin(t * 0.07 + i) * 3} ${x + 35} ${y})`} />;
      })}
      {/* overhead wire */}
      <path d="M-600 140 Q900 230 2600 130" fill="none" stroke={INK} strokeWidth={3} opacity={0.7} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-900} y={LANE_Y - 6} width={4200} height={600} fill="#cdb998" />
      <rect x={-900} y={LANE_Y - 6} width={4200} height={14} fill="#a8946f" />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M${-600 + i * 260} ${LANE_Y + 60 + noise(i) * 90} l${40 + noise(i + 3) * 40} ${12} l${30} ${-8}`} fill="none" stroke="#a8946f" strokeWidth={4} />
      ))}
      {/* parked bicycle */}
      <g transform="translate(1080 0)">
        <circle cx={0} cy={LANE_Y - 38} r={36} fill="none" stroke={INK} strokeWidth={7} />
        <circle cx={130} cy={LANE_Y - 38} r={36} fill="none" stroke={INK} strokeWidth={7} />
        <path d={`M0 ${LANE_Y - 38} L45 ${LANE_Y - 100} H110 L130 ${LANE_Y - 38} M45 ${LANE_Y - 100} L70 ${LANE_Y - 38} L110 ${LANE_Y - 100} M40 ${LANE_Y - 112} H60 M110 ${LANE_Y - 100} L104 ${LANE_Y - 120}`} fill="none" stroke="#cf5b3a" strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* doorstep */}
      <rect x={STEP.x} y={STEP.top} width={STEP.w} height={LANE_Y - STEP.top} fill="#b49a7a" stroke={INK} strokeWidth={5} />
      <rect x={STEP.x - 6} y={STEP.top - 4} width={STEP.w + 12} height={10} fill="#d9c7a8" />
    </Layer>
  </>
);

const Bunting: React.FC<{ cam: Camera; t: number }> = ({ cam, t }) => (
  <Layer cam={cam} depth={1.2}>
    <path d="M-700 40 Q900 120 2700 30" fill="none" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 30 }, (_, i) => {
      const x = -650 + i * 115;
      const y = 40 + Math.sin(((x + 700) / 3400) * Math.PI) * 78;
      return <path key={i} d={`M${x} ${y} l44 0 l-22 ${52}Z`} fill={["#d8344f", "#f2b632", "#1d9a8f", "#2c6fbb", "#f3e9d7"][i % 5]} transform={`rotate(${Math.sin(t * 0.09 + i) * 4} ${x + 22} ${y})`} />;
    })}
  </Layer>
);

const CricketBall: React.FC<{ x: number; y: number; spin: number; glow?: boolean }> = ({ x, y, spin, glow }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    {glow && <circle r={30} fill="#fff" opacity={0.55} />}
    <circle r={17} fill={CRIMSON} stroke={INK} strokeWidth={4} />
    <path d="M-12 -10 Q0 0 -12 10 M12 -10 Q0 0 12 10" fill="none" stroke="#fbe7c2" strokeWidth={2.5} />
  </g>
);

/** A bat held in the hand, along the forearm. */
const Bat: React.FC<{ angle: number }> = ({ angle }) => (
  <g transform={`rotate(${-angle})`}>
    <rect x={-5} y={-6} width={10} height={40} rx={4} fill="#6f4a2f" />
    <rect x={-11} y={30} width={22} height={86} rx={8} fill="#e6cd98" stroke={INK} strokeWidth={4} />
  </g>
);

/* ---------- the catch ---------- */

const APEX = { x: 1560, y: 215 };
const HIT_AT = { x: 520, y: 770 };
const HAND_Y = 600;
const G = 5.5;

const Cricket: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues, clips } = shot;
  const b = beatTimes(cues, clips);
  const pause = { from: cues.six_hit, to: cues.caught };
  const paused = frame >= pause.from && frame < pause.to;
  const hitT = wc(b.hit);
  const dt = t - hitT; // world frames since the hit (stands still in the pause)
  const F = wc(cues.six_hit) - hitT; // flight time to the apex, where the pause catches it

  // ball: bowled, bounced, hit, skied to the apex (frozen there), then drops
  const release = hitT - 12;
  const bounce = hitT - 6;
  let ball = { x: 900, y: 700 };
  if (t >= release && t < bounce) { const k = (t - release) / 6; ball = { x: mix(900, 660, k), y: mix(690, LANE_Y - 14, k * k) }; }
  else if (t >= bounce && t < hitT) { const k = (t - bounce) / 6; ball = { x: mix(660, HIT_AT.x, k), y: mix(LANE_Y - 14, HIT_AT.y, Math.sqrt(k)) }; }
  else if (dt >= 0 && dt <= F) { const k = dt / F; ball = { x: mix(HIT_AT.x, APEX.x, 1 - (1 - k) * (1 - k)), y: mix(HIT_AT.y, APEX.y, 1 - (1 - k) * (1 - k)) }; }
  else if (dt > F) ball = { x: APEX.x, y: Math.min(HAND_Y - 18, APEX.y + 0.5 * G * (dt - F) ** 2) };
  const inHands = dt > F && APEX.y + 0.5 * G * (dt - F) ** 2 >= HAND_Y - 18;
  const caughtAt = cues.caught + 12;
  const cheer = frame >= caughtAt + 2;

  // you: watch, snap, turn, walk under it, cup your hands, catch, celebrate
  const snapK = ramp(frame, cues.six_hit - 6, cues.six_hit);
  const walk = linear(frame, cues.six_hit + 10, cues.six_hit + 58);
  const youX = mix(1380, 1525, walk);
  const facing: 1 | -1 = frame >= cues.six_hit + 8 ? 1 : -1;
  let body: Pose = lerpPose(STAND, SNAP, snapK);
  if (frame >= cues.six_hit + 8) body = walk > 0 && walk < 1 ? walkPose((frame - cues.six_hit) * 0.34) : { ...STAND, tilt: -10 };
  const youP = { x: youX, y: LANE_Y + 10, scale: 1, facing, pose: body };
  const cupF = armTo(youP, APEX.x + 14, HAND_Y);
  const cupB = armTo(youP, APEX.x - 14, HAND_Y + 6);
  const cupK = ramp(frame, cues.six_hit + 58, cues.six_hit + 76);
  let armF = blendArm(body.armF, cupF, cupK);
  let armB = blendArm(body.armB, cupB, cupK);
  const raise = ramp(frame, caughtAt + 2, caughtAt + 10);
  armF = blendArm(armF, [150, 24], raise);
  armB = blendArm(armB, [-150, -20], raise);
  const lower = ramp(frame, clips[50].from + 46, clips[50].from + 60); // "greed": look at the ball
  armF = blendArm(armF, armTo(youP, youX + 70, LANE_Y - 250), lower);
  armB = blendArm(armB, [-8, 10], lower);
  const pose: Pose = { ...body, armF, armB, tilt: frame >= cues.six_hit + 50 && !cheer ? -12 : body.tilt };
  const hand = handAt({ ...youP, pose });
  const heldBall = inHands ? { x: hand.x - 6, y: hand.y - 16 } : ball;

  // the kids
  const swing = t < hitT - 4 ? -150 : t < hitT + 6 ? mix(-150, 130, (t - (hitT - 4)) / 10) : 130;
  const batsmanArm: [number, number] = [swing - 30, 30];
  const bowlArm = t >= release - 8 && t < release ? -90 + ((t - release + 8) / 8) * 300 : t >= release ? 200 : 20;
  const jump = (i: number) => (cheer ? Math.abs(Math.sin((frame - caughtAt) * 0.32 + i * 1.3)) * 46 : 0);
  const rushK = (i: number) => ramp(frame, caughtAt + 10 + i * 6, caughtAt + 60 + i * 6);
  const kids = [
    { x: mix(900, 1330, rushK(0)), head: KID_HEADS[1], facing: (rushK(0) > 0 && rushK(0) < 1 ? 1 : -1) as 1 | -1, pose: cheer ? { ...STAND, armF: [165, 10], armB: [-160, -10] } as Pose : { ...STAND, armF: [bowlArm, 6] } as Pose },
    { x: mix(1150, 1700, rushK(1)), head: KID_HEADS[2], facing: -1 as const, pose: cheer ? { ...STAND, armF: [160, 15], armB: [-165, -10] } as Pose : { ...STAND, lean: 10, drop: 12, armF: [60, 20], armB: [40, 30] } as Pose },
    { x: 220, head: KID_HEADS[4], facing: 1 as const, pose: cheer ? { ...STAND, armF: [150, 30], armB: [-150, -30] } as Pose : { ...STAND, lean: 14, drop: 20, armF: [40, 40], armB: [30, 40] } as Pose },
  ];

  const cam = cutAt(frame, [
    [b.lane, camAt(frame, [[b.lane, { x: 990, y: 520, zoom: 0.96 }], [cues.six_hit, { x: 1010, y: 510, zoom: 1.0 }]])],
    [cues.six_hit + 28, drift(camAt(frame, [[cues.six_hit + 28, { x: 1480, y: 560, zoom: 1.12 }], [cues.caught, { x: 1500, y: 545, zoom: 1.24 }], [cues.caught + 12, { x: 1500, y: 560, zoom: 1.24 }]]), frame, "catch", 4)],
    [cues.caught + 28, drift({ x: 1050, y: 560, zoom: 1.0 }, frame, "erupt")],
    [lineEnd(clips, 49) + 20, drift(camAt(frame, [[lineEnd(clips, 49) + 20, { x: 1470, y: 600, zoom: 1.65 }], [b.cuts, { x: 1480, y: 590, zoom: 1.8 }]]), frame, "hero")],
  ]);
  const snapHand = handAt({ x: 1380, y: LANE_Y + 10, facing: -1, pose: SNAP });
  const origin = toScreen(cam, snapHand.x, snapHand.y);

  const back = <LaneBack cam={cam} t={t} />;
  const actors = (
    <>
      {/* batsman */}
      <Figure x={430} y={LANE_Y} scale={0.7} facing={1} head={KID_HEADS[0]} cap="#2c6fbb"
        pose={cheer ? { ...STAND, armF: [165, 150], armB: [-170, -150] } : { ...STAND, lean: 8, drop: 10, armF: batsmanArm, armB: [batsmanArm[0] - 10, 40] }}
        held={cheer ? undefined : <Bat angle={batsmanArm[0] + batsmanArm[1]} />}
        mouth={cheer ? "o" : "flat"} brows={cheer ? "sad" : "angry"} look={{ x: 0.9, y: dt > 0 && !cheer ? -0.6 : 0 }} blink={!paused && blinking(frame, 1)} time={t} />
      {cheer && <g transform={`translate(470 ${LANE_Y - 8}) rotate(-80)`}><Bat angle={0} /></g>}
      {kids.map((k, i) => (
        <Figure key={i} x={k.x} y={LANE_Y - jump(i)} scale={0.68} facing={k.facing} head={k.head} pose={rushK(i) > 0 && rushK(i) < 1 ? runPose(frame * 0.45 + i) : k.pose}
          mouth={cheer ? "open" : dt > 0 ? "o" : "flat"} eyes={cheer || dt > 0 ? 1.2 : 1} look={{ x: 0.5, y: dt > 0 && !cheer ? -0.8 : 0 }} blink={!paused && blinking(frame, i + 5)} time={t} />
      ))}
      <You {...youP} pose={pose} mouth={cheer ? (lower > 0.5 ? "smile" : "open") : frame >= cues.six_hit + 8 ? "flat" : "o"}
        eyes={!cheer && frame >= cues.six_hit - 10 ? 1.2 : 1} brows={cheer && lower < 0.5 ? "raised" : "none"} lids={lower * 0.4}
        look={cheer ? (lower > 0.5 ? { x: 0.6, y: 0.4 } : { x: 0.4, y: -0.4 }) : frame >= cues.six_hit + 8 ? { x: 0.4, y: -1 } : { x: 0.6, y: -0.7 }}
        blink={blinking(frame, 2) && !paused} time={frame} flow={walk > 0 && walk < 1 ? 0.3 : 0} />
      {frame >= b.hit - 14 && <CricketBall x={heldBall.x} y={heldBall.y} spin={inHands ? 0 : t * 12} glow={paused} />}
      {dt > 0 && dt < F && <path d={`M${HIT_AT.x} ${HIT_AT.y} Q${mix(HIT_AT.x, ball.x, 0.4)} ${mix(HIT_AT.y, ball.y, 0.8)} ${ball.x} ${ball.y}`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.5} strokeDasharray="4 16" strokeLinecap="round" />}
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={paused ? waveRadius(frame, pause) : 0} origin={origin} sky={LANE_SKY} back={back} actors={actors} front={<Bunting cam={cam} t={t} />} />
      <Counter ticks={evenTicks(pause.from, pause.to)} until={pause.to} />
    </AbsoluteFill>
  );
};

export const LaneScene: React.FC<{ shot: Shot }> = ({ shot }) => {
  return <Cricket shot={shot} />;
};

