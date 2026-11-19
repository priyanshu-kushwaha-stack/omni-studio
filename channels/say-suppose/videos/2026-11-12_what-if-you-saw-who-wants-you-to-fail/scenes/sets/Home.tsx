// The small flat (scene_plan.md, "Shared sets"; owner: builder C). One room, side on, drawn for the REF camera
// (sets/common.tsx), wider than the frame: left to right
//
//   the front door (a steel flat door with a keypad, the shoe step in front), the window, the dining table under one
//   pendant lamp (her chair at its left end), the low counter behind the table with the kimchi jar of paintbrushes
//   standing bristles-up at its right end, right beside the fridge (your letter taped on it, a calendar pinned beside
//   it with her own letter under the calendar), a clock, and the doorway to the hall (x past 1690, outside REF).
//
// Usage: back={<HomeBack cam={cam} mood="lamp" frame={frame} />}, and in the actors' slot <HomeTable /> over anyone
// seated (and <Chair> from the kit at HOME.chair before them). Props of the fridge: `calendar` false leaves it off (the
// beat draws it in a hand with <Calendar>), `yours` moves or hides your letter, `hers` "fresh" is her letter six years
// ago. `door` opens the front door (0..1). The jar alone, big, for inserts: insert(HOME.jar.x, HOME.jar.y - 90, 4).
// Typical cameras: the room REF; the table { x: 760, y: 640, zoom: 1.7 }; the fridge { x: 1290, y: 560, zoom: 2.2 };
// the kitchen and the doorway { x: 1450, y: 560, zoom: 1.05 }; the front door { x: 330, y: 600, zoom: 1.6 }.
import { Chair, Floor, Window } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { Deep } from "./common";

export { Chair };

/** Anchors, in world units (= REF screen pixels at the actors' depth). */
export const HOME = {
  /** Feet line (people at scale about 1.15). */
  floor: 940,
  /** The front door: opening centre x, width, top. Someone in it stands at (x, floor). */
  frontDoor: { x: 220, w: 220, top: 330 },
  /** Where a dropped bag sits (base centre). */
  bag: { x: 430, y: 940 },
  window: { x: 470, y: 300, w: 230, h: 230 },
  /** The table: span and top. Draw <HomeTable/> in the actors' slot. */
  table: { from: 830, to: 1190, top: 790 },
  /** Her chair at the table's left end, facing right: the chair's x and seat top (figure y = seatedY(seatTop, s)). */
  chair: { x: 772, seatTop: 876 },
  /** Her bowl on the table. */
  bowl: { x: 890, y: 790 },
  /** The pendant lamp: the bottom centre of its shade (the bulb). */
  lamp: { x: 1000, y: 352 },
  /** The low counter behind the table. */
  counter: { from: 860, to: 1140, top: 700 },
  /** The kimchi jar of brushes: its base centre on the counter, beside the fridge. */
  jar: { x: 1088, y: 686 },
  /** The fridge: left and right edges, top, and the line between freezer and main door. */
  fridge: { from: 1145, to: 1440, top: 250, split: 432 },
  /** Your letter on the fridge (bottom centre, Letter scale LETTER_S), the calendar's centre, her letter (under it). */
  yours: { x: 1236, y: 768, tilt: -5 },
  calendar: { x: 1370, y: 700 },
  hers: { x: 1370, y: 768, tilt: 3 },
  /** Where she tapes yours beside hers (Two Letters). */
  beside: { x: 1290, y: 768, tilt: 0 },
  /** The clock on the wall. */
  clock: { x: 1560, y: 330 },
  /** The doorway to the hall: centre x, width, top. Someone in it stands at (x, floor). */
  doorway: { x: 1790, w: 200, top: 300 },
  /** Standing places: you in the kitchen facing the doorway; her at the fridge (facing it); you in the doorway. */
  spots: {
    kitchen: { x: 1520, y: 940 },
    fridge: { x: 1490, y: 940 },
    doorway: { x: 1790, y: 940 },
    inside: { x: 430, y: 940 },
  },
} as const;

/** The letters on the fridge are drawn at this scale. */
export const LETTER_S = 0.62;

/** Morning light or the lamp: which practicals are on. */
const lampOn = (mood: MoodName) => mood === "lamp" || mood === "night" || mood === "dusk";

/** The kimchi jar of paintbrushes: a glazed brown onggi with a finger-drawn wave, seven brushes bristles-up, their tips
 *  dry with old paint. Base centre at (x, y). */
export const BrushJar: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const brushes = [
    { dx: -26, a: -14, len: 150, wood: "#c98f5e", tip: TEAL },
    { dx: -16, a: -7, len: 172, wood: "#2f3340", tip: CRIMSON },
    { dx: -6, a: -2, len: 140, wood: "#b5553a", tip: MUSTARD },
    { dx: 4, a: 3, len: 182, wood: "#c98f5e", tip: "#3d6fb0" },
    { dx: 13, a: 8, len: 156, wood: "#2f3340", tip: "#7fc29b" },
    { dx: 22, a: 13, len: 134, wood: "#d9b48a", tip: "#e6a0a0" },
    { dx: 0, a: -10, len: 120, wood: "#8a5c3b", tip: "#f3e9d7" },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {brushes.map((b, i) => (
        <g key={i} transform={`translate(${b.dx} -70) rotate(${b.a})`}>
          <rect x={-4} y={-b.len} width={8} height={b.len} rx={3} fill={b.wood} stroke={INK} strokeWidth={2.5} />
          <rect x={-5} y={-b.len - 12} width={10} height={16} rx={2} fill="#b8bec8" stroke={INK} strokeWidth={2.5} />
          <path d={`M-5 ${-b.len - 12} Q-7 ${-b.len - 34} 0 ${-b.len - 46} Q7 ${-b.len - 34} 5 ${-b.len - 12}Z`} fill="#e7d3b1" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={`M-4 ${-b.len - 30} Q0 ${-b.len - 48} 4 ${-b.len - 30} Q3 ${-b.len - 40} 0 ${-b.len - 46} Q-3 ${-b.len - 40} -4 ${-b.len - 30}Z`} fill={b.tip} />
        </g>
      ))}
      {/* the onggi */}
      <path d="M-34 -84 Q-62 -60 -54 -24 Q-48 0 -26 0 H26 Q48 0 54 -24 Q62 -60 34 -84Z" fill="#6b3a22" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-38} y={-94} width={76} height={14} rx={6} fill="#5a2e1a" stroke={INK} strokeWidth={4} />
      <path d="M-46 -46 Q-30 -56 -14 -46 Q2 -36 18 -46 Q34 -56 48 -46" fill="none" stroke="#9a5a36" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M-40 -64 Q-36 -40 -40 -18" fill="none" stroke="#a8683f" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

/** The calendar: a crimson month bar (no lettering), a grid of days, a pin. Centre at (x, y). */
export const Calendar: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-58} y={-84} width={124} height={176} rx={4} fill="#000" opacity={0.25} transform="translate(5 6)" />
    <rect x={-62} y={-88} width={124} height={176} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={-62} y={-88} width={124} height={44} fill={CRIMSON} stroke={INK} strokeWidth={4} />
    {Array.from({ length: 20 }, (_, i) => (
      <rect key={i} x={-52 + (i % 5) * 21} y={-34 + Math.floor(i / 5) * 28} width={16} height={20} rx={2} fill={i === 13 ? "#f2b632" : "#d9ccb2"} />
    ))}
    <circle cx={0} cy={-80} r={8} fill={TEAL} stroke={INK} strokeWidth={3} />
  </g>
);

/** A strip of tape. */
const Tape: React.FC<{ x: number; y: number; tilt?: number; w?: number }> = ({ x, y, tilt = 0, w = 44 }) => (
  <rect x={x - w / 2} y={y - 8} width={w} height={16} fill="#f3eccf" opacity={0.85} stroke="#cfc3a2" strokeWidth={2} transform={`rotate(${tilt} ${x} ${y})`} />
);

/** A letter taped to the fridge (bottom centre at x, y). `tapes` 1 or 2 strips. */
export const TapedLetter: React.FC<{ x: number; y: number; tilt?: number; yellowed?: boolean; tapes?: number }> = ({ x, y, tilt = 0, yellowed, tapes = 1 }) => (
  <g>
    <Letter x={x} y={y} scale={LETTER_S} tilt={tilt} yellowed={yellowed} />
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <Tape x={x + 2} y={y - 94} tilt={-6} />
      {tapes > 1 && <Tape x={x + 2} y={y - 4} tilt={5} />}
    </g>
  </g>
);

/** The fridge, front on, with what is on it. */
const Fridge: React.FC<{ calendar: boolean; yours: { x: number; y: number; tilt: number; tapes?: number } | null; hers: "yellowed" | "fresh" }> = ({
  calendar, yours, hers,
}) => {
  const f = HOME.fridge;
  return (
    <g>
      <rect x={f.from + 10} y={f.top + 12} width={f.to - f.from} height={HOME.floor - f.top - 12} rx={20} fill="#000" opacity={0.22} />
      <rect x={f.from} y={f.top} width={f.to - f.from} height={HOME.floor - f.top - 6} rx={20} fill="#dfe9e4" stroke={INK} strokeWidth={7} />
      <line x1={f.from} y1={f.split} x2={f.to} y2={f.split} stroke={INK} strokeWidth={6} />
      <rect x={f.from + 22} y={f.split - 120} width={14} height={84} rx={7} fill="#aab6b0" stroke={INK} strokeWidth={3} />
      <rect x={f.from + 22} y={f.split + 30} width={14} height={140} rx={7} fill="#aab6b0" stroke={INK} strokeWidth={3} />
      <rect x={f.from + 18} y={HOME.floor - 40} width={f.to - f.from - 36} height={20} rx={6} fill="#c7d3cd" />
      {/* magnets */}
      <circle cx={f.from + 80} cy={f.top + 60} r={13} fill={MUSTARD} stroke={INK} strokeWidth={3} />
      <rect x={f.from + 170} y={f.top + 46} width={44} height={30} rx={6} fill="#7fc29b" stroke={INK} strokeWidth={3} />
      {/* her letter, then the calendar over it, then yours */}
      <TapedLetter x={HOME.hers.x} y={HOME.hers.y} tilt={HOME.hers.tilt} yellowed={hers === "yellowed"} tapes={hers === "yellowed" ? 2 : 1} />
      {calendar && <Calendar x={HOME.calendar.x} y={HOME.calendar.y} />}
      {yours && <TapedLetter x={yours.x} y={yours.y} tilt={yours.tilt} tapes={yours.tapes} />}
    </g>
  );
};

/** The pendant lamp: cord, a paper cone shade, the bulb glowing when `on`. */
const Lamp: React.FC<{ on: boolean; frame: number }> = ({ on, frame }) => {
  const { x, y } = HOME.lamp;
  const sway = Math.sin(frame / 70) * 1.2;
  return (
    <g transform={`rotate(${sway} ${x} -400)`}>
      <line x1={x} y1={-400} x2={x} y2={y - 70} stroke={INK} strokeWidth={4} />
      {on && <path d={`M${x - 70} ${y} L${x - 330} ${HOME.table.top} H${x + 330} L${x + 70} ${y}Z`} fill="#ffd89a" opacity={0.13} />}
      <path d={`M${x - 26} ${y - 72} L${x + 26} ${y - 72} L${x + 76} ${y} L${x - 76} ${y}Z`} fill={on ? "#f6dcab" : "#e8dcc4"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={x} cy={y + 2} rx={30} ry={9} fill={on ? "#fff4cf" : "#bdb39f"} />
    </g>
  );
};

/** The steel front door with its keypad; `open` 0..1 swings it in (the panel narrows to the hinge at the left). What
 *  shows through is the landing: a concrete wall and a light. */
const FrontDoor: React.FC<{ open: number; dark: boolean }> = ({ open, dark }) => {
  const d = HOME.frontDoor;
  const l = d.x - d.w / 2;
  const h = HOME.floor - d.top;
  const pw = d.w * (1 - open * 0.82);
  return (
    <g>
      <rect x={l - 22} y={d.top - 22} width={d.w + 44} height={h + 22} fill="#8a7a68" stroke={INK} strokeWidth={6} />
      <rect x={l} y={d.top} width={d.w} height={h} fill={dark ? "#3b3a48" : "#cbc6b8"} />
      <rect x={l + 30} y={d.top + 40} width={d.w - 60} height={h - 120} fill={dark ? "#4a485a" : "#dcd6c6"} />
      <circle cx={d.x + 30} cy={d.top + 70} r={20} fill={dark ? "#ffe39a" : "#fff8e0"} opacity={dark ? 0.9 : 0.7} />
      {open > 0 && <path d={`M${l} ${HOME.floor} V${d.top}`} stroke={INK} strokeWidth={4} />}
      <g>
        <rect x={l} y={d.top} width={pw} height={h} fill="#7d6a5e" stroke={INK} strokeWidth={5} />
        <rect x={l + pw * 0.12} y={d.top + 30} width={pw * 0.76} height={h * 0.36} rx={6} fill="none" stroke="#6a594e" strokeWidth={5} />
        <rect x={l + pw * 0.12} y={d.top + 50 + h * 0.36} width={pw * 0.76} height={h * 0.44} rx={6} fill="none" stroke="#6a594e" strokeWidth={5} />
        {open < 0.6 && (
          <g>
            <rect x={l + pw - 46} y={d.top + h * 0.42} width={30} height={52} rx={5} fill="#23252b" />
            <rect x={l + pw - 42} y={d.top + h * 0.42 + 6} width={22} height={14} rx={2} fill="#5aa8a0" opacity={0.7} />
            <rect x={l + pw - 54} y={d.top + h * 0.56} width={40} height={10} rx={5} fill="#c9ced6" stroke={INK} strokeWidth={3} />
          </g>
        )}
      </g>
      {/* the shoe step and two pairs of shoes */}
      <rect x={l - 40} y={HOME.floor - 14} width={d.w + 120} height={20} fill="#9a9a94" stroke={INK} strokeWidth={4} />
      <ellipse cx={l + d.w + 40} cy={HOME.floor - 20} rx={26} ry={9} fill="#3d6fb0" />
      <ellipse cx={l + d.w + 62} cy={HOME.floor - 18} rx={26} ry={9} fill="#3d6fb0" />
      <ellipse cx={l - 10} cy={HOME.floor - 20} rx={24} ry={8} fill={JI_SHOE} />
    </g>
  );
};
const JI_SHOE = "#e8792f";

/** The doorway to the hall: a dark opening with a far strip of light. */
const Doorway: React.FC<{ dark: boolean }> = ({ dark }) => {
  const d = HOME.doorway;
  const l = d.x - d.w / 2;
  return (
    <g>
      <rect x={l - 18} y={d.top - 18} width={d.w + 36} height={HOME.floor - d.top + 18} fill="#b9895f" stroke={INK} strokeWidth={6} />
      <rect x={l} y={d.top} width={d.w} height={HOME.floor - d.top} fill={dark ? "#1e1f2c" : "#6c6a72"} />
      <rect x={d.x + 30} y={d.top + 90} width={30} height={HOME.floor - d.top - 150} fill={dark ? "#3a3a52" : "#a7a3a4"} />
      <rect x={d.x + 34} y={d.top + 96} width={8} height={HOME.floor - d.top - 162} fill={dark ? "#ffd89a" : "#fff8e0"} opacity={0.55} />
    </g>
  );
};

/** The wall clock; `hour` sets the hands (eleven at night, seven in the morning). */
const Clock: React.FC<{ hour: number }> = ({ hour }) => {
  const { x, y } = HOME.clock;
  const ha = ((hour % 12) / 12) * 360;
  return (
    <g>
      <circle cx={x} cy={y} r={44} fill={PAPER} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={x + Math.sin(a) * 34} cy={y - Math.cos(a) * 34} r={2.5} fill={INK} />;
      })}
      <line x1={x} y1={y} x2={x + Math.sin((ha * Math.PI) / 180) * 20} y2={y - Math.cos((ha * Math.PI) / 180) * 20} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x} y2={y - 32} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

/** The table for the actors' slot (over anyone seated): wooden top, front apron, legs, and her bowl when `bowl`. */
export const HomeTable: React.FC<{ bowl?: boolean; steam?: number; frame?: number }> = ({ bowl = true, steam = 0, frame = 0 }) => {
  const t = HOME.table;
  return (
    <g>
      <rect x={t.from + 24} y={t.top + 20} width={16} height={HOME.floor - t.top - 22} fill="#6b4b3a" stroke={INK} strokeWidth={3} />
      <rect x={t.to - 40} y={t.top + 20} width={16} height={HOME.floor - t.top - 22} fill="#6b4b3a" stroke={INK} strokeWidth={3} />
      <rect x={t.from} y={t.top} width={t.to - t.from} height={22} rx={6} fill="#a8774f" stroke={INK} strokeWidth={5} />
      <rect x={t.from + 14} y={t.top + 22} width={t.to - t.from - 28} height={26} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      {bowl && (
        <g>
          <path d={`M${HOME.bowl.x - 44} ${t.top - 30} Q${HOME.bowl.x} ${t.top + 12} ${HOME.bowl.x + 44} ${t.top - 30}Z`} fill="#e9e2d2" stroke={INK} strokeWidth={4} />
          <ellipse cx={HOME.bowl.x} cy={t.top - 30} rx={44} ry={7} fill="#f6efe0" stroke={INK} strokeWidth={3} />
          <line x1={HOME.bowl.x + 16} y1={t.top - 34} x2={HOME.bowl.x + 50} y2={t.top - 80} stroke="#b8bec8" strokeWidth={5} strokeLinecap="round" />
          {steam > 0 && [0, 1].map((i) => (
            <path key={i} d={`M${HOME.bowl.x - 10 + i * 18} ${t.top - 42} q-10 -18 0 -36 q10 -18 0 -36`} fill="none" stroke="#fff" strokeWidth={4}
              opacity={steam * 0.35 * (0.6 + 0.4 * Math.sin(frame / 9 + i))} strokeLinecap="round" />
          ))}
        </g>
      )}
    </g>
  );
};

export interface HomeProps {
  cam: Camera;
  mood: MoodName;
  frame: number;
  /** The calendar pinned on the fridge (default true); false when a beat draws it in a hand. */
  calendar?: boolean;
  /** Your letter on the fridge (default HOME.yours); null hides it. */
  yours?: { x: number; y: number; tilt: number; tapes?: number } | null;
  /** Her letter under the calendar: yellowed now, fresh six years ago. */
  hers?: "yellowed" | "fresh";
  /** The front door, 0 shut to 1 open. */
  door?: number;
  /** The clock's hour (default 11 at night, 7 in the morning). */
  hour?: number;
  /** The jar of brushes on the counter (default true). */
  jar?: boolean;
}

/** The flat behind the actors. */
export const HomeBack: React.FC<HomeProps> = ({ cam, mood, frame, calendar = true, yours = HOME.yours, hers = "yellowed", door = 0, hour, jar = true }) => {
  const on = lampOn(mood);
  const dark = mood === "lamp" || mood === "night";
  const w = HOME.window;
  const c = HOME.counter;
  return (
    <>
      <Deep cam={cam} depth={1} flat>
        {/* the wall: papered, a skirting board */}
        <rect x={-1400} y={-800} width={4800} height={HOME.floor + 820} fill={dark ? "#d9c7a6" : "#efe3cc"} />
        {Array.from({ length: 44 }, (_, i) => <rect key={i} x={-1400 + i * 110} y={-800} width={4} height={HOME.floor + 800} fill="#000" opacity={0.035} />)}
        <rect x={-1400} y={HOME.floor - 34} width={4800} height={30} fill="#c9a77a" />
        <Window id="home" mood={mood} x={w.x} y={w.y} w={w.w} h={w.h} frame="#9a7452" bars={false} />
        {!dark && (
          <path d={`M${w.x} ${w.y} L${w.x + w.w} ${w.y} L${w.x + w.w + 520} ${HOME.floor} L${w.x + 180} ${HOME.floor}Z`} fill="#fff4cf" opacity={0.22} />
        )}
        <Clock hour={hour ?? (dark ? 11 : 7)} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={HOME.floor - 6} fill="#b98a5e" gap={180} slant={-90} />
        <FrontDoor open={door} dark={dark} />
        <Doorway dark={dark} />
        {/* the low counter behind the table: cupboards, a top, a stack of bowls */}
        <rect x={c.from} y={c.top} width={c.to - c.from} height={HOME.floor - c.top - 6} fill="#cdb98f" stroke={INK} strokeWidth={5} />
        <rect x={c.from - 10} y={c.top - 14} width={c.to - c.from + 20} height={20} rx={5} fill="#8a7a68" stroke={INK} strokeWidth={4} />
        <path d={`M${c.from + 140} ${c.top + 20} V${HOME.floor - 20}`} stroke={INK} strokeWidth={4} opacity={0.5} />
        {/* a stack of bowls and a cutting board on the counter */}
        <g transform={`translate(${c.from + 70} ${c.top - 14})`}>
          <rect x={-60} y={-70} width={16} height={70} rx={4} fill="#c79a62" stroke={INK} strokeWidth={3} />
          {[0, 1, 2].map((i) => <path key={i} d={`M${-30 + i * 2} ${-i * 16} q32 ${-22} 64 0z`} fill="#e9e2d2" stroke={INK} strokeWidth={3} />)}
        </g>
        {jar && <BrushJar x={HOME.jar.x} y={HOME.jar.y} />}
        <Fridge calendar={calendar} yours={yours} hers={hers} />
        <Lamp on={on} frame={frame} />
      </Deep>
    </>
  );
};

/** The lamp's glow, for useGlows() (HerBack.Sister.tsx): on in the lamp mood. */
export const HOME_LAMP = { x: HOME.lamp.x, y: HOME.lamp.y + 10, r: 420, color: "#ffd59a", strength: 0.5 };
