// Sheet shots drawn the pilot's way (Task 17): Scarf at the legacy scale and centred on his mark, a band's own
// weighted kinds, and a top-down plate that does not slide under the crowd.
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {scaleFor, crowdKinds, personH, SCARF_H, View} from '../src/index';
import type {CastMember, SetAngle} from '../src/index';
import {real, html} from './helpers';

const wide = (real.sets.station.angles as Record<string, SetAngle>).wide;
const high = (real.sets.station.angles as Record<string, SetAngle>).high;
const cast = real.cast as Record<string, CastMember>;

describe('Scarf on a sheet shot', () => {
  it('stands SCARF_H * s tall on his mark, as pilot Scarf4 draws him', () => {
    const s = scaleFor(wide, cast.scarf, wide.scarf.y);
    expect(personH(cast.scarf) * s).toBeCloseTo(SCARF_H * wide.scarf.s, 6);
  });
  it('an alternate Scarf stands exactly as tall', () => {
    const alt = scaleFor(wide, cast['scarf-faded'], wide.scarf.y);
    expect(personH(cast['scarf-faded']) * alt).toBeCloseTo(SCARF_H * wide.scarf.s, 6);
  });
  it('is centred on his mark, like his shadow', () => {
    const out = html({set: 'station', angle: 'wide', cast: [{who: 'scarf', at: [640, 600], acts: [{act: 'idle'}]}]} as never, 1);
    expect(out).toMatch(/left:640px;top:600px;transform:scale\(/);
  });
});

describe('crowd kinds', () => {
  it('a band takes its own ids in order, repeats included; without them, film.crowd', () => {
    expect(crowdKinds(real, ['salary', 'scarf', 'salary', 'nobody'])).toEqual([cast.salary, cast.scarf, cast.salary]);
    expect(crowdKinds(real)).toEqual(Object.values(real.crowd));
  });
  it('a band with kinds draws only those people', () => {
    const out = html({set: 'station', angle: 'wide', crowd: [{band: 'back', n: 8, speed: 90, seed: 0, kinds: ['gent']}]} as never, 1);
    expect(out).toContain(cast.gent.head.src);
    expect(out).not.toContain(cast.salary.head.src);
  });
});

describe('plate parallax', () => {
  it('the high angle sets parallax 1, and the plate layer then moves with the people', () => {
    expect(high.parallax).toBe(1);
    const layers = (k?: number) => [...renderToStaticMarkup(<View z={1.3} fx={640} fy={420} k={k} bg={<i />}><b /></View>).matchAll(/transform:([^"]+)"/g)].map((m) => m[1]);
    const [bg, fg] = layers(1);
    expect(bg).toBe(fg);
    expect(layers()[0]).not.toBe(layers()[1]);
  });
});

describe('toolkit demo Scarf', () => {
  it('is drawn at the renderer scale for the same angle and mark', async () => {
    const {scarfScale} = await import('../src/demo/stage');
    expect(scarfScale(wide)).toBeCloseTo(scaleFor(wide, cast.scarf, wide.scarf.y), 9);
    expect(scarfScale(high)).toBeCloseTo(scaleFor(high, cast.scarf, high.scarf.y), 9);
    expect(personH(cast.scarf) * scarfScale(wide)).toBeCloseTo(SCARF_H * wide.scarf.s, 6);
  });
  it('the demo Actor is centred on its mark, like the renderer', async () => {
    const {Actor, CAST} = await import('../src/demo/stage');
    const out = renderToStaticMarkup(<Actor parts={CAST.scarf} x={640} y={600} s={0.5} t={0} acts={[{act: 'idle'}]} />);
    expect(out).toMatch(/left:640px;top:600px;transform:scale\(/);
  });
});
