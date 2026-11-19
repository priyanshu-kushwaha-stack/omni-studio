// Props for line 91 of "The Country Holds Its Breath" (v7, outside review of v6): the mistake notebook seen from above
// opening on a corrected page ("every mistake you made this year, and the fix"), a segmented chocolate bar in its
// wrapper that snaps into a small and a bigger half, your hands from above, and the ladder the bigger half becomes
// ("he can have the good wood"). World coordinates, for an insert camera over the desk (DeskTopBack).
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";

// ------------------------------------------------------------------------------------------------ the bar

/** One segment's side, in bar units. */
export const SEG = 64;

/** A chocolate bar from above: `cols` x 2 raised segments, centred on (x, y); `wrap` puts the paper sleeve and its
 *  silver foil on that end. */
export const Bar: React.FC<{ x: number; y: number; cols: number; scale?: number; tilt?: number; wrap?: "left" | "right" }> = ({
  x, y, cols, scale = 1, tilt = 0, wrap,
}) => {
  const w = cols * SEG, h = 2 * SEG;
  const sleeve = SEG * 1.25;
  const sx = wrap === "left" ? -w / 2 - 8 : w / 2 - sleeve + 8;
  const foil = wrap === "left" ? sx + sleeve : sx;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={8} fill="#000" opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#4a2a1b" stroke={INK} strokeWidth={5} />
      {Array.from({ length: cols * 2 }, (_, i) => {
        const cx = -w / 2 + (i % cols) * SEG, cy = -h / 2 + Math.floor(i / cols) * SEG;
        return (
          <g key={i}>
            <rect x={cx + 6} y={cy + 6} width={SEG - 12} height={SEG - 12} rx={6} fill="#6e4330" />
            <rect x={cx + 12} y={cy + 10} width={SEG - 26} height={8} rx={4} fill="#8a5a42" />
          </g>
        );
      })}
      {wrap && (
        <g>
          <path d={`M${foil - 10} ${-h / 2 - 6} ${Array.from({ length: 8 }, (_, i) => `L${foil + (i % 2 ? 10 : -10)} ${-h / 2 - 6 + (i + 1) * (h + 12) / 8}`).join(" ")} L${foil + 10} ${-h / 2 - 6}Z`}
            fill="#d9dde3" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <rect x={sx} y={-h / 2 - 8} width={sleeve} height={h + 16} rx={6} fill={CRIMSON} stroke={INK} strokeWidth={5} />
          <rect x={sx + 10} y={-h / 2 + 18} width={sleeve - 20} height={h - 36} rx={6} fill={MUSTARD} stroke={INK} strokeWidth={3} />
          <rect x={sx + 20} y={-10} width={sleeve - 40} height={8} rx={4} fill={INK} opacity={0.7} />
          <rect x={sx + 20} y={6} width={sleeve - 50} height={8} rx={4} fill={INK} opacity={0.5} />
        </g>
      )}
    </g>
  );
};

/** Crumbs that jump off the snap (`t` 0..1 after it), around (x, y). */
export const Crumbs: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t <= 0 || t >= 1 ? null : (
    <g opacity={1 - t}>
      {[[-40, -50], [30, -64], [-10, 58], [46, 40], [-56, 20]].map(([dx, dy], i) => (
        <rect key={i} x={x + dx * t * 1.6 - 6} y={y + dy * t * 1.6 - 6} width={12} height={10} rx={2} fill="#6e4330" stroke={INK} strokeWidth={2}
          transform={`rotate(${i * 40 + t * 90} ${x + dx * t * 1.6} ${y + dy * t * 1.6})`} />
      ))}
    </g>
  );

/** Your arm and hand from above: an ink sleeve from `from` (off the frame's edge) to a mustard hand at (x, y). */
export const TopHand: React.FC<{ x: number; y: number; from: { x: number; y: number } }> = ({ x, y, from }) => (
  <g>
    <line x1={from.x} y1={from.y} x2={x} y2={y} stroke={INK} strokeWidth={46} strokeLinecap="round" />
    <line x1={from.x} y1={from.y} x2={x + (from.x - x) * 0.12} y2={y + (from.y - y) * 0.12} stroke="#23252b" strokeWidth={34} strokeLinecap="round" />
    <circle cx={x} cy={y} r={34} fill={MUSTARD} stroke={INK} strokeWidth={6} />
  </g>
);

// ------------------------------------------------------------------------------------------------ the notebook, open

const PW = 420, PH = 560;

/** A page with a filled grid of exercises: grey lines, small red crosses and teal ticks (not meant to be read). */
const BusyPage: React.FC<{ seed: number }> = ({ seed }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={40} y={60 + i * 54} width={260 - ((i * 37 + seed * 13) % 90)} height={12} rx={6} fill="#4a4d58" opacity={0.45} />)}
    {[1, 4, 6].map((i) => <path key={i} d={`M${340} ${52 + i * 54} l22 22 m0 -22 l-22 22`} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" opacity={0.8} />)}
    {[2, 5, 8].map((i) => <path key={i} d={`M${336} ${66 + i * 54} l10 10 l20 -22`} fill="none" stroke={TEAL} strokeWidth={6} strokeLinecap="round" />)}
  </g>
);

/** The page with the mistake: the problem, and the wrong answer struck through in red. */
const MistakePage: React.FC = () => (
  <g fontFamily={FONT} fontWeight={800}>
    <text x={PW / 2} y={170} textAnchor="middle" fontSize={62} fill={INK}>3x + 2 = 14</text>
    <text x={PW / 2} y={330} textAnchor="middle" fontSize={84} fill={INK} opacity={0.75}>x = 5</text>
    <path d={`M${PW / 2 - 120} 300 L${PW / 2 + 120} 300`} stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" />
    <path d={`M${PW / 2 - 50} 400 l100 100 m0 -100 l-100 100`} stroke={CRIMSON} strokeWidth={14} strokeLinecap="round" />
  </g>
);

/** The page with the fix: the right answer in teal and a tick that draws itself (`tick` 0..1). */
const FixPage: React.FC<{ tick: number }> = ({ tick }) => (
  <g fontFamily={FONT} fontWeight={800}>
    <text x={PW / 2} y={170} textAnchor="middle" fontSize={62} fill={INK}>FIX</text>
    <text x={PW / 2} y={330} textAnchor="middle" fontSize={96} fill={TEAL}>x = 4</text>
    <path d={`M${PW / 2 - 70} 440 l50 50 l100 -110`} fill="none" stroke={TEAL} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round"
      pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
  </g>
);

const Sheet: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={0} y={-PH / 2} width={PW} height={PH} rx={6} fill={PAPER} stroke={INK} strokeWidth={5} />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={14} y1={-PH / 2 + 50 + i * 52} x2={PW - 14} y2={-PH / 2 + 50 + i * 52} stroke="#9fc0e0" strokeWidth={2} opacity={0.6} />)}
    <g transform={`translate(0 ${-PH / 2})`}>{children}</g>
  </g>
);

const Cover: React.FC = () => (
  <g>
    <rect x={0} y={-PH / 2} width={PW} height={PH} rx={12} fill={TEAL} stroke={INK} strokeWidth={7} />
    <rect x={0} y={-PH / 2} width={40} height={PH} fill="#157a71" />
    <rect x={100} y={-190} width={260} height={130} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={130} y={-160} width={180} height={18} rx={9} fill={INK} opacity={0.75} />
    <rect x={130} y={-118} width={120} height={18} rx={9} fill={INK} opacity={0.5} />
  </g>
);

/** A leaf turning over the spine: `f` 0 lying right (its front up) to 1 lying left (its back up). */
const Leaf: React.FC<{ f: number; front: React.ReactNode; back: React.ReactNode }> = ({ f, front, back }) => {
  const c = Math.cos(Math.PI * Math.min(1, Math.max(0, f)));
  if (Math.abs(c) < 0.02) return null;
  return <g transform={`scale(${c} 1)`}>{c > 0 ? front : <g transform={`translate(${PW} 0) scale(-1 1)`}>{back}</g>}</g>;
};

/** Your mistake notebook from above, its spine at (x, y): `open` 0..1 swings the cover over to the left (and back when
 *  it falls again); `riffle` turns that many leaves (fractions mid-turn) and lands on the corrected page; `tick` draws
 *  the fix's tick. The coloured tabs down the edge are a year of mistakes. */
export const OpenBook: React.FC<{ x: number; y: number; scale?: number; open: number; riffle: number; leaves: number; tick: number }> = ({
  x, y, scale = 1, open, riffle, leaves, tick,
}) => {
  const turned = Math.floor(riffle);
  const turning = riffle - turned;
  const done = riffle >= leaves;
  const leftFace = done ? <Sheet><MistakePage /></Sheet> : turned >= 1 ? <Sheet><BusyPage seed={turned} /></Sheet> : <Sheet />;
  const rightFace = done || turned === leaves - 1 && turning > 0 ? <Sheet><FixPage tick={tick} /></Sheet> : <Sheet><BusyPage seed={turned + 7 + (turning > 0 ? 1 : 0)} /></Sheet>;
  // the back of the turning leaf: the mistake page on the last leaf
  const turningBack = turned === leaves - 1 ? <Sheet><MistakePage /></Sheet> : <Sheet><BusyPage seed={turned + 1} /></Sheet>;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-PW * open + 14} y={-PH / 2 + 18} width={PW * (1 + open)} height={PH} rx={12} fill="#000" opacity={0.22} />
      {/* the page stack on the right, its tabs */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={PW - 4} y={-PH / 2 + 24 + i * 38} width={22} height={28} rx={4} fill={[CRIMSON, MUSTARD, TEAL, "#9fc0e0"][i % 4]} stroke={INK} strokeWidth={2} />
      ))}
      {rightFace}
      {/* the left side, once the cover lies open */}
      {open >= 1 && <g transform={`translate(${-PW} 0)`}>{leftFace}</g>}
      {open >= 1 && !done && turning > 0 && <Leaf f={turning} front={<Sheet><BusyPage seed={turned + 7} /></Sheet>} back={turningBack} />}
      {open < 1 && <Leaf f={open} front={<Cover />} back={leftFace} />}
      <line x1={0} y1={-PH / 2} x2={0} y2={PH / 2} stroke={INK} strokeWidth={6} opacity={open > 0 ? 0.6 : 0} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the ladder

/** Pencil rails and rungs that draw themselves (`t` 0..1) beyond the bigger half stood upright at (x, y): the bar's
 *  segment lines become the ladder's bottom rungs and the ink carries it on up the page. */
export const LadderInk: React.FC<{ x: number; y: number; t: number; scale?: number }> = ({ x, y, t, scale = 1 }) => {
  const half = SEG * scale; // the upright bar is 2 segments wide
  const top = y - 2 * SEG * scale - 330;
  const rungs = Array.from({ length: 5 }, (_, i) => y - 2 * SEG * scale - 30 - i * SEG * scale);
  const draw = (k: number) => Math.min(1, Math.max(0, t * 1.4 - k * 0.08));
  return (
    <g stroke={INK} strokeWidth={10} strokeLinecap="round" fill="none">
      {[-1, 1].map((s) => (
        <path key={s} d={`M${x + s * (half + 12)} ${y + 2 * SEG * scale + 40} L${x + s * (half + 12)} ${top}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(0)} />
      ))}
      {rungs.map((ry, i) => (
        <path key={i} d={`M${x - half - 12} ${ry} L${x + half + 12} ${ry}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(i + 1)} />
      ))}
    </g>
  );
};
