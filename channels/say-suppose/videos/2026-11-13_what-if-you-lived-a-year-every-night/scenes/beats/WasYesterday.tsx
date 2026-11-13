// Beat "It Was Yesterday" (script.md, ## [06:38]; story lines 65-69).
//   65   you in pod one, the cable in, the calendar page folded in your fist; eyes shut. The inside year in four cuts on
//        the words: Spring (blossom), the bakery, a friend's wedding (you raise a glass), a hard winter (snow to the knee).
//   66   "The alarm.": the hatch opens, you sit up.
//   hold (4 s, performed) the kitchen by lamp, the fridge hum: a small cake, one candle burnt down to the plate, the wax
//        pooled; your flatmate in her coat, bag on her shoulder, keys in her hand. You stop in the doorway. You look at
//        the cake. She looks at your empty hands. Neither moves.
//   67   close on her: "It was yesterday."
//   gap  your bubble "Tell you tomo..." breaks off half drawn; your mouth shuts.
//   68   you step aside; she goes out past you and closes the door quietly; you and the cake.
//   69   night, the hall: your hand on the cable; you go back in; the counter flutters.
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, CounterSound } from "../parts";
import { camAt, current, FLATMATE, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { aim, clock, head, Person, type Body } from "./CityPlugsIn.Kit";
import { Cake, FLAT, Flat } from "./ColdApology.Flat";
import { BackIn, Bakery, Blossom, PodShot, Wedding, Winter } from "./WasYesterday.Inside";

const S = 1.12;
const DOOR_X = FLAT.door.x + FLAT.door.w / 2;
const HER_X = 1420;
const CAKE = { x: FLAT.table.x + 110, y: FLAT.table.top };
const COAT = "#4a5878";

function times(clips: Clip[], start: number, endOfBeat: number) {
  const { from, end, at } = clock(clips);
  const hold = end(66) + 6;
  const g = from(67) - hold;
  return {
    start, endOfBeat,
    shut: at(65, 0.25), spring: at(65, 0.46), bakery: at(65, 0.56), wedding: at(65, 0.67), winter: at(65, 0.83),
    alarm: from(66) - 6, open: from(66) + 2,
    hold, cake: hold + Math.round(g * 0.32), hands: hold + Math.round(g * 0.58), neither: hold + Math.round(g * 0.8),
    her: from(67) - 2, say: [from(67), end(67)] as const,
    bubble: end(67) + 3, breaks: Math.max(end(67) + 24, at(68, 0.16)),
    aside: [at(68, 0.16), at(68, 0.34)] as const, out: [at(68, 0.22), at(68, 0.5)] as const, shut2: [at(68, 0.5), at(68, 0.62)] as const,
    alone: at(68, 0.64),
    night: from(69), climb: at(69, 0.55),
  };
}
type T = ReturnType<typeof times>;

/** Her: in her coat by the table; she goes out of the doorway after your bubble breaks. */
function herBody(frame: number, k: T): { body: Body; opacity: number } {
  const w = linear(frame, k.out[0], k.out[1]);
  const x = mix(HER_X, DOOR_X + 40, w);
  const pose: Pose = w > 0 && w < 1 ? walkPose(frame * 0.3) : STAND;
  const body: Body = { x, y: FLAT.floor, scale: S, facing: 1, pose };
  if (w === 0) body.pose = { ...STAND, armF: [30, 50], armB: [-4, 20] };
  return { body, opacity: 1 - ramp(frame, k.out[1] - 8, k.out[1]) };
}

/** You: stopped in the doorway, empty hands a little out; you step aside to the table, then sit by the cake. */
function yourBody(frame: number, k: T): Body {
  const a = ramp(frame, k.aside[0], k.aside[1]);
  const x = mix(DOOR_X, FLAT.yourChair.x + 60, a);
  if (frame >= k.alone) {
    const body: Body = { x: FLAT.yourChair.x, y: seatedY(FLAT.yourChair.top, S), scale: S, facing: -1, pose: { ...SEATED, lean: 14 } };
    body.pose = { ...body.pose, armF: aim(body, { x: CAKE.x + 70, y: CAKE.y - 4 }) };
    return body;
  }
  const body: Body = { x, y: FLAT.floor, scale: S, facing: -1, pose: a > 0 && a < 1 ? walkPose(frame * 0.3) : STAND };
  if (a === 0) body.pose = { ...STAND, armF: [26, 28], armB: [16, 30] };
  return body;
}

/** The bag on her shoulder and the keys, drawn over her. */
const Bag: React.FC<{ body: Body }> = ({ body }) => {
  const h = head(body);
  return (
    <g>
      <line x1={h.x - 6} y1={h.y + 50} x2={h.x - 40} y2={h.y + 170} stroke="#5b3e30" strokeWidth={7} />
      <rect x={h.x - 78} y={h.y + 150} width={70} height={64} rx={12} fill="#a8774e" stroke="#23252b" strokeWidth={4} />
    </g>
  );
};

const Keys = (
  <g>
    <circle cx={0} cy={6} r={9} fill="none" stroke="#c9a33a" strokeWidth={4} />
    <rect x={-3} y={14} width={6} height={22} fill="#c9a33a" /><rect x={6} y={12} width={5} height={18} fill="#9aa1ab" />
  </g>
);

const Kitchen: React.FC<{ frame: number; k: T; view: string }> = ({ frame, k, view }) => {
  const her = herBody(frame, k);
  const you = yourBody(frame, k);
  const hh = head(her.body);
  const yh = head(you);
  const cams: Record<string, Camera> = {
    hold: camAt(frame, [[k.hold, { x: 1450, y: 600, zoom: 1.2 }], [k.cake, { x: 1420, y: 610, zoom: 1.3 }]]),
    cake: camAt(frame, [[k.cake, { x: CAKE.x, y: CAKE.y - 40, zoom: 4.0 }], [k.hands, { x: CAKE.x, y: CAKE.y - 50, zoom: 4.4 }]]),
    hands: camAt(frame, [[k.hands, closeUp(hh.x + 20, hh.y, 2.6)], [k.neither, closeUp(hh.x + 20, hh.y, 2.8)]]),
    neither: camAt(frame, [[k.neither, { x: yh.x - 40, y: yh.y + 130, zoom: 2.4 }], [k.her, { x: yh.x - 40, y: yh.y + 120, zoom: 2.6 }]]),
    her: camAt(frame, [[k.her, closeUp(hh.x + 30, hh.y, 2.8)], [k.bubble, closeUp(hh.x + 30, hh.y, 3.0)]]),
    bubble: camAt(frame, [[k.bubble, closeUp(yh.x + 230, yh.y - 60, 1.9)], [k.aside[0], closeUp(yh.x + 230, yh.y - 60, 2.0)]]),
    out: camAt(frame, [[k.aside[0], { x: 1450, y: 600, zoom: 1.15 }], [k.alone, { x: 1550, y: 610, zoom: 1.25 }]]),
    alone: camAt(frame, [[k.alone, { x: 1150, y: 650, zoom: 1.6 }], [k.night, { x: 1150, y: 680, zoom: 2.0 }]]),
  };
  const cam = drift(cams[view], frame, "wy-k", 3);
  // the bubble, revealed from its tail to most of its width and then broken off
  const reveal = interpolate(frame, [k.bubble, k.bubble + 12], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bx = yh.x + 10;
  const bubble = frame >= k.bubble && frame < k.breaks ? (
    <g>
      <clipPath id="wy-break"><rect x={bx - 20} y={yh.y - 260} width={20 + 480 * reveal} height={260} /></clipPath>
      <g clipPath="url(#wy-break)">
        <Bubble frame={frame} at={k.bubble - 8} x={bx} y={yh.y - 60} text="Tell you tomo..." size={40} side="right" />
      </g>
    </g>
  ) : null;
  const herFace = frame < k.hands
    ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, look: { x: 1, y: 0 } }
    : frame < k.her
      ? { brows: "sad" as const, lids: 0.35, mouth: "flat" as const, look: { x: 1, y: 0.75 } }
      : frame < k.bubble
        ? { brows: "sad" as const, lids: 0.3, mouth: frame < k.say[1] ? ("open" as const) : ("flat" as const), look: { x: 1, y: 0 } }
        : { brows: "sad" as const, lids: 0.5, mouth: "flat" as const, look: { x: 1, y: 0.4 } };
  const yourFace = frame < k.cake
    ? { brows: "raised" as const, lids: 0, mouth: "o" as const, look: { x: 1, y: 0 } }
    : frame < k.her
      ? { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, look: { x: 0.9, y: 0.6 } }
      : frame < k.breaks
        ? { brows: "worry" as const, lids: 0, mouth: frame >= k.bubble ? ("open" as const) : ("flat" as const), look: { x: 1, y: 0 } }
        : { brows: "sad" as const, lids: 0.5, mouth: "flat" as const, look: frame >= k.alone ? { x: 1, y: 0.7 } : { x: -0.8, y: 0 } };
  return (
    <Flat cam={cam} frame={frame} door={ramp(frame, k.shut2[0], k.shut2[1])} calendar
      table={<Cake x={CAKE.x} y={CAKE.y} candle={0} frame={frame} scale={0.8} />} over={bubble}>
      <g opacity={her.opacity}>
        <Person body={her.body} frame={frame} seed={3} who={{ ...FLATMATE, coat: COAT, ...herFace, held: Keys }} />
        <Bag body={her.body} />
      </g>
      <Person body={you} frame={frame} seed={7} who={{ ...HERO, ...yourFace }} />
    </Flat>
  );
};

const WasYesterday: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = shot.frame;
  const k = times(shot.clips, shot.from, shot.to);
  const view = current(frame, [[0, "pod"], [k.spring, "spring"], [k.bakery, "bakery"], [k.wedding, "wedding"], [k.winter, "winter"], [k.alarm, "alarm"],
    [k.hold, "hold"], [k.cake, "cake"], [k.hands, "hands"], [k.neither, "neither"], [k.her, "her"], [k.bubble, "bubble"], [k.aside[0], "out"],
    [k.alone, "alone"], [k.night, "night"]] as [number, string][]);
  let picture: React.ReactNode;
  if (view === "pod") picture = <PodShot frame={frame} start={k.start} shut={k.shut} end={k.spring} />;
  else if (view === "spring") picture = <Blossom frame={frame} start={k.spring} />;
  else if (view === "bakery") picture = <Bakery frame={frame} start={k.bakery} />;
  else if (view === "wedding") picture = <Wedding frame={frame} start={k.wedding} />;
  else if (view === "winter") picture = <Winter frame={frame} start={k.winter} />;
  else if (view === "alarm") picture = <PodShot frame={frame} start={k.alarm} shut={k.alarm} open={k.open} end={k.hold} />;
  else if (view === "night") picture = <BackIn frame={frame} start={k.night} climb={k.climb} end={k.endOfBeat} />;
  else picture = <Kitchen frame={frame} k={k} view={view} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <Sequence from={k.open} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.8} /></Sequence>
      <Sequence from={k.climb + 26} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.5} /></Sequence>
      <CounterSound at={k.climb + 40} volume={0.7} />
    </AbsoluteFill>
  );
};

export const wasYesterday: Beat = { id: "WasYesterday", firstLine: 65, Component: WasYesterday };
