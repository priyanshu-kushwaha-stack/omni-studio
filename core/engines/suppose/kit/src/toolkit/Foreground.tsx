// A soft near layer (W7: most medium shots have something blurred in front): an image or any drawing, out of focus.
import React from 'react';
import {Img, staticFile} from 'remotion';

export const Foreground: React.FC<{src?: string; children?: React.ReactNode; blur?: number; x: number; y: number; s?: number}> = ({src, children, blur = 10, x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', filter: `blur(${blur}px) brightness(0.8)`, pointerEvents: 'none'}}>
    {src ? <Img src={staticFile(src)} style={{display: 'block'}} /> : children}
  </div>
);
