// "You": B · Scarf (owner pick, 2026-11-27), from characters/characters.js, as an animatable React SVG group.
// Local units: 200 x 300 box, feet at y ~290. No mouth (L8).
import React from 'react';

export type Expr = 'neutral' | 'worried' | 'shocked' | 'smug';
export type ScarfProps = {
  t: number; // seconds, for idle motion
  expr?: Expr;
  look?: number; // pupil offset -1..1 (left/right)
  arms?: 'rest' | 'shout' | 'lean';
  lean?: number; // degrees
  blink?: boolean;
};

const HEAD = '#14141c', COAT = '#3a3f4b', COAT_D = '#2a2e37', GREEN = '#2fbf71', GREEN_D = '#1f8f52';

export const Scarf2D: React.FC<ScarfProps> = ({t, expr = 'neutral', look = 0, arms = 'rest', lean = 0, blink}) => {
  const breathe = Math.sin(t * 2.2) * 1.2;
  const sway = Math.sin(t * 1.7) * 6;
  const r = expr === 'shocked' ? 13 : 11;
  const pr = expr === 'shocked' ? 3.2 : 5;
  const px = look * 4.5;
  const eyeY = 84;
  const browLift = expr === 'shocked' ? 9 : expr === 'worried' ? 4 : 0;
  const tilt = expr === 'worried' ? 4 : 0;
  const armL = arms === 'shout' ? 'M70 150 Q60 120 82 96' : arms === 'lean' ? 'M68 152 Q50 170 46 196' : 'M68 152 Q56 182 60 208';
  const armR = arms === 'shout' ? 'M130 150 Q140 120 118 96' : arms === 'lean' ? 'M132 152 Q150 176 150 204' : 'M132 152 Q144 182 140 208';
  const end = (d: string) => d.split(' ').slice(-2).map(Number);
  const [lx, ly] = end(armL), [rx, ry] = end(armR);
  return (
    <g transform={`rotate(${lean} 100 290)`}>
      <ellipse cx={100} cy={292} rx={46} ry={7} fill="rgba(0,0,0,.28)" />
      <path d="M90 228 L86 288 M110 228 L116 288" stroke={HEAD} strokeWidth={7} strokeLinecap="round" />
      <ellipse cx={83} cy={289} rx={10} ry={5} fill={HEAD} />
      <ellipse cx={119} cy={289} rx={10} ry={5} fill={HEAD} />
      <g transform={`translate(0 ${breathe})`}>
        <path d={armL} stroke={COAT_D} strokeWidth={12} strokeLinecap="round" fill="none" />
        <path d={armR} stroke={COAT_D} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={lx} cy={ly} r={8} fill={HEAD} />
        <circle cx={rx} cy={ry} r={8} fill={HEAD} />
        <path d="M70 138 Q100 128 130 138 L134 232 Q100 242 66 232 Z" fill={COAT} />
        <path d="M100 140 L100 232" stroke={COAT_D} strokeWidth={2} />
        <circle cx={96} cy={172} r={2.5} fill={COAT_D} />
        <circle cx={96} cy={198} r={2.5} fill={COAT_D} />
        {/* head */}
        <circle cx={100} cy={82} r={50} fill={HEAD} />
        <path d="M138 58 A50 50 0 0 1 143 108" stroke="rgba(255,206,150,.6)" strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={80} cy={56} rx={12} ry={7} fill="rgba(255,255,255,.10)" transform="rotate(-25 80 56)" />
        {/* scarf */}
        <path d="M66 128 Q100 146 134 128 L136 142 Q100 160 64 142 Z" fill={GREEN} />
        <path d={`M122 140 Q150 ${160 + sway * 0.3} ${168 + sway} ${150 + sway * 0.5} Q${178 + sway} ${170 + sway * 0.5} ${160 + sway} 176 Q138 172 116 150 Z`} fill={GREEN} />
        <path d={`M${160 + sway} ${150 + sway * 0.5} l6 -6`} stroke={GREEN_D} strokeWidth={2} />
        {/* eyes */}
        {blink ? (
          <g stroke="#fff" strokeWidth={3} strokeLinecap="round">
            <line x1={70} y1={eyeY} x2={92} y2={eyeY} />
            <line x1={108} y1={eyeY} x2={130} y2={eyeY} />
          </g>
        ) : (
          <g>
            <circle cx={81} cy={eyeY} r={r} fill="#fff" />
            <circle cx={119} cy={eyeY} r={r} fill="#fff" />
            <circle cx={81 + px} cy={eyeY + 1} r={pr} fill={HEAD} />
            <circle cx={119 + px} cy={eyeY + 1} r={pr} fill={HEAD} />
          </g>
        )}
        <g stroke="#f4f1ea" strokeWidth={3.5} strokeLinecap="round">
          <line x1={72} y1={62 - browLift + tilt} x2={90} y2={62 - browLift - tilt} />
          <line x1={110} y1={62 - browLift - tilt} x2={128} y2={62 - browLift + tilt} />
        </g>
        {(expr === 'worried' || expr === 'shocked') && (
          <path d="M146 58 q6 10 0 14 q-6 -4 0 -14z" fill="#8fd3ff" stroke="#fff" strokeWidth={1.5} />
        )}
      </g>
    </g>
  );
};

// Blink every ~3.4 s for 4 frames' worth.
export const isBlink = (t: number, offset = 0) => ((t + offset) % 3.4) < 0.12;
