import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../fonts";
import { INK, PAPER } from "../theme";

/** A paper label that stamps in at frame `at`. */
export const Tag: React.FC<{ at: number; text: string; x: number; y: number; size?: number; tilt?: number; bg?: string; color?: string }> = ({
  at, text, x, y, size = 64, tilt = -3, bg = PAPER, color = INK,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 190, mass: 0.7 } });
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, transform: `rotate(${tilt}deg) scale(${s})`, transformOrigin: "left center",
        background: bg, color, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: 2,
        padding: `${size * 0.16}px ${size * 0.38}px`, borderRadius: 10, boxShadow: "0 8px 0 rgba(30,20,10,.28)", whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
