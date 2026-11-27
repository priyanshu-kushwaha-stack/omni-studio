// Data graphics (W5: every spoken number on screen). Each one pops in with a bouncy scale over 0.25 s from `at`, as
// the word is said, and fades out over the 0.3 s before `to`, ahead of the cut. Gold for key numbers, coral for
// alarming ones, cream for labels.
import React from 'react';
import {keys, OUT} from '../rig/keys';
import {CREAM, GOLD, LABEL_FONT} from './palette';
import {popIn, type Timed} from './pop';

const box = (x: number, y: number, k: number, a: number, origin = '0 0'): React.CSSProperties => ({
  position: 'absolute', left: x, top: y, opacity: a, transform: `scale(${k})`, transformOrigin: origin, fontFamily: LABEL_FONT, fontWeight: 900,
});
const panel: React.CSSProperties = {background: 'rgba(12,16,28,.84)', borderRadius: 22, padding: '14px 26px', boxShadow: '0 12px 30px rgba(0,0,0,.35)'};

// A number that counts up from 0 over the first 0.6 s, a title, and a small rising curve drawn on with it.
export const DataCard: React.FC<Timed & {title: string; value: number; prefix?: string; x?: number; y?: number; color?: string; curve?: boolean}> = ({
  t, at, to, title, value, prefix = '', x = 70, y = 470, color = GOLD, curve = true,
}) => {
  const p = popIn({t, at, to});
  if (!p) return null;
  const c = keys(t, [[at, 0], [at + 0.6, 1, OUT]]);
  const n = Math.round(value * c).toLocaleString('en-US');
  const pts = Array.from({length: 13}, (_, i) => i / 12).filter((u) => u <= c + 1e-9).map((u) => `${u * 220},${60 - 52 * u ** 2.2}`);
  return (
    <div style={{...box(x, y, p.k, p.a, '0 100%'), ...panel, display: 'flex', alignItems: 'center', gap: 22}}>
      <div>
        <div style={{color, fontSize: 64, lineHeight: 1}}>{prefix}{n}</div>
        <div style={{color: CREAM, fontSize: 26, marginTop: 4}}>{title}</div>
      </div>
      {curve && (
        <svg width={220} height={64}>
          <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

// Two bars side by side, grown to scale.
export const Compare: React.FC<Timed & {a: {label: string; value: number}; b: {label: string; value: number}; x: number; y: number; width?: number; colors?: [string, string]}> = ({
  t, at, to, a, b, x, y, width = 420, colors = [GOLD, CREAM],
}) => {
  const p = popIn({t, at, to});
  if (!p) return null;
  const grow = keys(t, [[at + 0.1, 0], [at + 0.7, 1, OUT]]);
  const max = Math.max(a.value, b.value) || 1;
  return (
    <div style={{...box(x, y, p.k, p.a), ...panel, width}}>
      {[a, b].map((r, i) => (
        <div key={i} style={{marginTop: i ? 12 : 0}}>
          <div style={{color: CREAM, fontSize: 22}}>{r.label} <span style={{color: colors[i]}}>{r.value.toLocaleString('en-US')}</span></div>
          <div style={{height: 18, borderRadius: 9, marginTop: 4, width: `${(r.value / max) * 100 * grow}%`, background: colors[i]}} />
        </div>
      ))}
    </div>
  );
};

// A fill meter from 0 to `value` (0..1).
export const Meter: React.FC<Timed & {x: number; y: number; value: number; label: string; color?: string; width?: number}> = ({t, at, to, x, y, value, label, color = GOLD, width = 300}) => {
  const p = popIn({t, at, to});
  if (!p) return null;
  const fill = value * keys(t, [[at + 0.1, 0], [at + 0.8, 1, OUT]]);
  return (
    <div style={{...box(x, y, p.k, p.a), width}}>
      <div style={{color: CREAM, fontSize: 24, textShadow: '0 2px 6px rgba(0,0,0,.6)'}}>{label}</div>
      <div style={{height: 22, borderRadius: 11, marginTop: 6, background: 'rgba(12,16,28,.7)', border: `2px solid ${CREAM}`, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${fill * 100}%`, background: color}} />
      </div>
    </div>
  );
};

// A short label in a pill, centred on (x, y).
export const Badge: React.FC<Timed & {x: number; y: number; text: string; color?: string}> = ({t, at, to, x, y, text, color = GOLD}) => {
  const p = popIn({t, at, to});
  if (!p) return null;
  return (
    <div style={{...box(x, y, p.k, p.a, '50% 50%'), translate: '-50% -50%', background: color, color: '#141420', fontSize: 34, padding: '4px 20px', borderRadius: 30, whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );
};

export {Dimension, Callout} from './Marks';
