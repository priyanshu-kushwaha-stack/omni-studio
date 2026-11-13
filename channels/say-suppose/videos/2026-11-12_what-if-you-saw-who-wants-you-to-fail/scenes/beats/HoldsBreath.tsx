// Beat "The Country Holds Its Breath" (script.md v4; v4 lines 97-106, see `times`; mood morning). Every frame comes
// from the clips, one component per shot, in the order things happen (owner on v3, 2026-11-13). No card opens.
//
//   97    a week in the study room in one dissolve: your desk, writing; asleep on a rolled jacket; writing; a yawn.
//   98-99 the night before the exam, the classroom at dusk: you at his empty desk with your notebook; close on the choice.
//   100   insert from above: the notebook onto his desk, half a chocolate bar on top; you walk out.
//   101   exam morning: the gate, parents along the wall; you walk up (the EXAM MORNING title, Captions.tsx).
//   102   between two of them, the work vest.
//   hold  6 s, PERFORMED (the gap after 102): the crowd parts and she's there, the lunch box in both hands; she holds it
//         out; close on you, looking at her face, not the air above it; the hands on the knot, fingers touch; her mouth
//         opens for the words she always says and shuts without them; she nods once; she steps back into the crowd;
//         the bell; you turn to the gate.
//   103   her face in the crowd, and the empty air over her head: nothing opens.
//   104   you walk into the gate with the lunch; then the exam hall from straight above, rows of heads; pull up.
//   105   the city skyline, one paper plane held still in the sky; then the hall side on, you listening (the planes
//         card, Captions.tsx).
//   hold  3 s (the gap after 105): the plane held still; the empty runway; the parents at the gate, not moving.
//   106   the hall from high above: "This year, a country holds its breath for you."
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { citySkyline, classroom, examHall, Mug, PASTELS } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Chocolate, headAt } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Deep } from "../sets/common";
import { READING } from "../sets/ReadingRoom";
import { aimArm, Fade, handAt, Rows, S, timer, type Body } from "./Notebook.Parts";
import {
  DeskTopBack, ExamTopBack, GATE, GateBack, GateCrowd, HALL, HandsOnHandle, JiyoonWithLunch, LunchBox, MistakeBook, MistakeBookSide,
  PaperPlane, RunwayBack,
} from "./HoldsBreath.Parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** On v4's lines (remap.ts; owner on v3, 2026-11-13: "In the crowd of parents, what is this scene depicting ? Exam
 *  Over ?"): the gate on exam morning now comes before the test, as it happens. 97 the week, 98 the notebook, 99 the
 *  choice, 100 left on his desk, 101 exam morning at the gate, 102 your sister in the crowd, the 6 s hand-off after it,
 *  103 nothing opens, 104 the gate closes, 105 the planes (the 3 s hold after it), 106 a country holds its breath. */
function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  const h = (p: number) => Math.round(mix(end(105), from(106), p)); // the 3 s hold after the planes
  const p = (q: number) => Math.round(mix(end(102), from(103), q)); // the 6 s performed moment after line 102
  return {
    week: from(97), // a week in the study room, one dissolve
    eve: from(98), // the night before the exam, the classroom at dusk
    choose: from(99), // "Give it to him, and he might pass you. Keep it, and first place stays yours."
    leave: from(100) - 2, // the notebook onto his desk, from above
    choc: at(100, 0.4), // "with half a chocolate bar on top"
    go: at(100, 0.72), // "He did it for you first." You walk out
    gate: from(101), // exam morning: the gate, the parents
    vest: at(102, 0.45), // "still in her work vest"
    part: p(0), // the performed moment: the crowd parts
    offer: p(0.2), // she holds it out
    look: p(0.29), // close on you: her face, not the air above it
    hands: p(0.44), // the hands on the knot; fingers touch
    nod: p(0.56), // her mouth opens for the words she always says, and shuts without them; she nods once
    back: p(0.8), // she steps back into the crowd
    bell: p(0.9), // the bell; you turn to the gate
    nothing: from(103), // "Neither of you says a word. Nothing opens."
    air: at(103, 0.55), // the empty air over her head
    month: from(104), // "The gate closes behind you": you walk in
    exam: at(104, 0.55), // "And the whole country goes quiet.": the hall from above
    sky: from(105), // "South Korea stopped its planes taking off and landing"
    listen: at(105, 0.55), // the hall side on, you listening
    plane: h(0), // the hold: the plane held still
    runway: h(0.34), // the empty runway
    still: h(0.67), // the parents at the gate, not moving
    breath: from(106), // "This year, a country holds its breath for you."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ line 97

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

const WeekShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const n = 4;
  const len = (k.eve - k.week) / n;
  const p = (frame - k.week) / len;
  const s = Math.max(0, Math.min(n - 1, Math.floor(p)));
  const into = (p - s) * len;
  const fade = s > 0 && into < 14 ? 1 - into / 14 : 0;
  const cam = camAt(frame, [[k.week, { x: 560, y: 790, zoom: 1.7 }], [k.eve, { x: 540, y: 800, zoom: 1.95 }]]);
  return (
    <>
      <Night frame={frame} s={s} cam={cam} />
      <Fade opacity={fade}><Night frame={frame} s={s - 1} cam={cam} /></Fade>
    </>
  );
};

// ------------------------------------------------------------------------------------------------ lines 98-99

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: false };
/** His desk (the classroom's third bench desk): where your notebook goes. */
const HIS_DESK = { x: 1010, y: 765, tilt: -7.6 };

const Classroom: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; onDesk: boolean }> = ({ frame, cam, you, onDesk }) => {
  const props = { cam, mood: "dusk" as const, frame, options: ROOM_OPTS };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={classroom.Back(props)}
      actors={
        <>
          {classroom.Mid?.(props)}
          {onDesk && (
            <g>
              <MistakeBookSide x={HIS_DESK.x} y={HIS_DESK.y} tilt={HIS_DESK.tilt} />
              <Chocolate x={HIS_DESK.x + 4} y={HIS_DESK.y - 22} scale={0.55} half="left" tilt={HIS_DESK.tilt} />
            </g>
          )}
          {you}
        </>
      }
      front={classroom.Front?.(props)} />
  );
};

const EveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body: Body = { x: 1175, y: 960, scale: S, facing: -1, pose: { ...STAND, armF: [52, 70], armB: [8, 16] } };
  const head = headAt(body.x, body.y, S, body.pose, -1);
  const decide = ramp(frame, k.choose + 18, k.choose + 30);
  const face = frame < k.choose
    ? { ...EXPRESSIONS.sceptical, look: { x: 0.5, y: 0.7 } }
    : decide < 0.5 ? { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.3, y: 0.8 } } : { brows: "flat" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: 0.8 } };
  const cam = frame < k.choose
    ? camAt(frame, [[k.eve, { x: 980, y: 620, zoom: 1.2 }], [k.choose, { x: 1040, y: 640, zoom: 1.4 }]])
    : camAt(frame, [[k.choose, closeUp(head.x - 40, head.y, 2.6)], [k.leave, closeUp(head.x - 40, head.y, 2.85)]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "eve", 3)} onDesk={false}
      you={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 2)} time={frame}
        held={<g transform="rotate(-70)"><MistakeBookSide x={0} y={8} scale={0.75} /></g>} />} />
  );
};

const LeaveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const slide = ramp(frame, k.leave, k.leave + 18);
  const drop = ramp(frame, k.choc, k.choc + 8);
  const cam = drift(camAt(frame, [[k.leave, insert(960, 560, 1.0)], [k.go, insert(980, 540, 1.12)]]), frame, "leave", 2);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<DeskTopBack cam={cam} />}
      actors={
        <>
          <MistakeBook x={mix(900, 960, slide)} y={mix(1500, 560, slide)} tilt={mix(-14, -4, slide)} />
          {frame >= k.choc && <Chocolate x={1000} y={mix(380, 470, drop)} scale={mix(4.6, 3.8, drop)} half="left" tilt={-16} />}
        </>
      } />
  );
};

const GoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walk = linear(frame, k.go, k.gate + 4);
  const x = mix(1175, 640, walk);
  const cam = drift(camAt(frame, [[k.go, { x: 960, y: 620, zoom: 1.15 }], [k.gate, { x: 1000, y: 680, zoom: 1.4 }]]), frame, "go", 2);
  return (
    <Classroom frame={frame} cam={cam} onDesk
      you={<Figure {...HERO} x={x} y={960} scale={S} facing={-1} pose={walkPose(frame * 0.3)} brows="flat" mouth="flat" lids={0.2} look={{ x: 0.8, y: 0.1 }} time={frame} flow={0.2} />} />
  );
};

// ------------------------------------------------------------------------------------------------ lines 100-102

const yourDesk = { x: HALL.cols[HALL.you.c], y: HALL.rows[HALL.you.r] };

const HallShot: React.FC<{ frame: number; from: Camera; to: Camera; a: number; b: number }> = ({ frame, from, to, a, b }) => {
  const cam = drift(camAt(frame, [[a, from], [b, to]]), frame, "hall", 2);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ExamTopBack cam={cam} frame={frame} />} actors={null} />;
};

const SKY_OPTS = { ...citySkyline.defaults, birds: false, traffic: false };

/** The city with one paper plane held still in the sky. */
const SkyShot: React.FC<{ frame: number; a: number; b: number; from: Camera; to: Camera }> = ({ frame, a, b, from, to }) => {
  const cam = drift(camAt(frame, [[a, from], [b, to]]), frame, "sky", 2);
  const props = { cam, mood: "morning" as const, frame, options: SKY_OPTS };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<>{citySkyline.Back(props)}<Deep cam={cam} depth={0.08} flat><PaperPlane x={1180} y={250} scale={0.9} /></Deep></>}
      actors={null} />
  );
};

const EXAM_OPTS = { ...examHall.defaults, minute: 12 };

/** "This year, you're the one listening.": the hall side on, you at your desk, eyes up, the pencil still. */
const ListenShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const seat = examHall.spots.seat2;
  const head = headAt(seat.x, seat.y, seat.scale, SEATED);
  const cam = drift(camAt(frame, [[k.listen, { x: 900, y: 640, zoom: 1.5 }], [k.plane, closeUp(head.x + 40, head.y, 2.5)]]), frame, "listen", 2);
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

const RunwayShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.runway, { x: 960, y: 600, zoom: 1.0 }], [k.still, { x: 960, y: 580, zoom: 1.08 }]]), frame, "runway", 2);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<RunwayBack cam={cam} mood="morning" />} actors={null} />;
};

// ------------------------------------------------------------------------------------------------ lines 103-105

const JS = 1.1;
const ME = GATE.you;

/** Her face: tired off the night shift, tender. */
const herFace = (frame: number, extra: object = {}) => ({ brows: "worry" as const, lids: 0.12, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.05 }, blink: blinking(frame, 6), ...extra });

/** Her front hand with the box held out (`offer` 1), at her forward spot. */
const herBody = (x: number): Body => ({ x, y: GATE.jiyoon.y, scale: JS, facing: -1, pose: { ...STAND, armF: [72, 34] } });

const Gate: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; her: React.ReactNode; part?: number; bell?: number; still?: boolean }> = ({
  frame, cam, you, her, part = 0, bell = 0, still,
}) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<GateBack cam={cam} frame={frame} mood="morning" bell={bell} still={still} />}
    actors={<>{her}<GateCrowd frame={frame} part={part} still={still} />{you}</>} />
);

/** The parents at the gate during the hold: nobody moves (the frame held, no blinks). */
const StillGate: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift({ x: 960, y: 640, zoom: 1.0 }, frame, "still", 1.5);
  return (
    <Gate frame={k.still} cam={cam} still
      her={<JiyoonWithLunch x={GATE.jiyoon.x} y={GATE.jiyoon.y} scale={JS} frame={k.still} face={herFace(k.still, { blink: false })} holding />} you={null} />
  );
};

const GateShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.gate, "wide"], [k.vest, "vest"]]);
  const x = mix(300, ME, ramp(frame, k.gate, k.part - 6));
  const walking = frame < k.part - 10;
  const herHead = headAt(GATE.jiyoon.x, GATE.jiyoon.y, JS, STAND, -1);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.gate, { x: 900, y: 600, zoom: 1.0 }], [k.vest, { x: 1100, y: 640, zoom: 1.08 }]]),
    vest: camAt(frame, [[k.vest, { x: herHead.x - 120, y: herHead.y + 160, zoom: 1.7 }], [k.part, { x: herHead.x - 120, y: herHead.y + 150, zoom: 1.8 }]]),
  };
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "gate", 3)}
      her={<JiyoonWithLunch x={GATE.jiyoon.x} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame)} holding />}
      you={<Figure {...HERO} x={x} y={GATE.floor + 10} scale={S} pose={walking ? walkPose(frame * 0.3) : STAND}
        brows="flat" mouth="flat" lids={0.1} look={{ x: 0.9, y: 0 }} blink={blinking(frame, 1)} time={frame} />} />
  );
};

/** The performed moment at the gate, beat by beat. */
const HandOffShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.part, "part"], [k.offer, "offer"], [k.look, "look"], [k.hands, "hands"], [k.nod, "nod"], [k.back, "back"], [k.bell, "bell"]]);
  const part = ramp(frame, k.part, k.part + Math.round((k.offer - k.part) * 0.7)) * (1 - ramp(frame, k.back + 10, k.bell));
  const step = ramp(frame, k.part + 10, k.offer);
  const leave = ramp(frame, k.back, k.bell - 4);
  const herX = frame < k.back ? mix(GATE.jiyoon.x, GATE.jiyoonOut.x, step) : mix(GATE.jiyoonOut.x, 1430, leave);
  const offer = ramp(frame, k.offer, k.offer + 14);
  const handed = frame >= k.hands + Math.round((k.nod - k.hands) * 0.6);
  const out = handed ? ramp(frame, k.nod, k.nod + 12) : 0;
  const said = frame >= k.nod + 3 && frame < k.nod + 15; // her mouth open on the words she doesn't say
  const nod = linear(frame, k.nod + 18, k.nod + 36);
  const boxAt = handAt(herBody(GATE.jiyoonOut.x));
  const me: Body = { x: ME, y: GATE.floor + 10, scale: S, facing: frame >= k.bell + 12 ? -1 : 1, pose: STAND };
  const reach = aimArm(me, { x: boxAt.x - 24, y: boxAt.y });
  const hold: Pose = { ...STAND, armF: [40, 84], armB: [30, 90] };
  const reachT = ramp(frame, k.look + 6, k.hands);
  me.pose = handed ? { ...hold, armF: [mix(reach[0], 40, ramp(frame, k.nod, k.nod + 12)), mix(reach[1], 84, ramp(frame, k.nod, k.nod + 12))] }
    : { ...STAND, armF: [mix(STAND.armF[0], reach[0], reachT), mix(STAND.armF[1], reach[1], reachT)] };
  const myHead = headAt(me.x, me.y, S, me.pose, me.facing);
  const herHead = headAt(herX, GATE.jiyoon.y, JS, STAND, -1);
  if (shot === "hands") {
    const cam = drift(insert(960, 560, 1.0), frame, "hands", 2);
    const bg = { x: (ME + GATE.jiyoonOut.x) / 2, y: boxAt.y - 60, zoom: 3.2 };
    return (
      <>
        <Gate frame={frame} cam={bg} her={null} you={null} part={1} />
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={null}
          actors={<HandsOnHandle x={960} y={640} touch={ramp(frame, k.hands + 4, k.hands + 22)} hers={1} />} />
      </>
    );
  }
  const myFace = shot === "look"
    ? { brows: "worry" as const, lids: 0.08, mouth: "flat" as const, eyes: 1.08, look: { x: 0.95, y: -0.05 } }
    : { brows: "flat" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: me.facing === 1 ? 0.9 : 0.6, y: 0 } };
  const herNow = shot === "nod"
    ? herFace(frame, { mouth: said ? "open" as const : "flat" as const, lids: mix(0.12, 0.4, Math.sin(Math.PI * nod)), brows: said ? "raised" as const : "worry" as const })
    : herFace(frame, shot === "back" || shot === "bell" ? { look: { x: -0.4, y: 0 } } : {});
  const cams: Record<Exclude<typeof shot, "hands">, Camera> = {
    part: camAt(frame, [[k.part, { x: 1300, y: 720, zoom: 1.55 }], [k.offer, { x: 1280, y: 720, zoom: 1.65 }]]),
    offer: camAt(frame, [[k.offer, { x: 1250, y: 730, zoom: 1.75 }], [k.look, { x: 1250, y: 730, zoom: 1.85 }]]),
    look: camAt(frame, [[k.look, closeUp(myHead.x + 50, myHead.y, 2.6)], [k.hands, closeUp(myHead.x + 50, myHead.y, 2.85)]]),
    nod: camAt(frame, [[k.nod, closeUp(herHead.x - 40, herHead.y, 2.6)], [k.back, closeUp(herHead.x - 40, herHead.y, 2.8)]]),
    back: camAt(frame, [[k.back, { x: 1250, y: 700, zoom: 1.5 }], [k.bell, { x: 1200, y: 690, zoom: 1.4 }]]),
    bell: camAt(frame, [[k.bell, { x: 1080, y: 640, zoom: 1.1 }], [k.nothing, { x: 1060, y: 640, zoom: 1.12 }]]),
  };
  const walking = frame >= k.back && frame < k.bell - 4;
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "handoff", 2)} part={part} bell={ramp(frame, k.bell, k.bell + 6)}
      her={<JiyoonWithLunch x={herX} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herNow} holding={!handed} offer={offer} out={out}
        nod={nod} facing={walking ? 1 : -1} walk={walking ? frame * 0.3 : null} />}
      you={<Figure {...HERO} {...me} {...myFace} blink={shot !== "look" && blinking(frame, 3)} time={frame}
        held={handed ? <LunchBox x={4} y={26} scale={0.9} /> : undefined} />} />
  );
};

const NothingShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const herHead = headAt(1430, GATE.jiyoon.y, JS, STAND, -1);
  const cam = drift(camAt(frame, [[k.nothing, closeUp(herHead.x - 30, herHead.y, 2.4)], [k.air, closeUp(herHead.x - 30, herHead.y - 40, 2.4)],
    [k.month, { x: herHead.x - 30, y: herHead.y - 170, zoom: 2.2 }]]), frame, "nothing", 2);
  return (
    <Gate frame={frame} cam={cam}
      her={<JiyoonWithLunch x={1430} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame)} holding={false} out={1} />}
      you={<Figure {...HERO} x={ME} y={GATE.floor + 10} scale={S} facing={-1} pose={{ ...STAND, armF: [40, 84], armB: [30, 90] }} brows="flat" mouth="flat"
        lids={0.1} look={{ x: -0.6, y: 0 }} time={frame} held={<LunchBox x={4} y={26} scale={0.9} />} />} />
  );
};

const MonthShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walk = linear(frame, k.month + 6, k.month + Math.round((k.exam - k.month) * 0.85));
  const x = mix(ME, 960, walk);
  const pose: Pose = walk > 0 && walk < 1 ? { ...walkPose(frame * 0.3), armF: [40, 84] } : { ...STAND, armF: [40, 84], armB: [30, 90] };
  const cam = drift(camAt(frame, [[k.month, { x: 1200, y: 700, zoom: 1.5 }], [k.exam, { x: 1080, y: 600, zoom: 1.0 }]]), frame, "month", 2);
  return (
    <Gate frame={frame} cam={cam}
      her={<JiyoonWithLunch x={1430} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame, { look: { x: 0.9, y: 0.1 } })} holding={false} out={1} />}
      you={<Figure {...HERO} x={x} y={GATE.floor + 10} scale={S} facing={-1} pose={pose} brows="flat" mouth="flat" lids={0.2}
        look={{ x: 0.9, y: 0 }} time={frame} held={<LunchBox x={4} y={26} scale={0.9} />} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const HoldsBreath: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot.v4, shot.to);
  const scene = current(frame, [
    [0, "week"], [k.eve, "eve"], [k.leave, "leave"], [k.go, "go"], [k.gate, "gate"], [k.part, "handoff"], [k.nothing, "nothing"], [k.month, "month"],
    [k.exam, "exam"], [k.sky, "sky"], [k.listen, "listen"], [k.plane, "plane"], [k.runway, "runway"], [k.still, "still"], [k.breath, "breath"],
  ]);
  const hallClose = { x: yourDesk.x, y: yourDesk.y + 70, zoom: 2.4 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "week" && <WeekShot frame={frame} k={k} />}
      {scene === "eve" && <EveShot frame={frame} k={k} />}
      {scene === "leave" && <LeaveShot frame={frame} k={k} />}
      {scene === "go" && <GoShot frame={frame} k={k} />}
      {scene === "exam" && <HallShot frame={frame} a={k.exam} b={k.sky} from={hallClose} to={{ x: yourDesk.x, y: yourDesk.y - 60, zoom: 0.9 }} />}
      {scene === "sky" && <SkyShot frame={frame} a={k.sky} b={k.listen} from={{ x: 960, y: 430, zoom: 1.25 }} to={{ x: 1040, y: 400, zoom: 1.35 }} />}
      {scene === "listen" && <ListenShot frame={frame} k={k} />}
      {scene === "plane" && <SkyShot frame={frame} a={k.plane} b={k.runway} from={{ x: 1120, y: 330, zoom: 1.6 }} to={{ x: 1140, y: 320, zoom: 1.7 }} />}
      {scene === "runway" && <RunwayShot frame={frame} k={k} />}
      {scene === "still" && <StillGate frame={frame} k={k} />}
      {scene === "breath" && <HallShot frame={frame} a={k.breath} b={k.end} from={{ x: 960, y: 520, zoom: 0.8 }} to={{ x: 960, y: 540, zoom: 0.68 }} />}
      {scene === "gate" && <GateShot frame={frame} k={k} />}
      {scene === "handoff" && <HandOffShot frame={frame} k={k} />}
      {scene === "nothing" && <NothingShot frame={frame} k={k} />}
      {scene === "month" && <MonthShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const holdsBreath: Beat = { id: "HoldsBreath", firstLine: 97, Component: HoldsBreath };
