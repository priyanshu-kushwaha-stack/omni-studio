// Shared pieces for the sixty-seconds first cut: timing helpers, the cast, and the rule device (the ghost layer).
import { Easing, interpolate } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { camTransform, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, HEIGHT, MUSTARD, TEAL, WIDTH } from "@whatif/kit/theme";

// ---------- timing ----------

export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const linear = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const blinking = (frame: number, seed = 0) => (frame + seed * 37) % 97 < 4;
export const noise = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export function camAt(frame: number, keys: [number, Camera][]): Camera {
  if (keys.length === 1) return keys[0][1];
  const at = (pick: (c: Camera) => number) =>
    interpolate(frame, keys.map((k) => k[0]), keys.map((k) => pick(k[1])), {
      easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  return { x: at((c) => c.x), y: at((c) => c.y), zoom: at((c) => c.zoom) };
}

/** What a shot knows: frames since it started, its length, and line starts and ends relative to its start, so motion
 *  rides the narration's words (a new take re-times the shot). */
export interface S {
  f: number;
  d: number;
  /** Start of narration line i, in shot frames. */
  at: (i: number) => number;
  /** End of narration line i, in shot frames. */
  end: (i: number) => number;
  /** The film frame (for blinks and ripples that should not restart on a cut). */
  frame: number;
}
export const makeS = (frame: number, from: number, to: number, clips: Clip[]): S => ({
  f: frame - from,
  d: Math.max(1, to - from),
  at: (i) => clips[i].from - from,
  end: (i) => clips[i].from + clips[i].frames - from,
  frame,
});

// ---------- cast (channels/say-suppose/cast.md) ----------

type Fig = Omit<FigureProps, "head"> & { face?: keyof typeof EXPRESSIONS };
const faceOf = (face?: keyof typeof EXPRESSIONS) => (face ? EXPRESSIONS[face] : {});

/** You: mustard head, tuft, teal scarf. */
export const You: React.FC<Fig> = ({ face = "neutral", ...p }) => (
  <Figure head={MUSTARD} scarf={TEAL} tuft flow={0.15} {...faceOf(face)} {...p} />
);
export const GRANDPA = { head: "#a9c9a4", coat: "#e9e2d0" };
/** Grandfather: pale green head, white tuft drawn as hair, round glasses, a cream kurta. */
export const Grandpa: React.FC<Fig> = ({ face = "happy", ...p }) => {
  const s = p.scale ?? 1;
  return (
    <g>
      <Figure head={GRANDPA.head} coat={GRANDPA.coat} {...faceOf(face)} {...p} />
      <Specs x={p.x} y={p.y} s={s} pose={p.pose ?? STAND} facing={p.facing ?? 1} />
    </g>
  );
};
import { joints } from "@whatif/kit/rig/pose";
const Specs: React.FC<{ x: number; y: number; s: number; pose: Pose; facing: 1 | -1 }> = ({ x, y, s, pose, facing }) => {
  const h = joints(pose).head;
  const cx = x + h.x * s * facing;
  const cy = y + h.y * s;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <path d="M-30 -48 Q-10 -70 18 -56 Q4 -62 -30 -48Z" fill="#f4f1ea" />
      <circle cx={-14} cy={-6} r={13} fill="none" stroke="#3a3a3a" strokeWidth={3} />
      <circle cx={16} cy={-6} r={13} fill="none" stroke="#3a3a3a" strokeWidth={3} />
      <line x1={-1} y1={-6} x2={3} y2={-6} stroke="#3a3a3a" strokeWidth={3} />
    </g>
  );
};
export const MOM = { head: "#e0a070", coat: "#b58fc7" };
export const Mom: React.FC<Fig> = ({ face = "happy", ...p }) => <Figure head={MOM.head} coat={MOM.coat} {...faceOf(face)} {...p} />;
export const Cousin: React.FC<Fig> = ({ face = "neutral", ...p }) => <Figure head="#7fc29b" cap="#3d6fb0" {...faceOf(face)} {...p} />;
export const Boss: React.FC<Fig> = ({ face = "happy", ...p }) => <Figure head="#7fa0c4" tie={CRIMSON} {...faceOf(face)} {...p} />;
export const Vendor: React.FC<Fig> = ({ face = "neutral", ...p }) => <Figure head="#c96f2d" coat="#6d7f8f" {...faceOf(face)} {...p} />;
export const PASTELS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#c96f2d", "#9fb7a8"];
export const Person: React.FC<Fig & { i: number }> = ({ i, face = "neutral", ...p }) => (
  <Figure head={PASTELS[i % PASTELS.length]} {...faceOf(face)} {...p} />
);
/** The stranger: crimson head, long dark coat. Hidden once, on the 2:30 platform, with no ghost. */
export const Stranger: React.FC<Fig> = ({ face = "neutral", ...p }) => (
  <Figure head={CRIMSON} coat="#3f3346" {...faceOf(face)} {...p} />
);
export { STAND, walkPose };
export type { Pose };

// ---------- the rule device: the ghost layer, one minute ahead ----------

/** The ghost's colour: everything mapped to a pale blue-white, keeping light and dark apart (as the thumbnail). */
export const GhostDefs: React.FC = () => (
  <defs>
    <filter id="ghost" x="-20%" y="-20%" width="140%" height="140%">
      <feColorMatrix type="matrix" values="0.12 0.24 0.04 0 0.62  0.12 0.24 0.04 0 0.68  0.12 0.24 0.04 0 0.76  0 0 0 1 0" />
    </filter>
  </defs>
);

/** The redraw: a page-turn ripple. `r` runs 0..1 over about 14 frames from the moment you act; the ghost layer
 *  shears, flickers and resettles, and a pale fold sweeps across the frame. */
export const rippleAt = (frame: number, at: number | number[], len = 14) => {
  const list = Array.isArray(at) ? at : [at];
  let r = 0;
  for (const a of list) if (frame >= a && frame < a + len) r = Math.max(r, (frame - a) / len);
  return r;
};

/** Ghost elements drawn in the shot's own world coordinates, over the coloured world. */
export const Ghost: React.FC<{ cam: Camera; r?: number; opacity?: number; children: React.ReactNode }> = ({ cam, r = 0, opacity = 0.42, children }) => {
  const shear = r > 0 ? Math.sin(r * Math.PI) * 18 : 0;
  const flick = r > 0 ? 1 - Math.sin(r * Math.PI) * 0.6 : 1;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", left: 0, top: 0 }}>
      <GhostDefs />
      <g transform={camTransform(cam)}>
        <g filter="url(#ghost)" opacity={opacity * flick} transform={`translate(${shear} 0) skewX(${-shear * 0.08})`}>
          {children}
        </g>
      </g>
      {r > 0 && (
        <rect x={mix(-500, WIDTH + 100, r)} y={0} width={380} height={HEIGHT} fill="#eef4ff" opacity={0.18 * Math.sin(r * Math.PI)}
          transform={`skewX(-12)`} />
      )}
    </svg>
  );
};
