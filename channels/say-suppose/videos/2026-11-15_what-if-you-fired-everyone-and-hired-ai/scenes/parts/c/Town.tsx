// The town's main street for part C, on the kit's SetDef contract (REF coordinates, paper layers lit by the mood). Left
// to right along the far pavement: the town hall (the square, where the cheque table stands), the bank, the salon
// (striped pole, a big window with the chair, a price on the glass), the diner's own front (teal, the long window, the
// door with its chime), the bar with the live band in its window, a side street, then the car plant's gate and sheds.
// The road runs in front of them; the near pavement is where the queue stands. No words on any sign: icons only.
import { FONT } from "@whatif/kit/fonts";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Figure } from "@whatif/kit/rig/Figure";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Deep, noise, OUTSIDE, REF, Sky, type SetDef, type SetLight, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { OVERALLS, WORKER_HEADS } from "../Cast";
import { Cheque, STEEL, STEEL_DARK, STEEL_LIGHT } from "../Props";

export const TOWN = {
  base: 712,
  roadTop: 760,
  roadBottom: 905,
  hall: { x: -300, w: 780 },
  bank: { x: 500, w: 440, door: 720 },
  salon: { x: 960, w: 420, win: { x: 990, y: 430, w: 250, h: 220 }, door: 1310 },
  diner: { x: 1400, w: 560, door: 1470 },
  bar: { x: 1980, w: 560, win: { x: 2030, y: 380, w: 440, h: 270 } },
  plant: { x: 2680, gate: 2930, gateW: 220 },
  table: { x: 260, top: 915 },
} as const;

export interface TownOptions {
  /** The cheque table on the near pavement, in front of the town hall, with a stack of cheques. */
  table: boolean;
  /** Cheques left in the stack, 0..1. */
  stack: number;
  /** The live band in the bar's window, and every table taken. */
  band: boolean;
  /** The salon's chair full and a queue out of its door. */
  salonFull: boolean;
  /** The new price on the salon window, written 0..1 (and underlined at the end). */
  price: number;
  /** The plumber's van parked by the bar. */
  van: boolean;
  /** The plant gate, 0 shut to 1 open; whistle steam 0..1. */
  gate: number;
  whistle: number;
  /** Overalls walking out of the gate toward the diner, 0..1. */
  crowd: number;
}

const dark = (mood: MoodName) => OUTSIDE[mood].dark;

const Hall: React.FC<{ mood: MoodName }> = ({ mood }) => {
  const { x, w } = TOWN.hall;
  const b = TOWN.base;
  const stone = dark(mood) ? "#4a5168" : "#e8dcc4";
  const shade = dark(mood) ? "#3a4058" : "#cdbf9f";
  return (
    <g>
      <rect x={x} y={b - 400} width={w} height={400} fill={stone} />
      <path d={`M${x - 30} ${b - 400} L${x + w / 2} ${b - 540} L${x + w + 30} ${b - 400}Z`} fill={shade} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={x + w / 2} cy={b - 450} r={44} fill={PAPER} stroke={INK} strokeWidth={5} />
      <line x1={x + w / 2} y1={b - 450} x2={x + w / 2} y2={b - 480} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <line x1={x + w / 2} y1={b - 450} x2={x + w / 2 + 20} y2={b - 450} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <rect x={x - 30} y={b - 410} width={w + 60} height={22} fill={shade} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={x + 50 + i * ((w - 130) / 5)} y={b - 388} width={34} height={330} fill={dark(mood) ? "#555d78" : "#f3ead6"} stroke={INK} strokeWidth={4} />
      ))}
      <rect x={x - 20} y={b - 60} width={w + 40} height={30} fill={shade} stroke={INK} strokeWidth={4} />
      <rect x={x - 40} y={b - 30} width={w + 80} height={30} fill={shade} stroke={INK} strokeWidth={4} />
      {/* bunting across the hall's front */}
      <path d={`M${x} ${b - 380} Q${x + w / 2} ${b - 330} ${x + w} ${b - 380}`} fill="none" stroke={INK} strokeWidth={3} />
      {Array.from({ length: 11 }, (_, i) => {
        const t = (i + 0.5) / 11;
        const px = x + w * t, py = b - 380 + 50 * 4 * t * (1 - t) * 1.0;
        return <path key={i} d={`M${px - 16} ${py} L${px + 16} ${py} L${px} ${py + 28}Z`} fill={[CRIMSON, MUSTARD, TEAL][i % 3]} stroke={INK} strokeWidth={2} />;
      })}
    </g>
  );
};

const Bank: React.FC<{ mood: MoodName }> = ({ mood }) => {
  const { x, w, door } = TOWN.bank;
  const b = TOWN.base;
  const stone = dark(mood) ? "#3e4a64" : "#b9c7d6";
  return (
    <g>
      <rect x={x} y={b - 360} width={w} height={360} fill={stone} />
      <rect x={x - 12} y={b - 372} width={w + 24} height={26} fill={dark(mood) ? "#2f3a52" : "#93a5b8"} stroke={INK} strokeWidth={4} />
      {[x + 50, x + w - 84].map((cx) => <rect key={cx} x={cx} y={b - 340} width={34} height={300} fill={dark(mood) ? "#4f5c78" : "#d6e0ea"} stroke={INK} strokeWidth={4} />)}
      <rect x={door - 80} y={b - 230} width={160} height={230} rx={6} fill="#2b3a44" stroke={INK} strokeWidth={5} />
      <rect x={door - 70} y={b - 220} width={66} height={220} fill="#3b5a6a" />
      <rect x={door + 4} y={b - 220} width={66} height={220} fill="#3b5a6a" />
      {/* a coin over the door: the bank's sign */}
      <circle cx={door} cy={b - 290} r={34} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <circle cx={door} cy={b - 290} r={20} fill="none" stroke={INK} strokeWidth={3} opacity={0.6} />
    </g>
  );
};

const Salon: React.FC<{ mood: MoodName; frame: number; o: TownOptions }> = ({ mood, frame, o }) => {
  const { x, w, win, door } = TOWN.salon;
  const b = TOWN.base;
  const lit = mood === "dusk" || dark(mood);
  return (
    <g>
      <rect x={x} y={b - 380} width={w} height={380} fill={dark(mood) ? "#5a4560" : "#f4c6d4"} />
      {/* striped awning */}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${x + i * (w / 9)} ${b - 330} h${w / 9} l6 64 h${-w / 9}Z`} fill={i % 2 ? PAPER : "#e05a7f"} stroke={INK} strokeWidth={3} />
      ))}
      {/* the window: a chair, a mirror, maybe a customer and a stylist */}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} fill={lit ? "#ffe9b8" : "#d7ecef"} stroke="#2b3a44" strokeWidth={10} />
      <rect x={win.x + 30} y={win.y + 30} width={70} height={110} rx={30} fill="#bfe3e6" stroke={INK} strokeWidth={4} />
      <rect x={win.x + 120} y={win.y + 150} width={70} height={14} rx={5} fill={INK} />
      <rect x={win.x + 150} y={win.y + 164} width={10} height={56} fill={STEEL_DARK} />
      <path d={`M${win.x + 122} ${win.y + 150} V${win.y + 100} Q${win.x + 124} ${win.y + 86} ${win.x + 140} ${win.y + 86} H${win.x + 176}`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      {o.salonFull && (
        <g>
          <Figure x={win.x + 160} y={win.y + 210} scale={0.42} facing={-1} pose={{ ...STAND, legB: [88, -88], legF: [92, -92] }} head={WORKER_HEADS[4]} coat="#f3e9d7" mouth="smile" time={frame} />
          <circle cx={win.x + 160} cy={win.y + 92} r={18} fill="none" stroke="#fff" strokeWidth={0} />
        </g>
      )}
      {/* the price on the glass: the old one, crossed, and three times it, underlined */}
      {o.price > 0 && (
        <g fontFamily={FONT} fontWeight={800} fill={CRIMSON}>
          <text x={win.x + 26} y={win.y + 200} fontSize={34} opacity={0.6}>$10</text>
          <line x1={win.x + 22} y1={win.y + 190} x2={win.x + 90} y2={win.y + 186} stroke={CRIMSON} strokeWidth={5} />
          <g clipPath="url(#town-price)">
            <text x={win.x + 112} y={win.y + 72} fontSize={58}>$30</text>
          </g>
          <defs><clipPath id="town-price"><rect x={win.x + 100} y={win.y + 10} width={130 * Math.min(1, o.price / 0.8)} height={80} /></clipPath></defs>
          {o.price > 0.85 && <path d={`M${win.x + 110} ${win.y + 86} q60 ${-6} ${120 * Math.min(1, (o.price - 0.85) / 0.15)} 2`} stroke={CRIMSON} strokeWidth={7} fill="none" strokeLinecap="round" />}
        </g>
      )}
      {/* the door and the barber pole */}
      <rect x={door - 40} y={b - 210} width={80} height={210} fill="#2b3a44" stroke={INK} strokeWidth={5} />
      <rect x={door - 30} y={b - 196} width={60} height={110} fill={lit ? "#ffe9b8" : "#cfe3ea"} opacity={0.8} />
      <g>
        <rect x={door + 56} y={b - 300} width={26} height={120} rx={12} fill={PAPER} stroke={INK} strokeWidth={4} />
        <clipPath id="town-pole"><rect x={door + 56} y={b - 300} width={26} height={120} rx={12} /></clipPath>
        <g clipPath="url(#town-pole)">
          {Array.from({ length: 8 }, (_, i) => {
            const y0 = b - 330 + i * 30 + ((frame * 1.2) % 30);
            return <path key={i} d={`M${door + 50} ${y0} l40 -24 v12 l-40 24Z`} fill={i % 2 ? CRIMSON : "#3f6fb0"} />;
          })}
        </g>
        <circle cx={door + 69} cy={b - 304} r={12} fill={STEEL_LIGHT} stroke={INK} strokeWidth={3} />
      </g>
      {/* scissors over the door: the sign */}
      <g transform={`translate(${door} ${b - 250})`} stroke={INK} strokeWidth={4} fill="none">
        <circle cx={-14} cy={10} r={9} /><circle cx={14} cy={10} r={9} /><path d="M-8 3 L14 -24 M8 3 L-14 -24" strokeWidth={5} />
      </g>
    </g>
  );
};

const DinerFront: React.FC<{ mood: MoodName }> = ({ mood }) => {
  const { x, w, door } = TOWN.diner;
  const b = TOWN.base;
  const lit = mood === "dusk" || dark(mood);
  return (
    <g>
      <rect x={x} y={b - 360} width={w} height={360} fill={dark(mood) ? "#2c5550" : "#e6dcc2"} />
      <rect x={x} y={b - 380} width={w} height={60} rx={8} fill={TEAL} stroke={INK} strokeWidth={5} />
      {/* the neon cup and a burger: the diner's sign */}
      <g transform={`translate(${x + w / 2} ${b - 350})`} stroke={lit ? "#ff8fa8" : CRIMSON} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d="M-80 -6 h44 q0 30 -22 30 q-22 0 -22 -30Z" /><path d="M-36 2 q14 2 12 12 q-2 8 -14 6" />
        <path d="M24 10 q0 -24 30 -24 q30 0 30 24 Z M22 16 h64" stroke={lit ? "#ffe39a" : MUSTARD} />
      </g>
      <rect x={x + 150} y={b - 290} width={w - 180} height={190} fill={lit ? "#ffe6a8" : "#cfe6f0"} stroke="#2b3a44" strokeWidth={10} />
      {[x + 150 + (w - 180) / 3, x + 150 + (2 * (w - 180)) / 3].map((mx) => <rect key={mx} x={mx - 6} y={b - 290} width={12} height={190} fill="#2b3a44" />)}
      <rect x={x + 140} y={b - 104} width={w - 160} height={14} fill={STEEL} stroke={INK} strokeWidth={3} />
      <rect x={x + 150} y={b - 90} width={w - 180} height={90} fill="#1a6f68" stroke={INK} strokeWidth={4} />
      <rect x={door - 50} y={b - 250} width={100} height={250} fill={TEAL} stroke={INK} strokeWidth={5} />
      <rect x={door - 34} y={b - 230} width={68} height={120} fill={lit ? "#ffe6a8" : "#cfe3ea"} opacity={0.8} />
      <path d={`M${door - 10} ${b - 262} q10 -16 20 0Z`} fill="#e0b84a" stroke={INK} strokeWidth={3} />
    </g>
  );
};

const Bar: React.FC<{ mood: MoodName; frame: number; o: TownOptions }> = ({ mood, frame, o }) => {
  const { x, w, win } = TOWN.bar;
  const b = TOWN.base;
  const lit = o.band || mood === "dusk" || dark(mood);
  return (
    <g>
      <rect x={x} y={b - 420} width={w} height={420} fill={dark(mood) ? "#4a2f34" : "#8a4a3e"} />
      <rect x={x - 10} y={b - 432} width={w + 20} height={24} fill="#5a2f28" stroke={INK} strokeWidth={4} />
      <rect x={win.x} y={win.y} width={win.w} height={win.h} fill={lit ? "#ffd98a" : "#5a4040"} stroke="#2b1f1c" strokeWidth={12} />
      {/* a pint and a note: the sign */}
      <g transform={`translate(${x + w / 2} ${b - 394})`}>
        <path d="M-60 -18 h34 l-4 40 h-26Z" fill={MUSTARD} stroke={INK} strokeWidth={4} />
        <path d="M-60 -18 h34 v8 h-34Z" fill={PAPER} />
        <path d="M24 16 v-34 l34 -8 v32" fill="none" stroke={PAPER} strokeWidth={6} />
        <circle cx={18} cy={18} r={9} fill={PAPER} /><circle cx={52} cy={10} r={9} fill={PAPER} />
      </g>
      {o.band && (
        <g>
          {/* the stage and four musicians (a string quartet), bobbing to the music */}
          <rect x={win.x + 20} y={win.y + 150} width={win.w - 40} height={20} fill="#6b3a2a" />
          {[0, 1, 2, 3].map((i) => {
            const bx = win.x + 70 + i * 100;
            const bob = Math.sin(frame * 0.25 + i) * 3;
            return (
              <g key={i}>
                <Figure x={bx} y={win.y + 152 + bob} scale={0.36} facing={i < 2 ? 1 : -1} pose={{ ...STAND, armF: [100, 30], armB: [60, 60] }}
                  head={WORKER_HEADS[(i * 3 + 2) % WORKER_HEADS.length]} coat="#2a2d33" mouth="smile" time={frame} />
                {i === 3 ? (
                  <g transform={`translate(${bx + 6} ${win.y + 128})`}><ellipse rx={13} ry={22} fill="#a0522d" stroke={INK} strokeWidth={2} /><line x1={0} y1={-22} x2={0} y2={-48} stroke={INK} strokeWidth={3} /></g>
                ) : (
                  <g transform={`translate(${bx + (i < 2 ? 14 : -14)} ${win.y + 100}) rotate(${i < 2 ? -30 : 30})`}><ellipse rx={10} ry={6} fill="#a0522d" stroke={INK} strokeWidth={2} /></g>
                )}
                <line x1={bx - 20} y1={win.y + 96 + Math.sin(frame * 0.5 + i) * 8} x2={bx + 30} y2={win.y + 110 - Math.sin(frame * 0.5 + i) * 8} stroke={INK} strokeWidth={2} />
              </g>
            );
          })}
          {/* every table taken: heads along the bottom of the glass */}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={win.x + 30 + i * 48} cy={win.y + win.h - 26 + Math.sin(frame * 0.2 + i * 2) * 2} r={20} fill={WORKER_HEADS[i % WORKER_HEADS.length]} stroke={INK} strokeWidth={3} />
          ))}
          {/* notes rising */}
          {[0, 1, 2].map((i) => {
            const p = (frame / 60 + i / 3) % 1;
            return <g key={i} transform={`translate(${win.x + 120 + i * 110 + Math.sin(p * 6) * 10} ${win.y + 60 - p * 120})`} opacity={1 - p}><circle cx={0} cy={0} r={9} fill={INK} /><path d="M8 0 V-34 l14 6" stroke={INK} strokeWidth={4} fill="none" /></g>;
          })}
        </g>
      )}
      {/* string lights over the window */}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={win.x + i * 40} cy={win.y - 24 + Math.sin((i / 11) * Math.PI) * 18} r={7} fill={lit ? "#ffe39a" : "#c9b48e"} stroke={INK} strokeWidth={2} />
      ))}
      <rect x={x + w - 110} y={b - 220} width={84} height={220} fill="#2b1f1c" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const Plant: React.FC<{ mood: MoodName; frame: number; o: TownOptions }> = ({ mood, frame, o }) => {
  const { x, gate, gateW } = TOWN.plant;
  const b = TOWN.base;
  const shed = dark(mood) ? "#2a3550" : "#b98a6e";
  const shedDark = dark(mood) ? "#1f2840" : "#8e6552";
  let d = `M${x} ${b} L${x} ${b - 260}`;
  for (let px = x; px < 4200; px += 160) d += ` L${px + 160} ${b - 380} L${px + 160} ${b - 260}`;
  d += ` L4200 ${b}Z`;
  return (
    <g>
      <path d={d} fill={shed} />
      <rect x={gate + 360} y={b - 620} width={70} height={360} fill={shedDark} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={x + 30 + i * 150} y={b - 200} width={100} height={30} rx={4} fill={dark(mood) ? "#f6c768" : "#6b5a52"} opacity={0.85} />)}
      {/* the whistle and its steam */}
      <rect x={gate - 60} y={b - 330} width={16} height={60} fill={shedDark} />
      <rect x={gate - 68} y={b - 344} width={32} height={16} rx={4} fill="#c9a45a" />
      {o.whistle > 0 && [0, 1, 2, 3].map((i) => {
        const p = (frame / 36 + i / 4) % 1;
        return <circle key={i} cx={gate - 52 + Math.sin(i * 2.1) * 12 * p} cy={b - 352 - p * 140} r={12 + p * 34} fill={PAPER} opacity={0.8 * o.whistle * (1 - p)} />;
      })}
      {/* the gate */}
      <rect x={gate - 36} y={b - 240} width={36} height={240} fill={shedDark} stroke={INK} strokeWidth={4} />
      <rect x={gate + gateW} y={b - 240} width={36} height={240} fill={shedDark} stroke={INK} strokeWidth={4} />
      <rect x={gate - 50} y={b - 270} width={gateW + 100} height={34} rx={5} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      <rect x={gate} y={b - 200} width={gateW} height={200} fill={dark(mood) ? "#1a2238" : "#5a5f68"} />
      {[0, 1].map((side) => {
        const lw = (gateW / 2) * (1 - 0.85 * o.gate);
        const lx = side === 0 ? gate : gate + gateW - lw;
        return (
          <g key={side}>
            <rect x={lx} y={b - 190} width={lw} height={190} fill="none" stroke={STEEL} strokeWidth={8} />
            {Array.from({ length: 5 }, (_, k) => <line key={k} x1={lx + (lw * (k + 0.5)) / 5} y1={b - 190} x2={lx + (lw * (k + 0.5)) / 5} y2={b} stroke={STEEL} strokeWidth={5} />)}
          </g>
        );
      })}
    </g>
  );
};

/** Overalls walking out of the gate along the far pavement, toward the diner (leftward). */
const Walkers: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => {
  const n = Math.round(amount * 18);
  return (
    <g>
      {Array.from({ length: n }, (_, k) => {
        const u = (frame / 260 + noise(k + 5) + k / Math.max(1, n)) % 1;
        const x = TOWN.plant.gate + 100 - u * 1500;
        const y = TOWN.base + 6 + (k % 3) * 14;
        return <Figure key={k} x={x} y={y} scale={0.62 + (k % 3) * 0.03} facing={-1} pose={walkPose(frame * 0.24 + k * 1.7)} head={WORKER_HEADS[k % WORKER_HEADS.length]}
          coat={OVERALLS} mouth="smile" time={frame} />;
      })}
    </g>
  );
};

/** The plumber's van: white, a wrench on its side (no words). Wheels on y, front to the right. */
export const Van: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={-230} cy={6} rx={270} ry={16} fill="#000" opacity={0.25} />
    <path d="M-470 -40 V-250 Q-470 -270 -450 -270 H-120 Q-60 -270 -30 -180 L0 -150 V-40Z" fill="#f3f1ea" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-110 -250 Q-70 -250 -48 -180 H-110Z" fill="#cfe6f0" stroke={INK} strokeWidth={4} />
    <rect x={-470} y={-120} width={470} height={18} fill="#c8a2e8" />
    <g transform="translate(-300 -190) rotate(-40)"><rect x={-8} y={-60} width={16} height={100} rx={6} fill={STEEL} stroke={INK} strokeWidth={4} /><path d="M-22 -60 Q-26 -96 -6 -100 v20 h12 v-20 Q26 -96 22 -60Z" fill={STEEL} stroke={INK} strokeWidth={4} /></g>
    {[-380, -90].map((cx) => <g key={cx}><circle cx={cx} cy={-30} r={40} fill="#24262c" stroke={INK} strokeWidth={5} /><circle cx={cx} cy={-30} r={16} fill="#8a8f96" /></g>)}
  </g>
);

const Back: React.FC<SetProps<TownOptions>> = ({ cam, mood, frame, options: o }) => {
  const isDark = dark(mood);
  return (
    <>
      <Deep cam={cam} depth={0.3} flat><Sky id="town" mood={mood} x={-1600} y={-900} w={6400} h={1400} sunAt={{ x: 400, y: 120 }} /></Deep>
      <Deep cam={cam} depth={0.6} flat>
        {Array.from({ length: 16 }, (_, i) => {
          const bx = -1200 + i * 330;
          const h = 160 + noise(i + 40) * 200;
          return <rect key={i} x={bx} y={TOWN.base - h - 120} width={310} height={h + 140} fill={isDark ? "#2a2f52" : ["#d9c6a8", "#c9b9a4", "#d4c0a0"][i % 3]} opacity={0.9} />;
        })}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Hall mood={mood} />
        <Bank mood={mood} />
        <Salon mood={mood} frame={frame} o={o} />
        <DinerFront mood={mood} />
        <Bar mood={mood} frame={frame} o={o} />
        <Plant mood={mood} frame={frame} o={o} />
        {/* far pavement, road, near pavement */}
        <rect x={-1600} y={TOWN.base} width={6400} height={TOWN.roadTop - TOWN.base} fill={isDark ? "#4a4f60" : "#d9cbb0"} />
        <rect x={-1600} y={TOWN.roadTop - 8} width={6400} height={10} fill="#b7a98f" />
        <rect x={-1600} y={TOWN.roadTop} width={6400} height={TOWN.roadBottom - TOWN.roadTop} fill={isDark ? "#2e313b" : "#5a5f68"} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-1500 + i * 160} y={(TOWN.roadTop + TOWN.roadBottom) / 2 - 4} width={84} height={8} rx={3} fill={PAPER} opacity={0.8} />)}
        <rect x={-1600} y={TOWN.roadBottom} width={6400} height={600} fill={isDark ? "#5a5f70" : "#e3d6bb"} />
        <rect x={-1600} y={TOWN.roadBottom} width={6400} height={12} fill="#b7a98f" />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-1500 + i * 160} y1={TOWN.roadBottom + 12} x2={-1560 + i * 160} y2={1100} stroke="#b7a98f" strokeWidth={3} opacity={0.6} />)}
        {o.van && <Van x={2560} y={TOWN.roadTop + 60} s={0.85} />}
        {o.crowd > 0 && <Walkers frame={frame} amount={o.crowd} />}
        {/* street lamps */}
        {[480, 1960, 2600].map((lx) => (
          <g key={lx}>
            <rect x={lx - 6} y={TOWN.base - 300} width={12} height={300} fill="#3a3f4a" />
            <ellipse cx={lx} cy={TOWN.base - 304} rx={22} ry={12} fill={mood === "dusk" || isDark ? "#ffe6a0" : "#9aa1ab"} stroke={INK} strokeWidth={3} />
          </g>
        ))}
      </Deep>
    </>
  );
};

/** The cheque table on the near pavement, with the stack. */
const Mid: React.FC<SetProps<TownOptions>> = ({ options: o }) => {
  if (!o.table) return null;
  const { x, top } = TOWN.table;
  return (
    <g>
      <rect x={x - 200} y={top} width={400} height={26} rx={6} fill="#a8743f" stroke={INK} strokeWidth={5} />
      <path d={`M${x - 190} ${top + 26} H${x + 190} V${top + 150} H${x - 190}Z`} fill={TEAL} stroke={INK} strokeWidth={5} />
      <path d={`M${x - 190} ${top + 26} H${x + 190} V${top + 60} H${x - 190}Z`} fill="#fff" opacity={0.18} />
      {Array.from({ length: Math.round(2 + 8 * o.stack) }, (_, i) => (
        <rect key={i} x={x - 150 + (i % 2) * 3} y={top - 6 - i * 5} width={150} height={8} rx={2} fill="#e7f3e4" stroke={INK} strokeWidth={2} />
      ))}
      <Cheque x={x + 90} y={top - 8} s={0.22} rot={-8} />
    </g>
  );
};

const lights = (): SetLight[] => [
  { x: TOWN.salon.win.x + 120, y: TOWN.salon.win.y + 110, r: 260, color: "#ffe6a0", strength: 0.3, moods: ["dusk", "night", "lamp"] },
  { x: TOWN.bar.win.x + 220, y: TOWN.bar.win.y + 130, r: 380, color: "#ffc870", strength: 0.38, moods: ["day", "dusk", "night", "lamp", "morning"] },
  { x: TOWN.diner.x + 300, y: TOWN.base - 200, r: 360, color: "#ffe6a0", strength: 0.3, moods: ["dusk", "night", "lamp"] },
];

const near = (x: number, facing: 1 | -1 = -1) => ({ x, y: 1050, scale: 1.05, facing });
const far = (x: number, facing: 1 | -1 = 1) => ({ x, y: TOWN.base + 8, scale: 0.72, facing });

export const town: SetDef<TownOptions> = {
  name: "town",
  about: "the town's main street: town hall, bank, salon, the diner's front, the bar with a band, the plant gate",
  spots: {
    table: { x: TOWN.table.x, y: 1062, scale: 1.05, facing: 1 },
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`q${i + 1}`, near(470 + i * 150)])),
    near1: near(700, 1), near2: near(1000), near3: near(1300), near4: near(1700), near5: near(2100), near6: near(2500),
    bankDoor: far(TOWN.bank.door), salonDoor: far(TOWN.salon.door - 70), salonWin: far(TOWN.salon.win.x + 160),
    dinerDoor: far(TOWN.diner.door + 20), bar: far(TOWN.bar.x + 120), gate: far(TOWN.plant.gate + TOWN.plant.gateW / 2, -1),
    road: { x: 1500, y: TOWN.roadTop + 70, scale: 0.85, facing: 1 },
  },
  cameras: {
    wide: REF,
    table: { x: 470, y: 700, zoom: 1.45 },
    queue: { x: 760, y: 720, zoom: 1.3 },
    bank: { x: 720, y: 560, zoom: 1.55 },
    salon: { x: 1170, y: 560, zoom: 1.6 },
    diner: { x: 1450, y: 640, zoom: 1.35 },
    bar: { x: 2250, y: 560, zoom: 1.55 },
    van: { x: 2400, y: 640, zoom: 1.3 },
    gate: { x: 2960, y: 600, zoom: 1.25 },
    street: { x: 1900, y: 620, zoom: 1.0 },
  },
  lights,
  defaults: { table: false, stack: 1, band: false, salonFull: false, price: 0, van: false, gate: 0, whistle: 0, crowd: 0 },
  Back,
  Mid,
  example: { camera: "wide", options: { table: true }, cast: [] },
};
