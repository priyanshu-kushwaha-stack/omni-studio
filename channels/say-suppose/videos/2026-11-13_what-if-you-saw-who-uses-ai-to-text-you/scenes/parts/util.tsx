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
      <text key={i} x={8} y={-120 + i * 62} fontFamily={FONT} fontWeight={800} fontSize={l.length > 7 ? 46 : 60} fill={INK}>{l}</text>
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

/** A cast tag at a recurring character's first close-up (taste.md 2026-11-13): role in caps, one thing they do; lower
 *  left, off the faces. */
export const CastTag: React.FC<{ text: string; f: number }> = ({ text, f }) => {
  const k = ramp(f, 0, 10);
  const [role, what] = text.split(":").map((x) => x.trim());
  return (
    <div style={{
      position: "absolute", left: 60, bottom: 70, opacity: k, transform: `translateY(${mix(24, 0, k)}px)`,
      background: PAPER, color: INK, border: `5px solid ${INK}`, borderRadius: 16, fontFamily: FONT, padding: "10px 24px 8px",
      boxShadow: "0 10px 18px rgba(0,0,0,.35)", maxWidth: 760,
    }}>
      <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 1.5 }}>{role}</div>
      {what ? <div style={{ fontWeight: 600, fontSize: 30, marginTop: 2 }}>{what}</div> : null}
    </div>
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

// ---- The AI-texts film's own pieces (2026-11-13) ---------------------------------------------------------------

/** One message in a chat: who sent it (their head colour), how long it is (lines of ink bars), whether a machine
 *  wrote it (the dot), and optional real words (a `> TAG:` line shown inside the bubble instead of bars). */
export interface Msg { from: string; lines?: number; dot?: boolean; text?: string; mine?: boolean }

const CRIMSON_DOT = "#D8344F";

/** The rule device: a crimson paper dot with a cream rim that ticks on with a small pop at `at` (shot frames). */
export const Dot: React.FC<{ x: number; y: number; r?: number; f: number; at: number }> = ({ x, y, r = 20, f, at }) => {
  if (f < at) return null;
  const k = ramp(f, at, at + 5);
  const s = k < 1 ? 0.4 + 0.9 * k : 1 + 0.12 * Math.max(0, 1 - (f - at - 5) / 6);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r * 1.3} fill={PAPER} stroke={INK} strokeWidth={3} />
      <circle r={r} fill={CRIMSON_DOT} />
    </g>
  );
};

/** A phone screen held to camera, full height, with a chat. Dots tick on one by one from `dotsAt` (shot frames),
 *  `dotEvery` frames apart; `upTo` limits how many messages show (scrolling in). Screen pixels. */
export const ChatPhone: React.FC<{
  f: number; msgs: Msg[]; x?: number; y?: number; s?: number; rot?: number; contact?: string; dotsAt?: number;
  dotEvery?: number; title?: string; dark?: boolean; highlight?: number;
}> = ({ f, msgs, x = 960, y = 560, s = 1, rot = -3, contact = "#c9a8d8", dotsAt = 0, dotEvery = 7, dark, highlight }) => {
  const W = 520, H = 960, sx = -W / 2 + 26, sw = W - 52, top = -H / 2 + 120;
  let yy = top;
  let dotIndex = 0;
  const rows = msgs.map((m, i) => {
    const lines = m.text ? 1 : (m.lines ?? 2);
    const h = m.text ? 76 : 30 + lines * 34;
    const w = m.text ? Math.min(sw - 110, 60 + m.text.length * 21) : Math.min(sw - 110, 120 + lines * 70);
    const bx = m.mine ? sx + sw - w - 14 : sx + 14;
    const row = { m, i, y: yy, h, w, bx, dotAt: m.dot ? dotsAt + dotEvery * dotIndex++ : -1 };
    yy += h + 22;
    return row;
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-W / 2 + 16} y={-H / 2 + 22} width={W} height={H} rx={60} fill="#000" opacity={0.45} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={60} fill="#16181f" stroke={PAPER} strokeWidth={9} />
      <rect x={sx} y={-H / 2 + 26} width={sw} height={H - 52} rx={40} fill={dark ? "#1f2330" : "#eef1f4"} />
      <rect x={sx} y={-H / 2 + 26} width={sw} height={74} rx={40} fill={dark ? "#2a3040" : "#d9dee6"} />
      <circle cx={sx + 50} cy={-H / 2 + 63} r={22} fill={contact} stroke={INK} strokeWidth={4} />
      <rect x={sx + 86} y={-H / 2 + 54} width={150} height={16} rx={8} fill={INK} opacity={0.5} />
      {rows.map(({ m, i, y: by, h, w, bx, dotAt }) => (
        <g key={i} opacity={highlight === undefined || highlight === i ? 1 : 0.45}>
          <rect x={bx} y={by} width={w} height={h} rx={26} fill={m.mine ? "#cfe3f7" : m.from} stroke={INK} strokeWidth={4} />
          {m.text ? (
            <text x={bx + 22} y={by + 50} fontFamily={FONT} fontWeight={700} fontSize={34} fill={INK}>{m.text}</text>
          ) : (
            Array.from({ length: m.lines ?? 2 }, (_, k) => (
              <rect key={k} x={bx + 22} y={by + 26 + k * 34} width={(k === (m.lines ?? 2) - 1 ? 0.55 : 0.86) * (w - 44)} height={13}
                rx={6.5} fill={INK} opacity={0.42} />
            ))
          )}
          {m.dot && <Dot x={m.mine ? bx - 34 : bx + w + 34} y={by + h - 22} f={f} at={dotAt} />}
        </g>
      ))}
    </g>
  );
};

/** A cream paper sheet with a drawing on it (facts are drawn on paper, style.md). Children in sheet coordinates. */
export const Paper: React.FC<{ f: number; x?: number; y?: number; w?: number; h?: number; rot?: number; children: React.ReactNode }> = ({
  f, x = 960, y = 540, w = 1300, h = 760, rot = -1.5, children,
}) => {
  const k = ease(ramp(f, 0, 12));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${mix(0.92, 1, k)})`} opacity={k}>
      <rect x={-w / 2 + 14} y={-h / 2 + 20} width={w} height={h} rx={14} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={PAPER} stroke={INK} strokeWidth={6} />
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
    </g>
  );
};

/** A message shown as words on screen (a `> TAG:` that is a text message, not a label): a chat bubble, lower third. */
export const TextBubble: React.FC<{ text: string; f: number; dot?: boolean; from?: string }> = ({ text, f, dot, from = "#b9c8dc" }) => {
  const k = ramp(f, 0, 6);
  return (
    <div style={{ position: "absolute", left: "50%", bottom: 150, transform: `translateX(-50%) scale(${mix(0.7, 1, k)})`, opacity: k,
      display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ background: from, color: INK, border: `5px solid ${INK}`, borderRadius: 34, fontFamily: FONT, fontWeight: 700,
        fontSize: 58, padding: "14px 36px", whiteSpace: "nowrap", boxShadow: "0 12px 22px rgba(0,0,0,.35)" }}>{text}</div>
      {dot && f > 10 && <div style={{ width: 44, height: 44, borderRadius: 22, background: CRIMSON_DOT, border: `6px solid ${PAPER}` }} />}
    </div>
  );
};
