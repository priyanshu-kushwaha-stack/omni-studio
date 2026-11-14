// Beat "The Ladder" (script v7; story.json lines 78-83; mood lamp), rebuilt on the outside review of v6 (sheets 31-34,
// top-15 #5, the cut list's study-room walk and brain slide). The late-night study room past midnight
// (sets/ReadingRoom.tsx). Every frame comes from the clips (`times`, fractions from the narration's word timings).
//
//   78    "The late-night study room. Past midnight.": the empty room, you cross two desks; "His seat's empty": close on
//         his pushed-back chair; "and his notebook's open": the open book from above; "You look. Obviously.": a glance
//         over each shoulder, a dive at the page (the laugh).
//   hold  PERFORMED (the gap after 78), from above (Notebook.Page): the page turns; three of your wrong answers in
//         pencil, each ringed red, "why?" in his blue pen and the fix boxed under it; your finger stops on the third,
//         its "why?" pops and the fix writes itself.
//   79    "Your mistakes. Every one.": pull back, the pages riffle, every one full of ringed rows. "Copied out, with a
//         'why?', and the fix.": you look at his empty chair, back down, and laugh once into your hand (after the WHY
//         and the fix are on screen: review 8:29).
//   80    the paper sheet (Notebook.Ladder), unchanged (the review's best moment): the saw crossed out, a ladder of your
//         mistake pages, him climbing. "You've been his textbook for two years.": your face, flattered.
//   81    two kinds of envy (Notebook.Sheets KindsSheet: one climbs, a hand pulls the other down by the ankle).
//   82    you sink into his chair; "It only proved your win hurt": his pen doodle in the margin, your head on the higher
//         step, his frown; the push into his head, his eyes up to you; inside it one region glows, a two-line label
//         (three seconds); back to you.
//   83    two red cards (-91 on his ladder, -71 by your sawn chair); you smile at "sweet"; the rival with the saw in
//         your chair's leg, a shaving falling (the laugh).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Chair } from "../sets/common";
import { READING, ReadingRoomBack } from "../sets/ReadingRoom";
import { aimArm, Dim, LampLight, Rows, S, timer, type Body } from "./Notebook.Parts";
import { KindsSheet } from "./Notebook.Sheets";
import { DoodleShot, HoldTop, NotebookTop, RiffleTop, ScanShot } from "./Notebook.Page";
import { LadderSheet, RivalSawShot, TwoRedShot } from "./Notebook.Ladder";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  const g0 = end(78); // the performed moment: the gap after line 78
  const g1 = from(79);
  const g = (p: number) => Math.round(mix(g0, g1, p));
  return {
    start: from(78), // the empty room; you cross two desks
    seat: at(78, 0.39), // "His seat's empty"
    open: at(78, 0.58), // "and his notebook's open"
    desk: at(78, 0.76), // you at his desk
    glance: at(78, 0.79), // "You look.": over one shoulder, the other
    dive: at(78, 0.88), // "Obviously.": you dive at the page
    turn: g0, // the page turns (from above)
    find: g(0.25), // your finger runs down the rows ...
    stop: g(0.5), // ... and stops on the third one
    why: g(0.6), // its "why?" pops
    fix: g(0.68), // and the fix writes itself
    done: g(0.92),
    ticks: from(79), // "Your mistakes. Every one.": pull back
    riffle: at(79, 0.16), // the pages riffle
    still: at(79, 0.5),
    chair: at(79, 0.58), // you look up at his empty chair
    down: at(79, 0.7), // and back down
    mouth: at(79, 0.82), // you laugh once into your hand
    ladder: from(80), // "He isn't sawing your chair."
    cross: at(80, 0.17), // the X over the saw
    build: at(80, 0.24), // "He's building a ladder."
    climb: at(80, 0.42), // "Out of your mistakes."
    face: at(80, 0.64), // "You've been his textbook for two years."
    kinds: from(81), // two kinds of envy
    up: at(81, 0.3), // "One pushes you to move up."
    down2: at(81, 0.62), // "The other pushes you to pull the other person down."
    sit: from(82), // you sink into his chair: "Minus never proved they wanted you to fail."
    hurt: at(82, 0.21), // "It only proved your win hurt.": his margin doodle
    win: at(82, 0.28), // "your win"
    pressed: at(82, 0.32), // "hurt"
    push: at(82, 0.38), // "In one brain-scan study": into his head
    envy: at(82, 0.53), // "envying a peer who did better"
    scan: at(82, 0.66), // inside: the brain
    lit: at(82, 0.84), // "a region also active in pain"
    back: at(82, 0.96), // back to you
    tags: from(83), // two cards, one colour
    sweet: at(83, 0.35), // "Which is sweet"
    rival: at(83, 0.47), // "until you remember the rival is minus seventy-one"
    saw: at(83, 0.77), // "and he does not build ladders."
    end: to,
  };
}

const FLOOR = READING.floor;
const HIS = READING.carrel(READING.minjun);
/** Where you stand at his desk (his pushed-back chair just behind you), and where his notebook is. */
const STAND_X = 845;
const BOOK = READING.notebook;

/** You standing at his desk, leaning over the page, your front hand on its edge. */
function overPage(lean = 14): Body {
  const body: Body = { x: STAND_X, y: FLOOR, scale: S, facing: 1, pose: { ...STAND, lean, armB: [-4, 12] } };
  body.pose = { ...body.pose, armF: aimArm(body, { x: BOOK.x - 40, y: BOOK.y - 8 }) };
  return body;
}

/** You in his chair, both hands on the desk. */
function inHisChair(): Body {
  const body: Body = { x: HIS.chair, y: READING.seatY(S), scale: S, facing: 1, pose: { ...SEATED, lean: 10 } };
  body.pose = { ...body.pose, armF: aimArm(body, { x: BOOK.x - 60, y: BOOK.y - 6 }), armB: aimArm(body, { x: BOOK.x - 110, y: BOOK.y - 4 }) };
  return body;
}

/** You at his desk with your front hand coming up to your mouth (`up` 0..1), the back hand on the page. */
function handToMouth(up: number): Body {
  const body = overPage(10);
  const head = headAt(body.x, body.y, S, body.pose);
  const mouth = { x: head.x + head.r * 0.45, y: head.y + head.r * 0.55 };
  const onPage = body.pose.armF;
  const atMouth = aimArm(body, mouth);
  body.pose = {
    ...body.pose,
    armB: aimArm(body, { x: BOOK.x - 70, y: BOOK.y - 6 }),
    armF: [mix(onPage[0], atMouth[0], up), mix(onPage[1], atMouth[1], up)],
  };
  return body;
}

// ------------------------------------------------------------------------------------------------ line 78

const ArriveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.seat, "chair"], [k.open, "book"], [k.desk, "desk"]]);
  if (shot === "book") {
    // "and his notebook's open": the open book from above under his lamp, his own notes on top
    const cam = camAt(frame, [[k.open, { x: 980, y: 560, zoom: 1.15 }], [k.desk, { x: 1000, y: 560, zoom: 1.25 }]]);
    return <NotebookTop frame={frame} cam={cam} leaf={0} why={0} fixFrom={k.end} fixTo={k.end + 1} finger={null} />;
  }
  // the walk: across two desks between the start and "His seat's empty", still walking in the chair close-up
  const x = mix(-60, STAND_X, ramp(frame, k.start, k.open));
  const walking = shot !== "desk";
  // "You look. Obviously.": a glance over each shoulder (the body turns), then a dive at the page
  const glance = frame >= k.glance && frame < k.dive ? (frame < k.glance + Math.round((k.dive - k.glance) / 2) ? -1 : 1) : 0;
  const dive = ramp(frame, k.dive, k.dive + 5);
  const pose = walking ? walkPose(frame * 0.35) : { ...STAND, lean: mix(6, 26, dive) };
  const facing: 1 | -1 = glance === -1 ? -1 : 1;
  const face = walking
    ? { ...EXPRESSIONS.neutral, lids: 0.3, look: { x: 0.8, y: 0.1 } }
    : glance !== 0
      ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.2, look: { x: 0.95, y: -0.1 } }
      : { brows: "raised" as const, lids: 0, mouth: dive > 0.5 ? "o" as const : "flat" as const, eyes: 1.15, look: { x: 0.8, y: 0.9 } };
  const cam: Camera = shot === "wide"
    ? camAt(frame, [[k.start, { x: 560, y: 640, zoom: 1.0 }], [k.seat, { x: 760, y: 650, zoom: 1.1 }]])
    : shot === "chair"
      ? camAt(frame, [[k.seat, { x: HIS.chair + 40, y: READING.seatTop - 70, zoom: 2.2 }], [k.open, { x: HIS.chair + 60, y: READING.seatTop - 70, zoom: 2.45 }]])
      : camAt(frame, [[k.desk, { x: 1000, y: 770, zoom: 1.9 }], [k.dive, { x: 990, y: 765, zoom: 1.95 }], [k.dive + 5, { x: 960, y: 780, zoom: 2.3 }]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "arrive", 3)}
      you={<Figure {...HERO} x={walking ? x : STAND_X} y={FLOOR} scale={S} facing={facing} pose={pose} {...face} blink={glance === 0 && blinking(frame, 1)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the performed moment

/** At his desk: you turn and look at his empty chair, back down at the page, and laugh once into your hand. */
const ChairShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.chair, "chair"], [k.down, "down"], [k.mouth, "mouth"]]);
  const up = ramp(frame, k.mouth, k.mouth + 8);
  const body = shot === "mouth" ? handToMouth(up) : overPage(shot === "chair" ? 4 : 12);
  if (shot === "chair") {
    body.pose = { ...STAND, lean: 6 };
    body.facing = -1;
    body.x = STAND_X + 60; // a step along, so his pushed-back chair is clear in the frame
  }
  // the laugh: shoulders hop twice behind the hand
  const hop = shot === "mouth" ? Math.max(0, Math.sin((frame - k.mouth - 6) / 2.2)) * 6 * (1 - ramp(frame, k.mouth + 26, k.mouth + 34)) : 0;
  body.y -= hop;
  const head = headAt(body.x, body.y, S, body.pose, body.facing);
  const face = shot === "chair"
    ? { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1.1, look: { x: 0.4, y: 0.9 } }
    : shot === "down"
      ? { brows: "raised" as const, lids: 0.1, mouth: "o" as const, eyes: 1.15, look: { x: 0.7, y: 0.95 } }
      : { brows: "raised" as const, lids: 0.55, mouth: "open" as const, eyes: 1, look: { x: 0.7, y: 0.6 } };
  const cam = shot === "chair"
    ? camAt(frame, [[k.chair, { x: 820, y: 800, zoom: 1.8 }], [k.down, { x: 810, y: 800, zoom: 1.9 }]])
    : shot === "down"
      ? camAt(frame, [[k.down, { x: 920, y: 770, zoom: 2.0 }], [k.mouth, { x: 930, y: 760, zoom: 2.1 }]])
      : camAt(frame, [[k.mouth, closeUp(head.x + 40, head.y + 20, 2.7)], [k.ladder, closeUp(head.x + 40, head.y + 20, 3.05)]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "chair", 2)} studiers={false}
      you={
        <>
          {/* his empty chair, pushed back into the aisle and catching the lamp: what you turn to look at */}
          {shot === "chair" && <Chair x={HIS.chair - 70} y={READING.seatTop} scale={1.2} color="#c99a68" />}
          <Figure {...HERO} {...body} {...face} blink={shot === "down" && blinking(frame, 2)} time={frame} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ line 80

const LadderShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const top = { x: 960, y: 560, zoom: 1.3 };
  return (
    <>
      <LampLight cam={top} view="top">
        <Stage cam={top} radius={0} origin={{ x: 0, y: 0 }} back={<ReadingRoomBack cam={top} view="top" />} actors={null} />
      </LampLight>
      <Dim amount={0.55} />
      <Stage cam={{ x: 960, y: 540, zoom: mix(1, 1.05, linear(frame, k.ladder, k.face)) }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={<LadderSheet frame={frame} at={k.ladder} cross={k.cross} build={k.build} climb={k.climb} />} />
    </>
  );
};

/** "You've been his textbook for two years.": your face over his page; it goes from stunned to quietly flattered. */
const FaceShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = overPage();
  const head = headAt(body.x, body.y, S, body.pose);
  const soft = ramp(frame, k.face + 30, k.face + 46);
  const face = soft < 0.5
    ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.15, look: { x: 0.7, y: 0.95 } }
    : { brows: "flat" as const, lids: 0.3, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0.2 } };
  const cam = camAt(frame, [[k.face, closeUp(head.x + 60, head.y + 10, 2.7)], [k.kinds, closeUp(head.x + 50, head.y + 10, 3.0)]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "face", 2)} studiers={false}
      you={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 2)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ line 81

const KindsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = overPage(8);
  const cam = drift({ x: 900, y: 720, zoom: 1.6 }, frame, "kinds", 3);
  return (
    <>
      <Rows frame={frame} cam={cam}
        you={<Figure {...HERO} {...body} {...EXPRESSIONS.sceptical} look={{ x: 0.7, y: 0.9 }} time={frame} />} />
      <Dim amount={0.45} />
      {/* the sheet sits high: the TWO KINDS OF ENVY card is in the lower left under it */}
      <Stage cam={{ x: 960, y: 540, zoom: mix(1, 1.04, linear(frame, k.kinds, k.sit)) }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={<g transform="translate(960 420) scale(0.88) translate(-960 -440)"><KindsSheet frame={frame} at={k.kinds} up={k.up} down2={k.down2} y={440} /></g>} />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 82

/** "Minus never proved they wanted you to fail.": you sink into his chair (from standing at his desk); and at `back`
 *  ("pain."), close on you there, the realisation. */
const SitShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const close = frame >= k.back;
  const sink = close ? 1 : ramp(frame, k.sit + 4, k.sit + 22);
  const seated = inHisChair();
  const standing = overPage(8);
  const body: Body = {
    x: mix(standing.x, seated.x, sink), y: mix(standing.y, seated.y, sink), scale: S, facing: 1,
    pose: lerpPose(standing.pose, seated.pose, sink),
  };
  const head = headAt(body.x, body.y, S, body.pose);
  const face = close
    ? { brows: "worry" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.5, y: 0.5 } }
    : { brows: "flat" as const, lids: mix(0.1, 0.35, sink), mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: 0.9 } };
  const cam = close
    ? camAt(frame, [[k.back, closeUp(seated.x + 50, head.y + 10, 2.6)], [k.tags, closeUp(seated.x + 45, head.y + 10, 2.8)]])
    : camAt(frame, [[k.sit, { x: 930, y: 740, zoom: 1.6 }], [k.hurt, { x: 900, y: 750, zoom: 1.85 }]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "sit", 2)} chairOut={sink > 0.5 ? [] : undefined} studiers={!close}
      seated={sink > 0.5 ? <Figure {...HERO} {...body} {...face} blink={blinking(frame, 3)} time={frame} /> : null}
      you={sink > 0.5 ? null : <Figure {...HERO} {...body} {...face} blink={blinking(frame, 3)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ line 83

/** "A card has one colour for every kind of hurt. Which is sweet,": your face in his chair, a small smile on "sweet". */
const SweetShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = inHisChair();
  const head = headAt(body.x, body.y, S, body.pose);
  const cam = camAt(frame, [[k.sweet, closeUp(head.x + 50, head.y + 10, 2.6)], [k.rival, closeUp(head.x + 45, head.y + 10, 2.8)]]);
  const remember = frame >= k.rival - 6;
  return (
    <Rows frame={frame} cam={drift(cam, frame, "sweet", 2)} chairOut={[]} studiers={false}
      seated={<Figure {...HERO} {...body} brows={remember ? "raised" : "flat"} lids={remember ? 0 : 0.3} mouth={remember ? "o" : "smile"} eyes={remember ? 1.2 : 1}
        look={{ x: 0.8, y: 0.2 }} blink={!remember && blinking(frame, 3)} time={frame} />} you={null} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Notebook: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "arrive"], [k.turn, "hold"], [k.ticks, "riffle"], [k.chair, "chair"], [k.ladder, "ladder"], [k.face, "face"], [k.kinds, "kinds"],
    [k.sit, "sit"], [k.hurt, "doodle"], [k.scan, "scan"], [k.back, "sit"], [k.tags, "tags"], [k.sweet, "sweet"], [k.rival, "rival"], [k.saw, "saw"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "arrive" && <ArriveShot frame={frame} k={k} />}
      {scene === "hold" && <HoldTop frame={frame} turn={k.turn} find={k.find} stop={k.stop} why={k.why} fix={k.fix} done={k.done} />}
      {scene === "riffle" && <RiffleTop frame={frame} at={k.ticks} riffle={k.riffle} still={k.still} />}
      {scene === "chair" && <ChairShot frame={frame} k={k} />}
      {scene === "ladder" && <LadderShot frame={frame} k={k} />}
      {scene === "face" && <FaceShot frame={frame} k={k} />}
      {scene === "kinds" && <KindsShot frame={frame} k={k} />}
      {scene === "sit" && <SitShot frame={frame} k={k} />}
      {scene === "doodle" && <DoodleShot frame={frame} at={k.hurt} win={k.win} hurt={k.pressed} push={k.push} envy={k.envy} end={k.scan} />}
      {scene === "scan" && <ScanShot frame={frame} at={k.scan} lit={k.lit} end={k.back} />}
      {(scene === "tags" || scene === "rival") && <TwoRedShot frame={frame} at={k.tags} rival={k.rival} />}
      {scene === "sweet" && <SweetShot frame={frame} k={k} />}
      {scene === "saw" && <RivalSawShot frame={frame} at={k.saw} to={k.end} />}
    </AbsoluteFill>
  );
};

export const notebook: Beat = { id: "Notebook", firstLine: 78, Component: Notebook };
