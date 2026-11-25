// Screen-space pieces for "Nine" (Nine.tsx), look C (the painted kitchen plate, soft, behind both): your phone with
// the boss's "You OK?" (you type "Fine", erase it letter by letter, type "Not really", send), and the end card: the morning kitchen window in the left two-thirds with the two of
// you as paper cutouts (his 1, your 9), the LIKE / SUBSCRIBE / COMMENT paper tags stamping in; the right third dark and
// empty for YouTube's end screens (after the fail film's TwoLetters.EndCard). No AI images.
import { AbsoluteFill, Img, spring, staticFile } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BOSS, GLOW, mix, ramp } from "../shared";
import { FLATMATE } from "./RivalParts";
import { Counter } from "./Counter";

/** What the message box holds at frame f: "Fine" typed, held, erased letter by letter, then "Not really", then sent. */
export function draftAt(f: number, from: number, to: number) {
  const L = Math.max(60, to - from);
  const t = (f - from) / L;
  const typed = (word: string, a: number, b: number) => word.slice(0, Math.max(0, Math.min(word.length, Math.floor(((t - a) / (b - a)) * word.length + 1e-6))));
  if (t < 0.12) return { text: "", sent: false, hover: false };
  if (t < 0.26) return { text: typed("Fine", 0.12, 0.26), sent: false, hover: false };
  if (t < 0.45) return { text: "Fine", sent: false, hover: true };
  if (t < 0.58) return { text: "Fine".slice(0, 4 - Math.floor(((t - 0.45) / 0.13) * 4 + 1e-6)), sent: false, hover: false };
  if (t < 0.6) return { text: "", sent: false, hover: false };
  if (t < 0.86) return { text: typed("Not really", 0.6, 0.86), sent: false, hover: false };
  if (t < 0.92) return { text: "Not really", sent: false, hover: true };
  return { text: "", sent: true, hover: false };
}

/** Your phone, face up in your hand: the boss's "You OK?", the draft, the send button. */
export const PhoneInsert: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const d = draftAt(frame, from, to);
  const flip = ramp(frame, from, from + 10);
  const px = 1000, py = mix(1200, 560, flip);
  const W = 520, H = 900;
  const left = px - W / 2, top = py - H / 2;
  const caret = Math.floor(frame / 12) % 2 === 0;
  const thumb = d.hover ? { x: left + W - 70, y: top + 610 } : { x: left + 120 + ((frame * 37) % 280), y: top + 720 + ((frame * 13) % 90) };
  const sentPop = d.sent ? spring({ frame: frame - Math.round(from + (to - from) * 0.92), fps: FPS, config: { damping: 12, stiffness: 200 } }) : 0;
  return (
    <AbsoluteFill style={{ background: "#2a1d15" }}>
      {/* look C: the painted kitchen behind the phone, very soft (the table top and the window) */}
      <Img src={staticFile("plates/kitchen-morning.png")} style={{ position: "absolute", width: 1920 * 2.4, height: 1080 * 2.4, left: -1150, top: -1250,
        filter: "blur(22px) brightness(0.92)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g>
          <rect x={left - 20} y={top - 20} width={W + 40} height={H + 40} rx={60} fill="#1b1d24" />
          <rect x={left} y={top} width={W} height={H} rx={44} fill="#f4f6f8" />
          {/* the boss at the top: his head, a bar for his name */}
          <rect x={left} y={top} width={W} height={120} rx={44} fill="#e3e8ee" />
          <circle cx={left + 80} cy={top + 66} r={36} fill={BOSS.head} stroke={INK} strokeWidth={4} />
          <path d={`M${left + 80} ${top + 100} l7 10 l-7 18 l-7 -18Z`} fill={BOSS.tie} />
          <rect x={left + 136} y={top + 52} width={180} height={24} rx={12} fill={INK} opacity={0.75} />
          {/* his message */}
          <rect x={left + 40} y={top + 170} width={230} height={84} rx={30} fill="#e3e8ee" stroke={INK} strokeWidth={3} />
          <text x={left + 155} y={top + 225} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={INK}>You OK?</text>
          {d.sent && (
            <g transform={`translate(${left + W - 40} ${top + 330}) scale(${sentPop})`}>
              <rect x={-270} y={-50} width={270} height={84} rx={30} fill={TEAL} stroke={INK} strokeWidth={3} />
              <text x={-135} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={PAPER}>Not really</text>
              <path d="M-60 46 l8 8 l14 -16 M-42 46 l8 8 l14 -16" fill="none" stroke={TEAL} strokeWidth={4} />
            </g>
          )}
          {/* the draft box and the send button */}
          <rect x={left + 30} y={top + 570} width={W - 150} height={80} rx={36} fill="#fff" stroke={INK} strokeWidth={4} />
          <text x={left + 60} y={top + 624} fontFamily={FONT} fontWeight={800} fontSize={42} fill={INK}>{d.text}{caret ? "|" : ""}</text>
          <circle cx={left + W - 70} cy={top + 610} r={d.hover ? 40 + Math.sin(frame / 3) * 3 : 36} fill={d.text ? TEAL : "#9aa1ab"} stroke={INK} strokeWidth={4} />
          <path d={`M${left + W - 86} ${top + 594} L${left + W - 50} ${top + 610} L${left + W - 86} ${top + 626} L${left + W - 80} ${top + 610}Z`} fill={PAPER} />
          {/* the keyboard */}
          <rect x={left + 16} y={top + 680} width={W - 32} height={200} rx={20} fill="#d5dbe2" />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={left + 30 + (i % 10) * 46} y={top + 694 + Math.floor(i / 10) * 60} width={38} height={50} rx={8} fill="#fff" />
          ))}
        </g>
        {/* your mustard hand holding it, and the thumb */}
        <rect x={left + W - 30} y={top + 520} width={260} height={120} rx={56} fill={INK} transform={`rotate(-20 ${left + W} ${top + 580})`} />
        <circle cx={left + W + 10} cy={top + 560} r={70} fill={MUSTARD} stroke={INK} strokeWidth={6} />
        <ellipse cx={thumb.x} cy={thumb.y} rx={34} ry={42} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      </svg>
    </AbsoluteFill>
  );
};

/** A stamped paper tag with an icon, in screen pixels; stamps in at `at`. */
const EndTag: React.FC<{ frame: number; at: number; x: number; y: number; text: string; icon: "like" | "bell" | "talk"; tilt: number }> = ({
  frame, at, x, y, text, icon, tilt,
}) => {
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness: 190, mass: 0.6 } });
  const h = 78, w = 110 + text.length * 30;
  const sway = Math.sin((frame - at) / 14 + x) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt + sway}) scale(${s})`}>
      <line x1={22} y1={-70} x2={22} y2={h / 2} stroke="#d9c9a6" strokeWidth={3} />
      <rect x={6} y={8} width={w} height={h} rx={14} fill="#05031f" opacity={0.35} />
      <rect x={0} y={0} width={w} height={h} rx={14} fill={PAPER} stroke={INK} strokeWidth={4} />
      <circle cx={22} cy={h / 2} r={7} fill="none" stroke={INK} strokeWidth={3} />
      <g transform={`translate(64 ${h / 2})`}>
        {icon === "like" && <path d="M-16 4 h8 v18 h-8z M-6 6 l8 -2 l4 -16 q3 -5 7 -2 q2 3 0 9 l-2 9 h12 q5 0 4 6 l-3 12 q-1 4 -5 4 h-25z" fill={MUSTARD} stroke={INK} strokeWidth={3} strokeLinejoin="round" transform="translate(0 -12)" />}
        {icon === "bell" && <path d="M-16 10 q4 -4 4 -14 q0 -14 12 -16 q12 2 12 16 q0 10 4 14 z M-5 14 q5 8 10 0" fill={CRIMSON} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
        {icon === "talk" && <path d="M-20 -14 h40 q6 0 6 6 v18 q0 6 -6 6 h-20 l-12 10 l2 -10 h-10 q-6 0 -6 -6 v-18 q0 -6 6 -6z" fill={TEAL} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      </g>
      <text x={96} y={h * 0.68} fontFamily={FONT} fontWeight={800} fontSize={38} fill={INK} letterSpacing={2}>{text}</text>
    </g>
  );
};

/** A flat paper cutout of a person standing, no face. (x, y) is between the feet; h the height. */
const Cutout: React.FC<{ x: number; y: number; h: number; head: string; body: string; scarf?: string; tuft?: boolean }> = ({ x, y, h, head, body, scarf, tuft }) => {
  const r = h * 0.14;
  const shape = (fill: string, grow: number) => (
    <g fill={fill}>
      <circle cx={0} cy={-h + r} r={r + grow} />
      <rect x={-r * 0.95 - grow} y={-h + r * 2.1 - grow} width={r * 1.9 + grow * 2} height={h * 0.5 + grow * 2} rx={r * 0.7} />
      <rect x={-r * 0.75 - grow} y={-h * 0.38 - grow} width={r * 0.6 + grow * 2} height={h * 0.38 + grow} rx={r * 0.2} />
      <rect x={r * 0.15 - grow} y={-h * 0.38 - grow} width={r * 0.6 + grow * 2} height={h * 0.38 + grow} rx={r * 0.2} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="translate(10 12)" opacity={0.35}>{shape("#000", 10)}</g>
      {shape(PAPER, 10)}
      {shape(body, 0)}
      <circle cx={0} cy={-h + r} r={r} fill={head} />
      {scarf && <rect x={-r} y={-h + r * 2.0} width={r * 2} height={r * 0.5} rx={r * 0.2} fill={scarf} />}
      {tuft && <path d={`M${-r * 0.1} ${-h + r * 0.05} q${r * 0.2} ${-r * 0.5} ${r * 0.5} ${-r * 0.15}`} fill="none" stroke={INK} strokeWidth={r * 0.14} strokeLinecap="round" />}
    </g>
  );
};

/** The end card: the morning window in the left two-thirds, the two of you as cutouts with his 1 and your 9, the tags
 *  stamping in on their cue words. Nothing right of x 1280. */
export const EndCard: React.FC<{ frame: number; from: number; comment: number; like: number; subscribe: number }> = ({ frame, from, comment, like, subscribe }) => {
  const s = spring({ frame: frame - from, fps: FPS, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  const drop = 60 * (1 - Math.min(1, s));
  return (
    <AbsoluteFill style={{ background: "#0d1120" }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="end-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd9a8" />
            <stop offset="1" stopColor="#cfe8ee" />
          </linearGradient>
        </defs>
        {/* look C: the painted kitchen window, soft, in place of a drawn one */}
        <clipPath id="end-win"><rect x={130} y={130} width={1060} height={800} rx={10} /></clipPath>
        <g clipPath="url(#end-win)">
          <rect x={130} y={130} width={1060} height={800} fill="url(#end-sky)" />
          <image href={staticFile("plates/kitchen-morning.png")} x={-260} y={-120} width={1920 * 1.15} height={1080 * 1.15} preserveAspectRatio="xMidYMid slice"
            style={{ filter: "blur(10px) brightness(0.95)" }} />
          <rect x={130} y={130} width={1060} height={800} fill="#0d1120" opacity={0.18} />
        </g>
        <rect x={130} y={130} width={1060} height={800} rx={10} fill="none" stroke="#e8e2d2" strokeWidth={22} />
        <g transform={`translate(0 ${drop})`}>
          <Cutout x={400} y={920} h={420} head={FLATMATE.head} body={FLATMATE.coat} />
          <Cutout x={600} y={920} h={410} head={MUSTARD} body={INK} scarf={TEAL} tuft />
          <Counter x={400} y={430} base={1} frame={frame} size={56} id="end-1" />
          <Counter x={600} y={440} base={9} frame={frame} size={56} glow={GLOW} id="end-9" />
        </g>
        <rect x={118} y={920} width={1084} height={30} fill="#b9895f" stroke={INK} strokeWidth={5} />
        <g transform="translate(720 230) scale(1.25)">
          <EndTag frame={frame} at={comment} x={0} y={0} text="COMMENT" icon="talk" tilt={-3} />
          <EndTag frame={frame} at={like} x={30} y={140} text="LIKE" icon="like" tilt={2} />
          <EndTag frame={frame} at={subscribe} x={0} y={280} text="SUBSCRIBE" icon="bell" tilt={-2} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
