import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H} from './Cam';

export type Mood = 'warm' | 'cool' | 'void' | 'blueprint';

const WASH: Record<Mood, string> = {
  warm: 'linear-gradient(180deg, rgba(255,190,120,.08), transparent 40%, rgba(255,150,90,.10))',
  cool: 'linear-gradient(180deg, rgba(120,160,255,.10), rgba(120,160,255,.10))',
  void: 'linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.12))',
  blueprint: 'linear-gradient(180deg, rgba(20,40,90,.25), rgba(20,40,90,.25))',
};
const VIGNETTE: Record<Mood, string> = {
  warm: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(10,8,20,.55) 100%)',
  cool: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(10,8,20,.55) 100%)',
  void: 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,.8) 100%)',
  blueprint: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(10,8,20,.55) 100%)',
};

// The film grade: vignette, a mood wash (warm by default, the pilot's) and grain.
export const Grade: React.FC<{frame: number; mood?: Mood}> = ({frame, mood = 'warm'}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: VIGNETTE[mood]}} />
    <AbsoluteFill style={{background: WASH[mood], mixBlendMode: 'screen'}} />
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 50} /></filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);
