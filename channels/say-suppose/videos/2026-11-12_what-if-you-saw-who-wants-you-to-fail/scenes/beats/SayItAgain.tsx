// Beat "Say It Again" (script.md v3, ## Say It Again; narration lines 89-96). The cost. The second letter; you run
// home instead of to the store; your sister at the table on a night off, hair down. You say it to her face: her card
// opens (soft snap) and runs to -68. Two performed moments, the narrator silent. You can't say it again; you take your
// bag and go, and her hands stay half up.
//
//   89   INSERTS on the landing, one pair of hands lowering each paper and raising the next (SayItAgain.Pages.tsx; outside
//        review of v4.1: twelve seconds of one letter read as a slide): the letter, sealed on "confirmed"; the year pad
//        flipping YEAR 1 to 4 on "four years"; the tuition bill struck through, PAID; the answer sheet stamped TOP GRADES
//        REQUIRED. The run starts on "three weeks from now".
//   90   you run past the store's white light; the front door bursts open and you're in; the bag drops.
//   91   the room: she looks up from her bowl; you come to the table; close on her face: the card snaps on "face".
//   hold (4 s, performed) she's up before you finish, the chair tipping; both arms round you, her face in your scarf;
//        over her shoulder the card stops on -68; your arms, half raised, hang there.
//   92   close on her at your shoulder, her own voice: "Say it again..."
//   hold (3 s, performed) her arms tighten, yours don't close (your fingers almost close round her and fall back); your
//        eyes don't leave the card; the lamp and the jar. Through the hug her grip tightens on each "Say it again" and
//        her shoulders shake a little; on "You can't" your hands drop to your sides (outside review of v4.1).
//   93   the card over the two of you, the hug framed under it; tilt down.   94  close on her: "Say it again..."
//   95   close on you: you can't; the card; her hands on your back.
//   96   you step back (the card folds), take your bag, go; her alone.
import { AbsoluteFill } from "remotion";
import { Chair, seatedY } from "@whatif/kit/sets/common";
import { lerpPose, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Backpack } from "@whatif/kit/sets/props";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt, Letter, Meter, MeterSound } from "../parts";
import { HOME, HOME_LAMP, HomeBack, HomeTable } from "../sets/Home";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, ArmOver, handAt, hug, mixArm, Sister, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";
import { ScholarshipInsert, type LetterBeats } from "./SayItAgain.Pages";
import { NightRun } from "./SayItAgain.Parts";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const hold4 = lineEnd(clips, 91) + 2; // performed: she's up, the hug, the card stops, your arms hang
  const g4 = from(92) - hold4;
  const hold3 = lineEnd(clips, 92) + 2; // performed: her arms tighten, yours don't close, the card, the lamp, the jar
  const g3 = from(93) - hold3;
  return {
    start,
    end,
    letter: {
      rise: start,
      seal: at(89, 0.25), // "The scholarship is confirmed."
      years: at(89, 0.33), // "Four years of university": the year pad
      flips: [at(89, 0.37), at(89, 0.41), at(89, 0.45)], // YEAR 2, 3, 4
      bill: at(89, 0.475), // "fully paid": the tuition bill
      strike: at(89, 0.5),
      paid: at(89, 0.53),
      exam: at(89, 0.585), // "On one condition": the answer sheet
      stamp: at(89, 0.72), // "top grades in the national exam"
    } satisfies LetterBeats,
    run: at(89, 0.835), // "three weeks from now": the run home starts (8:10.8)
    doorIn: at(90, 0.45), // "instead of to the store": the front door bursts open
    inside: at(90, 0.85) + 4,
    table: from(91) - 2, // "Your sister's at the table"
    look: from(91) + 8,
    walk: [at(91, 0.2), at(91, 0.58)] as const, // you come to the table
    face: at(91, 0.6), // "You say it to her face"
    sayIt: [at(91, 0.64), lineEnd(clips, 91) + 10] as const,
    rise: [at(91, 0.8), hold4 + 8] as const, // she's up before you finish
    tip: [at(91, 0.84), hold4 + 12] as const, // the chair tipping
    tag: at(91, 0.86),
    step: [hold4 + 8, hold4 + 22] as const,
    hug: [hold4 + 14, hold4 + 32] as const,
    half: [hold4 + 26, hold4 + 46] as const, // your arms come half up and hang there
    up: hold4, // the two: she's up, the chair going over
    ots4: Math.round(hold4 + g4 * 0.38), // over her shoulder: the card stops on -68
    arms4: Math.round(hold4 + g4 * 0.72), // your arms, half raised, hanging
    her66: from(92) - 2, // "Say it again."
    again1: [from(92), lineEnd(clips, 92)] as const,
    hold3,
    squeeze: [hold3 + 2, hold3 + 22] as const,
    reach1: [hold3 + 4, hold3 + 26, hold3 + 32, hold3 + 48] as const, // your fingers almost close round her, then fall back
    eyes3: Math.round(hold3 + g3 * 0.34), // your eyes don't leave the card
    jar: Math.round(hold3 + g3 * 0.67), // the lamp, the jar behind her
    card: from(93) - 2, // "Minus sixty-eight."
    tilt: at(93, 0.28), // "Over the one person who ever asked to hear it twice"
    her68: from(94) - 2, // "Say it again."
    again2: [from(94), lineEnd(clips, 94)] as const,
    cant: from(95) - 2, // "You can't." (your hands drop)
    card2: at(95, 0.24), // "You just watched a card say"
    arms: at(95, 0.68), // "what her arms didn't"
    back: from(96) - 2, // "You take your bag."
    fold: from(96) + 10, // you step out of the hug; the card folds
    stepBack: [from(96), at(96, 0.12)] as const,
    toBag: [at(96, 0.12), at(96, 0.24)] as const,
    pick: [at(96, 0.24), at(96, 0.33)] as const,
    toDoor: [at(96, 0.33), at(96, 0.52)] as const,
    out: [at(96, 0.52), at(96, 0.57)] as const,
    shut: [at(96, 0.57), at(96, 0.64)] as const,
    leave: at(96, 0.1),
    alone: at(96, 0.56), // "Not that night. Not for a month."
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
  const her = ramp(frame, k.hug[0], k.hug[1]) * mix(1, 0.55, ramp(frame, k.stepBack[0], k.stepBack[1]));
  const you = ramp(frame, k.hug[0], k.hug[1]) * (1 - ramp(frame, k.stepBack[0], k.stepBack[1]));
  return { her, you };
}

/** The hug's secondary motion (outside review of v4.1: "several seconds look frozen rather than held"): her grip
 *  tightening on each "Say it again" (`grip`), her shoulders shaking a little after each (`sob`), your fingers almost
 *  closing round her and falling back (`reach`), and your hands dropping to your sides on "You can't" (`drop`). */
function hugLife(frame: number, k: T) {
  const pulse = (a: number, up: number, down: number) => ramp(frame, a, a + up) * (1 - ramp(frame, a + up + 8, a + up + 8 + down));
  const grip = Math.max(pulse(k.again1[0] + 4, 10, 34), pulse(k.again2[0] + 4, 10, 34), 0.45 * ramp(frame, k.squeeze[0], k.squeeze[1]));
  const sob = Math.max(pulse(k.hold3, 8, 34), pulse(k.again2[1], 8, 40));
  const r1 = ramp(frame, k.reach1[0], k.reach1[1]) * (1 - ramp(frame, k.reach1[2], k.reach1[3]));
  const r2 = ramp(frame, k.again2[0], k.again2[1] + 6) * (1 - ramp(frame, k.cant + 4, k.cant + 14));
  return { grip, sob, reach: Math.max(0.75 * r1, 0.85 * r2), drop: ramp(frame, k.cant + 8, k.cant + 26) };
}

/** Your arms in the hug with `hugLife` on them: from half raised, almost closing round her, or dropped. */
function yourHugArms(you: Body, life: ReturnType<typeof hugLife>): Body {
  const around = { x: HER_X + 6 * S, y: FLOOR - 200 * S };
  const armF = mixArm(mixArm(you.pose.armF, aimArm(you, around), life.reach), [-2, 2], life.drop);
  const armB = mixArm(mixArm(you.pose.armB, aimArm(you, { x: around.x - 14, y: around.y + 22 * S }), life.reach), [-4, 1], life.drop);
  return { ...you, pose: { ...you.pose, armF, armB } };
}

/** Where you are and how you stand, from the door to the hug and back out of the door. */
function yourBody(frame: number, k: T): { body: Body; visible: boolean; carrying: boolean; opacity: number } {
  let x: number = DOOR_X, pose: Pose = STAND, carrying = true, visible = frame >= k.doorIn + 4;
  if (frame < k.inside) {
    x = mix(DOOR_X, BAG.x, ramp(frame, k.doorIn + 4, k.inside));
    pose = walkPose(frame * 0.5);
  } else if (frame < k.walk[0]) {
    x = BAG.x;
    carrying = false;
    pose = { ...STAND, lean: 8 + Math.sin(frame / 5) * 2 };
  } else if (frame < k.stepBack[0]) {
    const p = ramp(frame, k.walk[0], k.walk[1]);
    x = mix(BAG.x, YOU_X, p);
    carrying = false;
    pose = p > 0 && p < 1 ? walkPose(frame * 0.3) : STAND;
  } else if (frame < k.toBag[0]) {
    x = mix(YOU_X, YOU_X - 40, ramp(frame, k.stepBack[0], k.stepBack[1]));
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
    const up = ramp(frame, k.face - 4, k.face + 6) * (1 - ramp(frame, k.hug[0] - 6, k.hug[0] + 2));
    body.pose = { ...body.pose, armF: aimArm(body, { x: x + mix(40, 84, up), y: FLOOR - mix(140, 206, up) }) };
  }
  const opacity = 1 - ramp(frame, k.out[0], k.out[1]);
  if (frame >= k.out[1]) visible = false;
  return { body, visible, carrying, opacity };
}

/** Where Ji-yoon is: seated at her bowl, rising and turning, stepping to you, in the hug, left with her hands half up. */
function herBody(frame: number, k: T): Body {
  const rise = ramp(frame, k.rise[0], k.rise[1]);
  const step = ramp(frame, k.step[0], k.step[1]);
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
    const inHug = frame < k.stepBack[0] ? 1 : 0;
    const life = hugLife(frame, k);
    const squeeze = (0.6 * ramp(frame, k.squeeze[0], k.squeeze[1]) + 2 * life.grip) * (1 - ramp(frame, k.stepBack[0] - 10, k.stepBack[0]));
    const half = ramp(frame, k.half[0], k.half[1]);
    const shake = inHug * (0.3 + 1.3 * life.sob);
    const h = hug({ youX: YOU_X, herX: HER_X, floor: FLOOR, scale: S, t: amt.her, hold: 0, half, squeeze, shake, frame });
    // she presses in as her grip tightens; her shoulders shake a little (a slow shudder, not a wobble of the drawing)
    const press = inHug * life.grip;
    sis = { ...h.her, pose: { ...h.her.pose, lean: h.her.pose.lean + 4 * press, drop: h.her.pose.drop + 4 * press, tilt: h.her.pose.tilt + shake * Math.sin(frame * 0.7) * 1.2 } };
    if (frame < k.stepBack[0]) yb = yourHugArms(h.you, life);
  }
  const door = ramp(frame, k.doorIn, k.doorIn + 7) * (1 - ramp(frame, k.inside, k.inside + 14)) + ramp(frame, k.toDoor[1] - 8, k.out[0]) * (1 - ramp(frame, k.shut[0], k.shut[1]));
  const bagHand = handAt(yb, "back");
  const held = frame < k.toBag[0] ? <Letter x={0} y={12} scale={0.36} tilt={-6} /> : undefined;
  const actors = (
    <>
      {/* her chair tips over backwards as she gets up */}
      <g transform={`rotate(${-78 * ramp(frame, k.tip[0], k.tip[1])} ${HOME.chair.x - 44} ${FLOOR})`}>
        <Chair x={HOME.chair.x} y={HOME.chair.seatTop} scale={1.1} />
      </g>
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
  const shot = current(frame, [[k.start, "letter"], [k.run, "run"], [k.doorIn, "door"], [k.table, "table"], [k.face, "face"],
    [k.up, "up"], [k.ots4, "ots4"], [k.arms4, "arms4"], [k.her66, "her66"], [k.hold3, "tighten"], [k.eyes3, "eyes3"], [k.jar, "jar"],
    [k.card, "card"], [k.tilt, "tilt"], [k.her68, "her68"], [k.cant, "cant"], [k.card2, "card2"], [k.arms, "arms"], [k.back, "back"],
    [k.leave, "leave"], [k.alone, "alone"]]);
  if (shot === "letter") {
    const b = k.letter;
    const cam = drift(camAt(frame, [[k.start, { x: 960, y: 560, zoom: 1 }], [b.years, { x: 980, y: 550, zoom: 1.06 }], [b.exam, { x: 960, y: 540, zoom: 1.05 }],
      [k.run, { x: 960, y: 520, zoom: 1.16 }]]), frame, "letter", 4);
    return <ScholarshipInsert frame={frame} cam={cam} b={b} />;
  }
  if (shot === "run") return <NightRun frame={frame} p={linear(frame, k.run, k.doorIn)} />;
  const hugHead = headAt(HER_X, FLOOR, S, { ...STAND, lean: 22, drop: 14 }, -1);
  const herHand = { x: YOU_X - 25, y: FLOOR - 196 * S };
  const herSeated = headAt(HOME.chair.x, SEAT_Y, S, SEATED, 1);
  const cams: Record<Exclude<typeof shot, "letter" | "run">, Camera> = {
    door: camAt(frame, [[k.doorIn, { x: 430, y: 600, zoom: 1.5 }], [k.table, { x: 470, y: 610, zoom: 1.55 }]]),
    table: camAt(frame, [[k.table, { x: 640, y: 600, zoom: 1.22 }], [k.face, { x: 650, y: 610, zoom: 1.4 }]]),
    face: camAt(frame, [[k.face, closeUp(herSeated.x + 10, herSeated.y - 60, 2.2)], [k.up, closeUp(herSeated.x - 20, herSeated.y - 90, 2.35)]]),
    up: camAt(frame, [[k.up, { x: 660, y: 640, zoom: 1.65 }], [k.ots4, { x: 650, y: 630, zoom: 1.8 }]]),
    // the two of you, the card stopping over her: no foreground head (you are in this hug; outside review of v4.1)
    ots4: camAt(frame, [[k.ots4, { x: (YOU_HEAD.x + CARD.x) / 2, y: YOU_HEAD.y - 10, zoom: 2.35 }], [k.arms4, { x: (YOU_HEAD.x + CARD.x) / 2 + 5, y: YOU_HEAD.y, zoom: 2.5 }]]),
    arms4: camAt(frame, [[k.arms4, { x: 600, y: 740, zoom: 2.3 }], [k.her66, { x: 600, y: 730, zoom: 2.45 }]]),
    her66: camAt(frame, [[k.her66, closeUp(hugHead.x + 10, hugHead.y - 10, 3.0)], [k.hold3, closeUp(hugHead.x + 10, hugHead.y - 10, 3.2)]]),
    tighten: camAt(frame, [[k.hold3, { x: 610, y: 690, zoom: 2.4 }], [k.eyes3, { x: 610, y: 690, zoom: 2.55 }]]),
    eyes3: camAt(frame, [[k.eyes3, { x: YOU_HEAD.x + 60, y: YOU_HEAD.y - 60, zoom: 2.9 }], [k.jar, { x: YOU_HEAD.x + 60, y: YOU_HEAD.y - 60, zoom: 3.1 }]]),
    jar: camAt(frame, [[k.jar, { x: 870, y: 560, zoom: 2.0 }], [k.card, { x: 900, y: 570, zoom: 2.2 }]]),
    // the card readable at the top of the frame, her arms round you and your hands that don't close in the middle (v4.1
    // put the card alone at 4.2x and it outweighed the embrace)
    card: camAt(frame, [[k.card, { x: 640, y: 615, zoom: 2.55 }], [k.tilt, { x: 645, y: 605, zoom: 2.7 }]]),
    tilt: camAt(frame, [[k.tilt, { x: 645, y: 605, zoom: 2.7 }], [k.her68, { x: 630, y: 650, zoom: 2.2 }]]),
    her68: camAt(frame, [[k.her68, closeUp(hugHead.x + 10, hugHead.y - 10, 2.8)], [k.cant, closeUp(hugHead.x + 10, hugHead.y - 10, 3.05)]]),
    cant: camAt(frame, [[k.cant, closeUp(YOU_HEAD.x + 20, YOU_HEAD.y, 3.0)], [k.card2, closeUp(YOU_HEAD.x + 20, YOU_HEAD.y, 3.3)]]),
    card2: camAt(frame, [[k.card2, { x: 650, y: 600, zoom: 2.75 }], [k.arms, { x: 640, y: 620, zoom: 2.6 }]]),
    arms: camAt(frame, [[k.arms, insert(herHand.x + 30, herHand.y, 3.2)], [k.back, insert(herHand.x + 30, herHand.y, 3.5)]]),
    back: camAt(frame, [[k.back, { x: 600, y: 630, zoom: 1.8 }], [k.leave, { x: 590, y: 630, zoom: 1.8 }]]),
    leave: camAt(frame, [[k.leave, { x: 470, y: 600, zoom: 1.32 }], [k.alone, { x: 450, y: 600, zoom: 1.38 }]]),
    alone: camAt(frame, [[k.alone, { x: 840, y: 610, zoom: 1.75 }], [k.end, { x: 800, y: 620, zoom: 2.0 }]]),
  };
  const cam = drift(cams[shot], frame, "sayitagain", 3);

  // You: bursting in; grinning, saying it; the card; stiff under the number, eyes on it; you can't; you go.
  const you: Face = frame < k.face
    ? { brows: "raised", lids: 0, mouth: frame < k.walk[0] ? "open" : "smile", eyes: 1.12, look: { x: 1, y: 0 } }
    : frame < k.tag + 12
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.sayIt[0], k.sayIt[1], "smile"), eyes: 1.12, look: { x: 1, y: 0.1 } }
      : frame < k.ots4
        ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.7, y: -0.8 } }
        : frame < k.cant
          ? { brows: "flat", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 0.6, y: -0.85 } }
          : frame < k.back
            ? { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }
            : { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.4 } };
  // Her: at her bowl; she hears the door; looks up glad as you say it; up and into your scarf; left standing.
  const her: Face = frame < k.look
    ? { brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.6 } }
    : frame < k.walk[1]
      ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: -0.9, y: 0 } }
      : frame < k.hug[0]
        ? { brows: "raised", lids: 0, mouth: frame < k.rise[0] ? "smile" : "open", eyes: 1.15, look: { x: -1, y: -0.2 } }
        : frame < k.back
          ? { brows: "worry", lids: 0.85, mouth: frame < k.again2[0] ? talk(frame, k.again1[0], k.again1[1], "smile") : talk(frame, k.again2[0], k.again2[1], "smile"), eyes: 1, look: { x: 1, y: 0.3 } }
          : frame < k.alone
            ? { brows: "worry", lids: 0.1, mouth: "o", eyes: 1.1, look: { x: 1, y: 0 } }
            : { brows: "sad", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 1, y: 0.25 } };
  return <Room frame={frame} k={k} cam={cam} you={you} her={her} />;
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

export const sayItAgain: Beat = { id: "SayItAgain", firstLine: 89, Component: SayItAgain };
