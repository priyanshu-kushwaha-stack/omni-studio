// Pieces drawn for "A Text Would Open Nothing" (beats/TextOpensNothing.tsx): the results screen (grade one as a big 1 in a
// box, no words), Min-jun's phone, the seat-and-sea sheet, the regret pie, the phone face down, and what goes past the bus
// windows (the shelter ad with its paper subscribe tag, the depot gates).
import { spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, FPS, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { noise } from "../shared";
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

// ------------------------------------------------------------------------------------------------ seat and sea

/** A small chair from the front-left, for counting seats on paper. */
const MiniChair: React.FC<{ x: number; y: number; on: boolean; s?: number }> = ({ x, y, on, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-18} y={-40} width={36} height={30} rx={5} fill={on ? TEAL : "#d9d2c2"} stroke={INK} strokeWidth={4} />
    <rect x={-22} y={-10} width={44} height={10} rx={4} fill={on ? TEAL : "#d9d2c2"} stroke={INK} strokeWidth={4} />
    <path d="M-16 0 V18 M16 0 V18" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** The sheet's drawing. Left: what you thought, four teal places in a small room of twenty-four. Right: what it is, the
 *  top four per cent of everyone in the country who sat it, a sea of dots with its first row teal; two of those teal
 *  dots ringed, yours (mustard) and his (pale blue), side by side. `room` 0..1 draws the room in, `sea` 0..1 fills the
 *  dots, `teal` 0..1 colours the top ones, `pair` 0..1 rings the two. */
export const SeatAndSea: React.FC<{ frame: number; room: number; sea: number; teal: number; pair: number; you: string; him: string }> = ({
  frame, room, sea, teal, pair, you, him,
}) => {
  const cols = 30, rows = 14;
  const pulse = 1 + 0.15 * Math.max(0, Math.sin(frame / 4));
  const ring = (c: number, color: string) => (
    <circle cx={c * 26 + 13} cy={16} r={22 * (pair < 1 ? pair : pulse)} fill="none" stroke={color} strokeWidth={8} />
  );
  return (
    <g>
      {room > 0 && (
        <g opacity={Math.min(1, room * 1.5)}>
          {/* the room: four walls with a door gap, twenty-four chairs, four of them teal */}
          <path d="M60 110 H440 V560 H60 V360 M60 300 V110" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {Array.from({ length: 24 }, (_, i) => {
            const on = i < 4;
            return <MiniChair key={i} x={110 + (i % 6) * 62} y={200 + Math.floor(i / 6) * 96} on={on && room >= 1} s={on && room >= 1 ? pulse * 0.9 + 0.1 : 1} />;
          })}
          <line x1={500} y1={60} x2={500} y2={580} stroke="#cdbfa6" strokeWidth={5} strokeDasharray="18 16" />
        </g>
      )}
      <g transform="translate(560 120)">
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const shown = sea * (cols + 6) - c - noise(i) * 6 > 0;
          if (!shown) return null;
          const on = r === 0 && c < 17 && teal > 0; // the top four per cent: 17 of 420
          return <circle key={i} cx={c * 26 + 13} cy={r * 32 + 16} r={8} fill={on ? TEAL : "#9a9a94"} opacity={on ? 1 : 0.75} />;
        })}
        {pair > 0 && ring(6, you)}
        {pair > 0 && ring(8, him)}
      </g>
    </g>
  );
};

/** A pie on paper: about a third teal (education) with a little book in it, the rest the other regrets; eleven dots for
 *  the eleven studies along the bottom. In the Sheet's own units, centre (cx, cy). */
export const RegretPie: React.FC<{ cx: number; cy: number; r: number; shown: number }> = ({ cx, cy, r, shown }) => {
  const wedge = (a0: number, a1: number) => {
    const p = (a: number) => `${cx + Math.sin(a) * r} ${cy - Math.cos(a) * r}`;
    return `M${cx} ${cy} L${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}Z`;
  };
  const third = (Math.PI * 2) / 3;
  const slices = [0.22, 0.18, 0.15, 0.13]; // the other kinds, in grey
  let a = third;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#d9d2c2" stroke={INK} strokeWidth={6} />
      {slices.map((f, i) => {
        const a0 = a;
        a += f * Math.PI * 2;
        return <path key={i} d={wedge(a0, Math.min(a, Math.PI * 2))} fill={["#c9c1b0", "#d9d2c2", "#c4bcab", "#d2cab9"][i]} stroke={INK} strokeWidth={4} />;
      })}
      {shown > 0 && <path d={wedge(0, third * Math.min(1, shown))} fill={TEAL} stroke={INK} strokeWidth={6} />}
      {shown >= 1 && (
        <g transform={`translate(${cx + r * 0.48} ${cy - r * 0.3})`}>
          <path d="M-30 -18 L0 -8 L30 -18 V18 L0 28 L-30 18Z" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M0 -8 V28" stroke={INK} strokeWidth={4} />
        </g>
      )}
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={cx - 150 + i * 30} cy={cy + r + 50} r={9} fill={INK} opacity={0.75} />)}
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
