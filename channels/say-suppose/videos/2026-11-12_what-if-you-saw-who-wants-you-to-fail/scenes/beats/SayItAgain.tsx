// Beat "Say It Again" (script.md, ## [05:15] Say It Again; narration lines 69-80). The cost. The second letter; you run
// home instead of the store; Ji-yoon at the table on a night off, hair down. You say it to her face: her card opens
// (soft snap) and runs to -68. Her arms round you; you go stiff; "Say it again", twice; you can't. You take your bag and
// go, and her hands stay half up.
//
//   69  INSERT the letter held up on the landing; the seal stamps on "paid"; the hands go still on "if the exam holds".
//   70  you run past the store's white light; the front door bursts open and you're in; the bag drops.
//   71  the room: she looks up from her bowl; she stands and comes to you; close on her face: the card, -68.
//   72  close on you (the reaction); the hug.
//   73  close on you over her head, eyes on the card: "Say it again."
//   74  INSERT the card; tilt down to the two of you.
//   hold over your face under the number; the jar of brushes behind her, the lamp; her arms tighten.
//   75  the two, full length: you rigid.          76  close on her at your shoulder: "Say it again."
//   77  close on you: you can't.                    78  the room; the paper sheet (c09).
//   79  the card; her hands on your back.           80  you step back (the card folds), take your bag, go; her alone.
import { AbsoluteFill } from "remotion";
import { Chair, seatedY } from "@whatif/kit/sets/common";
import { lerpPose, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Backpack } from "@whatif/kit/sets/props";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt, Letter, Meter, MeterSound } from "../parts";
import { HOME, HOME_LAMP, HomeBack, HomeTable } from "../sets/Home";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, ArmOver, handAt, hug, Sister, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";
import { CouplesSheet, LetterInsert, NightRun } from "./SayItAgain.Parts";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    start,
    end,
    stamp: at(69, 0.46), // "Four years, paid"
    holds: at(69, 0.7), // "If the exam holds"
    run: from(70) - 2, // "For once you run home"
    doorIn: at(70, 0.45), // "instead of the store": the front door bursts open
    inside: at(70, 0.85) + 4,
    table: from(71) - 2, // "Ji-yoon's at the table"
    look: from(71) + 8,
    rise: [at(71, 0.36), at(71, 0.62)] as const, // "A night off": she stands and comes to you
    face: at(71, 0.64), // "You say it to her face"
    sayIt: [at(71, 0.67), lineEnd(clips, 71)] as const,
    tag: at(71, 0.72),
    react: from(72) - 2, // "Both arms round you"
    hug: [at(72, 0.05), at(72, 0.42)] as const,
    hugShot: at(72, 0.34),
    again1: [from(73), lineEnd(clips, 73)] as const, // "Say it again."
    you73: from(73) - 2,
    card: from(74) - 2, // "Minus sixty-eight."
    tilt: at(74, 0.28), // "Over the one person who ever asked to hear it twice"
    hold: lineEnd(clips, 74) + 2, // the 3 s hold: your face under the number
    jar: Math.round((lineEnd(clips, 74) + from(75)) / 2), // the jar behind her, the lamp
    stiff: from(75) - 2, // "You go stiff in the hug."
    her76: from(76) - 2, // "Say it again."
    again2: [from(76), lineEnd(clips, 76)] as const,
    cant: from(77) - 2, // "You can't."
    room: from(78) - 2, // "It's been measured."
    sheet: at(78, 0.17), // "Couples whose partner meets good news with enthusiasm"
    card2: from(79) - 2, // "You just watched a tag say"
    arms: at(79, 0.5), // "what her arms didn't"
    back: from(80) - 2, // "You take your bag."
    fold: from(80) + 10, // you step out of the hug; the card folds
    step: [from(80), at(80, 0.12)] as const,
    toBag: [at(80, 0.12), at(80, 0.24)] as const,
    pick: [at(80, 0.24), at(80, 0.33)] as const,
    toDoor: [at(80, 0.33), at(80, 0.52)] as const,
    out: [at(80, 0.52), at(80, 0.57)] as const,
    shut: [at(80, 0.57), at(80, 0.64)] as const,
    leave: at(80, 0.1),
    alone: at(80, 0.56), // "Not that night. Not for a month."
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.15;
const FLOOR = HOME.floor;
const YOU_X = 560;
const HER_X = 690;
const SEAT_Y = seatedY(HOME.chair.seatTop, S);
const DOOR_X = HOME.frontDoor.x;
const BAG = HOME.bag;
/** The card hangs where her head was when she stood facing you, so the hug does not push it into your face. */
const CARD = headAt(HER_X, FLOOR, S, STAND, -1);
const YOU_HEAD = headAt(YOU_X, FLOOR, S, STAND, 1);

/** How far into the hug at this frame (her) and whether you have stepped back. */
function hugAmount(frame: number, k: T) {
  const her = ramp(frame, k.hug[0], k.hug[1]) * mix(1, 0.55, ramp(frame, k.step[0], k.step[1]));
  const you = ramp(frame, k.hug[0], k.hug[1]) * (1 - ramp(frame, k.step[0], k.step[1]));
  return { her, you };
}

/** Where you are and how you stand, from the door to the hug and back out of the door. */
function yourBody(frame: number, k: T): { body: Body; visible: boolean; carrying: boolean; opacity: number } {
  let x: number = DOOR_X, pose: Pose = STAND, carrying = true, visible = frame >= k.doorIn + 4;
  if (frame < k.inside) {
    x = mix(DOOR_X, BAG.x, ramp(frame, k.doorIn + 4, k.inside));
    pose = walkPose(frame * 0.5);
  } else if (frame < k.rise[0] + 6) {
    x = BAG.x;
    carrying = false;
    pose = { ...STAND, lean: 8 + Math.sin(frame / 5) * 2 };
  } else if (frame < k.step[0]) {
    const p = ramp(frame, k.rise[0] + 6, k.face - 4);
    x = mix(BAG.x, YOU_X, p);
    carrying = false;
    pose = p > 0 && p < 1 ? walkPose(frame * 0.3) : STAND;
  } else if (frame < k.toBag[0]) {
    x = mix(YOU_X, YOU_X - 40, ramp(frame, k.step[0], k.step[1]));
    carrying = false;
  } else if (frame < k.pick[0]) {
    const p = ramp(frame, k.toBag[0], k.toBag[1]);
    x = mix(YOU_X - 40, BAG.x + 50, p);
    carrying = false;
    pose = p < 1 ? walkPose(frame * 0.3) : STAND;
  } else if (frame < k.toDoor[0]) {
    x = BAG.x + 50;
    const b = Math.sin(linear(frame, k.pick[0], k.pick[1]) * Math.PI);
    pose = { ...STAND, lean: 34 * b, drop: 10 * b };
    carrying = frame >= (k.pick[0] + k.pick[1]) / 2;
  } else {
    const p = ramp(frame, k.toDoor[0], k.toDoor[1]);
    x = mix(BAG.x + 50, DOOR_X, p);
    pose = p < 1 ? walkPose(frame * 0.3) : STAND;
  }
  const facing: 1 | -1 = frame >= k.toBag[0] ? -1 : 1;
  const body: Body = { x, y: FLOOR, scale: S, facing, pose };
  if (frame >= k.pick[0] && frame < k.toDoor[0]) {
    body.pose = { ...pose, armB: aimArm(body, { x: BAG.x, y: FLOOR - 140 * ramp(frame, (k.pick[0] + k.pick[1]) / 2, k.pick[1]) - 20 }) };
  }
  if (frame >= k.face - 4 && frame < k.hug[0] + 4) {
    const up = ramp(frame, k.face - 4, k.face + 6) * (1 - ramp(frame, k.hug[0] - 4, k.hug[0] + 4));
    body.pose = { ...body.pose, armF: aimArm(body, { x: x + mix(40, 84, up), y: FLOOR - mix(140, 206, up) }) };
  }
  const opacity = 1 - ramp(frame, k.out[0], k.out[1]);
  if (frame >= k.out[1]) visible = false;
  return { body, visible, carrying, opacity };
}

/** Where Ji-yoon is: seated at her bowl, rising and turning, stepping to you, in the hug, left with her hands half up. */
function herBody(frame: number, k: T): Body {
  const rise = ramp(frame, k.rise[0], k.rise[0] + 14);
  const step = ramp(frame, k.rise[0] + 14, k.rise[1]);
  if (frame < k.rise[0]) {
    const body: Body = { x: HOME.chair.x, y: SEAT_Y, scale: S, facing: 1, pose: SEATED };
    const spoon = frame < k.look ? Math.abs(Math.sin(frame / 14)) : 0;
    body.pose = { ...SEATED, armF: aimArm(body, { x: mix(HOME.bowl.x - 10, HOME.chair.x + 60, spoon), y: mix(HOME.table.top - 34, SEAT_Y - 268, spoon) }) };
    return body;
  }
  if (step <= 0) {
    return { x: mix(HOME.chair.x, 760, rise), y: mix(SEAT_Y, FLOOR, rise), scale: S, facing: rise < 0.5 ? 1 : -1, pose: lerpPose(SEATED, STAND, rise) };
  }
  const x = mix(760, HER_X, step);
  return { x, y: FLOOR, scale: S, facing: -1, pose: step < 1 ? walkPose(frame * 0.3) : STAND };
}

// ------------------------------------------------------------------------------------------------ the room

const Room: React.FC<{ frame: number; k: T; cam: Camera; you: Face; her: Face }> = ({ frame, k, cam, you, her }) => {
  const look = useGlows(cam, [HOME_LAMP]);
  const y = yourBody(frame, k);
  const amt = hugAmount(frame, k);
  let sis = herBody(frame, k);
  let yb = y.body;
  if (frame >= k.hug[0] - 2) {
    const shake = frame < k.step[0] ? 1 : 0;
    const squeeze = ramp(frame, k.hold, k.hold + 24) * (1 - ramp(frame, k.step[0] - 10, k.step[0]));
    const h = hug({ youX: YOU_X, herX: HER_X, floor: FLOOR, scale: S, t: amt.her, hold: 0, squeeze, shake: shake * 0.3, frame });
    sis = h.her;
    if (frame < k.step[0]) yb = { ...h.you, pose: { ...h.you.pose, lean: h.you.pose.lean - 3 * ramp(frame, k.stiff, k.stiff + 12) } };
  }
  const door = ramp(frame, k.doorIn, k.doorIn + 7) * (1 - ramp(frame, k.inside, k.inside + 14)) + ramp(frame, k.toDoor[1] - 8, k.out[0]) * (1 - ramp(frame, k.shut[0], k.shut[1]));
  const bagHand = handAt(yb, "back");
  const held = frame < k.toBag[0] ? <Letter x={0} y={12} scale={0.36} tilt={-6} /> : undefined;
  const actors = (
    <>
      <Chair x={HOME.chair.x} y={HOME.chair.seatTop} scale={1.1} />
      {!y.carrying && frame >= k.inside && <Backpack x={BAG.x} y={BAG.y} scale={0.7} color="#3d6fb0" />}
      <Sister body={sis} face={her} frame={frame} duty="off" />
      <HomeTable steam={1} frame={frame} />
      {y.visible && (
        <g opacity={y.opacity}>
          <You body={yb} face={you} frame={frame} held={held} />
        </g>
      )}
      {amt.you > 0.05 && <ArmOver body={sis} hand="#f0a98e" />}
      {y.carrying && y.visible && frame >= k.doorIn && (
        <g opacity={y.opacity}><Backpack x={bagHand.x} y={bagHand.y + 120 * 0.6} scale={0.6} color="#3d6fb0" /></g>
      )}
      <Meter frame={frame} at={k.tag} x={CARD.x} headY={CARD.y} r={CARD.r} value={-68} until={k.fold} />
      {frame >= k.sheet && frame < k.card2 && <CouplesSheet frame={frame} at={k.sheet} x={1150} y={470} />}
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="lamp" frame={frame} door={door} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the shots

const SayShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "letter"], [k.run, "run"], [k.doorIn, "door"], [k.table, "table"], [k.rise[0], "rise"],
    [k.face, "face"], [k.react, "react"], [k.hugShot, "hug"], [k.you73, "you73"], [k.card, "card"], [k.tilt, "tilt"], [k.hold, "ots"],
    [k.jar, "jar"], [k.stiff, "stiff"], [k.her76, "her76"], [k.cant, "cant"], [k.room, "room"], [k.sheet, "sheet"], [k.card2, "card2"],
    [k.arms, "arms"], [k.back, "back"], [k.leave, "leave"], [k.alone, "alone"]]);
  if (shot === "letter") {
    const cam = drift(camAt(frame, [[k.start, { x: 960, y: 560, zoom: 1 }], [k.run, { x: 960, y: 580, zoom: 1.12 }]]), frame, "letter", 4);
    return <LetterInsert frame={frame} cam={cam} rise={k.start} stamp={k.stamp} holds={k.holds} />;
  }
  if (shot === "run") return <NightRun frame={frame} p={linear(frame, k.run, k.doorIn)} />;
  const hugHead = headAt(HER_X, FLOOR, S, { ...STAND, lean: 22, drop: 14 }, -1);
  const herHand = { x: YOU_X - 25, y: FLOOR - 196 * S };
  const cams: Record<Exclude<typeof shot, "letter" | "run">, Camera> = {
    door: camAt(frame, [[k.doorIn, { x: 430, y: 600, zoom: 1.5 }], [k.table, { x: 470, y: 610, zoom: 1.55 }]]),
    table: camAt(frame, [[k.table, { x: 640, y: 590, zoom: 1.22 }], [k.rise[0], { x: 660, y: 600, zoom: 1.32 }]]),
    rise: camAt(frame, [[k.rise[0], { x: 640, y: 610, zoom: 1.6 }], [k.face, { x: 630, y: 620, zoom: 1.75 }]]),
    face: camAt(frame, [[k.face, closeUp(CARD.x - 30, CARD.y - 20, 2.3)], [k.react, closeUp(CARD.x - 30, CARD.y - 30, 2.55)]]),
    react: camAt(frame, [[k.react, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y - 10, 2.5)], [k.hugShot, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y - 10, 2.7)]]),
    hug: camAt(frame, [[k.hugShot, { x: 630, y: 600, zoom: 1.85 }], [k.you73, { x: 630, y: 600, zoom: 2.0 }]]),
    you73: camAt(frame, [[k.you73, { x: YOU_HEAD.x + 70, y: YOU_HEAD.y - 40, zoom: 2.6 }], [k.card, { x: YOU_HEAD.x + 70, y: YOU_HEAD.y - 50, zoom: 2.8 }]]),
    card: camAt(frame, [[k.card, insert(CARD.x, CARD.y - 120, 4.2)], [k.tilt, insert(CARD.x, CARD.y - 115, 4.6)]]),
    tilt: camAt(frame, [[k.tilt, insert(CARD.x, CARD.y - 110, 3.4)], [k.hold, { x: 630, y: 640, zoom: 2.2 }]]),
    ots: camAt(frame, [[k.hold, closeUp(YOU_HEAD.x + 60, YOU_HEAD.y - 30, 2.9)], [k.jar, closeUp(YOU_HEAD.x + 60, YOU_HEAD.y - 30, 3.15)]]),
    jar: camAt(frame, [[k.jar, { x: 870, y: 590, zoom: 2.05 }], [k.stiff, { x: 900, y: 585, zoom: 2.2 }]]),
    stiff: camAt(frame, [[k.stiff, { x: 630, y: 680, zoom: 1.55 }], [k.her76, { x: 630, y: 670, zoom: 1.65 }]]),
    her76: camAt(frame, [[k.her76, closeUp(hugHead.x + 10, hugHead.y - 10, 3.0)], [k.cant, closeUp(hugHead.x + 10, hugHead.y - 10, 3.25)]]),
    cant: camAt(frame, [[k.cant, closeUp(YOU_HEAD.x + 20, YOU_HEAD.y, 3.0)], [k.room, closeUp(YOU_HEAD.x + 20, YOU_HEAD.y, 3.3)]]),
    room: camAt(frame, [[k.room, { x: 780, y: 560, zoom: 1.08 }], [k.sheet, { x: 790, y: 565, zoom: 1.15 }]]),
    sheet: camAt(frame, [[k.sheet, { x: 860, y: 570, zoom: 1.5 }], [k.card2, { x: 880, y: 565, zoom: 1.58 }]]),
    card2: camAt(frame, [[k.card2, insert(CARD.x, CARD.y - 90, 3.4)], [k.arms, insert(CARD.x - 20, CARD.y - 60, 3.0)]]),
    arms: camAt(frame, [[k.arms, insert(herHand.x + 30, herHand.y, 3.2)], [k.back, insert(herHand.x + 30, herHand.y, 3.5)]]),
    back: camAt(frame, [[k.back, { x: 600, y: 630, zoom: 1.8 }], [k.leave, { x: 590, y: 630, zoom: 1.8 }]]),
    leave: camAt(frame, [[k.leave, { x: 470, y: 600, zoom: 1.32 }], [k.alone, { x: 450, y: 600, zoom: 1.38 }]]),
    alone: camAt(frame, [[k.alone, { x: 840, y: 610, zoom: 1.75 }], [k.end, { x: 800, y: 620, zoom: 2.0 }]]),
  };
  const cam = drift(cams[shot], frame, "sayitagain", 3);

  // You: bursting in; grinning, saying it; the reaction; stiff under the number; you can't; you go.
  const you: Face = frame < k.face
    ? { brows: "raised", lids: 0, mouth: frame < k.rise[0] ? "open" : "smile", eyes: 1.12, look: { x: 1, y: 0 } }
    : frame < k.tag + 10
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.sayIt[0], k.tag + 8, "smile"), eyes: 1.12, look: { x: 1, y: -0.1 } }
      : frame < k.react + 14
        ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.7, y: -0.8 } }
        : frame < k.cant
          ? { brows: "flat", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 0.6, y: -0.85 } }
          : frame < k.back
            ? { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }
            : { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.4 } };
  // Her: at her bowl; she hears the door; up and glad; glad and hurt at once; eyes shut in the hug; left standing.
  const her: Face = frame < k.look
    ? { brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.6 } }
    : frame < k.rise[0]
      ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: -0.9, y: 0 } }
      : frame < k.tag
        ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 1, y: 0 } }
        : frame < k.hug[0]
          ? { brows: "worry", lids: 0.2, mouth: "smile", eyes: 1.05, look: { x: 1, y: -0.05 } }
          : frame < k.back
            ? { brows: "worry", lids: 0.85, mouth: frame < k.again2[0] ? talk(frame, k.again1[0], k.again1[1], "smile") : talk(frame, k.again2[0], k.again2[1], "smile"), eyes: 1, look: { x: 1, y: 0.3 } }
            : frame < k.alone
              ? { brows: "worry", lids: 0.1, mouth: "o", eyes: 1.1, look: { x: 1, y: 0 } }
              : { brows: "sad", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 1, y: 0.25 } };
  return (
    <>
      <Room frame={frame} k={k} cam={cam} you={you} her={her} />
      {shot === "ots" && <ForegroundHead x={1700} side="right" blur={18} />}
    </>
  );
};

const SayItAgain: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SayShot frame={shot.frame} k={k} />
      <MeterSound at={k.tag} soft />
    </AbsoluteFill>
  );
};

export const sayItAgain: Beat = { id: "SayItAgain", firstLine: 69, Component: SayItAgain };
