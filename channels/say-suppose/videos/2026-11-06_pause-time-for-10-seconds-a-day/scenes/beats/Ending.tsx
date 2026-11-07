import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, lerpPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook, type Glow } from "@whatif/kit/stage/Look";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, Counter, evenTicks } from "../parts";
import { Pigeon, SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, noise, ramp, STRANGER, type Beat, type Shot } from "../shared";
import { EndCard } from "./Ending.EndCard";

/** Beat 6, "Back to you" (scene_plan.md): the ordinary crossing and the 1.5 s tag (65); the snap, the frozen crowd
 *  and the stranger walking through it (66 + hold); the stare and your face (67-69); the bubble, black, the end card. */

/** The one pause: from the snap on "notice" until the end card. Colour comes back under the black. */
const pauses = (cues: Record<string, number>, _clips: Clip[]) => [{ from: cues.notice, to: cues.endcard }];

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

/** The evening crowd, in world time from the start of line 65 (b) so it freezes mid-step with the snap. */
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

const CAR = "#6c8fd1";
const STOP_X = 1405;
const CAR_SPEED = 12;

/** A small paper car driving left; its nose is at x. The driver sits behind the front window. */
const Car: React.FC<{ x: number; pitch: number; eyes: number; blink: boolean }> = ({ x, pitch, eyes, blink }) => {
  const spin = x * 2.05;
  return (
    <g transform={`translate(${x} 0) rotate(${pitch} 85 906)`}>
      <ellipse cx={215} cy={906} rx={235} ry={12} fill="#000" opacity={0.25} />
      <path d="M95 794 L138 740 H205 V794Z M215 794 V740 H282 L318 794Z" fill="#bfe6ee" />
      <g transform="translate(165 776)">
        <circle r={23} fill="#d9a77a" />
        <path d="M-23 -4 Q-20 -26 2 -27 Q22 -26 23 -6 Q10 -14 -6 -14 Z" fill="#3b2a22" />
        <ellipse cx={-12} cy={-2} rx={4.5} ry={blink ? 1 : 6 * eyes} fill={INK} />
        <ellipse cx={1} cy={-2} rx={4.5} ry={blink ? 1 : 6 * eyes} fill={INK} />
        <rect x={-30} y={18} width={44} height={20} rx={8} fill="#4f5560" />
      </g>
      <path d="M10 800 Q0 800 0 822 V872 H430 V812 Q430 794 410 794 H330 L296 736 Q291 728 281 728 H150 Q139 728 132 736 L88 794 H20 Q10 794 10 800 Z
        M95 794 L138 740 H205 V794Z M215 794 V740 H282 L318 794Z"
        fill={CAR} fillRule="evenodd" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M95 794 L138 740 H205 V794Z M215 794 V740 H282 L318 794Z" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M210 800 V860 M120 820 H160 M250 820 H290" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      <rect x={0} y={838} width={430} height={14} fill="#f3e9d7" opacity={0.85} />
      <ellipse cx={8} cy={815} rx={9} ry={12} fill="#fff1b8" stroke={INK} strokeWidth={4} />
      <rect x={420} y={806} width={12} height={20} rx={3} fill="#d8344f" stroke={INK} strokeWidth={3} />
      {[85, 345].map((w) => (
        <g key={w} transform={`rotate(${spin} ${w} 878)`}>
          <circle cx={w} cy={878} r={28} fill={INK} />
          <circle cx={w} cy={878} r={11} fill="#f3e9d7" />
          <rect x={w - 2.5} y={856} width={5} height={13} fill="#f3e9d7" />
        </g>
      ))}
    </g>
  );
};

type ShotName = "crossing" | "car" | "stops" | "snap" | "home" | "turn" | "walks" | "stare" | "knows" | "bubble" | "black" | "card";

const Ending: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, wc, cues, clips } = shot;
  // World time shifted to read as film frames in this beat: equal to `frame` until the snap, then frozen at it.
  // (Earlier beats' pauses put Film's `t` behind `frame`; this keeps the keys below in cue frames.)
  const t = shot.t + (clips[65].from - wc(clips[65].from));
  const look = useLook();
  const b = clips[65].from;
  const n = cues.notice;
  const pause = { from: n, to: cues.endcard };
  const blackAt = cues.endcard - 30;

  const name = current<ShotName>(frame, [
    [b, "crossing"],
    [cues.designers - 45, "car"],
    [lineEnd(clips, 65) - 60, "stops"],
    [clips[66].from, "snap"],
    [lineEnd(clips, 66) + 4, "home"],
    [n + 143, "turn"],
    [n + 189, "walks"],
    [clips[68].from - 6, "stare"],
    [clips[69].from, "knows"],
    [lineEnd(clips, 69), "bubble"],
    [blackAt, "black"],
    [cues.endcard, "card"],
  ]);

  const sfx = (
    <>
      <Sequence from={b} durationInFrames={n - b}><Audio src={staticFile("sfx/street.wav")} volume={0.14} /></Sequence>
      <Sequence from={n - 2} durationInFrames={50}><Audio src={staticFile("sfx/timestop.wav")} volume={0.45} /></Sequence>
      <Sequence from={cues.looking} durationInFrames={86}><Audio src={staticFile("sfx/sting.wav")} volume={0.3} /></Sequence>
      <Sequence from={lineEnd(clips, 69)} durationInFrames={10}><Audio src={staticFile("sfx/pop.wav")} volume={0.3} /></Sequence>
    </>
  );

  if (name === "black") return <AbsoluteFill style={{ background: "#000" }}>{sfx}</AbsoluteFill>;
  if (name === "card") return <AbsoluteFill>{sfx}<EndCard frame={frame} from={cues.endcard} /></AbsoluteFill>;

  // The car: steady until the driver notices (a second and a half after the tag), then brakes to the crossing.
  const seen = cues.designers + 45;
  const stopAt = seen + 75;
  const brakeRun = (CAR_SPEED * (stopAt - seen)) / 2;
  const carX = t >= stopAt ? STOP_X
    : t >= seen ? STOP_X + (CAR_SPEED * (stopAt - t) ** 2) / (2 * (stopAt - seen))
    : STOP_X + brakeRun + CAR_SPEED * (seen - t);
  const pitch = -1.6 * ramp(t, seen, seen + 8) * (1 - ramp(t, stopAt, stopAt + 14)) + 0.6 * Math.sin(linear(t, stopAt, stopAt + 14) * Math.PI);
  const driverEyes = mix(1, 1.35, ramp(t, seen - 3, seen + 3));

  // You: stroll in, snap on "notice", lower the hand, turn for home, walk, stop, look back.
  const turnHome = n + 26;
  const walkFrom = n + 30;
  const walkTo = n + 120;
  const lookBack = n + 132;
  let heroX = 820;
  if (frame < n - 10) heroX = 820 - (n - 10 - frame) * 1.4;
  else if (frame >= walkFrom) heroX = 820 - 2 * (Math.min(frame, walkTo) - walkFrom);
  const heroY = 1010;
  const heroS = 1.3;
  const heroFacing: 1 | -1 = frame >= turnHome && frame < lookBack ? -1 : 1;
  const walking = frame < n - 10 || (frame >= walkFrom && frame < walkTo);
  let heroPose: Pose = walking ? walkPose(frame * 0.3) : STAND;
  if (frame >= n - 12 && frame < walkFrom) {
    const up = ramp(frame, n - 8, n);
    const down = ramp(frame, n + 12, n + 24);
    heroPose = lerpPose(lerpPose(walkPose((n - 10) * 0.3), SNAP, up), STAND, down);
  }
  if (frame >= lookBack) heroPose = { ...STAND, tilt: -4 * ramp(frame, lookBack, lookBack + 8) };
  const heroHead = headAt(heroX, heroY, heroS, 1, STAND);
  const knows = frame >= cues.knows;
  const shocked = frame >= lookBack;
  const hero = (
    <Figure
      {...HERO} x={heroX} y={heroY} scale={heroS} facing={heroFacing} pose={heroPose} time={frame} flow={walking ? 0.25 : 0}
      eyes={knows ? 1.42 : shocked ? mix(1, 1.22, ramp(frame, lookBack + 6, lookBack + 14)) : 1}
      lids={knows ? 0 : frame >= turnHome && frame < lookBack ? 0.3 : 0}
      brows={knows ? "raised" : frame >= clips[68].from ? "worry" : shocked ? "raised" : "none"}
      mouth={knows ? "open" : shocked ? "o" : frame >= n - 8 && frame < turnHome ? "smirk" : "flat"}
      look={shocked ? { x: 1, y: frame < n + 230 ? -0.25 : 0.05 } : { x: 0.8, y: 0 }}
      blink={!shocked && blinking(frame, 3)}
    />
  );

  // The stranger: planted on the far pavement facing the wrong way, then walks slowly across to you, in colour.
  const goFrom = n + 74;
  const goTo = cues.moving + 20;
  const route: [number, number, number][] = [[goFrom, 1270, 716], [mix(goFrom, goTo, 0.38), 1245, 790], [goTo, 1150, 985]];
  const s = walkerAt({ keys: route, head: STRANGER.head, seed: 0 }, frame);
  const sScale = depthScale(s.y);
  const sFacing: 1 | -1 = frame >= goFrom ? -1 : 1;
  const stare = ramp(frame, cues.looking, cues.looking + 12);
  const sPose: Pose = s.moving ? walkPose((frame - goFrom) * 0.18) : { ...STAND, tilt: 5 * stare };
  const sHead = headAt(s.x, s.y, sScale, sFacing, STAND);
  const bubbleOn = frame >= lineEnd(clips, 69);
  const stranger = (
    <Figure
      x={s.x} y={s.y} scale={sScale} facing={sFacing} pose={sPose} head={STRANGER.head} coat={STRANGER.coat}
      look={bubbleOn ? { x: 0.7, y: 0.05 } : frame >= goTo ? { x: mix(0.7, -0.28, stare), y: mix(0, 0.12, stare) } : { x: 0.8, y: 0 }}
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
      case "crossing":
        return drift(camAt(frame, [[b, { x: 1250, y: 650, zoom: 1.04 }], [cues.designers - 45, { x: 1275, y: 640, zoom: 1.13 }]]), frame, "end-a");
      case "car":
        return { x: carX + 215, y: 770, zoom: 1.7 };
      case "stops":
        return camAt(frame, [[lineEnd(clips, 65) - 60, { x: 1330, y: 700, zoom: 1.18 }], [clips[66].from, { x: 1318, y: 700, zoom: 1.25 }]]);
      case "snap":
        return camAt(frame, [[clips[66].from, { x: 925, y: 765, zoom: 1.5 }], [lineEnd(clips, 66) + 4, { x: 935, y: 752, zoom: 1.6 }]]);
      case "home":
        return drift(camAt(frame, [[lineEnd(clips, 66) + 4, { x: 1000, y: 735, zoom: 1.12 }], [n + 143, { x: 975, y: 730, zoom: 1.2 }]]), frame, "end-e", 4);
      case "turn":
        return camAt(frame, [[n + 143, { x: heroHead.x + 150, y: heroHead.y + 30, zoom: 2.3 }], [n + 189, { x: heroHead.x + 140, y: heroHead.y + 25, zoom: 2.5 }]]);
      case "walks": {
        const z = mix(1.45, 1.6, linear(frame, n + 189, clips[68].from - 6));
        return { x: s.x - 110, y: s.y - 150 * sScale, zoom: z };
      }
      case "stare":
        return camAt(frame, [
          [clips[68].from - 6, { x: 900, y: 790, zoom: 1.25 }],
          [cues.looking, { x: 915, y: 782, zoom: 1.3 }],
          [clips[69].from, { x: 1110, y: 690, zoom: 2.0 }],
        ]);
      case "knows":
        return camAt(frame, [
          [clips[69].from, { x: heroHead.x + 60, y: heroHead.y + 22, zoom: 2.5 }],
          [cues.knows - 2, { x: heroHead.x + 52, y: heroHead.y + 20, zoom: 2.62 }],
          [cues.knows + 8, { x: heroHead.x + 28, y: heroHead.y + 12, zoom: 3.3 }],
          [lineEnd(clips, 69), { x: heroHead.x + 24, y: heroHead.y + 10, zoom: 3.45 }],
        ]);
      default:
        return drift({ x: sHead.x + 250, y: sHead.y + 60, zoom: 2.2 }, frame, "end-j", 4);
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
      <StreetBack cam={cam} frame={frame} t={t} crowd={frame >= clips[66].from} paused={frame >= n} />
      {pigeons}
      <Layer cam={cam} depth={1}>
        <Car x={carX} pitch={pitch} eyes={driverEyes} blink={t < seen - 3 && blinking(t, 8)} />
      </Layer>
      {drawn(false)}
    </>
  );
  const actors = (
    <>
      {stranger}
      {frame >= clips[66].from && hero}
    </>
  );

  const snapHand = handAt(820, heroY, heroS, 1, SNAP, "armF");
  const origin = toScreen(cam, snapHand.x, snapHand.y);
  const radius = frame >= pause.from ? waveRadius(frame, pause) : 0;

  // Scene light: the car's headlamp at dusk, before the freeze.
  const lamp = toScreen(cam, carX + 6, 815);
  const glows: Glow[] = frame < n && (name === "car" || name === "stops")
    ? [{ x: lamp.x, y: lamp.y, r: 150 * cam.zoom, color: "rgba(255,226,160,0.55)" }] : [];

  const driver = toScreen(cam, carX + 165, 776);
  const bubbleX = toScreen(cam, sHead.x, sHead.y);

  return (
    <AbsoluteFill>
      {sfx}
      <LookContext.Provider value={{ ...look, glows: [...(look.glows ?? []), ...glows] }}>
        <Stage cam={cam} radius={radius} origin={origin} sky={SKY} back={back} actors={actors} front={drawn(true)} />
      </LookContext.Provider>
      {name === "car" && <Tag at={cues.designers} text="1.5 S" x={driver.x + 40} y={driver.y - 230} size={80} />}
      <Counter ticks={evenTicks(n, lineEnd(clips, 69))} until={blackAt} />
      <Bubble at={lineEnd(clips, 69)} until={blackAt} text="Nice catch. Day twelve." x={bubbleX.x + 90} y={Math.max(80, bubbleX.y - 300)} tail="left" />
    </AbsoluteFill>
  );
};

export const ending: Beat = { id: "ending", firstLine: 65, Component: Ending, pauses };
