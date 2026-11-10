import { AbsoluteFill, Easing, interpolate } from "remotion";
import { HEIGHT, WIDTH } from "../theme";
import type { Pause } from "../world/clock";
import { useSoundOnly } from "../sound";
import { layerBlur, Light, useLook } from "./Look";

export interface Camera { x: number; y: number; zoom: number }

export const camTransform = (c: Camera) =>
  `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${c.zoom}) translate(${-c.x} ${-c.y})`;

export const toScreen = (c: Camera, x: number, y: number) => ({
  x: WIDTH / 2 + (x - c.x) * c.zoom,
  y: HEIGHT / 2 + (y - c.y) * c.zoom,
});

/** A paper layer that drifts less than the camera the further back it is. depth 1 is the actors' plane. */
export const Layer: React.FC<{ cam: Camera; depth: number; flat?: boolean; children: React.ReactNode }> = ({ cam, depth, flat, children }) => {
  const blur = Math.round(layerBlur(useLook(), depth) * 2) / 2;
  const body = <g transform={`translate(${cam.x * (1 - depth)} ${cam.y * (1 - depth)})`} filter={flat ? undefined : "url(#cut)"}>{children}</g>;
  return blur > 0 ? <g filter={`url(#dof-${blur * 2})`}>{body}</g> : body;
};

const FULL = 2350;

/** Radius of the grey wave: it spreads out when the pause starts and pulls back just before it ends. */
export function waveRadius(frame: number, pause: Pause): number {
  const ease = { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const spread = interpolate(frame, [pause.from, pause.from + 15], [0, 1], ease);
  const retreat = interpolate(frame, [pause.to - 13, pause.to], [1, 0], { ...ease, easing: Easing.in(Easing.cubic) });
  return FULL * Math.min(spread, retreat);
}

const Defs = () => (
  <defs>
    <filter id="cut" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2a1c10" floodOpacity="0.28" />
    </filter>
    {Array.from({ length: 40 }, (_, i) => (
      <filter key={i} id={`dof-${i + 1}`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={(i + 1) / 2} />
      </filter>
    ))}
  </defs>
);

const Sheet: React.FC<{ cam: Camera; sky?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> = ({ cam, sky, children, style }) => (
  <AbsoluteFill style={style}>
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs />
      {sky}
      <g transform={camTransform(cam)}>{children}</g>
    </svg>
  </AbsoluteFill>
);

const GREY: React.CSSProperties = { filter: "grayscale(1) contrast(0.82) brightness(1.1)" };

/** Colour and grey copies of a world layer; the wave reveals the grey one from its origin outward. */
const Dual: React.FC<{ cam: Camera; radius: number; origin: { x: number; y: number }; sky?: React.ReactNode; children: React.ReactNode }> = ({ cam, radius, origin, sky, children }) => {
  const clip = `circle(${radius}px at ${origin.x}px ${origin.y}px)`;
  return (
    <>
      {radius < FULL && <Sheet cam={cam} sky={sky}>{children}</Sheet>}
      {radius > 0 && (
        <AbsoluteFill style={radius < FULL ? { clipPath: clip } : undefined}>
          <Sheet cam={cam} sky={sky} style={GREY}>{children}</Sheet>
        </AbsoluteFill>
      )}
    </>
  );
};

export const Stage: React.FC<{
  cam: Camera;
  radius: number;
  origin: { x: number; y: number };
  sky?: React.ReactNode;
  back: React.ReactNode;
  actors: React.ReactNode;
  front?: React.ReactNode;
}> = ({ cam, radius, origin, sky, back, actors, front }) => {
  const soundOnly = useSoundOnly();
  const look = useLook();
  if (soundOnly) return null;
  const rim = look.rim
    ? { filter: `drop-shadow(${look.rim.dx}px ${look.rim.dy}px 0 ${look.rim.color}) drop-shadow(0 0 ${Math.hypot(look.rim.dx, look.rim.dy) * 2}px ${look.rim.color}66)` }
    : undefined;
  return (
  <AbsoluteFill style={look.film ? { filter: look.film } : undefined}>
    <Dual cam={cam} radius={radius} origin={origin} sky={sky}>{back}</Dual>
    <Light pass="world" />
    <Sheet cam={cam} style={rim}>{actors}</Sheet>
    {front && <Dual cam={cam} radius={radius} origin={origin}>{front}</Dual>}
    <Light pass="over" />
    {radius > 0 && radius < FULL && (
      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT}>
          <circle cx={origin.x} cy={origin.y} r={radius} fill="none" stroke="#fff" strokeWidth={10} opacity={0.75} />
        </svg>
      </AbsoluteFill>
    )}
  </AbsoluteFill>
  );
};

/** Printed-paper grain and a soft vignette over everything. */
export const Finish: React.FC = () => {
  if (useSoundOnly()) return null;
  return (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", mixBlendMode: "multiply", opacity: 0.22 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.6" intercept="0.55" />
          <feFuncG type="linear" slope="0.6" intercept="0.55" />
          <feFuncB type="linear" slope="0.6" intercept="0.55" />
        </feComponentTransfer>
      </filter>
      <rect width={WIDTH} height={HEIGHT} filter="url(#grain)" />
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 58%, rgba(30,20,10,0.3) 100%)" }} />
  </AbsoluteFill>
  );
};
