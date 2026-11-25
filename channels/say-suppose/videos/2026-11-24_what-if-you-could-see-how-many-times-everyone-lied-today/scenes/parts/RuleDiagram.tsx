// The Rule's paper diagram (Rule.tsx), screen space, beside your flatmate: page one draws a head, a counter over it and
// a clock (the digit ticks on "clicks", the clock's hand sweeps to midnight on "since midnight"); page two marks what
// counts and what doesn't (jokes, honest mistakes, spoken, typed, written) and rings SPOKEN on "Remember that".
// Look C keeps story props with words small: the paper is drawn at 0.8 and kept clear of faces. No AI images.
import { evolvePath } from "@remotion/paths";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { GLOW, linear, ramp } from "../shared";
import { popAt } from "./FrameKit";

export interface DiagramTimes {
  over: number; midnight: number; clicks: number; page2: number; joke: number; wrong: number;
  spoken: number; typed: number; written: number; remember: number; hall: number;
}

/** A closed circle as a path that draws from its left edge. */
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

const Path: React.FC<{ frame: number; from: number; to: number; d: string; color?: string; width?: number }> = ({ frame, from, to, d, color = INK, width = 8 }) => {
  const t = linear(frame, from, to);
  if (t <= 0) return null;
  const e = evolvePath(t, d);
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
};

/** A tick or a cross, drawn on. */
const Mark: React.FC<{ frame: number; at: number; x: number; y: number; ok: boolean }> = ({ frame, at, x, y, ok }) =>
  ok ? <Path frame={frame} from={at + 4} to={at + 12} d={`M${x - 26} ${y} L${x - 6} ${y + 22} L${x + 30} ${y - 26}`} color="#1d9a8f" width={12} />
    : <g><Path frame={frame} from={at + 4} to={at + 9} d={`M${x - 24} ${y - 24} L${x + 24} ${y + 24}`} color="#d8344f" width={12} />
      <Path frame={frame} from={at + 8} to={at + 13} d={`M${x + 24} ${y - 24} L${x - 24} ${y + 24}`} color="#d8344f" width={12} /></g>;

/** Small ink icons: a laughing face, a question mark, a mouth, a keyboard, a pen on paper. */
const Icon: React.FC<{ i: number; x: number; y: number }> = ({ i, x, y }) => {
  const st = { fill: "none", stroke: INK, strokeWidth: 8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (i) {
    case 0: return <g><circle cx={x} cy={y} r={60} {...st} /><path d={`M${x - 34} ${y + 10} Q${x} ${y + 60} ${x + 34} ${y + 10}Z`} fill={INK} /><path d={`M${x - 30} ${y - 22} q10 -12 20 0 M${x + 10} ${y - 22} q10 -12 20 0`} {...st} /></g>;
    case 1: return <path d={`M${x - 34} ${y - 30} q0 -40 36 -40 q36 0 36 36 q0 30 -36 40 v24 M${x + 2} ${y + 60} v4`} {...st} />;
    case 2: return <path d={`M${x - 70} ${y} Q${x} ${y - 50} ${x + 70} ${y} Q${x} ${y + 60} ${x - 70} ${y}Z M${x - 70} ${y} H${x + 70}`} {...st} />;
    case 3: return <g><rect x={x - 80} y={y - 40} width={160} height={90} rx={10} {...st} />{[0, 1, 2].map((r) => <path key={r} d={`M${x - 60} ${y - 18 + r * 26} h120`} {...st} strokeWidth={6} strokeDasharray="14 12" />)}</g>;
    default: return <g><rect x={x - 60} y={y - 60} width={110} height={130} rx={6} {...st} /><path d={`M${x - 40} ${y - 30} h70 M${x - 40} ${y} h60 M${x - 40} ${y + 30} h40 M${x + 80} ${y - 70} L${x + 20} ${y + 40}`} {...st} /></g>;
  }
};

const PageOne: React.FC<{ frame: number; k: DiagramTimes; x0: number; y0: number }> = ({ frame, k, x0, y0 }) => {
  const digit = frame >= k.clicks ? 1 : 0;
  const hand = 360 * ramp(frame, k.midnight, k.midnight + 14);
  return (
    <g>
      <Path frame={frame} from={k.over + 6} to={k.over + 22} d={circle(x0 + 300, y0 + 430, 85)} width={9} />
      <Path frame={frame} from={k.over + 18} to={k.over + 30} d={`M${x0 + 190} ${y0 + 615} Q${x0 + 300} ${y0 + 525} ${x0 + 410} ${y0 + 615}`} width={9} />
      {frame >= k.over + 26 && (
        <g transform={`translate(${x0 + 300} ${y0 + 250})`} opacity={linear(frame, k.over + 26, k.over + 34)}>
          <rect x={-80} y={-64} width={160} height={128} rx={28} fill={INK} stroke={GLOW} strokeWidth={8} />
          <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill={PAPER}
            transform={`scale(${frame >= k.clicks && frame < k.clicks + 8 ? 1.2 : 1})`}>{digit}</text>
          <path d="M-14 64 L0 88 L14 64Z" fill={INK} stroke={GLOW} strokeWidth={6} />
        </g>
      )}
      <Path frame={frame} from={k.over + 34} to={k.over + 50} d={circle(x0 + 690, y0 + 330, 120)} width={9} />
      {frame >= k.over + 50 && (
        <g>
          <line x1={x0 + 690} y1={y0 + 330} x2={x0 + 690} y2={y0 + 245} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hand} ${x0 + 690} ${y0 + 330})`} />
          <line x1={x0 + 690} y1={y0 + 330} x2={x0 + 740} y2={y0 + 330} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hand / 12} ${x0 + 690} ${y0 + 330})`} />
          <text x={x0 + 690} y={y0 + 520} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INK}>MIDNIGHT</text>
        </g>
      )}
    </g>
  );
};

const PageTwo: React.FC<{ frame: number; k: DiagramTimes; x0: number; y0: number }> = ({ frame, k, x0, y0 }) => {
  const items: [string, number, boolean, number][] = [["JOKES", k.joke, false, 0], ["MISTAKES", k.wrong, false, 1],
    ["SPOKEN", k.spoken, true, 2], ["TYPED", k.typed, false, 3], ["WRITTEN", k.written, false, 4]];
  return (
    <g>
      {items.map(([label, at, ok, i]) => {
        if (frame < at) return null;
        const c = { x: x0 + 140 + (i % 3) * 290 + (i >= 3 ? 145 : 0), y: y0 + 190 + Math.floor(i / 3) * 290 };
        const s = popAt(frame, at, 240);
        const ring = ramp(frame, k.remember, k.remember + 8);
        return (
          <g key={label} transform={`translate(${c.x} ${c.y}) scale(${s}) translate(${-c.x} ${-c.y})`}>
            <text x={c.x} y={c.y + 80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={INK}>{label}</text>
            <Icon i={i} x={c.x} y={c.y - 30} />
            <Mark frame={frame} at={at} x={c.x + 90} y={c.y - 70} ok={ok} />
            {label === "SPOKEN" && frame >= k.remember && <ellipse cx={c.x} cy={c.y + 10} rx={130 * ring} ry={120 * ring} fill="none" stroke="#d8344f" strokeWidth={8} />}
          </g>
        );
      })}
    </g>
  );
};

/** The paper, unfolding at `over`, page two from `page2`, gone at the hallway. (x, y) its top-left in screen px. */
export const Diagram: React.FC<{ frame: number; k: DiagramTimes; x?: number; y?: number; scale?: number }> = ({ frame, k, x = 1010, y = 170, scale = 0.8 }) => {
  const unfold = popAt(frame, k.over, 180);
  if (unfold <= 0 || frame >= k.hall) return null;
  const page2 = frame >= k.page2;
  const x0 = 0;
  const y0 = 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <g transform={`translate(430 325) rotate(${-2 + (page2 ? 3 : 0)}) scale(${unfold} 1) translate(-430 -325)`}>
          <rect x={10} y={14} width={860} height={650} rx={14} fill="#000" opacity={0.25} />
          <rect x={0} y={0} width={860} height={650} rx={14} fill={PAPER} stroke={INK} strokeWidth={6} />
          {page2 ? <PageTwo frame={frame} k={k} x0={x0} y0={y0} /> : <PageOne frame={frame} k={k} x0={x0} y0={y0} />}
        </g>
      </g>
    </svg>
  );
};
