// Your street at dusk as one facade of windows (owner: builder B; More Hours, THE picture only this premise can show).
// A terrace of flats, twelve windows across and ten up, and in every one the same thing: a sleeper with the band, a
// pale second self typing at a floating desk above them, coins dropping into a jar on the inside sill. On the ground
// floor the shops: the coffee shop dark (a paper sign on its door, a shutter that rolls down), the pillow shop lit
// with a queue; a street lamp on the pavement in front.
//
// How beats use it: <WindowStreetScene frame mood cam ... actors={...} />. WS holds every anchor; `windowAt(col, row)`
// gives a window's rectangle; `WS.yours` is your window (the real <Sleeper> and <Ghost> from parts.tsx, so the close-up
// matches the key shot; the others are drawn small and cheap).
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Chair, Deep, noise, setLook, Sky } from "@whatif/kit/sets/common";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { CoinArc, deviceAt, Ghost, Sleeper } from "../parts";
import { GHOST, HERO, PASTELS } from "../shared";

const COLS = 12;
const ROWS = 10;
const W = 140;
const H = 88;
const PX = 186;
const PY = 104;
const X0 = -73;
const ROW0_BOTTOM = 780;

/** Every anchor on the street, in REF coordinates (all at depth 1). */
export const WS = {
  cols: COLS,
  rows: ROWS,
  win: { w: W, h: H },
  /** Your window: column and row (row 0 is the first floor, just over the shops). */
  yours: { col: 5, row: 1 },
  /** The shops' band and the pavement. */
  shops: { top: 800, bottom: 940 },
  pavement: 990,
  /** The coffee shop (its window and door) and the pillow shop, x ranges. */
  coffee: { from: 300, to: 700, door: 610 },
  pillow: { from: 1300, to: 1700, door: 1330 },
  /** The street lamp: post x and its head. */
  lamp: { x: 800, head: 790 },
  /** The roofline. */
  roof: -290,
};

/** A window's rectangle: its top-left (x, y) and size. */
export const windowAt = (col: number, row: number) => ({ x: X0 + col * PX, y: ROW0_BOTTOM - H - row * PY, w: W, h: H });

/** The centre of your window (for the camera). */
export const yourWindow = () => {
  const r = windowAt(WS.yours.col, WS.yours.row);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};

/** A window's index (0..COLS*ROWS-1), for per-window timings passed by a beat. */
export const windowIndex = (col: number, row: number) => row * COLS + col;

/** Mix a hex colour toward white by t (a ghost takes its sleeper's head colour, lightened). */
export function lighten(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v + (255 - v) * t);
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}

const BLOCKS = [
  { from: -400, to: 299, color: "#b5735f", roof: -300 },
  { from: 299, to: 857 - 23, color: "#c99a6a", roof: -250 },
  { from: 857 - 23, to: 1415 - 23, color: "#a7685a", roof: -290 },
  { from: 1415 - 23, to: 1973 - 23, color: "#b88a72", roof: -260 },
  { from: 1973 - 23, to: 2600, color: "#9e6f63", roof: -310 },
];

const typing = (k: number): Pose => ({ ...SEATED, lean: 4, tilt: 4, armF: [64 + k * 6, 44 - k * 4], armB: [56 - k * 5, 48 + k * 4] });

/** A small pale second self at its floating desk (cheap: no blur filter). (x, y) the seated rig's feet. */
const MiniGhost: React.FC<{ x: number; y: number; s: number; t: number; frame: number; head: string; seed: number }> = ({ x, y, s, t, frame, head, seed }) => {
  if (t <= 0.01) return null;
  const hip = y - 112 * s;
  const k = (Math.sin(frame * 1.7 + seed) + 1) / 2;
  return (
    <g opacity={Math.min(1, t * 1.3)} transform={`translate(0 ${(1 - t) * 60 * s})`}>
      <circle cx={x + 50 * s} cy={hip - 70 * s} r={150 * s} fill="#cfefff" opacity={0.28} />
      <rect x={x + 60 * s} y={hip - 4 * s} width={170 * s} height={14 * s} rx={4 * s} fill="#9fd9dc" stroke={INK} strokeWidth={3 * s} />
      <path d={`M${x + 80 * s} ${hip - 4 * s} l-12 ${-80 * s} h${100 * s} l10 ${80 * s}Z`} fill="#eef1f5" stroke={INK} strokeWidth={4 * s} />
      <Chair x={x} y={hip} scale={0.9 * s} color={GHOST.scarf} />
      <Figure x={x} y={y} scale={s} pose={typing(k)} head={head} scarf={GHOST.scarf} eyes={1.3} brows="worry" mouth="o" look={{ x: 0.9, y: 0.35 }} />
    </g>
  );
};

/** A jar small enough for a window sill: the same glass, gold and lid as <Jar>, with strokes to its size. */
const MiniJar: React.FC<{ x: number; y: number; w: number; h: number; fill: number }> = ({ x, y, w, h, fill }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w * 0.15} fill="#cfe9f4" opacity={0.35} />
    <rect x={x - w / 2 + 1} y={y - h * fill} width={w - 2} height={h * fill - 1} rx={w * 0.12} fill="#f2b632" />
    <line x1={x - w / 2 + 2} y1={y - h * fill + 1} x2={x + w / 2 - 2} y2={y - h * fill + 1} stroke="#ffd36b" strokeWidth={1.4} />
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w * 0.15} fill="none" stroke={PAPER} strokeWidth={1.4} />
    <rect x={x - w / 2 - 1.5} y={y - h - 3} width={w + 3} height={4} rx={1.5} fill="#8a96a8" stroke={INK} strokeWidth={0.8} />
  </g>
);

/** Who sleeps in window i: head colour and which way the bed runs. */
const sleeperOf = (i: number) => ({ head: PASTELS[Math.floor(noise(i * 3 + 1) * PASTELS.length)], flip: noise(i + 40) < 0.5 });

/** One window: the room behind the glass (glowing teal-white when the band is on), the sleeper, the ghost, the jar. */
const Room: React.FC<{ col: number; row: number; frame: number; on: number; mood: MoodName; coins: boolean; jars: number;
  clock: number }> = ({ col, row, frame, on, mood, coins, jars, clock }) => {
  const i = windowIndex(col, row);
  const r = windowAt(col, row);
  const mine = col === WS.yours.col && row === WS.yours.row;
  const t = deviceAt(frame, on);
  const who = mine ? { head: HERO.head, flip: false } : sleeperOf(i);
  const ghostHead = mine ? GHOST.head : lighten(who.head, 0.62);
  const dark = mood === "night" || mood === "lamp";
  const curtain = ["#d8344f", "#3d6fb0", "#e6a23c", "#5aa04a", "#8a5c8f"][i % 5];
  // world coordinates of the sleeper's head and the ghost's feet, mirrored when the bed runs the other way
  const fx = (dx: number) => (who.flip ? r.x + r.w - dx : r.x + dx);
  const s = 0.2;
  const ghost = { x: fx(66), y: r.y + r.h - 24 };
  const jar = { x: who.flip ? r.x + 16 : r.x + r.w - 16, y: r.y + r.h - 3 };
  return (
    <g>
      <clipPath id={`ws-${i}`}><rect x={r.x} y={r.y} width={r.w} height={r.h} /></clipPath>
      <g clipPath={`url(#ws-${i})`}>
        <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={dark ? "#1d2140" : "#3b3456"} />
        <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#bfefff" opacity={0.42 * t} />
        <circle cx={ghost.x + (who.flip ? -10 : 10)} cy={r.y + 30} r={70} fill="#e8fbff" opacity={0.35 * t} />
        {mine && clock >= 0 && (
          <g transform={`translate(${r.x + 22} ${r.y + 18})`}>
            <circle r={10} fill={PAPER} stroke={INK} strokeWidth={2} />
            <line x1={0} y1={0} x2={Math.sin(clock) * 7} y2={-Math.cos(clock) * 7} stroke={INK} strokeWidth={2} strokeLinecap="round" />
            <line x1={0} y1={0} x2={Math.sin(clock / 12) * 5} y2={-Math.cos(clock / 12) * 5} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        )}
        {/* the bed: pillow and blanket along the bottom of the window */}
        <ellipse cx={fx(26)} cy={r.y + r.h - 14} rx={22} ry={10} fill="#262c45" />
        <g transform={who.flip ? `translate(${2 * fx(26)} 0) scale(-1 1)` : undefined}>
          <Sleeper id={`ws${i}`} x={fx(26)} y={r.y + r.h - 22} scale={0.3} tilt={-72} head={who.head}
            scarf={mine ? HERO.scarf : undefined} tuft={mine} lit={t} />
        </g>
        <path d={`M${fx(40)} ${r.y + r.h} Q${fx(52)} ${r.y + r.h - 22} ${fx(80)} ${r.y + r.h - 20} T${fx(140)} ${r.y + r.h - 10} V${r.y + r.h + 4} H${fx(40)}Z`}
          fill={["#3e5c8f", "#7a5a8c", "#4f6b5a", "#8a5c3b"][i % 4]} stroke={INK} strokeWidth={2} />
        {mine
          ? <Ghost x={ghost.x} y={ghost.y} scale={s} t={t} frame={frame} facing={who.flip ? -1 : 1} />
          : <MiniGhost x={ghost.x - (who.flip ? 30 : 0)} y={ghost.y} s={s} t={t} frame={frame} head={ghostHead} seed={i} />}
        {/* the jar (or, for you, a shelf of jars) on the inside sill */}
        {mine && jars > 1 && <rect x={r.x + 8} y={jar.y - 1} width={r.w - 16} height={4} rx={1.5} fill="#8a5c3b" stroke={INK} strokeWidth={0.8} />}
        {Array.from({ length: mine ? Math.max(1, jars) : 1 }, (_, k) => (
          <MiniJar key={k} x={jar.x + (who.flip ? k * 20 : -k * 20)} y={jar.y - (mine && jars > 1 ? 1 : 0)} w={16} h={22} fill={mine ? 0.8 : 0.25 + 0.6 * noise(i + k * 9)} />
        ))}
        {coins && t > 0.5 && (
          <CoinArc frame={frame} start={on + 12 + Math.floor(noise(i) * 8)} from={{ x: ghost.x + (who.flip ? 6 : 36), y: ghost.y - 26 }}
            via={{ x: jar.x, y: r.y + 14 }} to={{ x: jar.x, y: jar.y - 20 }} every={12 + (i % 5)} fall={16} r={3.4} />
        )}
      </g>
      {/* curtains, frame and sill */}
      <path d={`M${r.x} ${r.y} h16 q-6 ${r.h / 2} 2 ${r.h} h-18Z M${r.x + r.w} ${r.y} h-16 q6 ${r.h / 2} -2 ${r.h} h18Z`} fill={curtain} opacity={0.9} />
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#efe6d4" strokeWidth={7} />
      <rect x={r.x - 8} y={r.y + r.h + 2} width={r.w + 16} height={10} rx={3} fill="#e8dcc4" stroke={INK} strokeWidth={2.5} />
    </g>
  );
};

/** The facade: the brick blocks, their cornices and every window. */
const Facade: React.FC<{ frame: number; mood: MoodName; onAt: (i: number) => number; coins: boolean; jars: number; clock: number }> = ({
  frame, mood, onAt, coins, jars, clock }) => (
  <g>
    {BLOCKS.map((b, k) => (
      <g key={k}>
        <rect x={b.from} y={b.roof} width={b.to - b.from} height={WS.shops.top - b.roof + 10} fill={b.color} stroke={INK} strokeWidth={4} />
        <rect x={b.from - 6} y={b.roof - 14} width={b.to - b.from + 12} height={22} fill="#e8dcc4" stroke={INK} strokeWidth={4} />
        <rect x={b.from + 40} y={b.roof - 60} width={40} height={48} fill="#7a4a3a" stroke={INK} strokeWidth={3} />
      </g>
    ))}
    {Array.from({ length: ROWS }, (_, row) => Array.from({ length: COLS }, (_, col) => (
      <Room key={`${col}-${row}`} col={col} row={row} frame={frame} on={onAt(windowIndex(col, row))} mood={mood} coins={coins}
        jars={jars} clock={clock} />
    )))}
  </g>
);

/** A white pillow, held or stacked. */
const Pillow: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <rect x={x - 26 * s} y={y - 16 * s} width={52 * s} height={32 * s} rx={12 * s} fill="#f7f4ee" stroke={INK} strokeWidth={3} />
);

/** The shops on the ground floor and the pavement. `shut` 0..1 rolls the coffee shop's shutter down; `sign` shows the
 *  paper sign on its door. The pillow shop is lit, pillows stacked in its window. */
const Shops: React.FC<{ mood: MoodName; shut: number; sign: boolean }> = ({ shut, sign }) => {
  const S = WS.shops;
  const C = WS.coffee;
  const P = WS.pillow;
  return (
    <g>
      <rect x={-400} y={S.top} width={3000} height={S.bottom - S.top} fill="#5a4a48" stroke={INK} strokeWidth={4} />
      {/* the coffee shop: green awning with a cup, dark window, the shutter, the door with its paper sign */}
      <rect x={C.from} y={S.top + 26} width={C.door - C.from - 20} height={S.bottom - S.top - 30} fill="#232634" stroke={INK} strokeWidth={4} />
      <rect x={C.from} y={S.top + 26} width={C.door - C.from - 20} height={(S.bottom - S.top - 30) * shut} fill="#8a8f98" />
      {shut > 0 && Array.from({ length: Math.floor(shut * 9) }, (_, k) => (
        <line key={k} x1={C.from} x2={C.door - 20} y1={S.top + 36 + k * 12} y2={S.top + 36 + k * 12} stroke="#6b7079" strokeWidth={3} />
      ))}
      <rect x={C.door} y={S.top + 20} width={80} height={S.bottom - S.top - 20} fill="#2f2a2a" stroke={INK} strokeWidth={4} />
      {sign && (
        <g transform={`rotate(-5 ${C.door + 40} ${S.top + 70})`}>
          <rect x={C.door + 14} y={S.top + 46} width={52} height={44} fill={PAPER} stroke={INK} strokeWidth={3} />
          {[0, 1, 2].map((k) => <rect key={k} x={C.door + 22} y={S.top + 56 + k * 11} width={36 - k * 8} height={5} rx={2} fill={INK} />)}
        </g>
      )}
      <path d={`M${C.from - 20} ${S.top} h${C.to - C.from + 40} l-20 26 h${-(C.to - C.from)}Z`} fill="#2f7a4a" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${(C.from + C.to) / 2} ${S.top + 13})`}>
        <path d="M-12 -8 h24 l-3 16 h-18Z" fill={PAPER} />
        <path d="M12 -4 q8 0 6 6 q-2 4 -7 3" fill="none" stroke={PAPER} strokeWidth={3} />
      </g>
      {/* the pillow shop: lit, a striped awning, pillows stacked in the window, the door open */}
      <rect x={P.door + 90} y={S.top + 26} width={P.to - P.door - 90} height={S.bottom - S.top - 30} fill="#ffe6a8" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, k) => <Pillow key={k} x={P.door + 130 + (k % 4) * 64} y={S.bottom - 22 - Math.floor(k / 4) * 30} s={1} />)}
      <rect x={P.door} y={S.top + 20} width={80} height={S.bottom - S.top - 20} fill="#fff0c4" stroke={INK} strokeWidth={4} />
      <path d={`M${P.from - 40} ${S.top} h${P.to - P.from + 60} l-20 26 h${-(P.to - P.from + 20)}Z`} fill={PAPER} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, k) => <rect key={k} x={P.from - 30 + k * 48} y={S.top + 2} width={22} height={22} fill="#7fa0c4" />)}
      {/* the other fronts: dark */}
      {[[-380, 260], [760, 1240], [1760, 2560]].map(([a, b]) => (
        <rect key={a} x={a} y={S.top + 26} width={b - a} height={S.bottom - S.top - 30} fill="#2b2d3a" stroke={INK} strokeWidth={4} />
      ))}
      {/* the pavement and the kerb */}
      <rect x={-400} y={S.bottom} width={3000} height={400} fill="#9d958a" />
      <rect x={-400} y={S.bottom} width={3000} height={8} fill="#6f6860" />
      <rect x={-400} y={1060} width={3000} height={16} fill="#c9c0b0" stroke={INK} strokeWidth={3} />
      <rect x={-400} y={1076} width={3000} height={400} fill="#4b4f57" />
    </g>
  );
};

/** The queue outside the pillow shop: people with pillows under their arms, shuffling. */
const PillowQueue: React.FC<{ frame: number; n: number }> = ({ frame, n }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Figure key={i} x={WS.pillow.door - 50 - i * 70} y={WS.pavement + 4} scale={0.5} facing={1}
        pose={{ ...STAND, armF: [40, 60], tilt: Math.sin(frame / 30 + i) * 3 }} head={PASTELS[(i * 3 + 2) % PASTELS.length]}
        coat={["#5a6488", "#7a5a8c", "#6d7f8f", "#8a5c3b"][i % 4]} mouth="flat" blink={(frame + i * 23) % 97 < 4}
        held={<Pillow s={0.9} />} />
    ))}
  </g>
);

/** The street lamp on the pavement. */
const Lamp: React.FC = () => {
  const L = WS.lamp;
  return (
    <g>
      <rect x={L.x - 7} y={L.head} width={14} height={WS.pavement + 10 - L.head} fill="#3b4250" stroke={INK} strokeWidth={3} />
      <path d={`M${L.x} ${L.head + 4} Q${L.x + 34} ${L.head - 24} ${L.x + 64} ${L.head + 2}`} fill="none" stroke="#3b4250" strokeWidth={9} />
      <path d={`M${L.x + 46} ${L.head} h38 l-6 18 h-26Z`} fill="#ffe6a0" stroke={INK} strokeWidth={3} />
      <path d={`M${L.x + 50} ${L.head + 18} L${L.x + 80} ${L.head + 18} L${L.x + 190} ${WS.pavement + 20} L${L.x - 60} ${WS.pavement + 20}Z`} fill="#ffe6a0" opacity={0.2} />
    </g>
  );
};

/** The stranger: crimson head, long dark coat to the knees, walking, never looking up. (x, y) the feet. */
export const StrangerWalking: React.FC<{ x: number; y: number; scale: number; pose: Pose; frame: number }> = ({ x, y, scale, pose, frame }) => (
  <g>
    <Figure x={x} y={y} scale={scale} facing={1} pose={pose} head="#D8344F" coat="#3f3346" mouth="flat" look={{ x: 0.7, y: 0.45 }}
      blink={(frame + 11) % 97 < 4} time={frame} />
    <path d={`M${x - 30 * scale} ${y - 112 * scale + 40 * scale} L${x + 34 * scale} ${y - 112 * scale + 40 * scale} L${x + 40 * scale} ${y - 40 * scale} L${x - 40 * scale} ${y - 40 * scale}Z`}
      fill="#3f3346" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export interface WindowStreetProps {
  frame: number;
  mood: MoodName;
  cam: Camera;
  /** The frame each window's band comes on (by windowIndex); default all on long before. */
  onAt?: (i: number) => number;
  /** Coins dropping into every jar. */
  coins?: boolean;
  /** Jars on your sill (a shelf of jars). */
  jars?: number;
  /** The little clock in your window: its minute hand's angle in radians (negative hides it). */
  clock?: number;
  /** The coffee shop's shutter, 0..1, and its paper sign. */
  shut?: number;
  sign?: boolean;
  /** People queueing at the pillow shop. */
  queue?: number;
  /** A beat's own figures (the stranger, a barista), drawn over the street. */
  actors?: React.ReactNode;
  look?: Partial<Look>;
}

/** The hundred-window street on a lit Stage. */
export const WindowStreetScene: React.FC<WindowStreetProps> = ({ frame, mood, cam, onAt = () => -999, coins = true, jars = 1,
  clock = -1, shut = 0, sign = true, queue = 5, actors, look }) => {
  const glows = [
    { x: WS.lamp.x + 66, y: WS.lamp.head + 14, r: 260, color: "#ffe6a0", strength: 0.55 },
    { x: (WS.pillow.door + WS.pillow.to) / 2, y: 870, r: 300, color: "#ffe6a8", strength: 0.45 },
    { x: yourWindow().x, y: yourWindow().y, r: 160, color: "#bfefff", strength: 0.35 },
  ].map((g) => ({ ...g, depth: 1, moods: [mood] }));
  return (
    <LookContext.Provider value={setLook(glows, mood, cam, { dof: 0, ...look })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={
          <>
            <Deep cam={cam} depth={0.15} flat><Sky id="ws" mood={mood} x={-1400} y={-1400} w={4800} h={1700} sunAt={{ x: 400, y: -600 }} /></Deep>
            <Deep cam={cam} depth={1}>
              <Facade frame={frame} mood={mood} onAt={onAt} coins={coins} jars={jars} clock={clock} />
              <Shops mood={mood} shut={shut} sign={sign} />
            </Deep>
          </>
        }
        actors={<><PillowQueue frame={frame} n={queue} /><Lamp />{actors}</>} />
    </LookContext.Provider>
  );
};
