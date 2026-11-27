import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {ShotView, FilmFrame, shotActs, Z_FLOOR, filmMetadata, EMPTY_FILM} from '../src/index';
import type {FilmData, ShotData, Shot} from '../src/index';
import castJson from '../../../../../channels/say-suppose/library/cast/cast.json';
import station from '../../../../../channels/say-suppose/library/sets/station/set.json';

const film = {
  film: 't', fps: 30, size: [1280, 720], duration: 6, audio: 'audio/mix.wav', beats: [],
  cast: {scarf: {height: 1357, roles: ['hero'], signature: '', head: {src: 'cast/pieces/h.png', w: 10, h: 10}} as never},
  crowd: {}, props: {},
  sets: {station: {id: 'station', angles: {wide: {plate: 'sets/station/wide.png', scarf: {x: 640, y: 600, s: 0.2}, h: {horizon: 430, at: 600}, crowd: {back: [470, 596]}, clear: [500, 780, 560, 700], bounds: {zmax: 2}, key: {side: 'left', color: '#ffd9a0'}}}}},
} as never;

describe('ShotView', () => {
  it('draws the plate and a label once spoken', () => {
    const shot = {id: 's1', from: 0, to: 6, type: 'wide', set: 'station', angle: 'wide', camera: {move: 'push', z: [1, 1.2]}, cast: [], labels: [{kind: 'data', text: '≈ 3,500,000', at: 2, to: 5}]} as never;
    expect(renderToStaticMarkup(<ShotView shot={shot} film={film} t={1} />)).toContain('sets/station/wide.png');
    expect(renderToStaticMarkup(<ShotView shot={shot} film={film} t={3} />)).toContain('3,500,000');
  });
});

// A real film: the library's station set and cast, as sheetcheck.emit writes them.
const real: FilmData = {
  film: 'r', fps: 30, size: [1280, 720], duration: 20, audio: 'audio/mix.wav', beats: [], props: {},
  cast: castJson as never, crowd: {salary: (castJson as never as Record<string, never>).salary}, sets: {station: station as never}, shots: [],
};
const html = (shot: Partial<ShotData>, t: number, f: FilmData = real) =>
  renderToStaticMarkup(<ShotView shot={{id: 'x', from: 0, to: 6, type: 'wide', ...shot} as ShotData} film={f} t={t} />);
const setShot = {set: 'station', angle: 'wide'};

describe('ShotView camera (W3)', () => {
  it('lifts the zoom to the floor so drift and pan still move', () => {
    expect(Z_FLOOR).toBe(1.03);
    for (const camera of [{move: 'drift'}, {move: 'pan', focus: [520, 380], to: [760, 380]}]) {
      const a = html({...setShot, camera} as never, 1);
      const b = html({...setShot, camera} as never, 4);
      expect(a, camera.move).not.toBe(b);
    }
  });
});

describe('ShotView acting', () => {
  it('act times are film time: an act at 12 in a shot from 10 shows at 12.5, not at 11', () => {
    const acts = shotActs([{act: 'react', mood: 'shocked', at: 12, to: 14}, {act: 'idle'}], 10);
    expect(acts).toEqual([{act: 'react', mood: 'shocked', at: 2, to: 4}, {act: 'idle', at: undefined, to: undefined}]);
    const shot = {...setShot, from: 10, to: 16, cast: [{who: 'scarf', at: [640, 600], acts: [{act: 'react', mood: 'shocked', at: 12}]}]};
    const idle = {...shot, cast: [{...shot.cast[0], acts: [{act: 'idle'}]}]};
    expect(html(shot as never, 11)).toContain('cast/');
    expect(html(shot as never, 11)).toBe(html(idle as never, 11));
    expect(html(shot as never, 12.5)).not.toBe(html(idle as never, 12.5));
  });
  it('rims the cast only when the shot asks', () => {
    const cast = [{who: 'salary', at: [700, 600], acts: [{act: 'idle'}]}];
    expect(html({...setShot, cast} as never, 1)).not.toContain('drop-shadow');
    expect(html({...setShot, cast, rim: true} as never, 1)).toContain('drop-shadow');
  });
  it('draws nothing for a cast member missing from film.cast, and does not throw', () => {
    const out = html({...setShot, cast: [{who: 'nobody', at: [640, 600]}]} as never, 1);
    expect(out).toContain('sets/station/wide.png');
    expect(out).not.toContain('nobody');
  });
  it('draws a crowd band from the set with film.crowd kinds', () => {
    expect(html({...setShot, crowd: [{band: 'back', n: 6, speed: 90, seed: 0}]} as never, 1)).toContain('cast/');
  });
});

describe('ShotView overlays', () => {
  it('shows pill, readout, dimension and callout labels in their windows', () => {
    const labels = [
      {kind: 'pill', text: '≈ 3,500,000', unit: 'people / day', at: 1, to: 4},
      {kind: 'dim', text: '2 km', at: 1, to: 4},
      {kind: 'callout', text: 'the gate', at: 1, to: 4},
    ];
    const out = html({...setShot, labels, readout: {text: '99 / 100', at: 2}} as never, 3);
    for (const s of ['people / day', '2 km', 'the gate', '99 / 100']) expect(out).toContain(s);
    expect(html({...setShot, labels} as never, 0.5)).not.toContain('the gate');
  });
  it('adds the letterbox and atmosphere when asked', () => {
    const plain = html(setShot as never, 2);
    expect(html({...setShot, letterbox: 'scope'} as never, 2).length).toBeGreaterThan(plain.length);
    expect(html({...setShot, atmosphere: 'dust'} as never, 2)).toContain('<circle');
  });
  it('renders shots without a set full frame, with an empty cast', () => {
    expect(html({type: 'data', labels: [{kind: 'data', text: '100', at: 0, to: 5}]}, 2)).toContain('100');
    expect(html({type: 'blueprint'}, 2)).toContain('<line');
    expect(html({type: 'title', text: 'Only 100 people'}, 3)).toContain('people');
    expect(html({type: 'end', text: 'Would you stay?'}, 3)).toContain('Would you stay?');
  });
});

describe('FilmFrame', () => {
  const shots = [
    {id: 's1', from: 0, to: 3, type: 'wide', ...setShot, camera: {move: 'push'}},
    {id: 's2', from: 3, to: 6, type: 'custom', custom: 'S2'},
    {id: 's3', from: 6, to: 9, type: 'custom', custom: 'Gone'},
  ] as ShotData[];
  const S2: Shot = ({t, l}) => <div>custom t={t.toFixed(1)} l={l.toFixed(1)}</div>;
  const frame = (f: number) => renderToStaticMarkup(<FilmFrame {...real} shots={shots} duration={9} customs={{S2}} frame={f} />);
  it('picks the shot covering the frame and draws the grade', () => {
    expect(frame(30)).toContain('sets/station/wide.png');
    expect(frame(30)).toContain('feTurbulence');
  });
  it('renders a custom shot with film time and seconds into the shot', () => {
    expect(frame(4 * 30)).toContain('custom t=4.0 l=1.0');
  });
  it('shows a placeholder naming a custom shot that is missing', () => {
    expect(frame(7 * 30)).toContain('Gone');
  });
});

describe('registerFilm', () => {
  it('takes length, rate and size from the film props', async () => {
    const m = await filmMetadata({props: {...EMPTY_FILM, duration: 6.01, fps: 30, size: [1920, 1080]}} as never);
    expect(m).toEqual({durationInFrames: 181, fps: 30, width: 1920, height: 1080});
  });
});
