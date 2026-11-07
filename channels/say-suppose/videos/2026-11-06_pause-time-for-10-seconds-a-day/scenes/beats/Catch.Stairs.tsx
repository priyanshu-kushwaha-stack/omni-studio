import { AbsoluteFill, interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, reach, runPose, SIT, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Counter } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, MOTHER, noise, ramp, type Shot } from "../shared";
import { FLOOR_Y, HomeBack, LAMP, STAIR_X, STEP_H, STEP_W, stepTop } from "../sets/Home";
import { Fingers, handWorld, KNEEL, Lit } from "./Catch.rig";

const M_SCALE = 0.95;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

const CARRY: Pose = { ...STAND, armF: [62, 52], armB: [55, 58] };
const FLAIL: Pose = { lean: -6, tilt: 10, armF: [150, 25], armB: [165, 15], legF: [80, -10], legB: [55, -35], drop: 0 };
const RECLINE: Pose = { lean: 0, tilt: 12, armF: [40, 20], armB: [70, 15], legF: [62, -8], legB: [56, -14], drop: 0 };

/** The washing basket, drawn around its centre. */
const Basket: React.FC = () => (
  <g>
    <path d="M-30 -14 Q-20 -30 -6 -18 Q4 -34 16 -18 Q26 -30 32 -14 Z" fill="#f3e9d7" />
    <circle cx={-12} cy={-20} r={9} fill="#7fa0c4" /><circle cx={12} cy={-22} r={8} fill="#e6a0a0" />
    <path d="M-38 -14 H38 L30 22 H-30 Z" fill="#d9a766" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-30 -2 H30 M-28 10 H28" stroke="#a87a44" strokeWidth={4} />
  </g>
);

const CLOTHES = [
  { color: "#7fa0c4", w: 44, h: 30, vx: -4.5, vy: -7 },
  { color: "#e6a0a0", w: 30, h: 22, vx: -2.2, vy: -9.5 },
  { color: "#f3e9d7", w: 50, h: 34, vx: -7.5, vy: -6 },
  { color: "#7fc29b", w: 26, h: 16, vx: -1, vy: -11 },
  { color: "#d9c26a", w: 36, h: 24, vx: -9.5, vy: -4 },
];

/** The top of the stairs (or the floor) under a point, for things that land. */
const surfaceAt = (x: number) => {
  const n = Math.ceil((x - STAIR_X) / STEP_W);
  return n <= 0 ? FLOOR_Y : FLOOR_Y - Math.min(10, n) * STEP_H;
};

/** Lines 44-45 and the 8 s hold: your mother misses a step, your snap does nothing, she falls the last steps in slow
 *  motion, you kneel by her, she sits up and waves you off; then her bruised arm, then your face. No pause here. */
export const Stairs: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues, clips } = shot;
  const c44 = clips[44].from;
  const slip = cues.stairs;
  const click = cues.nothing - 30;
  const hold = clips[44].from + clips[44].frames;
  const c45 = clips[45].from;

  // Slow motion: from the slip on, the fall runs on its own slow clock (in frames of the fall).
  const tau = interpolate(frame, [slip, slip + 20, hold, hold + 100, hold + 240], [0, 12, 22, 62, 140], clamp);
  const p = interpolate(tau, [0, 12, 22, 62], [0, 0.18, 0.32, 1], clamp);

  // Your mother: down the stairs with the basket, the slip, the bumps down three steps, then sitting up.
  const s = 8 - Math.max(0, Math.min(slip, frame) - c44) / 11;
  const standX = STAIR_X + (s - 0.5) * STEP_W;
  const standY = FLOOR_Y - s * STEP_H - Math.abs(Math.sin(Math.PI * s)) * 6;
  let hip = { x: standX, y: standY - 112 * M_SCALE };
  let rot = 0;
  let mPose: Pose = lerpPose(CARRY, { ...walkPose(s * Math.PI), armF: CARRY.armF, armB: CARRY.armB }, 0.6);
  if (frame >= slip) {
    if (p < 0.32) {
      const k = p / 0.32;
      hip = { x: mix(hip.x, 1420, k), y: mix(hip.y, 642, smooth(k)) };
      rot = mix(0, 42, smooth(k));
      mPose = lerpPose(CARRY, FLAIL, smooth(k * 1.6));
    } else {
      const u = (p - 0.32) / 0.68;
      const hx = mix(1420, 1200, u);
      const n = Math.max(0, Math.ceil((hx - STAIR_X) / STEP_W));
      const f = n > 0 ? (STAIR_X + n * STEP_W - hx) / STEP_W : 1;
      const top = (k: number) => FLOOR_Y - k * STEP_H;
      const drop = n > 0 ? (top(n - 1) - top(n)) * smooth((f - 0.5) / 0.5) : 0;
      const hy = n > 0 ? top(n) - 24 + drop : FLOOR_Y - 25;
      hip = { x: hx, y: mix(642, hy, smooth(Math.min(1, u * 4))) };
      rot = mix(42, 60, u);
      mPose = lerpPose(FLAIL, RECLINE, smooth(u * 1.3));
    }
  }
  const sitUp = ramp(frame, hold + 160, hold + 196);
  const waveOff = frame >= hold + 196 && frame < c45;
  const rub = frame >= c45 - 6;
  if (sitUp > 0) {
    rot = mix(60, 6, sitUp);
    const SITTING: Pose = { ...SIT, lean: -4, armB: [24, 20], armF: waveOff ? [110 + Math.sin((frame - hold - 196) * 0.42) * 22, 60] : rub ? reach(-6, 30 + Math.sin(frame * 0.22) * 9) : [40, 40] };
    if (rub) SITTING.armB = [-14, 10];
    mPose = lerpPose(RECLINE, SITTING, sitUp);
  }
  const mother = { x: hip.x, y: hip.y + (112 - mPose.drop) * M_SCALE };
  const mFace = frame < slip
    ? { mouth: "smile" as const, brows: "none" as const, lids: 0.2, eyes: 1, look: { x: 0.5, y: 0.6 } }
    : p < 1 && sitUp === 0
      ? { mouth: "o" as const, brows: "raised" as const, lids: 0, eyes: 1.3, look: { x: 0.3, y: -0.4 } }
      : sitUp < 1
        ? { mouth: "frown" as const, brows: "worry" as const, lids: 0.55, eyes: 1, look: { x: 0.2, y: -0.3 } }
        : rub
          ? { mouth: frame >= c45 + 30 ? ("smile" as const) : ("wobble" as const), brows: "worry" as const, lids: 0.35, eyes: 1, look: { x: -0.2, y: 0.4 } }
          : { mouth: "smile" as const, brows: "worry" as const, lids: 0.3, eyes: 1, look: { x: 0.8, y: 0.1 } };

  // The basket and the washing fly on the slow clock and settle where they land.
  const hands0 = handWorld(standX, standY, CARRY, M_SCALE, -1);
  const basketAt = (() => {
    const tt = Math.max(0, tau - 2);
    const x = hands0.x - 9 * tt;
    const y = hands0.y - 9 * tt + 0.45 * tt * tt;
    const floor = surfaceAt(x) - 22;
    return y >= floor && tt > 4 ? { x: Math.max(1000, x), y: floor, r: 180 } : { x, y, r: tt * 9 };
  })();

  // You: on your phone by the sofa; you turn; snap; nothing; you run (slowly) and kneel by her.
  const turn = slip + 6;
  const raise = ramp(frame, click - 18, click - 2);
  const lower = ramp(frame, cues.nothing + 4, hold);
  const runK = linear(frame, hold, hold + 110);
  const kneelK = ramp(frame, hold + 104, hold + 124);
  let hx = 760;
  let hPose: Pose = { ...STAND, armF: [48, 62], tilt: 8 };
  if (frame >= turn) hPose = lerpPose(hPose, { ...STAND, armF: [30, 20] }, ramp(frame, turn, turn + 8));
  if (frame >= click - 18) hPose = lerpPose(hPose, SNAP, raise);
  if (frame >= cues.nothing + 4) hPose = lerpPose(SNAP, { ...SNAP, armF: [60, 30], tilt: 6 }, lower);
  if (frame >= hold) {
    hx = mix(760, 1000, runK);
    hPose = lerpPose(lerpPose({ ...SNAP, armF: [60, 30] }, runPose((frame - hold) * 0.14), ramp(frame, hold, hold + 20)), KNEEL, kneelK);
    if (kneelK >= 1) hPose = { ...KNEEL, armF: waveOff || rub ? [40, 30] : [78, 20] };
  }
  const facing: 1 | -1 = frame < turn ? -1 : 1;
  const hFace = frame < turn
    ? { mouth: "smile" as const, brows: "none" as const, lids: 0.3, eyes: 1, look: { x: 0.6, y: 0.7 } }
    : frame < cues.nothing
      ? { mouth: frame < click ? ("o" as const) : ("open" as const), brows: frame < click ? ("raised" as const) : ("worry" as const), lids: 0, eyes: 1.35, look: { x: 0.9, y: -0.35 } }
      : frame < c45
        ? { mouth: frame < hold + 110 ? ("open" as const) : ("wobble" as const), brows: "worry" as const, lids: 0.1, eyes: 1.25, look: { x: 0.9, y: 0.25 } }
        : { mouth: "wobble" as const, brows: "sad" as const, lids: 0.55, eyes: 1, look: { x: 0.5, y: 0.5 } };

  const phone = (() => {
    if (frame < turn) return null;
    const fall = linear(frame, turn, turn + 40);
    return { x: 770 + fall * 30, y: mix(735, FLOOR_Y - 6, fall * fall), r: fall * 140 };
  })();

  // Shots.
  const name = current(frame, [
    [c44, "wide"], [turn + 7, "face"], [click - 30, "two"], [cues.nothing - 3, "fall"], [hold + 101, "foot"],
    [hold + 171, "close"], [c45, "arm"], [cues.notyou - 12, "you"],
  ] as [number, string][]);
  const kneelHead = { x: 1000 + 31, y: FLOOR_Y - 205 };
  const cam: Camera =
    name === "wide" ? camAt(frame, [[c44, { x: 1150, y: 600, zoom: 1.04 }], [turn + 7, { x: 1170, y: 612, zoom: 1.1 }]])
    : name === "face" ? drift({ x: 790, y: 636, zoom: 2.5 }, frame, "face")
    : name === "two" ? camAt(frame, [[click - 30, { x: 1060, y: 610, zoom: 1.42 }], [cues.nothing, { x: 1075, y: 615, zoom: 1.5 }]])
    : name === "fall" ? camAt(frame, [[cues.nothing - 3, { x: 1110, y: 620, zoom: 1.08 }], [hold + 101, { x: 1150, y: 690, zoom: 1.32 }]])
    : name === "foot" ? drift({ x: 1110, y: 745, zoom: 1.9 }, frame, "foot")
    : name === "close" ? camAt(frame, [[hold + 171, { x: 1110, y: 760, zoom: 2.05 }], [c45, { x: 1120, y: 765, zoom: 2.25 }]])
    : name === "arm" ? drift({ x: mother.x - 10, y: mother.y - 205, zoom: 3.8 }, frame, "arm")
    : drift({ x: kneelHead.x + 10, y: kneelHead.y + 22, zoom: 2.9 }, frame, "you");

  const dark = ramp(frame, cues.nothing, hold + 200);
  const lamp = toScreen(cam, LAMP.x, LAMP.y + 40);
  const heroHand = handWorld(hx, FLOOR_Y, hPose, 1, facing);

  const back = <HomeBack cam={cam} />;
  const actors = (
    <>
      <Figure x={mother.x} y={mother.y} scale={M_SCALE} facing={-1} rotate={rot} pose={mPose} {...MOTHER} {...mFace}
        blink={blinking(frame, 5) && frame < slip} held={frame < slip + 2 ? <g transform="translate(-6 10)"><Basket /></g> : undefined} />
      {sitUp >= 1 && frame >= c45 + 40 && <circle cx={mother.x - 20} cy={mother.y - 175} r={7} fill="#8a5aa8" opacity={0.8} />}
      {frame >= slip + 2 && <g transform={`translate(${basketAt.x} ${basketAt.y}) rotate(${basketAt.r})`}><Basket /></g>}
      {frame >= slip + 4 && CLOTHES.map((c, i) => {
        const tt = Math.max(0, tau - 4 - i);
        let x = hands0.x + c.vx * tt;
        let y = hands0.y - 20 + c.vy * tt + 0.3 * tt * tt;
        const floor = surfaceAt(x) - c.h / 2;
        const landed = y >= floor && tt > 5;
        if (landed) { y = floor; x = Math.max(900, x); }
        const r = landed ? (noise(i) - 0.5) * 30 : tt * (6 + i * 3) * (i % 2 ? 1 : -1);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <path d={`M${-c.w / 2} ${-c.h / 2} h${c.w} l-4 ${c.h} h${-c.w + 8} Z`} fill={c.color} stroke={INK} strokeWidth={3} />
            {i % 2 === 0 && <path d={`M${-c.w / 2} ${-c.h / 2} l-10 10 M${c.w / 2} ${-c.h / 2} l10 10`} stroke={c.color} strokeWidth={9} strokeLinecap="round" />}
          </g>
        );
      })}
      {phone && (
        <g transform={`translate(${phone.x} ${phone.y}) rotate(${phone.r})`}>
          <rect x={-11} y={-18} width={22} height={36} rx={5} fill={INK} /><rect x={-7} y={-13} width={14} height={24} rx={2} fill="#8fd0e4" />
        </g>
      )}
      <Figure {...HERO} x={hx} y={FLOOR_Y} facing={facing} pose={hPose} {...hFace} time={frame}
        blink={frame < slip && blinking(frame, 1)}
        flow={frame >= hold && kneelK < 1 ? 0.5 : 0}
        held={frame < turn
          ? <rect x={-11} y={-18} width={22} height={36} rx={5} fill={INK} />
          : frame >= click - 22 && frame < hold ? <Fingers angle={hPose.armF[0] + hPose.armF[1]} snap={ramp(frame, click - 4, click)} /> : undefined} />
      {/* a dead snap: two pale flecks that fall from your fingers and go out */}
      {frame >= click && frame < click + 24 && [0, 1].map((i) => (
        <circle key={i} cx={heroHand.x + (i ? 14 : -10)} cy={heroHand.y - 6 + (frame - click) * 1.6} r={4 * (1 - (frame - click) / 24)} fill="#f3e9d7" opacity={0.7} />
      ))}
    </>
  );

  return (
    <AbsoluteFill>
      <Lit extra={{ glows: [
        { x: lamp.x, y: lamp.y, r: 560 * cam.zoom, color: "rgba(255,186,104,0.62)" },
        { x: 980, y: 600, r: 1100, color: `rgba(255,170,110,${0.3 - 0.08 * dark})` },
      ] }}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
      </Lit>
      {/* the shadows deepen and the vignette closes in on the two of you */}
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", background: `rgba(70,36,52,${0.2 * dark})` }} />
      <AbsoluteFill style={{ pointerEvents: "none",
        background: `radial-gradient(ellipse at 52% 56%, rgba(0,0,0,0) ${mix(62, 30, dark)}%, rgba(12,6,14,${mix(0, 0.72, dark)}) 100%)` }} />
      <Counter ticks={[{ at: click, n: 0 }]} until={hold} />
    </AbsoluteFill>
  );
};

