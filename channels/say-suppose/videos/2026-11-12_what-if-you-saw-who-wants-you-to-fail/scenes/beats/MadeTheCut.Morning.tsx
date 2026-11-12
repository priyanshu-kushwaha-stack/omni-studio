// Made the Cut, lines 1-2 (morning): after the platform skit. Close on you on the empty platform, your hand coming down
// out of the air; the letter close (a school crest with no lettering, the teal seal); your face; then ONE two-second
// insert: the classroom, your best friend talking at you, your hand flat on the letter inside your jacket, your mouth
// shut.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, STAND } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets/Classroom";
import { seat, setLook } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { headAt, Letter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, ramp } from "../shared";
import { PLAT, PlatformStage } from "./Platform";

export interface MorningTimes { down: number; letter: number; think: number; classroom: number; end: number }

/** The letter, big: a school crest (a shield with a book, no lettering), ink bars for the words, the teal seal; your
 *  hand holding its bottom edge. */
const BigLetter: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const tilt = mix(-4, -2, ramp(frame, from, from + 60));
  return (
    <g transform={`translate(960 560) rotate(${tilt})`}>
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
  const on = current(frame, [[t.down, "down"], [t.letter, "letter"], [t.think, "think"], [t.classroom, "classroom"]]);
  if (on === "classroom") return <ClassroomInsert frame={frame} t={t} mood={mood} />;
  if (on === "letter") {
    const cam = drift(camAt(frame, [[t.letter, { x: 960, y: 540, zoom: 1.0 }], [t.think, { x: 960, y: 520, zoom: 1.1 }]]), frame, "letter", 2);
    return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#9aa3ad" />} actors={<BigLetter frame={frame} from={t.letter} />} />;
  }
  // On the empty platform: your other hand, still up from touching the card, comes down.
  const down = ramp(frame, t.down + 4, t.down + 24);
  const pose = lerpPose({ ...STAND, armF: [60, 70], armB: [140, 20] }, { ...STAND, armF: [60, 70], armB: [-7, 8] }, down);
  const h = headAt(PLAT.you.x, PLAT.you.y, PLAT.you.scale, pose, 1);
  const cam = drift(on === "down"
    ? camAt(frame, [[t.down, closeUp(h.x + 40, h.y - 40, 2.0)], [t.letter, closeUp(h.x + 40, h.y + 20, 2.2)]])
    : camAt(frame, [[t.think, closeUp(h.x + 30, h.y, 2.5)], [t.classroom, closeUp(h.x + 30, h.y, 2.7)]]), frame, "morning", 3);
  const face = on === "down"
    ? { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1.1, look: { x: 0.6, y: mix(-0.8, 0.3, down) } }
    : { brows: "flat" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.2 } };
  return <PlatformStage frame={frame} cam={cam} mood={mood} you={{ pose, face, held: <Letter x={2} y={4} scale={0.42} tilt={-4} /> }} />;
};
