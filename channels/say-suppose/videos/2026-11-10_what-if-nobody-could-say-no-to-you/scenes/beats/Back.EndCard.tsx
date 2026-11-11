// Helpers for "Back to you" (Back.tsx): the top-down lap under a phone insert (with Dev's notebook page tucked under
// the phone's edge), the phone lying face up on the tiffin lid, and the end card (you, small, in the left two-thirds
// holding the torn strip; LIKE, SUBSCRIBE and COMMENT tags beside you; the right third empty for end screens).
import { AbsoluteFill, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { Layer, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { aimArm, PhoneTop, type Body } from "../parts2";
import { blinking, HERO, mix, noise, ramp } from "../shared";
import { Strip } from "./Choice.Props";

// ------------------------------------------------------------------------------------------------ the phone inserts

/** Your lap from above: dark trousers, the bench's blue edge at the top. */
export const LapTop: React.FC = () => (
  <g>
    <rect x={-1400} y={-1400} width={4800} height={4000} fill="#2a3346" />
    <rect x={-1400} y={-1400} width={4800} height={1460} fill="#4a7090" />
    {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-1300 + i * 220} y={-1400} width={8} height={1460} fill="#000" opacity={0.12} />)}
    <path d="M300 2600 Q340 900 620 200 L1300 200 Q1580 900 1620 2600 Z" fill="#323a52" />
    <path d="M960 260 V2600" stroke="#262c40" strokeWidth={10} />
  </g>
);

/** Dev's notebook page, tucked under the phone's left edge (world coordinates, for an insert at the phone (x, y)). */
export const TuckedPage: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x - 230 * scale} ${y - 40 * scale}) rotate(-9) scale(${scale})`}>
    <path d="M-150 -170 H150 V170 H-150 L-140 140 L-152 110 L-140 80 L-152 50 L-140 20 L-152 -10 L-140 -40 L-152 -70 L-140 -100 L-152 -130 Z"
      fill="#fffaf0" stroke={INK} strokeWidth={5} />
    {[-110, -60, -10, 40, 90, 140].map((ly) => <line key={ly} x1={-120} y1={ly} x2={130} y2={ly} stroke="#9fc0e0" strokeWidth={4} />)}
    <rect x={-110} y={-140} width={180} height={18} rx={9} fill={INK} />
  </g>
);

/** The tiffin lid from above: a steel disc with two rings and the handle clips. */
export const LidTop: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 470 }) => (
  <g>
    <rect x={-1400} y={-1400} width={4800} height={4000} fill="#2a3346" />
    <circle cx={x} cy={y} r={r + 30} fill="#000" opacity={0.25} />
    <circle cx={x} cy={y} r={r} fill="#c9ced6" stroke={INK} strokeWidth={8} />
    <circle cx={x} cy={y} r={r * 0.86} fill="none" stroke="#aab1bb" strokeWidth={10} />
    <circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="#b8bec8" strokeWidth={6} />
    {[-1, 1].map((s) => <rect key={s} x={x + s * r - 30} y={y - 50} width={60} height={100} rx={12} fill="#9aa1ab" stroke={INK} strokeWidth={5} />)}
  </g>
);

/** The phone face up with no hand: PhoneTop clipped to its own body. */
export const PhoneAlone: React.FC<React.ComponentProps<typeof PhoneTop>> = (p) => {
  const s = p.scale ?? 1;
  return (
    <g>
      <rect x={p.x - 190 * s + 14} y={p.y - 360 * s + 22} width={380 * s} height={720 * s} rx={46 * s} fill="#000" opacity={0.3} />
      <clipPath id="phone-alone"><rect x={p.x - 190 * s} y={p.y - 360 * s} width={380 * s} height={720 * s} rx={46 * s} /></clipPath>
      <g clipPath="url(#phone-alone)"><PhoneTop {...p} thumb={null} /></g>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the end card

/** A stamped paper tag (the rule device's look) with an icon, in screen pixels; stamps in at `at`. */
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

/** The end card. You stand small at the left with the torn strip; the three tags stamp in beside you 0.6 s apart from
 *  `tags`; the camera pushes in slowly toward you. Nothing in the right third. */
export const EndCard: React.FC<{ frame: number; from: number; to: number; tags: number }> = ({ frame, from, to, tags }) => {
  const X = 370, FLOOR = 900, SC = 1.5;
  const push = ramp(frame, from, to);
  const cam: Camera = { x: mix(960, 900, push), y: mix(540, 556, push), zoom: mix(1, 1.08, push) };
  const body: Body = { x: X, y: FLOOR, scale: SC, facing: 1, pose: STAND };
  const lift = ramp(frame, from + 6, from + 30);
  body.pose = { ...STAND, tilt: mix(0, -4, lift), armF: aimArm(body, { x: X + mix(50, 92, lift), y: FLOOR - mix(160, 214, lift) * SC }) };
  const back = (
    <>
      <Layer cam={cam} depth={0.5} flat>
        <rect x={-1400} y={-800} width={4800} height={2800} fill="#1c2042" />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={-200 + noise(i) * 1500} cy={60 + noise(i + 40) * 420} r={2 + noise(i + 9) * 3} fill="#fff1c9" opacity={0.5} />
        ))}
      </Layer>
      <Layer cam={cam} depth={1} flat>
        <circle cx={X + 30} cy={FLOOR - 250} r={330} fill="#3a3f6e" opacity={0.85} />
        <rect x={-1400} y={FLOOR} width={4800} height={800} fill="#2a2e50" />
        <rect x={-1400} y={FLOOR} width={4800} height={10} fill="#22264a" />
        <ellipse cx={X + 10} cy={FLOOR + 8} rx={150} ry={14} fill="#000" opacity={0.35} />
      </Layer>
    </>
  );
  const actors = (
    <Figure {...HERO} {...body} brows="raised" lids={0.1} eyes={1.05} mouth="smile" look={{ x: 0.5, y: 0.15 }}
      blink={blinking(frame, 2)} time={frame} flow={0.15}
      held={<Strip id="end" x={36} y={-8} scale={0.4} tilt={-6} side="back" />} />
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <g transform="translate(780 240) scale(1.2)">
            <EndTag frame={frame} at={tags} x={0} y={0} text="LIKE" icon="like" tilt={-3} />
            <EndTag frame={frame} at={tags + 18} x={30} y={130} text="SUBSCRIBE" icon="bell" tilt={2} />
            <EndTag frame={frame} at={tags + 36} x={0} y={260} text="COMMENT" icon="talk" tilt={-2} />
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
