// The rice-ball man as a jointed puppet (box 260 x 520, feet at 500). Knees bend on the walk, the free arm swings
// against the legs, the body bobs twice a stride, and the onigiri arm is posed by keys from the scene.
import React from 'react';
import {limb} from './rig';

export type ManPose = {
  t: number;
  phase: number; // walk cycle, radians
  walk: number; // 0 standing .. 1 full stride
  lean: number; // body degrees around the feet
  headTilt: number;
  headDip: number; // px, + = down (bites, chewing)
  pupil: [number, number]; // -1..1, y + = down
  lid: number;
  rice: {a: number; f: number}; // screen-left arm (holds the onigiri)
};

const SKIN = '#e0ac85', SUIT = '#4a4f63', SUIT_D = '#3b3f50', PANTS = '#22263a', HAIR = '#1b1b22';

export const ManRig: React.FC<ManPose> = (p) => {
  const w = p.walk;
  const ph = p.phase;
  const legA = (o: number) => Math.sin(ph + o) * 20 * w;
  const legF = (o: number) => legA(o) - Math.max(0, Math.sin(ph + o + 1.3)) * 38 * w;
  const L1 = limb(114, 330, legA(0), legF(0), 88, 86, -1);
  const L2 = limb(146, 330, legA(Math.PI), legF(Math.PI), 88, 86, -1);
  const bob = (Math.abs(Math.sin(ph)) * 7 - 3.5) * w;
  const sway = Math.sin(ph) * 1.6 * w;
  const freeA = 6 - Math.sin(ph) * 16 * w;
  const free = limb(178, 200, freeA, freeA + 10 + 8 * w, 70, 66, 1);
  const rice = limb(82, 200, p.rice.a, p.rice.f, 70, 72, -1);
  const pupX = p.pupil[0] * 5, pupY = p.pupil[1] * 5;
  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx + pupX} cy={114 + pupY} rx={5} ry={6 * (1 - p.lid) + 0.6} fill="#1b1b22" />
    </g>
  );
  return (
    <g transform={`rotate(${p.lean} 130 500)`}>
      <path d={L2.d} stroke={PANTS} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
      <path d={L1.d} stroke={PANTS} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g transform={`translate(0 ${-bob}) rotate(${sway} 130 330)`}>
        <path d={free.d} stroke={SUIT_D} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={free.hx} cy={free.hy} r={13} fill={SKIN} />
        <rect x={78} y={170} width={104} height={176} rx={34} fill={SUIT} />
        <path d="M130 172 L114 230 L130 300 L146 230 Z" fill="#e8e8ee" />
        <path d="M130 186 L124 250 L130 290 L136 250 Z" fill="#6b2f3a" />
        <g transform={`translate(0 ${p.headDip}) rotate(${p.headTilt} 130 168)`}>
          <rect x={116} y={150} width={28} height={26} fill={SKIN} />
          <circle cx={130} cy={108} r={62} fill={SKIN} />
          <path d="M68 102 Q70 38 130 40 Q192 40 192 98 Q170 72 130 74 Q92 74 68 102Z" fill={HAIR} />
          {eye(109)}
          {eye(151)}
          <path d="M98 98 L120 101 M140 101 L162 98" stroke="#3a2a22" strokeWidth={4} strokeLinecap="round" />
          <path d="M100 128 Q110 132 120 128 M140 128 Q150 132 160 128" stroke="rgba(120,70,50,.4)" strokeWidth={3} fill="none" />
        </g>
        <path d={rice.d} stroke={SUIT_D} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform={`translate(${rice.hx - 27} ${rice.hy - 52})`}>
          <path d="M27 0 L55 44 Q57 50 49 50 L5 50 Q-3 50 1 44 Z" fill="#f6f3ea" stroke="#d9d3c4" strokeWidth={2} />
          <rect x={15} y={30} width={26} height={20} fill="#1f2a1f" />
        </g>
        <circle cx={rice.hx} cy={rice.hy} r={13} fill={SKIN} />
      </g>
    </g>
  );
};
