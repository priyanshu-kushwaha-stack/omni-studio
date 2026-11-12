// The two paper diagrams of A Man in Trouble, hung over the food court's tables (no words, no numbers: the narrator
// says none). Line 69 (c21): two rows of small heads, a crimson flag stamped over some in each row, almost twice as
// many in one row (7 of 16 against 4 of 16). Line 70 (c22): a crowd of small pastel heads at phones, two grey lines of
// paper text in front of each, and their tally drawn level with a grey box.
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { pop, Sheet } from "../kit";
import { linear, PASTELS } from "../shared";
import { FoodCourtBack, foodCourtLights, StallLamp } from "../sets/FoodCourt";

export const PAPER_AT = { x: 960, y: 500, w: 1440, h: 760 } as const;
export const onPaper = (sx: number, sy: number) => ({ x: PAPER_AT.x - PAPER_AT.w / 2 + sx, y: PAPER_AT.y - PAPER_AT.h / 2 + sy });

const ROW_A = [1, 3, 4, 7, 9, 12, 14];
const ROW_B = [2, 8, 11, 15];

const Mini: React.FC<{ x: number; y: number; head: string; s?: number }> = ({ x, y, head, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={4} width={40} height={46} rx={16} fill="#3b3e47" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-18} r={22} fill={head} stroke={INK} strokeWidth={4} />
  </g>
);

const Flag: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-58} stroke={INK} strokeWidth={5} />
    <path d="M0 -58 L40 -46 L0 -34 Z" fill={CRIMSON} stroke={INK} strokeWidth={3} />
  </g>
);

/** Line 69: the two rows and their flags, stamped one by one between `flags` and `flagsDone`. */
export const FlagRows: React.FC<{ frame: number; at: number; flags: number; flagsDone: number }> = ({ frame, at, flags, flagsDone }) => {
  const all = [...ROW_A.map((i) => ({ row: 0, i })), ...ROW_B.map((i) => ({ row: 1, i }))].sort((a, b) => a.i - b.i || a.row - b.row);
  const shown = Math.round(all.length * linear(frame, flags, flagsDone));
  const rowY = [250, 560];
  return (
    <g>
      {[0, 1].map((row) => (
        <g key={row}>
          <DrawLine d={`M90 ${rowY[row] + 70} H1350`} from={at + 6 + row * 6} to={at + 26 + row * 6} color={INK} width={5} />
          {Array.from({ length: 16 }, (_, i) => frame >= at + 10 + i * 1.5 + row * 6 && (
            <Mini key={i} x={140 + i * 77} y={rowY[row]} head={row === 0 ? "#7a5440" : "#ecd2b2"} />
          ))}
        </g>
      ))}
      {all.slice(0, shown).map(({ row, i }, n) => {
        const t0 = flags + ((flagsDone - flags) * n) / all.length;
        return <Flag key={`${row}-${i}`} x={146 + i * 77} y={rowY[row] - 46} s={pop(frame, t0, 260)} />;
      })}
    </g>
  );
};

/** Line 70: the crowd at phones, two lines of paper text before each, and two bars drawn level. */
export const CrowdTally: React.FC<{ frame: number; at: number; bars: number }> = ({ frame, at, bars }) => {
  const rise = linear(frame, bars, bars + 40);
  const H = 440, base = 640;
  return (
    <g>
      {Array.from({ length: 12 }, (_, n) => {
        const c = n % 4, r = Math.floor(n / 4);
        const x = 120 + c * 150, y = 170 + r * 200;
        if (frame < at + 6 + n * 2) return null;
        return (
          <g key={n}>
            <Mini x={x} y={y} head={PASTELS[n % PASTELS.length]} s={0.95} />
            <rect x={x + 18} y={y + 4} width={20} height={34} rx={4} fill="#1b1d24" />
            <rect x={x - 46} y={y + 62} width={92} height={10} rx={5} fill="#a8a296" />
            <rect x={x - 46} y={y + 80} width={64} height={10} rx={5} fill="#a8a296" />
          </g>
        );
      })}
      {/* the crowd's tally: a stack of pastel marks; the software: a grey box with nothing written on it */}
      <line x1={760} y1={base} x2={1360} y2={base} stroke={INK} strokeWidth={6} opacity={frame >= bars ? 1 : 0} />
      <g>
        {Array.from({ length: 11 }, (_, i) => {
          const y = base - (i + 1) * 40;
          if (base - y > H * rise + 1) return null;
          return <rect key={i} x={830} y={y} width={180} height={36} rx={6} fill={PASTELS[i % PASTELS.length]} stroke={INK} strokeWidth={4} />;
        })}
      </g>
      {frame >= bars && <rect x={1100} y={base - H * rise} width={180} height={H * rise} rx={8} fill="#8e9198" stroke={INK} strokeWidth={6} />}
      {frame >= bars + 40 && <DrawLine d={`M800 ${base - H - 4} H1320`} from={bars + 44} to={bars + 64} color={INK} width={6} dash />}
    </g>
  );
};

/** A diagram sheet hung over the food court tables. */
export const CourtPaper: React.FC<{ frame: number; at: number; cam: Camera; mood: MoodName; children: React.ReactNode }> = ({ frame, at, cam, mood, children }) => (
  <LookContext.Provider value={setLook(foodCourtLights, mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={<><FoodCourtBack cam={cam} mood={mood} frame={frame} diners /><StallLamp /><rect x={-1400} y={-900} width={4800} height={2600} fill="#0c0e16" opacity={0.35} /></>}
      actors={
        <g>
          {/* the two strings it hangs from */}
          {[-1, 1].map((s) => <line key={s} x1={PAPER_AT.x + s * 560} y1={-400} x2={PAPER_AT.x + s * 560} y2={PAPER_AT.y - PAPER_AT.h / 2 + 10} stroke={PAPER} strokeWidth={4} opacity={0.6} />)}
          <Sheet frame={frame} at={at} x={PAPER_AT.x} y={PAPER_AT.y} w={PAPER_AT.w} h={PAPER_AT.h} tilt={1}>{children}</Sheet>
        </g>
      } />
  </LookContext.Provider>
);
