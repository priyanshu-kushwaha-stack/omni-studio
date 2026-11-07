// Say Suppose brand parts, drawn in code in the film's paper-cut style: the ringed Earth, gold stars, the indigo
// sky and the wordmark. Everything here is a candidate for the owner to judge, not final kit code.
import { loadFont as loadJost } from "@remotion/google-fonts/Jost";
import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { AbsoluteFill, Audio, staticFile } from "remotion";

export const { fontFamily: JOST } = loadJost("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
export const { fontFamily: RUBIK } = loadRubik("normal", { weights: ["800"], subsets: ["latin"] });

export const INDIGO = "#0c0a4a";
export const INDIGO_HI = "#1b1878";
export const INK = "#23252b";
export const PAPER = "#f3e9d7";
export const MUSTARD = "#f2b632";
export const GOLD = "#ffcf5a";
export const ORANGE = "#f08a2e";
export const EMBER = "#e8582f";
export const CRIMSON = "#d8344f";
export const TEAL = "#1d9a8f";
export const OCEAN = "#2a46b8";
export const OCEAN_DEEP = "#1a2a86";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeIn = (t: number) => Math.pow(clamp01(t), 3);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Deterministic 0..1 noise. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- Earth ----------
type LL = [number, number];
const NORTH_AMERICA: LL[] = [
  [-166, 66], [-156, 71], [-140, 70], [-128, 70], [-112, 73], [-96, 72], [-84, 69], [-80, 64], [-72, 62], [-64, 60],
  [-60, 54], [-56, 50], [-62, 46], [-67, 44], [-70, 42], [-74, 40], [-76, 37], [-80, 33], [-81, 29], [-80, 26], [-82, 25],
  [-83, 29], [-87, 30], [-90, 29], [-94, 29], [-97, 27], [-97, 22], [-95, 18], [-91, 19], [-90, 21], [-87, 21], [-88, 17],
  [-84, 15], [-83, 11], [-80, 9], [-77, 8], [-80, 7], [-83, 8], [-86, 12], [-91, 14], [-96, 16], [-102, 18], [-106, 22],
  [-110, 24], [-112, 29], [-114, 31], [-115, 29], [-110, 23], [-112, 25], [-117, 32], [-121, 35], [-124, 40], [-124, 46],
  [-125, 50], [-131, 55], [-137, 59], [-146, 61], [-153, 59], [-158, 57], [-162, 59], [-165, 62],
];
const GREENLAND: LL[] = [[-54, 60], [-44, 60], [-36, 65], [-22, 70], [-19, 76], [-24, 82], [-40, 83], [-58, 81], [-70, 78], [-62, 74], [-55, 69]];
const SOUTH_AMERICA: LL[] = [
  [-79, 9], [-76, 11], [-71, 12], [-64, 10], [-58, 7], [-52, 5], [-50, 1], [-45, -1], [-38, -4], [-35, -7], [-35, -10],
  [-38, -14], [-39, -19], [-41, -22], [-45, -24], [-48, -27], [-50, -30], [-53, -34], [-58, -35], [-57, -38], [-62, -39],
  [-64, -42], [-65, -46], [-68, -50], [-69, -53], [-72, -54], [-74, -51], [-75, -46], [-73, -40], [-73, -33], [-71, -27],
  [-70, -19], [-73, -16], [-76, -14], [-79, -9], [-81, -6], [-80, -2], [-80, 1], [-78, 4], [-77, 7],
];
const AFRICA: LL[] = [
  [-17, 21], [-17, 15], [-15, 11], [-12, 8], [-8, 5], [-3, 5], [3, 6], [8, 4], [9, 1], [10, -3], [12, -6], [13, -12],
  [12, -18], [15, -26], [18, -33], [20, -35], [25, -34], [30, -31], [33, -26], [35, -22], [40, -16], [40, -10], [39, -5],
  [42, -1], [47, 4], [51, 11], [44, 11], [42, 13], [38, 18], [35, 24], [33, 29], [30, 31], [25, 32], [20, 31], [15, 33],
  [10, 37], [3, 37], [-2, 35], [-6, 36], [-9, 33], [-10, 29], [-13, 27], [-15, 24],
];
const EUROPE: LL[] = [
  [-9, 37], [-9, 43], [-2, 44], [-4, 48], [-1, 49], [2, 51], [5, 53], [8, 54], [8, 57], [6, 59], [5, 62], [10, 64],
  [15, 68], [20, 70], [28, 71], [35, 69], [42, 67], [45, 60], [42, 52], [38, 47], [30, 46], [28, 41], [26, 40], [23, 37],
  [21, 39], [19, 42], [16, 41], [17, 39], [15, 38], [13, 42], [10, 44], [7, 44], [3, 43], [0, 40], [-2, 37],
];
const UK: LL[] = [[-5, 50], [1, 51], [1, 53], [-2, 55], [-3, 58], [-6, 58], [-5, 55], [-3, 54], [-4, 52]];
const LANDS = [NORTH_AMERICA, SOUTH_AMERICA, AFRICA, EUROPE, GREENLAND, UK];
const CLOUDS: { lon: number; lat: number; s: number; curl: number }[] = [
  { lon: -125, lat: 38, s: 0.26, curl: 1 }, { lon: -55, lat: 28, s: 0.22, curl: -1 }, { lon: -100, lat: -2, s: 0.18, curl: 1 },
  { lon: -35, lat: -15, s: 0.24, curl: -1 }, { lon: -105, lat: -30, s: 0.28, curl: 1 }, { lon: -28, lat: 50, s: 0.2, curl: 1 },
  { lon: -150, lat: 8, s: 0.24, curl: -1 }, { lon: -8, lat: -32, s: 0.24, curl: -1 }, { lon: 15, lat: 12, s: 0.16, curl: 1 },
  { lon: 55, lat: 25, s: 0.24, curl: 1 }, { lon: 100, lat: -10, s: 0.26, curl: -1 }, { lon: 150, lat: 30, s: 0.24, curl: 1 },
];

const D = Math.PI / 180;
function project(lon: number, lat: number, lon0: number, lat0: number, R: number) {
  const l = (lon - lon0) * D; const p = lat * D; const p0 = lat0 * D;
  const x = R * Math.cos(p) * Math.sin(l);
  const y = -R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l));
  const c = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  return { x, y, c };
}

/** Densify a lon/lat ring so its projection bends smoothly, then project; hidden points fold onto the limb. */
function landPath(poly: LL[], lon0: number, lat0: number, R: number): string | null {
  const pts: { x: number; y: number; c: number }[] = [];
  for (let i = 0; i < poly.length; i++) {
    const [a, b] = [poly[i], poly[(i + 1) % poly.length]];
    for (let k = 0; k < 3; k++) {
      const t = k / 3;
      pts.push(project(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, lon0, lat0, R));
    }
  }
  if (!pts.some((p) => p.c > 0)) return null;
  const out = pts.map((p) => {
    if (p.c > 0) return p;
    const m = Math.hypot(p.x, p.y) || 1;
    return { x: (p.x / m) * R * 1.02, y: (p.y / m) * R * 1.02, c: 0 };
  });
  return "M" + out.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L") + "Z";
}

/** Points along an ellipse arc (angles in radians). */
function arc(rx: number, ry: number, a0: number, a1: number, n = 90): string[] {
  const out: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push(`${(rx * Math.cos(a)).toFixed(1)} ${(ry * Math.sin(a)).toFixed(1)}`);
  }
  return out;
}
/** A filled band between two ellipses, swept from a0 to a1. */
function band(rxO: number, ryO: number, rxI: number, ryI: number, a0: number, a1: number): string {
  const outer = arc(rxO, ryO, a0, a1);
  const inner = arc(rxI, ryI, a1, a0);
  return `M${outer.join("L")}L${inner.join("L")}Z`;
}

const RING_BANDS: { o: number; i: number; color: string }[] = [
  { o: 1.0, i: 0.93, color: GOLD },
  { o: 0.93, i: 0.86, color: MUSTARD },
  { o: 0.86, i: 0.8, color: ORANGE },
  { o: 0.8, i: 0.76, color: EMBER },
  { o: 0.73, i: 0.7, color: ORANGE },
];

export interface EarthProps {
  /** Radius of the planet in px. */
  r: number;
  /** Longitude facing the camera; animate it to turn the globe. */
  lon?: number;
  lat?: number;
  /** 0..1: how much of the ring has been swept around. */
  ring?: number;
  /** Ring tilt in degrees. */
  tilt?: number;
  /** Bright spark at the sweeping tip. */
  spark?: boolean;
  id?: string;
  /** Add a glow halo behind the planet. */
  halo?: number;
  /** Draw only the ring's front half (to lay over something drawn above the planet). */
  frontOnly?: boolean;
}

/** The ringed Earth, centred on (0,0). Place inside an SVG <g transform>. */
export const RingedEarth: React.FC<EarthProps> = ({ r, lon = -78, lat = 18, ring = 1, tilt = -16, spark = false, id = "e", halo = 1, frontOnly = false }) => {
  const RX = r * 1.9;
  const RY = r * 0.42;
  // The ring starts at its right end and sweeps first across the front (downwards in the ring's frame).
  const a0 = -0.05 * Math.PI;
  const a1 = a0 + ring * 2 * Math.PI;
  const lands = LANDS.map((p) => landPath(p, lon, lat, r)).filter(Boolean) as string[];
  const ringBands = (clip?: string) => (
    <g transform={`rotate(${tilt})`} clipPath={clip}>
      {ring > 0.002 && RING_BANDS.map((b, i) => (
        <path key={i} d={band(RX * b.o, RY * b.o, RX * b.i, RY * b.i, a0, a1)} fill={b.color} />
      ))}
    </g>
  );
  const tip = { x: RX * 0.9 * Math.cos(a1), y: RY * 0.9 * Math.sin(a1) };
  const rot = (tilt * Math.PI) / 180;
  const tipS = { x: tip.x * Math.cos(rot) - tip.y * Math.sin(rot), y: tip.x * Math.sin(rot) + tip.y * Math.cos(rot) };
  const tipFront = Math.sin(a1) > 0;
  const sparkEl = spark && ring > 0.01 && ring < 0.999 && (
    <g transform={`translate(${tipS.x} ${tipS.y})`}>
      <circle r={r * 0.2} fill={GOLD} opacity={0.25} />
      <circle r={r * 0.09} fill="#fff4c8" />
      <path d={star4(r * 0.28)} fill="#fff4c8" opacity={0.9} />
    </g>
  );
  const defs = (
      <defs>
        <clipPath id={`${id}-globe`}><circle r={r} /></clipPath>
        <clipPath id={`${id}-front`} clipPathUnits="userSpaceOnUse"><rect x={-RX * 2} y={0} width={RX * 4} height={RY * 3} /></clipPath>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0.55" stopColor="#ffb347" stopOpacity={0.35 * halo} />
          <stop offset="1" stopColor="#ffb347" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-sun`} cx="0.28" cy="0.22" r="0.85">
          <stop offset="0" stopColor="#ffd77a" stopOpacity={0.24} />
          <stop offset="0.45" stopColor="#ffd77a" stopOpacity={0.04} />
          <stop offset="1" stopColor="#ffd77a" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-cut`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy={r * 0.03} stdDeviation={r * 0.035} floodColor="#05031f" floodOpacity="0.6" />
        </filter>
      </defs>
  );
  if (frontOnly) return <g>{defs}<g filter={`url(#${id}-cut)`}>{ringBands(`url(#${id}-front)`)}</g></g>;
  return (
    <g>
      {defs}
      {halo > 0 && <circle r={r * 1.45} fill={`url(#${id}-halo)`} />}
      <g filter={`url(#${id}-cut)`}>{ringBands()}</g>
      <g filter={`url(#${id}-cut)`}>
        <circle r={r} fill={OCEAN} />
        <g clipPath={`url(#${id}-globe)`}>
          {/* ocean bands: paper strips of slightly different blue */}
          <circle cx={r * 0.25} cy={r * 0.3} r={r * 0.95} fill="#2440a8" />
          {lands.map((d, i) => <path key={i} d={d} fill={EMBER} />)}
          {/* a lighter cut on each landmass toward the sun */}
          <g transform={`translate(${-r * 0.025} ${-r * 0.03})`}>
            {lands.map((d, i) => <path key={i} d={d} fill={ORANGE} opacity={0.85} transform="scale(0.985)" />)}
          </g>
          {CLOUDS.map((c, i) => {
            const p = project(c.lon, c.lat, lon, lat, r);
            if (p.c <= 0.04) return null;
            const k = Math.sqrt(p.c);
            const s = c.s * r * 1.5;
            const flip = c.curl < 0 ? -1 : 1;
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${k * flip} 1) rotate(-14)`} opacity={Math.min(0.9, p.c * 2.2)}
                fill="none" stroke="#ffe1a1" strokeLinecap="round">
                <path d={`M${-s} ${s * 0.05} C${-s * 0.45} ${-s * 0.2} ${s * 0.1} ${-s * 0.22} ${s * 0.42} ${-s * 0.1} C${s * 0.7} ${0} ${s * 0.62} ${s * 0.3} ${s * 0.36} ${s * 0.24} C${s * 0.18} ${s * 0.2} ${s * 0.22} ${s * 0.02} ${s * 0.38} ${s * 0.06}`} strokeWidth={s * 0.17} />
                <path d={`M${-s * 0.8} ${s * 0.32} C${-s * 0.35} ${s * 0.22} ${s * 0.05} ${s * 0.3} ${s * 0.3} ${s * 0.44}`} strokeWidth={s * 0.11} opacity={0.8} />
              </g>
            );
          })}
          {/* hard-edged night side: paper-cut shading */}
          <circle cx={-r * 0.38} cy={-r * 0.34} r={r * 1.22} fill="none" stroke="#0b0f4f" strokeOpacity={0.42} strokeWidth={r * 0.62} />
          <circle cx={-r * 0.22} cy={-r * 0.2} r={r * 1.08} fill="none" stroke="#0b0f4f" strokeOpacity={0.22} strokeWidth={r * 0.2} />
          <circle r={r} fill={`url(#${id}-sun)`} />
          {/* lit limb, upper left */}
          <path fillRule="evenodd" fill="#ffc85a" opacity={0.55}
            d={`M${-r} 0a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z M${-r + r * 0.035} ${r * 0.035}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`} />
        </g>
      </g>
      <g filter={`url(#${id}-cut)`}>{ringBands(`url(#${id}-front)`)}</g>
      {tipFront ? sparkEl : null}
      {!tipFront ? <g opacity={0.6}>{sparkEl}</g> : null}
    </g>
  );
};

/** A four-point sparkle path of size s. */
export const star4 = (s: number) => {
  const w = s * 0.16;
  return `M0 ${-s} Q${w} ${-w} ${s} 0 Q${w} ${w} 0 ${s} Q${-w} ${w} ${-s} 0 Q${-w} ${-w} 0 ${-s}Z`;
};

/** Indigo sky with painterly streaks, gold stars that twinkle, and paper grain. */
type Box = [number, number, number, number];
export const Sky: React.FC<{ frame: number; seed?: number; stars?: number; drift?: number; reveal?: number; avoid?: Box[] }> = ({
  frame, seed = 1, stars = 26, drift = 0.25, reveal = 1, avoid = [],
}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 42%, ${INDIGO_HI} 0%, #120f5c 45%, ${INDIGO} 100%)` }} />
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <filter id="streak"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <g filter="url(#streak)" opacity={0.5}>
        {Array.from({ length: 9 }, (_, i) => {
          const x = hash(seed * 7 + i) * 2200 - 200;
          const y = hash(seed * 13 + i) * 1200 - 100;
          return <rect key={i} x={x} y={y} width={420 + hash(i + 3) * 300} height={26 + hash(i + 8) * 30} rx={20} fill="#2a2a9a" opacity={0.35}
            transform={`rotate(-32 ${x} ${y})`} />;
        })}
      </g>
      {Array.from({ length: stars }, (_, i) => {
        const x = hash(seed * 31 + i) * 1920 + frame * drift * (0.4 + hash(i)) ;
        const y = hash(seed * 57 + i) * 1080;
        if (avoid.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) return null;
        const big = hash(seed * 91 + i) > 0.82;
        const tw = 0.55 + 0.45 * Math.sin(frame * (0.12 + hash(i + 5) * 0.12) + i * 2.1);
        const on = clamp01(reveal * 1.6 - hash(i + 77) * 0.6);
        if (big) {
          const s = 14 + hash(i + 2) * 16;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${on * (0.8 + 0.25 * tw)})`} opacity={on}>
              <circle r={s * 0.9} fill={GOLD} opacity={0.12} />
              <path d={star4(s)} fill={GOLD} />
            </g>
          );
        }
        return <circle key={i} cx={x} cy={y} r={2 + hash(i + 11) * 2.8} fill={GOLD} opacity={on * (0.45 + 0.55 * tw)} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** Paper grain and a soft vignette for the dark brand sky. */
export const Grain: React.FC<{ opacity?: number; vignette?: number }> = ({ opacity = 0.09, vignette = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080} style={{ position: "absolute", mixBlendMode: "screen", opacity }}>
      <filter id="g-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1920} height={1080} filter="url(#g-noise)" />
    </svg>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(3,2,20,${vignette}) 100%)` }} />
  </AbsoluteFill>
);

/** The wordmark, in the banner's geometric sans. */
export const Wordmark: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = MUSTARD, style }) => (
  <div style={{ fontFamily: JOST, fontWeight: 600, fontSize: size, color, letterSpacing: size * 0.005, lineHeight: 1, whiteSpace: "nowrap",
    textShadow: `0 ${size * 0.05}px 0 rgba(4,2,30,.55)`, ...style }}>
    Say Suppose
  </div>
);

/** A small ringed-Earth mark as an inline SVG of the given box size. */
export const Mark: React.FC<{ size: number; ring?: number; lon?: number; id: string; halo?: number }> = ({ size, ring = 1, lon = -78, id, halo = 0.6 }) => (
  <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ overflow: "visible" }}>
    <RingedEarth r={size * 0.27} ring={ring} lon={lon} id={id} halo={halo} />
  </svg>
);

/** The film's music pad, quiet under an ident so the cut out of the hook never drops to digital silence. */
export const PadBed: React.FC<{ frames: number; level?: number }> = ({ frames, level = 0.2 }) => (
  <Audio src={staticFile("sfx/pad.wav")} startFrom={30 * 12}
    volume={(f) => level * Math.min(1, f / 6) * Math.min(1, (frames - f) / 10)} />
);
