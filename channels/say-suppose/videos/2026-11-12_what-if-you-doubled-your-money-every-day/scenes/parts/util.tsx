// Shared pieces for the doubled-money first cut: easing, the phone, a split-flap tile, the stamped TAG and a bubble.
// Everything is drawn in screen pixels (1920x1080). No AI images.
import { dir, joints, LIMB, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** What a shot gets: its own frame, its length and its progress. */
export interface ShotTime { f: number; dur: number; p: number }

/** A slow push-in on the whole picture, so every shot moves (studio-whatif-edit: something changes every 2-4 s). */
export const Push: React.FC<{ t: ShotTime; from?: number; to?: number; ox?: number; oy?: number; children: React.ReactNode }> = ({
  t, from = 1, to = 1.05, ox = 960, oy = 540, children,
}) => (
  <div style={{ position: "absolute", inset: 0, transform: `scale(${mix(from, to, ease(t.p))})`, transformOrigin: `${ox}px ${oy}px` }}>
    {children}
  </div>
);

/** Where a figure's front hand lands on screen, from the rig's own maths. */
export function handAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + facing * (sh.x + (a.x + b.x) * LIMB) * scale, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** The phone in your hand, its screen showing the balance in euros (two lines when it is long). */
export const Phone: React.FC<{ x: number; y: number; s?: number; lines: string[]; rot?: number; lit?: boolean; down?: boolean }> = ({
  x, y, s = 1, lines, rot = -10, lit = true, down,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-20} y={-250} width={170} height={300} rx={26} fill="#0d0e14" />
    {!down && <rect x={-8} y={-238} width={146} height={276} rx={18} fill={lit ? "#e9f6f2" : "#20242c"} />}
    {!down && lit && <rect x={-8} y={-238} width={146} height={276} rx={18} fill={TEAL} opacity={0.18} />}
    {!down && lit && <circle cx={34} cy={-200} r={14} fill={MUSTARD} stroke={INK} strokeWidth={3} />}
    {!down && lit && lines.map((l, i) => (
      <text key={i} x={8} y={-120 + i * 62} fontFamily={FONT} fontWeight={800} fontSize={Math.min(60, 216 / l.length)} fill={INK}>{l}</text>
    ))}
  </g>
);

/** One split-flap digit tile, the film's rule device. */
export const Tile: React.FC<{ ch: string; x: number; y: number; s: number; r: number }> = ({ ch, x, y, s, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-58} y={-76} width={116} height={152} rx={16} fill="#000" opacity={0.35} transform="translate(8 12)" />
    <rect x={-58} y={-76} width={116} height={152} rx={16} fill={INK} stroke={PAPER} strokeWidth={6} />
    <line x1={-58} y1={0} x2={58} y2={0} stroke="#0d0e12" strokeWidth={5} />
    <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={118} fill={PAPER}>{ch}</text>
  </g>
);

/** The script's `> TAG:`: a stamped label, top right, that thumps in. */
export const TagStamp: React.FC<{ text: string; f: number }> = ({ text, f }) => {
  const k = ramp(f, 0, 8);
  return (
    <div style={{
      position: "absolute", top: 46, right: 52, transform: `rotate(-3deg) scale(${mix(1.25, 1, k)})`, opacity: k,
      transformOrigin: "right center", background: INK, color: MUSTARD, border: `6px solid ${PAPER}`, borderRadius: 18,
      fontFamily: FONT, fontWeight: 800, fontSize: 64, letterSpacing: 1.5, padding: "10px 26px 6px", whiteSpace: "nowrap",
      boxShadow: "0 12px 22px rgba(0,0,0,.45)",
    }}>{text}</div>
  );
};

/** A speech bubble, four words or fewer, at a screen point (the tail points down-left to the speaker). */
export const Bubble: React.FC<{ text: string; x: number; y: number; f: number }> = ({ text, x, y, f }) => {
  const k = ramp(f, 0, 6);
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `scale(${mix(0.6, 1, k)})`, opacity: k, transformOrigin: "left bottom",
      background: PAPER, color: INK, border: `5px solid ${INK}`, borderRadius: 30, fontFamily: FONT, fontWeight: 800,
      fontSize: 56, padding: "12px 30px", whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

/** Euro amounts the way a German phone shows them. */
export const euros = (cents: number) => {
  const s = (cents / 100).toFixed(2).replace(".", ",");
  const [i, d] = s.split(",");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${d}`;
};
/** The balance on day n, from one cent on day one. */
export const balanceOn = (day: number) => euros(2 ** (day - 1));
/** A balance split onto the phone's two lines. */
export const phoneLines = (b: string) => (b.length > 9 ? [b.slice(0, b.length - 6), b.slice(b.length - 6) + " €"] : [`${b} €`]);
