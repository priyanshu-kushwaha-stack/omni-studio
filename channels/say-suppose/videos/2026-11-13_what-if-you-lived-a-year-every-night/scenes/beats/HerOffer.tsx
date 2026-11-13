// Beat "Her Offer" (script.md, ## [07:54] Her Offer; lines 76-82, and the 4 s performed hold before line 76, which The
// Timeline hands over to this scene). The hall at night, your pod open, you sitting on its lip with the cable. Your
// flatmate comes down into the hall for the first time, apron off, and holds out her hand, palm up, for a cable.
//
//   hold (4 s) she walks in and holds out her hand; close on you: you look at her hand, then her face, your brows lift
//        for a second, then you shake your head once; her hand stays up
//   76   close on her: "I'll come too."
//   77   the two of you / a paper inset over the hatch: the inside town, forty years of faces round a table; a small
//        lilac figure at the door with a suitcase; nobody turns round; she is the stranger / close on her face, her open
//        hand, her eyes ("Her brother's story. Her door code. Her.")
//   78   the inset again: the piano teacher at the head of the table turns and looks straight out at you: "Stay."
//   79   close on you with the plug, looking up at the inset as it goes, then at her
//   80   "In there" the open pod, its lamp and pillow; "Out here" her, hand still out
//   81   close on you: you look at her hand, and you push the plug into the socket under the counter
//   82   close on her: "I'll be here."
//   hold (3 s) from inside the pod: the door comes down; her open hand stays in the narrowing gap until it closes; then
//        the hall: the counter flutters to 365 and clicks, the wall clock ticks once, her hand still out
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook, worldOf } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Cable, CounterSound, FLUTTER_FRAMES, TickSound } from "../parts";
import { FLOOR, POD_ONE, PodHallBack, podHallLights } from "../sets/PodHall";
import { camAt, current, FLATMATE, mix, ramp, type Beat, type Shot } from "../shared";
import { IN_CAMS, mixCam, PodInside, TableInset } from "./HerOffer.Inset";
import { aimArm, handAt, headOf, lineTimes, Mate, PalmUp, Plug, You, type Body, type Face } from "./Timeline.Cast";

const FIRST = 76;
type T = ReturnType<typeof times>;

function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  const prev = shot.clips[FIRST - 1];
  const h0 = prev.from + prev.frames + 4;
  const g = L.from(0) - h0;
  const hp = (p: number) => Math.round(h0 + g * p);
  const pov = L.end(6) + 3;
  const g3 = L.from(7) - pov;
  const closed = Math.round(pov + g3 * 0.42);
  return {
    h0, walkEnd: hp(0.32), handUp: [hp(0.3), hp(0.42)] as const, youCU: hp(0.42), lookFace: hp(0.55),
    brow: [hp(0.58), hp(0.76)] as const, shake: [hp(0.74), hp(0.96)] as const,
    come: L.from(0), comeEnd: L.end(0),
    l77: L.from(1), insetIn: L.at(1, 0.12), guest: L.at(1, 0.33), table: L.at(1, 0.5), stranger: L.at(1, 0.62),
    herFace: L.at(1, 0.7), hand: L.at(1, 0.82), herEyes: L.at(1, 0.95),
    turn: L.from(2) - 14, stay: L.from(2), stayEnd: L.end(2),
    l79: L.from(3), lookUp: L.at(3, 0.3), lookHer: L.at(3, 0.7),
    l80: L.from(4), outHere: L.at(4, 0.5),
    l81: L.from(5), plug: [L.at(5, 0.55), L.at(5, 0.82)] as const,
    l82: L.from(6), hereEnd: L.end(6),
    pov, closed, flutter: closed + 3, tick: closed + 3 + FLUTTER_FRAMES + 2,
  };
}

const LIP = { x: POD_ONE.x + 150, y: POD_ONE.y + POD_ONE.h - 6 };
const SOCKET = { x: POD_ONE.x + POD_ONE.w - 24, y: POD_ONE.y + 72 };
const HER = { x: 850, y: FLOOR, scale: 1.08 };
const YS = 0.95;

/** Her: walking in, then standing with her hand out, palm up. */
function herBody(frame: number, k: T): Body {
  const walk = ramp(frame, k.h0, k.walkEnd);
  const x = mix(1560, HER.x, walk);
  const out = ramp(frame, k.handUp[0], k.handUp[1]);
  const pose: Pose = walk < 1 ? walkPose(frame * 0.32) : lerpPose(STAND, { ...STAND, armF: [76, 14], lean: 3 }, out);
  return { x, y: HER.y, scale: HER.scale, facing: -1, pose };
}

function yourFace(frame: number, k: T): Face {
  if (frame < k.youCU) return { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  if (frame < k.come) {
    const brow = frame >= k.brow[0] && frame < k.brow[1];
    return { brows: brow ? "raised" : frame >= k.shake[0] ? "sad" : "flat", lids: brow ? 0.1 : 0.4, mouth: "flat", eyes: brow ? 1.1 : 1, look: frame < k.lookFace ? { x: 1, y: 0.7 } : { x: 1, y: -0.1 } };
  }
  if (frame < k.l79) return { brows: "sad", lids: 0.5, mouth: "flat", eyes: 1, look: { x: 1, y: 0.05 } };
  if (frame < k.l80) return { brows: "worry", lids: 0.4, mouth: "flat", eyes: 1, look: frame < k.lookUp ? { x: 0.6, y: 0.8 } : frame < k.lookHer ? { x: -0.3, y: -0.8 } : { x: 1, y: 0 } };
  if (frame < k.plug[0]) return { brows: "worry", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 1, y: 0.55 } };
  return { brows: "flat", lids: frame < k.plug[1] ? 0.5 : 0.62, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.3 } };
}

function herFace(frame: number, k: T): Face {
  if (frame < k.handUp[0]) return { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } };
  if (frame < k.shake[0]) return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 1, y: 0.25 } };
  if (frame < k.come) return { brows: "worry", lids: 0, mouth: "flat", eyes: 1.05, look: { x: 1, y: 0.25 } };
  if (frame < k.comeEnd + 4) return { brows: "worry", lids: 0, mouth: "open", eyes: 1.1, look: { x: 1, y: 0.2 } };
  if (frame < k.herEyes) return { brows: "raised", lids: 0.05, mouth: "flat", eyes: 1.05, look: { x: 1, y: 0.25 } };
  if (frame < k.l82) return { brows: "raised", lids: 0.1, mouth: frame >= k.outHere && frame < k.l81 ? "smile" : "flat", eyes: 1.1, look: { x: 1, y: 0.25 } };
  if (frame < k.hereEnd + 4) return { brows: "none", lids: 0.2, mouth: "open", eyes: 1, look: { x: 1, y: 0.25 } };
  if (frame < k.closed) return { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 1, y: 0.3 } };
  return { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0.3 } };
}

const Hall: React.FC<{ frame: number; k: T; on: string }> = ({ frame, k, on }) => {
  const her = herBody(frame, k);
  const hh = headOf(her);
  const hand = handAt(her);
  // you, from the lip's place under a first guess of the camera (the pod drifts with parallax; you sit on it)
  const guess = (c: Camera) => {
    const seat = worldOf(c, LIP.x, LIP.y, 0.85);
    return { x: seat.x, y: seatedY(seat.y, YS) };
  };
  const shake = ramp(frame, k.shake[0], k.shake[1]);
  const youPose: Pose = { ...SEATED, lean: 6, tilt: Math.sin(shake * Math.PI * 2) * 11 * (shake > 0 && shake < 1 ? 1 : 0) + (frame >= k.plug[1] ? 8 : 0) };
  const base = guess({ x: 700, y: 690, zoom: 1.5 });
  const yh0 = headOf({ ...base, scale: YS, facing: 1, pose: youPose });

  const cams: Record<string, Camera> = {
    arrive: camAt(frame, [[k.h0, { x: 780, y: 690, zoom: 1.35 }], [k.youCU, { x: 770, y: 700, zoom: 1.5 }]]),
    youCU: camAt(frame, [[k.youCU, closeUp(yh0.x + 70, yh0.y + 50, 2.3)], [k.come, closeUp(yh0.x + 60, yh0.y + 40, 2.5)]]),
    her: camAt(frame, [[k.come, closeUp(hh.x - 50, hh.y + 30, 2.3)], [k.l77, closeUp(hh.x - 50, hh.y + 30, 2.45)]]),
    two: camAt(frame, [[k.l77, { x: 740, y: 700, zoom: 1.55 }], [k.insetIn, { x: 730, y: 690, zoom: 1.45 }]]),
    inset: camAt(frame, [[k.insetIn, { x: 700, y: 640, zoom: 1.3 }], [k.herFace, { x: 700, y: 640, zoom: 1.38 }]]),
    herFace: camAt(frame, [[k.herFace, closeUp(hh.x - 30, hh.y + 20, 2.5)], [k.hand, closeUp(hh.x - 30, hh.y + 20, 2.65)]]),
    hand: camAt(frame, [[k.hand, insert(hand.x - 30, hand.y - 30, 3.2)], [k.herEyes, insert(hand.x - 30, hand.y - 30, 3.5)]]),
    herEyes: camAt(frame, [[k.herEyes, closeUp(hh.x - 10, hh.y, 2.9)], [k.turn, closeUp(hh.x - 10, hh.y, 3.1)]]),
    stay: { x: 700, y: 640, zoom: 1.32 },
    plugCU: camAt(frame, [[k.l79, closeUp(yh0.x + 50, yh0.y + 70, 2.1)], [k.l80, closeUp(yh0.x + 50, yh0.y + 60, 2.3)]]),
    inThere: camAt(frame, [[k.l80, { x: 560, y: 720, zoom: 2.2 }], [k.outHere, { x: 540, y: 715, zoom: 2.6 }]]),
    outHere: camAt(frame, [[k.outHere, { x: hh.x - 60, y: hh.y + 100, zoom: 2.0 }], [k.l81, { x: hh.x - 60, y: hh.y + 100, zoom: 2.15 }]]),
    decide: camAt(frame, [[k.l81, closeUp(yh0.x + 70, yh0.y + 40, 2.4)], [k.plug[0], closeUp(yh0.x + 80, yh0.y + 30, 2.2)], [k.l82, closeUp(yh0.x + 80, yh0.y + 30, 2.4)]]),
    here: camAt(frame, [[k.l82, closeUp(hh.x - 30, hh.y + 20, 2.5)], [k.pov, closeUp(hh.x - 30, hh.y + 20, 2.6)]]),
    pov: { x: hand.x + 160, y: hand.y - 175, zoom: 2.0 },
    after: camAt(frame, [[k.closed, { x: 620, y: 560, zoom: 1.2 }], [k.closed + 90, { x: 640, y: 570, zoom: 1.3 }]]),
  };
  const cam = drift(cams[on], frame, "offer", on === "hand" ? 1.5 : 3);

  // you on the lip, the plug in your lap, then into the socket under the counter
  const seat = worldOf(cam, LIP.x, LIP.y, 0.85);
  const socket = worldOf(cam, SOCKET.x, SOCKET.y, 0.85);
  const inside = worldOf(cam, POD_ONE.x + 60, POD_ONE.y + 150, 0.85);
  const you: Body = { x: seat.x, y: seatedY(seat.y, YS), scale: YS, facing: 1, pose: youPose };
  const lap = { x: seat.x + 60, y: seat.y - 26 };
  const push = ramp(frame, k.plug[0], k.plug[1]);
  const plugAt = { x: mix(lap.x, socket.x - 18, push), y: mix(lap.y, socket.y, push) };
  you.pose = { ...you.pose, armF: aimArm(you, plugAt), armB: [30, 40] };
  const hatchOpen = frame < k.pov;
  const actors = (
    <>
      <rect x={socket.x - 14} y={socket.y - 16} width={28} height={32} rx={5} fill="#0d0f18" stroke="#3a4363" strokeWidth={3} />
      {hatchOpen && (
        <>
          <Cable d={`M${plugAt.x - 20} ${plugAt.y + 4} C ${plugAt.x - 10} ${plugAt.y + 90}, ${plugAt.x - 30} ${FLOOR - 16}, ${seat.x - 60} ${FLOOR - 18} S ${seat.x - 100} ${seat.y + 10}, ${inside.x + 30} ${inside.y + 20}`} width={7} />
          <You body={you} face={yourFace(frame, k)} frame={frame} />
          <Plug x={plugAt.x} y={plugAt.y} angle={-10 + 10 * push} />
        </>
      )}
      <Mate body={her} face={herFace(frame, k)} frame={frame} apron={false} held={frame >= k.handUp[0] + 4 ? <PalmUp color={FLATMATE.head} /> : undefined} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(podHallLights(), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<PodHallBack cam={cam} frame={frame} door={hatchOpen ? 1 : 0} counter={frame >= k.closed ? { at: k.flutter } : { value: "365" }}
          minutes={frame >= k.tick ? 11 : 10} />}
        actors={actors} />
    </LookContext.Provider>
  );
};

/** Her Offer from the start of its 4 s hold (The Timeline draws this from the end of its last line). */
export const HerOfferScene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot);
  const { frame } = shot;
  const on = current(frame, [[0, "arrive"], [k.youCU, "youCU"], [k.come, "her"], [k.l77, "two"], [k.insetIn, "inset"],
    [k.herFace, "herFace"], [k.hand, "hand"], [k.herEyes, "herEyes"], [k.turn, "stay"], [k.l79, "plugCU"], [k.l80, "inThere"],
    [k.outHere, "outHere"], [k.l81, "decide"], [k.l82, "here"], [k.pov, "pov"], [k.closed, "after"]] as [number, string][]);
  const showInset = on === "inset" || on === "stay" || (on === "plugCU" && frame < k.lookHer);
  let icam = IN_CAMS.full;
  if (on === "stay") icam = mixCam(IN_CAMS.table, IN_CAMS.teacher, ramp(frame, k.turn - 4, k.turn + 10));
  else if (on === "plugCU") icam = IN_CAMS.full;
  else if (frame >= k.stranger) icam = mixCam(IN_CAMS.table, { ...IN_CAMS.door, zoom: 2.4 }, ramp(frame, k.stranger, k.stranger + 12));
  else if (frame >= k.table) icam = mixCam(IN_CAMS.door, IN_CAMS.table, ramp(frame, k.table, k.table + 14));
  else if (frame >= k.guest) icam = mixCam(IN_CAMS.full, IN_CAMS.door, ramp(frame, k.guest, k.guest + 12));
  const insetAt = on === "stay" ? k.turn - 6 : on === "plugCU" ? k.l79 - 30 : k.insetIn;
  const fadeOut = on === "plugCU" ? 1 - ramp(frame, k.lookUp + 10, k.lookHer) : 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Hall frame={frame} k={k} on={on} />
      {showInset && fadeOut > 0 && (
        <AbsoluteFill style={{ opacity: fadeOut }}>
          <TableInset frame={frame} at={insetAt} x={on === "plugCU" ? 560 : 800} y={on === "plugCU" ? 300 : 370} cam={icam}
            scale={on === "plugCU" ? 0.6 : 1}
            guest={on === "stay" || on === "plugCU" ? 1 : ramp(frame, k.guest, k.guest + 8)}
            guestDown={on === "stay" || on === "plugCU" ? 1 : ramp(frame, k.stranger + 6, k.stranger + 30)}
            turn={on === "stay" || on === "plugCU" ? ramp(frame, k.turn + 2, k.stay) : 0} stay={frame >= k.stay && frame < k.stayEnd + 6} />
        </AbsoluteFill>
      )}
      {on === "pov" && <PodInside shut={ramp(frame, k.pov + 4, k.closed)} />}
      <Sequence from={k.plug[1] - 2} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.pov + 2} durationInFrames={50}><Audio src={staticFile("sfx/hatch.wav")} volume={0.8} /></Sequence>
      <CounterSound at={k.flutter} />
      <TickSound at={k.tick} />
    </AbsoluteFill>
  );
};

export const herOffer: Beat = { id: "HerOffer", firstLine: FIRST, Component: HerOfferScene };
