// A 3D still filling the frame with its camera move, a split pair side by side, and the stand-in for a still that
// isn't rendered yet (a dark frame with the shot id, so the reel plays before every still exists).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { PAPER } from "@whatif/kit/theme";
import { easeSine, mix, type Move, type Shot } from "../data";

const W = 1920;
const H = 1080;

/** The move as a CSS transform at progress p (0..1, eased): about 8 % zoom, or a 6 % pan or drift at 8 % scale. */
export function moveTransform(move: Move, p: number): string {
  const e = easeSine(p);
  switch (move) {
    case "push_out":
      return `scale(${mix(1.08, 1, e)})`;
    case "pan_left":
      return `scale(1.08) translateX(${mix(-0.031, 0.031, e) * W}px)`;
    case "pan_right":
      return `scale(1.08) translateX(${mix(0.031, -0.031, e) * W}px)`;
    case "drift_up":
      return `scale(1.08) translateY(${mix(-0.03, 0.03, e) * H}px)`;
    case "hold":
      return `scale(${mix(1.02, 1.035, e)})`;
    default:
      return `scale(${mix(1, 1.08, e)})`;
  }
}

export const Missing: React.FC<{ shot: Shot | null; half?: boolean }> = ({ shot, half }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #22252d 0%, #111318 75%)", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, color: "#5d6370", fontSize: half ? 90 : 130, letterSpacing: 4 }}>{shot?.id ?? "—"}</div>
    {shot && (
      <div style={{ fontFamily: FONT, fontWeight: 800, color: "#454a55", fontSize: 30, marginTop: 10, maxWidth: half ? 820 : 1400,
        textAlign: "center", lineHeight: 1.25 }}>
        {shot.move} · “{shot.anchor.length > 60 ? `${shot.anchor.slice(0, 60)}…` : shot.anchor}”
      </div>
    )}
  </AbsoluteFill>
);

/** One still, `p` its move's progress. In a split half the still is centre-cropped to the half's width. */
export const Still: React.FC<{ shot: Shot | null; p: number; half?: boolean }> = ({ shot, p, half }) => {
  if (!shot || !shot.exists) return <Missing shot={shot} half={half} />;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", top: 0, left: half ? -(W / 4) : 0, width: W, height: H, transform: moveTransform(shot.move, p) }}>
        <Img src={staticFile(shot.still)} style={{ width: W, height: H, objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};

/** A split pair: left still in the left half, right in the right, a thin paper divider between. */
export const Split: React.FC<{ shots: (Shot | null)[]; p: number }> = ({ shots, p }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {[0, 1].map((k) => (
      <div key={k} style={{ position: "absolute", top: 0, left: k * (W / 2), width: W / 2, height: H, overflow: "hidden" }}>
        <Still shot={shots[k]} p={p} half />
      </div>
    ))}
    <div style={{ position: "absolute", top: 0, left: W / 2 - 4, width: 8, height: H, background: PAPER,
      boxShadow: "0 0 18px rgba(0,0,0,.55)" }} />
  </AbsoluteFill>
);
