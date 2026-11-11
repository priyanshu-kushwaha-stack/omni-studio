// Beat "The midpoint: the proof" (script.md, ## [07:25] The midpoint: the proof; narration lines 73-80). Same pattern
// as Change.tsx: `times()` from the clips, one component per shot, the beat picks by frame, snaps outside the Stage.
//
//   73    your room at night: insert on the notes still in your hand; pull back: you on the floor, and along the wall
//         the week's YES tags on a string like fairy lights, dim.
//   74    the tags light up one by one, identical; you look up at them ("the proof"); the notes slip from your hand.
//   75    the camera runs along the string, tag after tag; close on you ("you have ended them").
//   76    the paper on the wall: a hand, two figures side by side, one figure walking alone; the third lights up
//         ("choosing for yourself"); pull back to you under the string, looking along it.
//   77    lamp: dinner at your flat, four friends round the table, Dev among them; "Pass the salt?"; four snaps, four
//         tags, four hands reach and the salt tips over.
//   78    later: the others leave; you at the sink, back turned: "Stay a bit?"; snap, Dev sits on the sofa arm with his
//         bag on and watches the door. Hold: Dev on the arm, you at the sink.
//   79    montage, about a second and a half each: the metro, you nod at a passenger instead of asking; the chai stall,
//         you point; the office, a folded note on Dev's desk; then close on you in the night metro.
//   hold  night: the metro, you alone at the pole; where the ad should be, a cream tag with a bell: SUBSCRIBE. Nobody
//         looks at it. No voice. The train hums.
//   80    close on you; your mouth stays closed.
// The Midas lines were cut from the script; Midas is not drawn.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SIT, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { Bubble, headAt, Sheet, YesTag } from "../parts";
import { aimArm, CHAIR_SIT, seatedY, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Chair } from "../sets/common";
import { ChaiCounter, ChaiStallBack, CHAI } from "../sets/ChaiStall";
import { MetroBack, MetroFront, METRO_CAR } from "../sets/Metro";
import { OfficeBack, OFFICE_DOOR } from "../sets/Office";
import { Sfx } from "./Change.parts";
import { Dev, Fold, Pile } from "./Loan.parts";
import {
  Bag, ChaiMan, FLAT, FlatBack, FlatTable, FoldedNote, Friend, NeedsPaper, ROOM, RoomBack, Sofa, SubscribeTag, TagString, TAGS_X,
} from "./Midpoint.parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const salt = from(77);
  return {
    start,
    reveal: at(73, 0.6), // "Here's what you got"
    light: from(74), // tags light one by one until `lit`
    lit: at(74, 0.45), // "... a yes was real"
    proof: at(74, 0.56), // "It was the proof"
    drop: at(74, 0.8), // "You've thrown out the proof"
    along: from(75),
    ended: at(75, 0.72), // "you have ended them"
    paper: from(76) - 4,
    alone: at(76, 0.17), // "a basic need"
    hand: at(76, 0.39), // "feeling capable"
    pair: at(76, 0.56), // "feeling close to people"
    third: at(76, 0.77), // "Choosing for yourself": the third lights up
    under: at(76, 0.86),
    // 77: the salt (it overlaps the end of line 76: the narration leaves no gap).
    dinner: salt - 26,
    ask: salt - 24,
    snaps: [salt - 2, salt + 2, salt + 6, salt + 10] as const,
    reach: salt + 2,
    tip: salt + 12,
    // 78: later.
    later: lineEnd(clips, 77) - 10,
    stay: lineEnd(clips, 77) - 8,
    devSnap: from(78) + 4,
    watch: at(78, 0.37), // "He watches the door"
    hold: lineEnd(clips, 78),
    // 79: the montage, then the silent metro.
    m1: from(79),
    m2: at(79, 0.27),
    m3: at(79, 0.5),
    m4: at(79, 0.76),
    silent: lineEnd(clips, 79),
    ad: lineEnd(clips, 79) + 36,
    pole: lineEnd(clips, 79) + 80,
    quiet: from(80),
    shut: at(80, 0.5), // "You can only go quiet"
  };
}

// ------------------------------------------------------------------------------------------------ your room

const S = 1.15;
const SIT_Y = 940 + 112 * S;
const YOU_ROOM = { x: ROOM.you.x, head: headAt(ROOM.you.x, SIT_Y, S, SIT) };

const RoomShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "notes"], [k.reveal, "reveal"], [k.light, "light"], [k.proof, "proof"], [k.drop, "drop"],
    [k.along, "along"], [k.ended, "ended"], [k.paper, "paper"], [k.under, "under"]]);
  const h = YOU_ROOM.head;
  const S2 = ROOM.sheet;
  const cams: Record<typeof shot, Camera> = {
    notes: camAt(frame, [[k.start, insert(840, 880, 3)], [k.reveal, insert(840, 870, 3.3)]]),
    reveal: camAt(frame, [[k.reveal, { x: 880, y: 720, zoom: 1.7 }], [k.light, { x: 940, y: 560, zoom: 1.08 }]]),
    light: camAt(frame, [[k.light, { x: 940, y: 560, zoom: 1.08 }], [k.proof, { x: 940, y: 540, zoom: 1.2 }]]),
    proof: camAt(frame, [[k.proof, { x: 820, y: 600, zoom: 1.7 }], [k.drop, { x: 820, y: 610, zoom: 1.8 }]]),
    drop: camAt(frame, [[k.drop, { x: 840, y: 820, zoom: 2.1 }], [k.along, { x: 840, y: 830, zoom: 2.2 }]]),
    along: camAt(frame, [[k.along, { x: 300, y: 400, zoom: 2.2 }], [k.ended, { x: 1520, y: 400, zoom: 2.2 }]]),
    ended: camAt(frame, [[k.ended, closeUp(h.x + 40, h.y - 10, 2.6)], [k.paper, closeUp(h.x + 40, h.y - 10, 2.8)]]),
    paper: camAt(frame, [[k.paper, { x: S2.x, y: S2.y, zoom: 2.4 }], [k.pair, { x: S2.x + 30, y: S2.y, zoom: 2.5 }], [k.third, { x: S2.x + 120, y: S2.y - 10, zoom: 2.9 }]]),
    under: camAt(frame, [[k.under, { x: S2.x + 120, y: S2.y - 10, zoom: 2.9 }], [k.under + 16, { x: 1000, y: 600, zoom: 1.3 }], [k.dinner, { x: 990, y: 600, zoom: 1.25 }]]),
  };
  const cam = drift(cams[shot], frame, "room", shot === "notes" ? 1.5 : 3);
  const step = (k.lit - k.light) / TAGS_X.length;
  const lit = (i: number) => ramp(frame, k.light + i * step, k.light + i * step + 8);
  // The notes in your hand until you let them go; then a spill on the floor.
  const dropped = frame >= k.drop + 6;
  const body: Body = { x: YOU_ROOM.x, y: SIT_Y, scale: S, facing: 1, pose: SIT };
  const open = ramp(frame, k.drop, k.drop + 6);
  body.pose = { ...SIT, armF: aimArm(body, { x: YOU_ROOM.x + 80, y: mix(880, 905, open) }), armB: aimArm(body, { x: YOU_ROOM.x + 50, y: 920 }) };
  const alongLook = linear(frame, k.along, k.ended);
  const face = ({
    notes: { ...EXPRESSIONS.sad, look: { x: 0.6, y: 0.9 } },
    reveal: { ...EXPRESSIONS.sad, look: { x: 0.6, y: 0.9 } },
    light: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.4, y: -0.9 } },
    proof: { brows: "worry" as const, lids: 0, mouth: "flat" as const, eyes: 1.15, look: { x: 0.5, y: -0.95 } },
    drop: { ...EXPRESSIONS.sad, look: { x: 0.6, y: 0.9 } },
    along: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: mix(-0.6, 1, alongLook), y: -0.85 } },
    ended: { ...EXPRESSIONS.sad, look: { x: 0.9, y: -0.6 } },
    paper: { ...EXPRESSIONS.sad, look: { x: 0.9, y: -0.6 } },
    under: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: Math.sin((frame - k.under) / 20), y: -0.85 } },
  } as const)[shot];
  const actors = (
    <>
      <TagString frame={frame} lit={lit} />
      <Figure {...HERO} {...body} {...face} blink={blinking(frame, 1)} time={frame}
        held={dropped ? null : <g transform={`translate(4 -8) rotate(${open * 40})`}><Fold n={14} scale={0.9} /></g>} />
      {dropped && <Pile x={YOU_ROOM.x + 100} y={ROOM.floor - 6} n={5} scale={0.8} />}
    </>
  );
  const paper = (
    <Sheet frame={frame} at={k.paper} x={ROOM.sheet.x} y={ROOM.sheet.y} w={ROOM.sheet.w} h={ROOM.sheet.h}>
      <NeedsPaper frame={frame} c={{ alone: k.alone, hand: k.hand, pair: k.pair, light: k.third }} />
    </Sheet>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<><RoomBack cam={cam} />{paper}</>} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the salt

const SEAT_Y = seatedY(FLAT.seat, S);
const BEHIND_SCALE = 0.95;
const BEHIND_Y = seatedY(872, BEHIND_SCALE);

const SaltShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const reach = ramp(frame, k.reach, k.reach + 10);
  const tip = ramp(frame, k.tip, k.tip + 8);
  const target = { x: FLAT.salt.x, y: FLAT.salt.y - 20 };
  const you: Body = { x: FLAT.you, y: SEAT_Y, scale: S, facing: 1, pose: CHAIR_SIT };
  const youAsk = ramp(frame, k.ask - 2, k.ask + 8);
  you.pose = { ...CHAIR_SIT, lean: 8 * youAsk, armF: aimArm({ ...you, pose: { ...CHAIR_SIT, lean: 8 * youAsk } }, { x: mix(FLAT.you + 90, target.x, youAsk * 0.6), y: mix(836, target.y, youAsk) }) };
  const dev: Body = { x: FLAT.dev, y: SEAT_Y, scale: S, facing: -1, pose: { ...CHAIR_SIT, lean: 14 * reach } };
  dev.pose = { ...dev.pose, armF: reach > 0 ? aimArm(dev, target) : CHAIR_SIT.armF };
  const glad = { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05 };
  const youHead = headAt(you.x, you.y, S, you.pose);
  const devHead = headAt(dev.x, dev.y, S, dev.pose, -1);
  const heads = FLAT.behind.map((f) => headAt(f.x, BEHIND_Y, BEHIND_SCALE, CHAIR_SIT, f.facing as 1 | -1));
  const cam = drift(camAt(frame, [[k.dinner, { x: 960, y: 640, zoom: 1.35 }], [k.tip, { x: 960, y: 650, zoom: 1.45 }], [k.later, { x: 960, y: 660, zoom: 1.5 }]]), frame, "salt", 3);
  const actors = (
    <>
      {FLAT.behind.map((f, i) => {
        const b: Body = { x: f.x, y: BEHIND_Y, scale: BEHIND_SCALE, facing: f.facing as 1 | -1, pose: CHAIR_SIT };
        const pose = { ...CHAIR_SIT, armF: reach > 0 ? aimArm(b, { x: mix(f.x + f.facing * 40, target.x, reach), y: mix(830, target.y, reach) }) : CHAIR_SIT.armF };
        return <Friend key={i} {...b} pose={pose} head={f.head} frame={frame} look={{ x: 0.8, y: 0.5 }} />;
      })}
      <Chair x={FLAT.you} y={FLAT.seat} scale={S} facing={1} color="#7a5238" />
      <Chair x={FLAT.dev} y={FLAT.seat} scale={S} facing={-1} color="#7a5238" />
      <Figure {...HERO} {...you} {...(tip > 0.3 ? { ...EXPRESSIONS.shocked, mouth: "flat" as const } : { ...EXPRESSIONS.neutral, mouth: frame >= k.ask ? "o" as const : "flat" as const })}
        look={{ x: 1, y: 0.3 }} blink={blinking(frame, 1)} time={frame} />
      <Dev {...dev} {...glad} look={{ x: 1, y: 0.4 }} blink={blinking(frame, 3)} time={frame} />
      <FlatTable tip={tip} />
      {heads.map((h, i) => <YesTag key={i} frame={frame} at={k.snaps[i]} x={h.x} headY={h.y} r={h.r} />)}
      <YesTag frame={frame} at={k.snaps[3]} x={devHead.x} headY={devHead.y} r={devHead.r} />
      <Bubble frame={frame} at={k.ask} until={k.snaps[0]} x={youHead.x + youHead.r * 1.05} y={youHead.y - youHead.r * 0.9} text="Pass the salt?" size={28} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<FlatBack cam={cam} view="table" />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ later: stay a bit

const PERCH: Pose = { ...CHAIR_SIT, legB: [70, -60], legF: [78, -68], armF: [30, 30], armB: [20, 20] };
const YOU_SINK = 470;

const LaterShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // Dev: standing with his bag, then on the snap he steps to the sofa arm and perches there, watching the door.
  const go = ramp(frame, k.devSnap + 2, k.devSnap + 16);
  const sit = ramp(frame, k.devSnap + 14, k.devSnap + 24);
  const walking = frame >= k.devSnap + 2 && frame < k.devSnap + 16;
  const dx = mix(990, FLAT.sofa.arm, go);
  const dy = mix(FLAT.floor, seatedY(FLAT.sofa.armTop, S), sit);
  const dPose = lerpPose(walking ? walkPose(frame * 0.35) : STAND, PERCH, sit);
  const dev: Body = { x: dx, y: dy, scale: S, facing: 1, pose: dPose };
  const devHead = headAt(dev.x, dev.y, S, dev.pose);
  // You at the sink, your back to the room: hands in the sink, a slow scrub.
  const you: Body = { x: YOU_SINK, y: FLAT.floor, scale: S, facing: -1, pose: STAND };
  const scrub = Math.sin(frame / 7) * 10;
  you.pose = { ...STAND, lean: 6, armF: aimArm({ ...you, pose: { ...STAND, lean: 6 } }, { x: FLAT.sink.x + scrub, y: FLAT.sink.top - 10 }), armB: aimArm(you, { x: FLAT.sink.x + 30, y: FLAT.sink.top - 6 }) };
  const youHead = headAt(you.x, you.y, S, you.pose, -1);
  const shot = current(frame, [[k.later, "wide"], [k.watch, "watch"], [k.hold, "hold"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.later, { x: 1000, y: 620, zoom: 1.15 }], [k.watch, { x: 1020, y: 640, zoom: 1.25 }]]),
    watch: camAt(frame, [[k.watch, closeUp(devHead.x + 80, devHead.y + 10, 2.4)], [k.hold, closeUp(devHead.x + 80, devHead.y + 10, 2.6)]]),
    hold: camAt(frame, [[k.hold, { x: 900, y: 640, zoom: 1.3 }], [k.m1, { x: 900, y: 650, zoom: 1.38 }]]),
  };
  const cam = drift(cams[shot], frame, "later", 3);
  // The others leave through the door.
  const leavers = [0, 1].map((i) => {
    const x = mix(1240 + i * 90, FLAT.door.x + 40, linear(frame, k.later - 30 + i * 8, k.later + 40 + i * 8));
    if (x >= FLAT.door.x + 30) return null;
    return <Figure key={i} x={x} y={FLAT.floor} scale={S} pose={walkPose(frame * 0.33 + i)} head={PASTELS[i ? 6 : 0]} look={{ x: 0.8, y: 0 }} mouth="smile" time={frame} />;
  });
  const devFace = frame < k.devSnap
    ? { ...EXPRESSIONS.neutral, look: { x: -0.9, y: 0.1 } }
    : { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: 1, y: 0 } };
  const actors = (
    <>
      <Sofa />
      {leavers}
      <Dev {...dev} {...devFace} blink={blinking(frame, 3)} time={frame} />
      <Bag {...dev} />
      <Figure {...HERO} {...you} {...EXPRESSIONS.sad} look={{ x: 0.6, y: 0.8 }} blink={blinking(frame, 1)} time={frame} />
      <YesTag frame={frame} at={k.devSnap} x={devHead.x} headY={devHead.y} r={devHead.r} />
      <Bubble frame={frame} at={k.stay} until={k.devSnap + 14} x={youHead.x + youHead.r * 1.05} y={youHead.y - youHead.r * 0.9} text="Stay a bit?" size={28} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<FlatBack cam={cam} view="room" />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the montage

/** You nod at a passenger beside a bag on the empty seat, instead of asking; they look, and look away. */
const MetroNod: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const len = k.m2 - k.m1;
  const nod = frame > k.m1 + len * 0.35 && frame < k.m1 + len * 0.6 ? Math.sin(((frame - k.m1 - len * 0.35) / (len * 0.25)) * Math.PI) * 12 : 0;
  const you: Body = { x: 1030, y: METRO_CAR.floor, scale: S, facing: 1, pose: { ...STAND, tilt: nod } };
  you.pose = { ...you.pose, armB: aimArm(you, { x: METRO_CAR.poles[1], y: 600 }) };
  const pass: Body = { x: METRO_CAR.seats[3], y: seatedY(METRO_CAR.seat.y, S), scale: S, facing: -1, pose: { ...CHAIR_SIT, armF: [40, 60], armB: [30, 50] } };
  const looked = frame > k.m1 + len * 0.55 && frame < k.m1 + len * 0.8;
  const cam = drift(camAt(frame, [[k.m1, { x: 1200, y: 640, zoom: 1.65 }], [k.m2, { x: 1210, y: 640, zoom: 1.8 }]]), frame, "m1", 3);
  const actors = (
    <>
      <Figure x={pass.x} y={pass.y} scale={S} facing={-1} pose={pass.pose} head={PASTELS[7]} coat="#3f4a5c" look={looked ? { x: 1, y: -0.4 } : { x: 0.6, y: 0.9 }}
        mouth="flat" brows={looked ? "flat" : "none"} lids={looked ? 0.3 : 0.2} time={frame} />
      <g transform={`translate(${METRO_CAR.seats[4]} ${METRO_CAR.seat.y})`}>
        <rect x={-50} y={-70} width={100} height={70} rx={14} fill="#c96f2d" stroke={INK} strokeWidth={5} />
        <path d="M-30 -70 Q0 -110 30 -70" fill="none" stroke={INK} strokeWidth={6} />
      </g>
      <rect x={METRO_CAR.poles[1] - 14} y={-400} width={28} height={METRO_CAR.floor + 400} rx={14} fill="#c8ccd2" stroke={INK} strokeWidth={5} />
      <Figure {...HERO} {...you} {...EXPRESSIONS.worried} mouth="flat" look={nod ? { x: 1, y: 0.3 } : { x: 1, y: 0.6 }} time={frame} blink={blinking(frame, 1)} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="car" frame={frame} outside="day" />} actors={actors} front={<MetroFront cam={cam} view="car" />} />;
};

/** You point at a glass at the chai stall; the chai man nods and reaches for it. */
const ChaiPoint: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const len = k.m3 - k.m2;
  const point = ramp(frame, k.m2 + len * 0.15, k.m2 + len * 0.3);
  const you: Body = { x: CHAI.customer.x, y: CHAI.floor, scale: S, facing: 1, pose: STAND };
  you.pose = { ...STAND, armF: point > 0 ? aimArm(you, { x: mix(CHAI.customer.x + 60, CHAI.glasses.x, point), y: mix(820, 700, point) }) : STAND.armF };
  const manPose: Pose = { ...STAND, tilt: frame > k.m2 + len * 0.45 && frame < k.m2 + len * 0.7 ? 8 : 0 };
  const man = { x: CHAI.man.x, y: CHAI.man.y, scale: 1.1, facing: -1 as const, pose: manPose };
  const reach = ramp(frame, k.m2 + len * 0.6, k.m2 + len * 0.85);
  man.pose = { ...manPose, armF: reach > 0 ? aimArm(man, { x: mix(CHAI.man.x - 60, CHAI.glasses.x + 20, reach), y: mix(820, 760, reach) }) : STAND.armF };
  const cam = drift(camAt(frame, [[k.m2, { x: 1050, y: 650, zoom: 1.5 }], [k.m3, { x: 1060, y: 650, zoom: 1.62 }]]), frame, "m2", 3);
  const actors = (
    <>
      <ChaiMan {...man} frame={frame} face={{ brows: "raised", lids: 0, mouth: "smile", eyes: 1.05 }} />
      <ChaiCounter frame={frame} bowl={false} />
      <Figure {...HERO} {...you} {...EXPRESSIONS.neutral} look={{ x: 1, y: 0.1 }} time={frame} blink={blinking(frame, 1)}
        held={point > 0.5 ? <line x1={0} y1={0} x2={18} y2={-6} stroke={MUSTARD} strokeWidth={8} strokeLinecap="round" /> : null} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ChaiStallBack cam={cam} frame={frame} />} actors={actors} />;
};

/** You leave a folded note on Dev's desk and walk off; he does not look round. */
const OfficeNote: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const len = k.m4 - k.m3;
  const inP = ramp(frame, k.m3, k.m3 + len * 0.3);
  const place = ramp(frame, k.m3 + len * 0.3, k.m3 + len * 0.5) * (1 - ramp(frame, k.m3 + len * 0.55, k.m3 + len * 0.65));
  const outP = ramp(frame, k.m3 + len * 0.65, k.m4);
  const leaving = frame >= k.m3 + len * 0.65;
  const x = leaving ? mix(640, 900, outP) : mix(820, 640, inP);
  const walking = (frame < k.m3 + len * 0.3) || leaving;
  const noteAt = { x: OFFICE_DOOR.devDesk.x + 70, y: 756 };
  const you: Body = { x, y: OFFICE_DOOR.floor, scale: S, facing: leaving ? 1 : -1, pose: walking ? walkPose(frame * 0.35) : STAND };
  if (!walking) you.pose = { ...STAND, lean: 10 * place, armF: aimArm({ ...you, pose: { ...STAND, lean: 10 * place } }, { x: mix(x - 50, noteAt.x, place), y: mix(820, noteAt.y - 6, place) }) };
  const devX = OFFICE_DOOR.devDesk.x - 140;
  const dev = { x: devX, y: seatedY(OFFICE_DOOR.devDesk.y, S), scale: S, facing: 1 as const, pose: { ...CHAIR_SIT, armF: [70, 40] as [number, number], armB: [60, 40] as [number, number] } };
  const onDesk = frame >= k.m3 + len * 0.5;
  const cam = drift(camAt(frame, [[k.m3, { x: 560, y: 660, zoom: 1.6 }], [k.m4, { x: 590, y: 660, zoom: 1.72 }]]), frame, "m3", 3);
  const actors = (
    <>
      <Chair x={devX} y={OFFICE_DOOR.devDesk.y} scale={S} facing={1} />
      <Dev {...dev} {...EXPRESSIONS.neutral} look={{ x: 1, y: 0.1 }} blink={blinking(frame, 3)} time={frame} />
      {onDesk && <FoldedNote x={noteAt.x} y={noteAt.y - 4} scale={0.9} tilt={-8} />}
      <Figure {...HERO} {...you} {...EXPRESSIONS.sad} look={leaving ? { x: 0.8, y: 0.6 } : { x: 1, y: 0.5 }} time={frame} blink={blinking(frame, 1)}
        held={!onDesk && !walking ? <FoldedNote x={4} y={-6} scale={0.8} /> : !onDesk && frame < k.m3 + len * 0.3 ? <FoldedNote x={4} y={-6} scale={0.8} /> : null} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<OfficeBack cam={cam} view="doorway" />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the silent metro

const POLE_X = METRO_CAR.poles[1];
const YOU_CAR = { x: POLE_X - 70 };
const CAR_HEAD = headAt(YOU_CAR.x, METRO_CAR.floor, S, STAND);

const SilentMetro: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.m4, "close"], [k.silent, "wide"], [k.ad, "ad"], [k.pole, "pole"], [k.quiet, "quiet"]]);
  const h = CAR_HEAD;
  const cams: Record<typeof shot, Camera> = {
    close: camAt(frame, [[k.m4, closeUp(h.x + 40, h.y, 2.5)], [k.silent, closeUp(h.x + 40, h.y, 2.7)]]),
    wide: camAt(frame, [[k.silent, { x: 1060, y: 560, zoom: 1.12 }], [k.ad, { x: 1080, y: 550, zoom: 1.2 }]]),
    ad: camAt(frame, [[k.ad, insert(METRO_CAR.ads[1].x, METRO_CAR.ads[1].y + 30, 3)], [k.pole, insert(METRO_CAR.ads[1].x - 20, METRO_CAR.ads[1].y + 30, 3.3)]]),
    pole: camAt(frame, [[k.pole, { x: POLE_X - 20, y: 640, zoom: 1.8 }], [k.quiet, { x: POLE_X - 20, y: 630, zoom: 1.9 }]]),
    quiet: camAt(frame, [[k.quiet, closeUp(h.x + 30, h.y, 2.5)], [k.shut, closeUp(h.x + 30, h.y, 2.8)], [k.shut + 60, closeUp(h.x + 30, h.y, 3)]]),
  };
  const base = drift(cams[shot], frame, "car", 2.5);
  const cam = { ...base, y: base.y + Math.sin(frame * 1.3) * 1.2 };
  const you: Body = { x: YOU_CAR.x, y: METRO_CAR.floor, scale: S, facing: 1, pose: STAND };
  you.pose = { ...STAND, armF: aimArm(you, { x: POLE_X - 6, y: 600 }) };
  const shut = ramp(frame, k.shut, k.shut + 20);
  const face = { ...EXPRESSIONS.sad, mouth: "flat" as const, lids: mix(0.45, 0.65, shut), look: { x: 0.5, y: 0.85 } };
  const actors = (
    <>
      <SubscribeTag x={METRO_CAR.ads[1].x} y={METRO_CAR.ads[1].y} frame={frame} />
      <rect x={POLE_X - 14} y={-400} width={28} height={METRO_CAR.floor + 400} rx={14} fill="#c8ccd2" stroke={INK} strokeWidth={5} />
      <Figure {...HERO} {...you} {...face} blink={blinking(frame, 1)} time={frame} />
    </>
  );
  return (
    <LookContext.Provider value={moodLook("night")}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="car" frame={frame} outside="night" speed={7} />} actors={actors}
        front={<MetroFront cam={cam} view="car" />} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Midpoint: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.from);
  const scene = current(frame, [[0, "room"], [k.dinner, "salt"], [k.later, "later"], [k.m1, "m1"], [k.m2, "m2"], [k.m3, "m3"], [k.m4, "metro"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "room" && <RoomShot frame={frame} k={k} />}
      {scene === "salt" && <SaltShot frame={frame} k={k} />}
      {scene === "later" && <LaterShot frame={frame} k={k} />}
      {scene === "m1" && <MetroNod frame={frame} k={k} />}
      {scene === "m2" && <ChaiPoint frame={frame} k={k} />}
      {scene === "m3" && <OfficeNote frame={frame} k={k} />}
      {scene === "metro" && <SilentMetro frame={frame} k={k} />}
      {k.snaps.map((s) => <Sfx key={s} at={s} name="snap" volume={0.4} />)}
      <Sfx at={k.devSnap} name="snap" />
    </AbsoluteFill>
  );
};

export const midpoint: Beat = { id: "midpoint", firstLine: 73, Component: Midpoint };
