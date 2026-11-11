// The set library's contract and the pieces every set shares. Lifted from "Nobody Could Say No" (sets/common.tsx):
// every set is drawn for one reference camera, REF, so a set reads like a picture in 1920x1080 coordinates, and the
// kit's Layer parallax does the rest as the camera moves away from REF (far layers drift less than near ones).
import { STAND, type Pose } from "../rig/pose";
import type { FigureProps } from "../rig/Figure";
import type { Expression } from "../rig/expressions";
import type { Look } from "../stage/Look";
import { moodLook, type MoodName } from "../stage/moods";
import { Layer, toScreen, type Camera } from "../stage/Stage";
import { INK } from "../theme";

/** The camera every set is drawn for: the whole 1920x1080 frame at zoom 1. A set's "wide" is this camera. */
export const REF: Camera = { x: 960, y: 540, zoom: 1 };

/** A paper layer at `depth` (1 = the actors' plane, under 1 = further back, over 1 = in front of the actors) authored
 *  in REF screen coordinates. `flat` drops the cut-paper shadow (far walls and skies). */
export const Deep: React.FC<{ cam: Camera; depth: number; flat?: boolean; children: React.ReactNode }> = ({ cam, depth, flat, children }) => (
  <Layer cam={cam} depth={depth} flat={flat}>
    <g transform={`translate(${-REF.x * (1 - depth)} ${-REF.y * (1 - depth)})`}>{children}</g>
  </Layer>
);

/** Where a point drawn at (x, y) in a Deep layer of `depth` sits in world units under camera `cam`. */
export const worldOf = (cam: Camera, x: number, y: number, depth = 1) => ({
  x: x + (cam.x - REF.x) * (1 - depth),
  y: y + (cam.y - REF.y) * (1 - depth),
});

/** Where that point lands on screen, in output pixels (for glows, tags and bubbles). */
export const screenOf = (cam: Camera, x: number, y: number, depth = 1) => {
  const w = worldOf(cam, x, y, depth);
  return toScreen(cam, w.x, w.y);
};

/** A named place for a figure: its feet (or, seated, the y that puts its hips on the seat), its size and which way it
 *  faces. Draw a Figure with x, y, scale and facing from the spot, and `poseFor(spot)`. */
export interface Spot {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  /** Seated on a chair, bench or cot: draw the figure with SEATED. */
  sit?: boolean;
}

/** Sitting on a chair or bench, thighs forward and shins down (Nobody Could Say No, CHAIR_SIT). */
export const SEATED: Pose = { ...STAND, armB: [10, 25], armF: [25, 35], legB: [88, -88], legF: [92, -92] };

/** The figure y that puts a seated figure's hips on a seat top at `seatTop`. */
export const seatedY = (seatTop: number, scale = 1) => seatTop + 112 * scale;

export const poseFor = (spot: Spot): Pose => (spot.sit ? SEATED : STAND);

/** A light in the set (a lamp, a tube light, a window, a stove), in the coordinates of the layer it is drawn on. It
 *  glows only in the moods it lists. */
export interface SetLight {
  x: number;
  y: number;
  depth?: number;
  /** Radius in REF pixels; it grows with the camera's zoom. */
  r: number;
  color: string;
  strength?: number;
  moods: MoodName[];
}

/** The look for a set in a mood: the mood from `> MOOD:` (moodLook) plus the set's own lights where the camera sees
 *  them. */
export function setLook(lights: SetLight[], mood: MoodName, cam: Camera, extra: Partial<Look> = {}): Look {
  const glows = lights
    .filter((l) => l.moods.includes(mood))
    .map((l) => {
      const p = screenOf(cam, l.x, l.y, l.depth ?? 1);
      return { x: p.x, y: p.y, r: l.r * cam.zoom, color: l.color, strength: l.strength };
    });
  return moodLook(mood, { ...extra, glows: [...glows, ...(extra.glows ?? [])] });
}

/** Moods with the lights on: evening and night outside, and a lamp-lit room. */
export const LIGHTS_ON: MoodName[] = ["dusk", "night", "lamp"];
export const lightsOn = (mood: MoodName) => LIGHTS_ON.includes(mood);

/** What a window or an open sky shows in each mood. `lit` is the share of far windows with a light on. The pause's
 *  grey comes from the Stage, so "frozen" is drawn as daylight. */
export interface Outside {
  sky: [string, string];
  sun?: string;
  moon?: boolean;
  lit: number;
  dark: boolean;
}

export const OUTSIDE: Record<MoodName, Outside> = {
  morning: { sky: ["#ffd9a8", "#cfe8ee"], sun: "#fff4c8", lit: 0.06, dark: false },
  day: { sky: ["#8fd0e4", "#fbe7c2"], sun: "#fff1b8", lit: 0.06, dark: false },
  dusk: { sky: ["#ff9466", "#6b5a9c"], sun: "#ffd08a", lit: 0.45, dark: false },
  night: { sky: ["#0f1330", "#2a2f5a"], moon: true, lit: 0.55, dark: true },
  lamp: { sky: ["#161a38", "#3a3462"], moon: true, lit: 0.5, dark: true },
  frozen: { sky: ["#8fd0e4", "#fbe7c2"], sun: "#fff1b8", lit: 0.06, dark: false },
};

/** A repeatable pseudo-random number in 0..1, for scattering windows, leaves and heads. */
export const noise = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** The sky for a mood over a rectangle: a gradient, a low sun by day, a moon and a few stars by night. `id` keeps the
 *  gradient apart from other skies in the frame. */
export const Sky: React.FC<{ id: string; mood: MoodName; x: number; y: number; w: number; h: number; sunAt?: { x: number; y: number } }> = ({
  id, mood, x, y, w, h, sunAt,
}) => {
  const o = OUTSIDE[mood];
  const sun = sunAt ?? { x: x + w * 0.7, y: y + h * 0.3 };
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={o.sky[0]} />
          <stop offset="1" stopColor={o.sky[1]} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#sky-${id})`} />
      {o.sun && <circle cx={sun.x} cy={sun.y + (mood === "dusk" ? h * 0.35 : 0)} r={Math.min(110, Math.min(w, h) * 0.09)} fill={o.sun} opacity={0.9} />}
      {o.moon && <circle cx={sun.x} cy={sun.y} r={Math.min(60, Math.min(w, h) * 0.06)} fill="#f3ead2" />}
      {o.dark && Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={x + noise(i + 7) * w} cy={y + noise(i + 21) * h * 0.6} r={2 + noise(i) * 2} fill="#f3ead2" opacity={0.7} />
      ))}
    </g>
  );
};

/** A row of far buildings with windows, base at y `base`, from x `from` to `to`. Lit windows follow the mood. */
export const Skyline: React.FC<{ mood: MoodName; from: number; to: number; base: number; tall?: number; seed?: number; colors?: string[] }> = ({
  mood, from, to, base, tall = 300, seed = 0, colors = ["#e4b48e", "#dc9d8f", "#e6cd98", "#a3c7bf", "#d4ae93"],
}) => {
  const o = OUTSIDE[mood];
  const n = Math.ceil((to - from) / 260);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bx = from + i * 260;
        const h = tall * (0.55 + noise(i + seed) * 0.45);
        const color = o.dark ? ["#262c52", "#2e3460", "#232848"][i % 3] : colors[(((i + seed) % colors.length) + colors.length) % colors.length];
        return (
          <g key={i}>
            <rect x={bx} y={base - h} width={244} height={h + 40} fill={color} />
            {Array.from({ length: Math.floor(h / 70) * 3 }, (_, w) => (
              <rect key={w} x={bx + 26 + (w % 3) * 72} y={base - h + 24 + Math.floor(w / 3) * 70} width={44} height={34} rx={4}
                fill={noise(i * 31 + w + seed) < o.lit ? "#ffe39a" : o.dark ? "#1a1f3d" : "rgba(40,50,60,.22)"} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** A window onto the outside: the mood's sky, optional far buildings, a frame with bars. `bars` adds the iron grille
 *  most Indian homes have. */
export const Window: React.FC<{
  id: string; mood: MoodName; x: number; y: number; w: number; h: number; frame?: string; bars?: boolean; city?: boolean; children?: React.ReactNode;
}> = ({ id, mood, x, y, w, h, frame = "#7a5a40", bars = true, city = true, children }) => (
  <g>
    <clipPath id={`win-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
    <g clipPath={`url(#win-${id})`}>
      <Sky id={id} mood={mood} x={x} y={y} w={w} h={h} />
      {city && <Skyline mood={mood} from={x - 40} to={x + w + 40} base={y + h + 20} tall={h * 0.55} seed={Math.abs(x) % 7} />}
      {children}
    </g>
    {bars && Array.from({ length: Math.max(2, Math.round(w / 70)) }, (_, i) => (
      <line key={i} x1={x + ((i + 0.5) * w) / Math.max(2, Math.round(w / 70))} y1={y} x2={x + ((i + 0.5) * w) / Math.max(2, Math.round(w / 70))} y2={y + h} stroke={INK} strokeWidth={4} opacity={0.75} />
    ))}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={frame} strokeWidth={14} />
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={frame} strokeWidth={9} />
  </g>
);

/** A ceiling fan seen from the side, turning on `frame`, hub at (x, y), on a rod from the ceiling. */
export const Fan: React.FC<{ x: number; y: number; frame: number; scale?: number; color?: string }> = ({ x, y, frame, scale = 1, color = "#8a7a68" }) => {
  const a = frame * 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-5} y={-600} width={10} height={600} fill="#5a5048" />
      {[0, 120, 240].map((b) => {
        const rad = ((a + b) * Math.PI) / 180;
        return <ellipse key={b} cx={Math.sin(rad) * 30} cy={0} rx={180 * Math.abs(Math.cos(rad))} ry={14} fill={color} />;
      })}
      <ellipse cx={0} cy={0} rx={34} ry={18} fill="#6b5e50" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A tube light on a wall or ceiling, centre (x, y). It glows when `on`; pair it with a SetLight for the pool. */
export const TubeLight: React.FC<{ x: number; y: number; w?: number; on: boolean }> = ({ x, y, w = 240, on }) => (
  <g>
    <rect x={x - w / 2 - 8} y={y - 4} width={w + 16} height={22} rx={6} fill="#d8d2c4" stroke={INK} strokeWidth={4} />
    <rect x={x - w / 2} y={y} width={w} height={12} rx={6} fill={on ? "#fdfbea" : "#c9c6bb"} />
    {on && <rect x={x - w / 2 - 30} y={y - 30} width={w + 60} height={70} rx={35} fill="#fdfbea" opacity={0.18} />}
  </g>
);

/** A plain chair seen from the side, its seat top at (x, y), its back on the left when `facing` is 1. */
export const Chair: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; color?: string }> = ({ x, y, scale = 1, facing = 1, color = "#6b4b3a" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    <rect x={-44} y={-6} width={88} height={14} rx={5} fill={color} stroke={INK} strokeWidth={4} />
    <rect x={-48} y={-118} width={14} height={124} rx={5} fill={color} stroke={INK} strokeWidth={4} />
    <line x1={-36} y1={8} x2={-38} y2={62} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <line x1={36} y1={8} x2={38} y2={62} stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** Props a set draws: the camera, the mood from `> MOOD:`, the frame for things that move (a fan, steam, a train),
 *  and the set's own switches (which props are out). */
export interface SetProps<O> {
  cam: Camera;
  mood: MoodName;
  frame: number;
  options: O;
}

/** Someone in a set's example: a spot, how they look (Figure props) and a named face. `behind` draws them before the
 *  set's Mid piece (behind a counter or a table). */
export interface CastMember {
  spot: string;
  who: Partial<FigureProps> & { head: string };
  face?: Expression;
  behind?: boolean;
  pose?: Pose;
}

/** One set of the library. */
export interface SetDef<O extends object = object> {
  /** The registry name, kebab-case. */
  name: string;
  /** One line for the edit skill's list. */
  about: string;
  /** Named places for figures. */
  spots: Record<string, Spot>;
  /** Named framings. `wide` is REF; the others are a starting point for a shot. */
  cameras: Record<string, Camera> & { wide: Camera };
  /** Lamps, windows and screens that glow in some moods. */
  lights: SetLight[];
  /** The set's switches and their defaults. */
  defaults: O;
  /** Everything behind the actors, far to near. */
  Back: React.FC<SetProps<O>>;
  /** Drawn in the actors' slot between the `behind` cast and the rest: a counter, a table, a bench back. */
  Mid?: React.FC<SetProps<O>>;
  /** In front of the actors: a pole, a railing, a near desk, soft with depth of field. */
  Front?: React.FC<SetProps<O>>;
  /** The set's example composition: a camera, the switches and who stands where. */
  example: { camera: string; options?: Partial<O>; cast: CastMember[] };
}

/** A set definition with its option type checked, stored without it in the registry. */
export const defineSet = <O extends object>(def: SetDef<O>): SetDef<O> => def;
