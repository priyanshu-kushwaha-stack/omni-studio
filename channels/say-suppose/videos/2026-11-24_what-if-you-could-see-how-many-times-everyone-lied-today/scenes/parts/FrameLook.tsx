// Look C helpers for the opening and closing beats (Frame, Click, Rule, Zeros, Nine): the painted plate's depth of field
// read from how big a face is on screen, a camera kept inside the plate, a figure placed by where its head should be,
// a copy of the plate cut to a shape and laid over the actors (a painted table in front of a body), the blurred near
// you of an over-the-shoulder shot, out-of-focus lights, and the counter's glow as a light on the face under it.
// The look test (looks/Looks.tsx, look C) is the pattern. No AI images.
import { MOOD_NAMES, setLook, type SetLight } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { GLOW, HERO } from "../shared";
import { Counter } from "./Counter";
import { headWorld, HeroMug, type Placed } from "./FrameKit";
import { PlateBack, plateBlur, RIM, type PlateName } from "./Plate";

/** Plate blur in screen px for a shot whose subject's head has radius `r` (world units) under `cam`: sharp on a wide,
 *  soft when a face is a third of the frame, very soft when it fills it. Never less than the zoom's own blur. */
export function dof(cam: Camera, r: number): number {
  const frac = (2 * r * cam.zoom) / 1080;
  return Math.max(plateBlur(cam.zoom), Math.min(20, Math.max(0, (frac - 0.12) * 42)));
}

/** Keep a camera inside the plate (it covers x -240..2160, y -135..1215 at the default overscan). */
export function inPlate(cam: Camera, over = 1.25): Camera {
  const hw = 960 / cam.zoom;
  const hh = 540 / cam.zoom;
  const x0 = 960 - 960 * over + hw;
  const x1 = 960 + 960 * over - hw;
  const y0 = 540 - 540 * over + hh;
  const y1 = 540 + 540 * over - hh;
  return { zoom: cam.zoom, x: Math.min(x1, Math.max(x0, cam.x)), y: Math.min(y1, Math.max(y0, cam.y)) };
}

/** A figure placed so its head's centre lands on `head` (world units). */
export function byHead(f: Omit<Placed, "x" | "y">, head: { x: number; y: number }): Placed {
  const h = headWorld({ ...f, x: 0, y: 0 });
  return { ...f, x: head.x - h.x, y: head.y - h.y };
}

/** The camera that puts a world point at a screen point at a zoom. */
export const aimAt = (world: { x: number; y: number }, screen: { x: number; y: number }, zoom: number): Camera => ({
  x: world.x - (screen.x - 960) / zoom, y: world.y - (screen.y - 540) / zoom, zoom,
});

/** The counter's warm light on the face under it, as a set light (every mood). */
export const counterLight = (at: { x: number; y: number }, strength = 0.5, r = 220): SetLight => ({
  x: at.x, y: at.y, r, color: GLOW, strength, moods: MOOD_NAMES,
});

/** A copy of the plate cut to a polygon (world units), for the actors' front layer: a painted table or seat back that
 *  must stand in front of a body. Same blur as the back, so the seam does not show. */
export const PlateCut: React.FC<{ id: string; plate: PlateName; cam: Camera; blur: number; points: [number, number][] }> = ({ id, plate, cam, blur, points }) => (
  <g>
    <defs>
      <clipPath id={`cut-${id}`}><polygon points={points.map((p) => p.join(",")).join(" ")} /></clipPath>
    </defs>
    <g clipPath={`url(#cut-${id})`}><PlateBack name={plate} cam={cam} blur={blur} /></g>
  </g>
);

/** Draw children only above a line (world y): a figure behind a table top or a seat back. */
export const Above: React.FC<{ id: string; y: number; from?: number; to?: number; children: React.ReactNode }> = ({ id, y, from = -3000, to = 5000, children }) => (
  <g>
    <defs><clipPath id={`above-${id}`}><rect x={from} y={-3000} width={to - from} height={y + 3000} /></clipPath></defs>
    <g clipPath={`url(#above-${id})`}>{children}</g>
  </g>
);

/** You, close to the lens and out of focus: the back of your head and a shoulder (look C's over-the-shoulder shot).
 *  Screen pixels: (x, y) the head's centre, r its radius; `mug` adds your mug in a blurred hand. */
export const NearYou: React.FC<{ x: number; y: number; r?: number; blur?: number; side?: "left" | "right"; mug?: boolean; coat?: string }> = ({
  x, y, r = 225, blur = 9, side = "left", mug, coat = "#2a2c33",
}) => {
  const k = r / 225;
  const s = side === "left" ? 1 : -1;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
      <g transform={`translate(${x} ${y}) scale(${k * s} ${k})`}>
        <rect x={-350} y={160} width={640} height={520} rx={200} fill={coat} />
        <path d="M-230 185 Q0 240 230 185 L230 240 Q0 290 -230 240Z" fill={HERO.scarf} />
        <circle cx={0} cy={0} r={225} fill={HERO.head} />
        <path d="M-50 -210 Q-75 -290 10 -308 Q-15 -245 45 -225Z" fill="#23252b" />
        {mug && <HeroMug x={300} y={260} scale={8} steam={false} />}
      </g>
    </svg>
  );
};

/** Out-of-focus lights behind a close-up (screen pixels): [x, y, r, alpha], and optionally a far counter. */
export const Bokeh: React.FC<{ frame: number; spots: [number, number, number, number][]; blur?: number;
  far?: { x: number; y: number; base: number; ticks?: number[]; size?: number; id: string } }> = ({ frame, spots, blur = 10, far }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
    {spots.map(([x, y, r, a], i) => <circle key={i} cx={x + Math.sin((frame + i * 40) / 40) * 6} cy={y} r={r} fill={GLOW} opacity={a} />)}
    {far && <g opacity={0.85}><Counter x={far.x} y={far.y} base={far.base} ticks={far.ticks} frame={frame} size={far.size ?? 70} id={far.id} /></g>}
  </svg>
);

/** Actors over a finished plate scene, with look C's rim and no second grade or vignette: for a figure that stands in
 *  front of the plate's front layer (you, close to the lens, in front of a painted table cut over the boss). */
export const ActorLayer: React.FC<{ cam: Camera; mood: MoodName; rimFrom?: "left" | "right"; children: React.ReactNode }> = ({ cam, mood, rimFrom = "left", children }) => {
  const look = setLook([], mood, cam, { rim: { color: RIM.warm, dx: rimFrom === "left" ? -7 : 7, dy: -3 }, grade: undefined, actorGrade: 0, dof: 0, vignette: 0, haze: 0 });
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<g />} actors={children} />
    </LookContext.Provider>
  );
};

/** Background props drawn in the actors' plane but as soft as the plate behind them (`px` screen pixels of blur). */
export const Soft: React.FC<{ id: string; px: number; zoom: number; children: React.ReactNode }> = ({ id, px, zoom, children }) => {
  const sd = Math.round((px / zoom) * 4) / 4;
  if (sd <= 0) return <>{children}</>;
  const fid = `${id}-${Math.round(sd * 4)}`;
  return (
    <g>
      <defs><filter id={fid} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={sd} /></filter></defs>
      <g filter={`url(#${fid})`}>{children}</g>
    </g>
  );
};
