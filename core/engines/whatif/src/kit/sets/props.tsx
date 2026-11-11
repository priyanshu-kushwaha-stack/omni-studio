// Small props the sets put out and a scene can put in a hand (Figure `held`). Each is drawn about its base centre
// unless it says otherwise, in world units at scale 1. Harvested from the three films in flight and the pause film.
import { INK, MUSTARD, PAPER } from "../theme";

/** A cutting-chai glass. `fill` 0..1 is the chai level (Nobody Could Say No). */
export const ChaiGlass: React.FC<{ x?: number; y?: number; scale?: number; fill?: number }> = ({ x = 0, y = 0, scale = 1, fill = 0.75 }) => {
  const h = 62;
  const level = Math.min(1, fill) * (h - 6);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M-20 0 L-24 ${-h} H24 L20 0Z`} fill="#e9f3f4" opacity={0.75} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {fill > 0 && <path d={`M-19 -3 L${-19 - (level / h) * 4} ${-3 - level} H${19 + (level / h) * 4} L19 -3Z`} fill="#c98a4b" />}
      {[-16, -6, 4, 14].map((gx) => <line key={gx} x1={gx} y1={-6} x2={gx * 1.15} y2={-h + 4} stroke="#fff" strokeWidth={2} opacity={0.6} />)}
    </g>
  );
};

/** A mug of coffee or tea (the pause sample's kitchen). */
export const Mug: React.FC<{ x?: number; y?: number; scale?: number; rotate?: number }> = ({ x = 0, y = 0, scale = 1, rotate = 0 }) => (
  <g transform={`translate(${x} ${y - 29 * scale}) scale(${scale}) rotate(${rotate})`}>
    <path d="M27 -14 q24 2 22 20 q-3 16 -22 13" fill="none" stroke="#fff6e3" strokeWidth={8} />
    <rect x={-28} y={-29} width={56} height={58} rx={9} fill="#fff6e3" stroke={INK} strokeWidth={4} />
    <rect x={-24} y={-25} width={48} height={11} rx={4} fill="#6b3f20" />
  </g>
);

/** The steel tiffin stack, three tiers and a handle (Nobody Could Say No). */
export const Tiffin: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 0, y = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[0, 1, 2].map((i) => <rect key={i} x={-40} y={-34 - i * 36} width={80} height={34} rx={8} fill="#c9ced6" stroke={INK} strokeWidth={4} />)}
    <path d="M-30 -112 V-142 H30 V-112" fill="none" stroke="#9aa1ab" strokeWidth={7} />
  </g>
);

/** A steel plate seen edge on, with food (`food` 0 empties it). Centred on its rim. */
export const SteelPlate: React.FC<{ x?: number; y?: number; scale?: number; food?: number }> = ({ x = 0, y = 0, scale = 1, food = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse rx={74} ry={12} fill="#c9ced6" stroke={INK} strokeWidth={4} />
    {food > 0 && <ellipse cx={-14} cy={-6} rx={30 * food} ry={9 * food} fill="#f3e9d7" />}
    {food > 0 && <ellipse cx={28} cy={-5} rx={16 * food} ry={7 * food} fill="#e0a23c" />}
    {food > 0 && <circle cx={46} cy={-8} r={9 * food} fill="#5aa04a" />}
  </g>
);

/** A pressure cooker on a burner, whistle up; `steam` 0..1 puffs from the whistle on `frame`. */
export const PressureCooker: React.FC<{ x?: number; y?: number; scale?: number; frame?: number; steam?: number }> = ({ x = 0, y = 0, scale = 1, frame = 0, steam = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-62 0 V-70 Q-62 -86 -46 -86 H46 Q62 -86 62 -70 V0Z" fill="#c9ced6" stroke={INK} strokeWidth={5} />
    <rect x={-70} y={-96} width={140} height={14} rx={6} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
    <rect x={60} y={-94} width={90} height={14} rx={7} fill={INK} />
    <rect x={-8} y={-120} width={16} height={26} rx={4} fill={INK} />
    {steam > 0 && [0, 1, 2].map((i) => {
      const p = (frame / 24 + i / 3) % 1;
      return <circle key={i} cx={Math.sin(frame / 9 + i) * 10 * p} cy={-130 - p * 120} r={10 + p * 22} fill={PAPER} opacity={0.6 * steam * (1 - p)} />;
    })}
  </g>
);

/** A laptop, open, screen toward the left; `screen` picks what shows. Base centre at (x, y). */
export const Laptop: React.FC<{ x?: number; y?: number; scale?: number; screen?: "code" | "chart" | "video" | "off"; facing?: 1 | -1 }> = ({
  x = 0, y = 0, scale = 1, screen = "code", facing = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    <path d="M-110 0 H110 L100 -10 H-100Z" fill="#3a3f4c" stroke={INK} strokeWidth={3} />
    <path d="M-96 -10 L-120 -150 H80 L96 -10Z" fill={INK} />
    <path d="M-90 -18 L-111 -142 H72 L88 -18Z" fill={screen === "off" ? "#262a36" : "#eef1f5"} />
    {screen === "code" && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={-96 + (i % 2) * 14} y={-128 + i * 20} width={60 + ((i * 37) % 70)} height={9} rx={4} fill={["#1d9a8f", "#d8344f", INK][i % 3]} opacity={0.7} />)}
    {screen === "chart" && <path d="M-86 -40 L-50 -70 L-20 -55 L20 -100 L60 -90" fill="none" stroke="#1d9a8f" strokeWidth={7} strokeLinejoin="round" />}
    {screen === "video" && <path d="M-30 -110 L20 -80 L-30 -50Z" fill="#d8344f" />}
  </g>
);

/** A small phone for a hand, screen toward the face (Nobody Could Say No, HandPhone). */
export const HandPhone: React.FC<{ lit?: boolean; scale?: number }> = ({ lit = true, scale = 1 }) => (
  <g transform={`scale(${scale}) rotate(-8) translate(-6 -40)`}>
    <rect x={-14} y={-4} width={30} height={52} rx={6} fill="#1b1d24" />
    <rect x={-11} y={0} width={24} height={42} rx={3} fill={lit ? "#cfe9f4" : "#3a4150"} />
  </g>
);

/** A stack of books or notes on a desk. */
export const Books: React.FC<{ x?: number; y?: number; scale?: number; n?: number }> = ({ x = 0, y = 0, scale = 1, n = 3 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-56 + (i % 2) * 8} y={-18 - i * 18} width={112 - i * 6} height={18} rx={3} fill={["#d8344f", "#1d9a8f", MUSTARD, "#7fa0c4"][i % 4]} stroke={INK} strokeWidth={3} />
    ))}
  </g>
);

/** A steel water bottle. */
export const Bottle: React.FC<{ x?: number; y?: number; scale?: number }> = ({ x = 0, y = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-14} y={-80} width={28} height={80} rx={10} fill="#9fb7c4" stroke={INK} strokeWidth={3} />
    <rect x={-9} y={-96} width={18} height={18} rx={4} fill={INK} />
  </g>
);

/** A backpack standing on the floor. */
export const Backpack: React.FC<{ x?: number; y?: number; scale?: number; color?: string }> = ({ x = 0, y = 0, scale = 1, color = "#3d6fb0" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-44 0 V-96 Q-44 -130 0 -130 Q44 -130 44 -96 V0Z" fill={color} stroke={INK} strokeWidth={4} />
    <rect x={-30} y={-58} width={60} height={40} rx={10} fill="#000" opacity={0.15} />
    <path d="M-16 -130 Q0 -152 16 -130" fill="none" stroke={INK} strokeWidth={5} />
  </g>
);
