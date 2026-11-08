import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";
import { INK, PAPER } from "../theme";

const W = 190;
const H = 240;

const Half: React.FC<{ value: string; part: "top" | "bottom"; scale?: number }> = ({ value, part, scale = 1 }) => (
  <div
    style={{
      position: "absolute", left: 0, width: W, height: H / 2 - 2,
      top: part === "top" ? 0 : H / 2 + 2,
      overflow: "hidden", background: INK,
      borderRadius: part === "top" ? "18px 18px 0 0" : "0 0 18px 18px",
      transform: `scaleY(${scale})`,
      transformOrigin: part === "top" ? "bottom" : "top",
    }}
  >
    <div
      style={{
        position: "absolute", left: 0, width: W, height: H, lineHeight: `${H}px`,
        top: part === "top" ? 0 : -(H / 2 + 2),
        textAlign: "center", color: PAPER, fontFamily: FONT, fontWeight: 800, fontSize: value.length > 1 ? 118 : 158,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </div>
  </div>
);

/** Split-flap digit. `changedAt` is the frame `value` last changed; the flap falls over the next 8 frames. */
export const Flip: React.FC<{ value: string; previous: string; changedAt: number }> = ({ value, previous, changedAt }) => {
  const frame = useCurrentFrame();
  const t = frame - changedAt;
  const fold = interpolate(t, [0, 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const open = interpolate(t, [4, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", width: W, height: H, filter: "drop-shadow(0 12px 16px rgba(0,0,0,.35))" }}>
      <Half value={value} part="top" />
      <Half value={previous} part="bottom" />
      {fold > 0 && <Half value={previous} part="top" scale={fold} />}
      {open > 0 && <Half value={value} part="bottom" scale={open} />}
    </div>
  );
};
