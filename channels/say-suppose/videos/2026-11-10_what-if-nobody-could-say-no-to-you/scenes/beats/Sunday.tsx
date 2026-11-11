// Beat "Sunday" (script.md, ## [04:05] Sunday; narration lines 45-51). Same pattern as Change.tsx: `times()` from the
// clips, one component per shot, the beat picks the shot by frame. No tag and no snap anywhere in this beat.
//
//   45    your mother's house: the lane, the gate, the tulsi, the tiffin waiting on the step, her at the door in her
//         shawl; you come down the lane; close on you looking at her, then your eyes drop ("You never do").
//   46    close on her at the door, beckoning: "Come, come. Sit."
//         the table: she serves, you eat, she serves again before your plate is half empty.
//   47    the goat story with both hands; you laugh in the right place.
//   48    close on you: your mouth opens on a question; she looks up; you close it and reach for the water.
//   hold  she pats your hand without noticing, ladle in the other; the camera tilts up to the fan.
//   49    the gate: she hands you the tiffin and tucks the pickle jar on top. Behind her, the stranger (crimson head,
//         long dark coat) walks by on the far lane for one second, left to right, and never turns. "Let's see."
//   50    she waves; you walk off with the tiffin in both arms. "Eat properly!"
//   51    close on her at the gate: nothing over her head; you in the lane; her, still waving.
//   hold  you look back from the lane; she is still at the gate; you turn the corner.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, headAt } from "../parts";
import { aimArm, CHAIR_SIT, handAt, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Chair, REF } from "../sets/common";
import { LunchTable, MOTHER_GATE, MOTHER_TABLE, MothersGate, MothersHouseBack, Tiffin } from "../sets/MothersHouse";
import { Ladle, LaneCorner, Mom, Stranger, Tumbler } from "./Sunday.parts";

const S = 1.15;
const G = MOTHER_GATE;
const T_ = MOTHER_TABLE;

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    lane: from(45), // the house, you come down the lane
    arrive: at(45, 0.42),
    you: at(45, 0.46), // "You haven't asked her for anything.": close on you
    never: at(45, 0.84), // "You never do.": your eyes drop
    door: from(46) - 4, // close on her: "Come, come. Sit."
    come: from(46),
    comeEnd: lineEnd(clips, 46),
    table: lineEnd(clips, 46) - 2, // the table: serve, eat, serve again
    serve2: lineEnd(clips, 46) + 34,
    goat: at(47, 0.3), // "the one from when you were six": the goat story with both hands
    laugh: at(47, 0.62), // "you laugh where you always laugh"
    close: from(48) - 2, // close on you
    ask: at(48, 0.06), // your mouth opens
    looks: at(48, 0.3), // she looks up
    stop: at(48, 0.52), // you close it, reach for the water
    pat: lineEnd(clips, 48) + 2, // the hold: she pats your hand
    fan: lineEnd(clips, 48) + 30, // the camera tilts up to the fan
    gate: from(49) - 14, // the gate: the tiffin, the jar
    jar: from(49) + 6,
    stranger: from(49) + 1, // one second: from(49)+1 .. +31
    sunday: from(49),
    sundayEnd: lineEnd(clips, 49),
    letsSee: lineEnd(clips, 49) - 2,
    wave: from(50) - 4, // she waves, you walk off: "Eat properly!"
    eat: from(50),
    eatEnd: lineEnd(clips, 50),
    noTag: from(51) - 2, // close on her: nothing over her head
    walking: at(51, 0.44), // "You've asked her nothing": you in the lane
    still: at(51, 0.68), // "so she is still just your mother": her, waving
    look: lineEnd(clips, 51), // the hold: you look back
    corner: lineEnd(clips, 51) + 40, // you turn the corner
    end: to,
  };
}

/** A speaking mouth: open and closed in turn while a line plays. */
const talk = (frame: number, from: number, to: number, rest: "smile" | "flat" = "smile") =>
  frame >= from && frame < to ? (Math.floor((frame - from) / 5) % 2 === 0 ? "open" as const : "smile" as const) : rest;

const MOM_FACE = { brows: "raised" as const, lids: 0.1, eyes: 1 };

// ------------------------------------------------------------------------------------------------ line 45-46: arriving

const ArriveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const x = mix(-180, G.gate.x - 80, ramp(frame, k.lane, k.arrive));
  const walking = frame < k.arrive;
  const hero: Body = { x, y: G.floor, scale: S, facing: 1, pose: walking ? walkPose(frame * 0.3) : STAND };
  const head = headAt(x, G.floor, S, hero.pose);
  const mom: Body = { x: G.door.x - 30, y: G.door.y, scale: S, facing: -1, pose: STAND };
  const mh = headAt(mom.x, mom.y, S, STAND, -1);
  // She beckons with both hands on "Come, come".
  const beck = frame >= k.come ? Math.sin((frame - k.come) / 3.5) * 22 : 0;
  mom.pose = frame >= k.door ? { ...STAND, armF: [100 + beck, 70 + beck], armB: [80 - beck, 60] } : { ...STAND, armF: [30, 60], armB: [-10, 20] };
  const shot = current(frame, [[k.lane, "wide"], [k.you, "you"], [k.door, "her"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.lane, REF], [k.you, { x: 900, y: 560, zoom: 1.08 }]]),
    you: camAt(frame, [[k.you, closeUp(head.x + 40, head.y, 2.5)], [k.door, closeUp(head.x + 40, head.y + 6, 2.75)]]),
    her: camAt(frame, [[k.door, closeUp(mh.x - 30, mh.y + 20, 2.3)], [k.table, closeUp(mh.x - 30, mh.y + 20, 2.55)]]),
  };
  const drop = ramp(frame, k.never, k.never + 14);
  const yFace = shot === "you"
    ? { brows: "none" as const, lids: mix(0.1, 0.5, drop), mouth: drop > 0.5 ? "flat" as const : "smile" as const, eyes: 1, look: { x: mix(0.9, 0.4, drop), y: mix(-0.1, 0.8, drop) } }
    : { ...EXPRESSIONS.happy, look: { x: 0.9, y: -0.1 } };
  const cam = drift(cams[shot], frame, "arrive", 3);
  const actors = (
    <>
      <Tiffin x={G.step.x + 95} y={G.step.y} scale={0.9} />
      <Mom {...mom} {...MOM_FACE} mouth={talk(frame, k.come, k.comeEnd)} look={{ x: 0.9, y: 0.1 }} blink={blinking(frame, 3)} time={frame} />
      <MothersGate open={ramp(frame, k.arrive - 10, k.arrive + 10) * 0.8} />
      <Figure {...HERO} {...hero} {...yFace} blink={blinking(frame, 1)} time={frame} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MothersHouseBack cam={cam} view="gate" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ lines 46-48: the table

const YOU_X = 700;
const HER_SEAT = 1240;
const SERVE_X = 880;
const PLATE = T_.plates[0];
const GLASS = { x: 880, y: T_.table.top };

const TableShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const you: Body = { x: YOU_X, y: T_.you.y, scale: S, facing: 1, pose: CHAIR_SIT };
  const head = headAt(you.x, you.y, S, CHAIR_SIT);
  // You: eating (hand plate to mouth) until the goat story; then laughing; reaching for the water on "You stop".
  const eatPhase = frame >= k.table + 14 && frame < k.goat ? Math.max(0, Math.sin((frame - k.table - 14) / 6)) : 0;
  const reachGlass = ramp(frame, k.stop + 4, k.stop + 18);
  const handOnTable = frame >= k.pat - 4;
  you.pose = {
    ...CHAIR_SIT,
    armF: reachGlass > 0 && !handOnTable
      ? aimArm(you, { x: mix(head.x + 30, GLASS.x - 10, reachGlass), y: mix(head.y + 110, GLASS.y - 34, reachGlass) })
      : handOnTable ? aimArm(you, { x: 840, y: T_.table.top - 4 })
        : aimArm(you, { x: mix(PLATE.x - 30, head.x + 24, eatPhase), y: mix(PLATE.y - 8, head.y + 34, eatPhase) }),
  };
  const yourHand = handAt(you, "front");

  // Her: standing at the table to serve (twice), then in her chair for the goat story, then standing again to serve a
  // third time in the hold (and pat your hand with the other).
  const standing = frame < k.goat || frame >= k.pat;
  const her: Body = standing
    ? { x: SERVE_X, y: T_.floor, scale: S, facing: -1, pose: STAND }
    : { x: HER_SEAT, y: T_.her.y, scale: S, facing: -1, pose: CHAIR_SIT };
  const serveAt = (at: number) => ramp(frame, at, at + 10) * (1 - ramp(frame, at + 14, at + 24));
  const ladleOut = Math.max(serveAt(k.table + 2), serveAt(k.serve2), serveAt(k.pat + 6));
  const potHand = { x: 950, y: T_.table.top - 70 };
  const plateHand = { x: PLATE.x + 60, y: PLATE.y - 60 };
  const story = Math.sin((frame - k.goat) / 5);
  if (standing) {
    her.pose = {
      ...STAND, lean: 6,
      armF: aimArm(her, { x: mix(potHand.x, plateHand.x, ladleOut), y: mix(potHand.y, plateHand.y, ladleOut) }),
      armB: frame >= k.pat ? aimArm(her, { x: yourHand.x + 14, y: yourHand.y - 12 + Math.max(0, Math.sin((frame - k.pat) / 4)) * -10 }) : [-10, 20],
    };
  } else {
    // The goat: one hand up behind her head for the horns, the other out in front of her face, bobbing; after the
    // story her hands rest on the table.
    her.pose = frame < k.close
      ? { ...CHAIR_SIT, lean: -4 + story * 3, armF: [100 + story * 20, 50], armB: [160 - story * 18, 20] }
      : { ...CHAIR_SIT, armF: aimArm(her, { x: HER_SEAT - 110, y: T_.table.top - 6 }) };
  }
  const shot = current(frame, [[k.table, "two"], [k.goat, "goat"], [k.laugh, "laugh"], [k.close, "you"], [k.looks, "her"], [k.stop, "you2"], [k.pat, "pat"], [k.fan, "fan"]]);
  const hh = headAt(her.x, her.y, S, her.pose, -1);
  const cams: Record<typeof shot, Camera> = {
    two: camAt(frame, [[k.table, { x: 860, y: 650, zoom: 1.8 }], [k.goat, { x: 870, y: 650, zoom: 1.92 }]]),
    goat: camAt(frame, [[k.goat, { x: HER_SEAT - 80, y: 640, zoom: 2.0 }], [k.laugh, { x: HER_SEAT - 100, y: 640, zoom: 2.1 }]]),
    laugh: camAt(frame, [[k.laugh, { x: 980, y: 650, zoom: 1.4 }], [k.close, { x: 970, y: 650, zoom: 1.45 }]]),
    you: camAt(frame, [[k.close, closeUp(head.x + 40, head.y, 2.6)], [k.looks, closeUp(head.x + 40, head.y, 2.9)]]),
    her: camAt(frame, [[k.looks, closeUp(hh.x - 40, hh.y, 2.6)], [k.stop, closeUp(hh.x - 40, hh.y, 2.75)]]),
    you2: camAt(frame, [[k.stop, { x: head.x + 120, y: head.y + 60, zoom: 2.2 }], [k.pat, { x: head.x + 130, y: head.y + 70, zoom: 2.3 }]]),
    pat: camAt(frame, [[k.pat, { x: 860, y: 640, zoom: 1.7 }], [k.fan - 6, { x: 880, y: 600, zoom: 1.6 }]]),
    fan: camAt(frame, [[k.fan, { x: 900, y: 520, zoom: 1.5 }], [k.gate, { x: T_.fan.x, y: T_.fan.y + 40, zoom: 2.0 }]]),
  };
  const cam = drift(cams[shot], frame, "table", 3);
  const yFace = ({
    two: { ...EXPRESSIONS.happy, lids: 0.15, look: { x: 0.6, y: 0.6 } },
    goat: { ...EXPRESSIONS.happy, look: { x: 1, y: -0.1 } },
    laugh: { brows: "raised" as const, lids: 0.75, mouth: "open" as const, eyes: 1, look: { x: 0.9, y: 0 } },
    you: { brows: "worry" as const, lids: 0, mouth: frame >= k.ask ? "o" as const : "flat" as const, eyes: 1.1, look: { x: 1, y: -0.05 } },
    her: { brows: "worry" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: 1, y: 0 } },
    you2: { ...EXPRESSIONS.sad, lids: 0.45, look: { x: 0.8, y: 0.6 } },
    pat: { ...EXPRESSIONS.sad, look: { x: 0.9, y: 0.7 } },
    fan: { ...EXPRESSIONS.sad, look: { x: 0.9, y: 0.7 } },
  } as const)[shot];
  const mFace = shot === "her"
    ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.1, look: { x: 0.95, y: -0.1 } }
    : shot === "goat" || shot === "laugh"
      ? { brows: "raised" as const, lids: shot === "laugh" ? 0.6 : 0, mouth: Math.floor(frame / 5) % 2 ? "open" as const : "smile" as const, eyes: 1.05, look: { x: 0.9, y: 0 } }
      : { ...MOM_FACE, mouth: "smile" as const, look: { x: 0.5, y: 0.9 } };
  // Your plate fills again before it empties: food grows at each serve and goes down as you eat.
  const food = 0.6 + 0.4 * ramp(frame, k.table + 8, k.table + 14) - 0.25 * ramp(frame, k.table + 14, k.serve2) + 0.4 * ramp(frame, k.serve2 + 8, k.serve2 + 14);
  const actors = (
    <>
      <Chair x={you.x - 6} y={you.y - 112 * S} scale={S} facing={1} />
      {!standing && <Chair x={her.x + 6} y={her.y - 112 * S} scale={S} facing={-1} />}
      {standing && <Chair x={HER_SEAT + 6} y={T_.her.y - 112 * S} scale={S} facing={-1} />}
      <Mom {...her} {...mFace} blink={blinking(frame, 3)} time={frame} held={standing ? <Ladle tilt={-20} full={ladleOut > 0.3} /> : undefined} />
      <Figure {...HERO} {...you} {...yFace} blink={blinking(frame, 1) && shot !== "laugh"} time={frame} />
      <LunchTable food={0.8} />
      <ellipse cx={PLATE.x - 6} cy={PLATE.y - 10} rx={40 * food} ry={12 * food} fill="#e0a23c" />
      <Tumbler x={reachGlass > 0.95 && !handOnTable ? yourHand.x + 10 : GLASS.x} y={reachGlass > 0.95 && !handOnTable ? yourHand.y + 30 : GLASS.y} scale={0.9} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MothersHouseBack cam={cam} view="table" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ lines 49-51: the gate

const HER_X = 1130;
const YOU_GATE = 960;

const GateShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // She hands you the tiffin over the open gate, then tucks the jar on top; you leave with it in both arms.
  const handed = frame >= k.sunday - 4;
  const walking = frame >= k.wave + 6 && frame < k.look;
  const lookBack = frame >= k.look && frame < k.corner;
  const youX = frame < k.look ? mix(YOU_GATE, 120, linear(frame, k.wave + 6, k.look)) : mix(120, -420, linear(frame, k.corner, k.end));
  const you: Body = { x: youX, y: G.floor, scale: S, facing: walking || frame >= k.corner ? -1 : 1,
    pose: walking || frame >= k.corner ? walkPose(frame * 0.3) : STAND };
  const head = headAt(you.x, you.y, S, you.pose, you.facing);
  const box = { x: you.x + you.facing * 64, y: G.floor - 135 * S };
  if (handed) you.pose = { ...you.pose, armF: aimArm(you, box), armB: aimArm(you, { x: box.x - you.facing * 10, y: box.y + 20 }) };
  else you.pose = { ...STAND, armF: aimArm(you, { x: you.x + 90, y: G.floor - 200 * S }) };

  const her: Body = { x: HER_X, y: G.floor, scale: S, facing: -1, pose: STAND };
  const give = { x: (HER_X + YOU_GATE) / 2 + 6, y: G.floor - 150 * S };
  const tuck = ramp(frame, k.jar - 10, k.jar) * (1 - ramp(frame, k.jar + 4, k.jar + 14));
  const waving = frame >= k.wave;
  const wave = Math.sin((frame - k.wave) / 4) * 20;
  her.pose = waving
    ? { ...STAND, armF: [150 + wave, 25] }
    : {
      ...STAND,
      armF: handed ? aimArm(her, { x: give.x + 30, y: give.y + 30 }) : aimArm(her, give),
      armB: tuck > 0 ? aimArm(her, { x: give.x + 4, y: mix(give.y, give.y - 150, tuck) }) : handed ? [-6, 10] : aimArm(her, { x: give.x + 12, y: give.y + 10 }),
    };
  const hh = headAt(her.x, her.y, S, STAND, -1);
  const shot = current(frame, [[k.gate, "two"], [k.wave, "wave"], [k.noTag, "noTag"], [k.walking, "lane"], [k.still, "still"], [k.look, "back"]]);
  const cams: Record<typeof shot, Camera> = {
    two: camAt(frame, [[k.gate, { x: 1045, y: 700, zoom: 1.6 }], [k.wave, { x: 1045, y: 700, zoom: 1.68 }]]),
    wave: camAt(frame, [[k.wave, { x: 860, y: 620, zoom: 1.25 }], [k.noTag, { x: 820, y: 620, zoom: 1.25 }]]),
    noTag: camAt(frame, [[k.noTag, closeUp(hh.x - 30, hh.y - 90, 2.2)], [k.walking, closeUp(hh.x - 30, hh.y - 120, 2.35)]]),
    lane: camAt(frame, [[k.walking, { x: youX - 60, y: 680, zoom: 1.8 }], [k.still, { x: youX - 60, y: 680, zoom: 1.85 }]]),
    still: camAt(frame, [[k.still, { x: HER_X - 60, y: 660, zoom: 1.7 }], [k.look, { x: HER_X - 60, y: 650, zoom: 1.6 }]]),
    back: camAt(frame, [[k.look, { x: 560, y: 600, zoom: 1.12 }], [k.end, { x: 520, y: 600, zoom: 1.12 }]]),
  };
  const cam = drift(cams[shot], frame, "sgate", 3);
  const tiffinHeld = <Tiffin x={0} y={80} scale={0.8} jar={frame >= k.jar} />;
  const speaking = (frame >= k.sunday && frame < k.sundayEnd) || (frame >= k.eat && frame < k.eatEnd);
  const mFace = { ...MOM_FACE, mouth: speaking ? talk(frame, 0, Infinity) : "smile" as const, look: { x: 0.95, y: 0 } };
  const yFace = lookBack
    ? { ...EXPRESSIONS.sad, lids: 0.35, mouth: "flat" as const, look: { x: 0.95, y: -0.05 } }
    : frame >= k.letsSee && frame < k.wave + 20
      ? { brows: "none" as const, lids: 0.3, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0 } }
      : { ...EXPRESSIONS.neutral, lids: 0.25, look: { x: 0.9, y: 0.1 } };
  const actors = (
    <>
      <Mom {...her} {...mFace} blink={blinking(frame, 3)} time={frame} held={!handed ? tiffinHeld : undefined} />
      <MothersGate open={0.85} />
      <Figure {...HERO} {...you} {...yFace} blink={blinking(frame, 1)} time={frame} held={handed ? tiffinHeld : undefined} />
      <Bubble frame={frame} at={k.letsSee} until={k.eat + 16} x={head.x - head.r * 0.3} y={head.y - head.r * 1.3} text="Let's see." size={30} side="left" />
    </>
  );
  // The stranger: one second (30 frames) on the far lane, behind her, left to right, never turning.
  const strangerP = linear(frame, k.stranger, k.stranger + 30);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<><MothersHouseBack cam={cam} view="gate" frame={frame} /><Stranger cam={cam} frame={frame} p={strangerP} fromX={HER_X} /></>}
      actors={actors} front={shot === "back" ? <LaneCorner cam={cam} /> : undefined} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const SundayBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [[0, "arrive"], [k.table, "table"], [k.gate, "gate"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "arrive" && <ArriveShot frame={frame} k={k} />}
      {scene === "table" && <TableShot frame={frame} k={k} />}
      {scene === "gate" && <GateShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const sunday: Beat = { id: "sunday", firstLine: 45, Component: SundayBeat };
