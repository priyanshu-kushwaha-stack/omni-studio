import React from 'react';
import {keys, BACK} from '../rig/keys';
import {FONT, GREEN} from '../toolkit/palette';

export const RuleCard: React.FC<{t: number; t0: number; n: string; text: string}> = ({t, t0, n, text}) => {
  const k = keys(t, [[t0, 0], [t0 + 0.45, 1, BACK]]);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, top: 54, transform: `translateX(${(1 - k) * -60}px) rotate(${(1 - k) * -6 - 1.5}deg)`, opacity: Math.min(1, k * 1.4), fontFamily: FONT, background: '#fbf6ea', color: '#1b1a22', borderRadius: 14, padding: '14px 24px 16px', boxShadow: '0 14px 30px rgba(0,0,0,.35)', maxWidth: 560}}>
      <div style={{fontSize: 18, fontWeight: 800, color: '#1f8f52', letterSpacing: 2}}>RULE {n}</div>
      <div style={{fontSize: 34, fontWeight: 900, lineHeight: 1.1, marginTop: 4}}>{text}</div>
    </div>
  );
};

// Title words land one by one with the narration.
export const Title: React.FC<{t: number; words: [string, number][]}> = ({t, words}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 110, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 74, lineHeight: 1.05, color: '#fff', textShadow: '0 6px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.45)'}}>
    {words.map(([w, at], i) => {
      const k = keys(t, [[at - 0.05, 0], [at + 0.25, 1, BACK]]);
      const hot = w === '100';
      return (
        <span key={i} style={{display: 'inline-block', margin: '0 12px', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 30}px) scale(${0.8 + 0.2 * k})`, color: hot ? GREEN : '#fff'}}>
          {w}
        </span>
      );
    })}
  </div>
);
