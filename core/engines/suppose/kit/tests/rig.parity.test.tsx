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

const arcs = (m: string) => [...m.matchAll(/<path[^>]*data-mouth-arc[^>]*>/g)].map((x) => x[0]);
const ys = (tag: string) => {
  const n = [...tag.match(/d="([^"]+)"/)![1].matchAll(/-?\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
  return {y0: n[1], cy: n[3], y1: n[5]};
};
describe('opt-in mouth arc on supporting cast', () => {
  const render = (p: object) => renderToStaticMarkup(<Person parts={SALARY} x={100} y={600} s={0.3} p={p} />);
  it('without mouthArc a smile does not change a non-big face (matches the pilot)', () => {
    const p = {smile: 0.8};
    expect(render(p)).toBe(renderToStaticMarkup(<PilotPerson parts={SALARY} x={100} y={600} s={0.3} p={p} />));
    expect(arcs(render(p))).toHaveLength(0);
  });
  it('mouthArc with smile 0.6 draws a curve below its ends, smile -0.6 above them', () => {
    const up = arcs(render({mouthArc: true, smile: 0.6}));
    const down = arcs(render({mouthArc: true, smile: -0.6}));
    expect(up).toHaveLength(1);
    expect(down).toHaveLength(1);
    const u = ys(up[0]), d = ys(down[0]);
    expect(u.cy).toBeGreaterThan(u.y1); // control point below the ends: a smile
    expect(d.cy).toBeLessThan(d.y1); // above: a frown
    expect(u.cy - u.y1).toBeCloseTo(-(d.cy - d.y1), 6);
  });
  it('mouthArc without a smile draws nothing extra', () => {
    expect(render({mouthArc: true})).toBe(render({}));
  });
  it('a v4 part shows one mouth: the arc replaces the resting mouth, smile 0 keeps it', () => {
    const count = (m: string) => (m.match(/<path/g) ?? []).length;
    const rest = render({});
    const withArc = render({mouthArc: true, smile: 0.6});
    expect(arcs(withArc)).toHaveLength(1);
    expect(count(withArc)).toBe(count(rest));
    expect(render({mouthArc: true, smile: 0})).toBe(rest);
    expect(arcs(rest)).toHaveLength(0);
  });
});
