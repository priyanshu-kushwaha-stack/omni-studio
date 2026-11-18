// The fired-everyone film's recurring props, drawn in code (no AI images): the burger and its plate (the thumbnail's
// own drawing), the spatula, the napkin with a pencil sum, the phone app with its one dial, a fan of cash, a cheque, a
// payment card, a hammer, a wrench, the till and the wall clock. Every prop is drawn about a named origin, in world (or
// screen) units at s = 1, so it works in a set, in a Figure's `held` slot (drawn at the hand) or as a screen insert.
// Static by construction: nothing here moves unless a prop's own progress number (write, typed, value, ping) changes.
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";

export const STEEL = "#9fb0bd";
export const STEEL_DARK = "#5f6f7c";
export const STEEL_LIGHT = "#c9d3da";
export const SCREEN = "#18252e";
export const GLOW = "#8fe9ff";
export const CASH_GREEN = "#7cc276";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** A repeatable pseudo-random number in 0..1 (no boil: the same i gives the same value every frame). */
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** A burger (the thumbnail's own drawing), centred on its patty; `s` scale, `rot` degrees. About 100 x 84 at s = 1. */
export const Burger: React.FC<{ x?: number; y?: number; s?: number; rot?: number }> = ({ x = 0, y = 0, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-46 -6 Q-46 -46 0 -48 Q46 -46 46 -6 Z" fill="#e0a046" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[-22, -4, 16].map((dx, i) => <ellipse key={i} cx={dx} cy={-30 + (i % 2) * 6} rx={4} ry={2.4} fill={PAPER} />)}
    <path d="M-50 -4 Q-30 6 -12 -2 Q8 8 26 -2 Q40 6 50 -4 L50 4 L-50 4 Z" fill="#6fbf5a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-48} y={2} width={96} height={16} rx={7} fill="#5a3322" stroke={INK} strokeWidth={5} />
    <path d="M-46 18 L46 18 Q44 36 0 36 Q-44 36 -46 18 Z" fill="#d9963e" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/** A raw patty on the grill (a dark disc seen edge on), centred on the grill top. */
export const Patty: React.FC<{ x?: number; y?: number; s?: number; done?: number }> = ({ x = 0, y = 0, s = 1, done = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-8} rx={42} ry={11} fill={done > 0.5 ? "#5a3322" : "#a0524a"} stroke={INK} strokeWidth={4} />
  </g>
);

/** A white plate seen edge on, centred on its rim (the thumbnail's plate). */
export const Plate: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <ellipse cx={x} cy={y} rx={62 * s} ry={12 * s} fill={PAPER} stroke={INK} strokeWidth={4} />
);

/** A burger on its plate, set on a surface at (x, y) (the thumbnail's spacing: plate 2 below, burger 30 above). */
export const PlatedBurger: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g>
    <Plate x={x} y={y + 2 * s} s={s} />
    <Burger x={x} y={y - 30 * s} s={0.72 * s} />
  </g>
);

/** A spatula held at its grip (the origin), pointing along `angle` degrees (0 = right, -90 = straight up). The blade's
 *  centre is at `spatulaTip(angle)`. */
export const Spatula: React.FC<{ angle?: number; s?: number }> = ({ angle = -30, s = 1 }) => (
  <g transform={`scale(${s}) rotate(${angle})`}>
    <rect x={-6} y={-5} width={52} height={10} rx={4} fill="#3a2a22" stroke={INK} strokeWidth={3} />
    <rect x={44} y={-3} width={18} height={6} fill={STEEL_DARK} />
    <rect x={60} y={-11} width={48} height={22} rx={3} fill={STEEL_LIGHT} stroke={INK} strokeWidth={4} />
  </g>
);
export const spatulaTip = (angle = -30, s = 1) => ({ x: Math.cos((angle * Math.PI) / 180) * 84 * s, y: Math.sin((angle * Math.PI) / 180) * 84 * s });

/** A point on a thrown arc from `a` to `b` at progress p 0..1: a parabola that rises `h` over the straight line
 *  between them at its middle (h 0 is a straight line). */
export function arc(p: number, a: { x: number; y: number }, b: { x: number; y: number }, h: number) {
  const t = clamp01(p);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - 4 * h * t * (1 - t) };
}

// ---- The napkin ------------------------------------------------------------------------------------------------------

/** One line of handwriting-like ink: words of small loops with gaps, deterministic per `seed` (no boil). Width w. */
const scribble = (x: number, y: number, w: number, seed: number) => {
  let d = "";
  let cx = x;
  let k = 0;
  while (cx < x + w - 20) {
    const word = 3 + Math.floor(rnd(seed * 7 + k) * 6);
    d += `M${cx} ${y}`;
    for (let i = 0; i < word && cx < x + w; i++) {
      const up = 7 + rnd(seed * 13 + k * 3 + i) * 9;
      d += ` q4 ${-up} 8 0 q3 ${4 + rnd(seed + i) * 3} 6 0`;
      cx += 14;
    }
    cx += 18 + rnd(seed * 3 + k) * 12;
    k++;
  }
  return d;
};

export interface NapkinProps {
  x?: number; y?: number; s?: number; rot?: number;
  /** Lines of unreadable ink above the readable line(s): the working of the sum. */
  scribbles?: number;
  /** The readable line or lines, in caps or as written, e.g. "...and he ate here". */
  text?: string | string[];
  /** Ink colour: each owner's napkin is in a different hand. */
  ink?: string;
  /** How much is written, 0..1 (scribbles first, then the readable lines); 1 shows it all. */
  write?: number;
  /** Draw the pencil at the point being written. */
  pencil?: boolean;
  /** A ruled total line between the working and the readable line (a sum). */
  rule?: boolean;
  /** Which lines of the text are struck through (0-based). */
  strike?: number[];
  /** Picks a different hand of scribbles. */
  seed?: number;
  /** The readable line's largest size; it shrinks to fit. */
  big?: number;
}

/** The paper napkin with a pencil sum: a scalloped square (520 x 520 at s 1, centred) with lines of ink marks and one
 *  large readable line. `write` animates the writing left to right, line by line; `pencil` follows the tip. */
export const Napkin: React.FC<NapkinProps> = ({
  x = 0, y = 0, s = 1, rot = -4, scribbles = 3, text, ink = "#3b3f8f", write = 1, pencil = false, rule = true, strike = [], seed = 1, big = 64,
}) => {
  const lines = text === undefined ? [] : Array.isArray(text) ? text : [text];
  const W = 520, L = -W / 2 + 40, R = W / 2 - 40;
  const total = scribbles + lines.length;
  const done = clamp01(write) * total;
  const rowY = (i: number) => -W / 2 + 70 + i * 48;
  const textTop = rowY(scribbles) + (rule ? 34 : 10);
  const size = (l: string) => Math.min(big, (R - L) / Math.max(1, l.length * 0.6));
  const textY: number[] = [];
  let ty = textTop;
  lines.forEach((l) => { ty += size(l) * 1.05; textY.push(ty); ty += 10; });
  // the pencil sits where the writing is
  let tip = { x: R, y: rowY(Math.max(0, scribbles - 1)) };
  if (done < total) {
    const i = Math.floor(done);
    const frac = done - i;
    tip = i < scribbles ? { x: L + (R - L) * frac, y: rowY(i) } : { x: L + (R - L) * frac, y: textY[i - scribbles] - 8 };
  }
  const id = `napkin-${seed}-${Math.round(x)}-${Math.round(y)}`;
  // scalloped edge
  const n = 16;
  const edge = (["top", "right", "bottom", "left"] as const).map((side) => Array.from({ length: n }, (_, i) => {
    const a = -W / 2 + (i * W) / n, b = a + W / n, mid = (a + b) / 2;
    return side === "top" ? `Q${mid} ${-W / 2 - 7} ${b} ${-W / 2}` : side === "right" ? `Q${W / 2 + 7} ${mid} ${W / 2} ${b}`
      : side === "bottom" ? `Q${-mid} ${W / 2 + 7} ${-b} ${W / 2}` : `Q${-W / 2 - 7} ${-mid} ${-W / 2} ${-b}`;
  }).join(" ")).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M${-W / 2} ${-W / 2} ${edge} Z`} fill="#000" opacity={0.3} transform="translate(10 14)" />
      <path d={`M${-W / 2} ${-W / 2} ${edge} Z`} fill="#fbf7ee" stroke="#d9cfbd" strokeWidth={3} />
      <path d={`M${-W / 2 + 24} ${-W / 2 + 24} h${W - 48} v${W - 48} h${-(W - 48)} Z`} fill="none" stroke="#e7dccb" strokeWidth={3} strokeDasharray="3 9" />
      <line x1={0} y1={-W / 2} x2={0} y2={W / 2} stroke="#efe6d6" strokeWidth={3} />
      <defs>
        {Array.from({ length: total }, (_, i) => {
          const part = clamp01(done - i);
          const y0 = i < scribbles ? rowY(i) - 30 : textY[i - scribbles] - size(lines[i - scribbles]) - 6;
          const h = i < scribbles ? 50 : size(lines[i - scribbles]) * 1.3 + 12;
          return <clipPath key={i} id={`${id}-${i}`}><rect x={L - 10} y={y0} width={(R - L + 30) * part} height={h} /></clipPath>;
        })}
      </defs>
      {Array.from({ length: scribbles }, (_, i) => (
        <path key={i} d={scribble(L, rowY(i), (R - L) * (i === scribbles - 1 ? 0.7 : 1), seed * 10 + i)} fill="none" stroke={ink} strokeWidth={4}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.85} clipPath={`url(#${id}-${i})`} />
      ))}
      {rule && scribbles > 0 && done >= scribbles && (
        <line x1={L} y1={rowY(scribbles - 1) + 26} x2={R} y2={rowY(scribbles - 1) + 22} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      )}
      {lines.map((l, i) => (
        <g key={i} clipPath={`url(#${id}-${scribbles + i})`}>
          <text x={L} y={textY[i]} fontFamily={FONT} fontWeight={800} fontSize={size(l)} fill={ink} transform={`rotate(-1.5 ${L} ${textY[i]})`}>{l}</text>
          {strike.includes(i) && <line x1={L - 6} y1={textY[i] - size(l) * 0.32} x2={L + l.length * size(l) * 0.6} y2={textY[i] - size(l) * 0.38} stroke={CRIMSON} strokeWidth={8} strokeLinecap="round" />}
        </g>
      ))}
      {pencil && <Pencil x={tip.x} y={tip.y} />}
    </g>
  );
};

/** A yellow pencil, its point at (x, y), lying back up-right. */
export const Pencil: React.FC<{ x?: number; y?: number; s?: number; rot?: number }> = ({ x = 0, y = 0, s = 1, rot = -50 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 L22 -9 L22 9 Z" fill="#f1d3a6" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M0 0 L7 -3 L7 3Z" fill={INK} />
    <rect x={22} y={-9} width={170} height={18} fill={MUSTARD} stroke={INK} strokeWidth={3} />
    <rect x={192} y={-9} width={16} height={18} fill={STEEL} stroke={INK} strokeWidth={3} />
    <rect x={208} y={-9} width={18} height={18} rx={5} fill="#e88a9a" stroke={INK} strokeWidth={3} />
  </g>
);

// ---- The phone app -------------------------------------------------------------------------------------------------

export interface AppPhoneProps {
  x?: number; y?: number; s?: number; rot?: number;
  /** "home": the home screen with the one steel tile you never installed. "app": the app open, a job typed and the dial. */
  mode?: "home" | "app";
  /** The tile's one word (home). */
  word?: string;
  /** The job typed in caps (app), e.g. "COOK", "PAINTER", "CUSTOMER". */
  job?: string;
  /** How many of the job's letters are typed so far; a caret blinks after them on `frame`. Default: all. */
  typed?: number;
  /** The dial's value, 0..1 round its scale (the ring turns, the needle points). */
  value?: number;
  /** The readout under the dial, e.g. "$90 A SHIFT". */
  readout?: string;
  /** A thumb resting on the ring at the needle's tip. */
  thumb?: boolean;
  /** Drives the caret blink. */
  frame?: number;
  /** A ping badge on the tile (home), 0..1. */
  ping?: number;
}

const DIAL_FROM = -225, DIAL_SPAN = 270;
const polar = (r: number, deg: number) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });

/** The ring and needle of the app's one dial, centred, radius r. */
export const Dial: React.FC<{ value: number; r?: number; thumb?: boolean }> = ({ value, r = 150, thumb }) => {
  const v = clamp01(value);
  const a = DIAL_FROM + DIAL_SPAN * v;
  const p0 = polar(r, DIAL_FROM), p1 = polar(r, a);
  const tip = polar(r - 34, a);
  return (
    <g>
      <circle r={r} fill="none" stroke={STEEL_DARK} strokeWidth={30} />
      <circle r={r} fill="none" stroke="#7d8d99" strokeWidth={30} strokeDasharray="2 14" />
      {v > 0.002 && <path d={`M${p0.x} ${p0.y} A${r} ${r} 0 ${DIAL_SPAN * v > 180 ? 1 : 0} 1 ${p1.x} ${p1.y}`} fill="none" stroke={STEEL_LIGHT} strokeWidth={30} strokeLinecap="round" />}
      {Array.from({ length: 11 }, (_, i) => {
        const d = DIAL_FROM + (DIAL_SPAN * i) / 10;
        const q0 = polar(r - 30, d), q1 = polar(r - (i % 5 === 0 ? 58 : 44), d);
        return <line key={i} x1={q0.x} y1={q0.y} x2={q1.x} y2={q1.y} stroke={INK} strokeWidth={i % 5 === 0 ? 6 : 3} strokeLinecap="round" />;
      })}
      <line x1={0} y1={0} x2={tip.x} y2={tip.y} stroke={CRIMSON} strokeWidth={10} strokeLinecap="round" />
      <circle r={20} fill={STEEL} stroke={INK} strokeWidth={5} />
      {thumb && (
        <g transform={`translate(${p1.x} ${p1.y}) rotate(${a + 90})`}>
          <path d="M-34 10 Q-38 -40 0 -46 Q38 -40 34 10 L30 120 L-30 120Z" fill={MUSTARD} stroke={INK} strokeWidth={5} />
          <path d="M-20 -22 Q0 -34 20 -22 L18 4 Q0 10 -18 4Z" fill="#fff4d8" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** The phone with the app: 520 x 960 at s 1, centred. Home shows the steel tile (one word, a small ring); the app
 *  shows the job typed in caps and the one dial with its needle and readout. */
export const AppPhone: React.FC<AppPhoneProps> = ({
  x = 0, y = 0, s = 1, rot = -3, mode = "app", word = "HIRE", job = "COOK", typed, value = 0.3, readout, thumb, frame = 0, ping = 0,
}) => {
  const W = 520, H = 960, sx = -W / 2 + 26, sw = W - 52, top = -H / 2 + 26;
  const n = typed === undefined ? job.length : Math.max(0, Math.min(job.length, Math.floor(typed)));
  const caret = n < job.length || Math.floor(frame / 15) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-W / 2 + 16} y={-H / 2 + 22} width={W} height={H} rx={60} fill="#000" opacity={0.45} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={60} fill="#16181f" stroke={PAPER} strokeWidth={9} />
      <rect x={sx} y={top} width={sw} height={H - 52} rx={40} fill={mode === "home" ? "#1f3c44" : "#e9edf0"} />
      <rect x={-50} y={top + 14} width={100} height={16} rx={8} fill="#0d0e12" />
      {mode === "home" ? (
        <g>
          {Array.from({ length: 16 }, (_, i) => {
            const c = i % 4, r = Math.floor(i / 4);
            if (r === 2 && (c === 1 || c === 2)) return null;
            return <rect key={i} x={sx + 34 + c * 104} y={top + 90 + r * 128} width={78} height={78} rx={20}
              fill={["#e6a0a0", "#9fd8a8", "#7fa0c4", "#d9c26a", "#c9a0d6", "#f4b8c8", "#a8c97f", "#9fc0e0"][(i * 3) % 8]} opacity={0.55} />;
          })}
          {/* the steel tile, two icons wide, its one word and the small ring */}
          <g transform={`translate(${sx + 34 + 104} ${top + 90 + 2 * 128 - 8})`}>
            <rect x={0} y={0} width={182} height={182} rx={34} fill={STEEL} stroke={PAPER} strokeWidth={6} />
            <rect x={8} y={8} width={166} height={70} rx={26} fill="#fff" opacity={0.18} />
            <text x={91} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={word.length > 5 ? 30 : 40} fill={INK}>{word}</text>
            <g transform="translate(91 126)"><circle r={26} fill="none" stroke={STEEL_DARK} strokeWidth={10} /><line x1={0} y1={0} x2={16} y2={-14} stroke={INK} strokeWidth={5} strokeLinecap="round" /></g>
            {ping > 0 && <g transform={`translate(176 6) scale(${ping})`}><circle r={24} fill={CRIMSON} stroke={PAPER} strokeWidth={5} /></g>}
          </g>
        </g>
      ) : (
        <g>
          <rect x={sx} y={top} width={sw} height={96} rx={40} fill={STEEL} />
          <rect x={sx} y={top + 56} width={sw} height={40} fill={STEEL} />
          <g transform={`translate(${sx + 50} ${top + 56})`}><circle r={20} fill="none" stroke={STEEL_DARK} strokeWidth={7} /><line x1={0} y1={0} x2={11} y2={-9} stroke={INK} strokeWidth={4} strokeLinecap="round" /></g>
          {/* the job field */}
          <rect x={sx + 26} y={top + 140} width={sw - 52} height={110} rx={18} fill="#fff" stroke={INK} strokeWidth={5} />
          <text x={sx + 50} y={top + 218} fontFamily={FONT} fontWeight={800} fontSize={job.length > 7 ? 46 : 60} fill={INK} letterSpacing={2}>{job.slice(0, n)}</text>
          {caret && <rect x={sx + 52 + n * (job.length > 7 ? 32 : 42)} y={top + 166} width={7} height={60} fill={TEAL} />}
          {/* the one dial */}
          <g transform={`translate(0 ${top + 520})`}><Dial value={value} r={150} thumb={thumb} /></g>
          {readout && (
            <g transform={`translate(0 ${top + 790})`}>
              <rect x={-(readout.length * 18 + 40)} y={-50} width={readout.length * 36 + 80} height={78} rx={22} fill={INK} />
              <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={MUSTARD}>{readout}</text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

/** The phone as a small object for a hand or a counter: the steel tile glowing on a dark screen (s 1 is about 30 x 54). */
export const SmallAppPhone: React.FC<{ s?: number; rot?: number; lit?: boolean; faceUp?: boolean }> = ({ s = 1, rot = -8, lit = true, faceUp }) =>
  faceUp ? (
    <g transform={`scale(${s})`}>
      <path d="M-34 0 L34 0 L28 -10 L-28 -10Z" fill="#1b1d24" stroke={INK} strokeWidth={2} />
      {lit && <path d="M-26 -10 L26 -10 L22 -14 L-22 -14Z" fill={STEEL_LIGHT} />}
    </g>
  ) : (
    <g transform={`scale(${s}) rotate(${rot}) translate(-6 -40)`}>
      <rect x={-14} y={-4} width={30} height={52} rx={6} fill="#1b1d24" />
      <rect x={-11} y={0} width={24} height={42} rx={3} fill={lit ? "#1f3c44" : "#3a4150"} />
      {lit && <rect x={-6} y={12} width={14} height={14} rx={3} fill={STEEL} />}
    </g>
  );

// ---- Money and tools -----------------------------------------------------------------------------------------------

/** A fan of cash, the thumbnail's own (s 1 = the thumbnail's size inside a Figure's hand). Grip at the origin. */
export const CashFan: React.FC<{ s?: number; n?: number; spread?: number }> = ({ s = 1, n = 4, spread = 18 }) => (
  <g transform={`scale(${0.25 * s})`}>
    {Array.from({ length: n }, (_, i) => {
      const r = -28 + i * spread - ((n - 4) * spread) / 2;
      return (
        <g key={i} transform={`rotate(${r - 20})`}>
          <rect x={-30} y={-150} width={64} height={136} rx={6} fill={i % 2 ? "#8fcf8a" : CASH_GREEN} stroke={INK} strokeWidth={6} />
          <circle cx={2} cy={-82} r={16} fill="none" stroke="#3f7d42" strokeWidth={5} />
        </g>
      );
    })}
  </g>
);

/** One banknote lying flat, centred (old = the 1914 note, sepia). */
export const Banknote: React.FC<{ x?: number; y?: number; s?: number; rot?: number; old?: boolean; amount?: string }> = ({ x = 0, y = 0, s = 1, rot = 0, old, amount }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-70} width={300} height={140} rx={8} fill={old ? "#d9c8a0" : "#8fcf8a"} stroke={INK} strokeWidth={5} />
    <rect x={-136} y={-56} width={272} height={112} rx={4} fill="none" stroke={old ? "#8a7550" : "#3f7d42"} strokeWidth={3} />
    <circle cx={0} cy={0} r={38} fill="none" stroke={old ? "#8a7550" : "#3f7d42"} strokeWidth={5} />
    {amount && <text x={-118} y={-22} fontFamily={FONT} fontWeight={800} fontSize={34} fill={old ? "#6b5a3a" : "#2f5f32"}>{amount}</text>}
  </g>
);

/** A cheque, 600 x 260 at s 1, centred: payee bar, the amount in its box (optional text), a signature. */
export const Cheque: React.FC<{ x?: number; y?: number; s?: number; rot?: number; amount?: string; to?: string; signed?: number }> = ({
  x = 0, y = 0, s = 1, rot = -2, amount, to, signed = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-292} y={-118} width={600} height={260} rx={10} fill="#000" opacity={0.3} />
    <rect x={-300} y={-130} width={600} height={260} rx={10} fill="#e7f3e4" stroke={INK} strokeWidth={5} />
    <rect x={-300} y={-130} width={600} height={42} rx={10} fill={TEAL} opacity={0.85} />
    <circle cx={-262} cy={-109} r={12} fill={MUSTARD} stroke={INK} strokeWidth={3} />
    <line x1={-270} y1={-30} x2={110} y2={-30} stroke={INK} strokeWidth={3} opacity={0.6} />
    {to && <text x={-266} y={-40} fontFamily={FONT} fontWeight={800} fontSize={34} fill={INK}>{to}</text>}
    <rect x={130} y={-74} width={150} height={60} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
    {amount && <text x={205} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={amount.length > 5 ? 30 : 40} fill={INK}>{amount}</text>}
    <line x1={-270} y1={30} x2={280} y2={30} stroke={INK} strokeWidth={3} opacity={0.6} />
    <line x1={60} y1={100} x2={280} y2={100} stroke={INK} strokeWidth={3} opacity={0.6} />
    <path d="M70 92 q14 -40 26 -6 q10 26 22 -14 q8 -22 18 2 q10 18 24 -10 q12 -20 30 4 q10 10 40 -6" fill="none" stroke="#2c3f8f" strokeWidth={5}
      strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 * (1 - clamp01(signed))} />
  </g>
);

/** A payment card, 170 x 108 at s 1, centred. `strange` paints it a colour you've never seen (an iridescent sweep),
 *  with no name on it. */
export const Card: React.FC<{ x?: number; y?: number; s?: number; rot?: number; color?: string; strange?: boolean; named?: boolean }> = ({
  x = 0, y = 0, s = 1, rot = 0, color = TEAL, strange, named = true,
}) => {
  const id = `card-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {strange && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7af0d0" /><stop offset="0.35" stopColor="#c98aff" /><stop offset="0.7" stopColor="#ffd36e" /><stop offset="1" stopColor="#6ad0ff" />
          </linearGradient>
        </defs>
      )}
      <rect x={-85} y={-54} width={170} height={108} rx={12} fill={strange ? `url(#${id})` : color} stroke={INK} strokeWidth={5} />
      <rect x={-62} y={-22} width={34} height={26} rx={5} fill="#e9c46a" stroke={INK} strokeWidth={3} />
      {named && !strange && <rect x={-62} y={24} width={90} height={10} rx={5} fill={PAPER} opacity={0.85} />}
    </g>
  );
};

/** A hammer, gripped at the origin, head up (as raised in a fist). */
export const Hammer: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <rect x={-7} y={-150} width={14} height={180} rx={6} fill="#a8743f" stroke={INK} strokeWidth={4} />
    <path d="M-34 -176 H40 Q52 -176 52 -164 V-146 H-34Z" fill="#6b7280" stroke={INK} strokeWidth={4} />
    <path d="M-34 -176 Q-58 -170 -66 -150 L-52 -146 Q-46 -158 -34 -158Z" fill="#6b7280" stroke={INK} strokeWidth={4} />
  </g>
);

/** A wrench, gripped at the origin, jaw up. */
export const Wrench: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <rect x={-8} y={-140} width={16} height={170} rx={7} fill={STEEL} stroke={INK} strokeWidth={4} />
    <path d="M-26 -140 Q-30 -186 -6 -194 L-6 -166 L8 -166 L8 -194 Q30 -186 26 -140Z" fill={STEEL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={0} cy={38} r={18} fill={STEEL} stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={38} r={8} fill={INK} />
  </g>
);

/** A microphone gripped at the origin, head up, with a pink flag. */
export const Mic: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = 10 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <rect x={-6} y={-60} width={12} height={74} rx={5} fill="#2a2d33" />
    <rect x={-17} y={-58} width={34} height={22} rx={4} fill="#f4a6c0" stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-76} r={18} fill="#4a4e57" stroke={INK} strokeWidth={4} />
  </g>
);

/** A pie on a plate, seen from the side, centred on the plate rim. */
export const Pie: React.FC<{ x?: number; y?: number; s?: number; slice?: boolean }> = ({ x = 0, y = 0, s = 1, slice }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={70} ry={13} fill={PAPER} stroke={INK} strokeWidth={4} />
    <path d={slice ? "M-40 -4 L-4 -40 L44 -4Z" : "M-54 -4 Q-52 -40 0 -42 Q52 -40 54 -4Z"} fill="#e2a85a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {!slice && [-28, -6, 16, 36].map((dx) => <path key={dx} d={`M${dx} -36 q6 10 0 18`} fill="none" stroke="#a8693a" strokeWidth={3} />)}
    {slice && <path d="M-4 -40 L44 -4 L40 4 L-36 4Z" fill="#c9433f" opacity={0.75} />}
  </g>
);

// ---- Diner fixtures (also used by the Diner set) ----------------------------------------------------------------------

/** The till (a chrome cash register), base centre at the origin. `ping` 0..1 throws the drawer open and pops the flag. */
export const Till: React.FC<{ x?: number; y?: number; s?: number; ping?: number; facing?: 1 | -1 }> = ({ x = 0, y = 0, s = 1, ping = 0, facing = 1 }) => {
  const p = clamp01(ping);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <rect x={-70 + p * 34} y={-34} width={150} height={30} rx={4} fill="#7d8d99" stroke={INK} strokeWidth={4} />
      <path d="M-80 -30 L-70 -120 H70 L80 -30Z" fill="#c9d3da" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-44 + (i % 3) * 26} cy={-98 + Math.floor(i / 3) * 22} r={8} fill={i === 4 ? MUSTARD : PAPER} stroke={INK} strokeWidth={2.5} />)}
      <rect x={14} y={-104} width={50} height={56} rx={4} fill="#5f6f7c" stroke={INK} strokeWidth={3} />
      <rect x={-46} y={-170 - p * 26} width={92} height={46} rx={6} fill={SCREEN} stroke={INK} strokeWidth={4} />
      <rect x={-34} y={-160 - p * 26} width={68} height={24} rx={3} fill={p > 0.3 ? "#9fe8a0" : "#2a4a3a"} />
      <rect x={-6} y={-124 - p * 26} width={12} height={4 + p * 26} fill="#7d8d99" />
    </g>
  );
};

/** The round wall clock, centre at the origin, set to `hours` (11.83 is ten to twelve). */
export const WallClock: React.FC<{ x?: number; y?: number; s?: number; hours?: number }> = ({ x = 0, y = 0, s = 1, hours = 11.83 }) => {
  const m = (hours % 1) * 360;
  const h = ((hours % 12) / 12) * 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={66} fill={PAPER} stroke={CRIMSON} strokeWidth={12} />
      <circle r={66} fill="none" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={Math.sin(a) * 48} y1={-Math.cos(a) * 48} x2={Math.sin(a) * (i % 3 ? 54 : 58)} y2={-Math.cos(a) * (i % 3 ? 54 : 58)} stroke={INK} strokeWidth={i % 3 ? 3 : 6} />;
      })}
      <line x1={0} y1={0} x2={Math.sin((h * Math.PI) / 180) * 30} y2={-Math.cos((h * Math.PI) / 180) * 30} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin((m * Math.PI) / 180) * 48} y2={-Math.cos((m * Math.PI) / 180) * 48} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle r={6} fill={CRIMSON} />
    </g>
  );
};
