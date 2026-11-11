// Small shared building blocks for the shots: a scene wrapper (stage plus ghost layer), speech bubbles, a paper tag.
import { AbsoluteFill } from "remotion";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Ghost } from "./shared";

/** One shot: the set behind, the actors, and the ghost layer one minute ahead over them. */
export const Scene: React.FC<{
  cam: Camera; back: React.ReactNode; actors: React.ReactNode; ghost?: React.ReactNode; r?: number; ghostOpacity?: number;
  front?: React.ReactNode; over?: React.ReactNode;
}> = ({ cam, back, actors, ghost, r = 0, ghostOpacity, front, over }) => (
  <AbsoluteFill>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} front={front} />
    {ghost && <Ghost cam={cam} r={r} opacity={ghostOpacity}>{ghost}</Ghost>}
    {over}
  </AbsoluteFill>
);

/** A speech bubble in screen space, four words or fewer (style.md). `p` 0..1 pops it in. */
export const Bubble: React.FC<{ x: number; y: number; text: string; p: number; tail?: "left" | "right" }> = ({ x, y, text, p, tail = "left" }) =>
  p <= 0 ? null : (
    <div style={{
      position: "absolute", left: x, top: y, transform: `scale(${0.6 + 0.4 * Math.min(1, p * 1.4)})`, transformOrigin: tail === "left" ? "left bottom" : "right bottom",
      background: PAPER, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 52, padding: "16px 30px", borderRadius: 36,
      border: `6px solid ${INK}`, opacity: Math.min(1, p * 3), whiteSpace: "nowrap",
    }}>{text}</div>
  );

/** The channel's stamped tag: mustard on ink with a paper edge, in screen space. */
export const Stamp: React.FC<{ x: number; y: number; text: string; p: number; size?: number; tilt?: number }> = ({ x, y, text, p, size = 64, tilt = -3 }) =>
  p <= 0 ? null : (
    <div style={{
      position: "absolute", left: x, top: y, transform: `rotate(${tilt}deg) scale(${0.7 + 0.3 * Math.min(1, p * 1.5)})`,
      background: INK, color: MUSTARD, border: `5px solid ${PAPER}`, borderRadius: 14, fontFamily: FONT, fontWeight: 800,
      fontSize: size, padding: `${size * 0.15}px ${size * 0.3}px`, opacity: Math.min(1, p * 3), whiteSpace: "nowrap", letterSpacing: 2,
    }}>{text}</div>
  );
