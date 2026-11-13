// Body maths and the people builder B's two beats (Crumbs, More Hours) share: where a hand or a head is, aiming an arm,
// a speaking mouth (shapes every 4 frames, never lip-sync), your brother's backwards cap (with the band's teal light
// under it on Saturday), the band worn awake. World coordinates, for a <Stage> slot. No sound here.
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, HEAD_R, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import { INK } from "@whatif/kit/theme";
import { BROTHER, GHOST, HERO, blinking, noise } from "../shared";

/** Where a figure stands and how: the same numbers you pass to <Figure>. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }

export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

export function headOf(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.head.x * b.scale * b.facing, y: b.y + j.head.y * b.scale, r: HEAD_R * b.scale };
}

/** Arm angles that put a hand on a world point (as far as the arm reaches). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** The mouth of someone speaking between two frames, `rest` otherwise. */
export function talk(frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth {
  if (frame < from || frame >= to) return rest;
  const shapes: Mouth[] = ["open", rest === "smile" ? "smile" : "flat", "o", "open", rest];
  return shapes[Math.floor(noise(Math.floor(frame / 4)) * shapes.length)];
}

export type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

/** You, with the faces passed. */
export const You: React.FC<{ body: Body; face: Face; frame: number; held?: React.ReactNode; band?: boolean }> = ({ body, face, frame, held, band }) => (
  <g>
    <Figure {...HERO} {...body} {...face} blink={blinking(frame, 1)} time={frame} held={held} />
    {band && <BandOn body={body} lit />}
  </g>
);

/** A cap worn backwards: the dome over the head, the brim sticking out behind. Drawn over a figure's head. */
export const BackCap: React.FC<{ body: Body; light?: number }> = ({ body, light = 0 }) => {
  const h = headOf(body);
  const r = h.r;
  const f = body.facing;
  const tilt = body.pose.tilt * f;
  return (
    <g transform={`rotate(${tilt} ${h.x} ${h.y})`}>
      <path d={`M${h.x - r} ${h.y - r * 0.18} A${r} ${r} 0 0 1 ${h.x + r} ${h.y - r * 0.18} Z`} fill={BROTHER.cap} stroke={INK} strokeWidth={3} />
      <path d={`M${h.x - f * r * 0.8} ${h.y - r * 0.28} l${-f * r * 0.62} ${r * 0.12} l${f * r * 0.1} ${r * 0.18} Z`} fill={BROTHER.cap} stroke={INK} strokeWidth={3} />
      {light > 0 && (
        <g>
          <circle cx={h.x + f * r * 0.86} cy={h.y - r * 0.2} r={r * 0.24} fill={GHOST.light} opacity={0.4 * light} />
          <circle cx={h.x + f * r * 0.86} cy={h.y - r * 0.2} r={r * 0.1} fill={GHOST.light} stroke="#1b1d24" strokeWidth={2} opacity={light} />
        </g>
      )}
    </g>
  );
};

/** Your brother: peach head, grey hoodie, the cap on backwards. `light` shows the band's teal glow under the cap. */
export const Brother: React.FC<{ body: Body; face: Face; frame: number; held?: React.ReactNode; light?: number }> = ({ body, face, frame, held, light = 0 }) => (
  <g>
    <Figure head={BROTHER.head} coat={BROTHER.coat} {...body} {...face} blink={blinking(frame, 4)} time={frame} held={held} />
    <BackCap body={body} light={light} />
  </g>
);

/** The band worn on the forehead while awake (the thin dark loop and its teal light), on a figure's head. */
export const BandOn: React.FC<{ body: Body; lit?: boolean }> = ({ body, lit = true }) => {
  const h = headOf(body);
  const r = h.r;
  const f = body.facing;
  return (
    <g>
      <path d={`M${h.x - f * r * 0.95} ${h.y - r * 0.5} Q${h.x} ${h.y - r * 0.78} ${h.x + f * r * 0.98} ${h.y - r * 0.42}`} fill="none" stroke="#1b1d24" strokeWidth={r * 0.18} strokeLinecap="round" />
      <circle cx={h.x + f * r * 0.62} cy={h.y - r * 0.6} r={r * 0.16} fill={lit ? GHOST.light : "#2a3a3a"} stroke="#1b1d24" strokeWidth={2} />
    </g>
  );
};

/** A tongue poking out of the corner of a mouth (concentration). On a figure's head. */
export const Tongue: React.FC<{ body: Body }> = ({ body }) => {
  const h = headOf(body);
  const s = body.scale;
  const f = body.facing;
  return <ellipse cx={h.x + f * 24 * s} cy={h.y + 22 * s} rx={7 * s} ry={5 * s} fill="#e86a7a" stroke={INK} strokeWidth={2} />;
};

/** A drawn music note (no lettering), at (x, y), `s` its size. */
export const Note: React.FC<{ x: number; y: number; s?: number; color: string; double?: boolean; opacity?: number }> = ({ x, y, s = 1, color, double, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-12)`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={13} ry={10} fill={color} stroke={INK} strokeWidth={3} />
    <rect x={9} y={-56} width={6} height={56} fill={INK} />
    {double ? (
      <g>
        <ellipse cx={40} cy={-6} rx={13} ry={10} fill={color} stroke={INK} strokeWidth={3} />
        <rect x={49} y={-62} width={6} height={56} fill={INK} />
        <path d="M12 -56 L52 -62 L52 -50 L12 -44Z" fill={INK} />
      </g>
    ) : <path d="M15 -56 q22 10 14 34 q2 -16 -14 -20Z" fill={INK} />}
  </g>
);

/** A thought cloud with a drawing inside (no words), its tail at (x, y), the cloud up and to `side`. */
export const ThoughtCloud: React.FC<{ x: number; y: number; t: number; side?: 1 | -1; size?: number; children?: React.ReactNode }> = ({ x, y, t, side = 1, size = 120, children }) => {
  if (t <= 0.01) return null;
  const cx = x + side * size * 0.9;
  const cy = y - size * 1.2;
  return (
    <g opacity={Math.min(1, t * 1.5)} transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * t}) translate(${-x} ${-y})`}>
      <circle cx={x + side * size * 0.15} cy={y - size * 0.15} r={size * 0.07} fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx={x + side * size * 0.38} cy={y - size * 0.42} r={size * 0.12} fill="#fff" stroke={INK} strokeWidth={3} />
      <g>
        {[[-0.55, 0.1, 0.42], [-0.15, -0.3, 0.5], [0.35, -0.2, 0.48], [0.6, 0.15, 0.4], [0.1, 0.3, 0.5], [-0.4, 0.38, 0.38]].map(([dx, dy, rr], k) => (
          <circle key={k} cx={cx + dx * size} cy={cy + dy * size} r={rr * size} fill="#fff" stroke={INK} strokeWidth={4} />
        ))}
        {[[-0.55, 0.1, 0.42], [-0.15, -0.3, 0.5], [0.35, -0.2, 0.48], [0.6, 0.15, 0.4], [0.1, 0.3, 0.5], [-0.4, 0.38, 0.38]].map(([dx, dy, rr], k) => (
          <circle key={`i${k}`} cx={cx + dx * size} cy={cy + dy * size} r={rr * size - 4} fill="#fff" />
        ))}
      </g>
      <g transform={`translate(${cx} ${cy})`}>{children}</g>
    </g>
  );
};

/** A pickle (for a craving). */
export const Pickle: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s}) rotate(-20)`}>
    <rect x={-50} y={-20} width={100} height={40} rx={20} fill="#7fae4a" stroke={INK} strokeWidth={4} />
    {[-28, -6, 16, 34].map((dx) => <circle key={dx} cx={dx} cy={(dx % 3) * 4 - 4} r={4} fill="#5d8a33" />)}
  </g>
);
