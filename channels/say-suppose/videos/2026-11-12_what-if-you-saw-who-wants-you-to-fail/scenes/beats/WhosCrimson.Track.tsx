// Who's Red, why the enemy doesn't care, with the people themselves rather than diagrams (outside review of v4.1,
// 3:12-3:43: the still top-down desks and the lane-and-chair sheet read as slides).
//
//   38  "So a kid gives you everything ...": three panels (WhosCrimson.Panels.tsx); "Why?": the two of you at your
//       desks, his half of the bar in his hand, and the push to your face
//   40  "And envy picks someone who started where you did ...": one running track, paper figures on it: the kid outside
//       it on a bench, the rival far ahead strolling, you and your best friend side by side at the same start line,
//       walking level; after three and a half seconds, your two faces
//   41  v7 (outside review of v6, 4:07-4:23): "The kid isn't in the race.": the kid hops on a toy scooter and overtakes
//       everyone on the grass, outside the lanes; "The rival is twenty places ahead.": far past the finish, up a
//       comically tall post with a 20 on it, polishing his shoe; (the next desk is in WhosCrimson.Class.tsx) "the same
//       chocolate bar,": from above, his hand slides your half across to your desk; "the same exam.": one mock paper
//       slaps down on both desks at once. You and your best friend match each other's pace stride for stride.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Chocolate, headAt } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { DeskHalves, MathsBoard, SEAT, seatY } from "./WhosCrimson.Class";
import { CRIMSON } from "@whatif/kit/theme";
import { armTo, FlatShot, Pencil, SetShot, Shoe } from "./WhosCrimson.Common";
import { PanelsWhy } from "./WhosCrimson.Panels";
import { Cap } from "./WhosCrimson.More";
import type { CrimsonTimes } from "./WhosCrimson.Times";

type Props = { frame: number; k: CrimsonTimes; mood: MoodName };

// ------------------------------------------------------------------------------------------------ 38 the desks

/** One worksheet, the same on both desks: four lines of working and the board's triangle (`exam`: a red header band, the
 *  mock exam). Centred on (0, 0). */
const Worksheet: React.FC<{ exam?: boolean }> = ({ exam }) => (
  <g>
    <rect x={-150} y={-110} width={300} height={220} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    {exam && <rect x={-150} y={-110} width={300} height={34} rx={6} fill={CRIMSON} stroke={INK} strokeWidth={4} />}
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-120} y1={-70 + i * 36} x2={i === 3 ? 0 : 40} y2={-70 + i * 36} stroke={TEAL} strokeWidth={3} opacity={0.5} />)}
    <path d="M70 70 V-60 L130 70Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** The two desks side by side from straight above, centred on (x, y), alive: `sheets` 0..1 lands the same worksheet on
 *  both, `split` 0..1 breaks the bar on the napkin and slides the halves toward each desk, `roll` rolls one pencil. */
const DesksAlive: React.FC<{ x: number; y: number; sheets: number; split: number; roll: number; exam?: boolean }> = ({ x, y, sheets, split, roll, exam }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 1].map((side) => (
      <g key={side} transform={`translate(${side * 330} 0)`}>
        <rect x={-320} y={-260} width={640} height={520} rx={14} fill="#c9935e" stroke={INK} strokeWidth={6} />
        <rect x={-320} y={-260} width={640} height={30} rx={14} fill="#a87c52" />
        <g transform={`translate(${-50 + side * 10} ${mix(-260, -40, sheets)}) rotate(${mix(side * -16, side * -5, sheets)})`} opacity={Math.min(1, sheets * 3)}>
          <Worksheet exam={exam} />
        </g>
        <Pencil x={side * 40 - 60 + (side === 1 ? roll * 46 : 0)} y={150 + (side === 1 ? roll * 6 : 0)} angle={side * 8 - 4 + (side === 1 ? roll * 14 : 0)} />
      </g>
    ))}
    <rect x={-170} y={-110} width={340} height={230} rx={6} fill="#cfe6e0" stroke={INK} strokeWidth={4} transform="rotate(6)" />
    <Chocolate x={mix(-2, -110, split)} y={mix(4, 16, split)} scale={2.6} half="left" tilt={mix(0, -14, split)} />
    <Chocolate x={mix(2, 110, split)} y={mix(4, -6, split)} scale={2.6} half="right" tilt={mix(0, 9, split)} />
  </g>
);

type DeskView = "top" | "faces";

export const DesksWhy: React.FC<Props> = ({ frame, k, mood }) => {
  const view = current<DeskView>(frame, [[0, "top"], [k.deskFaces, "faces"]]);
  if (view === "top") return <PanelsWhy frame={frame} k={k} mood={mood} />;
  // "Why?": the two of you at your desks: he holds his half up and grins at you; your face falls
  const mh = headAt(SEAT.x[1], seatY, SEAT.scale, SEATED);
  const yh = headAt(SEAT.x[2], seatY, SEAT.scale, SEATED);
  const why = ramp(frame, k.deskFaces + 8, k.deskFaces + 16);
  const lift = 1;
  const mPose: Pose = { ...SEATED, armF: [mix(25, 96, lift), mix(35, 70, lift)] };
  const cam = drift(camAt(frame, [[k.deskFaces, closeUp((mh.x + yh.x) / 2 + 40, mh.y, 2.3)], [k.ladder, closeUp(yh.x - 10, yh.y, 2.75)]]), frame, "deskfaces", 2);
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "blank", drawn: 1 }} far={<MathsBoard cam={cam} />}
      behind={
        <>
          <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={mPose} {...EXPRESSIONS.happy} eyes={1.05} look={{ x: 1, y: 0 }}
            blink={blinking(frame, 2)} time={frame} held={<Chocolate x={0} y={-4} scale={0.55} half="right" tilt={-30} />} />
          <Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} pose={SEATED} brows={why > 0.5 ? "worry" : "none"} lids={mix(0, 0.2, why)}
            mouth={why > 0.5 ? "flat" : "smile"} eyes={1} look={{ x: -0.9, y: mix(0, -0.35, why) }} blink={blinking(frame, 1)} time={frame} />
        </>
      }
      actors={<g><Chocolate x={SEAT.x[2] + 92} y={755} scale={0.62} half="left" tilt={-8} /></g>} />
  );
};

// ------------------------------------------------------------------------------------------------ 40-41 the track

/** The track's ground, side on: sky, a line of trees, the infield grass, three lanes of red track, the start line. */
const TRACK = { top: 800, lane: 70, start: 520, finish: 1840 } as const;

const TrackGround: React.FC = () => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={1500} fill="#d8ebee" />
    {Array.from({ length: 16 }, (_, i) => (
      <g key={i}>
        <rect x={-300 + i * 190} y={560} width={16} height={120} fill="#6f4a2f" />
        <circle cx={-292 + i * 190} cy={540 - (i % 3) * 14} r={78 + (i % 2) * 16} fill={i % 2 ? "#7fae6e" : "#8fbd7a"} stroke={INK} strokeWidth={4} />
      </g>
    ))}
    <rect x={-1400} y={660} width={4800} height={TRACK.top - 660} fill="#a9cf86" />
    <rect x={-1400} y={TRACK.top} width={4800} height={TRACK.lane * 3} fill="#c8674a" />
    <rect x={-1400} y={TRACK.top + TRACK.lane * 3} width={4800} height={600} fill="#a9cf86" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-1400} y={TRACK.top + i * TRACK.lane - 3} width={4800} height={6} fill="#f6efe0" />)}
    <rect x={TRACK.start - 5} y={TRACK.top} width={10} height={TRACK.lane * 3} fill="#f6efe0" />
    <rect x={TRACK.finish - 5} y={TRACK.top} width={10} height={TRACK.lane * 3} fill="#f6efe0" />
    {/* the one seat at the finish: the scholarship */}
    <g transform={`translate(${TRACK.finish + 70} ${TRACK.top - 6})`}>
      <rect x={-40} y={-8} width={80} height={16} rx={6} fill={TEAL} stroke={INK} strokeWidth={5} />
      <rect x={-40} y={-88} width={14} height={84} rx={6} fill={TEAL} stroke={INK} strokeWidth={5} />
      <line x1={-30} y1={8} x2={-32} y2={50} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <line x1={30} y1={8} x2={32} y2={50} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
    {/* the kid's bench on the infield, outside the track */}
    <rect x={180} y={742} width={220} height={16} rx={5} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    {[200, 364].map((x) => <rect key={x} x={x} y={758} width={14} height={40} fill="#6a4630" />)}
  </g>
);

const KID = { x: 290, seat: 742, scale: 0.66 } as const;
/** The rival's post, past the finish: comically tall, a big 20 on it. */
const POST = { x: 1700, top: 400, w: 120 } as const;

const Post: React.FC = () => (
  <g>
    <rect x={POST.x - POST.w / 2} y={POST.top} width={POST.w} height={TRACK.top + TRACK.lane * 0.6 - POST.top} fill="#f6efe0" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={POST.x - POST.w / 2} y={POST.top + 70 + i * 90} width={POST.w} height={22} fill={TEAL} opacity={0.5} />)}
    <rect x={POST.x - POST.w / 2 - 14} y={POST.top - 14} width={POST.w + 28} height={20} rx={4} fill="#c8674a" stroke={INK} strokeWidth={5} />
    <text x={POST.x} y={POST.top + 104} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={84} fill={INK}>20</text>
  </g>
);

/** The toy scooter, its deck's middle at (x, y). */
const Scooter: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g>
    <line x1={x + 48} y1={y - 4} x2={x + 40} y2={y - 92} stroke="#3b3e47" strokeWidth={7} strokeLinecap="round" />
    <line x1={x + 26} y1={y - 92} x2={x + 56} y2={y - 92} stroke="#3b3e47" strokeWidth={8} strokeLinecap="round" />
    <rect x={x - 50} y={y - 6} width={104} height={12} rx={5} fill={TEAL} stroke={INK} strokeWidth={4} />
    {[-38, 48].map((dx) => (
      <g key={dx} transform={`translate(${x + dx} ${y + 12}) rotate(${frame * 24})`}>
        <circle r={11} fill="#f6efe0" stroke={INK} strokeWidth={4} />
        <line x1={-8} y1={0} x2={8} y2={0} stroke={INK} strokeWidth={3} />
      </g>
    ))}
  </g>
);

type TrackView = "wide" | "faces" | "kid" | "far";

export const TrackShot: React.FC<Props> = ({ frame, k, mood }) => {
  const view = current<TrackView>(frame, [[0, "wide"], [k.raceFaces, "faces"], [k.kidOut, "kid"], [k.taehoFar, "far"]]);
  const t = frame - k.race;
  // you and your best friend, neck and neck in the next lanes (he a stride to the right, so neither hides the other),
  // walking from the same start line; you put on a burst and he matches it at once; the rival far ahead, up his post
  const surge = (from: number) => ramp(frame, from, from + 12) * 50 + ramp(frame, from + 60, from + 72) * 50;
  const yX = TRACK.start + 40 + t * 1.5 + surge(k.race + 40);
  const mX = TRACK.start + 40 + t * 1.5 + surge(k.race + 44);
  const mFeet = TRACK.top + TRACK.lane * 1.6, yFeet = TRACK.top + TRACK.lane * 2.65;
  const mPose = walkPose(frame * 0.3 + 1.6), yPose = walkPose(frame * 0.3);
  const mh = headAt(mX + 110, mFeet, 0.92, mPose), yh = headAt(yX, yFeet, 1.0, yPose);
  // the kid on his scooter, on the grass outside the lanes, overtaking everyone
  const scoot = frame >= k.kidOut;
  const sx = KID.x + Math.max(0, frame - k.kidOut) * 16;
  const sPose: Pose = { ...STAND, lean: 10 };
  const sy = TRACK.top - 26;
  const bar = { x: sx + 40, y: sy - 92 };
  const sArms: Pose = { ...sPose, armF: armTo(sx, sy - 14, KID.scale, sPose, 1, bar), armB: armTo(sx, sy - 14, KID.scale, sPose, 1, { x: bar.x - 8, y: bar.y + 4 }) };
  const sh = headAt(sx, sy - 14, KID.scale, sArms);
  const taehoY = POST.top - 6;
  const tPose: Pose = { ...STAND, armF: [70, 60], armB: [40, 70] };
  const tH = headAt(POST.x, taehoY, 0.62, tPose, -1);
  const swing = Math.sin(frame / 6) * 22;
  const kPose: Pose = { ...SEATED, legF: [70 + swing, -70], legB: [70 - swing, -70], armF: [40, 40], armB: [30, 50] };
  const ky = seatedY(KID.seat, KID.scale);
  const kh = headAt(KID.x, ky, KID.scale, kPose);
  const glance = ramp(frame, k.raceFaces + 10, k.raceFaces + 18) * (1 - ramp(frame, k.raceFaces + 40, k.raceFaces + 48));
  const cams: Record<TrackView, Camera> = {
    wide: camAt(frame, [[k.race, { x: 1000, y: 640, zoom: 1.02 }], [k.raceFaces, { x: 960, y: 680, zoom: 1.2 }]]),
    faces: camAt(frame, [[k.raceFaces, closeUp((mh.x + yh.x) / 2 + 30, (mh.y + yh.y) / 2, 2.6)], [k.kidOut, closeUp((mh.x + yh.x) / 2 + 30, (mh.y + yh.y) / 2, 2.8)]]),
    kid: { x: Math.max(700, sx + 160), y: 700, zoom: 1.55 },
    far: camAt(frame, [[k.taehoFar, { x: POST.x - 30, y: tH.y + 130, zoom: 1.9 }], [k.minjun, { x: POST.x - 30, y: tH.y + 110, zoom: 2.1 }]]),
  };
  const cam = drift(cams[view], frame, "track", 3);
  // a sideways glance at each other, level: he looks down a lane at you, you look up at him
  const runnerFace = (dy: number) => ({ brows: "flat" as const, lids: 0.15, mouth: "flat" as const, eyes: 1, look: { x: mix(0.95, 0.3, glance), y: mix(0, dy, glance) } });
  return (
    <FlatShot cam={cam} mood={mood} back={<TrackGround />} actors={
      <>
        {scoot ? (
          <>
            <Scooter x={sx} y={sy} frame={frame} />
            <Figure head={PASTELS[4]} coat="#3d6fb0" x={sx} y={sy - 14} scale={KID.scale} facing={1} pose={sArms} brows="raised" lids={0}
              mouth="open" eyes={1.15} look={{ x: 0.9, y: -0.1 }} blink={blinking(frame, 4)} time={frame} flow={0.5} />
            <Cap h={sh} facing={1} />
          </>
        ) : (
          <>
            <Figure head={PASTELS[4]} coat="#3d6fb0" x={KID.x} y={ky} scale={KID.scale} facing={1} pose={kPose} brows="raised" lids={0}
              mouth="smile" eyes={1.15} look={{ x: 0.9, y: 0.1 }} blink={blinking(frame, 4)} time={frame} />
            <Cap h={kh} facing={1} />
          </>
        )}
        <Post />
        <Figure {...TAEHO} x={POST.x} y={taehoY} scale={0.62} facing={-1} pose={tPose} brows="flat" lids={0.55} mouth={view === "far" ? "smirk" : "flat"}
          eyes={1} look={{ x: 0.2, y: 0.9 }} blink={blinking(frame, 3)} time={frame} held={<Shoe x={6} y={4} scale={0.9} tilt={-20} />} />
        <Figure {...MINJUN} x={mX + 110} y={mFeet} scale={0.92} pose={mPose} {...runnerFace(0.55)} blink={blinking(frame, 2)} time={frame} />
        <Figure {...HERO} x={yX} y={yFeet} scale={1.0} pose={yPose} {...runnerFace(-0.55)} blink={blinking(frame, 1)} time={frame} flow={0.25} />
      </>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 41 the same bar, the same exam

/** "the same chocolate bar,": the two of you behind your desks, the halves of one bar on them, pushing in; "the same
 *  exam.": from straight above, one mock paper slaps down on both desks in the same frame. */
export const SameShot: React.FC<Props> = ({ frame, k, mood }) => {
  if (frame >= k.sameExam) {
    const cam = drift(camAt(frame, [[k.sameExam, insert(960, 520, 1.25)], [k.youLane, insert(960, 520, 1.4)]]), frame, "exam", 2);
    return (
      <FlatShot cam={cam} mood={mood} back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#a9a08e" />}
        actors={<DesksAlive x={960} y={540} sheets={ramp(frame, k.sameExam + 2, k.sameExam + 8)} split={1} roll={0} exam />} />
    );
  }
  // "the same chocolate bar,": from above, his hand slides your half across the napkin to your desk
  const slide = ramp(frame, k.sameBar + 4, k.sameBar + 18);
  const away = ramp(frame, k.sameBar + 22, k.sameExam - 2);
  const split = mix(0.15, 1, slide);
  const half = { x: 960 + mix(2, 110, split), y: 540 + mix(4, -6, split) };
  const hand = { x: mix(half.x + 10, 200, away), y: mix(half.y - 20, -60, away) };
  const cam = drift(camAt(frame, [[k.sameBar, insert(980, 540, 1.45)], [k.sameExam, insert(990, 540, 1.6)]]), frame, "samebar", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#a9a08e" />} actors={
      <>
        <DesksAlive x={960} y={540} sheets={1} split={split} roll={0} />
        <polyline points={`-200,-300 ${mix(hand.x - 260, -100, away)},${mix(hand.y - 160, -200, away)} ${hand.x},${hand.y}`} fill="none" stroke={MINJUN.coat}
          strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={hand.x} cy={hand.y} r={30} fill={MINJUN.head} stroke={INK} strokeWidth={5} />
      </>
    } />
  );
};
