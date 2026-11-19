// The Second beat's new pictures (outside review of v6, 2026-11-14, "Everything valid"):
//   B74  "You climb. Fourth. Third. Second.": a vertical leaderboard on paper, five ranked rows, your head climbing
//        from the 4TH row to the 2ND, one slot per spoken rank (in place of the 4 -> 3 -> 2 tally that read as sums).
//        Then the rival "finally looks up": his shoe stops on the classroom floor (a low insert).
//   B76  the rival's pencil snapping in his fist ("You're in his lane now": his first genuine anger), and your paper
//        medal, MOST HATED, pinned on "Your rival finally hates you."
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { interpolate } from "remotion";
import { Sheet } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { FLOOR, SEAT } from "./WhosCrimson.Class";
import { HeadIcon, Pencil, Shoe } from "./WhosCrimson.Common";

// ------------------------------------------------------------------------------------------------ B74 the leaderboard

const ROW_Y = (slot: number) => 150 + slot * 128; // sheet units: slot 0 (1ST) .. 4 (5TH)
const ORD = ["1ST", "2ND", "3RD", "4TH", "5TH"];

/** Where each head sits (fractional slots while moving). `t` the frames: fourth (you light up on 4TH), third, second,
 *  and `mj` (your best friend climbs one too: the ladder, planted). */
function slots(frame: number, k: { third: number; second: number; mj: number }) {
  const s3 = ramp(frame, k.third, k.third + 8);
  const s2 = ramp(frame, k.second, k.second + 8);
  const m = ramp(frame, k.mj, k.mj + 10);
  return {
    rival: 0,
    you: 3 - s3 - s2,
    a: 1 + s2, // the one you pass second
    b: 2 + s3 - m, // the one you pass third; your best friend passes them back
    mj: 4 - m,
  };
}

export interface BoardTimes { at: number; fourth: number; third: number; second: number; mj: number; end: number }

/** The leaderboard on a paper sheet over a dark desk; the camera rides your head up the rows. */
export const BoardShot: React.FC<{ frame: number; k: BoardTimes }> = ({ frame, k }) => {
  const s = slots(frame, k);
  const W = 760, H = 760;
  const toWorld = (slot: number) => 540 - H / 2 + ROW_Y(slot);
  const cam: Camera = camAt(frame, [
    [k.at, { x: 960, y: toWorld(3), zoom: 1.5 }],
    [k.third, { x: 960, y: toWorld(3), zoom: 1.55 }],
    [k.second + 10, { x: 960, y: toWorld(1.6), zoom: 1.5 }],
    [k.end, { x: 960, y: 540, zoom: 1.05 }],
  ]);
  const lit = ramp(frame, k.fourth, k.fourth + 6);
  const heads: { slot: number; color: string; tuft?: boolean; mouth: "smile" | "flat" | "frown"; dx?: number }[] = [
    { slot: s.rival, color: TAEHO.head, mouth: "flat" },
    { slot: s.a, color: PASTELS[0], mouth: "flat", dx: 30 * Math.sin(Math.PI * ramp(frame, k.second, k.second + 8)) },
    { slot: s.b, color: PASTELS[5], mouth: "flat", dx: 30 * Math.sin(Math.PI * ramp(frame, k.third, k.third + 8)) },
    { slot: s.mj, color: MINJUN.head, mouth: "smile" },
  ];
  // your hop: a little arc out to the right while you change rows
  const hop = 60 * (Math.sin(Math.PI * ramp(frame, k.third, k.third + 8)) + Math.sin(Math.PI * ramp(frame, k.second, k.second + 8)));
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#3a2c22" />}
      actors={
        <Sheet frame={frame} at={k.at - 20} x={960} y={540} w={W} h={H} tilt={-1}>
          {ORD.map((o, i) => (
            <g key={o}>
              <line x1={40} y1={ROW_Y(i) + 64} x2={W - 40} y2={ROW_Y(i) + 64} stroke="#e2d6bf" strokeWidth={3} />
              <text x={60} y={ROW_Y(i) + 26} fontFamily={FONT} fontWeight={800} fontSize={72} fill={i === 1 && frame >= k.second + 6 ? TEAL : INK}>{o}</text>
              <rect x={400} y={ROW_Y(i) - 9} width={260 - i * 26} height={18} rx={8} fill={INK} opacity={0.35} />
            </g>
          ))}
          {/* your row's teal band follows you up */}
          <rect x={24} y={ROW_Y(s.you) - 58} width={W - 48} height={116} rx={14} fill={TEAL} opacity={0.22 * lit} />
          {heads.map((h, i) => <HeadIcon key={i} x={330 + (h.dx ?? 0)} y={ROW_Y(h.slot)} r={44} color={h.color} mouth={h.mouth} />)}
          <g transform={`translate(${330 + hop} ${ROW_Y(s.you)})`}>
            <HeadIcon x={0} y={0} r={48 + 6 * lit} color={HERO.head} tuft mouth={frame >= k.second ? "smile" : "flat"} />
          </g>
        </Sheet>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ B74 the shoe stops

/** Low on the classroom floor: the rival's shoes walk in from the right and stop dead at `stop`. */
export const ShoeShot: React.FC<{ frame: number; at: number; stop: number; end: number }> = ({ frame, at, stop, end }) => {
  const walking = frame < stop;
  const x = mix(1500, 960, interpolate(frame, [at, stop], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const phase = (frame - at) / 4.5;
  const lift = (o: number) => (walking ? Math.max(0, Math.sin(phase + o)) * 30 : 0);
  const step = (o: number) => (walking ? Math.cos(phase + o) * 60 : o === 0 ? -30 : 30);
  const squeak = frame >= stop && frame < stop + 8;
  const cam: Camera = camAt(frame, [[at, { x: 1000, y: 700, zoom: 1.4 }], [end, { x: 960, y: 700, zoom: 1.5 }]]);
  const legs = [0, Math.PI];
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={
        <g>
          <rect x={-1400} y={-800} width={4800} height={1700} fill="#efe6cf" />
          <rect x={-1400} y={720} width={4800} height={60} fill="#b9c8c2" stroke={INK} strokeWidth={5} />
          <rect x={-1400} y={780} width={4800} height={1200} fill="#cfdcd6" />
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-400 + i * 220} y1={780} x2={-700 + i * 260} y2={1300} stroke="#b9c8c2" strokeWidth={4} />)}
          {/* a bench leg and the bottom of a desk at the left: the classroom */}
          <rect x={300} y={420} width={26} height={430} fill="#7d5f44" stroke={INK} strokeWidth={4} />
          <rect x={150} y={400} width={420} height={30} rx={6} fill="#a8794e" stroke={INK} strokeWidth={4} />
        </g>
      }
      actors={
        <g>
          {legs.map((o, i) => {
            const fx = x + step(o);
            const fy = 860 - lift(o);
            return (
              <g key={i}>
                <rect x={fx - 26} y={300} width={52} height={fy - 330} fill={TAEHO.coat} stroke={INK} strokeWidth={4} />
                <Shoe x={fx - 10} y={fy} scale={-2.2} color={i ? "#f3efe6" : "#e7e2d6"} />
              </g>
            );
          })}
          {squeak && [0, 1, 2].map((i) => (
            <line key={i} x1={x - 150 - i * 6} y1={830 - i * 30} x2={x - 200 - i * 10} y2={815 - i * 40} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ B74-77 the rival

/** The rival standing in front of your desk, facing you, with whatever is in his front hand. `face` his expression. */
export const Rival: React.FC<{ frame: number; x: number; pose?: Pose; face: object; held?: React.ReactNode }> = ({ frame, x, pose, face, held }) => (
  <Figure {...TAEHO} x={x} y={FLOOR} scale={SEAT.scale} facing={-1} pose={pose ?? STAND} {...face} blink={blinking(frame, 9)} time={frame} held={held} />
);

/** His mock paper, held low in front of him (no digits). */
export const RivalPaper: React.FC = () => (
  <g transform="rotate(-70) translate(-40 -100)">
    <rect x={0} y={0} width={80} height={104} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((i) => <line key={i} x1={12} y1={22 + i * 20} x2={68} y2={22 + i * 20} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.5} />)}
  </g>
);

/** A pencil in his fist that snaps in two at `at`: the halves tilt apart and one drops. */
export const SnappingPencil: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const s = ramp(frame, at, at + 4);
  const drop = Math.max(0, frame - at - 4);
  return (
    <g transform="rotate(-80)">
      <g transform={`rotate(${-28 * s})`}><Pencil x={-10} y={0} angle={180} scale={0.42} /></g>
      <g transform={`translate(${drop * 1.5} ${drop * drop * 0.6}) rotate(${30 * s + drop * 6})`}><Pencil x={10} y={0} angle={0} scale={0.42} /></g>
      {s > 0 && s < 1 && <circle r={18} fill="#fff6d8" opacity={0.8} />}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ B76 the medal

/** A homemade paper medal, MOST HATED: a crimson rosette on two teal ribbon tails. Centred at (x, y); pops in at `at`. */
export const Medal: React.FC<{ frame: number; at: number; x: number; y: number; scale?: number }> = ({ frame, at, x, y, scale = 1 }) => {
  if (frame < at) return null;
  const p = Math.min(1, (frame - at) / 5);
  const s = scale * p * (1 + 0.25 * Math.max(0, 1 - (frame - at) / 9));
  const swing = Math.sin((frame - at) / 6) * 6 * Math.max(0, 1 - (frame - at) / 40);
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
      <path d="M-22 20 L-34 92 L-16 80 L-4 96 L2 24Z" fill={TEAL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M22 20 L34 92 L16 80 L4 96 L-2 24Z" fill={TEAL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 46} cy={Math.sin(a) * 46} r={14} fill={CRIMSON} stroke={INK} strokeWidth={3} />;
      })}
      <circle r={46} fill={CRIMSON} />
      <circle r={38} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      <text x={0} y={-4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} fill={INK}>MOST</text>
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} fill={INK}>HATED</text>
    </g>
  );
};
