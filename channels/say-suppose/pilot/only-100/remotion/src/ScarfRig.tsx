// "You" (B · Scarf) as a jointed puppet: two-bone arms, head on a neck pivot, eased eyes and brows, a scarf tail
// that lags the body. Same design and 200 x 300 box as Scarf2D, feet at y ~290. No mouth.
import React from 'react';
import {limb} from './rig';

export type Arm = {a: number; f: number};
export type ScarfPose = {
  t: number;
  lean: number; // body degrees around the feet, + = toward screen right
  headTilt: number; // degrees around the neck
  open: number; // eye size multiplier
  lid: number; // 0 open .. 1 closed
  pupil: [number, number]; // -1..1, y + = down
  browLift: number;
  browSad: number; // + = inner ends up (worried)
  armL: Arm;
  armR: Arm;
  tail: number; // degrees of scarf-tail swing
  sweat: number; // 0..1
};

const HEAD = '#14141c', COAT = '#3a3f4b', COAT_D = '#2a2e37', GREEN = '#2fbf71', GREEN_D = '#1f8f52';

export const ScarfRig: React.FC<ScarfPose> = (p) => {
  const breathe = Math.sin(p.t * 2.1) * 0.012;
  const L = limb(72, 150, p.armL.a, p.armL.f, 36, 34, -1);
  const R = limb(128, 150, p.armR.a, p.armR.f, 36, 34, 1);
  const er = 11 * p.open;
  const lidH = er * 2 * p.lid;
  const px = p.pupil[0] * er * 0.42, py = p.pupil[1] * er * 0.42;
  const pr = Math.max(3, 5.2 - (p.open - 1) * 6);
  const eye = (cx: number) => (
    <g>
      <circle cx={cx} cy={84} r={er} fill="#fff" />
      <circle cx={cx + px} cy={84 + py} r={pr} fill={HEAD} />
      {p.lid > 0.02 && <rect x={cx - er - 1} y={84 - er - 1} width={er * 2 + 2} height={lidH + 1} fill={HEAD} />}
      {p.lid > 0.6 && <line x1={cx - er + 1} y1={84 + er * (2 * p.lid - 1)} x2={cx + er - 1} y2={84 + er * (2 * p.lid - 1)} stroke="#fff" strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
  return (
    <g transform={`rotate(${p.lean} 100 290)`}>
      <path d="M90 228 L87 292 M110 228 L114 292" stroke={HEAD} strokeWidth={7} strokeLinecap="round" />
      <g transform={`translate(100 232) scale(1 ${1 + breathe}) translate(-100 -232)`}>
        {/* back arm first so the torso overlaps the shoulder joint */}
        <path d={L.d} stroke={COAT_D} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={L.hx} cy={L.hy} r={8} fill={HEAD} />
        <path d="M70 138 Q100 128 130 138 L134 232 Q100 242 66 232 Z" fill={COAT} />
        <path d="M100 140 L100 232" stroke={COAT_D} strokeWidth={2} />
        <circle cx={96} cy={172} r={2.5} fill={COAT_D} />
        <circle cx={96} cy={198} r={2.5} fill={COAT_D} />
        <path d={R.d} stroke={COAT_D} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={R.hx} cy={R.hy} r={8} fill={HEAD} />
        {/* scarf tail hangs from the knot and swings with p.tail */}
        <g transform={`rotate(${p.tail} 124 142)`}>
          <path d="M118 138 Q132 162 128 196 L144 194 Q146 160 130 136 Z" fill={GREEN} />
          <path d="M128 196 L144 194" stroke={GREEN_D} strokeWidth={3} />
        </g>
        <g transform={`rotate(${p.headTilt} 100 132)`}>
          <path d="M66 128 Q100 146 134 128 L136 142 Q100 160 64 142 Z" fill={GREEN} />
          <circle cx={100} cy={82} r={50} fill={HEAD} />
          <path d="M138 58 A50 50 0 0 1 143 108" stroke="rgba(255,206,150,.6)" strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={80} cy={56} rx={12} ry={7} fill="rgba(255,255,255,.10)" transform="rotate(-25 80 56)" />
          {eye(81)}
          {eye(119)}
          <g stroke="#f4f1ea" strokeWidth={3.5} strokeLinecap="round">
            <line x1={72} y1={62 - p.browLift + p.browSad} x2={90} y2={62 - p.browLift - p.browSad} />
            <line x1={110} y1={62 - p.browLift - p.browSad} x2={128} y2={62 - p.browLift + p.browSad} />
          </g>
          {p.sweat > 0.01 && (
            <path d={`M146 ${56 + p.sweat * 6} q6 10 0 14 q-6 -4 0 -14z`} fill="#8fd3ff" stroke="#fff" strokeWidth={1.5} opacity={p.sweat} />
          )}
        </g>
      </g>
    </g>
  );
};
