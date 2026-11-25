// Look C helpers for the Floor, SayItAgain, TenOutOfTen and EverybodyTexts beats (owner, 2026-11-25: "painted room, our
// cast"): plate pixels to world units, perspective scale on a plate's floor, a clip that seats a puppet behind painted
// furniture, the blurred foreground shoulder of an over-the-shoulder shot, a cut list with slow push-ins, the counter's
// glow as a light, and a phone held up to camera. Everything is code; the plates are in assets/plates/.
import { interpolate } from "remotion";
import { joints, type Pose } from "@whatif/kit/rig/pose";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { GLOW } from "../shared";

/** A point on a 1536x864 plate image, in world units (the plate spans -240..2160 x -135..1215 at `over` 1.25). */
export const pw = (u: number, v: number) => ({ x: -240 + u * 1.5625, y: -135 + v * 1.5625 });

/** A standing figure's scale for feet at world y on a plate whose eye line is at world y `horizon` (`k` world units of
 *  floor below the eye line per unit of scale). */
export const scaleAt = (feetY: number, horizon: number, k = 290) => Math.max(0.3, (feetY - horizon) / k);

/** Draws `children` only above world y `y` (with `x`, the cut applies only inside that x range): a puppet sitting or
 *  standing behind a painted table or desk loses the part the furniture would hide. `id` must be unique in the frame. */
export const Cut: React.FC<{ y: number; x?: [number, number]; id: string; children: React.ReactNode }> = ({ y, x, id, children }) => (
  <g>
    <clipPath id={`cut-${id}`}>
      <rect x={-4000} y={-4000} width={10000} height={y + 4000} />
      {x && <rect x={-4000} y={y - 1} width={x[0] + 4000} height={10000} />}
      {x && <rect x={x[1]} y={y - 1} width={10000} height={10000} />}
    </clipPath>
    <g clipPath={`url(#cut-${id})`}>{children}</g>
  </g>
);

/** The near, out-of-focus head and shoulder of an over-the-shoulder shot, in screen pixels. `x` is the head's centre;
 *  `r` its radius. Dressed as the character it belongs to. */
export const FgShoulder: React.FC<{ x: number; r?: number; head: string; coat?: string; scarf?: string; tuft?: boolean; blur?: number;
  y?: number }> = ({ x, r = 225, head, coat = "#2a2c33", scarf, tuft, blur = 9, y = 1080 + r * 0.25 - 80 }) => {
  const k = r / 225;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
      <rect x={x - 350 * k} y={y + 150 * k} width={700 * k} height={480 * k} rx={200 * k} fill={coat} />
      {scarf && <path d={`M${x - 230 * k} ${y + 175 * k} Q${x} ${y + 230 * k} ${x + 230 * k} ${y + 175 * k} L${x + 230 * k} ${y + 235 * k} Q${x} ${y + 285 * k} ${x - 230 * k} ${y + 235 * k}Z`} fill={scarf} />}
      <circle cx={x} cy={y} r={r} fill={head} />
      {tuft && <path d={`M${x - 50 * k} ${y - 210 * k} Q${x - 75 * k} ${y - 290 * k} ${x + 10 * k} ${y - 308 * k} Q${x - 15 * k} ${y - 245 * k} ${x + 45 * k} ${y - 225 * k}Z`} fill="#23252b" />}
    </svg>
  );
};

/** The feet of a figure whose head centre is at (x, headY): for placing a seated puppet by where its head shows. */
export function seatByHead(x: number, headY: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose).head;
  return { x: x - j.x * scale * facing, y: headY - j.y * scale };
}

/** One shot of a cut list: from frame `at`, the camera `cam`, pushing to `to` by the next cut (a slow push-in). */
export interface Shot { at: number; cam: Camera; to?: Camera; name?: string }

/** Keeps a camera inside the plate (-240..2160 x -135..1215 at `over` 1.25), `margin` world units in from its edge so a
 *  drift never shows past it. */
export function inPlate(c: Camera, margin = 8): Camera {
  const zoom = Math.max(1, c.zoom);
  const hx = 960 / zoom + margin;
  const hy = 540 / zoom + margin;
  const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
  return { zoom, x: clamp(c.x, -240 + hx, 2160 - hx), y: clamp(c.y, -135 + hy, 1215 - hy) };
}

/** The shot on at this frame and its camera, eased along its push and kept inside the plate. Shots must be in order. */
export function shotAt(frame: number, shots: Shot[], end: number): { cam: Camera; name: string; i: number } {
  let i = 0;
  for (let k = 0; k < shots.length; k++) if (frame >= shots[k].at) i = k;
  const s = shots[i];
  const until = shots[i + 1]?.at ?? end;
  if (!s.to || until <= s.at) return { cam: inPlate(s.cam), name: s.name ?? "", i };
  const t = interpolate(frame, [s.at, until], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const m = (a: number, b: number) => a + (b - a) * t;
  return { cam: inPlate({ x: m(s.cam.x, s.to.x), y: m(s.cam.y, s.to.y), zoom: m(s.cam.zoom, s.to.zoom) }), name: s.name ?? "", i };
}

/** A camera on a head (world centre `h`) so that the head's radius `r` fills `share` of the frame height, the head
 *  placed `dy` screen pixels below centre (room for the counter above), `dx` right of centre. */
export function onHead(h: { x: number; y: number; r: number }, share = 0.2, dx = 0, dy = 70): Camera {
  const zoom = (1080 * share) / h.r;
  return { x: h.x - dx / zoom, y: h.y - dy / zoom, zoom };
}

/** The counter's warm light on the face under it (world units), for PlateScene's `lights`. */
export const counterLight = (h: { x: number; y: number; r: number }, mood: MoodName, strength = 0.4): SetLight =>
  ({ x: h.x, y: h.y - h.r * 1.6, r: h.r * 3.2, color: GLOW, strength, moods: [mood] });

/** A phone held up in a hand, its screen `children` drawn in screen-local units 0..336 x 0..560 (top left). World
 *  units: the phone is centred on (x, y), `s` its scale. `buzz` shakes it. */
export const HeldPhone: React.FC<{ x: number; y: number; s?: number; tilt?: number; skin?: string; children?: React.ReactNode; id: string }> = ({
  x, y, s = 1, tilt = -4, skin = "#e8b04a", children, id,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    {/* the hand behind the phone: a thumb on the left edge, fingers on the right */}
    <path d="M-150 420 Q-190 300 -205 180 Q-210 140 -180 140 Q-150 150 -140 260 L-120 420Z" fill={skin} stroke={INK} strokeWidth={6} />
    <rect x={-198} y={-320} width={396} height={680} rx={48} fill="#1b1d24" stroke={INK} strokeWidth={6} />
    <clipPath id={`${id}-screen`}><rect x={-168} y={-280} width={336} height={560} rx={16} /></clipPath>
    <g clipPath={`url(#${id}-screen)`}>
      <g transform="translate(-168 -280)">
        <rect width={336} height={560} fill="#eef1f5" />
        {children}
      </g>
    </g>
    {[0, 1, 2].map((i) => <rect key={i} x={170} y={-120 + i * 70} width={56} height={46} rx={23} fill={skin} stroke={INK} strokeWidth={5} />)}
  </g>
);
