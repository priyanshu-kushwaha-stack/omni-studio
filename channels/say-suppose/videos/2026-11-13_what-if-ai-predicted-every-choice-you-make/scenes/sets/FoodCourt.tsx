// The food court (most of the film): your stall's counter with its one hanging lamp and the dark tin cash box, the
// coffee seller's stall next door at the right with its price board, a pillar at the left with the city's teal lamp and
// a rate board, the far row of stall fronts (shutters down at closing, lit and open by day), tables and stools between.
// Drawn for REF (the 1920x1080 frame at zoom 1) in paper layers; the thumbnail (brand/thumbs/predict) is a close framing
// of the same counter. No lettering anywhere: stall boards carry ink bars, not words.
//
//   <Stage cam={cam} back={<FoodCourtBack cam={cam} mood={mood} frame={f} />} actors={<>...figures...<StallCounter .../></>} />
//   lights for setLook: foodCourtLights
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { noise, PASTELS } from "../shared";
import { Deep } from "./common";

/** Where things are, at REF. Figures behind a counter stand on FLOOR and are drawn BEFORE the counter. */
export const COURT = {
  floor: 1000,
  scale: 2.2,
  /** Your stall: the counter's top edge and its span. */
  counter: { top: 790, from: 280, to: 1330 },
  /** Behind your counter: you at the left, your best friend at the right. */
  you: { x: 560, y: 1000 },
  friend: { x: 1080, y: 1000 },
  /** The tin cash box on your counter (its bottom centre). */
  box: { x: 820, y: 790 },
  /** Your stall's hanging lamp. */
  lamp: { x: 800, y: 300 },
  /** The coffee stall next door: its counter and where she stands behind it. */
  coffee: { top: 800, from: 1420, to: 1900, seller: { x: 1660, y: 1000 } },
  /** The coffee stall's price board (top centre). */
  priceBoard: { x: 1660, y: 330 },
  /** The pillar at the left with the city's teal lamp and a rate board. */
  pillar: { x: 120, lamp: { x: 120, y: 250 }, board: { x: 120, y: 420 } },
  /** A customer at your counter, front side. */
  customer: { x: 1260, y: 1060 },
} as const;

const SHUTTER = "#2b3142";
const BOARDS = ["#7a3b46", "#2f5f63", "#6b5a33", "#3d4a78", "#5f3d6b", "#2f6b4a"];
const DAY_BOARDS = ["#e07a5f", "#3d9a8b", "#e0b04a", "#5a7ac0", "#b06aa0", "#5aa070"];

/** Is the court open (stalls lit, shutters up)? Closing time is `lamp`; morning, day and dusk are open. */
export const isOpen = (mood: MoodName) => mood === "day" || mood === "morning" || mood === "dusk";

/** The far row of stalls: shutters down when closed; open counters with lit boards, steam and a few cooks when open. */
const StallRow: React.FC<{ open: boolean; frame: number }> = ({ open, frame }) => (
  <g>
    <rect x={-1400} y={-200} width={4800} height={1400} fill={open ? "#3a3f52" : "#10121b"} />
    {[-2, -1, 0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={`t${i}`} x={120 + i * 470} y={128} width={260} height={14} rx={7} fill={open ? "#f4efe2" : "#2c3040"} opacity={open ? 0.9 : 1} />
    ))}
    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x = -60 + i * 420;
      const board = (open ? DAY_BOARDS : BOARDS)[(i + 6) % 6];
      return (
        <g key={i}>
          <rect x={x} y={230} width={380} height={70} rx={6} fill={board} opacity={open ? 0.95 : 0.55} stroke={INK} strokeWidth={5} />
          <rect x={x + 30} y={256} width={170} height={16} rx={8} fill={INK} opacity={0.5} />
          <circle cx={x + 330} cy={265} r={18} fill={INK} opacity={0.4} />
          {open ? (
            <g>
              <rect x={x} y={310} width={380} height={420} fill="#5a4a3e" stroke={INK} strokeWidth={6} />
              <rect x={x + 20} y={330} width={340} height={150} fill="#f1e3c4" opacity={0.85} />
              <rect x={x + 40} y={350} width={90} height={60} rx={8} fill="#c0c4cc" stroke={INK} strokeWidth={4} />
              <rect x={x + 160} y={360} width={170} height={20} rx={10} fill={INK} opacity={0.35} />
              {[0, 1, 2].map((s) => {
                const p = ((frame / 60 + s / 3 + noise(i) ) % 1);
                return <circle key={s} cx={x + 85 + Math.sin(frame / 15 + s) * 8} cy={340 - p * 90} r={10 + p * 18} fill="#fff" opacity={0.3 * (1 - p)} />;
              })}
              <rect x={x} y={640} width={380} height={90} fill="#3e3128" stroke={INK} strokeWidth={6} />
            </g>
          ) : (
            <g>
              <rect x={x} y={310} width={380} height={420} fill={SHUTTER} stroke={INK} strokeWidth={6} />
              {Array.from({ length: 15 }, (_, r) => <line key={r} x1={x + 6} y1={330 + r * 26} x2={x + 374} y2={330 + r * 26} stroke="#3a4156" strokeWidth={6} />)}
              <rect x={x + 160} y={700} width={60} height={14} rx={6} fill="#4a5168" />
            </g>
          )}
        </g>
      );
    })}
    <rect x={-1400} y={730} width={4800} height={700} fill={open ? "#4a4d5a" : "#1b1e29"} />
  </g>
);

/** Tables and stools between the far stalls and your counter: chairs stacked upside down at closing; diners by day. */
const Tables: React.FC<{ open: boolean; frame: number; diners: boolean }> = ({ open, frame, diners }) => (
  <g>
    {[-700, -150, 400, 950, 1500, 2050].map((cx, i) => (
      <g key={cx}>
        <rect x={cx - 130} y={790} width={260} height={18} fill={open ? "#8a8f9c" : "#1a1d29"} stroke={INK} strokeWidth={5} />
        <rect x={cx - 8} y={808} width={16} height={130} fill={open ? "#6b6f7a" : "#1a1d29"} />
        {open ? (
          <g>
            {[-100, 100].map((sx) => <rect key={sx} x={cx + sx - 30} y={880} width={60} height={14} rx={6} fill="#6b6f7a" stroke={INK} strokeWidth={4} />)}
            {diners && [-1, 1].map((side) => (
              <Figure key={side} x={cx + side * 100} y={1010} scale={1.05} facing={(side === -1 ? 1 : -1) as 1 | -1}
                pose={{ ...STAND, armF: [70, 40] }} head={PASTELS[(i * 2 + (side + 1) / 2) % PASTELS.length]}
                coat={side === 1 ? "#3b4a6b" : "#2a2d36"} mouth="flat" look={{ x: 0.6, y: 0.4 }} time={frame} />
            ))}
          </g>
        ) : (
          <g stroke="#262a39" strokeWidth={5} fill="#1a1d29">
            <rect x={cx - 90} y={712} width={180} height={14} />
            <rect x={cx - 90} y={652} width={12} height={140} />
            <rect x={cx + 78} y={652} width={12} height={140} />
          </g>
        )}
      </g>
    ))}
  </g>
);

/** The pillar at the left: a concrete column, the city's teal lamp clipped near the top (draw <TealLamp> at
 *  COURT.pillar.lamp in the actors slot to switch it on), a rate board below it (draw <RateBoard> at COURT.pillar.board). */
const Pillar: React.FC = () => (
  <g>
    <rect x={COURT.pillar.x - 70} y={-300} width={140} height={1400} fill="#5a5f6e" stroke={INK} strokeWidth={6} />
    <rect x={COURT.pillar.x - 70} y={-300} width={30} height={1400} fill="#000" opacity={0.18} />
  </g>
);

/** The court behind the actors: far stalls, tables, the pillar. `diners` fills the tables by day. */
export const FoodCourtBack: React.FC<{ cam: Camera; mood: MoodName; frame: number; diners?: boolean }> = ({ cam, mood, frame, diners = true }) => {
  const open = isOpen(mood);
  return (
    <g>
      <Deep cam={cam} depth={0.55} flat><StallRow open={open} frame={frame} /></Deep>
      <Deep cam={cam} depth={0.75}><Tables open={open} frame={frame} diners={diners} /></Deep>
      <Deep cam={cam} depth={0.95}><Pillar /></Deep>
    </g>
  );
};

/** Your stall's hanging lamp: a warm bulb under a metal shade and a faint cone of light. Back slot, depth 1. */
export const StallLamp: React.FC<{ on?: boolean }> = ({ on = true }) => {
  const { x, y } = COURT.lamp;
  return (
    <g>
      <line x1={x} y1={-800} x2={x} y2={y - 50} stroke="#14161f" strokeWidth={8} />
      {on && <path d={`M${x - 520} 1100 L${x - 60} ${y + 10} L${x + 60} ${y + 10} L${x + 640} 1100Z`} fill="#ffd98a" opacity={0.07} />}
      <path d={`M${x - 80} ${y} L${x - 30} ${y - 54} L${x + 30} ${y - 54} L${x + 80} ${y}Z`} fill="#3b404e" stroke={INK} strokeWidth={6} />
      <circle cx={x} cy={y + 8} r={22} fill={on ? "#fff1c2" : "#6b6f7a"} />
    </g>
  );
};

/** The dark tin cash box with a brass lock. (x, y) is its bottom centre; `open` lifts the lid. */
export const CashBox: React.FC<{ x: number; y: number; w?: number; h?: number; open?: number }> = ({ x, y, w = 260, h = 120, open = 0 }) => {
  const top = y - h;
  const lid = h * 0.3;
  return (
    <g>
      <rect x={x - w / 2 + 10} y={top + 14} width={w} height={h} rx={10} fill="#000" opacity={0.4} />
      <rect x={x - w / 2} y={top} width={w} height={h} rx={10} fill="#3a4150" stroke={INK} strokeWidth={7} />
      {open > 0 && <rect x={x - w / 2 + 14} y={top + 8} width={w - 28} height={h * 0.5} fill="#c9a24a" opacity={0.9} />}
      <g transform={`translate(${x - w / 2} ${top}) rotate(${-70 * open})`}>
        <rect x={0} y={0} width={w} height={lid} rx={10} fill="#4c5568" stroke={INK} strokeWidth={7} />
      </g>
      {open === 0 && <rect x={x - 22} y={top + lid} width={44} height={42} rx={7} fill="#e8b84a" stroke={INK} strokeWidth={5} />}
    </g>
  );
};

/** The brass cash-box key: a bow, a shank and two teeth. (x, y) is its centre; `glint` adds the lamp's catch-light. */
export const Key: React.FC<{ x: number; y: number; scale?: number; rotate?: number; glint?: boolean }> = ({ x, y, scale = 1, rotate = -14, glint = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    {glint && <circle cx={0} cy={0} r={48} fill="#fff6c8" opacity={0.28} />}
    <circle cx={-34} cy={-16} r={26} fill="#e8b84a" stroke={INK} strokeWidth={6} />
    <circle cx={-34} cy={-16} r={10} fill={INK} />
    <rect x={-10} y={-24} width={78} height={16} rx={4} fill="#e8b84a" stroke={INK} strokeWidth={6} />
    <rect x={44} y={-10} width={12} height={20} fill="#e8b84a" stroke={INK} strokeWidth={5} />
    <rect x={58} y={-10} width={10} height={14} fill="#e8b84a" stroke={INK} strokeWidth={5} />
  </g>
);

/** Your stall's counter, in front of you both (actors slot, AFTER the figures behind it). The box sits on it unless
 *  `box` is false (draw <CashBox> yourself to animate it). */
export const StallCounter: React.FC<{ box?: boolean }> = ({ box = true }) => {
  const { top, from, to } = COURT.counter;
  return (
    <g>
      <rect x={from} y={top} width={to - from} height={COURT.floor - top + 80} fill="#5a3b2a" stroke={INK} strokeWidth={8} />
      <rect x={from - 20} y={top} width={to - from + 40} height={30} fill="#8a5d3c" stroke={INK} strokeWidth={6} />
      {[1, 2, 3].map((i) => <line key={i} x1={from + ((to - from) * i) / 4} y1={top + 40} x2={from + ((to - from) * i) / 4} y2={COURT.floor + 80} stroke="#3f2a1e" strokeWidth={6} />)}
      {box && <CashBox x={COURT.box.x} y={top} />}
    </g>
  );
};

/** The coffee stall next door: its counter (actors slot, AFTER the coffee seller), a row of cups, an iced coffee. */
export const CoffeeCounter: React.FC = () => {
  const { top, from, to } = COURT.coffee;
  return (
    <g>
      <rect x={from} y={top} width={to - from + 200} height={COURT.floor - top + 80} fill="#2f5f63" stroke={INK} strokeWidth={8} />
      <rect x={from - 16} y={top} width={to - from + 230} height={26} fill="#4a8a8a" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${from + 60 + i * 70} ${top})`}>
          <path d="M-20 0 L-16 -56 H16 L20 0Z" fill="#f3e9d7" stroke={INK} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

/** The light for setLook: your stall's warm lamp always; the court's tube lights by day. The teal lamps add their own
 *  glow through <TealLamp>. */
export const foodCourtLights: SetLight[] = [
  { x: COURT.lamp.x, y: COURT.lamp.y + 40, r: 520, color: "#ffcf7a", strength: 0.55, moods: ["lamp", "night", "dusk"] },
  { x: 960, y: 140, r: 900, color: "#f4efe2", strength: 0.25, moods: ["day", "morning"] },
];

/** The wide of the court at REF, and the closer framings beats start from. */
export const COURT_CAMS = {
  wide: { x: 960, y: 540, zoom: 1 },
  counter: { x: 820, y: 600, zoom: 1.45 },
  you: { x: 560, y: 470, zoom: 2.1 },
  friend: { x: 1080, y: 470, zoom: 2.1 },
  box: { x: 820, y: 700, zoom: 3 },
  coffee: { x: 1600, y: 520, zoom: 1.7 },
  pillar: { x: 260, y: 420, zoom: 1.8 },
} satisfies Record<string, Camera>;

/** The coffee seller behind her counter (draw BEFORE <CoffeeCounter>). */
export const CoffeeSeller: React.FC<{ frame: number; face?: Partial<React.ComponentProps<typeof Figure>>; pose?: typeof STAND }> = ({ frame, face, pose = STAND }) => (
  <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={COURT.scale} facing={-1} pose={pose} head="#a8c99a" coat="#d9cfb8"
    mouth="flat" time={frame} {...face} />
);

export { noise };
