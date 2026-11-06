import { evolvePath } from "@remotion/paths";
import { interpolate, useCurrentFrame } from "remotion";

/** A line that draws itself between `from` and `to` frames: a tape measure, a fall arc, a route on a paper map. */
export const DrawLine: React.FC<{ d: string; from: number; to: number; color: string; width?: number; dash?: boolean }> = ({
  d, from, to, color, width = 8, dash,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t <= 0) return null;
  const { strokeDasharray, strokeDashoffset } = evolvePath(t, d);
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"
        strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
      {dash && t >= 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={width / 3} strokeDasharray="12 18" opacity={0.6} />}
    </g>
  );
};
