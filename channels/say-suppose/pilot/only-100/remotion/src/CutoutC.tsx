// Cut-out test (owner, 2026-11-27): painted GPT Image set and parts, animated here. Same rice-ball moment and beats
// as MotionC. Joints are in sheet pixels of each piece (see cutout/slice.py); each puppet is scaled as a whole.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {FPS, W, H, sec} from './timing';
import {keys, LIN, OUT, BACK, drift, blinkAt, Key} from './rig';
import {Part, Face, Shadow, out} from './Puppet';
import {Grade} from './Overlays';
import {MOTION_START, MOTION_SECONDS} from './MotionC';

type Arm = {a: number; f: number}; // upper outward angle, forearm angle relative to the upper arm

type ScarfCutPose = {
  lean: number; headTilt: number; open: number; lid: number; pupil: [number, number];
  browLift: number; browSad: number; armL: Arm; armR: Arm; tail: number; sweat: number; bob: number;
};

const ScarfCut: React.FC<{x: number; y: number; s: number; p: ScarfCutPose}> = ({x, y, s, p}) => {
  const er = 52 * p.open;
  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={300} rx={er * 0.9} ry={er} fill="#fbf8f0" />
      <circle cx={cx + p.pupil[0] * er * 0.4} cy={304 + p.pupil[1] * er * 0.4} r={Math.max(15, 24 - (p.open - 1) * 30)} fill="#111116" />
      <circle cx={cx + p.pupil[0] * er * 0.4 + 7} cy={296 + p.pupil[1] * er * 0.4} r={6} fill="#fff" opacity={0.9} />
      {p.lid > 0.02 && <rect x={cx - er} y={300 - er - 2} width={er * 2} height={er * 2 * p.lid + 2} fill="#15151a" />}
      {p.lid > 0.6 && <path d={`M${cx - er * 0.8} ${300 + er * (2 * p.lid - 1)} q${er * 0.8} 10 ${er * 1.6} 0`} stroke="#fbf8f0" strokeWidth={10} fill="none" strokeLinecap="round" />}
    </g>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `rotate(${p.lean}deg) translateY(${p.bob}px)`}}>
        <Part src="scarf_1.png" w={614} h={716} pivot={[307, 690]} at={[0, -500]}>
          <Part src="scarf_3.png" w={180} h={527} pivot={[90, 22]} at={[220, 680]} z={-1} />
          <Part src="scarf_4.png" w={180} h={527} pivot={[90, 22]} at={[394, 680]} z={-1} />
          <Part src="scarf_5.png" w={193} h={442} pivot={[112, 46]} at={[96, 160]} rot={out(p.armL.a, -1)} z={-1}>
            <Part src="scarf_7.png" w={152} h={413} pivot={[76, 44]} at={[92, 402]} rot={out(p.armL.f, -1)} z={-1} />
          </Part>
          <Part src="scarf_6.png" w={187} h={443} pivot={[76, 46]} at={[518, 160]} rot={out(p.armR.a, 1)} z={-1}>
            <Part src="scarf_8.png" w={152} h={415} pivot={[76, 44]} at={[96, 404]} rot={out(p.armR.f, 1)} z={-1} />
          </Part>
          <Part src="scarf_0.png" w={599} h={610} pivot={[300, 585]} at={[307, 95]} rot={p.headTilt} z={1}>
            <Face w={599} h={610}>
              {eye(222)}
              {eye(378)}
              <g stroke="#f4f1ea" strokeWidth={15} strokeLinecap="round">
                <line x1={175} y1={205 - p.browLift + p.browSad} x2={265} y2={205 - p.browLift - p.browSad} />
                <line x1={335} y1={205 - p.browLift - p.browSad} x2={425} y2={205 - p.browLift + p.browSad} />
              </g>
              {p.sweat > 0.01 && <path d={`M520 ${150 + p.sweat * 20} q26 44 0 62 q-26 -18 0 -62z`} fill="#9bd8ff" stroke="#fff" strokeWidth={5} opacity={p.sweat} />}
            </Face>
          </Part>
          <Part src="scarf_2.png" w={425} h={324} pivot={[50, 60]} at={[455, 70]} rot={p.tail} z={2} />
        </Part>
      </div>
    </div>
  );
};

type ManCutPose = {
  phase: number; walk: number; lean: number; headTilt: number; headDip: number;
  pupil: [number, number]; lid: number; rice: Arm; free: number;
};

const ManCut: React.FC<{x: number; y: number; s: number; p: ManCutPose}> = ({x, y, s, p}) => {
  const ph = p.phase, w = p.walk;
  const thigh = (o: number) => Math.sin(ph + o) * 8 * w;
  const shin = (o: number) => -Math.max(0, Math.sin(ph + o + 1.3)) * 24 * w;
  const bob = -Math.abs(Math.cos(ph)) * 16 * w;
  const eye = (cx: number) => <ellipse cx={cx + p.pupil[0] * 12} cy={378 + p.pupil[1] * 12} rx={17} ry={22 * (1 - p.lid) + 2} fill="#1b1414" />;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `rotate(${p.lean}deg) translateY(${bob}px)`}}>
        <Part src="man_1.png" w={568} h={717} pivot={[284, 700]} at={[0, -1150]}>
          <Part src="man_7.png" w={233} h={624} pivot={[117, 40]} at={[373, 680]} rot={thigh(Math.PI)} z={-2}>
            <Part src="man_9.png" w={218} h={618} pivot={[109, 30]} at={[117, 585]} rot={shin(Math.PI)} z={-1} />
          </Part>
          <Part src="man_6.png" w={234} h={623} pivot={[117, 40]} at={[195, 680]} rot={thigh(0)} z={-1}>
            <Part src="man_8.png" w={218} h={618} pivot={[109, 30]} at={[117, 585]} rot={shin(0)} z={-1} />
          </Part>
          <Part src="man_3.png" w={282} h={565} pivot={[90, 55]} at={[500, 130]} rot={out(p.free, 1) + 12} z={-1}>
            <Part src="man_5.png" w={262} h={648} pivot={[128, 45]} at={[190, 512]} rot={out(6 + 6 * w, 1)} z={-1} />
          </Part>
          <Part src="man_0.png" w={579} h={636} pivot={[290, 610]} at={[284, 60 + p.headDip]} rot={p.headTilt} z={1}>
            <Face w={579} h={636}>
              {eye(228)}
              {eye(352)}
              <g stroke="#2a1d18" strokeWidth={13} strokeLinecap="round">
                <line x1={190} y1={322} x2={262} y2={326} />
                <line x1={318} y1={326} x2={390} y2={322} />
              </g>
            </Face>
          </Part>
          <Part src="man_2.png" w={287} h={563} pivot={[195, 55]} at={[68, 130]} rot={out(p.rice.a, -1) - 10} z={2}>
            <Part src="man_4.png" w={270} h={646} pivot={[140, 45]} at={[92, 512]} rot={out(p.rice.f, -1)} z={0}>
              <Part src="man_10.png" w={260} h={229} pivot={[130, 150]} at={[150, 560]} rot={-out(p.rice.a + p.rice.f, -1) + 10} z={2} />
            </Part>
          </Part>
        </Part>
      </div>
    </div>
  );
};

const SCARF_LEAN: Key[] = [[0.85, 0], [1.02, -4, OUT], [1.5, -1.5], [4.0, -1.5], [4.15, -3], [4.55, 6, BACK], [5.25, 6], [5.7, 0]];

export const scarfAt = (l: number): ScarfCutPose => {
  const lean = keys(l, SCARF_LEAN);
  const wave = l > 4.45 && l < 5.25 ? Math.sin((l - 4.45) * 14) * 22 * Math.sin(((l - 4.45) / 0.8) * Math.PI) : 0;
  return {
    lean,
    bob: Math.sin(l * 2.1) * 4,
    headTilt: keys(l, [[4.15, 0], [4.55, 6, BACK], [5.25, 6], [5.7, -4]]),
    open: keys(l, [[0.85, 1], [1.02, 1.25, BACK], [2.6, 1.18], [3.0, 1.0], [4.4, 1.0], [4.55, 1.12, BACK], [5.3, 1.08], [5.7, 0.92]]),
    lid: blinkAt(l, [0.4, 2.35, 3.95, 5.85]),
    pupil: [
      keys(l, [[0, -0.3], [0.5, 0.2], [1.0, 0.9], [2.95, 0.9], [3.2, 0.7], [3.6, 0.7], [3.85, 0.9], [5.3, 0.9], [5.7, 0.2]]),
      keys(l, [[2.95, 0], [3.2, -0.7], [3.6, -0.7], [3.85, 0], [5.3, 0], [5.7, 0.5]]),
    ],
    browLift: keys(l, [[0.85, 0], [1.02, 40, BACK], [2.6, 32], [3.0, 14], [4.4, 14], [4.55, 36], [5.3, 32], [5.7, 6]]),
    browSad: keys(l, [[2.7, 0], [3.1, 16], [5.3, 16], [5.7, 26]]),
    armL: {a: keys(l, [[0.9, 6], [1.05, 22, BACK], [1.6, 6], [5.3, 6], [5.7, 2]]), f: keys(l, [[0.9, 0], [1.05, 25, BACK], [1.6, 0]])},
    armR: {
      a: keys(l, [[0.9, 6], [1.05, 24, BACK], [1.6, 6], [4.0, 6], [4.15, 2], [4.55, 100, BACK], [5.25, 100], [5.6, 2]]),
      f: keys(l, [[0.9, 0], [1.05, 30, BACK], [1.6, 0], [4.0, 0], [4.15, -4], [4.55, 30, BACK], [5.25, 30], [5.6, 0]]) + wave,
    },
    tail: (lean - keys(l - 0.15, SCARF_LEAN)) * 3 + Math.sin(l * 1.7) * 4,
    sweat: keys(l, [[3.0, 0], [3.3, 1]]),
  };
};

const STRIDE = 150; // screen px the man covers per full walk cycle at his scale
export const manAt = (l: number, stride = STRIDE) => {
  const x = keys(l, [[0, 1120], [0.8, 860, LIN], [1.2, 770, OUT]]);
  const walk = keys(l, [[0, 1], [0.85, 1], [1.2, 0, OUT]]);
  const chew = l > 2.0 ? Math.abs(Math.sin(l * 10)) * 6 : 0;
  const phase = ((1120 - x) / stride) * Math.PI * 2;
  return {
    x,
    p: {
      phase,
      walk,
      lean: keys(l, [[0.95, 0], [1.12, -3, OUT], [1.45, 0.6], [1.7, 0]]),
      headTilt: keys(l, [[2.9, 0], [3.3, 5]]),
      headDip: keys(l, [[1.9, 0], [2.0, 14], [2.15, 0], [2.5, 0], [2.6, 14], [2.75, 0]]) + chew,
      pupil: [keys(l, [[0, -0.7], [1.1, -0.4], [2.9, -0.4], [3.25, 0.8]]), keys(l, [[2.9, 0.1], [3.25, -0.9]])] as [number, number],
      lid: blinkAt(l, [2.2, 4.9]),
      free: 4 - Math.sin(phase) * 8 * walk,
      rice: {
        a: keys(l, [[0, 4 + Math.sin(phase) * 8 * walk], [1.1, 4], [1.28, 8], [1.75, -22, BACK]]),
        f: keys(l, [[0, 2], [1.1, 2], [1.28, 6], [1.75, -138, BACK], [1.95, -146], [2.1, -138], [2.55, -146], [2.7, -138]]),
      },
    } as ManCutPose,
  };
};

export const CutoutC: React.FC = () => {
  const frame = useCurrentFrame();
  const l = frame / FPS;
  const s = keys(l, [[0, 1.0], [MOTION_SECONDS, 1.06, LIN]]);
  const cx = keys(l, [[0, -18], [MOTION_SECONDS, 22, LIN]]) + drift(l, 2.2);
  const cy = drift(l, 1.6, 3);
  const cam = (k: number): React.CSSProperties => ({
    position: 'absolute', inset: 0, transformOrigin: '50% 60%',
    transform: `scale(${1 + (s - 1) * k}) translate(${-cx * k}px, ${-cy * k}px)`,
  });
  const man = manAt(l);
  return (
    <AbsoluteFill style={{background: '#2a2438', overflow: 'hidden'}}>
      <div style={cam(0.5)}>
        <Img src={staticFile('cut/set_close.png')} style={{position: 'absolute', left: -60, top: -40, width: W + 120, height: H + 70, filter: 'blur(1.5px)'}} />
      </div>
      <div style={cam(1)}>
        <Shadow x={430} y={650} w={190} />
        <Shadow x={man.x} y={650} w={210} />
        <ScarfCut x={430} y={650} s={0.235} p={scarfAt(l)} />
        <ManCut x={man.x} y={650} s={0.205} p={man.p} />
      </div>
      <Grade frame={frame} />
      <Audio src={staticFile('narr_a.wav')} startFrom={sec(MOTION_START)} />
    </AbsoluteFill>
  );
};
