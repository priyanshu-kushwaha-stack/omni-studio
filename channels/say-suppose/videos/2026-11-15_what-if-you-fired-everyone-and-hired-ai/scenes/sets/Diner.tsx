// Your diner across the road from the car plant, side on, on the kit's SetDef contract (drawn for REF in paper layers
// at depths, lit by the mood). Far to near: the road and the car plant through the long window (sawtooth sheds with lit
// window bands after dark, the chimney, the gate, a steam whistle; a river of overalls crossing to your door at lunch);
// the back wall in the thumbnail's palette (the window, the door with its chime, the specials board over the pie case,
// the clock over the grill, the hood); the grill line (pie case, coffee urn, the flat-top grill, hot or cold); pendant
// lamps; then, in the actors' slot, the robot cooks (0-4) behind the counter, the long counter (chrome top, teal front,
// plates, the till) and the row of teal stools in front of it, which runs on past both edges of the frame: "forty
// stools" is the row the cameras show and the rest implied. Staff stand behind the counter (`behind: true`); customers
// sit on the stools (seat spots). No AI images.
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Figure } from "@whatif/kit/rig/Figure";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Deep, noise, OUTSIDE, REF, seat, Sky, type SetDef, type SetLight, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { MARCO, OVERALLS, WAITRESS, WORKER_HEADS, YOU, type Person } from "../parts/Cast";
import { Dressed } from "../parts/Wear";
import { COOK_POSE, Robot } from "../parts/Robot";
import { Patty, Pie, PlatedBurger, SmallAppPhone, STEEL, STEEL_DARK, Till, WallClock } from "../parts/Props";

// ---- Geometry (REF coordinates; the depth each piece is drawn at is noted) -----------------------------------------

export const DINER = {
  /** Customer floor top (depth 1): the checker floor runs from here down. */
  floor: 895,
  /** The counter (depth 1, Mid): chrome top at `top`, teal front down to `base`. Runs on past the right edge. */
  counter: { from: 430, to: 3400, top: 790, base: 990 },
  /** Where staff stand behind the counter (feet, hidden by it). */
  staffY: 900,
  /** Stool seat tops and the stools' x (depth 1). stool1..stool9 are in REF; more run on to the right. */
  stoolTop: 905,
  stoolX: (i: number) => 520 + i * 172,
  /** The grill line along the back (depth 0.9): its top, and the flat-top grill's span. */
  grillLine: { from: 290, top: 700, depth: 0.9 },
  grill: { from: 1600, to: 1960 },
  /** The back wall (depth 0.8): the long window, the specials board, the clock, the hood. The door is at depth 1. */
  wallDepth: 0.8,
  window: { x: 560, y: 120, w: 980, h: 380 },
  door: { x: 70, y: 450, w: 200, h: 450 },
  board: { x: 300, y: 150, w: 220, h: 250 },
  clock: { x: 1760, y: 170 },
  /** The till on the counter (depth 1). */
  till: { x: 530, y: 782 },
  /** Robot cooks' x behind the counter (cook1..cook4). */
  cooks: [960, 1180, 1400, 1620],
  /** Pendant lamps (depth 0.95): the till lamp first. */
  lamps: [560, 820, 1180, 1540],
  /** The outside (depth 0.45): the plant across the road. */
  outsideDepth: 0.45,
  gate: { x: 1000, w: 170, base: 410 },
} as const;

const C = DINER.counter;

/** Someone outside, close to the glass (drawn just behind the wall, so the sill hides them below the chest). */
export interface OutsideFigure { who: Person; face?: Expression; x?: number; pose?: Pose; facing?: 1 | -1 }

export interface DinerOptions {
  /** The flat-top grill: hot (glow, patties, a little smoke) or cold (dark, the spatula on its hook). */
  grill: "hot" | "cold";
  /** Robot cooks behind the counter, 0 to 4, at cook1..cook4. */
  robots: number;
  /** The robot cooks flip burgers on `frame` (staggered, or all in step with `sync`). */
  flip: boolean;
  sync: boolean;
  /** Plated burgers on the counter. */
  plates: "none" | "some" | "pile";
  /** Pendant lamps: "auto" follows the mood (off by day, all at dusk and night, only the till lamp in "lamp"). */
  lamps: "auto" | "all" | "till" | "off";
  /** The clock over the grill, in hours (11.83 is ten to twelve). */
  clock: number;
  /** The board over the pie case: chalk specials, a blank frame (for a split-flap counter on top), or none. */
  board: "specials" | "blank" | "none";
  /** The door, 0 shut to 1 open; `chime` the frames since it opened (the bell swings and settles), or -1 still. */
  door: number;
  chime: number;
  /** The plant: its gate 0 shut to 1 open; a whistle's steam 0..1; "dark" shuts the lights after dark. */
  gate: number;
  whistle: number;
  plant: "working" | "dark";
  /** A river of overalls crossing the road from the gate to your door, 0 none to 1 full. Walks on `frame`. */
  crowd: number;
  /** Someone outside the long window, looking in. */
  outside: OutsideFigure | null;
  /** The till's drawer, 0 shut to 1 open with a ping. */
  till: number;
  /** Your phone face up on the counter beside the till (lit). */
  phone: boolean;
}

const night = (mood: MoodName) => OUTSIDE[mood].dark;
const lampsOn = (o: DinerOptions, mood: MoodName): number[] => {
  const mode = o.lamps === "auto" ? (mood === "lamp" ? "till" : mood === "dusk" || mood === "night" ? "all" : "off") : o.lamps;
  return mode === "all" ? [...DINER.lamps] : mode === "till" ? [DINER.lamps[0]] : [];
};

// ---- The outside: road, car plant, gate, whistle, crowd -----------------------------------------------------------

const Plant: React.FC<{ mood: MoodName; frame: number; o: DinerOptions }> = ({ mood, frame, o }) => {
  const dark = night(mood);
  const lit = o.plant === "working" && (dark || mood === "dusk");
  const shed = dark ? "#1d2840" : mood === "dusk" ? "#6e5f86" : "#b98a6e";
  const shedDark = dark ? "#16203a" : mood === "dusk" ? "#5b4e72" : "#8e6552";
  const base = DINER.gate.base;
  const g = DINER.gate;
  // sawtooth sheds either side of the gate
  const teeth = (from: number, to: number) => {
    let d = `M${from} ${base} L${from} ${base - 70}`;
    for (let x = from; x < to; x += 100) d += ` L${x + 100} ${base - 120} L${x + 100} ${base - 70}`;
    return `${d} L${to} ${base - 70} L${to} ${base} Z`;
  };
  const steamUp = (i: number) => ((frame / 40 + i / 4) % 1);
  return (
    <g>
      <path d={teeth(-200, g.x - 30)} fill={shed} />
      <path d={teeth(g.x + g.w + 30, 2600)} fill={shed} />
      {Array.from({ length: 26 }, (_, i) => {
        const x = -170 + i * 104;
        if (x > g.x - 90 && x < g.x + g.w + 40) return null;
        return <rect key={i} x={x} y={base - 52} width={70} height={18} rx={3} fill={lit ? "#f6c768" : dark ? "#26304a" : "#6b5a52"} opacity={lit ? 0.85 : 0.8} />;
      })}
      {/* the chimney and its smoke */}
      <rect x={1380} y={140} width={46} height={base - 140} fill={shedDark} />
      <rect x={1374} y={132} width={58} height={16} fill={shedDark} />
      {o.plant === "working" && [0, 1, 2].map((i) => {
        const p = (frame / 90 + i / 3) % 1;
        return <circle key={i} cx={1403 + p * 120} cy={110 - p * 140} r={20 + p * 34} fill={dark ? "#3a4766" : "#d9dde4"} opacity={0.55 * (1 - p)} />;
      })}
      {/* the whistle on the roof */}
      <rect x={720} y={base - 150} width={14} height={36} fill={shedDark} />
      <rect x={712} y={base - 160} width={30} height={14} rx={4} fill={dark ? "#8a7a5a" : "#c9a45a"} />
      {o.whistle > 0 && [0, 1, 2, 3].map((i) => {
        const p = steamUp(i);
        return <circle key={i} cx={727 + Math.sin(i * 2.1) * 10 * p} cy={base - 168 - p * 110} r={10 + p * 26} fill={PAPER} opacity={0.75 * o.whistle * (1 - p)} />;
      })}
      {/* the gate: posts, a lamp each, a blank sign plate, two leaves that swing open */}
      <rect x={g.x - 30} y={base - 150} width={30} height={150} fill={shedDark} />
      <rect x={g.x + g.w} y={base - 150} width={30} height={150} fill={shedDark} />
      <rect x={g.x - 40} y={base - 176} width={g.w + 80} height={30} rx={4} fill={dark ? "#3a4766" : "#5f6f7c"} />
      <rect x={g.x - 10} y={base - 170} width={g.w + 20} height={18} rx={3} fill={dark ? "#c9a45a" : "#e6cd98"} opacity={0.9} />
      {(dark || mood === "dusk") && [g.x - 15, g.x + g.w + 15].map((x) => <circle key={x} cx={x} cy={base - 160} r={9} fill="#ffe39a" />)}
      {[0, 1].map((side) => {
        const w = (g.w / 2) * (1 - 0.85 * o.gate);
        const x = side === 0 ? g.x : g.x + g.w - w;
        return (
          <g key={side}>
            <rect x={x} y={base - 110} width={w} height={110} fill="none" stroke={dark ? "#4a5878" : "#6b7a88"} strokeWidth={6} />
            {Array.from({ length: 5 }, (_, k) => <line key={k} x1={x + (w * (k + 0.5)) / 5} y1={base - 110} x2={x + (w * (k + 0.5)) / 5} y2={base} stroke={dark ? "#4a5878" : "#6b7a88"} strokeWidth={4} />)}
          </g>
        );
      })}
    </g>
  );
};

/** The river of overalls: small walking figures from the gate across the road toward your door. */
const Crowd: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => {
  const n = Math.round(amount * 26);
  const from = { x: DINER.gate.x + DINER.gate.w / 2, y: DINER.gate.base + 6 };
  const to = { x: 190, y: 720 };
  return (
    <g>
      {Array.from({ length: n }, (_, k) => {
        const u = (frame / 150 + noise(k + 3) * 1.0 + k / n) % 1;
        const lane = (noise(k * 7) - 0.5) * 120;
        const x = from.x + (to.x - from.x) * u + lane * (0.4 + u);
        const y = from.y + (to.y - from.y) * u * u + lane * 0.15;
        const s = 0.2 + 0.16 * u;
        return (
          <Figure key={k} x={x} y={y} scale={s} facing={-1} pose={walkPose(frame * 0.22 + k * 1.3)} head={WORKER_HEADS[k % WORKER_HEADS.length]}
            coat={OVERALLS} look={{ x: 0.6, y: 0 }} time={frame} />
        );
      })}
    </g>
  );
};

const Outside: React.FC<{ mood: MoodName; frame: number; o: DinerOptions }> = ({ mood, frame, o }) => {
  const dark = night(mood);
  return (
    <>
      <Sky id="diner" mood={mood} x={-1400} y={-800} w={4800} h={1210} sunAt={{ x: 640, y: 180 }} />
      <Plant mood={mood} frame={frame} o={o} />
      {/* the far pavement, the road, the near pavement under the window */}
      <rect x={-1400} y={DINER.gate.base} width={4800} height={18} fill={dark ? "#2a3048" : "#c9bfa8"} />
      <rect x={-1400} y={DINER.gate.base + 18} width={4800} height={190} fill={dark ? "#20243a" : "#5a5f68"} />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1300 + i * 160} y={DINER.gate.base + 100} width={80} height={7} rx={3} fill={PAPER} opacity={dark ? 0.35 : 0.8} />)}
      <rect x={-1400} y={DINER.gate.base + 208} width={4800} height={900} fill={dark ? "#3a3f52" : "#cfc4ab"} />
      {o.crowd > 0 && <Crowd frame={frame} amount={o.crowd} />}
    </>
  );
};

// ---- The back wall, the grill line, the lamps ----------------------------------------------------------------------

const wallColors = (mood: MoodName) => night(mood)
  ? { wall: "#33474f", trim: "#16524d", tile: "#2c4248", tile2: "#24373d", frame: "#2b3a44" }
  : { wall: "#ecdcbc", trim: TEAL, tile: "#f4efe4", tile2: "#bfe0d8", frame: "#2b3a44" };

const Wall: React.FC<{ mood: MoodName; o: DinerOptions }> = ({ mood, o }) => {
  const k = wallColors(mood);
  const w = DINER.window, b = DINER.board;
  const dark = night(mood);
  return (
    <g>
      {/* the wall, with the window cut out of it */}
      <path fillRule="evenodd" fill={k.wall}
        d={`M-1400 -800 H3400 V1000 H-1400 Z M${w.x} ${w.y} h${w.w} v${w.h} h${-w.w} Z`} />
      {/* the backsplash tiles below the window and the teal trim */}
      <rect x={DINER.grillLine.from - 40} y={w.y + w.h + 30} width={3400} height={240} fill={k.tile} />
      {Array.from({ length: 70 }, (_, i) => (
        <rect key={i} x={DINER.grillLine.from - 40 + i * 50} y={w.y + w.h + 30 + (i % 2) * 40} width={50} height={40} fill={k.tile2} />
      ))}
      <rect x={-1400} y={w.y + w.h + 18} width={4800} height={18} fill={k.trim} />
      <rect x={-1400} y={-800} width={4800} height={880} fill={k.wall} />
      <rect x={-1400} y={70} width={4800} height={14} fill={k.trim} />
      {/* the window: frame, mullions, sill, the glass's sheen */}
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="none" stroke={k.frame} strokeWidth={18} />
      {[w.x + w.w / 3, w.x + (2 * w.w) / 3].map((x) => <rect key={x} x={x - 9} y={w.y} width={18} height={w.h} fill={k.frame} />)}
      <rect x={w.x - 20} y={w.y + w.h - 2} width={w.w + 40} height={20} rx={4} fill={STEEL} stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${w.x + 60 + i * 330} ${w.y + w.h - 20} l120 -200 h34 l-120 200Z`} fill="#fff" opacity={dark ? 0.05 : 0.14} />)}
      {/* a neon cup in the window's corner after dark (no words) */}
      {dark && (
        <g transform={`translate(${w.x + w.w - 110} ${w.y + 70})`} stroke="#ff8fa8" strokeWidth={7} fill="none" strokeLinecap="round">
          <path d="M-36 0 H30 Q30 52 -3 52 Q-36 52 -36 0Z" /><path d="M30 10 Q54 12 50 30 Q46 42 28 38" />
          <path d="M-18 -14 q8 -12 0 -24 M2 -14 q8 -12 0 -24" stroke="#ffe39a" />
        </g>
      )}
      {/* the specials board over the pie case */}
      {o.board !== "none" && (
        <g>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill={o.board === "blank" ? "#1f2328" : "#2f4a3e"} stroke="#6b4b3a" strokeWidth={10} />
          {o.board === "specials" && [0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={b.x + 34} cy={b.y + 44 + i * 52} r={11} fill={["#f2b632", "#e2a85a", "#d8344f", "#9fd8a8"][i]} />
              <rect x={b.x + 56} y={b.y + 37 + i * 52} width={100 - (i * 23) % 40} height={12} rx={6} fill={PAPER} opacity={0.8} />
              <rect x={b.x + b.w - 52} y={b.y + 37 + i * 52} width={30} height={12} rx={6} fill="#f2b632" opacity={0.85} />
            </g>
          ))}
        </g>
      )}
      {/* the clock over the grill, and the hood */}
      <WallClock x={DINER.clock.x} y={DINER.clock.y} hours={o.clock} />
      <path d={`M${DINER.grill.from - 20} 300 H${DINER.grill.to + 20} L${DINER.grill.to - 20} 380 H${DINER.grill.from + 20} Z`} fill={STEEL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={DINER.grill.from + 20} y={378} width={DINER.grill.to - DINER.grill.from - 40} height={14} fill={STEEL_DARK} />
      {/* the ticket rail under the window */}
      <rect x={w.x + 80} y={w.y + w.h + 56} width={w.w - 160} height={8} rx={3} fill={STEEL_DARK} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={w.x + 120 + i * 130 + (noise(i) * 30)} y={w.y + w.h + 60} width={44} height={58} rx={2} fill={PAPER}
          transform={`rotate(${(noise(i + 9) - 0.5) * 10} ${w.x + 142 + i * 130} ${w.y + w.h + 60})`} opacity={i < 4 ? 1 : 0} />
      ))}
    </g>
  );
};

/** The door, at the actors' depth so the door spot stays in its doorway under every camera: the frame, the doorway
 *  (the pavement and the road outside), the leaf narrowing as it swings open, its glass, the chime bell over it. */
const Door: React.FC<{ mood: MoodName; o: DinerOptions }> = ({ mood, o }) => {
  const d = DINER.door;
  const k = wallColors(mood);
  const dark = night(mood);
  const swing = o.chime >= 0 ? Math.sin(o.chime * 0.55) * 26 * Math.exp(-o.chime / 22) : 0;
  const openW = d.w * (1 - 0.82 * o.door);
  const sky = OUTSIDE[mood].sky;
  return (
    <g>
      <rect x={d.x} y={d.y} width={d.w} height={d.h * 0.4} fill={sky[1]} />
      <rect x={d.x} y={d.y + d.h * 0.4} width={d.w} height={d.h * 0.25} fill={dark ? "#20243a" : "#5a5f68"} />
      <rect x={d.x} y={d.y + d.h * 0.65} width={d.w} height={d.h * 0.35} fill={dark ? "#3a3f52" : "#cfc4ab"} />
      <rect x={d.x - 14} y={d.y - 14} width={d.w + 28} height={d.h + 14} fill="none" stroke={k.frame} strokeWidth={14} />
      <g>
        <rect x={d.x + openW * 0.16} y={d.y + 40} width={openW * 0.68} height={d.h * 0.45} fill="#cfe3ea" opacity={dark ? 0.25 : 0.35} />
        <path fillRule="evenodd" fill={TEAL} stroke={INK} strokeWidth={5}
          d={`M${d.x} ${d.y} h${openW} v${d.h} h${-openW} Z M${d.x + openW * 0.16} ${d.y + 40} h${openW * 0.68} v${d.h * 0.45} h${-openW * 0.68} Z`} />
        <rect x={d.x + openW - 26 * (openW / d.w)} y={d.y + d.h * 0.55} width={12 * (openW / d.w) + 4} height={40} rx={4} fill={STEEL} stroke={INK} strokeWidth={3} />
      </g>
      <g transform={`rotate(${swing} ${d.x + d.w / 2} ${d.y - 40})`}>
        <line x1={d.x + d.w / 2} y1={d.y - 40} x2={d.x + d.w / 2} y2={d.y - 18} stroke={INK} strokeWidth={4} />
        <path d={`M${d.x + d.w / 2 - 18} ${d.y - 2} Q${d.x + d.w / 2 - 16} ${d.y - 26} ${d.x + d.w / 2} ${d.y - 26} Q${d.x + d.w / 2 + 16} ${d.y - 26} ${d.x + d.w / 2 + 18} ${d.y - 2} Z`}
          fill="#e0b84a" stroke={INK} strokeWidth={4} />
        <circle cx={d.x + d.w / 2} cy={d.y + 2} r={5} fill={INK} />
      </g>
      <rect x={d.x + d.w / 2 - 30} y={d.y - 52} width={60} height={10} rx={4} fill={k.frame} />
    </g>
  );
};

const GrillLine: React.FC<{ mood: MoodName; frame: number; o: DinerOptions }> = ({ mood, frame, o }) => {
  const g = DINER.grillLine, gr = DINER.grill;
  const hot = o.grill === "hot";
  const dark = night(mood);
  return (
    <g>
      <rect x={g.from} y={g.top} width={3400} height={300} fill={dark ? "#26343c" : "#7d8d99"} />
      <rect x={g.from - 6} y={g.top - 12} width={3410} height={20} fill={STEEL} stroke={INK} strokeWidth={5} />
      {/* the pie case under the board */}
      <path d={`M${DINER.board.x - 4} ${g.top - 12} V${g.top - 110} Q${DINER.board.x + DINER.board.w / 2} ${g.top - 170} ${DINER.board.x + DINER.board.w + 4} ${g.top - 110} V${g.top - 12}Z`}
        fill="#dff2f4" opacity={0.55} stroke={INK} strokeWidth={4} />
      <Pie x={DINER.board.x + 60} y={g.top - 16} s={0.75} />
      <Pie x={DINER.board.x + 160} y={g.top - 16} s={0.75} slice />
      <line x1={DINER.board.x} y1={g.top - 74} x2={DINER.board.x + DINER.board.w} y2={g.top - 74} stroke={INK} strokeWidth={3} opacity={0.4} />
      {/* the coffee urn and a stack of clean plates */}
      <rect x={640} y={g.top - 120} width={70} height={108} rx={14} fill={STEEL} stroke={INK} strokeWidth={5} />
      <rect x={706} y={g.top - 54} width={22} height={10} fill={INK} />
      {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={800} cy={g.top - 16 - i * 9} rx={46} ry={9} fill={PAPER} stroke={INK} strokeWidth={3} />)}
      {/* the flat-top grill */}
      <rect x={gr.from} y={g.top - 20} width={gr.to - gr.from} height={14} fill={hot ? "#3a2a22" : "#2a2d33"} stroke={INK} strokeWidth={4} />
      {hot && <rect x={gr.from + 6} y={g.top - 26} width={gr.to - gr.from - 12} height={6} fill="#ff9a4a" opacity={0.7} />}
      {hot && [0, 1, 2].map((i) => <Patty key={i} x={gr.from + 70 + i * 110} y={g.top - 20} s={0.8} done={(i + 1) / 3} />)}
      {hot && [0, 1, 2, 3].map((i) => {
        const p = (frame / 50 + i / 4) % 1;
        return <circle key={i} cx={gr.from + 70 + i * 80 + Math.sin(i * 3) * 10} cy={g.top - 40 - p * 160} r={12 + p * 24} fill="#e9e4dc" opacity={0.35 * (1 - p)} />;
      })}
      {/* the spatula on its hook when the grill is cold */}
      {!hot && (
        <g>
          <circle cx={gr.to - 60} cy={g.top - 150} r={6} fill={INK} />
          <rect x={gr.to - 64} y={g.top - 150} width={8} height={70} rx={3} fill="#3a2a22" />
          <rect x={gr.to - 82} y={g.top - 84} width={44} height={40} rx={4} fill="#c9d3da" stroke={INK} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

const Lamps: React.FC<{ on: number[] }> = ({ on }) => (
  <g>
    {DINER.lamps.map((x, i) => {
      const lit = on.includes(x);
      const y = i === 0 ? 300 : 260;
      return (
        <g key={x}>
          <line x1={x} y1={-400} x2={x} y2={y - 40} stroke={INK} strokeWidth={4} />
          {lit && <path d={`M${x - 46} ${y} L${x - 180} ${y + 420} H${x + 180} L${x + 46} ${y}Z`} fill="#ffe6a0" opacity={0.1} />}
          <path d={`M${x - 16} ${y - 44} H${x + 16} L${x + 50} ${y} H${x - 50}Z`} fill={TEAL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={x} cy={y} rx={24} ry={8} fill={lit ? "#fff4c8" : "#8a8a80"} />
        </g>
      );
    })}
  </g>
);

const Floor: React.FC<{ mood: MoodName }> = ({ mood }) => {
  const dark = night(mood);
  const rows = [0, 34, 74, 122, 180, 250];
  const cells: string[] = [];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let i = 0; i < 70; i++) {
      if ((i + r) % 2) continue;
      cells.push(`M${-1400 + i * 70 - r * 6} ${DINER.floor + rows[r]}h70v${rows[r + 1] - rows[r]}h-70Z`);
    }
  }
  return (
    <g>
      <rect x={-1400} y={DINER.floor} width={4800} height={800} fill={dark ? "#8f8d86" : "#ece6d8"} />
      <path d={cells.join("")} fill={dark ? "#1c1f24" : "#2b2f36"} />
    </g>
  );
};

const Back: React.FC<SetProps<DinerOptions>> = ({ cam, mood, frame, options: o }) => (
  <>
    <Deep cam={cam} depth={DINER.outsideDepth} flat><Outside mood={mood} frame={frame} o={o} /></Deep>
    {o.outside && (
      <Deep cam={cam} depth={0.7}>
        <Dressed x={o.outside.x ?? 1260} y={650} scale={0.95} facing={o.outside.facing ?? -1} pose={o.outside.pose ?? STAND} time={frame}
          {...(o.outside.face ?? EXPRESSIONS.sad)} {...o.outside.who} />
      </Deep>
    )}
    <Deep cam={cam} depth={DINER.wallDepth} flat><Wall mood={mood} o={o} /></Deep>
    <Deep cam={cam} depth={DINER.grillLine.depth}><GrillLine mood={mood} frame={frame} o={o} /></Deep>
    <Deep cam={cam} depth={0.95}><Lamps on={lampsOn(o, mood)} /></Deep>
    <Deep cam={cam} depth={1}><Floor mood={mood} /><Door mood={mood} o={o} /></Deep>
  </>
);

// ---- The actors' slot: robot cooks, the counter, the stools --------------------------------------------------------

/** Where the plated burgers sit on the counter (x, and a lift for the pile's upper rows). */
const PLATES: Record<DinerOptions["plates"], [number, number][]> = {
  none: [],
  some: [[900, 0], [1240, 0], [1560, 0], [1820, 0]],
  pile: [[880, 0], [1010, 0], [945, -46], [1140, 0], [1270, 0], [1205, -46], [1400, 0], [1530, 0], [1465, -46], [1660, 0], [1790, 0], [1725, -46], [1335, -92]],
};

/** The counter and the stools (and the robot cooks behind it); exported so a custom stage can draw it. */
export const DinerMid: React.FC<SetProps<DinerOptions>> = ({ frame, options: o }) => {
  const n = Math.max(0, Math.min(4, Math.round(o.robots)));
  return (
    <g>
      {DINER.cooks.slice(0, n).map((x, i) => (
        <Robot key={x} x={x} y={DINER.staffY} scale={0.97} pose={o.flip ? COOK_POSE : { ...COOK_POSE, armF: [35, 45] }} held="spatula"
          toolAngle={o.flip ? -18 : 10} flip={o.flip ? frame / 34 + (o.sync ? 0 : i * 0.27) : undefined} burger={!o.flip} frame={frame} />
      ))}
      {/* the counter: chrome top, teal front with grooves, steel kick plate; a rounded end by the till */}
      <path d={`M${C.from + 40} ${C.top} H${C.to} V${C.base} H${C.from + 40} Q${C.from} ${C.base} ${C.from} ${C.base - 40} V${C.top + 40} Q${C.from} ${C.top} ${C.from + 40} ${C.top}Z`}
        fill="#1a6f68" stroke={INK} strokeWidth={6} />
      <path d={Array.from({ length: 36 }, (_, i) => `M${C.from + 60 + i * 84} ${C.top + 20}V${C.base - 24}`).join("")} stroke="#155a54" strokeWidth={8} />
      <rect x={C.from} y={C.base - 22} width={C.to - C.from} height={22} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      <rect x={C.from - 10} y={C.top - 14} width={C.to - C.from + 20} height={30} rx={12} fill="#e6ecef" stroke={INK} strokeWidth={6} />
      {PLATES[o.plates].map(([x, dy], i) => <PlatedBurger key={i} x={x} y={C.top - 12 + dy} />)}
      <Till x={DINER.till.x} y={DINER.till.y} s={0.72} ping={o.till} />
      {o.phone && <g transform={`translate(${DINER.till.x + 120} ${C.top - 13})`}><SmallAppPhone faceUp s={1.4} /></g>}
      {/* the stools: a row that runs out of frame both ways along the counter */}
      {Array.from({ length: 18 }, (_, i) => {
        const x = DINER.stoolX(i);
        const t = DINER.stoolTop;
        return (
          <g key={i}>
            <rect x={x - 7} y={t + 20} width={14} height={1040 - t - 20} fill={STEEL} stroke={INK} strokeWidth={3} />
            <ellipse cx={x} cy={1042} rx={46} ry={10} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
            <ellipse cx={x} cy={1000} rx={30} ry={7} fill="none" stroke={STEEL} strokeWidth={6} />
            <ellipse cx={x} cy={t + 12} rx={66} ry={20} fill="#26343c" stroke={INK} strokeWidth={5} />
            <ellipse cx={x} cy={t + 4} rx={66} ry={18} fill={TEAL} stroke={INK} strokeWidth={5} />
          </g>
        );
      })}
    </g>
  );
};

/** In lamp light the room beyond the till lamp falls dark. */
const Front: React.FC<SetProps<DinerOptions>> = ({ cam, mood, options: o }) => {
  const on = lampsOn(o, mood);
  if (!(on.length === 1 && night(mood))) return null;
  const x = DINER.lamps[0];
  return (
    <Deep cam={cam} depth={1} flat>
      <defs>
        <radialGradient id="diner-lamp-dark" gradientUnits="userSpaceOnUse" cx={x + 80} cy={560} r={1100}>
          <stop offset="0.28" stopColor="#05060a" stopOpacity={0} />
          <stop offset="1" stopColor="#05060a" stopOpacity={0.72} />
        </radialGradient>
      </defs>
      <rect x={-1400} y={-800} width={4800} height={2400} fill="url(#diner-lamp-dark)" />
    </Deep>
  );
};

const lights = (o: DinerOptions): SetLight[] => [
  ...DINER.lamps.map((x, i) => ({
    x, y: i === 0 ? 320 : 280, depth: 0.95, r: i === 0 ? 560 : 460, color: "#ffe6a0", strength: 0.32,
    moods: (o.lamps === "off" ? [] : o.lamps === "all" ? ["morning", "day", "dusk", "night", "lamp"] : o.lamps === "till" ? (i === 0 ? ["morning", "day", "dusk", "night", "lamp"] : [])
      : i === 0 ? ["dusk", "night", "lamp"] : ["dusk", "night"]) as MoodName[],
  })),
  ...(o.grill === "hot" ? [{ x: 1780, y: 640, depth: 0.9, r: 520, color: "#ffb45a", strength: 0.38, moods: ["morning", "day", "dusk", "night", "lamp"] as MoodName[] }] : []),
  { x: 1050, y: 300, depth: 0.75, r: 700, color: "#fff4d6", strength: 0.22, moods: ["morning", "day"] },
];

const stoolSpots = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`stool${i + 1}`, seat(DINER.stoolX(i), DINER.stoolTop, 0.95, -1)]));
const staff = (x: number, facing: 1 | -1 = 1) => ({ x, y: DINER.staffY, scale: 1, facing });

export const diner: SetDef<DinerOptions> = {
  name: "diner",
  about: "your diner across from the car plant: long window onto the plant, counter, grill, till, robot cooks, a row of teal stools",
  spots: {
    /** You at the till, behind the counter's left end. */
    till: staff(670, 1),
    /** The cook at the flat-top grill (right). */
    grill: staff(1760, -1),
    /** The waitress at the pass, mid-counter. */
    pass: staff(1080, -1),
    cook1: staff(DINER.cooks[0]), cook2: staff(DINER.cooks[1]), cook3: staff(DINER.cooks[2]), cook4: staff(DINER.cooks[3]),
    ...stoolSpots,
    /** In the doorway (left), coming in. */
    door: { x: 170, y: 905, scale: 1, facing: 1 },
    /** On the floor by the door and the counter's end, full length. */
    floor: { x: 320, y: 1050, scale: 1.12, facing: 1 },
    /** In front of the stools, nearest the camera (a waitress working the room). */
    front: { x: 1000, y: 1078, scale: 1.18, facing: -1 },
  },
  cameras: {
    wide: REF,
    /** You at the till, the first stools, the door's edge. */
    counter: { x: 760, y: 680, zoom: 1.6 },
    /** The grill, the clock over it, the cook. */
    grill: { x: 1600, y: 530, zoom: 1.7 },
    /** The line of robot cooks behind the counter. */
    cooks: { x: 1290, y: 590, zoom: 1.45 },
    /** Low along the stools. */
    stools: { x: 1180, y: 850, zoom: 1.5 },
    /** The long window and the plant across the road. */
    window: { x: 1050, y: 330, zoom: 1.75 },
    /** The door and its chime. */
    door: { x: 240, y: 660, zoom: 1.7 },
  },
  lights,
  defaults: {
    grill: "hot", robots: 0, flip: true, sync: false, plates: "none", lamps: "auto", clock: 11.83, board: "specials", door: 0, chime: -1,
    gate: 0, whistle: 0, plant: "working", crowd: 0, outside: null, till: 0, phone: false,
  },
  Back,
  Mid: DinerMid,
  Front,
  example: {
    camera: "wide",
    options: { robots: 1, plates: "some" },
    cast: [
      { spot: "till", who: { ...YOU, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy, behind: true },
      { spot: "grill", who: { ...MARCO }, face: EXPRESSIONS.neutral, behind: true },
      { spot: "pass", who: { ...WAITRESS }, face: EXPRESSIONS.sceptical, behind: true },
      { spot: "stool2", who: { head: WORKER_HEADS[0], coat: OVERALLS }, face: EXPRESSIONS.happy },
      { spot: "stool4", who: { head: WORKER_HEADS[3], coat: OVERALLS }, face: EXPRESSIONS.neutral },
    ],
  },
};
