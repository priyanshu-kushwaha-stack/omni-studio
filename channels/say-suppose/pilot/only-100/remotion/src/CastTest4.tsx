// Rig check for the v4 cast: all eight on the close set, standing (top) and mid-stride (frame > 15).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person} from './Person';
import {SetImg, personH} from './FilmParts';
import {SCARF, SCARFC, SALARY, OFFICE, STUDENT, GENT, GRAN, PACKER, WORKER} from './castV4';

const ALL = [SCARF, SCARFC, SALARY, OFFICE, STUDENT, GENT, GRAN, PACKER, WORKER];
const MOODS = [{smile: -0.8, browSad: 22}, {smile: 0.9, lid: 0.5}, {}, {}, {}, {}, {}, {}, {}];

export const CastTest4: React.FC = () => {
  const f = useCurrentFrame();
  const walk = f > 15 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SetImg which="close" blur={2} />
      {ALL.map((p, i) => {
        const hpx = i < 2 ? 420 : 370;
        return <Person key={i} parts={p} x={75 + i * 141} y={660} s={hpx / personH(p)} p={{walk, phase: f * 0.3 + i, big: i < 2, ...MOODS[i], mouth: i === 1 && walk ? 1 : 0}} />;
      })}
    </AbsoluteFill>
  );
};
