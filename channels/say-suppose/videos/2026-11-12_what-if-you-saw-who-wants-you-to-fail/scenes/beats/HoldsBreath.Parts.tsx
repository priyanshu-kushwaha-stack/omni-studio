// Pieces drawn for "The Country Holds Its Breath" (beats/HoldsBreath.tsx), each for the REF camera like a set: the exam
// hall from straight above, the paper plane, the dark market board, the police motorbike, the school gate with the
// parents, the lunch box, and the classroom desk from above for the notebook and the half kimbap.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { OUTSIDE, Sky, Skyline } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Ponytail, Vest } from "../parts";
import { JIYOON, noise, PASTELS } from "../shared";
import { Deep } from "../sets/common";
import { TopDownHead } from "../sets/ReadingRoom";

// ------------------------------------------------------------------------------------------------ the exam hall, above

/** Desk centres in the hall from above: columns and rows, and your desk. */
export const HALL = {
  cols: Array.from({ length: 11 }, (_, c) => -600 + c * 300),
  rows: Array.from({ length: 6 }, (_, r) => -140 + r * 260),
  you: { c: 5, r: 3 },
};

/** The exam hall from straight above: rows of single desks, an answer sheet on each, heads bent over them. */
export const ExamTopBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <Deep cam={cam} depth={1}>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#cbbd9f" />
    {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1400 + i * 130} y1={-800} x2={-1400 + i * 130} y2={1800} stroke="#000" strokeWidth={3} opacity={0.06} />)}
    {HALL.rows.map((y, r) => HALL.cols.map((x, c) => {
      const you = c === HALL.you.c && r === HALL.you.r;
      const write = Math.sin(frame / (5 + noise(c * 7 + r) * 4) + c) * 6;
      return (
        <g key={`${r}-${c}`}>
          <rect x={x - 110} y={y - 70} width={220} height={120} rx={6} fill="#c9a77a" stroke={INK} strokeWidth={4} />
          <rect x={x - 40 + noise(c + r * 11) * 20} y={y - 62} width={92} height={104} rx={3} fill={PAPER} stroke={INK} strokeWidth={2}
            transform={`rotate(${noise(r * 5 + c) * 10 - 5} ${x} ${y})`} />
          {[0, 1, 2, 3].map((l) => <rect key={l} x={x - 30} y={y - 48 + l * 22} width={60 - (l % 2) * 18} height={6} rx={3} fill="#4a4d58" opacity={0.5} />)}
          <rect x={x + 22 + write} y={y + 6} width={8} height={56} rx={4} fill={you ? TEAL : "#3b4a6b"} transform={`rotate(-20 ${x + 26} ${y + 30})`} />
          <TopDownHead x={x} y={y + 100} head={you ? MUSTARD : PASTELS[(c * 3 + r) % PASTELS.length]} coat={you ? "#3b3e47" : ["#3b4a6b", "#2a2d36", "#3b3e47"][(c + r) % 3]}
            turn={180} hair={you ? undefined : "#2a2730"} tuft={you} scale={0.95} />
        </g>
      );
    }))}
  </Deep>
);

// ------------------------------------------------------------------------------------------------ the plane

/** A paper plane, nose to the right, centred at (x, y). */
export const PaperPlane: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = -6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M120 0 L-90 -46 L-40 4Z" fill="#fbf6ea" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M120 0 L-40 4 L-70 40Z" fill="#e2d6bf" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M120 0 L-40 4" stroke={INK} strokeWidth={3} />
  </g>
);

// ------------------------------------------------------------------------------------------------ the market board

/** The trading floor with the board dark: rows of unlit price cells, a flat chart, empty desks with dark screens. */
export const MarketBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.6} flat>
      <rect x={-1400} y={-800} width={4800} height={2400} fill="#2a2d3a" />
      <rect x={300} y={130} width={1320} height={540} rx={10} fill="#12141b" stroke={INK} strokeWidth={14} />
      {Array.from({ length: 7 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
        <g key={`${r}-${c}`}>
          <rect x={330 + c * 150} y={160 + r * 68} width={136} height={56} rx={4} fill="#1d212c" />
          <rect x={344 + c * 150} y={176 + r * 68} width={60 + noise(r * 6 + c) * 30} height={10} rx={5} fill="#2b3040" />
          <rect x={344 + c * 150} y={194 + r * 68} width={40} height={10} rx={5} fill="#2b3040" />
          <path d={`M${450 + c * 150} ${180 + r * 68} l10 14 h-20z`} fill="#2b3040" />
        </g>
      )))}
      <rect x={1240} y={160} width={350} height={480} rx={4} fill="#1d212c" />
      <path d="M1260 420 H1570" stroke="#2f3a3a" strokeWidth={6} strokeDasharray="14 10" />
      {/* the clock over the board, stopped at the hour the market should have opened */}
      <circle cx={960} cy={70} r={46} fill="#3a3e4c" stroke={INK} strokeWidth={6} />
      <line x1={960} y1={70} x2={960} y2={36} stroke="#9aa1ab" strokeWidth={5} strokeLinecap="round" />
      <line x1={960} y1={70} x2={990} y2={70} stroke="#9aa1ab" strokeWidth={6} strokeLinecap="round" />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={820} width={4800} height={900} fill="#23252f" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`translate(${-200 + i * 380} 0)`}>
          <rect x={0} y={800} width={320} height={24} rx={4} fill="#4a4f5c" stroke={INK} strokeWidth={4} />
          {[30, 170].map((mx) => (
            <g key={mx}>
              <rect x={mx} y={690} width={120} height={84} rx={6} fill="#1b1d24" stroke={INK} strokeWidth={4} />
              <rect x={mx + 52} y={774} width={16} height={26} fill="#1b1d24" />
            </g>
          ))}
          <rect x={120} y={850} width={80} height={14} rx={6} fill="#3a3550" opacity={0.8 + 0.2 * Math.sin(frame / 90)} />
        </g>
      ))}
    </Deep>
  </>
);

// ------------------------------------------------------------------------------------------------ the police motorbike

/** A police motorbike, side on, nose to the right, wheels on y, a late student riding pillion. `frame` turns the
 *  wheels and blinks the light. */
export const PoliceBike: React.FC<{ x: number; y: number; frame: number; scale?: number }> = ({ x, y, frame, scale = 1 }) => {
  const seatTop = -96;
  const ride: Pose = { ...SEATED, lean: 14, armF: [96, -10], armB: [92, -6] };
  const hold: Pose = { ...SEATED, lean: 8, armF: [84, 4], armB: [80, 8] };
  const spin = frame * 24;
  const blue = Math.floor(frame / 5) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={190} ry={12} fill="#000" opacity={0.25} />
      {[-110, 112].map((wx) => (
        <g key={wx} transform={`translate(${wx} -48)`}>
          <circle r={48} fill={INK} />
          <circle r={26} fill="#9aa1ab" />
          <g transform={`rotate(${spin})`}>{[0, 60, 120].map((a) => <line key={a} x1={-24} y1={0} x2={24} y2={0} stroke={INK} strokeWidth={4} transform={`rotate(${a})`} />)}</g>
        </g>
      ))}
      <path d="M-150 -70 L-40 -70 L-10 -110 L90 -110 L150 -60 L130 -44 L-120 -44Z" fill="#eef1f4" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-110} y={-84} width={210} height={14} fill="#3d6fb0" />
      <path d="M100 -110 L130 -160 L150 -158" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M130 -160 L170 -150 L160 -120Z" fill="#cfe9f4" stroke={INK} strokeWidth={4} opacity={0.8} />
      <rect x={-170} y={-150} width={10} height={80} fill={INK} />
      <rect x={-188} y={-170} width={46} height={24} rx={6} fill={blue ? "#3d6fb0" : "#d8344f"} stroke={INK} strokeWidth={4} />
      <circle cx={-165} cy={-158} r={30} fill={blue ? "#3d6fb0" : "#d8344f"} opacity={0.3} />
      {/* the student behind, holding on; the officer in front */}
      <Figure x={-70} y={seatedY(seatTop, 1)} pose={hold} head={PASTELS[1]} coat="#3b4a6b" mouth="flat" brows="worry" look={{ x: 0.8, y: 0 }} time={frame} />
      <Figure x={20} y={seatedY(seatTop, 1)} pose={ride} head="#e6c49a" coat="#2a3550" cap="#2a3550" mouth="flat" brows="flat" look={{ x: 1, y: 0 }} time={frame} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the school gate

/** The gate anchors: the pavement line, the gate's gap, Ji-yoon's spot in the crowd. */
export const GATE = { floor: 990, gap: { from: 780, to: 1140 }, jiyoon: { x: 1420, y: 990 } };

/** Parents waiting outside, facing the gate, at scale s on floor y. */
const Parents: React.FC<{ frame: number; y: number; s: number; xs: number[]; seed: number }> = ({ frame, y, s, xs, seed }) => (
  <g>
    {xs.map((x, i) => {
      const toGate = x < (GATE.gap.from + GATE.gap.to) / 2 ? 1 : -1;
      const pose: Pose = noise(i + seed) < 0.4 ? { ...STAND, armF: [40, 80], armB: [30, 85] } : STAND;
      return (
        <Figure key={i} x={x} y={y + (i % 2) * 8} scale={s} facing={toGate as 1 | -1} pose={pose} head={PASTELS[(i * 3 + seed) % PASTELS.length]}
          coat={["#6d7f8f", "#7a5a8c", "#8a5c3b", "#5a6488", "#a8a29a"][(i + seed) % 5]} mouth="flat" brows={noise(i * 3 + seed) < 0.5 ? "worry" : "none"}
          lids={0.2} look={{ x: 0.9, y: -0.1 }} blink={(frame + i * 23) % 113 < 4} time={frame} />
      );
    })}
  </g>
);

/** The street outside the school gate on exam morning: the school behind its wall, the gate open, parents along the wall. */
export const GateBack: React.FC<{ cam: Camera; frame: number; mood: MoodName }> = ({ cam, frame, mood }) => {
  const o = OUTSIDE[mood];
  const g = GATE.gap;
  return (
    <>
      <Deep cam={cam} depth={0.1} flat><Sky id="gate" mood={mood} x={-1400} y={-800} w={4800} h={1500} sunAt={{ x: 1500, y: 160 }} /></Deep>
      <Deep cam={cam} depth={0.3} flat><Skyline mood={mood} from={-1400} to={3400} base={500} tall={260} seed={3} /></Deep>
      <Deep cam={cam} depth={0.6} flat>
        {/* the school: a long cream block, rows of windows, a flag pole */}
        <rect x={-300} y={180} width={2600} height={500} fill={o.dark ? "#8d8a80" : "#efe5cf"} />
        <rect x={-300} y={160} width={2600} height={30} fill="#b9b2a6" />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 16 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-240 + c * 160} y={220 + r * 130} width={110} height={80} rx={4} fill="#a8c4cf" stroke="#8a8478" strokeWidth={6} />
        )))}
        <rect x={1640} y={-40} width={10} height={260} fill="#6a6a70" />
      </Deep>
      <Deep cam={cam} depth={0.85}>
        {/* the wall with the gate's gap and its pillars, the gate slid open behind the right pillar */}
        <rect x={-1400} y={560} width={g.from + 1400} height={420} fill="#b8644a" stroke={INK} strokeWidth={5} />
        <rect x={g.to} y={560} width={3400 - g.to} height={420} fill="#b8644a" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={-1400 + i * 100} y1={560} x2={-1400 + i * 100} y2={980} stroke="#000" strokeWidth={3} opacity={0.08} />)}
        <rect x={-1400} y={548} width={4800} height={22} fill="#d9cbb0" stroke={INK} strokeWidth={4} />
        {[g.from - 70, g.to].map((px) => <rect key={px} x={px} y={430} width={70} height={550} fill="#e2d6bf" stroke={INK} strokeWidth={5} />)}
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={g.to + 90 + i * 30} y={600} width={10} height={370} fill="#3b3e47" />)}
        <rect x={g.to + 80} y={600} width={280} height={12} fill="#3b3e47" />
        <rect x={g.from} y={940} width={g.to - g.from} height={40} fill="#c9bfa8" />
        <Parents frame={frame} y={985} s={0.8} xs={[-260, -100, 60, 220, 380, 540, 1280, 1460, 1640, 1820, 1990, 2160]} seed={2} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={GATE.floor - 20} width={4800} height={900} fill="#d9cbb0" />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1400 + i * 140} y1={GATE.floor - 20} x2={-1500 + i * 140} y2={1700} stroke="#000" strokeWidth={3} opacity={0.07} />)}
      </Deep>
    </>
  );
};

/** The near parents, in the actors' slot (they stand clear of the gate and of Ji-yoon's spot). */
export const GateCrowd: React.FC<{ frame: number }> = ({ frame }) => (
  <Parents frame={frame} y={1010} s={1.1} xs={[80, 300, 520, 1700, 1930, 2150]} seed={7} />
);

/** The lunch box she packed, wrapped in a cloth knotted on top. (x, y) is its bottom centre. */
export const LunchBox: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-50} y={-56} width={100} height={56} rx={10} fill="#e6a0a0" stroke={INK} strokeWidth={4} />
    <path d="M-50 -30 H50" stroke="#c97f7f" strokeWidth={5} />
    <path d="M-8 -56 Q-30 -82 -14 -86 Q0 -74 0 -60 Q0 -74 14 -86 Q30 -82 8 -56Z" fill="#e6a0a0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** Ji-yoon at the gate straight off the shift: hair tied back, the vest, the lunch box held in both hands. `out` 0..1
 *  lowers her arms once you have taken it. */
export const JiyoonWithLunch: React.FC<{ x: number; y: number; scale: number; frame: number; face: object; holding: boolean; out?: number }> = ({
  x, y, scale, frame, face, holding, out = 0,
}) => {
  const up: Pose = { ...STAND, armF: [38, 84], armB: [30, 92] };
  const down: Pose = { ...STAND, armF: [14, 30], armB: [8, 34] };
  const pose: Pose = {
    ...STAND,
    armF: [up.armF[0] + (down.armF[0] - up.armF[0]) * out, up.armF[1] + (down.armF[1] - up.armF[1]) * out],
    armB: [up.armB[0] + (down.armB[0] - up.armB[0]) * out, up.armB[1] + (down.armB[1] - up.armB[1]) * out],
  };
  return (
    <g>
      <Ponytail x={x} y={y} scale={scale} pose={pose} facing={-1} />
      <Figure x={x} y={y} scale={scale} facing={-1} pose={pose} head={JIYOON.head} coat={JIYOON.coat} {...face} time={frame}
        held={holding ? <LunchBox x={-4} y={26} scale={0.9} /> : undefined} />
      <Vest x={x} y={y} scale={scale} pose={pose} facing={-1} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the desk from above

/** Min-jun's classroom desk from above at dusk: the wood, a pencil groove, the window's long light across it. */
export const DeskTopBack: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={1}>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#8a7a66" />
    <rect x={260} y={40} width={1400} height={1000} rx={20} fill="#c9a77a" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M270 ${90 + i * 80} Q960 ${110 + i * 80 + noise(i) * 20} 1650 ${90 + i * 80}`} fill="none" stroke="#b08e64" strokeWidth={6} />)}
    <rect x={320} y={90} width={600} height={34} rx={17} fill="#a88a68" />
    <path d="M260 1040 L900 40 L1300 40 L700 1040Z" fill="#ffcf8a" opacity={0.18} />
  </Deep>
);

/** Your mistake notebook, closed, from above: a teal cover with a paper label (ink bars), corners worn. Centre (x, y). */
export const MistakeBook: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-200} y={-270} width={420} height={560} rx={12} fill="#000" opacity={0.25} transform="translate(12 16)" />
    <rect x={-210} y={-280} width={420} height={560} rx={12} fill={TEAL} stroke={INK} strokeWidth={7} />
    <rect x={-210} y={-280} width={40} height={560} fill="#157a71" />
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={206} y={-262 + i * 92} width={10} height={70} fill={PAPER} opacity={0.9} />)}
    <rect x={-110} y={-190} width={260} height={130} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={-80} y={-160} width={180} height={18} rx={9} fill={INK} opacity={0.75} />
    <rect x={-80} y={-118} width={120} height={18} rx={9} fill={INK} opacity={0.5} />
  </g>
);

/** The same notebook, side on, lying on a desk (bottom centre at x, y). */
export const MistakeBookSide: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-70} y={-16} width={140} height={16} rx={3} fill={TEAL} stroke={INK} strokeWidth={3} />
    <rect x={-66} y={-11} width={132} height={6} fill={PAPER} />
  </g>
);
