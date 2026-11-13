// Beat "The Slow Room" (script.md, ## [08:36] The Slow Room; lines 83-91). Inside, the oldest quarter of the town in
// lamp light, the sky's counter blurring. You walk past the feast hall without going in; a queue of grey heads, lids
// heavy, winds down the street to one plain door with one window. The old sleeper on the bench by the door, a ticket
// covered in flaps: "Tomorrow's too far." Then the one wordless peak (9 s): the door opens, he and the one beside him go
// in and sit on the bench under the window; the clock's red hand moves at an ordinary speed; the sky counter stops on
// one click; one tells a story with his hands, the other listens; the camera pulls back along the queue until the door
// is one lit square at the end of a thousand bowed heads, you one of them. Then the 200 hours folded to twelve minutes
// on a kitchen clock, and you step out of the queue and walk back.
//
//   83  you walk past the feast hall, its windows bright with bobbing heads; on "They aren't at the feasts" a glance
//   84  you stop; the camera pans along the queue to the door
//   85  "One room" the plain front / "One window" / "One clock" its red hand / "a day for a day" the sky counter, blurring /
//       "the queue ... is a year long" the old sleeper on the bench, his ticket of flaps
//   86  close on him: "Tomorrow's too far." You beside the bench, listening
//   peak the door opens; the two rise and go in / the window: they sit / the sky counter: one click, still / the window:
//       one talks with his hands, the other listens / the long pull-back along the queue (into line 87)
//   87  "You did. Not hours. Hers." close on you in the queue
//   88  the paper tally: 200 folded to a sliver, laid on a kitchen clock at seven as a twelve-minute wedge
//   89  close on you   90  along the queue toward the lit door   91  close on you; you turn, step out, walk back
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, walkPose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { TOWN, TownBack, townLights } from "../sets/InsideTown";
import { camAt, current, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { BENCH, Bench, FeastHall, QUEUE, QueueBack, QueueFront, RoomOpen, Ticket, WideSky, WideTown, YOUR_PLACE } from "./SlowRoom.Queue";
import { FoldSheet } from "./SlowRoom.Fold";
import { handAt, headOf, lineTimes, Old, You, type Body, type Face } from "./Timeline.Cast";

const FIRST = 83;
type T = ReturnType<typeof times>;

function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  const peak = L.end(3) + 4;
  const g = L.from(4) - peak;
  const pp = (p: number) => Math.round(peak + g * p);
  return {
    start: shot.from, end: shot.to, glance: L.at(0, 0.8),
    l84: L.from(1), panned: L.at(1, 0.75),
    l85: L.from(2), window: L.at(2, 0.1), clock: L.at(2, 0.2), sky: L.at(2, 0.55), bench: L.at(2, 0.7), ticket: L.at(2, 0.86),
    l86: L.from(3), tooFar: [L.from(3), L.end(3)] as const,
    peak, open: [pp(0), pp(0.1)] as const, rise: [pp(0.06), pp(0.13)] as const, walkIn: [pp(0.13), pp(0.3)] as const,
    inside: pp(0.3), stop: pp(0.42), click: pp(0.47), talk: pp(0.53), pull: pp(0.63),
    l87: L.from(4), youClose: L.at(4, 0.5),
    l88: L.from(5), stamp: L.at(5, 0.18), fold: [L.at(5, 0.38), L.at(5, 0.6)] as [number, number], clockIn: L.at(5, 0.48),
    lay: [L.at(5, 0.62), L.at(5, 0.76)] as [number, number],
    l89: L.from(6), l90: L.from(7),
    l91: L.from(8), gotOne: L.at(8, 0.42), turn: L.at(8, 0.58), out: [L.at(8, 0.6), L.at(8, 0.7)] as const,
  };
}

/** A camera that centres a point drawn on a Deep layer of `depth` (parallax solved). */
const aimAt = (x: number, y: number, depth: number, zoom: number): Camera => ({ x: (x - 960 * (1 - depth)) / depth, y: (y - 540 * (1 - depth)) / depth, zoom });
const WIN = { x: TOWN.window.x + TOWN.window.w / 2, y: TOWN.window.y + TOWN.window.h / 2 };
const OLD_AT = { x: BENCH.x + 160, partner: BENCH.x + 30, s: 0.95 };
const YOU_AT_BENCH = 2030;

function yourBody(frame: number, k: T): Body {
  if (frame < k.l84) {
    const x = mix(-600, 700, linear(frame, k.start, k.l84));
    return { x, y: 1000, scale: 1, facing: 1, pose: walkPose(frame * 0.3) };
  }
  if (frame < k.l85) return { x: 700, y: 1000, scale: 1, facing: 1, pose: STAND };
  if (frame < k.peak) return { x: YOU_AT_BENCH, y: 985, scale: 0.98, facing: -1, pose: { ...STAND, lean: 4, tilt: 4 } };
  const bowed = { ...STAND, lean: 8, tilt: 14, armF: [12, 18] as [number, number] };
  if (frame < k.turn) return { x: YOUR_PLACE, y: QUEUE.y, scale: QUEUE.scale, facing: 1, pose: frame < k.gotOne ? bowed : { ...STAND, lean: 0, tilt: -4 } };
  const out = ramp(frame, k.out[0], k.out[1]);
  const walking = frame >= k.out[0];
  const back = Math.max(0, frame - k.out[1]) * 4.2;
  return {
    x: mix(YOUR_PLACE, YOUR_PLACE - 40, out) - back, y: mix(QUEUE.y, 995, out), scale: mix(QUEUE.scale, 0.95, out), facing: -1,
    pose: walking ? walkPose(frame * 0.3) : STAND,
  };
}

function yourFace(frame: number, k: T): Face {
  if (frame < k.l84) return { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: frame >= k.glance ? { x: -0.6, y: -0.3 } : { x: 1, y: 0 } };
  if (frame < k.l85) return { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 1, y: 0 } };
  if (frame < k.peak) return { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.4 } };
  if (frame < k.gotOne) return { brows: "sad", lids: 0.6, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.6 } };
  if (frame < k.turn) return { brows: "raised", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 0.4, y: -0.6 } };
  return { brows: "flat", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
}

/** The old sleeper (with his ticket) and the one beside him: on the bench, rising, going in at the door. */
function pair(frame: number, k: T) {
  const rise = ramp(frame, k.rise[0], k.rise[1]);
  const walk = ramp(frame, k.walkIn[0], k.walkIn[1]);
  const fade = 1 - ramp(frame, k.walkIn[1] - 8, k.walkIn[1]);
  const door = TOWN.door.x + TOWN.door.w / 2 + 20;
  const body = (x0: number, facing: 1 | -1, i: number): Body => {
    const seatY = seatedY(BENCH.top, OLD_AT.s);
    if (rise <= 0) return { x: x0, y: seatY, scale: OLD_AT.s, facing, pose: { ...SEATED, tilt: i ? 14 : 4 } };
    if (walk <= 0) return { x: x0, y: mix(seatY, 958, rise), scale: OLD_AT.s, facing: rise > 0.6 ? -1 : facing, pose: lerpPose(SEATED, STAND, rise) };
    return { x: mix(x0, door + i * 40, walk), y: mix(958, 935, walk), scale: mix(OLD_AT.s, 0.8, walk), facing: -1, pose: walkPose(frame * 0.22 + i) };
  };
  return { old: body(OLD_AT.x, 1, 0), partner: body(OLD_AT.partner, 1, 1), fade, gone: frame >= k.walkIn[1] };
}

const Town: React.FC<{ frame: number; k: T; on: string }> = ({ frame, k, on }) => {
  const you = yourBody(frame, k);
  const yh = headOf(you);
  const p = pair(frame, k);
  const oh = headOf(p.old);
  const ticketHand = handAt(p.old);
  const cams: Record<string, Camera> = {
    feast: { x: you.x + 160, y: 620, zoom: 1.2 },
    reveal: camAt(frame, [[k.l84, { x: 820, y: 640, zoom: 1.2 }], [k.panned, { x: 1300, y: 640, zoom: 1.0 }], [k.l85, { x: 1320, y: 640, zoom: 1.0 }]]),
    room: camAt(frame, [[k.l85, { x: 1420, y: 640, zoom: 1.15 }], [k.window, { x: 1400, y: 650, zoom: 1.3 }]]),
    window: camAt(frame, [[k.window, aimAt(WIN.x, WIN.y, 0.8, 2.0)], [k.clock, aimAt(WIN.x, WIN.y, 0.8, 2.3)]]),
    clock: camAt(frame, [[k.clock, aimAt(WIN.x, TOWN.window.y + 60, 0.8, 4.2)], [k.sky, aimAt(WIN.x, TOWN.window.y + 60, 0.8, 4.8)]]),
    sky: camAt(frame, [[k.sky, aimAt(960, 150, 0.45, 2.0)], [k.bench, aimAt(960, 160, 0.45, 2.2)]]),
    bench: camAt(frame, [[k.bench, { x: 1830, y: 760, zoom: 1.7 }], [k.ticket, { x: 1840, y: 770, zoom: 1.85 }]]),
    ticket: camAt(frame, [[k.ticket, insert(ticketHand.x, ticketHand.y - 30, 3.4)], [k.l86, insert(ticketHand.x, ticketHand.y - 30, 3.7)]]),
    old: camAt(frame, [[k.l86, closeUp(oh.x + 60, oh.y + 10, 2.4)], [k.peak, closeUp(oh.x + 60, oh.y + 10, 2.55)]]),
    door: camAt(frame, [[k.peak, { x: 1640, y: 690, zoom: 1.45 }], [k.inside, { x: 1600, y: 690, zoom: 1.55 }]]),
    inside: camAt(frame, [[k.inside, aimAt(WIN.x, WIN.y + 10, 0.8, 2.3)], [k.stop, aimAt(WIN.x, WIN.y + 10, 0.8, 2.5)]]),
    stop: camAt(frame, [[k.stop, aimAt(960, 150, 0.45, 2.4)], [k.talk, aimAt(960, 150, 0.45, 2.6)]]),
    inside2: camAt(frame, [[k.talk, aimAt(WIN.x, WIN.y + 10, 0.8, 2.6)], [k.pull, aimAt(WIN.x, WIN.y + 10, 0.8, 2.7)]]),
    pull: camAt(frame, [[k.pull, aimAt(WIN.x, WIN.y + 10, 0.8, 2.4)], [k.l87, { x: 320, y: 560, zoom: 0.43 }], [k.youClose, { x: 280, y: 560, zoom: 0.4 }]]),
    you: camAt(frame, [[k.youClose, closeUp(yh.x + 40, yh.y + 10, 2.3)], [k.l88, closeUp(yh.x + 40, yh.y + 10, 2.6)]]),
    fold: { x: 760, y: 700, zoom: 0.9 },
    you2: camAt(frame, [[k.l89, closeUp(yh.x + 30, yh.y + 10, 2.4)], [k.l90, closeUp(yh.x + 30, yh.y + 10, 2.8)]]),
    toDoor: camAt(frame, [[k.l90, { x: 600, y: 650, zoom: 0.75 }], [k.l91, { x: 1250, y: 660, zoom: 1.15 }]]),
    you3: camAt(frame, [[k.l91, closeUp(yh.x + 30, yh.y + 10, 2.3)], [k.turn, closeUp(yh.x + 20, yh.y + 10, 2.5)]]),
    leave: camAt(frame, [[k.turn, closeUp(yh.x, yh.y + 60, 2.0)], [k.out[1] + 10, { x: you.x - 160, y: 560, zoom: 1.0 }], [k.end, { x: you.x - 160, y: 560, zoom: 1.0 }]]),
  };
  const cam = drift(cams[on], frame, "slowroom", on === "clock" || on === "ticket" ? 1.5 : 3);
  const spin = !(frame >= k.click && frame < k.l90);
  const queueOn = on !== "feast";
  const oldFace: Face = frame >= k.tooFar[0] && frame < k.tooFar[1] + 4
    ? { brows: "none", lids: 0.86, mouth: "open", eyes: 1, look: { x: 1, y: 0.1 } }
    : { brows: "none", lids: 0.86, mouth: frame >= k.peak ? "smile" : "flat", eyes: 1, look: { x: 1, y: 0.3 } };
  const actors = (
    <>
      <Bench />
      {queueOn && <QueueFront frame={frame} skip={frame >= k.peak ? YOUR_PLACE : undefined} />}
      {!p.gone && (
        <g opacity={p.fade}>
          <Old body={p.partner} frame={frame} face={{ brows: "none", lids: 0.9, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.5 } }} head="#a9a59c" coat="#5b5450" seed={12} />
          <Old body={p.old} frame={frame} face={oldFace} held={frame < k.walkIn[0] ? <Ticket /> : undefined} />
        </g>
      )}
      <You body={you} face={yourFace(frame, k)} frame={frame} />
    </>
  );
  const back = (
    <>
      <WideSky cam={cam} />
      <TownBack cam={cam} frame={frame} room spin={spin} clockMinutes={20} lit />
      <WideTown cam={cam} />
      <FeastHall cam={cam} frame={frame} />
      <RoomOpen cam={cam} frame={frame} open={ramp(frame, k.open[0], k.open[1])} inside={ramp(frame, k.inside - 4, k.inside + 4)} talk={ramp(frame, k.talk, k.talk + 10)} />
      {queueOn && <QueueBack cam={cam} frame={frame} />}
    </>
  );
  return (
    <LookContext.Provider value={setLook(townLights(true), "lamp", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} />
    </LookContext.Provider>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot);
  const { frame } = shot;
  const on = current(frame, [[0, "feast"], [k.l84, "reveal"], [k.l85, "room"], [k.window, "window"], [k.clock, "clock"], [k.sky, "sky"],
    [k.bench, "bench"], [k.ticket, "ticket"], [k.l86, "old"], [k.peak, "door"], [k.inside, "inside"], [k.stop, "stop"], [k.talk, "inside2"],
    [k.pull, "pull"], [k.youClose, "you"], [k.l88, "fold"], [k.l89, "you2"], [k.l90, "toDoor"], [k.l91, "you3"], [k.turn, "leave"]] as [number, string][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Town frame={frame} k={k} on={on} />
      {on === "fold" && <FoldSheet frame={frame} at={k.l88 + 2} until={k.l89} stamp={k.stamp} fold={k.fold} clock={k.clockIn} lay={k.lay} />}
      {/* the rule device stopping: one flap, one click, in the film's one planned silence */}
      <Sequence from={k.click} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.9} /></Sequence>
      <Sequence from={k.stamp} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};

export const slowRoom: Beat = { id: "SlowRoom", firstLine: FIRST, Component: Scene };
