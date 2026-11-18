// Part B's own places (The Whole Town to Make Them Buy), on the kit's SetDef contract so <Place> lights them by mood:
// the plant gate from the road, the town square with its bandstand and a row of shops, the road outside a diner (yours
// or the rival's) with a van or a truck at the kerb, the bank hall with its teller windows, and three small shop
// interiors for the montages (the supermarket, the garage, the salon). Plus the vehicles and small props they use.
// Everything drawn in code, in REF coordinates, in paper layers at depths. No AI images.
import { FONT } from "@whatif/kit/fonts";
import { Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, Sky, Skyline, type SetDef, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { STAND } from "@whatif/kit/rig/pose";
import { Robot } from "../Robot";
import { GLOW, SCREEN, STEEL, STEEL_DARK, STEEL_LIGHT, Tile_ } from "./bits";

const dark = (m: MoodName) => OUTSIDE[m].dark;

// ---- Small props and vehicles -----------------------------------------------------------------------------------

/** A steel worker's head alone (screen face, two happy arcs, antenna): for the back of a truck or a shop window. */
export const MiniBot: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} y1={-22} x2={0} y2={-36} stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-39} r={5} fill={MUSTARD} stroke={INK} strokeWidth={3} />
    <rect x={-30} y={-23} width={60} height={46} rx={12} fill={STEEL} stroke={INK} strokeWidth={4} />
    <rect x={-22} y={-15} width={44} height={31} rx={7} fill={SCREEN} />
    <path d="M-14 5 q5 -8 10 0 M4 5 q5 -8 10 0" fill="none" stroke={GLOW} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** A flatbed truck facing right, wheels on y; `bots` steel heads in the back, bobbing together on `frame`. */
export const Truck: React.FC<{ x: number; y: number; s?: number; bots?: number; color?: string; frame?: number; lit?: boolean }> = ({
  x, y, s = 1, bots = 0, color = "#5f7f9a", frame = 0, lit,
}) => {
  const bob = Math.sin(frame * 0.35) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={370} ry={16} fill="#000" opacity={0.22} />
      {Array.from({ length: bots }, (_, i) => {
        const row = i % 2;
        const col = Math.floor(i / 2);
        const n = Math.ceil(bots / 2);
        return <MiniBot key={i} x={-310 + ((col + 0.5) * 440) / n + row * 26} y={-200 - row * 18 + bob} s={1.05} />;
      })}
      <rect x={-350} y={-176} width={500} height={120} rx={8} fill={color} stroke={INK} strokeWidth={6} />
      {[-300, -180, -60, 60].map((px) => <rect key={px} x={px} y={-160} width={80} height={86} rx={6} fill="#000" opacity={0.12} />)}
      <path d="M160 -56 V-232 Q160 -252 180 -252 H276 Q318 -252 338 -192 L354 -150 V-56Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M182 -236 H272 Q300 -236 318 -178 H182Z" fill={lit ? "#ffe9b0" : "#bfe6ee"} stroke={INK} strokeWidth={4} />
      <rect x={-360} y={-62} width={720} height={22} rx={6} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      <circle cx={350} cy={-90} r={10} fill={lit ? "#fff1b8" : PAPER} stroke={INK} strokeWidth={3} />
      {[-250, -120, 262].map((wx) => (
        <g key={wx}><circle cx={wx} cy={-30} r={42} fill={INK} /><circle cx={wx} cy={-30} r={16} fill={STEEL_LIGHT} /></g>
      ))}
    </g>
  );
};

/** A van facing right, wheels on y: the plumber's (white, a crimson stripe, a wrench) or the news van (navy, a dish). */
export const Van: React.FC<{ x: number; y: number; s?: number; kind: "plumber" | "news"; facing?: 1 | -1 }> = ({ x, y, s = 1, kind, facing = 1 }) => {
  const body = kind === "news" ? "#2f3a5f" : "#eef1f2";
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <ellipse cx={0} cy={6} rx={320} ry={14} fill="#000" opacity={0.22} />
      {kind === "news" && (
        <g>
          <rect x={-120} y={-372} width={14} height={60} fill={STEEL_DARK} />
          <path d="M-190 -420 Q-110 -340 -30 -420 Z" fill={STEEL_LIGHT} stroke={INK} strokeWidth={5} transform="rotate(-18 -110 -390)" />
          <rect x={20} y={-400} width={10} height={90} fill={STEEL_DARK} />
          <circle cx={25} cy={-404} r={9} fill={CRIMSON} stroke={INK} strokeWidth={3} />
        </g>
      )}
      <path d="M-300 -50 V-296 Q-300 -316 -280 -316 H150 Q200 -316 230 -256 L296 -150 V-50Z" fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M160 -296 Q196 -296 218 -250 L262 -160 H160Z" fill="#bfe6ee" stroke={INK} strokeWidth={4} />
      {kind === "plumber" ? (
        <g>
          <rect x={-300} y={-170} width={460} height={30} fill={CRIMSON} />
          <g transform="translate(-80 -236) rotate(-35) scale(0.5)">
            <rect x={-10} y={-120} width={20} height={150} rx={8} fill={STEEL} stroke={INK} strokeWidth={5} />
            <path d="M-30 -120 Q-34 -170 -8 -178 L-8 -148 L8 -148 L8 -178 Q34 -170 30 -120Z" fill={STEEL} stroke={INK} strokeWidth={5} />
          </g>
        </g>
      ) : (
        <g>
          <rect x={-300} y={-120} width={460} height={18} fill="#f4a6c0" />
          <g transform="translate(-60 -230)">
            <circle r={44} fill="#f4a6c0" stroke={INK} strokeWidth={5} />
            <rect x={-8} y={-22} width={16} height={40} rx={6} fill="#2a2d33" />
            <circle cx={0} cy={-26} r={12} fill="#4a4e57" />
          </g>
        </g>
      )}
      <line x1={60} y1={-300} x2={60} y2={-60} stroke={INK} strokeWidth={3} opacity={0.4} />
      {[-190, 190].map((wx) => (
        <g key={wx}><circle cx={wx} cy={-30} r={42} fill={INK} /><circle cx={wx} cy={-30} r={16} fill={STEEL_LIGHT} /></g>
      ))}
    </g>
  );
};

/** A car, side on, facing right, wheels on y. `lights` on or off (a lot of cars with no lights on). */
export const Car: React.FC<{ x: number; y: number; s?: number; color?: string; lights?: boolean }> = ({ x, y, s = 1, color = "#e6a0a0", lights }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-170 -36 V-80 Q-170 -96 -150 -100 L-90 -106 L-50 -150 H70 L120 -104 L160 -96 Q176 -92 176 -76 V-36Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-76 -106 L-44 -138 H-4 V-106Z M10 -106 V-138 H62 L96 -106Z" fill="#bfe6ee" stroke={INK} strokeWidth={4} />
    <circle cx={166} cy={-74} r={8} fill={lights ? "#fff1b8" : "#6b6b60"} />
    {[-104, 112].map((wx) => (
      <g key={wx}><circle cx={wx} cy={-30} r={30} fill={INK} /><circle cx={wx} cy={-30} r={11} fill={STEEL_LIGHT} /></g>
    ))}
  </g>
);

/** The 1914 car: tall, black, spoked wheels, a bulb horn. Wheels on y, facing right. */
export const OldCar: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-150} width={170} height={80} rx={6} fill="#2a2a2e" stroke={INK} strokeWidth={5} />
    <path d="M-160 -150 V-250 H30 V-150" fill="none" stroke="#2a2a2e" strokeWidth={10} />
    <rect x={-170} y={-262} width={210} height={18} rx={6} fill="#2a2a2e" />
    <path d="M20 -70 V-130 H120 Q150 -130 150 -100 V-70Z" fill="#2a2a2e" stroke={INK} strokeWidth={5} />
    <rect x={-170} y={-82} width={340} height={14} rx={6} fill="#1a1a1e" />
    <circle cx={150} cy={-118} r={12} fill="#d9c8a0" stroke={INK} strokeWidth={3} />
    {[-110, 110].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-40} r={42} fill="none" stroke={INK} strokeWidth={10} />
        {Array.from({ length: 6 }, (_, k) => <line key={k} x1={wx} y1={-40} x2={wx + Math.cos(k) * 38} y2={-40 + Math.sin(k) * 38} stroke={INK} strokeWidth={3} />)}
      </g>
    ))}
  </g>
);

/** The key to the town, the size of a loaf, gripped at the origin. */
export const BigKey: React.FC<{ s?: number; rot?: number }> = ({ s = 1, rot = -30 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <circle cx={-70} cy={0} r={46} fill={MUSTARD} stroke={INK} strokeWidth={6} />
    <circle cx={-70} cy={0} r={20} fill="#b07a1e" stroke={INK} strokeWidth={4} />
    <rect x={-26} y={-12} width={180} height={24} rx={6} fill={MUSTARD} stroke={INK} strokeWidth={6} />
    <path d="M110 12 V44 H130 V12 M140 12 V34 H156 V12" fill={MUSTARD} stroke={INK} strokeWidth={5} />
  </g>
);

/** A clipboard, gripped at the origin. */
export const Clipboard: React.FC<{ s?: number; rot?: number; signed?: number }> = ({ s = 1, rot = -10, signed = 1 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <rect x={-40} y={-120} width={110} height={140} rx={8} fill="#b5885a" stroke={INK} strokeWidth={5} />
    <rect x={-30} y={-104} width={90} height={116} fill={PAPER} />
    <rect x={-6} y={-128} width={42} height={16} rx={4} fill={STEEL} stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((i) => <rect key={i} x={-22} y={-90 + i * 18} width={70 - i * 12} height={7} rx={3} fill={INK} opacity={0.35} />)}
    <path d="M-20 -6 q10 -18 18 -2 q8 14 16 -6 q8 -14 18 4" fill="none" stroke="#2c3f8f" strokeWidth={4} strokeLinecap="round"
      strokeDasharray="80" strokeDashoffset={80 * (1 - signed)} />
  </g>
);

/** A pay envelope, gripped at the origin. */
export const Envelope: React.FC<{ s?: number; rot?: number; empty?: boolean }> = ({ s = 1, rot = -8, empty }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <rect x={-10} y={-60} width={120} height={74} rx={5} fill={empty ? "#e9e2d0" : "#d9c08a"} stroke={INK} strokeWidth={5} />
    <path d="M-10 -60 L50 -20 L110 -60" fill="none" stroke={INK} strokeWidth={4} />
    {!empty && <rect x={20} y={-74} width={60} height={20} rx={3} fill="#8fcf8a" stroke={INK} strokeWidth={3} />}
  </g>
);

/** The steel assistant's grip on the mayor's sash: a crimson band with a gold rosette, gripped at the origin. */
export const SashHeld: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 0 Q40 50 10 110" fill="none" stroke={INK} strokeWidth={28} strokeLinecap="round" />
    <path d="M0 0 Q40 50 10 110" fill="none" stroke={CRIMSON} strokeWidth={21} strokeLinecap="round" />
    <circle cx={22} cy={60} r={12} fill={MUSTARD} stroke={INK} strokeWidth={3} />
  </g>
);

/** Scissors, gripped at the origin, blades up. `snip` 0..1 opens them. */
export const Scissors: React.FC<{ s?: number; snip?: number }> = ({ s = 1, snip = 0 }) => (
  <g transform={`scale(${s})`}>
    {[-1, 1].map((k) => (
      <g key={k} transform={`rotate(${k * (6 + snip * 14)})`}>
        <path d={`M0 0 L${k * 6} -90`} stroke={STEEL_LIGHT} strokeWidth={9} strokeLinecap="round" />
        <circle cx={k * 12} cy={18} r={12} fill="none" stroke={CRIMSON} strokeWidth={6} />
      </g>
    ))}
  </g>
);

// ---- The plant gate, from the road --------------------------------------------------------------------------------

export interface GateOptions {
  /** The gate's leaves, 0 shut to 1 open. */
  gate: number;
  /** The whistle's steam, 0..1. */
  whistle: number;
  /** A price board on the plant wall with split-flap tiles: null for none, else 0 (full) to 1 (halved). */
  price: number | null;
  /** The plant's lights after dark. */
  plant: "working" | "dark";
}

const G = { left: 860, right: 1200, base: 1000, top: 430 };

const GateBack: React.FC<SetProps<GateOptions>> = ({ cam, mood, frame, options: o }) => {
  const d = dark(mood);
  const lit = o.plant === "working" && lightsOn(mood);
  const wall = d ? "#3a4560" : mood === "dusk" ? "#8a6e86" : "#c99a7a";
  const shed = d ? "#26304a" : mood === "dusk" ? "#6e5f86" : "#a97a62";
  const teeth = (from: number, to: number, base: number) => {
    let p = `M${from} ${base} L${from} ${base - 120}`;
    for (let x = from; x < to; x += 160) p += ` L${x + 160} ${base - 210} L${x + 160} ${base - 120}`;
    return `${p} L${to} ${base - 120} L${to} ${base} Z`;
  };
  return (
    <>
      <Deep cam={cam} depth={0.15} flat><Sky id="gate" mood={mood} x={-1400} y={-800} w={4800} h={1500} sunAt={{ x: 1500, y: 200 }} /></Deep>
      <Deep cam={cam} depth={0.32} flat><Skyline mood={mood} from={-1400} to={3400} base={560} tall={260} seed={3} /></Deep>
      <Deep cam={cam} depth={0.7} flat>
        {/* the yard through the gate: a far shed, the yard's ground */}
        <rect x={G.left} y={500} width={G.right - G.left} height={600} fill={d ? "#2a3048" : "#d9cbb0"} />
        <rect x={G.left} y={500} width={G.right - G.left} height={190} fill={shed} />
        {Array.from({ length: 3 }, (_, i) => <rect key={i} x={G.left + 30 + i * 105} y={600} width={70} height={22} rx={3} fill={lit ? "#f6c768" : d ? "#1d2438" : "#7a5a4a"} />)}
        {/* the sheds and the wall either side */}
        <path d={teeth(-1400, G.left - 40, 560)} fill={shed} />
        <path d={teeth(G.right + 40, 3400, 560)} fill={shed} />
        <path fillRule="evenodd" fill={wall} d={`M-1400 540 H3400 V1300 H-1400Z M${G.left} ${G.top} H${G.right} V1300 H${G.left}Z`} />
        {Array.from({ length: 34 }, (_, i) => {
          const x = -1300 + i * 140;
          if (x > G.left - 120 && x < G.right + 40) return null;
          return <rect key={i} x={x} y={600} width={90} height={26} rx={4} fill={lit ? "#f6c768" : d ? "#1d2438" : "#e4c7a8"} opacity={0.9} />;
        })}
        {/* the chimney and its smoke, the whistle */}
        <rect x={1560} y={120} width={64} height={330} fill={shed} />
        <rect x={1550} y={110} width={84} height={20} fill={shed} />
        {o.plant === "working" && [0, 1, 2].map((i) => {
          const p = (frame / 80 + i / 3) % 1;
          return <circle key={i} cx={1592 + p * 140} cy={90 - p * 160} r={24 + p * 40} fill={d ? "#3a4766" : "#e3e6ec"} opacity={0.55 * (1 - p)} />;
        })}
        <rect x={500} y={330} width={18} height={50} fill={shed} />
        <rect x={488} y={318} width={42} height={18} rx={5} fill={d ? "#8a7a5a" : "#c9a45a"} />
        {o.whistle > 0 && [0, 1, 2, 3].map((i) => {
          const p = (frame / 30 + i / 4) % 1;
          return <circle key={i} cx={509 + Math.sin(i * 2) * 14 * p} cy={300 - p * 140} r={14 + p * 34} fill={PAPER} opacity={0.8 * o.whistle * (1 - p)} />;
        })}
        {/* the gate posts, lamps, the blank sign with a gear */}
        <rect x={G.left - 50} y={G.top - 30} width={50} height={1300} fill={shed} stroke={INK} strokeWidth={4} />
        <rect x={G.right} y={G.top - 30} width={50} height={1300} fill={shed} stroke={INK} strokeWidth={4} />
        <rect x={G.left - 70} y={G.top - 90} width={G.right - G.left + 140} height={64} rx={8} fill={d ? "#3a4766" : STEEL_DARK} stroke={INK} strokeWidth={5} />
        <g transform={`translate(${(G.left + G.right) / 2} ${G.top - 58})`}>
          <circle r={22} fill={MUSTARD} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-5} y={-32} width={10} height={14} fill={MUSTARD} stroke={INK} strokeWidth={3} transform={`rotate(${k * 45})`} />)}
          <circle r={8} fill={INK} />
        </g>
        {[G.left - 25, G.right + 25].map((x) => <circle key={x} cx={x} cy={G.top - 44} r={12} fill={lightsOn(mood) ? "#ffe39a" : "#bdb39a"} stroke={INK} strokeWidth={3} />)}
        {[0, 1].map((side) => {
          const w = ((G.right - G.left) / 2) * (1 - 0.86 * o.gate);
          const x = side === 0 ? G.left : G.right - w;
          return (
            <g key={side}>
              <rect x={x} y={G.top + 40} width={w} height={G.base - G.top - 40} fill="none" stroke={d ? "#5a6888" : "#55616c"} strokeWidth={9} />
              {Array.from({ length: 6 }, (_, k) => <line key={k} x1={x + (w * (k + 0.5)) / 6} y1={G.top + 40} x2={x + (w * (k + 0.5)) / 6} y2={G.base} stroke={d ? "#5a6888" : "#55616c"} strokeWidth={6} />)}
            </g>
          );
        })}
        {o.price !== null && <PriceBoard x={150} y={250} k={o.price} frame={frame} />}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={930} width={4800} height={140} fill={d ? "#4a4f63" : "#d8cdb5"} />
        <rect x={-1400} y={930} width={4800} height={10} fill={d ? "#3a3f52" : "#bfb299"} />
        <rect x={-1400} y={1070} width={4800} height={600} fill={d ? "#2a2e3c" : "#5a5f68"} />
      </Deep>
    </>
  );
};

/** The plant's price board: a car and four split-flap tiles of dollar signs that flip down to two (`k` 0..1). */
export const PriceBoard: React.FC<{ x: number; y: number; k: number; frame: number }> = ({ x, y, k, frame }) => {
  const n = k < 0.5 ? 4 : 2;
  const spin = k > 0.35 && k < 0.6 ? Math.floor(frame / 2) % 2 : -1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={560} height={260} rx={12} fill={INK} stroke={PAPER} strokeWidth={6} />
      <Car x={140} y={190} s={0.62} color="#7fa0c4" lights />
      {Array.from({ length: 4 }, (_, i) => (
        <Tile_ key={i} x={300 + i * 64} y={128} s={0.48} ch={spin >= 0 ? (i + spin) % 2 ? "$" : "" : i < n ? "$" : ""} />
      ))}
    </g>
  );
};

export const plantGate: SetDef<GateOptions> = {
  name: "plant-gate",
  about: "the car plant's gate from the road: sawtooth sheds, the chimney, the gate with a blank gear sign, the pavement",
  spots: {
    /** Left of the gate, near the camera. */
    near: { x: 560, y: 1010, scale: 1.3, facing: 1 },
    /** In front of the gate. */
    gate: { x: 1030, y: 1000, scale: 1.25, facing: -1 },
    /** Right of the gate, near the camera. */
    right: { x: 1460, y: 1010, scale: 1.3, facing: -1 },
  },
  cameras: { wide: REF, near: { x: 760, y: 700, zoom: 1.45 }, gate: { x: 1030, y: 640, zoom: 1.35 } },
  lights: () => [
    { x: G.left - 25, y: G.top - 44, depth: 0.7, r: 260, color: "#ffe39a", strength: 0.4, moods: LIGHTS_ON },
    { x: G.right + 25, y: G.top - 44, depth: 0.7, r: 260, color: "#ffe39a", strength: 0.4, moods: LIGHTS_ON },
  ],
  defaults: { gate: 0, whistle: 0, price: null, plant: "working" },
  Back: GateBack,
  example: { camera: "wide", cast: [] },
};

/** Where a steel worker walking in at the gate is at progress u 0..1: along the pavement from the right, then through
 *  the gate, smaller as it goes in. */
export function gateWalk(u: number) {
  const a = Math.min(1, u / 0.6);
  const b = Math.max(0, (u - 0.6) / 0.4);
  return { dx: 760 * (1 - a), dy: -150 * b, scale: 1.25 - 0.55 * b, gone: u >= 1 };
}

// ---- The town square ------------------------------------------------------------------------------------------------

export type ShopWindows = "plain" | "robots" | "sale" | "dark";

export interface SquareOptions {
  /** What every shop window shows. */
  windows: ShopWindows;
  /** The convoy on the road behind: the lead truck's x, or null for none. */
  convoy: number | null;
  /** The bandstand's booth door, 0 shut to 1 open; the chime's frames since it opened (-1 still). */
  door: number;
  chime: number;
  /** Bunting over the square (the key-to-the-town ceremony). */
  bunting: boolean;
}

const SHOP_KINDS = [
  { body: "#9fd8a8", sign: "#2f7a4a", icon: "cart" },
  { body: "#c9c3b5", sign: "#4f5f6a", icon: "wrench" },
  { body: "#e8dcc4", sign: "#6b5a8a", icon: "coin" },
  { body: "#a8e6cf", sign: "#e85f6f", icon: "cup" },
  { body: "#f4c6d4", sign: "#b0507a", icon: "comb" },
  { body: "#e6cd98", sign: "#8a5a2a", icon: "loaf" },
] as const;

const ShopIcon: React.FC<{ kind: string }> = ({ kind }) => {
  switch (kind) {
    case "cart": return <g fill="none" stroke={PAPER} strokeWidth={6} strokeLinecap="round"><path d="M-30 -14 H-20 L-10 14 H22 L30 -6 H-16" /><circle cx={-6} cy={22} r={4} /><circle cx={18} cy={22} r={4} /></g>;
    case "wrench": return <path d="M-26 20 L14 -20 M8 -28 Q30 -30 26 -10" fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" />;
    case "coin": return <g><circle r={20} fill={MUSTARD} stroke={PAPER} strokeWidth={4} /><circle r={9} fill="none" stroke={INK} strokeWidth={3} /></g>;
    case "cup": return <path d="M-22 -14 H18 Q18 20 -2 20 Q-22 20 -22 -14Z M18 -6 Q32 -4 28 8 Q24 14 16 12" fill="none" stroke={PAPER} strokeWidth={6} />;
    case "comb": return <g><rect x={-26} y={-12} width={52} height={10} fill={PAPER} />{Array.from({ length: 7 }, (_, i) => <rect key={i} x={-24 + i * 8} y={-2} width={4} height={18} fill={PAPER} />)}</g>;
    default: return <ellipse rx={28} ry={16} fill={PAPER} />;
  }
};

/** One shopfront, 380 wide, base at 780 (in its layer). */
const Shop: React.FC<{ x: number; i: number; mood: MoodName; windows: ShopWindows }> = ({ x, i, mood, windows }) => {
  const k = SHOP_KINDS[i % SHOP_KINDS.length];
  const d = dark(mood);
  const h = 330 + noise(i + 2) * 120;
  const glass = windows === "dark" ? "#1d2438" : d ? "#ffe9b0" : "#cfe6ea";
  return (
    <g>
      <rect x={x} y={780 - h} width={370} height={h + 400} fill={d ? "#3a3f68" : k.body} stroke={INK} strokeWidth={4} />
      <rect x={x - 6} y={780 - h - 14} width={382} height={18} fill={d ? "#2a2e50" : "#fff"} opacity={0.5} />
      {Array.from({ length: 3 }, (_, w) => (
        <rect key={w} x={x + 34 + w * 110} y={780 - h + 30} width={80} height={60} rx={4} fill={d ? (noise(i * 7 + w) < 0.5 ? "#ffe39a" : "#1a1f3d") : "rgba(40,50,60,.2)"} />
      ))}
      <rect x={x + 20} y={540} width={330} height={56} rx={6} fill={k.sign} stroke={INK} strokeWidth={4} />
      <g transform={`translate(${x + 185} 568)`}><ShopIcon kind={k.icon} /></g>
      <path d={`M${x + 10} 600 H${x + 360} L${x + 344} 632 H${x + 26}Z`} fill={i % 2 ? CRIMSON : TEAL} stroke={INK} strokeWidth={4} />
      <rect x={x + 40} y={640} width={200} height={140} fill={glass} stroke={INK} strokeWidth={5} />
      <rect x={x + 262} y={640} width={80} height={140} fill={d ? "#2a2e3c" : "#6b4b3a"} stroke={INK} strokeWidth={5} />
      {windows === "robots" && <MiniBot x={x + 140} y={720} s={1.3} />}
      {windows === "sale" && (
        <g transform={`translate(${x + 140} 706) rotate(${(noise(i) - 0.5) * 10})`}>
          <rect x={-86} y={-36} width={172} height={66} fill={PAPER} stroke={CRIMSON} strokeWidth={6} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={CRIMSON}>SALE</text>
        </g>
      )}
    </g>
  );
};

/** The bandstand: platform, posts, roof, a booth door at the back, steps down on its right. */
const Bandstand: React.FC<{ mood: MoodName; door: number; chime: number }> = ({ mood, door, chime }) => {
  const d = dark(mood);
  const wood = d ? "#5a4a5a" : "#f3e9d7";
  const trim = d ? "#2a5a56" : TEAL;
  const swing = chime >= 0 ? Math.sin(chime * 0.55) * 24 * Math.exp(-chime / 22) : 0;
  return (
    <g>
      {/* the booth at the back with its door */}
      <rect x={420} y={470} width={220} height={250} fill={d ? "#4a3f52" : "#e6d6b8"} stroke={INK} strokeWidth={5} />
      <rect x={470} y={520} width={120} height={200} fill={d ? "#1a1f2e" : "#5a4a3a"} />
      <rect x={470} y={520} width={120 * (1 - 0.8 * door)} height={200} fill={trim} stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${swing} 530 470)`}>
        <line x1={530} y1={470} x2={530} y2={490} stroke={INK} strokeWidth={4} />
        <path d="M514 506 Q516 486 530 486 Q544 486 546 506Z" fill="#e0b84a" stroke={INK} strokeWidth={4} />
      </g>
      {/* posts and the roof */}
      {[200, 420, 640, 860].map((x) => <rect key={x} x={x - 10} y={400} width={20} height={320} fill={wood} stroke={INK} strokeWidth={4} />)}
      <path d="M150 410 L530 250 L910 410 Z" fill={CRIMSON} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M150 410 H910" stroke={trim} strokeWidth={18} />
      <circle cx={530} cy={244} r={14} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      {/* railing, platform, skirt, steps */}
      <rect x={180} y={700} width={700} height={26} fill={wood} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 13 }, (_, i) => <rect key={i} x={200 + i * 52} y={640} width={10} height={60} fill={wood} stroke={INK} strokeWidth={2} />)}
      <rect x={190} y={632} width={300} height={12} fill={wood} stroke={INK} strokeWidth={3} />
      <rect x={180} y={726} width={700} height={214} fill={trim} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${210 + i * 112} 760 l40 0 l-20 150z`} fill="#000" opacity={0.12} />)}
      {[0, 1, 2, 3].map((s) => (
        <rect key={s} x={880 + s * 40} y={726 + s * 54} width={160 - s * 40 + 40} height={54} fill={wood} stroke={INK} strokeWidth={4} />
      ))}
    </g>
  );
};

const Bunting: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <path d={`M-200 ${y} Q500 ${y + 90} 1100 ${y} Q1700 ${y + 90} 2300 ${y}`} fill="none" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 30 }, (_, i) => {
      const x = -180 + i * 84;
      const yy = y + 50 * Math.sin(((x + 200) % 1200) / 1200 * Math.PI) + 4;
      return <path key={i} d={`M${x - 20} ${yy} L${x + 20} ${yy} L${x} ${yy + 40}Z`} fill={[CRIMSON, MUSTARD, TEAL, PAPER][i % 4]} stroke={INK} strokeWidth={2} />;
    })}
  </g>
);

const SquareBack: React.FC<SetProps<SquareOptions>> = ({ cam, mood, frame, options: o }) => {
  const d = dark(mood);
  return (
    <>
      <Deep cam={cam} depth={0.15} flat><Sky id="square" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 1300, y: 160 }} /></Deep>
      <Deep cam={cam} depth={0.3} flat><Skyline mood={mood} from={-1400} to={3400} base={520} tall={240} seed={5} /></Deep>
      <Deep cam={cam} depth={0.62}>
        {Array.from({ length: 10 }, (_, i) => <Shop key={i} x={-1000 + i * 390} i={i} mood={mood} windows={o.windows} />)}
        <rect x={-1400} y={780} width={4800} height={600} fill={d ? "#3a3f52" : "#cfc4ab"} />
      </Deep>
      <Deep cam={cam} depth={0.82}>
        <rect x={-1400} y={770} width={4800} height={110} fill={d ? "#23263a" : "#5a5f68"} />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1300 + i * 160} y={822} width={80} height={7} rx={3} fill={PAPER} opacity={d ? 0.35 : 0.8} />)}
        {o.convoy !== null && [0, 1, 2].map((k) => (
          <Truck key={k} x={o.convoy! - k * 820} y={870} s={0.6} bots={6} frame={frame} lit={lightsOn(mood)} color={["#5f7f9a", "#7a6a9a", "#5f8a7a"][k]} />
        ))}
        <rect x={-1400} y={872} width={4800} height={600} fill={d ? "#4a4f63" : "#d9cfb7"} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={900} width={4800} height={800} fill={d ? "#555a6c" : "#e2d8c0"} />
        <path d={Array.from({ length: 40 }, (_, i) => `M${-1400 + i * 130} 900 L${-1500 + i * 130} 1700`).join("")} stroke="#000" strokeWidth={3} opacity={0.07} />
        {[1280, 1900].map((x) => (
          <g key={x}>
            <rect x={x - 7} y={520} width={14} height={400} fill={INK} />
            <circle cx={x} cy={510} r={22} fill={lightsOn(mood) ? "#ffe6a0" : "#c9c3b5"} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        <Bandstand mood={mood} door={o.door} chime={o.chime} />
        {o.bunting && <Bunting y={150} />}
      </Deep>
    </>
  );
};

export const square: SetDef<SquareOptions> = {
  name: "town-square",
  about: "the town square: a bandstand with a booth door and steps, a row of shops behind a road, street lamps",
  spots: {
    /** On the bandstand, at its front rail. */
    stage: { x: 760, y: 720, scale: 1, facing: 1 },
    /** On the steps, halfway down. */
    steps: { x: 960, y: 834, scale: 1.08, facing: 1 },
    /** In the booth's doorway. */
    booth: { x: 530, y: 720, scale: 0.95, facing: 1 },
    /** On the square, right of the steps. */
    near: { x: 1240, y: 1000, scale: 1.25, facing: -1 },
    /** Further right on the square. */
    right: { x: 1620, y: 1000, scale: 1.25, facing: -1 },
    /** Left, in front of the bandstand. */
    left: { x: 360, y: 1030, scale: 1.3, facing: 1 },
  },
  cameras: { wide: REF, steps: { x: 960, y: 640, zoom: 1.45 }, stage: { x: 700, y: 560, zoom: 1.6 }, road: { x: 1400, y: 640, zoom: 1.3 } },
  lights: () => [
    { x: 1280, y: 510, r: 300, color: "#ffe6a0", strength: 0.4, moods: LIGHTS_ON },
    { x: 1900, y: 510, r: 300, color: "#ffe6a0", strength: 0.4, moods: LIGHTS_ON },
  ],
  defaults: { windows: "plain", convoy: null, door: 0, chime: -1, bunting: false },
  Back: SquareBack,
  example: { camera: "wide", cast: [] },
};

// ---- The road outside a diner ------------------------------------------------------------------------------------

export interface RoadOptions {
  /** Whose diner: yours (teal and cream) or the rival's (mint and red). */
  which: "yours" | "rival";
  /** A van at the kerb, or null. */
  van: "plumber" | "news" | null;
  /** The van's x (its centre). */
  vanX: number;
  /** A truck at the kerb with steel cooks in the back: its x, or null. */
  truck: number | null;
  truckBots: number;
}

const RoadBack: React.FC<SetProps<RoadOptions>> = ({ cam, mood, frame, options: o }) => {
  const d = dark(mood);
  const rival = o.which === "rival";
  const body = d ? "#2c4a50" : rival ? "#a8e6cf" : "#f3e9d7";
  const trim = rival ? "#e85f6f" : TEAL;
  return (
    <>
      <Deep cam={cam} depth={0.15} flat><Sky id="road" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 1600, y: 150 }} /></Deep>
      <Deep cam={cam} depth={0.32} flat><Skyline mood={mood} from={-1400} to={3400} base={560} tall={300} seed={rival ? 8 : 2} /></Deep>
      <Deep cam={cam} depth={0.78}>
        {/* the neighbours, then the diner's front: an awning, the long window lit inside, the door, a neon cup */}
        <rect x={1460} y={260} width={900} height={1000} fill={d ? "#3a3f68" : "#dc9d8f"} stroke={INK} strokeWidth={4} />
        {Array.from({ length: 6 }, (_, w) => <rect key={w} x={1520 + (w % 3) * 130} y={320 + Math.floor(w / 3) * 150} width={90} height={90} rx={4} fill={d ? "#ffe39a" : "rgba(40,50,60,.2)"} />)}
        <rect x={-600} y={300} width={2060} height={1000} fill={body} stroke={INK} strokeWidth={5} />
        <rect x={-600} y={300} width={2060} height={40} fill={trim} />
        <path d={Array.from({ length: 22 }, (_, i) => `M${-560 + i * 96} 420 h48 l-10 54 h-48z`).join("")} fill={trim} />
        <path d="M-600 420 H1460" stroke={INK} strokeWidth={4} />
        <rect x={300} y={500} width={1000} height={300} fill={d ? "#ffdf9a" : "#fff1d0"} stroke={INK} strokeWidth={10} />
        <rect x={300} y={700} width={1000} height={30} fill={TEAL} opacity={0.8} />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={360 + i * 120} cy={762} r={22} fill={TEAL} opacity={0.7} />)}
        {[633, 966].map((x) => <rect key={x} x={x - 7} y={500} width={14} height={300} fill={INK} />)}
        <rect x={60} y={480} width={180} height={340} fill={trim} stroke={INK} strokeWidth={6} />
        <rect x={86} y={510} width={128} height={150} fill="#cfe3ea" opacity={0.7} />
        <g transform="translate(800 380)" stroke={d ? "#ff8fa8" : CRIMSON} strokeWidth={8} fill="none" strokeLinecap="round">
          <path d="M-40 0 H34 Q34 56 -3 56 Q-40 56 -40 0Z" /><path d="M34 10 Q60 12 56 32 Q50 44 30 40" />
        </g>
        <rect x={-1400} y={820} width={4800} height={80} fill={d ? "#4a4f63" : "#d9cfb7"} />
      </Deep>
      <Deep cam={cam} depth={0.92}>
        <rect x={-1400} y={880} width={4800} height={18} fill={d ? "#3a3f52" : "#bfb299"} />
        <rect x={-1400} y={896} width={4800} height={800} fill={d ? "#2a2e3c" : "#5a5f68"} />
        {o.van && <Van x={o.vanX} y={930} s={0.95} kind={o.van} />}
        {o.truck !== null && <Truck x={o.truck} y={940} s={0.95} bots={o.truckBots} frame={frame} color="#7a8a9a" lit={lightsOn(mood)} />}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={960} width={4800} height={700} fill={d ? "#2a2e3c" : "#5a5f68"} />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1300 + i * 160} y={1040} width={90} height={8} rx={3} fill={PAPER} opacity={0.7} />)}
      </Deep>
    </>
  );
};

export const road: SetDef<RoadOptions> = {
  name: "diner-road",
  about: "the road outside a diner (yours or the rival's): awning, the long lit window, the door, a van or a truck at the kerb",
  spots: {
    door: { x: 330, y: 1010, scale: 1.25, facing: 1 },
    near: { x: 720, y: 1020, scale: 1.3, facing: 1 },
    mid: { x: 1060, y: 1020, scale: 1.3, facing: -1 },
    right: { x: 1520, y: 1020, scale: 1.3, facing: -1 },
  },
  cameras: { wide: REF, two: { x: 900, y: 660, zoom: 1.35 }, van: { x: 1300, y: 640, zoom: 1.25 } },
  lights: () => [{ x: 800, y: 650, depth: 0.78, r: 600, color: "#ffe6a0", strength: 0.3, moods: LIGHTS_ON }],
  defaults: { which: "yours", van: null, vanX: 1500, truck: null, truckBots: 8 },
  Back: RoadBack,
  example: { camera: "wide", cast: [] },
};

// ---- The bank hall -------------------------------------------------------------------------------------------------

export interface BankOptions { tellers: number }

const BankBack: React.FC<SetProps<BankOptions>> = ({ cam, mood }) => {
  const d = dark(mood);
  return (
    <>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={d ? "#4a4a5e" : "#efe6d2"} />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect x={-900 + i * 420} y={40} width={70} height={800} fill={d ? "#5a5a70" : "#f8f2e4"} stroke={INK} strokeWidth={4} />
            <rect x={-912 + i * 420} y={30} width={94} height={30} fill={d ? "#5a5a70" : "#e4d8be"} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${-760 + i * 420} 300 V120 Q${-650 + i * 420} 30 ${-540 + i * 420} 120 V300Z`} fill={d ? "#2a2f5a" : "#cfe6ea"} stroke={INK} strokeWidth={5} />
        ))}
        <rect x={-1400} y={-800} width={4800} height={800 + 6} fill={d ? "#3a3a4e" : "#e4d8be"} />
        <rect x={-1400} y={0} width={4800} height={24} fill={MUSTARD} opacity={0.7} />
      </Deep>
      <Deep cam={cam} depth={0.95}>
        {/* the glass partition with a window per teller and a brass grille */}
        <rect x={-1400} y={360} width={4800} height={420} fill="#cfe6ea" opacity={0.28} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i}>
            <rect x={-900 + i * 300} y={360} width={20} height={420} fill="#b08a3e" stroke={INK} strokeWidth={3} />
            <path d={`M${-830 + i * 300} 780 V520 Q${-750 + i * 300} 460 ${-670 + i * 300} 520 V780`} fill="none" stroke="#b08a3e" strokeWidth={8} />
          </g>
        ))}
        <rect x={-1400} y={350} width={4800} height={18} fill="#b08a3e" stroke={INK} strokeWidth={3} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={900} width={4800} height={800} fill={d ? "#6a6878" : "#d8ccb4"} />
        <path d={Array.from({ length: 36 }, (_, i) => `M${-1400 + (i % 2) * 90 + Math.floor(i / 2) * 180} 900 h90 v60 h-90z`).join("")} fill="#000" opacity={0.07} />
      </Deep>
    </>
  );
};

const BankMid: React.FC<SetProps<BankOptions>> = () => (
  <g>
    <rect x={-1400} y={770} width={4800} height={230} fill="#7a5238" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-1360 + i * 200} y={800} width={160} height={170} rx={6} fill="none" stroke="#5a3a24" strokeWidth={6} />)}
    <rect x={-1410} y={756} width={4820} height={24} rx={8} fill="#e8dcc0" stroke={INK} strokeWidth={5} />
  </g>
);

/** Teller windows: tellerN behind the counter (x 300 apart); custN in front of it, to its right, facing it. */
const tellerX = (i: number) => 300 + i * 300;
export const bankHall: SetDef<BankOptions> = {
  name: "bank-hall",
  about: "a bank hall: columns, arched windows, a glass partition with teller windows and a brass grille, a wooden counter",
  spots: {
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`teller${i + 1}`, { x: tellerX(i), y: 900, scale: 1, facing: 1 as const }])),
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`cust${i + 1}`, { x: tellerX(i) + 150, y: 1010, scale: 1.0, facing: -1 as const }])),
  },
  cameras: { wide: REF, close: { x: 760, y: 640, zoom: 1.6 } },
  lights: () => [{ x: 960, y: 200, depth: 0.8, r: 900, color: "#fff4d6", strength: 0.25, moods: ["morning", "day"] }],
  defaults: { tellers: 6 },
  Back: BankBack,
  Mid: BankMid,
  example: { camera: "wide", cast: [] },
};

// ---- Three shop interiors for the montages ----------------------------------------------------------------------

export interface ShopOptions {
  kind: "market" | "garage" | "salon";
  /** Bread on the market's middle shelf, priced in pennies. */
  pennies: boolean;
  /** The garage's steel mechanic on its back under the car, legs out (kicking on `frame`). */
  under: boolean;
}

const ShopBack: React.FC<SetProps<ShopOptions>> = ({ cam, mood, frame, options: o }) => {
  const d = dark(mood);
  const wall = o.kind === "market" ? "#d8eedc" : o.kind === "garage" ? "#c9c9c2" : "#f6d6e0";
  return (
    <>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={d ? "#3a3f52" : wall} />
        {o.kind === "market" && Array.from({ length: 3 }, (_, r) => (
          <g key={r}>
            <rect x={-200} y={260 + r * 200} width={2400} height={22} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
            {Array.from({ length: 22 }, (_, i) => {
              const bread = o.pennies && r === 1;
              const x = -160 + i * 108;
              return bread ? (
                <g key={i}>
                  <ellipse cx={x + 40} cy={232 + r * 200} rx={46} ry={28} fill="#d9963e" stroke={INK} strokeWidth={4} />
                  {[0, 1, 2].map((k) => <path key={k} d={`M${x + 18 + k * 18} 214 l10 22`} transform={`translate(0 ${r * 200})`} stroke="#a8693a" strokeWidth={3} />)}
                  {i % 2 === 0 && (
                    <g transform={`translate(${x + 40} ${300 + r * 200})`}>
                      <rect x={-34} y={-8} width={68} height={40} fill={MUSTARD} stroke={INK} strokeWidth={3} />
                      <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={INK}>1¢</text>
                    </g>
                  )}
                </g>
              ) : (
                <rect key={i} x={x} y={190 + r * 200} width={80} height={70} rx={6} fill={["#e6a0a0", "#9fc0e0", "#f2b632", "#a8c97f"][(i + r) % 4]} stroke={INK} strokeWidth={3} />
              );
            })}
          </g>
        ))}
        {o.kind === "garage" && (
          <g>
            <rect x={-300} y={140} width={900} height={420} fill="#8a8a80" stroke={INK} strokeWidth={5} />
            {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-300} y={160 + i * 40} width={900} height={8} fill="#6b6b62" />)}
            <rect x={800} y={160} width={700} height={300} fill="#b0a890" stroke={INK} strokeWidth={4} />
            {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={830 + (i % 10) * 66} cy={190 + Math.floor(i / 10) * 90} r={6} fill={INK} opacity={0.4} />)}
            {[860, 1000, 1140, 1280].map((x, i) => <rect key={x} x={x} y={210} width={16} height={120 + i * 10} rx={5} fill={STEEL} stroke={INK} strokeWidth={3} />)}
          </g>
        )}
        {o.kind === "salon" && (
          <g>
            {[300, 1100].map((x) => (
              <g key={x}>
                <rect x={x} y={180} width={360} height={440} rx={180} fill="#dff2f4" stroke={MUSTARD} strokeWidth={14} />
                <path d={`M${x + 80} 520 L${x + 240} 260`} stroke="#fff" strokeWidth={30} opacity={0.4} />
              </g>
            ))}
          </g>
        )}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={900} width={4800} height={800} fill={d ? "#4a4f63" : o.kind === "garage" ? "#8f8f86" : "#e8e0cc"} />
        {o.kind === "garage" && <ellipse cx={900} cy={990} rx={300} ry={30} fill="#000" opacity={0.25} />}
        {o.kind === "garage" && o.under && (
          <g transform="rotate(-90 1380 985)">
            <Robot x={1380} y={985} scale={1.1} pose={{ ...STAND, legF: [40 + 22 * Math.sin(frame * 0.4), -70], legB: [10, -20], armF: [150, 20] }} frame={frame} />
          </g>
        )}
      </Deep>
    </>
  );
};

const ShopMid: React.FC<SetProps<ShopOptions>> = ({ options: o }) => {
  if (o.kind === "garage") return <Car x={900} y={990} s={2.2} color="#7fa0c4" />;
  if (o.kind === "salon") {
    return (
      <g>
        <rect x={420} y={800} width={160} height={30} rx={10} fill="#3a3d45" />
        <rect x={490} y={830} width={20} height={130} fill={STEEL} />
        <path d="M420 800 V660 Q420 640 440 640 H470 V800Z" fill="#3a3d45" />
      </g>
    );
  }
  return null;
};

export const shop: SetDef<ShopOptions> = {
  name: "shop",
  about: "a shop interior for the montages: the supermarket's shelves, the garage with a car, the salon's mirrors",
  spots: {
    mid: { x: 900, y: 1010, scale: 1.3, facing: 1 },
    left: { x: 520, y: 1010, scale: 1.3, facing: 1 },
    right: { x: 1300, y: 1010, scale: 1.3, facing: -1 },
  },
  cameras: { wide: REF },
  lights: () => [{ x: 960, y: 120, depth: 0.8, r: 900, color: "#fff4d6", strength: 0.25, moods: ["morning", "day", "dusk", "night", "lamp"] }],
  defaults: { kind: "market", pennies: false, under: false },
  Back: ShopBack,
  Mid: ShopMid,
  example: { camera: "wide", cast: [] },
};
