import { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";
import { useSoundOnly } from "../sound";

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
  /** CSS filter on the whole world, e.g. contrast and saturation for a filmic grade. */
  film?: string;
  /** Darkness of the edge vignette, 0 to 1. */
  vignette?: number;
  /** How much of the grade falls on the actors, 0 to 1. Default ACTOR_GRADE: the world takes the mood, the characters
   *  keep their brand colours (mustard, teal, crimson) with only a hint of it. */
  actorGrade?: number;
}

export const ACTOR_GRADE = 0.2;

/** The share of a look's grade that lands on the actors (never more than the grade itself). */
export const actorGrade = (look: Look) => Math.min(look.actorGrade ?? ACTOR_GRADE, look.grade?.opacity ?? 1);

export const LookContext = createContext<Look>({});
export const useLook = () => useContext(LookContext);

/** Blur for a layer at a given depth, in SVG user units. */
export function layerBlur(look: Look, depth: number): number {
  if (!look.dof) return 0;
  return Math.abs(depth - (look.focus ?? 1)) * look.dof;
}

/** Light in two passes. "world" goes under the actors: most of the grade, and the haze. "over" goes on top of
 *  everything: the actors' share of the grade (so the world ends near the full grade), the vignette and the glows. */
export const Light: React.FC<{ pass?: "world" | "over" }> = ({ pass = "over" }) => {
  const soundOnly = useSoundOnly();
  const look = useLook();
  if (soundOnly) return null;
  const full = look.grade?.opacity ?? 1;
  const actors = actorGrade(look);
  const grade = pass === "world" ? Math.max(0, full - actors) : actors;
  if (pass === "world") {
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {look.grade && grade > 0 && (
          <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: grade,
            background: `linear-gradient(180deg, ${look.grade.top} 0%, ${look.grade.bottom} 100%)` }} />
        )}
        {look.haze ? (
          <AbsoluteFill style={{ mixBlendMode: "screen", opacity: look.haze,
            background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(255,214,170,0.55) 70%, rgba(0,0,0,0) 100%)" }} />
        ) : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {look.grade && grade > 0 && (
        <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: grade,
          background: `linear-gradient(180deg, ${look.grade.top} 0%, ${look.grade.bottom} 100%)` }} />
      )}
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
