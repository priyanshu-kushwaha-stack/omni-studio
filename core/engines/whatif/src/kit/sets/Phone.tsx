// A phone-screen close-up: the phone big in your mustard hand over a soft background. From "Nobody Could Say No"
// (parts2.tsx PhoneTop: the chat with ink bars for words, the sent ticks, the typing dots, the incoming call with its
// rings, the thumb; Back.EndCard.tsx: the lap under a phone insert). The screen never shows letters: words are ink bars.
import { EXPRESSIONS } from "../rig/expressions";
import { CRIMSON, INK, MUSTARD, PAPER } from "../theme";
import { HERO, MOTHER } from "./cast";
import { Deep, LIGHTS_ON, noise, OUTSIDE, REF, seat, type SetDef, type SetProps } from "./common";

const PHONE = { x: 1180, y: 560 };

export interface PhoneOptions {
  /** What the screen shows. */
  mode: "message" | "call" | "feed" | "off";
  /** The draft in the message box, 0 to 1 (ink bars). */
  typed: number;
  /** A sent message above the box, with one or two ticks. */
  sent: 0 | 1 | 2;
  /** A reply's bars, 0 to 1; or the typing dots while it is coming. */
  reply: number;
  dots: boolean;
  /** The contact's head colour (the avatar in the chat or on the call). */
  contact: string;
  /** Your thumb over the keyboard, 0 to 1 across it; null tucks it away. */
  thumb: number | null;
  /** What is behind the phone, soft. */
  behind: "bedroom" | "metro" | "desk";
}

/** Ink bars standing for typed words: `shown` 0..1 of them. */
const InkBars: React.FC<{ x: number; y: number; w: number; shown: number; seed?: number; h?: number }> = ({ x, y, w, shown, seed = 0, h = 18 }) => {
  const widths = Array.from({ length: 6 }, (_, i) => 0.08 + noise(seed + i) * 0.14);
  const total = widths.reduce((a, b) => a + b, 0) + 0.04 * widths.length;
  let at = 0;
  return (
    <g>
      {widths.map((wi, i) => {
        const from = at;
        at += wi + 0.04;
        const vis = Math.max(0, Math.min(wi, shown * total - from));
        return vis > 0 ? <rect key={i} x={x + (from / total) * w} y={y} width={(vis / total) * w} height={h} rx={h / 2} fill={INK} /> : null;
      })}
    </g>
  );
};

const Avatar: React.FC<{ x: number; y: number; r: number; head: string }> = ({ x, y, r, head }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#3a3550" />
    <circle cx={x} cy={y - r * 0.15} r={r * 0.38} fill={head} />
    <path d={`M${x - r * 0.6} ${y + r * 0.75} Q${x} ${y + r * 0.1} ${x + r * 0.6} ${y + r * 0.75}Z`} fill={PAPER} opacity={0.8} />
  </g>
);

/** The phone from straight above, about 380 x 720, centred on (x, y), with its screen. */
const Handset: React.FC<{ x: number; y: number; frame: number; o: PhoneOptions }> = ({ x, y, frame, o }) => {
  const W = 380, H = 720, sx = -W / 2 + 22, sw = W - 44, top = -H / 2 + 40, bottom = H / 2 - 40;
  const screen = o.mode === "off" ? "#262a36" : o.mode === "call" ? "#2f3550" : o.mode === "feed" ? "#14161c" : "#eef1f4";
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-30} cy={H / 2 - 40} rx={W * 0.62} ry={170} fill={MUSTARD} stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={W / 2 - 34} y={-60 + i * 70} width={70} height={46} rx={23} fill={MUSTARD} stroke={INK} strokeWidth={5} />)}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={46} fill="#1b1d24" stroke={INK} strokeWidth={6} />
      <rect x={sx} y={top} width={sw} height={bottom - top} rx={18} fill={screen} />
      {o.mode === "message" && (
        <g>
          <rect x={sx} y={top} width={sw} height={74} rx={18} fill="#d9dee6" />
          <Avatar x={sx + 46} y={top + 38} r={26} head={o.contact} />
          <rect x={sx + 90} y={top + 26} width={110} height={16} rx={8} fill={INK} opacity={0.6} />
          {o.sent > 0 && (
            <g>
              <rect x={sx + sw - 250} y={top + 120} width={230} height={70} rx={20} fill="#bfe6d6" />
              <InkBars x={sx + sw - 232} y={top + 138} w={190} shown={1} seed={3} h={14} />
              <path d={`M${sx + sw - 70} ${top + 176} l8 8 l14 -16`} fill="none" stroke="#2f7a5a" strokeWidth={4} strokeLinecap="round" />
              {o.sent === 2 && <path d={`M${sx + sw - 58} ${top + 176} l8 8 l14 -16`} fill="none" stroke="#2f7a5a" strokeWidth={4} strokeLinecap="round" />}
            </g>
          )}
          {o.reply > 0 && (
            <g>
              <rect x={sx + 20} y={top + 220} width={170} height={56} rx={20} fill="#ffffff" stroke="#d9dee6" strokeWidth={3} />
              <InkBars x={sx + 36} y={top + 240} w={130} shown={o.reply} seed={40} h={14} />
            </g>
          )}
          {o.dots && o.reply === 0 && (
            <g>
              <rect x={sx + 20} y={top + 220} width={110} height={56} rx={20} fill="#ffffff" stroke="#d9dee6" strokeWidth={3} />
              {[0, 1, 2].map((i) => <circle key={i} cx={sx + 48 + i * 27} cy={top + 248} r={8} fill={INK} opacity={0.3 + 0.6 * Math.max(0, Math.sin(frame / 5 - i * 0.9))} />)}
            </g>
          )}
          <rect x={sx + 12} y={bottom - 300} width={sw - 90} height={56} rx={28} fill="#fff" stroke="#c7ccd6" strokeWidth={4} />
          <InkBars x={sx + 34} y={bottom - 281} w={sw - 150} shown={o.typed} seed={9} />
          {Math.floor(frame / 12) % 2 === 0 && <rect x={sx + 36 + (sw - 150) * o.typed} y={bottom - 288} width={4} height={32} fill={CRIMSON} />}
          <circle cx={sx + sw - 38} cy={bottom - 272} r={28} fill={o.typed > 0 ? "#1d9a8f" : "#c7ccd6"} />
          <path d={`M${sx + sw - 50} ${bottom - 272} h22 m-9 -9 l9 9 l-9 9`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={sx} y={bottom - 230} width={sw} height={230} rx={18} fill="#d4d8df" />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={sx + 10 + (i % 10) * ((sw - 20) / 10)} y={bottom - 218 + Math.floor(i / 10) * 66} width={(sw - 20) / 10 - 6} height={54} rx={8} fill="#fff" />
          ))}
        </g>
      )}
      {o.mode === "call" && (
        <g>
          {[0, 1, 2].map((i) => {
            const p = (frame / 30 + i / 3) % 1;
            return <circle key={i} cx={0} cy={-120} r={90 + p * 110} fill="none" stroke={PAPER} strokeWidth={6} opacity={0.6 * (1 - p)} />;
          })}
          <Avatar x={0} y={-120} r={90} head={o.contact} />
          <circle cx={-90} cy={bottom - 110} r={44} fill={CRIMSON} />
          <circle cx={90} cy={bottom - 110} r={44} fill="#3fbf7f" />
          <path d={`M72 ${bottom - 116} q18 22 36 0`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <path d={`M-108 ${bottom - 104} q18 -22 36 0`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {o.mode === "feed" && (
        <g>
          <rect x={sx} y={top + 60} width={sw} height={420} fill="#2f3550" />
          <circle cx={0} cy={top + 230} r={80} fill="#f2b632" />
          <path d={`M-24 ${top + 196} L36 ${top + 230} L-24 ${top + 264}Z`} fill={INK} />
          <rect x={sx} y={top + 470} width={sw * ((frame % 300) / 300)} height={8} fill={CRIMSON} />
          {[0, 1, 2].map((i) => <circle key={i} cx={sw / 2 - 20} cy={top + 560 + i * 80} r={24} fill="#3a3f4c" />)}
          <path d={`M${sw / 2 - 32} ${top + 560} l12 12 l12 -12 a7 7 0 0 0 -12 -6 a7 7 0 0 0 -12 6Z`} fill={CRIMSON} />
          <rect x={sx + 20} y={top + 520} width={180} height={14} rx={7} fill={PAPER} opacity={0.7} />
          <rect x={sx + 20} y={top + 548} width={120} height={14} rx={7} fill={PAPER} opacity={0.5} />
        </g>
      )}
      {o.thumb !== null && (
        <g transform={`translate(${sx + o.thumb * sw} ${bottom - 160})`}>
          <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={12} cy={6} rx={16} ry={22} fill="#f7cf6e" />
        </g>
      )}
    </g>
  );
};

/** What is behind the phone, far and soft: your bed, the metro seat and its window lights, or your desk. */
const Back: React.FC<SetProps<PhoneOptions>> = ({ cam, mood, frame, options }) => {
  const dark = OUTSIDE[mood].dark;
  const b = options.behind;
  return (
    <>
      <Deep cam={cam} depth={0.1} flat>
        {b === "bedroom" && (
          <g>
            <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#3d4670" : "#e8c9a0"} />
            {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-600 + i * 360} y={-200} width={160} height={1400} fill={dark ? "#4a5280" : "#7fa0c4"} opacity={0.5} />)}
          </g>
        )}
        {b === "metro" && (
          <g>
            <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#1d2133" : "#cfd8d6"} />
            <rect x={-1400} y={150} width={4800} height={340} fill={dark ? "#0b0d1c" : "#a8d4e6"} />
            {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={((i * 520 - frame * 9) % 4800 + 4800) % 4800 - 1400} cy={300 + (i % 3) * 50} r={40} fill="#ffe9a8" opacity={dark ? 0.7 : 0.25} />)}
            <rect x={-1400} y={620} width={4800} height={600} fill="#41708c" />
          </g>
        )}
        {b === "desk" && (
          <g>
            <rect x={-1400} y={-800} width={4800} height={2400} fill="#c9a77a" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-1400 ${-200 + i * 120} Q960 ${-160 + i * 120} 3400 ${-200 + i * 120}`} fill="none" stroke="#a88a68" strokeWidth={10} />)}
            <rect x={-200} y={-100} width={600} height={420} rx={20} fill="#3b3e47" />
          </g>
        )}
      </Deep>
    </>
  );
};

/** The phone itself, in the actors' slot: after anyone `behind`, before anyone else. */
const Mid: React.FC<SetProps<PhoneOptions>> = ({ frame, options }) => <Handset x={PHONE.x} y={PHONE.y} frame={frame} o={options} />;

export const phone: SetDef<PhoneOptions> = {
  name: "phone",
  about: "phone-screen close-up in your hand: a chat (ink bars, ticks, typing dots), an incoming call, a feed; soft background",
  spots: {
    /** Your face at the left edge, looking at the phone (a reaction cut in the same frame). */
    face: { x: 360, y: 1290, scale: 3.4, facing: 1 },
    /** Someone looking over your shoulder, at the right edge. */
    shoulder: { x: 1700, y: 1290, scale: 3.4, facing: -1 },
  },
  cameras: {
    wide: REF,
    screen: { x: PHONE.x, y: PHONE.y - 60, zoom: 1.5 },
    keyboard: { x: PHONE.x, y: PHONE.y + 200, zoom: 2 },
  },
  lights: () => [{ x: PHONE.x, y: PHONE.y, r: 520, color: "#cfe9f4", strength: 0.4, moods: LIGHTS_ON }],
  defaults: { mode: "message", typed: 0.6, sent: 2, reply: 0, dots: true, contact: MOTHER.head, thumb: 0.55, behind: "bedroom" },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [{ spot: "face", who: { ...HERO, look: { x: 1, y: 0.3 } }, face: EXPRESSIONS.worried, behind: true }],
  },
};

