// Full-frame shots that need no set (data, blueprint, title, end) and the placeholder card for anything missing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Title} from '../film/Cards';
import {Blueprint} from '../toolkit/Blueprint';
import {EndScreen} from '../toolkit/EndScreen';
import {CORAL, CREAM, LABEL_FONT, NAVY} from '../toolkit/palette';
import {Labels} from './overlays';
import type {ShotData} from './types';

const WORD_S = 0.25; // title words land this far apart
const WORD_T0 = 0.3; // after the cut

const ground = `radial-gradient(ellipse at 50% 45%, #1d2a4a 0%, ${NAVY} 80%)`;

// Seen in a render, never silent: names what is missing so a shot can't drop out unnoticed.
export const Placeholder: React.FC<{shot: ShotData; what: string}> = ({shot, what}) => (
  <AbsoluteFill style={{background: '#2a1418', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL_FONT, fontWeight: 900, textAlign: 'center'}}>
    <div style={{border: `4px dashed ${CORAL}`, borderRadius: 24, padding: '30px 50px', color: CREAM}}>
      <div style={{fontSize: 30, color: CORAL}}>MISSING · shot {shot.id}</div>
      <div style={{fontSize: 52, marginTop: 10}}>{what}</div>
    </div>
  </AbsoluteFill>
);

export const FullFrame: React.FC<{shot: ShotData; t: number}> = ({shot, t}) => {
  const lt = t - shot.from;
  switch (shot.type) {
    case 'blueprint':
      return (
        <>
          <Blueprint t={lt} />
          <Labels shot={shot} t={t} />
        </>
      );
    case 'title': {
      const words = (shot.text ?? '').split(/\s+/).filter(Boolean).map((w, i): [string, number] => [w, shot.from + WORD_T0 + i * WORD_S]);
      return (
        <AbsoluteFill style={{background: ground}}>
          <Title t={t} words={words} />
          <Labels shot={shot} t={t} />
        </AbsoluteFill>
      );
    }
    case 'end':
      return <EndScreen t={lt} question={shot.text ?? ''} cast={null} />;
    default: // data
      return (
        <AbsoluteFill style={{background: ground}}>
          <Labels shot={shot} t={t} />
        </AbsoluteFill>
      );
  }
};
