import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import type { Pause } from "@whatif/kit/world/clock";
import { Counter, evenTicks } from "../parts";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { BusStop } from "./Catch.Bus";
import { Montage } from "./Catch.Montage";
import {
  BED, camOnCity, cityToScreen, CW, N_FLOOR, NIGHT_SKY, NightBack, NightBedFront, OPP, WIN, type Weather,
} from "./Catch.NightRoom";
import { Fingers, handWorld, headWorld, LYING, Lit, SEAT } from "./Catch.rig";
import { Stairs } from "./Catch.Stairs";

const FPS = 30;

/** Beat 4's time-stops: the bus ("once" to 0.8 s after line 43) and midnight ("midnight" through line 50's curtain,
 *  colour back 0.6 s after line 50). */
const pauses = (cues: Record<string, number>, clips: Clip[]): Pause[] => [
  { from: cues.once, to: lineEnd(clips, 43) + Math.round(0.8 * FPS) },
  { from: cues.midnight2, to: lineEnd(clips, 50) + Math.round(0.6 * FPS) },
];

const AT_WINDOW = 1262;
const SEATED = { x: BED.edgeX, y: N_FLOOR + 8 };
const moonGlow = (cam: Camera, strength = 1) => {
  const c = toScreen(cam, (WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2);
  return { x: c.x, y: c.y, r: 620 * cam.zoom, color: `rgba(150,180,255,${0.34 * strength})` };
};

/** Line 38: close on your hands in your lap, trembling, closing into fists on "free". */
const Hands: React.FC<{ frame: number; from: number; fist: number }> = ({ frame, from, fist }) => {
  const k = frame - from;
  const shake = (1 - fist * 0.7) * 1.4;
  const hand = (side: 1 | -1, seed: number) => {
    const r = Math.sin(k * 0.52 + seed) * shake + Math.sin(k * 0.21 + seed * 2) * shake * 0.6;
    return (
      <g transform={`translate(${960 + side * 190} ${700}) rotate(${side * -14 + r}) scale(${side} 1)`}>
        <ellipse cx={0} cy={0} rx={80} ry={66} fill={MUSTARD} />
        {[-48, -16, 16, 48].map((fx, i) => (
          <rect key={i} x={fx - 15} y={-66 - (80 - (i === 0 || i === 3 ? 14 : 0)) * (1 - fist * 0.78)} width={30}
            height={(80 - (i === 0 || i === 3 ? 14 : 0)) * (1 - fist * 0.78) + 30} rx={15} fill={MUSTARD} />
        ))}
        <rect x={-110 + fist * 40} y={-10 - fist * 30} width={66} height={28} rx={14} fill={MUSTARD} transform={`rotate(${-30 + fist * 40} -80 0)`} />
        {fist > 0.3 && [-48, -16, 16, 48].map((fx, i) => <line key={i} x1={fx} y1={-50} x2={fx} y2={-24} stroke="#c48a14" strokeWidth={5} strokeLinecap="round" opacity={fist} />)}
        <path d="M-60 20 Q0 48 60 20" stroke="#c48a14" strokeWidth={5} fill="none" opacity={0.6} />
      </g>
    );
  };
  return (
    <>
      <path d="M0 1080 Q140 520 700 560 Q900 580 960 760 Q1020 580 1220 560 Q1780 520 1920 1080 Z" fill="#3b3e47" />
      <path d="M700 560 Q900 580 960 760 M1220 560 Q1020 580 960 760" stroke="#2b2d35" strokeWidth={8} fill="none" />
      <rect x={1180} y={-40} width={70} height={420} rx={30} fill={TEAL} transform={`rotate(${4 + Math.sin(k / 40) * 1.5} 1215 -40)`} />
      {hand(-1, 0)}
      {hand(1, 2.1)}
    </>
  );
};

/** Line 51: night after night at the window; the nights differ by weather, moon and what you hold. */
const NIGHTS: { weather: Weather; moon: number; held: "none" | "mug" | "blanket" }[] = [
  { weather: "clear", moon: 1, held: "none" },
  { weather: "rain", moon: 0.25, held: "mug" },
  { weather: "snow", moon: 0.6, held: "blanket" },
];

const Mug = () => (
  <g>
    <rect x={-12} y={-14} width={24} height={28} rx={5} fill="#f3e9d7" stroke={INK} strokeWidth={3} />
    <path d="M12 -6 q10 0 10 8 q0 8 -10 8" stroke={INK} strokeWidth={3} fill="none" />
    <path d="M-4 -20 q4 -8 0 -14 M5 -20 q4 -8 0 -14" stroke="#e9e2f2" strokeWidth={3} fill="none" opacity={0.7} />
  </g>
);

/** Lines 38-41 and 46, 48-51 in your room at night. */
const NightRoom: React.FC<{ shot: Shot; mid: Pause }> = ({ shot, mid }) => {
  const { frame, t, cues, clips } = shot;
  const paused = frame >= mid.from && frame < mid.to;
  const shut = ramp(frame, cues.curtain, cues.curtain + 16);
  const c = (i: number) => clips[i].from;

  const name = current(frame, [
    [shot.from, "hands"], [c(39), "face"], [lineEnd(clips, 39) + 6, "room"], [cues.window - 247, "window"], [c(41), "street"],
    [c(41) + 106, "eyes"],
    [c(46), "awake"], [cues.awake + 50, "awakeClose"],
    [cues.midnight2 - 29, "bed"], [cues.midnight2 + 31, "rise"], [lineEnd(clips, 48), "city"], [c(49), "pan"],
    [c(49) + 78, "peace"], [c(50), "curtain"], [cues.curtain + 19, "react"], [cues.curtain + 55, "both"],
    [c(51), "night0"], [c(51) + 51, "night1"], [c(51) + 102, "night2"],
  ] as [number, string][]);

  // Where you are and what you do.
  let x = AT_WINDOW;
  let y = N_FLOOR;
  let pose: Pose = { ...STAND, armF: [18, 30] };
  let rotate = 0;
  let face: { mouth: "flat" | "smile" | "smirk" | "o" | "open" | "frown" | "wobble"; brows: "none" | "raised" | "worry" | "sad" | "angry" | "flat"; lids: number; eyes: number; look: { x: number; y: number } } =
    { mouth: "flat", brows: "flat", lids: 0.3, eyes: 1, look: { x: 0.9, y: 0.1 } };
  let held: React.ReactNode;
  let inBed = false;
  let night = 0;

  if (name === "face") {
    x = SEATED.x; y = SEATED.y; pose = SEAT;
    face = { mouth: "flat", brows: "worry", lids: frame >= cues.free - 6 ? 0.55 : 0.3, eyes: 1, look: frame >= cues.free - 6 ? { x: 0.3, y: 0.7 } : { x: 0.7, y: 0.2 } };
  } else if (name === "room") {
    const stand = ramp(frame, c(40) + 36, c(40) + 50);
    const walk = linear(frame, c(40) + 52, cues.window - 250);
    x = mix(SEATED.x, AT_WINDOW, walk); y = mix(SEATED.y, N_FLOOR, stand);
    pose = walk > 0 && walk < 1 ? walkPose((frame - c(40)) * 0.26) : lerpPose(SEAT, STAND, stand);
    face = { mouth: "flat", brows: "worry", lids: 0.35, eyes: 1, look: { x: 0.8, y: 0.15 } };
  } else if (name === "window" || name === "eyes") {
    const k = frame - c(40);
    face = { mouth: "flat", brows: name === "eyes" ? "flat" : "worry", lids: name === "eyes" ? 0.2 : 0.3, eyes: name === "eyes" ? 1.1 : 1,
      look: name === "eyes" ? { x: mix(-0.3, 0.95, ramp(frame, c(41) + 106, c(41) + 150)), y: 0.45 } : { x: 0.6 + Math.sin(k / 30) * 0.35, y: 0.35 } };
  } else if (name === "awake" || name === "awakeClose") {
    inBed = true;
    const step = Math.floor((frame - cues.awake) / 11);
    face = { mouth: "flat", brows: "flat", lids: 0.15, eyes: 1.1, look: frame < cues.awake ? { x: 0.9, y: 0 } : { x: 0.9, y: [0, 0.5, -0.4, 0.3, -0.6, 0.1][((step % 6) + 6) % 6] } };
  } else if (name === "bed") {
    inBed = true;
    const raise = ramp(frame, cues.midnight2 - 14, cues.midnight2);
    pose = { ...LYING, armF: [mix(8, 96, raise), mix(6, 40, raise)] };
    held = raise > 0.3 ? <Fingers angle={pose.armF[0] + pose.armF[1]} snap={ramp(frame, cues.midnight2 - 4, cues.midnight2)} /> : undefined;
    face = { mouth: frame >= cues.midnight2 ? "smile" : "flat", brows: "flat", lids: frame >= cues.midnight2 ? 0.3 : 0.15, eyes: 1, look: { x: 0.9, y: -0.3 } };
  } else if (name === "rise") {
    const stand = ramp(frame, cues.midnight2 + 33, cues.midnight2 + 46);
    const walk = linear(frame, cues.midnight2 + 46, lineEnd(clips, 48));
    x = mix(SEATED.x, 1120, walk); y = mix(SEATED.y, N_FLOOR, stand);
    pose = walk > 0 && walk < 1 ? walkPose((frame - cues.midnight2) * 0.3) : lerpPose(SEAT, STAND, stand);
    face = { mouth: "smile", brows: "none", lids: 0.3, eyes: 1, look: { x: 0.9, y: 0 } };
  } else if (name === "city" || name === "peace") {
    const k = frame - lineEnd(clips, 48);
    face = { mouth: "smile", brows: "none", lids: name === "peace" ? 0.5 : 0.3, eyes: 1, look: { x: mix(0.2, 0.95, ramp(k, 0, 110)), y: mix(0.1, -0.25, ramp(k, 30, 110)) } };
  } else if (name === "react" || name === "both") {
    face = { mouth: frame >= mid.to ? "flat" : "o", brows: "raised", lids: 0, eyes: frame >= mid.to ? 1.15 : 1.35, look: { x: 0.95, y: -0.1 } };
    pose = { ...STAND, lean: 5, armF: [20, 30] };
  } else if (name.startsWith("night")) {
    night = Number(name.slice(5));
    const n = NIGHTS[night];
    const lean = night === 2 ? ramp(frame, cues.check - 14, cues.check) : 0;
    pose = n.held === "mug" ? { ...STAND, armF: [48, 82] } : n.held === "blanket" ? { ...STAND, lean: 6 * lean + 2, armF: [60, 100], armB: [50, 100] } : { ...STAND, armF: [40, 100], armB: [30, 100] };
    held = n.held === "mug" ? <g transform="translate(0 -6)"><Mug /></g> : undefined;
    face = { mouth: "flat", brows: lean > 0.5 ? "flat" : "none", lids: lean > 0.5 ? 0.45 : 0.25, eyes: 1, look: { x: 0.95, y: -0.1 } };
  }

  if (inBed) { x = BED.hipX; y = BED.feetY; rotate = -86; if (name !== "bed") pose = LYING; }
  const hand = handWorld(x, y, pose, 1, 1, rotate);
  const head = headWorld(x, y, pose, 1, 1, rotate);

  // Cameras.
  const cw = (zoom: number) => camOnCity(OPP, CW.x, CW.y, zoom);
  let cam: Camera;
  let room = true;
  let focus: number | undefined;
  switch (name) {
    case "hands": cam = drift({ x: 960, y: 560, zoom: mix(1, 1.08, ramp(frame, shot.from, c(39))) }, frame, "hands", 4); break;
    case "face": cam = drift(closeUp(head.x, head.y, 2.8), frame, "face"); break;
    case "room": cam = camAt(frame, [[lineEnd(clips, 39) + 6, { x: 900, y: 560, zoom: 1.0 }], [cues.window - 247, { x: 1130, y: 550, zoom: 1.1 }]]); break;
    case "window": cam = camAt(frame, [[cues.window - 247, { x: 1420, y: 520, zoom: 1.45 }], [c(41), { x: 1440, y: 540, zoom: 1.62 }]]); focus = 0.8; break;
    case "street": cam = camAt(frame, [[c(41), camOnCity(0.78, 1250, 700, 2.0)], [c(41) + 106, camOnCity(0.78, 1560, 690, 2.25)]]); room = false; focus = 0.78; break;
    case "eyes": cam = drift(closeUp(head.x, head.y, 3.4), frame, "eyes"); break;
    case "awake": cam = camAt(frame, [[c(46), { x: 520, y: 620, zoom: 1.5 }], [cues.awake + 50, { x: 470, y: 630, zoom: 1.75 }]]); break;
    case "awakeClose": cam = camAt(frame, [[cues.awake + 50, { x: head.x + 40, y: head.y + 10, zoom: 2.7 }], [cues.month6, { x: head.x + 30, y: head.y + 10, zoom: 3.0 }]]); break;
    case "bed": cam = drift({ x: 430, y: 640, zoom: 1.6 }, frame, "bed"); break;
    case "rise": cam = camAt(frame, [[cues.midnight2 + 31, { x: 920, y: 560, zoom: 1.02 }], [lineEnd(clips, 48), { x: 1000, y: 540, zoom: 1.08 }]]); break;
    case "city": cam = camAt(frame, [[lineEnd(clips, 48), { x: 1390, y: 480, zoom: 1.32 }], [c(49), { x: 1430, y: 470, zoom: 1.6 }]]); focus = 0.6; break;
    case "pan": cam = camAt(frame, [[c(49), camOnCity(OPP, 880, 540, 2.5)], [c(49) + 78, camOnCity(OPP, 1300, 520, 2.5)]]); room = false; focus = OPP; break;
    case "peace": cam = drift(closeUp(head.x, head.y, 2.9), frame, "peace"); break;
    case "curtain": cam = camAt(frame, [[c(50), cw(2.1)], [cues.curtain + 19, cw(3.6)]]); room = false; focus = OPP; break;
    case "react": cam = drift(closeUp(head.x, head.y, 3.1), frame, "react"); break;
    case "both": cam = camAt(frame, [[cues.curtain + 55, { x: 1400, y: 500, zoom: 1.5 }], [c(51), { x: 1410, y: 495, zoom: 1.62 }]]); focus = 0.6; break;
    default:
      cam = night === 0 ? drift({ x: 1395, y: 505, zoom: 1.55 }, frame, "n0")
        : night === 1 ? drift({ x: 1335, y: 560, zoom: 2.1 }, frame, "n1")
        : camAt(frame, [[c(51) + 102, { x: 1120, y: 540, zoom: 1.12 }], [cues.check, { x: 1300, y: 560, zoom: 1.7 }]]);
      focus = 0.6;
  }

  const clock = name === "bed" ? (frame >= cues.midnight2 ? "00:00" : "23:59") : name.startsWith("awake") ? "02:4" + Math.min(9, Math.max(0, Math.floor((frame - c(46)) / 40))) : "23:58";
  const weather = name.startsWith("night") ? NIGHTS[night].weather : "clear";
  const moon = name.startsWith("night") ? NIGHTS[night].moon : 1;
  const radius = paused ? waveRadius(frame, mid) : 0;
  const origin = toScreen(cam, hand.x, hand.y);
  const cwScreen = cityToScreen(cam, OPP, CW.x, CW.y);
  const showHero = !["hands", "street", "pan", "curtain"].includes(name);

  const back = name === "hands"
    ? <Layer cam={cam} depth={1}><g transform="translate(960 760) scale(1.5) translate(-960 -700)"><Hands frame={frame} from={shot.from} fist={ramp(frame, c(38) + 87, c(38) + 105)} /></g></Layer>
    : <NightBack cam={cam} t={t} frame={frame} shut={shut} clock={clock} counter={name.startsWith("awake") ? "10" : undefined} weather={weather} moon={moon} room={room} />;
  const front = room && name !== "hands" ? <NightBedFront cam={cam} off={inBed ? 0 : 1} /> : undefined;
  const actors = showHero ? (
    <Figure {...HERO} x={x} y={y} rotate={rotate} pose={pose} {...face} held={held} time={frame}
      blink={!(paused && name === "curtain") && blinking(frame, 6) && name !== "react"} />
  ) : null;

  const glows = [
    moonGlow(cam, room ? 1.4 : 0.5),
    { x: 960, y: 520, r: 1500, color: "rgba(120,140,230,0.22)" },
    { x: 960, y: 980, r: 900, color: "rgba(110,120,210,0.2)" },
    ...(name === "curtain" || name === "pan" || name === "both" || name.startsWith("night")
      ? [{ x: cwScreen.x, y: cwScreen.y, r: 70 * cam.zoom, color: `rgba(255,196,120,${name === "curtain" ? 0.45 : 0.25})` }] : []),
    ...(name.startsWith("awake") || name === "bed" ? [{ ...toScreen(cam, 140, 700), r: 160 * cam.zoom, color: "rgba(255,90,110,0.25)" }] : []),
    ...(showHero && !inBed ? [{ ...toScreen(cam, head.x + 30, head.y), r: 150 * cam.zoom, color: "rgba(170,190,255,0.28)" }] : []),
    ...(name === "hands" ? [{ x: 1500, y: 300, r: 900, color: "rgba(150,180,255,0.4)" }] : []),
  ];

  return (
    <AbsoluteFill>
      <Lit extra={{ glows, ...(focus !== undefined ? { focus } : {}) }}>
        <Stage cam={cam} radius={radius} origin={origin} sky={NIGHT_SKY} back={back} actors={actors} front={front} />
      </Lit>
      <Counter ticks={evenTicks(mid.from, mid.to - 15)} until={mid.to + 10} />
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; name: string; volume: number; frames?: number }> = ({ at, name, volume, frames }) => (
  <Sequence from={at} durationInFrames={frames}><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
);

const Catch: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues, clips } = shot;
  const [bus, mid] = pauses(cues, clips);
  const scene = current(frame, [
    [shot.from, "night"], [clips[42].from, "bus"], [clips[44].from, "stairs"], [clips[46].from, "night"],
    [cues.month6, "montage"], [cues.midnight2 - 29, "night"],
  ] as [number, string][]);
  return (
    <AbsoluteFill>
      {scene === "night" && <NightRoom shot={shot} mid={mid} />}
      {scene === "bus" && <BusStop shot={shot} pause={bus} />}
      {scene === "stairs" && <Stairs shot={shot} />}
      {scene === "montage" && <Montage shot={shot} end={cues.midnight2 - 29} />}
      <Sfx at={clips[42].from} name="street" volume={0.16} frames={bus.from - clips[42].from} />
      <Sfx at={clips[42].from + 20} name="bus" volume={0.22} frames={bus.from - clips[42].from - 20} />
      <Sfx at={bus.from} name="timestop" volume={0.45} />
      <Sfx at={bus.to - 12} name="resume" volume={0.35} />
      <Sfx at={cues.nothing - 30} name="pop" volume={0.25} />
      <Sfx at={mid.from} name="timestop" volume={0.4} />
      <Sfx at={cues.curtain} name="whoosh" volume={0.14} />
      <Sfx at={mid.to - 12} name="resume" volume={0.32} />
    </AbsoluteFill>
  );
};

export const theCatch: Beat = { id: "catch", firstLine: 38, Component: Catch, pauses };

