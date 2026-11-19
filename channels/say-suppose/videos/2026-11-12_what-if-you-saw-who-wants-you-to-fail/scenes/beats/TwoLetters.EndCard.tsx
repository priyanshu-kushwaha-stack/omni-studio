// Helpers for "Two Letters" (TwoLetters.tsx): the end card's stamped paper tags (LIKE, SUBSCRIBE, COMMENT, the rule
// device's look), in screen pixels, over the last two-shot at the door, and Min-jun with his own letter. The right third
// of the frame stays empty.
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

/** The three tags in the middle third of the frame (screen pixels), their left edge at `x`: COMMENT on "Tell us in the
 *  comments", then LIKE and SUBSCRIBE on "hit like and subscribe". Nothing right of x 1280 (YouTube's end screen). */
export const EndTags: React.FC<{ frame: number; comment: number; like: number; subscribe: number; x?: number; y?: number; scale?: number }> = ({
  frame, comment, like, subscribe, x = 700, y = 250, scale = 1.05,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <EndTag frame={frame} at={comment} x={0} y={0} text="COMMENT" icon="talk" tilt={-3} />
        <EndTag frame={frame} at={like} x={30} y={140} text="LIKE" icon="like" tilt={2} />
        <EndTag frame={frame} at={subscribe} x={0} y={280} text="SUBSCRIBE" icon="bell" tilt={-2} />
      </g>
    </svg>
  </AbsoluteFill>
);

/** A flat paper cutout of a person standing, seen from behind or in silhouette: a white paper border round a flat
 *  head and body, no face. (x, y) is between the feet; h the height. */
const Cutout: React.FC<{ x: number; y: number; h: number; head: string; body: string; scarf?: string; tuft?: boolean; letter?: boolean }> = ({
  x, y, h, head, body, scarf, tuft, letter,
}) => {
  const r = h * 0.14;
  const shape = (fill: string, grow: number) => (
    <g fill={fill}>
      <circle cx={0} cy={-h + r} r={r + grow} />
      <rect x={-r * 0.95 - grow} y={-h + r * 2.1 - grow} width={r * 1.9 + grow * 2} height={h * 0.5 + grow * 2} rx={r * 0.7} />
      <rect x={-r * 0.75 - grow} y={-h * 0.38 - grow} width={r * 0.6 + grow * 2} height={h * 0.38 + grow} rx={r * 0.2} />
      <rect x={r * 0.15 - grow} y={-h * 0.38 - grow} width={r * 0.6 + grow * 2} height={h * 0.38 + grow} rx={r * 0.2} />
      {letter && <rect x={r * 0.9 - grow} y={-h * 0.62 - grow} width={r * 1.1 + grow * 2} height={r * 1.4 + grow * 2} rx={4} transform={`rotate(-10 ${r} ${-h * 0.55})`} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="translate(10 12)" opacity={0.35}>{shape("#000", 10)}</g>
      {shape(PAPER, 10)}
      {shape(body, 0)}
      <circle cx={0} cy={-h + r} r={r} fill={head} />
      {scarf && <rect x={-r * 1.0} y={-h + r * 2.0} width={r * 2} height={r * 0.5} rx={r * 0.2} fill={scarf} />}
      {tuft && <path d={`M${-r * 0.1} ${-h + r * 0.05} q${r * 0.2} ${-r * 0.5} ${r * 0.5} ${-r * 0.15}`} fill="none" stroke={INK} strokeWidth={r * 0.14} strokeLinecap="round" />}
      {letter && <rect x={r * 0.9} y={-h * 0.62} width={r * 1.1} height={r * 1.4} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} transform={`rotate(-10 ${r} ${-h * 0.55})`} />}
    </g>
  );
};

/**
 * The end card (outside review v6: distinct from the last story shot, the cliffhanger shut first): the night-dark
 * kitchen window filling the left two-thirds, the two of you lowered into it as flat paper cutouts, you turned to the
 * glass, nothing over your head; the tags, a quarter bigger, stamp in over the glass. The right third stays dark and
 * empty for YouTube's end screen. Screen pixels; `from` is the cut to it.
 */
export const EndCard: React.FC<{ frame: number; from: number; comment: number; like: number; subscribe: number }> = ({ frame, from, comment, like, subscribe }) => {
  const s = spring({ frame: frame - from, fps: FPS, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  const drop = 60 * (1 - Math.min(1, s));
  return (
    <AbsoluteFill style={{ background: "#0d1120" }}>
      <svg width={1920} height={1080}>
        {/* the window: a frame, a mullion, the dark glass with one sheen */}
        <rect x={110} y={120} width={1080} height={820} rx={10} fill="#141c33" stroke="#b9895f" strokeWidth={22} />
        <line x1={650} y1={120} x2={650} y2={940} stroke="#b9895f" strokeWidth={16} />
        <path d="M230 131 l120 0 l-240 798 l-120 0Z" fill="#dfe9ff" opacity={0.06} />
        <path d="M790 131 l40 0 l-240 798 l-40 0Z" fill="#dfe9ff" opacity={0.08} />
        <g transform={`translate(0 ${drop})`}>
          <Cutout x={380} y={930} h={430} head={MINJUN.head} body={MINJUN.coat} letter />
          <Cutout x={600} y={930} h={420} head={MUSTARD} body={INK} scarf={TEAL} tuft />
        </g>
        <rect x={98} y={930} width={1104} height={30} fill="#b9895f" stroke={INK} strokeWidth={5} />
      </svg>
      <EndTags frame={frame} comment={comment} like={like} subscribe={subscribe} x={700} y={190} scale={1.31} />
    </AbsoluteFill>
  );
};

/** Min-jun at the door with his own letter held up in his front hand. */
export const MinJun: React.FC<{ body: Body; face: Face; frame: number; letter: number }> = ({ body, face, frame, letter }) => (
  <Figure head={MINJUN.head} coat={MINJUN.coat} {...body} {...face} blink={blinking(frame, 4)} time={frame}
    held={letter > 0 ? <Letter x={0} y={10} scale={0.42} tilt={-8} /> : undefined} />
);
