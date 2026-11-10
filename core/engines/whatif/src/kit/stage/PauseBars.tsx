import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../theme";
import type { Pause } from "../world/clock";
import { useSoundOnly } from "../sound";
import { barHeight } from "./bars";

export const PauseBars: React.FC<{ frame: number; pauses: Pause[] }> = ({ frame, pauses }) => {
  const soundOnly = useSoundOnly();
  const h = barHeight(frame, pauses);
  if (soundOnly || h <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: h, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, top: HEIGHT - h, width: WIDTH, height: h, background: "#000" }} />
    </AbsoluteFill>
  );
};
