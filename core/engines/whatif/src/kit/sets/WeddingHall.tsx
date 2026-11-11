// A wedding hall, side on: the stage with its marigold curtain and two throne chairs for the couple, rows of guests'
// heads, chandeliers, string lights, a buffet counter, and a garland swag across the front. Built for the library from
// the dining room (the photo's marigold garland), the festival street (string lights) and the classroom (rows of heads).
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { HERO, MOTHER, PASTELS, SIBLING } from "./cast";
import { Deep, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, type SetDef, type SetProps } from "./common";

const FLOOR = 980;
const STAGE = { from: 900, to: 1860, top: 820 };
const THRONES = [1220, 1500];

export interface WeddingHallOptions {
  /** The couple's thrones on the stage. */
  thrones: boolean;
  /** The guests' heads in rows. */
  guests: boolean;
  /** The colour of the stage curtain behind the marigolds. */
  curtain: string;
}

const Marigolds: React.FC<{ x: number; y: number; len: number }> = ({ x, y, len }) => (
  <g>
    {Array.from({ length: Math.floor(len / 26) }, (_, i) => <circle key={i} cx={x} cy={y + i * 26} r={14} fill={i % 3 === 2 ? "#d8344f" : "#f2a23c"} />)}
  </g>
);

const Throne: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <path d={`M${x - 90} ${STAGE.top} V${STAGE.top - 260} Q${x} ${STAGE.top - 360} ${x + 90} ${STAGE.top - 260} V${STAGE.top}Z`} fill="#b0306a" stroke="#c9a33a" strokeWidth={12} />
    <rect x={x - 100} y={STAGE.top - 90} width={200} height={40} rx={10} fill="#c9a33a" stroke={INK} strokeWidth={4} />
  </g>
);

const Back: React.FC<SetProps<WeddingHallOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.6} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#6a3f5c" : "#f0d8c4"} />
        {/* chandeliers */}
        {[200, 900, 1600].map((x) => (
          <g key={x}>
            <line x1={x} y1={-100} x2={x} y2={80} stroke="#c9a33a" strokeWidth={4} />
            <path d={`M${x - 90} 80 Q${x} 150 ${x + 90} 80Z`} fill="#e8d08a" stroke="#c9a33a" strokeWidth={4} />
            {[-60, -20, 20, 60].map((dx) => <circle key={dx} cx={x + dx} cy={128} r={10} fill={on ? "#fff6d0" : "#f3e9d7"} />)}
          </g>
        ))}
        {/* guests in rows facing the stage */}
        {options.guests && Array.from({ length: 3 }, (_, r) => Array.from({ length: 9 }, (_, i) => (
          <g key={`${r}-${i}`} transform={`translate(${-300 + i * 130 + r * 60} ${640 + r * 70 + Math.sin(frame / 50 + i + r) * 2})`}>
            <rect x={-22} y={0} width={44} height={70} rx={16} fill={["#b0306a", "#3d6fb0", "#e0793f", "#7a5a8c", "#1d9a8f"][(i + r) % 5]} />
            <circle cx={0} cy={-22} r={26} fill={PASTELS[(i * 3 + r) % PASTELS.length]} />
          </g>
        )))}
      </Deep>
      <Deep cam={cam} depth={0.9}>
        {/* the stage backdrop: the curtain hung with marigold strings */}
        <rect x={STAGE.from} y={160} width={STAGE.to - STAGE.from} height={STAGE.top - 160} fill={options.curtain} stroke="#c9a33a" strokeWidth={10} />
        {Array.from({ length: 14 }, (_, i) => <Marigolds key={i} x={STAGE.from + 40 + i * 68} y={180} len={240 + (i % 3) * 60} />)}
        <path d={`M${STAGE.from} 170 Q${(STAGE.from + STAGE.to) / 2} 300 ${STAGE.to} 170`} fill="none" stroke="#f2a23c" strokeWidth={22} strokeDasharray="20 6" />
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={STAGE.from + 20 + i * 44} cy={164} r={8} fill={on ? ["#ffe39a", "#ff9a8a"][i % 2] : "#f3e9d7"} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 40} width={4800} height={800} fill={dark ? "#5a3a4a" : "#d9a38a"} />
        <rect x={-200} y={FLOOR - 40} width={900} height={800} fill="#b0306a" opacity={0.85} />
        {/* the stage and the thrones */}
        <rect x={STAGE.from - 40} y={STAGE.top} width={STAGE.to - STAGE.from + 80} height={FLOOR - STAGE.top - 40} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        <rect x={STAGE.from - 40} y={STAGE.top} width={STAGE.to - STAGE.from + 80} height={18} fill="#c9a33a" />
        {options.thrones && THRONES.map((x) => <Throne key={x} x={x} />)}
        {/* the buffet counter at the left */}
        <rect x={20} y={760} width={560} height={FLOOR - 800} fill="#f3e9d7" stroke={INK} strokeWidth={4} />
        {[80, 220, 360, 480].map((x, i) => <path key={x} d={`M${x} 760 Q${x + 50} ${700 - (i % 2) * 20} ${x + 100} 760Z`} fill="#c9ced6" stroke={INK} strokeWidth={4} />)}
      </Deep>
    </>
  );
};

/** A garland swag across the top of the frame, near and soft. */
const Front: React.FC<SetProps<WeddingHallOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.3}>
    <path d="M-200 -20 Q480 160 960 40 T2120 -20" fill="none" stroke="#f2a23c" strokeWidth={34} strokeDasharray="28 8" />
    {[200, 960, 1700].map((x) => <Marigolds key={x} x={x} y={60} len={180} />)}
  </Deep>
);

export const weddingHall: SetDef<WeddingHallOptions> = {
  name: "wedding-hall",
  about: "wedding hall: stage with marigold curtain and the couple's thrones, rows of guests, chandeliers, buffet, garlands",
  spots: {
    groom: seat(THRONES[0], STAGE.top - 70, 1.0, 1),
    bride: seat(THRONES[1], STAGE.top - 70, 1.0, -1),
    stage: { x: 1000, y: STAGE.top, scale: 1.0, facing: 1 },
    guest: { x: 700, y: FLOOR + 10, scale: 1.2, facing: 1 },
    aunty: { x: 420, y: FLOOR + 10, scale: 1.2, facing: 1 },
  },
  cameras: {
    wide: REF,
    stage: { x: 1360, y: 560, zoom: 1.6 },
    guests: { x: 560, y: 640, zoom: 1.5 },
  },
  lights: () => [
    { x: 900, y: 120, depth: 0.6, r: 900, color: "#fff6d0", strength: 0.3, moods: LIGHTS_ON },
    { x: 1380, y: 400, depth: 0.9, r: 600, color: "#ffd27a", strength: 0.25, moods: LIGHTS_ON },
  ],
  defaults: { thrones: true, guests: true, curtain: "#d8344f" },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "groom", who: { head: "#c98a5a", coat: "#f3e9d7", cap: "#d8344f" }, face: EXPRESSIONS.happy },
      { spot: "bride", who: { ...SIBLING, coat: "#b0306a" }, face: EXPRESSIONS.happy },
      { spot: "aunty", who: { ...MOTHER, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.sceptical },
      { spot: "guest", who: { ...HERO, look: { x: -0.8, y: 0 } }, face: EXPRESSIONS.shocked },
    ],
  },
};
