// The blueprint look (W5) for science segments and "Is any of this real?": a navy ground, a light-blue grid that fades
// in, the children as line art in an SVG layer, and gold for the highlight. BpLine draws a path on over time.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {keys, OUT, IO} from '../rig/keys';
import {W, H} from '../film/Cam';
import {BLUEPRINT, GOLD, NAVY} from './palette';

export const Blueprint: React.FC<{t: number; children?: React.ReactNode}> = ({t, children}) => {
  const g = keys(t, [[0, 0], [0.6, 1, OUT]]);
  const lines = (step: number, op: number, w: number) => [
    ...Array.from({length: Math.ceil(W / step) + 1}, (_, i) => <line key={`v${step}-${i}`} x1={i * step} y1={0} x2={i * step} y2={H} strokeWidth={w} opacity={op} />),
    ...Array.from({length: Math.ceil(H / step) + 1}, (_, i) => <line key={`h${step}-${i}`} x1={0} y1={i * step} x2={W} y2={i * step} strokeWidth={w} opacity={op} />),
  ];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #18305e 0%, ${NAVY} 75%)`}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g stroke={BLUEPRINT} opacity={g}>
          {lines(40, 0.12, 1)}
          {lines(160, 0.28, 1.5)}
        </g>
        <g stroke={BLUEPRINT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {children}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// One stroke of line art, drawn on from `at` over `dur` seconds; `gold` marks the highlight.
export const BpLine: React.FC<{d: string; t: number; at: number; dur?: number; gold?: boolean; width?: number}> = ({d, t, at, dur = 0.8, gold, width}) => {
  const k = keys(t, [[at, 0], [at + dur, 1, IO]]);
  if (k <= 0) return null;
  return <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} stroke={gold ? GOLD : BLUEPRINT} strokeWidth={width ?? (gold ? 4 : 3)} />;
};
