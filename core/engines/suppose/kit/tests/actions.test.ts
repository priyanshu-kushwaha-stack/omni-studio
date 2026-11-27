import {describe, expect, it} from 'vitest';
import {poseAt, MOOD_FACE} from '../src/index';

const MOODS = ['neutral','smile','happy','joy','surprised','shocked','scared','worried','nervous','angry','determined','sad','cry','smirk','sleepy','thinking','confused','awe'];

describe('actions', () => {
  it('maps all eighteen moods', () => expect(Object.keys(MOOD_FACE).sort()).toEqual([...MOODS].sort()));
  it('blinks every 2.5 to 4 s', () => {
    for (let seed = 0; seed < 40; seed++) {
      const closed = Array.from({length: 600}, (_, i) => i / 30).filter((t) => (poseAt([{act: 'idle'}], t, {}, seed).pose.lid ?? 0) > 0.9);
      const starts = closed.filter((t, i) => i === 0 || t - closed[i - 1] > 0.2);
      const gaps = starts.slice(1).map((t, i) => t - starts[i]);
      expect(gaps.length, `seed ${seed}`).toBeGreaterThan(3);
      gaps.forEach((g) => { expect(g, `seed ${seed}`).toBeGreaterThanOrEqual(2.5); expect(g, `seed ${seed}`).toBeLessThanOrEqual(4.01); });
    }
  });
  it('a react changes the face from its time on', () => {
    const acts = [{act: 'idle'}, {act: 'react', mood: 'shocked' as const, at: 1}];
    expect(poseAt(acts, 0.5).pose.browLift ?? 0).toBeLessThan(10);
    expect(poseAt(acts, 1.4).pose.browLift).toBe(30);
  });
  it('walkIn moves without foot slide', () => {
    const a = poseAt([{act: 'walkIn', at: 0, to: 2, from: [0, 0], dir: 1}], 1);
    const b = poseAt([{act: 'walkIn', at: 0, to: 2, from: [0, 0], dir: 1}], 1.1);
    expect(b.dx).toBeGreaterThan(a.dx);
    expect(b.pose.phase! - a.pose.phase!).toBeGreaterThan(0);
  });

  // Beyond the brief.
  it('walkIn phase tracks distance exactly (stride per cycle)', () => {
    const acts = [{act: 'walkIn', at: 0, to: 3, from: [0, 0] as [number, number], dir: 1 as const}];
    const a = poseAt(acts, 0.5, {}, 0, {stride: 100});
    const b = poseAt(acts, 1.5, {}, 0, {stride: 100});
    expect(b.pose.phase! - a.pose.phase!).toBeCloseTo(((b.dx - a.dx) / 100) * 2 * Math.PI, 9);
  });
  it('walkIn without from ends on its mark and stops', () => {
    const acts = [{act: 'walkIn', at: 1, to: 3, dir: -1 as const}];
    expect(poseAt(acts, 1).dx).toBeGreaterThan(50);
    expect(poseAt(acts, 3).dx).toBeCloseTo(0, 6);
    expect(poseAt(acts, 4).dx).toBeCloseTo(0, 6);
    expect(poseAt(acts, 4).pose.walk ?? 0).toBe(0);
  });
  it('the idle breath bobs 0.8% of torso height at 0.25 Hz', () => {
    const bobs = Array.from({length: 121}, (_, i) => poseAt([], i / 30, {}, 0, {torsoH: 500}).pose.bob ?? 0);
    expect(Math.max(...bobs) - Math.min(...bobs)).toBeCloseTo(4, 1);
    expect(poseAt([], 0.3, {}, 0, {torsoH: 500}).pose.bob).toBeCloseTo(poseAt([], 4.3, {}, 0, {torsoH: 500}).pose.bob!, 9);
  });
  it('a mood lid never hides the blink, and later moods replace earlier faces', () => {
    const acts = [{act: 'react', mood: 'shocked' as const, at: 0}, {act: 'react', mood: 'smirk' as const, at: 2}];
    const p = poseAt(acts, 3).pose;
    expect(p.smile).toBe(0.6);
    expect(p.mouth ?? 0).toBe(0); // shocked's open mouth does not leak into the smirk
  });
  it('acts apply in order of time, whatever the list order', () => {
    const acts = [{act: 'react', mood: 'smirk' as const, at: 2.1}, {act: 'react', mood: 'shocked' as const, at: 1}];
    const p = poseAt(acts, 2.5).pose;
    expect(p.smile).toBe(0.6);
    expect(p.mouth ?? 0).toBe(0);
  });
  it('the action library opts in to mouth arcs', () => expect(poseAt([], 0).pose.mouthArc).toBe(true));
  it('a wave raises the right arm and swings the forearm, then lets it go', () => {
    const acts = [{act: 'wave', at: 1, to: 3}];
    const up = [1.5, 1.6, 1.7].map((t) => poseAt(acts, t).pose.armR!);
    up.forEach((r) => expect(r.a).toBeCloseTo(150, 6));
    expect(new Set(up.map((r) => r.f.toFixed(2))).size).toBeGreaterThan(1);
    expect(poseAt(acts, 4).pose.armR).toBeUndefined();
  });
  it('is deterministic for a seed', () => {
    const acts = [{act: 'idle'}, {act: 'talk', at: 0}];
    expect(poseAt(acts, 7.3, {}, 9)).toEqual(poseAt(acts, 7.3, {}, 9));
  });
  it('every act name runs', async () => {
    const {ACTS} = await import('../src/actions/acts');
    for (const name of Object.keys(ACTS)) {
      const {pose} = poseAt([{act: name, at: 0, to: 2, mood: 'happy', dir: 1}], 1);
      expect(pose, name).toBeTypeOf('object');
    }
    expect(() => poseAt([{act: 'moonwalk'}], 1)).toThrow(/moonwalk/);
  });
});
