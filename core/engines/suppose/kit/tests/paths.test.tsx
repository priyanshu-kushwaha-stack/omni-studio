// Renderer paths: every camera move and shot type, a bad act, a member above the horizon, the freeze badge, holding
// across a gap between shots, and the Film's audio.
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {shotAt} from '../src/shots/Film';
import {html, setShot, real} from './helpers';

vi.mock('remotion', async (orig) => {
  const r = await orig<typeof import('remotion')>();
  return {
    ...r,
    useCurrentFrame: () => 0,
    Audio: (p: {src: string}) => React.createElement('audio', {src: p.src}),
    Img: (p: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', p),
    staticFile: (s: string) => `/public/${s}`,
  };
});

const MOVES = ['push', 'pull', 'drift', 'pan', 'roll', 'shake', 'crane', 'track', 'still'];
const SET_TYPES = ['wide', 'two', 'ots', 'face', 'insert', 'top', 'freeze'];
const cast = (acts: unknown[], at = [640, 600]) => [{who: 'scarf', at, acts}];

describe('camera moves and shot types render', () => {
  it('every move draws, and moves that move change the markup between two times', () => {
    for (const move of MOVES) {
      const camera = {move, z: [1.1, 1.4], focus: [520, 380], to: [760, 300], amount: 14, at: 1};
      const a = html({...setShot, camera, cast: cast([{act: 'idle'}])} as never, 1.1);
      const b = html({...setShot, camera, cast: cast([{act: 'idle'}])} as never, 4);
      expect(a.length, move).toBeGreaterThan(0);
      if (move !== 'shake') expect(a, move).not.toBe(b);
    }
  });
  it('every set shot type draws the plate', () => {
    for (const type of SET_TYPES) expect(html({...setShot, type, cast: cast([{act: 'idle'}])} as never, 2), type).toContain('sets/station/wide.png');
  });
  it('a freeze shows its badge after the flash', () => {
    const shot = {...setShot, type: 'freeze', from: 1, to: 5, badge: 'FREEZE-BADGE', cast: cast([{act: 'idle'}])};
    expect(html(shot as never, 2)).toContain('FREEZE-BADGE');
    expect(html(shot as never, 0.5)).not.toContain('FREEZE-BADGE');
  });
});

describe('robust members', () => {
  it('a bad act draws the member in base pose with a tag naming the act, and the frame survives', () => {
    const out = html({...setShot, cast: cast([{act: 'moonwalk'}])} as never, 1);
    expect(out).toContain('moonwalk');
    expect(out).toContain('cast/');
  });
  it('a member above the horizon is clamped, not mirrored or dropped, and is tagged', () => {
    const out = html({...setShot, cast: cast([{act: 'idle'}], [640, 300])} as never, 1);
    expect(out).toContain('cast/');
    expect(out).toContain('above the horizon');
    expect(out).not.toMatch(/scale\(-/);
  });
});

describe('Film', () => {
  const shots = [{id: 'a', from: 0, to: 2}, {id: 'b', from: 3, to: 5}] as never;
  it('holds the previous shot in a gap, not a black frame', () => {
    expect((shotAt(shots, 2.5) as {id: string}).id).toBe('a');
    expect((shotAt(shots, 3.2) as {id: string}).id).toBe('b');
    expect((shotAt(shots, 9) as {id: string}).id).toBe('b');
    expect(shotAt(shots, -1)).toBeUndefined();
  });
  it('plays the audio from staticFile(film.audio)', async () => {
    const {Film} = await import('../src/shots/Film');
    const out = renderToStaticMarkup(<Film {...real} audio="audio/mix.wav" customs={{}} />);
    expect(out).toContain('<audio src="/public/audio/mix.wav"');
  });
});
