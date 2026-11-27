// The sheet's vocabulary (scripts/sheet.py) and the kit must name the same things, or a sheet that passes sheetcheck
// fails at render. sheet.py is read as text so there is one source of truth.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {ACTS, MOOD_FACE, poseAt} from '../src/index';
import {camAt} from '../src/toolkit/camera';
import {html, setShot} from './helpers';

const src = readFileSync(resolve(__dirname, '../../scripts/sheet.py'), 'utf8');
const tuple = (name: string): string[] => {
  const m = new RegExp(`^${name} = \\(([^)]*)\\)`, 'm').exec(src);
  expect(m, `${name} tuple not found in sheet.py (format changed?)`).not.toBeNull();
  const items = [...m![1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  expect(items.length, `${name} parsed empty`).toBeGreaterThan(0);
  return items;
};
const [SHEET_ACTS, MOODS, MOVES, SHOT_TYPES] = ['ACTS', 'MOODS', 'MOVES', 'SHOT_TYPES'].map(tuple);

describe('sheet.py and the kit share one vocabulary', () => {
  it('every sheet act is a kit act, and every kit act is on the sheet', () => {
    expect(SHEET_ACTS.filter((a) => !(a in ACTS))).toEqual([]);
    expect(Object.keys(ACTS).filter((a) => !SHEET_ACTS.includes(a))).toEqual([]);
  });
  it('every sheet act poses at several times without throwing, and stays finite', () => {
    for (const act of SHEET_ACTS) {
      for (const t of [0, 0.4, 1.3, 3]) {
        const {pose, dx} = poseAt([{act, at: 0.2, dir: 1, prop: 'phone'}], t, {}, 1);
        expect(Number.isFinite(dx), `${act} dx`).toBe(true);
        expect(JSON.stringify(pose), act).not.toContain('null');
      }
    }
  });
  it('every sheet mood has a face', () => {
    expect(MOODS.filter((m) => !(m in MOOD_FACE))).toEqual([]);
    expect(Object.keys(MOOD_FACE).filter((m) => !MOODS.includes(m))).toEqual([]);
  });
  it('every sheet camera move is handled by camAt', () => {
    for (const move of MOVES) expect(() => camAt({move}, 0.5, 1), move).not.toThrow();
  });
  it('every shot type renders through ShotView without throwing', () => {
    for (const type of SHOT_TYPES) {
      const extra = type === 'custom' ? {custom: 'Nope'} : {};
      expect(html({...setShot, type, text: 'x', ...extra} as never, 1).length, type).toBeGreaterThan(0);
    }
  });
});

describe('the new acts read as acts', () => {
  const pose = (act: string, t: number, extra = {}) => poseAt([{act, at: 0, ...extra}], t, {}, 0).pose as Record<string, never>;
  it('stop decelerates a walk to standing in 0.3 s', () => {
    expect(pose('stop', 0.02, {from: [100, 0]}).walk as number).toBeGreaterThan(0.9);
    expect(pose('stop', 0.5, {from: [100, 0]}).walk as number).toBe(0);
    expect(poseAt([{act: 'stop', at: 0, from: [100, 0]}], 0.5, {}, 0).dx).toBeGreaterThan(100);
  });
  it('shout opens the mouth wide with brows up', () => {
    expect(pose('shout', 1).mouth as number).toBeGreaterThan(0.85);
    expect(pose('shout', 1).browLift as number).toBeGreaterThan(15);
  });
  it('run goes faster and further than walk, leaning forward', () => {
    const dist = (act: string) => poseAt([{act, at: 0, from: [0, 0]}], 1.5, {}, 0).dx;
    expect(dist('run')).toBeGreaterThan(dist('walk') * 1.5);
    expect(pose('run', 1).lean as number).toBeGreaterThan(3);
  });
  it('reach puts the arm toward dir out to full reach', () => {
    expect((pose('reach', 1, {dir: 1}).armR as {a: number}).a).toBeGreaterThan(95);
    expect(pose('reach', 1, {dir: -1}).armL).toBeDefined();
  });
  it('armsCrossed folds both forearms across the body', () => {
    const p = pose('armsCrossed', 1);
    for (const k of ['armL', 'armR']) expect((p[k] as {f: number}).f).toBeGreaterThan(100);
  });
  it('explain alternates the two hands', () => {
    const a = pose('explain', 0.25), b = pose('explain', 0.75);
    expect((a.armR as {a: number}).a - (a.armL as {a: number}).a).toBeGreaterThan(0);
    expect((b.armR as {a: number}).a - (b.armL as {a: number}).a).toBeLessThan(0);
  });
  it('handOff extends and returns, holding the prop while out', () => {
    const out = poseAt([{act: 'handOff', at: 0, prop: 'phone'}], 0.8, {}, 0);
    expect(out.prop).toBe('phone');
    expect((out.pose.armR as {a: number}).a).toBeGreaterThan(70);
    expect((poseAt([{act: 'handOff', at: 0}], 3, {}, 0).pose.armR as {a: number} | undefined)?.a ?? 8).toBeLessThan(15);
  });
  it('lookAt is look', () => {
    expect(pose('lookAt', 1, {dir: -1})).toEqual(pose('look', 1, {dir: -1}));
  });
});
