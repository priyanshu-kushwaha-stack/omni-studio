// Beat "The Ladder" (script v5, 2026-11-14; story.json lines 78-83; mood lamp). The late-night study room past midnight
// (sets/ReadingRoom.tsx). Every frame comes from the clips (`times`), one component per shot.
//
//   78    wide along the rows; you walk in. Then his desk: the chair pushed back, the notebook open under his lamp. "You
//         look. Obviously.": you glance over one shoulder, the other, and dive at the page (the laugh).
//   hold  5 s, PERFORMED (the gap after 78): your hand turns the page; your own wrong answers copied clean in his
//         handwriting, a "?" beside each and the fix under it; your finger stops on the third (YOUR ringed mark, his
//         blue fix); you look at his empty chair, back down, and laugh once into your hand.
//   79    "Your mistakes. Every one. Copied out, with a 'why?', and the fix.": the page from above, "why?" in his pen.
//   80    the paper sheet (Notebook.Ladder): your best friend sawing your chair, crossed out; a ladder of your mistake
//         pages, and him climbing it. "You've been his textbook for two years.": your face, flattered.
//   81    two kinds of envy (Notebook.Sheets KindsSheet; the TWO KINDS OF ENVY card, Captions.tsx, lower left).
//   82    you sit in his chair; "It only proved your win hurt"; then the brain-scan sheet (c05).
//   83    two red cards, -91 and -71 (one colour for every hurt); you smile at "sweet"; the rival with a saw (the laugh).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { MeterSound, headAt } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Chair } from "../sets/common";
import { READING, ReadingRoomBack, TOP } from "../sets/ReadingRoom";
import { aimArm, Dim, LampLight, MistakeMark, PointingHand, Rows, S, timer, type Body } from "./Notebook.Parts";
import { BrainSheet, KindsSheet } from "./Notebook.Sheets";
import { LadderSheet, RivalSawShot, TwoRedShot } from "./Notebook.Ladder";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  const g0 = end(78); // the performed moment: the gap after line 78
  const g1 = from(79);
  const g = (p: number) => Math.round(mix(g0, g1, p));
  return {
    start: from(78), // wide along the rows; you walk in
    seat: at(78, 0.42), // "His seat's empty, and his notebook's open."
    glance: at(78, 0.74), // "You look.": over one shoulder, the other
    dive: at(78, 0.9), // "Obviously.": you dive at the page
    turn: g0 - 2, // your hand turns the page (from above)
    find: g(0.22), // your finger runs down the rows ...
    stop: g(0.4), // ... and stops on the third one
    chair: g(0.52), // you look up at his empty chair
    down: g(0.68), // and back down
    mouth: g(0.8), // you laugh once into your hand
    ticks: from(79), // "Your mistakes. Every one."
    why: at(79, 0.5), // "with a 'why?'"
    fix: at(79, 0.82), // "and the fix"
    ladder: from(80), // "He isn't sawing your chair."
    cross: at(80, 0.17), // the X over the saw
    build: at(80, 0.24), // "He's building a ladder."
    climb: at(80, 0.42), // "Out of your mistakes."
    face: at(80, 0.64), // "You've been his textbook for two years."
    kinds: from(81), // two kinds of envy
    up: at(81, 0.3), // "One pushes you to move up."
    down2: at(81, 0.62), // "The other pushes you to pull the other person down."
    sit: from(82), // you sit in his chair: "Minus never proved they wanted you to fail."
    hurt: at(82, 0.21), // "It only proved your win hurt."
    brain: at(82, 0.35), // "In one brain-scan study"
    envy: at(82, 0.5), // "envying a peer"
    lit: at(82, 0.84), // "a region also active in pain"
    tags: from(83), // two cards, one colour
    sweet: at(83, 0.36), // "Which is sweet"
    rival: at(83, 0.46), // "until you remember the rival is minus seventy-one"
    saw: at(83, 0.76), // "and he does not build ladders."
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
  const shot = current(frame, [[k.start, "wide"], [k.seat, "seat"]]);
  const walking = frame < k.seat - 4;
  const x = mix(120, STAND_X, ramp(frame, k.start, k.seat - 4));
  // "You look. Obviously.": a glance over each shoulder (the body turns), then a dive at the page
  const glance = frame >= k.glance && frame < k.dive ? (frame < k.glance + Math.round((k.dive - k.glance) / 2) ? -1 : 1) : 0;
  const dive = ramp(frame, k.dive, k.dive + 5);
  const pose = walking ? walkPose(frame * 0.3) : { ...STAND, lean: mix(6, 26, dive) };
  const sawIt = ramp(frame, k.seat + 8, k.seat + 22);
  const facing: 1 | -1 = glance === -1 ? -1 : 1;
  const face = shot === "wide"
    ? { ...EXPRESSIONS.neutral, lids: 0.3, look: { x: 0.8, y: 0.1 } }
    : glance !== 0
      ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.2, look: { x: 0.95, y: -0.1 } }
      : { brows: sawIt > 0.5 ? "raised" as const : "flat" as const, lids: mix(0.3, 0, sawIt), mouth: dive > 0.5 ? "o" as const : "flat" as const, eyes: mix(1, 1.15, sawIt), look: { x: 0.8, y: mix(0.1, 0.9, sawIt) } };
  const cam: Camera = shot === "wide"
    ? camAt(frame, [[k.start, { x: 700, y: 640, zoom: 1.05 }], [k.seat, { x: 860, y: 660, zoom: 1.12 }]])
    : camAt(frame, [[k.seat, { x: 1010, y: 770, zoom: 1.85 }], [k.dive, { x: 990, y: 765, zoom: 1.95 }], [k.dive + 5, { x: 960, y: 780, zoom: 2.3 }]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "arrive", 3)}
      you={<Figure {...HERO} x={x} y={FLOOR} scale={S} facing={facing} pose={pose} {...face} blink={glance === 0 && blinking(frame, 1)} time={frame} />} />
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

/** Over the third row of the open page: your answer as your mock sheet had it, ringed in red (MistakeMark), "why?"
 *  in his blue pen from `whyFrom`, and his correction under it boxed in blue from `fixFrom`. */
const BLUE = "#2f5d9a";
const YourRow: React.FC<{ frame: number; ring: number; whyFrom: number; fixFrom: number }> = ({ frame, ring, whyFrom, fixFrom }) => {
  const r = TOP.row(2);
  const ax = r.x + r.len - 30;
  const w = r.work;
  const why = ramp(frame, whyFrom, whyFrom + 8);
  return (
    <g>
      <rect x={ax - 70} y={r.y - 26} width={110} height={52} fill={PAPER} />
      <MistakeMark x={ax - 14} y={r.y} scale={2} ring={ring} />
      {why > 0 && (
        <g transform={`translate(${r.mark.x + 70} ${r.mark.y + 4}) rotate(-6) scale(${why})`}>
          <rect x={-16} y={-40} width={130} height={56} rx={10} fill={PAPER} />
          <text x={0} y={2} fontFamily={FONT} fontWeight={800} fontStyle="italic" fontSize={46} fill={BLUE}>why?</text>
        </g>
      )}
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
            {finding && <YourRow frame={frame} ring={1} whyFrom={k.end} fixFrom={k.stop - 4} />}
            {finding
              ? <PointingHand x={mark.x - 30} y={mark.y + 34} rotate={-35} />
              : <PointingHand x={edge + 40} y={760} rotate={t < 0.5 ? -60 : 20} scale={0.9} />}
          </>
        } />
    </LampLight>
  );
};

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
      : camAt(frame, [[k.mouth, closeUp(head.x + 40, head.y + 20, 2.7)], [k.ticks, closeUp(head.x + 40, head.y + 20, 3.05)]]);
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

// ------------------------------------------------------------------------------------------------ line 79

/** "Your mistakes. Every one. Copied out, with a 'why?', and the fix.": the page from above, panning down the rows. */
const TicksShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.ticks, { x: 960, y: 560, zoom: 1.15 }], [k.why - 10, { x: 700, y: 470, zoom: 1.6 }], [k.ladder, { x: 760, y: 500, zoom: 1.75 }]]);
  return (
    <LampLight cam={cam} view="top">
      <Stage cam={drift(cam, frame, "ticks", 2)} radius={0} origin={{ x: 0, y: 0 }} back={<ReadingRoomBack cam={cam} view="top" />}
        actors={<YourRow frame={frame} ring={1} whyFrom={k.why} fixFrom={k.fix} />} />
    </LampLight>
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

const SitShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = inHisChair();
  const head = headAt(body.x, body.y, S, body.pose);
  const shot = current(frame, [[k.sit, "medium"], [k.hurt, "close"]]);
  const sink = ramp(frame, k.hurt + 4, k.hurt + 24);
  const face = shot === "medium"
    ? { ...EXPRESSIONS.sceptical, look: { x: 0.7, y: 0.9 } }
    : { brows: "worry" as const, lids: mix(0.2, 0.4, sink), mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: mix(0.9, 0.4, sink) } };
  const cam = shot === "medium"
    ? camAt(frame, [[k.sit, { x: 930, y: 760, zoom: 1.7 }], [k.hurt, { x: 900, y: 750, zoom: 1.85 }]])
    : camAt(frame, [[k.hurt, closeUp(head.x + 50, head.y + 10, 2.7)], [k.brain, closeUp(head.x + 45, head.y + 10, 2.95)]]);
  return (
    <Rows frame={frame} cam={drift(cam, frame, "sit", 2)} chairOut={[]} studiers={shot === "medium"}
      seated={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 3)} time={frame} />} you={null} />
  );
};

const BrainShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = inHisChair();
  return (
    <>
      <Rows frame={frame} cam={drift({ x: 940, y: 740, zoom: 1.5 }, frame, "brain", 3)} chairOut={[]}
        seated={<Figure {...HERO} {...body} {...EXPRESSIONS.sad} look={{ x: 0.7, y: 0.6 }} time={frame} />} you={null} />
      <Dim amount={0.45} />
      <Stage cam={{ x: 960, y: 540, zoom: mix(1, 1.05, linear(frame, k.brain, k.tags)) }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={<BrainSheet frame={frame} at={k.brain} envy={k.envy} pain={k.lit} />} />
    </>
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
    [0, "arrive"], [k.turn, "turn"], [k.chair, "chair"], [k.ticks, "ticks"], [k.ladder, "ladder"], [k.face, "face"], [k.kinds, "kinds"],
    [k.sit, "sit"], [k.brain, "brain"], [k.tags, "tags"], [k.sweet, "sweet"], [k.rival, "rival"], [k.saw, "saw"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "arrive" && <ArriveShot frame={frame} k={k} />}
      {scene === "turn" && <TurnShot frame={frame} k={k} />}
      {scene === "chair" && <ChairShot frame={frame} k={k} />}
      {scene === "ticks" && <TicksShot frame={frame} k={k} />}
      {scene === "ladder" && <LadderShot frame={frame} k={k} />}
      {scene === "face" && <FaceShot frame={frame} k={k} />}
      {scene === "kinds" && <KindsShot frame={frame} k={k} />}
      {scene === "sit" && <SitShot frame={frame} k={k} />}
      {scene === "brain" && <BrainShot frame={frame} k={k} />}
      {(scene === "tags" || scene === "rival") && <TwoRedShot frame={frame} at={k.tags} rival={k.rival} />}
      {scene === "sweet" && <SweetShot frame={frame} k={k} />}
      {scene === "saw" && <RivalSawShot frame={frame} at={k.saw} to={k.end} />}
      <MeterSound at={k.tags + 2} volume={0.8} />
      <MeterSound at={k.tags + 12} volume={0.8} />
    </AbsoluteFill>
  );
};

export const notebook: Beat = { id: "Notebook", firstLine: 78, Component: Notebook };
