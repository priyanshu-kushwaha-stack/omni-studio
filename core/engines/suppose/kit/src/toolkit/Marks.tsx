// Line marks for the data graphics (W5): a dimension arrow and a callout's leader line. Same timing as Data.tsx.
import React from 'react';
import {keys, OUT} from '../rig/keys';
import {W, H} from '../film/Cam';
import {CREAM, LABEL_FONT} from './palette';
import {popIn, type Timed} from './pop';

const Svg: React.FC<{a: number; children: React.ReactNode}> = ({a, children}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: a, overflow: 'visible', fontFamily: LABEL_FONT, fontWeight: 900}}>
    {children}
  </svg>
);

// A measurement arrow from (x1, y1) to (x2, y2) that draws out from its middle, with its label above.
export const Dimension: React.FC<Timed & {x1: number; y1: number; x2: number; y2: number; label: string; color?: string}> = ({t, at, to, x1, y1, x2, y2, label, color = CREAM}) => {
  const p = popIn({t, at, to});
  if (!p) return null;
  const d = keys(t, [[at, 0], [at + 0.35, 1, OUT]]);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ax = mx + (x1 - mx) * d, ay = my + (y1 - my) * d, bx = mx + (x2 - mx) * d, by = my + (y2 - my) * d;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = (x: number, y: number, s: number) => {
    const u = ang + (s > 0 ? 0 : Math.PI);
    return `M${x - 14 * Math.cos(u - 0.45)} ${y - 14 * Math.sin(u - 0.45)} L${x} ${y} L${x - 14 * Math.cos(u + 0.45)} ${y - 14 * Math.sin(u + 0.45)}`;
  };
  return (
    <Svg a={p.a}>
      <g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
        <line x1={ax} y1={ay} x2={bx} y2={by} />
        <path d={head(ax, ay, -1)} />
        <path d={head(bx, by, 1)} />
      </g>
      <text x={mx} y={my - 16} textAnchor="middle" fontSize={30 * p.k} fill={color} stroke="rgba(0,0,0,.55)" strokeWidth={5} paintOrder="stroke">{label}</text>
    </Svg>
  );
};

// A dot on the thing at (x, y), a leader line to the label at (lx, ly).
export const Callout: React.FC<Timed & {x: number; y: number; lx: number; ly: number; text: string; color?: string}> = ({t, at, to, x, y, lx, ly, text, color = CREAM}) => {
  const p = popIn({t, at, to});
  if (!p) return null;
  const d = keys(t, [[at, 0], [at + 0.3, 1, OUT]]);
  return (
    <Svg a={p.a}>
      <circle cx={x} cy={y} r={7 * p.k} fill={color} />
      <line x1={x} y1={y} x2={x + (lx - x) * d} y2={y + (ly - y) * d} stroke={color} strokeWidth={3} />
      <text x={lx + (lx >= x ? 10 : -10)} y={ly + 10} textAnchor={lx >= x ? 'start' : 'end'} fontSize={30 * p.k} fill={color} stroke="rgba(0,0,0,.55)" strokeWidth={5} paintOrder="stroke" opacity={d}>
        {text}
      </text>
    </Svg>
  );
};
