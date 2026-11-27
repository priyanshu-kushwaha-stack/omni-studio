// Refined cut-out test: the CutoutC timing on the matched cast (Cast2), one drawing style for both puppets.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {FPS, W, H, sec} from './timing';
import {keys, LIN, drift} from './rig';
import {Shadow} from './Puppet';
import {Grade} from './Overlays';
import {MOTION_START, MOTION_SECONDS} from './MotionC';
import {scarfAt, manAt} from './CutoutC';
import {Scarf2, Man2} from './Cast2';

export const CutoutC2: React.FC = () => {
  const frame = useCurrentFrame();
  const l = frame / FPS;
  const s = keys(l, [[0, 1.0], [MOTION_SECONDS, 1.06, LIN]]);
  const cx = keys(l, [[0, -18], [MOTION_SECONDS, 22, LIN]]) + drift(l, 2.2);
  const cy = drift(l, 1.6, 3);
  const cam = (k: number): React.CSSProperties => ({
    position: 'absolute', inset: 0, transformOrigin: '50% 60%',
    transform: `scale(${1 + (s - 1) * k}) translate(${-cx * k}px, ${-cy * k}px)`,
  });
  const man = manAt(l, 160);
  const sp = scarfAt(l);
  return (
    <AbsoluteFill style={{background: '#2a2438', overflow: 'hidden'}}>
      <div style={cam(0.5)}>
        <Img src={staticFile('cut/set_close.png')} style={{position: 'absolute', left: -60, top: -40, width: W + 120, height: H + 70, filter: 'blur(1.5px)'}} />
      </div>
      <div style={cam(1)}>
        <Shadow x={440} y={652} w={200} />
        <Shadow x={man.x} y={652} w={200} />
        <Scarf2 x={440} y={652} s={0.28} p={{...sp, browLift: sp.browLift * 0.8, browSad: sp.browSad * 0.8}} />
        <Man2 x={man.x} y={652} s={0.27} p={man.p} />
      </div>
      <Grade frame={frame} />
      <Audio src={staticFile('narr_a.wav')} startFrom={sec(MOTION_START)} />
    </AbsoluteFill>
  );
};
