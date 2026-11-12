// Beat "Two Letters" (script.md, ## [08:36] Two Letters; narration lines 113-119). Morning at the fridge: Ji-yoon
// unpins the calendar, and behind it is her own letter, yellowed; she tapes yours beside it. You don't say it, and you
// don't pull back. The brushes stay in the jar. Then the door: Min-jun with a letter of his own; a paper snap above
// YOUR head, out of frame (your point of view); his grin stops, his eyes go up and read. Never the number. End card.
//
//   113  the kitchen, morning; she unpins the calendar (her back arm); INSERT her letter, yellowed.
//   114  she moves yours beside hers and tapes it; close on her; close on you in the doorway; you come in.
//   115  INSERT the jar of brushes in the morning light.     116  the two of you; she glances at you, a half-second.
//   117  close on her, looking at the jar.                    hold  the two letters, the jar, her hand flat on the door.
//   118  the front door: Min-jun, grinning, his own letter; he says it.
//   hold your point of view: the snap above you; his grin stops; his eyes go up and read.
//   119  + hold: the end card: the two of you at the fridge in the left third, the tags in the middle, the right third quiet.
import { AbsoluteFill } from "remotion";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt, MeterSound } from "../parts";
import { Calendar, HOME, HomeBack, HomeTable } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, handAt, mixArm, Sister, talk, You, type Body, type Face } from "./HerBack.Sister";
import { EndTags, MinJun } from "./TwoLetters.EndCard";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const snap = lineEnd(clips, 118) + 10;
  return {
    start,
    end,
    unpinShot: at(113, 0.2), // "she unpins the calendar"
    reach: [at(113, 0.22), at(113, 0.3)] as const,
    lift: [at(113, 0.32), at(113, 0.46)] as const,
    hers: at(113, 0.6), // "a letter. Hers. Six years old."
    tapeShot: from(114) - 2, // "She tapes yours beside it"
    step: at(113, 0.95), // she steps in at the fridge's edge, for the tape
    peel: [from(114) + 2, at(114, 0.08)] as const,
    move: [at(114, 0.08), at(114, 0.18)] as const,
    press: at(114, 0.2),
    back: [at(114, 0.24), at(114, 0.34)] as const,
    herFace: at(114, 0.26), // "she doesn't ask"
    youFace: at(114, 0.5), // "you don't say it"
    comeIn: at(114, 0.74), // "and you don't pull back"
    walk: [at(114, 0.76), at(115, 0.2)] as const,
    jar: from(115) - 2, // "The brushes stay in the jar."
    two: from(116) - 2, // "Tomorrow someone you love will pause half a second"
    glance: [at(116, 0.34), at(116, 0.52)] as const,
    her117: from(117) - 2, // "That half-second is the other life, going past."
    flat: at(117, 0.3),
    letters: lineEnd(clips, 117) + 2, // the 2 s hold
    door: from(118) - 2, // "Then the door."
    open: [from(118), from(118) + 8] as const,
    letterUp: at(118, 0.46), // "a letter of his own"
    says: [at(118, 0.82), lineEnd(clips, 118)] as const, // "he says it"
    snap, // the 3 s hold: the snap above your head
    stop: snap + 5,
    up: snap + 12,
    card: from(119) - 2, // "So, would you still say it to her face?"
    comment: Math.round(clips[119].from + clips[119].frames * 0.36), // "Tell us in the comments"
    like: Math.round(clips[119].from + clips[119].frames * 0.73), // "hit like"
    subscribe: Math.round(clips[119].from + clips[119].frames * 0.81), // "and subscribe"
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.15;
const FLOOR = HOME.floor;
const HER_X = HOME.spots.fridge.x;
const HER_TAPE = 1405;
const YOU_DOOR = HOME.doorway.x;
const YOU_IN = 1600;
const MJ_X = HOME.frontDoor.x;
const ME_X = 440;
const HER_HEAD = headAt(HER_X, FLOOR, S, STAND, -1);
const YOU_HEAD = headAt(YOU_DOOR, FLOOR, S, STAND, -1);
const MJ_HEAD = headAt(MJ_X, FLOOR, S, STAND, 1);

/** Her at the fridge: reaching up to unpin the calendar (back arm: a front arm raised facing left would cross her
 *  face), stepping in to move and tape your letter, then her hand flat on the door. Returns her body and the props. */
function herAt(frame: number, k: T) {
  const stepIn = ramp(frame, k.step - 10, k.step) * (1 - ramp(frame, k.back[0], k.back[1]));
  const x = mix(HER_X, HER_TAPE, stepIn);
  const moving = stepIn > 0 && stepIn < 1;
  const body: Body = { x, y: FLOOR, scale: S, facing: -1, pose: moving ? walkPose(frame * 0.3) : { ...STAND, lean: 8 } };
  const cal = HOME.calendar;
  const top = { x: cal.x, y: cal.y - 76 };
  // the calendar: pinned, lifted off by its top, then down at her side
  const lift = ramp(frame, k.lift[0], k.lift[1]);
  let armB = body.pose.armB;
  let calendar: { x: number; y: number; tilt: number } | null = null;
  if (frame < k.lift[1] + 4) {
    const reach = ramp(frame, k.reach[0], k.reach[1]);
    const target = { x: mix(top.x, HER_X - 70, lift), y: mix(top.y, FLOOR - 250, lift) };
    armB = mixArm(STAND.armB, aimArm(body, target), reach);
    if (frame >= k.lift[0]) calendar = { x: target.x, y: target.y + 76, tilt: mix(0, -14, lift) };
  }
  // your letter: peeled off at HOME.yours, moved beside hers, pressed; the hand drops; later flat on the door
  let yours: { x: number; y: number; tilt: number; tapes?: number } | null = HOME.yours;
  if (frame >= k.peel[0]) {
    const m = ramp(frame, k.move[0], k.move[1]);
    const b = HOME.beside;
    yours = { x: mix(HOME.yours.x, b.x, m), y: mix(HOME.yours.y, b.y, m), tilt: mix(HOME.yours.tilt, b.tilt, m), tapes: frame >= k.press ? 2 : 1 };
    const on = ramp(frame, k.peel[0], k.peel[1]) * (1 - ramp(frame, k.back[0], k.back[1]));
    armB = mixArm(armB, aimArm(body, { x: yours.x + 10, y: yours.y - 70 }), on);
  }
  body.pose = { ...body.pose, armB };
  // the calendar down at her side in her near hand, then leant on the counter while she tapes; later her near hand
  // flat on the fridge door (it stays under her chin, so it does not cross her face)
  if (frame >= k.flat) body.pose = { ...body.pose, armF: mixArm(STAND.armF, aimArm(body, { x: 1418, y: 806 }), ramp(frame, k.flat, k.flat + 14)) };
  const calAtSide = frame >= k.peel[0] ? { x: 960, y: 600, tilt: -5 } : frame >= k.lift[1] + 4 ? (() => {
    const h = handAt(body, "front");
    return { x: h.x - 6, y: h.y + 70, tilt: 4 };
  })() : null;
  return { body, calendar: calendar ?? calAtSide, yours };
}

/** Your place: in the doorway, then a few steps in towards her. */
function youAt(frame: number, k: T): Body {
  const p = ramp(frame, k.walk[0], k.walk[1]);
  return { x: mix(YOU_DOOR, YOU_IN, p), y: FLOOR, scale: S, facing: -1, pose: p > 0 && p < 1 ? walkPose(frame * 0.3) : STAND };
}

// ------------------------------------------------------------------------------------------------ scenes

/** The kitchen in the morning: the fridge, her, you. The calendar she carries is drawn after her. */
const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; you: Face; her: Face }> = ({ frame, k, cam, you, her }) => {
  const h = herAt(frame, k);
  const actors = (
    <>
      <HomeTable bowl={false} />
      <Sister body={h.body} face={her} frame={frame} duty="off" />
      {h.calendar && <Calendar x={h.calendar.x} y={h.calendar.y} tilt={h.calendar.tilt} scale={0.92} />}
      <You body={youAt(frame, k)} face={you} frame={frame} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} actors={actors}
      back={<HomeBack cam={cam} mood="morning" frame={frame} calendar={frame < k.lift[0]} yours={h.yours} />} />
  );
};

/** The front door: Min-jun on the threshold; you inside (left out in the point-of-view shot). */
const Door: React.FC<{ frame: number; k: T; cam: Camera; mj: Face; you: Face; showYou: boolean }> = ({ frame, k, cam, mj, you, showYou }) => {
  const open = ramp(frame, k.open[0], k.open[1]);
  const body: Body = { x: MJ_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const up = ramp(frame, k.letterUp - 6, k.letterUp + 6) * (1 - ramp(frame, k.stop + 6, k.stop + 22));
  body.pose = { ...STAND, armF: mixArm(STAND.armF, aimArm(body, { x: MJ_X + 80, y: FLOOR - 270 }), up) };
  const me: Body = { x: ME_X, y: FLOOR, scale: S, facing: -1, pose: STAND };
  const actors = (
    <>
      {open > 0.3 && <MinJun body={body} face={mj} frame={frame} letter={1} />}
      {showYou && <You body={me} face={you} frame={frame} />}
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="morning" frame={frame} door={open} />} actors={actors} />;
};

/** The end card's tableau: the two of you at the fridge, small, in the left third. */
const Tableau: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.card, { x: 1960, y: 545, zoom: 1.0 }], [k.end, { x: 1930, y: 555, zoom: 1.04 }]]);
  const her: Body = { x: HER_X, y: FLOOR, scale: S, facing: -1, pose: { ...STAND, lean: 4 } };
  const me: Body = { x: YOU_IN - 30, y: FLOOR, scale: S, facing: -1, pose: STAND };
  const actors = (
    <>
      <Sister body={her} face={{ brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } }} frame={frame} duty="off" />
      <You body={me} face={{ brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } }} frame={frame} />
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} actors={actors}
        back={<HomeBack cam={cam} mood="morning" frame={frame} calendar={false} yours={{ ...HOME.beside, tapes: 2 }} />} />
      <EndTags frame={frame} comment={k.comment} like={k.like} subscribe={k.subscribe} />
    </AbsoluteFill>
  );
};

const TwoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.unpinShot, "unpin"], [k.hers, "hers"], [k.tapeShot, "tape"], [k.herFace, "herFace"],
    [k.youFace, "youFace"], [k.comeIn, "comeIn"], [k.jar, "jar"], [k.two, "two"], [k.her117, "her117"], [k.letters, "letters"],
    [k.door, "door"], [k.snap - 2, "pov"], [k.card, "card"]]);
  if (shot === "card") return <Tableau frame={frame} k={k} />;
  const herHead = { x: HER_HEAD.x, y: HER_HEAD.y };
  const cams: Record<Exclude<typeof shot, "card">, Camera> = {
    wide: camAt(frame, [[k.start, { x: 1460, y: 580, zoom: 1.1 }], [k.unpinShot, { x: 1440, y: 590, zoom: 1.2 }]]),
    unpin: camAt(frame, [[k.unpinShot, { x: 1340, y: 650, zoom: 2.05 }], [k.hers, { x: 1350, y: 660, zoom: 2.2 }]]),
    hers: camAt(frame, [[k.hers, insert(HOME.hers.x, HOME.hers.y - 50, 4.4)], [k.tapeShot, insert(HOME.hers.x, HOME.hers.y - 50, 4.8)]]),
    tape: camAt(frame, [[k.tapeShot, { x: 1320, y: 700, zoom: 2.9 }], [k.herFace, { x: 1320, y: 700, zoom: 3.0 }]]),
    herFace: camAt(frame, [[k.herFace, closeUp(herHead.x - 30, herHead.y, 2.6)], [k.youFace, closeUp(herHead.x - 30, herHead.y, 2.8)]]),
    youFace: camAt(frame, [[k.youFace, closeUp(YOU_HEAD.x - 40, YOU_HEAD.y, 2.6)], [k.comeIn, closeUp(YOU_HEAD.x - 40, YOU_HEAD.y, 2.8)]]),
    comeIn: camAt(frame, [[k.comeIn, { x: 1600, y: 640, zoom: 1.6 }], [k.jar, { x: 1560, y: 640, zoom: 1.7 }]]),
    jar: camAt(frame, [[k.jar, insert(HOME.jar.x + 30, 540, 3.1)], [k.two, insert(HOME.jar.x + 30, 530, 3.4)]]),
    two: camAt(frame, [[k.two, { x: 1500, y: 620, zoom: 1.9 }], [k.her117, { x: 1500, y: 620, zoom: 2.05 }]]),
    her117: camAt(frame, [[k.her117, closeUp(herHead.x - 60, herHead.y, 2.6)], [k.letters, closeUp(herHead.x - 60, herHead.y, 2.85)]]),
    letters: camAt(frame, [[k.letters, { x: 1260, y: 650, zoom: 2.25 }], [k.door, { x: 1260, y: 650, zoom: 2.45 }]]),
    door: camAt(frame, [[k.door, { x: 470, y: 600, zoom: 1.45 }], [k.snap, { x: 450, y: 600, zoom: 1.55 }]]),
    pov: camAt(frame, [[k.snap - 2, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.5)], [k.card, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.8)]]),
  };
  const cam = drift(cams[shot], frame, "twoletters", 3);
  if (shot === "door" || shot === "pov") {
    const reading = frame >= k.up + 16 ? Math.sin((frame - k.up) / 7) * 0.18 : 0;
    const mj: Face = frame < k.stop
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.says[0], k.says[1], "smile"), eyes: 1.1, look: { x: 1, y: 0 } }
      : frame < k.up
        ? { brows: "none", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: 0 } }
        : frame < k.up + 16
          ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: 0.6, y: -1 } }
          : { brows: "worry", lids: 0.1, mouth: "o", eyes: 1.15, look: { x: 0.55 + reading, y: -1 } };
    const you: Face = { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 1, y: 0 } };
    return <Door frame={frame} k={k} cam={cam} mj={mj} you={you} showYou={shot === "door"} />;
  }
  // Her: calm at the fridge; the glance at you; looking at the jar. You: quiet in the doorway, then in beside her.
  const glance = frame >= k.glance[0] && frame < k.glance[1];
  const her: Face = glance
    ? { brows: "raised", lids: 0.15, mouth: "flat", eyes: 1, look: { x: -1, y: 0 } }
    : frame >= k.her117
      ? { brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 1, y: 0.2 } }
      : { brows: "none", lids: 0.2, mouth: frame >= k.herFace ? "smile" : "flat", eyes: 1, look: { x: 1, y: -0.05 } };
  const you: Face = frame < k.comeIn
    ? { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0.05 } }
    : { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 1, y: 0.1 } };
  return <Kitchen frame={frame} k={k} cam={cam} you={you} her={her} />;
};

const TwoLetters: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TwoShot frame={shot.frame} k={k} />
      <MeterSound at={k.snap} />
    </AbsoluteFill>
  );
};

export const twoLetters: Beat = { id: "TwoLetters", firstLine: 113, Component: TwoLetters };
