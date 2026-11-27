// v4 cast (owner, 2026-11-27): the tall faded-grey Scarf and the style A lineup, rigged on Person. Scarf4 and Man4
// take the same poses as Scarf2 and Man2, and the same `s`: the drawn height is SCARF_H * s (MAN_H * s), so the film's
// framing code works unchanged.
import React from 'react';
import {Part} from './Puppet';
import {Person} from './Person';
import type {Parts} from './castData';
import type {ScarfCutPose, ManCutPose} from './Cast2';
import {SCARF, SALARY, PROPS} from './castV4';
import {SCARF_H, MAN_H, personH} from './FilmParts';

const kOf = (parts: Parts, legacyH: number, s: number) => (s * legacyH) / personH(parts);

// Face centre on screen for a puppet with feet at `feet` drawn at legacy scale s.
export const faceY = (parts: Parts, legacyH: number, feet: number, s: number) => {
  const k = kOf(parts, legacyH, s);
  return feet - personH(parts) * k + parts.head.h * (parts.face?.[1] ?? 0.6) * k;
};
export const scarfFaceY = (feet: number, s: number) => faceY(SCARF, SCARF_H, feet, s);
export const manFaceY = (feet: number, s: number) => faceY(SALARY, MAN_H, feet, s);
export const manK = (s: number) => kOf(SALARY, MAN_H, s);

export const Scarf4: React.FC<{x: number; y: number; s: number; p: ScarfCutPose}> = ({x, y, s, p}) => (
  <Person
    parts={SCARF}
    x={x}
    y={y}
    s={kOf(SCARF, SCARF_H, s)}
    p={{
      lean: p.lean, headTilt: p.headTilt, pupil: p.pupil, lid: p.lid, open: 0.85 + 0.15 * p.open,
      browLift: p.browLift, browSad: p.browSad, mouth: Math.max(0, (p.open - 1.05) * 3), bob: p.bob * 2,
      armL: p.armL, armR: p.armR, turn: 0,
    }}
  />
);

export const RiceBall: React.FC<{rot?: number}> = ({rot = 0}) => (
  <div style={{position: 'absolute', transform: `rotate(${rot}deg) translate(${-PROPS.rice.w / 2}px, ${-PROPS.rice.h * 0.35}px)`, transformOrigin: '0 0'}}>
    <Part src={PROPS.rice.src} w={PROPS.rice.w} h={PROPS.rice.h} pivot={[0, 0]} at={[0, 0]} />
  </div>
);

export const Man4: React.FC<{x: number; y: number; s: number; p: ManCutPose}> = ({x, y, s, p}) => {
  const turn = p.turn ?? 0;
  return (
    <Person
      parts={SALARY}
      x={x}
      y={y}
      s={manK(s)}
      p={{
        phase: p.phase, walk: p.walk, dir: turn > 0.05 ? 1 : -1, lean: p.lean, headTilt: p.headTilt,
        headDip: p.headDip * (SALARY.head.h / 538), pupil: p.pupil, lid: p.lid, turn,
        armL: p.rice, holdL: <RiceBall rot={-(p.rice.a + p.rice.f)} />, armR: {a: p.free, f: 5 + 5 * p.walk},
      }}
    />
  );
};
