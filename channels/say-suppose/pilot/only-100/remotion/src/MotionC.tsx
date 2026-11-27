// Motion test (owner, 2026-11-27: "movements are flaky"): the rice-ball moment (narration 10.5-16.7 s) redone the
// way the benchmarks move. One hero action at a time, every change eased with anticipation and settle, a held
// painted set, a slow camera push with soft drift, and the crowd kept soft and out of focus.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS, W, H, sec} from './timing';
import {keys, LIN, OUT, BACK, drift, blinkAt, Key} from './rig';
import {ScarfRig} from './ScarfRig';
import {ManRig} from './ManRig';
import {Commuter} from './People2D';
import {Grade} from './Overlays';

export const MOTION_START = 10.5;
export const MOTION_SECONDS = 6.2;

const SCARF_LEAN: Key[] = [[0.85, 0], [1.02, -5, OUT], [1.5, -2], [4.0, -2], [4.15, -4], [4.55, 8, BACK], [5.25, 8], [5.7, 0]];

const scarfPose = (l: number) => {
  const lean = keys(l, SCARF_LEAN);
  const swing = lean - keys(l - 0.15, SCARF_LEAN);
  const wave = l > 4.45 && l < 5.25 ? Math.sin((l - 4.45) * 14) * 20 * Math.sin(((l - 4.45) / 0.8) * Math.PI) : 0;
  return {
    t: l,
    lean,
    headTilt: keys(l, [[4.15, 0], [4.55, 7, BACK], [5.25, 7], [5.7, -4]]),
    open: keys(l, [[0.85, 1], [1.02, 1.28, BACK], [2.6, 1.2], [3.0, 1.0], [4.4, 1.0], [4.55, 1.15, BACK], [5.3, 1.1], [5.7, 0.92]]),
    lid: blinkAt(l, [0.4, 2.35, 3.95, 5.85]),
    pupil: [
      keys(l, [[0, -0.3], [0.5, 0.2], [1.0, 0.9], [2.95, 0.9], [3.2, 0.75], [3.6, 0.75], [3.85, 0.9], [5.3, 0.9], [5.7, 0.3]]),
      keys(l, [[2.95, 0], [3.2, -0.7], [3.6, -0.7], [3.85, 0], [5.3, 0], [5.7, 0.5]]),
    ] as [number, number],
    browLift: keys(l, [[0.85, 0], [1.02, 11, BACK], [2.6, 9], [3.0, 4], [4.4, 4], [4.55, 10], [5.3, 9], [5.7, 2]]),
    browSad: keys(l, [[2.7, 0], [3.1, 4], [5.3, 4], [5.7, 7]]),
    armL: {
      a: keys(l, [[0.9, 12], [1.05, 28, BACK], [1.6, 12], [5.3, 12], [5.7, 5]]),
      f: keys(l, [[0.9, 8], [1.05, 40, BACK], [1.6, 8], [5.3, 8], [5.7, 2]]),
    },
    armR: {
      a: keys(l, [[0.9, 12], [1.05, 30, BACK], [1.6, 12], [4.0, 12], [4.15, 6], [4.55, 95, BACK], [5.25, 95], [5.6, 6]]),
      f: keys(l, [[0.9, 8], [1.05, 45, BACK], [1.6, 8], [4.0, 8], [4.15, 2], [4.55, 125, BACK], [5.25, 125], [5.6, 2]]) + wave,
    },
    tail: swing * 2.2 + Math.sin(l * 1.7) * 3,
    sweat: keys(l, [[3.0, 0], [3.3, 1]]),
  };
};

const manPose = (l: number) => {
  const walk = keys(l, [[0, 1], [0.75, 1], [1.0, 0, OUT]]);
  const phase = 11 * Math.min(l, 1.0);
  const chew = l > 2.0 ? Math.abs(Math.sin(l * 10)) * 1.6 : 0;
  return {
    x: keys(l, [[0, 1180], [0.55, 940, LIN], [1.0, 700, OUT]]),
    pose: {
      t: l,
      phase,
      walk,
      lean: keys(l, [[0.85, 0], [1.02, -4, OUT], [1.4, 0.5], [1.6, 0]]),
      headTilt: keys(l, [[2.9, 0], [3.3, 4]]),
      headDip: keys(l, [[1.9, 0], [2.0, 5], [2.15, 0], [2.5, 0], [2.6, 5], [2.75, 0]]) + chew,
      pupil: [keys(l, [[0, -0.6], [1.0, -0.3], [2.9, -0.3], [3.25, 0.75]]), keys(l, [[2.9, 0.1], [3.25, -0.8]])] as [number, number],
      lid: blinkAt(l, [2.2, 4.9]),
      rice: {
        a: keys(l, [[0, 8 + Math.sin(phase) * 14 * walk], [1.1, 8], [1.28, 12], [1.75, -20, BACK]]),
        f: keys(l, [[0, 4 + Math.sin(phase) * 14 * walk], [1.1, 4], [1.28, 10], [1.75, -168, BACK], [1.95, -160], [2.1, -168], [2.55, -160], [2.7, -168]]),
      },
    },
  };
};

export const MotionC: React.FC = () => {
  const frame = useCurrentFrame();
  const l = frame / FPS;
  const s = keys(l, [[0, 1.0], [MOTION_SECONDS, 1.06, LIN]]);
  const cx = 640 + keys(l, [[0, -20], [MOTION_SECONDS, 25, LIN]]) + drift(l, 2.2);
  const cy = 360 + drift(l, 1.6, 3);
  const cam = (k: number) => `translate(${W / 2} ${H / 2}) scale(${1 + (s - 1) * k}) translate(${-(640 + (cx - 640) * k)} ${-(360 + (cy - 360) * k)})`;
  const man = manPose(l);
  const passer = l > 5.5 ? keys(l, [[5.5, -500], [6.2, 1500, LIN]]) : null;
  return (
    <AbsoluteFill style={{background: '#2a2438'}}>
      <svg width={W} height={H}>
        <g transform={cam(0.4)} style={{filter: 'blur(5px)'}}>
          <image href={staticFile('plate2.png')} x={-80} y={-70} width={W + 160} height={H + 140} preserveAspectRatio="xMidYMid slice" />
        </g>
        <g transform={cam(0.7)} style={{filter: 'blur(9px)'}} opacity={0.6}>
          {[0, 1, 2, 3, 4].map((k) => {
            const dir = k % 2 ? 1 : -1;
            const x = ((((k * 330 + dir * 45 * l) % 1700) + 1700) % 1700) - 200;
            return (
              <g key={k} transform={`translate(${x} ${300}) scale(1.5)`}>
                <Commuter i={k + 11} phase={l * 6 + k} facing={dir as 1 | -1} />
              </g>
            );
          })}
        </g>
        <rect width={W} height={H} fill="rgba(30,22,40,.18)" />
        <g transform={cam(1)}>
          <g transform="translate(285 95) scale(2.35)">
            <ScarfRig {...scarfPose(l)} />
          </g>
          <g transform={`translate(${man.x} 112) scale(1.45)`}>
            <ManRig {...man.pose} />
          </g>
        </g>
        {passer !== null && (
          <g transform={`translate(${passer} 60) scale(2.8)`} style={{filter: 'blur(16px)'}}>
            <Commuter i={77} phase={l * 12} facing={1} />
          </g>
        )}
      </svg>
      <Grade frame={frame} />
      <Audio src={staticFile('narr_a.wav')} startFrom={sec(MOTION_START)} />
    </AbsoluteFill>
  );
};
