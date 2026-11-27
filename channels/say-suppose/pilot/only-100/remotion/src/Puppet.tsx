// Cut-out puppets from GPT Image parts sheets (owner, 2026-11-27: paint the parts, animate them ourselves).
// A Part is one PNG piece hung on a joint: `pivot` is the joint inside the piece, `at` is where that joint sits in
// the parent piece, `rot` turns it clockwise. Children ride on their parent; z < 0 tucks a child behind it.
import React from 'react';
import {Img, staticFile} from 'remotion';

type PartProps = {
  src: string;
  w: number;
  h: number;
  pivot: [number, number];
  at: [number, number];
  rot?: number;
  z?: number;
  clipTop?: number; // hide this fraction of the piece's top (a joint cap that would show)
  children?: React.ReactNode;
};

export const Part: React.FC<PartProps> = ({src, w, h, pivot, at, rot = 0, z = 0, clipTop = 0, children}) => (
  <div
    style={{
      position: 'absolute',
      left: at[0] - pivot[0],
      top: at[1] - pivot[1],
      width: w,
      height: h,
      zIndex: z,
      transformOrigin: `${pivot[0]}px ${pivot[1]}px`,
      transform: `rotate(${rot}deg)`,
    }}
  >
    <Img src={staticFile(src.includes("/") ? src : `cut/${src}`)} style={{position: 'absolute', inset: 0, width: w, height: h, zIndex: 0, clipPath: clipTop ? `inset(${clipTop * 100}% 0 0 0)` : undefined}} />
    {children}
  </div>
);

// Painted-on face features in piece pixels (an SVG layer on top of a head piece).
export const Face: React.FC<{w: number; h: number; children: React.ReactNode}> = ({w, h, children}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0, zIndex: 2, overflow: 'visible'}}>
    {children}
  </svg>
);

// Soft contact shadow, centred on x at the feet line.
export const Shadow: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - w * 0.09,
      width: w,
      height: w * 0.18,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(40,20,40,.45), rgba(40,20,40,0) 70%)',
    }}
  />
);

// Outward-positive limb angle -> CSS clockwise rotation. Screen-left limbs swing out clockwise.
export const out = (deg: number, side: -1 | 1) => (side === -1 ? deg : -deg);
