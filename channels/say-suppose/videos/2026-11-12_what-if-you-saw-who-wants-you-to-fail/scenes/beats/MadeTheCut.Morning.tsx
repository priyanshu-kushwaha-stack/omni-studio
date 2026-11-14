// Made the Cut, lines 1-2 (morning): after the platform skit. Close on you on the empty platform, your hand coming down
// out of the air; the letter close (a school crest with no lettering, the teal seal), two seconds, folding shut; you
// fold it and push it inside your jacket, your eyes going up to the empty air where her card was; the title question
// on a push from your chest to your eyes, a train passing behind you, your hand flat on the jacket; then the classroom:
// your best friend talking at you, your hand flat on the letter inside your jacket, your mouth shut. (v4.2, outside
// review: 0:20-0:28 were a held letter and a held face.)
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets/Classroom";
import { seat, setLook } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { headAt, Letter } from "../parts";
import { blinking, camAt, current, HERO, linear, MINJUN, mix, ramp } from "../shared";
import { aimArm, shoulderAt } from "./MadeTheCut.parts";
import { PLAT, PlatformStage } from "./Platform";

export interface MorningTimes { down: number; letter: number; think: number; classroom: number; end: number }

/** The letter, big: a school crest (a shield with a book, no lettering), ink bars for the words, the teal seal; your
 *  hand holding its bottom edge. */
const BigLetter: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const tilt = mix(-4, -2, ramp(frame, from, from + 60));
  // the last frames: your hand folds it in half (the sheet squashes about its middle crease) and takes it down
  const fold = ramp(frame, to - 14, to - 2);
  const lower = ramp(frame, to - 10, to);
  return (
    <g transform={`translate(960 ${560 + lower * 260}) rotate(${tilt - fold * 6}) scale(1 ${1 - fold * 0.5})`}>
      <rect x={-330} y={-430} width={660} height={860} rx={12} fill="#000" opacity={0.3} transform="translate(16 20)" />
      <rect x={-330} y={-430} width={660} height={860} rx={12} fill={PAPER} stroke={INK} strokeWidth={8} />
      <path d="M-60 -380 H60 V-300 Q60 -250 0 -225 Q-60 -250 -60 -300Z" fill="#22305a" stroke={INK} strokeWidth={6} />
      <path d="M-34 -330 Q0 -345 0 -320 Q0 -345 34 -330 V-290 Q0 -305 0 -285 Q0 -305 -34 -290Z" fill={PAPER} />
      <line x1={-230} y1={-190} x2={230} y2={-190} stroke={INK} strokeWidth={5} opacity={0.35} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-240} y={-140 + i * 62} width={i === 5 ? 260 : 480 - (i % 2) * 70} height={20} rx={10} fill={INK} opacity={0.5} />)}
      <circle cx={190} cy={300} r={72} fill="none" stroke={TEAL} strokeWidth={12} />
      <circle cx={190} cy={300} r={44} fill={TEAL} opacity={0.85} />
      <ellipse cx={-120} cy={470} rx={190} ry={120} fill={MUSTARD} stroke={INK} strokeWidth={8} />
      <rect x={-200} y={380} width={70} height={110} rx={35} fill={MUSTARD} stroke={INK} strokeWidth={7} />
    </g>
  );
};

/** The classroom insert: your best friend at the next seat talking at you, hands going; you, mouth shut, a hand flat
 *  on your jacket where the letter is. */
const ClassroomInsert: React.FC<{ frame: number; t: MorningTimes; mood: MoodName }> = ({ frame, t, mood }) => {
  const him = seat(640, 850, 1.05, 1);
  const you = seat(900, 850, 1.05, -1);
  const talking = Math.floor((frame - t.classroom) / 5) % 3 !== 0;
  const hand = Math.sin((frame - t.classroom) / 4) * 20;
  const yh = headAt(you.x, you.y, you.scale, SEATED, -1);
  const cam = drift(camAt(frame, [[t.classroom, { x: 770, y: 700, zoom: 2.5 }], [t.end, { x: 780, y: 695, zoom: 2.65 }]]), frame, "class", 3);
  const options = { ...classroom.defaults, board: "graph" as const };
  const props = { cam, mood, frame, options };
  const actors = (
    <>
      <Figure {...him} pose={{ ...SEATED, armB: [-60 + hand, 60], tilt: 4 }} head={MINJUN.head} coat={MINJUN.coat} {...EXPRESSIONS.happy}
        mouth={talking ? "open" : "smile"} eyes={1.1} look={{ x: 0.9, y: -0.1 }} blink={blinking(frame, 2)} time={frame} />
      <Figure {...you} pose={{ ...SEATED, armF: [20, 125] }} {...HERO} brows="flat" lids={0.3} mouth="flat" eyes={1}
        look={{ x: 0.7, y: 0.2 }} blink={blinking(frame, 0)} time={frame} />
      {/* the letter's corner under your hand, inside the jacket */}
      <rect x={yh.x - 10} y={yh.y + 150} width={34} height={24} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} transform={`rotate(-12 ${yh.x} ${yh.y + 160})`} />
      {classroom.Mid?.(props)}
    </>
  );
  return (
    <LookContext.Provider value={setLook(classroom.lights(options), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={classroom.Back(props)} actors={actors} front={classroom.Front?.(props)} />
    </LookContext.Provider>
  );
};

/** Lines 1-2. */
export const Morning: React.FC<{ frame: number; t: MorningTimes; mood: MoodName }> = ({ frame, t, mood }) => {
  // the letter insert is two seconds (outside review), then you pocket it
  const pocket = Math.min(t.letter + 66, t.think - 30);
  const on = current(frame, [[t.down, "down"], [t.letter, "letter"], [pocket, "pocket"], [t.think, "think"], [t.classroom, "classroom"]]);
  if (on === "classroom") return <ClassroomInsert frame={frame} t={t} mood={mood} />;
  if (on === "letter") {
    const cam = drift(camAt(frame, [[t.letter, { x: 960, y: 560, zoom: 0.92 }], [pocket, { x: 960, y: 500, zoom: 1.18 }]]), frame, "letter", 2);
    return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#9aa3ad" />} actors={<BigLetter frame={frame} from={t.letter} to={pocket} />} />;
  }
  if (on === "pocket" || on === "think") return <Pocket frame={frame} t={t} pocket={pocket} mood={mood} on={on} />;
  // On the empty platform: your other hand, still up from touching the card, comes down.
  const down = ramp(frame, t.down + 4, t.down + 24);
  const pose = lerpPose({ ...STAND, armF: [60, 70], armB: [140, 20] }, { ...STAND, armF: [60, 70], armB: [-7, 8] }, down);
  const h = headAt(PLAT.you.x, PLAT.you.y, PLAT.you.scale, pose, 1);
  const cam = drift(camAt(frame, [[t.down, closeUp(h.x + 40, h.y - 40, 2.0)], [t.letter, closeUp(h.x + 40, h.y + 20, 2.2)]]), frame, "morning", 3);
  const face = { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1.1, look: { x: 0.6, y: mix(-0.8, 0.3, down) } };
  return <PlatformStage frame={frame} cam={cam} mood={mood} you={{ pose, face, held: <Letter x={2} y={4} scale={0.42} tilt={-4} /> }} />;
};

/** The rest of line 1 and the title question (line 2's first half), on the empty platform. "pocket": waist up, you fold
 *  the letter, your eyes go up to the empty air where her card was, and you push the letter inside your jacket.
 *  "think": your hand stays flat on the jacket; the camera pushes from your chest to your eyes while a train runs
 *  through behind you; your eyes come round from the track to the lens on "who wants you to fail". */
const Pocket: React.FC<{ frame: number; t: MorningTimes; pocket: number; mood: MoodName; on: "pocket" | "think" }> = ({ frame, t, pocket, mood, on }) => {
  const body = { x: PLAT.you.x, y: PLAT.you.y, scale: PLAT.you.scale, facing: 1 as const };
  const held: Pose = { ...STAND, armF: [60, 70], armB: [-7, 8] };
  const sh = shoulderAt({ ...body, pose: held });
  const chest: Pose = { ...STAND, armF: aimArm({ ...body, pose: held }, { x: sh.x + 26 * body.scale, y: sh.y + 52 * body.scale }), armB: [-7, 8] };
  const tuck = ramp(frame, pocket + 26, pocket + 46);
  const pose = lerpPose(held, chest, tuck);
  const h = headAt(body.x, body.y, body.scale, pose, 1);
  // the letter: folded in half from the start of the shot, smaller as it slides in, gone once it is inside
  const letter = tuck < 0.9
    ? <g transform={`scale(${1 - tuck * 0.35} ${0.55 - tuck * 0.2})`}><Letter x={2} y={4} scale={0.42} tilt={mix(-4, -70, tuck)} /></g>
    : undefined;
  const up = frame >= pocket + 4 && frame < pocket + 24; // eyes up to the empty air
  const toLens = ramp(frame, mix(t.think, t.classroom, 0.45), mix(t.think, t.classroom, 0.6));
  const face = on === "pocket"
    ? { brows: up ? "raised" as const : "flat" as const, lids: up ? 0 : 0.25, mouth: "flat" as const, eyes: up ? 1.15 : 1, look: up ? { x: 0.6, y: -0.9 } : { x: 0.7, y: 0.6 } }
    : { brows: "flat" as const, lids: mix(0.3, 0.15, toLens), mouth: "flat" as const, eyes: 1, look: { x: mix(0.85, 0.15, toLens), y: mix(0.15, 0, toLens) } };
  const cam = drift(on === "pocket"
    ? camAt(frame, [[pocket, closeUp(h.x + 60, h.y + 120, 1.95)], [t.think, closeUp(h.x + 50, h.y + 100, 2.1)]])
    : camAt(frame, [[t.think, closeUp(h.x + 40, h.y + 110, 1.9)], [t.classroom, closeUp(h.x + 25, h.y + 5, 2.85)]]), frame, "morning", 3);
  // a train runs through behind you on the title question (no stop: it is not hers)
  const train = on === "think" ? mix(2600, -3400, linear(frame, t.think + 10, t.think + 120)) : null;
  // after it is in: the letter's corner just showing at the jacket's edge, under your hand
  const corner = tuck >= 0.9 ? <rect x={sh.x + 4} y={sh.y + 40 * body.scale} width={30} height={20} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} transform={`rotate(-14 ${sh.x + 20} ${sh.y + 50 * body.scale})`} /> : null;
  return <PlatformStage frame={frame} cam={cam} mood={mood} train={train} you={{ pose, face, held: letter }} extra={corner} />;
};
