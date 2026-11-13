// Who is who (owner, 2026-11-13, on the v2 cut): every speaking character has a name, a one-second name tag the first
// time they are in frame, and a mouth that moves while they speak (the rig's own mouth shapes, from make_mouths.py:
// no lip_sync model, which stays banned).
import { useCurrentFrame } from "remotion";
import type { Mouth } from "@whatif/kit/rig/Figure";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { MOUTHS } from "../mouths";
import { clamp01, ease } from "./util";

const SHAPE: Record<number, Mouth> = { 1: "open", 2: "o" };

/** The mouth `name` has at `frame` while speaking, or null when they are silent. */
export function mouthAt(name: string, frame: number): Mouth | null {
  const r = MOUTHS[name];
  if (!r) return null;
  let lo = 0;
  let hi = r.length / 3 - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [a, b, k] = [r[mid * 3], r[mid * 3 + 1], r[mid * 3 + 2]];
    if (frame < a) hi = mid - 1;
    else if (frame >= b) lo = mid + 1;
    else return SHAPE[k] ?? null;
  }
  return null;
}

/** `talk("Lotte")` is `{ mouth }` while Lotte speaks, else `{}`: spread it after the face so it wins. */
export function useTalk(): (name: string) => { mouth?: Mouth } {
  const frame = useCurrentFrame();
  return (name) => {
    const m = mouthAt(name, frame);
    return m ? { mouth: m } : {};
  };
}

/** A paper name tag pinned beside a character for about a second: the name large, the role under it. */
export const NameTag: React.FC<{ name: string; role?: string; x: number; y: number; f: number; len: number; side?: "left" | "right" }> = ({
  name, role, x, y, f, len, side = "right",
}) => {
  const k = ease(clamp01(f / 8)) * (1 - ease(clamp01((f - (len - 8)) / 8)));
  const w = Math.max(name.length * 30, (role ?? "").length * 17) + 48;
  const left = side === "right" ? x : x - w;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
      <g transform={`translate(${left} ${y - 10 + (1 - k) * 12}) rotate(${side === "right" ? -2 : 2})`}>
        <rect x={0} y={0} width={w} height={role ? 96 : 64} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
        <text x={24} y={46} fontFamily={FONT} fontWeight={800} fontSize={42} fill={INK}>{name}</text>
        {role && <text x={24} y={80} fontFamily={FONT} fontWeight={600} fontSize={26} fill={INK} opacity={0.7}>{role}</text>}
      </g>
    </svg>
  );
};
