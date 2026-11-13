// The flat's kitchen by lamp (The Cold Apology, Night Thirty's calendar, It Was Yesterday): the library `kitchen` with
// its tube light covered and one lamp hung over a small table instead, rain on the window, a dripping tap at the sink
// under it, the kitchen calendar on the fridge door, and the doorway at the right to the stairs down to the hall, the
// hatches' glow at the bottom. Drawn for REF like every set. The table, chairs, cake and bill go in the actors' slot.
import { evolvePath } from "@remotion/paths";
import { Chair } from "@whatif/kit/sets/common";
import { kitchen } from "@whatif/kit/sets/Kitchen";
import { Mug } from "@whatif/kit/sets/props";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { Deep } from "../sets/common";
import { InkBars, InSet } from "./CityPlugsIn.Kit";

export const FLAT = {
  floor: 960,
  table: { x: 1050, top: 790, w: 470 },
  /** Her chair (left of the table, facing right) and yours (right, facing left): seat tops. */
  herChair: { x: 850, top: 850 },
  yourChair: { x: 1250, top: 850 },
  lamp: { x: 1050, y: 470 },
  door: { x: 1790, w: 190, top: 300 },
  /** The tap's spout and the sink under the window. */
  tap: { x: 404, y: 668 },
  /** The calendar on the fridge's lower door: its top-left corner and size. */
  cal: { x: 1490, y: 520, w: 190, h: 170 },
  cameras: {
    wide: { x: 1180, y: 600, zoom: 1.12 } as Camera,
    table: { x: 1050, y: 660, zoom: 1.6 } as Camera,
    door: { x: 1840, y: 640, zoom: 2.0 } as Camera,
    calendar: { x: 1585, y: 605, zoom: 4.2 } as Camera,
  },
};

const LAMP_GLOW = "#ffcf86";

/** One lamp over the table, the window's grey night, the hatches' glow at the foot of the stairs. */
export function flatLights(): SetLight[] {
  const all: MoodName[] = ["morning", "day", "dusk", "night", "lamp", "frozen"];
  return [
    { x: FLAT.lamp.x, y: FLAT.lamp.y + 60, depth: 1, r: 430, color: LAMP_GLOW, strength: 0.55, moods: all },
    { x: FLAT.door.x + FLAT.door.w * 0.6, y: 860, depth: 0.85, r: 160, color: "#ff9a6a", strength: 0.45, moods: all },
  ];
}

/** Rain down the window glass, and the drop from the tap every 40 frames. */
const Rain: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <clipPath id="flat-rain"><rect x={140} y={200} width={360} height={300} /></clipPath>
    <g clipPath="url(#flat-rain)" opacity={0.55}>
      {Array.from({ length: 26 }, (_, i) => {
        const x = 150 + ((i * 53) % 350);
        const y = 180 + (((frame * (14 + (i % 4) * 3)) + i * 97) % 360);
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34} stroke="#cfe0f0" strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  </g>
);

const Drip: React.FC<{ frame: number }> = ({ frame }) => {
  const p = (frame % 40) / 40;
  const { x, y } = FLAT.tap;
  return (
    <g>
      {/* the sink basin cut into the counter and the gooseneck tap */}
      <rect x={300} y={738} width={200} height={14} rx={6} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
      <path d={`M${x + 40} 740 V${y - 40} Q${x + 40} ${y - 70} ${x + 10} ${y - 70} Q${x - 4} ${y - 70} ${x} ${y - 50} V${y}`} fill="none" stroke="#b8bec8" strokeWidth={12} strokeLinecap="round" />
      <path d={`M${x + 40} 740 V${y - 40} Q${x + 40} ${y - 70} ${x + 10} ${y - 70} Q${x - 4} ${y - 70} ${x} ${y - 50} V${y}`} fill="none" stroke={INK} strokeWidth={3} opacity={0.4} />
      {p < 0.55 ? (
        <ellipse cx={x} cy={y + 6 + p * 8} rx={5} ry={6 + p * 4} fill="#cfe6ff" stroke={INK} strokeWidth={2} />
      ) : p < 0.8 ? (
        <ellipse cx={x} cy={y + 10 + ((p - 0.55) / 0.25) * 64} rx={5} ry={8} fill="#cfe6ff" stroke={INK} strokeWidth={2} />
      ) : (
        <ellipse cx={x} cy={742} rx={8 + (p - 0.8) * 90} ry={3} fill="none" stroke="#cfe6ff" strokeWidth={3} opacity={1 - (p - 0.8) * 5} />
      )}
    </g>
  );
};

/** The kitchen calendar on the fridge: a crimson header, a grid of days, one date circled in her pen (`circle` 0..1 as
 *  it draws) with a small cake drawn in it. */
export const Calendar: React.FC<{ circle?: number }> = ({ circle = 1 }) => {
  const { x, y, w, h } = FLAT.cal;
  const cw = w / 7, top = y + 40, ch = (h - 48) / 4;
  const cx = x + cw * 4.5, cy = top + ch * 2.5;
  const ring = `M${cx + cw * 0.62} ${cy} A${cw * 0.62} ${ch * 0.7} 0 1 0 ${cx + cw * 0.6} ${cy + 4}`;
  const ev = circle > 0 ? evolvePath(Math.min(1, circle), ring) : null;
  return (
    <g>
      <rect x={x + 4} y={y + 6} width={w} height={h} fill="#000" opacity={0.2} />
      <rect x={x} y={y} width={w} height={h} fill={PAPER} stroke={INK} strokeWidth={4} />
      <rect x={x} y={y} width={w} height={32} fill={CRIMSON} stroke={INK} strokeWidth={4} />
      <circle cx={x + w / 2} cy={y - 6} r={6} fill={INK} />
      {Array.from({ length: 28 }, (_, i) => (
        <rect key={i} x={x + 6 + (i % 7) * cw} y={top + Math.floor(i / 7) * ch} width={cw - 8} height={ch - 6} fill="none" stroke="#c9bba3" strokeWidth={2} />
      ))}
      {/* the small drawn cake in the circled day */}
      <rect x={cx - 8} y={cy - 2} width={16} height={10} fill="#e6a0a0" stroke={INK} strokeWidth={2} />
      <line x1={cx} y1={cy - 2} x2={cx} y2={cy - 9} stroke={INK} strokeWidth={2} />
      {ev && <path d={ring} fill="none" stroke={CRIMSON} strokeWidth={4} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />}
    </g>
  );
};

/** The doorway at the right: the stairs going down to the hall, its glow at the foot; the door leaf (`door` 0 open
 *  against the wall to 1 shut). */
const Doorway: React.FC<{ door: number }> = ({ door }) => {
  const { x, w, top } = FLAT.door;
  const bottom = FLAT.floor - 20;
  return (
    <g>
      <rect x={x - 16} y={top - 16} width={w + 32} height={bottom - top + 16} fill="#b9895f" stroke={INK} strokeWidth={6} />
      <rect x={x} y={top} width={w} height={bottom - top} fill="#171a28" />
      <defs>
        <radialGradient id="flat-hall" cx="0.6" cy="1" r="0.8">
          <stop offset="0" stopColor="#ffb46b" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#d8344f" stopOpacity={0.25} />
          <stop offset="1" stopColor="#171a28" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={x} y={top + (bottom - top) * 0.35} width={w} height={(bottom - top) * 0.65} fill="url(#flat-hall)" />
      {/* the stair treads going down and away */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={x + 10 + i * 18} y={top + 330 + i * 46} width={w - 20 - i * 18} height={10} fill="#3a3550" opacity={0.9 - i * 0.1} />
      ))}
      {/* a sliver of the pod hall's hatches far below */}
      {[0, 1, 2].map((i) => <circle key={i} cx={x + 70 + i * 44} cy={bottom - 26} r={10} fill="#ffc46b" opacity={0.75} />)}
      {/* the door leaf */}
      {door < 0.98 && <rect x={x + w - 14} y={top} width={14} height={bottom - top} fill="#8a6a4a" stroke={INK} strokeWidth={4} />}
      {door > 0 && (
        <g>
          <rect x={x + w - w * door} y={top} width={w * door} height={bottom - top} fill="#8a6a4a" stroke={INK} strokeWidth={5} />
          {door > 0.6 && <circle cx={x + w - w * door + 26} cy={top + 330} r={9} fill="#d9c26a" stroke={INK} strokeWidth={3} />}
        </g>
      )}
    </g>
  );
};

/** The kitchen behind the actors, with this flat's changes on top. */
const FlatExtras: React.FC<{ cam: Camera; frame: number; door: number; circle?: number; calendar?: boolean }> = ({ cam, frame, door, circle, calendar = true }) => (
  <>
    <Deep cam={cam} depth={0.85} flat>
      {/* cover the library's tube light: one lamp in this kitchen */}
      <rect x={640} y={120} width={400} height={80} fill="#d6e8d8" />
      <Rain frame={frame} />
      <Doorway door={door} />
    </Deep>
    <Deep cam={cam} depth={1}>
      <Drip frame={frame} />
      {calendar && <Calendar circle={circle} />}
    </Deep>
  </>
);

/** The lamp hung over the table on its cord. */
export const Lamp: React.FC = () => {
  const { x, y } = FLAT.lamp;
  return (
    <g>
      <line x1={x} y1={-200} x2={x} y2={y - 40} stroke={INK} strokeWidth={5} />
      <path d={`M${x - 80} ${y + 30} L${x - 34} ${y - 40} L${x + 34} ${y - 40} L${x + 80} ${y + 30} Z`} fill="#e6a23c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={x} cy={y + 30} rx={80} ry={12} fill="#fff1c4" stroke={INK} strokeWidth={5} />
      <polygon points={`${x - 76},${y + 34} ${x + 76},${y + 34} ${x + 230},${FLAT.table.top} ${x - 230},${FLAT.table.top}`} fill="#ffe9b8" opacity={0.12} />
    </g>
  );
};

/** A bill on the table: a sheet with ink bars and a crimson total bar. */
export const Bill: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = -6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-50} y={-14} width={100} height={18} fill={PAPER} stroke={INK} strokeWidth={3} />
    <InkBars x={-40} y={-10} w={60} n={1} thick={4} />
    <rect x={14} y={-10} width={26} height={5} fill={CRIMSON} />
  </g>
);

/** The small cake on its plate; `candle` 1 lit and tall to 0 burnt down to the plate, the wax pooled. */
export const Cake: React.FC<{ x: number; y: number; candle: number; frame: number; scale?: number }> = ({ x, y, candle, frame, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={70} ry={12} fill="#eef1f5" stroke={INK} strokeWidth={4} />
    <rect x={-42} y={-46} width={84} height={44} rx={8} fill="#e6a0a0" stroke={INK} strokeWidth={4} />
    <path d="M-42 -36 Q-30 -26 -18 -36 T6 -36 T30 -36 T42 -36 V-46 H-42Z" fill={PAPER} stroke={INK} strokeWidth={3} />
    {candle > 0.05 ? (
      <g>
        <rect x={-5} y={-46 - 40 * candle} width={10} height={40 * candle} fill="#9fc0e0" stroke={INK} strokeWidth={3} />
        <path d={`M0 ${-52 - 40 * candle} q${6 + Math.sin(frame / 3) * 2} -10 0 -22 q-6 12 0 22`} fill="#ffcf5a" stroke={INK} strokeWidth={2} />
      </g>
    ) : (
      <g>
        <ellipse cx={4} cy={-46} rx={26} ry={6} fill="#9fc0e0" stroke={INK} strokeWidth={3} />
        <rect x={-3} y={-54} width={8} height={8} fill="#9fc0e0" stroke={INK} strokeWidth={2} />
        <path d="M30 -46 q6 22 -2 40" fill="none" stroke="#9fc0e0" strokeWidth={8} strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** The table: top, legs, and what is on it. */
export const Table: React.FC<{ children?: React.ReactNode; mugs?: boolean }> = ({ children, mugs = true }) => {
  const { x, top, w } = FLAT.table;
  return (
    <g>
      <rect x={x - w / 2} y={top} width={w} height={22} rx={6} fill="#a8774e" stroke={INK} strokeWidth={5} />
      {[-1, 1].map((s) => <rect key={s} x={x + s * (w / 2 - 40) - 8} y={top + 22} width={16} height={FLAT.floor - top - 30} fill="#6a4630" stroke={INK} strokeWidth={3} />)}
      {mugs && <Mug x={x - 140} y={top} scale={0.7} />}
      {children}
    </g>
  );
};

/** Both chairs (drawn behind the figures). */
export const Chairs: React.FC<{ her?: boolean; yours?: boolean }> = ({ her = true, yours = true }) => (
  <g>
    {her && <Chair x={FLAT.herChair.x} y={FLAT.herChair.top} facing={1} color="#7a5a40" />}
    {yours && <Chair x={FLAT.yourChair.x} y={FLAT.yourChair.top} facing={-1} color="#7a5a40" />}
  </g>
);

/** The whole kitchen on the Stage: chairs and anything `behind`, then the actors, the table and the lamp on top. */
export const Flat: React.FC<{
  cam: Camera; frame: number; mood?: MoodName; door?: number; circle?: number; calendar?: boolean; behind?: React.ReactNode;
  table?: React.ReactNode; children?: React.ReactNode; over?: React.ReactNode;
}> = ({ cam, frame, mood = "lamp", door = 0, circle, calendar, behind, table, children, over }) => (
  <InSet set={kitchen} mood={mood} frame={frame} cam={cam} options={{ stove: "kettle", steam: 0, counter: [] }} front={false}
    lights={flatLights()}
    back={<FlatExtras cam={cam} frame={frame} door={door} circle={circle} calendar={calendar} />}
    behind={<><Chairs />{behind}</>}
    over={over}>
    {children}
    <Table>{table}</Table>
    <Lamp />
  </InSet>
);
