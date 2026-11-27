// Refined cut-out cast (owner, 2026-11-27: "close, refine first"). Both puppets come from ONE GPT Image parts sheet
// (job 603bfb4f), so they share one drawing style. Joints are in each piece's own pixels; pieces live in public/cut2.
import React from 'react';
import {Part, Face, out} from './Puppet';

export type Arm = {a: number; f: number}; // upper outward angle, forearm angle relative to the upper arm

export type ScarfCutPose = {
  lean: number; headTilt: number; open: number; lid: number; pupil: [number, number];
  browLift: number; browSad: number; armL: Arm; armR: Arm; tail: number; sweat: number; bob: number;
};

const c = (n: string) => `cut2/${n}.png`;

export const Scarf2: React.FC<{x: number; y: number; s: number; p: ScarfCutPose}> = ({x, y, s, p}) => {
  const er = 40 * p.open;
  const ey = 238;
  const eye = (cx: number) => {
    const px = cx + p.pupil[0] * er * 0.42, py = ey + 3 + p.pupil[1] * er * 0.42;
    return (
      <g>
        <ellipse cx={cx} cy={ey} rx={er * 0.9} ry={er} fill="#fbf8f0" />
        <circle cx={px} cy={py} r={Math.max(12, 19 - (p.open - 1) * 24)} fill="#111116" />
        <circle cx={px + 6} cy={py - 7} r={5} fill="#fff" opacity={0.9} />
        {p.lid > 0.02 && <rect x={cx - er} y={ey - er - 2} width={er * 2} height={er * 2 * p.lid + 2} fill="#16151c" />}
        {p.lid > 0.6 && <path d={`M${cx - er * 0.8} ${ey + er * (2 * p.lid - 1)} q${er * 0.8} 8 ${er * 1.6} 0`} stroke="#fbf8f0" strokeWidth={8} fill="none" strokeLinecap="round" />}
      </g>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `rotate(${p.lean}deg) translateY(${p.bob}px)`}}>
        <Part src={c('s_torso')} w={408} h={546} pivot={[204, 528]} at={[0, -425]}>
          <Part src={c('s_legL')} w={136} h={445} pivot={[78, 16]} at={[150, 520]} z={-1} />
          <Part src={c('s_legR')} w={135} h={444} pivot={[78, 16]} at={[262, 520]} z={-1} />
          <Part src={c('s_uarmL')} w={149} h={426} pivot={[80, 36]} at={[62, 112]} rot={out(p.armL.a, -1)} z={-1}>
            <Part src={c('s_farmL')} w={117} h={393} pivot={[60, 30]} at={[72, 396]} rot={out(p.armL.f, -1)} z={-1} />
          </Part>
          <Part src={c('s_uarmR')} w={142} h={426} pivot={[66, 36]} at={[346, 112]} rot={out(p.armR.a, 1)} z={-1}>
            <Part src={c('s_farmR')} w={118} h={393} pivot={[60, 30]} at={[72, 396]} rot={out(p.armR.f, 1)} z={-1} />
          </Part>
          <Part src={c('s_head')} w={468} h={487} pivot={[234, 466]} at={[204, 62]} rot={p.headTilt} z={1}>
            <Face w={468} h={487}>
              {eye(176)}
              {eye(292)}
              <g stroke="#f4f1ea" strokeWidth={12} strokeLinecap="round">
                <line x1={140} y1={168 - p.browLift + p.browSad} x2={210} y2={168 - p.browLift - p.browSad} />
                <line x1={258} y1={168 - p.browLift - p.browSad} x2={328} y2={168 - p.browLift + p.browSad} />
              </g>
              {p.sweat > 0.01 && <path d={`M405 ${110 + p.sweat * 16} q22 36 0 52 q-22 -16 0 -52z`} fill="#9bd8ff" stroke="#fff" strokeWidth={4} opacity={p.sweat} />}
            </Face>
          </Part>
          <Part src={c('s_tail')} w={347} h={197} pivot={[36, 44]} at={[300, 52]} rot={p.tail + 38} z={2} />
        </Part>
      </div>
    </div>
  );
};

export type ManCutPose = {
  phase: number; walk: number; lean: number; headTilt: number; headDip: number;
  pupil: [number, number]; lid: number; rice: Arm; free: number; turn?: number;
};

export const Man2: React.FC<{x: number; y: number; s: number; p: ManCutPose}> = ({x, y, s, p}) => {
  const ph = p.phase, w = p.walk;
  const thigh = (o: number) => Math.sin(ph + o) * 14 * w;
  const shin = (o: number) => -Math.max(0, Math.sin(ph + o + 1.3)) * 30 * w;
  const bob = -Math.abs(Math.cos(ph)) * 14 * w;
  const turn = p.turn ?? 0;
  const eye = (cx: number) => <ellipse cx={cx + turn * 26 + p.pupil[0] * 10} cy={322 + p.pupil[1] * 10} rx={14} ry={18 * (1 - p.lid) + 2} fill="#1b1414" />;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `rotate(${p.lean + turn * 3 * w}deg) translateY(${bob}px) scaleX(${1 - 0.16 * Math.abs(turn)})`}}>
        <Part src={c('m_torso')} w={460} h={646} pivot={[230, 632]} at={[0, -600]}>
          <Part src={c('m_thighR')} w={127} h={285} pivot={[63, 22]} at={[318, 618]} rot={thigh(Math.PI)} z={-2}>
            <Part src={c('m_shinR')} w={174} h={375} pivot={[62, 16]} at={[63, 262]} rot={shin(Math.PI)} z={-1} />
          </Part>
          <Part src={c('m_thighL')} w={127} h={285} pivot={[63, 22]} at={[142, 618]} rot={thigh(0)} z={-1}>
            <Part src={c('m_shinL')} w={165} h={375} pivot={[62, 16]} at={[63, 262]} rot={shin(0)} z={-1} />
          </Part>
          <Part src={c('m_uarmR')} w={147} h={418} pivot={[70, 36]} at={[412, 104]} rot={out(p.free, 1)} z={-1}>
            <Part src={c('m_farmR')} w={145} h={510} pivot={[72, 30]} at={[72, 390]} rot={out(5 + 5 * w, 1)} z={-1} />
          </Part>
          <Part src={c('m_head')} w={481} h={538} pivot={[240, 520]} at={[230 + turn * 32, 40 + p.headDip]} rot={p.headTilt} z={1}>
            <Face w={481} h={538}>
              {eye(190)}
              {eye(292)}
              <g stroke="#2a1d18" strokeWidth={11} strokeLinecap="round">
                <line x1={160 + turn * 26} y1={272} x2={218 + turn * 26} y2={276} />
                <line x1={264 + turn * 26} y1={276} x2={322 + turn * 26} y2={272} />
              </g>
            </Face>
          </Part>
          <Part src={c('m_uarmL')} w={150} h={416} pivot={[78, 36]} at={[48, 104]} rot={out(p.rice.a, -1)} z={2}>
            <Part src={c('m_farmL')} w={146} h={509} pivot={[73, 30]} at={[74, 390]} rot={out(p.rice.f, -1)} z={0}>
              <Part src={c('m_rice')} w={214} h={191} pivot={[107, 120]} at={[73, 440]} rot={-out(p.rice.a + p.rice.f, -1)} z={2} />
            </Part>
          </Part>
        </Part>
      </div>
    </div>
  );
};
