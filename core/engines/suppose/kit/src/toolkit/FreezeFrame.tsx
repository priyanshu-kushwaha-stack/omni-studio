// A freeze-frame (W1: one to three per film): a 3-frame white flash at t0, then the held picture goes cool, dust hangs
// in the air and a badge pops into the corner until t1. Pass the children already frozen (rendered at t0).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {keys, BACK} from '../rig/keys';
import {FPS} from '../film/Cam';
import {Atmosphere} from './Atmosphere';
import {GOLD, NAVY, TITLE_FONT} from './palette';

const FLASH = 3 / FPS;

export const FreezeFrame: React.FC<{t: number; t0: number; t1: number; badge?: string; children: React.ReactNode}> = ({t, t0, t1, badge, children}) => {
  if (t < t0 || t >= t1) return <>{children}</>;
  const d = t - t0;
  const pop = keys(t, [[t0 + FLASH, 0], [t0 + FLASH + 0.25, 1, BACK]]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'saturate(0.75) brightness(1.03)'}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(120,170,255,.16)', mixBlendMode: 'screen'}} />
      <Atmosphere kind="dust" t={t0 + d * 0.04} seed={7} strength={0.8} />
      {badge && pop > 0 && (
        <div style={{position: 'absolute', right: 70, top: 120, transform: `scale(${pop}) rotate(4deg)`, transformOrigin: '100% 0', fontFamily: TITLE_FONT, fontWeight: 700, fontSize: 64, color: NAVY, background: GOLD, padding: '6px 26px', borderRadius: 18, boxShadow: '0 10px 0 rgba(0,0,0,.25)'}}>
          {badge}
        </div>
      )}
      {d < FLASH && <AbsoluteFill style={{background: '#fff', opacity: 1 - d / FLASH}} />}
    </AbsoluteFill>
  );
};
