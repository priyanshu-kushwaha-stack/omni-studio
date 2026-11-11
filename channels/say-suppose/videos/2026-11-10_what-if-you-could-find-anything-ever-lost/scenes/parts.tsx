// Shared parts for "What If You Could Find Anything Ever Lost?": the rule device (the teal dotted line from your shoes
// and its stamped distance tag), speech bubbles, the cast and a few props. Everything is drawn in WORLD coordinates
// (1920x1080 at camera {960, 540, 1}) inside a <Stage> slot, so the camera moves it. Nothing here plays sound.
import { interpolate, spring } from "remotion";
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { joints, HEAD_R, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { blinking } from "./shared";

export const GLOW = "#5ff0dc";

/** Where a figure's head centre is, in world coordinates. */
export function headAt(x: number, y: number, scale: number, pose: Pose = STAND, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + j.head.x * scale * facing, y: y + j.head.y * scale, r: HEAD_R * scale };
}

export const pop = (frame: number, at: number, stiffness = 210) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness, mass: 0.6 } });

type P = { x: number; y: number };

/** A point along a polyline at share t (0..1) of its length. */
function along(pts: P[], t: number): P {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  let left = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, left / seg[i]) : 0;
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
    }
    left -= seg[i];
  }
  return pts[pts.length - 1];
}

/** A smooth path through points (Catmull-Rom), sampled into a polyline. */
export function smooth(pts: P[], steps = 14): P[] {
  if (pts.length < 3) return pts;
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push({ x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * The rule device: a glowing teal dotted line that draws itself from `at` over `dur` frames along `path`, dot by dot.
 * `fadeAt` erases it dot by dot from the start (it "has gone" once the thing is in your hand); `snapAt` snaps it off
 * at once. `size` is the dot radius at the start; `shrink` makes far dots smaller (perspective).
 */
export const Dots: React.FC<{
  frame: number; at: number; dur?: number; path: P[]; gap?: number; size?: number; shrink?: number;
  fadeAt?: number; snapAt?: number;
}> = ({ frame, at, dur = 30, path, gap = 46, size = 12, shrink = 0.5, fadeAt, snapAt }) => {
  if (frame < at || (snapAt !== undefined && frame >= snapAt + 6)) return null;
  const pts = smooth(path);
  const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
  const n = Math.max(2, Math.round(len / gap));
  const shown = interpolate(frame, [at, at + dur], [0, n], { extrapolateRight: "clamp" });
  const gone = fadeAt === undefined ? 0 : interpolate(frame, [fadeAt, fadeAt + 20], [0, n], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const snap = snapAt === undefined ? 1 : interpolate(frame, [snapAt, snapAt + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.85 + 0.15 * Math.sin(frame / 6);
  const dots = [];
  for (let i = 0; i < n; i++) {
    if (i >= shown || i < gone) continue;
    const p = along(pts, i / (n - 1));
    const r = size * (1 - shrink * (i / (n - 1)));
    const fresh = Math.min(1, shown - i);
    dots.push(
      <g key={i} opacity={snap * fresh}>
        <circle cx={p.x} cy={p.y} r={r * 2.6 * pulse} fill={TEAL} opacity={0.28} />
        <ellipse cx={p.x} cy={p.y} rx={r * 1.3} ry={r * 0.85} fill={GLOW} stroke={INK} strokeWidth={Math.max(2, r * 0.25)} />
      </g>,
    );
  }
  return <g>{dots}</g>;
};

/** The stamped distance tag beside the line: cream paper, ink type, stamps in at `at`. */
export const DistTag: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; tilt?: number }> = ({
  frame, at, until, x, y, text, size = 54, tilt = -4,
}) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame, at, 240);
  const w = text.length * size * 0.62 + size * 0.9;
  const h = size * 1.35;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.18} fill={PAPER} stroke={INK} strokeWidth={5} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={INK}>{text}</text>
    </g>
  );
};

/** A speech bubble, four words or fewer. (x, y) is the tail's tip. */
export const Bubble: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right";
}> = ({ frame, at, until, x, y, text, size = 46, side = "right" }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame, at, 260);
  const w = Math.max(size * 3, text.length * size * 0.58 + size * 1.2);
  const h = size * 1.9;
  const dir = side === "right" ? 1 : -1;
  const bx = x + dir * size * 0.6 - (side === "right" ? 0 : w);
  const by = y - size * 0.9 - h;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <path d={`M${x} ${y} L${x + dir * size * 0.5} ${by + h - 2} L${x + dir * size * 1.5} ${by + h - 2}Z`}
        fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx} y={by} width={w} height={h} rx={h * 0.45} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={x + dir * size * 0.55 - 4} y={by + h - 9} width={size + 8} height={12} fill={PAPER} />
      <text x={bx + w / 2} y={by + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={INK}>{text}</text>
    </g>
  );
};

// ---------- The cast (channels/say-suppose/cast.md: you mustard with a teal scarf; everyone else pastel on ink) ----------

type Face = { mouth?: Mouth; brows?: Brows; lids?: number; eyes?: number; look?: { x: number; y: number } };
type Body = { x: number; y: number; s: number; pose?: Pose; facing?: 1 | -1; f: number; seed?: number; held?: React.ReactNode } & Face;

const face = (b: Body) => ({
  mouth: b.mouth ?? "flat", brows: b.brows ?? "none", lids: b.lids ?? 0, eyes: b.eyes ?? 1, look: b.look ?? { x: 0.4, y: 0 },
  blink: blinking(b.f, b.seed ?? 0),
});

export const You: React.FC<Body> = (b) => (
  <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head={MUSTARD} scarf={TEAL} tuft
    flow={0.15} time={b.f / 30} held={b.held} {...face(b)} />
);

/** Grandfather: warm beige head, white kurta, glasses pushed up on his head. */
export const GRANDPA = { head: "#e8c9a0", coat: "#efe9dc" } as const;
export const Grandpa: React.FC<Body> = (b) => {
  const h = headAt(b.x, b.y, b.s, b.pose, b.facing);
  return (
    <g>
      <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head={GRANDPA.head} coat={GRANDPA.coat}
        held={b.held} {...face(b)} />
      {/* glasses on his head and a white moustache */}
      <rect x={h.x - h.r * 0.62} y={h.y - h.r * 0.98} width={h.r * 1.24} height={h.r * 0.22} rx={h.r * 0.1} fill="none" stroke={INK} strokeWidth={h.r * 0.07} />
      <path d={`M${h.x - h.r * 0.34} ${h.y + h.r * 0.36} Q${h.x} ${h.y + h.r * 0.2} ${h.x + h.r * 0.34} ${h.y + h.r * 0.36}`} fill="none" stroke="#f7f4ee" strokeWidth={h.r * 0.16} strokeLinecap="round" />
    </g>
  );
};

/** Madhav, the great-uncle: the same beige as his brother (the folded photograph's face), a grey cap. */
export const Madhav: React.FC<Body> = (b) => (
  <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head={GRANDPA.head} coat="#8a7a64"
    cap="#6b6f7a" held={b.held} {...face(b)} />
);

/** Your cousin: pale green head, a cap, a phone usually in hand. */
export const Cousin: React.FC<Body> = (b) => (
  <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head="#9fd8a8" coat="#3d5a6c" cap="#d8344f"
    held={b.held} {...face(b)} />
);

/** Your mother: pink head, a plum coat. */
export const Mother: React.FC<Body> = (b) => {
  const h = headAt(b.x, b.y, b.s, b.pose, b.facing);
  return (
    <g>
      <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head="#e6a0a0" coat="#7a5a8c" held={b.held} {...face(b)} />
      <circle cx={h.x - (b.facing ?? 1) * h.r * 0.75} cy={h.y - h.r * 0.55} r={h.r * 0.42} fill="#3a2a2a" />
    </g>
  );
};

/** The drain-sifter: an old man in a vest, crouched with a shallow pan. */
export const Sifter: React.FC<Body & { swirl?: number }> = (b) => {
  const pose: Pose = { lean: 38, tilt: 10, armF: [70, 60], armB: [60, 70], legB: [80, -110], legF: [70, -120], drop: 52 };
  const h = headAt(b.x, b.y, b.s, pose, b.facing);
  const fx = b.x + (b.facing ?? 1) * 120 * b.s;
  const fy = b.y - 40 * b.s;
  const sw = b.swirl ?? 0;
  return (
    <g>
      <Figure x={b.x} y={b.y} scale={b.s} pose={pose} facing={b.facing ?? 1} head="#c9a0d6" coat="#e8e2d2" {...face(b)} />
      <g transform={`translate(${fx} ${fy}) rotate(${Math.sin(sw) * 6})`}>
        <ellipse rx={70 * b.s} ry={20 * b.s} fill="#5a5560" stroke={INK} strokeWidth={4} />
        <ellipse rx={56 * b.s} ry={13 * b.s} fill="#2b2a30" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={Math.cos(sw + i * 1.3) * 40 * b.s} cy={Math.sin(sw + i * 1.3) * 8 * b.s} r={3 * b.s} fill={MUSTARD} />
        ))}
      </g>
      <circle cx={h.x} cy={h.y - h.r * 0.2} r={0} />
    </g>
  );
};

/** The stranger: crimson head, long dark coat (cast.md). One second, once. */
export const Stranger: React.FC<Body> = (b) => (
  <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head={CRIMSON} coat="#3f3346" {...face(b)} />
);

/** Anyone else: pastel heads on ink bodies. */
export const PASTELS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"] as const;
export const Extra: React.FC<Body & { i: number; coat?: string; cap?: string }> = (b) => (
  <Figure x={b.x} y={b.y} scale={b.s} pose={b.pose ?? STAND} facing={b.facing ?? 1} head={PASTELS[b.i % PASTELS.length]}
    coat={b.coat} cap={b.cap} held={b.held} {...face(b)} />
);

// ---------- Props ----------

/** A storm grate in the ground, in perspective, with an optional glow under its bars. */
export const Grate: React.FC<{ x: number; y: number; w: number; h: number; glow?: number }> = ({ x, y, w, h, glow = 0 }) => {
  const tl = x + w * 0.07, tr = x + w * 0.93;
  return (
    <g>
      {glow > 0 && <ellipse cx={x + w / 2} cy={y + h / 2} rx={w} ry={h * 1.6} fill={TEAL} opacity={0.25 * glow} />}
      <path d={`M${tl} ${y} L${tr} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`} fill={INK} stroke="#0b0d12" strokeWidth={8} strokeLinejoin="round" />
      {glow > 0 && <ellipse cx={x + w / 2} cy={y + h * 0.55} rx={w * 0.4} ry={h * 0.38} fill={GLOW} opacity={glow} />}
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        return <line key={i} x1={tl + (tr - tl) * t} y1={y + 3} x2={x + w * t} y2={y + h - 3} stroke={INK} strokeWidth={Math.max(6, w / 28)} strokeLinecap="round" />;
      })}
      <path d={`M${tl} ${y} L${tr} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`} fill="none" stroke="#3a4152" strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** A small mango. */
export const Mango: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 18, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse rx={r * 1.25} ry={r} fill="#f2a93a" stroke={INK} strokeWidth={3} />
    <ellipse cx={-r * 0.4} cy={-r * 0.3} rx={r * 0.5} ry={r * 0.3} fill="#f7c76a" />
    <path d={`M${r * 1.1} ${-r * 0.4} q${r * 0.5} ${-r * 0.6} ${r * 1.0} ${-r * 0.3}`} fill="#4f8a3a" stroke={INK} strokeWidth={2} />
  </g>
);

/** The oilcloth envelope, tied with string; `lit` shows the handwritten line on it. */
export const Envelope: React.FC<{ x: number; y: number; s?: number; rot?: number; lit?: boolean }> = ({ x, y, s = 1, rot = 0, lit }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-90} y={-58} width={180} height={116} rx={8} fill="#c9b27a" stroke={INK} strokeWidth={5} />
    <path d="M-90 -58 L0 8 L90 -58" fill="none" stroke="#8a7346" strokeWidth={4} />
    <line x1={-30} y1={-58} x2={-30} y2={58} stroke="#6b4a2a" strokeWidth={5} />
    {lit && <text x={10} y={40} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={20} fill={INK}>Let it stay lost.</text>}
  </g>
);

/** The heart tablet: one small white pill. */
export const Pill: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 8 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3} fill="#ffffff" opacity={0.25} />
    <ellipse cx={x} cy={y} rx={r * 1.3} ry={r} fill="#fbfbf7" stroke={INK} strokeWidth={2} />
  </g>
);

/** Rain: slanted streaks over a set, falling with the frame. */
export const Rain: React.FC<{ f: number; n?: number; opacity?: number }> = ({ f, n = 80, opacity = 0.3 }) => (
  <g opacity={opacity}>
    {Array.from({ length: n }, (_, i) => {
      const x = ((i * 211 + f * 6) % 2100) - 90;
      const y = ((i * 137 + f * 38) % 1180) - 80;
      return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 70} stroke="#c9d6ea" strokeWidth={3} strokeLinecap="round" />;
    })}
  </g>
);

/** The oil lamp: a clay dish and a flame that breathes. */
export const Lamp: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const k = 1 + 0.08 * Math.sin(f / 4) + 0.05 * Math.sin(f / 2.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-40} r={120 * k} fill="#ffcf7a" opacity={0.18} />
      <path d="M-46 0 Q0 30 46 0 L36 -8 L-36 -8Z" fill="#b5653a" stroke={INK} strokeWidth={4} />
      <path d={`M0 -12 Q${-12 * k} -34 0 ${-60 * k} Q${12 * k} -34 0 -12Z`} fill="#ffd36b" stroke="#e07a2a" strokeWidth={3} />
    </g>
  );
};
