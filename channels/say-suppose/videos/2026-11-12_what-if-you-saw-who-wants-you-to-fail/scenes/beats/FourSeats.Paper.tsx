// The Weapon on paper (script v7): a hundred small heads in rows, built fast on line 52 (four places lit, yours fourth,
// his fifth); the mock papers WEEK 1, WEEK 2, WEEK 3 slapped down with rising scores, TRUE stamped once (53); and the
// tally, 4 -> 3 -> 2, that Second (74) uses. The phone is FourSeats.Phone.tsx.
import { interpolate, spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { camAt, HERO, MINJUN, mix, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon, WoodTop } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

const clamp01 = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const thump = (frame: number, at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } }));
/** A one-off swell, 0 -> 1 -> 0 over `len` frames from `at`. */
const swell = (frame: number, at: number, len = 12) => (frame <= at || frame >= at + len ? 0 : Math.sin((Math.PI * (frame - at)) / len));

// ------------------------------------------------------------------------------------------------ 62-63 a hundred of you

const COLS = 10, GAP_X = 86, GAP_Y = 64, OX = 113, OY = 200;
const cell = (i: number) => ({ x: OX + (i % COLS) * GAP_X, y: OY + Math.floor(i / COLS) * GAP_Y });

/**
 * A hundred small heads in ten rows, in rank order, already on the paper as it lands (no blank sheet). On "the top 4 per
 * cent" the first four places light teal under a large TOP 4%; on "A hundred of you" a ripple runs through the heads; on
 * "Four places" the box swells; your head lands fourth, his fifth.
 */
export const HundredSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1000, H = 820;
  const four = clamp01(frame, k.four, k.four + 8);
  const stamp = thump(frame, k.hundred + 4);
  const yours = ramp(frame, k.fourth, k.fourth + 8);
  const his = ramp(frame, k.fifth, k.fifth + 8);
  const box = 1 + 0.08 * swell(frame, k.four, 14);
  const cam = drift(camAt(frame, [[k.hundred, insert(960, 540, 1.0)], [k.four, insert(930, 500, 1.1)],
    [k.fourth, insert(820, 310, 1.6)], [k.desks, insert(830, 310, 1.7)]]), frame, "hundred", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={4} />} actors={
      <Sheet frame={frame} at={k.hundred} x={960} y={540} w={W} h={H} tilt={-1}>
        <g opacity={Math.min(1, stamp * 1.5)} transform={`translate(${OX - 38} 150) scale(${mix(1.4, 1, Math.min(1, stamp))})`}>
          <text x={0} y={0} fontFamily={FONT} fontWeight={800} fontSize={112} fill={TEAL} stroke={INK} strokeWidth={5} paintOrder="stroke">TOP 4%</text>
        </g>
        <g transform={`translate(${OX - 38 + (GAP_X * 4 - 10) / 2} ${OY}) scale(${box}) translate(${-(OX - 38 + (GAP_X * 4 - 10) / 2)} ${-OY})`}>
          <rect x={OX - 38} y={OY - 34} width={GAP_X * 4 - 10} height={68} rx={14} fill={TEAL} opacity={0.85 * four} stroke={INK} strokeWidth={four > 0 ? 4 : 0} />
        </g>
        {Array.from({ length: 100 }, (_, i) => {
          if (i === 3 || i === 4) return null;
          const c = cell(i);
          const row = Math.floor(i / COLS), col = i % COLS;
          const show = clamp01(frame, k.hundred + 4 + row * 2, k.hundred + 10 + row * 2);
          const pulse = 1 + 0.35 * swell(frame, k.heads + (row + col) * 1.4, 12);
          return (
            <g key={i} transform={`translate(${c.x} ${c.y}) scale(${pulse})`}>
              <HeadIcon x={0} y={0} r={20} color={PASTELS[i % PASTELS.length]} dim={(i < 3 ? mix(0.55, 1, four) : 0.55) * show} />
            </g>
          );
        })}
        <g transform={`translate(${cell(4).x} ${cell(4).y}) scale(${his})`}><HeadIcon x={0} y={0} r={26} color={MINJUN.head} mouth="flat" /></g>
        <g transform={`translate(${cell(3).x} ${cell(3).y}) scale(${yours})`}><HeadIcon x={0} y={0} r={26} color={HERO.head} tuft mouth="flat" /></g>
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ the climb, a tally (Second, 74)

/** The tally's frames: the cut in, "Fourth", "Third", "Second", and the cut away. */
export interface TallyTimes { climb: number; fourth2: number; third: number; second: number; red: number }

/** "You climb. Fourth. Third. Second.": a big inked 4; on "Third" a red stroke through it and a 3; on "Second" a stroke
 *  through the 3 and a teal 2, ringed. Your head hops along above the number you are on. */
export const TallySheet: React.FC<{ frame: number; k: TallyTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1100, H = 600;
  const xs = [300, 600, 900];
  const steps = [k.climb + 6, k.third, k.second];
  const cam = drift(camAt(frame, [[k.climb, insert(960, 540, 1.04)], [k.second, insert(990, 540, 1.14)], [k.red, insert(1000, 540, 1.18)]]), frame, "tally", 2);
  const on = ramp(frame, k.third, k.third + 8) + ramp(frame, k.second, k.second + 8);
  const hx = on < 1 ? mix(xs[0], xs[1], on) : mix(xs[1], xs[2], on - 1);
  const hop = Math.abs(Math.sin(Math.PI * (on % 1))) * 40;
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={6} />} actors={
      <Sheet frame={frame} at={k.climb - 6} x={960} y={540} w={W} h={H} tilt={1}>
        {["4", "3", "2"].map((n, i) => {
          const s = thump(frame, steps[i]);
          if (frame < steps[i]) return null;
          const pulse = i === 0 ? 1 + 0.12 * swell(frame, k.fourth2, 12) : 1;
          return (
            <g key={n} transform={`translate(${xs[i]} 470) scale(${mix(1.5, 1, Math.min(1, s)) * pulse})`} opacity={Math.min(1, s * 1.5)}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={300} fill={i === 2 ? TEAL : INK}
                stroke={INK} strokeWidth={i === 2 ? 6 : 0} paintOrder="stroke">{n}</text>
            </g>
          );
        })}
        {/* the arrows between them, and the strokes through the places you leave */}
        <DrawLine d={`M${xs[0] + 90} 380 l70 0 m-24 -22 l24 22 l-24 22`} from={k.third} to={k.third + 8} color={INK} width={8} />
        <DrawLine d={`M${xs[1] + 90} 380 l70 0 m-24 -22 l24 22 l-24 22`} from={k.second} to={k.second + 8} color={INK} width={8} />
        <DrawLine d={`M${xs[0] - 90} 440 L${xs[0] + 90} 270`} from={k.third + 2} to={k.third + 10} color={CRIMSON} width={14} />
        <DrawLine d={`M${xs[1] - 90} 440 L${xs[1] + 90} 270`} from={k.second + 2} to={k.second + 10} color={CRIMSON} width={14} />
        <DrawLine d={`M${xs[2]} 210 C${xs[2] + 150} 210 ${xs[2] + 150} 520 ${xs[2]} 520 C${xs[2] - 150} 520 ${xs[2] - 150} 210 ${xs[2] + 20} 214`}
          from={k.second + 8} to={k.second + 22} color={TEAL} width={9} />
        <HeadIcon x={hx} y={120 - hop} r={52} color={HERO.head} tuft mouth="flat" />
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 53 fresh ammunition

const WEEKS = [{ score: "84", label: "WEEK 1" }, { score: "88", label: "WEEK 2" }, { score: "91", label: "WEEK 3" }];

/** One mock paper: WEEK n large at the top, the score large and ringed red, ink lines for the answers. */
const MockPaper: React.FC<{ label: string; score: string }> = ({ label, score }) => (
  <g>
    <rect x={-230} y={-300} width={460} height={600} rx={8} fill="#000" opacity={0.22} transform="translate(10 14)" />
    <rect x={-230} y={-300} width={460} height={600} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
    <text x={-196} y={-212} fontFamily={FONT} fontWeight={800} fontSize={66} fill={INK}>{label}</text>
    {[0, 1, 2, 3].map((r) => <line key={r} x1={-180} y1={-60 + r * 70} x2={r % 3 === 2 ? 40 : 170} y2={-60 + r * 70} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={0.3} />)}
    <circle cx={120} cy={-110} r={86} fill="none" stroke={CRIMSON} strokeWidth={10} />
    <text x={120} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={96} fill={CRIMSON}>{score}</text>
  </g>
);

/** Your mustard hand (from the right), its fingertip at (0, 0). */
const Hand: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = -90, s = 1.6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/**
 * "A mock score is true, and there's a new one every week. Fresh ammunition." (outside review of v6, sheet 21): on "A
 * mock score" your hand slaps WEEK 1 onto the desk; on "true" a teal TRUE stamp thumps onto it, once; on "a new one
 * every week" WEEK 2 and WEEK 3 slap down beside it, the scores rising; on "Fresh ammunition" your hand slides WEEK 3
 * off the desk like a round into a chamber.
 */
export const AmmoShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const drops = [k.ammo, k.week2Paper, k.week3Paper];
  const spots = [{ x: 560, y: 560, r: -6 }, { x: 980, y: 545, r: 3 }, { x: 1390, y: 565, r: -2 }];
  const stamp = thump(frame, k.stamp);
  const grab = ramp(frame, k.fresh, k.fresh + 14);
  const cam = drift(camAt(frame, [[k.ammo, insert(760, 560, 1.12)], [k.week2Paper, insert(900, 560, 1.0)], [k.fresh, insert(980, 560, 0.94)],
    [k.stand, insert(1060, 560, 0.98)]]), frame, "ammo", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={2} />} actors={
      <g>
        {drops.map((at, i) => {
          if (frame < at - 6) return null;
          // the hand carries each paper in from the right and slaps it down at `at`
          const fly = ramp(frame, at - 6, at);
          const t = thump(frame, at);
          const sp = spots[i];
          const slide = i === 2 ? grab * 700 : 0;
          const x = mix(sp.x + 500, sp.x, fly) + slide, y = mix(sp.y - 80, sp.y, fly);
          return (
            <g key={i}>
              <g transform={`translate(${x} ${y}) rotate(${sp.r}) scale(${frame < at ? 1.12 : mix(1.08, 1, Math.min(1, t))})`}>
                <MockPaper {...WEEKS[i]} />
                {i === 0 && frame >= k.stamp && (
                  <g transform={`translate(-10 150) rotate(-14) scale(${mix(1.8, 1, Math.min(1, stamp))})`} opacity={Math.min(1, stamp * 1.5) * 0.92}>
                    <rect x={-170} y={-62} width={340} height={124} rx={16} fill="none" stroke={TEAL} strokeWidth={14} />
                    <text x={0} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={106} fill={TEAL}>TRUE</text>
                  </g>
                )}
              </g>
              {/* the slapping hand, gone a few frames after the slap */}
              {frame < at + 8 && <Hand x={x + 150} y={y + 40} />}
            </g>
          );
        })}
        {frame >= k.fresh - 8 && <Hand x={mix(1900, 1500, ramp(frame, k.fresh - 8, k.fresh)) + grab * 700} y={600} />}
      </g>
    } />
  );
};
