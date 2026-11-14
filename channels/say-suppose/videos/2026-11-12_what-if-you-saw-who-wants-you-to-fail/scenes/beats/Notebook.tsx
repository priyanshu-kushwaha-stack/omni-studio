// Beat "The Notebook" (script.md v2.1 "The Notebook"; narration lines 80-88; mood lamp). The late-night study room past
// midnight (sets/ReadingRoom.tsx). Every frame comes from the clips (`times`), one component per shot.
//
//   80    wide along the rows, dark between the lamps; you walk in. Then his desk: the chair pushed back, the notebook
//         open under his lamp, you stop at it.
//   hold  5 s, PERFORMED (the gap after line 80): your hand turns the page under his lamp; your own wrong answers copied
//         clean in his handwriting, a "?" beside each and under it his working-out that gets it right; your finger
//         stops on the third one: YOUR mark, the hooked answer in the red ring from your mock sheet, and under it his
//         correction in blue pen, ticked (outside review of v4.1); you turn and look at his empty chair, then back
//         down; your other hand comes up to your mouth.
//   81    "You stopped helping him...": your face, hand at your mouth; then his working-outs from above, each ticked.
//   82    close-up: your face over the page; it softens on "He's climbing."
//   83    a paper sheet: two kinds of envy as actions: your best friend climbing paper steps; a hand from below pulling
//         a figure off a ledge (Notebook.Sheets).
//   84    you sit in his chair; close on "It meant it hurt."
//   85    briefly, a paper sheet: one head, envy's patch and pain's patch overlapping; then your face again.
//   86    insert: two cards side by side, both red, the same number.
//   87    your classroom cluster in one pool of light; your sister's portrait outside it in the dark, darker on "Outside
//         yours, nobody bleeds." (in place of v4.1's top-down lanes, which were hard to read)
//   88    you alone in his chair under one lamp; the camera pulls back down the dark row.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { INK, PAPER } from "@whatif/kit/theme";
import { Meter, MeterSound, headAt } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Chair } from "../sets/common";
import { READING, ReadingRoomBack, TOP } from "../sets/ReadingRoom";
import { aimArm, Dim, LampLight, MistakeMark, PointingHand, Rows, S, timer, type Body } from "./Notebook.Parts";
import { BrainSheet, ClusterShot, KindsSheet } from "./Notebook.Sheets";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  const g0 = end(80); // the performed moment: the gap after line 80
  const g1 = from(81);
  const g = (p: number) => Math.round(mix(g0, g1, p));
  return {
    start: from(80), // wide along the rows; you walk in
    seat: at(80, 0.5), // "His seat's empty": his desk
    turn: g0 - 4, // your hand turns the page (from above)
    find: g(0.2), // your finger runs down the rows ...
    stop: g(0.38), // ... and stops on the third one
    chair: g(0.48), // you look up at his empty chair
    down: g(0.64), // and back down
    mouth: g(0.76), // your other hand comes up to your mouth
    helped: from(81), // "You stopped helping him."
    ticks: at(81, 0.5), // "He never stopped helping you.": his working-outs, ticked
    face: from(82) - 2, // your face over the page
    climb: at(82, 0.5), // "He's climbing."
    kinds: from(83), // two kinds of envy
    up: at(83, 0.28), // "One pushes you to move up."
    down2: at(83, 0.62), // "The other pushes you to pull the other person down."
    sit: from(84), // you sit in his chair
    hurt: at(84, 0.6), // "It meant it hurt."
    brain: from(85), // the brain-scan sheet
    lit: at(85, 0.55), // "a region also active in pain"
    brainOut: at(85, 0.78), // the sheet goes (kept brief): your face again to the end of the line
    tags: from(86), // two cards, one colour
    lane: from(87), // the room from above
    dim: at(87, 0.6), // "Outside yours, nobody bleeds."
    one: from(88) - 2, // you alone under one lamp
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

// ------------------------------------------------------------------------------------------------ line 80

const ArriveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.seat, "seat"]]);
  const walking = frame < k.seat - 4;
  const x = mix(120, STAND_X, ramp(frame, k.start, k.seat - 4));
  const pose = walking ? walkPose(frame * 0.3) : { ...STAND, lean: 6 };
  const sawIt = ramp(frame, k.seat + 8, k.seat + 22);
  const face = shot === "wide"
    ? { ...EXPRESSIONS.neutral, lids: 0.3, look: { x: 0.8, y: 0.1 } }
    : { brows: sawIt > 0.5 ? "raised" as const : "flat" as const, lids: mix(0.3, 0, sawIt), mouth: "flat" as const, eyes: mix(1, 1.15, sawIt), look: { x: 0.8, y: mix(0.1, 0.9, sawIt) } };
  const cam: Camera = shot === "wide"
    ? camAt(frame, [[k.start, { x: 700, y: 640, zoom: 1.05 }], [k.seat, { x: 860, y: 660, zoom: 1.12 }]])
    : camAt(frame, [[k.seat, { x: 1010, y: 770, zoom: 1.85 }], [k.turn, { x: 980, y: 760, zoom: 2.0 }]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "arrive", 3)}
      you={<Figure {...HERO} x={x} y={FLOOR} scale={S} pose={pose} {...face} blink={blinking(frame, 1)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the performed moment

/** The page being turned, from above: a leaf swinging over the spine (t 0..1), blank but for its ruling. */
const Leaf: React.FC<{ t: number }> = ({ t }) => {
  if (t <= 0 || t >= 1) return null;
  const c = Math.cos(Math.PI * t);
  const p = TOP.right;
  return (
    <g transform={`translate(${p.x} 0) scale(${c} 1)`}>
      <rect x={0} y={p.y} width={p.w} height={p.h} rx={6} fill={c > 0 ? PAPER : "#efe3cc"} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 15 }, (_, i) => <line key={i} x1={14} y1={p.y + 35 + i * 40} x2={p.w - 14} y2={p.y + 35 + i * 40} stroke="#9fc0e0" strokeWidth={2} opacity={0.6} />)}
      <rect x={0} y={p.y} width={p.w} height={p.h} fill="#000" opacity={0.18 * (1 - Math.abs(c))} />
    </g>
  );
};

/** Over the third row of the open page: your answer as your mock sheet had it, ringed in red (MistakeMark), and his
 *  correction under it in blue pen (the page's own working and tick), boxed in blue from `fixFrom`. */
const BLUE = "#2f5d9a";
const YourRow: React.FC<{ ring: number; fixFrom: number }> = ({ ring, fixFrom }) => {
  const r = TOP.row(2);
  const ax = r.x + r.len - 30;
  const w = r.work;
  return (
    <g>
      <rect x={ax - 70} y={r.y - 26} width={110} height={52} fill={PAPER} />
      <MistakeMark x={ax - 14} y={r.y} scale={2} ring={ring} />
      <DrawLine d={`M${w.x - 14} ${w.y - 18} h${w.len + 70} v36 h${-(w.len + 70)} z`} from={fixFrom} to={fixFrom + 16} color={BLUE} width={5} />
    </g>
  );
};

/** From above: the page turns under your hand, then your finger runs down the rows and stops on the third one. */
const TurnShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const t = linear(frame, k.turn + 2, k.find - 4);
  const p = TOP.right;
  const edge = p.x + p.w * Math.cos(Math.PI * t);
  const row = mix(0, 2, ramp(frame, k.find + 4, k.stop));
  const lo = TOP.row(Math.floor(row)).mark, hi = TOP.row(Math.min(2, Math.floor(row) + 1)).mark;
  const f = row - Math.floor(row);
  const mark = { x: mix(lo.x, hi.x, f), y: mix(lo.y, hi.y, f) };
  const finding = frame >= k.find;
  const cam = camAt(frame, [
    [k.turn, { x: 920, y: 560, zoom: 1.05 }],
    [k.find, { x: 760, y: 520, zoom: 1.35 }],
    [k.chair, { x: 760, y: 560, zoom: 1.6 }],
  ]);
  return (
    <LampLight cam={cam} view="top">
      <Stage cam={drift(cam, frame, "turn", 2)} radius={0} origin={{ x: 0, y: 0 }}
        back={<ReadingRoomBack cam={cam} view="top" rows={1} marks={finding ? 1 : 0.5} />}
        actors={
          <>
            <Leaf t={t} />
            {finding && <YourRow ring={1} fixFrom={k.stop - 4} />}
            {finding
              ? <PointingHand x={mark.x - 30} y={mark.y + 34} rotate={-35} />
              : <PointingHand x={edge + 40} y={760} rotate={t < 0.5 ? -60 : 20} scale={0.9} />}
          </>
        } />
    </LampLight>
  );
};

/** At his desk: you turn and look at his empty chair, back down at the page, and your hand comes up to your mouth. */
const ChairShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.chair, "chair"], [k.down, "down"], [k.mouth, "mouth"]]);
  const up = ramp(frame, k.mouth + 4, k.mouth + 22);
  const body = shot === "mouth" ? handToMouth(up) : overPage(shot === "chair" ? 4 : 12);
  if (shot === "chair") {
    body.pose = { ...STAND, lean: 6 };
    body.facing = -1;
    body.x = STAND_X + 60; // a step along, so his pushed-back chair is clear in the frame
  }
  const head = headAt(body.x, body.y, S, body.pose, body.facing);
  const face = shot === "chair"
    ? { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1.1, look: { x: 0.4, y: 0.9 } }
    : shot === "down"
      ? { brows: "sad" as const, lids: 0.2, mouth: "flat" as const, eyes: 1.1, look: { x: 0.7, y: 0.95 } }
      : { brows: "sad" as const, lids: mix(0.2, 0.35, up), mouth: "o" as const, eyes: 1.15, look: { x: 0.7, y: 0.8 } };
  const cam = shot === "chair"
    ? camAt(frame, [[k.chair, { x: 820, y: 800, zoom: 1.8 }], [k.down, { x: 810, y: 800, zoom: 1.9 }]])
    : shot === "down"
      ? camAt(frame, [[k.down, { x: 920, y: 770, zoom: 2.0 }], [k.mouth, { x: 930, y: 760, zoom: 2.1 }]])
      : camAt(frame, [[k.mouth, closeUp(head.x + 40, head.y + 20, 2.7)], [k.ticks, closeUp(head.x + 40, head.y + 20, 3.05)]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "chair", 2)} studiers={false}
      you={
        <>
          {/* his empty chair, pushed back into the aisle and catching the lamp: what you turn to look at */}
          {shot === "chair" && <Chair x={HIS.chair - 70} y={READING.seatTop} scale={1.2} color="#c99a68" />}
          <Figure {...HERO} {...body} {...face} blink={shot !== "chair" && blinking(frame, 2)} time={frame} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ line 81

/** "He never stopped helping you.": his working-outs from above, each one ticked. */
const TicksShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.ticks, { x: 640, y: 420, zoom: 1.7 }], [k.face, { x: 1120, y: 640, zoom: 1.55 }]]);
  return (
    <LampLight cam={cam} view="top">
      <Stage cam={drift(cam, frame, "ticks", 2)} radius={0} origin={{ x: 0, y: 0 }} back={<ReadingRoomBack cam={cam} view="top" />}
        actors={<YourRow ring={1} fixFrom={k.ticks - 40} />} />
    </LampLight>
  );
};

// ------------------------------------------------------------------------------------------------ line 82

const FaceShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = overPage();
  const head = headAt(body.x, body.y, S, body.pose);
  const soft = ramp(frame, k.climb, k.climb + 20);
  const face = soft < 0.5
    ? { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.7, y: 0.95 } }
    : { brows: "worry" as const, lids: 0, mouth: "smile" as const, eyes: 1.1, look: { x: 0.6, y: mix(0.95, 0.5, soft) } };
  const cam = camAt(frame, [[k.face, closeUp(head.x + 60, head.y + 10, 2.7)], [k.kinds, closeUp(head.x + 50, head.y + 10, 3.0)]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "face", 2)} studiers={false}
      you={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 2)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ line 83

const KindsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = overPage(8);
  const cam = drift({ x: 900, y: 720, zoom: 1.6 }, frame, "kinds", 3);
  return (
    <>
      <Rows frame={frame} cam={cam}
        you={<Figure {...HERO} {...body} {...EXPRESSIONS.sceptical} look={{ x: 0.7, y: 0.9 }} time={frame} />} />
      <Dim amount={0.45} />
      <Stage cam={{ x: 960, y: 540, zoom: mix(1, 1.04, linear(frame, k.kinds, k.sit)) }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={<KindsSheet frame={frame} at={k.kinds} up={k.up} down2={k.down2} />} />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 84

const SitShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = inHisChair();
  const head = headAt(body.x, body.y, S, body.pose);
  const shot = current(frame, [[k.sit, "medium"], [k.hurt, "close"]]);
  const sink = ramp(frame, k.hurt + 4, k.hurt + 24);
  const face = shot === "medium"
    ? { ...EXPRESSIONS.sceptical, look: { x: 0.7, y: 0.9 } }
    : { brows: "sad" as const, lids: mix(0.2, 0.5, sink), mouth: sink > 0.5 ? "frown" as const : "flat" as const, eyes: 1, look: { x: 0.6, y: mix(0.9, 0.4, sink) } };
  const cam = shot === "medium"
    ? camAt(frame, [[k.sit, { x: 930, y: 760, zoom: 1.7 }], [k.hurt, { x: 900, y: 750, zoom: 1.85 }]])
    : camAt(frame, [[k.hurt, closeUp(head.x + 50, head.y + 10, 2.7)], [k.brain, closeUp(head.x + 45, head.y + 10, 2.95)]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "sit", 2)} chairOut={[]} studiers={shot === "medium"}
      seated={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 3)} time={frame} />} you={null} />
  );
};

// ------------------------------------------------------------------------------------------------ line 85

const BrainShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = inHisChair();
  if (frame >= k.brainOut) {
    // the sheet kept brief: back on your face in his chair to the end of the line
    const head = headAt(body.x, body.y, S, body.pose);
    const cam = camAt(frame, [[k.brainOut, closeUp(head.x + 50, head.y + 10, 2.6)], [k.tags, closeUp(head.x + 45, head.y + 10, 2.8)]]);
    return (
      <Rows frame={frame} cam={drift(cam, frame, "brainOut", 2)} chairOut={[]} studiers={false}
        seated={<Figure {...HERO} {...body} brows="sad" lids={0.4} mouth="flat" eyes={1} look={{ x: 0.6, y: 0.5 }} blink={blinking(frame, 3)} time={frame} />} you={null} />
    );
  }
  return (
    <>
      <Rows frame={frame} cam={drift({ x: 940, y: 740, zoom: 1.5 }, frame, "brain", 3)} chairOut={[]}
        seated={<Figure {...HERO} {...body} {...EXPRESSIONS.sad} look={{ x: 0.7, y: 0.6 }} time={frame} />} you={null} />
      <Dim amount={0.45} />
      <Stage cam={{ x: 960, y: 540, zoom: mix(1, 1.05, linear(frame, k.brain, k.brainOut)) }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={<BrainSheet frame={frame} at={k.brain} envy={k.brain + 16} pain={k.lit} />} />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 86

const TagsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = { x: 960, y: 540, zoom: mix(1, 1.08, linear(frame, k.tags, k.lane)) };
  const top = { x: 1000, y: 560, zoom: 1.3 };
  return (
    <>
      <LampLight cam={top} view="top">
        <Stage cam={top} radius={0} origin={{ x: 0, y: 0 }} back={<ReadingRoomBack cam={top} view="top" />} actors={null} />
      </LampLight>
      <Dim amount={0.6} />
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={
          <>
            <Meter frame={frame} at={k.tags + 2} until={k.lane} x={700} headY={800} r={150} value={-84} />
            <Meter frame={frame} at={k.tags + 10} until={k.lane} x={1220} headY={800} r={150} value={-84} />
          </>
        } />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 87

const LaneShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => <ClusterShot frame={frame} from={k.lane} dim={k.dim} to={k.one} />;

// ------------------------------------------------------------------------------------------------ line 88

const OneShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = inHisChair();
  const look = ramp(frame, k.one + 30, k.one + 50);
  const cam = camAt(frame, [[k.one, { x: 930, y: 760, zoom: 1.75 }], [k.end, { x: 940, y: 620, zoom: 0.98 }]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "one", 2)} chairOut={[]} lit={[READING.minjun]} studiers={false} farPeople={0.15}
      seated={<Figure {...HERO} {...body} brows="sad" lids={0.4} mouth="flat" look={{ x: mix(0.7, 0.9, look), y: mix(0.9, 0.1, look) }}
        blink={blinking(frame, 5)} time={frame} />} you={null} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Notebook: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "arrive"], [k.turn, "turn"], [k.chair, "chair"], [k.ticks, "ticks"], [k.face, "face"], [k.kinds, "kinds"], [k.sit, "sit"],
    [k.brain, "brain"], [k.tags, "tags"], [k.lane, "lane"], [k.one, "one"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "arrive" && <ArriveShot frame={frame} k={k} />}
      {scene === "turn" && <TurnShot frame={frame} k={k} />}
      {scene === "chair" && <ChairShot frame={frame} k={k} />}
      {scene === "ticks" && <TicksShot frame={frame} k={k} />}
      {scene === "face" && <FaceShot frame={frame} k={k} />}
      {scene === "kinds" && <KindsShot frame={frame} k={k} />}
      {scene === "sit" && <SitShot frame={frame} k={k} />}
      {scene === "brain" && <BrainShot frame={frame} k={k} />}
      {scene === "tags" && <TagsShot frame={frame} k={k} />}
      {scene === "lane" && <LaneShot frame={frame} k={k} />}
      {scene === "one" && <OneShot frame={frame} k={k} />}
      <MeterSound at={k.tags + 2} volume={0.8} />
      <MeterSound at={k.tags + 10} volume={0.8} />
    </AbsoluteFill>
  );
};

export const notebook: Beat = { id: "Notebook", firstLine: 80, Component: Notebook };
