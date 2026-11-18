// Part C's shared pieces (The Cheque to Stool Four): poses the foundation doesn't name, a two-line stamped card (the
// label tag's look, for the cards too long for one line), a hand with a sleeve for inserts, the counter-top insert
// background, a car and a truck, and small timing helpers. Screen pixels (1920 x 1080) unless a comment says world.
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { ease, mix, ramp } from "../util";
import { STEEL, STEEL_DARK, STEEL_LIGHT } from "../Props";

export { ease, mix, ramp };

/** Progress of an action from frame a to b, eased. */
export const act = (f: number, a: number, b: number) => ease(ramp(f, a, b));

/** Arm up, hand above the head (a hammer or wrench raised). */
export const RAISED: Pose = { ...STAND, armF: [168, 8], armB: [-20, 30] };
/** Both palms up: "not bad". */
export const SHRUG: Pose = { ...STAND, armF: [55, 95], armB: [-55, -95] };
/** Pointing forward. */
export const POINT: Pose = { ...STAND, armF: [92, 0] };
/** Arms folded across the chest. */
export const FOLDED: Pose = { ...STAND, armF: [22, -112], armB: [18, -118] };
/** The front hand up by the face (eating, a wave). */
export const HAND_UP: Pose = { ...STAND, armF: [60, 112] };
/** A wave: the forearm up, rocking on `f`. */
export const wave = (f: number, base: Pose = STAND): Pose => ({ ...base, armF: [150 + Math.sin(f * 0.45) * 16, 18] });
/** The front arm out over a counter (a hand at the till, a plate slid). */
export const REACH: Pose = { ...STAND, armF: [78, 18] };
/** A pose blended from a to b. */
export function blend(a: Pose, b: Pose, t: number): Pose {
  const n = (x: number, y: number) => x + (y - x) * t;
  const p = (x: [number, number], y: [number, number]): [number, number] => [n(x[0], y[0]), n(x[1], y[1])];
  return { lean: n(a.lean, b.lean), tilt: n(a.tilt, b.tilt), drop: n(a.drop, b.drop), armB: p(a.armB, b.armB), armF: p(a.armF, b.armF), legB: p(a.legB, b.legB), legF: p(a.legF, b.legF) };
}

/** The label tag's look (util.tsx TagStamp) on one or two lines, top right, thumping in at frame 0. For cards whose
 *  one line would run off the frame. `f` is frames since it appeared; it fades out after `len` frames. */
export const Stamp2: React.FC<{ lines: string[]; f: number; len?: number }> = ({ lines, f, len = 150 }) => {
  if (f < 0 || f >= len) return null;
  const k = ramp(f, 0, 8) * (1 - ramp(f, len - 8, len));
  return (
    <div style={{
      position: "absolute", top: 46, right: 52, transform: `rotate(-2deg) scale(${mix(1.25, 1, ramp(f, 0, 8))})`, opacity: k,
      transformOrigin: "right center", background: INK, color: MUSTARD, border: `6px solid ${PAPER}`, borderRadius: 18,
      fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.12, letterSpacing: 1.2, padding: "12px 28px 8px",
      whiteSpace: "nowrap", boxShadow: "0 12px 22px rgba(0,0,0,.45)", textAlign: "right",
    }}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
  );
};

/** A hand with its sleeve for inserts: the sleeve comes in from `from` (an angle in degrees, 0 = from the right edge,
 *  90 = from the bottom) to the fingertips at (x, y). `skin` is the person's head colour (the cast's hands match their
 *  heads), `sleeve` their coat. `pinch` holds a pencil. */
export const Hand: React.FC<{ x: number; y: number; from?: number; skin: string; sleeve: string; s?: number; pencil?: boolean; fingers?: number }> = ({
  x, y, from = 90, skin, sleeve, s = 1, pencil, fingers = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${from - 90}) scale(${s})`}>
    <rect x={-58} y={86} width={116} height={420} rx={20} fill={sleeve} stroke={INK} strokeWidth={6} />
    <rect x={-62} y={74} width={124} height={34} rx={12} fill={sleeve === PAPER ? TEAL : PAPER} stroke={INK} strokeWidth={5} />
    {/* fingers (curled round the pencil when it writes), the palm, the thumb */}
    {[-36, -13, 10, 33].slice(0, fingers || 4).map((fx, i) => (
      <rect key={i} x={fx - 11} y={pencil ? -26 : -62 + Math.abs(i - 1.5) * 8} width={22} height={pencil ? 44 : 74} rx={11} fill={skin} stroke={INK} strokeWidth={5} />
    ))}
    <rect x={-48} y={-6} width={96} height={92} rx={30} fill={skin} stroke={INK} strokeWidth={6} />
    <ellipse cx={50} cy={30} rx={16} ry={30} transform="rotate(-30 50 30)" fill={skin} stroke={INK} strokeWidth={5} />
    {pencil && (
      <g transform="translate(-10 -24) rotate(-110)">
        <path d="M0 0 L22 -9 L22 9 Z" fill="#f1d3a6" stroke={INK} strokeWidth={3} />
        <rect x={22} y={-9} width={150} height={18} fill={MUSTARD} stroke={INK} strokeWidth={3} />
        <rect x={172} y={-9} width={18} height={18} rx={5} fill="#e88a9a" stroke={INK} strokeWidth={3} />
      </g>
    )}
  </g>
);

/** A thumb from below pressing at (x, y) (the AppPhone's own thumb shape, in any skin). `strain` shakes it. */
export const Thumb: React.FC<{ x: number; y: number; rot?: number; skin: string; sleeve?: string; s?: number }> = ({ x, y, rot = 0, skin, sleeve, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {sleeve && <rect x={-70} y={150} width={140} height={600} rx={24} fill={sleeve} stroke={INK} strokeWidth={6} />}
    <path d="M-40 14 Q-44 -46 0 -54 Q44 -46 40 14 L46 170 L-46 170Z" fill={skin} stroke={INK} strokeWidth={6} />
    <path d="M-24 -26 Q0 -40 24 -26 L22 6 Q0 12 -22 6Z" fill="#fff4d8" stroke={INK} strokeWidth={4} />
  </g>
);

/** The counter top seen close, for inserts: chrome edge, the teal-flecked top, lamp or daylight falling on it. */
export const CounterTop: React.FC<{ mood?: "lamp" | "day" | "morning"; f?: number }> = ({ mood = "day" }) => {
  const top = mood === "lamp" ? "#3b4b52" : mood === "morning" ? "#e9e1d3" : "#eef1f2";
  const fleck = mood === "lamp" ? "#4e646c" : "#cfe3e0";
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={top} />
      {Array.from({ length: 140 }, (_, i) => {
        const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        const r = v - Math.floor(v);
        const w = Math.sin(i * 33.7 + 9.1) * 43758.5453;
        const q = w - Math.floor(w);
        return <circle key={i} cx={r * 1920} cy={q * 1000} r={3 + (i % 4)} fill={fleck} opacity={0.7} />;
      })}
      <rect x={-20} y={960} width={1960} height={60} rx={20} fill="#e6ecef" stroke={INK} strokeWidth={6} />
      <rect x={-20} y={1012} width={1960} height={80} fill="#1a6f68" stroke={INK} strokeWidth={6} />
      {mood === "lamp" ? (
        <g>
          <ellipse cx={900} cy={480} rx={900} ry={520} fill="#ffe6a0" opacity={0.16} />
          <rect x={0} y={0} width={1920} height={1080} fill="#05060a" opacity={0.12} />
        </g>
      ) : (
        <path d="M-100 0 H700 L300 1080 H-100Z" fill="#fff" opacity={0.12} />
      )}
    </g>
  );
};

/** A car seen side on, its front at the right, wheels on y (world or screen units). `shiny` is the plumber's: long,
 *  polished, chrome; otherwise yours: small and dented. `door` 0..1 swings the driver's door open. */
export const Car: React.FC<{ x: number; y: number; s?: number; shiny?: boolean; door?: number; color?: string; facing?: 1 | -1 }> = ({
  x, y, s = 1, shiny, door = 0, color, facing = 1,
}) => {
  const body = color ?? (shiny ? "#6b3fa0" : "#9aa58c");
  const w = shiny ? 560 : 400;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <ellipse cx={-w / 2} cy={4} rx={w / 2 + 30} ry={16} fill="#000" opacity={0.25} />
      {shiny ? (
        <g>
          <path d={`M${-w} -40 Q${-w} -110 ${-w + 60} -112 L${-w + 150} -116 Q${-w + 220} -200 ${-w + 330} -200 Q${-w + 420} -200 ${-w + 460} -120 L-20 -110 Q8 -100 8 -40 Z`} fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M${-w + 180} -120 Q${-w + 236} -186 ${-w + 320} -186 L${-w + 330} -120Z`} fill="#cfe6f0" stroke={INK} strokeWidth={4} />
          <path d={`M${-w + 344} -120 L${-w + 340} -186 Q${-w + 404} -184 ${-w + 438} -120Z`} fill="#cfe6f0" stroke={INK} strokeWidth={4} />
          <rect x={-w - 4} y={-62} width={w + 16} height={14} rx={7} fill={STEEL_LIGHT} stroke={INK} strokeWidth={3} />
          <path d={`M${-w + 60} -100 L-40 -96`} stroke="#fff" strokeWidth={6} opacity={0.5} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d={`M${-w} -36 Q${-w} -100 ${-w + 40} -104 L${-w + 90} -110 Q${-w + 130} -180 ${-w + 220} -180 Q${-w + 300} -178 ${-w + 330} -110 L-16 -100 Q6 -94 6 -36 Z`} fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M${-w + 120} -112 Q${-w + 150} -166 ${-w + 214} -166 L${-w + 220} -112Z`} fill="#cfe6f0" stroke={INK} strokeWidth={4} />
          <path d={`M${-w + 160} -70 q14 10 30 0 q10 -6 24 4`} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
          <rect x={-w - 4} y={-52} width={30} height={14} rx={5} fill="#c9c2a8" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {door > 0 && (
        <path d={`M${-w + 330} -116 L${-w + 330 + 150 * (1 - door * 0.7)} -112 L${-w + 330 + 150 * (1 - door * 0.7)} -36 L${-w + 330} -40Z`}
          fill={body} stroke={INK} strokeWidth={5} opacity={0.95} />
      )}
      {[shiny ? -w + 110 : -w + 80, shiny ? -110 : -80].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-30} r={shiny ? 44 : 38} fill="#24262c" stroke={INK} strokeWidth={5} />
          <circle cx={cx} cy={-30} r={shiny ? 22 : 16} fill={shiny ? STEEL_LIGHT : "#8a8f96"} stroke={INK} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

/** The delivery truck that carries machines: a cab at the right, an open steel flatbed behind (things stand on it at
 *  `bedY()` from the truck's origin). Wheels on y. */
export const Truck: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={-380} cy={6} rx={460} ry={18} fill="#000" opacity={0.25} />
    <g>{children}</g>
    <rect x={-760} y={-120} width={560} height={50} rx={6} fill={STEEL} stroke={INK} strokeWidth={6} />
    <rect x={-760} y={-200} width={14} height={86} fill={STEEL_DARK} stroke={INK} strokeWidth={3} />
    <rect x={-214} y={-200} width={14} height={86} fill={STEEL_DARK} stroke={INK} strokeWidth={3} />
    <path d="M-190 -60 V-250 Q-190 -270 -170 -270 H-60 Q-20 -270 0 -200 L10 -60Z" fill={TEAL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-160 -244 H-70 Q-40 -244 -26 -190 H-160Z" fill="#cfe6f0" stroke={INK} strokeWidth={4} />
    <rect x={-770} y={-74} width={790} height={26} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
    {[-660, -330, -80].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={-30} r={42} fill="#24262c" stroke={INK} strokeWidth={5} />
        <circle cx={cx} cy={-30} r={18} fill="#8a8f96" stroke={INK} strokeWidth={4} />
      </g>
    ))}
  </g>
);
/** Where things stand on the truck's bed, relative to its origin (scale 1). */
export const BED_Y = -120;

/** A small clink mark: a few short strokes radiating from (x, y), for a stool taken or a glass set down. */
export const Clink: React.FC<{ x: number; y: number; f: number; color?: string }> = ({ x, y, f, color = PAPER }) => {
  if (f < 0 || f > 10) return null;
  const k = ramp(f, 0, 10);
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - k}>
      {[-60, -30, 0, 30, 60].map((a) => {
        const r = (a - 90) * (Math.PI / 180);
        return <line key={a} x1={Math.cos(r) * (16 + 20 * k)} y1={Math.sin(r) * (16 + 20 * k)} x2={Math.cos(r) * (30 + 30 * k)} y2={Math.sin(r) * (30 + 30 * k)}
          stroke={color} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};
