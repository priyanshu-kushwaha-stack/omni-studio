// Atmosphere (W7): dust, rain, fog, god rays, a lens streak or stars over a shot. Everything is a function of
// (seed, i) and t, so a frame renders the same every time. Motion is smooth drift and fall, never a jitter.
import React from 'react';
import {rnd} from '../film/Crowd';
import {drift} from '../rig/keys';
import {W, H} from '../film/Cam';

export type AtmosphereKind = 'dust' | 'rain' | 'fog' | 'rays' | 'streak' | 'stars';
type P = {t: number; seed: number; strength: number; id: string};

const wrap = (v: number, span: number) => ((v % span) + span) % span;
const many = (n: number, strength: number) => Array.from({length: Math.round(n * strength)}, (_, i) => i);

const Dust: React.FC<P> = ({t, seed, strength}) => (
  <g fill="#fff3d6">
    {many(46, strength).map((i) => {
      const k = seed * 1000 + i;
      const x = wrap(rnd(k, 1) * W + drift(t, 18, i) + t * 6 * (rnd(k, 4) - 0.5), W);
      const y = wrap(rnd(k, 2) * H - t * (6 + 10 * rnd(k, 3)), H);
      const tw = 0.6 + 0.4 * Math.sin(t * (0.8 + rnd(k, 5)) + i);
      return <circle key={i} cx={x} cy={y} r={0.8 + rnd(k, 6) * 2.2} opacity={(0.2 + 0.4 * rnd(k, 7)) * tw} />;
    })}
  </g>
);

const Rain: React.FC<P> = ({t, seed, strength}) => (
  <g stroke="#cfe0ff" strokeWidth={1.4} strokeLinecap="round">
    {many(130, strength).map((i) => {
      const k = seed * 1000 + i;
      const v = 900 + 500 * rnd(k, 3);
      const x = wrap(rnd(k, 1) * (W + 200) - t * v * 0.18, W + 200) - 100;
      const y = wrap(rnd(k, 2) * (H + 80) + t * v, H + 80) - 40;
      return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26 + 14 * rnd(k, 4)} opacity={0.18 + 0.3 * rnd(k, 5)} />;
    })}
  </g>
);

const Fog: React.FC<P> = ({t, seed, strength, id}) => (
  <g filter={`url(#${id}-b)`}>
    <filter id={`${id}-b`}><feGaussianBlur stdDeviation={60} /></filter>
    {[0, 1, 2, 3].map((i) => {
      const k = seed * 1000 + i;
      const x = wrap(rnd(k, 1) * W + t * (10 + 12 * rnd(k, 2)), W + 600) - 300;
      return <ellipse key={i} cx={x} cy={H * (0.45 + 0.4 * rnd(k, 3))} rx={420} ry={110} fill="#e8eef5" opacity={0.16 * strength} />;
    })}
  </g>
);

// God rays from a source above the frame, breathing slowly.
const Rays: React.FC<P> = ({t, seed, strength, id}) => {
  const sx = W * (0.15 + 0.7 * rnd(seed, 1));
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff1c8" stopOpacity={0.5} />
        <stop offset="1" stopColor="#fff1c8" stopOpacity={0} />
      </linearGradient>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = -0.5 + i * 0.25 + (rnd(seed, i + 2) - 0.5) * 0.12;
        const w = 0.04 + 0.05 * rnd(seed, i + 9);
        const len = H * 1.6;
        const p = (b: number) => `${sx + Math.sin(b) * len},${-60 + Math.cos(b) * len}`;
        const op = (0.35 + 0.25 * Math.sin(t * 0.5 + i * 1.7)) * strength;
        return <polygon key={i} points={`${sx},-60 ${p(a - w)} ${p(a + w)}`} fill={`url(#${id}-g)`} opacity={op} />;
      })}
    </g>
  );
};

// A horizontal lens streak through a bright point, sliding a little.
const Streak: React.FC<P> = ({t, seed, strength, id}) => {
  const y = H * (0.25 + 0.4 * rnd(seed, 1));
  const cx = W * (0.3 + 0.4 * rnd(seed, 2)) + t * 8;
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={0.7 * strength}>
      <radialGradient id={`${id}-s`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#dff0ff" stopOpacity={0.9} />
        <stop offset="1" stopColor="#7fb6ff" stopOpacity={0} />
      </radialGradient>
      <ellipse cx={cx} cy={y} rx={W * 0.55} ry={5} fill={`url(#${id}-s)`} />
      <circle cx={cx} cy={y} r={22} fill={`url(#${id}-s)`} />
    </g>
  );
};

const Stars: React.FC<P> = ({t, seed, strength}) => (
  <g fill="#fff">
    {many(90, strength).map((i) => {
      const k = seed * 1000 + i;
      const tw = 0.55 + 0.45 * Math.sin(t * (1 + 2 * rnd(k, 4)) + i * 2.1);
      return <circle key={i} cx={rnd(k, 1) * W} cy={rnd(k, 2) * H * 0.7} r={0.6 + 1.4 * rnd(k, 3) ** 2} opacity={tw * 0.9} />;
    })}
  </g>
);

const KINDS: Record<AtmosphereKind, React.FC<P>> = {dust: Dust, rain: Rain, fog: Fog, rays: Rays, streak: Streak, stars: Stars};

export const Atmosphere: React.FC<{kind: AtmosphereKind; t: number; seed?: number; strength?: number}> = ({kind, t, seed = 1, strength = 1}) => {
  const K = KINDS[kind];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}>
      <K t={t} seed={seed} strength={strength} id={`atm-${kind}-${seed}`} />
    </svg>
  );
};
