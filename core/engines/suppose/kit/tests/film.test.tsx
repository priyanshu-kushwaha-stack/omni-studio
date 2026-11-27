import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {Crowd as PilotCrowd, Readout as PilotReadout, RuleCard as PilotRuleCard, Title as PilotTitle, Cam as PilotCam} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/FilmParts';
import {Grade as PilotGrade, FactPill as PilotFactPill} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/Overlays';
import {SALARY, OFFICE, STUDENT, GENT, GRAN, PACKER, WORKER} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/castV4';
import {clampF, hAtFor, Crowd, Cam, View, SetPlate, Grade, Readout, FactPill, RuleCard, Title, SCARF_H, PEER} from '../src/index';
import type {SetAngle} from '../src/index';
import station from '../../../../../channels/say-suppose/library/sets/station/set.json';

const KINDS = [SALARY, OFFICE, STUDENT, GENT, GRAN, SALARY, OFFICE, STUDENT, GRAN, GENT, SALARY, PACKER, GRAN, WORKER];
const angles = station.angles as unknown as Record<string, SetAngle>;
const html = (e: React.ReactElement) => renderToStaticMarkup(e);

describe('film parts', () => {
  it('clamps the focus so a push never shows past the plate', () => {
    expect(clampF(2, 0, 640)).toBe(320);
    expect(clampF(2, 1280, 640)).toBe(960);
    expect(clampF(1, 100, 640)).toBe(640);
  });
  it('height at depth matches the pilot wide formula', () => {
    const h = hAtFor({plate: '', scarf: {x: 640, y: 600, s: 0.2}, h: {horizon: 430, at: 600}}, 1357);
    expect(h(600)).toBeCloseTo(0.88 * 1357 * 0.2);
    expect(h(430)).toBeCloseTo(0);
  });
  it('hAtFor reproduces the pilot formulas for all three station angles', () => {
    const wide = (y: number) => PEER * SCARF_H * 0.2 * ((y - 430) / (600 - 430));
    const high = (y: number) => PEER * SCARF_H * 0.133 * ((y + 150) / (470 + 150));
    const close = () => SCARF_H * 0.28 * PEER * 0.92;
    for (const y of [-100, 205, 430, 470, 520, 596, 650]) {
      expect(hAtFor(angles.wide, SCARF_H)(y)).toBeCloseTo(wide(y), 9);
      expect(hAtFor(angles.high, SCARF_H)(y)).toBeCloseTo(high(y), 9);
    }
    expect(hAtFor(angles.close, SCARF_H)(612)).toBeCloseTo(close(), 9);
    expect(hAtFor(angles.close, SCARF_H)(0)).toBeCloseTo(close(), 9);
  });
  it('crowd markup matches the pilot for the same kinds', () => {
    const hAt = (y: number) => 0.88 * 1357 * 0.2 * ((y - 430) / 170);
    const props = {t: 3.3, n: 14, seed: 200, y0: 470, y1: 596, hAt, speed: 170, clear: [500, 780, 560, 700] as [number, number, number, number]};
    expect(html(<Crowd {...props} kinds={KINDS} />)).toBe(html(<PilotCrowd {...props} />));
    const front = {...props, seed: 300, y0: 606, y1: 650, front: true, look: 0.2};
    expect(html(<Crowd {...front} kinds={KINDS} />)).toBe(html(<PilotCrowd {...front} />));
  });
  it('camera, readout, cards and grade match the pilot', () => {
    expect(html(<Cam z={1.5} fx={500} fy={300} k={0.6}><i /></Cam>)).toBe(html(<PilotCam z={1.5} fx={500} fy={300} k={0.6}><i /></PilotCam>));
    expect(html(<Readout x={600} y={200} t={2} t0={1.5} />)).toBe(html(<PilotReadout x={600} y={200} t={2} t0={1.5} />));
    expect(html(<RuleCard t={1} t0={0.8} n="2" text="Hi" />)).toBe(html(<PilotRuleCard t={1} t0={0.8} n="2" text="Hi" />));
    const words: [string, number][] = [['Only', 1], ['100', 1.4]];
    expect(html(<Title t={1.5} words={words} />)).toBe(html(<PilotTitle t={1.5} words={words} />));
    expect(html(<Grade frame={37} />)).toBe(html(<PilotGrade frame={37} />));
  });
  it('fact pill matches the pilot window and shows its source', () => {
    for (const t of [6.2, 8, 9.8]) {
      const a = html(<FactPill t={t} t0={6.0} t1={10.1} text="x" />);
      expect(a).toContain('x');
    }
    expect(html(<FactPill t={5} t0={6} t1={10.1} text="x" />)).toBe('');
    expect(html(<FactPill t={8} t0={6} t1={10.1} text="x" source="src" />)).toContain('src');
    // pilot fades out 9.6 -> 10.1: same window as t1 = 10.1
    const mk = (e: React.ReactElement) => html(e).match(/opacity:([\d.]+)/)?.[1];
    expect(mk(<FactPill t={9.85} t0={6} t1={10.1} text="x" />)).toBe(mk(<PilotFactPill t={9.85} />));
  });
  it('grade moods tint the wash and keep warm as the default', () => {
    const warm = html(<Grade frame={1} mood="warm" />);
    expect(warm).toBe(html(<Grade frame={1} />));
    expect(html(<Grade frame={1} mood="cool" />)).toContain('rgba(120,160,255,.10)');
    expect(html(<Grade frame={1} mood="blueprint" />)).toContain('rgba(20,40,90,.25)');
    expect(html(<Grade frame={1} mood="void" />)).not.toBe(warm);
  });
  it('set plate reads angle.plate and View renders both layers', () => {
    expect(html(<SetPlate angle={angles.wide} blur={3} />)).toContain('/public/sets/station/wide.png');
    expect(html(<SetPlate angle={angles.wide} blur={3} />)).toContain('blur(3px)');
    expect(html(<View z={1.2} fx={640} fy={360} bg={<b />}><i /></View>)).toContain('<b></b>');
  });
});
