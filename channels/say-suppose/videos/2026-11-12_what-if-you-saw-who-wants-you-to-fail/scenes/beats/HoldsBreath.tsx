// Beat "The Country Holds Its Breath" (v7, 2026-11-14, outside review of v6; story.json lines 91-96; mood morning).
// Every frame comes from the clips (fractions of a line placed on its words), one component per shot, in the order
// things happen. No card opens.
//
//   91    the night before (HoldsBreath.Choice.tsx): in, notebook down, in three beats; from above it opens on a
//         corrected page and shuts; the bar snaps, the SMALLER half goes on top, a hesitation, the swap to the bigger
//         half; close on you eating the small half ("not a monster"); your hand rests on the notebook, lets go ("You
//         leave it anyway"); the half stands upright and becomes a ladder ("the good wood"); a smile; out.
//   92    exam morning at the gate (HoldsBreath.Gate.tsx): you walk up (two framings); the crowd parts on "and there in
//         the crowd"; the vest's stripes catch the light; her face; the six-tier lunch box, the camera tilting up it.
//   hold  3.3 s, wordless, the one tender beat: your eyes go up the stack; fingers touch on the box; her mouth opens and
//         shuts; one nod; she steps back.
//   93    her face, nothing over it; the bell; you turn.
//   94    from inside the yard the gate rolls shut across the frame on "closes"; then the hall from above goes quiet.
//   95    the montage (HoldsBreath.Air.tsx): a jet taxis up ("In November 2025"; the card, Captions.tsx, lower left);
//         you listening in the hall; the tower's STOP paddle; the nose wheel halts at the hold line; planes stack up
//         circling; the empty runway, the paper plane held still a second; one pencil on one sheet.
//   hold  3.3 s inside the exam: the pencil, then every sheet in the hall turns at once, then nothing moves.
//   96    the hall from high above; the sheet's corner "1" match-cuts to the day pad; the month at your desk.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { examHall, Mug, PASTELS } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt } from "../parts";
import { blinking, camAt, current, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { READING } from "../sets/ReadingRoom";
import { aimArm, Fade, Rows, S, timer, type Body } from "./Notebook.Parts";
import { CornerShot, EmptyRunwayShot, PencilShot, StackShot, TaxiShot, TowerShot, WheelShot } from "./HoldsBreath.Air";
import { BookShot, ChocShot, CostShot, EatShot, GoShot, LadderShot, PlaceShot, SmileShot } from "./HoldsBreath.Choice";
import { BoxShot, GateShot, HandOffShot, NothingShot, RevealShot, ShutShot } from "./HoldsBreath.Gate";
import { DayPad, ExamTopBack, HALL, MistakeBookSide } from "./HoldsBreath.Parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;
export type HoldsTimes = T;

/** The line fractions sit on the words of the v7 narration (narration/words.json), e.g. 91 "fix" at 0.32. */
function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  const p = (q: number) => Math.round(mix(end(92), from(93), q)); // the 3.3 s performed hold after line 92
  const h = (q: number) => Math.round(mix(end(95), from(96), q)); // the 3.3 s hold after the planes
  return {
    place: from(91), // "The night before, you leave your own notebook on his desk."
    open: at(91, 0.175), // "Every mistake you made this year,": the notebook from above
    cover: at(91, 0.198), // it opens
    riffle: at(91, 0.225), // a year of pages
    tick: at(91, 0.322), // "and the fix."
    fold: at(91, 0.341), // it shuts
    brk: at(91, 0.355), // "Half a chocolate bar
    snap: at(91, 0.372), // (snap)
    small: at(91, 0.435), // on top.": the smaller half
    swap: at(91, 0.485), // "The bigger half.": the swap
    eat: at(91, 0.54), // "You're competitive,
    pop: at(91, 0.594), // not a monster.": the small half, gone
    cost: at(91, 0.655), // "It might cost you first place."
    hand: at(91, 0.735), // your hand on the cover, from above
    lift: at(91, 0.8), // "You leave it anyway.": it lets go
    ladder: at(91, 0.85), // "If he's building a ladder,
    smile: at(91, 0.93), // he can have the good wood."
    go: at(91, 0.985), // out
    gate: from(92), // "Exam morning. Outside every exam school,
    crowd: at(92, 0.23), // parents crowd the gate to see their kids in.
    part: at(92, 0.39), // And there in the crowd, straight off the night shift,
    vest: at(92, 0.62), // still in her vest:
    sister: at(92, 0.715), // your sister.
    box: at(92, 0.785), // With a lunch box
    tilt: at(92, 0.84), // packed like the exam lasts a week."
    react: end(92), // the hold: your eyes go up the stack
    hands: p(0.27), // fingers touch
    nod: p(0.58), // the words she doesn't say; the nod
    back: p(0.84), // she steps back
    nothing: from(93), // "Neither of you says a word. Nothing opens.
    air: at(93, 0.5), // the empty air over her head
    bell: at(93, 0.8), // the bell
    closes: from(94), // "The gate closes behind you.
    exam: at(94, 0.55), // And the whole country goes quiet."
    taxi: from(95), // "It's true. In November 2025,
    listen: at(95, 0.25), // during the English listening test,
    tower: at(95, 0.4), // South Korea stopped its planes
    wheel: at(95, 0.55), // taking off
    wstop: at(95, 0.625), // (the wheel stops)
    stack: at(95, 0.64), // and landing for 35 minutes,
    empty: at(95, 0.785), // so their noise
    pencil: at(95, 0.86), // wouldn't disturb the students."
    turn: h(0.32), // the hold: every sheet turns at once
    still: h(0.64), // then nothing moves
    breath: from(96), // "A country holds its breath for you.
    corner: at(96, 0.335), // Results come in a month.
    wait: at(96, 0.45), // For a month, you say nothing to anyone."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the nights (96)

const YOU = READING.carrel(READING.you);

/** You at your desk on one night of the week: 0 writing, 1 asleep on your jacket, 2 writing, 3 a yawn. */
function nightPose(s: number, frame: number): { body: Body; face: object } {
  const body: Body = { x: YOU.chair, y: READING.seatY(S), scale: S, facing: 1, pose: { ...SEATED, lean: 12 } };
  const pen = { x: YOU.desk.from + 150 + Math.sin(frame / 6) * 10, y: READING.deskTop - 6 };
  if (s === 1) {
    body.pose = { ...SEATED, lean: 45, tilt: 14, armF: [96, 4], armB: [92, 10] };
    return { body, face: { blink: true, mouth: "flat" as const } };
  }
  body.pose = { ...body.pose, armF: aimArm(body, pen), armB: aimArm(body, { x: YOU.desk.from + 90, y: READING.deskTop - 4 }) };
  if (s === 3) body.pose = { ...body.pose, lean: 2, tilt: -8, armB: [168, 6] };
  const face = s === 3
    ? { brows: "worry" as const, lids: 0.6, mouth: "o" as const, eyes: 1, look: { x: 0.4, y: -0.2 } }
    : { brows: "flat" as const, lids: s === 2 ? 0.45 : 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: 0.95 } };
  return { body, face };
}

const Night: React.FC<{ frame: number; s: number; cam: Camera }> = ({ frame, s, cam }) => {
  const { body, face } = nightPose(s, frame);
  const lit = [[0, 2, 5, 6], [2, 6], [1, 2, 4, 5], [2, 7]][s];
  const extra = (
    <g>
      {s === 1 && <rect x={YOU.desk.from + 50} y={READING.deskTop - 34} width={130} height={34} rx={17} fill="#5a6488" stroke="#23252b" strokeWidth={4} />}
      {s === 2 && <Mug x={YOU.desk.to - 60} y={READING.deskTop} scale={0.8} />}
      {s !== 1 && <MistakeBookSide x={YOU.desk.from + 170} y={READING.deskTop} scale={0.9} />}
    </g>
  );
  return (
    <Rows frame={frame} cam={drift(cam, frame, `night${s}`, 2)} lit={lit} chairOut={[]} notebook={false} studiers={s % 2 === 0}
      farPeople={[0.5, 0.15, 0.35, 0.1][s]} extra={extra}
      seated={<Figure {...HERO} {...body} {...face} time={frame} />} you={null} />
  );
};

/** Nights at your desk in the study room between frames a and b, `n` of them in dissolves (cycling the four). */
const Nights: React.FC<{ frame: number; a: number; b: number; n: number; from: Camera; to: Camera; dissolve?: number }> = ({ frame, a, b, n, from, to, dissolve = 14 }) => {
  const len = (b - a) / n;
  const p = (frame - a) / len;
  const i = Math.max(0, Math.min(n - 1, Math.floor(p)));
  const into = (p - i) * len;
  const fade = i > 0 && into < dissolve ? 1 - into / dissolve : 0;
  const cam = camAt(frame, [[a, from], [b, to]]);
  return (
    <>
      <Night frame={frame} s={i % 4} cam={cam} />
      <Fade opacity={fade}><Night frame={frame} s={(i + 3) % 4} cam={cam} /></Fade>
    </>
  );
};

/** Line 96, the month: night after night at your desk, the lamps changing round you, while the day pad tears through
 *  the month and stops on results day, ringed in red, just before the results (TextOpensNothing). */
const WaitShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => (
  <>
    <Nights frame={frame} a={k.wait} b={k.end} n={6} from={{ x: 640, y: 740, zoom: 1.35 }} to={{ x: 580, y: 780, zoom: 1.6 }} dissolve={8} />
    <DayPad frame={frame} from={k.wait + 4} land={k.end - 20} />
  </>
);

// ------------------------------------------------------------------------------------------------ the hall (94-96)

const yourDesk = { x: HALL.cols[HALL.you.c], y: HALL.rows[HALL.you.r] };

const HallShot: React.FC<{ frame: number; from: Camera; to: Camera; a: number; b: number; turn?: number; still?: boolean }> = ({ frame, from, to, a, b, turn, still }) => {
  const cam = drift(camAt(frame, [[a, from], [b, to]]), frame, "hall", 2);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ExamTopBack cam={cam} frame={frame} turn={turn} still={still} />} actors={null} />;
};

const EXAM_OPTS = { ...examHall.defaults, minute: 12 };

/** "...during the English listening test,": the hall side on, you at your desk, eyes up, listening. Framed with the
 *  faces high and right: the NOVEMBER 2025 card (Captions.tsx) holds the lower left. */
const ListenShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const seat = examHall.spots.seat2;
  const head = headAt(seat.x, seat.y, seat.scale, SEATED);
  const at = (zoom: number): Camera => ({ x: head.x - 390 / zoom, y: head.y + 170 / zoom, zoom });
  const cam = drift(camAt(frame, [[k.listen, at(1.9)], [k.tower, at(2.1)]]), frame, "listen", 2);
  const props = { cam, mood: "morning" as const, frame, options: EXAM_OPTS };
  const writer: Pose = { ...SEATED, lean: 14, armF: [80, 30] };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={examHall.Back(props)}
      actors={
        <>
          <Figure x={examHall.spots.seat1.x} y={examHall.spots.seat1.y} scale={seat.scale} pose={writer} head={PASTELS[0]} coat="#3b4a6b" lids={0.4} look={{ x: 0.5, y: 1 }} mouth="flat" time={frame} />
          <Figure {...HERO} x={seat.x} y={seat.y} scale={seat.scale} pose={{ ...SEATED, armF: [70, 40] }} brows="raised" lids={0.05} mouth="flat"
            look={{ x: 0.3, y: -0.5 }} blink={blinking(frame, 4)} time={frame} />
          <Figure x={examHall.spots.seat3.x} y={examHall.spots.seat3.y} scale={seat.scale} pose={writer} head={PASTELS[4]} coat="#2a2d36" lids={0.4} look={{ x: 0.5, y: 1 }} mouth="flat" time={frame} />
          {examHall.Mid?.(props)}
        </>
      } />
  );
};

/** The paper plane held still over the airport. */
const PLANE = { x: 760, y: 210 };

// ------------------------------------------------------------------------------------------------ the beat

const HoldsBreath: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot.clips, shot.to);
  const scene = current(frame, [
    [0, "place"], [k.open, "book"], [k.brk, "choc"], [k.eat, "eat"], [k.cost, "cost"], [k.hand, "ladder"], [k.smile, "smile"], [k.go, "go"],
    [k.gate, "gate"], [k.part, "reveal"], [k.box, "box"], [k.react, "handoff"], [k.nothing, "nothing"], [k.closes, "closes"], [k.exam, "exam"],
    [k.taxi, "taxi"], [k.listen, "listen"], [k.tower, "tower"], [k.wheel, "wheel"], [k.stack, "stack"], [k.empty, "empty"], [k.pencil, "pencil"],
    [k.turn, "turn"], [k.breath, "breath"], [k.corner, "corner"], [k.wait, "wait"],
  ]);
  const hallClose = { x: yourDesk.x, y: yourDesk.y + 70, zoom: 2.4 };
  const hallMid = { x: yourDesk.x, y: yourDesk.y, zoom: 1.3 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "place" && <PlaceShot frame={frame} k={k} />}
      {scene === "book" && <BookShot frame={frame} k={k} />}
      {scene === "choc" && <ChocShot frame={frame} k={k} />}
      {scene === "eat" && <EatShot frame={frame} k={k} />}
      {scene === "cost" && <CostShot frame={frame} k={k} />}
      {scene === "ladder" && <LadderShot frame={frame} k={k} />}
      {scene === "smile" && <SmileShot frame={frame} k={k} />}
      {scene === "go" && <GoShot frame={frame} k={k} />}
      {scene === "gate" && <GateShot frame={frame} k={k} />}
      {scene === "reveal" && <RevealShot frame={frame} k={k} />}
      {scene === "box" && <BoxShot frame={frame} k={k} />}
      {scene === "handoff" && <HandOffShot frame={frame} k={k} />}
      {scene === "nothing" && <NothingShot frame={frame} k={k} />}
      {scene === "closes" && <ShutShot frame={frame} k={k} />}
      {scene === "exam" && <HallShot frame={frame} a={k.exam} b={k.taxi} from={hallClose} to={{ x: yourDesk.x, y: yourDesk.y - 60, zoom: 0.9 }} />}
      {scene === "taxi" && <TaxiShot frame={frame} a={k.taxi} b={k.listen} />}
      {scene === "listen" && <ListenShot frame={frame} k={k} />}
      {scene === "tower" && <TowerShot frame={frame} a={k.tower} b={k.wheel} />}
      {scene === "wheel" && <WheelShot frame={frame} a={k.wheel} b={k.stack} stop={k.wstop} />}
      {scene === "stack" && <StackShot frame={frame} a={k.stack} b={k.empty} />}
      {scene === "empty" && <EmptyRunwayShot frame={frame} a={k.empty} b={k.pencil} plane={PLANE} />}
      {scene === "pencil" && <PencilShot frame={frame} a={k.pencil} b={k.turn} />}
      {scene === "turn" && <HallShot frame={frame} a={k.turn} b={k.breath} from={hallMid} to={{ ...hallMid, zoom: 1.2 }}
        turn={ramp(frame, k.turn + 4, k.turn + 24)} still={frame >= k.still} />}
      {scene === "breath" && <HallShot frame={frame} a={k.breath} b={k.corner} from={{ x: 960, y: 520, zoom: 0.8 }} to={{ x: 960, y: 540, zoom: 0.62 }} turn={1} still />}
      {scene === "corner" && <CornerShot frame={frame} a={k.corner} />}
      {scene === "wait" && <WaitShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const holdsBreath: Beat = { id: "HoldsBreath", firstLine: 91, Component: HoldsBreath };
