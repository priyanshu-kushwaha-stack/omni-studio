// The Ladder's page pictures, rebuilt on the outside review of v6 (sheets 31-33, top-15 #5, "Everything valid"):
//   the notebook from above, big enough for a phone: three of YOUR wrong answers in pencil, each ringed in your red
//   mark, "why?" in his blue pen beside it and the right working boxed under it. In the hold your finger runs down
//   and stops on the third; its "why?" pops and the fix writes itself. Then (79, "Every one") the pages riffle, each
//   one full of ringed rows.
//   82: his pen doodle in the margin: two steps, him on the lower one; your head pops onto the higher ("your win"),
//   his doodle frowns and the pen presses a ring round you ("hurt"). The camera pushes into his doodle head; his eyes
//   go up to you ("envying a peer who did better"); then inside it, one brain region glows ("a region also active in
//   pain"), with one large two-line label. The scan is about three seconds, inside the story (review: no slide).
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { camAt, HERO, MINJUN, mix, noise, ramp } from "../shared";
import { PointingHand } from "./Notebook.Parts";

const BLUE = "#2f5d9a";
const PENCIL = "#4a4d58";
const RULE = "#9fc0e0";

/** The open notebook (world units at zoom 1 fill the frame): left page x 300..950, right page 970..1620. */
const PAGE = { top: 110, bottom: 970, left: 300, spine: 960, right: 1620 } as const;
/** Your three wrong answers and his fixes (the right page). */
const MISTAKES = [
  { wrong: "√(16 + 9) = 7", fix: "√25 = 5" },
  { wrong: "x² = 9, so x = 3", fix: "x = 3 or −3" },
  { wrong: "(a + b)² = a² + b²", fix: "a² + 2ab + b²" },
];
export const rowY = (i: number) => 250 + i * 260;
const WRONG_X = 1010, WRONG_W = 380;

/** One mistake row: your answer in pencil, ringed red; "why?" (0..1) and the boxed fix drawing from `fixFrom`. */
const MistakeRow: React.FC<{ i: number; why: number; fixFrom: number; fixTo: number; fix: number }> = ({ i, why, fixFrom, fixTo, fix }) => {
  const y = rowY(i);
  const m = MISTAKES[i];
  const cx = WRONG_X + WRONG_W / 2;
  return (
    <g>
      <text x={WRONG_X} y={y + 16} fontFamily={FONT} fontWeight={700} fontStyle="italic" fontSize={46} fill={PENCIL} textLength={WRONG_W} lengthAdjust="spacingAndGlyphs">{m.wrong}</text>
      <ellipse cx={cx} cy={y} rx={WRONG_W / 2 + 26} ry={44} fill="none" stroke={CRIMSON} strokeWidth={6} transform={`rotate(-2 ${cx} ${y})`} />
      <path d={`M${cx + WRONG_W / 2 + 16} ${y - 52} l20 20 m0 -20 l-20 20`} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
      {why > 0 && (
        <g transform={`translate(${1535} ${y + 14}) rotate(-6) scale(${why})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontStyle="italic" fontSize={58} fill={BLUE}>why?</text>
        </g>
      )}
      {fix > 0 && (
        <g>
          <text x={WRONG_X + 40} y={y + 116} fontFamily={FONT} fontWeight={800} fontStyle="italic" fontSize={48} fill={BLUE}>{m.fix}</text>
          {/* the pen writing it: paper covers what is not written yet */}
          {fix < 1 && <rect x={WRONG_X + 34 + fix * 380} y={y + 70} width={Math.max(0, PAGE.right - 6 - (WRONG_X + 34 + fix * 380))} height={60} fill={PAPER} />}
        </g>
      )}
      <DrawLine d={`M${WRONG_X + 20} ${y + 62} H${WRONG_X + 420} V${y + 136} H${WRONG_X + 20}Z`} from={fixFrom} to={fixTo} color={BLUE} width={5} />
    </g>
  );
};

/** Rows of someone's notes, small: bars of writing, and (mistakes) a red ring and a blue "?" on each. */
const SmallRows: React.FC<{ x: number; seed: number; mistakes?: boolean }> = ({ x, seed, mistakes }) => (
  <g>
    {Array.from({ length: 9 }, (_, r) => {
      const y = PAGE.top + 90 + r * 90;
      const len = 260 + noise(seed + r) * 200;
      return (
        <g key={r}>
          <rect x={x} y={y - 8} width={len} height={16} rx={8} fill={mistakes ? PENCIL : BLUE} opacity={0.7} />
          {mistakes && <ellipse cx={x + len - 40} cy={y} rx={56} ry={24} fill="none" stroke={CRIMSON} strokeWidth={5} />}
          {mistakes && <rect x={x + 30} y={y + 26} width={len * 0.7} height={12} rx={6} fill={BLUE} opacity={0.7} />}
          {mistakes && <text x={x + len + 40} y={y + 14} fontFamily={FONT} fontWeight={800} fontStyle="italic" fontSize={40} fill={BLUE}>?</text>}
        </g>
      );
    })}
  </g>
);

/** The notebook from above on his lit desk. `leaf` 0..1 turns his own notes page over to show your mistakes; `why`,
 *  `fixFrom`/`fixTo` the third row's reveal (the first two are already done); `finger` your hand (or null). */
export const NotebookTop: React.FC<{
  frame: number; cam: Camera; leaf: number; why: number; fixFrom: number; fixTo: number; finger: { x: number; y: number } | null; riffle?: number;
}> = ({ frame, cam, leaf, why, fixFrom, fixTo, finger, riffle = 0 }) => {
  const fix3 = ramp(frame, fixFrom, fixTo);
  // a turning leaf: its right edge swings from the right page's edge over the spine to the left
  const leafPage = (t: number, front: React.ReactNode, back: React.ReactNode, key: string) => {
    if (t <= 0 || t >= 1) return null;
    const c = Math.cos(Math.PI * t);
    return (
      <g key={key} transform={`translate(${PAGE.spine} 0) scale(${c} 1) translate(${-PAGE.spine} 0)`}>
        <rect x={PAGE.spine} y={PAGE.top} width={PAGE.right - PAGE.spine} height={PAGE.bottom - PAGE.top} fill={c > 0 ? PAPER : "#efe3cc"} stroke={INK} strokeWidth={4} />
        {c > 0 ? front : back}
        <rect x={PAGE.spine} y={PAGE.top} width={PAGE.right - PAGE.spine} height={PAGE.bottom - PAGE.top} fill="#000" opacity={0.2 * (1 - Math.abs(c))} />
      </g>
    );
  };
  const flips = [0, 1, 2].map((i) => Math.max(0, Math.min(1, riffle * 3 - i)));
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={
        <g>
          <rect x={-1400} y={-800} width={4800} height={2600} fill="#4a3526" />
          <defs>
            <radialGradient id="nb-top-pool">
              <stop offset="0%" stopColor="#ffd98a" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ffb85a" stopOpacity={0} />
            </radialGradient>
          </defs>
          <ellipse cx={1000} cy={520} rx={1100} ry={760} fill="url(#nb-top-pool)" />
        </g>
      }
      actors={
        <g>
          <rect x={PAGE.left + 14} y={PAGE.top + 18} width={PAGE.right - PAGE.left} height={PAGE.bottom - PAGE.top} rx={10} fill="#000" opacity={0.3} />
          {[PAGE.left, PAGE.spine].map((x) => (
            <g key={x}>
              <rect x={x} y={PAGE.top} width={x === PAGE.left ? PAGE.spine - PAGE.left : PAGE.right - PAGE.spine} height={PAGE.bottom - PAGE.top} fill={PAPER} stroke={INK} strokeWidth={4} />
              {Array.from({ length: 16 }, (_, i) => <line key={i} x1={x + 16} y1={PAGE.top + 60 + i * 52} x2={x + (x === PAGE.left ? 644 : 644)} y2={PAGE.top + 60 + i * 52} stroke={RULE} strokeWidth={2} opacity={0.6} />)}
            </g>
          ))}
          <line x1={PAGE.spine} y1={PAGE.top} x2={PAGE.spine} y2={PAGE.bottom} stroke={INK} strokeWidth={6} />
          <SmallRows x={PAGE.left + 50} seed={3} mistakes />
          {MISTAKES.map((_, i) => (
            <MistakeRow key={i} i={i} why={i < 2 ? 1 : why} fix={i < 2 ? 1 : fix3} fixFrom={i < 2 ? -100 : fixFrom} fixTo={i < 2 ? -90 : fixTo} />
          ))}
          {/* his own notes page, over yours until it turns */}
          {leaf <= 0 && (
            <g>
              <rect x={PAGE.spine} y={PAGE.top} width={PAGE.right - PAGE.spine} height={PAGE.bottom - PAGE.top} fill={PAPER} stroke={INK} strokeWidth={4} />
              <SmallRows x={PAGE.spine + 40} seed={11} />
            </g>
          )}
          {leafPage(leaf, <SmallRows x={PAGE.spine + 40} seed={11} />, null, "leaf")}
          {/* the riffle: page after page of ringed rows flipping past */}
          {flips.map((t, i) => leafPage(t, <SmallRows x={PAGE.spine + 40} seed={20 + i} mistakes />, <SmallRows x={PAGE.spine + 40} seed={30 + i} mistakes />, `r${i}`))}
          {finger && <PointingHand x={finger.x} y={finger.y} rotate={-30} scale={1.1} />}
        </g>
      } />
  );
};

/** The hold, from above: the leaf turns (`turn`..`find`), your finger runs down to the third row and stops (`stop`),
 *  the camera closes on it, "why?" pops (`why`) and the fix writes (`fix`..`done`). */
export const HoldTop: React.FC<{ frame: number; turn: number; find: number; stop: number; why: number; fix: number; done: number }> = ({
  frame, turn, find, stop, why, fix, done,
}) => {
  const leaf = ramp(frame, turn, find - 2);
  const row = mix(0, 2, ramp(frame, find, stop));
  const finger = frame >= find - 4 && frame < why ? { x: WRONG_X - 40, y: rowY(row) + 40 } : null;
  const cam = camAt(frame, [
    [turn, { x: 1000, y: 540, zoom: 1.02 }],
    [stop, { x: 1150, y: 560, zoom: 1.12 }],
    [why - 2, { x: 1240, y: rowY(2) + 30, zoom: 1.75 }],
    [done, { x: 1250, y: rowY(2) + 40, zoom: 1.85 }],
  ]);
  return <NotebookTop frame={frame} cam={cam} leaf={leaf > 0 && leaf < 1 ? leaf : leaf >= 1 ? 2 : 0} why={ramp(frame, why, why + 6)} fixFrom={fix} fixTo={done} finger={finger} />;
};

/** "Your mistakes. Every one.": pull back from the third row, then the pages riffle (`riffle`..`still`). */
export const RiffleTop: React.FC<{ frame: number; at: number; riffle: number; still: number }> = ({ frame, at, riffle, still }) => {
  const cam = camAt(frame, [[at, { x: 1250, y: rowY(2) + 40, zoom: 1.85 }], [riffle, { x: 980, y: 540, zoom: 1.0 }], [still, { x: 970, y: 540, zoom: 1.04 }]]);
  return <NotebookTop frame={frame} cam={cam} leaf={2} why={1} fixFrom={-100} fixTo={-90} finger={null} riffle={ramp(frame, riffle, still)} />;
};

// ------------------------------------------------------------------------------------------------ 82 the doodle

const HIS = { x: 700, y: 640, r: 92 };
const YOURS = { x: 1230, y: 400, r: 92 };

/** A head in his pen: a filled circle, eyes looking (lx, ly), a mouth. */
const PenHead: React.FC<{ x: number; y: number; r: number; fill: string; tuft?: boolean; look: { x: number; y: number }; frown?: number; pop?: number }> = ({
  x, y, r, fill, tuft, look, frown = 0, pop = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${pop})`}>
    {tuft && <path d={`M${-r * 0.2} ${-r * 0.9} Q${-r * 0.3} ${-r * 1.45} ${r * 0.1} ${-r * 1.5} Q${-r * 0.02} ${-r * 1.2} ${r * 0.22} ${-r * 1.15}Z`} fill={BLUE} />}
    <circle r={r} fill={fill} opacity={0.85} />
    <circle r={r} fill="none" stroke={BLUE} strokeWidth={7} />
    {[-0.32, 0.32].map((ex) => <circle key={ex} cx={r * ex + look.x * r * 0.12} cy={-r * 0.1 + look.y * r * 0.14} r={r * 0.11} fill={BLUE} />)}
    <path d={`M${-r * 0.3} ${r * 0.42} Q0 ${r * mix(0.62, 0.22, frown)} ${r * 0.3} ${r * 0.42}`} fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" />
  </g>
);

/** The margin doodle: steps (`at`), your head popping on top (`win`), his frown and the pressed ring (`hurt`), the push
 *  into his head (`push`..`end`), his eyes up to you (`envy`). */
export const DoodleShot: React.FC<{ frame: number; at: number; win: number; hurt: number; push: number; envy: number; end: number }> = ({
  frame, at, win, hurt, push, envy, end,
}) => {
  const up = ramp(frame, envy, envy + 8);
  const cam = camAt(frame, [[at, { x: 960, y: 540, zoom: 1.0 }], [push, { x: 940, y: 540, zoom: 1.08 }], [end, { x: HIS.x, y: HIS.y - 10, zoom: 2.6 }]]);
  const winPop = ramp(frame, win, win + 6);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={
        <g>
          <rect x={-1400} y={-800} width={4800} height={2600} fill={PAPER} />
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1400} y1={-400 + i * 64} x2={3400} y2={-400 + i * 64} stroke={RULE} strokeWidth={3} opacity={0.6} />)}
          <line x1={240} y1={-800} x2={240} y2={1800} stroke="#e8a0a0" strokeWidth={4} />
        </g>
      }
      actors={
        <g>
          <DrawLine d="M420 760 H960 V520 H1500" from={at + 2} to={at + 18} color={BLUE} width={9} />
          <PenHead x={HIS.x} y={HIS.y} r={HIS.r} fill={MINJUN.head} look={{ x: mix(0.6, 0.9, up), y: mix(0.3, -1, up) }} frown={ramp(frame, hurt, hurt + 8)} />
          {frame >= win && <PenHead x={YOURS.x} y={YOURS.y} r={YOURS.r} fill={HERO.head} tuft look={{ x: -0.6, y: 0.4 }} pop={winPop} />}
          {/* the pen pressing round and round your head */}
          <DrawLine d={`M${YOURS.x + 130} ${YOURS.y} ${Array.from({ length: 25 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const rr = 128 + (i % 3) * 6;
            return `L${YOURS.x + Math.cos(a) * rr} ${YOURS.y + Math.sin(a) * rr * 0.92}`;
          }).join(" ")}`} from={hurt} to={hurt + 16} color={BLUE} width={6} />
        </g>
      } />
  );
};

/** Inside his doodle head: a brain in pen, one region glowing crimson from `lit`; the two-line label from `lit`. */
export const ScanShot: React.FC<{ frame: number; at: number; lit: number; end: number }> = ({ frame, at, lit, end }) => {
  const g = ramp(frame, lit, lit + 8);
  const throb = 1 + 0.06 * Math.sin((frame - lit) / 4) * g;
  const cam = camAt(frame, [[at, { x: 960, y: 560, zoom: 1.0 }], [end, { x: 960, y: 570, zoom: 1.06 }]]);
  const cx = 960, cy = 640, R = 270;
  const label = (y: number, text: string) => (
    <text x={cx} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={INK} opacity={g}>{text}</text>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={
        <g>
          <rect x={-1400} y={-800} width={4800} height={2600} fill={PAPER} />
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1400} y1={-400 + i * 64} x2={3400} y2={-400 + i * 64} stroke={RULE} strokeWidth={3} opacity={0.5} />)}
        </g>
      }
      actors={
        <g>
          <circle cx={cx} cy={cy} r={R} fill={MINJUN.head} opacity={0.85} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={BLUE} strokeWidth={9} />
          <path d={`M${cx - 190} ${cy + 40} q-20 -130 90 -170 q60 -90 170 -36 q112 -34 152 74 q72 58 0 146 q-36 72 -152 36 q-72 54 -170 0 q-112 18 -90 -50z`}
            fill="#f2c6c0" stroke={BLUE} strokeWidth={7} />
          <path d={`M${cx - 80} ${cy - 130} q20 74 -18 130 M${cx + 60} ${cy - 140} q-36 90 18 160 M${cx - 150} ${cy + 20} q70 10 120 -20`} fill="none" stroke={BLUE} strokeWidth={5} opacity={0.5} />
          <circle cx={cx - 20} cy={cy - 50} r={70 * throb} fill={CRIMSON} opacity={0.7 * g} />
          <circle cx={cx - 20} cy={cy - 50} r={110 * throb} fill={CRIMSON} opacity={0.18 * g} />
          {label(196, "ENVY LIT A REGION")}
          {label(280, "ALSO ACTIVE IN PAIN")}
        </g>
      } />
  );
};
