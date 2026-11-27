import React from 'react';

export const FPS = 30;
export const W = 1280;
export const H = 720;

// A camera that frames point (fx, fy) at zoom z; k < 1 is a farther layer (parallax).
export const Cam: React.FC<{z: number; fx: number; fy: number; k?: number; children: React.ReactNode}> = ({z, fx, fy, k = 1, children}) => {
  const zz = 1 + (z - 1) * k;
  const x = W / 2 - (W / 2 + (fx - W / 2) * k) * zz;
  const y = H / 2 - (H / 2 + (fy - H / 2) * k) * zz;
  return <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${zz})`}}>{children}</div>;
};

// Keep the focus far enough from the frame edge that a push never shows past the plate.
export const clampF = (z: number, f: number, half: number) => Math.min(Math.max(f, half / z), 2 * half - half / z);

export const View: React.FC<{z: number; fx: number; fy: number; bg: React.ReactNode; k?: number; children: React.ReactNode}> = ({z, fx, fy, bg, k = 0.6, children}) => {
  const x = clampF(z, fx, W / 2), y = clampF(z, fy, H / 2);
  return (
    <>
      <Cam z={z} fx={x} fy={y} k={k}>{bg}</Cam>
      <Cam z={z} fx={x} fy={y}>{children}</Cam>
    </>
  );
};
