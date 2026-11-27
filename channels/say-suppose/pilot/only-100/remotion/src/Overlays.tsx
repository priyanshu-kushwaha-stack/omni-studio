// Shared overlays for every look: the fact pill (L5) and the film grade (vignette, warm wash, grain).
import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {W, H} from './timing';

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const Grade: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(10,8,20,.55) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,190,120,.08), transparent 40%, rgba(255,150,90,.10))', mixBlendMode: 'screen'}} />
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 50} /></filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

export const FactPill: React.FC<{t: number}> = ({t}) => {
  const a = lerp(t, 6.0, 6.4, 0, 1) * lerp(t, 9.6, 10.1, 1, 0);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 70, top: 540, opacity: a, transform: `translateY(${(1 - a) * 12}px)`, fontFamily: 'Inter, sans-serif'}}>
      <div style={{background: 'rgba(12,16,28,.82)', border: '2px solid #2fbf71', borderRadius: 40, padding: '10px 22px', color: '#fff', fontSize: 30, fontWeight: 800}}>
        ≈ 3,500,000 <span style={{color: '#2fbf71'}}>people / day</span>
      </div>
      <div style={{color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 6, marginLeft: 22}}>Shinjuku Station, Tokyo · busiest on Earth</div>
    </div>
  );
};

