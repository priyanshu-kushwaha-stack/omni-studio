// Pieces drawn for "The Country Holds Its Breath" (beats/HoldsBreath.tsx), each for the REF camera like a set: the exam
// hall from straight above, the paper plane, the runway with a grounded jet, the school gate with the parents and its
// bell, the lunch box, your sister with it, the classroom desk from above for the notebook and the chocolate, and the
// day pad that tears through the month to results day.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { OUTSIDE, Sky, Skyline } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Ponytail, Vest } from "../parts";
import { JIYOON, noise, PASTELS, ramp } from "../shared";
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
            turn={180} hair={you ? undefined : "#2a2730"} scale={0.95} />
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

// ------------------------------------------------------------------------------------------------ the runway

/** An airliner on the ground, side on, nose to the right, wheels on (x, y): white body, teal tail and stripe, a row of
 *  windows, the wing and engine, the gear down. About 560 wide at scale 1. */
export const GroundedJet: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={270} ry={12} fill="#000" opacity={0.16} />
    <path d="M-20 -66 L-110 -104 L-70 -104 L50 -68Z" fill="#9aa3ad" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-236 -78 L-286 -196 L-228 -196 L-150 -78Z" fill={TEAL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[-150, 0, 160].map((gx) => (
      <g key={gx}>
        <rect x={gx - 4} y={-40} width={8} height={26} fill="#5c6675" />
        <circle cx={gx} cy={-11} r={11} fill="#2a2d36" stroke={INK} strokeWidth={3} />
      </g>
    ))}
    <path d="M-280 -72 Q-280 -110 -210 -110 L210 -110 Q280 -108 292 -70 Q282 -36 210 -36 L-210 -36 Q-262 -38 -280 -72Z" fill="#f2f0ea" stroke={INK} strokeWidth={6} />
    <rect x={-250} y={-62} width={470} height={8} fill={TEAL} />
    {Array.from({ length: 15 }, (_, i) => <rect key={i} x={-190 + i * 26} y={-92} width={14} height={16} rx={5} fill="#9fc0e0" stroke={INK} strokeWidth={2} />)}
    <path d="M236 -96 L268 -96 Q280 -88 284 -78 L240 -80Z" fill="#9fc0e0" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M70 -56 L-120 -14 L-60 -14 L120 -54Z" fill="#c9ced6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-50} y={-44} width={82} height={30} rx={14} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
  </g>
);

/** The airport with nothing moving: the runway running away to the horizon with its edge lines, centre dashes and
 *  threshold bars, the terminal and the tower far off, the windsock hanging limp. `jet` puts an airliner holding on
 *  the ground beside the threshold; `plane` hangs a paper plane still in the sky at (x, y) (a layer at depth 0.5, so a
 *  camera can close on it: see `planeCam`). */
export const RunwayBack: React.FC<{ cam: Camera; mood: MoodName; jet?: boolean; plane?: { x: number; y: number } }> = ({ cam, mood, jet, plane }) => (
  <>
    <Deep cam={cam} depth={0.05} flat><Sky id="runway" mood={mood} x={-1400} y={-800} w={4800} h={2400} sunAt={{ x: 1400, y: 200 }} /></Deep>
    <Deep cam={cam} depth={0.3} flat>
      <rect x={-1400} y={470} width={4800} height={1200} fill="#a9bf8f" />
      <rect x={200} y={360} width={760} height={110} fill="#d9d2c2" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={220 + i * 62} y={385} width={44} height={36} fill="#9fc0e0" />)}
      <rect x={1180} y={230} width={40} height={240} fill="#d9d2c2" stroke={INK} strokeWidth={4} />
      <rect x={1150} y={200} width={100} height={50} rx={6} fill="#9fc0e0" stroke={INK} strokeWidth={4} />
    </Deep>
    {plane && <Deep cam={cam} depth={0.5} flat><PaperPlane x={plane.x} y={plane.y} scale={0.75} tilt={-4} /></Deep>}
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={560} width={4800} height={1200} fill="#9fb98a" />
      <path d="M880 470 L1040 470 L1700 1400 L220 1400Z" fill="#6b6f78" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 7 }, (_, i) => {
        const t0 = Math.pow(i / 7, 1.6), t1 = Math.pow((i + 0.45) / 7, 1.6);
        const y0 = 480 + t0 * 900, y1 = 480 + t1 * 900;
        const w0 = 4 + t0 * 26, w1 = 4 + t1 * 26;
        return <path key={i} d={`M${960 - w0} ${y0} L${960 + w0} ${y0} L${960 + w1} ${y1} L${960 - w1} ${y1}Z`} fill={PAPER} />;
      })}
      <path d="M886 480 L250 1400 M1034 480 L1670 1400" stroke={PAPER} strokeWidth={6} />
      {/* the threshold bars at the near end */}
      {Array.from({ length: 8 }, (_, i) => {
        const top = 960 + (i - 3.5) * 90, bot = 960 + (i - 3.5) * 98;
        return <path key={i} d={`M${top - 14} 1004 L${top + 14} 1004 L${bot + 16} 1066 L${bot - 16} 1066Z`} fill={PAPER} opacity={0.92} />;
      })}
      <rect x={1780} y={420} width={10} height={260} fill="#5c6675" />
      <path d="M1790 430 L1860 448 L1856 470 L1790 474Z" fill="#e8792f" stroke={INK} strokeWidth={3} transform="rotate(62 1790 430)" />
      {jet && <GroundedJet x={1450} y={706} scale={0.78} />}
    </Deep>
  </>
);

/** The camera that centres a point (x, y) of the plane layer (depth 0.5) at `zoom`. */
export const planeCam = (x: number, y: number, zoom: number): Camera => ({ x: 960 + (x - 960) / 0.5, y: 540 + (y - 540) / 0.5, zoom });

// ------------------------------------------------------------------------------------------------ the month

/** A tear-off day pad, screen space (put it OUTSIDE <Stage>, top right, clear of the top 10%): the day pages tear off
 *  from `from`, quick in the middle of the month and slowing, and it stops at `land` on results day, ringed in red. */
export const DayPad: React.FC<{ frame: number; from: number; land: number }> = ({ frame, from, land }) => {
  const days = 30;
  const dayAt = (f: number) => Math.max(1, Math.min(days, 1 + Math.floor(ramp(f, from, land) * (days - 1) + 1e-6)));
  const day = dayAt(frame);
  let turned = frame; // the frame this page came up (the last one tore off then)
  while (turned > frame - 12 && dayAt(turned - 1) === day) turned--;
  const off = day > 1 ? (frame - turned) / 5 : 1;
  const results = frame >= land;
  const ring = ramp(frame, land + 2, land + 12);
  const page = (n: number, last: boolean) => (
    <g>
      <rect x={-150} y={-120} width={300} height={290} rx={10} fill={PAPER} stroke={INK} strokeWidth={6} />
      <rect x={-150} y={-120} width={300} height={70} rx={10} fill={last ? CRIMSON : TEAL} stroke={INK} strokeWidth={6} />
      {last && <text x={0} y={-72} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={PAPER}>RESULTS</text>}
      <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={140} fill={INK}>{n}</text>
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <g transform="translate(1600 290) rotate(2)">
        <rect x={-146} y={-110} width={300} height={290} rx={10} fill="#000" opacity={0.3} />
        {page(day, results)}
        {results && ring > 0 && (
          <ellipse cx={0} cy={66} rx={104} ry={84} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} fill="none" stroke={CRIMSON} strokeWidth={10} />
        )}
        {day > 1 && off < 1 && (
          <g transform={`translate(${40 * off} ${-160 * off}) rotate(${-18 * off})`} opacity={1 - off}>{page(day - 1, false)}</g>
        )}
        {[-90, -30, 30, 90].map((rx) => <rect key={rx} x={rx - 7} y={-134} width={14} height={32} rx={7} fill="#9a9a94" stroke={INK} strokeWidth={4} />)}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------------------------------------ the school gate

/** The gate anchors: the pavement line, the gate's gap, Ji-yoon's spot in the crowd. */
export const GATE = {
  floor: 990, gap: { from: 780, to: 1140 },
  /** Your sister: half hidden behind two parents, then (once they part) one step closer to you. */
  jiyoon: { x: 1470, y: 990 }, jiyoonOut: { x: 1350, y: 990 },
  /** You, facing her, with your back to the gate. */
  you: 1150,
};

/** Parents waiting outside, facing the gate, at scale s on floor y. */
const Parents: React.FC<{ frame: number; y: number; s: number; xs: number[]; seed: number; still?: boolean }> = ({ frame, y, s, xs, seed, still }) => (
  <g>
    {xs.map((x, i) => {
      const toGate = x < (GATE.gap.from + GATE.gap.to) / 2 ? 1 : -1;
      const pose: Pose = noise(i + seed) < 0.4 ? { ...STAND, armF: [40, 80], armB: [30, 85] } : STAND;
      return (
        <Figure key={i} x={x} y={y + (i % 2) * 8} scale={s} facing={toGate as 1 | -1} pose={pose} head={PASTELS[(i * 3 + seed) % PASTELS.length]}
          coat={["#6d7f8f", "#7a5a8c", "#8a5c3b", "#5a6488", "#a8a29a"][(i + seed) % 5]} mouth="flat" brows={noise(i * 3 + seed) < 0.5 ? "worry" : "none"}
          lids={0.2} look={{ x: 0.9, y: -0.1 }} blink={!still && (frame + i * 23) % 113 < 4} time={frame} />
      );
    })}
  </g>
);

/** The street outside the school gate on exam morning: the school behind its wall, the gate open, parents along the wall. */
/** `bell` 0..1 rings the school bell; `still` freezes the parents (no blinks). */
export const GateBack: React.FC<{ cam: Camera; frame: number; mood: MoodName; bell?: number; still?: boolean }> = ({ cam, frame, mood, bell = 0, still }) => {
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
        {/* the school bell on the left pillar; it shakes while `bell` rings */}
        <g transform={`translate(${g.from - 35} 470) rotate(${bell > 0 ? Math.sin(frame * 1.6) * 14 * bell : 0})`}>
          <path d="M-26 34 Q-26 -6 0 -8 Q26 -6 26 34Z" fill="#c9a24a" stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={38} r={7} fill={INK} />
        </g>
        {bell > 0 && [0, 1].map((i) => <path key={i} d={`M${g.from - 80 - i * 16} ${440 - i * 10} q-14 30 0 60 M${g.from + 10 + i * 16} ${440 - i * 10} q14 30 0 60`}
          fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={bell * (0.7 - i * 0.3)} />)}
        <Parents frame={frame} y={985} s={0.8} xs={[-260, -100, 60, 220, 380, 540, 1280, 1460, 1640, 1820, 1990, 2160]} seed={2} still={still} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={GATE.floor - 20} width={4800} height={900} fill="#d9cbb0" />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1400 + i * 140} y1={GATE.floor - 20} x2={-1500 + i * 140} y2={1700} stroke="#000" strokeWidth={3} opacity={0.07} />)}
      </Deep>
    </>
  );
};

/** The near parents, in the actors' slot (they stand clear of the gate and of Ji-yoon's spot). */
export const GateCrowd: React.FC<{ frame: number; still?: boolean; part?: number }> = ({ frame, still, part = 0 }) => (
  <g>
    <Parents frame={frame} y={1010} s={1.1} xs={[80, 300, 520, 1930, 2150]} seed={7} still={still} />
    {/* the two who stand in front of her until the crowd parts (`part` 0..1 moves them aside) */}
    <Parents frame={frame} y={1012} s={1.1} xs={[1330 + 370 * part, 1520 + 380 * part]} seed={3} still={still} />
  </g>
);

/** The lunch box she packed, wrapped in a cloth knotted on top. (x, y) is its bottom centre. */
export const LunchBox: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-50} y={-56} width={100} height={56} rx={10} fill="#e6a0a0" stroke={INK} strokeWidth={4} />
    <path d="M-50 -30 H50" stroke="#c97f7f" strokeWidth={5} />
    <path d="M-8 -56 Q-30 -82 -14 -86 Q0 -74 0 -60 Q0 -74 14 -86 Q30 -82 8 -56Z" fill="#e6a0a0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** Your sister at the gate straight off the night shift: hair tied back and flat, the vest half zipped, the lunch box
 *  held in both hands. `offer` 0..1 holds it out to you; `out` 0..1 lowers her arms once you have it; `nod` 0..1 is one
 *  nod (head down and back up); `walk` sets a walking pose (she steps back into the crowd). */
export const JiyoonWithLunch: React.FC<{
  x: number; y: number; scale: number; frame: number; face: object; holding: boolean; out?: number; offer?: number; nod?: number;
  facing?: 1 | -1; walk?: number | null;
}> = ({ x, y, scale, frame, face, holding, out = 0, offer = 0, nod = 0, facing = -1, walk = null }) => {
  const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const close: Pose = { ...STAND, armF: [38, 84], armB: [30, 92] };
  const held: Pose = { ...STAND, armF: [72, 34], armB: [66, 40] };
  const down: Pose = { ...STAND, armF: [14, 30], armB: [8, 34] };
  const armF = lerp(lerp(close.armF, held.armF, offer), down.armF, out);
  const armB = lerp(lerp(close.armB, held.armB, offer), down.armB, out);
  const base = walk === null ? STAND : walkPose(walk);
  const pose: Pose = { ...base, tilt: 16 * Math.sin(Math.PI * nod), armF: walk === null ? armF : base.armF, armB: walk === null ? armB : base.armB };
  return (
    <g>
      <Ponytail x={x} y={y} scale={scale} pose={pose} facing={facing} />
      <Figure x={x} y={y} scale={scale} facing={facing} pose={pose} head={JIYOON.head} coat={JIYOON.coat} {...face} time={frame}
        held={holding ? <LunchBox x={-4} y={26} scale={0.9} /> : undefined} />
      <Vest x={x} y={y} scale={scale} pose={pose} facing={facing} />
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
