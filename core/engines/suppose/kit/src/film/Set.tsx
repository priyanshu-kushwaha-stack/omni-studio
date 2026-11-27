import React from 'react';
import {Img, staticFile} from 'remotion';
import {PEER} from '../rig/scale';
import {W, H} from './Cam';

// One angle of a set, as written in library/sets/<id>/set.json.
export type SetAngle = {
  plate: string;
  scarf: {x: number; y: number; s: number};
  h: {horizon: number; at: number} | {fixed: number};
  crowd?: Record<string, [number, number]>;
  clear?: number[];
  bounds?: {zmax: number};
  key?: {side: 'left' | 'right' | 'top'; color: string};
};

// On-screen height (px) of a peer whose feet are at y, so everyone matches Scarf at the same depth.
// `fixed` is a fraction of the peer height at Scarf's scale (a flat close plate has no depth).
export const hAtFor = (angle: SetAngle, scarfH: number): ((y: number) => number) => {
  const {s} = angle.scarf;
  const h = angle.h;
  if ('fixed' in h) return () => PEER * scarfH * s * h.fixed;
  return (y: number) => PEER * scarfH * s * ((y - h.horizon) / (h.at - h.horizon));
};

export const SetPlate: React.FC<{angle: SetAngle; blur?: number}> = ({angle, blur = 0}) => (
  <Img src={staticFile(angle.plate)} style={{position: 'absolute', left: -60, top: -40, width: W + 120, height: H + 70, filter: blur ? `blur(${blur}px)` : undefined}} />
);
