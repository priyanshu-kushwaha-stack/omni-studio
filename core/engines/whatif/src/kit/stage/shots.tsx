import { noise2D } from "@remotion/noise";
import { INK } from "../theme";
import type { Camera } from "./Stage";

/** Camera framings. Coordinates are world units, as in the scenes. */
export const wide = (x: number, y: number): Camera => ({ x, y, zoom: 1.1 });
export const medium = (x: number, y: number): Camera => ({ x, y, zoom: 1.6 });
/** A face fills about a third of the frame: centre on the head. */
export const closeUp = (headX: number, headY: number, zoom = 2.8): Camera => ({ x: headX, y: headY + 20, zoom });
export const insert = (x: number, y: number, zoom = 4): Camera => ({ x, y, zoom });

/** Slow organic drift for a held shot, so a still frame breathes. Never applied to drawings themselves (no boil). */
export function drift(cam: Camera, frame: number, seed = "cam", amount = 6): Camera {
  return {
    ...cam,
    x: cam.x + noise2D(seed, frame / 160, 0) * amount,
    y: cam.y + noise2D(seed, 0, frame / 160) * amount * 0.6,
  };
}

/** A blurred dark head and shoulder in the near foreground, for over-the-shoulder shots. Screen pixels. */
export const ForegroundHead: React.FC<{ x: number; side?: "left" | "right"; blur?: number }> = ({ x, side = "left", blur = 14 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
    <g transform={`translate(${x} 1080) scale(${side === "left" ? 1 : -1} 1)`}>
      <circle cx={0} cy={-520} r={250} fill={INK} />
      <rect x={-330} y={-300} width={660} height={400} rx={160} fill={INK} />
    </g>
  </svg>
);
