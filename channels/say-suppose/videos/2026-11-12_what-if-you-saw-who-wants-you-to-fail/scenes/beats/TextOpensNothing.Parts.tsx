// Pieces drawn for "A Text Would Open Nothing" (beats/TextOpensNothing.tsx): the results screen (grade one as a big 1 in a
// box, no words), Min-jun's phone, the group chat, your draft to her, the phone face down, and what goes past the bus
// windows (the shelter ad with its paper subscribe tag, the depot gates). The class-and-country sheet and the regret pie
// are in TextOpensNothing.Paper.tsx.
import { spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { REF } from "../sets/common";

/** The kit phone set's handset centre (core/engines/whatif/src/kit/sets/Phone.tsx), and its screen. */
export const PHONE = { x: 1180, y: 560 };
const SCREEN = { x: PHONE.x - 168, y: PHONE.y - 320, w: 336, h: 640 };

const pop = (frame: number, at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 11, stiffness: 220, mass: 0.6 } }));

/** A result: a big 1 in a box (no words). */
const OneBox: React.FC<{ x: number; y: number; w: number; h: number; s: number }> = ({ x, y, w, h, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={PAPER} stroke={TEAL} strokeWidth={8} />
    <text x={0} y={h * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.88} fill={INK}>1</text>
  </g>
);

/** The results screen over the kit phone's screen (draw the phone with mode "off" and thumb null): a header bar and
 *  three boxes, each a big 1, popping in at the frames given. */
export const ResultScreen: React.FC<{ frame: number; at: number[] }> = ({ frame, at }) => (
  <g>
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={18} fill="#eef1f4" />
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={74} rx={18} fill="#d9dee6" />
    <circle cx={SCREEN.x + 44} cy={SCREEN.y + 37} r={22} fill={TEAL} />
    <rect x={SCREEN.x + 80} y={SCREEN.y + 28} width={140} height={16} rx={8} fill={INK} opacity={0.55} />
    {at.map((a, i) => {
      const s = pop(frame, a);
      const y = SCREEN.y + 175 + i * 170;
      return s > 0 ? (
        <g key={i}>
          <rect x={SCREEN.x + 24} y={y - 10} width={40} height={14} rx={7} fill={INK} opacity={0.4 * Math.min(1, s)} />
          <OneBox x={PHONE.x + 30} y={y} w={190} h={140} s={s} />
        </g>
      ) : null;
    })}
  </g>
);

const CLASSMATES = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f", "#e0a070"];

/** The group chat over the kit phone's screen (draw the phone with mode "off"): a header with the group's faces and a
 *  crimson count badge, the first two messages legible ("Congrats!", "You did it!", outside review of v4.1), then seven
 *  more as notification dots, each a classmate's face with a teal dot, popping in at `at[i]`. */
export const NineMessages: React.FC<{ frame: number; at: number[] }> = ({ frame, at }) => {
  const count = at.filter((a) => frame >= a).length;
  return (
    <g>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={18} fill="#eef1f4" />
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={74} rx={18} fill="#d9dee6" />
      {[0, 1, 2].map((i) => <circle key={i} cx={SCREEN.x + 34 + i * 22} cy={SCREEN.y + 37} r={16} fill={CLASSMATES[i]} stroke="#eef1f4" strokeWidth={3} />)}
      <rect x={SCREEN.x + 112} y={SCREEN.y + 28} width={110} height={16} rx={8} fill={INK} opacity={0.55} />
      {count > 0 && (
        <g transform={`translate(${SCREEN.x + SCREEN.w - 44} ${SCREEN.y + 37}) scale(${0.85 + 0.15 * pop(frame, at[count - 1])})`}>
          <circle r={24} fill={CRIMSON} stroke={INK} strokeWidth={3} />
          <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={PAPER}>{count}</text>
        </g>
      )}
      {["Congrats!", "You did it!"].map((text, i) => {
        const s = pop(frame, at[i]);
        if (s <= 0) return null;
        return (
          <g key={i} transform={`translate(${SCREEN.x + 18} ${SCREEN.y + 100 + i * 96}) scale(${Math.min(1.06, s)})`}>
            <circle cx={22} cy={36} r={22} fill={CLASSMATES[i]} stroke={INK} strokeWidth={3} />
            <rect x={52} y={6} width={250} height={62} rx={22} fill="#fff" stroke="#c7ccd6" strokeWidth={3} />
            <text x={70} y={48} fontFamily={FONT} fontWeight={800} fontSize={33} fill={INK}>{text}</text>
          </g>
        );
      })}
      {at.slice(2).map((a, j) => {
        const s = pop(frame, a);
        if (s <= 0) return null;
        const col = j % 4, row = Math.floor(j / 4);
        const cx = SCREEN.x + 58 + col * 74 + row * 37, cy = SCREEN.y + 330 + row * 84;
        return (
          <g key={j} transform={`translate(${cx} ${cy}) scale(${Math.min(1.1, s)})`}>
            <circle r={28} fill={CLASSMATES[j + 2]} stroke={INK} strokeWidth={3} />
            <circle cx={20} cy={-20} r={10} fill={TEAL} stroke="#eef1f4" strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

/** A phone held up, screen to us, with one result on it (Min-jun's). (x, y) is its centre; it sits in a hand. */
export const HeldResult: React.FC<{ x: number; y: number; scale?: number; tilt?: number; head: string }> = ({ x, y, scale = 1, tilt = 6, head }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-48} y={-90} width={96} height={180} rx={14} fill="#1b1d24" stroke={INK} strokeWidth={4} />
    <rect x={-40} y={-78} width={80} height={156} rx={8} fill="#eef1f4" />
    <OneBox x={0} y={4} w={62} h={52} s={1} />
    <circle cx={-30} cy={88} r={16} fill={head} stroke={INK} strokeWidth={3} />
  </g>
);

/** The phone's back, face down: dark, a camera bump. Centre (x, y), the size of the kit handset. */
export const PhoneBack: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-190} y={-360} width={380} height={720} rx={46} fill="#2a2d38" stroke={INK} strokeWidth={6} />
    <rect x={-160} y={-330} width={120} height={150} rx={30} fill="#1b1d24" />
    <circle cx={-125} cy={-290} r={22} fill="#3a3e4c" stroke={INK} strokeWidth={4} />
    <circle cx={-75} cy={-220} r={22} fill="#3a3e4c" stroke={INK} strokeWidth={4} />
  </g>
);

// ------------------------------------------------------------------------------------------------ the draft

const BOX = { x: SCREEN.x + 12, y: PHONE.y - 12, w: 246, h: 92 };
const SEND = { x: SCREEN.x + SCREEN.w - 38, y: PHONE.y + 48 };
const DRAFT = ["I got the", "scholarship"];

/** Your draft to her over the kit phone's message box (draw the phone with typed 0, thumb null): "I got the
 *  scholarship" typed letter by letter (`typed` 0..1), a caret, the send button teal once there is text, and a ring
 *  round it while your thumb holds over it (`hold` 0..1). One phrase, legible (outside review of v4.1). */
export const DraftText: React.FC<{ frame: number; typed: number; hold: number }> = ({ frame, typed, hold }) => {
  const total = DRAFT.join(" ").length;
  let left = Math.round(total * typed);
  const lines = DRAFT.map((l, i) => {
    const n = Math.max(0, Math.min(l.length + (i === 0 ? 1 : 0), left));
    left -= n;
    return l.slice(0, n);
  });
  const last = lines[1].length > 0 || typed >= 1 ? 1 : 0;
  const caretX = BOX.x + 20 + lines[last].length * 17;
  return (
    <g>
      <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={26} fill="#fff" stroke="#c7ccd6" strokeWidth={4} />
      {lines.map((l, i) => <text key={i} x={BOX.x + 20} y={BOX.y + 38 + i * 40} fontFamily={FONT} fontWeight={800} fontSize={31} fill={INK}>{l}</text>)}
      {Math.floor(frame / 12) % 2 === 0 && hold === 0 && <rect x={caretX} y={BOX.y + 12 + last * 40} width={4} height={32} fill={CRIMSON} />}
      {hold > 0 && <circle cx={SEND.x} cy={SEND.y} r={40 + 6 * Math.sin(frame / 5)} fill="none" stroke={TEAL} strokeWidth={5} opacity={0.6 * hold} />}
      <circle cx={SEND.x} cy={SEND.y} r={30} fill={typed > 0 ? TEAL : "#c7ccd6"} stroke="#fff" strokeWidth={4} />
      <path d={`M${SEND.x - 12} ${SEND.y} h22 m-9 -9 l9 9 l-9 9`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** Your thumb (the kit phone's, drawn here so it can rest just over the send button and not press it). `lift` 0..1
 *  raises it off the screen a little. */
export const SendThumb: React.FC<{ lift: number }> = ({ lift }) => (
  <g transform={`translate(${SEND.x + 4} ${SEND.y + 26 + 10 * lift}) rotate(${-4 * lift})`}>
    <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={12} cy={6} rx={16} ry={22} fill="#f7cf6e" />
  </g>
);

/** A bus going past, reflected in the phone's glass: its window row slides across the screen, faint. `p` 0..1. */
export const BusReflection: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0 || p >= 1) return null;
  const x = SCREEN.x + SCREEN.w + 80 - p * (SCREEN.w + 900);
  const fade = Math.sin(p * Math.PI);
  return (
    <g>
      <clipPath id="ton-glass"><rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={18} /></clipPath>
      <g clipPath="url(#ton-glass)" opacity={0.32 * fade}>
        <rect x={x - 40} y={SCREEN.y + 90} width={900} height={200} fill="#2f8a6a" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={x + i * 220} y={SCREEN.y + 110} width={180} height={120} rx={18} fill="#e9f6ff" />)}
        <rect x={x - 40} y={SCREEN.y + 250} width={900} height={18} fill="#f2b632" />
      </g>
      <path d={`M${SCREEN.x} ${SCREEN.y + 280} L${SCREEN.x + SCREEN.w} ${SCREEN.y + 90} V${SCREEN.y + 140} L${SCREEN.x} ${SCREEN.y + 330}Z`}
        fill="#fff" opacity={0.12 * fade} clipPath="url(#ton-glass)" />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ outside the bus

/** The kit bus's windows (core/engines/whatif/src/kit/sets/Bus.tsx WINDOWS), for clipping what goes past them. */
const BUS_WINDOWS = [-260, 380, 1020, 1660];

/** Something going past the bus windows, drawn at the street's depth (0.4) but clipped to the windows (the kit bus
 *  draws its street and its wall together, so this goes over the wall, inside the window holes only). Put it in a
 *  `<Deep depth={1} flat>` after the bus's Back; draw the children in street-layer units. */
export const PastTheWindow: React.FC<{ cam: Camera; id: string; children: React.ReactNode }> = ({ cam, id, children }) => {
  const d = 0.4;
  return (
    <g>
      <clipPath id={`bw-${id}`}>
        {BUS_WINDOWS.map((x) => <rect key={x} x={x + 7} y={307} width={566} height={266} rx={20} />)}
      </clipPath>
      <g clipPath={`url(#bw-${id})`}>
        <g transform={`translate(${(cam.x - REF.x) * (1 - d)} ${(cam.y - REF.y) * (1 - d)})`}>{children}</g>
      </g>
    </g>
  );
};

/** A bus shelter with a lit ad panel, the ad a small paper subscribe tag (a crimson tag with a play mark). Left edge x. */
export const ShelterAd: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={0} y={330} width={420} height={24} rx={6} fill="#5c6675" stroke={INK} strokeWidth={4} />
    {[16, 390].map((px) => <rect key={px} x={px} y={354} width={14} height={300} fill="#5c6675" />)}
    <rect x={60} y={380} width={190} height={250} rx={8} fill="#fdfaf1" stroke={INK} strokeWidth={6} />
    <rect x={80} y={400} width={150} height={150} rx={6} fill="#e9dcc3" />
    <g transform="translate(155 470) rotate(-6)">
      <rect x={-56} y={-30} width={112} height={60} rx={16} fill={CRIMSON} stroke={INK} strokeWidth={4} />
      <path d="M-10 -14 L16 0 L-10 14Z" fill={PAPER} />
    </g>
    <rect x={90} y={570} width={130} height={12} rx={6} fill={INK} opacity={0.5} />
    <rect x={90} y={592} width={90} height={12} rx={6} fill={INK} opacity={0.35} />
    <rect x={270} y={560} width={110} height={18} rx={6} fill="#8a6a4c" />
  </g>
);

/** The depot: a long warehouse with roller shutters, the yard gate with striped posts, a sodium lamp. Left edge x. */
export const DepotGates: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-200} y={250} width={1100} height={400} fill="#9aa1ab" stroke={INK} strokeWidth={5} />
    <path d="M-220 250 L350 170 L920 250Z" fill="#7a828e" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={-120 + i * 330} y={380} width={230} height={270} fill="#c9ced6" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, l) => <line key={l} x1={-120 + i * 330} y1={400 + l * 28} x2={110 + i * 330} y2={400 + l * 28} stroke="#9aa1ab" strokeWidth={4} />)}
      </g>
    ))}
    {[-40, 640].map((px) => (
      <g key={px}>
        <rect x={px} y={420} width={44} height={240} fill="#f2b632" stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((s) => <path key={s} d={`M${px} ${440 + s * 46} l44 -24 v18 l-44 24z`} fill={INK} />)}
      </g>
    ))}
    <rect x={4} y={600} width={636} height={12} fill="#5c6675" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={20 + i * 44} y={560} width={8} height={90} fill="#5c6675" />)}
    <rect x={780} y={300} width={10} height={360} fill="#4a5262" />
    <ellipse cx={810} cy={306} rx={34} ry={12} fill="#ffb347" />
  </g>
);
