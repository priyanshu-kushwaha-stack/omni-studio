import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {Person as PilotPerson} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/Person';
import {SCARFC, SALARY} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/castV4';
import {Person} from '../src/rig/Person';

const POSES = [
  {},
  {phase: 1.3, walk: 1, dir: 1 as const, turn: 0.6},
  {big: true, smile: 0.8, lid: 0.5, browLift: 20, armL: {a: 140, f: 15}, armR: {a: 30, f: -40}, mouth: 0.7},
  {eyes: 0, headTilt: -8, headDip: 12, armRFront: true},
];

describe('rig parity with pilot v8', () => {
  for (const [name, parts] of [['scarf', SCARFC], ['salary', SALARY]] as const) {
    POSES.forEach((p, i) => {
      it(`${name} pose ${i}`, () => {
        const a = renderToStaticMarkup(<Person parts={parts} x={100} y={600} s={0.3} p={p} />);
        const b = renderToStaticMarkup(<PilotPerson parts={parts} x={100} y={600} s={0.3} p={p} />);
        expect(a).toBe(b);
      });
    });
  }
});
