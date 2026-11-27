import React from 'react';
import {interpolate, Easing} from 'remotion';
import {keys, BACK, OUT} from '../rig/keys';
import {FONT, GREEN} from '../toolkit/palette';

// The glowing readout over your head.
export const Readout: React.FC<{x: number; y: number; t: number; t0: number; text?: string}> = ({x, y, t, t0, text = '99 / 100'}) => {
  const a = keys(t, [[t0, 0], [t0 + 0.5, 1, OUT]]);
  if (a <= 0) return null;
  const sc = keys(t, [[t0, 0.6], [t0 + 0.55, 1, BACK]]);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${sc})`, opacity: a, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#eafff4', padding: '6px 22px', borderRadius: 40, border: `3px solid ${GREEN}`, background: 'rgba(10,30,22,.55)', textShadow: `0 0 18px ${GREEN}, 0 0 4px ${GREEN}`, boxShadow: `0 0 32px rgba(47,191,113,.55)`, whiteSpace: 'nowrap', letterSpacing: 1}}>
      {text}
    </div>
  );
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// The fact pill: fades in over 0.4 s from t0, out over the last 0.5 s before t1.
// `unit` follows the number in `accent` (green by default), as in the pilot: "≈ 3,500,000 people / day".
export const FactPill: React.FC<{t: number; t0: number; t1: number; text: string; unit?: string; accent?: string; source?: string}> = ({t, t0, t1, text, unit, accent = GREEN, source}) => {
  const a = lerp(t, t0, t0 + 0.4, 0, 1) * lerp(t, t1 - 0.5, t1, 1, 0);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 70, top: 540, opacity: a, transform: `translateY(${(1 - a) * 12}px)`, fontFamily: 'Inter, sans-serif'}}>
      <div style={{background: 'rgba(12,16,28,.82)', border: `2px solid ${GREEN}`, borderRadius: 40, padding: '10px 22px', color: '#fff', fontSize: 30, fontWeight: 800}}>
        {unit ? `${text} ` : text}
        {unit && <span style={{color: accent}}>{unit}</span>}
      </div>
      {source && <div style={{color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 6, marginLeft: 22}}>{source}</div>}
    </div>
  );
};
