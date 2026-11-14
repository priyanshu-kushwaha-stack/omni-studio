// Beat "Backs" (script v5, 2026-11-14; story.json lines 84-90; mood day). Problem two: the rival works out your trick
// and turns a hundred backs on you. Every frame comes from the clips (`times`), one component per shot.
//
//   84    the classroom (kit `classroom`): you glance up at the empty air over the boy in front; behind you the rival,
//         narrow-eyed, watches you watch it, follows your look up to nothing, and back to you. (PROBLEM 2 card upper
//         left, Captions.tsx: only the banner and wall are there.)
//   85    "You only brag to faces.": he leans on your desk and taps his own face.
//   86    at the board he draws the shape of it (you, a face, an eye on the air over it, a "?"); insert of his drawing;
//         "So he gives the class one word.": he turns to the class, one finger up.
//   87    "Backs.": close on his grin. The hold after it: the room of a hundred from the front, the word running down the
//         rows in whispers (heads leaning together), the rival grinning at you.
//   88    Monday: you stand at the front with your score, your back to us; "A hundred chairs scrape": the whole room
//         turns round, front to back, each with a hop; the rival last, grinning, then his back too. "A hundred backs."
//   89    the reverse: their backs near, your face at the front, the sheet lowering an inch; then the laugh: you lean to
//         see past the boy in front, and he leans with you, and again.
//   90    "No faces. No cards.": the wide of backs, you sinking into your chair; your phone, "removed from the group"; the
//         board's countdown rubbed from D-22 to D-21: three weeks.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { blinking, camAt, current, HERO, mix, noise, PASTELS, ramp, TAEHO, type Beat, type Shot } from "../shared";
import { Countdown, HundredRoom, PhoneInsert, ReverseShot, RIVAL, YouAtFront, type Seat } from "./Backs.Room";
import { timer } from "./Notebook.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  return {
    watch: from(84), // "But here's problem two."
    follow: at(84, 0.6), // "watching you watch the air": he follows your look up
    brag: from(85), // "You only brag to faces."
    board: from(86), // "He doesn't know about the cards."
    shape: at(86, 0.36), // "He's worked out the shape of it"
    word: at(86, 0.8), // "So he gives the class one word."
    backs: from(87), // "Backs."
    hold: end(87) + 4, // the word runs down the rows
    monday: from(88), // "Monday. You stand up with your score."
    scrape: at(88, 0.4), // "A hundred chairs scrape."
    hundred: at(88, 0.72), // "A hundred backs."
    reverse: from(89), // "You wanted to avoid the red ones."
    lean: at(89, 0.34), // "Now the whole room is avoiding you": the lean gag
    nofaces: from(90), // "No faces. No cards. Your edge is gone,"
    phone: at(90, 0.33), // "your phone says"
    removed: at(90, 0.42), // "removed from group"
    weeks: at(90, 0.68), // "and the exam is in three weeks."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the classroom (84-87)

const ROOM = { ...classroom.defaults, board: "diagram" as const, drawn: 0, farRow: false };
const seats = classroom.spots;
const BOY = PASTELS[0];

const Room: React.FC<{ frame: number; cam: Camera; drawn?: number; behind?: React.ReactNode; you?: React.ReactNode }> = ({ frame, cam, drawn = 0, behind, you }) => {
  const props = { cam, mood: "day" as const, frame, options: { ...ROOM, drawn } };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={classroom.Back(props)}
      actors={<>{behind}{classroom.Mid?.(props)}{you}</>} front={classroom.Front?.(props)} />
  );
};

/** The three at the bench: the rival behind (seat1), you (seat2), the boy in front (seat3). */
const Bench: React.FC<{ frame: number; you: object; rival: object | null; boy?: boolean }> = ({ frame, you, rival, boy = true }) => (
  <>
    {rival && <Figure {...TAEHO} {...seats.seat1} pose={{ ...SEATED, lean: 14, armF: [100, 60] }} {...rival} blink={blinking(frame, 4)} time={frame} />}
    <Figure {...HERO} {...seats.seat2} pose={SEATED} {...you} blink={blinking(frame, 1)} time={frame} />
    {boy && <Figure {...seats.seat3} head={BOY} coat="#3b4a6b" pose={{ ...SEATED, lean: 10 }} brows="none" lids={0.4} mouth="flat" look={{ x: 0.7, y: 0.9 }} time={frame} />}
  </>
);

const WatchShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // you: eyes flick up to the air over the boy's head and back, twice
  const up = Math.sin((frame - k.watch) / 9) > 0.2;
  const follow = frame >= k.follow && frame < k.follow + 22;
  const back = frame >= k.follow + 22;
  const cam = camAt(frame, [[k.watch, { x: 700, y: 640, zoom: 1.3 }], [k.follow - 6, { x: 640, y: 650, zoom: 1.4 }], [k.brag, { x: 520, y: 660, zoom: 1.6 }]]);
  return (
    <Room frame={frame} cam={drift(cam, frame, "watch", 2)}
      behind={<Bench frame={frame}
        you={{ brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: up ? { x: 0.9, y: -0.8 } : { x: 0.6, y: 0.6 } }}
        rival={{ brows: back ? "angry" : "flat", lids: follow ? 0 : 0.45, mouth: back ? "smirk" : "flat", eyes: follow ? 1.15 : 1,
          look: follow ? { x: 0.9, y: -0.9 } : { x: 0.95, y: 0.1 } }} />} />
  );
};

const BragShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const X = 860, Y = 960;
  const pose: Pose = { ...STAND, lean: -10, armF: [96, 4], armB: [20, 30] }; // leaning in, pointing at you
  const head = headAt(X, Y, 1.1, pose, -1);
  const cam = camAt(frame, [[k.brag, { x: (head.x + 640) / 2, y: head.y + 90, zoom: 2.0 }], [k.board, { x: (head.x + 640) / 2, y: head.y + 90, zoom: 2.15 }]]);
  return (
    <Room frame={frame} cam={drift(cam, frame, "brag", 2)}
      behind={<Bench frame={frame} rival={null} boy={false} you={{ brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 0.8, y: -0.6 } }} />}
      you={<Figure {...TAEHO} x={X} y={Y} scale={1.1} facing={-1} pose={pose} brows="angry" lids={0.25} mouth="smirk" eyes={1} look={{ x: 0.9, y: 0.3 }}
        blink={blinking(frame, 4)} time={frame} />} />
  );
};

/** His drawing of your trick, full screen: you, a speech line, a face, an eye on the air over that face, a "?". */
const ShapeInsert: React.FC<{ frame: number; at: number }> = ({ frame, at }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <rect x={0} y={0} width={1920} height={1080} fill="#fdfcf7" />
    <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#9aa3ad" strokeWidth={40} />
    <DrawLine d="M420 620 m-90 0 a90 90 0 1 0 180 0 a90 90 0 1 0 -180 0 M400 540 q10 -40 46 -20" from={at} to={at + 14} color={INK} width={10} />
    <circle cx={420} cy={620} r={86} fill={MUSTARD} opacity={ramp(frame, at + 10, at + 16) * 0.8} />
    <DrawLine d="M540 600 q60 -20 120 0 M540 640 q60 20 120 0" from={at + 16} to={at + 26} color={INK} width={10} />
    <DrawLine d="M860 620 m-90 0 a90 90 0 1 0 180 0 a90 90 0 1 0 -180 0 M830 600 v10 M890 600 v10 M830 660 h60" from={at + 26} to={at + 42} color={INK} width={10} />
    <DrawLine d="M860 410 m-100 0 q100 -70 200 0 q-100 70 -200 0 M860 410 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0" from={at + 46} to={at + 62} color={CRIMSON} width={10} />
    <DrawLine d="M480 500 Q560 330 740 400" from={at + 62} to={at + 74} color={CRIMSON} width={8} />
    <DrawLine d="M1120 380 q0 -70 60 -70 q60 0 60 60 q0 40 -60 60 v50 M1180 560 v6" from={at + 78} to={at + 96} color={INK} width={14} />
  </svg>
);

const BoardShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const turned = frame >= k.word;
  const draw = Math.sin(frame / 4) * 10 * (turned ? 0 : 1);
  const pose: Pose = turned ? { ...STAND, armF: [125, 45], armB: [10, 20] } : { ...STAND, armF: [112 + draw, 24], armB: [10, 20] };
  const spot = seats;
  const cam = turned
    ? camAt(frame, [[k.word, { x: 1300, y: 600, zoom: 1.4 }], [k.backs, { x: 1380, y: 560, zoom: 1.6 }]])
    : camAt(frame, [[k.board, { x: 1100, y: 560, zoom: 1.1 }], [k.shape, { x: 1200, y: 540, zoom: 1.2 }]]);
  return (
    <Room frame={frame} cam={drift(cam, frame, "board", 2)} drawn={ramp(frame, k.board + 10, k.shape)}
      behind={<Figure {...HERO} {...spot.seat2} pose={SEATED} brows="worry" lids={0.1} mouth="flat" look={{ x: 0.9, y: -0.2 }} blink={blinking(frame, 1)} time={frame} />}
      you={<Figure {...TAEHO} x={1640} y={900} scale={1.15} facing={turned ? -1 : 1} pose={pose} brows={turned ? "angry" : "flat"} lids={0.2}
        mouth={turned ? "smirk" : "flat"} eyes={1} look={turned ? { x: 0.9, y: 0 } : { x: 0.8, y: -0.4 }} blink={blinking(frame, 4)} time={frame} />} />
  );
};

/** "Backs.": close on his grin. */
const BacksClose: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const pose: Pose = { ...STAND, armF: [125, 45], armB: [10, 20] };
  const head = headAt(1640, 900, 1.15, pose, -1);
  const cam = camAt(frame, [[k.backs, closeUp(head.x - 30, head.y, 2.7)], [k.hold, closeUp(head.x - 30, head.y, 2.9)]]);
  return (
    <Room frame={frame} cam={cam} drawn={1}
      you={<Figure {...TAEHO} x={1640} y={900} scale={1.15} facing={-1} pose={pose} brows="angry" lids={0.15} mouth={frame < k.backs + 14 ? "open" : "smirk"}
        eyes={1} look={{ x: 0.9, y: 0 }} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the room of a hundred

const isRival = (s: Seat) => s.r === RIVAL.r && s.c === RIVAL.c;

/** When seat s turns round on "scrape": front rows first, a ripple to the back; the rival last. */
function turnOf(frame: number, k: T) {
  return (s: Seat) => {
    const at = isRival(s) ? k.scrape + 40 : k.scrape + s.r * 2 + Math.floor(noise(s.r * 10 + s.c) * 6);
    return ramp(frame, at, at + 8);
  };
}

const rivalFace = { look: 0.2, mouth: "smirk" as const, brows: "angry" as const, lids: 0.2 };

/** The hold after "Backs.": the word runs back through the rows, heads leaning together in pairs. */
const WhisperShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.hold, { x: 960, y: 640, zoom: 0.95 }], [k.monday, { x: 960, y: 650, zoom: 1.02 }]]);
  const tiltOf = (s: Seat) => {
    const reach = (frame - k.hold) / 4 - s.r * 1.6;
    const on = Math.max(0, Math.min(1, reach / 6)) * (reach < 30 ? 1 : Math.max(0, 1 - (reach - 30) / 8));
    return (s.c % 2 ? -1 : 1) * 16 * on;
  };
  return (
    <HundredRoom cam={drift(cam, frame, "whisper", 2)} turnOf={() => 0} tiltOf={tiltOf}
      faceOf={(s) => (isRival(s) ? rivalFace : { look: s.c % 2 ? -0.8 : 0.8, mouth: tiltOf(s) !== 0 ? "o" : "flat", lids: 0.3 })}
      front={<YouAtFront y={1300} sheet={false} />} />
  );
};

const MondayShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const stand = ramp(frame, k.monday + 6, k.monday + 22);
  const wide = frame >= k.scrape - 4;
  const cam = wide
    ? camAt(frame, [[k.scrape - 4, { x: 960, y: 640, zoom: 0.92 }], [k.reverse, { x: 960, y: 620, zoom: 1.0 }]])
    : camAt(frame, [[k.monday, { x: 960, y: 860, zoom: 1.35 }], [k.scrape, { x: 960, y: 820, zoom: 1.4 }]]);
  const turn = turnOf(frame, k);
  return (
    <HundredRoom cam={drift(cam, frame, "monday", 2)} turnOf={turn}
      faceOf={(s) => (isRival(s) ? rivalFace : { look: (960 - s.x) / 900, mouth: "flat", lids: 0.2 })}
      front={<YouAtFront y={mix(1300, 1150, stand)} lower={ramp(frame, k.hundred + 6, k.hundred + 20) * 0.4} />} />
  );
};

/** "Now the whole room is avoiding you": you lean to see past the boy in front; he leans with you. Twice. */
const LeanShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const t = frame - k.lean;
  const leanAt = (f: number) => 12 * (ramp(f, 4, 14) - 2 * ramp(f, 30, 42) + ramp(f, 58, 64) * 1.6);
  const lean = leanAt(t);
  const follow = leanAt(t - 5);
  const cam = camAt(frame, [[k.lean, { x: 980, y: 860, zoom: 1.45 }], [k.nofaces, { x: 980, y: 850, zoom: 1.55 }]]);
  return (
    <HundredRoom cam={drift(cam, frame, "lean", 2)} turnOf={() => 1}
      shiftOf={(s) => (s.r === 0 && s.c === 5 ? follow * 7 : 0)}
      tiltOf={(s) => (s.r === 0 && s.c === 5 ? follow * 0.8 : 0)}
      front={<YouAtFront y={1150} lower={0.4} lean={lean} x={980} />} />
  );
};

const ReverseFace: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const lower = ramp(frame, k.reverse + 20, k.reverse + 36);
  const cam = camAt(frame, [[k.reverse, { x: 960, y: 560, zoom: 1.25 }], [k.lean, { x: 960, y: 580, zoom: 1.4 }]]);
  return (
    <ReverseShot frame={frame} cam={drift(cam, frame, "reverse", 2)} lower={lower}
      face={{ brows: "raised", lids: mix(0, 0.3, lower), mouth: "flat", eyes: 1.1, look: { x: 0.2, y: 0.4 }, blink: blinking(frame, 2) }} />
  );
};

/** "No faces. No cards.": the wide of backs, the air over every head empty; you sink into your chair. */
const NoFacesShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const sit = ramp(frame, k.nofaces + 20, k.phone - 6);
  const cam = camAt(frame, [[k.nofaces, { x: 960, y: 620, zoom: 0.95 }], [k.phone, { x: 960, y: 560, zoom: 0.88 }]]);
  return (
    <HundredRoom cam={drift(cam, frame, "nofaces", 2)} turnOf={() => 1}
      front={<YouAtFront y={mix(1150, 1290, sit)} lower={mix(0.4, 1, sit)} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Backs: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "watch"], [k.brag, "brag"], [k.board, "board"], [k.shape, "shape"], [k.word, "word"], [k.backs, "backs"], [k.hold, "whisper"],
    [k.monday, "monday"], [k.reverse, "reverse"], [k.lean, "lean"], [k.nofaces, "nofaces"], [k.phone, "phone"], [k.weeks, "weeks"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "watch" && <WatchShot frame={frame} k={k} />}
      {scene === "brag" && <BragShot frame={frame} k={k} />}
      {(scene === "board" || scene === "word") && <BoardShot frame={frame} k={k} />}
      {scene === "shape" && <ShapeInsert frame={frame} at={k.shape + 2} />}
      {scene === "backs" && <BacksClose frame={frame} k={k} />}
      {scene === "whisper" && <WhisperShot frame={frame} k={k} />}
      {scene === "monday" && <MondayShot frame={frame} k={k} />}
      {scene === "reverse" && <ReverseFace frame={frame} k={k} />}
      {scene === "lean" && <LeanShot frame={frame} k={k} />}
      {scene === "nofaces" && <NoFacesShot frame={frame} k={k} />}
      {scene === "phone" && <PhoneInsert frame={frame} at={k.phone} removed={k.removed} />}
      {scene === "weeks" && <Countdown frame={frame} at={k.weeks} />}
    </AbsoluteFill>
  );
};

export const backs: Beat = { id: "Backs", firstLine: 84, Component: Backs };

