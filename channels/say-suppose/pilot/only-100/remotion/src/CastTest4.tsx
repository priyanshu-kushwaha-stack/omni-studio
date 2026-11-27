// Rig check for the v4 cast: all eight on the close set, standing (top) and mid-stride (frame > 15).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person} from './Person';
import {SetImg, personH} from './FilmParts';
import {SCARF, SALARY, OFFICE, STUDENT, GENT, GRAN, PACKER, WORKER} from './castV4';

const ALL = [SCARF, SALARY, OFFICE, STUDENT, GENT, GRAN, PACKER, WORKER];

export const CastTest4: React.FC = () => {
  const f = useCurrentFrame();
  const walk = f > 15 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SetImg which="close" blur={2} />
      {ALL.map((p, i) => {
        const hpx = i === 0 ? 420 : 370;
        return <Person key={i} parts={p} x={90 + i * 150} y={660} s={hpx / personH(p)} p={{walk, phase: f * 0.3 + i, armR: i === 0 && !walk ? {a: 130, f: 30} : undefined, mouth: i === 1 ? 1 : 0, browSad: i === 0 ? 20 : 0}} />;
      })}
    </AbsoluteFill>
  );
};
