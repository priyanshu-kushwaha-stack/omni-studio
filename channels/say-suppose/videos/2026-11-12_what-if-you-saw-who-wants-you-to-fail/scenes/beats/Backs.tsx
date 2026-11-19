// Beat "Backs" (script v7, 2026-11-14; story.json lines 84-90; mood day). Problem two: the rival works out your trick
// and turns the room's backs on you. Rebuilt from the outside review of v6 (its #1 improvement): the classroom side on,
// chairs with legs that spin round in a one-second wave, the rival last; your view of plain backs; a fast board; a large
// REMOVED FROM GROUP. Every frame comes from the clips (`times`, on the narration's words), one component per shot.
//
//   84  "But here's problem two.": you on your feet with a score, the class looking at you (PROBLEM 2 card upper left,
//       Captions.tsx). "Every time, you read your best friend first.": your eyes go to the air over your best friend
//       first and his card snaps open (-91). "And the rival has been watching.": two rows back, the rival's eyes go
//       from that air to you; a smirk.
//   85  "You only brag to faces.": at your desk, he taps his own face.
//   86  he walks to the board; the board close: YOU with your sheet, an arrow to A FACE, your look up over it to an EYE
//       and a "?", the face struck out (each on its words); "So he gives the class one word.": he spins a chair round,
//       one finger up.
//   87  "Backs.": close on his grin. The hold: the word runs back through the rows, head to head; then you, the room
//       looking at you.
//   88  "Monday.": a score slaps on your desk; "You stand up with your score.": you step out and hold it up to the room;
//       "A hundred chairs scrape": side on, every chair spins round, front row to back in one second; the rival holds,
//       grinning at you, then turns last, his eyes over his shoulder a moment longer. "A hundred backs.": your view.
//   89  close on you, the sheet coming down to your side; the laugh: you lean to see past the boy in front, he leans with
//       you, and again; the rival waves over his shoulder without turning.
//   90  "No faces. No cards.": where the cards would be, nothing; "Your edge is gone": you sink into your chair, the sheet
//       slips to the floor; your phone, REMOVED FROM GROUP; "the exam is in three weeks": the pad tears to 21 DAYS.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, reach, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK, PAPER } from "@whatif/kit/theme";
import { headAt, Meter, MeterSound, YourShoulder } from "../parts";
import { blinking, camAt, current, HERO, mix, noise, ramp, TAEHO, type Beat, type Shot } from "../shared";
import { BoardInsert } from "./Backs.Board";
import { Countdown, PhoneInsert, POV_BOY, POV_RIVAL, povS, povX, povY, PovRoom, YouFromBehind } from "./Backs.Room";
import { FACELESS, FLOOR, MINJUN_ROW, PLATFORM, RANKS, SEAT_Y, SideChair, SideClass, seatHead, TAEHO_ROW, turnedFace, waveTurn, YOU_ROW, rowX } from "./Backs.Side";

type T = ReturnType<typeof times>;

/** The beat's frames, placed on the narration's words (narration/words.json, as shares of each line). */
function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const end = (i: number) => clips[i].from + clips[i].frames;
  const scrape = at(88, 0.5); // "A hundred chairs scrape": the first chair moves
  return {
    problem: from(84), // "But here's problem two."
    every: at(84, 0.24), // "Every time,"
    read: at(84, 0.42), // "read your best friend first."
    rival: at(84, 0.72), // "And the rival has been watching."
    toYou: at(84, 0.82),
    watching: at(84, 0.9),
    brag: from(85), // "You only brag to faces."
    faces: at(85, 0.5),
    walk: from(86), // "He doesn't know about the cards. He doesn't need to."
    glance: at(86, 0.31), // "He's worked out the shape of it."
    board: at(86, 0.4),
    you: at(86, 0.46), // "You say your news"
    face: at(86, 0.57), // "to a face,"
    eye: at(86, 0.65), // "and you read something,"
    cross: at(86, 0.76),
    chair: at(86, 0.81), // "so he gives the class one word."
    spin: at(86, 0.84),
    one: at(86, 0.9),
    backs: from(87), // "Backs."
    whisper: end(87) + 16, // the hold: the word runs down the rows
    looked: from(88) - 36, // the room looking at you
    monday: from(88), // "Monday."
    stand: at(88, 0.19), // "You stand up with your score."
    score: at(88, 0.34),
    wide: at(88, 0.46),
    scrape,
    rivalAt: scrape + 38, // the rival turns last
    pov: at(88, 0.82), // "a hundred backs."
    reverse: from(89), // "You wanted to avoid the red ones."
    lean: at(89, 0.35), // "Now the whole room is avoiding you": the lean gag
    bye: at(89, 0.67), // "and they don't need to see your face to do it."
    nofaces: from(90), // "No faces, no cards,"
    sink: at(90, 0.31), // "your edge is gone,"
    phone: at(90, 0.49), // "your phone says"
    removed: at(90, 0.58), // "removed from group"
    drop: at(90, 0.7),
    weeks: at(90, 0.78), // "and the exam is in three weeks."
    tear: at(90, 0.86),
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ you and the rival

const YOU_X = 1150; // where you stand: just in front of your desk, facing the class
const STAND_UP: Pose = { ...STAND, armF: [150, 18], armB: [-10, 20] };
const SHEET_DOWN: Pose = { ...STAND, armF: [14, 12], armB: [-8, 14] };

/** Your score sheet in your hand: paper, ink lines, a teal tick. */
const Sheet: React.FC<{ tilt?: number }> = ({ tilt = 8 }) => (
  <g transform={`rotate(${tilt}) translate(-46 -120)`}>
    <rect x={0} y={0} width={92} height={120} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((i) => <line key={i} x1={14} y1={24 + i * 20} x2={78} y2={24 + i * 20} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.45} />)}
    <path d="M22 94 l14 14 l30 -32" fill="none" stroke="#1d9a8f" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** You on your feet at the front of your desk, facing the class, the sheet up (`lower` 0..1 brings it to your side). */
const YouStanding: React.FC<{ frame: number; lower?: number; face: object; x?: number; pose?: Pose }> = ({ frame, lower = 0, face, x = YOU_X, pose }) => (
  <Figure {...HERO} x={x} y={FLOOR} scale={RANKS[0].s} facing={-1} pose={pose ?? lerpPose(STAND_UP, SHEET_DOWN, lower)} blink={blinking(frame, 1)} time={frame}
    {...face} held={<Sheet tilt={mix(8, 70, lower)} />} />
);

const bragging = (frame: number) => ({ brows: "raised" as const, lids: 0, mouth: (Math.floor(frame / 6) % 2 ? "open" : "smirk") as "open" | "smirk", eyes: 1.05 });
const youHead = (pose: Pose = STAND_UP) => headAt(YOU_X, FLOOR, RANKS[0].s, pose, -1);
const watching = (row: number) => ({ look: { x: 1, y: row === 0 ? -0.1 : -0.25 } });

// ------------------------------------------------------------------------------------------------ 84 problem two

const mh = seatHead(MINJUN_ROW);
const th = seatHead(TAEHO_ROW);

const MinjunCard: React.FC<{ frame: number; k: T }> = ({ frame, k }) => (
  <Meter frame={frame} at={k.read + 3} x={mh.x + 20} headY={mh.y} r={mh.r} value={-91} until={k.brag} />
);

/** "But here's problem two." / "Every time, you read your best friend first.": you on your feet, the class on you; your
 *  eyes snap to the air over your best friend first, his card snaps open; then on round the room. */
const ProblemShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const two = frame >= k.every;
  const cam = drift(two
    ? camAt(frame, [[k.every, { x: 900, y: 600, zoom: 1.7 }], [k.rival, { x: 880, y: 590, zoom: 1.85 }]])
    : camAt(frame, [[k.problem, { x: 820, y: 640, zoom: 1.35 }], [k.every, { x: 860, y: 630, zoom: 1.45 }]]), frame, "problem", 3);
  const onFriend = frame >= k.read && frame < k.read + 26;
  const scan = Math.sin((frame - k.read) / 8);
  const look = !two || frame < k.read ? { x: 0.6, y: 0 } : onFriend ? { x: 1, y: -0.85 } : { x: mix(0.2, 1, (scan + 1) / 2), y: -0.7 };
  return (
    <SideClass frame={frame} cam={cam} youSeated={false} faceOf={(row) => watching(row)}
      actors={<>
        <YouStanding frame={frame} face={{ ...(frame < k.read ? bragging(frame) : { brows: "raised", lids: 0, mouth: "smirk", eyes: 1.1 }), look }} />
        <MinjunCard frame={frame} k={k} />
      </>} />
  );
};

/** "And the rival has been watching.": close on him two rows back; his eyes go from the air over your best friend to
 *  you; the lids narrow; on "watching", the smirk. */
const RivalWatchShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.rival, closeUp(th.x + 100, th.y + 30, 1.95)], [k.brag, closeUp(th.x + 90, th.y + 30, 2.1)]]), frame, "rival", 2);
  const toYou = frame >= k.toYou;
  return (
    <SideClass frame={frame} cam={cam} youSeated={false}
      faceOf={(row, rank) => (rank === 0 && row === TAEHO_ROW
        ? { brows: toYou ? "angry" : "flat", lids: toYou ? 0.4 : 0.15, mouth: frame >= k.watching ? "smirk" : "flat", eyes: 1, look: toYou ? { x: 1, y: -0.2 } : { x: 0.9, y: -0.9 } }
        : watching(row))}
      actors={<><YouStanding frame={frame} face={{ brows: "raised", lids: 0, mouth: "smirk", eyes: 1, look: { x: 0.9, y: -0.6 } }} /><MinjunCard frame={frame} k={k} /></>} />
  );
};

// ------------------------------------------------------------------------------------------------ 85-86 the rival works it out

const TX = 1215; // where he stands at your desk
const tapPose = (tap: number): Pose => ({ ...STAND, lean: -8, armF: reach(34, -44 - 6 * tap), armB: [-10, 20] });

/** "You only brag to faces.": at your desk, leaning in; on "faces" he taps his own face, twice. */
const BragShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tapping = frame >= k.faces;
  const tap = tapping ? Math.abs(Math.sin((frame - k.faces) / 3)) : 0;
  const pose: Pose = tapping ? tapPose(tap) : { ...STAND, lean: -12, armF: [70, 30], armB: [-10, 20] };
  const yh = seatHead(YOU_ROW);
  const cam = drift(camAt(frame, [[k.brag, { x: (yh.x + TX) / 2, y: yh.y + 40, zoom: 2.0 }], [k.walk, { x: (yh.x + TX) / 2, y: yh.y + 30, zoom: 2.15 }]]), frame, "brag", 2);
  return (
    <SideClass frame={frame} cam={cam} faceOf={(row, rank) => (rank === 0 && row === YOU_ROW ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 0.9, y: -0.5 } } : undefined)}
      actors={<Figure {...TAEHO} x={TX} y={FLOOR} scale={RANKS[0].s} facing={-1} pose={pose} brows="angry" lids={0.25} mouth={frame < k.faces + 8 ? "open" : "smirk"}
        eyes={1} look={{ x: 0.9, y: 0.35 }} blink={blinking(frame, 4)} time={frame} />} />
  );
};

/** "He doesn't know about the cards.": he walks off to the board; on "He's worked out the shape of it" a look back at
 *  you over his shoulder, and the marker comes up. */
const WalkShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const go = ramp(frame, k.walk + 4, k.glance - 10);
  const x = mix(TX, 1600, go);
  const y = x < 1240 ? FLOOR : PLATFORM;
  const walking = go > 0 && go < 1;
  const back = frame >= k.glance && frame < k.glance + 14;
  const pose: Pose = walking ? walkPose((frame - k.walk) / 3.2) : back ? { ...STAND, armF: [60, 40] } : { ...STAND, armF: [150, 30], armB: [-10, 20] };
  const cam = drift(camAt(frame, [[k.walk, { x: 1080, y: 640, zoom: 1.5 }], [k.glance, { x: 1380, y: 600, zoom: 1.5 }], [k.board, { x: 1460, y: 560, zoom: 1.7 }]]), frame, "walk", 2);
  return (
    <SideClass frame={frame} cam={cam} faceOf={(row, rank) => (rank === 0 && row === YOU_ROW ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.05, look: { x: 1, y: -0.3 } } : watching(row))}
      actors={<Figure {...TAEHO} x={x} y={y} scale={RANKS[0].s} facing={back ? -1 : 1} pose={pose} brows={back ? "angry" : "flat"} lids={0.2}
        mouth={back ? "smirk" : "flat"} eyes={1} look={back ? { x: 1, y: 0.1 } : { x: 0.8, y: -0.4 }} blink={blinking(frame, 4)} time={frame} />} />
  );
};

const CHAIR_X = 1380; // the spare chair on the platform
const TAEHO_FRONT = 1560;

/** "So he gives the class one word.": at the front he spins the spare chair round, then one finger up. */
const ChairShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const spin = Math.min(1, Math.max(0, (frame - k.spin) / 8));
  const hop = Math.sin(Math.PI * spin) * 18;
  const c = Math.cos(Math.PI * spin);
  const sx = Math.sign(c || 1) * Math.max(0.06, Math.abs(c));
  const up = ramp(frame, k.one - 3, k.one + 4);
  const pose: Pose = up > 0 ? { ...STAND, armF: [mix(100, 150, up), mix(30, 22, up)], armB: [-10, 20] } : { ...STAND, lean: -6, armF: [100, 30], armB: [-10, 20] };
  const cam = drift(camAt(frame, [[k.chair, { x: 1440, y: 640, zoom: 1.75 }], [k.backs, { x: 1470, y: 620, zoom: 1.9 }]]), frame, "chair", 2);
  return (
    <SideClass frame={frame} cam={cam} drawn={1}
      actors={<>
        <g transform={`translate(${CHAIR_X} ${-hop}) scale(${-sx} 1) translate(${-CHAIR_X} 0)`}>
          <SideChair x={CHAIR_X} top={PLATFORM - 80} floor={PLATFORM} s={RANKS[0].s} />
        </g>
        <Figure {...TAEHO} x={TAEHO_FRONT} y={PLATFORM} scale={RANKS[0].s} facing={-1} pose={pose} brows="angry" lids={0.2} mouth={up > 0 ? "smirk" : "flat"}
          eyes={1} look={{ x: 0.9, y: 0 }} blink={blinking(frame, 4)} time={frame} />
      </>} />
  );
};

/** "Backs.": close on his grin. */
const BacksClose: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const pose: Pose = { ...STAND, armF: [150, 22], armB: [-10, 20] };
  const head = headAt(TAEHO_FRONT, PLATFORM, RANKS[0].s, pose, -1);
  const cam = camAt(frame, [[k.backs, closeUp(head.x - 40, head.y, 2.7)], [k.whisper, closeUp(head.x - 40, head.y, 3.0)]]);
  return (
    <SideClass frame={frame} cam={cam} drawn={1}
      actors={<Figure {...TAEHO} x={TAEHO_FRONT} y={PLATFORM} scale={RANKS[0].s} facing={-1} pose={pose} brows="angry" lids={0.15}
        mouth={frame < k.backs + 12 ? "open" : "smirk"} eyes={1} look={{ x: 0.9, y: 0 }} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 87 the hold

const WIDE: Camera = { x: 100, y: 640, zoom: 0.72 };
const FRONT_X = 1330; // the rival at the front, in the wide

/** The hold after "Backs.": the word runs back through the rows, each head leaning to the next; the rival at the front,
 *  arms folded. Then every eye on you. */
const WhisperShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.whisper, WIDE], [k.looked, { ...WIDE, x: 160, zoom: 0.76 }]]), frame, "whisper", 3);
  const lean = (row: number, rank: number) => {
    const reach = (frame - k.whisper) / 3 - row * 2.2 - rank * 0.6;
    return Math.max(0, Math.min(1, reach / 5)) * Math.max(0, 1 - Math.max(0, reach - 9) / 6);
  };
  return (
    <SideClass frame={frame} cam={cam} taehoSeated={false}
      poseOf={(row, rank) => ({ ...SEATED, lean: -10 * lean(row, rank), tilt: (rank % 2 ? 14 : -14) * lean(row, rank) })}
      faceOf={(row, rank) => ({ mouth: lean(row, rank) > 0.3 ? "o" : "flat", look: { x: lean(row, rank) > 0.3 ? -0.9 : 1, y: -0.1 }, brows: "raised" })}
      actors={<Figure {...TAEHO} x={FRONT_X} y={PLATFORM} scale={RANKS[0].s} facing={-1} pose={{ ...STAND, armF: [70, 100], armB: [60, 100] }}
        brows="angry" lids={0.2} mouth="smirk" eyes={1} look={{ x: 0.9, y: 0.1 }} time={frame} />} />
  );
};

/** End of the hold: you at your desk, the room's eyes on you; you swallow. */
const LookedShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const yh = seatHead(YOU_ROW);
  const cam = drift(camAt(frame, [[k.looked, closeUp(yh.x - 60, yh.y, 2.3)], [k.monday, closeUp(yh.x - 60, yh.y, 2.5)]]), frame, "looked", 2);
  const dart = Math.floor((frame - k.looked) / 9) % 2;
  return (
    <SideClass frame={frame} cam={cam} taehoSeated={false}
      faceOf={(row, rank) => (rank === 0 && row === YOU_ROW ? { brows: "worry", lids: 0, mouth: frame > k.looked + 20 ? "wobble" : "flat", eyes: 1.15, look: { x: dart ? -0.9 : 0.9, y: -0.1 } } : watching(row))} />
  );
};

// ------------------------------------------------------------------------------------------------ 88 Monday, the scrape

/** "Monday. You stand up with your score.": a score slaps on your desk; you step out and hold it up to the room. */
const MondayShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const up = ramp(frame, k.stand, k.stand + 12);
  const raise = ramp(frame, k.score - 4, k.score + 6);
  const x = mix(rowX(YOU_ROW), YOU_X, up);
  const y = mix(SEAT_Y, FLOOR, up);
  const pose = lerpPose(lerpPose(SEATED, STAND, up), STAND_UP, raise);
  const fall = ramp(frame, k.monday, k.monday + 6);
  const cam = drift(camAt(frame, [[k.monday, { x: 1000, y: 680, zoom: 2.0 }], [k.stand, { x: 1020, y: 660, zoom: 1.9 }], [k.wide, { x: 980, y: 640, zoom: 1.6 }]]), frame, "monday", 2);
  const face = up < 0.5 ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.1, look: { x: 0.6, y: 0.8 } } : { ...bragging(frame), look: { x: 0.8, y: -0.1 } };
  return (
    <SideClass frame={frame} cam={cam} youSeated={false} faceOf={(row) => watching(row)}
      actors={<>
        {up === 0 && raise === 0 && <g transform={`translate(${1030} ${mix(420, 752, fall)}) rotate(${mix(-30, -8, fall)})`}><Sheet tilt={0} /></g>}
        <Figure {...HERO} x={x} y={y} scale={RANKS[0].s} facing={up > 0.5 ? -1 : 1} pose={pose} blink={blinking(frame, 1)} time={frame} {...face}
          held={up > 0 ? <Sheet /> : undefined} />
      </>} />
  );
};

/** "A hundred chairs scrape.": the class side on; every chair spins round with a hop, front row to back, in one second;
 *  the rival holds, grinning at you, and goes last; your sheet starts down. */
const ScrapeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const turnOf = waveTurn(frame, k.scrape, k.rivalAt);
  const cam = drift(camAt(frame, [[k.wide, { x: 320, y: 860, zoom: 1.0 }], [k.pov, { x: 350, y: 850, zoom: 1.06 }]]), frame, "scrape", 2);
  const lower = ramp(frame, k.rivalAt + 8, k.rivalAt + 26) * 0.35;
  return (
    <SideClass frame={frame} cam={cam} youSeated={false} turnOf={turnOf} faceOf={turnedFace(frame, k.rivalAt, turnOf)}
      actors={<YouStanding frame={frame} lower={lower} face={{ brows: frame < k.scrape + 10 ? "raised" : "worry", lids: 0, mouth: frame < k.scrape ? "open" : "flat", eyes: 1.15, look: { x: 0.9, y: 0 } }} />} />
  );
};

/** "A hundred backs.": your view. Plain backs, chair backs, desks; your shoulder at the edge. */
const PovShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => (
  <>
    <PovRoom cam={drift(camAt(frame, [[k.pov, { x: 960, y: 560, zoom: 1.0 }], [k.reverse, { x: 960, y: 560, zoom: 1.05 }]]), frame, "pov", 3)} />
    <YourShoulder side="right" />
  </>
);

// ------------------------------------------------------------------------------------------------ 89 the room avoids you

/** "You wanted to avoid the red ones.": close on you, the sheet coming down to your side; in front of you, blank backs. */
const LowerShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const lower = mix(0.35, 1, ramp(frame, k.reverse + 8, k.lean - 14));
  const head = youHead();
  const turned = () => 1;
  const cam = drift(camAt(frame, [[k.reverse, closeUp(head.x - 160, head.y + 40, 2.1)], [k.lean, closeUp(head.x - 150, head.y + 30, 2.3)]]), frame, "lower", 2);
  return (
    <SideClass frame={frame} cam={cam} youSeated={false} turnOf={turned} faceOf={() => FACELESS}
      actors={<YouStanding frame={frame} lower={lower} face={{ brows: "worry", lids: mix(0, 0.35, lower), mouth: "flat", eyes: 1.1, look: { x: 0.9, y: 0.2 } }} />} />
  );
};

/** "Now the whole room is avoiding you": from behind you, you lean to see past the boy in front; he leans with you,
 *  and again, the other way. */
const LeanShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const leanAt = (f: number) => 11 * (ramp(f, 4, 13) - 2 * ramp(f, 28, 38) + 1.6 * ramp(f, 52, 58));
  const lean = leanAt(frame - k.lean);
  const follow = leanAt(frame - k.lean - 5);
  const isBoy = (r: number, c: number) => r === POV_BOY.r && c === POV_BOY.c;
  const cam = drift(camAt(frame, [[k.lean, { x: 980, y: 640, zoom: 1.3 }], [k.bye, { x: 980, y: 630, zoom: 1.38 }]]), frame, "lean", 2);
  return (
    <PovRoom cam={cam} shiftOf={(r, c) => (isBoy(r, c) ? follow * 8 : 0)} tiltOf={(r, c) => (isBoy(r, c) ? follow * 0.9 : 0)}
      front={<YouFromBehind x={povX(POV_BOY.r, POV_BOY.c) - 60} y={1030} s={1.8} lower={1} lean={lean} />} />
  );
};

/** "And they don't need to see your face to do it.": the room of backs; the rival waves bye over his shoulder,
 *  without turning. */
const ByeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const isRival = (r: number, c: number) => r === POV_RIVAL.r && c === POV_RIVAL.c;
  const arm = ramp(frame, k.bye + 14, k.bye + 22) * (1 - ramp(frame, k.nofaces - 8, k.nofaces));
  const rx = povX(POV_RIVAL.r, POV_RIVAL.c), ry = povY(POV_RIVAL.r) - 160 * povS(POV_RIVAL.r);
  const cam = drift(camAt(frame, [[k.bye, { x: 960, y: 560, zoom: 1.0 }], [k.nofaces, { x: mix(960, rx, 0.5), y: mix(560, ry, 0.4), zoom: 1.35 }]]), frame, "bye", 2);
  return (
    <>
      <PovRoom cam={cam} armOf={(r, c) => (isRival(r, c) ? arm : 0)} waveOf={(r, c) => (isRival(r, c) ? Math.sin((frame - k.bye) / 2.5) * 16 : 0)} />
      <YourShoulder side="right" />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ 90 no faces, no cards

/** "No faces, no cards,": your view; where a card would open over a head, a dashed outline flickers and is gone. */
const NoCardsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const ghosts = [[1, 3], [0, 8], [1, 6], [0, 2]].map(([r, c], i) => ({ r, c, at: k.nofaces + 6 + i * 10 }));
  const cam = drift(camAt(frame, [[k.nofaces, { x: 960, y: 560, zoom: 1.08 }], [k.sink, { x: 960, y: 560, zoom: 1.0 }]]), frame, "nocards", 2);
  return (
    <>
      <PovRoom cam={cam} over={ghosts.map(({ r, c, at }) => {
        const t = frame - at;
        if (t < 0 || t > 16) return null;
        const s = povS(r), x = povX(r, c), y = povY(r) - 118 * s - 40 * s * 0.95 - 210 * s;
        const k2 = t < 4 ? t / 4 : t < 10 ? 1 : 1 - (t - 10) / 6;
        return <rect key={`${r}-${c}`} x={x - 130 * s * k2} y={y - 55 * s} width={260 * s * k2} height={110 * s} rx={12} fill="none" stroke={INK} strokeWidth={9}
          strokeDasharray="20 14" opacity={0.9 * k2} />;
      })} />
      <YourShoulder side="right" />
    </>
  );
};

/** "Your edge is gone,": you sink back into your chair; the sheet slips from your fingers and drifts to the floor. */
const SinkShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const sit = ramp(frame, k.sink + 2, k.sink + 18);
  const fall = ramp(frame, k.sink + 6, k.phone - 2);
  const x = mix(YOU_X, rowX(YOU_ROW), sit);
  const pose = lerpPose(SHEET_DOWN, SEATED, sit);
  const cam = drift(camAt(frame, [[k.sink, { x: 1000, y: 700, zoom: 1.8 }], [k.phone, { x: 980, y: 720, zoom: 1.95 }]]), frame, "sink", 2);
  return (
    <SideClass frame={frame} cam={cam} youSeated={false} turnOf={() => 1} faceOf={() => FACELESS}
      actors={<>
        <Figure {...HERO} x={x} y={mix(FLOOR, SEAT_Y, sit)} scale={RANKS[0].s} facing={1} pose={pose} brows="sad" lids={0.4} mouth="flat" eyes={1}
          look={{ x: 0.3, y: 0.8 }} blink={blinking(frame, 1)} time={frame} />
        <g transform={`translate(${mix(1060, 1180, fall) + Math.sin(fall * 9) * 30} ${mix(820, FLOOR - 10, fall)}) rotate(${mix(70, 92, fall) + Math.sin(fall * 9) * 20})`}>
          <Sheet tilt={0} />
        </g>
      </>} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

type Cut = "problem" | "rival" | "brag" | "walk" | "board" | "chair" | "backs" | "whisper" | "looked" | "monday" | "scrape" | "pov" | "lower" | "lean"
  | "bye" | "nocards" | "sink" | "phone" | "weeks";

const Backs: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const cut = current<Cut>(frame, [
    [0, "problem"], [k.rival, "rival"], [k.brag, "brag"], [k.walk, "walk"], [k.board, "board"], [k.chair, "chair"], [k.backs, "backs"],
    [k.whisper, "whisper"], [k.looked, "looked"], [k.monday, "monday"], [k.wide, "scrape"], [k.pov, "pov"], [k.reverse, "lower"],
    [k.lean, "lean"], [k.bye, "bye"], [k.nofaces, "nocards"], [k.sink, "sink"], [k.phone, "phone"], [k.weeks, "weeks"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cut === "problem" && <ProblemShot frame={frame} k={k} />}
      {cut === "rival" && <RivalWatchShot frame={frame} k={k} />}
      {cut === "brag" && <BragShot frame={frame} k={k} />}
      {cut === "walk" && <WalkShot frame={frame} k={k} />}
      {cut === "board" && <BoardInsert frame={frame} from={k.board} t={{ you: k.you, face: k.face, eye: k.eye, cross: k.cross }} />}
      {cut === "chair" && <ChairShot frame={frame} k={k} />}
      {cut === "backs" && <BacksClose frame={frame} k={k} />}
      {cut === "whisper" && <WhisperShot frame={frame} k={k} />}
      {cut === "looked" && <LookedShot frame={frame} k={k} />}
      {cut === "monday" && <MondayShot frame={frame} k={k} />}
      {cut === "scrape" && <ScrapeShot frame={frame} k={k} />}
      {cut === "pov" && <PovShot frame={frame} k={k} />}
      {cut === "lower" && <LowerShot frame={frame} k={k} />}
      {cut === "lean" && <LeanShot frame={frame} k={k} />}
      {cut === "bye" && <ByeShot frame={frame} k={k} />}
      {cut === "nocards" && <NoCardsShot frame={frame} k={k} />}
      {cut === "sink" && <SinkShot frame={frame} k={k} />}
      {cut === "phone" && <PhoneInsert frame={frame} at={k.phone} removed={k.removed} drop={k.drop} />}
      {cut === "weeks" && <Countdown frame={frame} at={k.weeks} tear={k.tear} />}
      <MeterSound at={k.read + 3} />
      {/* the scrape: a burst of chair clicks under the wave, the rival's alone */}
      {[0, 5, 9, 14, 19, 24].map((d) => <Sequence key={d} from={k.scrape + d} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.35 + noise(d) * 0.2} /></Sequence>)}
      <Sequence from={k.rivalAt + 2} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.tear} durationInFrames={16}><Audio src={staticFile("sfx/flutter.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};

export const backs: Beat = { id: "Backs", firstLine: 84, Component: Backs };
