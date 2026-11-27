// The end screen: the closing question in the end face, a comment bubble asking for an answer, a subscribe pill and
// the cast lined up along the floor. Each piece lands in turn from t = 0.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {keys, BACK, OUT} from '../rig/keys';
import {CORAL, CREAM, END_FONT, GOLD, LABEL_FONT, NAVY} from './palette';

export const EndScreen: React.FC<{t: number; question: string; cast: React.ReactNode}> = ({t, question, cast}) => {
  const q = keys(t, [[0.2, 0], [0.8, 1, OUT]]);
  const bubble = keys(t, [[1.0, 0], [1.3, 1, BACK]]);
  const pill = keys(t, [[1.4, 0], [1.7, 1, BACK]]);
  const crew = keys(t, [[0, 0], [0.7, 1, OUT]]);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY} 0%, #1d2a4a 60%, #2a2238 100%)`}}>
      <div style={{position: 'absolute', left: 90, right: 90, top: 70, textAlign: 'center', fontFamily: END_FONT, fontStyle: 'italic', fontWeight: 900, fontSize: 64, lineHeight: 1.1, color: CREAM, opacity: q, transform: `translateY(${(1 - q) * 24}px)`}}>
        {question}
      </div>
      <div style={{position: 'absolute', left: 150, top: 280, transform: `scale(${bubble})`, transformOrigin: '0 100%', fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 30, color: NAVY}}>
        <div style={{background: CREAM, borderRadius: 26, padding: '14px 26px'}}>Tell us in the comments</div>
        <svg width={40} height={26} style={{position: 'absolute', left: 30, bottom: -24}}>
          <path d="M0 0 L40 0 L6 26 Z" fill={CREAM} />
        </svg>
      </div>
      <div style={{position: 'absolute', right: 150, top: 290, transform: `scale(${pill})`, transformOrigin: '100% 50%', fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 32, color: '#fff', background: CORAL, borderRadius: 40, padding: '12px 34px', boxShadow: `0 0 0 4px ${GOLD}`}}>
        Subscribe
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: crew, transform: `translateY(${(1 - crew) * 40}px)`}}>{cast}</div>
    </AbsoluteFill>
  );
};
