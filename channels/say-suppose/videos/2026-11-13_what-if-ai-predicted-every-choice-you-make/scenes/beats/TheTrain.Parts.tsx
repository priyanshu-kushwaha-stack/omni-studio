// Helpers for "The Train" (TheTrain.tsx): the passengers on the morning train (library metroCoach), a wink drawn over
// one eye, the close of the bench for the hands insert, the queued video under the phone's feed, and the end card's
// stamped paper tags (LIKE, SUBSCRIBE, COMMENT, the rule device's look) in the left two-thirds, the right third quiet.
import { AbsoluteFill, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { joints, SEATED, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone, seatedY } from "@whatif/kit/sets";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Tag, type TagKey } from "../device";
import { headAt } from "../kit";
import { blinking, noise, PASTELS } from "../shared";

/** The bench's seat top in metroCoach, and a seated figure's y and scale there. */
export const SEAT_TOP = 860;
export const SEAT_S = 1.1;
export const SEAT_Y = seatedY(SEAT_TOP, SEAT_S);

/** Sitting with a phone held low in both hands, head down to it. */
export const PHONE_SIT: Pose = { ...SEATED, tilt: 8, armF: [40, 95], armB: [30, 100] };

/** One passenger on the bench: their phone, their teal card (LOOKS AT PHONE 99%), ticking on `ticks`. */
export const Passenger: React.FC<{ frame: number; x: number; i: number; facing: 1 | -1; ticks: number[]; from: number; raise?: number }> = ({
  frame, x, i, facing, ticks, from, raise = 0,
}) => {
  const h = headAt(x, SEAT_Y, SEAT_S, PHONE_SIT, facing);
  const keys: TagKey[] = [{ at: from, text: "LOOKS AT PHONE", pct: 99, state: "tick" }, ...ticks.map((at) => ({ at, text: "LOOKS AT PHONE", pct: 99, state: "tick" as const }))];
  return (
    <g>
      <Figure x={x} y={SEAT_Y} scale={SEAT_S} facing={facing} pose={PHONE_SIT} head={PASTELS[i % PASTELS.length]} coat={["#3b4a6b", "#2a2d36", "#5f3d6b", "#2f5f63"][i % 4]}
        mouth="flat" lids={0.35} look={{ x: 0.5, y: 0.9 }} blink={blinking(frame, i + 5)} time={frame} held={<HandPhone lit scale={1.1} />} />
      <Tag frame={frame} x={h.x} headY={h.y - raise} r={h.r} scale={0.62} threadTop={75} keys={keys} />
    </g>
  );
};

/** A wink: one eye (the front one) shut to a curve, drawn over a <Figure> at the same place. */
export const Wink: React.FC<{ x: number; y: number; scale: number; facing: 1 | -1; pose: Pose; head: string; look: { x: number; y: number } }> = ({
  x, y, scale, facing, pose, head, look,
}) => {
  const j = joints(pose);
  const ex = 17 + look.x * 12;
  const ey = -5 + look.y * 8;
  const cx = x + facing * (j.head.x + ex) * scale;
  const cy = y + (j.head.y + ey) * scale;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale * facing} ${scale})`}>
      <ellipse cx={0} cy={0} rx={12} ry={16} fill={head} />
      <path d="M-10 0 Q0 7 10 0" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
};

/** The bench close, morning: the blue seat, the window strip over it with the city sliding past. */
export const BenchClose: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2800} fill="#cfd8d6" />
    <rect x={-1400} y={40} width={4800} height={330} fill="#a8d4e6" />
    {Array.from({ length: 14 }, (_, i) => {
      const x = (((i * 360 - frame * 14) % 5040) + 5040) % 5040 - 1400;
      const h = 120 + noise(i + 2) * 180;
      return <rect key={i} x={x} y={370 - h} width={300} height={h} fill={["#d9b99a", "#c7d6cf", "#e6cd98"][i % 3]} />;
    })}
    <rect x={-1400} y={30} width={4800} height={20} fill="#5c6675" />
    <rect x={-1400} y={360} width={4800} height={24} fill="#5c6675" />
    <rect x={-1400} y={384} width={4800} height={1600} fill="#41708c" />
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-1300 + i * 300} y={400} width={10} height={1200} fill="#000" opacity={0.1} />)}
  </g>
);

/** The next video queued under the playing one on your phone's feed (phone set's handset at (1180, 560)): a thumbnail
 *  with a play mark, its border pulsing crimson from `pick`. No lettering. */
export const Queued: React.FC<{ frame: number; pick: number }> = ({ frame, pick }) => {
  const sx = 1180 - 190 + 22, sw = 380 - 44;
  const y = 742;
  const glow = frame >= pick ? 0.5 + 0.5 * Math.sin((frame - pick) / 5) : 0;
  return (
    <g>
      <rect x={sx} y={y - 14} width={sw} height={150} fill="#14161c" />
      <rect x={sx + 10} y={y} width={150} height={96} rx={8} fill="#5a3b2a" stroke={frame >= pick ? CRIMSON : "#3a3f4c"} strokeWidth={frame >= pick ? 4 + glow * 4 : 3} />
      <circle cx={sx + 85} cy={y + 48} r={22} fill={MUSTARD} />
      <path d={`M${sx + 78} ${y + 36} l18 12 l-18 12z`} fill={INK} />
      <rect x={sx + 176} y={y + 14} width={130} height={14} rx={7} fill={PAPER} opacity={0.6} />
      <rect x={sx + 176} y={y + 40} width={90} height={14} rx={7} fill={PAPER} opacity={0.4} />
      {frame >= pick && <rect x={sx + 10} y={y + 104} width={150 * Math.min(1, (frame - pick) / 120)} height={6} fill={CRIMSON} />}
    </g>
  );
};

/** A stamped paper tag with an icon, in screen pixels; it drops in on its thread at `at`. */
const EndTag: React.FC<{ frame: number; at: number; x: number; y: number; text: string; icon: "like" | "bell" | "talk"; tilt: number }> = ({
  frame, at, x, y, text, icon, tilt,
}) => {
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness: 190, mass: 0.6 } });
  const h = 92, w = 130 + text.length * 36;
  const sway = Math.sin((frame - at) / 14 + x) * 1.2;
  return (
    <g transform={`translate(${x} ${y - (1 - s) * 120}) rotate(${tilt + sway})`} opacity={Math.min(1, s * 1.4)}>
      <line x1={26} y1={-900} x2={26} y2={h / 2} stroke="#d9c9a6" strokeWidth={3} />
      <rect x={7} y={10} width={w} height={h} rx={16} fill="#05031f" opacity={0.35} />
      <rect x={0} y={0} width={w} height={h} rx={16} fill={PAPER} stroke={INK} strokeWidth={5} />
      <circle cx={26} cy={h / 2} r={8} fill="none" stroke={INK} strokeWidth={3} />
      <g transform={`translate(76 ${h / 2}) scale(1.2)`}>
        {icon === "like" && <path d="M-16 4 h8 v18 h-8z M-6 6 l8 -2 l4 -16 q3 -5 7 -2 q2 3 0 9 l-2 9 h12 q5 0 4 6 l-3 12 q-1 4 -5 4 h-25z" fill={MUSTARD} stroke={INK} strokeWidth={3} strokeLinejoin="round" transform="translate(0 -12)" />}
        {icon === "bell" && <path d="M-16 10 q4 -4 4 -14 q0 -14 12 -16 q12 2 12 16 q0 10 4 14 z M-5 14 q5 8 10 0" fill={CRIMSON} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
        {icon === "talk" && <path d="M-20 -14 h40 q6 0 6 6 v18 q0 6 -6 6 h-20 l-12 10 l2 -10 h-10 q-6 0 -6 -6 v-18 q0 -6 6 -6z" fill={TEAL} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      </g>
      <text x={116} y={h * 0.68} fontFamily={FONT} fontWeight={800} fontSize={46} fill={INK} letterSpacing={2}>{text}</text>
    </g>
  );
};

/** The end card's three tags in the left two-thirds (screen pixels): nothing right of x 1240. */
export const EndTags: React.FC<{ frame: number; like: number; subscribe: number; comment: number }> = ({ frame, like, subscribe, comment }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      <EndTag frame={frame} at={like} x={260} y={250} text="LIKE" icon="like" tilt={-3} />
      <EndTag frame={frame} at={subscribe} x={520} y={450} text="SUBSCRIBE" icon="bell" tilt={2} />
      <EndTag frame={frame} at={comment} x={300} y={660} text="COMMENT" icon="talk" tilt={-2} />
    </svg>
  </AbsoluteFill>
);
