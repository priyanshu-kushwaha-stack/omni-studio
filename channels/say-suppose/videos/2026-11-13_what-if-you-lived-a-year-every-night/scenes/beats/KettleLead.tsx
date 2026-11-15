// Beat "The Kettle Lead" (script.md v7, ## [07:23]; story lines 64-74). The showdown and the peak, a triumph.
//   64   your boss smug under his padlocked coils / the teacher's back room inside: radios and lamps in pieces, you holding
//        a lamp cord to the light, a radio that plays / you a month ago at the desk turning his plug over under the lamp /
//        you and the teacher drawing the plug's insides on a long sheet while the counter-sun crosses the window again and
//        again / "a lamp cord with opinions": he holds up a plain cord beside your drawing, one brow up
//   65   the price card (coin, car, flat crossed out; the street circled) and your pay slip sliding in: a tiny desk
//   66   the hall at night, every counter running: you pull the lamp's plug (the lamp goes out), the kettle's plug, and
//        peel the tape off the spare socket under your old hatch / close on your hands twisting the two cords into one
//   67   the stairs: two shoes and a tie coming down / your hands, faster
//   68   your flatmate slides into the foot of the stairs and bars it with her mop: "Sir. So my brother, right..."
//   69   "Not now."      70  "He bought a kettle." (deadpan; his double take)
//   71   the wide: he is caught between the story and the hall / her fingers counting behind her back / the last wire in
//        your teeth / your hands a blur, and the homemade plug
//   hold (9 s) the wordless peak (KettleLead.Peak.tsx), "Staff first."
//   72   the town square: you on a crate with the drawing, the teacher, the crowd copying, every copy up at once / the hall:
//        a thousand glowing heads cross the hatch lips at once, the drawing over each
//   73   sleepers holding up their own lamp cords / empty kettle hooks and a shrug / the queue of kettles going in / your
//        boss's crate on the pavement, the price card crossed out eleven times down to a kettle, and him sulking on it
//   74   three made-up flags over three parliaments; kettles stamped with crosses; the crosses peel off; the ministers
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { REF } from "../sets/common";
import { camAt, current, HERO, PIANO, type Beat, type Shot } from "../shared";
import { Figure } from "@whatif/kit/rig/Figure";
import { BackRoom, BenchClutter, BENCH_TOP, growth, HandsInsert, LooseLead, Notes, OwnStage, PlugDrawing, PriceAndSlip, ROOM_FLOOR } from "./KettleLead.Inserts";
import { HallShot } from "./KettleLead.Hall";
import { PeakScene, peakTicks, peakTimes } from "./KettleLead.Peak";
import { CrateOut, EmptyHooks, KettleQueue, Parliaments, PodsShot, Teaching } from "./KettleLead.City";
import { aimArm, handAt, lineTimes, type Body } from "./Timeline.Cast";

const FIRST = 64;

function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  return {
    start: shot.from, end: shot.to,
    room: L.at(0, 0.18), month: L.at(0, 0.31), draw: L.at(0, 0.55), opinions: L.at(0, 0.87),
    price: L.from(1), street: L.at(1, 0.55), slip: L.at(1, 0.74),
    shift: L.from(2), lampOff: L.at(2, 0.38), kettleOff: L.at(2, 0.58), tape: [L.at(2, 0.64), L.at(2, 0.9)] as [number, number], hands: L.at(2, 0.94),
    steps: L.from(3), bar: L.from(4), barEnd: L.end(4), notNow: L.from(5), notNowEnd: L.end(5), kettle: L.from(6), kettleEnd: L.end(6),
    l71: L.from(7), fingers: L.at(7, 0.16), teeth: L.at(7, 0.45), blur: L.at(7, 0.64), peak: L.end(7),
    teach: L.from(8), copiesUp: L.at(8, 0.48), heads: L.at(8, 0.66),
    city: L.from(9), hooks: L.at(9, 0.27), shrug: L.at(9, 0.4), queue: L.at(9, 0.5), crate: L.at(9, 0.65), crosses: [L.at(9, 0.8), L.at(9, 0.96)] as [number, number], sulk: L.at(9, 0.99),
    flags: L.from(10), stamp: L.at(10, 0.3), peel: L.at(10, 0.6), ministers: L.at(10, 0.78),
  };
}
export type KL = ReturnType<typeof times>;

/** 64: the teacher's back room inside: `on` "room" (a cord to the light), "draw" (the year of drawing) or "opinions". */
const Room: React.FC<{ frame: number; k: KL; on: string }> = ({ frame, k, on }) => {
  const drawing = on === "draw";
  const cams: Record<string, Camera> = {
    room: camAt(frame, [[k.room, { x: 900, y: 600, zoom: 1.2 }], [k.month, { x: 920, y: 610, zoom: 1.32 }]]),
    draw: camAt(frame, [[k.draw, { x: 960, y: 520, zoom: 1.05 }], [k.opinions, { x: 960, y: 540, zoom: 1.15 }]]),
    opinions: camAt(frame, [[k.opinions, { x: 900, y: 560, zoom: 1.55 }], [k.price, { x: 900, y: 560, zoom: 1.65 }]]),
  };
  const cam = drift(cams[on], frame, `kl-${on}`, 3);
  const grow = drawing ? growth(frame, k.draw, k.opinions - 6) : 1;
  const sheet = { x: 380, y: 470, w: 900, h: 170 };
  const penX = sheet.x + sheet.w * grow;
  const you: Body = { x: on === "opinions" ? 700 : 640, y: ROOM_FLOOR, scale: 1.08, facing: 1, pose: { ...STAND } };
  const teacher: Body = { x: on === "opinions" ? 1120 : 1180, y: ROOM_FLOOR, scale: 1.06, facing: -1, pose: { ...STAND } };
  if (on === "room") {
    you.pose = { ...STAND, lean: -6, armF: aimArm(you, { x: you.x + 90, y: 560 }) };
    teacher.pose = { ...STAND, lean: 20, armF: aimArm(teacher, { x: 1200, y: BENCH_TOP - 14 }) };
  } else if (drawing) {
    you.pose = { ...STAND, lean: 14, armF: aimArm(you, { x: Math.min(penX, you.x + 100), y: sheet.y + 120 }) };
    teacher.pose = { ...STAND, lean: 14, armF: aimArm(teacher, { x: Math.max(penX + 20, teacher.x - 110), y: sheet.y + 100 }) };
  } else {
    you.pose = { ...STAND, armF: aimArm(you, { x: 820, y: 520 }), armB: aimArm(you, { x: 790, y: 600 }) };
    teacher.pose = { ...STAND, armF: aimArm(teacher, { x: 1010, y: 470 }) };
  }
  const th = handAt(teacher);
  const yh = handAt(you);
  const deadpan = on === "opinions" && frame >= k.opinions + 10;
  return (
    <OwnStage cam={cam} mood="lamp" back={<BackRoom frame={frame} cycle={drawing ? 1.6 : 0} />} actors={
      <>
        {drawing && <PlugDrawing {...sheet} grow={grow} />}
        <Figure {...you} head={HERO.head} scarf={HERO.scarf} tuft flow={0.08} time={frame} blink={frame % 97 < 4}
          brows={on === "opinions" ? "raised" : "flat"} lids={on === "room" ? 0.1 : 0.2} mouth={on === "opinions" ? "smile" : drawing ? "flat" : "o"} eyes={1.05}
          look={on === "room" ? { x: 0.8, y: -0.7 } : { x: 1, y: 0.2 }} />
        <Figure {...teacher} head={PIANO.head} coat={PIANO.coat} time={frame} blink={(frame + 9) % 97 < 4}
          brows={deadpan ? "flat" : "raised"} lids={deadpan ? 0.45 : 0.2} mouth={deadpan ? "flat" : "smile"} look={deadpan ? { x: 0.2, y: 0 } : { x: 1, y: 0.3 }} />
        {deadpan && <path d={`M${teacher.x - 40} ${teacher.y - 330} l28 -10`} stroke="#23252b" strokeWidth={5} strokeLinecap="round" />}
        {on === "room" && <LooseLead x={yh.x} y={yh.y} frame={frame} />}
        {on === "opinions" && (
          <>
            <LooseLead x={th.x} y={th.y} frame={frame} />
            <PlugDrawing x={yh.x - 20} y={yh.y - 150} w={260} h={120} grow={1} held />
          </>
        )}
        <BenchClutter frame={frame} smoke={on !== "opinions"} />
        {on === "room" && <Notes frame={frame} x={460} y={250} at={k.room + 24} />}
      </>
    } />
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const on = current(frame, [[0, "boss"], [k.room, "room"], [k.month, "month"], [k.draw, "draw"], [k.opinions, "opinions"], [k.price, "price"],
    [k.shift, "shift"], [k.lampOff - 8, "unplug"], [k.tape[0], "tape"], [k.hands, "hands1"], [k.steps, "shoes"], [k.steps + 28, "hands2"],
    [k.bar - 8, "bar"], [k.notNow, "notNow"], [k.kettle, "kettle"], [k.l71, "caught"], [k.fingers, "fingers"], [k.teeth, "teeth"], [k.blur, "blur"],
    [k.peak, "peak"], [k.teach, "teach"], [k.heads, "heads"], [k.city, "cords"], [k.hooks, "hooks"], [k.queue, "queue"], [k.crate, "crate"],
    [k.flags, "flags"]] as [number, string][]);
  let picture: React.ReactNode;
  if (on === "room" || on === "draw" || on === "opinions") picture = <Room frame={frame} k={k} on={on} />;
  else if (on === "price") {
    const cam = drift(camAt(frame, [[k.price, { x: 960, y: 540, zoom: 1.0 }], [k.slip, { x: 1040, y: 560, zoom: 1.12 }], [k.shift, { x: 1060, y: 560, zoom: 1.16 }]]), frame, "kl-price", 3);
    picture = <OwnStage cam={cam} mood="lamp" back={<rect x={-1400} y={-900} width={4800} height={2900} fill="#3a2a22" />} actors={<PriceAndSlip frame={frame} at={k.price} circle={k.street} slip={k.slip} />} />;
  } else if (on === "hands1" || on === "hands2" || on === "blur") {
    const speed = on === "hands1" ? 1 : on === "hands2" ? 2.4 : 5;
    const twist = on === "hands1" ? 0.35 + 0.2 * ((frame - k.hands) / 30) : on === "hands2" ? 0.7 : 0.85 + 0.15 * ((frame - k.blur) / 40);
    picture = <OwnStage cam={drift({ ...REF, zoom: on === "blur" ? 1.1 : 1.0 }, frame, "kl-hands", 3)} mood="lamp" back={<HandsInsert frame={frame} twist={Math.min(1, twist)} speed={speed} plug={on === "blur" && frame >= k.peak - 14} />} />;
  } else if (on === "peak") picture = <PeakScene frame={frame} k={k} />;
  else if (on === "teach") picture = <Teaching frame={frame} k={k} />;
  else if (on === "heads") picture = <PodsShot frame={frame} from={k.heads + 4} cam={drift(camAt(frame, [[k.heads, { x: 960, y: 560, zoom: 1.02 }], [k.city, { x: 960, y: 540, zoom: 0.96 }]]), frame, "kl-heads", 2)} />;
  else if (on === "cords") picture = <PodsShot frame={frame} from={k.city + 2} morning cam={drift(camAt(frame, [[k.city, { x: 900, y: 640, zoom: 1.35 }], [k.hooks, { x: 940, y: 630, zoom: 1.45 }]]), frame, "kl-cords", 2)} />;
  else if (on === "hooks") picture = <EmptyHooks frame={frame} from={k.hooks} shrug={k.shrug} to={k.queue} />;
  else if (on === "queue") picture = <KettleQueue frame={frame} from={k.queue} to={k.crate} />;
  else if (on === "crate") picture = <CrateOut frame={frame} k={k} />;
  else if (on === "flags") picture = <Parliaments frame={frame} k={k} />;
  else picture = <HallShot frame={frame} k={k} on={on} />;
  const p = peakTimes(k);
  const sfx = (src: string, at: number, volume: number, dur = 14) => (
    <Sequence key={`${src}${at}`} from={at} durationInFrames={dur}><Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} /></Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {sfx("click", k.lampOff + 2, 0.45)}
      {sfx("click", k.kettleOff + 2, 0.45)}
      {sfx("snap", k.tape[0] + 8, 0.3)}
      {[0, 1, 2, 3].map((i) => sfx("tick", k.steps - 8 + i * 9, 0.18, 8))}
      {sfx("snap", k.bar, 0.5)}
      {sfx("snap", p.plug, 0.7)}
      {peakTicks(p).map((t) => sfx("tick", t, 0.45, 8))}
      {sfx("hatch", p.door[0], 0.6, 40)}
      {sfx("flutter", p.click - 36, 0.5, 40)}
      {sfx("click", p.click, 0.9, 10)}
      {sfx("hatch", p.up[0], 0.7, 40)}
      {sfx("snap", k.crate + 30, 0.55)}
      {sfx("snap", k.stamp, 0.6)}
    </AbsoluteFill>
  );
};

export const kettleLead: Beat = { id: "KettleLead", firstLine: FIRST, Component: Scene };
