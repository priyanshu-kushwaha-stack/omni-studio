import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";
import { INK, PAPER } from "../theme";

/** A small paper tag in the lower left that names where a spoken number comes from. It fades in at `from` and out
 *  at `to`, and stays clear of the lower-right corner, where the player and end screens sit. */
export const SourceTag: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const frame = useCurrentFrame();
  if (!text || frame < from || frame > to) return null;
  const o = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, bottom: 96, opacity: o, transform: "rotate(-1.5deg)", background: PAPER,
      color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 1, padding: "8px 16px", borderRadius: 6,
      boxShadow: "0 5px 0 rgba(30,20,10,.25)", maxWidth: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {text}
    </div>
  );
};
