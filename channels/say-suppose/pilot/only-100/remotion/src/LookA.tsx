// Look (a): flat 2D vector with cinematic light (L6). Every shape is code; light, depth, haze and grain do the rest.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';

// Look (c) passes plate: the station is a painted FLUX plate (no people) and every character stays code.
const Plate: React.FC<{src: string}> = ({src}) => <image href={staticFile(src)} x={-80} y={-70} width={W + 160} height={H + 140} preserveAspectRatio="xMidYMid slice" />;
import {FPS, W, H, SHOT, inShot} from './timing';
import {Scarf2D, isBlink} from './Scarf2D';
import {Commuter, RiceBallMan, rnd} from './People2D';
import {FactPill, Grade} from './Overlays';

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

const BOARD_ROWS = [
  ['07:42', 'RAPID', 'TOKYO', '#ffb347'],
  ['07:44', 'LOCAL', 'SHIBUYA', '#ffd27a'],
  ['07:45', 'LTD. EXP', 'ODAWARA', '#ff8a5c'],
  ['07:47', 'YAMANOTE', 'IKEBUKURO', '#9be37a'],
] as const;

const Board: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-8} y={-8} width={436} height={196} rx={12} fill="#0b0d14" opacity={0.9} />
    <rect x={0} y={0} width={420} height={180} rx={8} fill="#11141f" stroke="#2c3350" strokeWidth={3} />
    {BOARD_ROWS.map((r, i) => (
      <g key={i} fontFamily="JetBrains Mono, Menlo, monospace" fontSize={22} fontWeight={700}>
        <text x={18} y={40 + i * 38} fill={r[3]}>{r[0]}</text>
        <text x={110} y={40 + i * 38} fill={r[3]}>{r[1]}</text>
        <text x={262} y={40 + i * 38} fill={r[3]}>{r[2]}</text>
      </g>
    ))}
  </g>
);

const Station: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a1e33" />
        <stop offset="0.55" stopColor="#3b3550" />
        <stop offset="1" stopColor="#5a4656" />
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6b5560" />
        <stop offset="1" stopColor="#2b2433" />
      </linearGradient>
      <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="rgba(255,205,140,.55)" />
        <stop offset="1" stopColor="rgba(255,205,140,0)" />
      </radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
    </defs>
    <rect width={W} height={H} fill="url(#wall)" />
    {/* ceiling light strips */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={60 + i * 210} y={40} width={150} height={10} rx={5} fill="#fff4dc" />
        <rect x={60 + i * 210} y={40} width={150} height={10} rx={5} fill="#ffe0a8" filter="url(#glow)" opacity={0.9} />
      </g>
    ))}
    {/* pillars */}
    {[120, 1160].map((x) => (
      <g key={x}>
        <rect x={x - 34} y={60} width={68} height={420} fill="#252a40" />
        <rect x={x - 34} y={180} width={68} height={40} fill="#2fbf71" opacity={0.85} />
        <text x={x} y={207} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={16} fill="#0c2a1a">JR</text>
      </g>
    ))}
    <Board x={430} y={90} s={1} />
    {/* yellow exit sign */}
    <rect x={250} y={110} width={130} height={40} rx={6} fill="#ffd23f" />
    <text x={315} y={137} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={18} fill="#1c1c1c">EXIT · 出口</text>
    <rect y={470} width={W} height={H - 470} fill="url(#floor)" />
    <ellipse cx={640} cy={600} rx={300} ry={60} fill="url(#pool)" />
    {/* drifting haze */}
    <rect y={300} width={W} height={260} fill="rgba(255,220,190,.08)" transform={`translate(${Math.sin(t * 0.3) * 20} 0)`} />
  </g>
);

type Layer = {n: number; y: number; scale: number; speed: number; blur: number; seed: number; part?: boolean; clearUntil?: number};

const Crowd: React.FC<{t: number; layer: Layer; centerX: number}> = ({t, layer, centerX}) => {
  const span = W + 400;
  return (
    <g filter={layer.blur ? `blur(${layer.blur}px)` : undefined} style={{filter: layer.blur ? `blur(${layer.blur}px)` : undefined}}>
      {Array.from({length: layer.n}).map((_, k) => {
        const i = k + layer.seed;
        const dir: 1 | -1 = rnd(i, 7) > 0.5 ? 1 : -1;
        const sp = layer.speed * (0.8 + rnd(i, 8) * 0.5);
        const x0 = rnd(i, 9) * span;
        const x = (((x0 + dir * sp * t) % span) + span) % span - 200;
        const yj = layer.y + (rnd(i, 10) - 0.5) * 30;
        let alpha = 1;
        let dy = 0;
        if (layer.part && layer.clearUntil !== undefined && t < layer.clearUntil && Math.abs(x + 80 * layer.scale - centerX) < 110) alpha = 0;
        if (layer.part) {
          const d = Math.abs(x + 80 * layer.scale - centerX);
          if (d < 150) dy = (150 - d) * (rnd(i, 11) > 0.5 ? -0.25 : 0.35); // the crowd bends around you
        }
        return (
          <g key={k} opacity={alpha} transform={`translate(${x} ${yj + dy - 300 * layer.scale}) scale(${layer.scale})`}>
            <Commuter i={i} phase={t * sp * 0.09 + i} facing={dir} />
          </g>
        );
      })}
    </g>
  );
};

export const LookA: React.FC<{plate?: boolean}> = ({plate}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cx = 640;
  const back: Layer = {n: 26, y: 520, scale: 0.42, speed: 55, blur: 2, seed: 0};
  const mid: Layer = {n: 18, y: 640, scale: 0.62, speed: 85, blur: 0, seed: 100, part: true, clearUntil: 4.95};
  const front: Layer = {n: 7, y: 790, scale: 1.05, speed: 170, blur: 5, seed: 200};

  // camera per shot: [scale, focus x, focus y]
  let cam = {s: 1, x: 640, y: 360};
  if (inShot(t, SHOT.wide)) cam = {s: lerp(t, 0, 3.77, 1.0, 1.1), x: 640, y: 420};
  if (inShot(t, SHOT.shout)) cam = {s: 2.1, x: 640, y: 470};
  if (inShot(t, SHOT.river)) cam = {s: lerp(t, 4.95, 10.5, 1.18, 1.02), x: 640, y: 420};

  const scarfExpr = inShot(t, SHOT.shout) ? 'shocked' : t > 7 ? 'worried' : 'neutral';
  const look = inShot(t, SHOT.river) ? Math.sin((t - 5) * 1.3) : 0;

  if (inShot(t, SHOT.close)) {
    const tc = t;
    const walkIn = lerp(tc, 10.5, 10.95, 1, 0);
    const manX = 640 + walkIn * 700;
    const lean = tc > 14.6 && tc < 15.3 ? lerp(tc, 14.6, 14.9, 0, -9) : tc >= 15.3 ? lerp(tc, 15.3, 15.6, -9, 7) : 0;
    const sexpr = tc < 12.6 ? 'shocked' : 'worried';
    const riceUp = lerp(tc, 11.5, 12.1, 0, 1) * lerp(tc, 16.2, 16.6, 1, 0.6);
    const gaze: [number, number] = tc < 13.2 ? [-0.3, 0.1] : [0.3, 1];
    const chew = tc > 12.1 ? Math.abs(Math.sin(tc * 6)) : 0;
    return (
      <AbsoluteFill style={{background: '#1a1e33'}}>
        <svg width={W} height={H}>
          <g style={{filter: 'blur(7px)'}}>
            {plate ? <Plate src="plate2.png" /> : <g transform="translate(-260 -120) scale(1.6)"><Station t={t} /></g>}
            <Crowd t={t} layer={{n: 12, y: 700, scale: 0.9, speed: 90, blur: 0, seed: 300}} centerX={-999} />
          </g>
          <rect width={W} height={H} fill="rgba(20,16,30,.25)" />
          <g transform="translate(250 140) scale(1.7)">
            <Scarf2D t={t} expr={sexpr} look={tc < 13.2 ? 1 : 0.4} lean={lean} arms={lean !== 0 ? 'lean' : 'rest'} blink={isBlink(t, 0.7)} />
          </g>
          <g transform={`translate(${manX} 123) scale(1.25)`}>
            <RiceBallMan phase={tc * 9} walking={walkIn > 0.02} gaze={gaze} chew={chew} riceUp={riceUp} />
          </g>
          <g transform={`translate(${-40 + ((t * 260) % 1700) - 200} 360) scale(1.6)`} style={{filter: 'blur(9px)'}}>
            <Commuter i={77} phase={t * 12} facing={1} />
          </g>
        </svg>
        <Grade frame={frame} />
        <Audio src={staticFile('narr_a.wav')} />
      </AbsoluteFill>
    );
  }

  const rings = inShot(t, SHOT.shout)
    ? [0, 0.25, 0.5].map((d) => {
        const k = (t - 3.8 - d) / 0.7;
        return k > 0 && k < 1 ? <circle key={d} cx={640} cy={430} r={20 + k * 120} fill="none" stroke="#fff" strokeWidth={4 * (1 - k)} opacity={1 - k} /> : null;
      })
    : null;

  return (
    <AbsoluteFill style={{background: '#1a1e33'}}>
      <svg width={W} height={H}>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.s}) translate(${-cam.x} ${-cam.y})`}>
          {plate ? <Plate src="plate1.png" /> : <Station t={t} />}
          <Crowd t={t} layer={back} centerX={cx} />
          <g transform="translate(585 418) scale(0.62)">
            <Scarf2D
              t={t}
              expr={scarfExpr}
              look={look}
              arms={inShot(t, SHOT.shout) ? 'shout' : 'rest'}
              blink={isBlink(t)}
            />
          </g>
          {rings}
          <Crowd t={t} layer={mid} centerX={cx} />
          <Crowd t={t} layer={front} centerX={-999} />
        </g>
      </svg>
      <FactPill t={t} />
      <Grade frame={frame} />
      <Audio src={staticFile('narr_a.wav')} />
    </AbsoluteFill>
  );
};
