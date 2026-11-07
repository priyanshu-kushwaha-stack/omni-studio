import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, lerpPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook } from "@whatif/kit/stage/Look";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, Counter, evenTicks } from "../parts";
import { Pigeon, SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, noise, ramp, STRANGER, type Beat, type Shot } from "../shared";
import { EndCard } from "./Ending.EndCard";

/** Beat 6, "Back to you" (script v7, lines 60-64): the snap on the evening street, the frozen crowd and the stranger
 *  walking through it (60 + 3 s hold); the stare and your face (61-63); a 2 s hold on the stare with the bubble, black,
 *  the end card. */

/** The one pause: from the snap, a few frames into line 60, until the end card. Colour comes back under the black. */
const pauses = (cues: Record<string, number>, clips: Clip[]) => [{ from: clips[60].from + 6, to: cues.endcard }];

/** Size of a figure standing at depth y: 0.68 on the far pavement (712), 1.3 on the near one (1010). */
const depthScale = (y: number) => 0.68 + ((y - 712) / (1010 - 712)) * 0.62;

/** Where a figure's hand is, in world units. */
function handAt(x: number, y: number, scale: number, facing: 1 | -1, pose: Pose, arm: "armF" | "armB") {
  const j = joints(pose);
  const [u, f] = pose[arm];
  const a = dir(u);
  const b = dir(u + f);
  return { x: x + (j.shoulder.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (j.shoulder.y + (a.y + b.y) * LIMB) * scale };
}
const headAt = (x: number, y: number, scale: number, facing: 1 | -1, pose: Pose) => {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale };
};

/** A path of [worldTime, x, y] keys: standing still where two keys share a place. */
interface Walker { keys: [number, number, number][]; head: string; coat?: string; cap?: string; seed: number }
function walkerAt(w: Walker, t: number) {
  const k = w.keys;
  let i = 0;
  while (i < k.length - 2 && t >= k[i + 1][0]) i++;
  const [t0, x0, y0] = k[i];
  const [t1, x1, y1] = k[i + 1];
  const p = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  const moving = t > t0 && t < t1 && (x0 !== x1 || y0 !== y1);
  let dx = x1 - x0;
  for (let s = i; dx === 0 && s < k.length - 1; s++) dx = k[s + 1][1] - k[s][1];
  return { x: mix(x0, x1, p), y: mix(y0, y1, p), moving, facing: (dx < 0 ? -1 : 1) as 1 | -1 };
}

/** The evening crowd, keyed from b (333 frames before the snap) so it freezes mid-step on the crossing. */
const crowd = (b: number): Walker[] => [
  { keys: [[b - 120, -200, 716], [b + 480, 1100, 716]], head: "#9cc5a1", coat: "#6a5d8f", seed: 1 },
  { keys: [[b - 60, 2400, 721], [b + 540, 1200, 721]], head: "#e6a0a0", seed: 2 },
  { keys: [[b - 60, 1110, 1000], [b + 120, 1170, 712], [b + 400, 1800, 712]], head: "#d9c26a", coat: "#4a6a8a", seed: 3 },
  { keys: [[b, 1370, 1004], [b + 170, 1370, 1004], [b + 470, 1330, 705]], head: "#c96f2d", seed: 4 },
  { keys: [[b, 1040, 714], [b + 215, 1040, 714], [b + 515, 1100, 1000]], head: "#7fa0c4", cap: "#2c6fbb", seed: 5 },
  { keys: [[b, 900, 716], [b + 200, 1150, 712], [b + 257, 1150, 712], [b + 557, 1210, 1000]], head: "#b58fc7", coat: "#5d7a6a", seed: 6 },
  { keys: [[b - 200, 2900, 714], [b + 500, 1500, 714]], head: "#e0a070", coat: "#8a5a44", seed: 7 },
  { keys: [[b - 100, 300, 721], [b + 600, 1700, 721]], head: "#86b8d8", seed: 8 },
  { keys: [[b - 160, 1360, 712], [b - 60, 1340, 712], [b + 180, 1290, 1004], [b + 480, 2200, 1004]], head: "#f0a25a", coat: "#3f6f6a", seed: 9 },
];

type ShotName = "snap" | "home" | "turn" | "walks" | "stare" | "knows" | "hold" | "black" | "card";

const Ending: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, wc, cues, clips } = shot;
  const from = clips[60].from;
  // World time shifted to read as film frames in this beat: equal to `frame` until the snap, then frozen at it.
  // (Earlier beats' pauses put Film's `t` behind `frame`; this keeps the keys below in cue frames.)
  const t = shot.t + (from - wc(from));
  const look = useLook();
  const pause = pauses(cues, clips)[0];
  const n = pause.from;
  // The crowd's paths are keyed so they are mid-step on the crossing when the snap lands.
  const b = n - 333;
  const blackAt = cues.endcard - 30;
  const stareHold = blackAt - 60;

  const name = current<ShotName>(frame, [
    [from, "snap"],
    [n + 34, "home"],
    [n + 102, "turn"],
    [n + 135, "walks"],
    [clips[62].from - 6, "stare"],
    [Math.min(clips[63].from - 10, stareHold - 20), "knows"],
    [stareHold, "hold"],
    [blackAt, "black"],
    [cues.endcard, "card"],
  ]);

  const sfx = (
    <>
      <Sequence from={n - 2} durationInFrames={50}><Audio src={staticFile("sfx/timestop.wav")} volume={0.45} /></Sequence>
      <Sequence from={cues.looking} durationInFrames={86}><Audio src={staticFile("sfx/sting.wav")} volume={0.3} /></Sequence>
      <Sequence from={lineEnd(clips, 63)} durationInFrames={10}><Audio src={staticFile("sfx/pop.wav")} volume={0.3} /></Sequence>
    </>
  );

  if (name === "black") return <AbsoluteFill style={{ background: "#000" }}>{sfx}</AbsoluteFill>;
  if (name === "card") return <AbsoluteFill>{sfx}<EndCard frame={frame} from={cues.endcard} to={shot.to} /></AbsoluteFill>;

  // You: mid-stride as the beat opens, snap, lower the hand, turn for home, walk, stop, look back.
  const turnHome = n + 20;
  const walkFrom = n + 24;
  const walkTo = n + 88;
  const lookBack = n + 98;
  let heroX = 820;
  if (frame >= walkFrom) heroX = 820 - 2.6 * (Math.min(frame, walkTo) - walkFrom);
  const heroY = 1010;
  const heroS = 1.3;
  const heroFacing: 1 | -1 = frame >= turnHome && frame < lookBack ? -1 : 1;
  const walking = frame >= walkFrom && frame < walkTo;
  let heroPose: Pose = walking ? walkPose(frame * 0.32) : STAND;
  if (frame < walkFrom) {
    const up = ramp(frame, from, n);
    const down = ramp(frame, n + 10, n + 20);
    heroPose = lerpPose(lerpPose(walkPose(from * 0.3), SNAP, up), STAND, down);
  }
  if (frame >= lookBack) heroPose = { ...STAND, tilt: -4 * ramp(frame, lookBack, lookBack + 8) };
  const heroHead = headAt(heroX, heroY, heroS, 1, STAND);
  // Shock lands as "Somebody knows" begins and holds through "knows": eyes wide, lids up, mouth "o", brows raised.
  const knows = frame >= clips[63].from;
  const shocked = frame >= lookBack;
  const hero = (
    <Figure
      {...HERO} x={heroX} y={heroY} scale={heroS} facing={heroFacing} pose={heroPose} time={frame} flow={walking ? 0.25 : 0}
      eyes={knows ? mix(1.2, 1.45, ramp(frame, clips[63].from, clips[63].from + 5)) : shocked ? mix(1, 1.2, ramp(frame, lookBack + 4, lookBack + 12)) : 1}
      lids={knows ? 0 : frame >= turnHome && frame < lookBack ? 0.3 : 0}
      brows={knows ? "raised" : frame >= clips[62].from ? "worry" : shocked ? "raised" : "none"}
      mouth={shocked ? "o" : frame >= n - 4 && frame < turnHome ? "smirk" : "flat"}
      look={shocked ? { x: 1, y: frame < cues.moving ? -0.25 : 0.05 } : { x: 0.8, y: 0 }}
      blink={!shocked && blinking(frame, 3)}
    />
  );

  // The stranger: planted on the far pavement facing the wrong way, then walks slowly across to you, in colour.
  const goFrom = n + 36;
  const goTo = cues.moving + 14;
  const route: [number, number, number][] = [[goFrom, 1270, 716], [mix(goFrom, goTo, 0.38), 1245, 790], [goTo, 1150, 985]];
  const s = walkerAt({ keys: route, head: STRANGER.head, seed: 0 }, frame);
  const sScale = depthScale(s.y);
  const sFacing: 1 | -1 = frame >= goFrom ? -1 : 1;
  const stare = ramp(frame, cues.looking, cues.looking + 12);
  const sPose: Pose = s.moving ? walkPose((frame - goFrom) * 0.2) : { ...STAND, tilt: 5 * stare };
  const sHead = headAt(s.x, s.y, sScale, sFacing, STAND);
  const bubbleOn = frame >= lineEnd(clips, 63);
  const stranger = (
    <Figure
      x={s.x} y={s.y} scale={sScale} facing={sFacing} pose={sPose} head={STRANGER.head} coat={STRANGER.coat}
      look={frame >= goTo ? { x: mix(0.7, -0.28, stare), y: mix(0, 0.12, stare) } : { x: 0.8, y: 0 }}
      eyes={frame >= cues.looking ? 1.12 : 1}
      lids={frame >= cues.looking ? 0.22 : 0}
      brows={frame >= cues.looking ? "flat" : "none"}
      mouth={bubbleOn ? "smirk" : "none"}
      blink={frame < goFrom && blinking(frame, 5)}
    />
  );

  // The crowd and pigeons run on world time and freeze with it; whoever is nearer than the stranger goes in front.
  const people = crowd(b).map((w) => ({ w, at: walkerAt(w, t) }));
  function camFor(): Camera {
    switch (name) {
      case "snap":
        return camAt(frame, [[from, { x: 925, y: 765, zoom: 1.5 }], [n + 34, { x: 935, y: 752, zoom: 1.6 }]]);
      case "home":
        return drift(camAt(frame, [[n + 34, { x: 1000, y: 735, zoom: 1.12 }], [n + 102, { x: 980, y: 730, zoom: 1.18 }]]), frame, "end-e", 4);
      case "turn":
        return camAt(frame, [[n + 102, { x: heroHead.x + 150, y: heroHead.y + 30, zoom: 2.3 }], [n + 135, { x: heroHead.x + 140, y: heroHead.y + 25, zoom: 2.45 }]]);
      case "walks": {
        const z = mix(1.45, 1.6, linear(frame, n + 135, clips[62].from - 6));
        return { x: s.x - 110, y: s.y - 150 * sScale, zoom: z };
      }
      case "stare":
        return camAt(frame, [
          [clips[62].from - 6, { x: 900, y: 790, zoom: 1.25 }],
          [cues.looking, { x: 915, y: 782, zoom: 1.3 }],
          [clips[63].from - 10, { x: 1110, y: 690, zoom: 1.9 }],
        ]);
      case "knows":
        return camAt(frame, [
          [clips[63].from - 10, { x: heroHead.x + 60, y: heroHead.y + 22, zoom: 2.5 }],
          [clips[63].from, { x: heroHead.x + 52, y: heroHead.y + 20, zoom: 2.62 }],
          [clips[63].from + 8, { x: heroHead.x + 28, y: heroHead.y + 12, zoom: 3.2 }],
          [stareHold, { x: heroHead.x + 24, y: heroHead.y + 10, zoom: 3.35 }],
        ]);
      default: {
        // The 2 s hold on the stranger's stare, with a slow push, before the cut to black.
        const z = mix(2.05, 2.35, linear(frame, stareHold, blackAt));
        return drift({ x: sHead.x + 230, y: sHead.y + 70, zoom: z }, frame, "end-j", 3);
      }
    }
  }
  const cam = camFor();
  const drawn = (near: boolean) => (
    <Layer cam={cam} depth={1}>
      {people.filter(({ at }) => (at.y > s.y + 2) === near).sort((p, q) => p.at.y - q.at.y).map(({ w, at }) => (
        <Figure key={w.seed} x={at.x} y={at.y} scale={depthScale(at.y)} facing={at.facing}
          pose={at.moving ? walkPose(t * 0.21 + w.seed * 1.3) : STAND} head={w.head} coat={w.coat} cap={w.cap}
          look={{ x: 0.7, y: 0 }} mouth={w.seed % 3 === 0 ? "smile" : "flat"} blink={frame < n && blinking(frame, w.seed)} />
      ))}
    </Layer>
  );

  const pigeons = Array.from({ length: 5 }, (_, i) => {
    const x = 520 + i * 260 + (t - b) * (1.6 + noise(i + 3) * 1.2);
    const y = 400 + noise(i + 11) * 140 - (t - b) * 0.18;
    return <Pigeon key={i} x={x} y={y} flap={Math.sin(t * 0.8 + i * 1.7)} />;
  });

  const back = (
    <>
      <StreetBack cam={cam} frame={frame} t={t} crowd paused={frame >= n} />
      {pigeons}
      {drawn(false)}
    </>
  );
  const actors = (
    <>
      {stranger}
      {hero}
    </>
  );

  const snapHand = handAt(820, heroY, heroS, 1, SNAP, "armF");
  const origin = toScreen(cam, snapHand.x, snapHand.y);
  const radius = frame >= pause.from ? waveRadius(frame, pause) : 0;
  const bubbleX = toScreen(cam, sHead.x, sHead.y);

  return (
    <AbsoluteFill>
      {sfx}
      <LookContext.Provider value={look}>
        <Stage cam={cam} radius={radius} origin={origin} sky={SKY} back={back} actors={actors} front={drawn(true)} />
      </LookContext.Provider>
      <Counter ticks={evenTicks(n, lineEnd(clips, 63))} until={blackAt} />
      <Bubble at={lineEnd(clips, 63)} until={blackAt} text="Nice catch. Day twelve." x={bubbleX.x + 90} y={Math.max(80, bubbleX.y - 300)} tail="left" />
    </AbsoluteFill>
  );
};

export const ending: Beat = { id: "ending", firstLine: 60, Component: Ending, pauses };
