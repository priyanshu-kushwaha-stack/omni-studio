// Commuters and the rice-ball man, 2D. Humans get skin-tone heads with hair and dot eyes so "you" stays the only
// black round head. No mouths anywhere (L8).
import React from 'react';

const SKIN = ['#f1c9a5', '#e0ac85', '#c98d66', '#f5d6bd', '#a8714d'];
const HAIR = ['#1b1b22', '#2a1f1a', '#3b2b22', '#111', '#4a3a30'];
const SUIT = ['#2b3247', '#3a4157', '#4a4f63', '#23283a', '#55596b', '#3d3a4a'];

const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// One walking commuter in a 160 x 320 box, feet at y 300. phase drives the leg swing.
export const Commuter: React.FC<{i: number; phase: number; facing: 1 | -1}> = ({i, phase, facing}) => {
  const skin = SKIN[Math.floor(rnd(i, 1) * SKIN.length)];
  const hair = HAIR[Math.floor(rnd(i, 2) * HAIR.length)];
  const suit = SUIT[Math.floor(rnd(i, 3) * SUIT.length)];
  const tall = 0.9 + rnd(i, 4) * 0.2;
  const sw = Math.sin(phase) * 16;
  const bob = Math.abs(Math.cos(phase)) * 4;
  const bag = rnd(i, 5) > 0.5;
  return (
    <g transform={`translate(80 300) scale(${facing * tall} ${tall}) translate(-80 -300)`}>
      <ellipse cx={80} cy={302} rx={34} ry={6} fill="rgba(0,0,0,.22)" />
      <path d={`M72 200 L${72 + sw} 296 M88 200 L${88 - sw} 296`} stroke="#1d2030" strokeWidth={10} strokeLinecap="round" />
      <g transform={`translate(0 ${-bob})`}>
        <path d={`M60 120 Q${56 - sw * 0.6} 160 ${62 - sw * 0.8} 196`} stroke={suit} strokeWidth={12} strokeLinecap="round" fill="none" />
        <rect x={56} y={110} width={48} height={96} rx={18} fill={suit} />
        <path d="M80 112 L80 150" stroke="#e8e8ee" strokeWidth={6} />
        <path d={`M100 120 Q${104 + sw * 0.6} 160 ${98 + sw * 0.8} 196`} stroke={suit} strokeWidth={12} strokeLinecap="round" fill="none" />
        {bag && <rect x={92 + sw * 0.8} y={190} width={30} height={22} rx={4} fill="#1a1c26" />}
        <circle cx={80} cy={80} r={30} fill={skin} />
        <path d="M50 78 Q52 44 80 44 Q110 44 110 76 Q96 62 80 64 Q62 64 50 78Z" fill={hair} />
        <circle cx={92} cy={84} r={2.8} fill="#1b1b22" />
        <circle cx={104} cy={84} r={2.8} fill="#1b1b22" />
      </g>
    </g>
  );
};

// The rice-ball man, close-up scale (box 260 x 520, feet at 500). gaze: where his pupils point (-1 left .. 1 right,
// up 0..1). chew: 0..1 head bob. riceUp: 0..1 lifts the onigiri to his face.
export const RiceBallMan: React.FC<{phase: number; walking: boolean; gaze: [number, number]; chew: number; riceUp: number}> = ({
  phase, walking, gaze, chew, riceUp,
}) => {
  const sw = walking ? Math.sin(phase) * 20 : 0;
  const bob = walking ? Math.abs(Math.cos(phase)) * 5 : chew * 3;
  const handY = 330 - riceUp * 150;
  const handX = 70 - riceUp * 40;
  return (
    <g>
      <ellipse cx={130} cy={502} rx={70} ry={10} fill="rgba(0,0,0,.25)" />
      <path d={`M112 330 L${112 + sw} 496 M148 330 L${148 - sw} 496`} stroke="#22263a" strokeWidth={18} strokeLinecap="round" />
      <g transform={`translate(0 ${-bob})`}>
        <rect x={78} y={170} width={104} height={176} rx={34} fill="#4a4f63" />
        <path d="M130 172 L114 230 L130 300 L146 230 Z" fill="#e8e8ee" />
        <path d="M130 186 L124 250 L130 290 L136 250 Z" fill="#6b2f3a" />
        <path d="M182 196 Q196 270 186 330" stroke="#4a4f63" strokeWidth={22} strokeLinecap="round" fill="none" />
        <circle cx={186} cy={334} r={13} fill="#e0ac85" />
        <path d={`M80 196 Q60 260 ${handX + 8} ${handY}`} stroke="#4a4f63" strokeWidth={22} strokeLinecap="round" fill="none" />
        {/* onigiri */}
        <g transform={`translate(${handX - 26} ${handY - 40})`}>
          <path d="M26 0 L54 44 Q56 50 48 50 L4 50 Q-4 50 0 44 Z" fill="#f6f3ea" stroke="#d9d3c4" strokeWidth={2} />
          <rect x={14} y={30} width={26} height={20} fill="#1f2a1f" />
          <circle cx={30} cy={4} r={5} fill="#d9d3c4" />
        </g>
        <circle cx={handX} cy={handY} r={13} fill="#e0ac85" />
        {/* head */}
        <circle cx={130} cy={110} r={62} fill="#e0ac85" />
        <path d="M68 104 Q70 40 130 42 Q192 42 192 100 Q170 74 130 76 Q92 76 68 104Z" fill="#1b1b22" />
        <ellipse cx={109 + gaze[0] * 6} cy={116 - gaze[1] * 6} rx={4.5} ry={5.5} fill="#1b1b22" />
        <ellipse cx={151 + gaze[0] * 6} cy={116 - gaze[1] * 6} rx={4.5} ry={5.5} fill="#1b1b22" />
        <path d="M98 100 L120 102 M140 102 L162 100" stroke="#3a2a22" strokeWidth={4} strokeLinecap="round" />
        <path d="M100 126 Q110 130 120 126 M140 126 Q150 130 160 126" stroke="rgba(120,70,50,.45)" strokeWidth={3} fill="none" />
      </g>
    </g>
  );
};

export {rnd};
