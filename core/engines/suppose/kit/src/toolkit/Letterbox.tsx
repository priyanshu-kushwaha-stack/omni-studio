// Scope bars (W7): 2.39:1 for the title, freeze-frames, the climax and intense close-ups. They slide in over 0.4 s from
// t0 and, with t1, back out over the 0.4 s before it. Other shots keep the full frame (ratio null).
import React from 'react';
import {keys, OUT, IO} from '../rig/keys';
import {W, H} from '../film/Cam';

export const Letterbox: React.FC<{ratio: 2.39 | null; t: number; t0: number; t1?: number}> = ({ratio, t, t0, t1}) => {
  if (ratio === null) return null;
  const k = keys(t, [[t0, 0], [t0 + 0.4, 1, OUT]]) * (t1 === undefined ? 1 : keys(t, [[t1 - 0.4, 1], [t1, 0, IO]]));
  if (k <= 0) return null;
  const bar = ((H - W / ratio) / 2) * k;
  const style: React.CSSProperties = {position: 'absolute', left: 0, right: 0, height: bar, background: '#000'};
  return (
    <>
      <div style={{...style, top: 0}} />
      <div style={{...style, bottom: 0}} />
    </>
  );
};
