// Beat "The Country Holds Its Breath" (script.md "## [05:58] The Country Holds Its Breath"; narration lines 81-90; mood
// morning). Every frame comes from the clips (`times`), one component per shot. No card opens anywhere in this beat.
//
//   81  a week at the reading room in one dissolve: your carrel, writing; asleep on a rolled jacket; writing; a yawn.
//   82  exam eve, the classroom at dusk: you at his empty desk with your mistake notebook; close on the choice.
//   83  insert from above: the notebook onto his desk, half a kimbap on top.
//   84  wide: you walk out; the camera stays on the desk.
//   85  exam day: the exam hall from straight above, rows of heads, yours among them; pull up.
//   86  the hall; then the city skyline, one paper plane held still in the sky (the thirty-five minutes).
//   hold the plane; the market board, dark.
//   87  the board; a police motorbike with a late student on the back sliding through the empty street; the hall again
//       from high above, "A country holds its breath for you."
//   88  the gate: parents in a crowd along the wall, you walking up; Ji-yoon in her vest; the lunch box in both hands.
//   89  you take it; close on you; her face, and the empty air over her head: nothing opens.
//   90  you walk to the gate with the lunch; she stays; pull back.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { citySkyline, classroom, Mug, street } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Kimbap, headAt } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { READING } from "../sets/ReadingRoom";
import { aimArm, Fade, handAt, Rows, S, timer, type Body } from "./Notebook.Parts";
import {
  DeskTopBack, ExamTopBack, GATE, GateBack, GateCrowd, HALL, JiyoonWithLunch, LunchBox, MarketBack, MistakeBook, MistakeBookSide,
  PaperPlane, PoliceBike,
} from "./HoldsBreath.Parts";
import { Deep } from "../sets/common";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  return {
    week: from(81), // a week at the reading room, one dissolve
    eve: from(82), // exam eve, the classroom at dusk
    choose: at(82, 0.55), // "Leave it, or keep the seat?"
    leave: from(83) - 2, // the notebook onto his desk, from above
    kimbap: at(83, 0.5), // "Half a kimbap on top."
    go: from(84), // you walk out
    exam: from(85), // "Exam day.": the hall from above
    sky: at(86, 0.5), // "For thirty-five minutes, no plane crosses the sky"
    market: Math.round(mix(end(86), from(87), 0.45)), // the hold's second half: the board, dark
    bike: at(87, 0.3), // "Police motorbikes carry the late ones to the gates"
    breath: at(87, 0.74), // "A country holds its breath for you."
    gate: from(88), // the gate, the parents
    vest: at(88, 0.36), // "the warehouse vest"
    lunch: at(88, 0.74), // "The lunch she packed."
    take: from(89), // you take the lunch
    you: at(89, 0.38), // "Neither of you says a word": close on you
    nothing: at(89, 0.7), // "Nothing opens."
    month: from(90), // you walk to the gate
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ line 81

const YOU = READING.carrel(READING.you);

/** You at your carrel on one night of the week: 0 writing, 1 asleep on your jacket, 2 writing, 3 a yawn. */
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

// ------------------------------------------------------------------------------------------------ lines 82-84

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: false };
/** Min-jun's desk (the classroom's third bench desk): where your notebook goes. */
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
              <Kimbap x={HIS_DESK.x + 6} y={HIS_DESK.y - 30} scale={0.42} half tilt={HIS_DESK.tilt} />
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
  const drop = ramp(frame, k.kimbap, k.kimbap + 8);
  const cam = drift(camAt(frame, [[k.leave, insert(960, 560, 1.0)], [k.go, insert(980, 540, 1.12)]]), frame, "leave", 2);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<DeskTopBack cam={cam} />}
      actors={
        <>
          <MistakeBook x={mix(900, 960, slide)} y={mix(1500, 560, slide)} tilt={mix(-14, -4, slide)} />
          {frame >= k.kimbap && <Kimbap x={1010} y={mix(360, 470, drop)} scale={mix(5.4, 4.4, drop)} half tilt={16} />}
        </>
      } />
  );
};

const GoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walk = linear(frame, k.go + 6, k.go + Math.round((k.exam - k.go) * 0.75));
  const x = mix(1175, -260, walk);
  const cam = camAt(frame, [[k.go, { x: 900, y: 600, zoom: 1.1 }], [k.go + Math.round((k.exam - k.go) * 0.4), { x: 880, y: 610, zoom: 1.15 }], [k.exam, { x: HIS_DESK.x, y: HIS_DESK.y - 30, zoom: 2.3 }]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "go", 2)} onDesk
      you={walk < 1 ? <Figure {...HERO} x={x} y={960} scale={S} facing={-1} pose={walkPose(frame * 0.3)} {...EXPRESSIONS.determined} look={{ x: 0.8, y: 0.1 }} time={frame} flow={0.2} /> : null} />
  );
};

// ------------------------------------------------------------------------------------------------ lines 85-87

const yourDesk = { x: HALL.cols[HALL.you.c], y: HALL.rows[HALL.you.r] };

const HallShot: React.FC<{ frame: number; from: Camera; to: Camera; a: number; b: number }> = ({ frame, from, to, a, b }) => {
  const cam = drift(camAt(frame, [[a, from], [b, to]]), frame, "hall", 2);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ExamTopBack cam={cam} frame={frame} />} actors={null} />;
};

const SKY_OPTS = { ...citySkyline.defaults, birds: false, traffic: false };

const SkyShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.sky, { x: 960, y: 430, zoom: 1.25 }], [k.market, { x: 1060, y: 380, zoom: 1.45 }]]), frame, "sky", 2);
  const props = { cam, mood: "morning" as const, frame, options: SKY_OPTS };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<>{citySkyline.Back(props)}<Deep cam={cam} depth={0.08} flat><PaperPlane x={1180} y={250} scale={0.9} /></Deep></>}
      actors={null} />
  );
};

const MarketShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.market, { x: 960, y: 430, zoom: 1.1 }], [k.bike, { x: 960, y: 400, zoom: 1.3 }]]), frame, "market", 2);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MarketBack cam={cam} frame={frame} />} actors={null} />;
};

const STREET_OPTS = { ...street.defaults, crowd: false, auto: false, bus: null, red: false };

const BikeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const x = mix(-500, 2500, linear(frame, k.bike - 6, k.breath + 8));
  const cam = drift(camAt(frame, [[k.bike, { x: 760, y: 660, zoom: 1.3 }], [k.breath, { x: 1160, y: 660, zoom: 1.35 }]]), frame, "bike", 2);
  const props = { cam, mood: "morning" as const, frame, options: STREET_OPTS };
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={street.Back(props)} actors={<PoliceBike x={x} y={905} frame={frame} scale={1.25} />} />;
};

// ------------------------------------------------------------------------------------------------ lines 88-90

const JY = GATE.jiyoon;
const YOU_AT = 1190;
const JS = 1.1;

/** Her face, tired off the night shift, and glad. */
const herFace = (frame: number) => ({ brows: "none" as const, lids: 0.42, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.05 }, blink: blinking(frame, 6) });

const Gate: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; her: React.ReactNode }> = ({ frame, cam, you, her }) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<GateBack cam={cam} frame={frame} mood="morning" />}
    actors={<><GateCrowd frame={frame} />{her}{you}</>} />
);

const GateShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.gate, "wide"], [k.vest, "vest"], [k.lunch, "lunch"]]);
  const x = mix(260, YOU_AT, ramp(frame, k.gate, k.take - 6));
  const walking = frame < k.take - 10;
  const her = { x: JY.x, y: JY.y, scale: JS, pose: { ...STAND, armF: [38, 84] as [number, number] }, facing: -1 as const };
  const herHead = headAt(her.x, her.y, JS, her.pose, -1);
  const box = handAt(her, "front");
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.gate, { x: 900, y: 600, zoom: 1.0 }], [k.vest, { x: 1100, y: 640, zoom: 1.08 }]]),
    vest: camAt(frame, [[k.vest, { x: herHead.x - 60, y: herHead.y + 110, zoom: 1.9 }], [k.lunch, { x: herHead.x - 40, y: herHead.y + 90, zoom: 2.1 }]]),
    lunch: camAt(frame, [[k.lunch, insert(box.x, box.y, 3.0)], [k.take, insert(box.x, box.y - 10, 3.3)]]),
  };
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "gate", 3)}
      her={<JiyoonWithLunch x={JY.x} y={JY.y} scale={JS} frame={frame} face={herFace(frame)} holding />}
      you={<Figure {...HERO} x={x} y={GATE.floor + 10} scale={S} pose={walking ? walkPose(frame * 0.3) : STAND}
        {...EXPRESSIONS.neutral} lids={0.15} look={{ x: 0.9, y: 0 }} blink={blinking(frame, 1)} time={frame} />} />
  );
};

const TakeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.take, "two"], [k.you, "you"], [k.nothing, "air"]]);
  const her = { x: JY.x, y: JY.y, scale: JS, pose: { ...STAND, armF: [38, 84] as [number, number] }, facing: -1 as const };
  const boxAt = handAt(her, "front");
  const reachT = ramp(frame, k.take + 6, k.take + 22);
  const handed = frame >= k.take + 24;
  const back = ramp(frame, k.take + 26, k.take + 44);
  const me: Body = { x: YOU_AT, y: GATE.floor + 10, scale: S, facing: 1, pose: STAND };
  const reachPose: Pose = { ...STAND, armF: aimArm(me, { x: boxAt.x - 30, y: boxAt.y }) };
  const holdPose: Pose = { ...STAND, armF: [40, 84], armB: [30, 90] };
  me.pose = handed ? lerpPose(reachPose, holdPose, back) : lerpPose(STAND, reachPose, reachT);
  const myHead = headAt(me.x, me.y, S, me.pose);
  const herHead = headAt(JY.x, JY.y, JS, her.pose, -1);
  const cams: Record<typeof shot, Camera> = {
    two: camAt(frame, [[k.take, { x: 1300, y: 720, zoom: 1.8 }], [k.you, { x: 1300, y: 710, zoom: 1.9 }]]),
    you: camAt(frame, [[k.you, closeUp(myHead.x + 50, myHead.y, 2.6)], [k.nothing, closeUp(myHead.x + 50, myHead.y, 2.8)]]),
    air: camAt(frame, [[k.nothing, closeUp(herHead.x - 30, herHead.y, 2.5)], [k.month, { x: herHead.x - 30, y: herHead.y - 120, zoom: 2.3 }]]),
  };
  const mine = { brows: "flat" as const, lids: 0.15, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: shot === "you" ? -0.05 : 0.2 } };
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "take", 2)}
      her={<JiyoonWithLunch x={JY.x} y={JY.y} scale={JS} frame={frame} face={herFace(frame)} holding={!handed} out={handed ? back : 0} />}
      you={<Figure {...HERO} {...me} {...mine} blink={blinking(frame, 3)} time={frame}
        held={handed ? <LunchBox x={4} y={26} scale={0.9} /> : undefined} />} />
  );
};

const MonthShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const turn = frame >= k.month + 10;
  const walk = linear(frame, k.month + 14, k.month + Math.round((k.end - k.month) * 0.8));
  const x = mix(YOU_AT, 980, walk);
  const pose: Pose = walk > 0 && walk < 1 ? { ...walkPose(frame * 0.3), armF: [40, 84] } : { ...STAND, armF: [40, 84], armB: [30, 90] };
  const cam = drift(camAt(frame, [[k.month, { x: 1260, y: 700, zoom: 1.6 }], [k.end, { x: 1080, y: 600, zoom: 1.0 }]]), frame, "month", 2);
  return (
    <Gate frame={frame} cam={cam}
      her={<JiyoonWithLunch x={JY.x} y={JY.y} scale={JS} frame={frame} face={{ ...herFace(frame), look: { x: 0.9, y: 0.1 } }} holding={false} out={1} />}
      you={<Figure {...HERO} x={x} y={GATE.floor + 10} scale={S} facing={turn ? -1 : 1} pose={pose} {...EXPRESSIONS.determined} lids={0.2}
        look={{ x: 0.9, y: 0 }} time={frame} held={<LunchBox x={4} y={26} scale={0.9} />} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const HoldsBreath: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "week"], [k.eve, "eve"], [k.leave, "leave"], [k.go, "go"], [k.exam, "exam"], [k.sky, "sky"], [k.market, "market"],
    [k.bike, "bike"], [k.breath, "breath"], [k.gate, "gate"], [k.take, "take"], [k.month, "month"],
  ]);
  const hallClose = { x: yourDesk.x, y: yourDesk.y + 70, zoom: 2.4 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "week" && <WeekShot frame={frame} k={k} />}
      {scene === "eve" && <EveShot frame={frame} k={k} />}
      {scene === "leave" && <LeaveShot frame={frame} k={k} />}
      {scene === "go" && <GoShot frame={frame} k={k} />}
      {scene === "exam" && <HallShot frame={frame} a={k.exam} b={k.sky} from={hallClose} to={{ x: yourDesk.x, y: yourDesk.y - 60, zoom: 0.9 }} />}
      {scene === "sky" && <SkyShot frame={frame} k={k} />}
      {scene === "market" && <MarketShot frame={frame} k={k} />}
      {scene === "bike" && <BikeShot frame={frame} k={k} />}
      {scene === "breath" && <HallShot frame={frame} a={k.breath} b={k.gate} from={{ x: 960, y: 520, zoom: 0.8 }} to={{ x: 960, y: 540, zoom: 0.68 }} />}
      {scene === "gate" && <GateShot frame={frame} k={k} />}
      {scene === "take" && <TakeShot frame={frame} k={k} />}
      {scene === "month" && <MonthShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const holdsBreath: Beat = { id: "HoldsBreath", firstLine: 81, Component: HoldsBreath };

