// Who is who (owner, 2026-11-13, on the v2 cut): every speaking character has a name, a name tag the first time they
// are in frame (v4: with one thing they do, as on the wants-you-to-fail film), and a mouth that moves while they speak
// (the rig's own mouth shapes, from make_mouths.py: no lip_sync model, which stays banned). And the fact cards (v4).
import { interpolate, useCurrentFrame } from "remotion";
import type { Mouth } from "@whatif/kit/rig/Figure";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
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

/** `talk("Anna")` is `{ mouth }` while Lotte speaks, else `{}`: spread it after the face so it wins. */
export function useTalk(): (name: string) => { mouth?: Mouth } {
  const frame = useCurrentFrame();
  return (name) => {
    const m = mouthAt(name, frame);
    return m ? { mouth: m } : {};
  };
}

/** A paper name tag pinned beside a character: the name large, the role under it, and one thing they do. */
export const NameTag: React.FC<{
  name: string; role?: string; does?: string; x: number; y: number; f: number; len: number; side?: "left" | "right";
}> = ({ name, role, does, x, y, f, len, side = "right" }) => {
  const k = ease(clamp01(f / 8)) * (1 - ease(clamp01((f - (len - 8)) / 8)));
  const w = Math.max(name.length * 30, (role ?? "").length * 18, (does ?? "").length * 17) + 48;
  const h = does ? 138 : role ? 96 : 64;
  const left = side === "right" ? x : x - w;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k }}>
      <g transform={`translate(${left} ${y - 10 + (1 - k) * 12}) rotate(${side === "right" ? -2 : 2})`}>
        <rect x={0} y={0} width={w} height={h} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
        <text x={24} y={46} fontFamily={FONT} fontWeight={800} fontSize={42} fill={INK}>{name}</text>
        {role && <text x={24} y={80} fontFamily={FONT} fontWeight={600} fontSize={30} fill={INK} opacity={0.75}>{role}</text>}
        {does && <text x={24} y={120} fontFamily={FONT} fontWeight={700} fontSize={28} fill={INK} opacity={0.65}>{does}</text>}
      </g>
    </svg>
  );
};

/** A fact or problem card (v4, owner on the wants-you-to-fail film: "If some text makes sense to emphasise on something
 *  then we can add that but only if it makes sense"): one at a time, lower left, a paper card with an accent bar. */
export const FactCard: React.FC<{ top: string; sub: string; f: number; len: number; problem?: boolean; right?: boolean }> = ({
  top, sub, f, len, problem, right,
}) => {
  const shown = interpolate(f, [0, 9, len - 10, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slide = interpolate(f, [0, 9], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", ...(right ? { right: 110 } : { left: 110 }), bottom: 120, opacity: shown,
      transform: `translateX(${slide}px) rotate(-1.5deg)`, display: "flex", alignItems: "center", gap: 22, background: PAPER,
      color: INK, fontFamily: FONT, padding: "18px 30px 18px 22px", borderRadius: 12, boxShadow: "0 8px 0 rgba(30,20,10,.28)",
      maxWidth: 1100 }}>
      <div style={{ width: 12, alignSelf: "stretch", borderRadius: 6, background: problem ? CRIMSON : TEAL, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 50, letterSpacing: 3, lineHeight: 1.05 }}>{top}</div>
        <div style={{ fontWeight: 800, fontSize: 32, opacity: 0.72, marginTop: 6, lineHeight: 1.2 }}>{sub}</div>
      </div>
    </div>
  );
};
