// The Rule's flagged limit (v7, line 8): "You bring back only what's in your head. No things, no news. And once
// you're in, you stay till the alarm." A paper sheet (screen pixels, inside an Overlay): the inside town in a paper
// circle at the left; a paper you walks out of it towards a pod hatch at the right, a suitcase in one hand and a
// rolled newspaper under the other arm. At the hatch lip the suitcase and the paper turn to ash and blow away and the
// body fades; only your head crosses into the hatch, glowing. Then a drawn bolt slides across the hatch from the inside
// and an alarm clock is stamped beside it, and rattles on "Remember that".
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { walkPose, STAND, joints, dir, LIMB } from "@whatif/kit/rig/pose";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { TownBack } from "../sets/InsideTown";
import { REF } from "../sets/common";
import { HERO, linear, mix, noise, ramp } from "../shared";

const GROUND = 640;
const INSET = { x: 290, y: 400, r: 230 };
const HATCH = { x: 930, y: 250, w: 340, h: 390 };
const LIP = HATCH.x - 30;
const S = 1.25;

export interface LimitTimes { walk: number; ash: number; bolt: number; alarm: number; remember: number }

/** The limit sheet, from `at` until `until`, timed by `t`. */
export const LimitSheet: React.FC<{ frame: number; at: number; until: number; t: LimitTimes }> = ({ frame, at: from, until, t }) => {
  const p = ramp(frame, t.walk, t.ash);
  const x = mix(INSET.x + 40, LIP, p);
  const walking = frame < t.ash;
  const pose = walking ? walkPose(frame * 0.3) : { ...STAND, armF: [30, 20] as [number, number], armB: [-10, 20] as [number, number] };
  const j = joints(pose);
  const head = { x: x + j.head.x * S, y: GROUND + j.head.y * S };
  const backHand = (() => {
    const sh = { x: x + j.shoulder.x * S, y: GROUND + j.shoulder.y * S };
    const a = dir(pose.armB[0]), b = dir(pose.armB[0] + pose.armB[1]);
    return { x: sh.x + (a.x + b.x) * LIMB * S, y: sh.y + (a.y + b.y) * LIMB * S };
  })();
  const burn = linear(frame, t.ash, t.ash + 18);
  const fade = 1 - ramp(frame, t.ash + 6, t.ash + 22);
  const cross = ramp(frame, t.ash + 14, t.ash + 40);
  const glowHead = { x: mix(head.x, HATCH.x + HATCH.w * 0.45, cross), y: mix(head.y, HATCH.y + HATCH.h * 0.7, cross) - Math.sin(cross * Math.PI) * 60 };
  const bolt = ramp(frame, t.bolt, t.bolt + 10);
  const stamp = interpolate(frame, [t.alarm, t.alarm + 7], [1.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rattle = frame >= t.remember && frame < t.remember + 26 ? Math.sin(frame * 2.2) * 6 : 0;
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={540} w={1480} h={780} tilt={-1}>
      <defs>
        <clipPath id="limit-inset"><circle cx={INSET.x} cy={INSET.y} r={INSET.r} /></clipPath>
        <radialGradient id="limit-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff2b0" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffd25a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* the inside town in its circle */}
      <g clipPath="url(#limit-inset)">
        <g transform={`translate(${INSET.x - 960 * 0.42} ${INSET.y - 560 * 0.42}) scale(0.42)`}><TownBack cam={REF} frame={frame} /></g>
      </g>
      <circle cx={INSET.x} cy={INSET.y} r={INSET.r} fill="none" stroke={INK} strokeWidth={6} />
      <line x1={40} y1={GROUND} x2={1440} y2={GROUND} stroke={INK} strokeWidth={5} opacity={0.6} />
      {/* the hatch: a rounded frame, dark inside, a lamp and a pillow; the lip at its left */}
      <rect x={HATCH.x} y={HATCH.y} width={HATCH.w} height={HATCH.h} rx={40} fill="#2c3350" stroke={INK} strokeWidth={8} />
      <rect x={HATCH.x + 22} y={HATCH.y + 22} width={HATCH.w - 44} height={HATCH.h - 44} rx={28} fill="#0d1020" />
      <rect x={HATCH.x + 60} y={HATCH.y + 36} width={90} height={20} rx={8} fill="#ffc46b" />
      <path d={`M${HATCH.x + 40} ${HATCH.y + HATCH.h - 40} q10 -50 90 -44 l40 44 Z`} fill="#cfd3e6" />
      <rect x={LIP} y={GROUND - 26} width={60} height={26} rx={6} fill="#47507a" stroke={INK} strokeWidth={4} />
      {/* the bolt, sliding across from the inside */}
      {frame >= t.bolt && (
        <g>
          <rect x={HATCH.x + HATCH.w - 70} y={HATCH.y + 150} width={44} height={70} rx={8} fill="#8d93a8" stroke={INK} strokeWidth={5} />
          <rect x={mix(HATCH.x + HATCH.w - 60, HATCH.x + 60, bolt)} y={HATCH.y + 172} width={HATCH.w - 120} height={26} rx={10} fill="#b8bdd0" stroke={INK} strokeWidth={5} />
          <rect x={HATCH.x + 34} y={HATCH.y + 160} width={40} height={50} rx={8} fill="#8d93a8" stroke={INK} strokeWidth={5} />
        </g>
      )}
      {/* the alarm clock, stamped beside the hatch */}
      {frame >= t.alarm && (
        <g transform={`translate(${HATCH.x + HATCH.w + 110 + rattle} ${HATCH.y + 210}) scale(${stamp}) rotate(${rattle})`}>
          {[-1, 1].map((sd) => <circle key={sd} cx={sd * 52} cy={-66} r={26} fill={MUSTARD} stroke={INK} strokeWidth={5} />)}
          <line x1={-40} y1={70} x2={-60} y2={100} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <line x1={40} y1={70} x2={60} y2={100} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <circle r={84} fill={PAPER} stroke={INK} strokeWidth={8} />
          <line x1={0} y1={0} x2={0} y2={-56} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={38} y2={14} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          {rattle !== 0 && [0, 1, 2].map((k) => <line key={k} x1={-120 - k * 10} y1={-80 + k * 50} x2={-150 - k * 10} y2={-90 + k * 50} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
        </g>
      )}
      {/* the paper you: walking out of the town with your things, fading at the lip */}
      <g opacity={fade}>
        <Figure x={x} y={GROUND} scale={S} facing={1} pose={pose} head={HERO.head} scarf={HERO.scarf} tuft flow={0.3} time={frame / 30}
          brows="raised" mouth="smile" look={{ x: 0.8, y: 0 }} lids={0}
          held={burn < 1 ? <g opacity={1 - burn}><rect x={-34} y={0} width={68} height={52} rx={8} fill="#a8582e" stroke={INK} strokeWidth={4} /><rect x={-12} y={-10} width={24} height={12} rx={5} fill="none" stroke={INK} strokeWidth={4} /></g> : undefined} />
        {burn < 1 && (
          <g opacity={1 - burn} transform={`translate(${backHand.x} ${backHand.y}) rotate(-30)`}>
            <rect x={-12} y={-50} width={24} height={100} rx={10} fill={PAPER} stroke={INK} strokeWidth={4} />
            {[0, 1, 2].map((k) => <line key={k} x1={-6} y1={-30 + k * 22} x2={6} y2={-30 + k * 22} stroke={INK} strokeWidth={3} />)}
          </g>
        )}
      </g>
      {/* ash: flakes off the suitcase and the paper, blowing up and away */}
      {frame >= t.ash && frame < t.ash + 50 && Array.from({ length: 26 }, (_, i) => {
        const q = linear(frame, t.ash + noise(i) * 8, t.ash + 40 + noise(i + 3) * 10);
        return <rect key={i} x={x + 30 + noise(i + 7) * 60 + q * (120 + noise(i + 1) * 200)} y={GROUND - 120 + noise(i + 2) * 80 - q * (160 + noise(i + 4) * 160)}
          width={10} height={7} fill={i % 3 ? "#5a5650" : "#2b2a28"} opacity={1 - q} transform={`rotate(${q * 300 + i * 30} ${x + 30} ${GROUND - 100})`} />;
      })}
      {/* only your head crosses, glowing */}
      {frame >= t.ash + 6 && (
        <g>
          <circle cx={glowHead.x} cy={glowHead.y} r={130} fill="url(#limit-glow)" />
          <circle cx={glowHead.x} cy={glowHead.y} r={46 * S} fill={HERO.head} stroke={INK} strokeWidth={4} />
          <path d={`M${glowHead.x - 11} ${glowHead.y - 52} q-6 -30 16 -36 q-8 16 8 20`} fill={INK} />
          <ellipse cx={glowHead.x - 8} cy={glowHead.y - 6} rx={8} ry={12} fill={INK} />
          <ellipse cx={glowHead.x + 24} cy={glowHead.y - 6} rx={8} ry={12} fill={INK} />
          <path d={`M${glowHead.x - 4} ${glowHead.y + 22} q14 14 30 0`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
    </Sheet>
  );
};
