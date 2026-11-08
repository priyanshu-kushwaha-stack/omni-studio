import { AbsoluteFill, Audio, Sequence, spring, staticFile } from "remotion";
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, joints, lerpPose, LIMB, reach, SIT, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook, type Glow } from "@whatif/kit/stage/Look";
import { Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { MUSTARD } from "@whatif/kit/theme";
import { Flip } from "@whatif/kit/ui/Flip";
import type { Clip } from "@whatif/kit/timeline";
import type { Pause } from "@whatif/kit/world/clock";
import { Counter, evenTicks, type Tick } from "../parts";
import { Ball, Bus, BUS_STOP_X, KID_FEET, Pigeon, SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, HERO, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { BedroomBack, BedroomFront, Cat, CLOCK, FEET_Y, HIP_X, PHONE, Pillow, PILLOW, WINDOW, type CatPose, type ClockHands } from "./Opening.Bedroom";

/* Beat 1, "The change and the rule" (scene_plan.md; script v7 lines 0 to 9).
 *  0      flash-forward: the frozen crossing on day twelve, counter at 7; cut to black on "seconds".
 *  1-5    the bedroom, morning: alarm, first snap, the cat mid-leap, the counter and the rule.
 *  6      the bedroom at night: the clock turns to midnight, the counter resets to 10.
 *  7      the bedroom at midnight, stopped: you snap the fresh ten seconds; air, sight, touch (the pillow hangs).
 *  8-9    colour back, the pillow drops; one finger up, a grin, a glance at the phone. */

// ---------------------------------------------------------------------------------------------------- timing

type T = ReturnType<typeof times>;

/** Every beat frame comes from cues and clips. */
function times(cues: Record<string, number>, clips: Clip[]) {
  return {
    /** The flash-forward plays live for a moment, then you snap and it freezes. */
    freeze: Math.round(clips[0].from / 4),
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
    standIn: clips[7].from - 6,
    seal: clips[7].from,
    cheat: cues.cheat,
    air: cues.air,
    see: cues.see,
    touch: cues.touch,
    release: cues.touch + 62,
    resume: clips[8].from,
    grin: cues.grin,
    phone: cues.grin + 34,
  };
}

/** The flash-forward freeze (to just past the cut to black), the first snap (colour back a beat after line 3), the
 *  rule's demonstration ("stops" to "starts"), and the midnight test of line 7, held until line 8. */
function pausesOf(cues: Record<string, number>, clips: Clip[]): Pause[] {
  const k = times(cues, clips);
  return [
    { from: k.freeze, to: k.flash + 12 },
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

// ---------------------------------------------------------------------------------------------------- shot 0: the flash-forward

const StreetFlash: React.FC<{ shot: Shot; k: T; glows: Glow[] }> = ({ shot, k, glows }) => {
  const { frame, t, pauses } = shot;
  const pause = pauses.find((p) => p.from === k.freeze) ?? { from: k.freeze, to: k.flash + 12 };
  // A moment of the live street (bus rolling, kid running, ball bouncing, pigeons flapping), then the freeze.
  const ago = k.freeze - t;
  const cutB = Math.round(mix(k.freeze, k.flash, 0.45));
  const cutC = Math.round(mix(k.freeze, k.flash, 0.72));
  const raise = ramp(frame, 0, k.freeze - 2);
  let pose = lerpPose({ ...STAND, armF: [40, 30] }, SNAP, raise);
  if (frame >= k.freeze && frame < k.freeze + 4) pose = { ...pose, armF: [pose.armF[0], pose.armF[1] - 18] };
  const hero: Body = { x: 700, y: 1010, scale: 1.3, facing: 1, pose };
  const hand = handOf(hero);
  const head = headOf(hero);
  const cam = frame < cutB
    ? drift(camAt(frame, [[0, { x: 960, y: 700, zoom: 1.05 }], [cutB, { x: 1010, y: 716, zoom: 1.17 }]]), frame, "flash", 5)
    : frame < cutC
      ? camAt(frame, [[cutB, { x: 1300, y: 760, zoom: 2.0 }], [cutC, { x: 1312, y: 764, zoom: 2.18 }]])
      : camAt(frame, [[cutC, closeUp(head.x + 40, head.y, 2.3)], [k.flash, closeUp(head.x + 30, head.y, 2.7)]]);
  const live = frame < k.freeze;
  const back = (
    <>
      <StreetBack cam={cam} frame={frame} t={t} red crowd paused={!live} />
      {[[880, 330], [1150, 410], [1290, 350], [1520, 440], [640, 380]].map(([x, y], i) => (
        <Pigeon key={i} x={x - ago * (3 + i)} y={y + ago * (i % 2 ? 1.5 : -1)} flap={Math.sin(t * 0.8 + i * 1.7)} />
      ))}
      <Bus x={BUS_STOP_X + ago * 11} t={t} moving={live} />
      <Ball x={1360 - ago * 3} y={KID_FEET - 26 - Math.abs(Math.sin((t - k.freeze) * 0.22 + 0.7)) * 42} spin={t * 9} />
      <Figure x={1225 - ago * 2.4} y={KID_FEET} scale={0.72} pose={walkPose(1.2 + (t - k.freeze) * 0.4)} head="#e0a070" cap="#2c6fbb"
        look={{ x: 0.8, y: 0 }} mouth="smile" time={t} />
    </>
  );
  // Inside the freeze only you move: your eyes go from the kid to the bus and back; you set your jaw.
  const f = frame - k.freeze;
  const look = f < 40 ? { x: 0.9, y: -0.1 } : f < 75 ? { x: 1, y: -0.25 } : { x: 0.85, y: 0 };
  const actors = (
    <>
      <Figure {...HERO} {...hero} eyes={live ? 1.3 : 1.15} mouth={frame < cutC ? "o" : "flat"} brows={frame < cutC ? "raised" : "angry"}
        lids={frame < cutC ? 0 : 0.2} look={look} blink={f > 92 && f < 96} time={frame} />
      <Spark at={hand} frame={frame} cue={k.freeze} scale={1.3} />
    </>
  );
  const bus = toScreen(cam, BUS_STOP_X + ago * 11 + 12, 806);
  const light = { glows: [...glows, { x: bus.x, y: bus.y, r: 120 * cam.zoom * 1.8, color: "rgba(255,226,150,0.55)", strength: 0.8 }] };
  return (
    <LookContext.Provider value={{ ...useLook(), ...light }}>
      <Stage cam={cam} radius={waveRadius(frame, pause)} origin={toScreen(cam, hand.x, hand.y)} sky={SKY} back={back} actors={actors} />
      <Counter ticks={[{ at: k.freeze + 6, n: 7 }]} until={k.flash} />
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
  else if (frame < k.wide2) face = { ...face, brows: "raised", mouth: "smile", look: { x: 0.9, y: -0.4 } };
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
    <Figure {...HERO} x={HIP_X} y={FEET_Y} rotate={-86} pose={LYING} blink={frame < k.midnight + 16} eyes={1.25} brows="raised"
      mouth={frame < k.midnight + 16 ? "flat" : "smirk"} look={{ x: 0.9, y: -0.6 }} time={frame} />
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

  // The counter shows only while time is stopped: it drops in at 10 with the snap on "stops", lands on 0 just before
  // colour comes back, and goes with the bars. At midnight it reappears to blank and reset to 10 for line 7's pause.
  const ticks: Tick[] = evenTicks(k.stops, k.restart - 8);
  const fadeIn = 1 - linear(frame, k.bedIn, k.bedIn + 14);
  return (
    <>
      <LookContext.Provider value={{ ...useLook(), glows: [...glows, ...light] }}>
        <Stage cam={cam} radius={radius} origin={origin} back={back} actors={actors} front={front} />
      </LookContext.Provider>
      <Counter ticks={ticks} until={k.restart + 4} />
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

// ---------------------------------------------------------------------------------------------------- shots 7-9: the cheat

const STAND_AT = { x: 700, y: 945, scale: 1.15 };
const LET_GO = { x: 770, y: 600 };

function standCam(frame: number, k: T, head: { x: number; y: number }): Camera {
  if (frame < k.air) return camAt(frame, [[k.standIn, { x: 790, y: 650, zoom: 1.45 }], [k.air, { x: 770, y: 645, zoom: 1.6 }]]);
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

  // Snap the fresh ten seconds on the line's first word; on "cheat", a sly shrug to us.
  const up = ramp(frame, k.standIn - 4, k.seal - 2) * (1 - ramp(frame, k.seal + 12, k.seal + 24));
  pose = lerpPose(pose, SNAP, up);
  if (frame >= k.seal && frame < k.seal + 4) pose = { ...pose, armF: [pose.armF[0], pose.armF[1] - 18] };
  const shrug = ramp(frame, k.cheat - 2, k.cheat + 6) * (1 - ramp(frame, k.cheat + 18, k.cheat + 28));
  if (shrug > 0) pose = lerpPose(pose, { ...STAND, armF: [60, 70], armB: [-60, -70], tilt: 8, drop: -4 }, shrug);
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
  if (frame < k.cheat - 2) face = { eyes: 1.1, mouth: "smirk", brows: "flat", lids: 0.2, look: { x: 0.9, y: -0.2 }, blink: false };
  else if (frame < k.cheat + 26) face = { eyes: 1, mouth: "smirk", brows: "angry", lids: 0.35, look: { x: -0.2, y: 0 }, blink: false };
  else if (frame < k.air - 6) face = { ...face, mouth: "smile", brows: "raised", look: { x: 0.8, y: 0.2 } };
  else if (frame < k.see) face = { ...face, mouth: frame < k.air + 34 ? "o" : "smile", brows: "raised", lids: frame < k.air + 4 ? 0.4 : 0, look: { x: 1, y: -0.1 } };
  else if (frame < k.touch) face = { eyes: 1.35, mouth: "smile", brows: "raised", lids: 0, look: { x: -0.6 + Math.sin((frame - k.see) / 9) * 0.6, y: -0.3 }, blink: blinking(frame, 7) };
  else if (frame < k.release + 34) face = { ...face, eyes: 1.1, mouth: "smirk", brows: "flat", look: { x: 1, y: frame < k.touch + 14 ? 0.5 : -0.3 } };
  else if (frame < k.resume) face = { ...face, eyes: 1.25, mouth: "smile", brows: "raised", look: { x: 1, y: -0.5 } };
  else if (frame < k.resume + 12) face = { ...face, eyes: 1, mouth: "o", brows: "raised", lids: 0.3, look: { x: 1, y: 0.4 } };
  else if (frame < k.grin) face = { eyes: 1, mouth: "flat", brows: "flat", lids: 0.15, look: { x: -0.4, y: -0.8 }, blink: blinking(frame, 3) };
  else face = { eyes: 1, mouth: "smile", brows: "angry", lids: 0.3, look: frame < k.grin + 16 ? { x: 0.3, y: 0 } : { x: 1, y: 0.35 }, blink: false };

  const stir = { x: head.x + 40, y: head.y, r: 300, push: ramp(frame, k.air, k.air + 30) * 90 };
  const back = (
    <>
      <BedroomBack cam={cam} t={t} night hands={{ hour: 0, minute: (t - wc(k.midnight)) * 0.1, second: (t - wc(k.midnight)) * 6 }} pillow={onBed} stir={stir}
        phoneLit={ramp(frame, k.phone + 6, k.phone + 10)} phoneRock={frame >= k.phone + 6 && frame < k.phone + 18 ? Math.sin(frame * 2.4) * 3 : 0} />
      {!onBed && pillowBack}
    </>
  );
  const mouth = { x: head.x + 22 * STAND_AT.scale, y: head.y + 22 * STAND_AT.scale };
  const beam = ramp(frame, k.see - 2, k.see + 10) * (1 - ramp(frame, k.touch - 10, k.touch));
  const actors = (
    <>
      {beam > 0 && <polygon points={`270,230 640,210 ${head.x + 30},${head.y + 30} ${head.x - 10},${head.y - 40}`} fill="#dfe8ff" opacity={0.3 * beam} />}
      <Figure {...HERO} {...posed} {...face} flow={frame >= k.air && frame < k.see ? 0.45 : 0} time={frame} held={finger > 0.5 ? FINGER : undefined} />
      {carrying && <Pillow x={pillowAt.x} y={pillowAt.y} tilt={Math.sin(carry * Math.PI * 2) * 14} />}
      <Spark at={handOf(posed)} frame={frame} cue={k.seal} scale={1.15} />
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
      <Cat x={1230} y={704} pose="curl" facing={-1} />
    </BedroomFront>
  );
  const pause = shot.pauses.find((p) => p.from === k.seal) ?? { from: k.seal, to: k.resume };
  const hand = handOf(posed);
  const faceGlow = toScreen(cam, head.x, head.y);
  const win = toScreen(cam, WINDOW.x, WINDOW.y);
  const light: Glow[] = [{ x: win.x, y: win.y, r: 520 * cam.zoom * 0.6, color: "rgba(140,165,255,0.55)", strength: 0.5 }];
  if (beam > 0) light.push({ x: faceGlow.x, y: faceGlow.y, r: 150 * cam.zoom, color: "rgba(255,236,190,0.7)", strength: 0.6 * beam });
  if (frame >= k.phone) {
    const p = toScreen(cam, PHONE.x, PHONE.y);
    light.push({ x: p.x, y: p.y, r: 120 * cam.zoom, color: "rgba(200,240,255,0.7)", strength: 0.6 * ramp(frame, k.phone + 6, k.phone + 12) });
  }
  return (
    <>
      <LookContext.Provider value={{ ...useLook(), glows: [...glows, ...light] }}>
        <Stage cam={cam} radius={waveRadius(frame, pause)} origin={toScreen(cam, hand.x, hand.y)} back={back} actors={actors} front={front} />
      </LookContext.Provider>
      {frame < k.seal + 10 && (
        <div style={{ position: "absolute", left: 1670, top: 50, transform: "scale(0.85)", transformOrigin: "top left" }}>
          <Flip value="10" previous="" changedAt={k.midnight + 14} />
        </div>
      )}
      {frame >= k.seal + 10 && <Counter ticks={evenTicks(k.seal, k.resume - 8).map((tk, n) => (n === 0 ? { ...tk, at: k.seal - 40 } : tk))} until={k.resume + 4} />}
    </>
  );
};

// ---------------------------------------------------------------------------------------------------- the beat

const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 0.4 }) => (
  <Sequence from={Math.max(0, at)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
);

const Sound: React.FC<{ k: T }> = ({ k }) => (
  <>
    <Sequence from={0} durationInFrames={k.freeze + 4}><Audio src={staticFile("sfx/bus.wav")} volume={0.45} /></Sequence>
    <Sfx at={k.freeze - 3} name="timestop" volume={0.5} />
    <Sfx at={k.freeze + 8} name="sting" volume={0.3} />
    <Sfx at={k.snap1 - 3} name="timestop" volume={0.45} />
    <Sfx at={k.colour1 - 13} name="resume" volume={0.3} />
    <Sfx at={k.stops} name="flip" volume={0.6} />
    <Sfx at={k.stops - 3} name="timestop" volume={0.4} />
    {evenTicks(k.stops, k.restart - 8).slice(1).map((tk) => <Sfx key={tk.at} at={tk.at} name="flip" volume={0.15} />)}
    <Sfx at={k.restart - 13} name="resume" volume={0.3} />
    <Sfx at={k.midnight} name="flip" volume={0.25} />
    <Sfx at={k.midnight + 14} name="flip" volume={0.25} />
    <Sfx at={k.seal - 3} name="timestop" volume={0.4} />
    {evenTicks(k.seal, k.resume - 8).slice(1).map((tk) => <Sfx key={tk.at} at={tk.at} name="flip" volume={0.15} />)}
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
  else if (frame < k.standIn) scene = <BedroomDay shot={shot} k={k} glows={glows} />;
  else scene = <Cheat shot={shot} k={k} glows={glows} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene}
      <Sound k={k} />
    </AbsoluteFill>
  );
};

export const opening: Beat = { id: "opening", firstLine: 0, Component: Opening, pauses: pausesOf };
