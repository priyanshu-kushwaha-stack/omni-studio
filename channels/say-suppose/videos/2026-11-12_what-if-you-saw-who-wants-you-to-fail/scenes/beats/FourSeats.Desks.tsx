// Four in a Hundred, the two desks (outside review of v4.1: real desks and the cast in place of the threat infographic,
// and a held insert on the empty desk).
//   77  "the closer they are, the bigger the threat": you at your desk; his desk, with him at it, slides toward yours in
//       three steps, and each time the card over him opens deeper red (-30, -62, -91), the wall warming red behind.
//   79  "So what does first cost?": from above, your desk and his, his empty: the chair pushed in, nothing on it but the
//       half of the chocolate bar on the napkin between you, untouched. Held to the end of the line.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Chocolate, headAt, Meter } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, ramp } from "../shared";
import { FlatShot, Pencil } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

// ------------------------------------------------------------------------------------------------ 77 the desks close in

const SEAT_TOP = 840;
const SC = 1.0;
const SY = seatedY(SEAT_TOP, SC);
const FLOORY = 960;

/** A school desk side on, its top's centre at x: a slab, a book rack under it, two legs. */
const Desk: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 120} y={736} width={240} height={20} rx={5} fill="#a87c52" stroke={INK} strokeWidth={5} />
    <rect x={x - 104} y={756} width={208} height={34} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    {[-98, 82].map((d) => <rect key={d} x={x + d} y={790} width={16} height={FLOORY - 790} fill="#6a4630" stroke={INK} strokeWidth={3} />)}
    <rect x={x - 70} y={724} width={90} height={12} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} transform={`rotate(-3 ${x} 730)`} />
  </g>
);

/** A chair side on, its seat's centre at x, its back on the side away from the desk (`back` -1 left, 1 right). */
const Chair: React.FC<{ x: number; back: 1 | -1 }> = ({ x, back }) => (
  <g>
    <rect x={x - 60} y={SEAT_TOP} width={120} height={16} rx={5} fill="#c99a68" stroke={INK} strokeWidth={4} />
    <rect x={x + back * 52 - 7} y={SEAT_TOP - 110} width={14} height={126} rx={5} fill="#c99a68" stroke={INK} strokeWidth={4} />
    {[-52, 40].map((d) => <rect key={d} x={x + d} y={SEAT_TOP + 16} width={12} height={FLOORY - SEAT_TOP - 16} fill="#8a6440" />)}
  </g>
);

const YOU_X = 420;
const YOUR_DESK = YOU_X + 170;
/** His desk's centre in each of the three steps; he sits 170 to its right, facing you. */
const HIS_DESK = [1500, 1150, 830];
const READINGS = [-30, -62, -91];

export const DesksCloser: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const steps = [k.cuts + 6, k.nearer, k.nearest];
  const slide = (i: number) => ramp(frame, steps[i] - 14, steps[i]);
  const dx = mix(mix(HIS_DESK[0], HIS_DESK[1], slide(1)), HIS_DESK[2], slide(2));
  const mx = dx + 170;
  const near = slide(1) + slide(2);
  const mh = headAt(mx, SY, SC, SEATED, -1);
  const cam = drift(camAt(frame, [[k.cuts, { x: 980, y: 600, zoom: 1.0 }], [k.nearer, { x: 900, y: 610, zoom: 1.08 }], [k.nearest, { x: 760, y: 620, zoom: 1.3 }],
    [k.down, { x: 750, y: 620, zoom: 1.38 }]]), frame, "closer", 2);
  const wall = interpolate(near, [0, 2], [0, 0.22]);
  return (
    <FlatShot cam={cam} mood={mood} back={
      <g>
        <rect x={-1400} y={-800} width={4800} height={2600} fill="#f1e6c8" />
        <rect x={-1400} y={-800} width={4800} height={2600} fill="#d8344f" opacity={wall} />
        <rect x={-1400} y={700} width={4800} height={200} fill="#bfd0c6" opacity={0.9} />
        <rect x={-1400} y={FLOORY - 20} width={4800} height={900} fill="#a9a08e" />
        <line x1={-1400} y1={FLOORY - 20} x2={3400} y2={FLOORY - 20} stroke={INK} strokeWidth={5} />
      </g>
    } actors={
      <>
        <Chair x={YOU_X} back={-1} />
        <Figure {...HERO} x={YOU_X} y={SY} scale={SC} facing={1} pose={{ ...SEATED, armF: [70, 40] }} brows={near > 1.5 ? "worry" : "flat"} lids={0.25}
          mouth="flat" eyes={1} look={{ x: 0.9, y: mix(0.1, -0.1, near / 2) }} blink={blinking(frame, 1)} time={frame} />
        <Desk x={YOUR_DESK} />
        <Desk x={dx} />
        <Chair x={mx} back={1} />
        <Figure {...MINJUN} x={mx} y={SY} scale={SC} facing={-1} pose={{ ...SEATED, armF: [72, 40] }} brows="sad" lids={mix(0.2, 0.5, near / 2)}
          mouth="flat" eyes={1} look={{ x: 0.9, y: 0.3 }} blink={blinking(frame, 2)} time={frame} />
        {READINGS.map((v, i) => (
          <Meter key={i} frame={frame} at={steps[i]} until={i < 2 ? steps[i + 1] - 16 : k.down} x={mh.x} headY={mh.y} r={mh.r} value={v} />
        ))}
      </>
    } />
  );
};

/** The three card snaps of the desks (outside <Stage>): their frames. */
export const desksTags = (k: SeatsTimes) => [k.cuts + 6, k.nearer, k.nearest];

// ------------------------------------------------------------------------------------------------ 79 the empty desk

/** A chair seen from above: the seat and the bar of its back. */
const ChairTop: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-100} width={240} height={200} rx={22} fill="#c99a68" stroke={INK} strokeWidth={6} />
    <rect x={-130} y={86} width={260} height={34} rx={12} fill="#a87c52" stroke={INK} strokeWidth={6} />
  </g>
);

/** From above: your desk with your notebook and pencil; his desk empty, his chair pushed in; on the napkin between,
 *  one half of the chocolate bar in its wrapper, untouched. The camera creeps in, toward the half. */
export const EmptyDesks: React.FC<{ frame: number; from: number; to: number; mood: MoodName }> = ({ frame, from, to, mood }) => {
  const cam = drift(camAt(frame, [[from, insert(960, 520, 1.0)], [to, insert(1040, 520, 1.22)]]), frame, "empty", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#a9a08e" />} actors={
      <g transform="translate(960 470)">
        <ChairTop x={-330} y={420} />
        <ChairTop x={330} y={330} />
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * 330} 0)`}>
            <rect x={-320} y={-250} width={640} height={500} rx={14} fill="#c9935e" stroke={INK} strokeWidth={6} />
            <rect x={-320} y={-250} width={640} height={30} rx={14} fill="#a87c52" />
          </g>
        ))}
        {/* your side: the notebook and the pencil */}
        <g transform="translate(-330 0) rotate(5)">
          <rect x={-200} y={-150} width={300} height={220} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={-170} y1={-110 + i * 40} x2={60} y2={-110 + i * 40} stroke={TEAL} strokeWidth={3} opacity={0.5} />)}
        </g>
        <Pencil x={-370} y={150} angle={-6} />
        {/* the napkin between the desks and his half, still wrapped */}
        <rect x={-150} y={-100} width={300} height={200} rx={6} fill="#cfe6e0" stroke={INK} strokeWidth={4} transform="rotate(6)" />
        <Chocolate x={40} y={4} scale={2.6} half="right" tilt={9} />
      </g>
    } />
  );
};
