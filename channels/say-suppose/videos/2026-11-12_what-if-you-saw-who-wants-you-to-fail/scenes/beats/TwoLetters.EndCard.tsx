// Helpers for "Two Letters" (TwoLetters.tsx): the end card's stamped paper tags (LIKE, SUBSCRIBE, COMMENT, the rule
// device's look), in screen pixels, and Min-jun with his own letter. The right third of the frame stays empty.
import { AbsoluteFill, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { blinking, MINJUN } from "../shared";
import type { Body, Face } from "./HerBack.Sister";

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

/** The three tags in the middle third of the frame (screen pixels): COMMENT on "Tell us in the comments", then LIKE
 *  and SUBSCRIBE on "hit like and subscribe". Nothing right of x 1280. */
export const EndTags: React.FC<{ frame: number; comment: number; like: number; subscribe: number }> = ({ frame, comment, like, subscribe }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      <g transform="translate(700 250) scale(1.05)">
        <EndTag frame={frame} at={comment} x={0} y={0} text="COMMENT" icon="talk" tilt={-3} />
        <EndTag frame={frame} at={like} x={30} y={140} text="LIKE" icon="like" tilt={2} />
        <EndTag frame={frame} at={subscribe} x={0} y={280} text="SUBSCRIBE" icon="bell" tilt={-2} />
      </g>
    </svg>
  </AbsoluteFill>
);

/** Min-jun at the door with his own letter held up in his front hand. */
export const MinJun: React.FC<{ body: Body; face: Face; frame: number; letter: number }> = ({ body, face, frame, letter }) => (
  <Figure head={MINJUN.head} coat={MINJUN.coat} {...body} {...face} blink={blinking(frame, 4)} time={frame}
    held={letter > 0 ? <Letter x={0} y={10} scale={0.42} tilt={-8} /> : undefined} />
);
