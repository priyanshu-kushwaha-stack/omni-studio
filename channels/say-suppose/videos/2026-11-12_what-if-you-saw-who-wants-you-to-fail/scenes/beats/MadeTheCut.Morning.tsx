// Made the Cut, lines 1-2 (morning): after the platform skit. Close on you on the empty platform, your hand coming down
// out of the air; the letter close (a school crest with no lettering, the teal seal), two seconds, folding shut; you
// fold it and push it inside your jacket, your eyes going up to the empty air where her card was; the title question
// on a push from your chest to your eyes, a train passing behind you, your hand flat on the jacket; then the classroom:
// your best friend talking at you, your hand flat on the letter inside your jacket, your mouth shut. (v4.2, outside
// review: 0:20-0:28 were a held letter and a held face.)
//
// v7 (outside review of v6): straight from the doors closing to the letter close; a big SCHOLARSHIP stamp thumps onto
// it on "You made the cut"; then you fold it, your eyes go up to the empty air where her card was, and you hide it in
// your jacket, your thumb over the stamp; the classroom starts on "You tell nobody" and plays three beats: he talks at
// you, you almost pull the letter out and push it back, he hooks an arm round your neck laughing ("He always has").
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
import { FONT } from "@whatif/kit/fonts";
import { headAt, Letter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, ramp } from "../shared";
import { aimArm, shoulderAt } from "./MadeTheCut.parts";
import { PLAT, PlatformStage } from "./Platform";

export interface MorningTimes { letter: number; stamp: number; pocket: number; classroom: number; end: number }

/** The letter, big: a school crest (a shield with a book, no lettering), ink bars for the words, the teal seal; your
 *  hand holding its bottom edge. */
const BigLetter: React.FC<{ frame: number; from: number; to: number; stamp: number }> = ({ frame, from, to, stamp }) => {
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
      {/* the stamp, thumped down on "You made the cut": one big word, tilted, in teal ink */}
      {frame >= stamp && (() => {
        const d = frame - stamp;
        const sc = d < 5 ? mix(1.9, 1, d / 5) : 1;
        return (
          <g transform={`translate(-10 40) rotate(-9) scale(${sc})`} opacity={d < 5 ? 0.6 + d * 0.08 : 1}>
            <rect x={-270} y={-62} width={540} height={124} rx={16} fill="none" stroke={TEAL} strokeWidth={12} />
            <text x={0} y={25} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70} fill={TEAL} letterSpacing={2}>SCHOLARSHIP</text>
          </g>
        );
      })()}
      <ellipse cx={-120} cy={470} rx={190} ry={120} fill={MUSTARD} stroke={INK} strokeWidth={8} />
      <rect x={-200} y={380} width={70} height={110} rx={35} fill={MUSTARD} stroke={INK} strokeWidth={7} />
    </g>
  );
};

/** The classroom insert, three beats: your best friend at the next seat talking at you, hands going; you almost pull
 *  the letter out of your jacket (its top shows, your mouth opens) and push it back; he hooks an arm round your neck,
 *  laughing ("He always has"), your mouth shut. */
const ClassroomInsert: React.FC<{ frame: number; t: MorningTimes; mood: MoodName }> = ({ frame, t, mood }) => {
  const him = seat(640, 850, 1.05, 1);
  const you = seat(900, 850, 1.05, -1);
  const span = t.end - t.classroom;
  const b1 = t.classroom + Math.round(span * 0.36), b2 = t.classroom + Math.round(span * 0.66);
  const talking = Math.floor((frame - t.classroom) / 5) % 3 !== 0;
  const hand = Math.sin((frame - t.classroom) / 4) * 20;
  const yh = headAt(you.x, you.y, you.scale, SEATED, -1);
  // beat 2: the letter slides up out of the jacket, you stop, it goes back
  const pull = ramp(frame, b1 + 6, b1 + 20) * (1 - ramp(frame, b2 - 22, b2 - 8));
  // beat 3: his near arm round your neck
  const hook = ramp(frame, b2 + 2, b2 + 14);
  const hb = { ...him, pose: SEATED };
  const hookArm = aimArm(hb, { x: yh.x + 10, y: yh.y + 70 });
  const himPose: Pose = frame >= b2 ? { ...SEATED, armF: [mix(20, hookArm[0], hook), mix(60, hookArm[1], hook)], armB: [-150, -20], tilt: 8, lean: 6 * hook }
    : { ...SEATED, armB: [-60 + hand, 60], tilt: 4 };
  const cam = drift(frame < b1 ? camAt(frame, [[t.classroom, { x: 770, y: 700, zoom: 2.5 }], [b1, { x: 780, y: 695, zoom: 2.65 }]])
    : frame < b2 ? camAt(frame, [[b1, { x: yh.x - 20, y: yh.y + 70, zoom: 2.8 }], [b2, { x: yh.x - 20, y: yh.y + 65, zoom: 2.95 }]])
    : camAt(frame, [[b2, { x: 760, y: 690, zoom: 2.3 }], [t.end, { x: 760, y: 680, zoom: 2.4 }]]), frame, "class", 3);
  const options = { ...classroom.defaults, board: "graph" as const };
  const props = { cam, mood, frame, options };
  const yourFace = frame >= b1 && frame < b2
    ? { brows: "raised" as const, lids: 0, mouth: pull > 0.5 ? "open" as const : "flat" as const, eyes: 1.1, look: { x: 0.8, y: pull > 0.8 ? 0.6 : -0.1 } }
    : { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: frame >= b2 ? 0 : 0.2 } };
  const actors = (
    <>
      <Figure {...him} pose={himPose} head={MINJUN.head} coat={MINJUN.coat} {...EXPRESSIONS.happy}
        mouth={frame >= b2 ? (Math.floor(frame / 6) % 2 ? "open" : "smile") : talking ? "open" : "smile"} eyes={1.1} lids={frame >= b2 ? 0.45 : 0}
        look={{ x: 0.9, y: -0.1 }} blink={blinking(frame, 2)} time={frame} />
      {/* the letter in your jacket: its corner, or its top half when you almost pull it out */}
      <g transform={`rotate(-12 ${yh.x} ${yh.y + 160})`}>
        <rect x={yh.x - 10} y={yh.y + 150 - pull * 70} width={34 + pull * 20} height={24 + pull * 70} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
        {pull > 0.4 && <circle cx={yh.x + 24} cy={yh.y + 150 - pull * 70 + 22} r={8} fill={TEAL} />}
      </g>
      <Figure {...you} pose={{ ...SEATED, armF: [20, 125] }} {...HERO} {...yourFace} blink={blinking(frame, 0)} time={frame} />
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
  const on = current(frame, [[t.letter, "letter"], [t.pocket, "pocket"], [t.classroom, "classroom"]]);
  if (on === "classroom") return <ClassroomInsert frame={frame} t={t} mood={mood} />;
  if (on === "letter") {
    const shake = frame >= t.stamp && frame < t.stamp + 6 ? (t.stamp + 6 - frame) * 3 : 0;
    const cam = drift(camAt(frame, [[t.letter, { x: 960, y: 560, zoom: 0.92 }], [t.pocket, { x: 960, y: 500, zoom: 1.18 }]]), frame, "letter", 2);
    return <Stage cam={{ ...cam, y: cam.y + shake }} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#9aa3ad" />} actors={<BigLetter frame={frame} from={t.letter} to={t.pocket} stamp={t.stamp} />} />;
  }
  return <Pocket frame={frame} t={t} mood={mood} />;
};

/** The rest of line 1, on the empty platform, waist up: you fold the letter; on "a card just opened over a stranger"
 *  your eyes go up to the empty air where her card was; on "a number only you can see" you push the letter inside
 *  your jacket, your thumb over the stamp, and your hand stays flat on it. */
const Pocket: React.FC<{ frame: number; t: MorningTimes; mood: MoodName }> = ({ frame, t, mood }) => {
  const body = { x: PLAT.you.x, y: PLAT.you.y, scale: PLAT.you.scale, facing: 1 as const };
  const held: Pose = { ...STAND, armF: [60, 70], armB: [-7, 8] };
  const sh = shoulderAt({ ...body, pose: held });
  const chest: Pose = { ...STAND, armF: aimArm({ ...body, pose: held }, { x: sh.x + 26 * body.scale, y: sh.y + 52 * body.scale }), armB: [-7, 8] };
  const span = t.classroom - t.pocket;
  const upAt = t.pocket + Math.round(span * 0.12), tuckAt = t.pocket + Math.round(span * 0.5);
  const tuck = ramp(frame, tuckAt, tuckAt + 18);
  const pose = lerpPose(held, chest, tuck);
  const h = headAt(body.x, body.y, body.scale, pose, 1);
  // the letter: folded in half from the start of the shot, smaller as it slides in, gone once it is inside
  const letter = tuck < 0.9
    ? <g transform={`scale(${1 - tuck * 0.35} ${0.55 - tuck * 0.2})`}><Letter x={2} y={4} scale={0.42} tilt={mix(-4, -70, tuck)} /></g>
    : undefined;
  const up = frame >= upAt && frame < tuckAt - 4; // eyes up to the empty air
  const face = { brows: up ? "raised" as const : "flat" as const, lids: up ? 0 : 0.25, mouth: "flat" as const, eyes: up ? 1.15 : 1,
    look: up ? { x: 0.6, y: -0.9 } : frame >= tuckAt ? { x: 0.25, y: 0.05 } : { x: 0.7, y: 0.6 } };
  const cam = drift(camAt(frame, [[t.pocket, closeUp(h.x + 60, h.y + 120, 1.95)], [tuckAt, closeUp(h.x + 50, h.y + 90, 2.15)], [t.classroom, closeUp(h.x + 30, h.y + 30, 2.6)]]), frame, "morning", 3);
  // after it is in: the letter's corner just showing at the jacket's edge, under your hand
  const corner = tuck >= 0.9 ? <rect x={sh.x + 4} y={sh.y + 40 * body.scale} width={30} height={20} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} transform={`rotate(-14 ${sh.x + 20} ${sh.y + 50 * body.scale})`} /> : null;
  return <PlatformStage frame={frame} cam={cam} mood={mood} you={{ pose, face, held: letter }} extra={corner} />;
};
