// The Notebook's papers and its lane picture, rebuilt on the outside review of v4.1 ("convert abstract diagrams into
// paper-cut actions using the actual cast"):
//   83  two kinds of envy, as actions: your best friend climbing paper steps toward the one ahead; on the other side a
//       hand comes up from below and pulls a figure off a ledge.
//   85  the brain-scan finding, brief: one head, two patches of activity, envy's and pain's, overlapping in one region;
//       never an equals sign.
//   87  "hurt needs a lane": your classroom cluster in one pool of light around you (your best friend, the classmate, the
//       rival, your maths teacher); your sister's portrait outside it in the dark, going darker on "Outside yours,
//       nobody bleeds."
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { Glasses, Ponytail, Sheet, Vest } from "../parts";
import { blinking, HERO, JIYOON, KANG, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { HeadIcon } from "./WhosCrimson.Common";

const clamp01 = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ------------------------------------------------------------------------------------------------ 83 two kinds of envy

const BASE = 520;
const STEP_W = 112, STEP_H = 60;
const stepTop = (i: number) => BASE - STEP_H * (i + 1);
const stepMid = (i: number) => 70 + i * STEP_W + STEP_W / 2;
const FS = 0.7;

/** Where your best friend stands as he climbs (`p` 0..2, one step per unit), with a small hop between steps. */
function climber(p: number) {
  const i = Math.min(2, Math.floor(p));
  const f = p - i;
  const x = f > 0 && i < 2 ? mix(stepMid(i), stepMid(i + 1), f) : stepMid(i);
  const y = f > 0 && i < 2 ? mix(stepTop(i), stepTop(i + 1), f) - Math.sin(Math.PI * f) * 30 : stepTop(i);
  return { x, y, moving: f > 0.02 && f < 0.98 && i < 2 };
}

/** The sheet, w 1120 by h 600. `k`: up (he climbs from here), down2 (the hand pulls from here). */
export const KindsSheet: React.FC<{ frame: number; at: number; up: number; down2: number; y?: number }> = ({ frame, at, up, down2, y = 470 }) => {
  const climb = ramp(frame, up + 4, up + 34) + ramp(frame, up + 44, up + 74);
  const me = climber(climb);
  const mPose: Pose = me.moving ? walkPose(frame * 0.35) : { ...STAND, armF: [60, 40], armB: [-20, 20] };
  // the other side: the hand reaches up to the ankle, then pulls; the figure tips and drops below the ledge
  const reach = ramp(frame, down2 - 14, down2 + 2);
  const pull = ramp(frame, down2 + 8, down2 + 26);
  const LEDGE = 300, FX = 880;
  const ankle = { x: FX + 6, y: LEDGE - 6 };
  const hand = { x: ankle.x, y: mix(600, ankle.y, reach) + pull * 170 };
  const fy = LEDGE + pull * 170;
  const tip = pull * -38;
  const startShoulder = { x: 740, y: 590 };
  return (
    <Sheet frame={frame} at={at} x={960} y={y} w={1120} h={600}>
      {/* the paper steps, each a cut block with a shadow */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={70 + i * STEP_W + 6} y={stepTop(i) + 6} width={STEP_W} height={BASE - stepTop(i)} fill="#000" opacity={0.12} />
          <rect x={70 + i * STEP_W} y={stepTop(i)} width={STEP_W} height={BASE - stepTop(i)} fill="#efe3cc" stroke={INK} strokeWidth={5} />
        </g>
      ))}
      {/* the one ahead, on the top step, and your best friend climbing after */}
      <Figure x={stepMid(3)} y={stepTop(3)} scale={FS} facing={-1} head={PASTELS[4]} coat="#2a2d36" brows="none" mouth="smile" look={{ x: 0.8, y: 0.3 }} time={frame} />
      <Figure x={me.x} y={me.y} scale={FS} facing={1} pose={mPose} head={MINJUN.head} coat={MINJUN.coat} brows="flat" mouth="flat" eyes={1}
        look={{ x: 0.9, y: -0.4 }} blink={blinking(frame, 2)} time={frame} />
      <line x1={560} y1={40} x2={560} y2={560} stroke="#cdbfa6" strokeWidth={5} strokeDasharray="18 16" />
      {/* the ledge, the figure on it, and the hand from below */}
      <line x1={690} y1={LEDGE} x2={1050} y2={LEDGE} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <g transform={`rotate(${tip} ${FX} ${fy})`}>
        <Figure x={FX} y={fy} scale={FS} facing={-1} pose={pull > 0 ? { ...STAND, armF: [150, 20], armB: [-150, -20] } : STAND} head={PASTELS[4]} coat="#2a2d36"
          brows={pull > 0 ? "raised" : "none"} mouth={pull > 0 ? "o" : "flat"} eyes={1} look={{ x: 0.3, y: pull > 0 ? 0.9 : 0.2 }} time={frame} />
      </g>
      {reach > 0 && (
        <g>
          <path d={`M${startShoulder.x} ${startShoulder.y} Q${mix(startShoulder.x, hand.x, 0.5) - 40} ${mix(startShoulder.y, hand.y, 0.5)} ${hand.x} ${hand.y + 30}`}
            fill="none" stroke="#3b3e47" strokeWidth={30} strokeLinecap="round" />
          <g transform={`translate(${hand.x} ${hand.y + 18})`}>
            <rect x={-20} y={-6} width={40} height={36} rx={14} fill="#5a5f6b" stroke={INK} strokeWidth={4} />
            <path d="M-18 -2 q-4 -16 10 -18 M18 -2 q4 -16 -10 -18" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
        </g>
      )}
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ 85 the brain scan

/** One head in profile, the brain drawn in; envy's patch (amber) lights first, then pain's (crimson), and where they
 *  overlap glows. Beside it: a peer a step above you (envy) and a thorn (pain), each with a dotted lead to its patch. */
export const BrainSheet: React.FC<{ frame: number; at: number; envy: number; pain: number }> = ({ frame, at, envy, pain }) => {
  const e = clamp01(frame, envy, envy + 14);
  const p = clamp01(frame, pain, pain + 14);
  const both = Math.min(e, p);
  const cx = 560, cy = 330;
  const A = { x: cx - 30, y: cy - 40, r: 76 };
  const B = { x: cx + 50, y: cy - 30, r: 76 };
  const throb = 1 + 0.05 * Math.sin(frame / 5);
  return (
    <Sheet frame={frame} at={at} x={960} y={500} w={1120} h={620} tilt={1.5}>
      <defs>
        <clipPath id="nb-envy"><circle cx={A.x} cy={A.y} r={A.r} /></clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={200} fill="#f0d9c2" stroke={INK} strokeWidth={7} />
      <circle cx={cx + 150} cy={cy + 20} r={12} fill={INK} />
      <path d={`M${cx - 150} ${cy + 20} q-14 -100 70 -130 q44 -70 130 -28 q86 -26 116 56 q56 44 0 112 q-28 56 -116 28 q-56 42 -130 0 q-86 14 -70 -38z`}
        fill="#e6b0a8" stroke={INK} strokeWidth={6} />
      <path d={`M${cx - 60} ${cy - 100} q14 56 -14 100 M${cx + 50} ${cy - 110} q-28 70 14 126`} fill="none" stroke={INK} strokeWidth={4} opacity={0.4} />
      <circle cx={A.x} cy={A.y} r={A.r * mix(0.6, 1, e)} fill={MUSTARD} opacity={0.55 * e} />
      <circle cx={B.x} cy={B.y} r={B.r * mix(0.6, 1, p)} fill={CRIMSON} opacity={0.45 * p} />
      <g clipPath="url(#nb-envy)" opacity={both}>
        <circle cx={B.x} cy={B.y} r={B.r * throb} fill={CRIMSON} opacity={0.6} />
      </g>
      {/* envy: a peer a step above you */}
      <g transform="translate(160 270) scale(1.5) translate(-160 -270)">
        <path d="M80 300 H160 V240 H240" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <HeadIcon x={120} y={270} r={24} color={HERO.head} tuft mouth="flat" />
        <HeadIcon x={205} y={210} r={24} color={PASTELS[4]} mouth="smile" />
      </g>
      <path d={`M290 260 Q360 250 ${A.x - A.r + 4} ${A.y}`} fill="none" stroke={MUSTARD} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={e} />
      {/* pain: a thorn in a finger */}
      <g transform="translate(960 250) scale(1.6)" opacity={mix(0.5, 1, p)}>
        <rect x={-22} y={-10} width={44} height={110} rx={22} fill="#f0d9c2" stroke={INK} strokeWidth={5} />
        <path d="M-50 10 L4 22 L-50 32Z" fill={INK} />
        <path d="M24 -26 l-18 18 l14 4 l-18 20" fill="none" stroke={CRIMSON} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      </g>
      <path d={`M900 290 Q780 300 ${B.x + B.r - 4} ${B.y}`} fill="none" stroke={CRIMSON} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={p} />
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ 87 one lane

const CLUSTER_Y = 1000;
const CS = 1.25;
/** Your classroom cluster, left to right: your maths teacher behind, the classmate, your best friend, you, the rival. */
const CLUSTER = [
  { x: 1000, y: CLUSTER_Y - 60, s: CS * 0.92, ...KANG, kang: true, facing: 1 as const },
  { x: 1090, y: CLUSTER_Y, s: CS, head: PASTELS[2], coat: "#5a6488", facing: 1 as const },
  { x: 1300, y: CLUSTER_Y, s: CS, ...MINJUN, facing: 1 as const },
  { x: 1560, y: CLUSTER_Y, s: CS, ...TAEHO, facing: -1 as const },
  { x: 1720, y: CLUSTER_Y - 60, s: CS * 0.92, head: PASTELS[5], coat: "#4a3f63", facing: -1 as const },
];
const YOU = { x: 1430, y: CLUSTER_Y + 10 };
const SIS = { x: 330, y: CLUSTER_Y - 20 };

/** "Problem two: hurt needs a lane. Outside yours, nobody bleeds.": the cluster lit around you; your sister's
 *  portrait outside the light, darker still on `dim`. The camera opens on the cluster and drifts left to find her. */
export const ClusterShot: React.FC<{ frame: number; from: number; dim: number; to: number }> = ({ frame, from, dim, to }) => {
  const reveal = ramp(frame, dim - 30, dim + 10);
  const cam: Camera = { x: mix(1360, 1010, reveal) + Math.sin(frame / 60) * 6, y: mix(640, 610, reveal), zoom: mix(1.55, 0.98, reveal) + 0.02 * (frame - from) / Math.max(1, to - from) };
  const out = 1 - 0.6 * ramp(frame, dim, dim + 30);
  const pool = 0.9 + 0.1 * Math.sin(frame / 20);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={
      <g>
        <defs>
          <radialGradient id="nb-pool">
            <stop offset="0%" stopColor="#ffd98a" stopOpacity={0.55 * pool} />
            <stop offset="65%" stopColor="#ffb85a" stopOpacity={0.22 * pool} />
            <stop offset="100%" stopColor="#ffb85a" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-1400} y={-800} width={4800} height={2600} fill="#14151c" />
        <ellipse cx={1360} cy={760} rx={560} ry={440} fill="url(#nb-pool)" />
        <ellipse cx={1360} cy={CLUSTER_Y + 10} rx={480} ry={60} fill="#ffd98a" opacity={0.14} />
      </g>
    } actors={
      <>
        {/* your sister outside the light: hair tied back, the orange vest, looking off; darkened */}
        <g opacity={mix(0.6, 0.32, 1 - out)}>
          <Ponytail x={SIS.x} y={SIS.y} scale={CS} pose={STAND} />
          <Figure x={SIS.x} y={SIS.y} scale={CS} facing={1} head={JIYOON.head} coat={JIYOON.coat} brows="flat" lids={0.4} mouth="flat" eyes={1}
            look={{ x: -0.3, y: 0.5 }} blink={blinking(frame, 6)} time={frame} />
          <Vest x={SIS.x} y={SIS.y} scale={CS} pose={STAND} />
        </g>
        {CLUSTER.map((c, i) => (
          <g key={i}>
            <Figure x={c.x} y={c.y} scale={c.s} facing={c.facing} head={c.head} coat={c.coat} brows="none" lids={0.2} mouth="flat" eyes={1}
              look={{ x: 0.7, y: 0.1 }} blink={blinking(frame, i + 3)} time={frame} />
            {"kang" in c && <Glasses x={c.x} y={c.y} scale={c.s} pose={STAND} facing={c.facing} />}
          </g>
        ))}
        <Figure {...HERO} x={YOU.x} y={YOU.y} scale={CS} facing={1} brows="sad" lids={0.3} mouth="flat" eyes={1} look={{ x: mix(0.6, -0.9, reveal), y: 0.15 }}
          blink={blinking(frame, 1)} time={frame} />
      </>
    } />
  );
};
