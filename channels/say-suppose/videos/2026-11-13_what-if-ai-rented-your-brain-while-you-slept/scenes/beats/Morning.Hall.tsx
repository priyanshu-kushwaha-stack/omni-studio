// Pieces for "Morning" (Morning.tsx): your hall (the key hook with KEYS over it, the front door with DOOR on it, a
// small window), the paper bridge you dreamt (mustard and teal), your open hand, and the end card's stamped tags (LIKE,
// SUBSCRIBE, COMMENT; screen pixels, nothing right of x 1280). World coordinates unless said.
import { AbsoluteFill, spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { Deep, Floor, Window } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";

export const HALL = { floor: 960, hook: { x: 1080, y: 520 }, door: { x: 1620, w: 240, top: 290 } };

/** The hall behind you: wall, window, skirting, floor, the hook board with your keys, the front door (`open` 0..1). */
export const HallBack: React.FC<{ cam: Camera; mood: MoodName; keys: boolean; open: number }> = ({ cam, mood, keys, open }) => {
  const D = HALL.door, H = HALL.hook;
  return (
    <>
      <Deep cam={cam} depth={0.9} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#efdcbc" />
        <Window id="hall" mood={mood} x={180} y={240} w={300} h={300} frame="#8a6446" />
        <rect x={-1400} y={HALL.floor - 60} width={4800} height={40} fill="#c9a77e" />
        <rect x={700} y={250} width={180} height={220} rx={6} fill="#fff6e3" stroke={INK} strokeWidth={7} />
        <path d="M725 440 L780 340 L815 400 L840 365 L860 440Z" fill="#7fc29b" />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={HALL.floor - 20} fill="#b5764a" gap={180} slant={-70} />
        {/* the hook board */}
        <rect x={H.x - 110} y={H.y - 22} width={220} height={36} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
        {[-60, 0, 60].map((dx) => <path key={dx} d={`M${H.x + dx} ${H.y + 10} v18 q0 10 10 8`} fill="none" stroke="#c9a36b" strokeWidth={6} strokeLinecap="round" />)}
        {keys && <Keys x={H.x} y={H.y + 40} />}
        {/* the front door in its frame; it swings inward (narrows) as it opens, and the morning comes in */}
        <rect x={D.x - D.w / 2 - 26} y={D.top - 26} width={D.w + 52} height={HALL.floor - D.top + 6} fill="#8a6446" stroke={INK} strokeWidth={5} />
        <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={HALL.floor - D.top - 20} fill="#fff1c8" />
        <rect x={D.x - D.w / 2} y={D.top} width={D.w * (1 - 0.82 * open)} height={HALL.floor - D.top - 20} fill="#2f6f73" stroke={INK} strokeWidth={4} />
        {open < 0.6 && <circle cx={D.x - D.w / 2 + D.w * (1 - 0.82 * open) - 30} cy={620} r={11} fill="#d6b25e" stroke={INK} strokeWidth={3} />}
      </Deep>
    </>
  );
};

/** A ring of two keys. (x, y) the ring's top. */
export const Keys: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={0} r={12} fill="none" stroke="#9aa1ab" strokeWidth={4} />
    <path d="M-6 10 l-8 36 l6 0 l0 -6 l5 0 l0 -6 l-4 0 l4 -22Z" fill="#d6b25e" stroke={INK} strokeWidth={2} />
    <path d="M6 10 l10 30 l6 -2 l-1 -6 l4 -2 l-2 -5 l-4 1 l-6 -18Z" fill="#c9ced6" stroke={INK} strokeWidth={2} />
  </g>
);

/** The bridge you dreamt, a paper cut-out in your colours: a mustard deck and arch, teal towers and hangers. (x, y) its
 *  centre, about 360 wide at s 1. */
export const PaperBridge: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={10} rx={230} ry={110} fill="#fff1c8" opacity={0.25} />
    <path d="M-170 40 Q0 -110 170 40" fill="none" stroke={MUSTARD} strokeWidth={18} strokeLinecap="round" />
    {[-120, -80, -40, 0, 40, 80, 120].map((dx) => <line key={dx} x1={dx} y1={40} x2={dx} y2={40 - (150 - Math.abs(dx)) * 0.62 - 6} stroke={TEAL} strokeWidth={5} />)}
    <rect x={-190} y={34} width={380} height={18} rx={4} fill={MUSTARD} stroke={INK} strokeWidth={4} />
    <rect x={-176} y={-20} width={20} height={90} rx={4} fill={TEAL} stroke={INK} strokeWidth={4} />
    <rect x={156} y={-20} width={20} height={90} rx={4} fill={TEAL} stroke={INK} strokeWidth={4} />
    <path d="M-200 86 q20 -10 40 0 q20 10 40 0 q20 -10 40 0 q20 10 40 0 q20 -10 40 0 q20 10 40 0 q20 -10 40 0 q20 10 40 0 q20 -10 40 0 q20 10 40 0"
      fill="none" stroke={TEAL} strokeWidth={4} opacity={0.6} />
  </g>
);

/** Your open hand, raised from under the blanket toward the top bunk: an arm from (sx, sy) to the palm at (hx, hy). */
export const OpenHand: React.FC<{ sx: number; sy: number; hx: number; hy: number; w?: number }> = ({ sx, sy, hx, hy, w = 34 }) => {
  const mx = (sx + hx) / 2 - 40, my = (sy + hy) / 2 + 30;
  return (
    <g>
      <polyline points={`${sx},${sy} ${mx},${my} ${hx},${hy}`} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {[-50, -20, 10, 40].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <line key={i} x1={hx} y1={hy} x2={hx + Math.sin(r) * w * 2.1} y2={hy - Math.cos(r) * w * 2.1} stroke={MUSTARD} strokeWidth={w * 0.55}
          strokeLinecap="round" />;
      })}
      <line x1={hx} y1={hy} x2={hx - w * 1.6} y2={hy + w * 0.2} stroke={MUSTARD} strokeWidth={w * 0.55} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={w * 1.05} fill={MUSTARD} stroke={INK} strokeWidth={4} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the end card

const EndTag: React.FC<{ frame: number; at: number; x: number; y: number; text: string; icon: "like" | "bell" | "talk"; tilt: number }> = ({
  frame, at, x, y, text, icon, tilt }) => {
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
        {icon === "like" && <path d="M-16 4 h8 v18 h-8z M-6 6 l8 -2 l4 -16 q3 -5 7 -2 q2 3 0 9 l-2 9 h12 q5 0 4 6 l-3 12 q-1 4 -5 4 h-25z" fill={MUSTARD} stroke={INK}
          strokeWidth={3} strokeLinejoin="round" transform="translate(0 -12)" />}
        {icon === "bell" && <path d="M-16 10 q4 -4 4 -14 q0 -14 12 -16 q12 2 12 16 q0 10 4 14 z M-5 14 q5 8 10 0" fill={CRIMSON} stroke={INK} strokeWidth={3}
          strokeLinejoin="round" />}
        {icon === "talk" && <path d="M-20 -14 h40 q6 0 6 6 v18 q0 6 -6 6 h-20 l-12 10 l2 -10 h-10 q-6 0 -6 -6 v-18 q0 -6 6 -6z" fill={TEAL} stroke={INK}
          strokeWidth={3} strokeLinejoin="round" />}
      </g>
      <text x={96} y={h * 0.68} fontFamily={FONT} fontWeight={800} fontSize={38} fill={INK} letterSpacing={2}>{text}</text>
    </g>
  );
};

/** The three tags, screen pixels, in one row along the top of the left two-thirds, over the buildings and clear of every
 *  face and pale worker below (G3: stacked in the middle they sat on faces): COMMENT, then LIKE and SUBSCRIBE. Nothing
 *  right of x 1280. */
export const EndTags: React.FC<{ frame: number; comment: number; like: number; subscribe: number }> = ({ frame, comment, like, subscribe }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      <g transform="translate(150 118)">
        <EndTag frame={frame} at={comment} x={0} y={0} text="COMMENT" icon="talk" tilt={-3} />
        <EndTag frame={frame} at={like} x={370} y={6} text="LIKE" icon="like" tilt={2} />
        <EndTag frame={frame} at={subscribe} x={650} y={0} text="SUBSCRIBE" icon="bell" tilt={-2} />
      </g>
    </svg>
  </AbsoluteFill>
);
