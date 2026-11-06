import { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../theme";

/** Screen-space light: a soft glow on a light source, in output pixels. */
export interface Glow { x: number; y: number; r: number; color: string; strength?: number }

/** Lighting for a shot. Everything is optional; the default is the sample's flat daylight. */
export interface Look {
  /** Depth of field: blur in px per unit of distance from the focus depth. */
  dof?: number;
  /** The depth that is in focus (1 = the actors' plane). */
  focus?: number;
  /** Rim light on actors: the light's colour and the direction it comes from, in px. */
  rim?: { color: string; dx: number; dy: number };
  /** Colour grade multiplied over the world, top to bottom. */
  grade?: { top: string; bottom: string; opacity?: number };
  glows?: Glow[];
  /** A pale band of haze across the lower frame, 0 to 1. */
  haze?: number;
  /** Letterbox bar height in px. */
  bars?: number;
  /** CSS filter on the whole world, e.g. contrast and saturation for a filmic grade. */
  film?: string;
  /** Darkness of the edge vignette, 0 to 1. */
  vignette?: number;
}

export const LookContext = createContext<Look>({});
export const useLook = () => useContext(LookContext);

/** Blur for a layer at a given depth, in SVG user units. */
export function layerBlur(look: Look, depth: number): number {
  if (!look.dof) return 0;
  return Math.abs(depth - (look.focus ?? 1)) * look.dof;
}

/** Light laid over the world and actors: grade (multiply), glows (screen), haze. */
export const Light: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {look.grade && (
        <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: look.grade.opacity ?? 1,
          background: `linear-gradient(180deg, ${look.grade.top} 0%, ${look.grade.bottom} 100%)` }} />
      )}
      {look.haze ? (
        <AbsoluteFill style={{ mixBlendMode: "screen", opacity: look.haze,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(255,214,170,0.55) 70%, rgba(0,0,0,0) 100%)" }} />
      ) : null}
      {look.vignette ? (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,6,20,${look.vignette}) 100%)` }} />
      ) : null}
      {(look.glows ?? []).map((g, i) => (
        <AbsoluteFill key={i} style={{ mixBlendMode: "screen", opacity: g.strength ?? 1,
          background: `radial-gradient(circle at ${g.x}px ${g.y}px, ${g.color} 0%, rgba(0,0,0,0) ${g.r}px)` }} />
      ))}
    </AbsoluteFill>
  );
};

export const Bars: React.FC = () => {
  const { bars } = useLook();
  if (!bars) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: bars, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, top: HEIGHT - bars, width: WIDTH, height: bars, background: "#000" }} />
    </AbsoluteFill>
  );
};
