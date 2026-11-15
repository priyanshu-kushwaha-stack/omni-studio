// Beat "Tomorrow" (script.md v7, ## [08:53]; story lines 75-83). The bigger consequence and the twist.
//   75   the hall at dawn, the wedge: NIGHT 123; you half out of your hatch, stretching, the counter on 365 / the portrait
//        sheet: the very old woman's tally of years, yours climbing past hers and off the paper (no digits) / the rota:
//        your row drawn in every night, running off the sheet
//   76   you with the roll; on "Unroll it" it rolls away along the floor, out of the hall's doors and down the street into
//        the dark between drawn cranes, every counter running, the camera walking it / the stamp at a thousand years: a
//        page of old letters stands up (made-up glyphs) / "Keep going.": on into the dark
//   77   the wide: a paper you at each end of it, mouths open, empty bubbles / your boss steps into the near one's frame
//        holding out the rota
//   78   the harbour at dawn: roof counters clicking to 365 in a wave / a bridge draws itself across the water / a
//        passer-by under it, yawning, not looking up
//   79-83 the hatch above yours (dark all film) clicks to 365 and your flatmate climbs out a year older (Tomorrow.End.tsx)
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { worldOf } from "@whatif/kit/sets/common";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Tag } from "@whatif/kit/ui/Tag";
import { PAPER } from "@whatif/kit/theme";
import { Bubble } from "../parts";
import { FLOOR, POD_ONE } from "../sets/PodHall";
import { camAt, current, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { HallStage, NightDesk } from "./NightThirty.Hall";
import { OwnStage } from "./KettleLead.Inserts";
import { Dark, OldPage, PaperYou, PortraitSheet, Strip, STRIP, yearX } from "./Timeline.Strip";
import { Boss, lineTimes, You, type Body, type Face } from "./Timeline.Cast";
import { Cranes, Harbour, HallDoors, HeldRota, RotaSheet } from "./Tomorrow.Parts";
import { EndScene } from "./Tomorrow.End";

const FIRST = 75;

function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  const hold = L.end(4);
  const g = L.from(5) - hold;
  const h = (p: number) => Math.round(hold + g * p);
  return {
    start: shot.from, end: shot.to,
    tag: L.from(0) + 6, sheet: L.at(0, 0.3), climb: [L.at(0, 0.34), L.at(0, 0.6)] as [number, number], rota: L.at(0, 0.68), rotaFill: L.at(0, 0.72),
    l76: L.from(1), unroll: L.at(1, 0.46), stamp: L.at(1, 0.54), unread: L.at(1, 0.8), keep: L.at(1, 0.94),
    l77: L.from(2), near: L.at(2, 0.04), far: L.at(2, 0.28), worry: L.at(2, 0.62), rotaIn: L.at(2, 0.76),
    l78: L.from(3), bridge: L.at(3, 0.42), passer: L.at(3, 0.76),
    l79: L.from(4), flutter: L.from(4) - 4, hold, open: [h(0.04), h(0.2)] as [number, number], out: [h(0.12), h(0.45)] as [number, number],
    hand: h(0.5), mop: [h(0.58), h(0.8)] as [number, number], bubble: Math.max(h(0.66), L.from(5) - 36),
    l80: L.from(5), l80End: L.end(5), l81: L.from(6), bossIn: [L.from(7) - 14, L.from(7) - 2] as [number, number], l82: L.from(7), l82End: L.end(7),
    l83: L.from(8), comment: L.at(8, 0.42), like: L.at(8, 0.8), subscribe: L.at(8, 0.9),
  };
}
export type TM = ReturnType<typeof times>;

/** How far the strip has unrolled (world x of its front). */
function frontAt(frame: number, k: TM): number {
  const stop = yearX(1000) + 140;
  if (frame < k.keep) return mix(STRIP.start, stop, ramp(frame, k.unroll, k.stamp - 2));
  return mix(stop, STRIP.end, linear(frame, k.keep, k.l77 + 10));
}

const LIP = { x: POD_ONE.x + 150, y: POD_ONE.y + POD_ONE.h - 6 };
const YOU_X = 720;

/** 75-77 in the hall at dawn: you at your hatch, the strip, the old pages, the two paper yous, your boss with the rota. */
const Hall: React.FC<{ frame: number; k: TM; on: string }> = ({ frame, k, on }) => {
  const front = frontAt(frame, k);
  const walkCam = (f: number): Camera => ({ x: Math.max(760, Math.min(2900, frontAt(f, k) - 260)), y: 640, zoom: 1.12 });
  const cams: Record<string, Camera> = {
    hatch: camAt(frame, [[k.start, { x: 640, y: 690, zoom: 1.85 }], [k.sheet, { x: 650, y: 680, zoom: 2.0 }]]),
    portrait: { x: 700, y: 640, zoom: 1.3 },
    rota: { x: 330, y: 700, zoom: 1.6 },
    roll: camAt(frame, [[k.l76, { x: 780, y: 720, zoom: 1.9 }], [k.unroll, { x: 820, y: 720, zoom: 1.6 }]]),
    walk: walkCam(frame),
    page: camAt(frame, [[k.stamp, { x: yearX(1000), y: 700, zoom: 1.5 }], [k.unread, { x: yearX(1000), y: 690, zoom: 1.85 }], [k.keep, { x: yearX(1000) + 20, y: 690, zoom: 1.95 }]]),
    walk2: camAt(frame, [[k.keep, { x: yearX(1000) + 20, y: 690, zoom: 1.6 }], [k.keep + 24, walkCam(k.keep + 24)], [k.l77, walkCam(k.l77)]]),
    wide: camAt(frame, [[k.l77, { x: 2300, y: 680, zoom: 0.9 }], [k.far, { x: 2000, y: 660, zoom: 0.62 }], [k.rotaIn, { x: 1950, y: 660, zoom: 0.6 }]]),
    bossRota: camAt(frame, [[k.rotaIn, { x: 760, y: 700, zoom: 1.5 }], [k.l78, { x: 770, y: 700, zoom: 1.62 }]]),
  };
  const cam = drift(cams[on], frame, `tm-${on}`, 2.5);
  const seat = worldOf(cam, LIP.x, LIP.y, 0.85);
  let you: Body | null = null;
  let face: Face = { brows: "flat", lids: 0.55, mouth: "flat", eyes: 1, look: { x: 0.6, y: -0.2 } };
  let held: React.ReactNode;
  if (on === "hatch" || on === "portrait") {
    const stretch = Math.sin(Math.PI * linear(frame, k.start + 8, k.sheet - 4));
    const pose: Pose = lerpPose({ ...SEATED, lean: 4, armF: [40, 50], armB: [-6, 30] }, { ...SEATED, armF: [168, 10], armB: [158, 14], lean: -6, tilt: -8 }, stretch);
    you = { x: seat.x, y: seatedY(seat.y, 0.95), scale: 0.95, facing: 1, pose };
    face = { brows: "flat", lids: 0.6, mouth: stretch > 0.5 ? "o" : "smirk", eyes: 0.9, look: { x: 0.8, y: -0.1 } };
  } else if (on === "roll" || on === "walk") {
    const drop = ramp(frame, k.unroll - 6, k.unroll + 4);
    you = { x: YOU_X, y: FLOOR, scale: 1.1, facing: 1, pose: lerpPose({ ...STAND, armF: [60, 50], armB: [40, 60] }, { ...STAND, lean: 10, armF: [30, 20] }, drop) };
    face = frame < k.unroll ? { brows: "raised", lids: 0.3, mouth: "smirk", eyes: 1.0, look: { x: 0.7, y: 0.5 } } : { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 1, y: 0.3 } };
    if (drop < 0.5) held = <g transform="rotate(80)"><rect x={-18} y={-40} width={36} height={80} rx={14} fill={PAPER} stroke="#b9a989" strokeWidth={4} /></g>;
  }
  const rotaIn = ramp(frame, k.rotaIn, k.rotaIn + 16);
  const boss: Body = { x: mix(380, 640, rotaIn), y: STRIP.y + STRIP.h / 2, scale: 0.86, facing: 1, pose: { ...STAND, armF: [80, 10] } };
  const nearHead = { x: STRIP.start + 170, y: 700 };
  const actors = (
    <>
      <HallDoors x={2010} />
      <NightDesk lamp={false} kettleLead={false} lampCord={false} />
      <Strip front={front} />
      <OldPage frame={frame} at={k.stamp} x={yearX(1000)} kind={0} />
      <OldPage frame={frame} at={k.keep + 10} x={yearX(2000)} kind={1} scale={0.9} fade={0.9} />
      <OldPage frame={frame} at={k.keep + 40} x={yearX(2900)} kind={2} scale={0.8} fade={0.8} />
      <PaperYou frame={frame} at={k.near} x={nearHead.x} scale={0.8} facing={1} worry={frame >= k.worry} />
      {you && <You body={you} face={face} frame={frame} held={held} />}
      {frame >= k.rotaIn && <Boss body={boss} face={{ brows: "raised", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }} frame={frame} held={<HeldRota />} />}
      <Dark />
      <Cranes frame={frame} />
      <PaperYou frame={frame} at={k.far} x={3180} scale={0.8} facing={-1} shape />
      {on === "wide" && frame >= k.far + 10 && (
        <>
          <Bubble frame={frame} at={k.far + 10} x={nearHead.x + 40} y={nearHead.y - 40} text="" size={60} side="right" />
          <Bubble frame={frame} at={k.far + 16} x={3140} y={nearHead.y - 40} text="" size={60} side="left" />
        </>
      )}
      {on === "bossRota" && <Bubble frame={frame} at={k.rotaIn} x={nearHead.x + 40} y={nearHead.y - 30} text="" size={44} side="right" />}
    </>
  );
  return <HallStage cam={cam} frame={frame} mood="morning" hall={{ door: on === "hatch" || on === "portrait" ? 1 : 0, counter: { value: "365" }, wedge: true, minutes: 52,
    flutterAll: frame >= k.unroll && frame < k.l77 }} actors={actors} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  if (frame >= k.l79) return <EndScene frame={frame} k={k} />;
  const on = current(frame, [[0, "hatch"], [k.sheet, "portrait"], [k.rota, "rota"], [k.l76, "roll"], [k.unroll, "walk"], [k.stamp, "page"], [k.keep, "walk2"],
    [k.l77, "wide"], [k.rotaIn, "bossRota"], [k.l78, "harbour"]] as [number, string][]);
  let picture: React.ReactNode;
  if (on === "harbour") {
    const cam = frame < k.passer
      ? drift(camAt(frame, [[k.l78, { x: 960, y: 420, zoom: 1.15 }], [k.bridge, { x: 960, y: 520, zoom: 1.0 }], [k.passer, { x: 960, y: 540, zoom: 0.98 }]]), frame, "tm-harb", 3)
      : drift(camAt(frame, [[k.passer, { x: 900, y: 760, zoom: 1.5 }], [k.l79, { x: 1000, y: 760, zoom: 1.55 }]]), frame, "tm-quay", 2);
    picture = <OwnStage cam={cam} mood="morning" back={<Harbour frame={frame} wave={k.l78 + 4} bridge={k.bridge} walk={k.passer - 40} />} />;
  } else picture = <Hall frame={frame} k={k} on={on} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {(on === "portrait" || on === "rota") && <AbsoluteFill style={{ background: "rgba(12,10,20,0.35)" }} />}
      {on === "portrait" && <PortraitSheet frame={frame} at={k.sheet} until={k.rota} climb={k.climb} name={Number.MAX_SAFE_INTEGER} x={960} y={520} />}
      {on === "rota" && <RotaSheet frame={frame} at={k.rota} fill={k.rotaFill} x={960} y={540} />}
      {frame < k.sheet && <Tag at={k.tag} text="NIGHT 123" x={150} y={110} size={60} />}
      <Sequence from={k.unroll} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.stamp} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.8} /></Sequence>
      <Sequence from={k.bridge} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};

export const tomorrow: Beat = { id: "Tomorrow", firstLine: FIRST, Component: Scene };
