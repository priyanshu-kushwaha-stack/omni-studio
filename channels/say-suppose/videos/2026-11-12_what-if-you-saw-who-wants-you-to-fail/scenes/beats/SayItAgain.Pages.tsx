// The second letter in four beats (SayItAgain.tsx, line 89). Outside review of v4.1 (2026-11-13): "the same letter
// remains centred for almost the entire explanation" for twelve seconds. Now one pair of hands holds four papers in
// turn on the dark landing, lowering each and raising the next on its words:
//   the letter, its seal stamping on "confirmed";
//   a year pad, its pages flipping YEAR 1 to YEAR 4 on "four years of university";
//   the tuition bill, struck through in teal and stamped PAID on "fully paid";
//   the exam answer sheet, stamped TOP GRADES REQUIRED on "top grades" (the condition).
// The first three are held well right of centre, clear of the SCHOLARSHIP CONFIRMED card (Captions.tsx, lower left, up from
// 15% to about 60% of the line); the answer sheet, after the card has gone, is held nearer the middle.
import { FONT } from "@whatif/kit/fonts";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { mix, noise, ramp } from "../shared";
import { Landing } from "./SayItAgain.Parts";

/** The frames of line 89's beats (SayItAgain.tsx `times`). `flips`: the year pad turning to years 2, 3 and 4. */
export interface LetterBeats { rise: number; seal: number; years: number; flips: number[]; bill: number; strike: number; paid: number; exam: number; stamp: number }

/** A stroke that draws itself from frame `at` over `len` frames. */
export const Stroke: React.FC<{ d: string; frame: number; at: number; len: number; color: string; width: number }> = ({ d, frame, at, len, color, width }) => {
  const t = ramp(frame, at, at + len);
  if (t <= 0) return null;
  return <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
};

/** A rubber stamp landing at `at`: big and faint, then down hard. Children drawn round (0, 0). */
const Stamp: React.FC<{ frame: number; at: number; x: number; y: number; tilt: number; children: React.ReactNode }> = ({ frame, at, x, y, tilt, children }) => {
  if (frame < at) return null;
  const t = Math.min(1, (frame - at) / 5);
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${mix(1.7, 1, t)})`} opacity={mix(0.2, 0.95, t)}>{children}</g>;
};

/** A sheet of paper held at its sides, (0, 0) between the hands, its bottom edge at +140 like the held letter. */
const Paper: React.FC<{ children?: React.ReactNode; tint?: string }> = ({ children, tint = PAPER }) => (
  <g>
    <rect x={-165} y={-262} width={330} height={410} rx={8} fill="#000" opacity={0.3} />
    <rect x={-170} y={-270} width={330} height={410} rx={8} fill={tint} stroke={INK} strokeWidth={6} />
    {children}
  </g>
);

const bar = (x: number, y: number, w: number, o = 0.55) => <rect x={x} y={y} width={w} height={12} rx={6} fill={INK} opacity={o} />;

/** The year pad: a tear-off pad on a card back, the top page's header YEAR n, a month grid under it. The page above the
 *  current one flips up over the binding at each `flips` frame. */
const YearPad: React.FC<{ frame: number; flips: number[] }> = ({ frame, flips }) => {
  const n = flips.filter((f) => frame >= f + 6).length; // pages already turned
  const page = (year: number) => (
    <g>
      <rect x={-160} y={-240} width={310} height={370} rx={6} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={-160} y={-240} width={310} height={92} rx={6} fill={TEAL} stroke={INK} strokeWidth={5} />
      <text x={-5} y={-176} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={PAPER}>YEAR {year}</text>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={-134 + (i % 5) * 54} y={-124 + Math.floor(i / 5) * 58} width={40} height={42} rx={4} fill="none" stroke={INK} strokeWidth={3} opacity={0.45} />
      ))}
    </g>
  );
  const turning = flips.findIndex((f) => frame >= f && frame < f + 6);
  const f = turning < 0 ? 0 : (frame - flips[turning]) / 6;
  return (
    <g>
      <rect x={-172} y={-276} width={334} height={418} rx={10} fill="#6b4b3a" stroke={INK} strokeWidth={6} />
      {page(Math.min(4, n + (turning < 0 ? 1 : 2)))}
      {turning >= 0 && <g transform={`translate(0 -240) scale(1 ${Math.max(-1, 1 - 2 * f)}) translate(0 240)`}>{page(n + 1)}</g>}
      {[-100, -30, 40, 110].map((rx) => <rect key={rx} x={rx - 8} y={-292} width={16} height={36} rx={8} fill="#9a9a94" stroke={INK} strokeWidth={4} />)}
    </g>
  );
};

/** The tuition bill: TUITION, four years of fees, a total; struck through in teal at `strike`, PAID stamped at `paid`. */
const Bill: React.FC<{ frame: number; strike: number; paid: number }> = ({ frame, strike, paid }) => (
  <Paper>
    <text x={-5} y={-196} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INK}>TUITION</text>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        {bar(-130, -140 + i * 54, 110)}
        {bar(40, -140 + i * 54, 80 + noise(i) * 10)}
      </g>
    ))}
    <rect x={-130} y={78} width={250} height={5} fill={INK} />
    {bar(-130, 100, 90, 0.8)}
    {bar(30, 100, 90, 0.8)}
    <Stroke d="M-140 -160 L130 120" frame={frame} at={strike} len={7} color={TEAL} width={16} />
    <Stroke d="M-140 110 L130 -150" frame={frame} at={strike + 5} len={7} color={TEAL} width={16} />
    <Stamp frame={frame} at={paid} x={60} y={-20} tilt={-14}>
      <circle r={86} fill={PAPER} opacity={0.6} />
      <circle r={86} fill="none" stroke={TEAL} strokeWidth={10} />
      <circle r={70} fill="none" stroke={TEAL} strokeWidth={4} />
      <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill={TEAL}>PAID</text>
    </Stamp>
  </Paper>
);

/** The national exam's answer sheet: name boxes, rows of answer bubbles; TOP GRADES REQUIRED stamped across at `stamp`. */
const AnswerSheet: React.FC<{ frame: number; stamp: number }> = ({ frame, stamp }) => (
  <Paper tint="#f1ece0">
    <rect x={-170} y={-270} width={330} height={56} rx={8} fill="#b8644a" stroke={INK} strokeWidth={6} />
    {bar(-120, -248, 200, 0.35)}
    {Array.from({ length: 7 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
      const filled = Math.floor(noise(r * 5 + 3) * 5) === c;
      return <circle key={`${r}-${c}`} cx={-110 + c * 50} cy={-170 + r * 44} r={14} fill={filled ? INK : "none"} stroke={INK} strokeWidth={3} opacity={filled ? 0.75 : 0.45} />;
    }))}
    <Stamp frame={frame} at={stamp} x={-5} y={-150} tilt={-9}>
      <rect x={-148} y={-62} width={296} height={124} rx={12} fill={PAPER} opacity={0.8} />
      <rect x={-148} y={-62} width={296} height={124} rx={12} fill="none" stroke={CRIMSON} strokeWidth={9} />
      <text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={CRIMSON}>TOP GRADES</text>
      <text y={42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={CRIMSON}>REQUIRED</text>
    </Stamp>
  </Paper>
);

/** How far the hands are lowered (0 up, 1 out of frame) around each change of paper: down 5 frames, up 7. */
function lowered(frame: number, b: LetterBeats) {
  let d = 1 - ramp(frame, b.rise, b.rise + 16);
  for (const s of [b.years, b.bill, b.exam]) {
    if (frame >= s - 5 && frame < s) d = Math.max(d, ramp(frame, s - 5, s));
    if (frame >= s && frame < s + 7) d = Math.max(d, 1 - ramp(frame, s, s + 7));
  }
  return d;
}

/** The insert: the landing, your arms from below, and whichever paper the line is on. */
export const ScholarshipInsert: React.FC<{ frame: number; cam: Camera; b: LetterBeats }> = ({ frame, cam, b }) => {
  const which = frame < b.years ? 0 : frame < b.bill ? 1 : frame < b.exam ? 2 : 3;
  const jolt = [b.seal, b.paid, b.stamp].reduce((j, at) => (frame >= at && frame < at + 10 ? j + Math.sin((frame - at) * 2.2) * 5 * (1 - (frame - at) / 10) : j), 0);
  const held = which === 3 ? 960 : 1320;
  const y = mix(760, 1440, lowered(frame, b)) + jolt;
  const paper = [
    <g key="letter">
      <Letter x={0} y={140} scale={2.6} tilt={-3} />
      <Stamp frame={frame} at={b.seal} x={-80} y={30} tilt={-12}>
        <circle r={70} fill="none" stroke={TEAL} strokeWidth={10} />
        <circle r={52} fill="none" stroke={TEAL} strokeWidth={5} />
        <path d="M-34 0 L-8 26 L36 -24" fill="none" stroke={TEAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </Stamp>
    </g>,
    <YearPad key="pad" frame={frame} flips={b.flips} />,
    <Bill key="bill" frame={frame} strike={b.strike} paid={b.paid} />,
    <AnswerSheet key="exam" frame={frame} stamp={b.stamp} />,
  ][which];
  const actors = (
    <g transform={`translate(${held} ${y})`}>
      {/* the arms from below, the hands at the paper's sides */}
      <path d="M-380 520 L-158 -40" stroke={INK} strokeWidth={40} strokeLinecap="round" />
      <path d="M380 520 L158 -40" stroke="#3b3e47" strokeWidth={40} strokeLinecap="round" />
      {paper}
      <circle cx={-168} cy={-40} r={34} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <circle cx={168} cy={-40} r={34} fill={MUSTARD} stroke={INK} strokeWidth={5} />
    </g>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<Landing cam={cam} />} actors={actors} />;
};
