// The car plant's paint shop, side on, on the kit's SetDef contract. Far to near: the hall's high wall with clerestory
// windows (the sky by day, dark with sodium lamps by night) and steel roof trusses; a far line of car bodies with
// small painters (the hall goes on: "fifty painters" is the near row plus the far row, implied); the overhead conveyor
// with car bodies hanging from it, moving on `frame` and taking their colour as they pass the spray booths; the boss's
// walkway up on a catwalk (walkers stand `behind`, the railing hides their legs); in the actors' slot the painters at
// their stations (humans in masks, or steel robots), each with a spray arc; the floor with its yellow lines. No AI images.
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Figure } from "@whatif/kit/rig/Figure";
import { INK } from "@whatif/kit/theme";
import { Deep, noise, OUTSIDE, REF, Sky, type SetDef, type SetLight, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { BOSS, painter, YOU } from "../parts/Cast";
import { Dressed } from "../parts/Wear";
import { Robot, SPRAY_POSE } from "../parts/Robot";
import { STEEL, STEEL_DARK } from "../parts/Props";

export const PAINT_SHOP = {
  floor: 900,
  /** The conveyor rail (depth 0.9) and the car bodies' bottoms hanging from it. */
  rail: { y: 330, depth: 0.9 },
  carBottom: 760,
  /** The catwalk floor (depth 1, its railing in Mid). */
  walkway: { y: 430, from: -1400, to: 3400 },
  /** The painters' stations, x (depth 1). */
  stations: [430, 800, 1170, 1540],
  /** The spray line: car bodies right of it are painted. */
  paintX: 1000,
} as const;

export interface PaintShopOptions {
  /** Who paints: humans in masks, steel robots, or nobody (the line idle). */
  painters: "human" | "robot" | "none";
  /** How many of the four near stations are manned. */
  count: number;
  /** Spray on (0..1). */
  spray: number;
  /** The line's speed in px a frame (0 stops it). */
  speed: number;
  /** The far row of painters (the rest of the fifty, implied). */
  farRow: boolean;
  /** The colours the line paints, in turn. */
  colors: string[];
}

/** A car body side on (no wheels yet), front to the right, bottom centre at (x, y). */
const Body: React.FC<{ x: number; y: number; s?: number; fill: string; stroke?: string }> = ({ x, y, s = 1, fill, stroke = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-170 0 L-176 -70 Q-170 -96 -130 -100 L-80 -104 L-40 -160 Q-26 -172 10 -172 L70 -172 Q100 -170 116 -150 L150 -104 Q190 -100 196 -70 L190 0 Z"
      fill={fill} stroke={stroke} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-30 -150 Q-20 -160 6 -160 L28 -160 L28 -106 L-64 -106Z" fill="#cfe3ea" opacity={0.8} stroke={stroke} strokeWidth={4} />
    <path d="M40 -160 L68 -160 Q90 -158 102 -144 L130 -106 L40 -106Z" fill="#cfe3ea" opacity={0.8} stroke={stroke} strokeWidth={4} />
    {[-110, 120].map((cx) => <path key={cx} d={`M${cx - 46} 0 A46 46 0 0 1 ${cx + 46} 0Z`} fill="#3a3d45" />)}
    <line x1={-160} y1={-56} x2={180} y2={-56} stroke={stroke} strokeWidth={3} opacity={0.4} />
  </g>
);

const PRIMER = "#9aa1ab";

/** The line of car bodies hanging from the rail, moving right; each takes its colour as it passes `paintX`. */
const Line: React.FC<{ frame: number; o: PaintShopOptions; y: number; s: number; gap: number; seed: number; dark: boolean }> = ({ frame, o, y, s, gap, seed, dark }) => {
  const shift = (frame * o.speed) % gap;
  const n = Math.ceil(4800 / gap) + 1;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = -1400 + i * gap + shift;
        const idx = i - Math.floor((frame * o.speed) / gap);
        const color = o.colors[((idx % o.colors.length) + o.colors.length) % o.colors.length];
        const id = `paint-${seed}-${i}`;
        return (
          <g key={i}>
            <line x1={x - 60 * s} y1={PAINT_SHOP.rail.y} x2={x - 60 * s} y2={y - 150 * s} stroke={INK} strokeWidth={5} />
            <line x1={x + 80 * s} y1={PAINT_SHOP.rail.y} x2={x + 80 * s} y2={y - 150 * s} stroke={INK} strokeWidth={5} />
            <Body x={x} y={y} s={s} fill={dark ? "#6f7680" : PRIMER} />
            <clipPath id={id}><rect x={PAINT_SHOP.paintX} y={-800} width={4000} height={2400} /></clipPath>
            <g clipPath={`url(#${id})`}><Body x={x} y={y} s={s} fill={color} /></g>
          </g>
        );
      })}
    </g>
  );
};

const Back: React.FC<SetProps<PaintShopOptions>> = ({ cam, mood, frame, options: o }) => {
  const dark = OUTSIDE[mood].dark;
  const wall = dark ? "#3a4148" : "#c9cdc4";
  const wallLow = dark ? "#2e353b" : "#b3b9b0";
  return (
    <>
      <Deep cam={cam} depth={0.2} flat><Sky id="paint" mood={mood} x={-1400} y={-800} w={4800} h={1100} sunAt={{ x: 900, y: 120 }} /></Deep>
      <Deep cam={cam} depth={0.5} flat>
        {/* the high wall with a band of clerestory windows cut out of it */}
        <path fillRule="evenodd" fill={wall}
          d={`M-1400 -800 H3400 V1300 H-1400 Z ${Array.from({ length: 16 }, (_, i) => `M${-1300 + i * 300} 70 h240 v120 h-240 Z`).join(" ")}`} />
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i}>
            <rect x={-1300 + i * 300} y={70} width={240} height={120} fill="none" stroke="#5f6f7c" strokeWidth={10} />
            <line x1={-1180 + i * 300} y1={70} x2={-1180 + i * 300} y2={190} stroke="#5f6f7c" strokeWidth={6} />
          </g>
        ))}
        <rect x={-1400} y={430} width={4800} height={900} fill={wallLow} />
        {/* the far line, smaller, with its own painters */}
        {o.farRow && (
          <g>
            <rect x={-1400} y={300} width={4800} height={10} fill={STEEL_DARK} />
            <Line frame={frame} o={o} y={560} s={0.5} gap={260} seed={1} dark={dark} />
            {o.painters !== "none" && Array.from({ length: 14 }, (_, i) => {
              const x = -1250 + i * 340 + noise(i) * 60;
              return o.painters === "robot"
                ? <Robot key={i} x={x} y={620} scale={0.42} pose={SPRAY_POSE} held="paintGun" spray={o.spray} frame={frame + i * 7} sprayColor={o.colors[i % o.colors.length]} />
                : <Figure key={i} x={x} y={620} scale={0.42} pose={SPRAY_POSE} head={painter(i).head} coat="#e6ecef" mouth="none" time={frame} />;
            })}
            <rect x={-1400} y={618} width={4800} height={12} fill={dark ? "#3d4450" : "#8a918a"} />
          </g>
        )}
        {/* sodium lamps on the wall after dark */}
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={-1220 + i * 480} y={240} width={70} height={18} rx={6} fill={STEEL_DARK} />
            <ellipse cx={-1185 + i * 480} cy={262} rx={30} ry={8} fill={dark ? "#ffcf7a" : "#bfc4c9"} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={0.7} flat>
        {/* roof trusses */}
        {Array.from({ length: 12 }, (_, i) => {
          const x = -1300 + i * 420;
          return <path key={i} d={`M${x} 20 L${x + 210} -40 L${x + 420} 20 M${x} 20 L${x + 420} 20 M${x + 210} -40 V20 M${x + 105} -10 L${x + 105} 20 M${x + 315} -10 L${x + 315} 20`}
            stroke={dark ? "#4a5560" : "#7d8d99"} strokeWidth={10} fill="none" />;
        })}
      </Deep>
      <Deep cam={cam} depth={PAINT_SHOP.rail.depth}>
        <rect x={-1400} y={PAINT_SHOP.rail.y - 12} width={4800} height={22} fill={STEEL} stroke={INK} strokeWidth={4} />
        <Line frame={frame} o={o} y={PAINT_SHOP.carBottom} s={1} gap={560} seed={0} dark={dark} />
        {/* the spray booths' curtains either side of the paint line */}
        <rect x={PAINT_SHOP.paintX - 20} y={PAINT_SHOP.rail.y + 10} width={18} height={PAINT_SHOP.carBottom - PAINT_SHOP.rail.y + 40} fill="#e6ecef" opacity={0.25} />
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the floor, its yellow walk lines */}
        <rect x={-1400} y={PAINT_SHOP.floor - 60} width={4800} height={900} fill={dark ? "#4a4f55" : "#8c918c"} />
        <rect x={-1400} y={PAINT_SHOP.floor - 60} width={4800} height={8} fill="#000" opacity={0.15} />
        <rect x={-1400} y={PAINT_SHOP.floor + 70} width={4800} height={12} fill="#f2c230" />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1380 + i * 170} y={PAINT_SHOP.floor + 140} width={90} height={10} fill="#f2c230" opacity={0.8} />)}
        {/* the catwalk deck and its posts */}
        <rect x={PAINT_SHOP.walkway.from} y={PAINT_SHOP.walkway.y} width={PAINT_SHOP.walkway.to - PAINT_SHOP.walkway.from} height={18} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-1300 + i * 420} y={PAINT_SHOP.walkway.y + 18} width={14} height={PAINT_SHOP.floor - 60 - PAINT_SHOP.walkway.y - 18} fill={STEEL_DARK} />)}
      </Deep>
    </>
  );
};

/** The catwalk railing (over the walkers' legs) and the painters at their stations. */
const Mid: React.FC<SetProps<PaintShopOptions>> = ({ frame, options: o }) => {
  const w = PAINT_SHOP.walkway;
  const n = Math.max(0, Math.min(4, Math.round(o.count)));
  return (
    <g>
      <path d={`M${w.from} ${w.y - 100} H${w.to} M${w.from} ${w.y - 50} H${w.to}`} stroke={STEEL} strokeWidth={8} />
      {Array.from({ length: 48 }, (_, i) => <line key={i} x1={w.from + i * 100} y1={w.y - 100} x2={w.from + i * 100} y2={w.y} stroke={STEEL} strokeWidth={6} />)}
      <path d={`M${w.from} ${w.y - 100} H${w.to}`} stroke={INK} strokeWidth={2} opacity={0.5} />
      {o.painters !== "none" && PAINT_SHOP.stations.slice(0, n).map((x, i) => {
        const color = o.colors[i % o.colors.length];
        return o.painters === "robot" ? (
          <Robot key={i} x={x} y={PAINT_SHOP.floor + 40} scale={1} pose={SPRAY_POSE} held="paintGun" spray={o.spray} sprayColor={color} frame={frame + i * 9} />
        ) : (
          <g key={i}>
            <Dressed x={x} y={PAINT_SHOP.floor + 40} scale={1} pose={SPRAY_POSE} {...EXPRESSIONS.determined} {...painter(i)} time={frame}
              held={<g transform="scale(0.85)"><PaintGunSpray spray={o.spray} color={color} frame={frame + i * 9} /></g>} />
          </g>
        );
      })}
    </g>
  );
};

/** The paint gun with its spray, for a human hand (the robot's own is in Robot). */
const PaintGunSpray: React.FC<{ spray: number; color: string; frame: number }> = ({ spray, color, frame }) => (
  <g>
    {spray > 0 && (
      <g opacity={spray}>
        <path d="M60 -18 L240 -90 Q264 -20 240 50 Z" fill={color} opacity={0.32} />
        {Array.from({ length: 10 }, (_, i) => {
          const p = (frame * 0.09 + i / 10) % 1;
          return <circle key={i} cx={64 + p * 180} cy={-18 + Math.sin(i * 2.3) * p * 60} r={3 + p * 5} fill={color} opacity={0.7 * (1 - p)} />;
        })}
      </g>
    )}
    <rect x={-10} y={-34} width={58} height={30} rx={8} fill="#f2c230" stroke={INK} strokeWidth={4} />
    <rect x={44} y={-26} width={22} height={14} rx={3} fill={STEEL_DARK} stroke={INK} strokeWidth={3} />
    <rect x={-4} y={-8} width={16} height={30} rx={4} fill="#3a3d45" stroke={INK} strokeWidth={3} />
  </g>
);

const lights = (): SetLight[] => [
  ...Array.from({ length: 5 }, (_, i) => ({ x: 260 + i * 480, y: 262, depth: 0.5, r: 420, color: "#ffcf7a", strength: 0.3, moods: ["dusk", "night", "lamp"] as MoodName[] })),
  ...Array.from({ length: 4 }, (_, i) => ({ x: 120 + i * 600, y: 130, depth: 0.5, r: 380, color: "#fff4d6", strength: 0.25, moods: ["morning", "day"] as MoodName[] })),
];

export const paintShop: SetDef<PaintShopOptions> = {
  name: "paint-shop",
  about: "the car plant's paint shop: a long hall, car bodies on the line, painters (humans in masks or robots), the boss's catwalk",
  spots: {
    /** On the catwalk (stand `behind`: the railing hides their legs). */
    walk1: { x: 760, y: PAINT_SHOP.walkway.y, scale: 0.78, facing: 1 },
    walk2: { x: 940, y: PAINT_SHOP.walkway.y, scale: 0.78, facing: -1 },
    /** The floor, nearest the camera: the boss walks you in. */
    floorLeft: { x: 640, y: 1040, scale: 1.18, facing: 1 },
    floorRight: { x: 1000, y: 1040, scale: 1.18, facing: -1 },
    /** The painters' stations (for a cast painter instead of the built-in ones). */
    station1: { x: PAINT_SHOP.stations[0], y: PAINT_SHOP.floor + 40, scale: 1, facing: 1 },
    station2: { x: PAINT_SHOP.stations[1], y: PAINT_SHOP.floor + 40, scale: 1, facing: 1 },
    station3: { x: PAINT_SHOP.stations[2], y: PAINT_SHOP.floor + 40, scale: 1, facing: 1 },
    station4: { x: PAINT_SHOP.stations[3], y: PAINT_SHOP.floor + 40, scale: 1, facing: 1 },
  },
  cameras: {
    wide: REF,
    /** The line and the painters. */
    line: { x: 1000, y: 640, zoom: 1.45 },
    /** Up on the catwalk. */
    walkway: { x: 850, y: 300, zoom: 1.8 },
    /** The floor, a two-shot nearest the camera. */
    floor: { x: 820, y: 760, zoom: 1.5 },
  },
  lights,
  defaults: { painters: "human", count: 4, spray: 1, speed: 1.2, farRow: true, colors: ["#d8344f", "#1d9a8f", "#f2b632", "#3d6fb0"] },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [
      { spot: "walk1", who: { ...BOSS, look: { x: 0.8, y: 0.2 } }, face: EXPRESSIONS.happy, behind: true, pose: { ...STAND, armF: [70, 20] } as Pose },
      { spot: "walk2", who: { ...YOU, look: { x: 0.8, y: 0.2 } }, face: EXPRESSIONS.sceptical, behind: true },
    ],
  },
};
