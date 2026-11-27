import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ShotView} from '../src/index';
import type {FilmData, ShotData} from '../src/index';
import castJson from '../../../../../channels/say-suppose/library/cast/cast.json';
import station from '../../../../../channels/say-suppose/library/sets/station/set.json';

// A real film: the library's station set and cast, as sheetcheck.emit writes them.
export const real: FilmData = {
  film: 'r', fps: 30, size: [1280, 720], duration: 20, audio: 'audio/mix.wav', beats: [], props: {},
  cast: castJson as never, crowd: {salary: (castJson as never as Record<string, never>).salary}, sets: {station: station as never}, shots: [],
};
export const html = (shot: Partial<ShotData>, t: number, f: FilmData = real) =>
  renderToStaticMarkup(<ShotView shot={{id: 'x', from: 0, to: 6, type: 'wide', ...shot} as ShotData} film={f} t={t} />);
export const setShot = {set: 'station', angle: 'wide'};
