// A bazaar lane, side on. From "Find Anything Ever Lost" (Street.tsx Lane with `shops`: the row of shopfronts with
// their shutters and lit counters, the wet lane; Grate; Mango) and "60 Seconds" (the vendor), filled out: striped
// awnings, crates of fruit, hanging dupattas, bunting, bulbs strung after dark, and a vegetable cart (thela) in front.
// Put the vendor `behind`; the cart (Mid) goes over his legs.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK } from "../theme";
import { HERO, PASTELS, VENDOR } from "./cast";
import { DARK, Deep, Floor, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, Sky, type SetDef, type SetProps } from "./common";

const FLOOR = 980;
const CART = { from: 1080, to: 1560, top: 800 };
const SHOPS = 7;

export interface BazaarOptions {
  /** Rain on the lane: puddles that catch the light. */
  wet: boolean;
  /** Shoppers drifting along the lane behind. */
  shoppers: boolean;
  /** What the cart sells. */
  cart: "vegetables" | "fruit";
}

const Produce: React.FC<{ x: number; y: number; kind: "tomato" | "mango" | "onion" | "greens"; n?: number }> = ({ x, y, kind, n = 7 }) => {
  const fill = { tomato: "#d8344f", mango: "#f2b632", onion: "#b5553a", greens: "#5aa04a" }[kind];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = x + (i % 4) * 30 + (Math.floor(i / 4) % 2) * 15;
        const py = y - Math.floor(i / 4) * 22;
        return kind === "greens"
          ? <ellipse key={i} cx={px} cy={py - 8} rx={14} ry={24} fill={fill} stroke={INK} strokeWidth={2} transform={`rotate(${(i % 3 - 1) * 20} ${px} ${py})`} />
          : <circle key={i} cx={px} cy={py} r={kind === "mango" ? 15 : 13} fill={fill} stroke={INK} strokeWidth={2} />;
      })}
    </g>
  );
};

const Back: React.FC<SetProps<BazaarOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.2} flat><Sky id="bazaar" mood={mood} x={-1400} y={-800} w={4800} h={1300} sunAt={{ x: 1300, y: 120 }} /></Deep>
      <Deep cam={cam} depth={0.5} flat>
        {/* the shopfronts across the lane: upper floors, signboards (colour, no words), shutters, lit counters */}
        {Array.from({ length: SHOPS + 4 }, (_, i) => {
          const x = -1100 + i * 380;
          const h = 520 + (i % 3) * 70;
          const col = o.dark ? ["#3a3f68", "#463d5e", "#33385e"][i % 3] : ["#c97a5a", "#7fa0c4", "#d9c26a", "#a8c97f", "#c9a0d6", "#e6a0a0"][i % 6];
          return (
            <g key={i}>
              <rect x={x} y={780 - h} width={360} height={h} fill={col} stroke="#3b2a1f" strokeWidth={6} />
              <rect x={x + 40} y={780 - h + 40} width={90} height={80} fill={noise(i + 3) < o.lit + 0.2 ? "#ffe39a" : "#f6e3b5"} opacity={0.85} />
              <rect x={x + 220} y={780 - h + 40} width={90} height={80} fill={noise(i + 8) < o.lit ? "#ffe39a" : "#f6e3b5"} opacity={0.85} />
              <rect x={x + 20} y={780 - h * 0.58} width={320} height={56} rx={6} fill={["#d8344f", "#1d9a8f", "#f2b632", "#3d6fb0"][i % 4]} stroke="#3b2a1f" strokeWidth={4} />
              <rect x={x + 20} y={780 - h * 0.58 + 70} width={320} height={h * 0.58 - 90} fill="#3b2a1f" />
              {[0, 1, 2, 3].map((k) => <rect key={k} x={x + 40 + k * 72} y={780 - h * 0.3} width={48} height={34} fill={on ? "#ffd27a" : "#f2c94c"} opacity={on ? 0.95 : 0.6} />)}
            </g>
          );
        })}
        {/* bunting across the lane */}
        {Array.from({ length: 40 }, (_, i) => (
          <path key={i} d={`M${-1100 + i * 110} ${150 + Math.sin(i * 0.9) * 10} l50 0 l-25 44Z`} fill={["#d8344f", "#f2b632", "#1d9a8f", "#f3e9d7"][i % 4]} />
        ))}
      </Deep>
      <Deep cam={cam} depth={0.78}>
        {/* the stalls on this side: striped awnings, crates of fruit, hanging dupattas */}
        {[-220, 380].map((x, i) => (
          <g key={x}>
            <rect x={x + 10} y={430} width={14} height={410} fill="#6a4630" /><rect x={x + 476} y={430} width={14} height={410} fill="#6a4630" />
            <path d={`M${x - 20} 470 L${x + 30} 400 H${x + 470} L${x + 520} 470Z`} fill={i ? "#d8344f" : "#1d9a8f"} stroke={INK} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${x + 30 + k * 80} 400 h40 l14 70 h-46Z`} fill="#f3e9d7" opacity={0.85} />)}
            <rect x={x + 40} y={760} width={420} height={80} rx={6} fill="#a87c52" stroke={INK} strokeWidth={4} />
            <Produce x={x + 70} y={750} kind={i ? "mango" : "tomato"} n={12} />
            <Produce x={x + 270} y={750} kind={i ? "onion" : "greens"} n={10} />
            {i === 0 && [0, 1, 2].map((k) => <path key={k} d={`M${x + 110 + k * 120} 472 q20 140 -10 220 h50 q-20 -80 10 -220Z`} fill={["#c9a0d6", "#f2b632", "#e6a0a0"][k]} stroke={INK} strokeWidth={3} />)}
          </g>
        ))}
        {options.shoppers && Array.from({ length: 4 }, (_, i) => {
          const x = ((noise(i) * 2600 + frame * (i % 2 ? 1.2 : -1.4)) % 2600 + 2600) % 2600 - 400;
          return (
            <g key={i} transform={`translate(${x} 860)`}>
              <rect x={-20} y={-120} width={40} height={120} rx={16} fill="#3b3e47" />
              <circle cx={0} cy={-150} r={30} fill={PASTELS[(i * 3 + 1) % PASTELS.length]} />
            </g>
          );
        })}
        {on && (
          <g>
            <path d="M-400 380 Q500 440 1200 380 T2600 380" fill="none" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={-380 + i * 130} cy={392 + Math.sin(i * 0.8) * 22} r={10} fill="#ffe39a" />)}
          </g>
        )}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={860} fill={options.wet ? "#8d877c" : "#b8a98e"} gap={200} slant={-120} opacity={0.07} />
        {options.wet && [200, 900, 1700].map((x) => <ellipse key={x} cx={x} cy={1010} rx={180} ry={26} fill={on ? "#ffd27a" : "#9fb7c4"} opacity={0.45} />)}
        <rect x={360} y={950} width={220} height={50} rx={6} fill="#4a4036" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={380 + i * 36} y1={956} x2={380 + i * 36} y2={994} stroke="#8a8070" strokeWidth={4} />)}
      </Deep>
    </>
  );
};

/** The vegetable cart over the vendor's legs: a wooden bed piled with produce, two wheels, a hanging scale. */
const Mid: React.FC<SetProps<BazaarOptions>> = ({ options }) => {
  const c = CART;
  const kinds = options.cart === "fruit" ? (["mango", "tomato", "mango"] as const) : (["tomato", "greens", "onion"] as const);
  return (
    <g>
      <rect x={c.from} y={c.top} width={c.to - c.from} height={40} rx={6} fill="#a87c52" stroke={INK} strokeWidth={5} />
      {kinds.map((k, i) => <Produce key={i} x={c.from + 30 + i * 150} y={c.top - 8} kind={k} n={12} />)}
      {[c.from + 90, c.to - 90].map((x) => (
        <g key={x}><circle cx={x} cy={FLOOR - 50} r={50} fill="none" stroke={INK} strokeWidth={10} /><circle cx={x} cy={FLOOR - 50} r={8} fill={INK} /></g>
      ))}
      <path d={`M${c.to - 20} ${c.top} L${c.to + 120} ${c.top - 40}`} stroke="#6a4630" strokeWidth={12} strokeLinecap="round" />
      <path d={`M${c.to - 60} ${c.top} V${c.top - 170} M${c.to - 100} ${c.top - 170} H${c.to - 20}`} stroke="#6a4630" strokeWidth={6} />
      {[c.to - 95, c.to - 25].map((x) => <path key={x} d={`M${x} ${c.top - 170} L${x - 14} ${c.top - 110} H${x + 14}Z`} fill="#c9ced6" stroke={INK} strokeWidth={3} />)}
    </g>
  );
};

export const bazaar: SetDef<BazaarOptions> = {
  name: "bazaar",
  about: "bazaar lane: shopfronts and signboards, striped awnings over fruit crates, bunting, bulbs at night, a vegetable cart",
  spots: {
    vendor: { x: 1340, y: FLOOR - 20, scale: 1.15, facing: -1 },
    customer: { x: 900, y: FLOOR + 20, scale: 1.2, facing: 1 },
    passing: { x: 420, y: FLOOR + 30, scale: 1.2, facing: 1 },
    stall: { x: 560, y: 850, scale: 0.85, facing: 1 },
  },
  cameras: {
    wide: REF,
    cart: { x: 1160, y: 680, zoom: 1.5 },
    lane: { x: 700, y: 560, zoom: 1.2 },
  },
  lights: () => [
    { x: 600, y: 400, depth: 0.78, r: 600, color: "#ffe39a", strength: 0.3, moods: LIGHTS_ON },
    { x: 1500, y: 400, depth: 0.78, r: 500, color: "#ffe39a", strength: 0.3, moods: DARK },
  ],
  defaults: { wet: false, shoppers: true, cart: "vegetables" },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [
      { spot: "vendor", who: { ...VENDOR, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy, behind: true, pose: { ...STAND, armF: [100, 10] } },
      { spot: "customer", who: { ...HERO, look: { x: 0.8, y: 0.3 } }, face: EXPRESSIONS.sceptical },
    ],
  },
};
