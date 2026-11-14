// Five Hundred's school hall (script v5, lines 64-65), drawn for this beat: seen from the side of the stage, the stage
// and its curtain at the left (you at the microphone, Ms. Kang at the side), five hundred seated heads in twenty rows
// running back to the far wall, the far wall with its clock, EXIT sign and doors; at the very back by the radiator the
// janitor with his mop. World coordinates for a <Stage> (REF 1920 x 1080). No sound here.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { Glasses, headAt, Letter, Meter } from "../parts";
import { blinking, HERO, KANG, linear, mix, noise, PASTELS } from "../shared";
import { HeadIcon } from "./WhosCrimson.Common";

export const ROWS = 20;
export const PER_ROW = 25;
/** The row your class sits in (0 is the back row): one red row near the front. */
export const RED_ROW = 15;
export const STAGE = { top: 640, front: 520 } as const;
export const YOU_SPOT = { x: 330, y: 640, scale: 0.85 } as const;
export const MIC = { x: 420 } as const;
export const JANITOR = { x: 2060, y: 352, scale: 0.4 } as const;
/** The janitor's card: he thinks you said the heating's fixed. */
export const JANITOR_VALUE = 97;

export const rowY = (r: number) => 372 + Math.pow(r / (ROWS - 1), 1.2) * 680;
const rowR = (r: number) => 9 + 19 * (r / (ROWS - 1));
export function seatAt(r: number, c: number) {
  const step = 66;
  return { x: 590 + c * step + (r % 2 ? step / 2 : 0) + (noise(r * 31 + c) - 0.5) * 10, y: rowY(r), r: rowR(r) };
}
/** Each seat's card value: grey zeros, a few pale teal, the red row. */
export function seatValue(r: number, c: number) {
  if (r === RED_ROW) return -Math.round(12 + noise(c + 5) * 40);
  const n = noise(r * 97 + c * 13);
  return n < 0.06 ? Math.round(5 + noise(c + r) * 20) : 0;
}

/** The hall: the far wall, the floor, the stage and its curtain. Behind everyone. */
export const HallBack: React.FC = () => (
  <g>
    <rect x={-800} y={-600} width={3800} height={940} fill="#d8c9a8" />
    <rect x={-800} y={300} width={3800} height={50} fill="#a58a62" />
    <rect x={-800} y={340} width={3800} height={1200} fill="#8f6c48" />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-800} y1={360 + i * 60} x2={3000} y2={360 + i * 60} stroke="#000" strokeWidth={3} opacity={0.08} />)}
    {/* the far wall: a clock, the EXIT sign over the doors, a banner bar, the radiator */}
    <circle cx={1250} cy={160} r={44} fill={PAPER} stroke={INK} strokeWidth={6} />
    <path d="M1250 160 V128 M1250 160 L1272 172" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <rect x={1700} y={110} width={240} height={190} rx={6} fill="#6e4b30" stroke={INK} strokeWidth={5} />
    <line x1={1820} y1={110} x2={1820} y2={300} stroke={INK} strokeWidth={5} />
    <rect x={1760} y={58} width={120} height={40} rx={6} fill="#2f8f5a" stroke={INK} strokeWidth={4} />
    <text x={1820} y={88} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={PAPER}>EXIT</text>
    <rect x={700} y={60} width={420} height={70} rx={8} fill="#2f6f8f" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((i) => <rect key={i} x={740 + i * 120} y={86} width={90} height={18} rx={9} fill={PAPER} opacity={0.8} />)}
    <g transform="translate(2120 300)">
      <rect x={-10} y={-90} width={150} height={90} rx={8} fill="#eef1f4" stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={8 + i * 22} y1={-80} x2={8 + i * 22} y2={-10} stroke={INK} strokeWidth={4} opacity={0.5} />)}
    </g>
    {/* the stage: curtain, boards, front */}
    <rect x={-800} y={-600} width={1320} height={1240} fill="#9b2b3a" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-760 + i * 110} y1={-600} x2={-760 + i * 110} y2={640} stroke="#000" strokeWidth={10} opacity={0.15} />)}
    <rect x={-800} y={-600} width={1320} height={90} fill="#7d1f2c" />
    <rect x={-800} y={STAGE.top} width={STAGE.front + 800} height={22} fill="#b78a5a" stroke={INK} strokeWidth={5} />
    <rect x={-800} y={STAGE.top + 22} width={STAGE.front + 800} height={500} fill="#6e4b30" stroke={INK} strokeWidth={5} />
  </g>
);

/** The microphone on its stand, at the stage's edge. */
export const Mic: React.FC = () => (
  <g>
    <path d={`M${MIC.x - 30} ${STAGE.top} h60`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <line x1={MIC.x} y1={STAGE.top} x2={MIC.x} y2={470} stroke="#3b3e47" strokeWidth={8} />
    <line x1={MIC.x} y1={470} x2={MIC.x - 30} y2={450} stroke="#3b3e47" strokeWidth={7} />
    <rect x={MIC.x - 58} y={436} width={34} height={22} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={4} transform={`rotate(-30 ${MIC.x - 40} 447)`} />
  </g>
);

/** You crossing the stage to the microphone (from `from` to `at`), then the letter up. */
export function youOnStage(frame: number, from: number, at: number, raise: number) {
  const p = linear(frame, from, at);
  const x = mix(60, YOU_SPOT.x, p);
  const up = linear(frame, raise, raise + 10);
  const pose: Pose = p > 0 && p < 1 ? walkPose(frame * 0.3) : { ...STAND, armF: [mix(30, 100, up), mix(60, 30, up)] };
  return { x, pose, head: headAt(x, YOU_SPOT.y, YOU_SPOT.scale, pose, 1) };
}

export const OnStage: React.FC<{ frame: number; you: ReturnType<typeof youOnStage>; face: object }> = ({ frame, you, face }) => {
  const kPose: Pose = { ...STAND, armF: [60, 50] };
  return (
    <g>
      <Figure {...KANG} x={120} y={YOU_SPOT.y} scale={YOU_SPOT.scale} facing={1} pose={kPose} brows="none" lids={0.3} mouth="smile" eyes={1}
        look={{ x: 1, y: 0 }} blink={blinking(frame, 6)} time={frame} />
      <Glasses x={120} y={YOU_SPOT.y} scale={YOU_SPOT.scale} pose={kPose} facing={1} />
      <Figure {...HERO} x={you.x} y={YOU_SPOT.y} scale={YOU_SPOT.scale} facing={1} pose={you.pose} {...face} blink={blinking(frame, 1)} time={frame}
        held={<Letter x={4} y={8} scale={0.55} tilt={-4} />} />
      <Mic />
    </g>
  );
};

/** Five hundred seated heads, back row first; each with its card from `wave` (rolling back from the front rows). */
export const Audience: React.FC<{ frame: number; wave: number; until: number; turn: number }> = ({ frame, wave, until, turn }) => (
  <g>
    {Array.from({ length: ROWS }, (_, r) => (
      <g key={r}>
        {Array.from({ length: PER_ROW }, (_, c) => {
          const s = seatAt(r, c);
          const at = wave + (ROWS - 1 - r) * 2.4 + Math.floor(noise(r * 7 + c) * 5);
          return (
            <g key={c}>
              <rect x={s.x - s.r * 1.3} y={s.y + s.r * 0.7} width={s.r * 2.6} height={s.r * 2.2} rx={s.r * 0.8} fill={["#2a2d36", "#3b4a6b", "#4a3f63"][(r + c) % 3]} />
              <g transform={`translate(${s.x} ${s.y}) rotate(${(noise(c + r * 3) - 0.5) * 10 * turn}) translate(${-s.x} ${-s.y})`}>
                <HeadIcon x={s.x} y={s.y} r={s.r} color={PASTELS[(r * 5 + c * 3) % PASTELS.length]} />
              </g>
              <Meter frame={frame} at={at} x={s.x} headY={s.y} r={s.r} value={seatValue(r, c)} until={until} scale={0.85} tilt={(noise(c * 3 + r) - 0.5) * 8} />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

/** The janitor at the very back: grey overalls, a cap, the mop in his back hand; `thumbs` 0..1 raises a thumb. */
export const Janitor: React.FC<{ frame: number; at: number; until: number; thumbs: number }> = ({ frame, at, until, thumbs }) => {
  const { x, y, scale } = JANITOR;
  const pose: Pose = { ...STAND, armB: [20, 10], armF: [mix(10, 80, thumbs), mix(10, 95, thumbs)] };
  const h = headAt(x, y, scale, pose, -1);
  return (
    <g>
      {/* the mop: a stick from his back hand to the floor, the grey head on the floor */}
      <line x1={x + 34 * scale} y1={y - 160 * scale} x2={x + 70 * scale} y2={y + 6} stroke="#8a5c3b" strokeWidth={10 * scale} strokeLinecap="round" />
      <path d={`M${x + 40 * scale} ${y + 6} q30 ${-20 * scale} ${60 * scale} 0 l6 ${10 * scale} h${-72 * scale}z`} fill="#c9ccd2" stroke={INK} strokeWidth={4 * scale} />
      <Figure head="#d9c26a" coat="#6b7f8a" cap="#2f4a4a" x={x} y={y} scale={scale} facing={-1} pose={pose}
        brows="raised" lids={0} mouth={thumbs > 0.3 ? "smile" : "open"} eyes={1.1} look={{ x: 1, y: 0 }} blink={blinking(frame, 4)} time={frame}
        held={thumbs > 0.3 ? (
          <g transform="rotate(-10)">
            <rect x={-12} y={-12} width={24} height={22} rx={8} fill="#d9c26a" stroke={INK} strokeWidth={4} />
            <rect x={-6} y={-34} width={11} height={26} rx={5} fill="#d9c26a" stroke={INK} strokeWidth={4} />
          </g>
        ) : undefined} />
      <Meter frame={frame} at={at} x={h.x} headY={h.y} r={h.r} value={JANITOR_VALUE} until={until} scale={1.1} />
    </g>
  );
};
