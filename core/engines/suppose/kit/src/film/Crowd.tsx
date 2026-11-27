import React from 'react';
import {Person, strideAt} from '../rig/Person';
import type {Parts} from '../rig/types';
import {personH} from '../rig/scale';
import {W} from './Cam';

export const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const TINTS = ['none', 'brightness(0.9)', 'saturate(0.8)', 'brightness(1.06) saturate(0.9)', 'sepia(0.2)'];

// Commuters walking across the floor of a set. Depth from y: farther = smaller and softer. Feet never slide.
// hAt(y) = on-screen height (px) of a person whose feet are at y, so everyone matches Scarf at the same depth.
// kinds: the cast to draw from, in weighted order (repeat a kind to make it common).
export const Crowd: React.FC<{t: number; n: number; seed: number; y0: number; y1: number; hAt: (y: number) => number; speed: number; kinds: Parts[]; clear?: [number, number, number?, number?]; front?: boolean; look?: number}> = ({
  t, n, seed, y0, y1, hAt, speed, kinds, clear, front, look,
}) => {
  const span = W + 500;
  const people = Array.from({length: n}).map((_, k) => {
    const i = k + seed;
    const y = y0 + rnd(i, 3) * (y1 - y0);
    const parts = kinds[(i * 3) % kinds.length]; // stride 3 never lands on the same kind twice in a row
    const s = (hAt(y) * (0.96 + rnd(i, 5) * 0.12)) / personH(parts);
    const dir: 1 | -1 = rnd(i, 7) > 0.5 ? 1 : -1;
    const v = speed * (0.75 + rnd(i, 8) * 0.5) * (hAt(y) / hAt(y1));
    const x = ((((rnd(i, 9) * span + dir * v * t) % span) + span) % span) - 250;
    const phase = ((v * t) / strideAt(parts, s)) * Math.PI * 2 + i;
    return {i, x, y, s, parts, dir, phase};
  });
  people.sort((a, b) => a.y - b.y);
  return (
    <>
      {people.map((q) => {
        if (clear && !front && q.x > clear[0] && q.x < clear[1] && q.y > (clear[2] ?? -1e9) && q.y < (clear[3] ?? 1e9)) return null;
        const far = (q.y - y0) / Math.max(1, y1 - y0);
        const blur = front ? 10 : far < 0.3 ? 1.6 : 0;
        const tint = TINTS[Math.floor(rnd(q.i, 11) * TINTS.length)];
        const filter = [tint === 'none' ? '' : tint, blur ? `blur(${blur}px)` : ''].join(' ').trim() || undefined;
        return <Person key={q.i} parts={q.parts} x={q.x} y={q.y} s={q.s} filter={filter} p={{phase: q.phase, walk: 1, dir: q.dir, pupil: [q.dir * 0.6, look ?? 0]}} />;
      })}
    </>
  );
};
