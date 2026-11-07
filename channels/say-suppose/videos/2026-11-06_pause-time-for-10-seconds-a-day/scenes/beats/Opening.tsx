import { AbsoluteFill, Audio, Sequence, spring, staticFile } from "remotion";
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, joints, lerpPose, LIMB, reach, SIT, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook, type Glow } from "@whatif/kit/stage/Look";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { HEIGHT, INK, MUSTARD, WIDTH } from "@whatif/kit/theme";
import { Flip } from "@whatif/kit/ui/Flip";
import type { Clip } from "@whatif/kit/timeline";
import type { Pause } from "@whatif/kit/world/clock";
import { Counter, evenTicks, type Tick } from "../parts";
import { Ball, Bus, BUS_STOP_X, KID_FEET, Pigeon, SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, HERO, lineEnd, linear, mix, noise, ramp, type Beat, type Shot } from "../shared";
import { BedroomBack, BedroomFront, Cat, CLOCK, FEET_Y, HIP_X, PHONE, Pillow, PILLOW, WINDOW, type CatPose, type ClockHands } from "./Opening.Bedroom";

/* Beat 1, "The change and the rule" (scene_plan.md, lines 0 to 10).
 *  0      flash-forward: the frozen crossing on day twelve, counter at 7; cut to black on "seconds".
 *  1-5    the bedroom, morning: alarm, first snap, the cat mid-leap, the counter and the rule.
 *  6      the bedroom at night: the clock turns to midnight, the counter resets to 10.
 *  7      a dark void: the stopped air seals you in amber; then black, only your eyes.
 *  8-10   the bedroom, still stopped: the amber shatters, air, sight, touch; then the first idea. */

// ---------------------------------------------------------------------------------------------------- timing

type T = ReturnType<typeof times>;

/** Every beat frame comes from cues and clips. */
function times(cues: Record<string, number>, clips: Clip[]) {
  return {
    flash: cues.flash,
    bedIn: cues.flash + 24,
    wake: clips[1].from + 8,
    snap1: cues.snap1,
    alarm: clips[2].from,
    cat: cues.cat,
    question: clips[3].from,
    colour1: lineEnd(clips, 3) + 10,
    counter: cues.counter,
    wide2: cues.counter + 70,
    stops: cues.stops,
    exceptYou: cues.stops + 40,
    line5: lineEnd(clips, 4),
    restart: cues.restart,
    catClose: cues.restart + 40,
    night: lineEnd(clips, 5) + 4,
    midnight: cues.midnight,
    voidIn: clips[7].from - 10,
    seal: clips[7].from,
    amber: cues.amber,
    blind: cues.blind,
    line8: clips[8].from,
    cheat: cues.cheat,
    air: cues.air,
    see: cues.see,
    touch: cues.touch,
    release: cues.touch + 70,
    resume: clips[9].from,
    grin: cues.grin,
    phone: cues.grin + 34,
  };
}

/** The flash-forward hold (to just past the cut to black), the first snap (colour back a beat after line 3), the
 *  rule's demonstration ("stops" to "starts"), and the explanation of lines 7-8, held inside one stopped moment until
 *  line 9. */
function pausesOf(cues: Record<string, number>, clips: Clip[]): Pause[] {
  const k = times(cues, clips);
  return [
    { from: 0, to: k.flash + 12 },
    { from: k.snap1, to: k.colour1 },
    { from: k.stops, to: k.restart },
    { from: k.seal, to: k.resume },
  ];
}

// ---------------------------------------------------------------------------------------------------- rig helpers

const LYING: Pose = { ...SIT, armB: [5, 4], armF: [8, 6], legB: [0, -2], legF: [0, -2] };
const SIT_SNAP: Pose = { ...SIT, lean: -4, tilt: -6, armF: [125, 45] };
const FINGER = <rect x={-4.5} y={-34} width={9} height={30} rx={4.5} fill={MUSTARD} />;

interface Body { x: number; y: number; scale: number; facing: 1 | -1; pose: Pose }

const shoulderOf = (b: Body) => {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
};
const headOf = (b: Body) => {
  const j = joints(b.pose);
  return { x: b.x + j.head.x * b.scale * b.facing, y: b.y + j.head.y * b.scale };
};
const handOf = (b: Body) => {
  const s = shoulderOf(b);
  const a = dir(b.pose.armF[0]);
  const c = dir(b.pose.armF[0] + b.pose.armF[1]);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
};
/** Arm angles that put a hand on a world point. */
const aim = (b: Body, target: { x: number; y: number }): [number, number] => {
  const s = shoulderOf(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
};
const withArm = (p: Pose, armF: [number, number], k: number): Pose => ({ ...p, armF: [mix(p.armF[0], armF[0], k), mix(p.armF[1], armF[1], k)] });

/** The flick of a snap, at the hand, for a few frames. */
const Spark: React.FC<{ at: { x: number; y: number }; frame: number; cue: number; scale?: number }> = ({ at, frame, cue, scale = 1 }) => {
  const k = frame - cue;
  if (k < 0 || k > 9) return null;
  const r = (18 + k * 6) * scale;
  return (
    <g stroke="#fff6e3" strokeWidth={5 * scale} strokeLinecap="round" opacity={1 - k / 10}>
      {[-60, -20, 20, 60].map((a) => {
        const d = { x: Math.sin((a * Math.PI) / 180), y: -Math.cos((a * Math.PI) / 180) };
        return <line key={a} x1={at.x + d.x * r} y1={at.y + d.y * r} x2={at.x + d.x * (r + 18 * scale)} y2={at.y + d.y * (r + 18 * scale)} />;
      })}
    </g>
  );
};

/** The translucent amber block of stopped air around a standing figure. */
const Amber: React.FC<{ cx: number; top: number; bottom: number; w: number; s?: number; opacity?: number; flash?: number; fly?: boolean }> = ({
  cx, top, bottom, w, s = 1, opacity = 1, flash = 0, fly,
}) => {
  const cy = (top + bottom) / 2;
  const l = cx - w / 2;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`} opacity={opacity}>
      <rect x={l} y={top} width={w} height={bottom - top} rx={24} fill="#f2a33a" fillOpacity={0.42} stroke="#b8701c" strokeWidth={7} />
      <rect x={l + 10} y={top + 10} width={w - 20} height={22} rx={10} fill="#ffd27a" opacity={0.45} />
      <path d={`M${l + 26} ${top + 120} L${l + 70} ${top + 60} M${l + 30} ${top + 170} L${l + 52} ${top + 140}`} stroke="#fff6e3" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
      <path d={`M${l + w - 30} ${bottom - 120} L${l + w - 60} ${bottom - 70}`} stroke="#fff6e3" strokeWidth={6} strokeLinecap="round" opacity={0.4} />
      {fly && (
        <g transform={`translate(${l + w - 46} ${top + 74}) rotate(-20)`}>
          <ellipse cx={-6} cy={-8} rx={9} ry={5} fill="#e8f4ff" opacity={0.85} transform="rotate(-30 -6 -8)" />
          <ellipse cx={6} cy={-8} rx={9} ry={5} fill="#e8f4ff" opacity={0.85} transform="rotate(30 6 -8)" />
          <ellipse rx={8} ry={6} fill={INK} /><circle cx={9} cy={-1} r={4.5} fill={INK} />
          <path d="M-4 5 l-5 7 M2 5 l0 8 M6 4 l5 7" stroke={INK} strokeWidth={2} />
        </g>
      )}
      {flash > 0 && <rect x={l} y={top} width={w} height={bottom - top} rx={24} fill="none" stroke="#fff6e3" strokeWidth={14} opacity={flash} />}
    </g>
  );
};

/** The amber breaking into paper flakes. */
const Flakes: React.FC<{ cx: number; top: number; bottom: number; w: number; k: number }> = ({ cx, top, bottom, w, k }) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const sx = cx - w / 2 + noise(i + 300) * w;
        const sy = top + noise(i + 400) * (bottom - top);
        const vx = (sx - cx) * (0.9 + noise(i + 500)) + (noise(i + 600) - 0.5) * 120;
        const vy = (sy - (top + bottom) / 2) * 0.6 - 120 * noise(i + 700);
        const x = sx + vx * k;
        const y = sy + vy * k + 260 * k * k;
        const size = 14 + noise(i + 800) * 22;
        return (
          <rect key={i} x={x - size / 2} y={y - size / 3} width={size} height={size * 0.66} rx={3}
            fill={i % 3 === 0 ? "#ffd27a" : "#f2a33a"} opacity={(1 - k) * 0.9} transform={`rotate(${(noise(i + 900) - 0.5) * 720 * k + i * 23} ${x} ${y})`} />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------------------------------- shot 0: the flash-forward

const StreetFlash: React.FC<{ shot: Shot; k: T; glows: Glow[] }> = ({ shot, k, glows }) => {
  const { frame, t } = shot;
  const cam = camAt(frame, [[0, { x: 1000, y: 690, zoom: 1.08 }], [k.flash, { x: 1075, y: 735, zoom: 1.32 }]]);
  const hero: Body = { x: 700, y: 1010, scale: 1.3, facing: 1, pose: SNAP };
  const hand = handOf(hero);
  const back = (
    <>
      <StreetBack cam={cam} frame={frame} t={t} red crowd paused />
      {[[880, 330, 0.8], [1150, 410, -0.6], [1290, 350, 0.9], [1520, 440, -0.4], [640, 380, 0.5]].map(([x, y, f], i) => (
        <Pigeon key={i} x={x} y={y} flap={f} />
      ))}
      <Bus x={BUS_STOP_X} t={0} moving={false} />
      <Ball x={1360} y={KID_FEET - 44} spin={28} />
      <Figure x={1225} y={KID_FEET} scale={0.72} pose={walkPose(1.2)} head="#e0a070" cap="#2c6fbb" look={{ x: 0.8, y: 0 }} mouth="smile" time={0} />
    </>
  );
  const actors = (
    <>
      <Figure {...HERO} {...hero} eyes={1.25} mouth="o" brows="raised" look={{ x: 0.9, y: -0.1 }} time={0} />
      <Spark at={hand} frame={6} cue={4} scale={1.3} />
    </>
  );
  const bus = toScreen(cam, BUS_STOP_X + 12, 806);
  const look = { glows: [...glows, { x: bus.x, y: bus.y, r: 220, color: "rgba(255,226,150,0.55)", strength: 0.8 }] };
  return (
    <LookContext.Provider value={{ ...useLook(), ...look }}>
      <Stage cam={cam} radius={2400} origin={toScreen(cam, hand.x, hand.y)} sky={SKY} back={back} actors={actors} />
      <Counter ticks={[{ at: 8, n: 7 }]} until={k.flash} />
    </LookContext.Provider>
  );
};

// ---------------------------------------------------------------------------------------------------- the cat

const SPOT = { bed: { x: 1190, y: 694 }, floor: { x: 1000, y: 905 }, back: { x: 1215, y: 694 } };
const LEAP = 34;

interface CatState { x: number; y: number; pose: CatPose; facing: 1 | -1; rot: number; spikes: boolean; lick: boolean }

function leap(p: number, a: { x: number; y: number }, b: { x: number; y: number }, h = 200) {
  const x = mix(a.x, b.x, p);
  const y = mix(a.y, b.y, p) - 4 * h * p * (1 - p) - 30;
  const dx = Math.abs(b.x - a.x);
  const dy = b.y - a.y - 4 * h * (1 - 2 * p);
  const rot = Math.max(-25, Math.min(45, (Math.atan2(dy, dx) * 180) / Math.PI * 0.8));
  return { x, y, rot };
}

/** The cat runs on world time: it leaps off the bed as the first snap lands, and back up as the second does. */
function catAt(t: number, leap1: number, leap2: number): CatState {
  const still = { rot: 0, spikes: false, lick: false };
  if (t < leap1) return { ...SPOT.bed, pose: "sit", facing: -1, ...still, spikes: t > leap1 - 40 };
  if (t < leap1 + LEAP) return { ...leap((t - leap1) / LEAP, SPOT.bed, SPOT.floor), pose: "leap", facing: -1, spikes: true, lick: false };
  if (t < leap2) return { ...SPOT.floor, pose: "sit", facing: -1, ...still, lick: t > leap1 + 90 && Math.sin(t * 0.2) > 0.2 };
  if (t < leap2 + LEAP) return { ...leap((t - leap2) / LEAP, SPOT.floor, SPOT.back, 230), pose: "leap", facing: 1, spikes: false, lick: false };
  return { ...SPOT.back, pose: "sit", facing: -1, ...still };
}

// ---------------------------------------------------------------------------------------------------- shots 1-6: the bedroom

function bedCam(frame: number, k: T): Camera {
  const seg = (a: number, b: number, c1: Camera, c2: Camera) => camAt(frame, [[a, c1], [b, c2]]);
  if (frame < k.alarm) return seg(k.bedIn, k.alarm, { x: 1000, y: 610, zoom: 1.42 }, { x: 1040, y: 598, zoom: 1.6 });
  if (frame < k.cat) return seg(k.alarm, k.cat, { x: 1450, y: 648, zoom: 3.1 }, { x: 1450, y: 652, zoom: 3.4 });
  if (frame < k.question) return seg(k.cat, k.question, { x: 1060, y: 640, zoom: 1.75 }, { x: 1066, y: 636, zoom: 1.9 });
  if (frame < k.colour1 - 10) return seg(k.question, k.colour1 - 10, closeUp(HIP_X, 583, 2.4), closeUp(HIP_X, 578, 3.0));
  if (frame < k.counter) return { x: 1000, y: 610, zoom: 1.42 };
  if (frame < k.wide2) return drift({ x: 985, y: 630, zoom: 1.75 }, frame, "c6");
  if (frame < k.exceptYou) return seg(k.wide2, k.exceptYou, { x: 1030, y: 640, zoom: 1.38 }, { x: 1036, y: 632, zoom: 1.46 });
  if (frame < k.line5) return drift({ x: 950, y: 600, zoom: 2.3 }, frame, "c8");
  if (frame < k.restart) return seg(k.line5, k.restart, { x: 1010, y: 650, zoom: 1.9 }, { x: 1020, y: 646, zoom: 2.05 });
  if (frame < k.catClose) return { x: 1040, y: 620, zoom: 1.42 };
  if (frame < k.night) return seg(k.catClose, k.night, { x: 1290, y: 625, zoom: 3.0 }, { x: 1290, y: 622, zoom: 3.2 });
  return seg(k.night, k.midnight + 8, { x: 1060, y: 660, zoom: 1.6 }, { x: 1360, y: 655, zoom: 2.4 });
}

interface Face { eyes: number; mouth: Mouth; brows: Brows; lids: number; look: { x: number; y: number }; blink: boolean }

/** You, in bed: wake, glare at the alarm, snap, stare; poke the cat; read the counter; snap again; grin. */
function bedHero(frame: number, k: T, cat: CatState): { body: Body; face: Face; held?: React.ReactNode; spark?: number } {
  const sit = ramp(frame, k.wake + 4, k.wake + 24);
  let pose = lerpPose(LYING, SIT, sit);
  const body: Body = { x: HIP_X, y: FEET_Y, scale: 1, facing: 1, pose: SIT };
  const up1 = ramp(frame, k.snap1 - 14, k.snap1 - 2) * (1 - ramp(frame, k.snap1 + 22, k.snap1 + 36));
  const up2 = ramp(frame, k.stops - 14, k.stops - 2) * (1 - ramp(frame, k.stops + 22, k.stops + 36));
  pose = lerpPose(pose, SIT_SNAP, Math.max(up1, up2));
  const flick = (c: number) => (frame >= c && frame < c + 4 ? 1 : 0);
  pose = { ...pose, armF: [pose.armF[0], pose.armF[1] - 18 * (flick(k.snap1) + flick(k.stops))] };

  // Poke the frozen cat.
  const poke = ramp(frame, k.cat + 16, k.cat + 34) * (1 - ramp(frame, k.cat + 62, k.cat + 76));
  if (poke > 0) pose = withArm({ ...pose, lean: 6 * poke }, aim(body, { x: 1022, y: 616 }), poke);
  // "Except you": wiggle your own fingers in front of your face.
  const self = ramp(frame, k.exceptYou + 2, k.exceptYou + 14) * (1 - ramp(frame, k.line5 - 4, k.line5 + 8));
  if (self > 0) pose = withArm(pose, [104 + Math.sin(frame * 0.5) * 6, 64 + Math.sin(frame * 0.7) * 10], self);

  const scan = (from: number, speed = 7) => ({ x: 0.4 + Math.sin((frame - from) / speed) * 0.9, y: -0.1 });
  let face: Face = { eyes: 1, mouth: "flat", brows: "none", lids: 0, look: { x: 0.4, y: 0 }, blink: blinking(frame, 1) };
  if (frame < k.wake) face = { ...face, blink: true, mouth: "frown" };
  else if (frame < k.snap1 + 6) face = { ...face, brows: "angry", lids: 0.45, mouth: "frown", look: { x: 1, y: 0.1 } };
  else if (frame < k.cat) face = { ...face, eyes: 1.3, mouth: "o", brows: "raised", look: scan(k.snap1), blink: false };
  else if (frame < k.question) face = { ...face, eyes: 1.2, brows: "raised", mouth: frame > k.cat + 40 ? "smile" : "o", look: { x: 1, y: 0.15 } };
  else if (frame < k.colour1) face = { ...face, eyes: 1.3, brows: "raised", mouth: frame > k.question + 70 ? "smile" : "o", look: scan(k.question, 11), blink: blinking(frame, 4) };
  else if (frame < k.counter) face = { ...face, eyes: 1.1, mouth: "open", brows: "raised", look: { x: 1, y: 0.5 } };
  else if (frame < k.wide2) face = { ...face, brows: "raised", mouth: "smile", look: { x: 0.9, y: -0.8 } };
  else if (frame < k.stops) face = { ...face, brows: "flat", mouth: "smirk", look: { x: 1, y: 0.5 } };
  else if (frame < k.exceptYou) face = { ...face, eyes: 1.3, mouth: "o", brows: "raised", look: scan(k.stops, 6), blink: false };
  else if (frame < k.line5) face = { ...face, eyes: 1.15, mouth: "smile", brows: "raised", look: { x: 0.9, y: -0.3 } };
  else if (frame < k.restart) face = { ...face, mouth: "smirk", brows: "flat", look: { x: 1, y: 0.4 } };
  else face = { ...face, mouth: "smirk", brows: "raised", look: { x: cat.x > HIP_X ? 1 : -1, y: 0.2 } };
  if (frame < k.wake + 4) return { body: { ...body, pose }, face };
  return { body: { ...body, pose }, face, spark: frame < k.restart ? (frame < k.stops ? k.snap1 : k.stops) : undefined };
}

const BedroomDay: React.FC<{ shot: Shot; k: T; glows: Glow[] }> = ({ shot, k, glows }) => {
  const { frame, t, wc } = shot;
  const night = frame >= k.night;
  const cam = bedCam(frame, k);
  const leap1 = wc(k.snap1) - 14;
  const leap2 = wc(k.stops) - 17;
  const cat = catAt(t, leap1, leap2);

  // The alarm rings on world time: frozen mid-shake through the first pause, then a last ring.
  const ringing = !night && t >= wc(k.bedIn) - 30 && t < wc(k.colour1) + 14;
  const phase = (t - wc(k.snap1)) * 1.9;
  const shake = ringing ? 7 * Math.cos(phase) : 0;
  const midnightTurn = ramp(frame, k.night, k.midnight);
  const hands: ClockHands = night
    ? { hour: mix(355, 360, midnightTurn), minute: mix(300, 360, midnightTurn), second: (frame - k.night) * 6 * 3 }
    : { hour: 212, minute: 22 + t * 0.002, second: Math.floor(t / 15) * 18 };

  const hero = bedHero(frame, k, cat);
  const pauses = shot.pauses.filter((p) => p.from >= k.snap1 && p.to <= k.restart);
  const radius = Math.max(0, ...pauses.map((p) => waveRadius(frame, p)));
  const hand = handOf(hero.body);
  const origin = toScreen(cam, hand.x, hand.y);

  const asleep = night;
  const back = (
    <BedroomBack cam={cam} t={t} night={night} shake={shake} ringing={ringing} hammer={Math.sin(phase * 1.3)} hands={hands}
      clockGlow={night ? ramp(frame, k.midnight - 2, k.midnight + 4) * (1 - ramp(frame, k.midnight + 10, k.midnight + 30)) : 0} />
  );
  const front = (
    <BedroomFront cam={cam}>
      {asleep ? <Cat x={1230} y={704} pose="curl" facing={-1} /> : (
        <Cat x={cat.x} y={cat.y} pose={cat.pose} facing={cat.facing} rot={cat.rot} spikes={cat.spikes} lick={cat.lick}
          blink={cat.pose === "sit" && !cat.lick && blinking(t, 6)} look={frame >= k.catClose ? -0.6 : 0} />
      )}
    </BedroomFront>
  );
  const actors = asleep ? (
    <Figure {...HERO} x={HIP_X} y={FEET_Y} rotate={-86} pose={LYING} blink mouth="flat" time={frame} />
  ) : (
    <>
      <Figure {...HERO} {...hero.body} rotate={mix(-86, 0, ramp(frame, k.wake + 4, k.wake + 24))} {...hero.face} time={frame} />
      {hero.spark !== undefined && <Spark at={hand} frame={frame} cue={hero.spark} />}
    </>
  );

  const win = toScreen(cam, WINDOW.x, WINDOW.y);
  const light: Glow[] = night
    ? [{ x: win.x, y: win.y, r: 520 * cam.zoom * 0.6, color: "rgba(140,165,255,0.55)", strength: 0.55 }]
    : [{ x: win.x, y: win.y, r: 640 * cam.zoom * 0.6, color: "rgba(255,240,200,0.6)", strength: 0.35 }];
  if (night) {
    const sleeper = toScreen(cam, 790, 720);
    light.push({ x: sleeper.x, y: sleeper.y, r: 260 * cam.zoom, color: "rgba(150,175,255,0.6)", strength: 0.5 });
    const c = toScreen(cam, CLOCK.x, CLOCK.y);
    light.push({ x: c.x, y: c.y, r: 160 * cam.zoom, color: "rgba(255,236,170,0.5)", strength: 0.4 + 0.5 * ramp(frame, k.midnight - 2, k.midnight + 4) });
  }

  // The counter: drops in at 10, counts the rule's ten seconds down to 0, then blanks at midnight and resets to 10.
  const ticks: Tick[] = [{ at: k.counter, n: 10 }, ...evenTicks(k.stops, k.restart).slice(1)];
  const fadeIn = 1 - linear(frame, k.bedIn, k.bedIn + 14);
  return (
    <>
      <LookContext.Provider value={{ ...useLook(), glows: [...glows, ...light] }}>
        <Stage cam={cam} radius={radius} origin={origin} back={back} actors={actors} front={front} />
      </LookContext.Provider>
      {frame >= k.counter && frame < k.midnight && <Counter ticks={ticks} />}
      {frame >= k.midnight && (
        <div style={{ position: "absolute", left: 1670, top: 50, transform: "scale(0.85)", transformOrigin: "top left" }}>
          {frame < k.midnight + 14
            ? <Flip value="" previous="0" changedAt={k.midnight} />
            : <Flip value="10" previous="" changedAt={k.midnight + 14} />}
        </div>
      )}
      {fadeIn > 0 && <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />}
    </>
  );
};

// ---------------------------------------------------------------------------------------------------- shot 7: the void

const VOID_HERO = { x: 960, y: 900, scale: 1.25 };

const VoidBack: React.FC<{ cam: Camera; t: number }> = ({ cam, t }) => (
  <>
    <Layer cam={cam} depth={0.4} flat>
      <rect x={-2500} y={-1800} width={7000} height={4500} fill="#20243c" />
      <circle cx={960} cy={560} r={760} fill="#262b48" />
      <circle cx={960} cy={560} r={470} fill="#2c3254" />
    </Layer>
    <Layer cam={cam} depth={1}>
      <polygon points="800,-200 1120,-200 1400,910 520,910" fill="#e8ecff" opacity={0.06} />
      <ellipse cx={960} cy={912} rx={470} ry={58} fill="#3a4170" />
      <ellipse cx={960} cy={912} rx={300} ry={36} fill="#4a5288" />
      {Array.from({ length: 70 }, (_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);
        const x = 470 + col * 108 + (noise(i + 11) - 0.5) * 60 + Math.sin(t / 20 + i) * 6;
        const y = 330 + row * 86 + (noise(i + 31) - 0.5) * 50 + Math.cos(t / 24 + i) * 5;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill="#bfe6ee" opacity={0.6} />
            {i % 3 === 0 && <circle cx={x + 9} cy={y - 5} r={3.5} fill="#bfe6ee" opacity={0.6} />}
          </g>
        );
      })}
    </Layer>
  </>
);

const VoidShot: React.FC<{ shot: Shot; k: T }> = ({ shot, k }) => {
  const { frame, t } = shot;
  const cam = frame < k.amber
    ? camAt(frame, [[k.voidIn, { x: 960, y: 650, zoom: 1.12 }], [k.amber, { x: 960, y: 660, zoom: 1.28 }]])
    : frame < k.amber + 50
      ? drift({ x: 960, y: 690, zoom: 1.65 }, frame, "amber")
      : camAt(frame, [[k.amber + 50, { x: 975, y: 640, zoom: 1.95 }], [k.blind, { x: 982, y: 618, zoom: 2.25 }]]);
  const body: Body = { ...VOID_HERO, facing: 1, pose: STAND };
  const up = ramp(frame, k.voidIn, k.seal - 2) * (1 - ramp(frame, k.seal + 18, k.seal + 32));
  let pose = lerpPose(STAND, SNAP, up);
  if (frame >= k.seal && frame < k.seal + 4) pose = { ...pose, armF: [pose.armF[0], pose.armF[1] - 18] };
  const push = ramp(frame, k.seal + 34, k.seal + 50);
  const strain = Math.sin(frame * 0.22) * 3;
  if (frame < k.amber) {
    const shove: Pose = { ...STAND, lean: 14 + strain, tilt: -4, armF: [80, 16], armB: [68, 26], legB: [-26, -4], legF: [24, -8], drop: 8 };
    pose = lerpPose(pose, shove, push);
  } else {
    const walls: Pose = { ...STAND, lean: 2 + strain * 0.6, tilt: 6, drop: 4, legB: [-12, -3], legF: [12, -4] };
    pose = { ...walls, armF: aim({ ...body, pose: walls }, { x: 1098, y: 636 + strain * 4 }), armB: [-aim({ ...body, pose: walls }, { x: 1098, y: 640 })[0], -aim({ ...body, pose: walls }, { x: 1098, y: 640 })[1]] };
  }
  const posed: Body = { ...body, pose };
  const hand = handOf(posed);
  const sealed = frame >= k.amber;
  const face: Face = frame < k.seal + 6
    ? { eyes: 1, mouth: "flat", brows: "flat", lids: 0.2, look: { x: 0.6, y: -0.2 }, blink: blinking(frame, 2) }
    : frame < k.seal + 34
      ? { eyes: 1.2, mouth: "smile", brows: "raised", lids: 0, look: { x: 0.4 + Math.sin((frame - k.seal) / 6) * 0.8, y: 0 }, blink: false }
      : !sealed
        ? { eyes: 1, mouth: "flat", brows: "angry", lids: 0.25, look: { x: 1, y: 0 }, blink: blinking(frame, 2) }
        : { eyes: 1.3, mouth: "wobble", brows: "worry", lids: 0, look: { x: Math.sin((frame - k.amber) / 9) * 0.9, y: -0.2 }, blink: blinking(frame, 5) };
  const pause = shot.pauses.find((p) => p.from === k.seal) ?? { from: k.seal, to: k.resume };
  const s = spring({ frame: frame - k.amber, fps: 30, config: { damping: 13, stiffness: 260 } });
  const top = VOID_HERO.y - 430;
  const actors = (
    <>
      <Figure {...HERO} {...posed} {...face} time={frame} flow={0} />
      <Spark at={hand} frame={frame} cue={k.seal} scale={1.25} />
      {sealed && <Amber cx={960} top={top} bottom={VOID_HERO.y + 16} w={300} s={mix(1.35, 1, s)} opacity={Math.min(1, (frame - k.amber) / 4)} flash={1 - linear(frame, k.amber, k.amber + 8)} fly />}
    </>
  );
  return <Stage cam={cam} radius={waveRadius(frame, pause)} origin={toScreen(cam, hand.x, hand.y)} back={<VoidBack cam={cam} t={t} />} actors={actors} />;
};

/** Stopped light: black, only your two eyes. */
const Blind: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const f = frame - k.blind;
  const shut = (f >= 20 && f < 25) || (f >= 50 && f < 54);
  const lx = f < 10 ? 0 : f < 34 ? -0.8 : f < 58 ? 0.8 : 0.1;
  const ly = f < 34 ? 0 : -0.2;
  const open = ramp(frame, k.blind + 2, k.blind + 8);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={WIDTH} height={HEIGHT}>
        {[905, 1015].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={520} rx={34} ry={shut ? 3 : 44 * open + 3} fill="#ece4d2" opacity={0.92} />
            {!shut && open > 0.5 && <circle cx={x + lx * 14} cy={526 + ly * 14} r={17} fill={INK} />}
            {!shut && open > 0.5 && <circle cx={x + lx * 14 + 5} cy={520 + ly * 14} r={5} fill="#fff" />}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------- shots 8-10: the cheat

const STAND_AT = { x: 700, y: 945, scale: 1.15 };
const LET_GO = { x: 770, y: 600 };

function standCam(frame: number, k: T, head: { x: number; y: number }): Camera {
  if (frame < k.air) return camAt(frame, [[k.line8, { x: 780, y: 650, zoom: 1.5 }], [k.air, { x: 770, y: 645, zoom: 1.58 }]]);
  if (frame < k.see) return drift({ x: 720, y: 640, zoom: 2.0 }, frame, "air");
  if (frame < k.touch) return camAt(frame, [[k.see, closeUp(700, 641, 2.6)], [k.touch, closeUp(700, 641, 2.95)]]);
  if (frame < k.resume + 14) return drift({ x: 760, y: 660, zoom: 1.6 }, frame, "touch");
  if (frame < k.grin) return camAt(frame, [[k.resume + 14, { x: 680, y: 650, zoom: 1.9 }], [k.grin, { x: 668, y: 640, zoom: 2.1 }]]);
  if (frame < k.phone) return drift(closeUp(head.x, head.y, 2.8), frame, "grin", 4);
  return camAt(frame, [[k.phone, { x: PHONE.x - 20, y: PHONE.y - 10, zoom: 3.3 }], [k.phone + 50, { x: PHONE.x - 10, y: PHONE.y - 6, zoom: 3.8 }]]);
}

const Cheat: React.FC<{ shot: Shot; k: T; glows: Glow[] }> = ({ shot, k, glows }) => {
  const { frame, t, wc } = shot;
  const step = ramp(frame, k.release + 10, k.release + 34);
  const stepping = frame >= k.release + 10 && frame < k.release + 34;
  const body: Body = { x: mix(STAND_AT.x, 615, step), y: STAND_AT.y, scale: STAND_AT.scale, facing: 1, pose: STAND };
  let pose: Pose = stepping ? walkPose(-(frame - k.release - 10) * 0.3) : STAND;

  // Inside the block: hands flat on its walls; on "cheat", arms burst out.
  if (frame < k.cheat) {
    const walls: Pose = { ...STAND, lean: 2 + Math.sin(frame * 0.22) * 2, tilt: 5 };
    const right = aim({ ...body, pose: walls }, { x: 832, y: 690 });
    pose = { ...walls, armF: right, armB: [-right[0], -right[1]] };
  } else if (frame < k.cheat + 22) {
    const k2 = ramp(frame, k.cheat, k.cheat + 6) * (1 - ramp(frame, k.cheat + 10, k.cheat + 22));
    pose = lerpPose(STAND, { ...STAND, armF: [125, 15], armB: [-125, -15], tilt: -6, lean: -3 }, k2);
  }
  // Breathe out: the air moves for you.
  if (frame >= k.air - 6 && frame < k.see) pose = { ...pose, tilt: -5 * ramp(frame, k.air - 6, k.air + 4), lean: -2 };
  // Touch: pick up the pillow, carry it, let go.
  const grab = ramp(frame, k.touch + 2, k.touch + 14);
  const carry = ramp(frame, k.touch + 14, k.release - 4);
  const carrying = frame >= k.touch + 14 && frame < k.release;
  const pillowAt = { x: mix(PILLOW.x, LET_GO.x, carry) + Math.sin(carry * Math.PI) * 30, y: mix(PILLOW.y, LET_GO.y, carry) - Math.sin(carry * Math.PI) * 50 };
  const letGo = 1 - ramp(frame, k.release, k.release + 10);
  if (frame >= k.touch && frame < k.release + 10) pose = withArm(pose, aim({ ...body, pose }, frame < k.touch + 14 ? PILLOW : pillowAt), frame < k.release ? grab : letGo);
  // Line 9: one finger up, thinking.
  const finger = ramp(frame, k.resume + 12, k.resume + 22) * (1 - ramp(frame, k.grin + 4, k.grin + 14));
  if (finger > 0) pose = withArm(pose, [120, 50], finger);
  const posed: Body = { ...body, pose };
  const head = headOf(posed);
  const cam = standCam(frame, k, head);

  // The pillow: on the bed, in your hand (in colour), stopped dead where you let go (grey), then dropped at colour.
  const drop = linear(frame, k.resume, k.resume + 10);
  const pillowBack = frame < k.touch + 14 ? null : frame >= k.release ? (
    <Pillow x={LET_GO.x + (PILLOW.x - LET_GO.x) * drop} y={LET_GO.y + (PILLOW.y - LET_GO.y) * drop * drop} tilt={10 - 10 * drop} />
  ) : null;
  const onBed = frame < k.touch + 14 || frame >= k.resume + 10;

  let face: Face = { eyes: 1, mouth: "smile", brows: "none", lids: 0, look: { x: 0.5, y: 0 }, blink: blinking(frame, 3) };
  if (frame < k.cheat) face = { eyes: 1.25, mouth: "wobble", brows: "worry", lids: 0, look: { x: Math.sin(frame / 8) * 0.8, y: -0.2 }, blink: false };
  else if (frame < k.cheat + 22) face = { eyes: 1.3, mouth: "open", brows: "raised", lids: 0, look: { x: 0.3, y: -0.4 }, blink: false };
  else if (frame < k.air - 6) face = { ...face, mouth: "smile", brows: "raised", look: { x: 0.8, y: 0.2 } };
  else if (frame < k.see) face = { ...face, mouth: frame < k.air + 34 ? "o" : "smile", brows: "raised", lids: frame < k.air + 4 ? 0.4 : 0, look: { x: 1, y: -0.1 } };
  else if (frame < k.touch) face = { eyes: 1.35, mouth: "smile", brows: "raised", lids: 0, look: { x: -0.6 + Math.sin((frame - k.see) / 9) * 0.6, y: -0.3 }, blink: blinking(frame, 7) };
  else if (frame < k.release + 34) face = { ...face, eyes: 1.1, mouth: "smirk", brows: "flat", look: { x: 1, y: frame < k.touch + 14 ? 0.5 : -0.3 } };
  else if (frame < k.resume) face = { ...face, eyes: 1.25, mouth: "smile", brows: "raised", look: { x: 1, y: -0.5 } };
  else if (frame < k.resume + 12) face = { ...face, eyes: 1, mouth: "o", brows: "raised", lids: 0.3, look: { x: 1, y: 0.4 } };
  else if (frame < k.grin) face = { eyes: 1, mouth: "flat", brows: "flat", lids: 0.15, look: { x: -0.4, y: -0.8 }, blink: blinking(frame, 3) };
  else face = { eyes: 1, mouth: "smile", brows: "angry", lids: 0.3, look: frame < k.grin + 16 ? { x: 0.3, y: 0 } : { x: 1, y: 0.35 }, blink: false };

  const cat = catAt(t, wc(k.snap1) - 14, wc(k.stops) - 17);
  const stir = { x: head.x + 40, y: head.y, r: 300, push: ramp(frame, k.air, k.air + 30) * 90 };
  const back = (
    <>
      <BedroomBack cam={cam} t={t} hands={{ hour: 212, minute: 22 + t * 0.002, second: Math.floor(t / 15) * 18 }} pillow={onBed} stir={stir}
        phoneLit={ramp(frame, k.phone + 6, k.phone + 10)} phoneRock={frame >= k.phone + 6 && frame < k.phone + 18 ? Math.sin(frame * 2.4) * 3 : 0} />
      {!onBed && pillowBack}
    </>
  );
  const top = STAND_AT.y - 395;
  const mouth = { x: head.x + 22 * STAND_AT.scale, y: head.y + 22 * STAND_AT.scale };
  const beam = ramp(frame, k.see - 2, k.see + 10) * (1 - ramp(frame, k.touch - 10, k.touch));
  const actors = (
    <>
      {beam > 0 && <polygon points={`270,230 640,210 ${head.x + 30},${head.y + 30} ${head.x - 10},${head.y - 40}`} fill="#fff4c6" opacity={0.3 * beam} />}
      <Figure {...HERO} {...posed} {...face} flow={frame >= k.air && frame < k.see ? 0.45 : 0} time={frame} held={finger > 0.5 ? FINGER : undefined} />
      {carrying && <Pillow x={pillowAt.x} y={pillowAt.y} tilt={Math.sin(carry * Math.PI * 2) * 14} />}
      {frame < k.cheat && <Amber cx={STAND_AT.x} top={top} bottom={STAND_AT.y + 14} w={280} />}
      <Flakes cx={STAND_AT.x} top={top} bottom={STAND_AT.y + 14} w={280} k={linear(frame, k.cheat, k.cheat + 32)} />
      {[0, 1, 2].map((i) => {
        const p = linear(frame, k.air + i * 7, k.air + i * 7 + 42);
        if (p <= 0 || p >= 1) return null;
        const x = mouth.x + 20 + p * 230;
        const y = mouth.y - p * 40 + i * 14 - 14;
        return <path key={i} d={`M${x} ${y} q14 -16 28 0 t28 0 t28 0`} fill="none" stroke="#fff6e3" strokeWidth={6} strokeLinecap="round" opacity={Math.sin(p * Math.PI) * 0.9} />;
      })}
      {beam > 0 && [-10, 17].map((ex) => (
        <path key={ex} transform={`translate(${head.x + (ex + 8) * STAND_AT.scale} ${head.y - 22 * STAND_AT.scale}) scale(${spring({ frame: frame - k.see - (ex > 0 ? 3 : 0), fps: 30, config: { damping: 9 } }) * beam})`}
          d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4Z" fill="#fffbe6" />
      ))}
    </>
  );
  const front = (
    <BedroomFront cam={cam}>
      <Cat x={cat.x} y={cat.y} pose={cat.pose} facing={cat.facing} rot={cat.rot} blink={frame >= k.resume && blinking(frame, 6)} look={frame >= k.resume ? -0.8 : 0} />
    </BedroomFront>
  );
  const pause = shot.pauses.find((p) => p.from === k.seal) ?? { from: k.seal, to: k.resume };
  const hand = handOf(posed);
  const faceGlow = toScreen(cam, head.x, head.y);
  const win = toScreen(cam, WINDOW.x, WINDOW.y);
  const light: Glow[] = [{ x: win.x, y: win.y, r: 640 * cam.zoom * 0.6, color: "rgba(255,240,200,0.6)", strength: 0.35 }];
  if (beam > 0) light.push({ x: faceGlow.x, y: faceGlow.y, r: 150 * cam.zoom, color: "rgba(255,236,190,0.7)", strength: 0.6 * beam });
  if (frame >= k.phone) {
    const p = toScreen(cam, PHONE.x, PHONE.y);
    light.push({ x: p.x, y: p.y, r: 120 * cam.zoom, color: "rgba(200,240,255,0.7)", strength: 0.6 * ramp(frame, k.phone + 6, k.phone + 12) });
  }
  return (
    <LookContext.Provider value={{ ...useLook(), glows: [...glows, ...light] }}>
      <Stage cam={cam} radius={waveRadius(frame, pause)} origin={toScreen(cam, hand.x, hand.y)} back={back} actors={actors} front={front} />
    </LookContext.Provider>
  );
};

// ---------------------------------------------------------------------------------------------------- the beat

const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 0.4 }) => (
  <Sequence from={Math.max(0, at)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
);

const Sound: React.FC<{ k: T }> = ({ k }) => (
  <>
    <Sfx at={2} name="sting" volume={0.35} />
    <Sfx at={k.snap1 - 3} name="timestop" volume={0.45} />
    <Sfx at={k.colour1 - 13} name="resume" volume={0.3} />
    <Sfx at={k.counter} name="flip" volume={0.6} />
    <Sfx at={k.stops - 3} name="timestop" volume={0.4} />
    {evenTicks(k.stops, k.restart).slice(1).map((tk) => <Sfx key={tk.at} at={tk.at} name="flip" volume={0.35} />)}
    <Sfx at={k.restart - 13} name="resume" volume={0.3} />
    <Sfx at={k.midnight} name="flip" volume={0.5} />
    <Sfx at={k.midnight + 14} name="flip" volume={0.5} />
    <Sfx at={k.seal - 3} name="timestop" volume={0.4} />
    <Sfx at={k.amber} name="clink" volume={0.55} />
    <Sfx at={k.cheat} name="whoosh" volume={0.35} />
    <Sfx at={k.resume - 13} name="resume" volume={0.3} />
    <Sfx at={k.resume + 10} name="pop" volume={0.4} />
    <Sfx at={k.phone + 6} name="pop" volume={0.3} />
  </>
);

const Opening: React.FC<{ shot: Shot }> = ({ shot }) => {
  const look = useLook();
  const k = times(shot.cues, shot.clips);
  const { frame } = shot;
  const glows = look.glows ?? [];
  let scene: React.ReactNode;
  if (frame < k.flash) scene = <StreetFlash shot={shot} k={k} glows={glows} />;
  else if (frame < k.bedIn) scene = <AbsoluteFill style={{ background: "#000" }} />;
  else if (frame < k.voidIn) scene = <BedroomDay shot={shot} k={k} glows={glows} />;
  else if (frame < k.blind) scene = <VoidShot shot={shot} k={k} />;
  else if (frame < k.line8) scene = <Blind frame={frame} k={k} />;
  else scene = <Cheat shot={shot} k={k} glows={glows} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene}
      <Sound k={k} />
    </AbsoluteFill>
  );
};

export const opening: Beat = { id: "opening", firstLine: 0, Component: Opening, pauses: pausesOf };
