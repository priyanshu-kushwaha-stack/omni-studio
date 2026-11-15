// The Photo's pieces (builder C): your brother in his gown and mortarboard, the two views of the hall, tears, the
// morning kitchen standing up (the library kitchen with the table where the earlier beats put it), the band's pay plate,
// and the phone with THE photo on it.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { joints, STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import { kitchen, type KitchenOptions } from "@whatif/kit/sets/Kitchen";
import { FridgeNotes } from "./V6.Kit";
import { Deep, setLook, SetScene } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Band, headAt, Jar } from "../parts";
import { BROTHER, HERO, PASTELS } from "../shared";
import { GRAD, gradHall, Gown, Mortarboard, SeatedFront } from "../sets/GradHall";
import type { Body } from "./NightShift.Rig";
import type { Face } from "./NightShift.Rooms";

// ---------------------------------------------------------------- faces

/** Tears running from both eyes (`k` 0..1 how many), over a Figure's head; they fall on a loop with the frame. */
export const Tears: React.FC<{ b: Body; frame: number; k?: number; look?: { x: number; y: number } }> = ({ b, frame, k = 1, look = { x: 0.4, y: 0 } }) => {
  if (k <= 0) return null;
  const j = joints(b.pose);
  const ex = look.x * 12;
  const ey = look.y * 8;
  return (
    <g opacity={k} transform={`translate(${b.x} ${b.y}) scale(${b.scale * b.facing} ${b.scale}) translate(${j.head.x} ${j.head.y}) rotate(${b.pose.tilt})`}>
      {[-10, 17].map((cx, i) => {
        const t = ((frame * 1.4 + i * 17) % 34) / 34;
        return (
          <g key={cx}>
            <path d={`M${cx + ex} ${10 + ey} Q${cx + ex - 2} ${24 + ey} ${cx + ex - 1} ${36 + ey}`} fill="none" stroke="#9fd9ec" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
            <path d={`M${cx + ex - 1} ${12 + ey + t * 34} q-5 8 0 11 q5 -3 0 -11Z`} fill="#bfe8f7" stroke="#5aa8c8" strokeWidth={1.5} opacity={1 - t * 0.6} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the hall

/** Your brother in his gown and mortarboard (no band under it). */
export const GradBrother: React.FC<{ b: Body; face: Partial<FigureProps>; frame: number; held?: React.ReactNode }> = ({ b, face, frame, held }) => {
  const h = headAt(b.x, b.y, b.scale, b.pose, b.facing);
  return (
    <g>
      <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={BROTHER.head} coat="#2b2f5a" time={frame}
        blink={(frame + 31) % 97 < 4} held={held} {...face} />
      <Gown x={b.x} y={b.y} scale={b.scale} facing={b.facing} drop={b.pose.drop} />
      <Mortarboard x={h.x} y={h.y + h.r * 0.05} r={h.r} facing={b.facing} />
    </g>
  );
};

/** The hall, stage view (lit `day`), with `actors` on the stage. */
export const HallStage: React.FC<{ frame: number; cam: Camera; actors: React.ReactNode; heads?: boolean }> = ({ frame, cam, actors, heads = true }) => (
  <SetScene set={gradHall} mood="day" frame={frame} cam={cam} cast={[]} options={{ view: "stage", heads }} actors={actors} />
);

/** The hall, audience view: you in the second row (crying, phone up, pointing back as the beat says). */
export const HallAudience: React.FC<{ frame: number; cam: Camera; pose: Pose; face: Face; tears: number; phone: boolean }> = ({ frame, cam, pose, face, tears, phone }) => {
  const r = GRAD.rows[1];
  const b: Body = { x: GRAD.you.x, y: r.seat + 112 * r.s, scale: r.s, facing: 1, pose };
  return (
    <SetScene set={gradHall} mood="day" frame={frame} cam={cam} cast={[]} options={{ view: "audience", leave: [GRAD.you.x] }}
      actors={
        <g>
          <SeatedFront x={GRAD.you.x} seat={r.seat} s={r.s} pose={pose}
            who={{ ...HERO, ...face, time: frame, held: phone ? <HandPhone lit scale={0.9} /> : undefined }} />
          <Tears b={b} frame={frame} k={tears} look={face.look} />
        </g>
      } />
  );
};

/** Where your head is in the audience view (for close-ups). */
export const youInRow = (pose: Pose = STAND) => headAt(GRAD.you.x, GRAD.rows[1].seat + 112 * GRAD.rows[1].s, GRAD.rows[1].s, pose, 1);

// ---------------------------------------------------------------- the morning kitchen

/** The kitchen table, as The Rule and Crumbs put it (in front of the counter, the jar on it). */
export const TABLE = { top: 800, from: 560, to: 1380, jar: { x: 930, y: 800 }, plate: { x: 1160, y: 800 } } as const;
const OPTIONS: KitchenOptions = { stove: "kettle", steam: 0.4, counter: ["mug"] };

/** The library kitchen at `cam` with the table; `under` draws behind the table, `actors` in front of it. */
export const MorningKitchen: React.FC<{ frame: number; cam: Camera; mood?: MoodName; jarFill?: number; under?: React.ReactNode;
  onTable?: React.ReactNode; actors?: React.ReactNode; debt?: { amount: string; was?: string; flyer?: boolean } }> = ({ frame, cam, mood = "morning", jarFill = 0.5, under, onTable, actors, debt }) => {
  const props = { cam, mood, frame, options: OPTIONS };
  return (
    <LookContext.Provider value={setLook(kitchen.lights(OPTIONS), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={kitchen.Back(props)}
        actors={
          <>
            {debt && <FridgeNotes {...debt} />}
            {under}
            <rect x={TABLE.from} y={TABLE.top} width={TABLE.to - TABLE.from} height={26} rx={8} fill="#b27a4d" stroke={INK} strokeWidth={5} />
            <rect x={TABLE.from + 30} y={TABLE.top + 26} width={22} height={140} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
            <rect x={TABLE.to - 52} y={TABLE.top + 26} width={22} height={140} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
            <Jar x={TABLE.jar.x} y={TABLE.jar.y} w={110} h={140} fill={jarFill} />
            {onTable}
            {actors}
          </>
        } />
    </LookContext.Provider>
  );
};

// ---------------------------------------------------------------- the phone and THE photo

/** THE photo, drawn small: the hall; you in the second row, crying, phone up; him on the stage in the gown, pointing at
 *  you. In its own w x h box from (0, 0). */
export const PhotoPicture: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const s = w / 860;
  return (
    <g transform={`scale(${s} ${h / 440})`}>
      <rect width={860} height={440} fill="#dccfae" />
      {/* the stage, right */}
      <rect x={440} y={0} width={420} height={290} fill="#3d3550" />
      <rect x={430} y={0} width={60} height={290} fill="#8e2236" /><rect x={820} y={0} width={40} height={290} fill="#8e2236" />
      <rect x={520} y={40} width={250} height={46} fill={PAPER} stroke={INK} strokeWidth={3} />
      <circle cx={645} cy={63} r={12} fill={MUSTARD} />
      <rect x={430} y={290} width={430} height={40} fill="#7a4f30" />
      <path d="M626 285 L604 180 H648 L670 285Z" fill="#2b2f5a" />
      <circle cx={636} cy={162} r={24} fill={BROTHER.head} />
      <path d="M606 140 L640 128 L668 140 L634 152Z" fill="#2b2f5a" />
      <path d="M620 196 L560 230" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <circle cx={560} cy={230} r={7} fill={BROTHER.head} />
      <path d="M626 160 q4 6 0 8" fill="none" stroke={INK} strokeWidth={3} />
      {/* the rows, left; you in the second row */}
      <rect x={0} y={330} width={860} height={110} fill="#b07a4a" />
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={`b${i}`} cx={30 + i * 72} cy={300} r={22} fill={PASTELS[(i * 3) % 8]} />)}
      {[0, 1, 2, 4, 5].map((i) => <circle key={`f${i}`} cx={50 + i * 80} cy={370} r={28} fill={PASTELS[(i * 5 + 2) % 8]} />)}
      <rect x={255} y={300} width={36} height={60} rx={10} fill={TEAL} />
      <circle cx={272} cy={270} r={30} fill={MUSTARD} />
      <circle cx={264} cy={266} r={4} fill={INK} /><circle cx={282} cy={266} r={4} fill={INK} />
      <path d="M262 276 q2 10 1 16 M281 276 q2 10 1 16" stroke="#7fc4e0" strokeWidth={4} strokeLinecap="round" />
      <path d="M266 284 q6 -5 12 0" fill="none" stroke={INK} strokeWidth={3} />
      <path d="M292 290 L318 246" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <rect x={306} y={222} width={22} height={34} rx={4} fill="#1b1d24" transform="rotate(14 317 239)" />
    </g>
  );
};

/** The phone held sideways, close: THE photo on its screen; `hand` is whose fingers hold it; `tilt` turns it. */
export const PhoneInsert: React.FC<{ frame: number; cam: Camera; hand: string; tilt?: number; dim?: number }> = ({ cam, hand, tilt = 0, dim = 0 }) => {
  const W = 1040, H = 560;
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={0.7} flat>
          <rect x={-800} y={-600} width={3600} height={2400} fill="#d6e8d8" />
          <rect x={-800} y={720} width={3600} height={1200} fill="#c98f5e" />
          <circle cx={300} cy={260} r={420} fill="#fff2cc" opacity={0.35} />
        </Deep>
      }
      actors={
        <g transform={`translate(960 560) rotate(${tilt})`}>
          <rect x={-W / 2 - 34} y={-H / 2 - 30} width={W + 68} height={H + 60} rx={56} fill="#1b1d24" stroke={INK} strokeWidth={6} />
          <svg x={-W / 2} y={-H / 2} width={W} height={H} viewBox={`0 0 ${W} ${H}`}><PhotoPicture w={W} h={H} /></svg>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#fff" opacity={0.05 + dim} />
          {[-1, 1].map((d) => (
            <g key={d}>
              <ellipse cx={d * (W / 2 + 40)} cy={140} rx={70} ry={130} fill={hand} stroke={INK} strokeWidth={6} />
              <ellipse cx={d * (W / 2 + 10)} cy={-H / 2 + 60} rx={38} ry={26} fill={hand} stroke={INK} strokeWidth={5} />
            </g>
          ))}
        </g>
      } />
  );
};

/** The band in an open palm (yours, mustard), the night's pay on its plate above it. Insert framing, REF coordinates. */
export const PalmBand: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 30} rx={150} ry={70} fill={MUSTARD} stroke={INK} strokeWidth={6} />
    {[-90, -40, 10, 60].map((dx, i) => <ellipse key={i} cx={x + dx} cy={y - 26 + Math.abs(dx + 15) * 0.2} rx={26} ry={44} fill={MUSTARD} stroke={INK} strokeWidth={5} />)}
    <Band x={x} y={y + 10} scale={1.5} lit />
  </g>
);
